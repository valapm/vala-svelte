<script>
  import { lmsr } from "bitcoin-predict"
  import { price } from "../store/price"
  import { onMount } from "svelte"
  import { testnet } from "../config"
  import { getCreationDate } from "../utils/pm"
  // import { navigateTo } from 'svelte-spa-router'
  import { formatUSD } from "../utils/format"
  import { parseHostname } from "../utils/url"

  import CardOption from "./CardOption.svelte"
  import MarketStatus from "./MarketStatus.svelte"
  import Tag from "./Tag.svelte"
  import OracleIcon from "./OracleIcon.svelte"

  export let market

  $: balance = {
    shares: market.market_state.shares,
    liquidity: market.market_state.liquidity
  }

  $: txid = market.marketStateByFirststateid.state.transaction.txid

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

  $: bsvVolume = market.market_state.totalSatVolume / 100000000
  $: usdVolume = bsvVolume * $price
  $: bsvLiquidity =
    lmsr.getLmsrSats({ liquidity: balance.liquidity, shares: new Array(market.options.length).fill(0) }) / 100000000
  $: usdLiquidity = bsvLiquidity * $price

  $: status = market.market_state.decided
    ? 2
    : market.market_state.market_oracles.every(oracle => oracle.committed)
    ? 1
    : 0

  $: creationDate = getCreationDate(market).toISOString()

  function round(n) {
    return Math.round(n * 100) / 100
  }

  $: oracleHostname = parseHostname(market.market_state.market_oracles[0].oracle.oracleStateByCurrentstateid.domain)
</script>

<a class="market" href="#/market/{txid}">
  <div class="header">
    <div class="tags">
      <!-- <Tag name="Other" /> -->
    </div>
    <MarketStatus {status} />
  </div>
  <div class="body">
    <h3>
      {market.resolve}
    </h3>
    <div class="options">
      {#each market.options as option, index}
        <CardOption
          {option}
          price={shares[index].usdPrice}
          probability={shares[index].probability}
          resolved={market.market_state.decided}
        />
      {/each}
    </div>
    <div class="footer">
      <div>
        <label for="volume">Volume</label>
        <div id="volume">{formatUSD(usdVolume, true)}</div>
      </div>
      <div class="oracle">
        {#if market.market_state.market_oracles[0].oracle.iconType}
          <OracleIcon oracle={market.market_state.market_oracles[0].oracle} />
        {/if}
        {oracleHostname}
      </div>
    </div>
  </div>
</a>

<style>
  .market {
    background-color: #1f2329;
    width: min(20.625rem, 100%);
    border-radius: 0.5625rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }

  .body {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  h3 {
    font-weight: 500;
    font-size: 20px;
    text-overflow: ellipsis;
    overflow: hidden;
    /* line-clamp: 2; */
    display: -webkit-box;
    -webkit-line-clamp: 4;
    -webkit-box-orient: vertical;
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .options {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .footer {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    justify-content: space-between;
    height: 1rem;
  }

  .footer > div {
    display: flex;
    gap: 0.25rem;
    align-items: center;
  }

  label {
    font-size: 0.75rem;
    opacity: 50%;
  }

  #volume {
    font-family: "Roboto Mono", sans-serif;
    font-size: 0.75rem;
  }

  .oracle {
    font-size: 0.75rem;
  }

  .oracle :global(img) {
    height: 1.7rem;
  }
</style>
