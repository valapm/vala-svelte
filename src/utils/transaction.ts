import { bsv } from "bitcoin-predict"

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
