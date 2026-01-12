import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Ticket } from '../tickets/entities/ticket.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST', 'smtp.gmail.com'),
      port: this.configService.get<number>('SMTP_PORT', 587),
      secure: false,
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
    });
  }

  async sendTicketCreatedNotification(ticket: Ticket, recipient: User): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.configService.get<string>('SMTP_FROM', 'noreply@ticketing.com'),
        to: recipient.email,
        subject: `New Ticket Created: ${ticket.title}`,
        html: `
          <h2>New Ticket Created</h2>
          <p><strong>Ticket ID:</strong> ${ticket.id}</p>
          <p><strong>Title:</strong> ${ticket.title}</p>
          <p><strong>Description:</strong> ${ticket.description}</p>
          <p><strong>Priority:</strong> ${ticket.priority}</p>
          <p><strong>Status:</strong> ${ticket.status}</p>
          <p><strong>Created by:</strong> ${ticket.createdBy.fullname}</p>
          <br>
          <p>Please log in to the system to view and manage this ticket.</p>
        `,
      });
    } catch (error) {
      console.error('Error sending email:', error);
    }
  }

  async sendTicketAssignedNotification(ticket: Ticket, assignee: User): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.configService.get<string>('SMTP_FROM', 'noreply@ticketing.com'),
        to: assignee.email,
        subject: `Ticket Assigned: ${ticket.title}`,
        html: `
          <h2>Ticket Assigned to You</h2>
          <p><strong>Ticket ID:</strong> ${ticket.id}</p>
          <p><strong>Title:</strong> ${ticket.title}</p>
          <p><strong>Description:</strong> ${ticket.description}</p>
          <p><strong>Priority:</strong> ${ticket.priority}</p>
          <p><strong>Status:</strong> ${ticket.status}</p>
          <p><strong>Created by:</strong> ${ticket.createdBy.fullname}</p>
          <br>
          <p>Please log in to the system to view and work on this ticket.</p>
        `,
      });
    } catch (error) {
      console.error('Error sending email:', error);
    }
  }

  async sendTicketStatusUpdateNotification(ticket: Ticket, recipient: User): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.configService.get<string>('SMTP_FROM', 'noreply@ticketing.com'),
        to: recipient.email,
        subject: `Ticket Status Updated: ${ticket.title}`,
        html: `
          <h2>Ticket Status Updated</h2>
          <p><strong>Ticket ID:</strong> ${ticket.id}</p>
          <p><strong>Title:</strong> ${ticket.title}</p>
          <p><strong>New Status:</strong> ${ticket.status}</p>
          <p><strong>Priority:</strong> ${ticket.priority}</p>
          <br>
          <p>Please log in to the system to view the updated ticket.</p>
        `,
      });
    } catch (error) {
      console.error('Error sending email:', error);
    }
  }

  async sendCommentNotification(ticket: Ticket, recipient: User, comment: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.configService.get<string>('SMTP_FROM', 'noreply@ticketing.com'),
        to: recipient.email,
        subject: `New Comment on Ticket: ${ticket.title}`,
        html: `
          <h2>New Comment Added</h2>
          <p><strong>Ticket ID:</strong> ${ticket.id}</p>
          <p><strong>Title:</strong> ${ticket.title}</p>
          <p><strong>Comment:</strong> ${comment}</p>
          <br>
          <p>Please log in to the system to view the full conversation.</p>
        `,
      });
    } catch (error) {
      console.error('Error sending email:', error);
    }
  }
}
