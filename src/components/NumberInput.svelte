<script>
  export let value = undefined
  export let placeholder = undefined
  export let min = undefined
  export let max = undefined
  export let color = "39baf9"
  export let backgroundColor = "434c56"
  export let isMax = false
  export let prefix = undefined

  function setMax() {
    value = max
    isMax = true
  }
</script>

<div style="{max !== undefined ? '' : 'padding-right: 1.25rem'}; background-color: #{backgroundColor};">
  {#if prefix}{prefix}{/if}
  <input
    type="number"
    {placeholder}
    {min}
    {max}
    on:input={() => {
      isMax = false
    }}
    bind:value
  />
  {#if max !== undefined}<button on:click={setMax} style="border: 1px solid #{color};">max</button>{/if}
</div>

<style>
  div {
    border-radius: 0.375rem;
    width: 100%;
    height: 2.8125rem;
    padding: 0 0.4375rem 0 1.25rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
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
