<script>
  export let primary = false
</script>

<button class={primary ? "filled" : ""}><slot /></button>

<style>
  button {
    border-radius: 0.75rem;
    padding: 0.625rem 1.5rem;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .filled {
    background-color: var(--color-primary);
    color: white;
  }
</style>
