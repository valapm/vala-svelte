import { asyncReadable, AsyncReadable } from "svelte-async-readable"
import { gql } from "graphql-request"
import { gqlClient } from "../utils/graphql"

async function getPrice(): Promise<number> {
  const query = gql`
    query {
      price_snapshot(order_by: { timestamp: desc }, limit: 1) {
        blockchair
        okex
      }
    }
  `

  const res = await gqlClient.request(query)
  const snapshot = res.price_snapshot[0]

  if (!snapshot) throw new Error("Failed to fetch price")

  return snapshot.blockchair || snapshot.okex
}

export const price: AsyncReadable<number> = asyncReadable({
  dataProvider: getPrice,
  initialValue: 0
})
