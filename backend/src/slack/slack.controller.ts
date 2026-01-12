import {
  Controller,
  Post,
  Body,
  UseGuards,
  Logger,
  BadRequestException,
  Req,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { SlackService } from './slack.service';
import { createHmac } from 'crypto';

@Controller('slack')
export class SlackController {
  private readonly logger = new Logger(SlackController.name);
  private readonly signingSecret: string;

  constructor(
    private slackService: SlackService,
    private configService: ConfigService,
  ) {
    this.signingSecret = this.configService.get<string>('SLACK_SIGNING_SECRET', '');
  }

  /**
   * Verify Slack request signature
   */
  private verifySlackRequest(req: Request): boolean {
    // Skip verification if no signing secret is configured
    if (!this.signingSecret) {
      this.logger.warn('SLACK_SIGNING_SECRET not configured - skipping signature verification');
      return true;
    }

    const timestamp = req.headers['x-slack-request-timestamp'] as string;
    const signature = req.headers['x-slack-signature'] as string;

    if (!timestamp || !signature) {
      return false;
    }

    // Check if request is not too old (5 minute window)
    const now = Math.floor(Date.now() / 1000);
    if (Math.abs(now - parseInt(timestamp)) > 300) {
      return false;
    }

    // Verify signature
    const baseString = `v0:${timestamp}:${(req as any).rawBody || JSON.stringify(req.body)}`;
    const hmac = createHmac('sha256', this.signingSecret);
    hmac.update(baseString);
    const computedSignature = `v0=${hmac.digest('hex')}`;

    return computedSignature === signature;
  }

  /**
   * Handle Slack events (messages, reactions, app mentions)
   * This is called by Slack when events occur
   */
  @Post('events')
  async handleEvents(@Body() body: any, @Req() req: Request): Promise<any> {
    // Verify request came from Slack
    if (!this.verifySlackRequest(req)) {
      this.logger.warn('Invalid Slack request signature');
      throw new BadRequestException('Invalid request signature');
    }

    // Handle Slack URL verification challenge
    if (body.type === 'url_verification') {
      this.logger.log('Slack URL verification received');
      return { challenge: body.challenge };
    }

    // Handle events
    if (body.type === 'event_callback') {
      const event = body.event;

      // Ignore bot messages to prevent loops
      if (event.bot_id || event.subtype === 'bot_message') {
        return { ok: true };
      }

      if (event.type === 'app_mention') {
        await this.handleAppMention(event);
        return { ok: true };
      }

      if (event.type === 'message' && event.thread_ts) {
        await this.handleThreadReply(event);
        return { ok: true };
      }

      if (event.type === 'reaction_added') {
        await this.handleReactionAdded(event);
        return { ok: true };
      }
    }

    return { ok: true };
  }

  /**
   * Handle app mentions (e.g., @SlackBot assign to Grant Gibson)
   */
  private async handleAppMention(event: any): Promise<void> {
    try {
      const { user, text, channel, thread_ts } = event;
      this.logger.log(`App mentioned by ${user}: ${text}`);

      // Parse commands from text
      // Example: @SlackBot assign Grant Gibson
      const parts = text.toLowerCase().replace(/<[^>]*>/g, '').trim().split(/\s+/);

      // Find "assign" command
      const assignIndex = parts.indexOf('assign');
      if (assignIndex !== -1 && thread_ts) {
        // Get everything after "assign"
        const assigneeName = text
          .substring(text.toLowerCase().indexOf('assign') + 6)
          .replace(/<[^>]*>/g, '') // Remove Slack mentions
          .trim();

        if (assigneeName) {
          this.logger.log(`Processing assign command: "${assigneeName}" for thread ${thread_ts}`);
          const result = await this.slackService.handleAssignCommand(thread_ts, assigneeName);
          this.logger.log(`Assign command result: ${result}`);
        }
      }
    } catch (error) {
      this.logger.error(`Failed to handle app mention: ${error.message}`);
    }
  }

  /**
   * Handle replies in ticket threads
   * When someone replies in a thread, create a comment on the ticket
   */
  private async handleThreadReply(event: any): Promise<void> {
    try {
      const { user, text, thread_ts, ts } = event;

      // Don't process if this is the thread parent message
      if (thread_ts === ts) {
        return;
      }

      this.logger.log(`Thread reply from ${user} in thread ${thread_ts}: ${text}`);

      // Call SlackService to handle the thread message (pass full event, no client)
      await this.slackService.handleSlackThreadMessage(event, null);
    } catch (error) {
      this.logger.error(`Failed to handle thread reply: ${error.message}`);
    }
  }

  /**
   * Handle reactions (e.g., 👍 to mark as resolved)
   */
  private async handleReactionAdded(event: any): Promise<void> {
    try {
      const { user, reaction, item } = event;
      this.logger.log(`Reaction ${reaction} added by ${user}`);

      // Map reactions to actions
      // 👍 = resolve, ⏸️ = on hold, ❌ = close
      const reactionMap = {
        '+1': 'resolve',
        'pause_button': 'onhold',
        'x': 'close',
      };

      const action = reactionMap[reaction];
      if (action) {
        this.logger.log(`Action triggered: ${action}`);
        // TODO: Implement action
      }
    } catch (error) {
      this.logger.error(`Failed to handle reaction: ${error.message}`);
    }
  }

  /**
   * Handle interactive components (buttons, slash commands)
   */
  @Post('interactions')
  async handleInteractions(@Body() body: any, @Req() req: Request): Promise<any> {
    if (!this.verifySlackRequest(req)) {
      throw new BadRequestException('Invalid request signature');
    }

    try {
      const payload = JSON.parse(body.payload || body);
      this.logger.log(`Interaction type: ${payload.type}`);

      if (payload.type === 'slash_command') {
        return this.handleSlashCommand(payload);
      }

      if (payload.type === 'block_actions') {
        return this.handleBlockAction(payload);
      }

      if (payload.type === 'view_submission') {
        return this.handleViewSubmission(payload);
      }

      return { ok: true };
    } catch (error) {
      this.logger.error(`Failed to handle interaction: ${error.message}`);
      return { ok: false };
    }
  }

  /**
   * Handle slash commands
   * /assign @user TKT-000001
   * /status resolved TKT-000001
   * /priority high TKT-000001
   */
  private async handleSlashCommand(payload: any): Promise<any> {
    try {
      const { command, text, user_id, channel_id, response_url } = payload;
      this.logger.log(`Slash command: ${command} ${text} from user ${user_id}`);

      const parts = text.split(/\s+/);
      if (parts.length < 2) {
        return {
          response_type: 'ephemeral',
          text: `Usage: ${command} <action> <ticket>`,
        };
      }

      const action = parts[0];
      const ticket = parts.slice(1).join(' ');

      // TODO: Parse ticket ID and update it
      this.logger.log(`Action: ${action}, Ticket: ${ticket}`);

      return {
        response_type: 'in_channel',
        text: `Processed command: ${action} on ${ticket}`,
      };
    } catch (error) {
      this.logger.error(`Failed to handle slash command: ${error.message}`);
      return {
        response_type: 'ephemeral',
        text: 'Error processing command',
      };
    }
  }

  /**
   * Handle button clicks and other block actions
   */
  private async handleBlockAction(payload: any): Promise<any> {
    try {
      const { actions, trigger_id, user } = payload;
      this.logger.log(`Block action from user ${user.id}:`, actions);

      if (actions && actions.length > 0) {
        const action = actions[0];
        const { action_id, value } = action;

        // Map actions to handlers
        if (action_id === 'mark_in_progress') {
          // TODO: Update ticket status
          this.logger.log(`Mark ticket ${value} as in progress`);
        }

        if (action_id === 'view_ticket') {
          this.logger.log(`View ticket ${value}`);
        }
      }

      return { ok: true };
    } catch (error) {
      this.logger.error(`Failed to handle block action: ${error.message}`);
      return { ok: false };
    }
  }

  /**
   * Handle modal submissions
   */
  private async handleViewSubmission(payload: any): Promise<any> {
    try {
      const { view, user } = payload;
      this.logger.log(`View submission from user ${user.id}`);

      // TODO: Process form submission
      return { response_action: 'clear' };
    } catch (error) {
      this.logger.error(`Failed to handle view submission: ${error.message}`);
      return {
        response_action: 'errors',
        errors: { general: 'Error processing submission' },
      };
    }
  }

  /**
   * OAuth callback (optional - for Slack app distribution)
   */
  @Post('oauth/callback')
  async handleOAuthCallback(@Body() body: any): Promise<any> {
    try {
      const { code, state } = body;
      this.logger.log('OAuth callback received');

      // TODO: Exchange code for token, store installation
      return { ok: true };
    } catch (error) {
      this.logger.error(`OAuth callback failed: ${error.message}`);
      return { ok: false };
    }
  }
}
