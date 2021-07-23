<script>
  import { seed } from "../store/wallet"
  import { push } from "svelte-spa-router"
  import Mnemonic from "../utils/mnemonic"
  import { AUTH_HOST } from "../config"

  let valaauth

  let username
  let password
  let password2

  let generatedSeed

  let error

  function initAuth() {
    console.debug("vala-auth loaded")
  }

  async function generateSeed() {
    if (password !== password2) {
      error = "Passwords do not match"
      return
    }

    generatedSeed = Mnemonic.fromRandom().toString()
  }

  async function register() {
    console.log("test")
    try {
      await window.valaauth.register(username, password, generatedSeed, AUTH_HOST)
    } catch (e) {
      error = "Something went wrong. Please try again or contact Support."
      return
    }

    $seed = generatedSeed
    push("/")
  }

  function resetSeed() {
    generatedSeed = undefined
  }

  function handleKeydown(event) {
    if (event.keyCode === 13) {
      event.preventDefault()
      if (!generatedSeed && username && password) {
        generateSeed()
      } else if (generatedSeed) {
        register()
      }
    }
  }
</script>

<svelte:head>
  <script src="./includes/valaauth.min.js" on:load={initAuth}></script>
</svelte:head>

<svelte:window on:keydown={handleKeydown} />

<h1>Register</h1>

{#if generatedSeed}
  This is your seed: <br />
  {generatedSeed}
  <br />
  If you loose your password, you will loose access to your wallet!

  <button on:click={register}>Finish Registration</button>
  <button on:click={resetSeed}>Back</button>
{:else}
  <form>
    <input placeholder="username" name="username" bind:value={username} />
    <input type="password" placeholder="password" name="password" bind:value={password} />
    <input type="password" placeholder="Please repeat password" name="password2" bind:value={password2} />
  </form>

  {#if error}
    {error}
  {/if}

  <button on:click={generateSeed} disabled={!username || !password || !password2}>Register</button>
{/if}

<a href="#/login">Login</a>
