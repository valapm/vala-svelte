<script>
  import { price as bsvPrice } from "../store/price"
  import { feeb } from "../config"
  import { getSharePrice, isInsideLimits } from "../utils/lmsr"
  import { lmsr, pm } from "bitcoin-predict"
  import { createEventDispatcher } from "svelte"
  import { tick } from "svelte"
  import { satBalance } from "../store/wallet"

  import SidePanelCard from "../components/SidePanelCard.svelte"
  import NumberInput from "../components/NumberInput.svelte"
  import Button from "./Button.svelte"
  import Switch from "../components/Switch.svelte"

  export let option = 0
  export let balance
  export let market

  const actions = ["Buy", "Sell"]

  let amount
  let action = 0

  let satFeeEstimate = 63000 * feeb
  $: usdFeeEstimate = (satFeeEstimate * $bsvPrice) / 100000000

  // $: marketVersion = pm.getMarketVersion(market.version)
  $: marketBalance = {
    shares: market.market_state.shares,
    liquidity: market.market_state.liquidity
  }
  $: change = amount ? (action === 0 ? amount : -amount) : 0
  $: price =
    change !== 0
      ? action === 0
        ? getSharePrice(marketBalance, option, change) + satFeeEstimate
        : Math.abs(getSharePrice(marketBalance, option, change)) - satFeeEstimate
      : 0
  $: usdPrice = (price * $bsvPrice) / 100000000

  $: priceBuyOneUSD = (getSharePrice(marketBalance, option, 1) * $bsvPrice) / 100000000
  $: probability = marketBalance.shares[option]
    ? lmsr.getProbability(marketBalance, marketBalance.shares[option])
    : undefined

  // $: max = action === 0 ? $satBalance / : balance.shares[option]

  $: potentialAssetsUSD = ((amount * lmsr.SatScaling) / 100000000) * $bsvPrice || 0
  $: potentialWin = potentialAssetsUSD ? potentialAssetsUSD - usdPrice : 0
  $: potentialX = potentialAssetsUSD ? potentialAssetsUSD / usdPrice : 0
  $: insideLimits = isInsideLimits(marketBalance, option, change)
  $: canBuySell = change !== 0 && (action === 0 ? price <= $satBalance : -change <= balance.shares[option])
</script>

<SidePanelCard
  title={market.options[option].name}
  gradient={probability ? Math.round(probability * 100) : 0}
  deactivated={!market.market_state.market_oracles[0].committed}
>
  <div slot="header">
    <div class="price">${Math.round(priceBuyOneUSD * 100) / 100}</div>
    {#if probability}
      <span class="probability">{Math.round(probability * 100)}%</span>
    {/if}
  </div>

  <div slot="body" class="body">
    <div class="details">
      {market.options[option].details}
    </div>
    <Switch bind:selected={action} actions={["Buy", "Sell"]} />
    <div class="balance">Balance: <b>{balance.shares[option]}</b> Shares</div>
    <NumberInput placeholder="Shares" bind:value={amount} max={action === 1 ? balance.shares[option] : 0} />
    <div class="cost-table">
      {#if action === 0}
        <div>
          <div class="label">Potential Win</div>
          <div>${potentialWin >= 0 ? Math.round(potentialWin * 100) / 100 : 0}</div>
        </div>
        <div>
          <div class="label">Return</div>
          <div>{Math.round(potentialX * 100) / 100}x</div>
        </div>
      {/if}
      <div>
        <div class="label">Total Fee</div>
        <div>${Math.round(usdFeeEstimate * 100) / 100}</div>
      </div>
    </div>

    <Button type="filled-blue full-width" disabled={!insideLimits || !canBuySell}
      ><b
        >{actions[action]}
        {#if price > 0} ${Math.round(usdPrice * 100) / 100} {/if}</b
      ></Button
    >
  </div>
</SidePanelCard>

<style>
  .body {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.25rem;
    width: 100%;
  }
  .probability {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    font-size: 0.875rem;
    font-family: "Roboto Mono", sans-serif;
    font-weight: 700;
    opacity: 50%;
    z-index: -1;
    top: 1.25rem;
  }
  .price {
    font-family: "Roboto Mono", sans-serif;
    font-weight: 500;
  }

  .details {
    opacity: 50%;
    text-align: center;
  }

  .balance {
    font-size: 0.875rem;
  }

  .cost-table {
    font-family: "Roboto Mono", sans-serif;
    padding: 0.5rem;
    width: 100%;
    font-size: 0.875rem;
    gap: 0.6rem;
    display: flex;
    flex-direction: column;
  }

  .cost-table > div {
    display: flex;
    justify-content: space-between;
    width: 100%;
  }

  .label {
    opacity: 70%;
  }
</style>
