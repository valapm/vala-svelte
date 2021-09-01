import { writable } from "svelte-persistent-store/dist/local"

export const username = writable("username", null)
export const email = writable("email", null)
export const verified = writable("verified", false)
