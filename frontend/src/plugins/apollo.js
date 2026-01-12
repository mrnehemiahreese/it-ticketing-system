import { ApolloClient, InMemoryCache, createHttpLink, from, split } from '@apollo/client/core'
import { getMainDefinition } from '@apollo/client/utilities'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { createClient } from 'graphql-ws'
import { setContext } from '@apollo/client/link/context'
import { onError } from '@apollo/client/link/error'
import { DefaultApolloClient } from '@vue/apollo-composable'

// HTTP connection to the API
const httpLink = createHttpLink({
  uri: import.meta.env.VITE_GRAPHQL_ENDPOINT || 'http://localhost:4000/graphql',
})

// WebSocket connection for subscriptions
const wsLink = new GraphQLWsLink(
  createClient({
    url: (import.meta.env.VITE_GRAPHQL_ENDPOINT || 'http://localhost:4000/graphql').replace('http', 'ws'),
    connectionParams: () => {
      const token = localStorage.getItem('auth_token')
      return {
        authToken: token ? `Bearer ${token}` : '',
      }
    },
    retryAttempts: 5,
    shouldRetry: () => true,
  })
)

// Split based on operation type
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query)
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    )
  },
  wsLink,
  httpLink
)

// Auth middleware
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('auth_token')
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  }
})

// Error handling
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path, extensions }) => {
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      )

      // Handle authentication errors
      if (extensions?.code === 'UNAUTHENTICATED') {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user')
        window.location.href = '/login'
      }
    })
  }

  if (networkError) {
    console.error(`[Network error]: ${networkError}`)
  }
})

// Cache implementation
const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        tickets: {
          merge(existing = [], incoming) {
            return incoming
          },
        },
        users: {
          merge(existing = [], incoming) {
            return incoming
          },
        },
      },
    },
  },
})

// Create Apollo Client
export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, splitLink]),
  cache,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
      errorPolicy: 'all',
    },
    query: {
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
})

// Vue plugin export - provide Apollo client for @vue/apollo-composable
export default {
  install(app) {
    app.provide(DefaultApolloClient, apolloClient)
    app.config.globalProperties.$apollo = apolloClient
  }
}
