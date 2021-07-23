<script>
  import { onMount } from "svelte"
  import Chart from "chart.js"
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

    console.log(shareData)
    for (const marketState of marketData.market) {
      const balance = {
        shares: marketState.shares,
        liquidity: marketState.liquidity
      }

      for (const [shareIndex, share] of marketState.shares.entries()) {
        shareData[shareIndex].push(lmsr.getProbability(balance, share))
      }
    }

    const datasets = shareData.map((data, index) => {
      return {
        label: market.options[index].name,
        data: shareData[index]
        // backgroundColor: ["rgba(255, 99, 132, 0.2)"],
        // borderColor: ["rgba(255, 99, 132, 1)"],
        // borderWidth: 1
      }
    })

    const labels = marketData.market.map(market => market.stateCount)

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
            max: 1,
            min: 0
            // position: "left",
            // ticks: {
            //   beginAtZero: true
            // },
            // gridLines: {
            //   display: false
            // }
          }
        }
      }
    })
  })
</script>

<canvas bind:this={ctx} width="400" height="200" />
