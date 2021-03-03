import { BACKEND_HOST, BACKEND_HOST_TESTNET } from "../config"

export async function postTx(rawtx, entries, testnet = false) {
  const entryPayload = entries.map(entry => {
    return {
      ...entry,
      publicKey: entry.publicKey.toString()
    }
  })

  console.log(entries)
  // return

  const host = testnet ? BACKEND_HOST_TESTNET : BACKEND_HOST
  console.log("posting to ", host)
  const post = await fetch(host + "/tx", {
    method: "post",
    body: JSON.stringify({ rawtx, entries: entryPayload }),
    headers: { "Content-Type": "application/json" }
  })
  return await post.json()
}
