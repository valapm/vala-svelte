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
  import SearchOptions from "../components/SearchOptions.svelte"

  const sortOptions = [
    "Market Cap",
    // "Total Volume",
    "Most Recent",
    "Liquidity"
  ]

  const filterOptions = ["Live Markets", "Unconfirmed Markets", "Resolved Markets"]

  let markets = []
  let search = ""
  let sort = 0
  let filter = [0, 1, 2]
  let direction = "desc"

  const filterQueries = [
    "market_state: {market_oracles: {committed: {_eq: true}}}",
    "market_state: {market_oracles: {committed: {_eq: false}}}",
    "market_state: {decided: {_eq: true}}"
  ]

  // $: filterQuery = filter.reduce((query, fIndex, index) => {
  //   if (index === 0) return filterQueries[fIndex]

  //   return query + `, _or: { ${filterQueries[fIndex]} }`
  // }, "")

  $: filterQuery =
    filter.length === 1
      ? filterQueries[filter[0]]
      : `_or: [ ${filter.map(fIndex => `{ ${filterQueries[fIndex]} }`).join(", ")} ]`

  $: orderQueries = [
    `market_state: { liquidity: ${direction} }`,
    `marketStateByFirststateid: { transaction: { processedAt: ${direction} } }`,
    `market_state: { liquidity: ${direction} }`
  ]

  $: console.log(`Search ${filter.join(", ")} by ${sort}`)

  let grid

  const versions = pm.versions.map(v => v.identifier)

  $: marketQuery = gql`
    {
      market(order_by: { ${
        orderQueries[sort]
      } }, where: { resolve: {_ilike: "%${search}%"}, version: { _in: ${JSON.stringify(versions)}}, ${filterQuery}}) {
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

  function remToPixels(rem) {
    return rem * parseFloat(getComputedStyle(document.documentElement).fontSize)
  }

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

<div class="container">
  <div class="search">
    <Searchbar bind:value={search} />
    <SearchOptions {sortOptions} {filterOptions} bind:sort bind:filter bind:direction />
  </div>

  <div bind:this={grid}>
    {#each new Array(30).fill(markets).flat() as market}
      <MarketCard {market} />
    {/each}
  </div>
</div>

<style>
  /* .markets {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    align-items: center;
  } */

  .container {
    gap: 3.0625rem;
    margin-top: 4.3125rem;
  }

  .search {
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: 0.875rem;
  }
</style>
