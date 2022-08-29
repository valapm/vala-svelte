import { writable, derived, Writable } from "svelte/store"
import type { Notification } from "./notifications"

export const confirmingTx: Writable<{
  txid: string
  notification?: Notification
}> = writable()
