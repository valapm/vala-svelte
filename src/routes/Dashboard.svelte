<script>
  import { gql } from "graphql-request"
  import { gqlClient } from "../store/graphql"
  import { seed } from "../store/wallet"
  import { onMount } from "svelte"

  import Header from "../components/Header.svelte"
  import InlineMarket from "../components/InlineMarket.svelte"

  import SlButton from "@shoelace-style/shoelace/dist/components/button/button.js"
  import SlInput from "@shoelace-style/shoelace/dist/components/input/input.js"

  let markets = []
  let search = ""
  let search_input

  $: marketQuery = gql`
    {
      market(order_by: { market_state: { liquidity: desc } }, where: { resolve: {_ilike: "%${search}%"}}) {
        market_oracles_oracles {
          oracle {
            name
          }
        }
        market_state {
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

  onMount(() => {
    search_input.addEventListener("sl-input", () => {
      search = search_input.value
    })
  })
</script>

<Header />

<div class="container">
  {#if $seed}
    <a href="#/create" style="width: auto"><sl-button type="primary">Create Market</sl-button></a>
  {/if}

  <sl-input placeholder="Search" bind:this={search_input} value={search} />

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
