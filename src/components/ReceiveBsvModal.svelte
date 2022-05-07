<script>
  import { address } from "../store/wallet"
  import { notify } from "../store/notifications"

  import Qr from "./Qr.svelte"
  import Modal from "./Modal.svelte"
  import Button from "./Button.svelte"

  export let open = false

  async function copyAddress(event) {
    await navigator.clipboard.writeText($address.toString())
    notify({
      type: "success",
      text: "Copied address to clipboard"
    })
  }
</script>

<Modal bind:open>
  <div class="modal">
    <div class="title">Receive BSV</div>
    <div class="warning">Only send Bitcoin SV to this address</div>
    {#if $address}
      <div class="qr">
        <Qr string={$address.toString()} />
      </div>
    {/if}
    <div class="address">
      <label for="address">Address</label>
      <button id="address" on:click={copyAddress}>{$address.toString()}</button>
    </div>

    <Button type="filled-grey" on:click={() => (open = false)}>Back</Button>
  </div>
</Modal>

<style>
  .modal {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    padding: 2.375rem;
    align-items: center;
    color: #ffffff;
    max-width: 100%;
  }

  .title {
    font-size: 2.125rem;
    font-weight: 700;
  }

  .address {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    font-size: 1.125rem;
    font-weight: 500;
    align-items: center;
  }

  .address > label {
    opacity: 50%;
  }

  .qr {
    padding: 0.625rem;
    border-radius: 0.75rem;
    background-color: #ffffff;
  }

  .warning {
    opacity: 50%;
  }
</style>
