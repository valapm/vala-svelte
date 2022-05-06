<script>
  import { rabinPubKey, rabinPrivKey } from "../store/oracle"
  import { onMount } from "svelte"
  import { gqlClient } from "../utils/graphql"
  import { gql } from "graphql-request"

  import SubHeader from "../components/SubHeader.svelte"
  import OracleOverview from "../components/OracleOverview.svelte"
  import OracleHistory from "../components/OracleHistory.svelte"
  import OracleSettings from "../components/OracleSettings.svelte"

  let oracle
  let selected = 0
  let loading = true

  const oracleQuery = gql`
    query {
      oracle(where: {pubKey: {_eq: "${$rabinPubKey}"}}) {
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
    loading = false
  })
</script>

<SubHeader>
  <button class={selected === 0 ? "selected" : ""} on:click={() => (selected = 0)}>Overview</button>
  <!-- <button class={selected === 1 ? "selected" : ""} on:click={() => (selected = 1)}>History</button> -->
  <button class={selected === 2 ? "selected" : ""} on:click={() => (selected = 2)}>Settings</button>
</SubHeader>

{#if !loading}
  {#if oracle && oracle.oracleStateByCurrentstateid && oracle.oracleStateByCurrentstateid.domain}
    {#if selected === 0}
      <OracleOverview {oracle} />
    {:else if selected === 2}
      <OracleSettings bind:oracle />
    {/if}
  {:else}
    <OracleSettings bind:oracle />
  {/if}
{/if}
