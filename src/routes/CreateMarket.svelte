<script lang="ts">
  import * as bp from "bitcoin-predict"
  import { privateKey, publicKey, address } from "../store/wallet"
  // import { getUtxos } from "../utils/utxo"
  import { oracles } from "../oracle"
  import { testnet, feeb } from "../config"
  import { postMarketTx } from "../apis/web"
  import { gql } from "graphql-request"
  import { gqlClient } from "../utils/graphql"
  import { price } from "../store/price"
  import { satBalance, utxos } from "../store/wallet"
  import { push } from "svelte-spa-router"
  import { tick } from "svelte"
  import { getNotificationsContext } from "svelte-notifications"

  import SlInput from "@shoelace-style/shoelace/dist/components/input/input"
  import SlButton from "@shoelace-style/shoelace/dist/components/button/button"
  import SlCard from "@shoelace-style/shoelace/dist/components/card/card"
  import SlTextarea from "@shoelace-style/shoelace/dist/components/textarea/textarea"
  import SlIconButton from "@shoelace-style/shoelace/dist/components/icon-button/icon-button"
  import SlFormatNumber from "@shoelace-style/shoelace/dist/components/format-number/format-number"

  import InlineOracle from "../components/InlineOracle.svelte"
  import Searchbar from "../components/Searchbar.svelte"
  import OraclePicker from "../components/OraclePicker.svelte"

  const { fundTx, buildTx } = bp.transaction
  const { addNotification } = getNotificationsContext()

  let resolve_input
  let detail_input
  let fee_input

  let resolve
  let details
  let selectedOracle
  let options = []
  let creatorFee = 0
  let liquidityFee = 0.2
  let oracleSearch = ""

  let step = 0

  let loading = false
  let error

  async function postMarket() {
    loading = true

    if ($satBalance < tx.outputs[0].satoshis) {
      loading = false
      error = "Not enough funds"
      addNotification({
        type: "danger",
        text: "Failed to broadcast transaction",
        description: error,
        position: "top-right"
      })
      return
    }

    const fundedTx = fundTx(tx, $privateKey, $address, $utxos, feeb)

    console.log(fundedTx)

    const postRes = await postMarketTx(tx, testnet)
    console.log(postRes)

    loading = false
    if (postRes === "success") {
      push(`#/market/${fundedTx.hash}`)
    } else {
      error = postRes.error
      addNotification({
        type: "danger",
        text: "Failed to broadcast transaction",
        description: error,
        position: "top-right"
      })
    }
  }

  $: canComplete0 = resolve || details
  $: canComplete1 =
    options.length >= 2 &&
    !options.some(option => !option.name) &&
    options.length <= bp.contracts.marketContracts[0].options.maxOptionCount
  $: canComplete2 = !!selectedOracle
  $: canComplete3 = creatorFee >= 0
  $: canCreateMarket = canComplete0 && canComplete1 && canComplete2 && canComplete3

  $: market = canCreateMarket
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
            pubKey: BigInt(selectedOracle.pubKey),
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
  $: tx = market ? buildTx(market) : undefined
  $: cost = tx ? (tx.outputs[0].satoshis * $price) / 100000000 : 0

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
  const completeStep2 = () => {
    if (canComplete2) {
      step = 3
    } else {
      console.error("Can't complete step")
    }
  }
  const completeStep3 = () => {
    if (canComplete3) {
      step = 4
    } else {
      console.error("Can't complete step")
    }
  }

  function stepBack() {
    if (step > 0) step -= 1
  }

  function addOption() {
    options = [
      ...options,
      {
        name: "",
        details: ""
      }
    ]
  }
</script>

<main>
  <h1>Create new Market</h1>

  {#if step === 0}
    <div class="content">
      <sl-input
        placeholder="Title"
        type="text"
        label="Market Title"
        bind:this={resolve_input}
        on:input={() => (resolve = resolve_input.value)}
        value={resolve || ""}
      />
      <sl-textarea
        placeholder="Details"
        label="Description"
        bind:this={detail_input}
        on:input={() => (details = detail_input.value)}
        value={details || ""}
      />

      <div class="buttons">
        <sl-button on:click={completeStep0} type="primary" disabled={!canComplete0}>Continue</sl-button>
      </div>
    </div>
  {:else if step === 1}
    <div class="content">
      <h2>Add market options</h2>
    </div>

    <div class="options">
      {#each options as option, index}
        <sl-card>
          <sl-input
            type="text"
            placeholder="Title"
            value={option.name}
            bind:this={option.name_input}
            on:input={() => (option.name = option.name_input.value)}
          />
          <sl-textarea
            placeholder="Option details"
            value={option.details}
            bind:this={option.detail_input}
            on:input={() => (option.details = option.detail_input.value)}
          />
          <div style="display: flex; justify-content: flex-end;">
            <sl-icon-button
              name="trash"
              label="delete"
              on:click={() => {
                options = options.slice(0, index).concat(options.slice(index + 1, options.length))
              }}>Delete</sl-icon-button
            >
          </div>
        </sl-card>
      {/each}
    </div>

    <div class="content">
      <sl-button on:click={addOption} style="width: fit-content;">
        <sl-icon slot="prefix" name="plus" />
        Add option
      </sl-button>
      <div class="buttons">
        <sl-button on:click={stepBack}>Back</sl-button>
        <sl-button on:click={completeStep1} type="primary" disabled={!canComplete1}>Continue</sl-button>
      </div>
    </div>
  {:else if step === 2}
    <div class="content">
      <h2>Choose oracle</h2>

      <OraclePicker
        on:select={async e => {
          selectedOracle = e.detail.oracle
          await tick()
          completeStep2()
        }}
      />

      <div class="buttons">
        <sl-button on:click={stepBack}>Back</sl-button>
      </div>
    </div>
  {:else if step === 3}
    <div class="content">
      <h2>Set a fee for yourself in percent</h2>
      <sl-input
        type="number"
        value={creatorFee}
        min="0"
        bind:this={fee_input}
        on:input={() => (creatorFee = parseFloat(fee_input.value))}
      />
      <h2>Set a fee for liquidity providers</h2>
      <sl-input
        type="number"
        value={liquidityFee}
        min="0"
        bind:this={fee_input}
        on:input={() => (liquidityFee = parseFloat(fee_input.value))}
      />
      <div class="buttons">
        <sl-button on:click={stepBack}>Back</sl-button>
        <sl-button on:click={completeStep3} type="primary" disabled={!canComplete3}>Continue</sl-button>
      </div>
    </div>
  {:else if step === 4}
    <div class="content">
      <div class="price">
        <div>Total cost</div>
        <sl-format-number type="currency" currency="USD" value={cost} locale="en-US" />
      </div>
      <div class="buttons">
        <sl-button on:click={stepBack}>Back</sl-button>
        <sl-button on:click={postMarket} type="primary" {loading}>Create market</sl-button>
      </div>
    </div>
  {/if}
</main>

<style>
  h1 {
    font-size: 2rem;
    text-align: center;
    /* margin-bottom: 2rem; */
  }

  h2 {
    font-size: 1.5rem;
    text-align: center;
  }

  main {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    align-items: center;
    width: min(65rem, 95%);
  }

  .content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: min(30rem, 90%);
    margin: auto;
    align-items: center;
  }

  .content > sl-input,
  .content > sl-textarea {
    width: 100%;
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

  .options sl-card::part(body) {
    display: flex;
    flex-direction: column;
    justify-content: stretch;
    gap: 1rem;
  }

  .price {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .price sl-format-number {
    font-size: 1.5rem;
  }
</style>
