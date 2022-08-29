<script lang="ts">
  import { onMount } from "svelte"
  import { setClient } from "svelte-apollo"
  import { client } from "./utils/apollo"

  import Router from "svelte-spa-router"
  import { routes } from "./routes"
  import Header from "./components/Header.svelte"

  import Footer from "./components/Footer.svelte"
  import Notifications from "./components/Notifications.svelte"

  import { query, subscribe } from "svelte-apollo"
  import { gql } from "@apollo/client/core"
  import cloneDeep from "lodash/cloneDeep"
  import merge from "lodash/merge"

  import { confirmingTx } from "./store/tx"
  import { resetOutputs } from "./store/wallet"
  import { notify, Notification, notifications } from "./store/notifications"
  import { testnet } from "./config"

  setClient(client)

  let txSubscriptions = {}

  export function notifyOnConfirmation(txid: string, notification?: Notification) {
    const observable = client.subscribe({
      query: gql`
      subscription {
        transaction(where: {txid: {_eq: "${txid}"}}) {
          broadcastFailed
          broadcasted
        }
      }
    `
    })

    txSubscriptions[txid] = observable.subscribe(
      res => {
        console.log("Got tx result", res)
        const tx = res.data.transaction[0]

        if (tx && tx.broadcasted) {
          notify({
            type: "success",
            text: "Confirmed transaction",
            description: `<a href='https://${testnet ? "test." : ""}whatsonchain.com/tx/${txid}'>${txid.slice(
              0,
              20
            )}...</a>`
          })
        } else if (tx && tx.broadcastFailed) {
          notify({
            type: "danger",
            text: "Failed to confirm transaction",
            description: "Your order did not go through"
          })

          // Just refetch outputs from woc. TODO: Properly handle unconfirmed txs
          $resetOutputs = true
        } else {
          return
        }

        txSubscriptions[txid].unsubscribe()
        delete txSubscriptions[txid]
        if (notification) {
          notification.remove()
        }
      },

      e => {
        console.error(`Subscription error for tx ${txid}:`, e)
      }
    )
  }

  $: if ($confirmingTx) notifyOnConfirmation($confirmingTx.txid, $confirmingTx.notification)

  onMount(() => {
    document.querySelector(".preloader").style.opacity = 0
  })
</script>

<Header />
<div>
  <Router {routes} />
  <Notifications />
</div>
<Footer />

<style>
  div {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex-grow: 1;
  }

  :global(body) {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }
</style>
