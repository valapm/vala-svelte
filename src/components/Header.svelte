<script>
  import { seed, usdBalance } from "../store/wallet"
  import { push, location } from "svelte-spa-router"
  import { testnet } from "../config"

  import SlDropdown from "@shoelace-style/shoelace/dist/components/dropdown/dropdown"
  import SlButton from "@shoelace-style/shoelace/dist/components/button/button.js"
  import SlIconButton from "@shoelace-style/shoelace/dist/components/icon-button/icon-button.js"
  import SlIcon from "@shoelace-style/shoelace/dist/components/icon/icon.js"
  import SlMenu from "@shoelace-style/shoelace/dist/components/menu/menu.js"
  import SlMenuItem from "@shoelace-style/shoelace/dist/components/menu-item/menu-item.js"
  import SlFormatNumber from "@shoelace-style/shoelace/dist/components/format-number/format-number"
  import SlTab from "@shoelace-style/shoelace/dist/components/tab/tab"
  import SlTabGroup from "@shoelace-style/shoelace/dist/components/tab-group/tab-group"
  import SlSelect from "@shoelace-style/shoelace/dist/components/select/select"

  let networkSelect

  function round(n) {
    return Math.round(n * 100) / 100
  }
</script>

<nav>
  <div class="menu-main">
    <div class="menu-left">
      <a href={$seed ? "#/markets" : "#/"} class="logo"><img src="/Logo.svg" alt="vala-logo" /></a>

      <div class="menu-center">
        <sl-tab on:click={() => push("#/markets")} active={/\/market.*/gm.test($location)}>Markets</sl-tab>
        <sl-tab on:click={() => push("#/oracles")} active={/\/oracle.*/gm.test($location)}>Oracles</sl-tab>
      </div>
    </div>
    <div class="menu-right">
      {#if $seed}
        <sl-select
          size="small"
          value={testnet ? "testnet" : "mainnet"}
          bind:this={networkSelect}
          on:sl-change={() => {
            if (networkSelect.value === "testnet") {
              window.location.href = window.location.origin + "/test/"
            } else {
              window.location.href = window.location.origin
            }
          }}
        >
          <sl-menu-item value="mainnet">Mainnet</sl-menu-item>
          <sl-menu-item value="testnet">Testnet</sl-menu-item>
        </sl-select>
      {/if}

      <!-- <a href="#/options"><img class="dropdown" src="./icons/bars.svg" alt="dropdown" /></a> -->
      <!-- <button on:click={() => (dropdown = true)}><img class="dropdown" src="./icons/bars.svg" alt="dropdown" /></button> -->
      {#if $seed}
        <sl-dropdown>
          <sl-icon-button slot="trigger" name="list" label="Menu" />
          <sl-menu>
            <sl-menu-item on:click={() => push("#/wallet")}>
              <b><sl-format-number type="currency" currency="USD" value={round($usdBalance)} locale="en-US" /></b>
              <sl-icon slot="prefix" name="wallet" /></sl-menu-item
            >
            <sl-menu-item on:click={() => push("#/options")}
              >Options
              <sl-icon slot="prefix" name="gear" /></sl-menu-item
            >
            <sl-menu-item on:click={() => push("#/logout")}
              >Logout<sl-icon slot="prefix" name="box-arrow-left" /></sl-menu-item
            >
          </sl-menu>
        </sl-dropdown>
      {:else}
        <a href="#/login"><sl-button type="text" size="small">Log in</sl-button></a>
        <a href="#/register"><sl-button type="primary" size="small">Sign up</sl-button></a>
      {/if}
    </div>
  </div>
</nav>

<style>
  nav {
    margin-bottom: 4rem;
    height: 5rem;
    padding: 2rem;
  }

  .menu-main {
    gap: 2rem;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 1rem;
  }

  .menu-main img {
    height: 2rem;
  }

  .logo {
    flex-shrink: 0;
  }

  sl-select sl-menu-item::part(base) {
    font-size: var(--sl-font-size-small);
  }

  sl-tab::part(base):focus {
    box-shadow: none;
  }

  .menu-left {
    display: flex;
    column-gap: 2rem;
    row-gap: 1rem;
    align-items: center;
    flex-wrap: wrap;
  }

  .menu-center sl-tab::part(base) {
    padding: 0.5rem;
  }
  .menu-center,
  .menu-right {
    display: flex;
    gap: 1rem;
    align-items: center;
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
