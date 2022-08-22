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
  // $: totalInvested = (market.market_state.satoshis * $price) / 100000000
  $: totalVolume = (market.market_state.totalSatVolume * $price) / 100000000

  $: oracleHostname = parseHostname(market.oracle.oracleStateByCurrentstateid.domain)
</script>

<div id="banner">
  <div>
    <h2>Oracle</h2>
    <div class="oracle">
      {#if market.oracle.iconType}
        <OracleIcon oracle={market.oracle} />
      {/if}
      {oracleHostname}
    </div>
  </div>
  <div>
    <h2>Total Volume</h2>
    <div>{formatUSD(totalVolume)}</div>
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
    justify-content: space-around;
    width: 100%;
    padding: 0.875rem 0;
  }

  h2 {
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.5);
  }

  #banner > div {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.3rem;
    flex-grow: 1;
  }

  #banner > div > div {
    height: 1.3rem;
    display: flex;
    gap: 0.3rem;
    align-items: center;
    height: 1.5rem;
  }

  #banner > div + div {
    border-left: 1px solid rgba(255, 255, 255, 0.5);
  }

  .oracle :global(img) {
    height: 2rem;
  }
</style>
