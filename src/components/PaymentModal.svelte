<script lang="ts">
  import CounterInput from "./CounterInput.svelte"
  import { getSharePrice } from "../utils/lmsr"
  import { price as bsvPrice } from "../store/price"
  import { round } from "../utils/format"

  export let market
  export let option
  export let action: "buy" | "sell" = "buy"
  export let balance

  let dialog

  let amount = 0

  $: marketBalance = market && {
    shares: market.market_state.shares,
    liquidity: market.market_state.liquidity
  }
  $: price =
    action === "buy"
      ? getSharePrice(marketBalance, option, amount)
      : Math.abs(getSharePrice(marketBalance, option, -amount))
  $: usdPrice = (price * $bsvPrice) / 100000000

  export function show() {
    dialog.show()
  }

  import SlDialog from "@shoelace-style/shoelace/dist/components/dialog/dialog.js"
  import SlButton from "@shoelace-style/shoelace/dist/components/button/button.js"
  import SlButtonGroup from "@shoelace-style/shoelace/dist/components/button-group/button-group.js"
  import SlFormatNumber from "@shoelace-style/shoelace/dist/components/format-number/format-number"
</script>

<sl-dialog bind:this={dialog}>
  <div class="action-select">
    <sl-button-group>
      <sl-button class={action === "buy" ? "active" : ""} on:click={() => (action = "buy")}>Buy</sl-button>
      <sl-button class={action === "sell" ? "active" : ""} on:click={() => (action = "sell")}>Sell</sl-button>
    </sl-button-group>
  </div>
  <CounterInput bind:number={amount} max={action === "sell" ? balance.shares[option] : undefined} />
  {#if action === "sell"}
    <div>Max: <span on:click={() => (amount = balance.shares[option])}>{balance.shares[option]}</span></div>
  {/if}
  <sl-format-number class="price {action}" type="currency" currency="USD" value={usdPrice} locale="en-US" />
  <sl-button slot="footer" type="primary">{action.toUpperCase()}</sl-button>
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
</style>
