<script>
  import { createEventDispatcher } from "svelte"
  import { slide } from "svelte/transition"

  const dispatch = createEventDispatcher()

  import Chevron from "../components/Chevron.svelte"

  export let title
  export let open = false
  export let deactivated = false
  export let gradient = 0
  export let color = "39BAF9"
  export let limitTitle

  $: if (open) dispatch("opened")
</script>

<div
  class="card"
  style={open
    ? `border: 1px solid #${color};
box-shadow: 0 0 1.125rem #${color}80;`
    : ""}
>
  <div
    class="header"
    on:click={() => {
      if (!deactivated) open = !open
    }}
    style={deactivated ? "opacity: 50%;" : ""}
  >
    <div class="open" />
    <h3>
      <Chevron color={deactivated ? "ffffff" : color} style={open ? "transform: rotate(90deg);" : ""} />
      <span style={limitTitle ? `max-width: ${limitTitle};` : ""}>{title}</span>
    </h3>
    <slot name="header" />
  </div>

  {#if open}
    <div transition:slide|local={{ duration: 300 }} style="width: 100%">
      <div class="body">
        <slot name="body" />
      </div>
    </div>
  {/if}

  {#if gradient && !deactivated}
    <div class="gradient" style="width: {gradient}%;" />
  {/if}
</div>

<style>
  .open {
    position: absolute;
    width: min(18.75rem, 100%);
    height: 3.25rem;
    left: 0;
    top: 0;
  }

  .body {
    margin-top: 1.25rem;
  }

  .card {
    width: 100%;
    padding: 1rem 1.125rem;
    background-color: #323841;
    border-radius: 0.375rem;
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    align-items: center;
    z-index: 0;
    /* gap: 1.25rem; */
    border: 1px solid #323841;
    transition: all 0.15s ease-in-out;
  }

  .header {
    display: flex;
    justify-content: space-between;
    cursor: pointer;
    width: 100%;
    z-index: 1;
  }

  .header > h3 {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    font-weight: 700;
  }

  .gradient {
    position: absolute;
    left: 0;
    top: 0;
    height: 5.875rem;
    background: linear-gradient(180deg, #434c56 7.81%, rgba(67, 76, 86, 0) 100%);
    z-index: -1;
  }
</style>
