import { fetchUTXOs as whatsonchainUtxos } from "../apis/whatsonchain"
import { fetchUTXOs as mattercloudUtxos } from "../apis/mattercloud"
import { mattercloudKey } from "../store/apis"
import { bsv } from "bitcoin-predict"

export async function getUtxos(address: bsv.Address, testnet = false) {
  const utxos = testnet
    ? await whatsonchainUtxos(address, testnet)
    : await mattercloudUtxos(address, mattercloudKey.get())
  console.log(utxos)
  return utxos.map(utxo => bsv.Transaction.UnspentOutput(utxo))
}
