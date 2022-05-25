import { split, HttpLink, InMemoryCache, ApolloClient, DefaultOptions } from "@apollo/client/core"
import { getMainDefinition } from "@apollo/client/utilities"
import { WebSocketLink } from "@apollo/client/link/ws"

import { graphqlWsHost, graphqlHost } from "../config"

function createApolloClient() {
  const httpLink = new HttpLink({
    uri: graphqlHost
  })

  const wsLink = new WebSocketLink({
    uri: graphqlWsHost,
    options: {
      reconnect: true
    }
  })
  const link = split(
    ({ query }) => {
      const definition = getMainDefinition(query)
      return definition.kind === "OperationDefinition" && definition.operation === "subscription"
    },
    wsLink,
    httpLink
  )

  const cache = new InMemoryCache()

  // Disable cache for queries
  const defaultOptions: DefaultOptions = {
    watchQuery: {
      fetchPolicy: "no-cache",
      errorPolicy: "ignore"
    },
    query: {
      fetchPolicy: "no-cache",
      errorPolicy: "all"
    }
  }

  const client = new ApolloClient({
    link,
    cache,
    defaultOptions
  })

  return client
}

export const client = createApolloClient()
