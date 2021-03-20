<script>
  import * as bp from "bitcoin-predict"
  import { privateKey, publicKey, address } from "../store/wallet"
  import { getUtxos } from "../utils/utxo"
  import { oracles } from "../oracle"
  import { testnet } from "../store/options"
  import { postMarketTx } from "../apis/web"
  import { gql } from "graphql-request"
  import { gqlClient } from "../store/graphql"

  const { fundTx, buildTx } = bp.transaction

  let resolve
  let oracle
  let liquidity = 1

  $: console.log(oracle)

  const oracleQuery = gql`
    {
      oracle(where: { name: { _is_null: false } }) {
        pubKey
        name
        boosts(limit: 1, order_by: { difficulty: desc }) {
          difficulty
          solved
        }
      }
    }
  `

  $: entries = [
    {
      publicKey: $publicKey.toString(),
      balance: {
        sharesFor: 0,
        sharesAgainst: 0,
        liquidity
      }
    }
  ]

  async function createMarket() {
    const market = bp.pm.getNewMarket(
      {
        resolve
      },
      entries,
      [
        {
          pubKey: BigInt(oracle),
          votes: 100
        }
      ]
    )

    const tx = buildTx(market)

    // console.log(market.miners)
    // console.log(bp.transaction.getMinerDetails(tx.outputs[0].script))
    const utxos = await getUtxos($address.toString(), $testnet)

    const fundedTx = fundTx(tx, $privateKey, $address, utxos)
    const rawtx = fundedTx.checkedSerialize() // FIXME: throws if not enough sats

    const postRes = await postMarketTx(rawtx, entries, $testnet)
    console.log(postRes)
  }

  let retryRawtx

  async function retry() {
    const postRes = await postMarketTx(retryRawtx, entries, $testnet)
    console.log(postRes)
  }
</script>

test
{$publicKey.toString()}
<br />
Resolve: <input type="text" bind:value={resolve} />
Inital liquidity: <input type="number" bind:value={liquidity} min="1" />
<br />
Choose oracle
{#await $gqlClient.request(oracleQuery)}
  loading...
{:then res}
  <select bind:value={oracle}>
    {#each res.oracle as oracle}
      <option value={oracle.pubKey}>{oracle.name}</option>
    {/each}
  </select>
{/await}
<br />
<button on:click={createMarket}>Create new market</button>

<h3>Retry Rawtx</h3>
<input type="text" bind:value={retryRawtx} />
<button on:click={retry}>Retry</button>
