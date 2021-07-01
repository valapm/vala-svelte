<script>
  import * as bp from "bitcoin-predict"
  import { privateKey, publicKey, address } from "../store/wallet"
  import { getUtxos } from "../utils/utxo"
  import { oracles } from "../oracle"
  import { testnet } from "../store/options"
  import { postMarketTx } from "../apis/web"
  import { gql } from "graphql-request"
  import { gqlClient } from "../store/graphql"
  import Header from "../components/Header.svelte"

  const { fundTx, buildTx } = bp.transaction

  let resolve
  let details
  let oracle
  let liquidity = 1
  let options = []
  let creatorFee = 0

  $: console.log(options)

  let step = 0

  const oracleQuery = gql`
    {
      oracle(where: { name: { _is_null: false } }) {
        pubKey
        name
        boosts(limit: 1, order_by: { difficulty: desc }) {
          difficulty
          solved
        }
      }
    }
  `

  $: entry = {
    publicKey: $publicKey.toString(),
    balance: {
      shares: Array(options.length).fill(0),
      liquidity
    }
  }

  async function createMarket() {
    if (!canCreateMarket) {
      throw new Error("Missing inputs")
    }

    const creator = {
      pubKey: $publicKey,
      payoutAddress: $address
    }

    const oracles = [
      {
        pubKey: BigInt(oracle),
        votes: 100
      }
    ]

    const market = bp.pm.getNewMarket(
      {
        resolve,
        details,
        options
      },
      entry,
      oracles,
      creator,
      creatorFee,
      100
    )

    console.log(market)

    // const tx = buildTx(market)

    // // console.log(market.miners)
    // // console.log(bp.transaction.getMinerDetails(tx.outputs[0].script))
    // const utxos = await getUtxos($address.toString(), $testnet)

    // const fundedTx = fundTx(tx, $privateKey, $address, utxos)
    // const rawtx = fundedTx.checkedSerialize() // FIXME: throws if not enough sats

    // const postRes = await postMarketTx(rawtx, [entry], $testnet)
    // console.log(postRes)
  }

  let retryRawtx

  async function retry() {
    const postRes = await postMarketTx(retryRawtx, [entry], $testnet)
    console.log(postRes)
  }

  $: canComplete0 = resolve || details
  $: canComplete1 = options.length >= 2 && !options.some(option => !option.name)
  $: canComplete2 = !!oracle
  $: canComplete3 = creatorFee >= 0
  $: canCreateMarket = canComplete0 && canComplete1 && canComplete2 && canComplete3 && liquidity >= 0

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
  // const completeStep1 = () => (canComplete1 ? (step = 1) : console.error("Can't complete step"))
  // const completeStep2 = () => (canComplete2 ? (step = 1) : console.error("Can't complete step"))
  // const completeStep3 = () => (canComplete3 ? (step = 1) : console.error("Can't complete step"))

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

<Header />

<h1>Create new Market</h1>

<div class="content">
  {#if step === 0}
    Resolve: <input type="text" bind:value={resolve} />
    Details: <textarea class="large" bind:value={details} />

    <div class="buttons">
      <button on:click={completeStep0} class="action-button">Continue</button>
    </div>
  {:else if step === 1}
    Options

    {#each options as option}
      <div>
        Option:
        <input type="text" bind:value={option.name} />
        <textarea class="large" bind:value={option.details} />
      </div>
    {/each}

    <button on:click={addOption}>Add option</button>
    <div class="buttons">
      <button on:click={completeStep1} class="action-button">Continue</button>
      <button on:click={stepBack}>Back</button>
    </div>
  {:else if step === 2}
    Choose oracle
    {#await $gqlClient.request(oracleQuery)}
      loading...
    {:then res}
      <select bind:value={oracle}>
        {#each res.oracle as oracle}
          <option value={oracle.pubKey}>{oracle.name}</option>
        {/each}
      </select>
    {/await}

    <div class="buttons">
      <button on:click={completeStep2} class="action-button">Continue</button>
      <button on:click={stepBack}>Back</button>
    </div>
  {:else if step === 3}
    Set a fee for yourself in percent
    <input type="number" bind:value={creatorFee} min="0" />
    <div class="buttons">
      <button on:click={completeStep3} class="action-button">Continue</button>
      <button on:click={stepBack}>Back</button>
    </div>
  {:else if step === 4}
    Inital liquidity: <input type="number" bind:value={liquidity} min="1" />
    <div class="buttons">
      <button on:click={createMarket} class="action-button">Create new market</button>
      <button on:click={stepBack}>Back</button>
    </div>
  {/if}
</div>

<style>
  h1 {
    font-size: 2rem;
    text-align: center;
  }

  input,
  textarea {
    padding: 0.8rem;
    border: 1px solid lightgray;
    border-radius: 5px;
  }

  .content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: min(30rem, 90%);
    margin: auto;
  }

  .buttons {
    display: flex;
    justify-content: space-around;
    gap: 1rem;
  }

  textarea {
    height: 10rem;
  }
</style>
