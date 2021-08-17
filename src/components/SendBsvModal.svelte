<script>
  import { bsv } from "bitcoin-predict"
  import { address, privateKey, utxos } from "../store/wallet"
  import { testnet } from "../store/options"
  import { usdBalance } from "../store/wallet"
  import { price } from "../store/price"
  import { broadcast } from "../utils/transaction"

  import SlButton from "@shoelace-style/shoelace/dist/components/button/button.js"
  import SlInput from "@shoelace-style/shoelace/dist/components/input/input.js"
  import SlAlert from "@shoelace-style/shoelace/dist/components/alert/alert.js"
  import SlDialog from "@shoelace-style/shoelace/dist/components/dialog/dialog.js"

  let dialog
  let recipient_input
  let amount_input
  let error_alert
  let success_dialog

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
      error_alert.toast()
    }
    sending = false

    if (success) {
      dialog.hide()
      success_dialog.toast()
    }
  }
</script>

<sl-alert type="danger" duration="3000" bind:this={error_alert} closable>
  <sl-icon slot="icon" name="exclamation-octagon" />
  <strong>Failed to broadcast transaction</strong><br />
  {error}
</sl-alert>

<sl-alert type="success" duration="3000" bind:this={success_dialog} closable>
  <sl-icon slot="icon" name="exclamation-octagon" />
  <strong>Successfully broadcasted transaction</strong><br />
</sl-alert>

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
