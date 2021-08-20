import { BACKEND_HOST, BACKEND_HOST_TESTNET } from "../config"
import { post } from "../utils/fetch"
import { bsv } from "bitcoin-predict"
import { gql } from "graphql-request"

export async function postMarketTx(tx: bsv.Transaction, entries = [], testnet = false) {
  const entryPayload = entries.map(entry => {
    return {
      ...entry,
      publicKey: entry.publicKey.toString()
    }
  })

  const rawtx = tx.checkedSerialize({ disableDustOutputs: true })
  const host = testnet ? BACKEND_HOST_TESTNET : BACKEND_HOST
  console.log("posting to ", host)

  const payLoad = entries.length ? { rawtx, entries: entryPayload } : { rawtx }

  return await post(host + "/market", payLoad)

  // const post = await fetch(host + "/market", {
  //   method: "post",
  //   body: JSON.stringify({ rawtx, entries: entryPayload }),
  //   headers: { "Content-Type": "application/json" }
  // })
  // return await post.json()
}

export async function postBoostJobTx(tx: bsv.Transaction, content, testnet = false) {
  const rawtx = tx.checkedSerialize({ disableDustOutputs: true })
  const host = testnet ? BACKEND_HOST_TESTNET : BACKEND_HOST

  return await post(host + "/boost", { rawtx, content })

  // const post = await fetch(host + "/boost", {
  //   method: "post",
  //   body: JSON.stringify({ rawtx, content }),
  //   headers: { "Content-Type": "application/json" }
  // })
  // return await post.json()
}

export async function postBurnTx(tx: bsv.Transaction, testnet = false) {
  const rawtx = tx.checkedSerialize({ disableDustOutputs: true })
  const host = testnet ? BACKEND_HOST_TESTNET : BACKEND_HOST

  return await post(host + "/burnSats", { rawtx })
}

export async function postBoostProofTx(tx: bsv.Transaction, testnet = false) {
  const rawtx = tx.checkedSerialize({ disableDustOutputs: true })
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

export async function getTx(txid: string, gqlClient): bsv.Transaction {
  const query = gql`
  {
    transaction(where: { txid: { _eq: "${txid}" } }) {
      hex
    }
  }
`
  const res = await gqlClient.request(query)

  if (!res.transaction.length) {
    throw new Error("Transaction not found.")
  }

  const hex = res.transaction[0].hex
  const tx = new bsv.Transaction()
  tx.fromString(hex)
  return tx
}
