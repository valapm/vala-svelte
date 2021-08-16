<script>
  import { pop } from "svelte-spa-router"

  import SlIconButton from "@shoelace-style/shoelace/dist/components/icon-button/icon-button"
</script>

<nav>
  <div>
    <sl-icon-button name="arrow-left" label="Go back" on:click={pop} />
  </div>
</nav>

<style>
  nav {
    width: 100%;
    height: 1.6rem;
    display: flex;
    justify-content: center;
    margin-top: -3rem;
  }

  nav > div {
    width: min(90%, 50rem);
    display: flex;
    justify-content: start;
  }

  sl-icon-button {
    font-size: 1.6rem;
  }
</style>
