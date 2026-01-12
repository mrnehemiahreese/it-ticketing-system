# Customer Portal

The IT Ticketing System includes a customer-facing portal with restricted access.

## Features

- **Customer Dashboard** - Personal ticket overview with stats
- **Ticket Management** - Create and track support requests
- **Knowledge Base** - Self-service articles and solutions
- **Satisfaction Surveys** - Post-resolution feedback

## Access Control

| Role | Access |
|------|--------|
| USER | Portal only - sees own tickets |
| AGENT | Full system + can view as customer |
| ADMIN | Full system + user management |

## Customer Dashboard

After login, USER role accounts see:
- Open/In Progress/Resolved ticket counts
- Recent tickets list
- Quick actions (New Ticket, Knowledge Base)

## Agent "View as Customer" 

Agents and admins can toggle customer view to preview the portal experience:
1. Click profile menu
2. Toggle "View as Customer"
3. Navigate portal as customer would

## Technical Notes

### Customer Filtering
- `portalDashboard` query returns only current user's tickets
- `myTickets` query filtered by `requesterId`
- Knowledge base articles visible to all

### Routing
- `/portal/*` routes for customer views
- Standard routes (`/dashboard`, `/tickets`) for agents
- Auto-redirect based on role after login
