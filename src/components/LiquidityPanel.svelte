<script>
  import { price } from "../store/price"
  import { getSharePrice } from "../utils/lmsr"
  import { round, formatUSD } from "../utils/format"
  import { lmsr } from "bitcoin-predict"

  export let market
  export let entry

  $: liquidityPercent = (entry.liquidity / market.market_state.liquidity) * 100

  $: marketBalance = market && {
    shares: market.market_state.shares,
    liquidity: market.market_state.liquidity
  }

  $: liquidityBalance =
    lmsr.getLmsrSats(marketBalance) -
    lmsr.getLmsrSats({
      shares: market.market_state.shares,
      liquidity: market.market_state.liquidity - entry.liquidity
    })

  $: liquidityBalanceUSD = round((liquidityBalance / 100000000) * $price)

  $: feeChange = market.market_state.accLiquidityFeePool - entry.prevLiquidityPoolState
  $: totalLiquidityPoints = entry.liquidityPoints + feeChange * entry.liquidity
  $: earnings = (totalLiquidityPoints / market.market_state.liquidityPoints || 0) * market.market_state.liquidityFeePool

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
        {entry.liquidity} ({formatUSD(liquidityBalanceUSD)})
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
