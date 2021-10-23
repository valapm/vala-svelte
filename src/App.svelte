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
    <main>
      <Router {routes} />
    </main>
  </div>
</Notifications>

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
