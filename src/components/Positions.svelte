<script>
  import { price } from "../store/price"
  import { getSharePrice } from "../utils/lmsr"
  import { round, formatUSD } from "../utils/format"

  import Table from "./Table.svelte"

  export let market
  export let balance

  $: marketBalance = market && {
    shares: market.market_state.shares,
    liquidity: market.market_state.liquidity
  }
  $: satPrices = marketBalance.shares.map((_, index) => getSharePrice(marketBalance, index, 1))
  $: usdPrices = satPrices.map(sats => round((sats / 100000000) * $price))
</script>

<Table>
  <thead>
    <tr>
      <th> Outcome </th>
      <th> Qty Owned </th>
      <!-- <th> Avg Price Paid </th> -->
      <th> Current Value </th>
      <!-- <th> P/L </th> -->
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
          <!-- <td> ? </td> -->
          <td>
            {formatUSD(usdPrices[index] * shares)}
          </td>
          <!-- <td> ? </td> -->
        </tr>
      {/if}
    {/each}
  </tbody>
</Table>
