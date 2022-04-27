import { BACKEND_HOST, BACKEND_HOST_TESTNET } from "../config"
import { post } from "../utils/fetch"
import { bsv } from "bitcoin-predict"

import { gql, useLazyQuery } from "@apollo/client"

export async function getTx(txid: string, client): Promise<bsv.Transaction> {
  const query = gql`
  {
    transaction(where: { txid: { _eq: "${txid}" } }) {
      hex
    }
  }
`
  const [getQuery, { loading, error, data }] = useLazyQuery(query)

  await getQuery()

  if (error) {
    console.error(error)
    throw new Error("Failed to fetch tx")
  }

  if (!data.transaction.length) {
    throw new Error("Transaction not found.")
  }

  const hex = data.transaction[0].hex
  const tx = new bsv.Transaction()
  tx.fromString(hex)
  return tx
}
