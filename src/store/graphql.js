import { GraphQLClient } from "graphql-request"
import { graphqlHost } from "./options"
import { derived } from "svelte/store"

export const gqlClient = derived(graphqlHost, $graphqlHost => {
  return new GraphQLClient($graphqlHost, {
    headers: {
      "content-type": "application/json"
    }
  })
})
