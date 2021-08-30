<script>
  import { onMount } from "svelte"
  import { push } from "svelte-spa-router"
  import { seed } from "../store/wallet"
  import { email } from "../store/profile"

  onMount(() => {
    $seed = null
    $email = null
    push("#/login")
  })
</script>
