# Architectural Decisions & Rationale

**Project:** IT Ticketing System  
**Location:** `/home/mrnehemiahreese/it-ticketing-system`  
**Purpose:** Record significant architectural and technical decisions with context and rationale

---

## Decision Template

Each decision includes:
- **Decision ID:** Unique identifier (ADR-NNNN for Architectural Decision Records)
- **Title:** Brief description of the decision
- **Date:** When the decision was made
- **Context:** Why this decision was needed, constraints, and alternatives
- **Decision:** What was decided
- **Rationale:** Why this approach was chosen
- **Consequences:** Implications of this decision
- **Status:** Accepted, Proposed, Superseded, Deprecated
- **Related Decisions:** Links to related ADRs

---

## ADR-0001: Use GraphQL as Primary API

**Date:** 2026-01-05 (Initial Commit)  
**Status:** Accepted  
**Related:** ADR-0002, ADR-0003

### Context
The project needed an API layer to connect frontend and backend. Options considered:
- REST API (traditional, simple)
- GraphQL (type-safe, efficient)
- gRPC (performant, complex)

### Decision
Adopted GraphQL Apollo Server with TypeORM entities mapped to GraphQL types.

### Rationale
1. **Type Safety:** GraphQL schema provides strong typing for both frontend and backend
2. **Efficiency:** Clients fetch only needed fields, reducing bandwidth
3. **Developer Experience:** Self-documenting API with built-in introspection
4. **Real-time Support:** Natural fit for subscriptions (Phase 6)
5. **Vue 3 Integration:** Apollo Client has excellent Vue 3 support

### Consequences
- Steeper learning curve for team members unfamiliar with GraphQL
- Requires additional tooling (Apollo Server, Apollo Client, codegen)
- Need to implement proper error handling and field resolution caching
- GraphQL query complexity validation recommended (addressed in Phase 2)

### Trade-offs Accepted
- More upfront complexity for better long-term maintainability
- Additional dependencies vs simpler REST

---

## ADR-0002: NestJS as Backend Framework

**Date:** 2026-01-05 (Initial Commit)  
**Status:** Accepted  
**Related:** ADR-0001, ADR-0003

### Context
Backend required structured framework with:
- TypeScript support for type safety
- GraphQL integration capabilities
- Modular architecture for scalability
- Testing framework support

### Decision
Chose NestJS as the backend framework with TypeORM for data access.

### Rationale
1. **TypeScript First:** Built from ground up for TypeScript
2. **Modular Architecture:** Clear module/service/controller structure
3. **GraphQL Integration:** Apollo Server integration is straightforward
4. **Testing Support:** Built-in testing utilities and Jest integration
5. **Production Ready:** Used by large organizations, well-documented
6. **Middleware & Guards:** Excellent security middleware support

### Consequences
- Opinionated structure (some might find it restrictive)
- Dependency on decorators and metadata (TypeScript reflection)
- Larger initial bundle size than minimal Node.js solutions
- Learning curve for developers new to NestJS

### Decision Notes
- Aligns well with decision to use TypeORM
- Enables clean separation of authentication concerns (guards/strategies)
- Facilitates future microservices transition if needed

---

## ADR-0003: Vue 3 with TypeScript for Frontend

**Date:** 2026-01-05 (Initial Commit)  
**Status:** Accepted  
**Related:** ADR-0001, ADR-0002

### Context
Frontend needed:
- Reactive UI framework
- TypeScript support
- GraphQL integration
- State management
- Component-based architecture

### Decision
Adopted Vue 3 with Composition API, TypeScript, Apollo Client, and Pinia for state management.

### Rationale
1. **Composition API:** Modern, flexible approach to component logic
2. **TypeScript Support:** Strong types prevent runtime errors
3. **Apollo Client Integration:** Seamless GraphQL queries and mutations
4. **Pinia State Management:** Simpler than Vuex, type-safe
5. **Developer Experience:** Quick to prototype, scales well
6. **Community & Ecosystem:** Large community, abundant packages

### Consequences
- Vue 3 still relatively newer than React (but stable as of 2026)
- Smaller hiring pool than React (secondary concern for small team)
- Component size limits must be enforced (addressed in Phase 4)
- Requires test setup (covered in Phase 1)

### Decision Notes
- Composition API chosen over Options API for better code organization
- Apollo Client chosen for state management over other solutions
- Pinia keeps state concerns separate from views (good separation)

---

## ADR-0004: PostgreSQL for Primary Database

**Date:** 2026-01-05 (Initial Commit)  
**Status:** Accepted  
**Related:** ADR-0005

### Context
Project required:
- Relational data model (users, tickets, comments, attachments)
- ACID compliance for data integrity
- Scalability for growing datasets
- Rich querying capabilities

### Decision
Selected PostgreSQL as primary database with TypeORM as ORM.

### Rationale
1. **Relational Model:** Perfect for hierarchical ticket/comment/user relationships
2. **ACID Compliance:** Ensures data integrity for critical operations
3. **Advanced Features:** JSON support, full-text search, window functions
4. **TypeORM Support:** Excellent TypeORM integration
5. **Reliability:** Proven in production environments
6. **Open Source:** No licensing concerns

### Consequences
- Operational complexity higher than SQLite for development
- Requires database administration for production
- Schema migrations needed (addressed in Phase 3)
- Connection pooling must be configured

### Trade-offs Accepted
- Complexity vs SQLite simplicity (necessary for production readiness)
- TypeORM abstraction vs raw SQL control (necessary for maintainability)

---

## ADR-0005: Redis for Caching and Real-time

**Date:** 2026-01-05 (Initial Commit)  
**Status:** Accepted  
**Related:** ADR-0004

### Context
Project needed:
- Session storage
- Real-time message pub/sub
- Caching layer for performance
- WebSocket state management

### Decision
Implemented Redis for:
- Session store for JWT validation
- Pub/Sub for GraphQL subscriptions (Phase 6)
- Cache layer for frequent queries
- Distributed locking for operations

### Rationale
1. **Performance:** In-memory storage for sub-millisecond latency
2. **Pub/Sub:** Native support for real-time message distribution
3. **Persistence Options:** Can be configured for various durability levels
4. **Scaling:** Works well in distributed systems
5. **Maturity:** Proven, reliable, well-understood

### Consequences
- Additional infrastructure component to manage
- Requires monitoring and backup strategy
- Single point of failure (mitigated with replication/clustering)
- Memory constraints on large datasets

### Future Considerations
- Evaluate clustering for high availability (if needed post-Phase 6)
- Consider persistent message queue for critical operations
- Implement circuit breakers for Redis failures

---

## ADR-0006: Docker for Containerization

**Date:** 2026-01-05 (Initial Commit)  
**Status:** Accepted

### Context
Deployment needed:
- Consistent environment across dev/staging/production
- Easy scaling and orchestration
- Dependency isolation
- Quick onboarding for developers

### Decision
All services containerized with Docker Compose for orchestration.

### Rationale
1. **Consistency:** "Works on my machine" eliminated
2. **Orchestration:** Docker Compose simplifies multi-container setup
3. **Scalability:** Ready for Kubernetes migration if needed
4. **Standard Practice:** Industry standard for modern deployments
5. **Developer Experience:** Quick local setup

### Consequences
- Requires Docker knowledge from team
- Image size must be monitored
- Registry management needed for production
- Performance overhead vs bare metal (minimal impact)

### Docker Images
- Frontend: Node.js Alpine based, multi-stage build
- Backend: Node.js Alpine based, multi-stage build
- PostgreSQL: Official PostgreSQL image
- Redis: Official Redis image
- Nginx: Official Nginx image (reverse proxy)

---

## ADR-0007: TypeORM for Database Access

**Date:** 2026-01-05 (Initial Commit)  
**Status:** Accepted  
**Related:** ADR-0004

### Context
NestJS backend required:
- Database abstraction layer
- Entity mapping
- Query building
- Migration support

### Decision
Selected TypeORM as the ORM for database access layer.

### Rationale
1. **TypeScript First:** Written in TypeScript, excellent type safety
2. **NestJS Integration:** Seamless integration with NestJS modules
3. **Decorator Based:** Uses decorators for elegant entity definitions
4. **Query Builder:** Powerful, type-safe query construction
5. **Migration Support:** Built-in migration system (Phase 3)
6. **Active Maintenance:** Well-maintained, regular updates

### Consequences
- Decorator learning curve
- Performance characteristics depend on query optimization
- Complex queries may need Query Builder or raw SQL
- Migration folder currently empty (to be addressed Phase 3)

### Current Limitation
- Migrations folder is empty (backend/src/database/migrations/)
- This is a priority for Phase 3
- Entities are defined but not yet managed via migrations

---

## ADR-0008: Pinia for Frontend State Management

**Date:** 2026-01-05 (Initial Commit)  
**Status:** Accepted  
**Related:** ADR-0003

### Context
Frontend needed:
- Centralized state management
- Persistence across route changes
- Typescript support
- Clean API

### Decision
Adopted Pinia as the state management store.

### Rationale
1. **Simplicity:** Less boilerplate than Vuex
2. **TypeScript:** Full TypeScript support without over-configuration
3. **Vue 3 Aligned:** Designed specifically for Vue 3
4. **Composition-Style:** Works naturally with Composition API
5. **Devtools:** Excellent debugging tools
6. **Modularity:** Natural module/store organization

### Consequences
- Team must learn Pinia patterns
- State mutations must follow rules (prevents spaghetti code)
- DevTools dependency for debugging

### Store Organization
Stores should be organized by domain:
- `userStore` - User authentication and profile
- `ticketStore` - Ticket list and detail state
- `commentStore` - Comments state (may consolidate with ticketStore)
- `attachmentStore` - File upload state

---

## ADR-0009: Slack Integration for Notifications

**Date:** 2026-01-08 (Commit: 174a03a)  
**Status:** Accepted

### Context
Project required:
- User notifications in Slack
- Ticket creation and updates
- Comment notifications
- User mapping between systems

### Decision
Implemented Slack webhook integration for ticket and comment notifications with user mapping.

### Rationale
1. **User Engagement:** Notifications in their primary communication tool
2. **Integration Ease:** Slack webhooks are straightforward
3. **Non-Intrusive:** Doesn't require polling
4. **Rich Messages:** Can format messages with attachments
5. **Familiar Interface:** Team already uses Slack

### Consequences
- Requires webhook endpoint to be publicly accessible
- Slack API tokens need secure storage (Phase 2 concern)
- User mapping must be maintained between systems
- Rate limiting considerations

### Implementation Details
- Webhook URL stored in environment variables
- User mapping maintained in database or configuration
- Message formatting for rich Slack presentation
- Error handling for failed deliveries (addressed in Phase 2)

### Security Considerations (Phase 2)
- Webhook tokens must be protected
- Input validation on Slack mappings
- CORS headers must allow Slack (or use server-side posting)

---

## ADR-0010: Authentication Strategy - JWT

**Date:** 2026-01-05 (Initial Commit)  
**Status:** Accepted (Needs Security Hardening)  
**Related:** ADR-0002, ADR-0005

### Context
Project required:
- Stateless authentication
- Scalable across multiple servers
- Token-based authorization
- Secure credential handling

### Decision
Implemented JWT (JSON Web Tokens) with NestJS Passport strategy.

### Rationale
1. **Stateless:** No server-side session storage needed
2. **Scalable:** Works naturally with horizontal scaling
3. **Standard:** Well-established, widely used
4. **Flexibility:** Can include user data in token
5. **GraphQL Friendly:** Tokens passed in headers or cookies

### Consequences
- Token expiration and refresh must be managed
- Token revocation is complex (mitigated with Redis blacklist)
- Secret key must be secure (currently NOT secure - Phase 2 issue)
- Token size affects request headers

### CRITICAL SECURITY ISSUE (Phase 2)
- Default secret: 'your-secret-key-change-in-production'
- Must be enforced as strong, random secret
- Must fail startup if using default
- Must validate minimum entropy

### Implementation Details
- Tokens include user ID and roles
- Expiration time should be reasonable (1 hour suggested)
- Refresh tokens for extended sessions (recommended for Phase 2)
- Token validation on every GraphQL request

---

## ADR-0011: Testing Strategy

**Date:** 2026-01-12 (Assessment Document)  
**Status:** Proposed (Phase 1 to implement)  
**Related:** ADR-0001, ADR-0002, ADR-0003

### Context
Currently 0% test coverage. Project needs:
- Unit testing framework
- Integration testing for GraphQL
- Component testing for Vue
- Coverage reporting
- Quality gates

### Proposed Decision
Backend: Jest + TypeORM test utilities  
Frontend: Vitest + Vue Test Utils + Apollo MockProvider

### Rationale (Proposed)
1. **Backend Jest:** Matches NestJS conventions, excellent TypeScript support
2. **Frontend Vitest:** Vite-native, fast, Vue 3 optimized
3. **Apollo MockProvider:** Standard for GraphQL testing
4. **Coverage Target:** 80% for critical paths

### Expected Consequences
- Increased development time initially
- More confidence in refactoring
- Better code design through testability
- Maintenance burden of test suite

### Phase 1 Deliverables
- Test framework configuration
- At least 10% baseline coverage
- Testing guidelines documented

---

## ADR-0012: Security First Approach

**Date:** 2026-01-12 (Assessment Document)  
**Status:** Proposed (Phase 2 to implement)

### Context
Security assessment identified multiple vulnerabilities:
- No rate limiting
- Weak default secrets
- No input validation
- No output sanitization

### Proposed Decision
Implement comprehensive security hardening in Phase 2:
- Rate limiting on all endpoints
- Strong secret requirements
- Input validation on all mutations
- Output sanitization for XSS prevention
- Helmet security headers

### Rationale
1. **Defense in Depth:** Multiple layers of protection
2. **OWASP Compliance:** Addresses OWASP Top 10 issues
3. **Data Protection:** Protects user data and system integrity
4. **Production Ready:** Essential before public deployment

### Implementation Plan
See PROGRESS.md Phase 2 for detailed tasks.

---

## ADR-0013: Code Organization & Cleanup Standards

**Date:** 2026-01-12 (Assessment Document)  
**Status:** Proposed (Phase 4 to implement)

### Context
Current issues identified:
- Backup files in version control
- Console.log statements scattered
- Large components (681 lines)
- Unused entities in codebase

### Proposed Decision
Establish code quality standards:
- No backup files in version control
- Remove all console.log (use structured logging)
- Component size limit: 400 lines (split larger)
- Remove or implement unused entities

### Rationale
1. **Maintainability:** Cleaner code is easier to maintain
2. **Scalability:** Patterns established now prevent problems later
3. **Onboarding:** New developers understand standards
4. **Quality:** Prevents technical debt accumulation

### Standards to Document
- Component size guidelines
- Logging approach (Winston or Pino)
- File naming conventions
- Import organization
- Comment standards

---

## ADR-0014: Feature Priority - Pagination Before Real-time

**Date:** 2026-01-12 (Assessment Document)  
**Status:** Proposed

### Context
Development plan includes both pagination (Phase 5) and real-time subscriptions (Phase 6).
Question: Which should take priority?

### Proposed Decision
Pagination (Phase 5) before real-time subscriptions (Phase 6).

### Rationale
1. **User Impact:** Pagination affects all users immediately
2. **Performance:** Prevents database/network overload with large datasets
3. **Scalability:** Enables system to handle growth
4. **Complexity:** Real-time can build on stable pagination base

### Trade-offs
- Users won't see real-time updates initially
- Pagination can operate independently of subscriptions
- Both phases can overlap, but pagination blocks performance concerns

---

## ADR-0015: Pagination Strategy - Cursor-based

**Date:** 2026-01-12 (Assessment Document)  
**Status:** Proposed (Phase 5)

### Context
Phase 5 will implement pagination. Two main strategies:
- Offset-based (SQL OFFSET/LIMIT)
- Cursor-based (bookmark through results)

### Proposed Decision
Implement cursor-based pagination using edge/connection pattern.

### Rationale
1. **Performance:** Efficient even with large datasets
2. **Consistency:** Results remain consistent between requests
3. **GraphQL Standard:** Aligns with GraphQL best practices
4. **Infinite Scroll:** Natural fit for frontend patterns
5. **Database Friendly:** Indexed query patterns

### Consequences
- Slightly more complex implementation
- Cursor encoding/decoding needed
- More efficient for large datasets

### Cursor Implementation
- Base64 encode database ID as cursor
- Validate and decode on request
- Support both forward and backward pagination

---

## Pending Decision Placeholders

### ADR-0016: Monitoring & Alerting Strategy (TBD)
### ADR-0017: Backup & Disaster Recovery (TBD)
### ADR-0018: Rate Limiting Algorithm (TBD - Phase 2)
### ADR-0019: Logging Strategy (TBD - Phase 4)
### ADR-0020: Deployment & CI/CD Pipeline (TBD)

---

## Decision Review Process

### When to Create a New Decision
- Major architectural changes
- New technology adoption
- Significant trade-offs made
- Team consensus on approach
- Decisions affecting multiple components

### Decision Review Frequency
- Quarterly architecture review
- After major incidents (post-mortem)
- When proposing alternatives
- Before major refactoring

### Superseding Decisions
When a decision is superseded:
1. Create new ADR with reference to old one
2. Update old ADR status to "Superseded by ADR-XXXX"
3. Document reasons for change
4. Plan migration strategy

---

## References

- NestJS Documentation: https://docs.nestjs.com/
- GraphQL Documentation: https://graphql.org/learn/
- Vue 3 Documentation: https://vuejs.org/
- TypeORM Documentation: https://typeorm.io/
- PostgreSQL Documentation: https://www.postgresql.org/docs/
- Architectural Decision Records: https://adr.github.io/

---

**Document Status:** Active  
**Last Updated:** 2026-01-12  
**Owner:** Project Historian  
**Review Cycle:** Quarterly


---

## ADR-0021: Array Type Handling in GraphQL Filters

**Date:** 2026-01-30  
**Status:** Accepted (Implemented in Commit 8300990)  
**Related:** ADR-0001 (GraphQL API)

### Context
**Problem:** Ticket filtering was completely broken. Frontend sent arrays for multi-select filters but backend declared scalar enum types. Query execution used equality checks that failed silently.

**Impact:** All filter operations returned no results with no error.

### Decision
When frontend provides multi-select filtering, backend GraphQL input types must use array types with IN clauses, not scalar equality checks.

### Implementation
- Changed `status`, `priority`, `category` from `TicketStatus` to `TicketStatus[]`
- Updated queries from `= :status` to `IN (:...statuses)`
- Added empty array safety checks

### Rationale
1. Type correctness matches actual data flow
2. Database semantics (IN operator for multi-values)
3. Error prevention at compile time, not query time
4. Consistency across all multi-select filters

### Verification
Selected "Resolved" filter → returned 3 matching tickets correctly.

---

## ADR-0022: Apollo Client Array Immutability

**Date:** 2026-01-30  
**Status:** Accepted (Implemented in Commit 8300990)  
**Related:** ADR-0003 (Vue 3), ADR-0001 (GraphQL)

### Context
**Problem:** New tickets didn't appear in real-time until page refresh. Apollo Client returns frozen arrays; direct mutations fail silently. Subscription handler only called refetch() without immediate state update.

**Impact:** Real-time updates non-functional.

### Decision
Never mutate Apollo-cached arrays directly. Always create new arrays using spread operator.

### Pattern
```javascript
// Wrong
array.push(item)      // Fails on frozen arrays
array.unshift(item)   // Throws TypeError

// Correct
array = [item, ...array]  // Creates new immutable copy
array = [...array, item]
```

### Implementation
- Refactored Pinia store methods to use spread operator
- Updated subscription handler to call addTicket() before refetch()
- Applied pattern to all array mutations

### Rationale
1. Apollo Client intentionally freezes objects to prevent corruption
2. Vue properly detects new array assignments for reactivity
3. Immutable patterns prevent subtle bugs
4. Aligns with functional programming best practices

### Verification
Created TKT-000035 while viewing list → appeared instantly at top. Count updated from 31 to 32 in real-time.

---

## ADR-0023: Notification Handler Consistency

**Date:** 2026-01-30  
**Status:** Accepted (Implemented in Commit 8300990)  
**Related:** ADR-0009 (Email Integration)

### Context
**Problem:** Email notifications weren't sent on ticket status changes. sendTicketStatusUpdateNotification() existed but was never called by mutation handlers.

**Impact:** Ticket creators not notified of status changes.

### Decision
Every state-changing operation must execute: state change → Slack notification → email notification → real-time subscription.

### Implementation
Added notification calls to:
- tickets.service.ts update() method
- slack.service.ts handleStatusCommand()
- comments.service.ts for public comments

Pattern includes conditional logic (only notify if state changed) and relation loading.

### Rationale
1. Users expect notification of relevant changes
2. Prevents silent failures in notification delivery
3. Centralized pattern makes gaps obvious
4. Ensures comprehensive notification coverage

### Verification
Changed TKT-000028 status from Closed to Open. Verified: database change, Slack notification, email to creator (bubblesb@tmconsulting.us), real-time subscription.

---

## ADR-0024: Email Attachment Extraction and Storage

**Date:** 2026-01-30  
**Status:** Accepted (Implemented in Commit 23bd7f2)  
**Related:** ADR-0009 (Email Integration), ADR-0008 (File Storage)

### Context
**Problem:** Email attachments were being ignored during IMAP message processing. Users could not send files via email to create tickets with attachments.

**Impact:** Email integration incomplete; file sharing limited to web portal only.

### Decision
Extract attachments from inbound IMAP emails using mailparser, store both on disk and in PostgreSQL, and integrate with AttachmentsService for unified access.

### Implementation Details
- Use mailparser (already in email-inbound.service.ts) to extract attachments from each email
- For each attachment: extract binary data, preserve original filename, determine MIME type
- Call AttachmentsService.create() to persist file and DB record
- Store attachment ID in ticket comment metadata
- For image attachments: upload to Slack thread automatically
- Works for both new tickets and reply-to-ticket emails

### Technical Changes
- File: backend/src/notifications/email-inbound.service.ts
  - Added attachment extraction loop inside email processing
  - Integrated AttachmentsService call within processInboundEmail()
  - Maintained error handling (attachment failure doesn't fail ticket creation)

- File: backend/src/notifications/email.module.ts
  - Added AttachmentsService to module providers
  - Enables dependency injection into email-inbound.service.ts

### Rationale
1. **User Expectation:** Email attachment handling is standard email behavior
2. **Feature Completeness:** Integrates email as full-featured intake channel
3. **Persistence:** Both disk and DB storage ensures redundancy and queryability
4. **Slack Integration:** Automatic image upload improves team collaboration
5. **Data Integrity:** AttachmentsService handles storage details consistently

### Consequences
- Additional disk I/O on email processing (mitigated by async)
- Database storage for attachment metadata
- Requires cleanup of old attachments (future archival policy)
- Email processing may take longer with large attachments

### Verification
- Email with 3 attachments (2 images, 1 PDF) → ticket created with all attachments
- Slack thread shows image previews
- Attachments downloadable from ticket detail view

---

## ADR-0025: Relative API URLs for Nginx Proxy Routing

**Date:** 2026-01-30  
**Status:** Accepted (Implemented in Commit 7597caa)  
**Related:** ADR-0010 (Deployment), ADR-0015 (Frontend Architecture)

### Context
**Problem:** Attachment images displaying as blank in production after nginx deployment. Frontend hardcoded API_BASE_URL fallback to 'http://localhost:4000' which is unreachable from browsers accessing via http://192.168.1.2:3001.

**Impact:** All attachment URLs fail; images display as blank in portal.

### Decision
Use relative URLs (empty string for API_BASE_URL) so that all API requests go through the frontend nginx proxy, which routes them to the backend container.

### Technical Details
- File: frontend/src/utils/api.js
  - Changed API_BASE_URL fallback from 'http://localhost:4000' to ''
  - This makes attachment requests relative: /attachments/{id}
  - Frontend nginx.conf already configured to proxy /attachments to backend:4000

### Request Flow
```
Browser → nginx:3001 → /attachments/{id}
  ↓ (nginx proxy)
Backend:4000 → AttachmentsService.getAttachment()
  ↓ (response)
Browser ← nginx:3001 ← attachment file
```

### Why This Works
1. Relative URLs use current origin (http://192.168.1.2:3001)
2. All requests route through nginx (no hardcoded backend address)
3. Same proxy configuration works for /graphql and /attachments
4. Works for both container-internal (backend) and external (browser) access

### Rationale
1. **Deployment Flexibility:** Same frontend image works on any deployment
2. **Proxy Pattern:** Frontend nginx manages all backend routing
3. **No Hardcoding:** Eliminates hardcoded localhost addresses
4. **Security:** Requests don't bypass nginx security layer
5. **Scalability:** Easy to add more backend services behind same proxy

### Consequences
- API requests always proxied through frontend nginx (slight latency increase)
- Frontend nginx becomes critical path (must be stable)
- Easier debugging (all requests visible in nginx logs)
- Browser cache may be more effective with same origin

### Verification
- TKT-000042 created with email image attachment
- Image displays correctly in ticket detail view
- Network requests show /attachments requests going to http://192.168.1.2:3001
- Nginx proxy logs confirm forwarding to backend:4000

---

**Document Status:** Updated  
**Last Updated:** 2026-01-30 (ADR-0024, ADR-0025)  
**Owner:** Project Historian
