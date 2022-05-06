<script>
  import { isValidUrl, parseHostname } from "../utils/url"
  import { createEventDispatcher } from "svelte"
  import { backendHost } from "../config"
  import { fade } from "svelte/transition"

  import Property from "./Property.svelte"

  export let oracle
  export let large = false
  export let button = false

  const dispatch = createEventDispatcher()

  let icon

  $: hostname = parseHostname(oracle.oracleStateByCurrentstateid.domain)
  $: joined = large ? new Date(oracle.oracle_state.state.transaction.processedAt + "Z") : undefined
</script>

<div id="oracle_card" on:click={() => dispatch("click")} class={button ? "button" : ""} in:fade>
  <div class="header">
    <div id="title">
      <img
        src="{backendHost}/static/{hostname}.ico"
        alt="icon"
        bind:this={icon}
        on:error={() => (icon.style.display = "none")}
      />
      <h2>{oracle.oracleStateByCurrentstateid.domain}</h2>
    </div>
    <div class="properties">
      <Property label="Open Markets">{oracle.num_open_markets.aggregate.count}</Property>
      <Property label="Resolved Markets">{oracle.num_resolved_markets.aggregate.count}</Property>
    </div>
  </div>

  {#if large}
    {#if oracle.oracleStateByCurrentstateid.details}
      {oracle.oracleStateByCurrentstateid.details}
    {/if}

    <div class="footer">
      Joined: {new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(joined)}
    </div>
  {/if}
</div>

<style>
  #oracle_card {
    width: 100%;
    background-color: #323841;
    padding: 2rem;
    border-radius: 0.375rem;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 1.75rem;
  }

  .button {
    cursor: pointer;
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    /* height: 6.5rem; */
  }

  .footer {
    opacity: 50%;
    font-weight: 700;
    font-family: "Roboto Mono", sans-serif;
  }

  .properties {
    display: flex;
    gap: 2.125rem;
  }

  #title {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .header img {
    height: 2.75rem;
  }

  h2 {
    font-size: 2.125rem;
    font-weight: 700;
  }
</style>
