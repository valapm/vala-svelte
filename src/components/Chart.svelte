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
    market(where: {marketByFirststateid: {transactionTxid: {_eq: "${market}"}}}, order_by: {stateCount: asc}, offset: 1) {
      sharesFor
      sharesAgainst
      liquidity
      stateCount
    }
  }
`

  onMount(async () => {
    const marketData = await $gqlClient.request(priceQuery)

    const priceData = marketData.market.map(market => lmsr.getProbability(market))
    const labels = marketData.market.map(market => market.stateCount)

    console.log(priceData)

    new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            data: priceData,
            backgroundColor: ["rgba(255, 99, 132, 0.2)"],
            borderColor: ["rgba(255, 99, 132, 1)"],
            borderWidth: 1
          }
        ]
      },
      options: {
        legend: {
          display: false
        },
        scales: {
          yAxes: [
            {
              ticks: {
                beginAtZero: true
              },
              gridLines: {
                display: false
              }
            }
          ]
        }
      }
    })
  })
</script>

<canvas bind:this={ctx} width="400" height="200" />
