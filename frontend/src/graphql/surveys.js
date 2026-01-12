import gql from 'graphql-tag'

export const SUBMIT_SURVEY = gql`
  mutation SubmitSurvey($input: CreateSurveyResponseInput!) {
    submitSurvey(input: $input) {
      id
      rating
      feedback
      createdAt
      ticket {
        id
        ticketNumber
        title
      }
      user {
        id
        fullname
      }
    }
  }
`

export const TICKET_SURVEY = gql`
  query TicketSurvey($ticketId: ID!) {
    ticketSurvey(ticketId: $ticketId) {
      id
      rating
      feedback
      createdAt
      ticket {
        id
        ticketNumber
      }
      user {
        id
        fullname
      }
    }
  }
`

export const AVERAGE_RATING = gql`
  query AverageRating($startDate: DateTime, $endDate: DateTime) {
    averageRating(startDate: $startDate, endDate: $endDate)
  }
`
