<script lang="ts">
  import { setClient } from "svelte-apollo"
  import { client } from "./utils/apollo"

  import Router from "svelte-spa-router"
  import { routes } from "./routes"
  import Header from "./components/Header.svelte"
  import Notifications from "./components/Notifications.svelte"

  setClient(client)
</script>

<Header />
<div>
  <Router {routes} />
</div>
<Notifications />

<style>
  div {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
</style>
