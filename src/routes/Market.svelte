<script>
  import { lmsr, bsv, transaction as pmTx } from "bitcoin-predict"
  import { price } from "../store/price"
  import { gql } from "graphql-request"
  import { gqlClient } from "../store/graphql"
  import { onMount } from "svelte"
  import { publicKey, privateKey, seed, address } from "../store/wallet"
  import { getUtxos } from "../utils/utxo"
  import { getTx } from "../apis/txq"
  import { postMarketTx } from "../apis/web"
  // import { mattercloudKey } from "../store/apis"
  import { testnet, txqHost } from "../store/options"
  import AnimatedNumber from "../components/AnimatedNumber.svelte"
  import Chart from "../components/Chart.svelte"

  export let params

  let shares = 0

  /**
   * 1: sharesFor
   * 2: sharesAgainst
   */
  let shareType = 1
  $: sharesFor = shareType === 1 ? shares : 0
  $: sharesAgainst = shareType === 2 ? shares : 0

  const marketQuery = gql`
    {
      market(limit: 1, order_by: {stateCount: desc}, where: {marketByFirststateid: {transaction: {txid: {_eq: "${params.firstTxTxid}"}}}}) {
        decided
        marketByFirststateid {
          transaction {
            txid
          }
        }
        resolve
        sharesFor
        sharesAgainst
        liquidity
        transaction {
          txid
        }
        entries {
          liquidity
          sharesAgainst
          sharesFor
          investor {
            pubKey
          }
        }
      }
    }
  `

  function getTxQuery(txid) {
    return gql`
    {
      transaction(where: { txid: { _eq: "${txid}" } }) {
        hex
      }
    }
  `
  }

  let market

  let sellSharesFor = 0
  let sellSharesAgainst = 0

  async function getMarket() {
    const res = await $gqlClient.request(marketQuery)
    return res.market[0]
  }

  async function getRawTx(txid) {
    const res = await $gqlClient.request(getTxQuery(txid))
    const hex = res.transaction[0].hex
    const tx = new bsv.Transaction()
    tx.fromString(hex)
    return tx
  }

  $: marketBalance = {
    sharesFor: market ? market.sharesFor : 0,
    sharesAgainst: market ? market.sharesAgainst : 0,
    liquidity: market ? market.liquidity : 0
  }

  $: marketSats = lmsr.getLmsrSats(marketBalance)
  $: probability = lmsr.getProbability(marketBalance)

  $: newBalanceSharesFor = { ...marketBalance, sharesFor: marketBalance.sharesFor + sharesFor }
  $: newBalanceSharesAgainst = { ...marketBalance, sharesAgainst: marketBalance.sharesAgainst + sharesAgainst }

  $: priceSharesFor = lmsr.getLmsrSats(newBalanceSharesFor) - lmsr.getLmsrSats(marketBalance) || 0
  $: priceSharesAgainst = lmsr.getLmsrSats(newBalanceSharesAgainst) - lmsr.getLmsrSats(marketBalance) || 0
  $: priceShares = shareType === 1 ? priceSharesFor : priceSharesAgainst

  $: priceForUSD = round((priceShares / 100000000) * $price)

  $: bsvTotal = marketSats / 100000000
  $: usdTotal = bsvTotal * $price

  $: existingEntry = market && market.entries.find(entry => entry.investor.pubKey === $publicKey.toString())

  $: balance = existingEntry || {
    sharesAgainst: 0,
    sharesFor: 0,
    liquidity: 0
  }

  $: potentialAssetsUSD = ((shares * lmsr.SatScaling) / 100000000) * $price || 0
  $: potentialWin = potentialAssetsUSD - priceForUSD
  $: potentialX = potentialWin / priceForUSD

  $: newBalance = {
    liquidity: balance.liquidity,
    sharesFor: balance.sharesFor + sharesFor,
    sharesAgainst: balance.sharesAgainst + sharesAgainst
  }

  function getEntries() {
    return market.entries.map(entry => {
      return {
        publicKey: bsv.PublicKey.fromString(entry.investor.pubKey),
        balance: {
          liquidity: entry.liquidity,
          sharesFor: entry.sharesFor,
          sharesAgainst: entry.sharesAgainst
        }
      }
    })
  }

  function round(n, decimals = 2) {
    const factor = 10 ** decimals
    return Math.round(n * factor) / factor
  }

  async function buyShares() {
    const entries = getEntries()

    let newTx
    if (existingEntry) {
      newTx = await getUpdateTx(newBalance, entries)
    } else {
      addEntry()
    }

    const utxos = await getUtxos($address.toString(), $testnet)

    console.log(utxos)

    const fundedTx = pmTx.fundTx(newTx, $privateKey, $address, utxos)

    console.log(fundedTx.outputs[0].script.toASM().split(" ").reverse()[2])

    // console.log(pmTx.isValidMarketUpdateTx(fundedTx, currentTx, entries))

    const rawtx = fundedTx.checkedSerialize() // FIXME: throws if not enough sats
    console.log(fundedTx)

    const postRes = await postMarketTx(rawtx, entries, $testnet)
    console.log(postRes)
  }

  function toggleShareType() {
    if (shareType === 1) {
      shareType = 2
    } else if (shareType === 2) {
      shareType = 1
    }
  }

  async function getUpdateTx(newBalance, entries) {
    const currentTx = await getRawTx(market.transaction.txid)
    const updateTx = pmTx.getUpdateEntryTx(currentTx, entries, newBalance, $privateKey)
    return updateTx
  }

  async function addEntry() {}

  async function sellShares() {
    const updatedBalance = { ...balance }

    if (sellSharesFor) {
      updatedBalance.sharesFor = updatedBalance.sharesFor - sellSharesFor
    } else if (sellSharesAgainst) {
      updatedBalance.sharesAgainst = updatedBalance.sharesAgainst - sellSharesAgainst
    }

    const entries = getEntries()
    const newTx = await getUpdateTx(updatedBalance, entries)

    console.log(newTx)

    const rawtx = newTx.checkedSerialize()

    const postRes = await postMarketTx(rawtx, entries, $testnet)
    console.log(postRes)
  }

  onMount(async () => {
    market = await getMarket()
  })

  // let num = 0
</script>

{#if market}
  <div class="bg-gray-100 py-60">
    <div class="flex flex-col items-center">
      <p class="text-gray-700 text-xl pb-7">{market.resolve}</p>
      <h1 class="font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-pink-400 to-red-600">
        <span class="text-9xl">
          {round(probability * 100, 1)}
        </span>
        <span class="text-3xl">%</span>
      </h1>
      <div class="text-gray-700 font-light">{Math.round(usdTotal)} $ total</div>
    </div>

    <div class="max-w-screen-md mx-auto pt-6">
      <Chart market={market.marketByFirststateid.transaction.txid} />
    </div>
    <!-- <AnimatedNumber {num} />
    <button on:click={() => (num = num + 1000)}> Increase </button> -->

    <h3 class="font-semibold text-blue-900 w-full">{market.marketByFirststateid.transaction.txid}</h3>
    <div class="">{round(bsvTotal)} BSV ({round(usdTotal)} $)</div>

    <!-- <div class="shadow-xl w-72 p-5 rounded-2xl bg-gray-300"> -->
    <div class="flex w-full justify-around mt-2">
      <div class="flex flex-col items-center space-y-3">
        <div class="flex flex-row h-10 w-32 rounded-lg relative bg-transparent mt-1" id="shareSelector">
          <button
            data-action="decrement"
            class=" bg-gray-300 text-gray-600 hover:text-gray-700 hover:bg-gray-400 h-full w-20 rounded-l cursor-pointer outline-none"
            on:click={() => {
              if (shares >= 1) shares -= 1
            }}
          >
            <span class="m-auto text-2xl font-thin">−</span>
          </button>
          <input
            type="number"
            class="outline-none focus:outline-none text-center w-full bg-gray-300 font-semibold text-md hover:text-black focus:text-black  md:text-basecursor-default flex items-center text-gray-700"
            bind:value={shares}
            style="-moz-appearance: textfield;"
            id="shareInput"
            min="0"
            on:input={() => {
              if (shares < 0) shares = 0
            }}
          />
          <button
            data-action="increment"
            class="bg-gray-300 text-gray-600 hover:text-gray-700 hover:bg-gray-400 h-full w-20 rounded-r cursor-pointer"
            on:click={() => (shares += 1)}
          >
            <span class="m-auto text-2xl font-thin">+</span>
          </button>
        </div>

        <div class="py-4 flex items-center space-x-4">
          <span class="w-5 {shareType === 1 ? 'font-bold' : 'font-thin'}">For</span>
          <div
            class="ml-auto text-right w-16 p-2 rounded-full {shareType === 1
              ? 'bg-blue-300'
              : 'bg-red-300'} flex cursor-pointer align-middle transition-all"
            on:click={toggleShareType}
          >
            <b
              class="bg-white rounded-full shadow-lg w-5 h-5 transition-all {shareType === 1
                ? ''
                : 'transform translate-x-7'}"
            />
          </div>
          <span class="w-5 transition-all {shareType === 2 ? 'font-bold' : 'font-thin'}">Against</span>
        </div>
        <div class="flex font-thin text-xl">
          <AnimatedNumber num={priceForUSD} class="pr-2" /> $
        </div>
        <div class="flex font-bold text-sm text-green-500">
          Potential win:
          <AnimatedNumber num={potentialWin} class="px-2" /> $ ( <AnimatedNumber num={potentialX} />x)
        </div>

        <button
          class="button text-red-600 border-red-600 border-4  font-extrabold text-3xl py-1 px-3 rounded-md"
          on:click={buyShares}>BUY</button
        >
      </div>
      <!-- </div> -->
    </div>
    {#if balance.sharesFor || balance.sharesAgainst}
      <div>
        <h2>Balance</h2>
        {#if balance.sharesFor}
          <p class="text-green-700">{balance.sharesFor} Shares For</p>
          <input type="number" min="0" max={balance.sharesFor} bind:value={sellSharesFor} />
          <button on:click={sellShares}>Sell</button>
        {/if}
        {#if balance.sharesAgainst}
          <p class="text-red-700">{balance.sharesAgainst} Shares Against</p>
          <input type="number" min="0" max={balance.sharesFor} bind:value={sellSharesAgainst} />
          <button on:click={sellShares}>Sell</button>
        {/if}
      </div>
    {/if}
    <div style="white-space: break-spaces;">
      {JSON.stringify(market, null, "\t")}
    </div>
  </div>
{:else}
  loading...
{/if}

<style>
  #shareInput::-webkit-outer-spin-button,
  #shareInput::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  #shareSelector input {
    outline: none !important;
  }

  #shareSelector button {
    outline: none !important;
  }
</style>
