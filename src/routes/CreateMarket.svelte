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
  import { resolve, reset, details, options, creatorFee, liquidityFee } from "../store/createMarket"

  import Button from "../components/Button.svelte"
  import ProgressPoints from "../components/ProgressPoints.svelte"
  import PercentInput from "../components/PercentInput.svelte"
  import Checkbox from "../components/Checkbox.svelte"
  import OptionsEditor from "../components/OptionsEditor.svelte"
  import AutoResizeTextarea from "../components/AutoResizeTextarea.svelte"

  const { fundTx } = bp.transaction

  let loading = false
  let error

  async function postMarket() {
    if ($creatorFee < 0 || $liquidityFee < 0 || $creatorFee + $liquidityFee > 100) {
      notify({
        type: "danger",
        text: "Market fees outside of valid range"
      })
      return
    }

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
      tx = bp.transaction.getMarketCreationTx(market, valaIndexTx, valaIndex.outputIndex, feeb)
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
    reset()

    push(`#/market/${fundedTx.hash}`)
  }

  $: canComplete0 = $resolve && $details
  $: canComplete1 =
    $options.length >= 2 &&
    !$options.some(option => !option.name) &&
    $options.length <= bp.contracts.currentMarketContract.options.maxOptionCount
  $: canComplete2 = $creatorFee !== null && $creatorFee >= 0 && $liquidityFee !== null && $liquidityFee >= 0
  $: canCreateMarket = canComplete0 && canComplete1 && canComplete2 && committed

  $: market = canComplete2
    ? bp.pm.getNewMarket(
        {
          resolve: $resolve,
          details: $details,
          options: $options.map(option => {
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
        $creatorFee,
        $liquidityFee,
        100
      )
    : undefined

  const titles = ["Creat new Market", "Add Market Options", "Set Market Fees", "Create new Market"]

  const completeStep0 = () => {
    if (canComplete0) {
      step = 1
    } else {
      console.log($resolve, $details, canComplete0, $resolve || $details)
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
  const completeStep2 = () => {
    if (canComplete2) {
      step = 3
    } else {
      console.error("Can't complete step")
    }
  }

  function stepBack() {
    if (step > 0) step -= 1
  }

  let step = 0
  let committed = false

  function resetMarket() {
    if (loading) return
    step = 0
    reset()
  }

  onMount(() => {
    completeStep2()
  })
</script>

<main>
  <div class="header">
    <h1>{titles[step]}</h1>
    <ProgressPoints step={step + 1} />
  </div>

  {#if step === 0}
    <div class="content">
      <div class="setting">
        <h2>Title</h2>
        <p>What question does this market answer? E.g. "Who will win the 2024 US election?"</p>
        <input placeholder="Market Question" type="text" bind:value={$resolve} />
      </div>

      <div class="setting">
        <h2>Details</h2>
        <p>
          Let people know more about your market. What exact conditions must be met for it to $resolve? Is there a
          deadline or special circumstances? These can not be changed later.
        </p>
        <div class="input">
          <AutoResizeTextarea bind:value={$details} />
        </div>
      </div>
    </div>
    <Button on:click={completeStep0} type="filled wide" disabled={!canComplete0}>Next</Button>
  {:else if step === 1}
    <div class="content">
      <p>
        Create the possible outcomes of your market for people to bet on and provide some details if necessary. Remember
        to cover all possible scenarios!
      </p>
      <OptionsEditor />
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
        <p>A fee on every trade, sent directly to your wallet</p>
        <PercentInput bind:value={$creatorFee} placeholder="Fee for yourself" min="0" max="100" />
      </div>
      <div class="setting">
        <h2>Liquidity Fee</h2>
        <p>
          A fee on every trade payed out to people providing liquidity to the market. Too high and people wont trade,
          too low and the market will dry up. Generally, the more volume you expect the lower this fee can be.
        </p>
        <a href="https://docs.vala.ai/faq/liquidity/">Learn more about Liquidity</a>
        <PercentInput bind:value={$liquidityFee} placeholder="Fee for liquidity providers" min="0" max="100" />
      </div>

      <div class="buttons">
        <Button on:click={stepBack}>Back</Button>
        <Button on:click={completeStep2} type="filled" disabled={!canComplete2}>Continue</Button>
      </div>
    </div>
  {:else if step === 3}
    <div class="overview content">
      <div class="general">
        <h2>{$resolve}</h2>
        <p style="white-space: pre-wrap;">{$details}</p>
      </div>
      <div class="fees">
        <div>
          <h3>Market Fee</h3>
          <div class="fee">{$creatorFee}%</div>
        </div>
        <div>
          <h3>Liquidity Fee</h3>
          <div class="fee">{$liquidityFee}%</div>
        </div>
      </div>
      <OptionsEditor editable={false} />
      <button class="checkbox" on:click={() => (committed = !committed)}>
        <Checkbox bind:checked={committed} />
        <p>
          I hereby commit to voting on the outcome of this market accurately and as soon as the relevant information is
          accessible.
        </p>
      </button>
    </div>
    <div class="buttons">
      <Button on:click={stepBack}>Back</Button>
      <Button on:click={postMarket} type="filled" {loading} disabled={!canCreateMarket}>Create Market</Button>
    </div>
  {/if}
  <button class="reset" on:click={resetMarket}>Reset</button>
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
    width: min(90%, 33.5rem);
    margin: auto;
    align-items: center;
  }

  .buttons {
    display: flex;
    justify-content: space-around;
    gap: 1rem;
    margin-top: 2rem;
  }

  input,
  .input {
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

  .input {
    padding: 1.25rem;
    resize: none;
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
    font-weight: 500;
  }

  p,
  a {
    /* font-weight: 500; */
    color: #ffffff70;
  }

  a {
    text-decoration: underline;
  }
  .reset {
    font-style: italic;
    text-decoration: underline;
    color: #ffffff70;
  }

  .overview {
    display: flex;
    flex-direction: column;
    gap: 3rem;
  }

  .overview .general {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;
  }
  .overview h2 {
    font-size: 1.5rem;
  }

  .overview p {
    color: #b9b9b9;
  }

  .fees {
    display: flex;
    justify-content: space-evenly;
    width: 100%;
  }

  .fees > div {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    align-items: center;
  }

  .fees h3 {
    color: #b9b9b9;
  }

  .fee {
    font-size: 1.3rem;
  }

  .checkbox {
    /* margin-top: 2rem; */
    border-radius: 0.375rem;
    padding: 0.75rem 1.45rem;
    background-color: #1f2329;
    display: flex;
    align-items: center;
    gap: 1.5rem;
    /* max-width: 20rem; */
  }

  .checkbox p {
    color: #b9b9b9;
    font-size: 0.875rem;
    text-align: left;
  }

  .checkbox :global(input) {
    flex-shrink: 0;
  }
</style>
