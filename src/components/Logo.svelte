<script>
  import { seed } from "../store/wallet"

  import Logo from "../icons/Logo.svelte"
  import LogoText from "../icons/LogoText.svelte"

  export let greyscale = false
</script>

<a href={$seed ? "#/markets" : "#/"} class="logo {greyscale ? 'grey' : ''}">
  <Logo />
  <LogoText />
</a>

<style>
  .logo {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }

  .grey :global(svg path) {
    fill: #8f9194;
  }

  a :global(svg) {
    width: auto;
  }

  a :global(svg):first-child {
    height: 2.4rem;
  }

  a :global(svg):nth-child(2) {
    height: 1.2rem;
  }
</style>
