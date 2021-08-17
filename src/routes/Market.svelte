<script lang="ts">
  import { lmsr, transaction as pmTx, bsv } from "bitcoin-predict"
  import { price } from "../store/price"
  import { gql } from "graphql-request"
  import { gqlClient } from "../store/graphql"
  import { onMount } from "svelte"
  import { publicKey, privateKey, address, seed } from "../store/wallet"
  import { getUtxos } from "../utils/utxo"
  import { getTx } from "../apis/web"
  import { postMarketTx } from "../apis/web"
  import { testnet } from "../store/options"
  import { getEntries } from "../utils/pm"
  import { round } from "../utils/format"

  import OracleCard from "../components/OracleCard.svelte"
  import Chart from "../components/Chart.svelte"
  import OutcomeCard from "../components/OutcomeCard.svelte"
  import PaymentModal from "../components/PaymentModal.svelte"
  import MarketDetailsCard from "../components/MarketDetailsCard.svelte"
  import MarketMenu from "../components/MarketMenu.svelte"
  import Backbutton from "../components/Backbutton.svelte"

  import SlCard from "@shoelace-style/shoelace/dist/components/card/card.js"
  import SlFormatNumber from "@shoelace-style/shoelace/dist/components/format-number/format-number"
  import SlFormatDate from "@shoelace-style/shoelace/dist/components/format-date/format-date"
  import SlMenu from "@shoelace-style/shoelace/dist/components/menu/menu"
  import SlMenuItem from "@shoelace-style/shoelace/dist/components/menu-item/menu-item"
  import SlMenuLabel from "@shoelace-style/shoelace/dist/components/menu-label/menu-label"
  import SlIconButton from "@shoelace-style/shoelace/dist/components/icon-button/icon-button"

  export let params

  const marketQuery = gql`
  {
      market(where: {marketStateByFirststateid: {transaction: {txid: {_eq: "${params.firstTxTxid}"}}}}) {
        creatorPubKey
        creatorFee
        details
        version
        market_state {
          market_oracles {
            committed
            oracle {
              name
              burnedSats
              pubKey
            }
          }
          transaction {
            txid
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
          }
        }
        marketStateByFirststateid {
          transaction {
            txid
            minerTimestamp
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
  let success_alert

  let market

  $: existingEntry =
    $publicKey && market && market.market_state.entries.find(entry => entry.investor.pubKey === $publicKey.toString())
  $: balance = existingEntry || {
    shares: new Array(market ? market.options.length : 0).fill(0),
    liquidity: 0
  }

  async function getMarket() {
    const res = await $gqlClient.request(marketQuery)
    console.log(res.market[0])
    return res.market[0]
  }

  /**
   * Creates and broadcasts market update transaction
   *
   * @param balance New Balance
   */
  async function updateMarket(newBalance: lmsr.balance) {
    const entries = getEntries(market)

    const newTx = await getUpdateTx(newBalance, entries)

    const rawtx = newTx.checkedSerialize()
    console.log(newTx)

    const postRes = await postMarketTx(rawtx, [], $testnet)
    console.log(postRes)

    if (postRes.message === "success") {
      payment_modal.hide()
      success_alert.toast()
      market = await getMarket()
    }
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

  async function getUpdateTx(newBalance, entries) {
    const currentTx = await getTx(market.market_state.transaction.txid, $gqlClient)
    const feeb = $testnet ? 1 : 0.5

    const utxos = await getUtxos($address, $testnet)

    console.log(utxos)

    let updateTx
    if (existingEntry) {
      console.log([currentTx, entries, newBalance, $privateKey, $address, utxos, $privateKey])
      updateTx = pmTx.getUpdateEntryTx(currentTx, entries, newBalance, $privateKey, $address, utxos, $privateKey, feeb)
    } else {
      const newEntry = {
        balance: newBalance,
        publicKey: $publicKey
      }
      updateTx = pmTx.getAddEntryTx(currentTx, entries, newEntry, $address, utxos, $privateKey, feeb)
    }

    return updateTx
  }

  onMount(async () => {
    market = await getMarket()
  })
</script>

<sl-alert type="success" duration="3000" bind:this={success_alert} closable>
  <sl-icon slot="icon" name="exclamation-octagon" />
  <strong>Successfully updated market</strong>
</sl-alert>

{#if market && $seed}
  <PaymentModal
    {market}
    bind:this={payment_modal}
    {balance}
    on:buy={e => buySell(e.detail.option, e.detail.amount)}
    on:sell={e => buySell(e.detail.option, -e.detail.amount)}
  />
{/if}

<div class="market">
  {#if market}
    <Backbutton />

    <h1>
      {market.resolve}
      <a href={`https://${$testnet ? "test." : ""}whatsonchain.com/tx/${params.firstTxTxid}`} class="txid"
        >{params.firstTxTxid.slice(0, 20)}...</a
      >
    </h1>

    <div class="chart">
      <Chart {market} />
    </div>
    <!-- <AnimatedNumber {num} />
    <button on:click={() => (num = num + 1000)}> Increase </button> -->

    {#if !$seed}
      <a href="#/login"><sl-button type="primary">Login to trade</sl-button></a>
    {/if}

    <div class="container">
      <div class="cards">
        <div class="card-wide">
          <MarketDetailsCard {market} />
        </div>

        <OracleCard market_oracles={market.market_state.market_oracles} />

        {#if $seed}
          <MarketMenu
            {balance}
            {market}
            on:update={e => updateMarket(e.detail.balance)}
            on:buy={e => payment_modal.show("buy", e.detail.option)}
            on:sell={e => payment_modal.show("sell", e.detail.option)}
          />
        {/if}
      </div>

      <OutcomeCard
        {market}
        {balance}
        on:buy={e => payment_modal.show("buy", e.detail.option)}
        on:sell={e => payment_modal.show("sell", e.detail.option)}
      />

      <sl-card>
        <div slot="header">Details</div>
        {market.details}</sl-card
      >
    </div>
  {:else}
    loading...
  {/if}
</div>

<style>
  h1 {
    font-size: 2.3rem;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: min(90%, 50rem);
  }
  .market {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    margin: 4rem 0;
    align-items: center;
  }

  .chart {
    width: min(95%, 70rem);
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

  .container {
    gap: 1rem;
  }

  .txid {
    font-size: var(--sl-font-size-x-small);
    color: var(--sl-color-gray-400);
    margin: 0.2rem;
  }
</style>
