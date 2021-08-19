<script>
  import { publicKey } from "../store/wallet"
  import { createEventDispatcher } from "svelte"
  import { getSharePrice } from "../utils/lmsr"
  import { lmsr, bsv } from "bitcoin-predict"

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
      ? market.market_state.satoshis -
        lmsr.getLmsrSats({
          shares: marketBalance.shares.map((share, i) => (i === market.market_state.decision ? share : 0)),
          liquidity: marketBalance.liquidity
        })
      : 0

  $: marketBalance = {
    shares: market.market_state.shares,
    liquidity: market.market_state.liquidity
  }
</script>

<sl-dialog />

<sl-menu class="menu">
  <sl-menu-label>Options</sl-menu-label>
  {#if market.market_state.decided}
    {#if $publicKey && market.creatorPubKey === $publicKey.toString() && redeemInvalidSats > bsv.Transaction.DUST_AMOUNT}
      <sl-menu-item value="redeem" on:click={() => dispatch("redeemInvalid")}>Redeem Invalid Shares</sl-menu-item>
    {/if}

    {#if balance.shares[market.market_state.decision]}
      <sl-menu-item value="sellWinning" on:click={() => dispatch("redeemWinning")}>Redeem Winning Shares</sl-menu-item>
    {/if}

    {#if balance.liquidity}
      <sl-menu-item value="extractLiquidity" on:click={() => dispatch("extractLiquidity")}
        >Extract liquidity</sl-menu-item
      >
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
