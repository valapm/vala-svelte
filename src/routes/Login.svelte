<script>
  import { seed } from "../store/wallet"
  import { username as usernameSave } from "../store/profile"
  import { push } from "svelte-spa-router"
  import Mnemonic from "../utils/mnemonic"
  import Header from "../components/Header.svelte"
  import Loader from "../components/Loader.svelte"
  import { AUTH_HOST } from "../config"

  let valaauth

  const unspecificErrorMessage = "Something went wrong. Please try again or contact Support."

  let username
  let password
  let loading = false

  let error

  function initAuth() {
    console.debug("vala-auth loaded")
  }

  async function login(username, password) {
    loading = true
    let savedSeed
    try {
      savedSeed = await window.valaauth.login(username, password, AUTH_HOST)
    } catch (e) {
      if (e.message === "User not found" || e.message === "Invalid credentials") {
        error = e.message
      } else {
        error = unspecificErrorMessage
      }
      console.log([username, password, AUTH_HOST])
      console.log(e)
      loading = false
      return
    }

    console.log(savedSeed)

    try {
      Mnemonic.fromString(savedSeed)
    } catch (e) {
      error = unspecificErrorMessage
      loading = false
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
        login()
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
  <Loader message="Decrypting wallet..." />
{:else}
  <div class="login">
    <h1>Login to Vala</h1>

    <form>
      <input placeholder="Username" name="username" bind:value={username} />
      <input type="password" placeholder="Password" name="password" bind:value={password} />
    </form>

    {#if error}
      {error}
    {/if}

    <div class="buttons">
      <button class="action-button" on:click={() => login(username, password)} disabled={!username || !password}
        >Login</button
      >
      <a href="#/register">Create a new account</a>
    </div>
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

  .buttons a {
    padding: 0.3rem;
    border: 1px solid grey;
    background-color: white;
  }
</style>
