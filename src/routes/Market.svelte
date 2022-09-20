<script lang="ts">
  import { lmsr, transaction as pmTx, pm, bsv } from "bitcoin-predict"
  import { publicKey, privateKey, address, seed } from "../store/wallet"
  import { utxos } from "../store/wallet"
  import { getTx } from "../apis/web"
  import { testnet, feeb } from "../config"
  import { getEntries, isCompatibleVersion } from "../utils/pm"
  import { postTx } from "../utils/api"
  import { getMarketNotifications } from "../utils/notifications"
  import { rabinPubKey, rabinPrivKey } from "../store/oracle"
  import { push } from "svelte-spa-router"
  import { notify } from "../store/notifications"
  import { confirmingTx } from "../store/tx"

  import { query, subscribe } from "svelte-apollo"
  import { gql } from "@apollo/client/core"
  import cloneDeep from "lodash/cloneDeep"
  import merge from "lodash/merge"
  import { client } from "../utils/apollo"

  import OracleCard from "../components/OracleCard.svelte"
  import Chart from "../components/Chart.svelte"
  import NotFound from "../components/NotFound.svelte"
  import SubHeader from "../components/SubHeader.svelte"
  import OptionPanel from "../components/OptionPanel.svelte"
  import MarketHeader from "../components/MarketHeader.svelte"
  import MarketBanner from "../components/MarketBanner.svelte"
  import Positions from "../components/Positions.svelte"
  import LiquidityPanel from "../components/LiquidityPanel.svelte"
  import LiquiditySidePanel from "../components/LiquiditySidePanel.svelte"
  import Button from "../components/Button.svelte"
  import MarketDetailsPanel from "../components/MarketDetailsPanel.svelte"
  import MarketCreatorCard from "../components/MarketCreatorCard.svelte"
  import MarketInfoBanner from "../components/MarketInfoBanner.svelte"
  import PositionsPanel from "../components/PositionsPanel.svelte"

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
      market_state(where: {state: {transaction: {broadcastFailed: {_eq: false}}}, market: {marketStateByFirststateid: { state: {transaction: {txid: {_eq: "${
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
        hidden
        market_oracles {
          committed
        }
        state {
          transaction {
            txid
          }
          outputIndex
        }
        votes
        totalSatVolume
        stateCount
        ${$publicKey ? myEntryQuery : ""}
      }
    }
  `

  // const confimedStateQuery = gql`
  //   subscription {
  //     market_state(where: {state: {transaction: {broadcasted: {_eq:true}}}, market: {marketStateByFirststateid: { state: {transaction: {txid: {_eq: "${params.firstTxTxid}"}}}}}}, order_by: {stateCount:desc}, limit: 1) {
  //       state {
  //         transaction {
  //           txid
  //         }
  //       }
  //       stateCount
  //     }
  //   }
  // `

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
          iconType
          pubKey
          oracle_state {
            details
            domain
          }
          num_open_markets: market_oracles_aggregate(where: {market_state: {market_oracles: {committed: {_eq: true}}, state: {_not: {states: {}}}, decided: {_eq: false}}}) {
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
          hidden
          votes
          totalSatVolume
          stateCount
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

  const marketRes = query(marketQuery)
  const currentMarketState = subscribe(marketStateQuery)

  let market
  $: if ($marketRes.data) market = cloneDeep($marketRes.data.market[0])
  $: if ($currentMarketState.data && market) {
    console.log("Merging new market state", $currentMarketState.data)
    merge(market.market_state[0], $currentMarketState.data.market_state[0])
    market = market
  }

  $: compatibleVersion = market && isCompatibleVersion(market.version)

  $: existingEntry = $publicKey && market && market.market_state[0].myEntry[0]
  $: balance = existingEntry || {
    shares: new Array(market ? market.options.length : 0).fill(0),
    liquidity: 0
  }
  $: status = market
    ? market.market_state[0].decided
      ? 2
      : market.market_state[0].market_oracles[0].committed
      ? 1
      : 0
    : undefined

  $: loading = $marketRes.loading

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

    const newStateCount = market.market_state[0].stateCount + 1
    const entriesQuery = gql`
      query {
      entry(where: {market_state: {id: {_eq: ${market.market_state[0].id}}}}, order_by: {id: asc}) {
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

    let newTx
    try {
      newTx = commit ? await getCommitTx() : await getUpdateTx(newBalance, entries, redeemLiquidityPoints)
    } catch (e) {
      console.error(e)
      notify({
        type: "danger",
        text: "Failed to create transaction",
        description: e.message
      })
      updating = false
      return
    }

    console.log(newTx)

    // Mark transaction as confirming

    const broadcasted = await broadcast(newTx)
    if (broadcasted) {
      const notification = notify(
        {
          type: "success",
          text: "Order successfully placed",
          description: "Waiting for confirmation"
        },
        0
      )
      $confirmingTx = { txid: newTx.hash, notification }
    }

    updating = false
  }

  // // Notify user when places order confirms or is rejected
  // $: if ($confirmedState.data) {
  //   const newMarketState = $confirmedState.data.market_state[0]
  //   console.log("confirmed: ", newMarketState, $confirmingTxs)
  //   const confirmingTxHash = $confirmingTxs[newMarketState.stateCount]
  //   if (confirmingTxHash) {
  //     if (confirmingTxHash === newMarketState.state.transaction.txid) {
  //       notify({
  //         type: "success",
  //         text: "Confirmed transaction",
  //         description: `<a href='https://${
  //           testnet ? "test." : ""
  //         }whatsonchain.com/tx/${confirmingTxHash}'>${confirmingTxHash.slice(0, 20)}...</a>`
  //       })
  //       delete $confirmingTxs[newMarketState.stateCount]
  //       $confirmingTxs = $confirmingTxs
  //     } else {
  //       notify({
  //         type: "danger",
  //         text: "Failed to confirm transaction",
  //         description: "Your order did not go through"
  //       })
  //       $confirmingTxs = {}
  //     }
  //   }
  // }

  async function broadcast(tx: bsv.Transaction) {
    try {
      await postTx(tx, testnet)
    } catch (e) {
      notify({
        type: "danger",
        text: "Failed to update market",
        description: e.message
      })
      return false
    }

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
    const currentTx = await getTx(market.market_state[0].state.transaction.txid)

    let updateTx
    if (existingEntry) {
      console.log([
        currentTx,
        entries,
        newBalance,
        redeemLiquidityPoints,
        $privateKey,
        $address,
        $utxos,
        $privateKey,
        feeb
      ])
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
        market.market_state[0].state.outputIndex,
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

    const currentTx = await getTx(market.market_state[0].state.transaction.txid)
    const updateTx = await pmTx.getOracleVoteTx(currentTx, option, $rabinPrivKey, $address, $utxos, $privateKey, feeb)

    const broadcasted = await broadcast(updateTx)

    if (broadcasted) {
      market.market_state[0].decision = option
      market.market_state[0].decided = true
    }

    resolving = false
    updating = false
  }

  let redeemingInvalid
  async function redeemInvalid() {
    redeemingInvalid = true

    console.log("Redeeming invalid shares")
    await updateMarket({
      liquidity: market.market_state[0].liquidity,
      shares: market.market_state[0].shares.map((s, i) => (i === market.market_state[0].decision ? i : 0))
    })

    redeemingInvalid = false
  }

  let updatingSettings
  async function updateSettings(settings: any) {
    if (updating) return
    updating = true
    updatingSettings = true

    console.log("Hiding market")

    const currentTx = await getTx(market.market_state[0].state.transaction.txid)
    const updateTx = await pmTx.getUpdateMarketSettingsTx(currentTx, settings, $privateKey, feeb)
    pmTx.fundTx(updateTx, $privateKey, $address, $utxos, feeb)

    const broadcasted = await broadcast(updateTx)

    if (broadcasted) {
      market.market_state[0].hidden = settings.hidden
    }

    updatingSettings = false
    updating = false
  }

  async function getCommitTx() {
    const currentTx = await getTx(market.market_state[0].state.transaction.txid)
    const updateTx = pmTx.getOracleCommitTx(
      currentTx,
      $rabinPrivKey,
      $address,
      $utxos,
      $privateKey,
      market.market_state[0].state.outputIndex,
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

    if (broadcasted) market.market_state[0].market_oracles[0].committed = true

    commitLoading = false
    updating = false
  }

  $: console.log("updating", updating)

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
    updatingOption = market.market_state[0].decision

    const newBalance = {
      shares: new Array(balance.shares.length).fill(0),
      liquidity: balance.liquidity
    }

    await updateMarket(newBalance)

    if (updatingOption === market.market_state[0].decision) updatingOption = undefined
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
        shares: balance.shares.map((s, i) => (i === market.market_state[0].decision ? s : 0)),
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

  $: if (market && market.market_state[0].decided) openedPanels[market.market_state[0].decision] = true

  $: notifications = market ? getMarketNotifications(market) : []

  $: if (params.firstTxTxid === "2e5842faa55d9930f024a5963b8cac3720a9927be30a745da1d054e003d38c95") {
    notifications = notifications.concat([
      {
        type: "warning",
        title: "Issue detected",
        description:
          "We are investigating and fixing an issue in this market. Thank you for participating the the Beta."
      }
    ])
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
      {#if notifications.length}
        <div class="notifications">
          {#each notifications as notification}
            <MarketInfoBanner {notification} />
          {/each}
        </div>
      {/if}

      <MarketHeader {market} />

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
          <PositionsPanel {market} />
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
              on:hide={() => updateSettings({ hidden: true })}
              on:unhide={() => updateSettings({ hidden: false })}
              loadingResolve={resolving}
              loadingRedeem={redeemingInvalid}
              loadingHide={updatingSettings}
            />
          {/if}
        {/if}

        <div class="options">
          {#each market.market_state[0].shares as shares, index}
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
    /* margin-top: 3.125rem; */
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
    flex-shrink: 1;
    margin-top: 3.125rem;
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
    margin-top: 3.125rem;
  }

  .options {
    width: 18.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .chart {
    width: 100%;
    /* background-color: #323841; */
    border: 2px solid #323841;
    border-radius: 0.75rem;
    box-shadow: 3px 3px 17px 3px #323841;
    padding: 0.6rem 0;
  }

  .card {
    background-color: #323841;
    border-radius: 0.376rem;
    padding: 1.125rem;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    align-items: center;
    width: 18.75rem;
  }
  .warning {
    font-weight: 700;
    font-size: 1.1rem;
    color: #ff0060;
  }

  .notifications {
    display: flex;
    width: 100%;
    flex-direction: column;
    gap: 1rem;
    /* margin-top: 2rem; */
  }

  @media screen and (max-width: 1000px) {
    main {
      gap: 3rem;
    }
  }

  @media screen and (max-width: 800px) {
    main {
      flex-direction: column;
      margin-top: 0;
    }

    .side-panel {
      flex-direction: row;
      flex-wrap: wrap;
      justify-content: space-evenly;
      align-items: flex-start;
      width: 100%;
      margin-top: 0rem;
    }
  }
</style>
