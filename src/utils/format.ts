export function round(n: number, decimals = 2): number {
  const factor = 10 ** decimals
  return Math.round(n * factor) / factor
}

export function formatUSD(number, round = false): string {
  const options = { style: "currency", currency: "USD", maximumFractionDigits: round ? 0 : 2 }

  return new Intl.NumberFormat("en-IN", options).format(number)
}
