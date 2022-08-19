<script>
  import { onMount } from "svelte"
  import { push } from "svelte-spa-router"
  import { seed, outputs, newSeed } from "../store/wallet"

  onMount(() => {
    $seed = null
    $newSeed = null
    $outputs = {}
    push("#/login")
  })
</script>
