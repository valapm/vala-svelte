<script>
  import { pm, lmsr } from "bitcoin-predict"
  import { price } from "../store/price"
  import { round, formatUSD } from "../utils/format"

  export let market

  let version
  $: try {
    version = pm.getMarketVersion(market.version)
  } catch {}
  $: fees = version ? round(market.liquidityFee + market.creatorFee + version.options.devFee) : "?"
  $: totalInvested =
    (lmsr.getLmsrSats({ liquidity: market.market_state.liquidity, shares: market.market_state.shares }) * $price) /
    100000000
  // $: totalVolume = (market.market_state.totalSatVolume * $price) / 100000000
  $: marketOracle = market.market_state.market_oracles[0]
  $: oracleId = marketOracle.oracle.oracleStateByCurrentstateid
    ? marketOracle.oracle.oracleStateByCurrentstateid.domain
    : "????"
</script>

<div id="banner">
  <div>
    <h2>Oracle</h2>
    <div>{oracleId}</div>
  </div>
  <div>
    <h2>Total Invested</h2>
    <div>{formatUSD(totalInvested)}</div>
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
