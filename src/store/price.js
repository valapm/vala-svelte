import { BACKEND_HOST } from "../config"
import { asyncReadable } from "svelte-async-readable"

async function getPrice() {
  const res = await fetch(`${BACKEND_HOST}/price`)
  if (!res.ok) throw new Error("Failed to fetch price")
  const json = await res.json()
  return parseInt(json.price)
}

export const price = asyncReadable({
  dataProvider: getPrice,
  initialValue: 0
})
