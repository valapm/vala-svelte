<script type="ts">
  import { BoostPowJobModel } from "../utils/boostPow"
  import { bsv, rabin } from "bitcoin-predict"
  import * as bp from "bitcoin-predict"
  import { rabinPubKey, rabinPrivKey } from "../store/oracle"
  import { address, privateKey, utxos } from "../store/wallet"
  import { getUtxos } from "../utils/utxo"
  import { testnet } from "../store/options"
  import { gql } from "graphql-request"
  import { gqlClient } from "../store/graphql"
  import { postBoostJobTx, postOracleDetails, postMarketTx } from "../apis/web"
  import { onMount } from "svelte"
  import Header from "../components/Header.svelte"

  const diffMultiplier = 0.00002
  const feeb = 0.5

  let oracleName

  let registered

  let diff = 1
  $: price = diff * diffMultiplier

  const undecidedMarketQuery = gql`
    {
      market(where: { market_state: { market_oracles: { oraclePubKey: {_eq: "${$rabinPubKey.toString()}"}, committed: {_eq: true}}, market_state: { decided: {_eq: false}}}}) {
        marketStateByFirststateid {
          transaction {
            txid
          }
        }
        resolve
        market_state {
          transactionTxid
          shares
          liquidity
        }
      }
    }
  `

  const decidedMarketQuery = gql`
      {
      market(where: { market_state: { market_oracles: {oraclePubKey: {_eq: "${$rabinPubKey.toString()}"}, committed: {_eq: true}}, market_state: { decided: {_eq: true}}}}) {
        marketStateByFirststateid {
          transaction {
            txid
          }
        }
        resolve
        market_state {
          decision
        }
      }
    }
  `

  const uncommittedMarketQuery = gql`
    {
      market(where: { market_state: { market_oracles: {oraclePubKey: {_eq: "${$rabinPubKey.toString()}"}, committed: {_eq: false}}, market_state: { decided: {_eq: false}}}}) {
        marketStateByFirststateid {
          transaction {
            txid
          }
        }
        resolve
        market_state {
          transactionTxid
          shares
          liquidity
        }
      }
    }
  `

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
    if (res.message === "success") registered = true
  }

  // FIXME: Duplicate code in Market.svelte
  function getTxQuery(txid) {
    return gql`
    {
      transaction(where: { txid: { _eq: "${txid}" } }) {
        hex
      }
    }
  `
  }

  // FIXME: Duplicate code in Market.svelte
  async function getRawTx(txid) {
    const res = await $gqlClient.request(getTxQuery(txid))
    const hex = res.transaction[0].hex
    const tx = new bsv.Transaction()
    tx.fromString(hex)
    return tx
  }

  const Interp = bsv.Script.Interpreter

  export const DEFAULT_FLAGS =
    Interp.SCRIPT_ENABLE_MAGNETIC_OPCODES |
    Interp.SCRIPT_ENABLE_MONOLITH_OPCODES | // TODO: to be removed after upgrade to bsv 2.0
    Interp.SCRIPT_VERIFY_STRICTENC |
    Interp.SCRIPT_ENABLE_SIGHASH_FORKID |
    Interp.SCRIPT_VERIFY_LOW_S |
    Interp.SCRIPT_VERIFY_NULLFAIL |
    Interp.SCRIPT_VERIFY_DERSIG |
    Interp.SCRIPT_VERIFY_MINIMALDATA |
    Interp.SCRIPT_VERIFY_NULLDUMMY |
    Interp.SCRIPT_VERIFY_DISCOURAGE_UPGRADABLE_NOPS |
    Interp.SCRIPT_VERIFY_CHECKLOCKTIMEVERIFY |
    Interp.SCRIPT_VERIFY_CHECKSEQUENCEVERIFY

  async function resolveMarket(market, decision: 0 | 1) {
    const currentTx = await getRawTx(market.transaction.txid)

    const sig = bp.oracle.getSignature(decision, $rabinPrivKey)

    console.log(sig)

    const newTx = await bp.transaction.getDecideTx(currentTx, decision, [sig])

    const utxos = await getUtxos($address.toString(), $testnet)

    const fundedTx = bp.transaction.fundTx(newTx, $privateKey, $address, utxos)

    const rawtx = fundedTx.checkedSerialize() // FIXME: throws if not enough sats

    // const interpreter = bsv.Script.Interpreter()

    // console.log(
    //   interpreter.verify(
    //     fundedTx.inputs[0].script,
    //     currentTx.outputs[0].script,
    //     fundedTx,
    //     0,
    //     DEFAULT_FLAGS,
    //     currentTx.outputs[0].satoshisBN
    //   )
    // )

    const postRes = await postMarketTx(rawtx, [], $testnet)
    console.log(postRes)
  }

  async function commitToMarket(market) {
    const currentTx = await getRawTx(market.market_state.transactionTxid)

    // const tx = buildTx(market)
    // fundTx(tx, privateKey, address, utxos)

    const newTx = bp.transaction.getOracleCommitTx(currentTx, $rabinPrivKey, $address, $utxos, $privateKey)
    const rawtx = newTx.checkedSerialize()

    const postRes = await postMarketTx(rawtx, [], $testnet)
    console.log(postRes)
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

    registered = !!oracle

    if (oracle) oracleName = oracle.name
  })
</script>

<Header />

{#if !registered}
  Become an Oracle and earn money
  <input bind:value={oracleName} placeholder="Set a name for yourself" type="text" />
  <button on:click={update}>Save</button>
{:else}
  {$rabinPubKey}
  <br />
  {price} bsv
  <br />
  <input bind:value={diff} type="number" min="0" />
  <br />
  <button on:click={boost}> Add PoW Reputation </button>

  {#await $gqlClient.request(uncommittedMarketQuery) then res}
    {#if res.market.length > 0}
      <h2>Oracle Requests</h2>
      {#each res.market as market}
        {market.resolve} <button on:click={() => commitToMarket(market)}>Sign commitment</button>
      {/each}
    {/if}
  {/await}

  {#await $gqlClient.request(undecidedMarketQuery) then res}
    {#if res.market.length > 0}
      <h2>Running Markets</h2>
      {#each res.market as market}
        {market.resolve} <button on:click={() => resolveMarket(market, 1)}>VOTE YES</button>
        <button on:click={() => resolveMarket(market, 0)}>VOTE NO</button>
      {/each}
    {/if}
  {/await}

  {#await $gqlClient.request(decidedMarketQuery) then res}
    {#if res.market.length > 0}
      <h2>Closed Markets</h2>
      {#each res.market as market}
        {market.resolve}
      {/each}
    {/if}
  {/await}
{/if}
