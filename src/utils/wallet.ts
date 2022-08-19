import { bsv } from "bitcoin-predict"

export function getUserId(publicKey: bsv.PublicKey): string {
  return bsv.crypto.Hash.sha256ripemd160(publicKey.toBuffer()).toString("hex").slice(0, 8)
}
