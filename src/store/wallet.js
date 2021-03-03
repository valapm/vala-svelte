import { writable } from "svelte-persistent-store/dist/local"
import { derived } from "svelte/store"
import { bsv } from "bitcoin-predict"
import Mnemonic from "../utils/mnemonic"
import { testnet } from "./options"

// console.log(Mnemonic)

export let seed = writable("seed", null)

export let hdPrivateKey = derived(
  [seed, testnet],
  ([seed, $testnet]) => {
    return seed ? Mnemonic.fromString(seed).toHDPrivateKey("", $testnet ? "testnet" : "livenet") : null
  },
  null
)

export let privateKey = derived(
  hdPrivateKey,
  hdPrivateKey => {
    return hdPrivateKey ? hdPrivateKey.privateKey : null
  },
  null
)

export let publicKey = derived(
  privateKey,
  privateKey => {
    return privateKey ? privateKey.publicKey : null
  },
  null
)

export let address = derived(
  privateKey,
  privateKey => {
    return privateKey ? privateKey.toAddress() : null
  },
  null
)
