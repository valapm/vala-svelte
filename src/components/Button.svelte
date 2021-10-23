<script>
  export let type = ""
  export let active = false
</script>

<button class="{type} {active ? 'active' : ''}"><slot /></button>

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
    background-color: #01a781;
  }

  .text {
    border: none;
    opacity: 50%;
    padding: 0;
  }

  .active {
    opacity: 100%;
  }
</style>
