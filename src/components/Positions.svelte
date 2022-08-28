<script>
  import { price } from "../store/price"
  import { getSharePrice } from "../utils/lmsr"
  import { round, formatUSD } from "../utils/format"
  import { lmsr } from "bitcoin-predict"

  import Table from "./Table.svelte"

  export let market
  export let balance

  $: marketBalance = market && {
    shares: market.market_state[0].shares,
    liquidity: market.market_state[0].liquidity
  }
  $: satPrices = marketBalance.shares.map((_, index) => getSharePrice(marketBalance, index, 1))
  $: usdPrices = satPrices.map(sats => round((sats / 100000000) * $price))

  function getPotentialWin(shares) {
    return round(((shares * lmsr.SatScaling) / 100000000) * $price || 0, 2)
  }
</script>

<Table>
  <thead>
    <tr>
      <th> Outcome </th>
      <th> Qty Owned </th>
      <!-- <th> Avg Price Paid </th> -->
      <th> Current Value </th>
      <!-- <th> P/L </th> -->
      <th>Potential Win </th>
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
          <td>{formatUSD(getPotentialWin(shares))}</td>
        </tr>
      {/if}
    {/each}
  </tbody>
</Table>
