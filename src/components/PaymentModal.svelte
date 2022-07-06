<script lang="ts">
  import CounterInput from "./CounterInput.svelte"
  import { getSharePrice, isInsideLimits } from "../utils/lmsr"
  import { price as bsvPrice } from "../store/price"
  import { round } from "../utils/format"
  import { lmsr, pm } from "bitcoin-predict"
  import { createEventDispatcher } from "svelte"
  import { feeb } from "../config"

  import Property from "./Property.svelte"
  import HelpModal from "./HelpModal.svelte"
  import FaqLiquidity from "./FaqLiquidity.svelte"

  import SlDialog from "@shoelace-style/shoelace/dist/components/dialog/dialog.js"
  import SlButton from "@shoelace-style/shoelace/dist/components/button/button.js"
  import SlButtonGroup from "@shoelace-style/shoelace/dist/components/button-group/button-group.js"
  import SlFormatNumber from "@shoelace-style/shoelace/dist/components/format-number/format-number"

  const dispatch = createEventDispatcher()

  export let market
  export let option = 0
  export let action: "buy" | "sell" = "buy"
  export let balance

  export function show(newAction: "buy" | "sell", newOption: number = 0) {
    option = newOption
    action = newAction
    dialog.show()
  }

  export function hide() {
    dialog.hide()
  }

  let dialog

  let amount = 0

  let satFeeEstimate = 63000 * feeb
  $: usdFeeEstimate = (satFeeEstimate * $bsvPrice) / 100000000

  $: marketVersion = pm.getMarketVersion(market.version)
  $: marketBalance = market && {
    shares: market.market_state.shares,
    liquidity: market.market_state.liquidity
  }
  $: change = action === "buy" ? amount : -amount
  $: price =
    action === "buy"
      ? getSharePrice(marketBalance, option, change) + satFeeEstimate
      : Math.abs(getSharePrice(marketBalance, option, change)) - satFeeEstimate
  $: usdPrice = (price * $bsvPrice) / 100000000

  $: potentialAssetsUSD = ((amount * lmsr.SatScaling) / 100000000) * $bsvPrice || 0
  $: potentialWin = Math.abs(potentialAssetsUSD - usdPrice)
  $: potentialX = potentialAssetsUSD / usdPrice

  $: version = pm.getMarketVersion(market.version)
  $: insideLimits = isInsideLimits(marketBalance, option, change, version)

  $: actionLabel = action === "buy" ? (option === -1 ? "Add" : "Buy") : option === -1 ? "Remove" : "Sell"
</script>

<sl-dialog label={option === -1 ? "Liquidity" : market.options[option].name} bind:this={dialog}>
  {#if option === -1}
    <p>
      Liquidity is used to pay out winning shares if no sufficient loosing shares exist. Increasing liquidity will make
      the market more attractive to investors but you might not get your provided liquidity back. <HelpModal
        content={FaqLiquidity}
        label="FAQ: Liquidity"
      />
    </p>
  {:else}
    <p>{market.options[option].details}</p>
  {/if}

  <div class="action-select">
    <sl-button-group>
      <sl-button class={action === "buy" ? "active" : ""} on:click={() => (action = "buy")}
        >{option === -1 ? "Add" : "Buy"}</sl-button
      >
      <sl-button
        class={action === "sell" ? "active" : ""}
        on:click={() => (action = "sell")}
        disabled={option === -1 ? !balance.liquidity : !balance.shares[option]}
        >{option === -1 ? "Remove" : "Sell"}</sl-button
      >
    </sl-button-group>
  </div>

  <CounterInput
    bind:number={amount}
    max={action === "sell" ? (option === -1 ? balance.liquidity : balance.shares[option]) : undefined}
  />

  {#if action === "sell"}
    <div class="max">
      <span on:click={() => (amount = option === -1 ? balance.liquidity : balance.shares[option])}
        >Max: {option === -1 ? balance.liquidity : balance.shares[option]}</span
      >
    </div>
  {/if}

  {#if !insideLimits}
    <p class="warning">
      Outside smart contract limits. <br />
      More market liquidity required.
    </p>
  {/if}

  <div class="properties">
    {#if option !== -1}
      {#if action === "buy"}
        <Property label="Potential Win" centered={true}>
          <sl-format-number type="currency" currency="USD" value={potentialWin} locale="en-US" />
        </Property>
        <Property label="Return" centered={true}>
          {#if potentialX !== Infinity}{round(potentialX)}x{/if}
        </Property>
      {:else}
        <Property label="Market Fee" centered={true}>
          <sl-format-number
            class="red"
            type="currency"
            currency="USD"
            value={(market.creatorFee * usdPrice) / 100}
            locale="en-US"
          />
        </Property>
        <Property label="Vala Fee" centered={true}>
          <sl-format-number
            class="red"
            type="currency"
            currency="USD"
            value={(marketVersion.options.devFee * usdPrice) / 100}
            locale="en-US"
          />
        </Property>
        <Property label="Liquidity Fee" centered={true}>
          <sl-format-number
            class="red"
            type="currency"
            currency="USD"
            value={(market.liquidityFee * usdPrice) / 100}
            locale="en-US"
          />
        </Property>
      {/if}
    {/if}
    <Property label="Tx Fee" centered={true}>
      <sl-format-number class="red" type="currency" currency="USD" value={usdFeeEstimate} locale="en-US" />
    </Property>
  </div>

  <sl-format-number class="price {action}" type="currency" currency="USD" value={usdPrice} locale="en-US" />

  <sl-button slot="footer" type="primary" disabled={!insideLimits} on:click={() => dispatch(action, { amount, option })}
    >{actionLabel.toUpperCase()}</sl-button
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
    /* text-align: center !important; */
  }

  .warning {
    font-size: 0.8rem;
    font-style: italic;
    color: var(--sl-color-danger-600);
  }

  .red {
    color: var(--sl-color-danger-600);
  }

  .max {
    font-style: italic;
    font-size: 0.8rem;
    text-decoration: underline;
    cursor: pointer;
  }
</style>
