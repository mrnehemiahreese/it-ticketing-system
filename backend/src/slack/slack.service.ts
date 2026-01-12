import * as fs from 'fs';
import * as path from 'path';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { App } from '@slack/bolt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket } from '../tickets/entities/ticket.entity';
import { Comment } from '../comments/entities/comment.entity';
import { User } from '../users/entities/user.entity';
import { Attachment } from '../attachments/entities/attachment.entity';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class SlackService implements OnModuleInit {
  private readonly logger = new Logger(SlackService.name);
  private app: App;
  private readonly slackEnabled: boolean;
  private readonly defaultChannel: string;
  private defaultChannelId: string; // Store the channel ID separately for file uploads

  constructor(
    private configService: ConfigService,
    @InjectRepository(Ticket)
    private ticketsRepository: Repository<Ticket>,
    @InjectRepository(Comment)
    private commentsRepository: Repository<Comment>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Attachment)
    private attachmentsRepository: Repository<Attachment>,
  ) {
    const botToken = this.configService.get<string>('SLACK_BOT_TOKEN');
    const appToken = this.configService.get<string>('SLACK_APP_TOKEN');
    this.slackEnabled = this.configService.get<boolean>('SLACK_ENABLED', false);
    this.defaultChannel = this.configService.get<string>('SLACK_DEFAULT_CHANNEL', '#support-ticketing');
    this.defaultChannelId = this.configService.get<string>('SLACK_DEFAULT_CHANNEL_ID', ''); // NEW: Channel ID from env or will be resolved

    // Initialize Slack App with Socket Mode
    if (this.slackEnabled && botToken && appToken) {
      this.app = new App({
        token: botToken,
        appToken: appToken,
        socketMode: true,
      });

      this.logger.log(`Slack integration enabled with Socket Mode - will post to ${this.defaultChannel}`);
    } else if (this.slackEnabled && !appToken) {
      this.logger.warn('Slack enabled but SLACK_APP_TOKEN not configured. Socket Mode requires an App-Level Token.');
    } else if (this.slackEnabled && !botToken) {
      this.logger.warn('Slack enabled but SLACK_BOT_TOKEN not configured');
    }
  }

  async onModuleInit() {
    if (!this.slackEnabled || !this.app) {
      return;
    }

    // Resolve channel ID if not configured
    if (!this.defaultChannelId) {
      await this.resolveChannelId();
    }

    // Listen for message events in threads
    this.app.message(async ({ message, say, client }) => {
      try {
        // Only process messages in threads (not parent messages)
        if ('thread_ts' in message && message.thread_ts && message.thread_ts !== message.ts) {
          // Ignore bot messages to prevent loops
          if (message.subtype === 'bot_message' || 'bot_id' in message) {
            return;
          }

          const text = message.text as string;

          // Check for assign command (supports: "assign <@USER>" or "assign to <@USER>")
          // Slack converts @mentions to <@USERID> format
          if (text.match(/\bassign\s+(to\s+)?<@[A-Z0-9]+>/i)) {
            this.logger.log(`Assign command detected: ${text}`);
            const result = await this.handleAssignCommandEnhanced(
              message.thread_ts,
              text,
              client,
            );
            await say({ text: result, thread_ts: message.thread_ts });
            return;
          }

          // Regular thread reply - create comment and process attachments
          const msgAny = message as any;
          this.logger.log(
            `Received thread reply from ${message.user}` +
            (msgAny.files ? ` with ${msgAny.files.length} file(s)` : '')
          );
          await this.handleSlackThreadMessage(message, client);
        }
      } catch (error) {
        this.logger.error(`Error handling message event: ${error.message}`);
      }
    });

    // Listen for app mentions (for @bot assign commands)
    this.app.event('app_mention', async ({ event, say }) => {
      try {
        this.logger.log(`App mentioned by ${event.user}: ${event.text}`);

        // Check if this is in a thread and contains "assign"
        if (event.thread_ts && event.text.toLowerCase().includes('assign')) {
          const assigneeName = event.text
            .substring(event.text.toLowerCase().indexOf('assign') + 6)
            .replace(/<[^>]*>/g, '') // Remove Slack mentions
            .trim();

          if (assigneeName) {
            const result = await this.handleAssignCommand(event.thread_ts, assigneeName);
            await say({ text: result, thread_ts: event.thread_ts });
          }
        }
      } catch (error) {
        this.logger.error(`Error handling app_mention: ${error.message}`);
      }
    });

    // Start the Socket Mode connection
    try {
      await this.app.start();
      this.logger.log('⚡️ Slack Socket Mode app is running!');
    } catch (error) {
      this.logger.error(`❌ Failed to start Slack Socket Mode: ${error.message}`);
      this.logger.error(`Socket Mode Error Details: ${JSON.stringify(error)}`);
      this.logger.warn('⚠️  Thread replies and @bot commands will NOT work!');
      this.logger.warn('Make sure Socket Mode is enabled in your Slack app settings at https://api.slack.com/apps');
    }
  }

  /**
   * Send ticket creation notification to Slack
   * Returns the thread_ts for storing in the ticket
   */
  async notifyTicketCreated(ticket: Ticket): Promise<string | null> {
    if (!this.slackEnabled || !this.app) return null;

    try {
      const message = this.buildTicketCreatedMessage(ticket);
      const threadTs = await this.sendSlackMessage(message);

      this.logger.log(`Ticket ${ticket.ticketNumber} notified to Slack with thread ${threadTs}`);

      // Upload any image attachments to the thread
      if (ticket.attachments && ticket.attachments.length > 0 && threadTs) {
        await this.uploadAttachmentsToThread(ticket.attachments, threadTs);
      }

      return threadTs;
    } catch (error) {
      this.logger.error(`Failed to notify Slack for ticket creation: ${error.message}`);
      return null;
    }
  }

  /**
   * Upload attachments to a Slack thread
   */
  private async uploadAttachmentsToThread(attachments: any[], threadTs: string): Promise<void> {
    const imageAttachments = attachments.filter(a => a.mimetype?.startsWith('image/'));

    for (const attachment of imageAttachments) {
      try {
        const filePath = path.join(process.cwd(), attachment.filepath);

        if (!fs.existsSync(filePath)) {
          this.logger.warn(`Attachment file not found: ${filePath}`);
          continue;
        }

        // Use the resolved channel ID for file uploads
        if (!this.defaultChannelId) {
          this.logger.warn('Channel ID not resolved - skipping attachment upload');
          continue;
        }

        await this.app.client.files.uploadV2({
          channel_id: this.defaultChannelId,
          thread_ts: threadTs,
          file: fs.createReadStream(filePath),
          filename: attachment.filename,
          title: attachment.filename,
          initial_comment: `📎 Attached: ${attachment.filename}`,
        });

        this.logger.log(`Uploaded attachment ${attachment.filename} to Slack thread`);
      } catch (error) {
        this.logger.error(`Failed to upload attachment ${attachment.filename}: ${error.message}`);
      }
    }
  }


  /**
   * Upload a single attachment to Slack (called from AttachmentsService)
   */
  async uploadAttachmentToSlack(attachment: any, threadTs: string): Promise<void> {
    if (!this.slackEnabled || !this.app) return;

    if (!attachment.mimetype?.startsWith("image/")) return;

    try {
      const filePath = path.join(process.cwd(), attachment.filepath);

      if (!fs.existsSync(filePath)) {
        this.logger.warn(`Attachment file not found: ${filePath}`);
        return;
      }

      // Use the resolved channel ID for file uploads
      if (!this.defaultChannelId) {
        this.logger.warn('Channel ID not resolved - skipping attachment upload');
        return;
      }

      await this.app.client.files.uploadV2({
        channel_id: this.defaultChannelId,
        thread_ts: threadTs,
        file: fs.createReadStream(filePath),
        filename: attachment.filename,
        title: attachment.filename,
        initial_comment: `📎 Screenshot attached`,
      });

      this.logger.log(`Uploaded attachment ${attachment.filename} to Slack thread`);
    } catch (error) {
      this.logger.error(`Failed to upload attachment to Slack: ${error.message}`);
    }
  }

  /**
   * Send ticket update notification to Slack
   */
  async notifyTicketUpdated(ticket: Ticket, changes: any): Promise<void> {
    if (!this.slackEnabled || !this.app) return;

    try {
      const message = this.buildTicketUpdateMessage(ticket, changes);
      await this.sendSlackMessage(message);
      this.logger.log(`Ticket ${ticket.ticketNumber} update notified to Slack`);
    } catch (error) {
      this.logger.error(`Failed to notify Slack for ticket update: ${error.message}`);
    }
  }

  /**
   * Send comment notification to Slack thread
   */
  async notifyCommentAdded(comment: Comment): Promise<void> {
    if (!this.slackEnabled || !this.app) return;

    try {
      // Get ticket details
      const ticket = comment.ticket || (await this.ticketsRepository.findOne({ where: { id: comment.ticketId } }));

      if (!ticket.slackThreadTs) {
        this.logger.warn(`No Slack thread found for ticket ${ticket.ticketNumber}`);
        return;
      }

      const message = this.buildCommentMessage(ticket, comment);
      await this.sendSlackMessage(message, ticket.slackThreadTs);
      this.logger.log(`Comment on ticket ${ticket.ticketNumber} posted to Slack thread`);
    } catch (error) {
      this.logger.error(`Failed to notify Slack for comment: ${error.message}`);
    }
  }

  /**
   * Send assignment notification to Slack
   */
  async notifyAssignment(ticket: Ticket): Promise<void> {
    if (!this.slackEnabled || !this.app) return;

    try {
      const assignedTo = ticket.assignedTo || (await this.usersRepository.findOne({ where: { id: ticket.assignedToId } }));
      const message = this.buildAssignmentMessage(ticket, assignedTo);
      await this.sendSlackMessage(message);
      this.logger.log(`Ticket ${ticket.ticketNumber} assignment notified to Slack`);
    } catch (error) {
      this.logger.error(`Failed to notify Slack for assignment: ${error.message}`);
    }
  }

  /**
   * Notify Slack when a user marks their own ticket as resolved
   */
  async notifyUserMarkedResolved(ticket: Ticket, user: User): Promise<void> {
    if (!this.slackEnabled || !this.app) return;

    try {
      const message = {
        text: `✅ ${user.fullname} marked their ticket "${ticket.title}" as resolved`,
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `✅ *${user.fullname}* marked their ticket *<${process.env.FRONTEND_URL || "http://localhost:3001"}/tickets/${ticket.id}|${ticket.title}>* as resolved.`,
            },
          },
        ],
      };

      // Send to thread if exists, otherwise to channel
      await this.sendSlackMessage(message, ticket.slackThreadTs);
      this.logger.log(`User ${user.fullname} marked ticket ${ticket.ticketNumber} as resolved - notified Slack`);
    } catch (error) {
      this.logger.error(`Failed to notify Slack for user resolve: ${error.message}`);
    }
  }

  /**
   * Build rich message block for ticket creation
   */
  private buildTicketCreatedMessage(ticket: Ticket): any {
    return {
      text: `${ticket.title} (${ticket.ticketNumber})`,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `🎫 ${ticket.title}`,
            emoji: true,
          },
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Title:*\n${ticket.title}`,
            },
            {
              type: 'mrkdwn',
              text: `*Priority:*\n${this.getPriorityEmoji(ticket.priority)} ${ticket.priority}`,
            },
          ],
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Description:*\n${this.truncateText(ticket.description, 300)}`,
          },
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Status:*\n${this.getStatusEmoji(ticket.status)} ${ticket.status}`,
            },
            {
              type: 'mrkdwn',
              text: `*Category:*\n${ticket.category || 'Uncategorized'}`,
            },
            {
              type: 'mrkdwn',
              text: `*Created By:*\n${ticket.createdBy?.fullname || 'System'}`,
            },
            {
              type: 'mrkdwn',
              text: `*Workstation:*\n${ticket.workstationNumber || 'N/A'}`,
            },
          ],
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'View in System',
                emoji: true,
              },
              value: ticket.id,
              url: `http://192.168.1.2:3001/ticket/${ticket.id}`,
              action_id: 'view_ticket',
            },
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'Mark as In Progress',
                emoji: true,
              },
              value: ticket.id,
              action_id: 'mark_in_progress',
            },
          ],
        },
        {
          type: 'divider',
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `_Use thread replies to add comments to this ticket_`,
            },
          ],
        },
      ],
    };
  }

  /**
   * Build message for ticket updates
   */
  private buildTicketUpdateMessage(ticket: Ticket, changes: Record<string, any>): any {
    const changeText = Object.entries(changes)
      .map(([key, value]) => `• *${key}:* ${value}`)
      .join('\n');

    return {
      text: `Ticket Updated: ${ticket.ticketNumber}`,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `📝 Ticket Updated: ${ticket.ticketNumber}`,
            emoji: true,
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*${ticket.title}*\n\n*Changes:*\n${changeText}`,
          },
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'View Ticket',
                emoji: true,
              },
              url: `http://192.168.1.2:3001/ticket/${ticket.id}`,
              action_id: 'view_ticket',
            },
          ],
        },
      ],
    };
  }

  /**
   * Build message for new comments
   */
  private buildCommentMessage(ticket: Ticket, comment: Comment): any {
    return {
      text: `New Comment on ${ticket.ticketNumber}`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `💬 *New comment on ${ticket.ticketNumber}: ${ticket.title}*\n\n${comment.content}\n\n_By ${comment.user?.fullname || 'System'}_`,
          },
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'View Ticket',
                emoji: true,
              },
              url: `http://192.168.1.2:3001/ticket/${ticket.id}`,
              action_id: 'view_ticket',
            },
          ],
        },
      ],
    };
  }

  /**
   * Build message for assignments
   */
  private buildAssignmentMessage(ticket: Ticket, assignedTo: User): any {
    return {
      text: `Ticket Assigned: ${ticket.ticketNumber}`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `👤 *${ticket.ticketNumber} assigned to ${assignedTo.fullname}*\n\n${ticket.title}`,
          },
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'View Ticket',
                emoji: true,
              },
              url: `http://192.168.1.2:3001/ticket/${ticket.id}`,
              action_id: 'view_ticket',
            },
          ],
        },
      ],
    };
  }

  /**
   * Send message to Slack via Web API
   * @param message Message content
   * @param threadTs Optional thread timestamp to reply in a thread
   * @returns The thread timestamp (either the provided one or the new message ts)
   */
  private async sendSlackMessage(message: any, threadTs?: string): Promise<string | null> {
    if (!this.slackEnabled || !this.app) {
      this.logger.warn('Slack not configured - skipping notification');
      return null;
    }

    try {
      const result = await this.app.client.chat.postMessage({
        channel: this.defaultChannel,
        text: message.text,
        blocks: message.blocks,
        thread_ts: threadTs, // Reply in thread if provided
      });

      if (result.ok) {
        this.logger.log(`Message sent to Slack channel ${this.defaultChannel}`);
        // Return the thread_ts (either the provided one or the new message ts)
        return (threadTs || result.ts) as string;
      } else {
        this.logger.error(`Failed to send Slack message: ${result.error}`);
        return null;
      }
    } catch (error) {
      this.logger.error(`Error sending message to Slack: ${error.message}`);
      throw error;
    }
  }

  /**
   * Handle incoming Slack message in a ticket thread
   * Creates comment for text and downloads any image attachments
   * @param message Full Slack message event object
   * @param slackClient Slack Web API client for user lookups
   */
  async handleSlackThreadMessage(
    message: any,
    slackClient: any,
  ): Promise<void> {
    // Extract fields from message object
    const threadTs = message.thread_ts;
    const userId = message.user;
    const text = message.text || '';

    try {
      // Find ticket by thread timestamp
      const ticket = await this.ticketsRepository.findOne({
        where: { slackThreadTs: threadTs },
        relations: ['createdBy', 'assignedTo'],
      });

      if (!ticket) {
        this.logger.warn(`No ticket found for Slack thread ${threadTs}`);
        return;
      }

      let commentUser = ticket.assignedTo || ticket.createdBy;

      // Try to map Slack user ID to system user
      if (slackClient) {
        try {
          // First, try to find user by slackUserId
          const mappedUser = await this.usersRepository.findOne({
            where: { slackUserId: userId },
          });

          if (mappedUser) {
            commentUser = mappedUser;
            this.logger.log(`Found mapped user ${mappedUser.fullname} for Slack user ${userId}`);
          } else {
            // Try auto-mapping
            const mappingResult = await this.autoMapSlackUser(userId, slackClient);
            if (mappingResult.success && mappingResult.user) {
              commentUser = mappingResult.user;
              this.logger.log(`Auto-mapped Slack user ${userId} to ${commentUser.fullname} for comment`);
            } else {
              this.logger.warn(`Could not map Slack user ${userId} to system user: ${mappingResult.message}`);
              // Fall back to ticket creator/assignee
            }
          }
        } catch (error) {
          this.logger.error(`Error mapping Slack user for comment: ${error.message}`);
          // Continue with fallback user
        }
      }

      // Create comment in the ticketing system (only if there's text)
      if (text.trim()) {
        const comment = this.commentsRepository.create({
          content: text,
          ticketId: ticket.id,
          userId: commentUser.id,
          isInternal: false,
        });

        await this.commentsRepository.save(comment);
        this.logger.log(`Created comment from Slack thread for ticket ${ticket.ticketNumber} (user: ${commentUser.fullname})`);
      }

      // Process any attached image files
      if ('files' in message && Array.isArray(message.files) && message.files.length > 0) {
        // Filter for image files only
        const imageFiles = message.files.filter(
          (file: any) => file.mimetype?.startsWith('image/')
        );

        if (imageFiles.length > 0) {
          this.logger.log(
            `Processing ${imageFiles.length} image attachment(s) from Slack message`
          );
        }

        // Process each image file
        for (const fileInfo of imageFiles) {
          try {
            await this.handleSlackAttachment(fileInfo, ticket.id, commentUser.id);
          } catch (error) {
            // Log but don't fail entire message processing if one attachment fails
            this.logger.error(
              `Failed to process Slack attachment ${fileInfo.name}: ${error.message}`
            );
          }
        }
      }
    } catch (error) {
      this.logger.error(`Failed to handle Slack thread message: ${error.message}`);
    }
  }

  /**
   * Download a file from Slack using authenticated request
   * Slack file URLs require the bot token in Authorization header
   * @param fileInfo Slack file object with url_private_download
   * @returns File contents as Buffer, or null if download fails
   */
  private async downloadSlackFile(fileInfo: any): Promise<Buffer | null> {
    if (!fileInfo.url_private_download) {
      this.logger.warn(`No download URL for file ${fileInfo.id}`);
      return null;
    }

    try {
      const response = await fetch(fileInfo.url_private_download, {
        headers: {
          Authorization: `Bearer ${this.configService.get('SLACK_BOT_TOKEN')}`,
        },
      });

      if (!response.ok) {
        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After');
          this.logger.warn(
            `Rate limited by Slack for file ${fileInfo.id}. Retry after ${retryAfter}s`
          );
        } else if (response.status === 401 || response.status === 403) {
          this.logger.error(
            `Authentication failed downloading Slack file ${fileInfo.id}: ${response.status}`
          );
        } else {
          this.logger.error(
            `Failed to download Slack file ${fileInfo.id}: ${response.status} ${response.statusText}`
          );
        }
        return null;
      }

      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch (error) {
      this.logger.error(`Error downloading Slack file ${fileInfo.id}: ${error.message}`);
      return null;
    }
  }

  /**
   * Process an image attachment from a Slack message
   * Downloads the file, saves to disk, and creates Attachment entity
   * @param fileInfo Slack file object
   * @param ticketId Ticket to attach the file to
   * @param userId User who posted the file (for attribution)
   */
  private async handleSlackAttachment(
    fileInfo: any,
    ticketId: string,
    userId: string,
  ): Promise<void> {
    this.logger.log(
      `Processing Slack attachment: ${fileInfo.name} (${fileInfo.mimetype}, ${fileInfo.size} bytes)`
    );

    // Enforce file size limit (10MB)
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
    if (fileInfo.size > MAX_FILE_SIZE) {
      this.logger.warn(
        `Skipping oversized attachment ${fileInfo.name}: ${fileInfo.size} bytes (limit: ${MAX_FILE_SIZE})`
      );
      return;
    }

    // Download file from Slack
    const fileBuffer = await this.downloadSlackFile(fileInfo);
    if (!fileBuffer) {
      this.logger.warn(`Skipping attachment ${fileInfo.name} - download failed`);
      return;
    }

    try {
      // Create upload directory
      const uploadDir = path.join(process.cwd(), 'uploads', ticketId);
      await fs.promises.mkdir(uploadDir, { recursive: true });

      // Generate unique filename with sanitization
      const timestamp = Date.now();
      const sanitizedName = fileInfo.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const filename = `${timestamp}-${sanitizedName}`;
      const filepath = path.join(uploadDir, filename);

      // Save file to disk
      await fs.promises.writeFile(filepath, fileBuffer);

      // Store relative path for database (portable across deployments)
      const relativePath = path.join('uploads', ticketId, filename);

      // Create attachment entity
      const attachment = this.attachmentsRepository.create({
        filename: fileInfo.name,
        filepath: relativePath,
        mimetype: fileInfo.mimetype,
        size: fileInfo.size,
        ticketId,
        uploadedById: userId,
      });

      await this.attachmentsRepository.save(attachment);

      this.logger.log(
        `Saved Slack attachment ${fileInfo.name} to ticket (ID: ${attachment.id})`
      );
    } catch (error) {
      this.logger.error(
        `Failed to save Slack attachment ${fileInfo.name}: ${error.message}`
      );
      throw error; // Propagate to caller for error handling
    }
  }

  /**
   * Enhanced /assign command handler with Slack user ID mapping
   * Supports: /assign @SlackUser
   */
  async handleAssignCommandEnhanced(
    threadTs: string,
    messageText: string,
    slackClient: any,
  ): Promise<string> {
    try {
      // Find ticket by thread timestamp
      const ticket = await this.ticketsRepository.findOne({
        where: { slackThreadTs: threadTs },
      });

      if (!ticket) {
        return `⚠️ Could not find ticket for this thread`;
      }

      // Extract Slack user ID from mention (e.g., <@U12345>)
      const slackUserIdMatch = messageText.match(/<@([A-Z0-9]+)>/);
      
      if (!slackUserIdMatch) {
        return `⚠️ Please mention a user: assign @username`;
      }

      const slackUserId = slackUserIdMatch[1];

      // Look up user by Slack user ID
      let systemUser = await this.usersRepository.findOne({
        where: { slackUserId },
      });

      // If not found, try to auto-map
      if (!systemUser) {
        const mappingResult = await this.autoMapSlackUser(slackUserId, slackClient);
        
        if (mappingResult.success) {
          systemUser = mappingResult.user;
        } else {
          return mappingResult.message;
        }
      }

      // Check if user is an agent
      const isAgent = this.isUserAgent(systemUser);
      
      if (!isAgent) {
        return `⚠️ ${systemUser.fullname} is not an agent and cannot be assigned tickets`;
      }

      // Assign ticket
      ticket.assignedToId = systemUser.id;
      await this.ticketsRepository.save(ticket);

      this.logger.log(
        `Assigned ticket ${ticket.ticketNumber} to ${systemUser.fullname} (Slack: ${systemUser.slackDisplayName}) via Slack`,
      );
      
      return `✅ Ticket ${ticket.ticketNumber} assigned to ${systemUser.fullname}`;
    } catch (error) {
      this.logger.error(`Failed to handle assign command: ${error.message}`);
      return `❌ Failed to assign ticket: ${error.message}`;
    }
  }

  /**
   * Auto-map Slack user to system user if possible
   */
  async autoMapSlackUser(
    slackUserId: string,
    slackClient: any,
  ): Promise<{ success: boolean; user?: User; message: string }> {
    try {
      // Get Slack user info
      const slackUserInfo = await slackClient.users.info({
        user: slackUserId,
      });

      if (!slackUserInfo.ok) {
        return {
          success: false,
          message: `⚠️ Could not fetch Slack user information`,
        };
      }

      const slackUser = slackUserInfo.user;
      const displayName = slackUser.profile.display_name || slackUser.profile.real_name;

      // Try to find matching system user by name
      const systemUser = await this.findUserByName(displayName);

      if (!systemUser) {
        return {
          success: false,
          message: `⚠️ User not mapped. Please ask an admin to map Slack user @${displayName} to a system user.`,
        };
      }

      // Check if this user already has a different Slack ID mapped
      if (systemUser.slackUserId && systemUser.slackUserId !== slackUserId) {
        return {
          success: false,
          message: `⚠️ ${systemUser.fullname} is already mapped to a different Slack user`,
        };
      }

      // Auto-map the user
      systemUser.slackUserId = slackUserId;
      systemUser.slackDisplayName = displayName;
      await this.usersRepository.save(systemUser);

      this.logger.log(
        `Auto-mapped Slack user ${slackUserId} (@${displayName}) to system user ${systemUser.fullname}`,
      );

      return {
        success: true,
        user: systemUser,
        message: `✅ Auto-mapped @${displayName} to ${systemUser.fullname}`,
      };
    } catch (error) {
      this.logger.error(`Error auto-mapping Slack user: ${error.message}`);
      return {
        success: false,
        message: `❌ Error mapping user: ${error.message}`,
      };
    }
  }

  /**
   * Helper to find user by name (for auto-mapping)
   */
  async findUserByName(searchName: string): Promise<User | null> {
    // Try exact fullname match
    let user = await this.usersRepository
      .createQueryBuilder('user')
      .where('LOWER(user.fullname) = LOWER(:name)', { name: searchName })
      .getOne();

    if (user) return user;

    // Try username match
    user = await this.usersRepository
      .createQueryBuilder('user')
      .where('LOWER(user.username) = LOWER(:name)', { name: searchName })
      .getOne();

    return user;
  }

  /**
   * Check if user is an agent (has AGENT/ADMIN role or TM Consulting Support)
   */
  private isUserAgent(user: User): boolean {
    // Check for AGENT or ADMIN role
    if (user.roles.includes(Role.AGENT) || user.roles.includes(Role.ADMIN)) {
      return true;
    }

    // Check for TM Consulting Support role
    const roleString = user.roles.join(',').toLowerCase();
    return roleString.includes('tm consulting support');
  }

  /**
   * Handle /assign command from Slack (legacy - kept for backward compatibility)
   * Example: @bot assign Grant Gibson
   */
  async handleAssignCommand(
    threadTs: string,
    assigneeName: string,
  ): Promise<string> {
    try {
      // Find ticket by thread timestamp
      const ticket = await this.ticketsRepository.findOne({
        where: { slackThreadTs: threadTs },
      });

      if (!ticket) {
        return `⚠️ Could not find ticket for this thread`;
      }

      // Find user by name (case insensitive)
      const user = await this.usersRepository
        .createQueryBuilder('user')
        .where('LOWER(user.fullname) LIKE LOWER(:name)', {
          name: `%${assigneeName}%`,
        })
        .getOne();

      if (!user) {
        return `⚠️ Could not find user: ${assigneeName}`;
      }

      // Check if user has agent role
      if (!user.roles.includes(Role.AGENT) && !user.roles.includes(Role.ADMIN)) {
        return `⚠️ ${user.fullname} is not an agent`;
      }

      // Assign ticket
      ticket.assignedToId = user.id;
      await this.ticketsRepository.save(ticket);

      this.logger.log(`Assigned ticket ${ticket.ticketNumber} to ${user.fullname} via Slack`);
      return `✅ Ticket ${ticket.ticketNumber} assigned to ${user.fullname}`;
    } catch (error) {
      this.logger.error(`Failed to handle assign command: ${error.message}`);
      return `❌ Failed to assign ticket: ${error.message}`;
    }
  }

  /**
   * Resolve Slack channel name to channel ID
   * This is needed because files.uploadV2 requires a channel ID, not a channel name
   */
  private async resolveChannelId(): Promise<void> {
    if (!this.slackEnabled || !this.app) {
      return;
    }

    try {
      const channelName = this.defaultChannel.startsWith('#')
        ? this.defaultChannel.substring(1)
        : this.defaultChannel;

      // List conversations to find the channel ID
      const result = await this.app.client.conversations.list({
        exclude_archived: true,
        limit: 100,
      });

      if (!result.ok) {
        this.logger.error(`Failed to list Slack conversations: ${result.error}`);
        return;
      }

      const channel = result.channels.find(
        c => c.name === channelName || c.name === this.defaultChannel
      );

      if (channel && channel.id) {
        this.defaultChannelId = channel.id;
        this.logger.log(`Resolved Slack channel "${channelName}" to ID: ${this.defaultChannelId}`);
      } else {
        this.logger.warn(
          `Could not find Slack channel "${channelName}" in workspace. ` +
          `File uploads will fail. Make sure the channel exists and the bot is a member.`
        );
      }
    } catch (error) {
      this.logger.error(`Error resolving Slack channel ID: ${error.message}`);
    }
  }

  /**
   * Utility functions
   */
  private getPriorityEmoji(priority: string): string {
    const emojis = {
      URGENT: '🔴',
      HIGH: '🟠',
      MEDIUM: '🟡',
      LOW: '🟢',
    };
    return emojis[priority] || '⚪';
  }

  private getStatusEmoji(status: string): string {
    const emojis = {
      OPEN: '🔵',
      IN_PROGRESS: '🟡',
      ON_HOLD: '⏸️',
      RESOLVED: '✅',
      CLOSED: '⛔',
    };
    return emojis[status] || '⚪';
  }

  private truncateText(text: string, length: number): string {
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
  }
}
