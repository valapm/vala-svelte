<script>
  import { testnet } from "../config"
  import { post } from "../utils/fetch"
  import { AUTH_HOST } from "../config"
  import { notify } from "../store/notifications"
  import { username } from "../store/wallet"

  import Button from "../components/Button.svelte"

  function switchNetwork() {
    if (!testnet) {
      window.location.href = window.location.origin + "/test/#/options"
    } else {
      window.location.href = window.location.origin + "/#/options"
    }
  }

  $: console.log(window.location.href, window.location.origin)
</script>

<div class="options">
  <h1>Settings</h1>

  <p>Wallet ID: <b>{$username}</b></p>

  <!-- <div>
    Use Testnet
    <input type="checkbox" checked={testnet} on:click={switchNetwork} />
  </div> -->

  <Button on:click={switchNetwork}>
    Switch to {testnet ? "Mainnet" : "Testnet"}
  </Button>
</div>

<style>
  .options {
    margin-top: 6rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;
    width: min(65rem, 95%);
  }

  h1 {
    font-size: 3rem;
    font-weight: 700;
  }
</style>
