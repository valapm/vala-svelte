<script lang="ts">
  import { lmsr, transaction as pmTx, bsv } from "bitcoin-predict"
  import { price } from "../store/price"
  import { gql } from "graphql-request"
  import { gqlClient } from "../store/graphql"
  import { onMount } from "svelte"
  import { publicKey, privateKey, address } from "../store/wallet"
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

  import SlCard from "@shoelace-style/shoelace/dist/components/card/card.js"
  import SlFormatNumber from "@shoelace-style/shoelace/dist/components/format-number/format-number"
  import SlFormatDate from "@shoelace-style/shoelace/dist/components/format-date/format-date"

  import MarketDetailsCard from "../components/MarketDetailsCard.svelte"
  export let params

  const marketQuery = gql`
  {
      market(where: {marketStateByFirststateid: {transaction: {txid: {_eq: "${params.firstTxTxid}"}}}}) {
        creatorPubKey
        creatorFee
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

  let market

  $: marketBalance = {
    shares: market ? market.market_state.shares : [],
    liquidity: market ? market.market_state.liquidity : 0
  }
  $: usdLiquidity = (marketBalance.liquidity * lmsr.SatScaling * $price) / 100000000

  $: existingEntry =
    $publicKey && market && market.market_state.entries.find(entry => entry.investor.pubKey === $publicKey.toString())
  $: balance = existingEntry || {
    shares: new Array(market ? market.options.length : 0).fill(0),
    liquidity: 0
  }
  $: redeemSats =
    market && market.market_state.decided
      ? lmsr.lmsr({
          shares: market.market_state.shares,
          liquidity: market.market_state.liquidity
        }) -
        lmsr.lmsr({
          shares: market.market_state.shares.map((share, i) => (i === market.market_state.decision ? share : 0)),
          liquidity: market.market_state.liquidity
        })
      : 0

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
  }

  async function buySell(option: number, shareChange: number) {
    const newBalance = {
      shares: balance.shares.map((shares, i) => (i === option ? shares + shareChange : shares)),
      liquidity: balance.liquidity
    }
    updateMarket(newBalance)
  }

  /**
   * Sells winning shares after market is resolved
   */
  async function sellWinningShares() {
    if (!market.market_state.decided) {
      throw new Error("Market not resolved")
    }
    if (!balance.shares[market.market_state.decision]) {
      throw new Error("User has no winning shares")
    }
    const newBalance = {
      shares: [...balance.shares],
      liquidity: balance.liquidity
    }

    newBalance.shares[market.market_state.decision] = 0

    updateMarket(newBalance)
  }

  /**
   * Lets market creator redeem all loosing shares
   */
  async function redeemInvalidShares() {
    if (!market.market_state.decided) {
      throw new Error("Market not resolved")
    }
    if (market.creatorPubKey !== $publicKey.toString()) {
      throw new Error("User is not market creator")
    }
    if (redeemSats <= 0) {
      throw new Error("Nothing to redeem")
    }
    updateMarket(balance)
  }

  /**
   * Sells all liquidity
   */
  async function extractLiquidity() {
    if (balance.liquidity <= 0) {
      throw new Error("No liquidity to extract")
    }
    const newBalance = {
      shares: [...balance.shares],
      liquidity: 0
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

<div class="market">
  <div class="nav"><a href="#/"><img src="./icons/angle-double-left.svg" alt="back" /></a> {params.firstTxTxid}</div>

  {#if market}
    <h1>
      {market.resolve}
    </h1>

    <div class="chart">
      <div>
        <Chart {market} />
      </div>
    </div>
    <!-- <AnimatedNumber {num} />
    <button on:click={() => (num = num + 1000)}> Increase </button> -->

    <MarketDetailsCard {market} />

    <sl-card>
      <div slot="header">Liquidity</div>
      <sl-format-number type="currency" currency="USD" value={round(usdLiquidity)} locale="en-US" />
      <sl-button slot="footer">Add Liquidity</sl-button>
    </sl-card>

    <OracleCard market_oracles={market.market_state.market_oracles} />

    <OutcomeCard
      {market}
      {balance}
      on:buy={e => payment_modal.show("buy", e.detail.option)}
      on:sell={e => payment_modal.show("sell", e.detail.option)}
    />

    <PaymentModal
      {market}
      bind:this={payment_modal}
      {balance}
      on:buy={e => buySell(e.detail.option, e.detail.amount)}
      on:sell={e => buySell(e.detail.option, -e.detail.amount)}
    />

    {#if market.market_state.decided}
      Market has been resolved ({market.options[market.market_state.decision].name})

      {#if $publicKey && market.creatorPubKey === $publicKey.toString() && redeemSats > 0}
        <button on:click={redeemInvalidShares}>Redeem invalid shares ({redeemSats}) </button>
      {/if}

      {#if balance.shares[market.market_state.decision]}
        <button on:click={sellWinningShares}>Sell winning shares</button>
      {/if}

      {#if balance.liquidity}
        <button on:click={extractLiquidity}>Extract liquidity</button>
      {/if}
    {/if}
  {:else}
    loading...
  {/if}
</div>

<style>
  h1 {
    font-size: 2.5rem;
    text-align: center;
  }
  .market {
    margin-top: 4rem;
  }

  .chart > * {
    width: min(80%, 70rem);
  }

  .chart {
    display: flex;
    justify-content: center;
  }

  .nav {
    display: flex;
    align-items: center;
    font-size: 0.9rem;
    justify-content: center;
  }

  .nav img {
    height: 2rem;
  }
</style>
