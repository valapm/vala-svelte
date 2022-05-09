<script>
  import { publicKey } from "../store/wallet"
  import { gql } from "@apollo/client/core"
  import { query } from "svelte-apollo"

  const entryQuery = gql`
      query {
        entry(where: {investorPubKey: { _eq: "${$publicKey.toString()}"}}, order_by: {market_state: {state: {transaction: {broadcastedAt: desc}}}}) {
          liquidity
          shares
          market_state {
            liquidity
            shares
            decided
            decision
          }
        }
      }
    `
  const entries = query(entryQuery)
</script>
