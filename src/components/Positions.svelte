<script>
  import { price } from "../store/price"
  import { getSharePrice } from "../utils/lmsr"
  import { round, formatUSD } from "../utils/format"

  export let market
  export let balance

  $: marketBalance = market && {
    shares: market.market_state.shares,
    liquidity: market.market_state.liquidity
  }
  $: satPrices = marketBalance.shares.map((_, index) => getSharePrice(marketBalance, index, 1))
  $: usdPrices = satPrices.map(sats => round((sats / 100000000) * $price))
</script>

<table id="positions">
  <thead>
    <tr>
      <th> Outcome </th>
      <th> Qty Owned </th>
      <th> Avg Price Paid </th>
      <th> Current Value </th>
      <th> P/L </th>
    </tr>
  </thead>

  <tbody>
    {#each balance.shares as shares, index}
      {#if shares > 0}
        <tr>
          <td>
            {market.options[index].name}
          </td>
          <td>
            {shares}
          </td>
          <td> ? </td>
          <td>
            {formatUSD(usdPrices[index] * shares)}
          </td>
          <td> ? </td>
        </tr>
      {/if}
    {/each}
  </tbody>
</table>

<style>
  #positions {
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
