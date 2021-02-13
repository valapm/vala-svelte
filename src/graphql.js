import { GraphQLClient } from "graphql-request"
import { GRAPHQL_HOST } from "./config"

export const gqlClient = new GraphQLClient(GRAPHQL_HOST, {
  headers: {
    "content-type": "application/json",
    "x-hasura-admin-secret": "jsljhlksjbnbsndfmsf"
  }
})
