<script>
  import { createEventDispatcher } from "svelte"

  const dispatch = createEventDispatcher()

  export let type = ""
  export let active = false
  export let disabled = false
  export let loading = false
</script>

<button on:click={() => dispatch("click")} class="{type} {disabled ? 'disabled' : ''} {active ? 'active' : ''}"
  ><slot /></button
>

<style>
  button {
    border-radius: 0.375rem;
    padding: 0.625rem 1.5rem;
    display: flex;
    justify-content: center;
    align-items: center;
    color: white;
    border: 1px solid #01a781;
    line-height: 1.1875em; /* Figma does this for some reason */
  }

  .filled {
    border: none;
    background-color: #01a781;
  }

  .blue {
    border: none;
    background-color: #5184e7;
  }

  .text {
    border: none;
    opacity: 50%;
    padding: 0;
  }

  .active {
    font-weight: 700;
  }

  .disabled {
    opacity: 50%;
  }
</style>
