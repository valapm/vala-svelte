<script>
  import { lmsr } from "bitcoin-predict"
  import { price } from "../store/price"
  import { onMount } from "svelte"
  // import { navigateTo } from 'svelte-spa-router'

  export let market

  let sharesFor = 0
  let sharesAgainst = 0

  $: balance = {
    sharesFor: market.sharesFor,
    sharesAgainst: market.sharesAgainst,
    liquidity: market.liquidity
  }

  $: marketSats = lmsr.getLmsrSats(balance)
  $: probability = lmsr.getProbability(balance)

  $: newBalanceSharesFor = { ...balance, sharesFor: balance.sharesFor + sharesFor }
  $: newBalanceSharesAgainst = { ...balance, sharesAgainst: balance.sharesAgainst + sharesAgainst }

  $: priceSharesFor = lmsr.getLmsrSats(newBalanceSharesFor) - lmsr.getLmsrSats(balance)
  $: priceSharesAgainst = lmsr.getLmsrSats(newBalanceSharesAgainst) - lmsr.getLmsrSats(balance)

  $: priceForUSD = round((priceSharesFor / 100000000) * $price)
  $: priceAgainstUSD = round((priceSharesAgainst / 100000000) * $price)

  $: console.log($price)

  $: bsvTotal = marketSats / 100000000
  $: usdTotal = bsvTotal * $price

  function round(n) {
    return Math.round(n * 100) / 100
  }

  // onMount(async () => {
  //   console.log($price)
  // })
</script>

<a href="#/market/{market.firstTxTxid}">
  <div>
    <div class="w-full px-3 border-blue-600 border-2 rounded-lg p-2">
      <h3 class="font-semibold text-blue-900 w-full">{market.firstTxTxid}</h3>
      <div class="flex items-center justify-between">
        <div class="text-xl">{market.resolve}</div>
        <div class="font-bold text-5xl">{probability * 100}%</div>
      </div>
      <div class="">{round(bsvTotal)} BSV ({round(usdTotal)} $)</div>
    </div>
  </div>
</a>
