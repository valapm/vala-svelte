import { lmsr } from "bitcoin-predict"

export function getSharePrice(balance: lmsr.balance, option: number, shares: number) {
  return (
    lmsr.lmsr({
      shares: balance.shares.map((s, i) => (i === option ? s + shares : s)),
      liquidity: balance.liquidity
    }) *
      lmsr.SatScaling -
    lmsr.getLmsrSats(balance)
  )
}
