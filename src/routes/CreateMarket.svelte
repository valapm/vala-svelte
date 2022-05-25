<script lang="ts">
  import * as bp from "bitcoin-predict"
  import { privateKey, publicKey, address } from "../store/wallet"
  // import { getUtxos } from "../utils/utxo"
  import { oracles } from "../oracle"
  import { testnet, feeb } from "../config"
  import { postTx } from "../utils/api"
  import { gql } from "graphql-request"
  import { gqlClient } from "../utils/graphql"
  import { price } from "../store/price"
  import { satBalance, utxos } from "../store/wallet"
  import { push } from "svelte-spa-router"
  import { tick } from "svelte"
  import { rabinPubKey } from "../store/oracle"
  import { notify } from "../store/notifications"
  import { onMount } from "svelte"

  import Button from "../components/Button.svelte"
  import ProgressPoints from "../components/ProgressPoints.svelte"
  import Slider from "../components/Slider.svelte"
  import PercentInput from "../components/PercentInput.svelte"

  const { fundTx, buildTx } = bp.transaction

  let resolve
  let details
  let options = []
  let creatorFee
  let liquidityFee

  let step = 0

  let loading = false
  let error

  async function postMarket() {
    loading = true

    const valaIndexRes = await gqlClient.request(gql`
      query {
        state(where: { isValaIndex: { _eq: true } }, order_by: { stateCount: desc }, limit: 1) {
          transaction {
            hex
          }
        }
      }
    `)

    const valaIndex = valaIndexRes.state[0]

    const valaIndexTx = new bp.bsv.Transaction()
    valaIndexTx.fromString(valaIndex.transaction.hex)

    let tx
    try {
      tx = bp.transaction.getNewMarketTx(market, valaIndexTx, valaIndex.outputIndex, feeb)
    } catch (e) {
      console.error(e)
      notify({
        type: "danger",
        text: "Failed to create transaction"
      })
      loading = false
    }

    if ($satBalance < tx.outputs[0].satoshis) {
      loading = false
      error = "Not enough funds"
      notify({
        type: "danger",
        text: "Failed to broadcast transaction",
        description: error
      })
      return
    }

    const fundedTx = fundTx(tx, $privateKey, $address, $utxos, feeb)

    console.log(fundedTx)

    try {
      await postTx(tx, testnet)
      await tick()
    } catch (e) {
      console.error(e)
      notify({
        type: "danger",
        text: "Failed to broadcast transaction",
        description: e
      })
      loading = false
      return
    }

    loading = false

    push(`#/market/${fundedTx.hash}`)
  }

  $: canComplete0 = resolve && details
  $: canComplete1 =
    options.length >= 2 &&
    !options.some(option => !option.name) &&
    options.length <= bp.contracts.currentMarketContract.options.maxOptionCount
  $: canComplete2 = creatorFee >= 0 && liquidityFee >= 0
  $: canCreateMarket = canComplete0 && canComplete1 && canComplete2

  const contract = bp.contracts.currentMarketContract

  $: market = canComplete2
    ? bp.pm.getNewMarket(
        {
          resolve,
          details,
          options: options.map(option => {
            return {
              name: option.name,
              details: option.details
            }
          })
        },
        [
          {
            pubKey: $rabinPubKey,
            votes: 100
          }
        ],
        {
          pubKey: $publicKey,
          payoutAddress: $address
        },
        creatorFee,
        liquidityFee,
        100
      )
    : undefined

  $: console.log(market)

  const titles = ["Creat new Market", "Add Market Options", "Set Market Fees"]

  const completeStep0 = () => {
    if (canComplete0) {
      step = 1
    } else {
      console.log(resolve, details, canComplete0, resolve || details)
      console.error("Can't complete step")
    }
  }
  const completeStep1 = () => {
    if (canComplete1) {
      step = 2
    } else {
      console.error("Can't complete step")
    }
  }

  function stepBack() {
    if (step > 0) step -= 1
  }

  let numOptions = 2
  $: {
    if (options.length > numOptions) {
      options = options.slice(0, numOptions)
    } else if (options.length < numOptions) {
      const diff = numOptions - options.length
      for (let i = 0; i < diff; i++) {
        options.push({
          name: "",
          details: ""
        })
      }
      options = options
    }
  }
</script>

<main>
  <div class="header">
    <h1>{titles[step]}</h1>
    <ProgressPoints step={step + 1} />
  </div>

  {#if step === 0}
    <div class="content">
      <input placeholder="Market Title" type="text" bind:value={resolve} />
      <textarea placeholder="Details" label="Description" bind:value={details} />

      <Button on:click={completeStep0} type="filled full-width" disabled={!canComplete0}>Next</Button>
    </div>
  {:else if step === 1}
    <div class="content">
      <div class="slider">
        <div>
          <span>Number of Options</span>
          <span class="count" style="font-weight: 700;">{numOptions}</span>
        </div>
        <Slider bind:value={numOptions} min="2" max="6" />
      </div>
    </div>

    <div class="options">
      {#each options as option, index}
        <div class="option-card">
          <input type="text" bind:value={option.name} placeholder="Title" />
          <textarea name="details" rows="4" bind:value={option.details} placeholder="Details" />
        </div>
      {/each}
    </div>

    <div class="content">
      <div class="buttons">
        <Button on:click={stepBack}>Back</Button>
        <Button on:click={completeStep1} type="filled" disabled={!canComplete1}>Continue</Button>
      </div>
    </div>
  {:else if step === 2}
    <div class="content">
      <div class="setting">
        <h2>Market Fee</h2>
        <PercentInput bind:value={creatorFee} placeholder="Fee for yourself" min="0" />
      </div>
      <div class="setting">
        <h2>Liquidity Fee</h2>
        <PercentInput bind:value={liquidityFee} placeholder="Fee for liquidity providers" min="0" />
      </div>

      <div class="buttons">
        <Button on:click={stepBack}>Back</Button>
        <Button on:click={postMarket} type="filled" {loading} disabled={!canCreateMarket}>Create Market</Button>
      </div>
    </div>
  {/if}
</main>

<style>
  .header {
    display: flex;
    gap: 1rem;
    align-items: center;
    flex-direction: column;
  }

  h1 {
    font-size: 2rem;
    text-align: center;
    /* margin-bottom: 2rem; */
  }

  main {
    display: flex;
    flex-direction: column;
    gap: 3rem;
    align-items: center;
    width: min(65rem, 95%);
    margin-top: 3rem;
  }

  .content {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    width: min(90%, 18rem);
    margin: auto;
    align-items: center;
  }

  .buttons {
    display: flex;
    justify-content: space-around;
    gap: 1rem;
    margin-top: 2rem;
  }

  .options {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    justify-content: center;
    width: min(60rem, 90%);
  }

  .option-card {
    display: flex;
    flex-direction: column;
    justify-content: stretch;
    gap: 0.75rem;
    padding: 1rem;
    background-color: #1f2329;
    border-radius: 0.5625rem;
    width: min(14rem, 95%);
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

  .slider {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    width: 100%;
    gap: 0.4rem;
  }

  .slider div {
    opacity: 50%;
    font-weight: 500;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .setting {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;
  }

  .setting h2 {
    opacity: 50%;
    display: flex;
    align-items: center;
    height: 1rem;
    gap: 0.5rem;
  }
</style>
