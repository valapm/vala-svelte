<script>
  import { seed } from "../store/wallet"
  import { username as usernameSave } from "../store/profile"
  import { push } from "svelte-spa-router"
  import Mnemonic from "../utils/mnemonic"
  import { AUTH_HOST } from "../config"
  import Header from "../components/Header.svelte"
  import Loader from "../components/Loader.svelte"
  import { onMount } from "svelte"

  import SlButton from "@shoelace-style/shoelace/dist/components/button/button.js"
  import SlInput from "@shoelace-style/shoelace/dist/components/input/input.js"
  import SlAlert from "@shoelace-style/shoelace/dist/components/alert/alert.js"
  import SlDialog from "@shoelace-style/shoelace/dist/components/dialog/dialog.js"

  const unspecificErrorMessage = { title: "Something went wrong", details: "Please try again or contact Support." }

  let valaauth
  let loading

  let username = ""
  let password = ""
  let password2 = ""

  let username_input
  let password_input
  let password_input2
  let register_button
  let error_alert
  let dialog

  let generatedSeed = ""

  let error = {}

  function initAuth() {
    console.debug("vala-auth loaded")
  }

  async function generateSeed() {
    if (password !== password2) {
      error = { title: "Passwords do not match" }
      error_alert.toast()
      return
    }

    generatedSeed = Mnemonic.fromRandom().toString()
    dialog.show()
  }

  async function registerDefault() {
    return register(username, password)
  }

  async function register(username, password) {
    loading = true
    try {
      await window.valaauth.register(username, password, generatedSeed, AUTH_HOST)
    } catch (e) {
      if (e.message === "Username already taken") {
        error = {
          title: "Username already taken"
        }
      } else {
        error = unspecificErrorMessage
      }
      dialog.hide()
      error_alert.toast()
      loading = false
      return
    }

    $seed = generatedSeed
    $usernameSave = username
    loading = false
    dialog.hide()
    push("/")
  }

  function resetSeed() {
    generatedSeed = undefined
  }

  function handleKeydown(event) {
    if (event.keyCode === 13) {
      event.preventDefault()
      if (dialog.open) {
        register(username, password)
      } else {
        generateSeed()
      }
    }
  }

  onMount(() => {
    username_input.addEventListener("sl-input", () => {
      username = username_input.value
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
  <script src="./includes/valaauth.min.js" on:load={initAuth}></script>
</svelte:head>

<svelte:window on:keydown={handleKeydown} />

<sl-alert type="danger" duration="3000" bind:this={error_alert} closable>
  <sl-icon slot="icon" name="exclamation-octagon" />
  <strong>{error.title}</strong><br />
  {error.details || ""}
</sl-alert>

<sl-dialog label="Your Wallet" bind:this={dialog}>
  This is your generated wallet seed. Your wallet is encrypted with your password and stored on our servers, we will
  never have access to it.
  <div class="seed">
    {#each generatedSeed.split(" ") as word}<div>{word}</div>{/each}
  </div>
  <p class="warning-message">If you loose your password, you will loose access to your wallet!</p>
  <sl-button slot="footer" type="primary" on:click={registerDefault} {loading}>Finish Registration</sl-button>
</sl-dialog>

<Header />

<div class="login">
  <h1>Register</h1>

  <form>
    <sl-input placeholder="Username" name="username" bind:this={username_input} value={username} />
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
      disabled={!username || !password || !password2}
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
