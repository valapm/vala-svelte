<script lang="ts">
  import Router from "svelte-spa-router"
  import { routes } from "./routes"
  import Header from "./components/Header.svelte"
</script>

<Header />

<Router {routes} />
