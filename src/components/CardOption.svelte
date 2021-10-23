<script>
  import { formatUSD } from "../utils/format"

  export let option
  export let probability
  export let price
  export let resolved = false

  let element

  $: barWidth = element ? Math.round(probability * element.clientWidth) : 0
</script>

<div class="option" bind:this={element}>
  <div class="labels">
    <div class="name">{option.name}</div>
    {#if !resolved}
      <div class="price">{formatUSD(price)}</div>
    {/if}
  </div>
  {#if !isNaN(probability) && probability > 0 && probability < 100}
    <div class="percent">{Math.round(probability * 100)}%</div>
  {/if}
  <div class="bar" style="width: {barWidth}px;" />
</div>

<style>
  .option {
    background-color: #323841;
    padding: 0 1.25rem;
    height: 2.75rem;
    border-radius: 0.375rem;
    position: relative;
    overflow: hidden;
  }

  .labels {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 100%;
    position: relative;
  }

  .labels,
  .percent {
    z-index: 3;
  }

  .percent {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }

  .bar {
    position: absolute;
    left: 0;
    top: 0;
    background-color: #434c56;
    height: 2.75rem;
  }

  .percent {
    opacity: 50%;
    font-size: 14px;
    font-family: "Roboto Mono", sans-serif;
  }

  .price {
    font-family: "Roboto Mono", sans-serif;
    font-weight: 500;
    opacity: 50%;
  }
</style>
