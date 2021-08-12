import { lmsr } from "bitcoin-predict"

export function getSharePrice(balance: lmsr.balance, option: number, amount: number) {
  const newBalance =
    option === -1
      ? {
          shares: balance.shares,
          liquidity: balance.liquidity + amount
        }
      : {
          shares: balance.shares.map((s, i) => (i === option ? s + amount : s)),
          liquidity: balance.liquidity
        }

  return lmsr.lmsr(newBalance) * lmsr.SatScaling - lmsr.getLmsrSats(balance)
}

export function isInsideLimits(balance: lmsr.balance, option: number, amount: number) {
  const newBalance =
    option === -1
      ? {
          shares: balance.shares,
          liquidity: balance.liquidity + amount
        }
      : {
          shares: balance.shares.map((s, i) => (i === option ? s + amount : s)),
          liquidity: balance.liquidity
        }

  try {
    console.log(lmsr.getLmsrSatsFixed(newBalance))
    return true
  } catch (e) {
    return false
  }
}
