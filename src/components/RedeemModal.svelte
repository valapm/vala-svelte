<script lang="ts">
  import { lmsr, bsv } from "bitcoin-predict"
  import { price } from "../store/price"
  import { publicKey } from "../store/wallet"
  import { createEventDispatcher } from "svelte"

  import SlDialog from "@shoelace-style/shoelace/dist/components/dialog/dialog"
  import SlButton from "@shoelace-style/shoelace/dist/components/button/button.js"
  import SlFormatNumber from "@shoelace-style/shoelace/dist/components/format-number/format-number"

  const dispatch = createEventDispatcher()

  export let market
  export let balance

  let dialog

  let action

  export function show(newAction: "redeemWinning" | "redeemInvalid" | "extractLiquidity") {
    action = newAction
    dialog.show()
  }

  export function hide() {
    dialog.hide()
  }

  $: marketBalance = {
    shares: market.market_state.shares,
    liquidity: market.market_state.liquidity
  }
  $: redeemInvalidSats =
    market && market.market_state.decided
      ? market.market_state.satoshis -
        lmsr.getLmsrSats({
          shares: marketBalance.shares.map((share, i) => (i === market.market_state.decision ? share : 0)),
          liquidity: marketBalance.liquidity
        })
      : 0
  $: redeemInvalidUSD = (redeemInvalidSats * $price) / 100000000

  $: redeemWinningSats =
    market && market.market_state.decided ? balance.shares[market.market_state.decision] * lmsr.SatScaling : 0

  $: redeemWinningUSD = (redeemWinningSats * $price) / 100000000

  $: extractLiquiditySats = market
    ? market.market_state.satoshis -
      lmsr.getLmsrSats({
        shares: marketBalance.shares,
        liquidity: marketBalance.liquidity - balance.liquidity
      })
    : 0

  $: extractLiquidityUSD = (extractLiquiditySats * $price) / 100000000

  $: modalLabel =
    action === "redeemWinning"
      ? "Redeem Winning Shares"
      : action === "redeemInvalid"
      ? "Redeem Invalid Shares"
      : action === "extractLiquidity"
      ? "Extract Liquidity"
      : ""

  $: modalValue =
    action === "redeemWinning"
      ? redeemWinningUSD
      : action === "redeemInvalid"
      ? redeemInvalidUSD
      : action === "extractLiquidity"
      ? extractLiquidityUSD
      : 0

  $: modalAction =
    action === "redeemWinning"
      ? sellWinningShares
      : action === "redeemInvalid"
      ? redeemInvalidShares
      : action === "extractLiquidity"
      ? extractLiquidity
      : () => {}

  async function extractLiquidity() {
    const newBalance = {
      shares: marketBalance.shares,
      liquidity: marketBalance.liquidity - balance.liquidity
    }
    dispatch("update", { balance: newBalance })
  }

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
    if (redeemInvalidSats <= bsv.Transaction.DUST_AMOUNT) {
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
</script>

<sl-dialog bind:this={dialog} label={modalLabel}>
  <sl-format-number class="price" type="currency" currency="USD" value={modalValue} locale="en-US" />

  <sl-button slot="footer" type="primary" on:click={modalAction}>Redeem</sl-button>
</sl-dialog>

<style>
  sl-dialog::part(body) {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;
  }

  sl-dialog::part(footer) {
    display: flex;
    justify-content: space-around;
  }

  .price {
    font-size: 1.5rem;
    color: var(--sl-color-success-500);
  }
</style>
