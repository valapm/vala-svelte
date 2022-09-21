<nav>
  <div class="menu">
    <slot />
  </div>
</nav>

<style>
  nav {
    background-color: #1f2329;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .menu {
    width: min(65rem, 95%);
    gap: 2rem;
    display: flex;
    align-items: center;
  }

  .menu :global(button),
  .menu :global(a) {
    font-size: 0.875rem;
    color: #8d8d8d;
    height: 2.5rem;
  }

  .menu :global(.selected) {
    background: linear-gradient(150deg, rgba(1, 167, 129, 1) 0%, rgba(0, 255, 197, 1) 100%);
    background-clip: text;
    color: transparent;
    box-shadow: 0px 0.8125rem 0.625rem -0.625rem rgb(1 167 129);
  }
</style>
