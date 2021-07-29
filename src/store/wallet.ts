import { writable, derived as persistentDerived } from "svelte-persistent-store/dist/local"
import { derived, Readable } from "svelte/store"
import { bsv } from "bitcoin-predict"
import Mnemonic from "../utils/mnemonic"
import { testnet } from "./options"
import { getUtxos } from "../utils/utxo"
import { price } from "./price"

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

export let utxos: Readable<any[]> = derived([address, testnet], async ([$address, $testnet], set) => {
  async function fetchUtxos() {
    if ($address) {
      const utxos = await getUtxos($address, $testnet)
      set(utxos)
    }
  }

  setInterval(fetchUtxos, 3000)
})

export let satBalance = persistentDerived(
  "balance",
  utxos,
  ($utxos, set) => {
    if ($utxos) {
      set($utxos.reduce((sats, output) => output.satoshis + sats, 0))
    }
  },
  0
)

export let usdBalance = derived(
  [satBalance, price],
  ([$satBalance, $price]) => {
    return ($price * $satBalance) / 100000000
  },
  0
)
