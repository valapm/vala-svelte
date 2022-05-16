<script>
  export let checked
</script>

<input type="checkbox" bind:checked />

<style>
  input[type="checkbox"] {
    appearance: none;
    margin: 0;
    color: #01a781;
    width: 1.125rem;
    height: 1.125rem;
    border: 1px solid #01a781;
    border-radius: 0.375rem;
    transition: all 0.15s ease-in-out;
  }

  input[type="checkbox"]:checked {
    background-color: #01a781;
  }
</style>
