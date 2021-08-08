<script>
  import { seed } from "../store/wallet"
  import { username as usernameSave } from "../store/profile"
  import { push } from "svelte-spa-router"
  import Mnemonic from "../utils/mnemonic"
  import Loader from "../components/Loader.svelte"
  import { AUTH_HOST } from "../config"
  import { onMount } from "svelte"

  import SlButton from "@shoelace-style/shoelace/dist/components/button/button.js"
  import SlInput from "@shoelace-style/shoelace/dist/components/input/input.js"
  import SlAlert from "@shoelace-style/shoelace/dist/components/alert/alert.js"

  let valaauth

  const unspecificErrorMessage = { title: "Something went wrong", details: "Please try again or contact Support." }

  let username = ""
  let password = ""
  let loading = false

  let username_input
  let password_input
  let login_button
  let error_alert

  let error = {}

  function initAuth() {
    console.debug("vala-auth loaded")
  }

  async function loginDefault() {
    // Necessary bc can't pass variables to shoelace
    return login(username, password)
  }

  async function login(username, password) {
    loading = true
    let savedSeed
    try {
      console.log("what")
      console.log([username, password, AUTH_HOST])
      savedSeed = await window.valaauth.login(username, password, AUTH_HOST)
      console.log("this")
    } catch (e) {
      if (e.message === "User not found") {
        error = {
          title: "User not found"
        }
      } else if (e.message === "Invalid credentials") {
        error = {
          title: "Invalid credentials"
        }
      } else {
        error = unspecificErrorMessage
      }
      console.log(e)
      loading = false
      error_alert.toast()
      return
    }

    console.log(savedSeed)

    try {
      Mnemonic.fromString(savedSeed)
    } catch (e) {
      error = unspecificErrorMessage
      loading = false
      error_alert.toast()
      return
    }

    $seed = savedSeed
    $usernameSave = username

    loading = false
    push("/")
  }

  function handleKeydown(event) {
    if (event.keyCode === 13) {
      event.preventDefault()
      if (username && password) {
        loginDefault()
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

<div class="login">
  <h1>Login to Vala</h1>

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
  </form>

  <div class="buttons">
    <sl-button
      type="primary"
      on:click={loginDefault}
      bind:this={login_button}
      disabled={!username || !password}
      {loading}>Login</sl-button
    >
    <a href="#/register"><sl-button>Create a new account</sl-button></a>
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
</style>
