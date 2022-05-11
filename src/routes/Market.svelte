<script lang="ts">
  import { lmsr, transaction as pmTx, pm, bsv } from "bitcoin-predict"
  import { price } from "../store/price"
  // import { gql } from "graphql-request"
  // import { gqlClient } from "../utils/graphql"
  import { onMount } from "svelte"
  import { publicKey, privateKey, address, seed } from "../store/wallet"
  import { utxos } from "../store/wallet"
  import { getTx } from "../apis/web"
  import { testnet, feeb } from "../config"
  import { getEntries, isCompatibleVersion } from "../utils/pm"
  import { round } from "../utils/format"
  import { getUtxos } from "../utils/transaction"
  import { pop } from "svelte-spa-router"
  import { postTx } from "../utils/api"
  import { rabinPubKey, rabinPrivKey } from "../store/oracle"
  import { push } from "svelte-spa-router"
  import { notify } from "../store/notifications"

  import { query, subscribe } from "svelte-apollo"
  import { gql } from "@apollo/client/core"
  import cloneDeep from "lodash/cloneDeep"
  import merge from "lodash/merge"
  import { client } from "../utils/apollo"

  import OracleCard from "../components/OracleCard.svelte"
  import Chart from "../components/Chart.svelte"
  import OutcomeCard from "../components/OutcomeCard.svelte"
  import PaymentModal from "../components/PaymentModal.svelte"
  import MarketDetailsCard from "../components/MarketDetailsCard.svelte"
  import MarketMenu from "../components/MarketMenu.svelte"
  import RedeemModal from "../components/RedeemModal.svelte"
  import NotFound from "../components/NotFound.svelte"
  import LiquidityCard from "../components/LiquidityCard.svelte"
  import SubHeader from "../components/SubHeader.svelte"
  import OptionPanel from "../components/OptionPanel.svelte"
  import MarketHeader from "../components/MarketHeader.svelte"
  import MarketBanner from "../components/MarketBanner.svelte"
  import Positions from "../components/Positions.svelte"
  import LiquidityPanel from "../components/LiquidityPanel.svelte"
  import LiquiditySidePanel from "../components/LiquiditySidePanel.svelte"
  import Button from "../components/Button.svelte"
  import MarketDetailsPanel from "../components/MarketDetailsPanel.svelte"
  import Table from "../components/CardTable.svelte"
  import MarketCreatorCard from "../components/MarketCreatorCard.svelte"

  export let params

  const myEntryQuery = $publicKey
    ? `myEntry: entries(where: {investorPubKey: {_eq: "${$publicKey.toString()}"}}) {
          liquidity
          shares
          liquidityPoints
          prevLiquidityPoolState
        }`
    : ""

  const marketStateQuery = gql`
    subscription {
      market_state(where: {market: {marketStateByFirststateid: { state: {transaction: {txid: {_eq: "${
        params.firstTxTxid
      }"}}}}}}, order_by: {stateCount:desc}, limit: 1) {
        totalSatVolume
        accLiquidityFeePool
        liquidityPoints
        liquidityFeePool
        satoshis
        decided
        decision
        shares
        liquidity
        creatorSatEarnings
        id
        market_oracles {
          committed
        }
        state {
          transaction {
            txid
          }
          outputIndex
        }
        ${$publicKey ? myEntryQuery : ""}
      }
    }
  `

  const marketQuery = gql`
  query {
      market(where: {marketStateByFirststateid: { state: {transaction: {txid: {_eq: "${params.firstTxTxid}"}}}}}) {
        creatorPubKey
        creatorFee
        details
        version
        liquidityFee
        creatorFee
        oracle {
          pubKey
          oracleStateByCurrentstateid {
            details
            domain
          }
          num_open_markets: market_oracles_aggregate(where: {market_state: {state: {_not: {states: {}}}, decided: {_eq: false}}}) {
            aggregate {
              count
            }
          }
          num_resolved_markets: market_oracles_aggregate(where: {market_state: {state: {_not: {states: {}}}, decided: {_eq: true}}}) {
            aggregate {
              count
            }
          }
        }
        market_state {
          id
          totalSatVolume
          accLiquidityFeePool
          liquidityPoints
          liquidityFeePool
          creatorSatEarnings
          satoshis
          market_oracles {
            committed
          }
          state {
            transaction {
              txid
            }
            outputIndex
          }
          decided
          decision
          shares
          liquidity
          ${$publicKey ? myEntryQuery : ""}
        }
        marketStateByFirststateid {
          state {
            transaction {
              txid
              broadcastedAt
              minerTimestamp
              processedAt
            }
          }
        }
        resolve
        options {
          name
          details
        }
      }
    }
  `

  let balanceTab = "positions"

  $: compatibleVersion = market && isCompatibleVersion(market.version)
  $: {
    if (compatibleVersion === false) {
      notify({
        type: "danger",
        text: "Market version not supported",
        position: "top-right"
      })
    }
  }

  $: existingEntry = $publicKey && market && market.market_state.myEntry[0]
  $: balance = existingEntry || {
    shares: new Array(market ? market.options.length : 0).fill(0),
    liquidity: 0
  }
  $: status = market
    ? market.market_state.decided
      ? 2
      : market.market_state.market_oracles[0].committed
      ? 1
      : 0
    : undefined

  const marketRes = query(marketQuery)
  $: market = $marketRes.data ? cloneDeep($marketRes.data.market[0]) : undefined
  $: loading = $marketRes.loading

  const currentMarketState = subscribe(marketStateQuery)
  console.log($currentMarketState)

  $: if (market && $currentMarketState.data) {
    merge(market.market_state, $currentMarketState.data.market_state[0])
    market = market
  }

  $: console.log($currentMarketState.data)

  let updating = false

  /**
   * Creates and broadcasts market update transaction
   *
   * @param balance New Balance
   */
  async function updateMarket(newBalance: lmsr.balance, redeemLiquidityPoints = false, commit = false) {
    if (updating) {
      console.error("Already updating")
      return
    } // TODO: Show error
    updating = true

    const entriesQuery = gql`
      query {
      entry(where: {market_state: {id: {_eq: ${market.market_state.id}}}}) {
        liquidity
        shares
        liquidityPoints
        prevLiquidityPoolState
        investor {
          pubKey
        }
    }}`

    const entriesRes = await client.query({ query: entriesQuery })

    if (entriesRes.error) {
      console.error(entriesRes)
      updating = false
      throw new Error("Failed to fetch entries")
    }

    console.log(entriesRes.data.entry)
    const entries = getEntries(entriesRes.data.entry)

    const newTx = commit ? await getCommitTx() : await getUpdateTx(newBalance, entries, redeemLiquidityPoints)
    console.log(newTx)

    await broadcast(newTx)
    updating = false
  }

  async function broadcast(tx: bsv.Transaction) {
    try {
      await postTx(tx, testnet)
    } catch (e) {
      notify({
        type: "danger",
        text: "Failed to updated market",
        description: e.message
      })
      return false
    }

    notify({
      type: "success",
      text: "Successfully updated market",
      description: `<a href='https://${testnet ? "test." : ""}whatsonchain.com/tx/${tx.hash}'>${tx.hash.slice(
        0,
        20
      )}...</a>`
    })
    return true
  }

  // async function buySell(option: number, shareChange: number) {
  //   const newBalance =
  //     option === -1
  //       ? {
  //           shares: balance.shares,
  //           liquidity: balance.liquidity + shareChange
  //         }
  //       : {
  //           shares: balance.shares.map((shares, i) => (i === option ? shares + shareChange : shares)),
  //           liquidity: balance.liquidity
  //         }
  //   updateMarket(newBalance)
  // }

  async function getUpdateTx(newBalance, entries, redeemLiquidityPoints = false) {
    const currentTx = await getTx(market.market_state.state.transaction.txid)

    let updateTx
    if (existingEntry) {
      console.log([currentTx, entries, newBalance, $privateKey, $address, $utxos, $privateKey])
      updateTx = pmTx.getUpdateEntryTx(
        currentTx,
        entries,
        newBalance,
        redeemLiquidityPoints,
        $privateKey,
        $address,
        $utxos,
        $privateKey,
        feeb
      )
    } else {
      updateTx = pmTx.getAddEntryTx(
        currentTx,
        entries,
        $publicKey,
        newBalance,
        $address,
        $utxos,
        $privateKey,
        market.market_state.state.outputIndex,
        feeb
      )
    }

    return updateTx
  }

  let resolving = false
  async function resolve(option: number) {
    if (updating) return
    updating = true

    console.log("Resolving option " + option)
    resolving = true

    const currentTx = await getTx(market.market_state.state.transaction.txid)
    const updateTx = await pmTx.getOracleVoteTx(currentTx, option, $rabinPrivKey, $address, $utxos, $privateKey, feeb)

    const broadcasted = await broadcast(updateTx)

    if (broadcasted) {
      market.market_state.decision = option
      market.market_state.decided = true
    }

    resolving = false
    updating = false
  }

  let redeemingInvalid
  async function redeemInvalid() {
    redeemingInvalid = true

    console.log("Redeeming invalid shares")
    await updateMarket({
      liquidity: market.market_state.liquidity,
      shares: market.market_state.shares.map((s, i) => (i === market.market_state.decision ? i : 0))
    })

    redeemingInvalid = false
  }

  async function getCommitTx() {
    const currentTx = await getTx(market.market_state.state.transaction.txid)
    const updateTx = pmTx.getOracleCommitTx(
      currentTx,
      $rabinPrivKey,
      $address,
      $utxos,
      $privateKey,
      market.market_state.state.outputIndex,
      feeb
    )
    return updateTx
  }

  let commitLoading = false
  async function commit() {
    if (updating) return
    updating = true
    commitLoading = true
    const tx = await getCommitTx()
    const broadcasted = await broadcast(tx)

    if (broadcasted) market.market_state.market_oracles[0].committed = true

    commitLoading = false
    updating = false
  }

  $: console.log("updating", updating)

  $: hasBalance = balance.shares.reduce((partialSum, a) => partialSum + a, 0) > 0

  let tab = 1

  let updatingLiquidity = false
  let redeemingLiquidity = false
  let updatingOption = undefined

  async function updateBalance(option: number, change: number) {
    updatingOption = option

    const newBalance = {
      shares: [...balance.shares],
      liquidity: balance.liquidity
    }
    newBalance.shares[option] = balance.shares[option] + change

    await updateMarket(newBalance)

    if (updatingOption === option) updatingOption = undefined
  }

  async function redeemShares() {
    updatingOption = market.market_state.decision

    const newBalance = {
      shares: new Array(balance.shares.length).fill(0),
      liquidity: balance.liquidity
    }

    await updateMarket(newBalance)

    if (updatingOption === market.market_state.decision) updatingOption = undefined
  }

  async function changeLiquidity(change: number) {
    updatingLiquidity = true
    const newBalance = {
      shares: balance.shares,
      liquidity: balance.liquidity + change
    }
    await updateMarket(newBalance)
    updatingLiquidity = false
  }

  async function redeemLiquidity() {
    redeemingLiquidity = true
    await updateMarket(balance, true)
    redeemingLiquidity = false
  }

  async function redeemAll() {
    redeemingLiquidity = true
    await updateMarket(
      {
        shares: balance.shares,
        liquidity: 0
      },
      true
    )
    redeemingLiquidity = false
  }

  let openedPanels = []
  function handleOpened(index) {
    const newArray = new Array(market.options.length).fill(false)
    newArray[index] = true
    openedPanels = newArray
  }

  $: if (market && market.market_state.decided) openedPanels[market.market_state.decision] = true
</script>

<SubHeader>
  <button class={tab === 1 ? "selected" : ""} on:click={() => (tab = 1)}>Overview</button>
  <button class={tab === 2 ? "selected" : ""} on:click={() => (tab = 2)}>Details</button>
</SubHeader>

<main>
  {#if loading}
    loading...
  {:else if market}
    <div class="main-panel">
      <MarketHeader {market} />

      {#if !compatibleVersion}<div class="warning">Unsupported market version!</div>{/if}

      {#if tab === 1}
        <MarketBanner {market} />
        <!-- <a href={`https://${testnet ? "test." : ""}whatsonchain.com/tx/${params.firstTxTxid}`} class="txid">
        {params.firstTxTxid.slice(0, 20)}...</a
      > -->
        <div class="chart">
          <Chart {market} />
        </div>
        <!-- <AnimatedNumber {num} />
    <button on:click={() => (num = num + 1000)}> Increase </button> -->

        {#if !$seed}
          <a href="#/login"><Button type="filled">Login to trade</Button></a>
        {:else}
          <div id="balances">
            <button
              on:click={() => (balanceTab = "positions")}
              style={balanceTab === "positions" ? "color: white;" : ""}>My Positions</button
            >
            <button
              on:click={() => (balanceTab = "liquidity")}
              style={balanceTab === "liquidity" ? "color: white;" : ""}>My Liquidity</button
            >
          </div>

          {#if balanceTab === "positions"}
            {#if hasBalance}
              <Positions {market} {balance} />
            {:else}
              Nothing here yet
            {/if}
          {:else if balanceTab === "liquidity"}
            <LiquidityPanel {market} entry={existingEntry} on:redeem={e => updateMarket(balance, true)} />
          {/if}
        {/if}
      {:else if tab === 2}
        <div class="details-panel">
          <MarketDetailsPanel {market} />
          <h2>Oracle</h2>
          <OracleCard oracle={market.oracle} button={true} on:click={() => push("#/oracles/" + market.oracle.pubKey)} />
        </div>
      {/if}
    </div>

    {#if compatibleVersion && $privateKey}
      <div class="side-panel">
        {#if $rabinPubKey.toString() === market.oracle.pubKey}
          {#if status === 0}
            <div class="card">
              Market is Unpublished
              <Button type="filled-blue full-width" on:click={commit} loading={commitLoading}>Publish Market</Button>
            </div>
          {:else}
            <MarketCreatorCard
              {market}
              on:resolve={e => resolve(e.detail.option)}
              on:redeemInvalid={redeemInvalid}
              loading={resolving || redeemingInvalid}
            />
          {/if}
        {/if}

        <div class="options">
          {#each market.market_state.shares as shares, index}
            <OptionPanel
              on:opened={e => handleOpened(index)}
              open={openedPanels[index]}
              {market}
              {balance}
              option={index}
              loading={updatingOption === index}
              on:update={e => updateBalance(index, e.detail.change)}
              on:redeem={redeemShares}
            />
          {/each}
        </div>

        <LiquiditySidePanel
          {market}
          entry={existingEntry}
          on:update={e => changeLiquidity(e.detail.change)}
          on:redeem={redeemLiquidity}
          on:redeemAll={redeemAll}
          loadingUpdate={updatingLiquidity}
          loadingRedeem={redeemingLiquidity}
        />
      </div>
    {/if}
  {:else}
    <NotFound />
  {/if}
</main>

<style>
  main {
    width: min(65rem, 95%);
    display: flex;
    margin-top: 3.125rem;
    gap: 5.5rem;
  }

  h2 {
    font-weight: 500;
    font-size: 1.5rem;
    margin-top: 1.75rem;
  }

  .main-panel {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    align-items: center;
    width: 100%;
  }

  .details-panel {
    display: flex;
    flex-direction: column;
    gap: 1.4rem;
    width: 100%;
  }

  .side-panel {
    width: 18.75rem;
    display: flex;
    flex-direction: column;
    gap: 2.75rem;
    flex-shrink: 0;
  }

  .options {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .chart {
    width: 100%;
  }

  .card {
    background-color: #323841;
    border-radius: 0.376rem;
    padding: 1.125rem;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    align-items: center;
  }

  #balances {
    font-size: 1.25rem;
    display: flex;
    gap: 2.5rem;
    color: rgba(255, 255, 255, 0.5);
    justify-content: flex-start;
    font-weight: 500;
    width: 100%;
  }

  .warning {
    font-weight: 700;
    font-size: 1.1rem;
    color: #ff0060;
  }
</style>
