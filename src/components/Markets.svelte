<script>
  import { contracts } from "bitcoin-predict"
  import { fade } from "svelte/transition"
  import { rabinPubKey } from "../store/oracle"

  import { query } from "svelte-apollo"
  import { gql } from "@apollo/client/core"

  import Searchbar from "../components/Searchbar.svelte"
  import SearchOptions from "../components/SearchOptions.svelte"
  import Masonry from "../components/Masonry.svelte"
  import Card from "../components/Card.svelte"

  // import dummyMarkets from "../test/dummymarkets.json"

  const sortOptions = [
    "Market Cap",
    // "Total Volume",
    "Most Recent",
    "Liquidity"
  ]

  const filterOptions = ["Live Markets", "Unconfirmed Markets", "Resolved Markets"]

  export let oracle = undefined
  export let pubKeyFilter = undefined
  export let searchBar = true
  export let limit = undefined

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

  $: fullFilterQuery = pubKeyFilter
    ? `_and: [{${filterQuery}}, {market_state: {entries: {investorPubKey: {_eq: "${pubKeyFilter}"}}}}]`
    : oracle
    ? `_and: [{${filterQuery}}, {market_state: {market_oracles: {oraclePubKey: {_eq: "${oracle.pubKey}" }}}}]`
    : filterQuery

  $: orderQueries = [
    `market_state: { liquidity: ${direction} }`,
    `marketStateByFirststateid: { state: { transaction: { processedAt: ${direction} } } }`,
    `market_state: { liquidity: ${direction} }`
  ]

  // $: console.log(`Search ${filter.join(", ")} by ${sort}`)

  $: isCurrentOracle = oracle && $rabinPubKey && $rabinPubKey.toString() === oracle.pubKey

  let grid

  const versions = Object.keys(contracts.marketContracts)

  $: marketQuery = gql`
    {
      market(order_by: { ${
        orderQueries[sort]
      } }, where: { resolve: {_ilike: "%${search}%"}, version: { _in: ${JSON.stringify(
    versions
  )}}, ${fullFilterQuery}}${limit ? ", limit: " + limit : ""}) {
        market_state {
          market_oracles {
            committed
            oracle {
              iconType
              oracleStateByCurrentstateid {
                domain
              }
            }
          }
          satoshis
          decided
          shares
          liquidity
          decision
        }
        marketStateByFirststateid {
          state {
            transaction {
              txid
              broadcastedAt
              minerTimestamp
              processedAt
            }
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

  $: marketRes = query(marketQuery)
  $: console.log($marketRes, marketQuery)

  // For debugging the masonry grid
  // $: if ($marketRes.data) markets = dummyMarkets.filter(e => Math.random() > 0.5)

  let items = []
  $: if ($marketRes.data) {
    items = $marketRes.data.market.map((market, index) => {
      return { ...market, id: market.marketStateByFirststateid.state.transaction.txid }
    })
    if (isCurrentOracle) items.unshift({ id: "createMarket" })
  }

  function remToPixels(rem) {
    return rem * parseFloat(getComputedStyle(document.documentElement).fontSize)
  }

  // $: console.log("items markets", items)

  // const [send, receive] = crossfade({ duration: 300, fallback: fade })
</script>

<div class="markets">
  {#if searchBar}
    <div class="search">
      <Searchbar
        bind:value={search}
        placeholder="Search Bets {oracle ? 'by ' + oracle.oracleStateByCurrentstateid.domain : ''}"
      />
      <SearchOptions {sortOptions} {filterOptions} bind:sort bind:filter bind:direction />
    </div>
  {/if}

  {#if items.length}
    <Masonry
      {items}
      minColWidth={remToPixels(20.625)}
      maxColWidth={remToPixels(20.625)}
      gap={remToPixels(1.5625)}
      let:item={market}
    >
      <!-- <div
      in:receive={{ key: item.marketStateByFirststateid.state.transaction.txid }}
      out:send={{ key: item.marketStateByFirststateid.state.transaction.txid }}
    > -->
      <Card item={market} />
      <!-- <MarketCard {market} /> -->
      <!-- </div> -->
    </Masonry>
  {:else if !$marketRes.loading}
    <p id="nothing_found">Nothing found!</p>
  {/if}
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

  #nothing_found {
    font-size: 2rem;
    font-weight: 600;
    opacity: 30%;
  }
</style>
