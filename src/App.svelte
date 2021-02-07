<script>
  import { writable } from "svelte-persistent-store/dist/local"
  import { derived } from "svelte/store"
  import { bsv, lmsr } from "bitcoin-predict"
  import Qr from "./components/Qr.svelte"
  import { GraphQLClient, gql } from "graphql-request"

  const GRAPHQL_HOST = "http://localhost:8080/v1/graphql"

  const client = new GraphQLClient(GRAPHQL_HOST, {
    headers: {
      "content-type": "application/json",
      "x-hasura-admin-secret": "jsljhlksjbnbsndfmsf"
    }
  })

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
    return client.request(marketQuery)
  }

  function createWallet() {
    $wallet = bsv.PrivateKey.fromRandom().toString()
  }

  function getBalance(market) {
    return {
      sharesFor: market.sharesFor,
      sharesAgainst: market.sharesAgainst,
      liquidity: market.liquidity
    }
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
  <div class="w-2/3 h-full flex flex-col space-y-4 mt-10">
    {#await getMarkets()}
      loading...
    {:then res}
      {#each res.market as market}
        <div class="w-full px-3 border-blue-600 border-2 rounded-lg p-2">
          <h3 class="font-semibold text-blue-900 w-full">{market.firstTxTxid}</h3>
          <div class="flex items-center justify-between">
            <div class="text-xl">{market.resolve}</div>
            <div class="font-bold text-5xl">{lmsr.getProbability(getBalance(market)) * 100}%</div>
          </div>
          <div class="">{lmsr.getLmsrSats(getBalance(market)) * 100000000} BSV</div>
        </div>
      {/each}
    {/await}
  </div>
</div>
