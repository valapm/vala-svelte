<script lang="ts">
  import { lmsr } from "bitcoin-predict"
  import { price } from "../store/price"
  import { getSharePrice } from "../utils/lmsr"
  import { round } from "../utils/format"
  import { isCompatibleVersion } from "../utils/pm"
  import { seed } from "../store/wallet"
  import { createEventDispatcher } from "svelte"

  import Property from "./Property.svelte"

  import SlFormatNumber from "@shoelace-style/shoelace/dist/components/format-number/format-number"
  import SlButton from "@shoelace-style/shoelace/dist/components/button/button.js"
  import SlButtonGroup from "@shoelace-style/shoelace/dist/components/button-group/button-group.js"

  export let market
  export let balance

  let width

  $: smallScreen = width <= 700

  const dispatch = createEventDispatcher()

  $: marketBalance = market && {
    shares: market.market_state.shares,
    liquidity: market.market_state.liquidity
  }

  $: compatibleVersion = market && isCompatibleVersion(market.version)

  $: probabilities = market.market_state.decided
    ? marketBalance.shares.map((shares, i) => (i === market.market_state.decision ? 1 : 0))
    : marketBalance.shares.map(shares => lmsr.getProbability(marketBalance, shares))
  $: satPrices = marketBalance.shares.map((_, index) => getSharePrice(marketBalance, index, 1))
  $: usdPrices = satPrices.map(sats => round((sats / 100000000) * $price))
  $: potentials = satPrices.map(sats => lmsr.SatScaling / sats)
  $: satBalances = balance.shares.map(shares => shares * lmsr.SatScaling)
  $: usdBalances = satBalances.map(sats => round((sats / 100000000) * $price))
</script>

<svelte:window bind:innerWidth={width} />

<sl-card class="outcomes">
  <div slot="header">Outcomes</div>

  {#if !smallScreen}
    <table>
      <tr>
        <th>Name</th>
        {#if market.market_state.decided}
          <th style="text-align: left;">Details</th>
        {/if}
        {#if !market.market_state.decided}
          <th>Price</th>
        {/if}
        <th>Probability</th>

        {#if !market.market_state.decided}
          <th>Potential X</th>
        {/if}
        {#if $seed}
          <th>Balance</th>
          {#if !market.market_state.decided}
            <th />
          {/if}
        {/if}
      </tr>
      {#each market.market_state.shares as shares, index}
        <tr>
          <th>{market.options[index].name}</th>
          {#if market.market_state.decided}
            <td style="text-align: left;">{market.options[index].details}</td>
          {/if}
          {#if !market.market_state.decided}
            <td><sl-format-number type="currency" currency="USD" value={usdPrices[index]} locale="en-US" /></td>
          {/if}
          <td> <sl-format-number type="percent" value={probabilities[index]} /></td>

          {#if !market.market_state.decided}
            <td>
              {#if potentials[index] !== Infinity}{round(potentials[index])}x{/if}
            </td>
          {/if}
          {#if $seed}
            <td><sl-format-number type="currency" currency="USD" value={usdBalances[index]} locale="en-US" /></td>

            {#if !market.market_state.decided && compatibleVersion}
              <td>
                <sl-button-group>
                  <sl-button on:click={() => dispatch("buy", { option: index })}>Buy</sl-button>
                  <sl-button on:click={() => dispatch("sell", { option: index })} disabled={!balance.shares[index]}
                    >Sell</sl-button
                  >
                </sl-button-group>
              </td>
            {/if}
          {/if}
        </tr>
      {/each}
    </table>
  {:else}
    <div class="cards">
      {#each market.market_state.shares as shares, index}
        <div>
          <h3>{market.options[index].name}</h3>
          {#if !market.market_state.decided}
            {market.options[index].details}
          {/if}
          <div class="properties">
            {#if !market.market_state.decided}
              <Property label="Price">
                <sl-format-number type="currency" currency="USD" value={usdPrices[index]} locale="en-US" />
              </Property>
            {/if}

            <Property label="Probability">
              <sl-format-number type="percent" value={probabilities[index]} />
            </Property>

            {#if !market.market_state.decided}
              <Property label="Potential X">
                {#if potentials[index] !== Infinity}{round(potentials[index])}x{/if}
              </Property>
            {/if}
            {#if $seed}
              <Property label="Balance">
                <sl-format-number type="currency" currency="USD" value={usdBalances[index]} locale="en-US" />
              </Property>
            {/if}
          </div>
          {#if $seed}
            {#if !market.market_state.decided}
              <sl-button-group>
                <sl-button on:click={() => dispatch("buy", { option: index })}>Buy</sl-button>
                <sl-button on:click={() => dispatch("sell", { option: index })} disabled={!balance.shares[index]}
                  >Sell</sl-button
                >
              </sl-button-group>
            {/if}
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</sl-card>

<style>
  .cards > div {
    padding: 1rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .cards > div:nth-child(2n) {
    background-color: var(--sl-color-gray-50);
  }

  .properties {
    display: flex;
    flex-wrap: wrap;
    gap: 2rem;
    justify-content: space-evenly;
    width: 100%;
  }

  .cards h3 {
    font-weight: bold;
  }

  .cards sl-button-group {
    width: 15rem;
    justify-content: center;
  }

  .cards sl-button {
    flex-grow: 1;
  }

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

  table td:nth-child(n + 2),
  table th:nth-child(n + 2) {
    text-align: right;
  }

  table > * + * {
    border-top: 1px solid var(--sl-color-gray-200);
  }

  th {
    white-space: nowrap;
  }
  th,
  td {
    padding: 1rem;
    text-align: left;
  }

  @media screen and (max-width: 750px) {
    th,
    td {
      padding: 0.6rem !important;
    }
  }
</style>
