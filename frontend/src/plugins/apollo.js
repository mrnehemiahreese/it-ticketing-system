import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client/core'
import { setContext } from '@apollo/client/link/context'
import { onError } from '@apollo/client/link/error'
import { DefaultApolloClient } from '@vue/apollo-composable'

// HTTP connection to the API
const httpLink = createHttpLink({
  uri: import.meta.env.VITE_GRAPHQL_ENDPOINT || 'http://localhost:4000/graphql',
})

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
  link: from([errorLink, authLink, httpLink]),
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
