<script>
  import { gql } from "graphql-request"
  import { gqlClient } from "../utils/graphql"
  import { seed } from "../store/wallet"
  import { pm } from "bitcoin-predict"
  import { onMount } from "svelte"
  import { tick } from "svelte"
  import { fade, crossfade } from "svelte/transition"

  import { location } from "svelte-spa-router"

  import MarketCard from "../components/MarketCard.svelte"
  import Searchbar from "../components/Searchbar.svelte"
  import SearchOptions from "../components/SearchOptions.svelte"
  import Masonry from "../components/Masonry.svelte"

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

  $: marketArray = Array(30).fill(markets).flat()

  $: gqlClient.request(marketQuery).then(res => (markets = res.market))

  function remToPixels(rem) {
    return rem * parseFloat(getComputedStyle(document.documentElement).fontSize)
  }

  // const [send, receive] = crossfade({ duration: 300, fallback: fade })
</script>

<div class="markets" in:fade={{ duration: 300 }} out:fade={{ duration: 0 }}>
  <div class="search">
    <Searchbar bind:value={search} />
    <SearchOptions {sortOptions} {filterOptions} bind:sort bind:filter bind:direction />
  </div>

  <Masonry
    items={marketArray.map((market, index) => {
      return { ...market, id: market.marketStateByFirststateid.transaction.txid + index }
    })}
    minColWidth={remToPixels(20.625)}
    maxColWidth={remToPixels(20.625)}
    gap={remToPixels(1.5625)}
    let:item={market}
  >
    <!-- <div
    in:receive={{ key: item.marketStateByFirststateid.transaction.txid }}
    out:send={{ key: item.marketStateByFirststateid.transaction.txid }}
  > -->
    <MarketCard {market} />
    <!-- </div> -->
  </Masonry>
</div>

<style>
  /* .markets {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    align-items: center;
  } */

  .markets {
    gap: 3.0625rem;
    margin-top: 4.3125rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
  }

  .search {
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: 0.875rem;
  }
</style>
