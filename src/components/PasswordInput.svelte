<script>
  import Eye from "../icons/Eye.svelte"

  export let value = ""
  export let placeholder = undefined

  let hidden = true

  function handleInput(e) {
    value = e.target.value
  }
</script>

<div>
  <input type={hidden ? "password" : "text"} {placeholder} on:input={handleInput} />
  <button on:click={() => (hidden = !hidden)} tabindex="-1"><Eye /></button>
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
</style>
