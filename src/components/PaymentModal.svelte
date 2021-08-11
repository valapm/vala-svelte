<script lang="ts">
  import CounterInput from "./CounterInput.svelte"
  import { getSharePrice, isInsideLimits } from "../utils/lmsr"
  import { price as bsvPrice } from "../store/price"
  import { round } from "../utils/format"
  import { lmsr } from "bitcoin-predict"
  import { createEventDispatcher } from "svelte"

  import Property from "./Property.svelte"

  import SlDialog from "@shoelace-style/shoelace/dist/components/dialog/dialog.js"
  import SlButton from "@shoelace-style/shoelace/dist/components/button/button.js"
  import SlButtonGroup from "@shoelace-style/shoelace/dist/components/button-group/button-group.js"
  import SlFormatNumber from "@shoelace-style/shoelace/dist/components/format-number/format-number"

  export let market
  export let option = 0
  export let action: "buy" | "sell" = "buy"
  export let balance

  export function show(newAction: "buy" | "sell", newOption: number = 0) {
    option = newOption
    action = newAction
    dialog.show()
  }

  const dispatch = createEventDispatcher()

  let dialog

  let amount = 0

  $: marketBalance = market && {
    shares: market.market_state.shares,
    liquidity: market.market_state.liquidity
  }
  $: change = action === "buy" ? amount : -amount
  $: price =
    action === "buy"
      ? getSharePrice(marketBalance, option, change)
      : Math.abs(getSharePrice(marketBalance, option, change))
  $: usdPrice = (price * $bsvPrice) / 100000000

  $: potentialAssetsUSD = ((amount * lmsr.SatScaling) / 100000000) * $bsvPrice || 0
  $: potentialWin = Math.abs(potentialAssetsUSD - usdPrice)
  $: potentialX = potentialAssetsUSD / usdPrice
  $: insideLimits = isInsideLimits(marketBalance, option, change)
</script>

<sl-dialog label={market.options[option].name} bind:this={dialog}>
  <!-- <div slot="header"><h2>{market.options[option].name}</h2></div> -->
  <p>{market.options[option].details}</p>
  <div class="action-select">
    <sl-button-group>
      <sl-button class={action === "buy" ? "active" : ""} on:click={() => (action = "buy")}>Buy</sl-button>
      <sl-button
        class={action === "sell" ? "active" : ""}
        on:click={() => (action = "sell")}
        disabled={!balance.shares[option]}>Sell</sl-button
      >
    </sl-button-group>
  </div>
  <CounterInput bind:number={amount} max={action === "sell" ? balance.shares[option] : undefined} />
  {#if action === "sell"}
    <div>Max: <span on:click={() => (amount = balance.shares[option])}>{balance.shares[option]}</span></div>
  {/if}

  {#if !insideLimits}
    <p class="warning">
      Outside smart contract limits. <br />
      More market liquidity required.
    </p>
  {/if}

  <div class="properties">
    {#if action === "buy"}
      <Property label="Potential Win">
        <sl-format-number type="currency" currency="USD" value={potentialWin} locale="en-US" />
        ({round(potentialX)}x)
      </Property>
    {/if}
  </div>

  <sl-format-number class="price {action}" type="currency" currency="USD" value={usdPrice} locale="en-US" />
  <sl-button slot="footer" type="primary" disabled={!insideLimits} on:click={() => dispatch(action, { amount, option })}
    >{action.toUpperCase()}</sl-button
  >
</sl-dialog>

<style>
  .action-select {
    display: flex;
    justify-content: center;
  }

  .action-select sl-button {
    width: 10rem;
  }

  .action-select sl-button::part(base) {
    box-shadow: 0 0 0 0;
  }

  .active::part(base) {
    background-color: var(--sl-color-primary-100);
    border-color: var(--sl-color-primary-400);
    color: var(--sl-color-primary-700);
  }

  .action-select sl-button:last-child::part(base) {
    border-top-left-radius: 0px !important;
    border-bottom-left-radius: 0px !important;
  }

  .action-select sl-button:first-child::part(base) {
    border-top-right-radius: 0px !important;
    border-bottom-right-radius: 0px !important;
  }

  sl-dialog::part(body) {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;
  }

  sl-dialog::part(footer) {
    display: flex;
    justify-content: space-around;
  }

  .price {
    font-size: 1.5rem;
  }

  .sell {
    color: var(--sl-color-success-500);
  }

  .buy {
    color: var(--sl-color-danger-700);
  }

  .properties {
    display: flex;
    gap: 1rem;
  }

  .warning {
    font-size: 0.8rem;
    font-style: italic;
    color: var(--sl-color-danger-600);
  }
</style>
