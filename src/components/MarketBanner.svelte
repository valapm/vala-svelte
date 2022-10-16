<script>
  import { pm, lmsr } from "bitcoin-predict"
  import { price } from "../store/price"
  import { round, formatUSD } from "../utils/format"
  import { parseHostname } from "../utils/url"

  import OracleIcon from "./OracleIcon.svelte"

  export let market

  let version
  $: try {
    version = pm.getMarketVersion(market.version)
  } catch {}
  $: fees = version ? round(market.liquidityFee + market.creatorFee + version.options.devFee) : "?"
  // $: totalInvested = (market.market_state[0].satoshis * $price) / 100000000
  $: totalVolume = (market.market_state[0].totalSatVolume * $price) / 100000000
  $: tvl = (market.market_state[0].satoshis * $price) / 100000000

  $: oracleHostname = parseHostname(market.oracle.oracle_state[0].domain)
</script>

<div id="banner">
  <a href="#/oracles/{market.oracle.pubKey}">
    <h2>Oracle</h2>
    <div class="oracle">
      {#if market.oracle.iconType}
        <OracleIcon oracle={market.oracle} />
      {/if}
      {oracleHostname}
    </div>
  </a>
  <div>
    <h2>Total Volume</h2>
    <div>{formatUSD(totalVolume)}</div>
  </div>
  <div>
    <h2>Total Value Locked</h2>
    <div>{formatUSD(tvl)}</div>
  </div>
  <div>
    <h2>Trading Fees</h2>
    <div>{fees}%</div>
  </div>
</div>

<style>
  #banner {
    background-color: #323841;
    border-radius: 0.75rem;
    display: flex;
    color: white;
    font-size: 1.375rem;
    font-weight: 500;
    justify-content: space-evenly;
    width: 100%;
    padding: 0.875rem 0;
    flex-wrap: wrap;
    row-gap: 1rem;
  }

  h2 {
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.5);
    white-space: nowrap;
  }

  #banner > div,
  #banner > a {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.3rem;
    width: 9rem;
    flex-grow: 1;
    /* border-left: 1px solid rgba(255, 255, 255, 0.5);
    border-right: 1px solid rgba(255, 255, 255, 0.5); */
  }

  /* #banner:after {
    content: "";
    z-index: 1;
    background-color: #323841;
    width: 5px;
  } */

  #banner > * > div {
    height: 1.3rem;
    display: flex;
    gap: 0.3rem;
    align-items: center;
    height: 1.5rem;
  }

  #banner > div + div {
    /* border-left: 1px solid rgba(255, 255, 255, 0.5); */
  }

  .oracle :global(img) {
    height: 2rem;
  }
</style>
