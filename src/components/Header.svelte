<script>
  import { seed, usdBalance } from "../store/wallet"
  import { username } from "../store/profile"
  import { push } from "svelte-spa-router"

  import SlDropdown from "@shoelace-style/shoelace/dist/components/dropdown/dropdown"
  import SlButton from "@shoelace-style/shoelace/dist/components/button/button.js"
  import SlIconButton from "@shoelace-style/shoelace/dist/components/icon-button/icon-button.js"
  import SlIcon from "@shoelace-style/shoelace/dist/components/icon/icon.js"
  import SlMenu from "@shoelace-style/shoelace/dist/components/menu/menu.js"
  import SlMenuItem from "@shoelace-style/shoelace/dist/components/menu-item/menu-item.js"

  function logout() {
    $seed = null
    $username = null
    push("#/login")
  }
</script>

<nav>
  <a href="#/"><img src="./Logo.svg" alt="vala-logo" /></a>
  <div class="menu-center">
    <a href="#/">Markets</a>
    <a href="#/oracles">Oracles</a>
    <a href="#/about">About</a>
  </div>
  <div class="menu-right">
    {#if $seed}
      <a href="#/wallet">${$usdBalance}</a>
    {:else}
      <a href="#/login">Log in</a>
      <a href="#/register" class="signup-button">Sign up</a>
    {/if}
    <!-- <a href="#/options"><img class="dropdown" src="./icons/bars.svg" alt="dropdown" /></a> -->
    <!-- <button on:click={() => (dropdown = true)}><img class="dropdown" src="./icons/bars.svg" alt="dropdown" /></button> -->
    {#if $seed}
      <sl-dropdown>
        <sl-icon-button slot="trigger" name="list" label="Menu" />
        <sl-menu>
          <sl-menu-item><a href="#/wallet"> {$username}</a><sl-icon slot="prefix" name="wallet" /></sl-menu-item>
          <sl-menu-item
            ><a href="#/options"> Options</a>
            <sl-icon slot="prefix" name="gear" /></sl-menu-item
          >
          <sl-menu-item
            ><button on:click={logout}>Logout</button><sl-icon slot="prefix" name="box-arrow-left" /></sl-menu-item
          >
        </sl-menu>
      </sl-dropdown>
    {/if}
  </div>
</nav>

<style>
  nav {
    display: flex;
    align-items: center;
    height: 5rem;
    padding: 2rem;
    justify-content: space-between;
    margin-bottom: 4rem;
  }

  nav img {
    height: 2rem;
  }

  .menu-center {
    position: absolute;
    left: 50%;
    transform: translate(-50%, 0);
  }

  .menu-center,
  .menu-right {
    display: flex;
    gap: 1rem;
    align-items: center;
  }

  .signup-button {
    border-radius: 3px;
    background-color: #1b3fbc;
    color: white;
    padding: 0.1rem 0.5rem;
    font-weight: bold;
  }

  sl-icon-button {
    font-size: 1.5rem;
    /* filter: invert(17%) sepia(90%) saturate(2821%) hue-rotate(225deg) brightness(89%) contrast(97%); */
  }
</style>
