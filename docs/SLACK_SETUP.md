# Slack Integration Setup

This guide explains how to set up Slack integration for bidirectional ticket sync.

## Features

- **Ticket notifications** - New tickets post to your support channel
- **Bidirectional sync** - Slack thread replies become ticket comments  
- **`assign @user`** - Assign tickets from Slack threads
- **Status updates** - Ticket changes post to thread

## Prerequisites

- Slack workspace admin access
- `.env` configured with Slack credentials

## Step 1: Create a Slack App

1. Go to https://api.slack.com/apps
2. Click **Create New App** → **From scratch**
3. Name it (e.g., "TM Support") and select your workspace

## Step 2: Configure OAuth Scopes

Go to **OAuth & Permissions** and add these **Bot Token Scopes**:

| Scope | Purpose |
|-------|---------|
| `chat:write` | Post messages |
| `chat:write.public` | Post to public channels |
| `users:read` | Map Slack users to system users |
| `channels:history` | Read channel messages |
| `groups:history` | Read private channel messages |
| `app_mentions:read` | Respond to @mentions |

## Step 3: Enable Socket Mode

1. Go to **Socket Mode** in sidebar
2. Toggle **Enable Socket Mode** to ON
3. Create an app-level token with `connections:write` scope
4. Copy the token (starts with `xapp-`)

## Step 4: Enable Event Subscriptions

1. Go to **Event Subscriptions**
2. Toggle **Enable Events** to ON
3. Add these **Bot Events**:
   - `message.channels`
   - `message.groups`
   - `app_mention`
4. Click **Save Changes**

## Step 5: Install to Workspace

1. Go to **OAuth & Permissions**
2. Click **Install to Workspace**
3. Copy the **Bot User OAuth Token** (starts with `xoxb-`)

## Step 6: Configure Environment

Add to your `.env`:

```bash
SLACK_ENABLED=true
SLACK_BOT_TOKEN=xoxb-your-bot-token
SLACK_APP_TOKEN=xapp-your-app-token
SLACK_SIGNING_SECRET=your-signing-secret
SLACK_DEFAULT_CHANNEL=#support-ticketing
```

## Step 7: Restart Backend

```bash
docker compose restart backend
```

Watch logs for:
```
[SlackService] Slack Socket Mode app is running!
```

## Using the Assign Command

In any Slack ticket thread, type:

```
assign @Username
```

The user will be mapped automatically on first use.

## Troubleshooting

### "Socket Mode is not turned on"
- Verify Socket Mode is enabled in app settings
- Ensure `SLACK_APP_TOKEN` is set (xapp- token)

### "missing_scope" error
- Add the missing OAuth scope
- **Reinstall** the app to update the token

### Messages not appearing
- Check `SLACK_DEFAULT_CHANNEL` matches your channel
- Invite the bot to the channel: `/invite @YourAppName`
