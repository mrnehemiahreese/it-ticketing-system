# Quick Start Guide

## Complete Setup in 5 Minutes

This is a production-ready IT ticketing system with web and mobile support.

### Step 1: Initial Setup

```bash
# Navigate to project directory
cd ~/it-ticketing-system

# Copy environment file
cp .env.example .env

# Edit .env with your credentials
nano .env
```

### Step 2: Configure Environment

Edit `.env` file with these minimum requirements:

```env
# Change this password!
DB_PASSWORD=YourSecureDBPassword123!

# Generate a secure JWT secret (min 32 chars)
JWT_SECRET=your-very-long-secret-key-change-this-now-minimum-32-characters

# Gmail SMTP (or use your email provider)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-gmail-app-password

# Slack Integration
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

### Step 3: Start the Application

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

### Step 4: Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000/graphql
- **Database**: localhost:5432

**Default Login:**
- Username: `admin`
- Password: `Admin123!`

⚠️ **CHANGE THE DEFAULT PASSWORD IMMEDIATELY!**

### Step 5: Verify Services

```bash
# Check all services are running
docker-compose ps

# Should show:
# ticketing-frontend   running   0.0.0.0:3000->80/tcp
# ticketing-backend    running   0.0.0.0:4000->4000/tcp
# ticketing-postgres   running   0.0.0.0:5432->5432/tcp
# ticketing-redis      running   0.0.0.0:6379->6379/tcp
```

---

## Email Setup (Gmail)

1. Go to your Google Account: https://myaccount.google.com/
2. Enable 2-Step Verification
3. Generate App Password:
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other"
   - Copy the 16-character password
4. Add to `.env`:
```env
SMTP_USER=youremail@gmail.com
SMTP_PASSWORD=abcd efgh ijkl mnop  # (remove spaces)
```

---

## Slack Setup

### Method 1: Incoming Webhooks (Simple)

1. Go to https://api.slack.com/apps
2. Create New App → "From scratch"
3. Name it "IT Ticketing" and select your workspace
4. Click "Incoming Webhooks" → Activate
5. Click "Add New Webhook to Workspace"
6. Select the channel (e.g., #it-support)
7. Copy the webhook URL
8. Add to `.env`:
```env
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXX
```

### Method 2: Bot Token (Advanced Features)

1. In your Slack App, go to "OAuth & Permissions"
2. Add these scopes:
   - `chat:write`
   - `chat:write.public`
   - `users:read`
3. Install app to workspace
4. Copy "Bot User OAuth Token" (starts with `xoxb-`)
5. Add to `.env`:
```env
SLACK_BOT_TOKEN=xoxb-your-token-here
```

---

## Development Mode

If you want to develop/modify the code:

### Backend Development

```bash
cd backend
npm install

# Start in development mode (auto-reload)
npm run start:dev

# Run migrations
npm run migration:run

# Generate new migration
npm run migration:generate -- src/database/migrations/AddNewFeature
```

### Frontend Development

```bash
cd frontend
npm install

# Start development server with hot-reload
npm run dev

# Build for production
npm run build
```

---

## Mobile App Setup

### Prerequisites
- Node.js 18+
- Xcode (for iOS)
- Android Studio (for Android)

### Build Mobile App

```bash
cd frontend

# Install dependencies
npm install

# Build web assets
npm run build

# Add mobile platforms
npx cap add ios
npx cap add android

# Sync web code to native projects
npx cap sync

# Open in native IDEs
npx cap open ios      # Opens in Xcode
npx cap open android  # Opens in Android Studio
```

### Update Mobile App

Whenever you change the web code:

```bash
npm run build
npx cap sync
```

---

## Common Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f [service-name]

# Restart a service
docker-compose restart backend

# Rebuild after code changes
docker-compose up -d --build

# Remove all data (⚠️ destructive)
docker-compose down -v
```

---

## Troubleshooting

### Can't connect to database

```bash
# Check database is running
docker-compose ps postgres

# View database logs
docker-compose logs postgres

# Reset database (⚠️ loses all data)
docker-compose down -v
docker-compose up -d
```

### Backend won't start

```bash
# Check logs
docker-compose logs backend

# Common issues:
# 1. Wrong DATABASE_URL in .env
# 2. PostgreSQL not ready (wait 30 seconds)
# 3. Port 4000 already in use
```

### Frontend won't build

```bash
# Check Node version
node --version  # Should be 18+

# Clear and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Emails not sending

```bash
# Test SMTP connection
docker-compose exec backend node -e "
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  host: '${SMTP_HOST}',
  port: ${SMTP_PORT},
  auth: { user: '${SMTP_USER}', pass: '${SMTP_PASSWORD}' }
});
transporter.verify().then(console.log).catch(console.error);
"
```

---

## Production Deployment Checklist

- [ ] Change default admin password
- [ ] Set strong DB_PASSWORD (min 16 chars)
- [ ] Set strong JWT_SECRET (min 32 chars)
- [ ] Configure production SMTP server
- [ ] Set up SSL certificates
- [ ] Configure firewall rules
- [ ] Set up automated backups
- [ ] Configure monitoring/logging
- [ ] Test disaster recovery
- [ ] Document admin procedures

---

## Next Steps

1. **Create Users**: Add your team members in User Administration
2. **Configure Roles**: Assign appropriate roles to users
3. **Create Test Ticket**: Verify email and Slack notifications work
4. **Customize**: Update branding, email templates, etc.
5. **Train Team**: Show users how to create and manage tickets
6. **Monitor**: Watch logs for first few days

---

## Support

- Documentation: See README.md for full details
- Backend Structure: See backend/BACKEND_STRUCTURE.md
- Issues: Check docker-compose logs for errors

## Architecture

```
┌─────────────┐      ┌─────────────┐      ┌──────────────┐
│   Frontend  │─────▶│   Backend   │─────▶│  PostgreSQL  │
│  (Vue 3 +   │      │  (NestJS +  │      │   Database   │
│  Vuetify 3) │      │   GraphQL)  │      │              │
└─────────────┘      └─────────────┘      └──────────────┘
       │                    │
       │                    ├───────────▶ Redis (Cache)
       │                    │
       │                    ├───────────▶ Email (SMTP)
       │                    │
       │                    └───────────▶ Slack API
       │
       └────────────────▶ Mobile Apps (iOS/Android)
                         via Capacitor
```

**Happy Ticketing! 🎫**
