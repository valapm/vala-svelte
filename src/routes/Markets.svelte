<script>
  import { gql } from "graphql-request"
  import { gqlClient } from "../store/graphql"
  import { seed } from "../store/wallet"
  import { pm } from "bitcoin-predict"

  import InlineMarket from "../components/InlineMarket.svelte"
  import Searchbar from "../components/Searchbar.svelte"

  import SlButton from "@shoelace-style/shoelace/dist/components/button/button.js"
  import SlInput from "@shoelace-style/shoelace/dist/components/input/input.js"

  let markets = []
  let search = ""

  const versions = pm.versions.map(v => v.identifier)

  $: marketQuery = gql`
    {
      market(order_by: { market_state: { liquidity: desc } }, where: { resolve: {_ilike: "%${search}%"}, version: { _in: ${JSON.stringify(
    versions
  )}}}) {
        market_oracles_oracles {
          oracle {
            name
          }
        }
        market_state {
          satoshis
          decided
          shares
          liquidity
          decision
        }
        marketStateByFirststateid {
          transaction {
            txid
          }
        }
        resolve
        details
        options {
          name
        }
      }
    }
  `

  $: $gqlClient.request(marketQuery).then(res => (markets = res.market))
</script>

<div class="container">
  {#if $seed}
    <a href="#/create" style="width: auto"><sl-button type="primary">Create Market</sl-button></a>
  {/if}

  <Searchbar bind:value={search} />

  <div class="markets">
    {#each markets as market}
      <InlineMarket {market} />
    {/each}
  </div>
</div>

<style>
  .markets {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    align-items: center;
  }

  .container {
    gap: 1rem;
  }
</style>
