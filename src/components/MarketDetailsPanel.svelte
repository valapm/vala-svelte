<script>
  import { testnet } from "../config"
  import { pm } from "bitcoin-predict"

  export let market

  let version
  $: {
    try {
      version = pm.getMarketVersion(market.version)
    } catch {}
  }

  let tab = 0

  $: console.log("market", market)
</script>

<div id="marketPanel">
  <div class="header">
    <button class={tab === 0 ? "selected" : ""} on:click={e => (tab = 0)}>Description</button>
    {#each market.options as option, index}
      <button class="name {tab === index + 1 ? 'selected' : ''}" on:click={e => (tab = index + 1)}>{option.name}</button
      >
    {/each}
  </div>
  <div class="body">
    {#if tab === 0}
      {market.details}
      <div class="version">
        Market Version: <a
          href="https://{testnet ? 'test.' : ''}whatsonchain.com/tx/{market.market_state[0].state.transaction.txid}"
          >{version ? version.version : "?"}</a
        >
      </div>
    {:else}
      <h1>{market.options[tab - 1].name}</h1>
      {market.options[tab - 1].details}
    {/if}
  </div>
</div>

<style>
  #marketPanel {
    width: 100%;
    border-radius: 0.375rem;
    border: 1px solid #60616d;
    background-color: #272c33;
    font-size: 0.875rem;
    overflow: hidden;
  }

  .header {
    background-color: #323841;
    border-bottom: 1px solid #60616d;
    display: flex;
    gap: 1.5rem;
  }

  .header button {
    font-weight: 500;
  }

  .body {
    font-weight: 400;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    white-space: pre-wrap;
  }

  .version {
    font-family: "Roboto Mono", sans-serif;
    color: #939599;
    text-align: right;
    width: 100%;
  }

  .version a {
    color: #ffffff;
    text-decoration: underline;
  }

  .header,
  .body {
    padding: 0.875rem;
  }

  .selected {
    background: linear-gradient(150deg, rgba(1, 167, 129, 1) 0%, rgba(0, 255, 197, 1) 100%);
    background-clip: text;
    color: transparent;
  }

  .name {
    overflow: hidden;
    max-width: 6rem;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  h1 {
    font-size: 1.5rem;
    font-weight: 500;
  }
</style>
