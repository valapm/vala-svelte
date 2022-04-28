import { GraphQLClient, GraphQLWebSocketClient } from "graphql-request"
import { graphqlHost } from "../config"
import { GRAPHQL_TRANSPORT_WS_PROTOCOL, createClient } from "graphql-ws"

export const gqlClient = new GraphQLClient(graphqlHost, {
  headers: {
    "content-type": "application/json"
  }
})

export async function createWSClient() {
  return new Promise(resolve => {
    const socket = new WebSocket("ws://localhost:8081/v1/graphql", GRAPHQL_TRANSPORT_WS_PROTOCOL)
    const client = new GraphQLWebSocketClient(socket, { onAcknowledged: async () => resolve(client) })
  })
}
