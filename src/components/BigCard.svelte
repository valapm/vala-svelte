<div class="card">
  <slot />
</div>

<style>
  .card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;
    max-width: 35rem;
    text-align: center;
  }

  @media screen and (min-width: 400px) {
    .card {
      min-width: min(95%, 30rem);
      border-radius: 0.75rem;
      background: #32384150;
      box-shadow: 0 0.25rem 1.5rem #00000040;
      padding: 1.7rem 2.8rem;
    }
  }
</style>
