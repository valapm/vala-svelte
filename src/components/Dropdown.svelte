<script>
  import { seed } from "../store/wallet"
  import { email, username } from "../store/profile"
  import { push } from "svelte-spa-router"

  export let show = false

  function logout() {
    $seed = null
    $email = null
    $username = null
    push("#/login")
  }
</script>

{#if show}
  <div class="modal">
    <div class="modal-bg" on:click={() => (show = false)} />
    <div class="menu">
      {#if $seed}
        <div>Logged in as {$email}</div>
        <a href="#/options">Options</a>
        <button on:click={logout}>Logout</button>
      {/if}
    </div>
  </div>
{/if}

<style>
  .menu {
    position: absolute;
    top: 4rem;
    right: 1rem;
    border: 1px solid grey;
    background-color: white;
    display: flex;
    flex-direction: column;
    width: 12rem;
    overflow-y: auto;
  }

  .menu > * {
    padding: 0.3rem;
    border: 1px solid grey;
    text-align: left;
  }

  .modal {
    position: fixed;
    width: 100vw;
    height: 100vh;
    transition: all 0.3s ease;
    top: 0;
    left: 0;
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
  }

  .modal-bg {
    position: absolute;
    /* background: rgb(186, 186, 186, 0.6); */
    width: 100%;
    height: 100%;
  }
</style>
