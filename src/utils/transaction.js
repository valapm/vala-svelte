export function fundTx(tx, utxos) {
  utxos.map(utxo =>
    tx.addInput({
      prevTxId: utxo.txId,
      outputIndex: utxo.outputIndex,
      script: Script.empty()
    })
  )
  return tx
}
