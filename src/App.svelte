<script lang="ts">
  import { ApolloClient, InMemoryCache } from "@apollo/client/core"
  import { setClient } from "svelte-apollo"
  import { graphqlHost } from "./config"

  import Notifications from "svelte-notifications"
  import Router from "svelte-spa-router"
  import { routes } from "./routes"
  import Header from "./components/Header.svelte"
  import Notification from "./components/Notification.svelte"

  const client = new ApolloClient({
    uri: graphqlHost,
    cache: new InMemoryCache()
  })
  setClient(client)
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
