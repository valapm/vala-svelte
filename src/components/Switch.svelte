<script>
  export let actions
  export let color = "39baf9"
  export let selected = 0

  $: if (actions && actions[selected].disabled) selected = 0
</script>

<div class="switch">
  {#each actions as action, index}
    <button
      on:click={() => {
        if (!action.disabled) selected = index
      }}
      class="{action.disabled ? 'disabled' : ''} {index === actions.length - 1
        ? 'last'
        : index === 0
        ? 'first'
        : 'center'} "
      style="background-color: {action.disabled
        ? '#434c56'
        : index === selected
        ? `#${color}`
        : `#${color}25`}; border-color: #{color};"
      disabled={action.disabled}
    >
      {action.title}
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

  .disabled {
    opacity: 40%;
  }

  .first {
    border-top-left-radius: 0.375rem;
    border-bottom-left-radius: 0.375rem;
    border-width: 1px 0 1px 1px;
  }

  .last {
    border-top-right-radius: 0.375rem;
    border-bottom-right-radius: 0.375rem;
    border-width: 1px 1px 1px 0;
  }

  .center {
    border-width: 1px 0;
  }
</style>
