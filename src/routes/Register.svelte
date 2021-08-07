<script>
  import { seed } from "../store/wallet"
  import { username as usernameSave } from "../store/profile"
  import { push } from "svelte-spa-router"
  import Mnemonic from "../utils/mnemonic"
  import { AUTH_HOST } from "../config"
  import Header from "../components/Header.svelte"
  import Loader from "../components/Loader.svelte"

  let valaauth
  let loading

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

  async function register(username, password) {
    loading = true
    try {
      await window.valaauth.register(username, password, generatedSeed, AUTH_HOST)
    } catch (e) {
      error = "Something went wrong. Please try again or contact Support."
      loading = false
      return
    }

    $seed = generatedSeed
    $usernameSave = username
    loading = false
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
        register(username, password)
      }
    }
  }
</script>

<svelte:head>
  <script src="./includes/valaauth.min.js" on:load={initAuth}></script>
</svelte:head>

<svelte:window on:keydown={handleKeydown} />

<Header />

{#if loading}
  <Loader message="Saving wallet..." />
{:else}
  <div class="login">
    <h1>Register</h1>

    {#if generatedSeed}
      This is your seed:
      <div class="seed">{generatedSeed}</div>
      <p class="warning-message">
        If you loose your password, you will loose access to your wallet! The wallet is encrypted with your password and
        stored on our servers, we will never have access to it.
      </p>

      <div class="buttons">
        <button class="action-button" on:click={() => register(username, password)}>Finish Registration</button>
        <button class="button" on:click={resetSeed}>Back</button>
      </div>
    {:else}
      <form>
        <input placeholder="username" name="username" bind:value={username} />
        <input type="password" placeholder="password" name="password" bind:value={password} />
        <input type="password" placeholder="Please repeat password" name="password2" bind:value={password2} />
      </form>

      {#if error}
        {error}
      {/if}

      <div class="buttons">
        <button on:click={generateSeed} class="action-button" disabled={!username || !password || !password2}
          >Register</button
        >
        <a class="button" href="#/login">Login</a>
      </div>
    {/if}
  </div>
{/if}

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

  .login form input {
    width: 100%;
    padding: 0.4rem;
    border: 1px solid lightgray;
    border-radius: 5px;
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

  .button {
    padding: 0.3rem;
    border: 1px solid grey;
    background-color: white;
  }

  .seed {
    padding: 0.5rem;
    margin: 0.5rem;
    background-color: white;
    border: 1px solid grey;
  }

  .warning-message {
    font-weight: bold;
  }
</style>
