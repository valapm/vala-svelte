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

export function isInsideLimits(balance: lmsr.balance, option: number, shares: number) {
  const newBalance = {
    shares: balance.shares.map((s, i) => (i === option ? s + shares : s)),
    liquidity: balance.liquidity
  }

  try {
    lmsr.getLmsrSatsFixed(newBalance)
    return true
  } catch (e) {
    return false
  }
}
