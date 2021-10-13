<script>
  import { AUTH_HOST } from "../config"
  import { post } from "../utils/fetch"
  import { EMAIL_REGEX } from "../utils/email"
  import { getNotificationsContext } from "svelte-notifications"

  import SlButton from "@shoelace-style/shoelace/dist/components/button/button.js"
  import SlInput from "@shoelace-style/shoelace/dist/components/input/input.js"

  const { addNotification } = getNotificationsContext()

  let email_input
  let submit_button

  let email = ""
  let loading = false
  let signedUp = false

  $: isValidEmail = email && EMAIL_REGEX.test(email)

  async function joinWaitlist() {
    loading = true
    let res
    try {
      res = await post(AUTH_HOST + "/waitlist", {
        email
      })
    } catch (error) {
      addNotification({
        type: "danger",
        text: error.message,
        description: "",
        position: "top-right"
      })
      loading = false
      return
    }

    if (res.success) {
      addNotification({
        type: "success",
        text: "Thank you for joining!",
        description: "",
        position: "top-right"
      })
      email = ""
      signedUp = true
    } else {
      addNotification({
        type: "danger",
        text: "Failed to register email address",
        description: "",
        position: "top-right"
      })
    }
    loading = false
  }
</script>

{#if !signedUp}
  <div class="waitlist_input">
    <sl-input
      placeholder="Email"
      name="email"
      bind:this={email_input}
      value={email}
      on:input={() => (email = email_input.value)}
    />
    <sl-button type="primary" on:click={joinWaitlist} bind:this={submit_button} disabled={!isValidEmail} {loading}
      >Join Waitlist</sl-button
    >
  </div>
{:else}
  <p>Thank you for joining!</p>
{/if}

<style>
  .waitlist_input {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: center;
  }

  p {
    font-size: 1.5rem;
  }
</style>
