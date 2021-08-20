import { GraphQLClient } from "graphql-request"
import { graphqlHost } from "../config"

export const gqlClient = new GraphQLClient(graphqlHost, {
  headers: {
    "content-type": "application/json"
  }
})
