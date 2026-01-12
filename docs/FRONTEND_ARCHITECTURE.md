# Frontend Architecture Documentation

## Overview

This is a production-ready Vue 3 + Vuetify 3 frontend application for the IT Ticketing System. It features a modern, responsive design with Material Design 3 principles, complete state management, and comprehensive GraphQL integration.

## Technology Stack

### Core Framework
- **Vue 3.3+** with Composition API and `<script setup>` syntax
- **Vuetify 3.4+** for Material Design 3 components
- **Vite 5** for fast development and optimized production builds

### State & Data Management
- **Pinia** for centralized state management
- **Apollo Client** for GraphQL queries and mutations
- **Vue Router 4** for client-side routing

### Mobile & Build
- **Capacitor** for iOS/Android mobile apps
- **Vite** code splitting and lazy loading
- **Docker** with Nginx for production deployment

## Project Structure

```
frontend/
├── public/                 # Static assets
│   └── favicon.ico
├── src/
│   ├── components/         # Reusable components
│   │   ├── layout/        # App structure (AppBar, Drawer, etc.)
│   │   ├── tickets/       # Ticket components (Cards, Tables, Chips)
│   │   ├── comments/      # Comment system
│   │   └── common/        # Shared components (Stats, Upload)
│   ├── views/             # Page components (routed)
│   │   ├── LoginView.vue
│   │   ├── DashboardView.vue
│   │   ├── TicketsView.vue
│   │   ├── TicketDetailView.vue
│   │   ├── CreateTicketView.vue
│   │   ├── MyTicketsView.vue
│   │   ├── ProfileView.vue
│   │   ├── UserAdminView.vue
│   │   ├── KnowledgeBaseView.vue
│   │   └── NotFoundView.vue
│   ├── stores/            # Pinia stores
│   │   ├── auth.js       # Authentication & user session
│   │   ├── ticket.js     # Ticket state & filters
│   │   └── notification.js # Toast notifications
│   ├── router/            # Route configuration
│   │   └── index.js      # Routes & navigation guards
│   ├── plugins/           # Vue plugins
│   │   ├── vuetify.js    # Vuetify config & theme
│   │   └── apollo.js     # Apollo Client setup
│   ├── graphql/           # GraphQL operations
│   │   ├── queries.js    # All GraphQL queries
│   │   └── mutations.js  # All GraphQL mutations
│   ├── utils/             # Utilities
│   │   ├── constants.js  # App constants & enums
│   │   └── helpers.js    # Helper functions
│   ├── App.vue            # Root component
│   └── main.js            # Application entry
├── index.html             # HTML entry point
├── vite.config.js         # Vite configuration
├── package.json           # Dependencies
├── capacitor.config.ts    # Capacitor config
├── Dockerfile             # Production Docker image
├── nginx.conf             # Nginx configuration
└── .env.example           # Environment variables template
```

## Core Features

### 1. Authentication System
- JWT-based authentication
- Login with email/password
- Token stored in localStorage
- Auto-redirect on auth failure
- Route guards for protected pages

**Files**: `stores/auth.js`, `views/LoginView.vue`, `router/index.js`

### 2. Ticket Management
- Create, view, update, delete tickets
- Advanced filtering (status, priority, category)
- Search functionality
- Table and grid views
- Real-time updates with optimistic UI

**Files**: `views/TicketsView.vue`, `views/TicketDetailView.vue`, `stores/ticket.js`

### 3. Comment System
- Add comments to tickets
- Internal vs. public comments
- Edit/delete own comments
- Real-time comment threads

**Files**: `components/comments/`

### 4. User Management (Admin)
- CRUD operations for users
- Role assignment (USER, TECHNICIAN, ADMIN)
- Filter by role and status
- Activate/deactivate users

**Files**: `views/UserAdminView.vue`

### 5. Dashboard
- Statistics cards (tickets by status/priority)
- Recent tickets list
- Activity feed
- Quick actions

**Files**: `views/DashboardView.vue`

### 6. Knowledge Base
- Browse articles by category
- Search functionality
- Article viewer with tags
- Category icons and colors

**Files**: `views/KnowledgeBaseView.vue`

## State Management (Pinia)

### Auth Store (`stores/auth.js`)
```javascript
{
  // State
  token: String,
  user: Object,
  loading: Boolean,

  // Getters
  isAuthenticated: Boolean,
  isAdmin: Boolean,
  isTechnician: Boolean,
  fullName: String,

  // Actions
  setAuth(token, user),
  logout(),
  updateUser(userData)
}
```

### Ticket Store (`stores/ticket.js`)
```javascript
{
  // State
  tickets: Array,
  currentTicket: Object,
  filters: Object,

  // Getters
  filteredTickets: Array,
  ticketStats: Object,

  // Actions
  setTickets(tickets),
  updateTicket(id, updates),
  setFilters(filters)
}
```

### Notification Store (`stores/notification.js`)
```javascript
{
  // State
  show: Boolean,
  message: String,
  type: String,

  // Actions
  success(msg),
  error(msg),
  warning(msg),
  info(msg)
}
```

## GraphQL Integration

### Queries
- `GET_TICKETS` - Fetch all tickets with filters
- `GET_TICKET` - Fetch single ticket with details
- `GET_MY_TICKETS` - Fetch current user's tickets
- `GET_USERS` - Fetch all users
- `GET_TECHNICIANS` - Fetch technicians for assignment
- `ME_QUERY` - Get current user info

### Mutations
- `LOGIN_MUTATION` - Authenticate user
- `CREATE_TICKET` - Create new ticket
- `UPDATE_TICKET` - Update ticket details
- `UPDATE_TICKET_STATUS` - Change ticket status
- `ASSIGN_TICKET` - Assign ticket to technician
- `CREATE_COMMENT` - Add comment to ticket
- `CREATE_USER` - Create new user (admin)
- `UPDATE_USER` - Update user details
- `DELETE_USER` - Delete user (admin)

## Routing & Navigation Guards

### Routes
- `/login` - Public authentication page
- `/dashboard` - Protected dashboard (default)
- `/tickets` - Protected tickets list
- `/tickets/:id` - Protected ticket details
- `/tickets/create` - Protected ticket creation
- `/my-tickets` - Protected user's tickets
- `/profile` - Protected user profile
- `/knowledge-base` - Protected KB articles
- `/admin/users` - Admin-only user management

### Guards
```javascript
router.beforeEach((to, from, next) => {
  // Check authentication
  if (to.meta.requiresAuth && !isAuthenticated) {
    redirect to login
  }

  // Check admin role
  if (to.meta.requiresAdmin && !isAdmin) {
    redirect to dashboard
  }
})
```

## UI/UX Design Principles

### Material Design 3
- Modern color palette (blue/teal primary)
- Elevated cards with shadows
- Smooth transitions and animations
- Touch-friendly mobile interface

### Responsive Design
- Mobile-first approach
- Breakpoints: xs, sm, md, lg, xl
- Collapsible navigation drawer
- Adaptive layouts for all screens

### Accessibility
- WCAG 2.1 compliant
- Keyboard navigation
- Screen reader support
- High contrast ratios

### User Feedback
- Toast notifications for actions
- Loading states and skeletons
- Empty states with helpful messages
- Form validation with clear errors

## Component Patterns

### Layout Components
- **MainLayout**: Wraps pages with AppBar + Drawer
- **AppBar**: Top navigation with search, notifications, user menu
- **NavigationDrawer**: Side navigation with role-based items

### Reusable Components
- **StatsCard**: Dashboard statistics with icons
- **StatusChip**: Colored status badges
- **PriorityChip**: Colored priority badges
- **TicketCard**: Compact ticket display
- **TicketTable**: Full data table with sorting
- **CommentList**: Comment thread display
- **CommentForm**: Add/edit comments
- **AttachmentUpload**: File upload with preview

## Performance Optimizations

### Code Splitting
```javascript
// Lazy-loaded routes
component: () => import('@/views/DashboardView.vue')

// Manual chunks in vite.config.js
manualChunks: {
  'vue-vendor': ['vue', 'vue-router', 'pinia'],
  'vuetify-vendor': ['vuetify'],
  'apollo-vendor': ['@apollo/client']
}
```

### Caching Strategy
- Apollo cache for GraphQL queries
- Service worker for offline support (future)
- Nginx caching for static assets

### Bundle Size
- Tree shaking with Vite
- Gzip compression
- Optimized images
- Lazy loading routes

## Development Workflow

### Local Development
```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Environment Variables
```env
VITE_API_URL=http://localhost:4000
VITE_GRAPHQL_ENDPOINT=http://localhost:4000/graphql
```

### Code Style
- Vue 3 Composition API
- `<script setup>` syntax
- ESLint for linting
- Consistent naming conventions

## Deployment

### Docker Production
```dockerfile
# Multi-stage build
FROM node:18-alpine as build
# ... build app

FROM nginx:alpine
# ... serve with nginx
```

### Nginx Configuration
- Gzip compression
- Cache static assets
- History mode fallback
- Security headers

### Mobile Deployment
```bash
npm run build
npx cap sync
npx cap open ios/android
```

## Testing Strategy

### Unit Tests (Future)
- Component testing with Vitest
- Store testing with Pinia
- Utility function tests

### E2E Tests (Future)
- Cypress for end-to-end testing
- Critical user flows
- Cross-browser testing

## Security Considerations

### Authentication
- JWT tokens with expiration
- Secure token storage
- Auto-logout on token expiry
- HTTPS in production

### Authorization
- Role-based access control
- Route guards
- Component-level permissions
- API-level validation

### Data Protection
- XSS prevention (Vue auto-escaping)
- CSRF tokens (future)
- Secure headers (nginx)
- Input validation

## Accessibility Features

- Semantic HTML structure
- ARIA labels and roles
- Keyboard navigation
- Focus management
- Color contrast compliance
- Screen reader support

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile Safari 12+
- Android Chrome 90+

## Future Enhancements

1. **Real-time Updates**: WebSocket subscriptions for live ticket updates
2. **PWA Support**: Service workers for offline functionality
3. **Dark Mode**: Full dark theme implementation
4. **Internationalization**: Multi-language support
5. **Advanced Analytics**: Charts and reporting dashboard
6. **File Preview**: In-app preview for attachments
7. **Rich Text Editor**: WYSIWYG for ticket descriptions
8. **Drag & Drop**: Kanban board for ticket management

## Troubleshooting

### Common Issues

**Build fails with "Cannot find module"**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Apollo errors on startup**
- Check backend is running
- Verify VITE_GRAPHQL_ENDPOINT in .env

**Vuetify components not styled**
- Check vuetify plugin import
- Verify CSS imports

**Mobile build fails**
```bash
npx cap sync
npx cap doctor
```

## Contributing

1. Follow Vue 3 Composition API patterns
2. Use TypeScript for complex logic (future)
3. Write meaningful commit messages
4. Test on mobile devices
5. Update documentation

## Support & Documentation

- **Vue 3**: https://vuejs.org/
- **Vuetify 3**: https://vuetifyjs.com/
- **Apollo Client**: https://www.apollographql.com/docs/react/
- **Vite**: https://vitejs.dev/
- **Pinia**: https://pinia.vuejs.org/

---

Last Updated: January 2026
Version: 1.0.0
