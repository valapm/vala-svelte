<script>
  import { price } from "../store/price"
  import { createEventDispatcher } from "svelte"

  import SlCard from "@shoelace-style/shoelace/dist/components/card/card"

  const dispatch = createEventDispatcher()

  export let oracle

  // $: burnedUSD = ($price * oracle.burnedSats) / 100000000
</script>

<sl-card on:click={() => dispatch("click")} class="oracle">
  <h2>{oracle.oracleStateByCurrentstateid.domain}</h2>
  <p>{oracle.oracleStateByCurrentstateid.details}</p>
</sl-card>

<style>
  sl-card {
    cursor: pointer;
  }

  h2 {
    font-size: 1.3rem;
  }

  h3 {
    font-size: 1.1rem;
  }
</style>
