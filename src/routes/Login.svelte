<script>
  import { seed } from "../store/wallet"
  import { email as emailSave, verified as verifiedSave } from "../store/profile"
  import { push } from "svelte-spa-router"
  import Mnemonic from "../utils/mnemonic"
  import Loader from "../components/Loader.svelte"
  import { AUTH_HOST } from "../config"
  import { onMount } from "svelte"
  import { getNotificationsContext } from "svelte-notifications"

  import SlButton from "@shoelace-style/shoelace/dist/components/button/button.js"
  import SlInput from "@shoelace-style/shoelace/dist/components/input/input.js"

  let valaauth

  const { addNotification } = getNotificationsContext()
  const unspecificErrorMessage = { title: "Something went wrong", details: "Please try again or contact Support." }

  let email = ""
  let password = ""
  let loading = false

  let email_input
  let password_input
  let login_button

  let error = {}

  function initAuth() {
    console.debug("vala-auth loaded")
  }

  async function loginDefault() {
    // Necessary bc can't pass variables to shoelace
    return login(email, password)
  }

  async function login(email, password) {
    loading = true
    let savedSeed
    let verified
    try {
      const loginRes = await window.valaauth.login(email, password, AUTH_HOST)
      console.log(loginRes)
      savedSeed = loginRes.seed
      verified = loginRes.verified
    } catch (e) {
      if (e.message === "User not found") {
        error = {
          title: "User not found"
        }
      } else if (e.message === "Invalid credentials") {
        error = {
          title: "Invalid credentials"
        }
      } else if (e.message === "Must be a valid email") {
        error = {
          title: "Must be a valid Email"
        }
      } else {
        error = unspecificErrorMessage
      }
      console.log(e)
      loading = false
      addNotification({
        type: "danger",
        text: error.title,
        description: error.details || "",
        position: "top-right"
      })
      return
    }

    console.log(savedSeed)

    try {
      Mnemonic.fromString(savedSeed)
    } catch (e) {
      error = unspecificErrorMessage
      loading = false
      addNotification({
        type: "danger",
        text: error.title,
        description: error.details || "",
        position: "top-right"
      })
      return
    }

    $seed = savedSeed
    $verifiedSave = verified
    $emailSave = email

    if (!verified) {
      addNotification({
        type: "warning",
        text: "Email verfication",
        description:
          "Verify your email address by clicking the link in the email you have received or receive a new email in the settings.",
        position: "top-right"
      })
    }

    loading = false
    push("/")
  }

  function handleKeydown(event) {
    if (event.keyCode === 13) {
      event.preventDefault()
      if (email && password) {
        loginDefault()
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
  })
</script>

<svelte:head>
  <script src="/includes/valaauth.min.js" on:load={initAuth}></script>
</svelte:head>

<svelte:window on:keydown={handleKeydown} />

<div class="login">
  <h1>Login to Vala</h1>

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
  </form>

  <div class="buttons">
    <sl-button type="primary" on:click={loginDefault} bind:this={login_button} disabled={!email || !password} {loading}
      >Login</sl-button
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
