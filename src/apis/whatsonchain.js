import { bsv } from "bitcoin-predict"

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

export async function fetchUTXOs(addressHashBuffer, testnet = false) {
  // console.log("start")
  const net = testnet ? "test" : "main"
  const script = bsv.Script.fromASM(`OP_DUP OP_HASH160 ${addressHashBuffer} OP_EQUALVERIFY OP_CHECKSIG`)
  const scriptHash = bsv.crypto.Hash.sha256(script.toBuffer()).toString("hex").match(/.{2}/g).reverse().join("")
  const response = await fetch(`https://api.whatsonchain.com/v1/bsv/${net}/script/${scriptHash}/unspent`)

  const json = await response.json()

  if (!response.status === 200) {
    console.error(json)
    throw new Error("Failed to fetch UTXOs")
  }

  // console.log(json)

  if (!json) return []

  return json.map(utxo => {
    return {
      outputIndex: utxo.tx_pos,
      txId: utxo.tx_hash,
      satoshis: utxo.value,
      script: script.toHex()
    }
  })
}
