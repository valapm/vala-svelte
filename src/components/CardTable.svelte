<div>
  <slot />
</div>

<style>
  div {
    font-family: "Roboto Mono", sans-serif;
    padding: 0.5rem;
    width: 100%;
    font-size: 0.875rem;
    gap: 0.6rem;
    display: flex;
    flex-direction: column;
  }

  div > :global(div) {
    display: flex;
    justify-content: space-between;
    width: 100%;
  }
</style>
