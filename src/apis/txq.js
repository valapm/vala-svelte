import { bsv } from "bitcoin-predict"

export async function getTx(txid, txqHost) {
  const txqRes = await fetch(txqHost + "/tx/" + txid)
  const json = await txqRes.json()
  if (!json.status === 200 || !json.result.rawtx) throw new Error("Failed to fetch rawtx from TXQ")
  const tx = new bsv.Transaction()
  tx.fromString(json.result.rawtx)
  return tx
}
