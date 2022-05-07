<script>
  import { testnet } from "../config"
  import { email, verified } from "../store/profile"
  import { post } from "../utils/fetch"
  import { AUTH_HOST } from "../config"
  import { notify } from "../store/notifications"

  import Button from "../components/Button.svelte"

  async function requestEmail() {
    let res
    let fail = ""
    try {
      res = await post(AUTH_HOST + "/resend-email", { email: $email })
    } catch (e) {
      fail = e.message
    }

    console.log(res)

    if (fail || !res || !res.success) {
      notify({
        type: "danger",
        text: "Failed to send verification email",
        description: fail
      })
    } else {
      notify({
        type: "success",
        text: "Send new verification email",
        description: ""
      })
    }
  }

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

  Logged in as {$email}

  {#if !$verified}<sl-button on:click={requestEmail}>Resend verification email</sl-button>{/if}

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
