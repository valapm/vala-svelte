<script>
  import { pm, lmsr } from "bitcoin-predict"
  import { price } from "../store/price"
  import { round, formatUSD } from "../utils/format"

  export let market

  $: fees = round(market.liquidityFee + market.creatorFee + pm.getMarketVersion(market.version).devFee)
  $: totalInvested =
    (lmsr.getLmsrSats({ liquidity: market.market_state.liquidity, shares: market.market_state.shares }) * $price) /
    100000000
  $: totalVolume = (market.market_state.totalSatVolume * $price) / 100000000

  $: props = {
    "Total Volume": formatUSD(totalVolume),
    "Total Invested": formatUSD(totalInvested),
    "Trading Fees": fees + "%"
  }
</script>

<div id="banner">
  {#each Object.entries(props) as [header, value]}
    <div>
      <h2>{header}</h2>
      <div>{value}</div>
    </div>
  {/each}
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
    padding: 0.875rem;
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

  #banner > div + div {
    border-left: 1px solid rgba(255, 255, 255, 0.5);
  }
</style>
