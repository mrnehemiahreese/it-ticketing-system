import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Ticket } from '../tickets/entities/ticket.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    const smtpPort = this.configService.get<number>('SMTP_PORT', 587);
    
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST', 'smtp.gmail.com'),
      port: smtpPort,
      secure: smtpPort === 465, // true for 465, false for other ports
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
    });
  }

  /**
   * Gets the recipient email address, considering dev mode
   */
  private getRecipientEmail(originalEmail: string): string {
    const devRecipient = this.configService.get<string>('EMAIL_DEV_RECIPIENT');
    if (devRecipient) {
      return devRecipient;
    }
    return originalEmail;
  }

  /**
   * Formats the subject line with ticket ID for reply tracking
   */
  private formatSubject(ticketNumber: string, subject: string): string {
    return `[Ticket #${ticketNumber}] ${subject}`;
  }

  /**
   * Gets the FROM address with optional name
   */
  private getFromAddress(): string {
    const fromName = this.configService.get<string>('EMAIL_FROM_NAME', 'TM Support');
    const fromEmail = this.configService.get<string>('SMTP_FROM', 'noreply@ticketing.com');
    return `"${fromName}" <${fromEmail}>`;
  }

  async sendTicketCreatedNotification(ticket: Ticket, recipient: User): Promise<void> {
    try {
      const ticketNumberOnly = ticket.ticketNumber.replace('TKT-', '');
      
      await this.transporter.sendMail({
        from: this.getFromAddress(),
        to: this.getRecipientEmail(recipient.email),
        subject: this.formatSubject(ticketNumberOnly, `Your ticket has been received`),
        html: `
          <h2>Ticket Created</h2>
          <p>Hello ${recipient.fullname},</p>
          <p>Your support ticket has been received and assigned number <strong>${ticket.ticketNumber}</strong>.</p>
          
          <h3>Ticket Details:</h3>
          <ul>
            <li><strong>Ticket ID:</strong> ${ticket.ticketNumber}</li>
            <li><strong>Title:</strong> ${ticket.title}</li>
            <li><strong>Priority:</strong> ${ticket.priority}</li>
            <li><strong>Status:</strong> ${ticket.status}</li>
          </ul>
          
          <p><strong>Description:</strong></p>
          <p>${ticket.description}</p>
          
          <hr>
          <p>You can reply to this email to add comments to your ticket.</p>
          <p>Our support team will respond to your ticket as soon as possible.</p>
          
          <p style="color: #666; font-size: 12px;">
            Please keep the [Ticket #${ticketNumberOnly}] reference in the subject line when replying.
          </p>
        `,
      });
    } catch (error) {
      console.error('Error sending ticket created email:', error);
    }
  }

  async sendTicketAssignedNotification(ticket: Ticket, assignee: User): Promise<void> {
    try {
      const ticketNumberOnly = ticket.ticketNumber.replace('TKT-', '');
      
      await this.transporter.sendMail({
        from: this.getFromAddress(),
        to: this.getRecipientEmail(assignee.email),
        subject: this.formatSubject(ticketNumberOnly, `Ticket assigned to you`),
        html: `
          <h2>Ticket Assigned to You</h2>
          <p>Hello ${assignee.fullname},</p>
          <p>A support ticket has been assigned to you.</p>
          
          <h3>Ticket Details:</h3>
          <ul>
            <li><strong>Ticket ID:</strong> ${ticket.ticketNumber}</li>
            <li><strong>Title:</strong> ${ticket.title}</li>
            <li><strong>Priority:</strong> ${ticket.priority}</li>
            <li><strong>Status:</strong> ${ticket.status}</li>
            <li><strong>Created by:</strong> ${ticket.createdBy.fullname}</li>
          </ul>
          
          <p><strong>Description:</strong></p>
          <p>${ticket.description}</p>
          
          <hr>
          <p>Please log in to the system to view and work on this ticket.</p>
          <p>You can also reply to this email to add comments to the ticket.</p>
          
          <p style="color: #666; font-size: 12px;">
            Please keep the [Ticket #${ticketNumberOnly}] reference in the subject line when replying.
          </p>
        `,
      });
    } catch (error) {
      console.error('Error sending ticket assigned email:', error);
    }
  }

  async sendTicketStatusUpdateNotification(ticket: Ticket, recipient: User): Promise<void> {
    try {
      const ticketNumberOnly = ticket.ticketNumber.replace('TKT-', '');
      
      await this.transporter.sendMail({
        from: this.getFromAddress(),
        to: this.getRecipientEmail(recipient.email),
        subject: this.formatSubject(ticketNumberOnly, `Status updated`),
        html: `
          <h2>Ticket Status Updated</h2>
          <p>Hello ${recipient.fullname},</p>
          <p>The status of your ticket has been updated.</p>
          
          <h3>Ticket Details:</h3>
          <ul>
            <li><strong>Ticket ID:</strong> ${ticket.ticketNumber}</li>
            <li><strong>Title:</strong> ${ticket.title}</li>
            <li><strong>New Status:</strong> <strong>${ticket.status}</strong></li>
            <li><strong>Priority:</strong> ${ticket.priority}</li>
          </ul>
          
          <hr>
          <p>Please log in to the system to view the updated ticket details.</p>
          <p>You can also reply to this email to add comments to the ticket.</p>
          
          <p style="color: #666; font-size: 12px;">
            Please keep the [Ticket #${ticketNumberOnly}] reference in the subject line when replying.
          </p>
        `,
      });
    } catch (error) {
      console.error('Error sending ticket status update email:', error);
    }
  }

  async sendCommentNotification(ticket: Ticket, recipient: User, comment: string, commenterName?: string): Promise<void> {
    try {
      const ticketNumberOnly = ticket.ticketNumber.replace('TKT-', '');
      const commentBy = commenterName || 'A team member';
      
      await this.transporter.sendMail({
        from: this.getFromAddress(),
        to: this.getRecipientEmail(recipient.email),
        subject: this.formatSubject(ticketNumberOnly, `New comment added`),
        html: `
          <h2>New Comment on Your Ticket</h2>
          <p>Hello ${recipient.fullname},</p>
          <p>${commentBy} has added a comment to your ticket.</p>
          
          <h3>Ticket Details:</h3>
          <ul>
            <li><strong>Ticket ID:</strong> ${ticket.ticketNumber}</li>
            <li><strong>Title:</strong> ${ticket.title}</li>
          </ul>
          
          <h3>Comment:</h3>
          <div style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #2196F3; margin: 15px 0;">
            ${comment}
          </div>
          
          <hr>
          <p>Please log in to the system to view the full conversation.</p>
          <p>You can also reply to this email to add your own comment to the ticket.</p>
          
          <p style="color: #666; font-size: 12px;">
            Please keep the [Ticket #${ticketNumberOnly}] reference in the subject line when replying.
          </p>
        `,
      });
    } catch (error) {
      console.error('Error sending comment notification email:', error);
    }
  }
}
