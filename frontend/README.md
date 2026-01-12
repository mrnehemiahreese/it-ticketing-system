# IT Ticketing System - Frontend

Modern, production-ready Vue 3 + Vuetify 3 frontend for the IT ticketing system.

## Features

- **Modern Stack**: Vue 3 Composition API, Vuetify 3 Material Design 3, Vite
- **GraphQL**: Apollo Client for efficient data fetching
- **State Management**: Pinia stores for auth, tickets, and notifications
- **Responsive Design**: Mobile-first design with Vuetify components
- **Authentication**: JWT-based auth with route guards
- **Role-Based Access**: Different features for USER, TECHNICIAN, and ADMIN roles
- **Mobile Support**: Capacitor integration for iOS and Android
- **Production Ready**: Docker support, optimized builds, Nginx configuration

## Technology Stack

- **Vue 3.3+** - Progressive JavaScript framework
- **Vuetify 3.4+** - Material Design component framework
- **Vite 5** - Next generation frontend tooling
- **Apollo Client** - GraphQL client
- **Pinia** - State management
- **Vue Router 4** - Official router
- **Chart.js** - Data visualization
- **Capacitor** - Cross-platform mobile apps

## Prerequisites

- Node.js 18+ and npm/yarn
- Backend API running on http://localhost:4000

## Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Update .env with your API endpoint
```

## Development

```bash
# Start development server
npm run dev

# Open browser at http://localhost:3000
```

## Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Docker Deployment

```bash
# Build Docker image
docker build -t it-ticketing-frontend .

# Run container
docker run -p 80:80 it-ticketing-frontend
```

## Mobile Development

```bash
# Add platforms
npx cap add ios
npx cap add android

# Build and sync
npm run build
npx cap sync

# Open in IDE
npx cap open ios
npx cap open android
```

## Project Structure

```
src/
├── components/          # Reusable Vue components
│   ├── layout/         # Layout components (AppBar, Drawer, etc.)
│   ├── tickets/        # Ticket-related components
│   ├── comments/       # Comment components
│   └── common/         # Shared components
├── views/              # Page components
├── stores/             # Pinia stores
├── router/             # Vue Router configuration
├── plugins/            # Vuetify, Apollo plugins
├── graphql/            # GraphQL queries and mutations
├── utils/              # Helper functions and constants
└── main.js             # Application entry point
```

## Features by Role

### All Users
- View and create tickets
- Add comments and attachments
- View own tickets
- Update profile
- Browse knowledge base

### Technicians
- All user features
- View all tickets
- Assign tickets to self
- Update ticket status
- Add internal comments

### Administrators
- All technician features
- User management (CRUD)
- Assign tickets to others
- Access to all system features
- View all statistics

## Available Pages

- `/login` - Authentication
- `/dashboard` - Statistics and overview
- `/tickets` - All tickets with filters
- `/tickets/:id` - Ticket details
- `/tickets/create` - Create new ticket
- `/my-tickets` - User's created tickets
- `/knowledge-base` - Help articles
- `/profile` - User settings
- `/admin/users` - User management (Admin only)

## Environment Variables

```env
VITE_API_URL=http://localhost:4000
VITE_GRAPHQL_ENDPOINT=http://localhost:4000/graphql
VITE_WS_ENDPOINT=ws://localhost:4000/graphql
VITE_APP_NAME=IT Ticketing System
VITE_APP_VERSION=1.0.0
```

## Key Components

### Stores (Pinia)
- **authStore** - Authentication, user session
- **ticketStore** - Ticket state, filters
- **notificationStore** - Toast notifications

### GraphQL Operations
- All queries in `src/graphql/queries.js`
- All mutations in `src/graphql/mutations.js`
- Apollo Client configured with auth headers

### Routing
- Route guards for authentication
- Admin-only routes
- Automatic redirects

## Customization

### Theme
Edit `src/plugins/vuetify.js` to customize colors and theme:

```javascript
const lightTheme = {
  colors: {
    primary: '#1976D2',
    secondary: '#26A69A',
    // ... customize colors
  }
}
```

### Constants
Edit `src/utils/constants.js` for ticket statuses, priorities, categories, etc.

## Performance Optimizations

- Code splitting with Vite
- Lazy-loaded routes
- Optimistic UI updates
- Query caching with Apollo
- Compressed assets (Gzip)
- Image optimization

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- iOS Safari 12+
- Android Chrome

## License

Proprietary - All rights reserved

## Support

For issues and questions, create a ticket in the system or contact IT support.
