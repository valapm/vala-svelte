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

  import DnsInfo from "../components/DnsInfo.svelte"

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
          state {
            transaction {
              txid
            }
          }
        }
        resolve
        options {
          name
        }
        market_state {
          state {
            transactionTxid
          }
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
          state {
            transaction {
              txid
            }
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
          state {
            transaction {
              txid
            }
          }
        }
        resolve
        market_state {
          state {
            transactionTxid
          }
          shares
          liquidity
        }
      }
    }
  `

  const valaIndexTxQuery = gql`
    {
      state(where: { _not: { states: {} }, isValaIndex: { _eq: true } }) {
        transaction {
          hex
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
        hasCorrectDNS
        oracleStateByCurrentstateid {
          details
          domain
          state {
            transaction {
              hex
            }
            outputIndex
          }
        }
      }
    }`

  async function getNewOracleTx(): bsv.Transaction {
    const valaState = (await gqlClient.request(valaIndexTxQuery)).state[0]

    const prevTx = new bsv.Transaction()
    prevTx.fromString(valaState.transaction.hex)

    const newTx = bp.transaction.getNewOracleTx($rabinPubKey, prevTx)
    bp.transaction.fundTx(newTx, $privateKey, $address, $utxos)

    return newTx
  }

  async function update() {
    let prevTx
    let prevOutputIndex

    if (oracle && oracle.oracleStateByCurrentstateid) {
      prevTx = new bsv.Transaction()
      prevTx.fromString(oracle.oracleStateByCurrentstateid.state.transaction.hex)
      prevOutputIndex = oracle.oracleStateByCurrentstateid.state.outputIndex
    } else {
      // Initialize oracle
      const initTx = await getNewOracleTx()

      try {
        await postTx(initTx, testnet)
        await tick()
      } catch (e) {
        console.error(e)
        addNotification({
          type: "danger",
          text: "Failed to broadcast transaction",
          position: "top-right"
        })
        return
      }

      prevTx = initTx
      prevOutputIndex = 0
    }

    const oracleDetails = {
      domain: domainName,
      description: details
    }

    const newTx = bp.transaction.getOracleUpdateTx(prevTx, prevOutputIndex, 0, oracleDetails, $rabinPrivKey)
    bp.transaction.fundTx(newTx, $privateKey, $address, $utxos)

    try {
      await postTx(newTx, testnet)
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
    const currentTx = await getRawTx(market.market_state.state.transactionTxid)

    console.log([currentTx, vote, $rabinPrivKey, $address, $utxos, $privateKey])

    const newTx = await bp.transaction.getOracleVoteTx(currentTx, vote, $rabinPrivKey, $address, $utxos, $privateKey)

    const postRes = await postMarketTx(newTx, testnet)
    console.log(postRes)
  }

  async function commitToMarket(market) {
    const currentTx = await getRawTx(market.market_state.state.transactionTxid)

    // const tx = buildTx(market)
    // fundTx(tx, privateKey, address, utxos)

    const newTx = bp.transaction.getOracleCommitTx(currentTx, $rabinPrivKey, $address, $utxos, $privateKey)

    const postRes = await postMarketTx(newTx, testnet)
    console.log(postRes)
  }

  let oracle
  let burnUSD

  onMount(async () => {
    const oracleData = await gqlClient.request(oracleQuery)
    oracle = oracleData.oracle[0]

    console.log(oracle)

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
    <h1>Profile Settings</h1>

    <div id="settings">
      <div class="setting">
        <div>Domain name</div>
        <input type="text" bind:value={domainName} />
      </div>

      {#if !oracle.hasCorrectDNS}
        <DnsInfo {oracle} />
      {/if}

      <div class="setting">
        <div>Profile Description</div>
        <textarea name="details" cols="30" rows="10" bind:value={details} />
      </div>
    </div>

    <button on:click={update}>Save</button>

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
    gap: 6rem;
    margin-top: 5.5rem;
    flex-direction: column;
    align-items: center;
  }

  #settings {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4rem;
    width: min(90%, 25rem);
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

  input,
  textarea {
    background-color: #323841;
    border-radius: 0.375rem;
    font-size: 1rem;
    font-weight: 500;
    width: 100%;
  }

  input {
    height: 2.8125rem;
    padding: 0 1.25rem;
  }

  textarea {
    padding: 1.25rem;
    resize: none;
  }

  button {
    padding: 0.625rem 1.5rem;
    background: linear-gradient(149.62deg, #01a781 17.39%, #00ffc5 124.46%);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 0.375rem;
    min-width: 10rem;
  }

  .setting {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;
  }

  .setting div {
    opacity: 50%;
  }
</style>
