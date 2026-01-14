# TM Support Portal - GraphQL API Reference

## Base URL

```
http://localhost:4000/graphql
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

Get a token by calling the `login` mutation.

---

## Mutations

### Authentication

#### login
Login with username and password.

**Input:**
```graphql
mutation {
  login(loginInput: {
    username: String!
    password: String!
  }) {
    accessToken: String!
    user: User!
  }
}
```

**Example:**
```graphql
mutation {
  login(loginInput: {
    username: "admin"
    password: "admin123456"
  }) {
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
```

#### register
Register a new user account (defaults to USER role).

**Input:**
```graphql
mutation {
  register(registerInput: {
    username: String!
    password: String!
    fullname: String!
    email: String!
    phoneNumber: String
    workstationNumber: String
  }) {
    accessToken: String!
    user: User!
  }
}
```

### Users

#### createUser
Create a new user (Admin only).

**Roles Required:** ADMIN

**Input:**
```graphql
mutation {
  createUser(createUserInput: {
    username: String!
    password: String!
    fullname: String!
    email: String!
    phoneNumber: String
    workstationNumber: String
    roles: [Role!]!
  }) {
    id
    username
    fullname
    email
    roles
  }
}
```

#### updateUser
Update user information.

**Roles Required:** Self or ADMIN

**Input:**
```graphql
mutation {
  updateUser(
    id: String!
    updateUserInput: {
      username: String
      password: String
      fullname: String
      email: String
      phoneNumber: String
      workstationNumber: String
      roles: [Role]
      isDisabled: Boolean
    }
  ) {
    id
    username
    fullname
  }
}
```

#### removeUser
Delete a user (Admin only).

**Roles Required:** ADMIN

**Input:**
```graphql
mutation {
  removeUser(id: String!): Boolean!
}
```

### Tickets

#### createTicket
Create a new support ticket.

**Roles Required:** Authenticated

**Input:**
```graphql
mutation {
  createTicket(createTicketInput: {
    title: String!
    description: String!
    priority: TicketPriority
    category: TicketCategory
    workstationNumber: String
    assignedToId: String
  }) {
    id
    title
    status
    priority
    category
  }
}
```

#### updateTicket
Update ticket information.

**Roles Required:** Owner, Assigned Agent, or Admin

**Input:**
```graphql
mutation {
  updateTicket(
    id: String!
    updateTicketInput: {
      title: String
      description: String
      status: TicketStatus
      priority: TicketPriority
      category: TicketCategory
      assignedToId: String
      workstationNumber: String
    }
  ) {
    id
    title
    status
    assignedTo {
      fullname
    }
  }
}
```

#### removeTicket
Delete a ticket.

**Roles Required:** Creator or ADMIN

**Input:**
```graphql
mutation {
  removeTicket(id: String!): Boolean!
}
```

#### addWatcher
Add a user to watch a ticket for notifications.

**Input:**
```graphql
mutation {
  addWatcher(
    ticketId: String!
    userId: String!
  ) {
    id
    ticketId
    userId
  }
}
```

#### removeWatcher
Remove a user from watching a ticket.

**Input:**
```graphql
mutation {
  removeWatcher(
    ticketId: String!
    userId: String!
  ): Boolean!
}
```

### Comments

#### createComment
Add a comment to a ticket.

**Roles Required:** Authenticated

**Input:**
```graphql
mutation {
  createComment(createCommentInput: {
    content: String!
    ticketId: String!
    isInternal: Boolean  # Only visible to agents/admins
  }) {
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

#### updateComment
Update a comment.

**Roles Required:** Author or ADMIN

**Input:**
```graphql
mutation {
  updateComment(
    id: String!
    updateCommentInput: {
      content: String
      isInternal: Boolean
    }
  ) {
    id
    content
  }
}
```

#### removeComment
Delete a comment.

**Roles Required:** Author or ADMIN

**Input:**
```graphql
mutation {
  removeComment(id: String!): Boolean!
}
```

### Attachments

#### createAttachment
Upload a file attachment to a ticket.

**Input:**
```graphql
mutation {
  createAttachment(createAttachmentInput: {
    filename: String!
    filepath: String!
    mimetype: String!
    size: Int!
    ticketId: String!
  }) {
    id
    filename
    size
    createdAt
  }
}
```

#### removeAttachment
Delete an attachment.

**Roles Required:** Uploader or ADMIN

**Input:**
```graphql
mutation {
  removeAttachment(id: String!): Boolean!
}
```

---

## Queries

### Authentication & Users

#### me
Get current authenticated user.

**Roles Required:** Authenticated

```graphql
query {
  me {
    id
    username
    fullname
    email
    phoneNumber
    workstationNumber
    roles
    isDisabled
    createdAt
  }
}
```

#### users
Get all users.

**Roles Required:** ADMIN or AGENT

```graphql
query {
  users {
    id
    username
    fullname
    email
    roles
    isDisabled
    createdAt
  }
}
```

#### user
Get a specific user by ID.

```graphql
query {
  user(id: String!) {
    id
    username
    fullname
    email
    phoneNumber
    roles
  }
}
```

#### agents
Get all agents (users with AGENT or ADMIN role).

**Roles Required:** ADMIN or AGENT

```graphql
query {
  agents {
    id
    fullname
    email
  }
}
```

### Tickets

#### tickets
Get all tickets with optional filters.

```graphql
query {
  tickets(filters: {
    status: TicketStatus
    priority: TicketPriority
    category: TicketCategory
    assignedToId: String
    createdById: String
    search: String
  }) {
    id
    title
    description
    status
    priority
    category
    workstationNumber
    createdBy {
      id
      fullname
      email
    }
    assignedTo {
      id
      fullname
    }
    comments {
      id
      content
    }
    attachments {
      id
      filename
    }
    createdAt
    updatedAt
    resolvedAt
    closedAt
  }
}
```

#### ticket
Get a specific ticket by ID.

```graphql
query {
  ticket(id: String!) {
    id
    title
    description
    status
    priority
    category
    workstationNumber
    createdBy {
      id
      fullname
      email
    }
    assignedTo {
      id
      fullname
      email
    }
    comments {
      id
      content
      isInternal
      user {
        fullname
      }
      createdAt
    }
    attachments {
      id
      filename
      filepath
      size
      uploadedBy {
        fullname
      }
      createdAt
    }
    createdAt
    updatedAt
    resolvedAt
    closedAt
  }
}
```

#### myTickets
Get tickets created by or assigned to the current user.

**Roles Required:** Authenticated

```graphql
query {
  myTickets {
    id
    title
    status
    priority
    category
    createdAt
  }
}
```

#### ticketWatchers
Get all watchers for a ticket.

```graphql
query {
  ticketWatchers(ticketId: String!) {
    id
    ticketId
    userId
    createdAt
  }
}
```

### Comments

#### comments
Get all comments.

```graphql
query {
  comments {
    id
    content
    isInternal
    user {
      fullname
    }
    ticket {
      title
    }
    createdAt
  }
}
```

#### ticketComments
Get comments for a specific ticket.

```graphql
query {
  ticketComments(ticketId: String!) {
    id
    content
    isInternal
    user {
      id
      fullname
    }
    createdAt
  }
}
```

#### comment
Get a specific comment by ID.

```graphql
query {
  comment(id: String!) {
    id
    content
    isInternal
    user {
      fullname
    }
    ticket {
      title
    }
    createdAt
  }
}
```

### Attachments

#### attachments
Get all attachments.

```graphql
query {
  attachments {
    id
    filename
    filepath
    mimetype
    size
    ticket {
      title
    }
    uploadedBy {
      fullname
    }
    createdAt
  }
}
```

#### ticketAttachments
Get attachments for a specific ticket.

```graphql
query {
  ticketAttachments(ticketId: String!) {
    id
    filename
    filepath
    mimetype
    size
    uploadedBy {
      fullname
    }
    createdAt
  }
}
```

#### attachment
Get a specific attachment by ID.

```graphql
query {
  attachment(id: String!) {
    id
    filename
    filepath
    mimetype
    size
    ticket {
      id
      title
    }
    uploadedBy {
      fullname
    }
    createdAt
  }
}
```

### Dashboard

#### ticketStatistics
Get ticket statistics by status.

**Roles Required:** ADMIN or AGENT

```graphql
query {
  ticketStatistics {
    total: Int!
    byStatus {
      open: Int!
      inProgress: Int!
      pending: Int!
      resolved: Int!
      closed: Int!
      reopened: Int!
    }
  }
}
```

#### ticketsByPriority
Get ticket counts by priority.

**Roles Required:** ADMIN or AGENT

```graphql
query {
  ticketsByPriority {
    low: Int!
    medium: Int!
    high: Int!
    urgent: Int!
  }
}
```

#### recentActivity
Get recent tickets and comments.

**Roles Required:** ADMIN or AGENT

```graphql
query {
  recentActivity(limit: Int) {
    recentTickets {
      id
      title
      status
      priority
      createdBy {
        fullname
      }
      createdAt
    }
    recentComments {
      id
      content
      user {
        fullname
      }
      ticket {
        title
      }
      createdAt
    }
  }
}
```

#### userStatistics
Get user account statistics.

**Roles Required:** ADMIN

```graphql
query {
  userStatistics {
    total: Int!
    active: Int!
    disabled: Int!
  }
}
```

#### agentPerformance
Get performance metrics for all agents.

**Roles Required:** ADMIN or AGENT

```graphql
query {
  agentPerformance {
    agent {
      id
      fullname
      email
    }
    assigned: Int!
    resolved: Int!
    closed: Int!
    total: Int!
  }
}
```

#### ticketTrends
Get ticket creation trends over time.

**Roles Required:** ADMIN or AGENT

```graphql
query {
  ticketTrends(days: Int) {
    date: String!
    count: Int!
  }
}
```

#### averageResolutionTime
Get average time to resolve tickets (in hours).

**Roles Required:** ADMIN or AGENT

```graphql
query {
  averageResolutionTime: Float!
}
```

---

## Types

### User
```graphql
type User {
  id: ID!
  username: String!
  fullname: String!
  email: String!
  phoneNumber: String
  workstationNumber: String
  roles: [Role!]!
  isDisabled: Boolean!
  createdAt: DateTime!
  updatedAt: DateTime!
  createdTickets: [Ticket!]
  assignedTickets: [Ticket!]
  comments: [Comment!]
  attachments: [Attachment!]
}
```

### Ticket
```graphql
type Ticket {
  id: ID!
  title: String!
  description: String!
  status: TicketStatus!
  priority: TicketPriority!
  category: TicketCategory!
  workstationNumber: String
  createdById: String!
  createdBy: User!
  assignedToId: String
  assignedTo: User
  comments: [Comment!]
  attachments: [Attachment!]
  createdAt: DateTime!
  updatedAt: DateTime!
  resolvedAt: DateTime
  closedAt: DateTime
}
```

### Comment
```graphql
type Comment {
  id: ID!
  content: String!
  isInternal: Boolean!
  userId: String!
  user: User!
  ticketId: String!
  ticket: Ticket!
  createdAt: DateTime!
}
```

### Attachment
```graphql
type Attachment {
  id: ID!
  filename: String!
  filepath: String!
  mimetype: String!
  size: Int!
  ticketId: String!
  ticket: Ticket!
  uploadedById: String!
  uploadedBy: User!
  createdAt: DateTime!
}
```

### TicketWatcher
```graphql
type TicketWatcher {
  id: ID!
  ticketId: String!
  userId: String!
  createdAt: DateTime!
}
```

### AuthResponse
```graphql
type AuthResponse {
  accessToken: String!
  user: User!
}
```

---

## Enums

### Role
```graphql
enum Role {
  ADMIN   # Full system access
  AGENT   # Support agent access
  USER    # Regular user access
}
```

### TicketStatus
```graphql
enum TicketStatus {
  OPEN         # Newly created
  IN_PROGRESS  # Being worked on
  PENDING      # Waiting for response
  RESOLVED     # Issue fixed
  CLOSED       # Ticket closed
  REOPENED     # Reopened after closure
}
```

### TicketPriority
```graphql
enum TicketPriority {
  LOW     # Low priority
  MEDIUM  # Medium priority
  HIGH    # High priority
  URGENT  # Urgent, immediate attention
}
```

### TicketCategory
```graphql
enum TicketCategory {
  HARDWARE  # Hardware issues
  SOFTWARE  # Software problems
  NETWORK   # Network connectivity
  ACCESS    # Access/permissions
  EMAIL     # Email related
  PRINTER   # Printer issues
  PHONE     # Phone systems
  OTHER     # Other categories
}
```

---

## Input Types

### LoginInput
```graphql
input LoginInput {
  username: String!
  password: String!
}
```

### RegisterInput
```graphql
input RegisterInput {
  username: String!
  password: String!  # Min 8 characters
  fullname: String!
  email: String!
  phoneNumber: String
  workstationNumber: String
}
```

### CreateUserInput
```graphql
input CreateUserInput {
  username: String!
  password: String!  # Min 8 characters
  fullname: String!
  email: String!
  phoneNumber: String
  workstationNumber: String
  roles: [Role!]!
}
```

### UpdateUserInput
```graphql
input UpdateUserInput {
  username: String
  password: String
  fullname: String
  email: String
  phoneNumber: String
  workstationNumber: String
  roles: [Role]
  isDisabled: Boolean
}
```

### CreateTicketInput
```graphql
input CreateTicketInput {
  title: String!
  description: String!
  priority: TicketPriority
  category: TicketCategory
  workstationNumber: String
  assignedToId: String
}
```

### UpdateTicketInput
```graphql
input UpdateTicketInput {
  title: String
  description: String
  status: TicketStatus
  priority: TicketPriority
  category: TicketCategory
  assignedToId: String
  workstationNumber: String
}
```

### TicketFiltersInput
```graphql
input TicketFiltersInput {
  status: TicketStatus
  priority: TicketPriority
  category: TicketCategory
  assignedToId: String
  createdById: String
  search: String
}
```

### CreateCommentInput
```graphql
input CreateCommentInput {
  content: String!
  isInternal: Boolean
  ticketId: String!
}
```

### UpdateCommentInput
```graphql
input UpdateCommentInput {
  content: String
  isInternal: Boolean
}
```

### CreateAttachmentInput
```graphql
input CreateAttachmentInput {
  filename: String!
  filepath: String!
  mimetype: String!
  size: Int!
  ticketId: String!
}
```

---

## Error Handling

All errors follow GraphQL error format:

```json
{
  "errors": [
    {
      "message": "Error description",
      "extensions": {
        "code": "HTTP_STATUS_CODE"
      },
      "locations": [...],
      "path": [...]
    }
  ]
}
```

Common error codes:
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not found
- `409` - Conflict (duplicate username/email)
- `500` - Internal server error

---

## Rate Limiting

Currently no rate limiting is implemented. Consider adding rate limiting in production.

---

## Pagination

Currently not implemented. All queries return complete result sets. Consider implementing cursor-based pagination for production.

---

## Real-time Updates

WebSocket subscriptions are not currently implemented but can be added using GraphQL subscriptions for real-time ticket updates.

---

## Best Practices

1. **Always include error handling** in your client application
2. **Cache user tokens** securely (localStorage/sessionStorage)
3. **Request only needed fields** to optimize performance
4. **Use fragments** for repeated field selections
5. **Batch related queries** when possible
6. **Implement retry logic** for failed requests
7. **Validate inputs** on client side before submission

---

## Example Client Implementation

### React with Apollo Client

```typescript
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

const httpLink = createHttpLink({
  uri: 'http://localhost:4000/graphql',
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    }
  };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});
```

### JavaScript Fetch

```javascript
async function graphqlRequest(query, variables = {}) {
  const token = localStorage.getItem('token');

  const response = await fetch('http://localhost:4000/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  const result = await response.json();

  if (result.errors) {
    throw new Error(result.errors[0].message);
  }

  return result.data;
}
```
