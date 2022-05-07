<script>
  import Button from "../components/Button.svelte"
  import { utxos, privateKey, address, updateOutputs } from "../store/wallet"
  import { bsv, transaction } from "bitcoin-predict"
  import { testnet, feeb } from "../config"
  import { broadcast } from "../utils/transaction"
  import indexContract from "bitcoin-predict/scripts/935ec6b78a842b25fb12b353f8a204c7.json"
  import { notify } from "../store/notifications"
  import { gql } from "graphql-request"
  import { gqlClient } from "../utils/graphql"
  import { postTx } from "../utils/api"

  let loading = false

  async function createNewIndex() {
    loading = true

    const script = bsv.Script.fromASM(indexContract.asm)
    const dust = transaction.getDust(script.toHex().length / 2)
    const output = new bsv.Transaction.Output({
      script,
      satoshis: dust
    })

    const tx = new bsv.Transaction()
    tx.addOutput(output)
    tx.feePerKb(feeb * 1000)
    tx.change($address)
    tx.from($utxos)
    tx.sign($privateKey)

    console.log(tx)

    try {
      const res = await broadcast(tx, testnet)
      console.log(res)
      updateOutputs(tx)
    } catch (e) {
      console.error(e)
      loading = false
      error = e.message
      notify({
        type: "danger",
        text: "Failed to broadcast transaction",
        description: error
      })
      return
    }

    loading = false

    notify({
      type: "success",
      text: "Successfully broadcasted transaction",
      description: `<a href='https://${testnet ? "test." : ""}whatsonchain.com/tx/${tx.hash}'>${tx.hash.slice(
        0,
        20
      )}...</a>`
    })
  }

  async function testIndexUpdate() {
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

    const valaIndexTx = new bsv.Transaction()
    valaIndexTx.fromString(valaIndex.transaction.hex)

    const tx = new bsv.Transaction()
    transaction.addValaIndex(tx, valaIndexTx)
    transaction.fundTx(tx, $privateKey, $address, $utxos)

    console.log(tx)

    try {
      await postTx(tx, testnet)
    } catch (e) {
      console.error(e)
      loading = false
      error = e.message
      notify({
        type: "danger",
        text: "Failed to broadcast transaction",
        description: error
      })
      return
    }

    loading = false

    notify({
      type: "success",
      text: "Successfully broadcasted transaction",
      description: `<a href='https://${testnet ? "test." : ""}whatsonchain.com/tx/${tx.hash}'>${tx.hash.slice(
        0,
        20
      )}...</a>`
    })

    loading = false
  }
</script>

<div>
  <Button {loading} on:click={createNewIndex}>Create new Index</Button>
  <Button {loading} on:click={testIndexUpdate}>Test Index update</Button>
</div>

<style>
  div {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    margin-top: 4rem;
  }
</style>
