<script>
  import { bsv } from "bitcoin-predict"
  import { gql } from "graphql-request"
  import InlineMarket from "../components/InlineMarket.svelte"
  import { gqlClient } from "../store/graphql"
  import { address, seed } from "../store/wallet"
  import Qr from "../components/Qr.svelte"
  import Mnemonic from "../utils/mnemonic"

  const marketQuery = gql`
    {
      market(where: { _not: { markets: {} } }, order_by: { liquidity: desc }) {
        decided
        marketByFirststateid {
          transaction {
            txid
          }
        }
        resolve
        sharesFor
        sharesAgainst
        liquidity
      }
    }
  `

  async function getMarkets() {
    return $gqlClient.request(marketQuery)
  }

  function createWallet() {
    $seed = Mnemonic.fromRandom().toString()
  }
</script>

<div class="flex w-full h-20 items-center space-x-8 p-7 justify-end">
  {#if $seed}
    <div>Logged in as {$address.toString()}</div>
    <a href="#/create" class="button px-4 rounded-sm h-8 flex items-center text-lg bg-blue-500 text-white font-semibold"
      >Create Market</a
    >
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
    {#if $seed}
      <Qr value={$address.toString()} />
    {/if}

    {#await getMarkets()}
      loading...
    {:then res}
      {#each res.market as market}
        <InlineMarket {market} />
      {/each}
    {/await}
  </div>
</div>
