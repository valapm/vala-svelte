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
  import Table from "./CardTable.svelte"
  import X from "../icons/x.svelte"
  import Checkmark from "../icons/checkmark.svelte"

  const dispatch = createEventDispatcher()

  export let option = 0
  export let balance
  export let market
  export let loading
  export let open = false

  const actions = ["Buy", "Sell"]

  let amount
  let action = 0

  let satFeeEstimate = 63000 * feeb
  $: usdFeeEstimate = (satFeeEstimate * $bsvPrice) / 100000000

  let version
  $: try {
    version = pm.getMarketVersion(market.version)
  } catch {}

  // $: marketVersion = pm.getMarketVersion(market.version)
  $: marketBalance = {
    shares: market.market_state.shares,
    liquidity: market.market_state.liquidity
  }
  $: change = amount ? (action === 0 ? amount : -amount) : 0
  $: newPrice = getSharePrice(marketBalance, option, change)
  $: price = change !== 0 ? (action === 0 ? newPrice + satFeeEstimate : Math.abs(newPrice) - satFeeEstimate) : 0
  $: usdPrice = (price * $bsvPrice) / 100000000
  // $: marketFee = (newPrice / 100) * market.creatorFee
  // $: liquidityFee = (newPrice / 100) * market.liquidityFee
  // $: valaFee = version && newPrice * version.options.devFee

  $: priceBuyOneUSD = (getSharePrice(marketBalance, option, 1) * $bsvPrice) / 100000000
  $: probability = lmsr.getProbability(marketBalance, marketBalance.shares[option])

  // $: max = action === 0 ? $satBalance / : balance.shares[option]

  $: potentialAssetsUSD = ((amount * lmsr.SatScaling) / 100000000) * $bsvPrice || 0
  $: potentialWin = potentialAssetsUSD ? potentialAssetsUSD - usdPrice : 0
  $: potentialX = potentialAssetsUSD ? potentialAssetsUSD / usdPrice : 0
  $: insideLimits = isInsideLimits(marketBalance, option, change)
  $: canBuySell = change !== 0 && (action === 0 ? price <= $satBalance : -change <= balance.shares[option])

  $: winning = market.market_state.decided && market.market_state.decision === option
  $: loosing = market.market_state.decided && market.market_state.decision !== option
  $: winningShares = winning ? balance.shares[option] : 0
  $: winningUSD = (winningShares * lmsr.SatScaling * $bsvPrice) / 100000000

  $: deactivated = !market.market_state.market_oracles[0].committed || loosing
  $: gradient = winning ? 100 : loosing ? 0 : probability ? Math.round(probability * 100) : 0

  $: if (open) {
    dispatch("opened")
  }
</script>

<SidePanelCard title={market.options[option].name} {gradient} {deactivated} limitTitle="6rem" bind:open>
  <div slot="header">
    {#if !market.market_state.decided}
      <div class="price">${Math.round(priceBuyOneUSD * 100) / 100}</div>
      {#if probability}
        <span class="probability">{Math.round(probability * 100)}%</span>
      {/if}
    {:else if winning}
      <Checkmark />
    {:else}
      <X />
    {/if}
  </div>

  <div slot="body" class="body">
    <div class="details">
      {market.options[option].details}
    </div>
    {#if !market.market_state.decided}
      <Switch bind:selected={action} actions={["Buy", "Sell"]} />
      <div class="balance">Balance: <b>{balance.shares[option]}</b> Shares</div>
      <NumberInput placeholder="Shares" bind:value={amount} max={action === 1 ? balance.shares[option] : undefined} />
    {/if}
    {#if winningShares}
      <div>
        Winnings: <b
          >{winningShares} Share{#if winningShares > 1}s{/if}</b
        >
      </div>
    {/if}
    {#if !market.market_state.decided || winningShares}
      <Table>
        {#if action === 0 && !market.market_state.decided}
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
          <div class="label">Tx Fee</div>
          <div>${Math.round(usdFeeEstimate * 100) / 100}</div>
        </div>

        {#if action === 1 || market.market_state.decided}
          <div>
            <div class="label">Market Fee</div>
            <div>{market.creatorFee}%</div>
          </div>
          <div>
            <div class="label">Liquidity Fee</div>
            <div>{market.liquidityFee}%</div>
          </div>
          {#if version}
            <div>
              <div class="label">Vala Fee</div>
              <div>{version.options.devFee}%</div>
            </div>
          {/if}
        {/if}
      </Table>

      <Button
        type="filled-blue full-width"
        disabled={!winningShares && (!insideLimits || !canBuySell)}
        on:click={() => (winningShares ? dispatch("redeem") : dispatch("update", { change }))}
        {loading}
        ><b
          >{#if winningShares}
            Redeem ${Math.round(winningUSD * 100) / 100}
          {:else}
            {actions[action]}
            {#if price > 0} ${Math.round(usdPrice * 100) / 100} {/if}
          {/if}</b
        ></Button
      >
    {/if}
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

  .label {
    opacity: 70%;
  }
</style>
