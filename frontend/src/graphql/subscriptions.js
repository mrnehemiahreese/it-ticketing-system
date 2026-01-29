import gql from 'graphql-tag'

export const TICKET_UPDATED_SUBSCRIPTION = gql`
  subscription TicketUpdated($ticketId: String!) {
    ticketUpdated(ticketId: $ticketId) {
      id
      ticketNumber
      title
      description
      status
      priority
      category
      workstationNumber
      source
      contactEmail
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

export const COMMENT_ADDED_SUBSCRIPTION = gql`
  subscription CommentAdded($ticketId: String!) {
    commentAdded(ticketId: $ticketId) {
      id
      content
      isInternal
      createdAt
      updatedAt
      user {
        id
        fullname
        email
        username
      }
    }
  }
`

export const NEW_TICKET_SUBSCRIPTION = gql`
  subscription NewTicket {
    newTicket {
      id
      ticketNumber
      title
      description
      status
      priority
      category
      workstationNumber
      source
      contactEmail
      createdAt
      updatedAt
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
