import { writable } from "svelte-persistent-store/dist/local"
import { derived } from "svelte/store"
import { bsv } from "bitcoin-predict"
import Mnemonic from "../utils/mnemonic"
import { testnet } from "./options"
import { getUtxos } from "../utils/utxo"

// console.log(Mnemonic)

const derivationPath = "m/44'/0'/0'/0/0"

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
    return hdPrivateKey ? hdPrivateKey.deriveChild(derivationPath).privateKey : null
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

export let utxos = derived(
  [address, testnet],
  async ([$address, $testnet], set) => {
    set(await getUtxos($address, $testnet))
  },
  []
)

export let satBalance = derived(
  utxos,
  $utxos => {
    return $utxos.reduce((sats, output) => output.satoshis + sats, 0)
  },
  0
)
