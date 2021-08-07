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
      market(where: {marketStateByFirststateid: {transaction: {txid: {_eq: "${params.firstTxTxid}"}}}}) {
        creatorPubKey
        market_state {
          market_oracles {
            committed
            oracle {
              name
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
    console.log(res.market[0])
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
    shares: market ? market.market_state.shares : [],
    liquidity: market ? market.market_state.liquidity : 0
  }

  $: marketSats = lmsr.getLmsrSats(marketBalance)

  $: bsvTotal = marketSats / 100000000
  $: usdTotal = bsvTotal * $price

  $: existingEntry =
    market && market.market_state.entries.find(entry => entry.investor.pubKey === $publicKey.toString())
  $: balance = existingEntry || {
    shares: new Array(market ? market.options.length : 0).fill(0),
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
    market.market_state.shares.map((share, index) => {
      const nextPriceShares = [...balance.shares]
      nextPriceShares[index] += 1

      const satPrice =
        lmsr.lmsr({
          shares: nextPriceShares,
          liquidity: balance.liquidity
        }) *
          lmsr.SatScaling -
        lmsr.lmsr(balance) * lmsr.SatScaling

      const usdPrice = round((satPrice / 100000000) * $price)

      return {
        usdPrice,
        probability: lmsr.getProbability(balance, share) * 100,
        potentialX: lmsr.SatScaling / satPrice
      }
    })

  function getEntries() {
    return market.market_state.entries.map(entry => {
      return {
        publicKey: bsv.PublicKey.fromString(entry.investor.pubKey),
        balance: {
          liquidity: entry.liquidity,
          shares: entry.shares
        }
      }
    })
  }

  function round(n, decimals = 2) {
    const factor = 10 ** decimals
    return Math.round(n * factor) / factor
  }

  /**
   * Creates and broadcasts market update transaction
   *
   * @param balance New Balance
   */
  async function updateMarket(balance) {
    const entries = getEntries()

    const newTx = await getUpdateTx(balance, entries)

    const rawtx = newTx.checkedSerialize()
    console.log(newTx)

    const postRes = await postMarketTx(rawtx, [], $testnet)
    console.log(postRes)
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

  async function getUpdateTx(newBalance, entries) {
    const currentTx = await getRawTx(market.market_state.transaction.txid)
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

<Header />

<div class="market">
  <div class="nav"><a href="#/"><img src="./icons/angle-double-left.svg" alt="back" /></a> {params.firstTxTxid}</div>

  {#if market}
    <h1>
      {market.resolve}
    </h1>
    <div>{Math.round(usdTotal)} $ total</div>

    <div class="chart">
      <div>
        <Chart {market} />
      </div>
    </div>
    <!-- <AnimatedNumber {num} />
    <button on:click={() => (num = num + 1000)}> Increase </button> -->

    <div class="totalAssets">{round(bsvTotal)} BSV ({round(usdTotal)} $)</div>
    <div>
      {#if market}
        {#each market.market_state.market_oracles as market_oracle}
          <div>{market_oracle.oracle.name}</div>
          <div>{market_oracle.committed}</div>
        {/each}
      {/if}
    </div>

    {#if market}
      {#if market.market_state.decided}
        Market has been resolved ({market.options[market.market_state.decision].name})

        {#if market.creatorPubKey === $publicKey.toString() && redeemSats > 0}
          <button on:click={redeemInvalidShares}>Redeem invalid shares ({redeemSats}) </button>
        {/if}

        {#if balance.shares[market.market_state.decision]}
          <button on:click={sellWinningShares}>Sell winning shares</button>
        {/if}

        {#if balance.liquidity}
          <button on:click={extractLiquidity}>Extract liquidity</button>
        {/if}
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
              <div class="modal-content">
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
                      if (balance.shares[selectedShare] + selectedShareChange >= 1) selectedShareChange -= 1
                    }}
                  >
                    <span>−</span>
                  </button>
                  <input
                    type="number"
                    bind:value={selectedShareChange}
                    style="-moz-appearance: textfield;"
                    id="shareInput"
                    on:input={() => {
                      if (balance.shares[selectedShare] + selectedShareChange < 0) selectedShareChange = 0
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
                  ${usdPriceTotal}
                  <!-- $<AnimatedNumber num={usdPriceTotal} /> -->
                </div>

                {#if selectedShareChange > 0}
                  Potential win ${round(potentialWin)}
                  {round(potentialX)}x
                {/if}
              </div>
              <div class="modal-buttons">
                <button on:click={() => updateMarket(newBalance)}>BUY</button>
                <button
                  on:click={() => {
                    selectedShare = undefined
                  }}>Cancel</button
                >
              </div>
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

    <!-- <div style="white-space: break-spaces;">
      {JSON.stringify(market, null, "\t")}
    </div> -->
  {:else}
    loading...
  {/if}
</div>

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
    /* border-radius: 10px; */
    border: 1px solid grey;
    width: 20rem;
  }

  .modal-content {
    padding: 1rem;
  }

  .modal-buttons {
    display: flex;
    /* justify-content: space-around; */
    border-top: 1px solid grey;
  }

  .modal-buttons > button {
    padding: 0.5rem 1.5rem;
    flex-grow: 1;
    width: 5rem;
  }

  .modal-buttons > button + button {
    border-left: 1px solid grey;
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
