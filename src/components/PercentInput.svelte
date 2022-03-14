<script>
  export let value
  export let placeholder = undefined
  export let min = undefined
  export let max = undefined
</script>

<div>
  <input type="number" {placeholder} {min} {max} bind:value />
  <span>%</span>
</div>

<style>
  div {
    border-radius: 0.375rem;
    width: 100%;
    height: 2.8125rem;
    padding: 0 1.25rem;
    background-color: #323841;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    justify-content: space-between;
  }

  input {
    flex-grow: 1;
    height: 100%;
    background-color: transparent;
  }

  input::placeholder {
    font-size: 1rem;
    font-weight: 500;
  }

  input:focus {
    outline: none;
  }

  span {
    opacity: 50%;
    font-weight: 700;
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
