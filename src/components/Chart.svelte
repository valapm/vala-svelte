<script>
  import { onMount } from "svelte"
  // import { Chart, LineElement, LineController } from "chart.js"
  import Chart from "chart.js/auto"
  import { gql } from "graphql-request"
  import { gqlClient } from "../store/graphql"
  import { lmsr } from "bitcoin-predict"
  // import "chartjs-adapter-date-fns"
  import "chartjs-adapter-moment"

  export let market

  let ctx

  const colors = ["#ff6384", "#36a2eb", "#4bc0c0", "#ffcd56", "#ff9f40", "#9966ff"]

  const priceQuery = gql`
  {
    market_state(where: {market: { marketStateByFirststateid: {transactionTxid: {_eq: "${market.marketStateByFirststateid.transaction.txid}"}}}}, order_by: {stateCount: asc}) {
      shares
      liquidity
      stateCount
      transaction {
        minerTimestamp
        broadcastedAt
     }
    }
  }
`

  onMount(async () => {
    const marketData = await $gqlClient.request(priceQuery)

    const shareData = new Array(market.options.length).fill([])

    for (const [stateIndex, marketState] of marketData.market_state.entries()) {
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

    const datasets = shareData.map((data, index) => {
      return {
        label: market.options[index].name,
        data: shareData[index],
        fill: false,
        cubicInterpolationMode: "monotone",
        borderColor: [colors[index % 6]]
      }
    })

    const labels = marketData.market_state.map(market => market.stateCount)

    // Chart.register(LineElement)

    const firstTimestamp = new Date(
      (marketData.market_state[0].transaction.broadcastedAt || marketData.market_state[0].transaction.minerTimestamp) +
        "Z"
    ).valueOf()

    new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
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
            time: {
              // parser: "YYYY-MM-DDTHH:mm:ss",
              // Luxon format string
              // tooltipFormat: "dd T"
            }
          },
          // yAxes: [
          //   {
          //     ticks: {
          //       beginAtZero: true
          //     },
          //     gridLines: {
          //       display: false
          //     }
          //   }
          // ],
          y: {
            // display: true,
            min: 0,
            max: 1,
            // position: "left",
            grid: {
              display: false
            }
          }
        }
      }
    })
  })
</script>

<canvas bind:this={ctx} width="400" height="200" />
