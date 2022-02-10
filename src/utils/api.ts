import { BACKEND_HOST, BACKEND_HOST_TESTNET } from "../config"
import { updateOutputs } from "../store/wallet"
import { post } from "../utils/fetch"

import type { bsv } from "bitcoin-predict"

/**
 * Posts transaction to backend and marks outputs as spent in the store
 */
export async function postTx(tx: bsv.Transaction, testnet = false) {
  const host = testnet ? BACKEND_HOST_TESTNET : BACKEND_HOST

  console.log(`Posting transaction with txid ${tx.hash} to ${host}/tx`)

  const rawtx = tx.serialize({ disableDustOutputs: true })
  const postRes = await post(host + "/tx", { rawtx })

  if (postRes !== "success") {
    console.error(postRes)
    if (postRes.details && postRes.details.broadcasted) {
      updateOutputs(tx)
      throw new Error("Failed to parse transaction")
    } else {
      throw new Error("Failed to broadcast transaction")
    }
  }

  updateOutputs(tx)
}
