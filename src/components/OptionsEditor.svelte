<script>
  import { options, numOptions } from "../store/createMarket"

  import X from "../icons/X.svelte"
  import Slider from "./Slider.svelte"
  import AutoResizeTextarea from "./AutoResizeTextarea.svelte"

  export let editable = true
  export let min = 2
  export let max = 6

  function addOption() {
    $numOptions += 1
  }

  function removeOption(index) {
    $options = $options.slice(0, index).concat($options.slice(index + 1))
    $numOptions -= 1
  }

  $: {
    if ($options.length > $numOptions) {
      $options = $options.slice(0, $numOptions)
    } else if ($options.length < $numOptions) {
      const diff = $numOptions - $options.length
      for (let i = 0; i < diff; i++) {
        $options.push({
          name: "",
          details: ""
        })
      }
      $options = $options
    }
  }
</script>

{#if editable}
  <div class="slider">
    <div>
      <span>Number of possible Outcomes</span>
      <span class="count" style="font-weight: 700;">{$numOptions}</span>
    </div>
    <Slider bind:value={$numOptions} min="2" max="6" />
  </div>
{/if}
<div class="optionOverview">
  {#each $options as option, index}
    <div>
      <div class="header">
        <input
          class="title"
          bind:value={option.name}
          placeholder="Title"
          disabled={!editable}
        />{#if editable && $options.length > min}
          <button on:click={() => removeOption(index)}><X /></button>
        {/if}
      </div>

      {#if option.details || editable}
        <AutoResizeTextarea bind:value={option.details} {editable} />
      {/if}
    </div>
  {/each}

  {#if $options.length < max && editable}
    <button on:click={addOption}>+</button>
  {/if}
</div>

<style>
  .slider {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    width: 100%;
    gap: 0.4rem;
  }

  .slider div {
    opacity: 50%;
    font-weight: 500;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .optionOverview {
    background-color: #1f2329;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    border-radius: 0.5625rem;
    color: #b9b9b9;
    padding: 1rem;
    width: 100%;
  }

  .optionOverview > div {
    background-color: #323841;
    border-radius: 0.375rem;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .optionOverview .title {
    font-weight: 500;
  }

  .optionOverview input {
    background-color: #ffffff00;
    width: 100%;
  }

  .optionOverview .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
</style>
