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

    const probability = market.market_state.decided
      ? market.market_state.decision === index
        ? 1
        : 0
      : lmsr.getProbability(balance, share)

    return {
      usdPrice,
      probability
    }
  })

  $: bsvTotal = marketSats / 100000000
  $: usdTotal = bsvTotal * $price

  function round(n) {
    return Math.round(n * 100) / 100
  }
</script>

<a href="#/market/{txid}" class="market">
  <h2 class="resolve">{market.resolve}</h2>
  <div class="details">{market.details}</div>

  {#if !market.market_state.decided}
    <div>{round(bsvTotal)} BSV ({round(usdTotal)} $)</div>
  {/if}

  <div class="options">
    {#each market.options as option, index}
      <div
        class="option {market.market_state.decided ? (market.market_state.decision === index ? 'won' : 'lost') : ''}"
      >
        <h3>{option.name}</h3>
        <div class="probability">{shares[index].probability * 100}%</div>
      </div>
    {/each}
  </div>

  <div class="txid">{txid}</div>
</a>

<style>
  .market {
    padding: 0.6rem 1rem;
    background-color: white;
    border-radius: 10px;
    box-shadow: 3px 3px 5px #95959587;
    width: min(90%, 50rem);
  }

  .txid {
    font-weight: bold;
    font-size: 0.8rem;
  }
  .resolve {
    font-size: 1.5rem;
  }

  .options {
    display: flex;
    justify-content: space-around;
    margin: 1rem;
  }
  .option {
    padding: 0.4rem;
    width: 7rem;
    border-radius: 100%;
    height: 7rem;
    background-color: lightblue;
    justify-content: center;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .won {
    border: 2px solid green;
    background-color: lightgreen;
  }

  .lost {
    background-color: lightcoral;
  }
  .option h3 {
    font-size: 1.1rem;
    text-align: center;
  }

  .probability {
    font-weight: bold;
  }
</style>
