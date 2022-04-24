<script>
  import { price as bsvPrice } from "../store/price"
  import { getSharePrice, isInsideLimits } from "../utils/lmsr"
  import { round, formatUSD } from "../utils/format"
  import { lmsr } from "bitcoin-predict"
  import { satBalance } from "../store/wallet"
  import { feeb } from "../config"
  import { createEventDispatcher } from "svelte"

  import SidePanelCard from "../components/SidePanelCard.svelte"
  import Switch from "../components/Switch.svelte"
  import NumberInput from "../components/NumberInput.svelte"
  import Button from "../components/Button.svelte"

  const dispatch = createEventDispatcher()

  export let market
  export let entry
  export let loadingUpdate
  export let loadingRedeem

  let action = 0
  let actions = ["Add", "Remove"]
  let amount

  let satFeeEstimate = 63000 * feeb
  $: usdFeeEstimate = (satFeeEstimate * $bsvPrice) / 100000000

  $: liquidity = entry && entry.liquidity ? entry.liquidity : 0
  $: liquidityPoints = entry && entry.liquidityPoints ? entry.liquidityPoints : 0

  $: liquidityPercent =
    liquidity && market.market_state.liquidity ? (liquidity / market.market_state.liquidity) * 100 : 0

  $: marketBalance = market && {
    shares: market.market_state.shares,
    liquidity: market.market_state.liquidity
  }

  $: change = amount ? (action === 0 ? amount : -amount) : 0

  $: liquidityBalance =
    lmsr.getLmsrSats(marketBalance) -
    lmsr.getLmsrSats({
      shares: marketBalance.shares,
      liquidity: marketBalance.liquidity - liquidity
    })

  $: liquidityBalanceUSD = round((liquidityBalance / 100000000) * $bsvPrice)
  $: price =
    change !== 0
      ? action === 0
        ? getSharePrice(marketBalance, -1, change) + satFeeEstimate
        : Math.abs(getSharePrice(marketBalance, -1, change)) - satFeeEstimate
      : 0
  $: usdPrice = (price * $bsvPrice) / 100000000

  $: feeChange =
    entry && entry.prevLiquidityPoolState ? market.market_state.accLiquidityFeePool - entry.prevLiquidityPoolState : 0
  $: totalLiquidityPoints = liquidityPoints + feeChange * liquidity
  $: earnings = (totalLiquidityPoints / market.market_state.liquidityPoints || 0) * market.market_state.liquidityFeePool

  $: earningUSD = earnings ? round((earnings / 100000000) * $bsvPrice) : 0

  $: insideLimits = isInsideLimits(marketBalance, -1, change)
  $: canBuySell = change !== 0 && (action === 0 ? price <= $satBalance : entry && -change <= entry.liquidity)

  $: console.log("liquidityPoints", liquidityPoints)

  let liquidityPanelOpened = false
  let rewardsPanelOpened = false
</script>

{#if !market.market_state.decided || liquidity || liquidityPoints}
  <div class="panel">
    <h2>Liquidity</h2>

    <div class="description">Earn fees as a liquidity provider</div>

    {#if !market.market_state.decided}
      <SidePanelCard
        title="Add/Remove Liquidity"
        gradient={100}
        color="01A781"
        bind:open={liquidityPanelOpened}
        on:opened={e => (rewardsPanelOpened = false)}
      >
        <div slot="body" class="body">
          <Switch bind:selected={action} {actions} color="01A781" />
          <div class="balance">
            Balance: <b>{liquidity}</b> Liquidity
          </div>
          <NumberInput
            placeholder="Amount"
            bind:value={amount}
            max={action === 1 ? liquidity : undefined}
            color="01A781"
          />
          <div class="cost-table">
            <div>
              <div class="label">Total Fee</div>
              <div>${Math.round(usdFeeEstimate * 100) / 100}</div>
            </div>
          </div>
          <Button
            type="filled full-width"
            disabled={!insideLimits || !canBuySell}
            loading={loadingUpdate}
            on:click={e => dispatch("update", { change })}
            ><b
              >{actions[action]}
              {#if usdPrice > 0} ${Math.round(usdPrice * 100) / 100} {/if}</b
            ></Button
          >
        </div>
      </SidePanelCard>

      <SidePanelCard
        title="Liquidity Rewards"
        deactivated={liquidityPoints <= 0}
        gradient={100}
        color="01A781"
        bind:open={rewardsPanelOpened}
        on:opened={e => (liquidityPanelOpened = false)}
        ><div slot="body" class="body">
          <div class="details">Your earned Liquidity Tokens</div>
          <div class="balance">Earned: <b>{totalLiquidityPoints}</b> Tokens</div>
          <div class="cost-table">
            <div>
              <div class="label">Tx Fee</div>
              <div>${Math.round(usdFeeEstimate * 100) / 100}</div>
            </div>
          </div>
          <Button type="filled full-width" loading={loadingRedeem} on:click={e => dispatch("redeem")}
            >Redeem {formatUSD(earningUSD)}</Button
          >
        </div>
      </SidePanelCard>
    {:else}
      <SidePanelCard open={true} title="Liquidity & Rewards" color="01A781" />
    {/if}
  </div>
{/if}

<style>
  .panel {
    width: 18.75rem;
    padding: 1rem;
    border: 2px dashed #01a781;
    border-radius: 0.375rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .body {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.25rem;
    width: 100%;
  }

  .details {
    opacity: 50%;
    text-align: center;
  }

  h2 {
    font-size: 1.25rem;
    font-weight: 700;
  }

  .balance {
    font-size: 0.875rem;
  }

  .description {
    font-size: 0.875rem;
    opacity: 80%;
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