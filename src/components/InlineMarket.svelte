<script>
  import { lmsr } from "bitcoin-predict"
  import { price } from "../store/price"
  import { onMount } from "svelte"
  // import { navigateTo } from 'svelte-spa-router'

  export let market

  $: balance = {
    shares: market.market_state.shares,
    liquidity: market.market_state.liquidity
  }

  $: txid = market.marketStateByFirststateid.transaction.txid

  $: marketSats = lmsr.getLmsrSats(balance)

  $: shares = market.market_state.shares.map((share, index) => {
    const newShares = [...market.market_state.shares]
    newShares[index] += 1

    const satPrice =
      lmsr.getLmsrSats({
        shares: newShares,
        liquidity: market.market_state.liquidity
      }) - lmsr.getLmsrSats(balance)

    const usdPrice = round((satPrice / 100000000) * $price)

    return {
      usdPrice,
      probability: lmsr.getProbability(balance, share)
    }
  })

  $: bsvTotal = marketSats / 100000000
  $: usdTotal = bsvTotal * $price

  function round(n) {
    return Math.round(n * 100) / 100
  }
</script>

<a href="#/market/{txid}">
  <h3>{txid}</h3>
  <div>
    <div>{market.resolve}</div>
  </div>
  <div>{round(bsvTotal)} BSV ({round(usdTotal)} $)</div>
  {#each shares as share}
    <div>{share.probability * 100}%</div>
    <div>${share.usdPrice}</div>
  {/each}
</a>
