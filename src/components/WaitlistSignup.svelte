<script>
  import { AUTH_HOST } from "../config"
  import { post } from "../utils/fetch"
  import { EMAIL_REGEX } from "../utils/email"
  import { notify } from "../store/notifications"

  import Button from "./Button.svelte"

  let email = ""
  let loading = false
  let signedUp = false

  $: isValidEmail = email && EMAIL_REGEX.test(email)

  async function joinWaitlist() {
    if (!isValidEmail) {
      notify({
        type: "danger",
        text: "Enter a valid email"
      })
      return
    }

    loading = true
    let res
    try {
      res = await post(AUTH_HOST + "/waitlist", {
        email
      })
    } catch (error) {
      notify({
        type: "danger",
        text: error.message,
        description: ""
      })
      loading = false
      return
    }

    if (res.success) {
      notify({
        type: "success",
        text: "Thank you for joining!",
        description: ""
      })
      email = ""
      signedUp = true
    } else {
      notify({
        type: "danger",
        text: "Failed to register email address",
        description: ""
      })
    }
    loading = false
  }
</script>

{#if !signedUp}
  <div class="waitlist_input">
    <input type="email" placeholder="Email" name="email" bind:value={email} />
    <Button type="filled-blue" on:click={joinWaitlist} {loading}>Join Waitlist</Button>
  </div>
{:else}
  <p>Thank you for joining!</p>
{/if}

<style>
  .waitlist_input {
    display: flex;
    gap: 1rem;
    align-items: center;
    z-index: 10;
    flex-wrap: wrap;
  }

  p {
    font-size: 1.5rem;
  }

  input {
    background-color: #323841;
    border-radius: 0.375rem;
    padding: 0.625rem 1.5rem;
  }

  input:focus {
    outline: none;
  }

  input,
  .waitlist_input :global(button) {
    box-shadow: 0 0 1rem #272c33, 0 0 1rem #272c33, 0 0 1rem #272c33, 0 0 1rem #272c33;
  }
</style>
