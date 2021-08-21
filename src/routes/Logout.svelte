<script>
  import { onMount } from "svelte"
  import { push } from "svelte-spa-router"
  import { seed } from "../store/wallet"
  import { username } from "../store/profile"

  onMount(() => {
    $seed = null
    $username = null
    push("#/login")
  })
</script>
