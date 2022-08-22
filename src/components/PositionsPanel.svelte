<script>
  import { publicKey } from "../store/wallet"

  import Positions from "../components/Positions.svelte"
  import LiquidityPanel from "../components/LiquidityPanel.svelte"

  export let market

  $: existingEntry = $publicKey && market && market.market_state.myEntry[0]
  $: balance = existingEntry || {
    shares: new Array(market ? market.options.length : 0).fill(0),
    liquidity: 0
  }
  $: hasBalance = balance.shares.reduce((partialSum, a) => partialSum + a, 0) > 0

  let balanceTab = "positions"
</script>

<div id="positions">
  <div id="balances">
    <button on:click={() => (balanceTab = "positions")} style={balanceTab === "positions" ? "color: white;" : ""}
      >My Positions</button
    >
    <button on:click={() => (balanceTab = "liquidity")} style={balanceTab === "liquidity" ? "color: white;" : ""}
      >My Liquidity</button
    >
  </div>

  {#if balanceTab === "positions"}
    {#if hasBalance}
      <Positions {market} {balance} />
    {:else}
      Nothing here yet
    {/if}
  {:else if balanceTab === "liquidity"}
    <LiquidityPanel {market} entry={existingEntry} />
  {/if}
</div>

<style>
  #positions {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;
  }

  #balances {
    font-size: 1.25rem;
    display: flex;
    gap: 2.5rem;
    color: rgba(255, 255, 255, 0.5);
    justify-content: flex-start;
    font-weight: 500;
    width: 100%;
  }
</style>
