<script>
  import { gql } from "graphql-request"
  import { gqlClient } from "../utils/graphql"
  import { seed } from "../store/wallet"
  import { pm } from "bitcoin-predict"
  import { onMount } from "svelte"
  import Bricks from "bricks.js"
  import { tick } from "svelte"

  import { location } from "svelte-spa-router"

  import MarketCard from "../components/MarketCard.svelte"
  import Searchbar from "../components/Searchbar.svelte"

  import SlButton from "@shoelace-style/shoelace/dist/components/button/button.js"
  import SlInput from "@shoelace-style/shoelace/dist/components/input/input.js"

  let markets = []
  let search = ""

  let grid

  const versions = pm.versions.map(v => v.identifier)

  $: marketQuery = gql`
    {
      market(order_by: { market_state: { liquidity: desc } }, where: { resolve: {_ilike: "%${search}%"}, version: { _in: ${JSON.stringify(
    versions
  )}}}) {
        market_oracles_oracles {
          oracle {
            name
          }
        }
        market_state {
          market_oracles {
            committed
          }
          satoshis
          decided
          shares
          liquidity
          decision
        }
        marketStateByFirststateid {
          transaction {
            txid
            broadcastedAt
            minerTimestamp
            processedAt
          }
        }
        resolve
        details
        options {
          name
        }
      }
    }
  `

  $: gqlClient.request(marketQuery).then(res => (markets = res.market))

  // function resizeGridItem(item) {
  //   rowHeight = parseInt(window.getComputedStyle(grid).getPropertyValue("grid-auto-rows"))
  //   rowGap = parseInt(window.getComputedStyle(grid).getPropertyValue("grid-row-gap"))
  //   rowSpan = Math.ceil((item.querySelector(".content").getBoundingClientRect().height + rowGap) / (rowHeight + rowGap))
  //   item.style.gridRowEnd = "span " + rowSpan
  // }

  // function resizeGridItems() {
  //   const cards = grid ? grid.childNodes : []
  //   for (const card of cards) {
  //     resizeGridItem(card)
  //   }
  // }

  // function resizeInstance(instance) {
  //   item = instance.elements[0]
  //   resizeGridItem(item)
  // }

  function remToPixels(rem) {
    return rem * parseFloat(getComputedStyle(document.documentElement).fontSize)
  }

  // $: {
  //   if (grid) {
  //     const instance = Bricks({
  //       container: grid,
  //       sizes: [
  //         // { columns: 1, gutter: remToPixels(1) },
  //         // { mq: "768px", columns: 2, gutter: remToPixels(1.5) },
  //         { mq: "1040px", columns: 3, gutter: remToPixels(2) }
  //       ],
  //       packed: "packed"
  //     })
  //     instance.pack()
  //   }
  // }

  $: {
    if (markets) {
      tick().then(() => {
        instance.pack()
      })
    }
  }

  let instance

  onMount(() => {
    instance = Bricks({
      container: grid,
      sizes: [
        // { columns: 1, gutter: remToPixels(1) },
        // { mq: "768px", columns: 2, gutter: remToPixels(1.5) },
        { mq: "1040px", columns: 3, gutter: remToPixels(1.5625) }
      ],
      packed: "packed"
    })
  })
</script>

<!-- <svelte:window on:resize={resizeGridItems} /> -->

<div class="container">
  <Searchbar bind:value={search} />

  <div bind:this={grid}>
    {#each new Array(30).fill(markets).flat() as market}
      <MarketCard {market} />
    {/each}
    <!-- {#each [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as count}
      <div style="background-color: grey; color: white; min-height: {Math.random() * 4 + 2}rem; width: 5rem">
        {count}
      </div>
    {/each} -->
  </div>

  <!-- <div class="markets">
    {#each markets as market}
      <MarketCard {market} />
    {/each}
  </div> -->
</div>

<style>
  .markets {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    align-items: center;
  }

  .container {
    gap: 3.0625rem;
    margin-top: 4.3125rem;
  }
</style>
