import gql from 'graphql-tag'

// Auth Mutations
export const LOGIN_MUTATION = gql`
  mutation Login($username: String!, $password: String!) {
    login(loginInput: { username: $username, password: $password }) {
      accessToken
      user {
        id
        username
        email
        fullname
        roles
        phoneNumber
        workstationNumber
      }
    }
  }
`

export const REGISTER_MUTATION = gql`
  mutation Register($input: CreateUserInput!) {
    register(input: $input) {
      access_token
      user {
        id
        email
        firstName
        lastName
        role
      }
    }
  }
`

// Ticket Mutations
export const CREATE_TICKET = gql`
  mutation CreateTicket($createTicketInput: CreateTicketInput!) {
    createTicket(createTicketInput: $createTicketInput) {
      id
      ticketNumber
      title
      description
      status
      priority
      category
      workstationNumber
      createdAt
      createdBy {
        id
        fullname
      }
    }
  }
`

export const UPDATE_TICKET = gql`
  mutation UpdateTicket($id: String!, $updateTicketInput: UpdateTicketInput!) {
    updateTicket(id: $id, updateTicketInput: $updateTicketInput) {
      id
      ticketNumber
      title
      description
      status
      priority
      category
      workstationNumber
      updatedAt
      resolvedAt
      closedAt
      assignedTo {
        id
        fullname
      }
    }
  }
`

export const ASSIGN_TICKET = gql`
  mutation AssignTicket($ticketId: String!, $userId: String!) {
    assignTicket(ticketId: $ticketId, userId: $userId) {
      id
      assignedTo {
        id
        fullname
        email
      }
    }
  }
`

export const UPDATE_TICKET_STATUS = gql`
  mutation UpdateTicketStatus($id: String!, $updateTicketInput: UpdateTicketInput!) {
    updateTicket(id: $id, updateTicketInput: $updateTicketInput) {
      id
      status
      resolvedAt
      closedAt
    }
  }
`

export const DELETE_TICKET = gql`
  mutation DeleteTicket($id: String!) {
    deleteTicket(id: $id) {
      id
    }
  }
`

export const ADD_WATCHER = gql`
  mutation AddWatcher($ticketId: String!, $userId: String!) {
    addWatcher(ticketId: $ticketId, userId: $userId) {
      id
      watchers {
        id
        fullname
        email
      }
    }
  }
`

export const REMOVE_WATCHER = gql`
  mutation RemoveWatcher($ticketId: String!, $userId: String!) {
    removeWatcher(ticketId: $ticketId, userId: $userId) {
      id
      watchers {
        id
        fullname
        email
      }
    }
  }
`

// Comment Mutations
export const CREATE_COMMENT = gql`
  mutation CreateComment($createCommentInput: CreateCommentInput!) {
    createComment(createCommentInput: $createCommentInput) {
      id
      content
      isInternal
      createdAt
      user {
        id
        fullname
        email
      }
      ticket {
        id
      }
    }
  }
`

export const UPDATE_COMMENT = gql`
  mutation UpdateComment($id: String!, $input: UpdateCommentInput!) {
    updateComment(id: $id, updateCommentInput: $updateCommentInput) {
      id
      content
      isInternal
      updatedAt
    }
  }
`

export const DELETE_COMMENT = gql`
  mutation DeleteComment($id: String!) {
    deleteComment(id: $id) {
      id
    }
  }
`

// Attachment Mutations
export const CREATE_ATTACHMENT = gql`
  mutation CreateAttachment($createAttachmentInput: CreateAttachmentInput!) {
    createAttachment(createAttachmentInput: $createAttachmentInput) {
      id
      filename
      filepath
      mimetype
      size
      createdAt
      uploadedBy {
        id
        fullname
      }
    }
  }
`

export const DELETE_ATTACHMENT = gql`
  mutation DeleteAttachment($id: String!) {
    deleteAttachment(id: $id) {
      id
    }
  }
`

// User Mutations
export const CREATE_USER = gql`
  mutation CreateUser($createUserInput: CreateUserInput!) {
    createUser(createUserInput: $createUserInput) {
      id
      email
      username
      fullname
      roles
      phoneNumber
      workstationNumber
      isDisabled
    }
  }
`

export const UPDATE_USER = gql`
  mutation UpdateUser($id: String!, $updateUserInput: UpdateUserInput!) {
    updateUser(id: $id, updateUserInput: $updateUserInput) {
      id
      email
      username
      fullname
      roles
      phoneNumber
      workstationNumber
      isDisabled
    }
  }
`

export const DELETE_USER = gql`
  mutation DeleteUser($id: String!) {
    deleteUser(id: $id) {
      id
    }
  }
`

export const UPDATE_PROFILE = gql`
  mutation UpdateProfile($updateUserInput: UpdateUserInput!) {
    updateProfile(updateUserInput: $updateUserInput) {
      id
      email
      username
      fullname
      phoneNumber
      workstationNumber
    }
  }
`

export const CHANGE_PASSWORD = gql`
  mutation ChangePassword($oldPassword: String!, $newPassword: String!) {
    changePassword(oldPassword: $oldPassword, newPassword: $newPassword) {
      success
      message
    }
  }
`
