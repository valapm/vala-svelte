<script>
  import { bsv } from "bitcoin-predict"
  import { address, privateKey, utxos, usdBalance } from "../store/wallet"
  import { testnet, feeb } from "../config"
  import { price } from "../store/price"
  import { broadcast, getUtxos } from "../utils/transaction"
  import { notify } from "../store/notifications"

  import SlButton from "@shoelace-style/shoelace/dist/components/button/button.js"
  import SlInput from "@shoelace-style/shoelace/dist/components/input/input.js"
  import SlDialog from "@shoelace-style/shoelace/dist/components/dialog/dialog.js"

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
      bsv.Address.fromString(recipient, testnet ? "testnet" : "livenet")
      return true
    } catch (e) {
      return false
    }
  }

  async function send() {
    sending = true
    const satAmount = Math.ceil((amount / $price) * 100000000)
    const recipientAddress = recipient

    const tx = new bsv.Transaction()

    tx.to(recipientAddress, satAmount)
    tx.feePerKb(feeb * 1000)
    tx.change($address)
    tx.from($utxos)
    tx.sign($privateKey)

    console.log(tx)
    let success = false
    try {
      const res = await broadcast(tx, testnet)
      console.log(res)
      success = true

      for (const input of tx.inputs) {
        $utxos = $utxos.filter(
          utxo => utxo.txId !== input.prevTxId.toString("hex") || utxo.outputIndex !== input.outputIndex
        )
      }

      const newUtxos = getUtxos(tx).filter(
        utxo =>
          utxo.script.toASM() === `OP_DUP OP_HASH160 ${$address.hashBuffer.toString("hex")} OP_EQUALVERIFY OP_CHECKSIG`
      )
      console.log(newUtxos)
      $utxos = $utxos.concat(newUtxos)
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
      dialog.hide()
      notify({
        type: "success",
        text: "Successfully broadcasted transaction",
        description: `<a href='https://${testnet ? "test." : ""}whatsonchain.com/tx/${tx.hash}'>${tx.hash.slice(
          0,
          20
        )}...</a>`
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
      on:input={() => (amount = parseFloat(amount_input.value))}
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
