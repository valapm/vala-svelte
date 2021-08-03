<script>
  import { bsv } from "bitcoin-predict"
  import { gql } from "graphql-request"
  import InlineMarket from "../components/InlineMarket.svelte"
  import { gqlClient } from "../store/graphql"
  import { address, seed, satBalance } from "../store/wallet"
  import Qr from "../components/Qr.svelte"
  import Mnemonic from "../utils/mnemonic"
  import Header from "../components/Header.svelte"
  import { onMount } from "svelte"
  import { push } from "svelte-spa-router"

  const marketQuery = gql`
    {
      market(order_by: { market_state: { liquidity: desc } }) {
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
  async function getMarkets() {
    return $gqlClient.request(marketQuery)
  }

  onMount(() => {
    if (!$seed) {
      push("#/login")
    }
  })
</script>

<Header />

{#if $seed}
  <div id="create-market-button">
    <a href="#/create">Create Market</a>
  </div>
{/if}

<div class="markets">
  {#await getMarkets()}
    loading...
  {:then res}
    {#each res.market as market}
      <InlineMarket {market} />
    {/each}
  {/await}
</div>

<style>
  .markets {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    align-items: center;
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
