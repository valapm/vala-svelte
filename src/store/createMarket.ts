import { persist, createSessionStorage } from "@macfja/svelte-persistent-store"
import { writable } from "svelte/store"

export const resolve = persist(writable(null), createSessionStorage(), "new_market_resolve")
export const details = persist(writable(null), createSessionStorage(), "new_market_details")
export const numOptions = persist(writable(2), createSessionStorage(), "new_market_options_num")
export const options = persist(writable([]), createSessionStorage(), "new_market_options")
export const creatorFee = persist(writable(null), createSessionStorage(), "new_market_creatorfee")
export const liquidityFee = persist(writable(0.5), createSessionStorage(), "new_market_liquidityfee")

export function reset() {
  resolve.set(null)
  details.set(null)
  numOptions.set(2)
  options.set([])
  creatorFee.set(null)
  liquidityFee.set(0.5)
}
