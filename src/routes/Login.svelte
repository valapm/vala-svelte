<script>
  import { seed } from "../store/wallet"
  import { email as emailSave, verified as verifiedSave } from "../store/profile"
  import { push } from "svelte-spa-router"
  import Mnemonic from "../utils/mnemonic"
  import Loader from "../components/Loader.svelte"
  import { AUTH_HOST } from "../config"
  import { onMount } from "svelte"
  import { EMAIL_REGEX } from "../utils/email"
  import { notify } from "../store/notifications"

  import Button from "../components/Button.svelte"
  import PasswordInput from "../components/PasswordInput.svelte"

  let valaauth

  const unspecificErrorMessage = { title: "Something went wrong", details: "Please try again or contact Support." }

  let email = ""
  let password = ""
  let loading = false

  let error = {}

  function initAuth() {
    console.debug("vala-auth loaded")
  }

  async function login(email, password) {
    loading = true

    const isValidEmail = email && EMAIL_REGEX.test(email)
    if (!isValidEmail) {
      notify({
        type: "danger",
        text: "Please enter a valid email address"
      })
      loading = false
      return
    }

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
      notify({
        type: "danger",
        text: error.title,
        description: error.details || ""
      })
      return
    }

    console.log(savedSeed)

    try {
      Mnemonic.fromString(savedSeed)
    } catch (e) {
      error = unspecificErrorMessage
      loading = false
      notify({
        type: "danger",
        text: error.title,
        description: error.details || ""
      })
      return
    }

    $seed = savedSeed
    $verifiedSave = verified
    $emailSave = email

    if (!verified) {
      notify({
        type: "warning",
        text: "Email verfication",
        description:
          "Verify your email address by clicking the link in the email you have received or receive a new email in the settings."
      })
    }

    loading = false
    push("/")
  }

  function handleKeydown(event) {
    if (event.keyCode === 13) {
      event.preventDefault()
      if (email && password) {
        login(email, password)
      }
    }
  }

  onMount(() => {
    if ($seed) push("/")
  })
</script>

<svelte:head>
  <script src="/includes/valaauth.min.js" on:load={initAuth}></script>
</svelte:head>

<svelte:window on:keydown={handleKeydown} />

<div class="login">
  <h1>Login to Vala</h1>

  <div class="inputs">
    <input placeholder="Email" name="email" type="email" bind:value={email} />
    <PasswordInput placeholder="Password" bind:value={password} />
  </div>

  <div class="buttons">
    <Button type="filled full-width" on:click={() => login(email, password)} disabled={!email || !password} {loading}
      >Login</Button
    >
    <Button type="full-width" on:click={() => push("/register")}>Create a new account</Button>
  </div>
</div>

<style>
  .login {
    display: flex;
    flex-direction: column;
    margin-top: 10rem;
    gap: 2rem;
    text-align: center;
    /* width: min(90%, 15rem); */
    align-items: center;
    width: min(18rem, 95%);
  }

  .inputs {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;
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
    width: 100%;
  }

  input {
    border-radius: 0.375rem;
    width: 100%;
    height: 2.8125rem;
    padding: 0 1.25rem;
    background-color: #323841;
  }
</style>
