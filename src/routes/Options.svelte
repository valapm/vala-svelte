<script>
  import { testnet } from "../config"
  import { email, verified } from "../store/profile"
  import { post } from "../utils/fetch"
  import { AUTH_HOST } from "../config"
  import { getNotificationsContext } from "svelte-notifications"

  import SlButton from "@shoelace-style/shoelace/dist/components/button/button"

  const { addNotification } = getNotificationsContext()

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
      addNotification({
        type: "danger",
        text: "Failed to send verification email",
        description: fail,
        position: "top-right"
      })
    } else {
      addNotification({
        type: "success",
        text: "Send new verification email",
        description: "",
        position: "top-right"
      })
    }
  }
</script>

<div class="options">
  Logged in as {$email}

  {#if !$verified}<sl-button on:click={requestEmail}>Resend verification email</sl-button>{/if}
</div>

<style>
  .options {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;
  }
</style>
