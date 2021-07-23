<script lang="ts">
  import { lmsr, bsv, transaction as pmTx, pm } from "bitcoin-predict"
  import { price } from "../store/price"
  import { gql } from "graphql-request"
  import { gqlClient } from "../store/graphql"
  import { onMount } from "svelte"
  import { publicKey, privateKey, seed, address, satBalance } from "../store/wallet"
  import { getUtxos } from "../utils/utxo"
  import { getTx } from "../apis/txq"
  import { postMarketTx } from "../apis/web"
  // import { mattercloudKey } from "../store/apis"
  import { testnet } from "../store/options"
  import AnimatedNumber from "../components/AnimatedNumber.svelte"
  import Chart from "../components/Chart.svelte"
  import Header from "../components/Header.svelte"

  export let params

  const marketQuery = gql`
    {
      market(limit: 1, order_by: {stateCount: desc}, where: {marketByFirststateid: {transaction: {txid: {_eq: "${params.firstTxTxid}"}}}}) {
        decided
        decision
        marketByFirststateid {
          transaction {
            txid
          }
        }
        resolve
        shares
        liquidity
        transaction {
          txid
        }
        optionLength
        options {
          name
          details
        }
        entries {
          liquidity
          shares
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
    shares: market ? market.shares : [],
    liquidity: market ? market.liquidity : 0
  }

  $: marketSats = lmsr.getLmsrSats(marketBalance)

  $: bsvTotal = marketSats / 100000000
  $: usdTotal = bsvTotal * $price

  $: existingEntry = market && market.entries.find(entry => entry.investor.pubKey === $publicKey.toString())
  $: balance = existingEntry || {
    shares: new Array(market ? market.optionLength : 0).fill(0),
    liquidity: 0
  }

  let selectedShare // Only one share can be bought/sold at a time
  let selectedShareChange = 0
  $: {
    if (selectedShare === undefined) selectedShareChange = 0
  } // Reset shareChange when selection changes
  let liquidityChange = 0

  let newShares
  $: {
    newShares = [...balance.shares]
    if (selectedShare !== undefined) newShares[selectedShare] += selectedShareChange
  }
  $: newLiquidity = balance.liquidity + liquidityChange
  $: newBalance = {
    shares: newShares,
    liquidity: newLiquidity
  }
  $: shareChange = balance.shares.map((s, i) => s - newShares[i])

  let isValidBalance = true
  $: {
    try {
      lmsr.getLmsrSats(newBalance)
      isValidBalance = true
    } catch (e) {
      isValidBalance = false
    }
  }

  $: satPriceTotal = lmsr.lmsr(newBalance) * lmsr.SatScaling - lmsr.lmsr(balance) * lmsr.SatScaling
  $: usdPriceTotal = round((satPriceTotal / 100000000) * $price)

  $: potentialAssetsUSD = ((selectedShareChange * lmsr.SatScaling) / 100000000) * $price || 0
  $: potentialWin = potentialAssetsUSD - usdPriceTotal
  $: potentialX = potentialAssetsUSD / usdPriceTotal

  $: shares =
    market &&
    market.shares.map((share, index) => {
      const nextPriceShares = [...newShares]
      nextPriceShares[index] += shareChange[index] + 1

      const satPrice =
        lmsr.lmsr({
          shares: nextPriceShares,
          liquidity: newLiquidity
        }) *
          lmsr.SatScaling -
        lmsr.lmsr({
          shares: newShares,
          liquidity: newLiquidity
        }) *
          lmsr.SatScaling

      const usdPrice = round((satPrice / 100000000) * $price)

      return {
        usdPrice,
        probability: lmsr.getProbability(balance, share) * 100,
        potentialX: lmsr.SatScaling / satPrice
      }
    })

  function getEntries() {
    return market.entries.map(entry => {
      return {
        publicKey: bsv.PublicKey.fromString(entry.investor.pubKey),
        balance: {
          liquidity: entry.liquidity,
          sharesFor: entry.shares
        }
      }
    })
  }

  function round(n, decimals = 2) {
    const factor = 10 ** decimals
    return Math.round(n * factor) / factor
  }

  async function updateMarket() {
    const entries = getEntries()

    const newTx = await getUpdateTx(newBalance, entries)

    const utxos = await getUtxos($address.toString(), $testnet)

    console.log(utxos)

    if ($satBalance < newTx.outputs[0].satoshis) {
      throw new Error("Not enough funds")
      return
    }

    const fundedTx = pmTx.fundTx(newTx, $privateKey, $address, utxos)

    console.log(fundedTx.outputs[0].script.toASM().split(" ").reverse()[2])

    // console.log(pmTx.isValidMarketUpdateTx(fundedTx, currentTx, entries))

    const rawtx = fundedTx.checkedSerialize()
    console.log(fundedTx)

    const postRes = await postMarketTx(rawtx, [], $testnet)
    console.log(postRes)
  }

  async function getUpdateTx(newBalance, entries) {
    const currentTx = await getRawTx(market.transaction.txid)

    const utxos = await getUtxos($address.toString(), $testnet)

    let updateTx
    if (existingEntry) {
      updateTx = pmTx.getUpdateEntryTx(currentTx, entries, newBalance, $privateKey, $address, utxos, $privateKey)
    } else {
      const newEntry = {
        balance: newBalance,
        publicKey: $publicKey
      }
      updateTx = pmTx.getAddEntryTx(currentTx, entries, newEntry, $address, utxos, $privateKey)
    }

    return updateTx
  }

  onMount(async () => {
    market = await getMarket()
  })
</script>

<Header />

{#if market}
  <div class="market">
    <h1>
      {market.resolve}
    </h1>
    <div>{Math.round(usdTotal)} $ total</div>

    <div class="chart">
      <Chart {market} />
    </div>
    <!-- <AnimatedNumber {num} />
    <button on:click={() => (num = num + 1000)}> Increase </button> -->

    <h3>{market.marketByFirststateid.transaction.txid}</h3>
    <div class="totalAssets">{round(bsvTotal)} BSV ({round(usdTotal)} $)</div>

    {#if market}
      {#if market.decided}
        Market has been resolved ({market.decision})
      {:else}
        {#if selectedShare !== undefined}
          <div class="modal">
            <div
              class="modal-bg"
              on:click={() => {
                selectedShare = undefined
              }}
            />
            <div class="modal-container">
              <h3>{market.options[selectedShare].name}</h3>
              {market.options[selectedShare].details}
              Balance: {balance.shares[selectedShare]}.

              {#if !isValidBalance}
                Outside smart contract limits. Add more market liquidity or increase limits.
              {/if}
              <div id="shareSelector">
                <button
                  data-action="decrement"
                  on:click={() => {
                    if (selectedShareChange >= 1) selectedShareChange -= 1
                  }}
                >
                  <span>−</span>
                </button>
                <input
                  type="number"
                  bind:value={selectedShareChange}
                  style="-moz-appearance: textfield;"
                  id="shareInput"
                  min="0"
                  on:input={() => {
                    if (selectedShareChange < 0) selectedShareChange = 0
                  }}
                />
                <button
                  data-action="increment"
                  on:click={() => {
                    selectedShareChange += 1
                  }}
                >
                  <span>+</span>
                </button>
              </div>

              <div>
                <AnimatedNumber num={usdPriceTotal} /> $
              </div>

              Potential win ${potentialWin}
              {potentialX}x

              <button on:click={updateMarket}>BUY</button>
              <button
                on:click={() => {
                  selectedShare = undefined
                }}>Cancel</button
              >
            </div>
          </div>
        {/if}

        <div class="options">
          {#each shares as share, index}
            <button
              on:click={() => {
                if (!liquidityChange && selectedShare === undefined) selectedShare = index
              }}
            >
              <h3>{market.options[index].name}</h3>
              <div>${share.usdPrice}</div>
              <div>{share.probability}% - {share.potentialX}x</div>
              <div>Balance: {balance.shares[index]}</div>
            </button>
          {/each}
        </div>
      {/if}
    {/if}
    <!--
    <h3>Add liquidity</h3>
    <input type="number" min="1" />
    <button on:click={updateMarket}>Add</button> -->

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

  .modal {
    position: fixed;
    width: 100vw;
    height: 100vh;
    transition: all 0.3s ease;
    top: 0;
    left: 0;
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
  }

  .modal-bg {
    position: absolute;
    background: rgb(186, 186, 186, 0.6);
    width: 100%;
    height: 100%;
  }

  .modal-container {
    max-width: 95%;
    max-height: 90vh;
    background: #fff;
    position: relative;
    overflow-y: auto;
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  h1 {
    font-size: 2.5rem;
    text-align: center;
  }
  .market {
    margin-top: 4rem;
  }

  .options {
    display: flex;
    justify-content: center;
    gap: 2rem;
  }
  .options > button {
    /* border: 1px solid grey; */
    padding: 0.5rem;
    width: 15rem;
    background-color: #fff;
    border-radius: 5px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    transition: all 0.6s cubic-bezier(0.165, 0.84, 0.44, 1);
  }

  .options > button::after {
    content: "";
    border-radius: 5px;
    position: absolute;
    z-index: -1;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
    opacity: 0;
    transition: all 0.6s cubic-bezier(0.165, 0.84, 0.44, 1);
  }

  .options > button:hover {
    transform: scale(1.25, 1.25);
  }

  .options > button:hover::after {
    opacity: 1;
  }

  .options h3 {
    font-size: 1.5rem;
  }
</style>
