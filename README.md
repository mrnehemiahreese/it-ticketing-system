# TM Support Portal

A modern, full-featured IT ticketing and support system built with NestJS, GraphQL, Vue 3, and Vuetify 3.

## Features

### Core Ticketing
- Create, view, update, and resolve tickets
- Multi-priority support (Low, Medium, High, Urgent, Critical)
- Ticket categories and custom fields
- File attachments and screenshots
- Internal and public comments
- Ticket watchers and notifications
- Ticket templates for common requests

### Advanced Features
- **SLA Management**: Define and track service level agreements with auto-escalation
- **Auto-Assignment**: Round-robin and skills-based ticket routing
- **Service Catalog**: Self-service portal for common requests
- **Asset Management (CMDB)**: Track IT assets and link to tickets
- **Knowledge Base**: Self-service articles and solutions
- **Workflow Automation**: Custom triggers and automation rules
- **Reporting & Analytics**: Comprehensive dashboards and metrics
- **Multi-Channel Notifications**: Email and Slack integration

### User Management
- Role-based access control (Admin, Agent, User)
- User profiles with contact information
- Team and department management
- Workstation tracking

### Mobile Support
- Native iOS and Android apps (via Capacitor)
- Responsive web interface
- Push notifications

## Technology Stack

**Frontend:**
- Vue 3 (Composition API)
- Vuetify 3 (Material Design)
- Apollo Client (GraphQL)
- Vite (Build tool)
- Capacitor (Mobile apps)

**Backend:**
- NestJS (Node.js framework)
- GraphQL (API layer)
- TypeORM (Database ORM)
- PostgreSQL (Primary database)
- Redis (Caching and sessions)
- Bull (Job queue for async tasks)

**Infrastructure:**
- Docker & Docker Compose
- Nginx (Reverse proxy)
- JWT Authentication

## Quick Start

### Prerequisites
- Docker Desktop installed and running
- Node.js 18+ (for local development only)
- 4GB RAM minimum
- 10GB disk space

### Installation

1. **Clone and setup**
```bash
git clone <repository-url>
cd it-ticketing-system
cp .env.example .env
```

2. **Edit .env file**
```bash
# Change these critical values:
DB_PASSWORD=YourSecurePassword123!
JWT_SECRET=your-long-secure-secret-minimum-32-characters
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-gmail-app-password
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

3. **Start the application**
```bash
docker-compose up -d
```

4. **Access the application**
- Frontend: http://localhost:3000
- Backend GraphQL Playground: http://localhost:4000/graphql
- Default login: `admin` / `Admin123!`

⚠️ **IMPORTANT**: Change the default admin password immediately!

### Verify Installation
```bash
# Check all services are running
docker-compose ps

# View logs
docker-compose logs -f

# Access database directly
docker-compose exec postgres psql -U ticketing_admin -d ticketing_system
```

## Development

See [DEVELOPMENT.md](./DEVELOPMENT.md) for detailed development instructions.

### Backend Development
```bash
cd backend
npm install
npm run start:dev  # Starts with hot-reload
```

### Frontend Development
```bash
cd frontend
npm install
npm run dev  # Starts Vite dev server
```

## Mobile App

### Build iOS App
```bash
cd frontend
npm run build
npx cap sync ios
npx cap open ios  # Opens Xcode
```

### Build Android App
```bash
cd frontend
npm run build
npx cap sync android
npx cap open android  # Opens Android Studio
```

## Email Setup (Gmail)

1. Enable 2-Step Verification in your Google Account
2. Generate App Password:
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other"
   - Copy the 16-character password
3. Add to `.env`:
```env
SMTP_USER=youremail@gmail.com
SMTP_PASSWORD=abcd efgh ijkl mnop  # Remove spaces
```

## Slack Setup

### Incoming Webhooks (Simple)
1. Go to https://api.slack.com/apps
2. Create New App → "From scratch"
3. Name it "TM Support" and select workspace
4. Click "Incoming Webhooks" → Activate
5. Add New Webhook to Workspace
6. Select channel (e.g., #it-support)
7. Copy webhook URL to `.env`

### Bot Token (Advanced)
1. In your Slack App, go to "OAuth & Permissions"
2. Add scopes: `chat:write`, `chat:write.public`, `users:read`
3. Install app to workspace
4. Copy "Bot User OAuth Token" to `.env`

## Production Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment guide.

**Production Checklist:**
- [ ] Change default admin password
- [ ] Set strong DB_PASSWORD (min 16 chars)
- [ ] Set strong JWT_SECRET (min 32 chars)
- [ ] Configure production SMTP
- [ ] Set up SSL certificates
- [ ] Configure firewall
- [ ] Set up automated backups
- [ ] Configure monitoring
- [ ] Test disaster recovery

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

## Documentation

- [Quick Start Guide](./QUICK_START.md)
- [Backend Structure](./backend/BACKEND_STRUCTURE.md)
- [Frontend Structure](./frontend/FRONTEND_STRUCTURE.md)
- [API Documentation](./API.md)
- [Database Schema](./DATABASE.md)

## Support

For issues, questions, or feature requests, please create an issue in the repository.

## License

Proprietary - Internal Use Only
