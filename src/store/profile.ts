import { writable } from "svelte-persistent-store/dist/local"

export const username = writable("username", null)
