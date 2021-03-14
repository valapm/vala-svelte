import { BACKEND_HOST, BACKEND_HOST_TESTNET } from "../config"
import { post } from "../utils/fetch"

export async function postMarketTx(rawtx, entries, testnet = false) {
  const entryPayload = entries.map(entry => {
    return {
      ...entry,
      publicKey: entry.publicKey.toString()
    }
  })

  const host = testnet ? BACKEND_HOST_TESTNET : BACKEND_HOST
  console.log("posting to ", host)

  return await post(host + "/market", { rawtx, entries: entryPayload })

  // const post = await fetch(host + "/market", {
  //   method: "post",
  //   body: JSON.stringify({ rawtx, entries: entryPayload }),
  //   headers: { "Content-Type": "application/json" }
  // })
  // return await post.json()
}

export async function postBoostJobTx(rawtx, content, testnet = false) {
  const host = testnet ? BACKEND_HOST_TESTNET : BACKEND_HOST

  return await post(host + "/boost", { rawtx, content })

  // const post = await fetch(host + "/boost", {
  //   method: "post",
  //   body: JSON.stringify({ rawtx, content }),
  //   headers: { "Content-Type": "application/json" }
  // })
  // return await post.json()
}

export async function postBoostProofTx(rawtx, testnet = false) {
  const host = testnet ? BACKEND_HOST_TESTNET : BACKEND_HOST

  const post = await fetch(host + "/boost/proof", {
    method: "post",
    body: JSON.stringify({ rawtx }),
    headers: { "Content-Type": "application/json" }
  })
  return await post.json()
}

export async function postOracleDetails(details, pubKey, signature, testnet = false) {
  const host = testnet ? BACKEND_HOST_TESTNET : BACKEND_HOST

  const post = await fetch(host + "/oracle", {
    method: "post",
    body: JSON.stringify({
      details,
      pubKey: pubKey.toString(),
      signature: {
        ...signature,
        signature: signature.signature.toString()
      }
    }),
    headers: { "Content-Type": "application/json" }
  })
  return await post.json()
}
