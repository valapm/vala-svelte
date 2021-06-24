<script>
  import { seed } from "../store/wallet"
  import { push } from "svelte-spa-router"
  import Mnemonic from "../utils/mnemonic"

  let valaauth

  const unspecificErrorMessage = "Something went wrong. Please try again or contact Support."

  let username
  let password

  let error

  function initAuth() {
    console.debug("vala-auth loaded")
  }

  async function login() {
    let savedSeed
    try {
      savedSeed = await window.valaauth.login(username, password)
    } catch (e) {
      if (e.message === "User not found" || e.message === "Invalid credentials") {
        error = e.message
      } else {
        error = unspecificErrorMessage
      }
      console.log(e)
      return
    }

    console.log(savedSeed)

    try {
      Mnemonic.fromString(savedSeed)
    } catch (e) {
      error = unspecificErrorMessage
      return
    }

    $seed = savedSeed
    push("/")
  }

  function handleKeydown(event) {
    if (event.keyCode === 13) {
      event.preventDefault()
      if (username && password) {
        login()
      }
    }
  }
</script>

<svelte:head>
  <script src="./includes/valaauth.min.js" on:load={initAuth}></script>
</svelte:head>

<svelte:window on:keydown={handleKeydown} />

<h1>Login</h1>

<form>
  <input placeholder="username" name="username" bind:value={username} />
  <input type="password" placeholder="password" name="password" bind:value={password} />
</form>

{#if error}
  {error}
{/if}

<button on:click={login} disabled={!username || !password}>Login</button>

<a href="#/register">Register</a>
