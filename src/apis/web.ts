import { BACKEND_HOST, BACKEND_HOST_TESTNET } from "../config"
import { post } from "../utils/fetch"
import { bsv } from "bitcoin-predict"
import { gql } from "graphql-request"

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
