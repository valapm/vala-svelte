<script>
  import { bsv } from "bitcoin-predict"
  import { address, privateKey, utxos } from "../store/wallet"
  import { testnet } from "../store/options"
  import { usdBalance } from "../store/wallet"
  import { price } from "../store/price"
  import { broadcast } from "../utils/transaction"
  import { getNotificationsContext } from "svelte-notifications"

  import SlButton from "@shoelace-style/shoelace/dist/components/button/button.js"
  import SlInput from "@shoelace-style/shoelace/dist/components/input/input.js"
  import SlDialog from "@shoelace-style/shoelace/dist/components/dialog/dialog.js"

  const { addNotification } = getNotificationsContext()

  let dialog
  let recipient_input
  let amount_input

  export function show() {
    dialog.show()
  }

  let recipient
  let amount
  let sending = false
  let error

  $: validRecipient = recipient && isValidRecipient()
  $: validAmount = amount && amount <= $usdBalance
  $: console.log(validAmount, validRecipient)
  function isValidRecipient() {
    try {
      bsv.Address.fromString(recipient, $testnet ? "testnet" : "livenet")
      return true
    } catch (e) {
      return false
    }
  }

  async function send() {
    sending = true
    const satAmount = Math.ceil((amount / $price) * 100000000)
    const recipientAddress = recipient

    let utxoSats = 0
    const requiredUTXOs = $utxos.filter(utxo => {
      if (utxoSats >= satAmount) return false
      utxoSats += utxo.satoshis
      return true
    })

    const tx = new bsv.Transaction()

    tx.to(recipientAddress, satAmount)
    tx.from(requiredUTXOs)
    tx.change($address)
    tx.sign($privateKey)

    console.log(tx)
    let success = false
    try {
      const res = await broadcast(tx, $testnet)
      console.log(res)
      success = true
    } catch (e) {
      console.error(e)
      error = e.message
      addNotification({
        type: "danger",
        text: "Failed to broadcast transaction",
        description: error,
        position: "top-right"
      })
    }
    sending = false

    if (success) {
      dialog.hide()
      addNotification({
        type: "success",
        text: "Successfully broadcasted transaction",
        description: `<a href='https://${$testnet ? "test." : ""}whatsonchain.com/tx/${tx.hash}'>${tx.hash.slice(
          0,
          20
        )}...</a>`,
        position: "top-right"
      })
    }
  }
</script>

<sl-dialog bind:this={dialog} label="Send BSV">
  <form>
    <sl-input
      placeholder="USD"
      type="number"
      name="amount"
      label="USD Amount"
      bind:this={amount_input}
      on:input={() => (amount = parseInt(amount_input.value))}
      value={amount !== undefined ? amount : ""}
    />
    <sl-input
      placeholder="Address"
      name="recipient"
      type="text"
      label="Recipient Address"
      bind:this={recipient_input}
      value={recipient !== undefined ? recipient : ""}
      on:input={() => (recipient = recipient_input.value)}
    />
  </form>
  <sl-button slot="footer" type="primary" on:click={send} disabled={!validAmount || !validRecipient} loading={sending}
    >Send</sl-button
  >
</sl-dialog>
