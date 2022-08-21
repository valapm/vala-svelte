<table>
  <slot />
</table>

<style>
  table {
    width: 100%;
    border-radius: 0.375rem;
    border: 1px solid #60616d;
    background-color: #272c33;
    border-collapse: separate;
    font-size: 0.875rem;
    border-spacing: 0;
    overflow: hidden;
  }

  table :global(thead) {
    background-color: #323841;
  }

  table :global(th) {
    font-weight: 500;
  }

  table :global(td) {
    font-weight: 400;
  }

  table :global(td),
  table :global(th) {
    padding: 0.875rem;
    text-align: left;
  }

  table :global(th:first-of-type),
  table :global(td:first-of-type) {
    min-width: 5rem;
  }

  @media screen and (max-width: 400px) {
    table :global(td),
    table :global(th) {
      padding: 0.6rem;
      text-align: left;
    }
  }
</style>
