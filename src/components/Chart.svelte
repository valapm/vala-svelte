<script>
  import { onMount, onDestroy } from "svelte"
  // import { Chart, LineElement, LineController } from "chart.js"
  import Chart from "chart.js/auto"
  import { query, subscribe } from "svelte-apollo"
  import { gql } from "@apollo/client/core"
  import { client } from "../utils/apollo"
  import { lmsr } from "bitcoin-predict"
  // import "chartjs-adapter-date-fns"
  import "chartjs-adapter-moment"

  export let market

  let canvas

  const colors = ["#FF0060", "#00ACFF", "#C4A4FF", "#00FFE0", "#05FF00", "#0029FF"]

  const priceQuery = gql`
    query {
      market_state(where: { market: { marketStateByFirststateid: { state: {transactionTxid: {_eq: "${market.marketStateByFirststateid.state.transaction.txid}"}}}}, decided: {_eq: false}}, order_by: {stateCount: asc}) {
        shares
        liquidity
        decided
        stateCount
        state {
          transaction {
            minerTimestamp
            broadcastedAt
          }
        }
      }
    }
  `
  const priceSubscription = gql`
    subscription {
      market_state(where: { market: { marketStateByFirststateid: { state: {transaction: {txid: {_eq: "${
        market.marketStateByFirststateid.state.transaction.txid
      }"}, broadcastedAt: {_gt: "${new Date().toISOString()}"}}}}}, decided: {_eq: false}}, order_by: {stateCount: desc}, limit: 1) {
        shares
        liquidity
        decided
        stateCount
        state {
          transaction {
            minerTimestamp
            broadcastedAt
          }
        }
      }
    }
  `
  const marketDataSubscription = subscribe(priceSubscription)

  let chart
  let labels = []

  $: if (chart && $marketDataSubscription.data && $marketDataSubscription.data.market_state[0]) {
    const marketState = $marketDataSubscription.data.market_state[0]

    console.log("New price data:", marketState)

    chart.data.labels.push(marketState.stateCount)

    const balance = {
      shares: marketState.shares,
      liquidity: marketState.liquidity
    }

    const date = new Date(
      (marketState.state.transaction.broadcastedAt || marketState.state.transaction.minerTimestamp) + "Z"
    )
    const timestamp = date.valueOf()

    for (const [shareIndex, share] of marketState.shares.entries()) {
      chart.data.datasets[shareIndex].data.push({
        x: timestamp,
        y: lmsr.getProbability(balance, share)
      })
    }

    chart.update()
    console.log("Updated chart")
  }

  function getOptionName(index) {
    const name = market.options[index].name
    if (name.length > 30) {
      return name.slice(0, 30) + "..."
    }
    return name
  }

  function getDataSets(data) {
    const shareData = new Array(market.options.length).fill([])

    for (const [stateIndex, marketState] of data.market_state.entries()) {
      const balance = {
        shares: marketState.shares,
        liquidity: marketState.liquidity
      }

      for (const [shareIndex, share] of marketState.shares.entries()) {
        // console.log("Pushing", lmsr.getProbability(balance, share), "to", JSON.stringify(shareData),"at pos", shareIndex )

        const date = new Date(
          (marketState.state.transaction.broadcastedAt || marketState.state.transaction.minerTimestamp) + "Z"
        )
        const timestamp = date.valueOf()
        shareData[shareIndex] = shareData[shareIndex].concat([
          {
            x: timestamp,
            y: lmsr.getProbability(balance, share)
          }
        ])
        // console.log("Result", JSON.stringify(shareData))

        // Add current time to the end
        if (stateIndex === data.market_state.length - 1 && !market.market_state.decided) {
          shareData[shareIndex] = shareData[shareIndex].concat([
            {
              x: new Date().valueOf(),
              y: lmsr.getProbability(balance, share)
            }
          ])
        }
      }
    }

    // const ctx = canvas.getContext("2d")

    return shareData.map((data, index) => {
      // const gradient = ctx.createLinearGradient(0, 0, 0, 200)
      // gradient.addColorStop(0, colors[index % 6])
      // gradient.addColorStop(1, "rgba(255,255,255,0)")

      return {
        label: getOptionName(index),
        data,
        // fill: false,
        cubicInterpolationMode: "monotone",
        borderColor: [colors[index % 6]],
        borderWidth: 1,
        radius: 0
        // backgroundColor: gradient // Only works after canvas is loaded
      }
    })
  }

  function getChart(datasets, labels, firstTimestamp) {
    return new Chart(canvas, {
      type: "line",
      data: {
        labels,
        datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
          x: {
            min: firstTimestamp,
            type: "time",
            bounds: "data",
            ticks: {
              maxRotation: 0,
              major: {
                enabled: true
              },
              font: function (context) {
                if (context.tick && context.tick.major) {
                  return {
                    weight: "bold"
                  }
                }
              }
            }
          },
          y: {
            min: 0,
            max: 1,
            grid: {
              display: false
            }
          }
        }
      }
    })
  }

  onMount(async () => {
    const marketData = await client.query({ query: priceQuery })

    if (marketData.error) {
      console.error(res)
      throw new Error("Failed to fetch prices")
    }

    const datasets = getDataSets(marketData.data)

    labels = marketData.data.market_state.map(market => market.stateCount)
    const firstTimestamp = new Date(
      (marketData.data.market_state[0].state.transaction.broadcastedAt ||
        marketData.data.market_state[0].state.transaction.minerTimestamp) + "Z"
    ).valueOf()

    chart = getChart(datasets, labels, firstTimestamp)
    console.log("Initialized chart")
  })

  onDestroy(() => {
    if (chart) chart.destroy()
  })
</script>

<canvas bind:this={canvas} width="400" height="200" />
