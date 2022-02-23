<script>
  import { onMount } from "svelte"
  import { gql } from "graphql-request"
  import { gqlClient } from "../utils/graphql"

  import OracleOverview from "../components/OracleOverview.svelte"

  export let params

  let oracle

  const oracleQuery = gql`
    query {
      oracle(where: {pubKey: {_eq: "${params.rabinPubKey}"}}) {
        pubKey
        hasCorrectDNS
        oracle_state {
          state {
            transaction {
              processedAt
            }
          }
        }
        oracleStateByCurrentstateid {
          details
          domain
          state {
            transaction {
              hex
            }
            outputIndex
          }
        }
        num_open_markets: market_oracles_aggregate(where: {market_state: {state: {_not: {states: {}}}, decided: {_eq: false}}}) {
          aggregate {
            count
          }
        }
        num_resolved_markets: market_oracles_aggregate(where: {market_state: {state: {_not: {states: {}}}, decided: {_eq: true}}}) {
          aggregate {
            count
          }
        }
      }
    }`

  onMount(async () => {
    const oracleData = await gqlClient.request(oracleQuery)
    oracle = oracleData.oracle[0]
  })
</script>

{#if oracle}
  <OracleOverview {oracle} />
{/if}
