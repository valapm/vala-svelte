export function round(n: number, decimals = 2): number {
  const factor = 10 ** decimals
  return Math.round(n * factor) / factor
}
