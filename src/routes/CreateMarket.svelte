<script>
  import * as bp from "bitcoin-predict"
  import { privateKey, publicKey, address } from "../store/wallet"
  import { getUtxos } from "../utils/utxo"
  import { oracles } from "../oracle"
  import { testnet } from "../store/options"
  import { postTx } from "../apis/web"

  const { fundTx, buildTx } = bp.transaction

  let resolve

  $: entries = [
    {
      publicKey: $publicKey.toString(),
      balance: {
        sharesFor: 0,
        sharesAgainst: 0,
        liquidity: 1
      }
    }
  ]

  $: market = bp.pm.getNewMarket(
    {
      resolve
    },
    entries,
    oracles
  )

  async function createMarket() {
    const tx = buildTx(market)
    const utxos = await getUtxos($address.toString(), $testnet)

    const fundedTx = fundTx(tx, $privateKey, $address, utxos)
    const rawtx = fundedTx.checkedSerialize() // FIXME: throws if not enough sats

    const postRes = await postTx(rawtx, entries, $testnet)
    console.log(postRes)
  }
</script>

Resolve: <input type="text" bind:value={resolve} />
<button on:click={createMarket}>Create new market</button>
