import { writable } from "svelte-persistent-store/dist/local"
import { derived } from "svelte/store"
import * as config from "../config"

export const testnet = writable("testnet", false)
export const backendHost = derived(testnet, $testnet => ($testnet ? config.BACKEND_HOST_TESTNET : config.BACKEND_HOST))
export const graphqlHost = derived(testnet, $testnet => ($testnet ? config.GRAPHQL_HOST_TESTNET : config.GRAPHQL_HOST))
export const txqHost = derived(testnet, $testnet => ($testnet ? config.TXQ_HOST_TESTNET : config.TXQ_HOST))
