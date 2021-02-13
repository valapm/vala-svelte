<script>
  import { writable } from "svelte-persistent-store/dist/local"
  import { derived } from "svelte/store"
  import { bsv } from "bitcoin-predict"
  import { gql } from "graphql-request"
  import InlineMarket from "../components/InlineMarket.svelte"
  import { gqlClient } from "../graphql"

  let wallet = writable("wallet", null)

  let address = derived(
    wallet,
    wallet => {
      return wallet ? bsv.PrivateKey.fromString(wallet).toAddress().toString() : null
    },
    null
  )

  const marketQuery = gql`
    {
      market {
        decided
        firstTxTxid
        resolve
        sharesFor
        sharesAgainst
        liquidity
      }
    }
  `

  async function getMarkets() {
    return gqlClient.request(marketQuery)
  }

  function createWallet() {
    $wallet = bsv.PrivateKey.fromRandom().toString()
  }
</script>

<div class="flex w-full h-20 items-center space-x-8 p-7 justify-end">
  {#if $wallet}
    <div>Logged in as {$address}</div>
    <button class="button px-4 rounded-sm h-8 flex items-center text-lg bg-blue-500 text-white font-semibold"
      >wallet</button
    >
  {:else}
    <button
      on:click={createWallet}
      class="button px-4 rounded-sm h-8 flex items-center text-lg bg-blue-500 text-white font-semibold"
      >Create wallet</button
    >
  {/if}
</div>
<div class="h-screen w-full flex justify-center">
  <div class="w-2/3 h-full flex flex-col space-y-8 mt-10">
    {#await getMarkets()}
      loading...
    {:then res}
      {#each res.market as market}
        <InlineMarket {market} />
      {/each}
    {/await}
  </div>
</div>
