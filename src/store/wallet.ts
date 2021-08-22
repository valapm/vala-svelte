import { writable as persistentWritable, derived as persistentDerived } from "svelte-persistent-store/dist/local"
import { writable, readable, derived, Readable } from "svelte/store"
import { bsv } from "bitcoin-predict"
import Mnemonic from "../utils/mnemonic"
import { testnet } from "../config"
import { getUtxos } from "../utils/utxo"
import { price } from "./price"
import { fetchUTXOs } from "../apis/whatsonchain"

// console.log(Mnemonic)

const derivationPath = "m/44'/0'/0'/0/0"

export let seed = persistentWritable("seed", null)

export let hdPrivateKey = derived(
  seed,
  seed => {
    return seed ? Mnemonic.fromString(seed).toHDPrivateKey("", testnet ? "testnet" : "livenet") : null
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

export let utxos = persistentDerived(
  "utxos",
  address,
  ($address, set) => {
    if (window.localStorage.utxos) {
      set(JSON.parse(window.localStorage.utxos))
    }

    async function fetchUtxos() {
      if ($address) {
        const utxos = await fetchUTXOs($address.hashBuffer.toString("hex"), testnet)
        set(utxos)
      }
    }

    const interval = setInterval(fetchUtxos, 3000)

    return function stop() {
      clearInterval(interval)
    }
  },
  []
)

export let parsedUTXOs = derived(utxos, $utxos => $utxos.map(utxo => bsv.Transaction.UnspentOutput(utxo)), [])

export let satBalance = derived(
  utxos,
  $utxos => {
    return $utxos.reduce((sats, output) => output.satoshis + sats, 0)
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
