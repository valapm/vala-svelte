<script lang="ts">
  import { lmsr } from "bitcoin-predict"
  import { price } from "../store/price"
  import { getSharePrice } from "../utils/lmsr"
  import { round } from "../utils/format"
  import { seed } from "../store/wallet"
  import { createEventDispatcher } from "svelte"

  import SlFormatNumber from "@shoelace-style/shoelace/dist/components/format-number/format-number"
  import SlButton from "@shoelace-style/shoelace/dist/components/button/button.js"
  import SlButtonGroup from "@shoelace-style/shoelace/dist/components/button-group/button-group.js"

  export let market
  export let balance

  const dispatch = createEventDispatcher()

  $: marketBalance = market && {
    shares: market.market_state.shares,
    liquidity: market.market_state.liquidity
  }

  $: probabilities = marketBalance.shares.map(shares => lmsr.getProbability(marketBalance, shares))
  $: satPrices = marketBalance.shares.map((_, index) => getSharePrice(marketBalance, index, 1))
  $: usdPrices = satPrices.map(sats => round((sats / 100000000) * $price))
  $: potentials = satPrices.map(sats => lmsr.SatScaling / sats)
  $: satBalances = balance.shares.map(shares => shares * lmsr.SatScaling)
  $: usdBalances = satBalances.map(sats => round((sats / 100000000) * $price))
</script>

<sl-card class="outcomes">
  <div slot="header">Outcomes</div>
  <table>
    <tr>
      <th>Name</th>
      <th>Price</th>
      <th>Probability</th>
      <th>Potential X</th>
      {#if $seed}
        <th>Balance</th>
      {/if}
      <th />
    </tr>
    {#each market.market_state.shares as shares, index}
      <tr>
        <th>{market.options[index].name}</th>
        <td><sl-format-number type="currency" currency="USD" value={usdPrices[index]} locale="en-US" /></td>
        <td> <sl-format-number type="percent" value={probabilities[index]} /></td>
        <td>{round(potentials[index])}x</td>
        {#if $seed}
          <td><sl-format-number type="currency" currency="USD" value={usdBalances[index]} locale="en-US" /></td>
        {/if}
        <td>
          <sl-button-group>
            <sl-button on:click={() => dispatch("buy", { option: index })}>Buy</sl-button>
            <sl-button on:click={() => dispatch("sell", { option: index })} disabled={!balance.shares[index]}
              >Sell</sl-button
            >
          </sl-button-group>
        </td>
      </tr>
    {/each}
  </table>
</sl-card>

<style>
  .outcomes::part(body) {
    padding: 0;
  }

  table {
    width: 100%;
  }

  table tr {
    height: 3rem;
  }

  table tr:nth-child(2n) {
    background-color: var(--sl-color-gray-50);
  }

  table td:nth-child(n + 2) {
    text-align: right;
  }

  table > * + * {
    border-top: 1px solid var(--sl-color-gray-200);
  }

  table th,
  table td {
    padding: 1rem;
    text-align: left;
  }
</style>
