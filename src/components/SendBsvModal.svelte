<script>
  import { bsv } from "bitcoin-predict"
  import { address, privateKey, utxos, usdBalance, satBalance } from "../store/wallet"
  import { testnet, feeb } from "../config"
  import { price } from "../store/price"
  import { broadcast, getUtxos } from "../utils/transaction"
  import { postTx } from "../utils/api"
  import { notify } from "../store/notifications"
  import { updateOutputs } from "../store/wallet"

  import Modal from "./Modal.svelte"
  import Button from "./Button.svelte"
  import NumberInput from "./NumberInput.svelte"

  export let open = false

  let recipient
  let amount
  let sending = false
  let error
  let sendAll = false

  $: validRecipient = recipient && isValidRecipient()
  $: validAmount = amount && (sendAll || amount <= $usdBalance)
  $: console.log({ validAmount, validRecipient })

  function isValidRecipient() {
    try {
      bsv.Address.fromString(recipient, testnet ? "testnet" : "livenet")
      return true
    } catch (e) {
      return false
    }
  }

  async function send() {
    sending = true

    let satAmount = sendAll ? $satBalance : Math.ceil((amount / $price) * 100000000)
    if (satAmount > satBalance) satAmount = satBalance

    const recipientAddress = recipient

    const tx = new bsv.Transaction()

    tx.from($utxos)
    tx.to(recipientAddress, satAmount)
    tx.feePerKb(feeb * 1000)
    tx.change($address)
    tx.sign($privateKey)

    console.log(tx)
    let success = false
    try {
      const res = await postTx(tx, testnet)
      console.log(res)
      success = true

      updateOutputs(tx)
    } catch (e) {
      console.error(e)
      error = e.message
      notify({
        type: "danger",
        text: "Failed to broadcast transaction",
        description: error
      })
    }
    sending = false

    if (success) {
      notify({
        type: "success",
        text: "Successfully broadcasted transaction",
        description: `<a href='https://${testnet ? "test." : ""}whatsonchain.com/tx/${tx.hash}'>${tx.hash.slice(
          0,
          20
        )}...</a>`
      })
      recipient = undefined
      amount = undefined
      open = false
    }
  }
</script>

<Modal bind:open>
  <div class="modal">
    <h1>Send BSV</h1>
    <NumberInput
      placeholder="USD Amount"
      max={Math.round($usdBalance * 100) / 100}
      bind:value={amount}
      color="01a781"
      backgroundColor="323841"
      bind:isMax={sendAll}
      prefix="$"
    />
    <input placeholder="Recipient Address" name="recipient" type="text" bind:value={recipient} />
    <div class="buttons">
      <Button type="filled-grey full-width" on:click={() => (open = false)}>Cancel</Button>
      <Button
        type="filled-green full-width"
        on:click={send}
        disabled={!validAmount || !validRecipient}
        loading={sending}>Send</Button
      >
    </div>
  </div>
</Modal>

<style>
  .modal {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    align-items: center;
    padding: 3.125rem;
    color: white;
  }

  h1 {
    font-size: 2.125rem;
    font-weight: 700;
  }

  .buttons {
    display: flex;
    gap: 1rem;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }
  input {
    background-color: #323841;
    border-radius: 0.375rem;
    font-size: 1rem;
    font-weight: 500;
    width: 100%;
    height: 2.8125rem;
    padding: 0 1.25rem;
  }
</style>
