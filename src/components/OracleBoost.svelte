<script>
  // async function boost() {
  //   const model = BoostPowJobModel.fromObject({
  //     content: bsv.crypto.Hash.sha256(Buffer.from($rabinPubKey.toString(), "utf8")).toString("hex"),
  //     diff
  //   })

  //   console.log(bsv.crypto.Hash.sha256(Buffer.from($rabinPubKey.toString(), "utf8")).toString("hex"))
  //   console.log(model.getContentBuffer().toString("hex"))

  //   const sats = Math.round(model.getDiff() * diffMultiplier * 100000000)

  //   const utxos = await getUtxos($address.toString(), testnet)

  //   const tx = new bsv.Transaction()
  //   tx.addOutput(new bsv.Transaction.Output({ script: model.toScript(), satoshis: sats }))
  //   tx.feePerKb(feeb * 1000)
  //   tx.change($address)
  //   tx.from(utxos)

  //   await postBoostJobTx(tx, $rabinPubKey.toString(), testnet)

  //   console.log(`Boosted with difficulty ${model.getDiff()} for ${sats} sats`)
  // }

  // async function burn() {
  //   const burnSats = Math.ceil((100000000 * burnUSD) / $price)

  //   console.log(burnSats)

  //   let tx: bsv.Transaction

  //   if (oracle.burnTxTxid) {
  //     const txQuery = gql`
  //       {
  //         transaction(where: { txid: { _eq: "${oracle.burnTxTxid}" } }) {
  //           hex
  //         }
  //       }
  //     `
  //     const res = await gqlClient.request(txQuery)
  //     const prevTxHex = res.transaction[0].hex
  //     const prevTx = new bsv.Transaction()
  //     prevTx.fromString(prevTxHex)

  //     tx = bp.transaction.getOracleUpdateTx(prevTx, burnSats)
  //   } else {
  //     console.log([$rabinPubKey, burnSats])
  //     tx = bp.transaction.buildOracleBurnTx($rabinPubKey, burnSats)
  //     console.log(tx)
  //   }

  //   console.log($address)
  //   const utxos = await getUtxos($address, testnet)

  //   console.log([tx, $privateKey, $address, utxos])
  //   bp.transaction.fundTx(tx, $privateKey, $address, utxos)
  //   console.log(tx)

  //   const postRes = await postBurnTx(tx, testnet)
  //   console.log(postRes)
  // }
</script>
