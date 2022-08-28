<script lang="ts">
  import { gql } from "graphql-request"
  import { gqlClient } from "../utils/graphql"
  import { push } from "svelte-spa-router"
  import { fade } from "svelte/transition"

  import OracleCard from "../components/OracleCard.svelte"
  import Searchbar from "../components/Searchbar.svelte"

  $: oracleQuery = gql`
    {
      oracle(order_by: { market_oracles_aggregate: {count: desc} }, where: { hasCorrectDNS: {_eq: true}, oracle_state: {_or: [{ domain: {_ilike: "%${search}%"}}, {details: {_ilike: "%${search}%"}}]}}) {
        pubKey
        oracle_state {
          domain
          details
        }
        iconType
        oracleStateByFirststateid {
          state {
            transaction {
              processedAt
            }
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
    }
  `

  let search = ""

  $: oracles = []
  $: gqlClient.request(oracleQuery).then(res => (oracles = res.oracle))
</script>

<div id="oracles">
  <Searchbar bind:value={search} placeholder="Search Oracles" />
  <div class="oracle-list">
    {#each oracles as oracle}
      <OracleCard {oracle} on:click={() => push("#/oracles/" + oracle.pubKey)} />
    {/each}
  </div>
</div>

<style>
  #oracles {
    gap: 3.0625rem;
    margin-top: 5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: min(65rem, 95%);
  }

  .oracle-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;
  }

  .oracle-list > :global(div) {
    cursor: pointer;
  }
</style>
