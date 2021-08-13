import { derived } from "svelte/store"
import { hdPrivateKey } from "./wallet"
import { rabin as rab } from "bitcoin-predict"
import { seededBytes } from "../utils/buffer"

const rabin = new rab.RabinSignature()

export const rabinPrivKey = derived(hdPrivateKey, $hdPrivateKey =>
  $hdPrivateKey ? rabin.generatePrivKeyFromSeed(seededBytes($hdPrivateKey.toString(), 2048)) : undefined
)

// export const rabinPrivKey = derived(hdPrivateKey, $hdPrivateKey => {
//   console.log("privKey:", $hdPrivateKey)
//   return $hdPrivateKey ? getRabinPrivKey($hdPrivateKey.toString()) : undefined
// })

export const rabinPubKey = derived(rabinPrivKey, $rabinPrivKey =>
  rabin.privKeyToPubKey($rabinPrivKey.p, $rabinPrivKey.q)
)
