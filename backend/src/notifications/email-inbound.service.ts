import { Injectable, Logger, Inject } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Cron, CronExpression } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as imaps from "imap-simple";
import { simpleParser } from "mailparser";
import { PubSub } from "graphql-subscriptions";
import { Ticket } from "../tickets/entities/ticket.entity";
import { User } from "../users/entities/user.entity";
import { TicketStatus } from "../common/enums/ticket-status.enum";
import { TicketPriority } from "../common/enums/ticket-priority.enum";
import { TicketCategory } from "../common/enums/ticket-category.enum";
import { TicketSource } from "../common/enums/ticket-source.enum";
import { Role } from "../common/enums/role.enum";
import { Comment } from "../comments/entities/comment.entity";
import { SlackService } from "../slack/slack.service";
import { EmailService } from "./email.service";
import { PUB_SUB } from "../pubsub/pubsub.module";
import { AttachmentsService } from "../attachments/attachments.service";

@Injectable()
export class EmailInboundService {
  private readonly logger = new Logger(EmailInboundService.name);
  private isProcessing = false;

  constructor(
    private configService: ConfigService,
    @InjectRepository(Ticket)
    private ticketsRepository: Repository<Ticket>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Comment)
    private commentsRepository: Repository<Comment>,
    private slackService: SlackService,
    @Inject(PUB_SUB) private pubSub: PubSub,
    private emailService: EmailService,
    private attachmentsService: AttachmentsService,
  ) {}

  async onModuleInit() {
    if (this.configService.get<string>("IMAP_HOST")) {
      this.logger.log("Email inbound service initialized");
    }
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async pollInbox() {
    if (this.isProcessing) {
      this.logger.debug("Email processing already in progress, skipping...");
      return;
    }

    const imapHost = this.configService.get<string>("IMAP_HOST");
    if (!imapHost) {
      return;
    }

    try {
      this.isProcessing = true;
      await this.processNewEmails();
    } catch (error) {
      this.logger.error("Error polling inbox:", error);
    } finally {
      this.isProcessing = false;
    }
  }

  private async connectToImap(): Promise<any> {
    const config = {
      imap: {
        user: this.configService.get<string>("IMAP_USER"),
        password: this.configService.get<string>("IMAP_PASS"),
        host: this.configService.get<string>("IMAP_HOST"),
        port: this.configService.get<number>("IMAP_PORT", 993),
        tls: true,
        tlsOptions: {
          rejectUnauthorized: false,
        },
        authTimeout: 10000,
      },
    };

    return await imaps.connect(config);
  }

  private async processNewEmails() {
    let connection: any;

    try {
      connection = await this.connectToImap();
      await connection.openBox("INBOX");

      const searchCriteria = ["UNSEEN"];
      const fetchOptions = {
        bodies: ["HEADER", "TEXT", ""],
        markSeen: false,
      };

      const messages = await connection.search(searchCriteria, fetchOptions);

      if (messages.length === 0) {
        this.logger.debug("No new emails to process");
        return;
      }

      this.logger.log(`Processing ${messages.length} new email(s)`);

      for (const message of messages) {
        try {
          await this.processEmail(message, connection);
        } catch (error) {
          this.logger.error(`Error processing email ${message.attributes.uid}:`, error);
        }
      }
    } catch (error) {
      this.logger.error("Error connecting to IMAP server:", error);
    } finally {
      if (connection) {
        connection.end();
      }
    }
  }

  private async processEmail(message: any, connection: any) {
    const all = message.parts.find((part: any) => part.which === "");
    const id = message.attributes.uid;
    const idHeader = `Imap-Id: ${id}\r\n`;

    const mail = await simpleParser(idHeader + all.body);

    const subject = mail.subject || "No Subject";
    const from = mail.from?.value?.[0]?.address || "";
    const textContent = mail.text || "";
    const htmlContent = mail.html || "";
    const attachments = mail.attachments || [];

    this.logger.log(`Processing email from ${from}: ${subject} (${attachments.length} attachment(s))`);

    const ticketMatch = subject.match(/\[Ticket #(\d+)\]/i);

    if (ticketMatch) {
      await this.handleTicketReply(ticketMatch[1], from, textContent, htmlContent, attachments);
    } else {
      await this.handleNewTicket(from, subject, textContent, htmlContent, attachments);
    }

    await connection.addFlags(id, ["\\Seen"]);
  }

  private async handleNewTicket(
    fromEmail: string,
    subject: string,
    textContent: string,
    htmlContent: string,
    attachments: any[] = [],
  ) {
    try {
      let user = await this.usersRepository.findOne({
        where: { email: fromEmail },
      });

      if (!user) {
        user = await this.createCustomerUser(fromEmail);
      }

      const count = await this.ticketsRepository.count();
      const ticketNumber = `TKT-${String(count + 1).padStart(6, "0")}`;

      const description = this.cleanEmailContent(textContent || htmlContent);

      const ticket = this.ticketsRepository.create({
        ticketNumber,
        title: subject.substring(0, 255),
        description,
        status: TicketStatus.OPEN,
        priority: TicketPriority.MEDIUM,
        category: TicketCategory.OTHER,
        createdById: user.id,
        source: TicketSource.EMAIL,
        contactEmail: fromEmail,
      });

      const savedTicket = await this.ticketsRepository.save(ticket);
      this.logger.log(`Created ticket ${ticketNumber} from email by ${fromEmail}`);

      // Save email attachments
      if (attachments.length > 0) {
        this.logger.log(`Saving ${attachments.length} attachment(s) for ticket ${ticketNumber}`);
        for (const att of attachments) {
          try {
            await this.attachmentsService.handleFileUpload(
              {
                originalname: att.filename || 'attachment',
                mimetype: att.contentType || 'application/octet-stream',
                size: att.size || att.content.length,
                buffer: att.content,
              },
              savedTicket.id,
              user.id,
            );
            this.logger.log(`Saved attachment: ${att.filename}`);
          } catch (err) {
            this.logger.error(`Failed to save attachment ${att.filename}: ${err.message}`);
          }
        }
      }

      const fullTicket = await this.ticketsRepository.findOne({
        where: { id: savedTicket.id },
        relations: ["createdBy", "assignedTo", "attachments"],
      });

      if (fullTicket) {
        const threadTs = await this.slackService.notifyTicketCreated(fullTicket).catch(err => {
          this.logger.error("Failed to notify Slack of ticket creation:", err.message);
          return null;
        });

        if (threadTs) {
          fullTicket.slackThreadTs = threadTs;
          await this.ticketsRepository.save(fullTicket);
          this.logger.log(`Stored Slack thread ${threadTs} for ticket ${ticketNumber}`);
        }

        // Publish real-time event so dashboards update without refresh
        await this.pubSub.publish('newTicket', { newTicket: fullTicket });
        this.logger.log(`Published newTicket event for ${ticketNumber}`);

        // Send confirmation email to the customer (delayed to avoid IMAP/SMTP contention)
        const emailService = this.emailService;
        const logger = this.logger;
        setTimeout(async () => {
          try {
            await emailService.sendTicketCreatedNotification(fullTicket, user);
            logger.log(`Sent ticket created confirmation email for ${ticketNumber}`);
          } catch (err) {
            logger.error(`Failed to send ticket created email for ${ticketNumber}: ${err.message}`);
          }
        }, 5000);
      }

      return savedTicket;
    } catch (error) {
      this.logger.error(`Error creating ticket from email:`, error);
      throw error;
    }
  }

  private async handleTicketReply(
    ticketNumber: string,
    fromEmail: string,
    textContent: string,
    htmlContent: string,
    attachments: any[] = [],
  ) {
    try {
      const ticket = await this.ticketsRepository.findOne({
        where: { ticketNumber: `TKT-${ticketNumber.padStart(6, "0")}` },
        relations: ["createdBy", "assignedTo"],
      });

      if (!ticket) {
        this.logger.warn(`Ticket ${ticketNumber} not found for reply from ${fromEmail}`);
        return;
      }

      const user = await this.usersRepository.findOne({
        where: { email: fromEmail },
      });

      if (!user) {
        this.logger.warn(`User with email ${fromEmail} not found`);
        return;
      }

      const content = this.cleanEmailContent(textContent || htmlContent);

      const comment = this.commentsRepository.create({
        ticketId: ticket.id,
        userId: user.id,
        content,
        isInternal: false,
      });

      const savedComment = await this.commentsRepository.save(comment);
      this.logger.log(`Added comment to ticket ${ticket.ticketNumber} from ${fromEmail}`);

      // Save email attachments for reply
      if (attachments.length > 0) {
        this.logger.log(`Saving ${attachments.length} attachment(s) for ticket reply ${ticket.ticketNumber}`);
        for (const att of attachments) {
          try {
            await this.attachmentsService.handleFileUpload(
              {
                originalname: att.filename || 'attachment',
                mimetype: att.contentType || 'application/octet-stream',
                size: att.size || att.content.length,
                buffer: att.content,
              },
              ticket.id,
              user.id,
            );
            this.logger.log(`Saved attachment: ${att.filename}`);
          } catch (err) {
            this.logger.error(`Failed to save attachment ${att.filename}: ${err.message}`);
          }
        }
      }

      if (ticket.slackThreadTs) {
        const fullComment = await this.commentsRepository.findOne({
          where: { id: savedComment.id },
          relations: ["user", "ticket"],
        });
        if (fullComment) {
          await this.slackService.notifyCommentAdded(fullComment).catch(err => {
            this.logger.error("Failed to notify Slack of comment:", err.message);
          });
        }
      }

      return savedComment;
    } catch (error) {
      this.logger.error(`Error adding comment from email:`, error);
      throw error;
    }
  }

  private async createCustomerUser(email: string): Promise<User> {
    const emailUsername = email.split("@")[0];
    const fullname = emailUsername
      .split(".")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");

    let username = emailUsername.toLowerCase();
    let counter = 1;
    while (await this.usersRepository.findOne({ where: { username } })) {
      username = `${emailUsername.toLowerCase()}${counter}`;
      counter++;
    }

    const user = this.usersRepository.create({
      username,
      email,
      fullname,
      password: Math.random().toString(36).slice(-12),
      roles: [Role.USER],
      isDisabled: false,
    });

    const savedUser = await this.usersRepository.save(user);
    this.logger.log(`Created new user: ${username} (${email})`);

    return savedUser;
  }

  private cleanEmailContent(content: string): string {
    let cleaned = content;

    cleaned = cleaned.split(/\n--\s*\n/)[0];
    cleaned = cleaned.split(/\n---\s*\n/)[0];

    cleaned = cleaned
      .split("\n")
      .filter((line) => !line.trim().startsWith(">"))
      .join("\n");

    cleaned = cleaned.replace(/On .* wrote:\s*$/gim, "");
    cleaned = cleaned.trim();

    if (cleaned.length > 5000) {
      cleaned = cleaned.substring(0, 5000) + "\n\n[Content truncated...]";
    }

    return cleaned || "No content provided";
  }
}
