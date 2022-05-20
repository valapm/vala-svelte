<script type="ts">
  import { BoostPowJobModel } from "../utils/boostPow"
  import { bsv, rabin as rab } from "bitcoin-predict"
  import * as bp from "bitcoin-predict"
  import { rabinPubKey, rabinPrivKey } from "../store/oracle"
  import { address, privateKey, utxos, outputs } from "../store/wallet"
  import { testnet } from "../config"
  import { gql } from "graphql-request"
  import { gqlClient } from "../utils/graphql"
  import { onMount } from "svelte"
  import { price } from "../store/price"
  import { postTx } from "../utils/api"
  import { tick } from "svelte"
  import { isValidUrl, parseHostname } from "../utils/url"
  import { notify } from "../store/notifications"

  import DnsInfo from "../components/DnsInfo.svelte"
  import Button from "../components/VariantButton.svelte"
  import SubHeader from "../components/SubHeader.svelte"

  const rabin = new rab.RabinSignature()

  const diffMultiplier = 0.00002
  const feeb = 0.5

  export let oracle

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

  async function getNewOracleTx(): bsv.Transaction {
    const valaState = (await gqlClient.request(valaIndexTxQuery)).state[0]

    const prevTx = new bsv.Transaction()
    prevTx.fromString(valaState.transaction.hex)

    const newTx = bp.transaction.getNewOracleTx($rabinPubKey, prevTx, 0, feeb)
    bp.transaction.fundTx(newTx, $privateKey, $address, $utxos)

    return newTx
  }

  let loading = false

  async function update() {
    loading = true
    let prevTx
    let prevOutputIndex

    if (!isValidUrl(domainName)) {
      notify({
        type: "danger",
        text: "Invalid domain name"
      })
      loading = false
      return
    }

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
        notify({
          type: "danger",
          text: "Failed to broadcast transaction"
        })
        loading = false
        return
      }

      prevTx = initTx
      prevOutputIndex = 1
    }

    const oracleDetails = {
      domain: domainName,
      description: details
    }

    const newTx = bp.transaction.getOracleUpdateTx(prevTx, prevOutputIndex, 0, oracleDetails, $rabinPrivKey, feeb)
    bp.transaction.fundTx(newTx, $privateKey, $address, $utxos, feeb)

    try {
      await postTx(newTx, testnet)
    } catch (e) {
      notify({
        type: "danger",
        text: e.message
      })
      loading = false
      return
    }

    notify({
      type: "success",
      text: "Profile saved"
    })

    const newCurrentOracleState = {
      details,
      domain: domainName,
      hasCorrectDNS: false,
      state: {
        transaction: {
          hex: newTx.uncheckedSerialize()
        },
        outputIndex: prevOutputIndex
      }
    }

    if (oracle) {
      const newDate = new Date(Date.now()).toISOString()

      oracle.oracleStateByCurrentstateid = newCurrentOracleState
      oracle.oracle_state = {
        state: {
          transaction: {
            processedAt: newDate.slice(0, newDate.length - 1) // Remove the Z
          }
        }
      }
    } else {
      oracle = { oracleStateByCurrentstateid: newCurrentOracleState }
    }

    loading = false
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

    await postTx(newTx, testnet)
  }

  async function commitToMarket(market) {
    const currentTx = await getRawTx(market.market_state.state.transactionTxid)

    // const tx = buildTx(market)
    // fundTx(tx, privateKey, address, utxos)

    const newTx = bp.transaction.getOracleCommitTx(currentTx, $rabinPrivKey, $address, $utxos, $privateKey)

    await postTx(newTx, testnet)
  }

  onMount(async () => {
    if (oracle && oracle.oracleStateByCurrentstateid) {
      const oracleDomain = oracle.oracleStateByCurrentstateid.domain
      if (oracleDomain) domainName = parseHostname(oracleDomain)
      details = oracle.oracleStateByCurrentstateid.details
    }
  })
</script>

<div id="oracle">
  {#if !oracle || !oracle.oracleStateByCurrentstateid || !oracle.oracleStateByCurrentstateid.domain}
    <h1>Oracle Setup</h1>

    <div class="setup-form">
      <input bind:value={domainName} placeholder="Your domain name" type="text" />
      <Button {loading} on:click={update}>Save</Button>
    </div>
  {:else}
    <h1>Profile Settings</h1>

    <div id="settings">
      <div class="setting">
        <div>
          Domain name
          {#if !oracle.hasCorrectDNS}
            <img src="./icons/exclamation-circle.svg" alt="invalid" />
          {:else}
            <img src="./icons/checkmark-circle.svg" alt="valid" />
          {/if}
        </div>
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

    <Button {loading} on:click={update}>Save</Button>
  {/if}
</div>

<style>
  #oracle {
    display: flex;
    gap: 6rem;
    margin-top: 5rem;
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

  .setting {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;
  }

  .setting div {
    opacity: 50%;
    display: flex;
    align-items: center;
    height: 1rem;
    gap: 0.5rem;
  }

  .setting img {
    height: 100%;
  }
</style>
