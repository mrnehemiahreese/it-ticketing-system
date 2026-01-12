import gql from 'graphql-tag'

export const CUSTOMER_DASHBOARD = gql`
  query CustomerDashboard {
    customerDashboard {
      stats {
        totalTickets
        openTickets
        inProgressTickets
        resolvedTickets
        closedTickets
        avgResponseTime
        avgResolutionTime
      }
      recentTickets {
        id
        ticketNumber
        title
        status
        priority
        category
        createdAt
        updatedAt
        createdBy {
          id
          fullname
        }
        assignedTo {
          id
          fullname
        }
      }
      popularArticles {
        id
        title
        category
        views
        tags
      }
    }
  }
`

export const CUSTOMER_TICKETS = gql`
  query CustomerTickets($status: TicketStatus, $priority: TicketPriority, $limit: Int, $offset: Int) {
    customerTickets(status: $status, priority: $priority, limit: $limit, offset: $offset) {
      id
      ticketNumber
      title
      description
      status
      priority
      category
      workstationNumber
      createdAt
      updatedAt
      resolvedAt
      closedAt
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
        createdAt
        user {
          id
          fullname
        }
      }
    }
  }
`
