# Email Integration for TM Support Portal

## Overview

The TM Support Portal now supports bidirectional email integration, allowing:
- **Incoming Emails**: Automatically create tickets from new emails and add comments from replies
- **Outgoing Emails**: Notify users about ticket updates with trackable subject lines
- **Development Mode**: Test email functionality without sending to real customers

## Features

### 1. Incoming Email Processing (IMAP)

The system polls the email inbox every minute for new emails:

- **New Tickets**: Emails without a ticket reference create new tickets
- **Ticket Replies**: Emails with `[Ticket #123]` in the subject add comments to existing tickets
- **User Creation**: Unknown email addresses automatically get user accounts created
- **Email Cleanup**: Removes signatures, quoted text, and limits content length

### 2. Outgoing Email Notifications (SMTP)

All outgoing emails include the ticket number in the subject line for reply tracking:

- Ticket Created: `[Ticket #000001] Your ticket has been received`
- Ticket Assigned: `[Ticket #000001] Ticket assigned to you`
- Status Updated: `[Ticket #000001] Status updated`
- New Comment: `[Ticket #000001] New comment added`

### 3. Development Mode

Enable development mode to redirect ALL outgoing emails to a single test address:

```bash
# In .env file
EMAIL_DEV_RECIPIENT=your-test-email@example.com
```

When set, customers never receive emails - everything goes to your test inbox.

## Configuration

### Environment Variables

Add these to your `.env` file:

```bash
# IMAP Settings (for receiving emails)
IMAP_HOST=your-mail-server.com
IMAP_PORT=993
IMAP_USER=support@yourdomain.com
IMAP_PASS=your-password-here

# SMTP Settings (for sending emails)
SMTP_HOST=your-mail-server.com
SMTP_PORT=465
SMTP_USER=support@yourdomain.com
SMTP_PASS=your-password-here
SMTP_FROM=support@yourdomain.com
EMAIL_FROM_NAME=Your Company Support

# Development Mode (optional)
EMAIL_DEV_RECIPIENT=test@example.com
```

### Current Configuration

The system is currently configured with:
- Email: `support@tmconsulting.us`
- IMAP Server: `tmconsulting.us:993`
- SMTP Server: `tmconsulting.us:465`
- Dev Mode: Enabled (all emails go to `nehemiahreese@gmail.com`)

## Architecture

### Files Created/Modified

1. **`backend/src/notifications/email-inbound.service.ts`**
   - IMAP connection and polling logic
   - Email parsing and ticket/comment creation
   - User auto-creation for unknown senders
   - Scheduled task (runs every minute)

2. **`backend/src/notifications/email.service.ts`** (Updated)
   - Added ticket ID in subject lines
   - Development mode support
   - Improved email templates with reply instructions

3. **`backend/src/notifications/email.module.ts`** (New)
   - Organizes email-related services
   - Imports TypeORM entities and ScheduleModule

4. **`backend/src/notifications/notifications.module.ts`** (Updated)
   - Now imports EmailModule instead of individual services

5. **`backend/package.json`** (Updated)
   - Added `imap-simple` for IMAP connectivity
   - Added `mailparser` for parsing email content
   - Added `@types/mailparser` for TypeScript support

6. **`docker-compose.yml`** (Updated)
   - Added IMAP environment variables
   - Updated SMTP environment variables
   - Added EMAIL_DEV_RECIPIENT support

7. **`.env`** (Updated)
   - Added complete email configuration
   - Documented development mode

## How It Works

### Incoming Email Flow

1. **Email Received**: Customer sends email to `support@tmconsulting.us`
2. **IMAP Polling**: Service checks inbox every minute
3. **Email Analysis**:
   - Subject contains `[Ticket #123]`? → Add comment to existing ticket
   - No ticket reference? → Create new ticket
4. **User Lookup**: Find user by email address
5. **User Creation**: If not found, create new user account with USER role
6. **Processing**: Create ticket/comment with cleaned email content
7. **Mark Read**: Email marked as seen in inbox

### Outgoing Email Flow

1. **Event Triggered**: Ticket created, assigned, status changed, or comment added
2. **Dev Mode Check**: If `EMAIL_DEV_RECIPIENT` is set, redirect to that address
3. **Format Subject**: Add `[Ticket #123]` to subject line
4. **Send Email**: Via SMTP with HTML template
5. **Reply Tracking**: Recipient can reply to add comments

### User Auto-Creation

When an unknown email address sends a ticket request:

```typescript
Email: john.doe@company.com
↓
Username: johndoe (or johndoe1, johndoe2 if taken)
Fullname: John Doe (derived from email)
Role: USER
Password: Random 12-character string
```

Users can reset their password via the web interface.

## Testing

### Test Incoming Email

1. Send an email to `support@tmconsulting.us`
2. Subject: `Testing ticket creation`
3. Body: `This is a test ticket from email`
4. Wait 1-2 minutes for polling
5. Check system for new ticket

### Test Email Reply

1. Find a ticket number (e.g., TKT-000001)
2. Reply to any ticket email or create new email
3. Subject: `[Ticket #000001] Adding a comment`
4. Body: `This is my response to the ticket`
5. Wait 1-2 minutes for polling
6. Check ticket for new comment

### Test Development Mode

1. Ensure `EMAIL_DEV_RECIPIENT=nehemiahreese@gmail.com` in `.env`
2. Create a ticket in the system (assigned to any user)
3. Check `nehemiahreese@gmail.com` for notification (NOT the actual user)
4. This confirms emails are being redirected properly

## Monitoring

### Check Email Service Logs

```bash
ssh mrnehemiahreese@reese-hauz
cd ~/it-ticketing-system
docker logs ticketing-backend | grep -i email
```

### Look for:
- `Email inbound service initialized` - Service started successfully
- `Processing X new email(s)` - Emails found in inbox
- `Created ticket TKT-XXXXXX from email` - Ticket created
- `Added comment to ticket TKT-XXXXXX` - Reply processed
- `Error connecting to IMAP server` - Connection issues

### Manual Testing Commands

```bash
# Check backend logs in real-time
docker logs -f ticketing-backend

# Restart backend to reload configuration
docker restart ticketing-backend

# Check environment variables
docker exec ticketing-backend env | grep -E '(IMAP|SMTP|EMAIL)'
```

## Troubleshooting

### Emails Not Being Received

1. **Check IMAP Configuration**:
   ```bash
   docker exec ticketing-backend env | grep IMAP
   ```
   Verify host, port, user, and password are correct

2. **Check IMAP Connection**:
   Look for errors like "ECONNREFUSED" or "Authentication failed" in logs

3. **Check Polling**:
   Log should show "Processing X new email(s)" or "No new emails to process"

4. **Verify Email Server**:
   Ensure emails are arriving at the inbox and not being filtered

### Emails Not Being Sent

1. **Check SMTP Configuration**:
   ```bash
   docker exec ticketing-backend env | grep SMTP
   ```

2. **Check for Send Errors**:
   ```bash
   docker logs ticketing-backend | grep "Error sending"
   ```

3. **Test SMTP Credentials**:
   Try sending a test email manually with the credentials

4. **Check Dev Mode**:
   If `EMAIL_DEV_RECIPIENT` is set, emails go there instead of real recipients

### Users Not Being Created

1. **Check Role Enum**: Ensure `Role.USER` exists (not `Role.CUSTOMER`)
2. **Check Database**: Verify users table has correct schema
3. **Check Logs**: Look for "Created new user" messages

## Security Considerations

### Current Implementation

- **TLS Encryption**: IMAP/SMTP use TLS (ports 993/465)
- **Certificate Validation**: Currently disabled (`rejectUnauthorized: false`) for self-signed certs
- **Password Storage**: Auto-created users get random passwords
- **Email Content**: Sanitized and length-limited to prevent abuse
- **Rate Limiting**: Polling limited to once per minute

### Production Recommendations

1. **Enable Certificate Validation**: Update IMAP config when using trusted certificates
2. **Implement Email Verification**: Require new users to verify email before ticket access
3. **Add Spam Protection**: Implement sender whitelisting or CAPTCHA for new senders
4. **Monitor Volume**: Alert on unusual email volumes
5. **Regular Audits**: Review auto-created user accounts periodically

## Future Enhancements

Potential improvements for the email integration:

1. **Attachment Support**: Process email attachments and attach to tickets
2. **Rich HTML Parsing**: Better handling of HTML emails with images/formatting
3. **Priority Detection**: Parse keywords like "urgent" to set ticket priority
4. **Category Detection**: Use subject line keywords to set ticket category
5. **Email Templates**: Customizable email templates for different notification types
6. **Bounce Handling**: Process bounced emails and mark invalid addresses
7. **Threading**: Better email thread detection beyond subject line matching
8. **Multi-Inbox**: Support multiple email addresses (e.g., billing@, tech@)
9. **Auto-Assignment**: Assign tickets based on email content or sender
10. **Email Analytics**: Track response times and email metrics

## Support

For issues or questions about email integration:
1. Check logs first: `docker logs ticketing-backend | grep -i email`
2. Verify configuration in `.env` file
3. Test IMAP/SMTP connectivity manually
4. Review this documentation for configuration examples

## Version History

- **v1.0 (2026-01-13)**: Initial email integration implementation
  - IMAP polling for incoming emails
  - Ticket creation from new emails
  - Comment creation from replies
  - User auto-creation
  - Development mode support
  - Ticket ID in email subjects
