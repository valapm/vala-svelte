<script>
  import { price as bsvPrice } from "../store/price"
  import { feeb } from "../config"
  import { getSharePrice, isInsideLimits } from "../utils/lmsr"
  import { lmsr, pm } from "bitcoin-predict"
  import { createEventDispatcher } from "svelte"
  import { tick } from "svelte"
  import { satBalance } from "../store/wallet"

  import NumberInput from "../components/NumberInput.svelte"
  import Button from "./Button.svelte"

  export let option = 0
  export let balance
  export let market
  export let open = false

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

<div class="card">
  <div class="header" on:click={() => (open = !open)}>
    <div class="open" />
    <h3>
      <img src="./icons/chevron.svg" alt="open" style={open ? "transform: rotate(90deg);" : ""} />
      <span>{market.options[option].name}</span>
    </h3>
    <div class="price">${Math.round(priceBuyOneUSD * 100) / 100}</div>
  </div>
  {#if open}
    <div class="details">
      {market.options[option].details}
    </div>
    <div class="buysell">
      <button class={action === 0 ? "selected" : ""} on:click={() => (action = 0)}>Buy</button>
      <button class={action === 1 ? "selected" : ""} on:click={() => (action = 1)}>Sell</button>
    </div>
    <div class="balance">Balance: <b>{balance.shares[option]}</b> Shares</div>
    <NumberInput placeholder="Shares" bind:value={amount} max={action === 1 ? balance.shares[option] : undefined} />
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
  {/if}

  {#if probability}
    <span class="probability">{Math.round(probability * 100)}%</span>
    <div class="probability-bg" style="width: {probability * 18.75}rem;" />
  {/if}
</div>

<style>
  .open {
    position: absolute;
    width: 18.75rem;
    height: 3.25rem;
    left: 0;
    top: 0;
  }

  .card {
    width: 18.75rem;
    padding: 1.125rem;
    background-color: #323841;
    border-radius: 0.375rem;
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    align-items: center;
    z-index: 0;
    gap: 1.25rem;
  }

  .header {
    display: flex;
    justify-content: space-between;
    cursor: pointer;
    width: 100%;
  }

  .header > h3 {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    font-weight: 700;
  }

  .header > h3 > span {
    opacity: 92%;
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
  }

  .probability-bg {
    position: absolute;
    left: 0;
    top: 0;
    height: 5.875rem;
    background: linear-gradient(180deg, #434c56 7.81%, rgba(67, 76, 86, 0) 100%);
    z-index: -1;
  }

  .price {
    font-family: "Roboto Mono", sans-serif;
    font-weight: 500;
  }

  .buysell {
    border-radius: 0.375rem;
    display: flex;
    overflow: hidden;
    border: 1px solid #39baf9;
  }

  .buysell > button {
    width: 5.875rem;
    padding: 0.3125rem;
    background: rgba(57, 186, 249, 0.15);
  }

  .selected {
    background: #39baf9 !important;
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
