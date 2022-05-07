<script>
  export let value = undefined
  export let placeholder = undefined
  export let min = undefined
  export let max = undefined
  export let color = "39baf9"
  export let backgroundColor = "434c56"
</script>

<div style="{max !== undefined ? '' : 'padding-right: 1.25rem'} background-color: #{backgroundColor}">
  <input type="number" {placeholder} {min} {max} bind:value />
  {#if max !== undefined}<button on:click={() => (value = max)} style="border: 1px solid #{color};">max</button>{/if}
</div>

<style>
  div {
    border-radius: 0.375rem;
    width: 100%;
    height: 2.8125rem;
    padding: 0 0.4375rem 0 1.25rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    justify-content: space-between;
    color: #d8d9e5;
  }

  input {
    flex-grow: 1;
    height: 100%;
    background-color: transparent;
    min-width: 0;
    width: auto;
  }

  input::placeholder {
    font-size: 1rem;
    font-weight: 500;
  }

  input:focus {
    outline: none;
  }

  button {
    padding: 0.375rem 1rem;
    border-radius: 0.375rem;
    font-family: "Roboto Mono", sans-serif;
    font-size: 0.875rem;
  }

  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  input[type="number"] {
    -moz-appearance: textfield;
  }
</style>
