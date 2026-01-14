import gql from 'graphql-tag'

// Auth Queries
export const ME_QUERY = gql`
  query Me {
    me {
      id
      username
      email
      fullname
      roles
      phoneNumber
      workstationNumber
      isDisabled
      createdAt
    }
  }
`

// Ticket Queries
export const GET_TICKETS = gql`
  query GetTickets($filters: TicketFiltersInput) {
    tickets(filters: $filters) {
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
        username
      }
      assignedTo {
        id
        fullname
        email
        username
      }
      comments {
        id
      }
      attachments {
        id
      }
    }
  }
`

export const GET_TICKET = gql`
  query GetTicket($id: String!) {
    ticket(id: $id) {
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
        username
        phoneNumber
        workstationNumber
      }
      assignedTo {
        id
        fullname
        email
        username
        phoneNumber
        workstationNumber
      }
      comments {
        id
        content
        isInternal
        createdAt
        user {
          id
          fullname
          email
          username
        }
      }
      attachments {
        id
        filename
        filepath
        mimetype
        size
        createdAt
        uploadedBy {
          id
          fullname
          username
        }
      }
    }
  }
`

export const GET_MY_TICKETS = gql`
  query GetMyTickets {
    myTickets {
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
      assignedTo {
        id
        fullname
        username
      }
      comments {
        id
      }
    }
  }
`

export const GET_DASHBOARD_STATS = gql`
  query GetDashboardStats {
    ticketStatistics {
      total
      byStatus {
        open
        inProgress
        resolved
        closed
        pending
        reopened
      }
    }
  }
`

// User Queries
export const GET_USERS = gql`
  query GetUsers {
    users {
      id
      username
      email
      fullname
      roles
      phoneNumber
      workstationNumber
      isDisabled
      createdAt
    }
  }
`

export const GET_USER = gql`
  query GetUser($id: String!) {
    user(id: $id) {
      id
      username
      email
      fullname
      roles
      phoneNumber
      workstationNumber
      isDisabled
      createdAt
      assignedTickets {
        id
        ticketNumber
        title
        status
        priority
      }
      createdTickets {
        id
        ticketNumber
        title
        status
        priority
      }
    }
  }
`

export const GET_AGENTS = gql`
  query GetAgents {
    users {
      id
      fullname
      username
      email
    }
  }
`

export const GET_TECHNICIANS = gql`
  query GetTechnicians {
    users {
      id
      fullname
      username
      email
    }
  }
`

// Analytics Queries
export const GET_TICKET_STATISTICS = gql`
  query GetTicketStatistics {
    ticketStatistics {
      total
      byStatus {
        open
        inProgress
        resolved
        closed
        pending
        reopened
      }
    }
  }
`

export const GET_TICKETS_BY_PRIORITY = gql`
  query GetTicketsByPriority {
    ticketsByPriority {
      low
      medium
      high
      urgent
    }
  }
`

export const GET_AGENT_PERFORMANCE = gql`
  query GetAgentPerformance {
    agentPerformance {
      agent {
        id
        fullname
        email
      }
      assigned
      resolved
      closed
      total
    }
  }
`

export const GET_TICKET_TRENDS = gql`
  query GetTicketTrends($days: Int) {
    ticketTrends(days: $days) {
      date
      count
    }
  }
`

export const GET_AVERAGE_RESOLUTION_TIME = gql`
  query GetAverageResolutionTime {
    averageResolutionTime
  }
`

export const GET_ANALYTICS_OVERVIEW = gql`
  query GetAnalyticsOverview($days: Int) {
    ticketStatistics {
      total
      byStatus {
        open
        inProgress
        resolved
        closed
        pending
        reopened
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
        id
        fullname
        email
      }
      assigned
      resolved
      closed
      total
    }
    ticketTrends(days: $days) {
      date
      count
    }
    averageResolutionTime
  }
`
