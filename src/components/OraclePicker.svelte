<script>
  import { gql } from "graphql-request"
  import { gqlClient } from "../utils/graphql"
  import { createEventDispatcher } from "svelte"

  import InlineOracle from "../components/InlineOracle.svelte"
  import Searchbar from "../components/Searchbar.svelte"

  const dispatch = createEventDispatcher()

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

<div class="oracle-list">
  <Searchbar bind:value={search} />
  {#each oracles as oracle}
    <InlineOracle {oracle} on:click={() => dispatch("select", { oracle })} />
  {/each}
</div>

<style>
  .oracle-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;
  }
</style>
