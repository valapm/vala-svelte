import { bsv } from "bitcoin-predict"

export async function fetchUTXOs(address, testnet = false) {
  const net = testnet ? "test" : "main"
  const response = await fetch(`https://api.whatsonchain.com/v1/bsv/${net}/address/${address}/unspent`)
  const utxos = await response.json()
  return Promise.all(
    utxos.map(async utxo => {
      const rawTx = await fetchRawTx(utxo.tx_hash, testnet)
      const tx = new bsv.Transaction(rawTx)
      return {
        outputIndex: utxo.tx_pos,
        txId: utxo.tx_hash,
        satoshis: utxo.value,
        script: tx.outputs[utxo.tx_pos].script.toHex()
      }
    })
  )
}

export async function fetchRawTx(txid, testnet = true) {
  const net = testnet ? "test" : "main"
  const response = await fetch(`https://api.whatsonchain.com/v1/bsv/${net}/tx/${txid}/hex`)
  return response.text()
}

export async function fetchTx(txid, testnet = false) {
  const net = testnet ? "test" : "main"
  const response = await fetch(`https://api.whatsonchain.com/v1/bsv/${net}/tx/hash/${txid}`)
  return response.json()
}
