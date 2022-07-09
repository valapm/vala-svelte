<script lang="ts">
  import { onMount } from "svelte"
  import { setClient } from "svelte-apollo"
  import { client } from "./utils/apollo"

  import Router from "svelte-spa-router"
  import { routes } from "./routes"
  import Header from "./components/Header.svelte"

  import Footer from "./components/Footer.svelte"
  import Notifications from "./components/Notifications.svelte"

  setClient(client)

  onMount(() => {
    document.querySelector(".preloader").style.opacity = 0
  })
</script>

<Header />
<div>
  <Router {routes} />
  <Notifications />
</div>
<Footer />

<style>
  div {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex-grow: 1;
  }

  :global(body) {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }
</style>
