# Email Integration - Quick Reference

## Email Credentials
- **Address**: support@tmconsulting.us
- **Password**: <YOUR-EMAIL-PASSWORD>
- **IMAP**: tmconsulting.us:993
- **SMTP**: tmconsulting.us:465

## Common Commands

### View Email Logs
```bash
ssh mrnehemiahreese@reese-hauz
docker logs ticketing-backend | grep -i email
```

### Watch Logs Live
```bash
docker logs -f ticketing-backend | grep EmailInbound
```

### Restart Backend
```bash
docker restart ticketing-backend
```

### Check Configuration
```bash
docker exec ticketing-backend env | grep EMAIL
```

## How to Test

### Test 1: Create New Ticket via Email
1. Send email to: support@tmconsulting.us
2. Subject: "Test ticket creation"
3. Body: "This is a test"
4. Wait 1-2 minutes
5. Check system for new ticket

### Test 2: Reply to Ticket
1. Get ticket number (e.g., TKT-000001)
2. Send email to: support@tmconsulting.us
3. Subject: "[Ticket #000001] My response"
4. Body: "This is a comment"
5. Wait 1-2 minutes
6. Check ticket for new comment

### Test 3: Verify Dev Mode
1. Create ticket in system
2. Check nehemiahreese@gmail.com for notification
3. If received, dev mode is working

## Toggle Dev Mode

### Enable Dev Mode (Test)
In `.env`:
```bash
EMAIL_DEV_RECIPIENT=nehemiahreese@gmail.com
```

### Disable Dev Mode (Production)
In `.env`:
```bash
# EMAIL_DEV_RECIPIENT=nehemiahreese@gmail.com
```

Then restart:
```bash
docker restart ticketing-backend
```

## Email Subject Format

### Outgoing Emails
- `[Ticket #123] Your ticket has been received`
- `[Ticket #123] Ticket assigned to you`
- `[Ticket #123] Status updated`
- `[Ticket #123] New comment added`

### Incoming Emails
- No `[Ticket #123]` → Creates new ticket
- Has `[Ticket #123]` → Adds comment to ticket

## Troubleshooting

### No Emails Being Processed
```bash
# Check if polling is running
docker logs ticketing-backend | tail -20

# Should see:
# "Processing X new email(s)" OR
# "No new emails to process"
```

### Emails Not Sending
```bash
# Check SMTP config
docker exec ticketing-backend env | grep SMTP

# Check for errors
docker logs ticketing-backend | grep "Error sending"
```

### Wrong Email Address Receiving
```bash
# Check dev mode setting
docker exec ticketing-backend env | grep EMAIL_DEV

# If set, that's where ALL emails go
```

## File Locations

- **Config**: `~/it-ticketing-system/.env`
- **Docs**: `~/it-ticketing-system/EMAIL_INTEGRATION.md`
- **Code**: `~/it-ticketing-system/backend/src/notifications/`
- **Logs**: `docker logs ticketing-backend`

## Quick Checks

| Check | Command | Expected Result |
|-------|---------|-----------------|
| Service Running | `docker ps \| grep backend` | Should see ticketing-backend |
| Email Module Loaded | `docker logs ticketing-backend \| grep "Email"` | "Email inbound service initialized" |
| IMAP Config | `docker exec ticketing-backend env \| grep IMAP_HOST` | tmconsulting.us |
| Dev Mode Status | `docker exec ticketing-backend env \| grep EMAIL_DEV` | Set = dev mode, blank = production |
| Recent Activity | `docker logs ticketing-backend --tail 20` | Should see polling messages |

## Important Notes

⚠️ **Dev Mode Active**: All emails currently go to nehemiahreese@gmail.com
📧 **Polling Interval**: System checks inbox every 60 seconds
👤 **Auto User Creation**: New email senders automatically get accounts
🔒 **TLS Enabled**: Both IMAP and SMTP use encrypted connections

## Emergency Disable

If email integration causes issues:

```bash
ssh mrnehemiahreese@reese-hauz
cd ~/it-ticketing-system

# Edit .env and set IMAP_HOST to blank
echo "IMAP_HOST=" >> .env

# Restart
docker restart ticketing-backend
```

This disables incoming email processing. Outgoing still works.
