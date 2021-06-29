import { fetchUTXOs as whatsonchainUtxos } from "../apis/whatsonchain"
import { bsv } from "bitcoin-predict"

export async function getUtxos(address: bsv.Address, testnet = false) {
  const utxos = await whatsonchainUtxos(address.hashBuffer.toString("hex"), testnet)
  return utxos.map(utxo => bsv.Transaction.UnspentOutput(utxo))
}
