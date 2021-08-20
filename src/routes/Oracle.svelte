<script>
  import { gql } from "graphql-request"
  import { gqlClient } from "../utils/graphql"
  import { price } from "../store/price"
  import { onMount } from "svelte"

  import Backbutton from "../components/Backbutton.svelte"

  export let params

  const oracleQuery = gql`
    {
      oracle(
        where: {
          pubKey: {
            _eq: "${params.rabinPubKey}"
          }
        }
        limit: 1
      ) {
        name
        burnedSats
        burnTxTxid
      }
    }
  `

  let oracle = {}
  let loading = true

  $: burnedUSD = ($price * (oracle.burnedSats || 0)) / 100000000

  onMount(async () => {
    const res = await gqlClient.request(oracleQuery)
    oracle = res.oracle[0]
    loading = false
  })
</script>

<Backbutton />

{#if loading}
  loading...
{:else if oracle}
  <div class="container">
    <div>
      <h1>{oracle.name}</h1>
      <h2>Burned</h2>
      <p>${Math.round(100 * burnedUSD) / 100}</p>
    </div>
  </div>
{:else}
  404
{/if}

<style>
  h1 {
    font-size: 1.5rem;
  }
</style>
