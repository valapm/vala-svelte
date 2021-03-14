import { bsv } from "bitcoin-predict"

// Adapted from https://github.com/mafintosh/random-bytes-seed
export function seededBytes(seedPhrase, n) {
  const result = Buffer.allocUnsafe(n)
  let seed = Buffer.from(seedPhrase, "utf8")
  let used = 0

  while (used < result.length) {
    seed = bsv.crypto.Hash.sha256(seed)
    seed.copy(result, used)
    used += seed.length
  }

  return result
}
