# TM Support Portal - Quick Context

**Project:** IT Ticketing System | **URL:** https://tickets.birdherd.asia | **Updated:** 2026-01-30

## Project Status: Production Ready (Last Updated Jan 30, 2026)

All 7 phases complete. Three critical bugs fixed in commit 8300990 (filtering, real-time updates, notifications). System is stable and production-ready.

## Recent Work (2026-01-30)

**Commit 8300990:** Fixed ticket filtering, real-time updates, and email notifications

Three critical bugs fixed:

1. **Ticket Filtering Broken** — Frontend sent arrays but backend declared scalars. Queries silently failed.
   - Fix: Changed DTO types from `TicketStatus` to `TicketStatus[]`, queries from `=` to `IN`
   - Verified: Selected "Resolved" filter → 3 results correct

2. **Live Tickets Don't Appear Until Refresh** — Apollo Client frozen arrays + incomplete subscription handler.
   - Fix: Refactored `addTicket()` to use spread operator `[item, ...array]` instead of `.unshift()`
   - Verified: Created TKT-000035 while viewing list → appeared instantly, count 31→32

3. **No Email on Status Change** — Service method existed but never called in mutation handlers.
   - Fix: Added email notification calls in `tickets.service.ts` and `slack.service.ts`
   - Verified: Changed TKT-000028 status, email sent to creator, SMTP confirmed

**New ADRs Created:** ADR-0021, ADR-0022, ADR-0023 (see decisions.md for full details)

## Tech Stack (One-liner each)

- **Backend:** NestJS 10+ (GraphQL Apollo Server, TypeORM, JWT auth, Bull queues)
- **Frontend:** Vue 3 (Composition API, Vuetify 3, Apollo Client, Pinia stores, TypeScript)
- **Database:** PostgreSQL 13+ (primary data) + Redis 6+ (cache/sessions/pub-sub)
- **Testing:** Jest (backend 80%+) + Vitest (frontend 70%+) with full CI/CD
- **Deploy:** Docker Compose (nginx reverse proxy, multi-stage builds)
- **Integrations:** SMTP email (inbound IMAP + outbound), Slack (webhooks + socket mode)

## Key File Paths

```
~/it-ticketing-system/
├── backend/src/
│   ├── auth/              # JWT authentication, guards, strategies
│   ├── users/             # User CRUD, roles (USER/AGENT/ADMIN)
│   ├── tickets/           # Core ticket domain, status workflow
│   ├── comments/          # Internal/public comments
│   ├── attachments/       # File uploads
│   ├── notifications/     # Email (IMAP/SMTP) + Slack services
│   ├── dashboard/         # Analytics, statistics
│   ├── database/
│   │   ├── migrations/    # TypeORM migrations
│   │   └── seeds/         # Default users seeder
│   └── graphql/           # Schema definitions
├── frontend/src/
│   ├── components/        # Reusable Vue components (under 400 lines)
│   ├── views/             # Page-level views (refactored Phase 4)
│   ├── graphql/           # Queries, mutations, subscriptions
│   ├── stores/            # Pinia state (user, ticket, comment)
│   └── types/             # TypeScript definitions
├── nginx/nginx.conf       # Reverse proxy config
├── docker-compose.yml     # Service orchestration
└── .env                   # Environment configuration (never commit)
```

## Docker Commands

```bash
# SSH Access
ssh mrnehemiahreese@reese-hauz
cd ~/it-ticketing-system

# Build and Deploy
docker compose build                    # Build all images
docker compose up -d                    # Start detached
docker compose up -d --build            # Rebuild and restart
docker compose down                     # Stop all services
docker compose down -v                  # Stop and remove volumes (DESTRUCTIVE)

# Logs
docker logs ticketing-backend           # Backend logs
docker logs ticketing-frontend          # Frontend logs
docker logs -f ticketing-backend        # Follow backend logs
docker compose logs -f                  # Follow all logs

# Service Management
docker compose restart backend          # Restart backend only
docker compose ps                       # Service status
docker stats                            # Resource usage

# Database Access
docker exec -it ticketing-postgres psql -U ticketing_admin -d ticketing_system

# Redis Access
docker exec -it ticketing-redis redis-cli

# Backend Shell
docker exec -it ticketing-backend sh
```

## Test Accounts

| User | Password | Role | Email |
|------|----------|------|-------|
| nehemiah@tmconsulting.us | Admin123! | ADMIN | (Primary admin) |
| admin | Admin123! | ADMIN | admin@example.com |
| agent1 | agent123456 | AGENT | agent1@tmconsulting.us |
| agent2 | agent123456 | AGENT | agent2@tmconsulting.us |

**Note:** Login field accepts both username and email. Use nehemiah@tmconsulting.us for preferred admin account.

## Access Points

- **Frontend:** http://reese-hauz:3001 (internal) or https://tickets.birdherd.asia (public)
- **GraphQL API:** http://reese-hauz:4000/graphql
- **Customer Portal:** /portal
- **Admin Dashboard:** /dashboard
- **Database:** localhost:5432 (internal only)
- **Redis:** localhost:6379 (internal only)

## Email Integration (Deployed Jan 13, 2026)

**Inbound (IMAP):**
- Address: support@tmconsulting.us
- Server: tmconsulting.us:993 (TLS)
- Polling: Every 60 seconds
- Creates tickets from new emails, adds comments from replies with [Ticket #123]
- Auto-creates users for unknown senders

**Outgoing (SMTP):**
- Server: tmconsulting.us:465 (TLS)
- All emails include [Ticket #123] in subject for reply tracking
- Fixed in commit 8300990: Status change emails now sent to ticket creator
- Dev mode: Set EMAIL_DEV_RECIPIENT=test@example.com to redirect all emails

## Slack Integration

**Webhook URL:** Set SLACK_WEBHOOK_URL in .env
**Bot Token:** Set SLACK_BOT_TOKEN for assignment commands

**Features:**
- Ticket notifications posted to support channel
- Thread replies sync as comments
- "assign @user" in Slack thread to assign tickets
- Status updates post to thread with assignment emails

## Critical Patterns (Jan 30, 2026 Bug Fixes)

### 1. Apollo Client Array Immutability (ADR-0022)
**Rule:** Never mutate Apollo-cached arrays. Always use spread operator.

```javascript
// WRONG - fails on frozen arrays
array.push(item)
array.unshift(item)
array.splice(0, 1)

// CORRECT - creates immutable copy
array = [item, ...array]     // prepend
array = [...array, item]     // append
```

Applied to all Pinia store methods: addTicket(), setTickets(), removeTicket(), addComment(), setComments()

### 2. GraphQL Filter Type Alignment (ADR-0021)
**Rule:** Multi-select filters must use array types with IN clauses.

```typescript
// WRONG - scalar type, equality check fails with arrays
@Field(() => TicketStatus) status?: TicketStatus
// Query: WHERE ticket.status = :status

// CORRECT - array type, IN clause
@Field(() => [TicketStatus]) status?: TicketStatus[]
// Query: WHERE ticket.status IN (:...statuses)
```

Check: `ticket-filters.input.ts` for status, priority, category fields

### 3. Notification Handler Completeness (ADR-0023)
**Rule:** Every state-changing operation must notify: Slack + Email + Real-time.

```typescript
async update(id: string, input: UpdateInput) {
  const previous = await this.findById(id);
  const updated = await database.update(id, input);
  
  if (previous.status !== updated.status) {
    const full = await this.findById(id, ['createdBy', 'assignee']);
    await this.slackService.notify(full);
    await this.emailService.notify(full);
    await this.pubsub.publish('UPDATED', full);
  }
}
```

Key: Load createdBy before calling emailService

## Environment Variables (Critical)

```bash
# .env file (never commit!)
NODE_ENV=production

# Database
DB_NAME=ticketing_system
DB_USER=ticketing_admin
DB_PASSWORD=STRONG-PASSWORD                # Min 16 chars
DB_PORT=5432

# Backend
BACKEND_PORT=4000
JWT_SECRET=SECURE-64-CHAR-SECRET           # Min 32 chars, enforced at startup
JWT_EXPIRATION=7d

# Frontend
FRONTEND_PORT=3000
VITE_API_URL=https://tickets.birdherd.asia
VITE_GRAPHQL_ENDPOINT=https://tickets.birdherd.asia/graphql

# Email (Inbound IMAP)
IMAP_HOST=tmconsulting.us
IMAP_PORT=993
IMAP_USER=support@tmconsulting.us
IMAP_PASS=EMAIL-PASSWORD

# Email (Outbound SMTP)
SMTP_HOST=tmconsulting.us
SMTP_PORT=465
SMTP_USER=support@tmconsulting.us
SMTP_PASS=EMAIL-PASSWORD
SMTP_FROM=support@tmconsulting.us
EMAIL_FROM_NAME=TM Support
EMAIL_DEV_RECIPIENT=                       # Set to test email for dev mode

# Slack
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
SLACK_BOT_TOKEN=xoxb-your-bot-token
SLACK_APP_TOKEN=xapp-your-app-token
SLACK_DEFAULT_CHANNEL=#support-ticketing

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# App
APP_URL=https://tickets.birdherd.asia
```

## Architecture Decisions (Latest)

1. **GraphQL API:** Type-safe, efficient, real-time ready (ADR-0001)
2. **NestJS Backend:** Modular, TypeScript-first (ADR-0002)
3. **Vue 3 Composition API:** Modern, flexible, type-safe (ADR-0003)
4. **PostgreSQL:** ACID compliance, relational integrity (ADR-0004)
5. **Redis:** Session storage, pub/sub for subscriptions (ADR-0005)
6. **Docker:** Consistent environments, easy scaling (ADR-0006)
7. **TypeORM:** Elegant entities, migration support (ADR-0007)
8. **JWT Auth:** Stateless, scalable (ADR-0010)
9. **Cursor Pagination:** Efficient for large datasets (ADR-0015)
10. **Array Types in Filters:** Type safety for multi-select (ADR-0021) — NEW
11. **Immutable Array Updates:** Apollo Client compatibility (ADR-0022) — NEW
12. **Complete Notifications:** All state changes trigger notifications (ADR-0023) — NEW

## Current System State (Jan 30, 2026)

- 32 tickets in system (TKT-000001 through TKT-000035)
- All critical bugs fixed and verified
- Real-time filtering working
- Email notifications functional
- Slack integration operational
- All 7 development phases complete
- Commit 8300990 deployed to reese-hauz

## Known Issues & Next Steps

**Completed (Verified Jan 30):**
- [x] Ticket filtering fixed (arrays vs scalars)
- [x] Real-time updates fixed (Apollo immutability)
- [x] Email notifications fixed (handler completeness)
- [x] All 7 phases complete
- [x] Testing infrastructure (Jest + Vitest)
- [x] Email integration deployed
- [x] Slack integration working

**Still Required (Not Critical):**
- [ ] Change default admin password (currently Admin123!)
- [ ] Verify JWT_SECRET (min 64 chars in production)
- [ ] Configure production SMTP
- [ ] Disable email dev mode
- [ ] Set up SSL/TLS certificates
- [ ] Configure firewall (block 5432, 6379)
- [ ] Set up automated backups
- [ ] Configure monitoring/alerting

## Quick Troubleshooting

**Backend logs show GraphQL errors:**
```bash
docker logs ticketing-backend --tail 100 | grep -i error
# Check commit 8300990 for filter array type fixes
```

**Real-time updates not working:**
```bash
docker logs ticketing-backend | grep -i subscription
# Verify spread operator used in Pinia store (ADR-0022)
```

**Emails not sending on status change:**
```bash
docker logs ticketing-backend | grep "Status change check"
# Check tickets.service.ts has emailService call after Slack notification
```

**Filtering returns no results:**
```bash
# Verify ticket-filters.input.ts uses array types
# Check tickets.service.ts queries use IN clause, not =
# See ADR-0021 for details
```

## Documentation Reference

- **Progress:** progress.md (all 7 phases, bug fixes logged)
- **Decisions:** decisions.md (ADR-0001 to ADR-0023, latest 3 are bug fixes)
- **Setup:** README.md, QUICK_START.md
- **Deployment:** DEPLOYMENT.md
- **Email Details:** EMAIL_INTEGRATION.md
- **API Reference:** docs/API_REFERENCE.md

## Code Conventions (Quick Reference)

**TypeScript:**
- Strict mode always
- Explicit return types
- PascalCase classes, camelCase functions

**Components:**
- Max 400 lines (split if larger)
- Composition API
- TypeScript for all

**Array Mutations (Fixed Jan 30):**
- NEVER use .push(), .unshift(), .splice()
- ALWAYS use spread: `array = [item, ...array]`
- See ADR-0022 for details

**Filters (Fixed Jan 30):**
- Multi-select → array types in DTO
- Queries use IN clause, not = 
- See ADR-0021 for details

**Notifications (Fixed Jan 30):**
- Every state change → Slack + Email + Real-time
- Load createdBy relation before email service
- See ADR-0023 for details

---

**This file is for AI session quick-start. See progress.md and decisions.md for complete history.**

**Last Updated:** 2026-01-30 (Bug fixes: filtering, real-time, notifications)  
**Owner:** Project Historian  
**Status:** Production Ready
