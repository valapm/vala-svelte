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

  const dispatch = createEventDispatcher()

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

  $: console.log([entry, feeChange, totalLiquidityPoints, earnings])

  $: payout = earnings + liquidityBalance
  $: payoutUSD = payout ? round((payout / 100000000) * $price) : 0
</script>

<sl-card class="outcomes">
  <div slot="header">Liquidity</div>
  <div class="card-body">
    <div class="properties">
      <Property label="Liquidity contribution">{entry.liquidity} ({liquidityBalanceUSD}$)</Property>
      <Property label="Share of total">{liquidityPercent}%</Property>
      <Property label="Earned Liquidity Tokens"
        >{totalLiquidityPoints}
        {#if earningUSD}({earningUSD}$){/if}</Property
      >
    </div>
    <sl-button-group>
      <sl-button on:click={() => dispatch("add")}>Add Liquidity</sl-button>
      <sl-button on:click={() => dispatch("remove")}>Remove Liquidity</sl-button>
      <sl-button on:click={() => dispatch("redeem")} disabled={!earnings}>Redeem Tokens</sl-button>
    </sl-button-group>
  </div>
</sl-card>

<style>
  .properties {
    display: flex;
    justify-content: space-around;
    width: 100%;
  }

  .properties :global(.property) {
    width: auto;
  }

  .card-body {
    display: flex;
    align-items: center;
    gap: 2rem;
    flex-direction: column;
  }
</style>
