import { bsv } from "bitcoin-predict"
import { post } from "./fetch"

export function fundTx(tx: bsv.Transaction, utxos) {
  utxos.map(utxo =>
    tx.addInput({
      prevTxId: utxo.txId,
      outputIndex: utxo.outputIndex,
      script: bsv.Script.empty()
    })
  )
  return tx
}

export async function broadcast(tx: bsv.Transaction, testnet = false) {
  return await post(`https://api.whatsonchain.com/v1/bsv/${testnet ? "test" : "main"}/tx/raw`, {
    txhex: tx.checkedSerialize({ disableDustOutputs: true })
  })
}
