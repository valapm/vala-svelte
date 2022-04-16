<script>
  import { price as bsvPrice } from "../store/price"
  import { getSharePrice, isInsideLimits } from "../utils/lmsr"
  import { round, formatUSD } from "../utils/format"
  import { lmsr } from "bitcoin-predict"
  import { satBalance } from "../store/wallet"
  import { feeb } from "../config"

  import SidePanelCard from "../components/SidePanelCard.svelte"
  import Switch from "../components/Switch.svelte"
  import NumberInput from "../components/NumberInput.svelte"
  import Button from "../components/Button.svelte"

  export let market
  export let entry

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
  $: canBuySell = change !== 0 && (action === 0 ? bsvPrice <= $satBalance : entry && -change <= entry.balance.liquidity)

  $: console.log("liquidityPoints", liquidityPoints)
</script>

{#if !market.market_state.decided || liquidity || liquidityPoints}
  <div class="panel">
    <h2>Liquidity</h2>

    <div class="details">Earn fees as a liquidity provider</div>

    {#if !market.market_state.decided}
      <SidePanelCard title="Add/Remove Liquidity" gradient={100} color="01A781">
        <div slot="body" class="body">
          <Switch bind:selected={action} {actions} color="01A781" />
          <div class="balance">
            Balance: <b>{liquidity}</b> Liquidity{#if liquidity} ({liquidityPercent}%){/if}
          </div>
          <NumberInput placeholder="Amount" bind:value={amount} max={action === 1 ? liquidity : 0} color="01A781" />
          <div class="cost-table">
            <div>
              <div class="label">Total Fee</div>
              <div>${Math.round(usdFeeEstimate * 100) / 100}</div>
            </div>
          </div>
          <Button type="filled full-width" disabled={!insideLimits || !canBuySell}
            ><b
              >{actions[action]}
              {#if bsvPrice > 0} ${Math.round(usdPrice * 100) / 100} {/if}</b
            ></Button
          >
        </div>
      </SidePanelCard>

      <SidePanelCard title="Liquidity Rewards" deactivated={liquidityPoints <= 0} gradient={100} color="01A781" />
    {:else}
      <SidePanelCard open={true} title="Liquidity & Rewards" color="01A781" />
    {/if}
  </div>
{/if}

<table id="liquidityPanel">
  <thead>
    <tr>
      <th> Balance </th>
      <th> Share </th>
      <th> Earned Liquidity Tokens </th>
    </tr>
  </thead>

  <tbody>
    <tr>
      <td>
        {liquidity} ({formatUSD(liquidityBalanceUSD)})
      </td>
      <td>
        {liquidityPercent}
      </td>
      <td>
        {totalLiquidityPoints}
        {#if earningUSD}({formatUSD(earningUSD)}){/if}</td
      >
    </tr>
  </tbody>
</table>

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

  h2 {
    font-size: 1.25rem;
    font-weight: 700;
  }

  .balance {
    font-size: 0.875rem;
  }

  .details {
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
