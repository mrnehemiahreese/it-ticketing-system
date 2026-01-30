import { ApolloClient, InMemoryCache, createHttpLink, from, split } from '@apollo/client/core'
import { getMainDefinition } from '@apollo/client/utilities'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { createClient } from 'graphql-ws'
import { setContext } from '@apollo/client/link/context'
import { onError } from '@apollo/client/link/error'
import { DefaultApolloClient } from '@vue/apollo-composable'

// Build the GraphQL HTTP URL
const graphqlEndpoint = import.meta.env.VITE_GRAPHQL_ENDPOINT || '/graphql'

// HTTP connection to the API
const httpLink = createHttpLink({
  uri: graphqlEndpoint,
})

// Build WebSocket URL - handle both absolute and relative URLs
function getWsUrl() {
  const endpoint = graphqlEndpoint
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint.replace(/^http/, 'ws')
  }
  // Relative URL - build absolute ws:// URL from current location
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  const host = window.location.host
  return protocol + '//' + host + endpoint
}

// WebSocket connection for subscriptions
const wsLink = new GraphQLWsLink(
  createClient({
    url: getWsUrl,
    connectionParams: () => {
      const token = localStorage.getItem('auth_token')
      return {
        authToken: token ? 'Bearer ' + token : '',
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
      authorization: token ? 'Bearer ' + token : '',
    },
  }
})

// Error handling
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path, extensions }) => {
      console.error(
        '[GraphQL error]: Message: ' + message + ', Location: ' + locations + ', Path: ' + path
      )

      if (extensions?.code === 'UNAUTHENTICATED') {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user')
        window.location.href = '/login'
      }
    })
  }

  if (networkError) {
    console.error('[Network error]: ' + networkError)
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
