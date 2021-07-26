<script>
  import { onMount } from "svelte"
  // import { Chart, LineElement, LineController } from "chart.js"
  import Chart from "chart.js/auto"
  import { gql } from "graphql-request"
  import { gqlClient } from "../store/graphql"
  import { lmsr } from "bitcoin-predict"

  export let market

  let ctx

  const priceQuery = gql`
  {
    market(where: {marketByFirststateid: {transactionTxid: {_eq: "${market.marketByFirststateid.transaction.txid}"}}}, order_by: {stateCount: asc}) {
      shares
      liquidity
      stateCount
    }
  }
`

  onMount(async () => {
    const marketData = await $gqlClient.request(priceQuery)

    const shareData = new Array(market.optionLength).fill([])

    for (const marketState of marketData.market) {
      const balance = {
        shares: marketState.shares,
        liquidity: marketState.liquidity
      }

      for (const [shareIndex, share] of marketState.shares.entries()) {
        // console.log("Pushing", lmsr.getProbability(balance, share), "to", JSON.stringify(shareData),"at pos", shareIndex )
        shareData[shareIndex] = shareData[shareIndex].concat([lmsr.getProbability(balance, share)])
        // console.log("Result", JSON.stringify(shareData))
      }
    }

    const datasets = shareData.map((data, index) => {
      return {
        label: market.options[index].name,
        data: shareData[index],
        fill: false,
        cubicInterpolationMode: "monotone"
        // backgroundColor: ["rgba(255, 99, 132, 0.2)"],
        // borderColor: ["rgba(255, 99, 132, 1)"],
        // borderWidth: 1
      }
    })

    const labels = marketData.market.map(market => market.stateCount)

    // Chart.register(LineElement)

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
