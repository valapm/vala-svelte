<script>
  import { seed, derivationPath } from "../store/wallet"
  import { email as emailSave } from "../store/profile"
  import { push } from "svelte-spa-router"
  import Mnemonic from "../utils/mnemonic"
  import { AUTH_HOST } from "../config"
  import Loader from "../components/Loader.svelte"
  import { onMount } from "svelte"
  import { getNotificationsContext } from "svelte-notifications"

  import SlButton from "@shoelace-style/shoelace/dist/components/button/button.js"
  import SlInput from "@shoelace-style/shoelace/dist/components/input/input.js"
  import SlAlert from "@shoelace-style/shoelace/dist/components/alert/alert.js"
  import SlDialog from "@shoelace-style/shoelace/dist/components/dialog/dialog.js"

  const { addNotification } = getNotificationsContext()
  const unspecificErrorMessage = { title: "Something went wrong", details: "Please try again or contact Support." }

  let valaauth
  let loading

  let email = ""
  let password = ""
  let password2 = ""

  let email_input
  let password_input
  let password_input2
  let register_button
  let error_alert
  let dialog

  let generatedSeed = null
  $: publicKey = generatedSeed ? generatedSeed.toHDPrivateKey("livenet").deriveChild(derivationPath).publicKey : null

  let error = {}

  function initAuth() {
    console.debug("vala-auth loaded")
  }

  async function generateSeed() {
    if (password !== password2) {
      error = { title: "Passwords do not match" }
      addNotification({
        type: "danger",
        text: error.title,
        description: error.details || "",
        position: "top-right"
      })
      return
    }

    generatedSeed = Mnemonic.fromRandom()
    dialog.show()
  }

  async function registerDefault() {
    return register(email, password)
  }

  async function register(email, password) {
    loading = true
    try {
      await window.valaauth.register(email, password, generatedSeed.toString(), AUTH_HOST, publicKey.toString())
    } catch (e) {
      if (e.message === "Email already taken") {
        error = {
          title: "Email already taken"
        }
      } else if (e.message === "Must be a valid email") {
        error = {
          title: "Must be a valid Email"
        }
      } else {
        error = unspecificErrorMessage
      }
      dialog.hide()
      addNotification({
        type: "danger",
        text: error.title,
        description: error.details || "",
        position: "top-right"
      })
      loading = false
      return
    }

    $seed = generatedSeed ? generatedSeed.toString() : ""
    $emailSave = email
    loading = false
    dialog.hide()
    push("/")
  }

  function resetSeed() {
    generatedSeed = null
  }

  function handleKeydown(event) {
    if (event.keyCode === 13) {
      event.preventDefault()
      if (dialog.open) {
        register(email, password)
      } else {
        generateSeed()
      }
    }
  }

  onMount(() => {
    if ($seed) push("/")

    email_input.addEventListener("sl-input", () => {
      email = email_input.value
    })
    password_input.addEventListener("sl-input", () => {
      password = password_input.value
    })
    password_input2.addEventListener("sl-input", () => {
      password2 = password_input2.value
    })
    dialog.addEventListener("sl-request-close", event => event.preventDefault())
  })
</script>

<svelte:head>
  <script src="/includes/valaauth.min.js" on:load={initAuth}></script>
</svelte:head>

<svelte:window on:keydown={handleKeydown} />

<sl-dialog label="Your Wallet" bind:this={dialog}>
  This is your generated wallet seed. Your wallet is encrypted with your password and stored on our servers, we will
  never have access to it.
  <div class="seed">
    {#if generatedSeed}
      {#each generatedSeed.toString().split(" ") as word}<div>{word}</div>{/each}
    {/if}
  </div>
  <p class="warning-message">If you loose your password, you will loose access to your wallet!</p>
  <sl-button slot="footer" type="primary" on:click={registerDefault} {loading}>Finish Registration</sl-button>
</sl-dialog>

<div class="login">
  <h1>Register</h1>

  <form>
    <sl-input placeholder="Email" name="email" bind:this={email_input} value={email} />
    <sl-input
      placeholder="Password"
      type="password"
      name="password"
      bind:this={password_input}
      value={password}
      toggle-password
    />
    <sl-input
      placeholder="Please repeat password"
      type="password"
      name="password2"
      bind:this={password_input2}
      value={password2}
      toggle-password
    />
  </form>

  <div class="buttons">
    <sl-button
      type="primary"
      bind:this={register_button}
      disabled={!email || !password || !password2}
      on:click={generateSeed}>Register</sl-button
    >
    <a href="#/login"><sl-button>Login</sl-button></a>
  </div>
</div>

<style>
  .login {
    display: flex;
    flex-direction: column;
    transform: translate(-50%, -50%);
    position: absolute;
    left: 50%;
    top: 50%;
    gap: 2rem;
    text-align: center;
    width: min(90%, 15rem);
    align-items: center;
  }

  .login form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  h1 {
    font-size: 2rem;
    /* margin-bottom: 1rem; */
  }

  .buttons {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: center;
  }

  .seed {
    padding: 0.8rem;
    margin: 0.5rem;
    background-color: var(--sl-color-gray-200);
    border-radius: var(--sl-border-radius-medium);
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
    text-align: center;
  }

  .warning-message {
    font-weight: bold;
  }

  sl-dialog::part(footer) {
    display: flex;
    justify-content: space-around;
  }
</style>
