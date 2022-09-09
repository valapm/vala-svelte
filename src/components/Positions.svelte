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

  function getPotentialWin(shares) {
    return round(((shares * lmsr.SatScaling) / 100000000) * $price || 0, 2)
  }

  $: console.log({
    decision: market.market_state[0].decision,
    shares: balance.shares,
    balances: balance.shares.map((s, i) => (i === market.market_state[0].decision ? getPotentialWin(s) : 0))
  })

  $: shareSatValues = market.market_state[0].decided
    ? balance.shares.map((s, i) => (i === market.market_state[0].decision ? s * lmsr.SatScaling : 0))
    : balance.shares.map((s, i) => getSharePrice(marketBalance, i, s))
  $: shareUsdValues = shareSatValues.map(sats => round((sats / 100000000) * $price))
</script>

<Table>
  <thead>
    <tr>
      <th> Outcome </th>
      <th> Qty Owned </th>
      {#if !market.market_state[0].decided}
        <!-- <th> Avg Price Paid </th> -->
        <th> Current Value </th>
        <!-- <th> P/L </th> -->
        <th>Potential Win </th>
      {:else}
        <th>Value</th>
      {/if}
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
          {#if !market.market_state[0].decided}
            <!-- <td> ? </td> -->
            <td>
              {formatUSD(shareUsdValues[index])}
            </td>
            <!-- <td> ? </td> -->
            <td>{formatUSD(getPotentialWin(shares))}</td>
          {:else}
            <td>{formatUSD(shareUsdValues[index])}</td>
          {/if}
        </tr>
      {/if}
    {/each}
  </tbody>
</Table>
