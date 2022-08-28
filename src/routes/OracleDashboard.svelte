<script>
  import { seed } from "../store/wallet"
  import { rabinPubKey, rabinPrivKey } from "../store/oracle"
  import { onMount } from "svelte"
  import { gqlClient } from "../utils/graphql"
  import { gql } from "graphql-request"
  import { push } from "svelte-spa-router"

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
        iconType
        hasCorrectDNS
        oracleStateByFirststateid {
          state {
            transaction {
              processedAt
            }
          }
        }
        oracle_state {
          details
          domain
          state {
            transaction {
              hex
            }
            outputIndex
          }
        }
        num_open_markets: market_oracles_aggregate(where: {market_state: {market_oracles: {committed: {_eq: true}}, state: {_not: {states: {}}}, decided: {_eq: false}}}) {
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
    if (!$seed) {
      push("/login")
    }

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
  {#if oracle && oracle.oracle_state[0] && oracle.oracle_state[0].domain && oracle.hasCorrectDNS}
    {#if selected === 0}
      <OracleOverview {oracle} />
    {:else if selected === 2}
      <OracleSettings bind:oracle />
    {/if}
  {:else}
    <OracleSettings bind:oracle />
  {/if}
{/if}
