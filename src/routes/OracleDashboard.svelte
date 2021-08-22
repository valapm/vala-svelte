<script type="ts">
  import { BoostPowJobModel } from "../utils/boostPow"
  import { bsv, rabin as rab } from "bitcoin-predict"
  import * as bp from "bitcoin-predict"
  import { rabinPubKey, rabinPrivKey } from "../store/oracle"
  import { address, privateKey, parsedUTXOs } from "../store/wallet"
  import { getUtxos } from "../utils/utxo"
  import { testnet } from "../config"
  import { gql } from "graphql-request"
  import { gqlClient } from "../utils/graphql"
  import { postBoostJobTx, postOracleDetails, postMarketTx, postBurnTx } from "../apis/web"
  import { onMount } from "svelte"
  import { price } from "../store/price"

  const rabin = new rab.RabinSignature()

  const diffMultiplier = 0.00002
  const feeb = 0.5

  let oracleName

  let registered

  let diff = 1
  // $: price = diff * diffMultiplier

  const undecidedMarketQuery = gql`
    {
      market(where: { market_state: { market_oracles: { oraclePubKey: {_eq: "${$rabinPubKey.toString()}"}, committed: {_eq: true}}, decided: {_eq: false}}}) {
        marketStateByFirststateid {
          transaction {
            txid
          }
        }
        resolve
        options {
          name
        }
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
      market(where: { market_state: { market_oracles: {oraclePubKey: {_eq: "${$rabinPubKey.toString()}"}, committed: {_eq: true}}, decided: {_eq: true}}}) {
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
      market(where: { market_state: { market_oracles: {oraclePubKey: {_eq: "${$rabinPubKey.toString()}"}, committed: {_eq: false}},  decided: {_eq: false}}}) {
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

    const utxos = await getUtxos($address.toString(), testnet)

    const tx = new bsv.Transaction()
    tx.addOutput(new bsv.Transaction.Output({ script: model.toScript(), satoshis: sats }))
    tx.feePerKb(feeb * 1000)
    tx.change($address)
    tx.from(utxos)

    await postBoostJobTx(tx, $rabinPubKey.toString(), testnet)

    console.log(`Boosted with difficulty ${model.getDiff()} for ${sats} sats`)
  }

  async function burn() {
    const burnSats = Math.ceil((100000000 * burnUSD) / $price)

    console.log(burnSats)

    let tx: bsv.Transaction

    if (oracle.burnTxTxid) {
      const txQuery = gql`
        {
          transaction(where: { txid: { _eq: "${oracle.burnTxTxid}" } }) {
            hex
          }
        }
      `
      const res = await gqlClient.request(txQuery)
      const prevTxHex = res.transaction[0].hex
      const prevTx = new bsv.Transaction()
      prevTx.fromString(prevTxHex)

      tx = bp.transaction.getOracleBurnUpdateTx(prevTx, burnSats)
    } else {
      console.log([$rabinPubKey, burnSats])
      tx = bp.transaction.buildOracleBurnTx($rabinPubKey, burnSats)
      console.log(tx)
    }

    console.log($address)
    const utxos = await getUtxos($address, testnet)

    console.log([tx, $privateKey, $address, utxos])
    bp.transaction.fundTx(tx, $privateKey, $address, utxos)
    console.log(tx)

    const postRes = await postBurnTx(tx, testnet)
    console.log(postRes)
  }

  async function update() {
    const details = {
      name: oracleName
    }
    const detailHex = Buffer.from(JSON.stringify(details), "utf8").toString("hex")
    const sig = rabin.sign(detailHex, $rabinPrivKey.p, $rabinPrivKey.q, $rabinPubKey)
    const res = await postOracleDetails(details, $rabinPubKey, sig, testnet)
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
    const res = await gqlClient.request(getTxQuery(txid))
    const hex = res.transaction[0].hex
    const tx = new bsv.Transaction()
    tx.fromString(hex)
    return tx
  }

  async function resolveMarket(market, vote: number) {
    const currentTx = await getRawTx(market.market_state.transactionTxid)

    console.log([currentTx, vote, $rabinPrivKey, $address, $parsedUTXOs, $privateKey])

    const newTx = await bp.transaction.getOracleVoteTx(
      currentTx,
      vote,
      $rabinPrivKey,
      $address,
      $parsedUTXOs,
      $privateKey
    )

    const postRes = await postMarketTx(newTx, [], testnet)
    console.log(postRes)
  }

  async function commitToMarket(market) {
    const currentTx = await getRawTx(market.market_state.transactionTxid)

    // const tx = buildTx(market)
    // fundTx(tx, privateKey, address, utxos)

    const newTx = bp.transaction.getOracleCommitTx(currentTx, $rabinPrivKey, $address, $parsedUTXOs, $privateKey)

    const postRes = await postMarketTx(newTx, [], testnet)
    console.log(postRes)
  }

  const oracleQuery = gql`
    query {
      oracle(where: {pubKey: {_eq: "${$rabinPubKey}"}}) {
        name
        burnedSats
        burnTxTxid
      }
    }`

  let oracle
  let burnUSD

  onMount(async () => {
    const oracleData = await gqlClient.request(oracleQuery)
    oracle = oracleData.oracle[0]

    if (oracle) oracleName = oracle.name

    console.log($rabinPubKey)
  })
</script>

{#if !oracle || !oracle.name}
  Become an Oracle and earn money
  <input bind:value={oracleName} placeholder="Set a name for yourself" type="text" />
  <button on:click={update}>Save</button>
{:else}
  {oracle.name}
  <br />
  {(oracle.burnedSats * $price) / 100000000} $ burned.
  <br />
  Burn $:
  <input bind:value={burnUSD} type="number" min="0" />$
  <br />
  <button on:click={burn}>Burn</button>

  <!-- <br />
  {price} bsv
  <br />
  <input bind:value={diff} type="number" min="0" />
  <br />
  <button on:click={boost}> Add PoW Reputation </button> -->

  {#await gqlClient.request(uncommittedMarketQuery) then res}
    {#if res.market.length > 0}
      <h2>Oracle Requests</h2>
      {#each res.market as market}
        {market.resolve} <button on:click={() => commitToMarket(market)}>Sign commitment</button>
      {/each}
    {/if}
  {/await}

  {#await gqlClient.request(undecidedMarketQuery) then res}
    {#if res.market.length > 0}
      <h2>Running Markets</h2>
      {#each res.market as market}
        {market.resolve}
        <div>
          {#each market.options as option, index}
            <button on:click={() => resolveMarket(market, index)}>Vote for {option.name}</button>
          {/each}
        </div>
      {/each}
    {/if}
  {/await}

  {#await gqlClient.request(decidedMarketQuery) then res}
    {#if res.market.length > 0}
      <h2>Closed Markets</h2>
      {#each res.market as market}
        {market.resolve}
      {/each}
    {/if}
  {/await}
{/if}
