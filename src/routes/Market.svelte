<script lang="ts">
  import { lmsr, transaction as pmTx, pm, bsv } from "bitcoin-predict"
  import { price } from "../store/price"
  import { gql } from "graphql-request"
  import { gqlClient } from "../utils/graphql"
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

  import SlCard from "@shoelace-style/shoelace/dist/components/card/card.js"
  import SlFormatNumber from "@shoelace-style/shoelace/dist/components/format-number/format-number"
  import SlFormatDate from "@shoelace-style/shoelace/dist/components/format-date/format-date"
  import SlMenu from "@shoelace-style/shoelace/dist/components/menu/menu"
  import SlMenuItem from "@shoelace-style/shoelace/dist/components/menu-item/menu-item"
  import SlMenuLabel from "@shoelace-style/shoelace/dist/components/menu-label/menu-label"
  import SlIconButton from "@shoelace-style/shoelace/dist/components/icon-button/icon-button"

  const { addNotification } = getNotificationsContext()

  export let params

  const marketQuery = gql`
  {
      market(where: {marketStateByFirststateid: { state: {transaction: {txid: {_eq: "${params.firstTxTxid}"}}}}}) {
        creatorPubKey
        creatorFee
        details
        version
        liquidityFee
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
            }
          }
          state {
            transaction {
              txid
            }
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

  let payment_modal
  let redeem_modal

  let balanceTab = "positions"

  let market

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

  async function getMarket() {
    const res = await gqlClient.request(marketQuery)
    console.log(res.market[0])
    return res.market[0]
  }

  /**
   * Creates and broadcasts market update transaction
   *
   * @param balance New Balance
   */
  async function updateMarket(newBalance: lmsr.balance, redeemLiquidityPoints = false) {
    console.log(market.entries)
    const entries = getEntries(market)

    const newTx = await getUpdateTx(newBalance, entries, redeemLiquidityPoints)
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

    redeem_modal.hide()
    payment_modal.hide()
    addNotification({
      type: "success",
      text: "Successfully updated market",
      description: `<a href='https://${testnet ? "test." : ""}whatsonchain.com/tx/${newTx.hash}'>${newTx.hash.slice(
        0,
        20
      )}...</a>`,
      position: "top-right"
    })

    const spentInputs = newTx.inputs.slice(1)
    for (const input of spentInputs) {
      $utxos = $utxos.filter(
        utxo => utxo.txId !== input.prevTxId.toString("hex") || utxo.outputIndex !== input.outputIndex
      )
    }

    const newUtxos = getUtxos(newTx)
      .slice(1)
      .filter(
        utxo =>
          utxo.script.toASM() === `OP_DUP OP_HASH160 ${$address.hashBuffer.toString("hex")} OP_EQUALVERIFY OP_CHECKSIG`
      )
    $utxos = $utxos.concat(newUtxos)

    market = await getMarket()
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
    const currentTx = await getTx(market.market_state.transaction.txid, gqlClient)

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
      updateTx = pmTx.getAddEntryTx(currentTx, entries, $publicKey, newBalance, $address, $utxos, $privateKey, feeb)
    }

    return updateTx
  }

  let loading = true
  onMount(async () => {
    market = await getMarket()
    loading = false
  })

  $: status = market && market.market_state.decided ? "Resolved" : "Open"

  $: hasBalance = balance.shares.reduce((partialSum, a) => partialSum + a, 0) > 0

  let tab = 1
</script>

<SubHeader>
  <button class={tab === 1 ? "selected" : ""} on:click={() => (tab = 1)}>Overview</button>
  <button class={tab === 2 ? "selected" : ""} on:click={() => (tab = 2)}>Details</button>
</SubHeader>

{#if market && $seed}
  <RedeemModal {market} bind:this={redeem_modal} {balance} on:update={e => updateMarket(e.detail.balance)} />

  <PaymentModal
    {market}
    bind:this={payment_modal}
    {balance}
    on:buy={e => buySell(e.detail.option, e.detail.amount)}
    on:sell={e => buySell(e.detail.option, -e.detail.amount)}
  />
{/if}

<main>
  {#if loading}
    loading...
  {:else if market}
    <div class="main-panel">
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
          <a href="#/login"><sl-button type="primary">Login to trade</sl-button></a>
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
            {#if existingEntry && existingEntry.liquidity}
              <LiquidityPanel
                {market}
                entry={existingEntry}
                on:add={e => payment_modal.show("buy", -1)}
                on:remove={e => payment_modal.show("sell", -1)}
                on:redeem={e => updateMarket(balance, true)}
              />
            {/if}
          {/if}
        {/if}

        <div class="container">
          <div class="cards">
            <!-- <div class="full-width">
            <OutcomeCard
              {market}
              {balance}
              on:buy={e => payment_modal.show("buy", e.detail.option)}
              on:sell={e => payment_modal.show("sell", e.detail.option)}
            />
          </div> -->

            <!-- <div class="card-wide">
            <MarketDetailsCard {market} />
          </div> -->

            {#if $seed && compatibleVersion}
              <!-- <MarketMenu
              {balance}
              {market}
              on:update={e => updateMarket(e.detail.balance)}
              on:buy={e => payment_modal.show("buy", e.detail.option)}
              on:sell={e => payment_modal.show("sell", e.detail.option)}
              on:redeemInvalid={e => redeem_modal.show("redeemInvalid")}
              on:redeemWinning={e => redeem_modal.show("redeemWinning")}
              on:extractLiquidity={e => redeem_modal.show("extractLiquidity")}
            /> -->
            {/if}
          </div>

          {#if existingEntry && existingEntry.liquidity}
            <LiquidityCard
              {market}
              entry={existingEntry}
              on:add={e => payment_modal.show("buy", -1)}
              on:remove={e => payment_modal.show("sell", -1)}
              on:redeem={e => updateMarket(balance, true)}
            />
          {/if}
        </div>
      {:else if tab === 2}
        <OracleCard oracle={market.market_state.market_oracles[0].oracle} />
      {/if}
    </div>

    <div class="side-panel">
      {#each market.market_state.shares as shares, index}
        <OptionPanel />
      {/each}
    </div>
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

  .main-panel {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    align-items: center;
    width: 100%;
  }

  .side-panel {
    width: 18.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  h1 {
    font-size: 2.3rem;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: min(90%, 50rem);
    font-weight: bold;
  }

  h1 div {
    display: flex;
    align-items: center;
    font-size: 1.3rem;
  }

  .chart {
    width: 100%;
  }

  .cards {
    display: grid;
    gap: 1rem;
    grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
    align-items: stretch;
  }
  .card-wide {
    grid-column: span 2 / auto;
  }

  .full-width {
    grid-column: 1 / -1;
  }

  .container {
    gap: 1rem;
  }

  .txid {
    font-size: var(--sl-font-size-x-small);
    color: var(--sl-color-gray-400);
    margin: 0.2rem;
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
</style>
