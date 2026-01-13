# IT Ticketing System - Quick Start Guide

## What Is This?

A modern IT support ticketing system built for internal help desk operations. Users can submit support requests, agents can manage tickets, and admins have full control.

---

## Access Points

| Portal | URL | For |
|--------|-----|-----|
| **Main App** | `http://reese-hauz:3001` | Everyone |
| **Customer Portal** | `http://reese-hauz:3001/portal` | End users submitting tickets |
| **Admin Dashboard** | `http://reese-hauz:3001/dashboard` | Agents & Admins |
| **GraphQL API** | `http://reese-hauz:4000/graphql` | Developers |

---

## User Roles

| Role | Can Do |
|------|--------|
| **User** | Submit tickets, view own tickets, add comments, mark resolved |
| **Agent** | All user abilities + manage all tickets, assign tickets |
| **Admin** | All agent abilities + manage users, archive tickets, full access |

---

## Quick Workflows

### For Users (Customers)
1. Log in at `/portal`
2. Click **"Submit New Ticket"**
3. Fill in: Title, Description, Category, Priority
4. Submit and track your ticket status

### For Agents
1. Log in at `/dashboard`
2. View all tickets in the queue
3. Click a ticket to view details
4. Update status, add comments, assign to yourself or others

### For Admins
1. Full access to everything
2. User management at `/admin/users`
3. Can archive closed tickets (after 10 hours, auto-archived)

---

## Ticket Lifecycle

```
OPEN → IN_PROGRESS → RESOLVED → CLOSED → ARCHIVED
         ↓
      ON_HOLD
```

- **Open**: New ticket, waiting for agent
- **In Progress**: Being worked on
- **On Hold**: Waiting for user response
- **Resolved**: Fix applied, awaiting confirmation
- **Closed**: Complete and confirmed
- **Archived**: Auto-removed after 10 hours closed (or manually by admin)

---

## Key Features

- **Slack Integration**: Tickets sync to Slack channels
- **Real-time Updates**: Live ticket updates via WebSocket
- **File Attachments**: Upload screenshots and documents
- **SLA Tracking**: Response and resolution time monitoring
- **Auto-Assignment**: Round-robin ticket distribution
- **Verse of the Day**: Daily inspiration on dashboards

---

## Tech Stack

- **Frontend**: Vue 3 + Vuetify 3
- **Backend**: NestJS + GraphQL
- **Database**: PostgreSQL
- **Cache**: Redis
- **Deployment**: Docker Compose

---

## Need Help?

- Check the **Knowledge Base** in the portal
- Contact your system administrator
- View API docs at `/graphql` (GraphQL Playground)

---

*Last Updated: January 2026*
