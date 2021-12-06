import { BACKEND_HOST, BACKEND_HOST_TESTNET } from "../config"
import { outputs } from "../store/wallet"
import { post } from "../utils/fetch"

import type { bsv } from "bitcoin-predict"

/**
 * Posts transaction to backend and marks outputs as spent in the store
 */
export async function postTx(tx: bsv.Transaction, type: "market" | "oracle", testnet = false) {
  const host = testnet ? BACKEND_HOST_TESTNET : BACKEND_HOST

  const endpoint = type === "market" ? "market" : type === "oracle" ? "oracle" : null
  if (!endpoint) throw new Error("Unknown transaction type")

  console.log(`Posting ${type} transaction with txid ${tx.hash} to ${host}/${endpoint}`)

  const rawtx = tx.checkedSerialize({ disableDustOutputs: true })
  const postRes = await post(`${host}/${endpoint}`, { rawtx })

  if (postRes !== "success") {
    console.error(postRes)
    throw new Error("Failed to broadcast transaction")
  }

  // Mark outputs as spent
  outputs.update(outs => {
    for (const [index, input] of tx.inputs.entries()) {
      const path = tx.hash + "/" + index

      if (outs[path]) outs[path].spent = true
      return outs
    }
  })
}
