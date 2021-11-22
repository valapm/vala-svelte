<script>
  import { onMount, onDestroy } from "svelte"
  // import { Chart, LineElement, LineController } from "chart.js"
  import Chart from "chart.js/auto"
  import { gql } from "graphql-request"
  import { gqlClient } from "../utils/graphql"
  import { lmsr } from "bitcoin-predict"
  // import "chartjs-adapter-date-fns"
  import "chartjs-adapter-moment"

  export let market

  let canvas

  const colors = ["#FF0060", "#00ACFF", "#C4A4FF", "#00FFE0", "#05FF00", "#0029FF"]

  const priceQuery = gql`
  {
    market_state(where: { market: { marketStateByFirststateid: {transactionTxid: {_eq: "${market.marketStateByFirststateid.transaction.txid}"}}}}, order_by: {stateCount: asc}) {
      shares
      liquidity
      decided
      stateCount
      transaction {
        minerTimestamp
        broadcastedAt
     }
    }
  }
`

  let marketData
  $: if (market) updateMarketData()
  $: datasets = marketData && getDataSets()
  $: labels = marketData && marketData.market_state.map(market => market.stateCount)
  $: firstTimestamp =
    marketData &&
    new Date(
      (marketData.market_state[0].transaction.broadcastedAt || marketData.market_state[0].transaction.minerTimestamp) +
        "Z"
    ).valueOf()

  let chart

  $: if (datasets) updateChart()

  function updateChart() {
    if (!chart) {
      chart = getChart()
      console.log("Initialized chart")
    } else {
      chart.data.labels = labels
      chart.data.datasets = datasets
      chart.update()
      console.log("Updated chart")
    }
  }

  async function updateMarketData() {
    console.log("Fetching price history")
    marketData = await gqlClient.request(priceQuery)
    console.log(marketData.market_state.length)
  }

  // function updateDataSets() {
  //   const newStates = marketData.market_state.slice(datasets[0].data.length, marketData.marketState.length -1)

  //   for (const [index, _] of chart.data.datasets.entries()) {
  //     const set = chart.data.datasets[index]
  //     delete set[set.length -1]
  //   }

  //   for (const [stateIndex, marketState] of newStates.entries()) {
  //     const balance = {
  //       shares: marketState.shares,
  //       liquidity: marketState.liquidity
  //     }

  //     for (const [shareIndex, share] of marketState.shares.entries()) {
  //       const date = new Date((marketState.transaction.broadcastedAt || marketState.transaction.minerTimestamp) + "Z")
  //       const timestamp = date.valueOf()
  //       chart.data.datasets[shareIndex].data.push(
  //         {
  //           x: timestamp,
  //           y: lmsr.getProbability(balance, share)
  //         }
  //       )
  //       // console.log("Result", JSON.stringify(shareData))

  //       // Add current time to the end
  //       if (stateIndex === marketData.market_state.length - 1) {
  //         shareData[shareIndex] = shareData[shareIndex].concat([
  //           {
  //             x: new Date().valueOf(),
  //             y: lmsr.getProbability(balance, share)
  //           }
  //         ])
  //       }
  //     }
  //   }
  // }

  function getDataSets() {
    const shareData = new Array(market.options.length).fill([])

    for (const [stateIndex, marketState] of marketData.market_state.entries()) {
      if (marketState.decided) {
        break
      }

      const balance = {
        shares: marketState.shares,
        liquidity: marketState.liquidity
      }

      for (const [shareIndex, share] of marketState.shares.entries()) {
        // console.log("Pushing", lmsr.getProbability(balance, share), "to", JSON.stringify(shareData),"at pos", shareIndex )

        const date = new Date((marketState.transaction.broadcastedAt || marketState.transaction.minerTimestamp) + "Z")
        const timestamp = date.valueOf()
        shareData[shareIndex] = shareData[shareIndex].concat([
          {
            x: timestamp,
            y: lmsr.getProbability(balance, share)
          }
        ])
        // console.log("Result", JSON.stringify(shareData))

        // Add current time to the end
        if (stateIndex === marketData.market_state.length - 1) {
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
        label: market.options[index].name,
        data: shareData[index],
        fill: false,
        cubicInterpolationMode: "monotone",
        borderColor: [colors[index % 6]]
        // backgroundColor: gradient // Only works after canvas is loaded
      }
    })
  }

  function getChart() {
    return new Chart(canvas, {
      type: "line",
      data: {
        labels,
        datasets
      },
      options: {
        legend: {
          display: false
        },
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

  onDestroy(() => {
    if (chart) chart.destroy()
  })
</script>

<canvas bind:this={canvas} width="400" height="200" />
