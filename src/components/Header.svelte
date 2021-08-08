<script>
  import { seed, usdBalance } from "../store/wallet"
  import { username } from "../store/profile"
  import { push, location } from "svelte-spa-router"

  import SlDropdown from "@shoelace-style/shoelace/dist/components/dropdown/dropdown"
  import SlButton from "@shoelace-style/shoelace/dist/components/button/button.js"
  import SlIconButton from "@shoelace-style/shoelace/dist/components/icon-button/icon-button.js"
  import SlIcon from "@shoelace-style/shoelace/dist/components/icon/icon.js"
  import SlMenu from "@shoelace-style/shoelace/dist/components/menu/menu.js"
  import SlMenuItem from "@shoelace-style/shoelace/dist/components/menu-item/menu-item.js"
  import SlFormatNumber from "@shoelace-style/shoelace/dist/components/format-number/format-number"
  import SlTab from "@shoelace-style/shoelace/dist/components/tab/tab"
  import SlTabGroup from "@shoelace-style/shoelace/dist/components/tab-group/tab-group"

  function logout() {
    $seed = null
    $username = null
    push("#/login")
  }

  function round(n) {
    return Math.round(n * 100) / 100
  }
</script>

<nav>
  <a href="#/"><img src="./Logo.svg" alt="vala-logo" /></a>

  <sl-tab-group class="menu-center">
    <sl-tab slot="nav" on:click={() => push("#/")} active={/(\/$)|(\/market.*)/gm.test($location)}>Markets</sl-tab>
    <sl-tab slot="nav" on:click={() => push("#/oracles")} active={/\/oracle.*/gm.test($location)}>Oracles</sl-tab>
    <sl-tab slot="nav" on:click={() => push("#/about")} active={$location === "/about"}>About</sl-tab>
  </sl-tab-group>
  <div class="menu-right">
    {#if $seed}
      <a href="#/wallet">
        <sl-format-number type="currency" currency="USD" value={round($usdBalance)} locale="en-US" />
      </a>
    {:else}
      <a href="#/login"><sl-button type="text" size="small">Log in</sl-button></a>
      <a href="#/register"><sl-button type="primary" size="small">Sign up</sl-button></a>
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
    position: absolute !important;
    left: 50% !important;
    transform: translate(-50%, 0) !important;
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

  @media screen and (max-width: 650px) {
    .menu-center {
      top: 5rem;
    }

    nav {
      margin-bottom: 5rem;
    }
  }
</style>
