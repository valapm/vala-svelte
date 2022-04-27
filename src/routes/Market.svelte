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
  import { getNotificationsContext } from "svelte-notifications"
  import { pop } from "svelte-spa-router"
  import { postTx } from "../utils/api"
  import { rabinPubKey, rabinPrivKey } from "../store/oracle"
  import { push } from "svelte-spa-router"

  import { query, getClient } from "svelte-apollo"
  import { gql } from "@apollo/client/core"

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
  import Table from "../components/Table.svelte"

  const gqlClient = getClient()

  const { addNotification } = getNotificationsContext()

  export let params

  const marketStateQuery = gql`
    query {
      market_state {
        totalSatVolume
        accLiquidityFeePool
        liquidityPoints
        liquidityFeePool
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
        market_state {
          totalSatVolume
          accLiquidityFeePool
          liquidityPoints
          liquidityFeePool
          satoshis
          market_oracles {
            committed
            oracle {
              oracleStateByCurrentstateid {
                domain
              }
              pubKey
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
          entries {
            liquidity
            shares
            investor {
              pubKey
            }
            liquidityPoints
            prevLiquidityPoolState
          }
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
      addNotification({
        type: "danger",
        text: "Market version not supported",
        position: "top-right"
      })
    }
  }

  $: existingEntry =
    $publicKey && market && market.market_state.entries.find(entry => entry.investor.pubKey === $publicKey.toString())
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
  $: market = $marketRes.data ? $marketRes.data.market[0] : undefined
  $: loading = $marketRes.loading

  let updating = false

  /**
   * Creates and broadcasts market update transaction
   *
   * @param balance New Balance
   */
  async function updateMarket(newBalance: lmsr.balance, redeemLiquidityPoints = false, commit = false) {
    if (updating) return // TODO: Show error
    updating = true

    console.log(market.entries)
    const entries = getEntries(market)

    const newTx = commit ? await getCommitTx() : await getUpdateTx(newBalance, entries, redeemLiquidityPoints)
    console.log(newTx)

    try {
      await postTx(newTx, testnet)
    } catch (e) {
      addNotification({
        type: "danger",
        text: "Failed to updated market",
        description: e.message,
        position: "top-right"
      })
      return
    }

    addNotification({
      type: "success",
      text: "Successfully updated market",
      description: `<a href='https://${testnet ? "test." : ""}whatsonchain.com/tx/${newTx.hash}'>${newTx.hash.slice(
        0,
        20
      )}...</a>`,
      position: "top-right"
    })
    updating = false
  }

  async function buySell(option: number, shareChange: number) {
    const newBalance =
      option === -1
        ? {
            shares: balance.shares,
            liquidity: balance.liquidity + shareChange
          }
        : {
            shares: balance.shares.map((shares, i) => (i === option ? shares + shareChange : shares)),
            liquidity: balance.liquidity
          }
    updateMarket(newBalance)
  }

  async function getUpdateTx(newBalance, entries, redeemLiquidityPoints = false) {
    const currentTx = await getTx(market.market_state.state.transaction.txid, gqlClient)

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

  async function getCommitTx() {
    const currentTx = await getTx(market.market_state.state.transaction.txid, gqlClient)
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
    commitLoading = true
    await updateMarket(balance, false, true)
    commitLoading = false
  }

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

  let openedPanels = []
  function handleOpened(index) {
    const newArray = new Array(market.options.length).fill(false)
    newArray[index] = true
    openedPanels = newArray
  }
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
          <OracleCard
            oracle={market.market_state.market_oracles[0].oracle}
            button={true}
            on:click={() => push("#/oracles/" + market.market_state.market_oracles[0].oracle.pubKey)}
          />
        </div>
      {/if}
    </div>

    {#if compatibleVersion && $privateKey}
      <div class="side-panel">
        {#if $rabinPubKey.toString() === market.market_state.market_oracles[0].oracle.pubKey}
          {#if status === 0}
            <div class="card">
              Market is Unpublished
              <Button type="filled-blue full-width" on:click={commit} loading={commitLoading}>Publish Market</Button>
            </div>
          {:else if status === 1}
            <div class="card">
              <Table>
                <div>
                  <div class="label">Earnings Total</div>
                  <div>???</div>
                </div>
              </Table>
              <Button type="filled-blue full-width">Resolve Market</Button>
            </div>
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
            />
          {/each}
        </div>

        <LiquiditySidePanel
          {market}
          entry={existingEntry}
          on:update={e => changeLiquidity(e.detail.change)}
          on:redeem={redeemLiquidity}
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
