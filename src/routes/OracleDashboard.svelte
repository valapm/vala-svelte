<script type="ts">
  import { BoostPowJobModel } from "../utils/boostPow"
  import { bsv, rabin } from "bitcoin-predict"
  import { rabinPubKey, rabinPrivKey } from "../store/oracle"
  import { address } from "../store/wallet"
  import { getUtxos } from "../utils/utxo"
  import { testnet } from "../store/options"
  import { gql } from "graphql-request"
  import { gqlClient } from "../store/graphql"
  import { postBoostJobTx, postOracleDetails } from "../apis/web"
  import { onMount } from "svelte"

  const diffMultiplier = 0.00002
  const feeb = 0.5

  let oracleName

  let diff = 1
  $: price = diff * diffMultiplier

  const undecidedMarketQuery = gql`
    query MyQuery {
    market(where: {_not: {markets: {}}, market_oracles: {oraclePubKey: {_eq: "${$rabinPubKey.toString()}"}}, decided: {_eq: false}}) {
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

  const decidedMarketQuery = gql`
    query MyQuery {
    market(where: {_not: {markets: {}}, market_oracles: {oraclePubKey: {_eq: "${$rabinPubKey.toString()}"}}, decided: {_eq: true}}) {
      decision
      marketByFirststateid {
        transaction {
          txid
        }
      }
      resolve
    }
  }
  `

  async function getMarkets(decided: boolean) {
    return decided ? $gqlClient.request(decidedMarketQuery) : $gqlClient.request(undecidedMarketQuery)
  }

  async function boost() {
    const model = BoostPowJobModel.fromObject({
      content: bsv.crypto.Hash.sha256(Buffer.from($rabinPubKey.toString(), "utf8")).toString("hex"),
      diff
    })

    console.log(bsv.crypto.Hash.sha256(Buffer.from($rabinPubKey.toString(), "utf8")).toString("hex"))
    console.log(model.getContentBuffer().toString("hex"))

    const sats = Math.round(model.getDiff() * diffMultiplier * 100000000)

    const utxos = await getUtxos($address.toString(), $testnet)

    const tx = new bsv.Transaction()
    tx.addOutput(new bsv.Transaction.Output({ script: model.toScript(), satoshis: sats }))
    tx.feePerKb(feeb * 1000)
    tx.change($address)
    tx.from(utxos)

    const rawtx = tx.checkedSerialize()

    await postBoostJobTx(rawtx, $rabinPubKey.toString(), $testnet)

    console.log(`Boosted with difficulty ${model.getDiff()} for ${sats} sats`)
  }

  async function update() {
    const details = {
      name: oracleName
    }
    const detailHex = Buffer.from(JSON.stringify(details), "utf8").toString("hex")
    const sig = rabin.sign(detailHex, $rabinPrivKey.p, $rabinPrivKey.q, $rabinPubKey)
    const res = await postOracleDetails(details, $rabinPubKey, sig, $testnet)
    console.log(res)
  }

  onMount(async () => {
    const oracleQuery = gql`
    query {
      oracle(where: {pubKey: {_eq: "${$rabinPubKey}"}}) {
        name
      }
    }`

    const oracleData = await $gqlClient.request(oracleQuery)
    const oracle = oracleData.oracle[0]

    if (oracle) oracleName = oracle.name
  })
</script>

{$rabinPubKey}
<br />
{price} bsv
<br />
<input bind:value={diff} type="number" min="0" />
<br />
<button on:click={boost}> Add PoW Reputation </button>
<br />
Set a name
<input bind:value={oracleName} type="text" />
<button on:click={update}>Save</button>

{#await getMarkets(false)}
  loading...
{:then res}
  {#if res.market.length > 0}
    <h3>Undecided Markets</h3>
    {#each res.market as market}
      {market.resolve} <button>VOTE YES</button> <button>VOTE NO</button>
    {/each}
  {/if}
{/await}
