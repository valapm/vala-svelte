import { BACKEND_HOST, BACKEND_HOST_TESTNET } from "../config"
import { post } from "../utils/fetch"
import { bsv } from "bitcoin-predict"

import { gql } from "@apollo/client/core"
import { client } from "../utils/apollo"

export async function getTx(txid: string): Promise<bsv.Transaction> {
  const query = gql`
  {
    transaction(where: { txid: { _eq: "${txid}" } }) {
      hex
    }
  }
`

  const res = await client.query({ query })

  if (res.error) {
    console.error(res)
    throw new Error("Failed to fetch tx")
  }

  if (!res.data.transaction.length) {
    throw new Error("Transaction not found.")
  }

  const hex = res.data.transaction[0].hex
  const tx = new bsv.Transaction()
  tx.fromString(hex)
  return tx
}
