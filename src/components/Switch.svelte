<script>
  export let actions
  export let color = "39baf9"
  export let selected = 0
</script>

<div class="switch" style="border: 1px solid #{color};">
  {#each actions as action, index}
    <button
      on:click={() => (selected = index)}
      style="background-color: {index === selected ? `#${color}` : `#${color}15`};"
    >
      {action}
    </button>
  {/each}
</div>

<style>
  .switch {
    border-radius: 0.375rem;
    display: flex;
    overflow: hidden;
  }

  .switch > button {
    width: 5.875rem;
    padding: 0.3125rem;
  }
</style>
