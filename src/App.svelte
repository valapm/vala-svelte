<script lang="ts">
  import Notifications from "svelte-notifications"
  import Router from "svelte-spa-router"
  import { routes } from "./routes"
  import Header from "./components/Header.svelte"
  import Notification from "./components/Notification.svelte"
</script>

<Notifications item={Notification}>
  <Header />
  <div>
    <Router {routes} />
  </div>
</Notifications>

<style>
  div {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
</style>
