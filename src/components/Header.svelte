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

  let oracle

  async function fetchOracle() {
    const oracleQuery = gql`
    query {
      oracle(where: {pubKey: {_eq: "${$rabinPubKey}"}}) {
        hasCorrectDNS
        oracle_state {
          domain
        }
      }
    }`

    const oracleData = await gqlClient.request(oracleQuery)
    oracle = oracleData.oracle[0]
  }

  $: if ($rabinPubKey) {
    fetchOracle()
  }

  $: isOracle = oracle && oracle.oracle_state[0] && oracle.oracle_state[0].domain

  let width
</script>

<svelte:window bind:outerWidth={width} />

{#if testnet}
  <div class="testnet-bar">Testnet</div>
{/if}
<nav>
  <div class="menu-main">
    <div class="menu-left">
      <Logo />
    </div>
    <div class="menu-right">
      {#if width > 580}
        <div class="menu">
          <a href="#/markets"><Button type="text" active={/\/market.*/gm.test($location)}>Markets</Button></a>
          <a href="#/oracles"><Button type="text" active={/\/oracle.*/gm.test($location)}>Oracles</Button></a>
          <a href="https://blog.vala.ai/"><Button type="text">Blog</Button></a>
          <!-- <a href="https://docs.vala.ai/"><Button type="text">Docs</Button></a> -->
        </div>
      {/if}

      {#if $seed}
        {#if isOracle}
          <a href="#/oracle" class="button">{oracle.oracle_state[0].domain}</a>
        {/if}

        <a class="button" href="#/wallet">
          <img src="/icons/wallet.svg" alt="" />
          ${round($usdBalance)}
        </a>
      {/if}

      {#if !$seed}
        {#if width >= 580}
          <a href="#/login"><Button>Sign in</Button></a>
        {/if}
        <a href="#/register"><Button type="filled">Sign up</Button></a>
      {/if}

      <DropdownMenu {isOracle} />
    </div>
  </div>
  {#if width < 580}
    <div class="menu-mobile menu">
      <a href="#/markets"><Button type="text" active={/\/market.*/gm.test($location)}>Markets</Button></a>
      <a href="#/oracles"><Button type="text" active={/\/oracle.*/gm.test($location)}>Oracles</Button></a>
      <a href="https://blog.vala.ai/"><Button type="text">Blog</Button></a>
      <!-- <a href="https://docs.vala.ai/"><Button type="text">FAQ</Button></a> -->
    </div>
  {/if}
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
    /* height: 6.25rem; */
    background-color: #1f2329;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .menu-main {
    width: min(65rem, 90%);
    height: 100%;
    gap: 2rem;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin: 1.5rem 2rem;
  }

  .menu-main img {
    height: 2rem;
  }
  .menu-left {
    height: 2.4rem;
    overflow: hidden;
    flex-shrink: 1;
    min-width: 2.4rem;
  }

  .menu-mobile {
    margin: 1rem 2rem;
  }

  .menu-right,
  .menu {
    display: flex;
    gap: 2rem;
    align-items: center;
  }

  .menu-right > :global(*) {
    flex-shrink: 0;
  }

  .menu-right {
    /* flex-wrap: wrap-reverse; */
    justify-content: flex-end;
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

  @media screen and (max-width: 800px) {
    .menu,
    .menu-right {
      gap: 1rem;
    }
  }
</style>
