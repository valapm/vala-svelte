<script>
  import { usdBalance, satBalance } from "../store/wallet"

  import Eye from "../icons/Eye.svelte"
  import Qr from "../icons/Qr.svelte"
  import ReceiveBsvModal from "./ReceiveBsvModal.svelte"
  import SeedPhraseModal from "./SeedPhraseModal.svelte"

  let receiveModal = false
  let seedPhraseModal = false
</script>

<div class="card">
  <div>
    <div class="balances">
      <div class="title">Wallet Ballance</div>
      <div class="balance">${Math.round($usdBalance * 100) / 100}</div>
      <div class="satBalance">{Math.round(($satBalance / 100000000) * 10000) / 10000} BSV</div>
    </div>
    <button id="showPhraseButton" on:click={() => (seedPhraseModal = true)}>
      <Eye />
      Recovery Phrase</button
    >
  </div>
  <button id="showQrButton" on:click={() => (receiveModal = true)}><Qr /></button>
</div>

<ReceiveBsvModal bind:open={receiveModal} />
<SeedPhraseModal bind:open={seedPhraseModal} />

<style>
  .card {
    border-radius: 0.75rem;
    height: 12.5rem;
    width: min(21rem, 90%);
    background-color: #323841;
    color: #d8d9e5;
    padding: 1rem;
    box-shadow: 0 0.25rem 1.5rem #00000040;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }

  .card > div {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100%;
  }

  .title {
    font-size: 1rem;
  }

  .balance {
    font-weight: 500;
    font-size: 1.875rem;
  }

  .balances {
    display: flex;
    flex-direction: column;
    gap: 0.44rem;
  }

  #showPhraseButton {
    font-size: 0.875rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
</style>
