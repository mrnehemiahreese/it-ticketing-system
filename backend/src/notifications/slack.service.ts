import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Ticket } from '../tickets/entities/ticket.entity';

@Injectable()
export class SlackService {
  private webhookUrl: string;

  constructor(private configService: ConfigService) {
    this.webhookUrl = this.configService.get<string>('SLACK_WEBHOOK_URL', '');
  }

  async sendTicketCreatedNotification(ticket: Ticket): Promise<void> {
    if (!this.webhookUrl) {
      console.log('Slack webhook URL not configured');
      return;
    }

    const message = {
      text: 'New Ticket Created',
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: 'New Ticket Created',
          },
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Ticket ID:*\n${ticket.id}`,
            },
            {
              type: 'mrkdwn',
              text: `*Priority:*\n${ticket.priority}`,
            },
            {
              type: 'mrkdwn',
              text: `*Status:*\n${ticket.status}`,
            },
            {
              type: 'mrkdwn',
              text: `*Created By:*\n${ticket.createdBy.fullname}`,
            },
          ],
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Title:*\n${ticket.title}`,
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Description:*\n${ticket.description}`,
          },
        },
      ],
    };

    try {
      await fetch(this.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message),
      });
    } catch (error) {
      console.error('Error sending Slack notification:', error);
    }
  }

  async sendTicketAssignedNotification(ticket: Ticket): Promise<void> {
    if (!this.webhookUrl || !ticket.assignedTo) {
      return;
    }

    const message = {
      text: 'Ticket Assigned',
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: 'Ticket Assigned',
          },
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Ticket ID:*\n${ticket.id}`,
            },
            {
              type: 'mrkdwn',
              text: `*Assigned To:*\n${ticket.assignedTo.fullname}`,
            },
            {
              type: 'mrkdwn',
              text: `*Priority:*\n${ticket.priority}`,
            },
            {
              type: 'mrkdwn',
              text: `*Status:*\n${ticket.status}`,
            },
          ],
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Title:*\n${ticket.title}`,
          },
        },
      ],
    };

    try {
      await fetch(this.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message),
      });
    } catch (error) {
      console.error('Error sending Slack notification:', error);
    }
  }

  async sendHighPriorityAlert(ticket: Ticket): Promise<void> {
    if (!this.webhookUrl) {
      return;
    }

    const message = {
      text: 'HIGH PRIORITY TICKET',
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '🚨 HIGH PRIORITY TICKET 🚨',
          },
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Ticket ID:*\n${ticket.id}`,
            },
            {
              type: 'mrkdwn',
              text: `*Priority:*\n${ticket.priority}`,
            },
          ],
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Title:*\n${ticket.title}`,
          },
        },
      ],
    };

    try {
      await fetch(this.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message),
      });
    } catch (error) {
      console.error('Error sending Slack notification:', error);
    }
  }
}
