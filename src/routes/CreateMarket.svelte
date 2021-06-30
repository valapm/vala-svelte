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

  let canComplete0 = resolve || details
  let canComplete1 = options.length >= 2 && !options.some(option => !option.name)
  let canComplete2 = !!oracle
  let canComplete3 = creatorFee >= 0
  let canCreateMarket = canComplete0 && canComplete1 && canComplete2 && canComplete3 && liquidity >= 0

  const completeStep0 = () => (canComplete0 ? (step = 1) : console.error("Can't complete step"))
  const completeStep1 = () => (canComplete1 ? (step = 1) : console.error("Can't complete step"))
  const completeStep2 = () => (canComplete2 ? (step = 1) : console.error("Can't complete step"))
  const completeStep3 = () => (canComplete3 ? (step = 1) : console.error("Can't complete step"))

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

{#if step === 0}
  Resolve: <input type="text" bind:value={resolve} />
  Details: <input type="text" bind:value={details} />
  <button on:click={completeStep0}>Continue</button>
{:else if step === 1}
  Options

  {#each options as option}
    <div>
      Option:
      <input type="text" bind:value={option.name} />
      <input type="text" bind:value={option.details} />
    </div>
  {/each}

  <button on:click={addOption}>Add option</button>

  <button on:click={completeStep1}>Continue</button>
  <button on:click={stepBack}>Back</button>
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

  <button on:click={completeStep2}>Continue</button>
  <button on:click={stepBack}>Back</button>
{:else if step === 3}
  Set a fee for yourself in percent
  <input type="number" bind:value={creatorFee} min="0" />
  <button on:click={completeStep3}>Continue</button>
  <button on:click={stepBack}>Back</button>
{:else if step === 4}
  Inital liquidity: <input type="number" bind:value={liquidity} min="1" />

  <button on:click={createMarket}>Create new market</button>
  <button on:click={stepBack}>Back</button>
{/if}
