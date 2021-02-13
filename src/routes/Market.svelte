<script>
  import { lmsr } from "bitcoin-predict"
  import { price } from "../store/price"
  import { gql } from "graphql-request"
  import { gqlClient } from "../graphql"
  import { onMount } from "svelte"

  export let currentRoute

  let sharesFor = 0
  let sharesAgainst = 0

  const marketQuery = gql`
    {
      market(where: { firstTxTxid: { _eq: "${currentRoute.namedParams.firstTxTxid}" } }) {
        decided
        firstTxTxid
        resolve
        sharesFor
        sharesAgainst
        liquidity
        entries {
          liquidity
          sharesAgainst
          sharesFor
          pubKey
        }
      }
    }
  `

  let market
  let marketPromise

  async function getMarket() {
    const res = await gqlClient.request(marketQuery)
    return res.market[0]
  }

  $: balance = {
    sharesFor: market ? market.sharesFor : 0,
    sharesAgainst: market ? market.sharesAgainst : 0,
    liquidity: market ? market.liquidity : 0
  }

  $: marketSats = lmsr.getLmsrSats(balance)
  $: probability = lmsr.getProbability(balance)

  $: newBalanceSharesFor = { ...balance, sharesFor: balance.sharesFor + sharesFor }
  $: newBalanceSharesAgainst = { ...balance, sharesAgainst: balance.sharesAgainst + sharesAgainst }

  $: priceSharesFor = lmsr.getLmsrSats(newBalanceSharesFor) - lmsr.getLmsrSats(balance)
  $: priceSharesAgainst = lmsr.getLmsrSats(newBalanceSharesAgainst) - lmsr.getLmsrSats(balance)

  $: priceForUSD = round((priceSharesFor / 100000000) * $price)
  $: priceAgainstUSD = round((priceSharesAgainst / 100000000) * $price)

  $: bsvTotal = marketSats / 100000000
  $: usdTotal = bsvTotal * $price

  function round(n) {
    return Math.round(n * 100) / 100
  }

  onMount(async () => {
    marketPromise = getMarket()
    market = await marketPromise
  })
</script>

{#if market}
  <div>
    <h3 class="font-semibold text-blue-900 w-full">{market.firstTxTxid}</h3>
    <div class="flex items-center justify-between">
      <div class="text-xl">{market.resolve}</div>
      <div class="font-bold text-5xl">{probability * 100}%</div>
    </div>
    <div class="">{round(bsvTotal)} BSV ({round(usdTotal)} $)</div>
    <div class="flex w-full justify-around mt-2">
      <div class="flex items-center space-x-3">
        <input type="number" bind:value={sharesFor} class="py-1 border-2 border-blue-600 rounded-md w-20" min="0" />
        <div>
          {#if sharesFor}
            {priceForUSD} $
          {/if}
        </div>
        <button class="button bg-blue-500 text-white py-1 px-3 rounded-md">Buy For</button>
      </div>
      <div class="flex items-center space-x-3">
        <input
          type="number"
          bind:value={sharesAgainst}
          class="py-1 border-2 border-blue-600 rounded-md mr-3 w-20"
          min="0"
        />
        <div>
          {#if sharesAgainst}
            {priceAgainstUSD} $
          {/if}
        </div>
        <button class="button bg-blue-500 text-white py-1 px-3 rounded-md">Buy Against</button>
      </div>
    </div>
  </div>
{:else}
  loading...
{/if}
