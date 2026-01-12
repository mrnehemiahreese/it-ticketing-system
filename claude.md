# CLAUDE.md - Project Conventions & AI Assistant Guidelines

**Project:** IT Ticketing System  
**Purpose:** Define conventions and context for AI assistants and development team

---

## Quick Navigation

- **ASSESSMENT.md** - Current state assessment and improvement plan
- **PROGRESS.md** - Phase-by-phase tracking of implementation
- **DECISIONS.md** - Architectural decisions and rationale
- **README.md** - Project overview and quick start
- **DEPLOYMENT.md** - Deployment procedures and infrastructure

---

## Technology Stack Summary

| Component | Technology | Version | Notes |
|-----------|-----------|---------|-------|
| Backend | NestJS | 10+ | GraphQL API server |
| Frontend | Vue 3 | 3.x | TypeScript + Composition API |
| Database | PostgreSQL | 13+ | Primary data store |
| Cache | Redis | 6+ | Sessions, pub/sub, cache |
| ORM | TypeORM | Latest | Database abstraction |
| State | Pinia | Latest | Vue state management |
| API | GraphQL | Apollo Server | Type-safe API |
| Client | Apollo Client | Latest | GraphQL client |
| Testing | Jest, Vitest | Latest | Test frameworks (Phase 1) |
| Containers | Docker | Latest | Containerization |
| Reverse Proxy | Nginx | Latest | Load balancing |

---

## Project Structure

```
it-ticketing-system/
├── backend/                    # NestJS API server
│   ├── src/
│   │   ├── auth/              # Authentication (JWT, strategies)
│   │   ├── users/             # User management
│   │   ├── tickets/           # Core ticket domain
│   │   ├── comments/          # Comments system
│   │   ├── attachments/       # File management
│   │   ├── surveys/           # Survey/feedback
│   │   ├── database/          # TypeORM, migrations, entities
│   │   └── graphql/           # GraphQL schema
│   ├── Dockerfile
│   └── package.json
├── frontend/                   # Vue 3 application
│   ├── src/
│   │   ├── components/        # Reusable Vue components
│   │   ├── views/             # Page-level components
│   │   ├── graphql/           # Queries, mutations, subscriptions
│   │   ├── stores/            # Pinia stores
│   │   ├── types/             # TypeScript definitions
│   │   └── App.vue
│   ├── Dockerfile
│   └── package.json
├── nginx/                      # Reverse proxy configuration
├── docs/                       # Additional documentation
├── docker-compose.yml          # Multi-container orchestration
├── ASSESSMENT.md               # State assessment & improvement plan
├── PROGRESS.md                 # Phase tracking
├── DECISIONS.md                # Architectural decisions
└── CLAUDE.md                   # This file

```

---

## Code Style & Conventions

### TypeScript
- **Strict Mode:** Always enabled
- **Type Annotations:** Explicit return types required
- **Interfaces:** Prefer interfaces over types for object shapes
- **Enums:** Use for fixed sets of values
- **Naming:**
  - Classes: PascalCase
  - Functions: camelCase
  - Constants: UPPER_SNAKE_CASE
  - Files: match exported class (PascalCase) or camelCase for utilities

### Backend (NestJS)
- **Module Organization:** One module per feature domain
- **Naming Conventions:**
  - Services: `*.service.ts`
  - Controllers: `*.controller.ts` (if REST only)
  - Resolvers: `*.resolver.ts` (for GraphQL)
  - Guards: `*.guard.ts`
  - Pipes: `*.pipe.ts`
  - Middleware: `*.middleware.ts`
  - Entities: `*.entity.ts`
  - DTOs: `*.dto.ts` or `create-*.input.ts` for GraphQL inputs

- **GraphQL Patterns:**
  - One resolver file per entity
  - Input types for mutations: `Create*.input.ts`, `Update*.input.ts`
  - Separate input DTOs from response types
  - Use `@InputType()` for GraphQL inputs
  - Use `@ObjectType()` for response types

- **Service Layer:**
  - Encapsulate business logic
  - Use dependency injection
  - No direct request handling
  - Repository pattern for data access

### Frontend (Vue 3)
- **Component Naming:**
  - Reusable components: PascalCase (`UserCard.vue`)
  - Page components: PascalCase (`TicketDetailView.vue`)
  - Composables: `use*.ts` convention
  
- **Component Size Limit:** 400 lines maximum
  - Split larger components into smaller ones
  - Use composition for code organization
  - Keep templates clean and readable

- **Imports Order:**
  1. Vue and plugins
  2. External libraries
  3. Internal components
  4. Stores and composables
  5. Types and utilities
  6. Styles

- **Pinia Stores:**
  - One store per domain (userStore, ticketStore, etc.)
  - Use composition for reusability
  - Keep mutations simple and pure
  - Use actions for async operations

### GraphQL Naming
- **Queries:** Start with lowercase verb (getTicket, listTickets)
- **Mutations:** Start with verb (createTicket, updateTicket, deleteTicket)
- **Subscriptions:** Use -d suffix (ticketUpdated, commentAdded)
- **Input Types:** Prefix with Create/Update (CreateTicketInput, UpdateTicketInput)

---

## Testing Standards

### Current Status (Phase 1 - TBD)
- Zero test coverage currently
- Phase 1 will establish testing infrastructure

### Testing Standards (When Implemented)
- **Coverage Target:** 80% for critical paths
- **Test Types:**
  - Unit: Service logic, utilities, business rules
  - Integration: API endpoints, database operations
  - Component: Vue component rendering and interaction
  - E2E: User workflows (future)

- **Backend Testing:**
  - Framework: Jest with TypeORM test utilities
  - Setup: Isolated test database per test suite
  - Pattern: Arrange-Act-Assert for clear test structure
  - Mocking: Use jest.mock() for external services

- **Frontend Testing:**
  - Framework: Vitest + Vue Test Utils
  - Setup: Apollo MockedProvider for GraphQL
  - Pattern: Given-When-Then for clarity
  - Coverage: Focus on component logic and user interactions

- **Test File Location:**
  - Backend: `src/**/*.spec.ts` (same directory as source)
  - Frontend: `src/**/*.spec.ts` (same directory as source)

- **CI/CD:** Tests must pass before merge
  - Coverage reports must show >= 80%
  - Failing tests block PR merge

---

## Security Considerations

### Current Status (Phase 2 - TBD)
Multiple security gaps identified in ASSESSMENT.md

### Required Practices
- **Secrets Management:**
  - Never commit secrets to git
  - Use environment variables for all credentials
  - Validate required secrets at startup
  - Minimum 32-character JWT secret

- **Input Validation:**
  - Validate all user inputs
  - Sanitize content for storage
  - Use class-validator decorators
  - GraphQL schema validation

- **Authentication:**
  - JWT tokens for stateless auth
  - Token expiration enforced
  - Secure secret storage
  - HTTPS for all communication

- **CORS & Headers:**
  - Restrict CORS origins to known domains
  - Add Helmet security headers
  - X-Frame-Options: DENY
  - X-Content-Type-Options: nosniff

- **Rate Limiting:**
  - Implement on authentication endpoints
  - Implement on GraphQL endpoints
  - Exponential backoff for failed attempts

---

## Database Conventions

### TypeORM Entities
- One entity file per database table
- File naming: `entity-name.entity.ts`
- Logical grouping by module (auth, tickets, etc.)
- Relations properly defined with decorators

### Migrations
- **Status:** Currently empty (Phase 3 to implement)
- **Location:** `backend/src/database/migrations/`
- **Strategy:** TypeORM CLI generated + reviewed
- **Naming:** Timestamp prefix + descriptive name
- **Testing:** Migrations must be tested with rollback

### Schema Practices
- Use UUID for primary keys (except junction tables)
- Add timestamps (createdAt, updatedAt) to all tables
- Use constraints (NOT NULL, UNIQUE, FOREIGN KEY)
- Index frequently queried columns
- Document schema changes in git commits

---

## API Conventions

### GraphQL Best Practices
- **Query Depth:** Limit to 10-level nesting max
- **Complexity:** Implement complexity analysis (Phase 2)
- **Pagination:** Use cursor-based when available (Phase 5)
- **Error Handling:** Consistent error response format
- **Subscriptions:** Implement after basic features complete (Phase 6)

### Response Format
```graphql
type Query {
  # Single resource
  getTicket(id: ID!): Ticket
  
  # Paginated list
  listTickets(first: Int, after: String): TicketConnection
  
  # Filtered list
  searchTickets(query: String!, filter: TicketFilter): [Ticket]
}
```

### Error Handling
- GraphQL errors include error codes
- Client-friendly error messages
- Server logging for debugging
- No sensitive information in errors

---

## Environment Configuration

### Required Environment Variables
```
# Backend
NODE_ENV=development|production
JWT_SECRET=<generate-secure-secret>
DATABASE_URL=postgresql://user:pass@localhost:5432/ticketing
REDIS_URL=redis://localhost:6379
SLACK_WEBHOOK_URL=<slack-webhook>
API_PORT=3000

# Frontend
VITE_API_URL=http://localhost:3000/graphql
VITE_WS_URL=ws://localhost:3000/graphql
```

### Environment Files
- `.env.example` - Template with all required variables
- `.env` - Local environment (not committed)
- `.env.production` - Production-specific (in CI/CD secrets)

---

## Git Workflow

### Commit Messages
- **Format:** `<type>: <description>`
- **Types:** feat, fix, refactor, docs, test, chore, perf
- **Length:** Description < 72 characters
- **Examples:**
  - `feat: add ticket pagination with cursor support`
  - `fix: prevent SQL injection in search queries`
  - `test: add unit tests for authentication service`

### Branch Naming
- Feature: `feature/description` or `feat/description`
- Bugfix: `bugfix/description` or `fix/description`
- Docs: `docs/description`
- Chore: `chore/description`

### PR Requirements
- Tests passing (when implemented)
- No console.log in production code
- Type checking passes
- Code review approved
- Branch up to date with main

### Review Checklist
- [ ] Code follows style conventions
- [ ] Tests are written and passing
- [ ] No security issues introduced
- [ ] Documentation updated if needed
- [ ] No technical debt added without issue

---

## Debugging & Logging

### Current State (Phase 4 - TBD)
- 19 console.log statements to be removed
- No structured logging implemented

### Logging Standards (When Implemented)
- **Framework:** Winston (Node.js recommended)
- **Levels:** ERROR, WARN, INFO, DEBUG, TRACE
- **Format:** JSON for production, readable for development
- **Context:** Include request ID for tracing

### Backend Logging
```typescript
// Example
logger.info('Ticket created', { ticketId, userId, timestamp });
logger.error('Database error', { error, query, userId });
```

### Frontend Logging
```typescript
// Example (use console sparingly)
console.debug('GraphQL query executed', query);
// Use structured logging instead in production
```

### Debugging Tips
- Use NestJS debug mode: `DEBUG=* npm run dev`
- Use Vue DevTools for component debugging
- Use Network tab for GraphQL debugging
- Check Docker logs: `docker logs container-name`

---

## Performance Considerations

### Frontend
- Component size: < 400 lines (split if larger)
- Lazy load routes when possible
- Memoize expensive computations
- Use virtual scrolling for large lists
- Monitor bundle size

### Backend
- Use database indexes for queries
- Implement pagination (Phase 5)
- Cache frequently accessed data
- Use connection pooling
- Monitor N+1 queries

### Database
- Index foreign keys and search columns
- Archive old data periodically
- Vacuum and analyze regularly
- Use EXPLAIN ANALYZE for optimization

---

## Documentation Guidelines

### When to Document
- New features or major changes
- Complex business logic
- Architectural decisions (use DECISIONS.md)
- Deployment procedures
- Configuration options
- API endpoints or GraphQL schema

### Documentation Locations
- **README.md** - Project overview, setup, quick start
- **DEPLOYMENT.md** - Infrastructure and deployment
- **ASSESSMENT.md** - Current state and improvement plan
- **PROGRESS.md** - Implementation progress tracking
- **DECISIONS.md** - Architectural decisions
- **CLAUDE.md** - This file, team conventions
- **docs/** - Detailed guides and documentation
- **Code Comments** - Complex logic only, not obvious code

### Documentation Standards
- Keep documentation up-to-date with code
- Use Markdown for all documentation
- Include examples where helpful
- Link related documentation
- Include timestamps on updates

---

## Common Development Tasks

### Running Tests (Phase 1+)
```bash
# Backend tests
cd backend
npm run test                    # Run all tests
npm run test:watch            # Watch mode
npm run test:coverage         # Coverage report

# Frontend tests
cd frontend
npm run test                   # Run all tests
npm run test:watch           # Watch mode
npm run test:coverage        # Coverage report
```

### Linting & Formatting
```bash
# Backend
cd backend
npm run lint                   # Check linting
npm run lint:fix              # Auto-fix issues
npm run format                # Format code

# Frontend
cd frontend
npm run lint                   # Check linting
npm run lint:fix              # Auto-fix issues
npm run format                # Format code
```

### Local Development
```bash
# Start services
docker-compose up -d

# Run migrations
cd backend
npm run typeorm migration:run

# Start dev servers
cd backend && npm run dev     # NestJS dev server (3000)
cd frontend && npm run dev    # Vite dev server (5173)
```

### Building Docker Images
```bash
# Build all services
docker-compose build

# Build specific service
docker-compose build backend
docker-compose build frontend
```

---

## AI Assistant Instructions

When contributing to this project, AI assistants should:

1. **Read Context Files First**
   - Review ASSESSMENT.md for current state
   - Check PROGRESS.md for what's in progress
   - Check DECISIONS.md for architectural context

2. **Follow Code Conventions**
   - Match existing code style in the file
   - Use proper naming conventions
   - Add type annotations to TypeScript code
   - Write meaningful variable/function names

3. **Document Changes**
   - Update relevant markdown files
   - Link to related decisions/progress items
   - Add code comments for complex logic
   - Update README if adding features

4. **Testing Practices**
   - Write tests alongside code (Phase 1+)
   - Ensure coverage meets standards
   - Test edge cases and error conditions
   - Include integration tests for features

5. **Security First**
   - Apply security patterns from DECISIONS.md
   - Validate user inputs
   - Use environment variables for secrets
   - Follow OWASP guidelines

6. **Code Review**
   - Run linting and type checking
   - Test locally before committing
   - Write clear commit messages
   - Request review from team

---

## Known Issues & Workarounds

### Database Migrations (Phase 3)
- **Issue:** Migrations folder is empty
- **Workaround:** Using TypeORM synchronize for now (dev only)
- **Timeline:** To be implemented in Phase 3
- **Note:** Production deployment requires proper migrations

### Test Infrastructure (Phase 1)
- **Issue:** No tests exist
- **Workaround:** Code review extra carefully
- **Timeline:** To be implemented in Phase 1
- **Note:** Refactoring risky without tests

### Security Configuration (Phase 2)
- **Issue:** JWT_SECRET has default value
- **Workaround:** Must override in .env before production
- **Timeline:** To be hardened in Phase 2
- **Note:** Do not deploy with defaults

### Component Size (Phase 4)
- **Issue:** TicketDetailView.vue is 681 lines
- **Workaround:** Component works but hard to maintain
- **Timeline:** To be refactored in Phase 4
- **Note:** Use extract method refactoring

---

## Useful Resources

- **NestJS:** https://docs.nestjs.com/
- **Vue 3:** https://vuejs.org/guide/
- **GraphQL:** https://graphql.org/learn/
- **TypeORM:** https://typeorm.io/
- **PostgreSQL:** https://www.postgresql.org/docs/
- **Docker:** https://docs.docker.com/
- **Pinia:** https://pinia.vuejs.org/

---

## Questions & Support

For questions about:
- **Architecture:** See DECISIONS.md
- **Progress:** See PROGRESS.md
- **Current State:** See ASSESSMENT.md
- **Deployment:** See DEPLOYMENT.md
- **Setup:** See README.md & QUICK_START.md

---

**Document Status:** Active  
**Last Updated:** 2026-01-12  
**Owner:** Project Historian  
**Intended Audience:** Development team, AI assistants, new contributors

