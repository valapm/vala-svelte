import { bsv, pm, lmsr } from "bitcoin-predict"
import { getUtxos } from "./utxo"

/**
 * Parses entries received from GraphQL
 */
export function getEntries(market): pm.entry[] {
  return market.market_state.entries.map((entry): pm.entry => {
    return {
      publicKey: bsv.PublicKey.fromString(entry.investor.pubKey),
      balance: {
        liquidity: entry.liquidity,
        shares: entry.shares
      },
      globalLiqidityFeePoolSave: entry.prevLiquidityPoolState,
      liquidityPoints: entry.liquidityPoints
    }
  })
}

export function isCompatibleVersion(version: string) {
  try {
    pm.getMarketVersion(version)
    return true
  } catch (e) {
    return false
  }
}

export function getCreationDate(market): Date {
  return new Date(
    (market.marketStateByFirststateid.state.transaction.broadcastedAt ||
      market.marketStateByFirststateid.state.transaction.processedAt ||
      market.marketStateByFirststateid.state.transaction.minerTimestamp) + "Z"
  )
}
