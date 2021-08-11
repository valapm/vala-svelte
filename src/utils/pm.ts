import { bsv, pm, lmsr } from "bitcoin-predict"
import { getUtxos } from "./utxo"

/**
 * Parses entries received from GraphQL
 */
export function getEntries(market): pm.entry[] {
  return market.market_state.entries.map(entry => {
    return {
      publicKey: bsv.PublicKey.fromString(entry.investor.pubKey),
      balance: {
        liquidity: entry.liquidity,
        shares: entry.shares
      }
    }
  })
}
