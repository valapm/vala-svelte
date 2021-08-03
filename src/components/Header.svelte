<script>
  import { seed, usdBalance } from "../store/wallet"
</script>

<nav>
  <a href="#/"><img src="./Logo.svg" alt="vala-logo" /></a>
  <div class="menu-center">
    <a href="#/">Markets</a>
    <a href="#/oracles">Oracles</a>
    <a href="#/about">About</a>
  </div>
  <div class="menu-right">
    {#if $seed}
      <a href="#/wallet">${$usdBalance}</a>
    {:else}
      <a href="#/login">Log in</a>
      <a href="#/register" class="signup-button">Sign up</a>
    {/if}
  </div>
</nav>

<style>
  nav {
    display: flex;
    align-items: center;
    height: 5rem;
    padding: 2rem;
    justify-content: space-between;
  }

  nav img {
    height: 2rem;
  }

  .menu-center {
    position: absolute;
    left: 50%;
    transform: translate(-50%, 0);
  }

  .menu-center,
  .menu-right {
    display: flex;
    gap: 1rem;
  }

  .signup-button {
    border-radius: 3px;
    background-color: #1b3fbc;
    color: white;
    padding: 0.1rem 0.5rem;
    font-weight: bold;
  }
</style>
