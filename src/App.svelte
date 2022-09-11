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

  export async function notifyOnConfirmation(txid: string, notification?: Notification) {
    console.log(`Setting up notification for ${txid}`)
    const txQuery = gql`
      subscription {
        transaction(where: {txid: {_eq: "${txid}"}}) {
          broadcastFailed
          broadcasted
        }
      }
    `

    function handleTxRes(res) {
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
    }

    const observable = client.subscribe({
      query: txQuery
    })

    txSubscriptions[txid] = observable.subscribe(handleTxRes, e => {
      console.error(`Subscription error for tx ${txid}:`, e)
    })

    // // In case reponse is too fast for subscription
    // client
    //   .query({
    //     query: gql`
    //       query {
    //         transaction(where: {txid: {_eq: "${txid}"}}) {
    //           broadcastFailed
    //           broadcasted
    //         }
    //       }
    //     `
    //   })
    //   .then(res => {
    //     console.log("query res:")
    //     handleTxRes(res)
    //   })
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
