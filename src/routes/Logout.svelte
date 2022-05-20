<script>
  import { onMount } from "svelte"
  import { push } from "svelte-spa-router"
  import { seed, outputs } from "../store/wallet"
  import { email } from "../store/profile"

  onMount(() => {
    $seed = null
    $email = null
    $outputs = {}
    push("#/login")
  })
</script>
