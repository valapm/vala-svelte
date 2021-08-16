<script>
  import { publicKey } from "../store/wallet"
  import { createEventDispatcher } from "svelte"
  import { getSharePrice } from "../utils/lmsr"
  import { lmsr } from "bitcoin-predict"

  import SlMenu from "@shoelace-style/shoelace/dist/components/menu/menu"
  import SlMenuItem from "@shoelace-style/shoelace/dist/components/menu-item/menu-item"
  import SlMenuLabel from "@shoelace-style/shoelace/dist/components/menu-label/menu-label"
  import SlDialog from "@shoelace-style/shoelace/dist/components/dialog/dialog"

  import CounterInput from "./CounterInput.svelte"

  const dispatch = createEventDispatcher()

  export let market
  export let balance

  $: redeemInvalidSats =
    market && market.market_state.decided
      ? lmsr.lmsr({
          shares: market.market_state.shares,
          liquidity: market.market_state.liquidity
        }) -
        lmsr.lmsr({
          shares: market.market_state.shares.map((share, i) => (i === market.market_state.decision ? share : 0)),
          liquidity: market.market_state.liquidity
        })
      : 0

  $: marketBalance = {
    shares: market.market_state.shares,
    liquidity: market.market_state.liquidity
  }

  $: redeemWinningSats =
    market && market.market_state.decided
      ? getSharePrice(marketBalance, market.market_state.decision, balance[market.market_state.decision])
      : 0

  /**
   * Lets market creator redeem all loosing shares
   */
  async function redeemInvalidShares() {
    if (!market.market_state.decided) {
      throw new Error("Market not resolved")
    }
    if (market.creatorPubKey !== $publicKey.toString()) {
      throw new Error("User is not market creator")
    }
    if (redeemSats <= 0) {
      throw new Error("Nothing to redeem")
    }
    dispatch("update", { balance })
  }

  /**
   * Sells winning shares after market is resolved
   */
  async function sellWinningShares() {
    if (!market.market_state.decided) {
      throw new Error("Market not resolved")
    }
    if (!balance.shares[market.market_state.decision]) {
      throw new Error("User has no winning shares")
    }
    const newBalance = {
      shares: [...balance.shares],
      liquidity: balance.liquidity
    }

    newBalance.shares[market.market_state.decision] = 0

    dispatch("update", { balance: newBalance })
  }

  async function extractLiquidity() {
    const newBalance = {
      shares: balance.shares,
      liquidity: 0
    }
    dispatch("update", { balance: newBalance })
  }
</script>

<sl-dialog />

<sl-menu class="menu">
  <sl-menu-label>Options</sl-menu-label>
  {#if market.market_state.decided}
    {#if $publicKey && market.creatorPubKey === $publicKey.toString() && redeemInvalidSats > 0}
      <sl-menu-item value="redeem" on:click={redeemInvalidShares}>Redeem Invalid ({redeemInvalidSats}) </sl-menu-item>
    {/if}

    {#if balance.shares[market.market_state.decision]}
      <sl-menu-item value="sellWinning" on:click={sellWinningShares}>Redeem Winning ({redeemWinningSats})</sl-menu-item>
    {/if}

    {#if balance.liquidity}
      <sl-menu-item value="extractLiquidity" on:click={extractLiquidity}>Extract liquidity</sl-menu-item>
    {/if}
  {:else}
    <sl-menu-item value="buyLiquidity" on:click={() => dispatch("buy", { option: -1 })}>Add Liquidity</sl-menu-item>
    {#if balance.liquidity}
      <sl-menu-item value="buyLiquidity" on:click={() => dispatch("sell", { option: -1 })}
        >Remove Liquidity</sl-menu-item
      >
    {/if}
  {/if}
</sl-menu>

<style>
  .menu {
    background-color: var(--sl-color-white);
    max-width: 200px;
    border: solid 1px var(--sl-panel-border-color);
    border-radius: var(--sl-border-radius-medium);
  }

  sl-menu-item::part(label) {
    white-space: normal;
  }
</style>
