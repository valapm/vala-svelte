<script>
  import { gql } from "graphql-request"
  import { gqlClient } from "../store/graphql"
  import { seed } from "../store/wallet"

  import Header from "../components/Header.svelte"
  import InlineMarket from "../components/InlineMarket.svelte"
  import Searchbar from "../components/Searchbar.svelte"

  let markets = []
  let search = ""

  $: marketQuery = gql`
    {
      market(order_by: { market_state: { liquidity: desc } }, where: { resolve: {_ilike: "%${search}%"}}) {
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
</script>

<Header />

<div class="container">
  {#if $seed}
    <div id="create-market-button">
      <a href="#/create">Create Market</a>
    </div>
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

  #create-market-button {
    display: flex;
    justify-content: right;
    margin: 0rem 2rem;
  }

  #create-market-button > a {
    color: white;
    padding: 0.3rem 0.5rem;
    background-color: #1b3fbc;
    border-radius: 6px;
    font-weight: bold;
  }
</style>
