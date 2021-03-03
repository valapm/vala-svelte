export async function fetchMattercloudKey() {
  const response = await fetch("https://api.bitindex.network/api/v2/registration/account?secret=secretkey", {
    method: "POST"
  })
  const json = await response.json()

  if (!json.apiKey) throw new Error("Failed to request MatterCloud API key.")

  return json.apiKey
}

export async function fetchUTXOs(address, apiKey) {
  const response = await fetch("https://api.mattercloud.net/api/v3/main/addrs/utxo", {
    method: "POST",
    body: JSON.stringify({ addrs: address }),
    headers: { api_key: apiKey }
  })
  const utxos = await response.json()
  return utxos.map(utxo => {
    return {
      txId: utxo.txid,
      outputIndex: utxo.outputIndex,
      satoshis: utxo.satoshis
    }
  })
}
