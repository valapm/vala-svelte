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

  function getPercentFor(balance) {
    return (balance.sharesFor + balance.sharesAgainst) / balance.sharesFor
  }
</script>

<main>
  {#if $wallet}
    <h1>Welcome {$address}</h1>

    <Qr value={$address} />
  {:else}
    <button on:click={createWallet}>Create wallet</button>
  {/if}

  <br />

  {#await getMarkets()}
    loading markets..
  {:then res}
    <table>
      {#each res.market as market}
        <tr>
          <td>{market.firstTxTxid}</td>
          <td>{market.resolve}</td>
          <td>{getPercentFor(getBalance(market))}</td>
          <td>{lmsr.getLmsrSats(getBalance(market))} sats</td>
        </tr>
      {/each}
    </table>
  {/await}
</main>

<style>
  main {
    text-align: center;
    padding: 1em;
    max-width: 240px;
    margin: 0 auto;
  }

  h1 {
    color: #ff3e00;
    text-transform: uppercase;
    font-size: 4em;
    font-weight: 100;
  }

  @media (min-width: 640px) {
    main {
      max-width: none;
    }
  }
</style>
