# TM Support Portal - Backend

A production-ready NestJS backend with GraphQL API for managing IT support tickets.

## Features

- **Authentication & Authorization**: JWT-based auth with role-based access control (Admin, Agent, User)
- **User Management**: Full CRUD operations with password hashing
- **Ticket System**: Complete ticket lifecycle management with status workflow
- **Comments**: Internal and public comments on tickets
- **Attachments**: File upload handling for ticket attachments
- **Notifications**: Email and Slack integration
- **Dashboard**: Analytics and reporting with statistics
- **Database**: TypeORM with PostgreSQL

## Tech Stack

- **Framework**: NestJS 10.x
- **API**: GraphQL with Apollo Server
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT with Passport
- **Validation**: class-validator & class-transformer
- **Password Hashing**: bcrypt

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

## Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Update .env with your configuration
```

## Database Setup

```bash
# Run migrations
npm run migration:run

# Seed database with default users
npm run seed
```

## Running the Application

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

The server will start on `http://localhost:4000`
GraphQL Playground: `http://localhost:4000/graphql`

## Default Users

After running the seed script:

- **Admin**: username=`admin`, password=`admin123456`
- **Agent 1**: username=`agent1`, password=`agent123456`
- **Agent 2**: username=`agent2`, password=`agent123456`
- **User 1**: username=`user1`, password=`user123456`
- **User 2**: username=`user2`, password=`user123456`

## GraphQL API

### Authentication

```graphql
# Login
mutation {
  login(loginInput: { username: "admin", password: "admin123456" }) {
    accessToken
    user {
      id
      username
      fullname
      email
      roles
    }
  }
}

# Register
mutation {
  register(registerInput: {
    username: "newuser"
    password: "password123"
    fullname: "New User"
    email: "newuser@example.com"
  }) {
    accessToken
    user {
      id
      username
    }
  }
}
```

### Tickets

```graphql
# Create Ticket
mutation {
  createTicket(createTicketInput: {
    title: "Computer not working"
    description: "My computer won't turn on"
    priority: HIGH
    category: HARDWARE
  }) {
    id
    title
    status
    priority
  }
}

# Get All Tickets
query {
  tickets {
    id
    title
    status
    priority
    createdBy {
      fullname
    }
    assignedTo {
      fullname
    }
  }
}

# Filter Tickets
query {
  tickets(filters: { status: OPEN, priority: HIGH }) {
    id
    title
    status
  }
}

# Update Ticket
mutation {
  updateTicket(id: "ticket-id", updateTicketInput: {
    status: IN_PROGRESS
    assignedToId: "agent-id"
  }) {
    id
    status
  }
}
```

### Comments

```graphql
# Add Comment
mutation {
  createComment(createCommentInput: {
    content: "Working on this issue"
    ticketId: "ticket-id"
    isInternal: false
  }) {
    id
    content
    user {
      fullname
    }
  }
}

# Get Ticket Comments
query {
  ticketComments(ticketId: "ticket-id") {
    id
    content
    isInternal
    user {
      fullname
    }
    createdAt
  }
}
```

### Dashboard

```graphql
# Get Statistics
query {
  ticketStatistics {
    total
    byStatus {
      open
      inProgress
      resolved
      closed
    }
  }

  ticketsByPriority {
    low
    medium
    high
    urgent
  }

  agentPerformance {
    agent {
      fullname
    }
    assigned
    resolved
    closed
  }
}
```

## Project Structure

```
src/
├── app.module.ts           # Main application module
├── main.ts                 # Application entry point
├── auth/                   # Authentication & JWT
│   ├── auth.module.ts
│   ├── auth.service.ts
│   ├── auth.resolver.ts
│   ├── jwt.strategy.ts
│   ├── guards/
│   └── dto/
├── users/                  # User management
│   ├── users.module.ts
│   ├── users.service.ts
│   ├── users.resolver.ts
│   ├── entities/
│   └── dto/
├── tickets/                # Ticket management
│   ├── tickets.module.ts
│   ├── tickets.service.ts
│   ├── tickets.resolver.ts
│   ├── entities/
│   └── dto/
├── comments/               # Comment system
├── attachments/            # File attachments
├── notifications/          # Email & Slack
│   ├── email.service.ts
│   └── slack.service.ts
├── dashboard/              # Analytics
├── database/               # DB config & seeds
│   ├── data-source.ts
│   ├── migrations/
│   └── seeds/
└── common/                 # Shared utilities
    ├── decorators/
    ├── guards/
    ├── enums/
    └── filters/
```

## Environment Variables

```env
NODE_ENV=development
PORT=4000
DATABASE_URL=postgresql://user:pass@localhost:5432/dbname
JWT_SECRET=your-secret-key
JWT_EXPIRATION=7d
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=email@example.com
SMTP_PASS=password
SLACK_WEBHOOK_URL=https://hooks.slack.com/...
```

## Scripts

```bash
npm run start:dev        # Start in development mode
npm run build            # Build for production
npm run start:prod       # Start in production mode
npm run migration:run    # Run database migrations
npm run seed             # Seed database
npm run lint             # Lint code
npm run format           # Format code
npm run test             # Run tests
```

## API Documentation

Access GraphQL Playground at `http://localhost:4000/graphql` for interactive API documentation and testing.

## Security Features

- Password hashing with bcrypt
- JWT authentication
- Role-based access control
- Input validation
- SQL injection protection (TypeORM)
- CORS configuration

## License

MIT
