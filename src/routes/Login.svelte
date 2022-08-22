<script>
  import { seed } from "../store/wallet"
  import { push } from "svelte-spa-router"
  import Mnemonic from "../utils/mnemonic"
  import Loader from "../components/Loader.svelte"
  import { AUTH_HOST } from "../config"
  import { onMount } from "svelte"
  import { notify } from "../store/notifications"
  import { patp2hex } from "urbit-ob"

  import Button from "../components/Button.svelte"
  import PasswordInput from "../components/PasswordInput.svelte"
  import Modal from "../components/Modal.svelte"
  import WalletCreation from "../components/WalletCreation.svelte"

  let valaauth

  const unspecificErrorMessage = { title: "Something went wrong", details: "Please try again or contact Support." }

  let username
  let password = ""
  let loading = false

  let error = {}

  function initAuth() {
    console.debug("vala-auth loaded")
  }

  async function login(username, password) {
    loading = true

    let savedSeed

    let userId
    try {
      userId = patp2hex(username)
    } catch (e) {
      console.log(e)
      notify({
        type: "danger",
        text: "Not a valid username"
      })
      loading = false
      return
    }

    try {
      const loginRes = await window.valaauth.login(userId, password, AUTH_HOST)
      console.log(loginRes)
      savedSeed = loginRes.seed
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

    loading = false
    push("/")
  }

  function handleKeydown(event) {
    if (event.keyCode === 13) {
      event.preventDefault()
      if (username && password) {
        login(username, password)
      }
    }
  }

  function addTilde() {
    if (username && !username.startsWith("~")) username = "~" + username
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
    <input placeholder="Wallet ID" name="username" type="text" bind:value={username} on:input={addTilde} />
    <PasswordInput placeholder="Password" bind:value={password} />
  </div>

  <div class="buttons">
    <Button
      type="filled full-width"
      on:click={() => login(username, password)}
      disabled={!username || !password}
      {loading}>Login</Button
    >
    <Button type="full-width" on:click={() => push("/register")}>Create a new wallet</Button>
    <Button type="full-width" on:click={() => push("/recover")}>Recover wallet</Button>
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

  .modal {
    display: flex;
    flex-direction: column;
    color: white;
    padding: 1.7rem 2.8rem;
    align-items: center;
    gap: 2rem;
    max-width: 35rem;
  }

  @media screen and (max-width: 425px) {
    .login {
      margin-top: 5rem;
    }
  }
</style>
