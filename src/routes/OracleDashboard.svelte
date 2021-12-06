<script type="ts">
  import { BoostPowJobModel } from "../utils/boostPow"
  import { bsv, rabin as rab } from "bitcoin-predict"
  import * as bp from "bitcoin-predict"
  import { rabinPubKey, rabinPrivKey } from "../store/oracle"
  import { address, privateKey, utxos, outputs } from "../store/wallet"
  import { testnet } from "../config"
  import { gql } from "graphql-request"
  import { gqlClient } from "../utils/graphql"
  import { postBoostJobTx, postOracleDetails, postMarketTx, postBurnTx } from "../apis/web"
  import { onMount } from "svelte"
  import { price } from "../store/price"
  import { postTx } from "../utils/api"
  import { getNotificationsContext } from "svelte-notifications"
  import { tick } from "svelte"

  const { addNotification } = getNotificationsContext()

  const rabin = new rab.RabinSignature()

  const diffMultiplier = 0.00002
  const feeb = 0.5

  let domainName
  let details

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

  // async function boost() {
  //   const model = BoostPowJobModel.fromObject({
  //     content: bsv.crypto.Hash.sha256(Buffer.from($rabinPubKey.toString(), "utf8")).toString("hex"),
  //     diff
  //   })

  //   console.log(bsv.crypto.Hash.sha256(Buffer.from($rabinPubKey.toString(), "utf8")).toString("hex"))
  //   console.log(model.getContentBuffer().toString("hex"))

  //   const sats = Math.round(model.getDiff() * diffMultiplier * 100000000)

  //   const utxos = await getUtxos($address.toString(), testnet)

  //   const tx = new bsv.Transaction()
  //   tx.addOutput(new bsv.Transaction.Output({ script: model.toScript(), satoshis: sats }))
  //   tx.feePerKb(feeb * 1000)
  //   tx.change($address)
  //   tx.from(utxos)

  //   await postBoostJobTx(tx, $rabinPubKey.toString(), testnet)

  //   console.log(`Boosted with difficulty ${model.getDiff()} for ${sats} sats`)
  // }

  // async function burn() {
  //   const burnSats = Math.ceil((100000000 * burnUSD) / $price)

  //   console.log(burnSats)

  //   let tx: bsv.Transaction

  //   if (oracle.burnTxTxid) {
  //     const txQuery = gql`
  //       {
  //         transaction(where: { txid: { _eq: "${oracle.burnTxTxid}" } }) {
  //           hex
  //         }
  //       }
  //     `
  //     const res = await gqlClient.request(txQuery)
  //     const prevTxHex = res.transaction[0].hex
  //     const prevTx = new bsv.Transaction()
  //     prevTx.fromString(prevTxHex)

  //     tx = bp.transaction.getOracleUpdateTx(prevTx, burnSats)
  //   } else {
  //     console.log([$rabinPubKey, burnSats])
  //     tx = bp.transaction.buildOracleBurnTx($rabinPubKey, burnSats)
  //     console.log(tx)
  //   }

  //   console.log($address)
  //   const utxos = await getUtxos($address, testnet)

  //   console.log([tx, $privateKey, $address, utxos])
  //   bp.transaction.fundTx(tx, $privateKey, $address, utxos)
  //   console.log(tx)

  //   const postRes = await postBurnTx(tx, testnet)
  //   console.log(postRes)
  // }

  const oracleQuery = gql`
    query {
      oracle(where: {pubKey: {_eq: "${$rabinPubKey}"}}) {
        pubKey
        oracleStateByCurrentstateid {
          details
          domain
          transaction {
            hex
          }
        }
      }
    }`

  async function update() {
    const oracleDetails = JSON.stringify({
      domain: domainName,
      details: details
    })

    let prevTx
    if (oracle.oracleStateByCurrentstateid) {
      prevTx = new bsv.Transaction()
      prevTx.fromString(oracle.oracleStateByCurrentstateid.transaction.hex)
    } else {
      // Initialize oracle
      const initTx = await bp.transaction.getOracleTx($rabinPubKey)
      bp.transaction.fundTx(initTx, $privateKey, $address, $utxos)

      try {
        await postTx(initTx, "oracle", testnet)
        await tick()
      } catch (e) {
        addNotification({
          type: "danger",
          text: "Failed to broadcast transaction",
          position: "top-right"
        })
        return
      }

      prevTx = initTx
    }

    const tx = await bp.transaction.getOracleUpdateTx(prevTx, 0, oracleDetails, $rabinPrivKey)
    bp.transaction.fundTx(tx, $privateKey, $address, $utxos)

    try {
      await postTx(tx, "oracle", testnet)
    } catch (e) {
      addNotification({
        type: "danger",
        text: "Failed to broadcast transaction",
        position: "top-right"
      })
      return
    }

    const oracleData = await gqlClient.request(oracleQuery)
    oracle = oracleData.oracle[0]
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

    console.log([currentTx, vote, $rabinPrivKey, $address, $utxos, $privateKey])

    const newTx = await bp.transaction.getOracleVoteTx(currentTx, vote, $rabinPrivKey, $address, $utxos, $privateKey)

    const postRes = await postMarketTx(newTx, testnet)
    console.log(postRes)
  }

  async function commitToMarket(market) {
    const currentTx = await getRawTx(market.market_state.transactionTxid)

    // const tx = buildTx(market)
    // fundTx(tx, privateKey, address, utxos)

    const newTx = bp.transaction.getOracleCommitTx(currentTx, $rabinPrivKey, $address, $utxos, $privateKey)

    const postRes = await postMarketTx(newTx, testnet)
    console.log(postRes)
  }

  let oracle
  let burnUSD

  $: changes =
    oracle &&
    oracle.oracleStateByCurrentstateid &&
    (domainName !== oracle.oracleStateByCurrentstateid.domain || details !== oracle.oracleStateByCurrentstateid.details)

  onMount(async () => {
    const oracleData = await gqlClient.request(oracleQuery)
    oracle = oracleData.oracle[0]

    if (oracle && oracle.oracleStateByCurrentstateid) {
      domainName = oracle.oracleStateByCurrentstateid.domain
      details = oracle.oracleStateByCurrentstateid.details
    }

    console.log($rabinPubKey)
  })
</script>

<div id="oracle">
  {#if !oracle || !oracle.oracleStateByCurrentstateid || !oracle.oracleStateByCurrentstateid.domain}
    <h1>Oracle Setup</h1>

    <div class="setup-form">
      <input bind:value={domainName} placeholder="Your domain name" type="text" />
      <button on:click={update}>Save</button>
    </div>
  {:else}
    <input type="text" bind:value={domainName} />

    <textarea name="details" cols="30" rows="10" bind:value={details} />

    {#if changes}
      <button>Save</button>
    {/if}

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
</div>

<style>
  #oracle {
    display: flex;
    gap: 7rem;
    margin-top: 5.5rem;
    flex-direction: column;
    align-items: center;
  }

  h1 {
    font-size: 2.25rem;
    font-weight: 500;
  }

  .setup-form {
    display: flex;
    align-items: stretch;
    flex-direction: column;
    gap: 1.25rem;
    width: 18rem;
  }

  input {
    background-color: #323841;
    padding: 0 1.25rem;
    height: 2.8125rem;
    border-radius: 0.375rem;
    font-size: 1rem;
    font-weight: 500;
  }

  button {
    padding: 0.625rem 1.5rem;
    background: linear-gradient(149.62deg, #01a781 17.39%, #00ffc5 124.46%);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 0.375rem;
  }
</style>
