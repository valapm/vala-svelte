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
        }
        marketStateByFirststateid {
          transaction {
            txid
          }
        }
        resolve
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

<div class="flex w-full h-20 items-center space-x-8 p-7 justify-end">
  {#if $seed}
    <a href="#/create" class="button px-4 rounded-sm h-8 flex items-center text-lg bg-blue-500 text-white font-semibold"
      >Create Market</a
    >
  {/if}
</div>

<div class="h-screen w-full flex justify-center">
  <div class="w-2/3 h-full flex flex-col space-y-8 mt-10">
    {#await getMarkets()}
      loading...
    {:then res}
      {#each res.market as market}
        <InlineMarket {market} />
      {/each}
    {/await}
  </div>
</div>
