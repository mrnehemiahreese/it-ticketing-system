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
