<script>
  import { seed, usdBalance } from "../store/wallet"
  import { push, location } from "svelte-spa-router"
  import { testnet } from "../config"
  import { rabinPubKey } from "../store/oracle"
  import { gqlClient } from "../utils/graphql"
  import { gql } from "graphql-request"
  import { onMount } from "svelte"

  import Button from "./Button.svelte"
  import DropdownMenu from "./DropdownMenu.svelte"
  import Logo from "./Logo.svelte"

  function round(n) {
    return Math.round(n * 100) / 100
  }

  const oracleQuery = gql`
    query {
      oracle(where: {pubKey: {_eq: "${$rabinPubKey}"}}) {
        hasCorrectDNS
        oracleStateByCurrentstateid {
          domain
        }
      }
    }`

  let oracle

  $: isOracle = oracle && oracle.oracleStateByCurrentstateid && oracle.oracleStateByCurrentstateid.domain

  onMount(async () => {
    const oracleData = await gqlClient.request(oracleQuery)
    oracle = oracleData.oracle[0]
    console.log(oracle)
  })
</script>

{#if testnet}
  <div class="testnet-bar">Testnet</div>
{/if}
<nav>
  <div class="menu-main">
    <div class="menu-left">
      <Logo />

      <div class="menu-center" />
    </div>
    <div class="menu-right">
      <a href="#/markets"
        ><Button type="text" on:click={() => push("#/markets")} active={/\/market.*/gm.test($location)}>Markets</Button
        ></a
      >
      <a href="#/oracles"
        ><Button type="text" on:click={() => push("#/oracles")} active={/\/oracle.*/gm.test($location)}>Oracles</Button
        ></a
      >
      <a href="#/faq"
        ><Button type="text" on:click={() => push("#/faq")} active={/\/faq.*/gm.test($location)}>FAQ</Button></a
      >

      {#if $seed}
        {#if isOracle}
          <a href="#/oracle" class="button">{oracle.oracleStateByCurrentstateid.domain}</a>
        {/if}

        <a class="button" href="#/wallet">
          <img src="/icons/wallet.svg" alt="" />
          ${round($usdBalance)}
        </a>
      {/if}

      {#if $seed}
        <DropdownMenu {isOracle} />
      {:else}
        <a href="#/login"><Button>Sign in</Button></a>
        <a href="#/register"><Button type="filled">Sign up</Button></a>
      {/if}
    </div>
  </div>
</nav>

<style>
  .testnet-bar {
    width: 100%;
    height: 1rem;
    background-color: #ffa800;
    color: #1f2329;
    display: flex;
    justify-content: center;
    gap: 10rem;
    font-size: 0.8rem;
    font-family: "Roboto Mono", sans-serif;
  }

  nav {
    height: 6.25rem;
    background-color: #1f2329;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .menu-main {
    width: min(65rem, 95%);
    height: 100%;
    gap: 2rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .menu-main img {
    height: 2rem;
  }
  .menu-left {
    display: flex;
    column-gap: 2rem;
    row-gap: 1rem;
    align-items: center;
    flex-wrap: wrap;
  }

  .menu-center,
  .menu-right {
    display: flex;
    gap: 2rem;
    align-items: center;
  }

  .button {
    display: flex;
    align-items: center;
    padding: 0.625rem 1rem;
    gap: 0.625rem;
    background-color: #35393e;
    border-radius: 0.375rem;
  }

  .button img {
    height: 1rem;
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
