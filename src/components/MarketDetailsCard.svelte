<script>
  import { round } from "../utils/format"
  import { pm, lmsr } from "bitcoin-predict"
  import { price } from "../store/price"
  import { getCreationDate } from "../utils/pm"

  import HelpModal from "./HelpModal.svelte"
  import FaqLiquidity from "./FaqLiquidity.svelte"

  import SlCard from "@shoelace-style/shoelace/dist/components/card/card.js"
  import SlFormatNumber from "@shoelace-style/shoelace/dist/components/format-number/format-number"
  import SlFormatDate from "@shoelace-style/shoelace/dist/components/format-date/format-date"

  import Property from "./Property.svelte"

  export let market

  $: marketBalance = {
    shares: market ? market.market_state.shares : [],
    liquidity: market ? market.market_state.liquidity : 0
  }

  $: bsvTotal = market.market_state.satoshis / 100000000
  $: usdTotal = bsvTotal * $price
  $: usdLiquidity =
    (lmsr.getLmsrSats({ liquidity: marketBalance.liquidity, shares: new Array(market.options.length).fill(0) }) *
      $price) /
    100000000
  $: status = market && market.market_state.decided ? "Resolved" : "Open"
  $: creationDate = market && getCreationDate(market).toISOString()
</script>

<sl-card>
  <div class="properties">
    <Property label="Status">
      {status}
    </Property>
    <Property label="Total assets">
      <sl-format-number type="currency" currency="USD" value={round(usdTotal)} locale="en-US" />
    </Property>
    <Property label="Liquidity">
      <!-- <div style="display: flex; align-items: bottom;"> -->
      <sl-format-number type="currency" currency="USD" value={round(usdLiquidity)} locale="en-US" />
      <HelpModal label="FAQ: Liquidity" content={FaqLiquidity} />
      <!-- </div> -->
    </Property>
    <Property label="Market Fee">
      <sl-format-number type="percent" value={market.creatorFee / 100} minimum-fraction-digits="1" />
    </Property>
    <Property label="Vala Fee">
      <sl-format-number
        type="percent"
        value={pm.getMarketVersion(market.version).devFee / 100}
        minimum-fraction-digits="1"
      />
    </Property>
    <Property label="Liquidity Fee">
      <sl-format-number type="percent" value={market.liquidityFee / 100} minimum-fraction-digits="1" />
    </Property>
    <Property label="Created">
      <sl-format-date date={creationDate} />
    </Property>
    <Property label="Script Version">
      {pm.getMarketVersion(market.version).version}
    </Property>
  </div>
</sl-card>

<style>
  .properties {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 1rem;
  }

  sl-card {
    width: 100%;
  }
</style>
