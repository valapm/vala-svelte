<div>
  <main>
    <slot />
  </main>
</div>

<style>
  main {
    width: min(65rem, 100%);
  }

  div {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
</style>
