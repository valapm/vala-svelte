<script>
  import Search from "../icons/Search.svelte"

  export let value = ""
  export let placeholder = "Search"
</script>

<div>
  <Search />
  <input type="text" {placeholder} bind:value />
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
  }

  input {
    flex-grow: 1;
    height: 100%;
    background-color: transparent;
  }

  input::placeholder {
    color: #b9b9b9;
    font-weight: 500;
  }

  input:focus {
    outline: none;
  }

  /* img {
    height: 1.375rem;
    width: auto;
  } */
</style>
