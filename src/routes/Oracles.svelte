<script>
  import { gql } from "graphql-request"
  import { gqlClient } from "../utils/graphql"
  import { push } from "svelte-spa-router"
  import { fade } from "svelte/transition"

  import InlineOracle from "../components/InlineOracle.svelte"
  import Searchbar from "../components/Searchbar.svelte"

  $: oracleQuery = gql`
    {
      oracle(order_by: { burnedSats: desc }, where: { name: {_ilike: "%${search}%"}}) {
        pubKey
        name
        burnedSats
        burnTxTxid
      }
    }
  `

  let search = ""

  $: oracles = []
  $: gqlClient.request(oracleQuery).then(res => (oracles = res.oracle))
</script>

<div class="container" transition:fade={{ duration: 300 }}>
  <div class="oracle-list">
    <Searchbar bind:value={search} />
    {#each oracles as oracle}
      <InlineOracle {oracle} on:click={() => push("#/oracle/" + oracle.pubKey)} />
    {/each}
  </div>
</div>

<style>
  .oracle-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: min(90%, 50rem);
  }
</style>
