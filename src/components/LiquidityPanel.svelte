<script>
  import { price } from "../store/price"
  import { getSharePrice } from "../utils/lmsr"
  import { round, formatUSD } from "../utils/format"
  import { lmsr, pm } from "bitcoin-predict"

  export let market
  export let entry

  $: liquidity = entry && entry.liquidity ? entry.liquidity : 0
  $: liquidityPoints = entry && entry.liquidityPoints ? entry.liquidityPoints : 0

  $: liquidityPercent = (liquidity / market.market_state[0].liquidity) * 100

  $: marketBalance = market && {
    shares: market.market_state[0].shares,
    liquidity: market.market_state[0].liquidity
  }

  $: marketVersion = pm.getMarketVersion(market.version)

  $: liquidityBalance =
    liquidity &&
    pm.getLiquiditySatBalance(
      { shares: market.market_state[0].shares, liquidity: market.market_state[0].liquidity },
      {
        decided: market.market_state[0].decided,
        decision: market.market_state[0].decision,
        liquidityFeePool: market.market_state[0].liquidityFeePool
      },
      market.market_state[0].satoshis,
      liquidity,
      marketVersion
    )

  $: liquidityBalanceUSD = round((liquidityBalance / 100000000) * $price)

  $: feeChange =
    entry && entry.prevLiquidityPoolState
      ? market.market_state[0].accLiquidityFeePool - entry.prevLiquidityPoolState
      : 0
  $: totalLiquidityPoints = liquidityPoints + feeChange * liquidity
  $: earnings =
    (totalLiquidityPoints / market.market_state[0].liquidityPoints || 0) * market.market_state[0].liquidityFeePool

  $: earningUSD = earnings ? round((earnings / 100000000) * $price) : 0
</script>

<table id="liquidityPanel">
  <thead>
    <tr>
      <th> Balance </th>
      <th> Share </th>
      <th> Earned Liquidity Tokens </th>
    </tr>
  </thead>

  <tbody>
    <tr>
      <td>
        {liquidity} ({formatUSD(liquidityBalanceUSD)})
      </td>
      <td>
        {liquidityPercent}
      </td>
      <td>
        {totalLiquidityPoints}
        {#if earningUSD}({formatUSD(earningUSD)}){/if}</td
      >
    </tr>
  </tbody>
</table>

<style>
  #liquidityPanel {
    width: 100%;
    border-radius: 0.375rem;
    border: 1px solid #60616d;
    background-color: #272c33;
    border-collapse: separate;
    font-size: 0.875rem;
    border-spacing: 0;
    overflow: hidden;
  }

  thead {
    background-color: #323841;
  }

  th {
    font-weight: 500;
  }

  td {
    font-weight: 400;
  }

  th,
  td {
    padding: 0.875rem;
    text-align: left;
  }

  th:first-of-type,
  td:first-of-type {
    min-width: 10rem;
  }
</style>
