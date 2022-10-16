<script>
  import { contracts } from "bitcoin-predict"
  import { fade } from "svelte/transition"
  import { rabinPubKey } from "../store/oracle"
  import { onMount } from "svelte"
  import { publicKey } from "../store/wallet"

  import { query } from "svelte-apollo"
  import { gql } from "@apollo/client/core"
  import { jsonToGraphQLQuery, EnumType } from "json-to-graphql-query"

  import Searchbar from "../components/Searchbar.svelte"
  import SearchOptions from "../components/SearchOptions.svelte"
  import Masonry from "../components/Masonry.svelte"
  import Card from "../components/Card.svelte"

  // import dummyMarkets from "../test/dummymarkets.json"

  const sortOptions = [
    // "Market Cap",
    "Total Value Locked",
    "Total Volume",
    "Most Recent",
    "Liquidity"
  ]

  let filterOptions = ["Live Markets", "Resolved Markets"]

  export let oracle = undefined
  export let pubKeyFilter = undefined
  export let searchBar = true
  export let limit = undefined

  let markets = []
  let search = ""
  let sort = 0
  let filter = 0
  let direction = "desc"

  // $: if (markets) console.log("markets changed")
  // $: if (search) console.log("search changed")
  // $: if (sort) console.log("sort changed")
  // $: if (filter) console.log("filter changed")
  // $: if (direction) console.log("direction changed")

  let filterQueries = [
    { market_oracles: { committed: { _eq: true } }, decided: { _eq: false } },
    { decided: { _eq: true } },
    { market_oracles: { committed: { _eq: false } } }
  ]

  $: isCurrentOracle = oracle && $rabinPubKey && $rabinPubKey.toString() === oracle.pubKey

  let marketFilter = {}
  $: {
    let marketStateFilters = []

    marketStateFilters.push(filterQueries[filter])

    if (!isCurrentOracle) {
      // Exclude hidden markets
      if ($publicKey) {
        marketStateFilters.push({
          _or: [{ hidden: { _eq: false } }, { entries: { investorPubKey: { _eq: $publicKey.toString() } } }]
        })
      } else {
        marketStateFilters.push({ hidden: { _eq: false } })
      }
    }

    // Filter by selected market status option
    marketStateFilters.push(filterQueries[filter])

    if (pubKeyFilter) {
      // Filter by investor pubKey
      marketStateFilters.push({ entries: { investorPubKey: { _eq: pubKeyFilter } } })
    }

    if (oracle) {
      // Filter by oracle
      marketFilter = {
        ...marketFilter,
        oraclePubKey: { _eq: oracle.pubKey }
      }
    }

    if (marketStateFilters.length) {
      marketFilter = {
        ...marketFilter,
        ...(marketStateFilters.length && {
          market_state: {
            _and: marketStateFilters
          }
        })
      }
    }
  }

  $: orderQueries = [
    {
      market_state_aggregate: {
        max: {
          satoshis: new EnumType(direction)
        }
      }
    },
    {
      market_state_aggregate: {
        max: {
          totalSatVolume: new EnumType(direction)
        }
      }
    },
    { marketStateByFirststateid: { state: { transaction: { processedAt: direction } } } },
    {
      market_state_aggregate: {
        max: {
          liquidity: new EnumType(direction)
        }
      }
    }
  ]

  $: globalFilter = {
    ...marketFilter,
    ...(search && { resolve: { _ilike: `%${search}%` } }),
    version: { _in: versions }
  }

  const versions = Object.keys(contracts.marketContracts)

  $: jsonQuery = {
    market: {
      __args: { where: globalFilter, order_by: orderQueries[sort], ...(limit && { limit: limit }) },
      market_state: {
        market_oracles: {
          committed: true,
          oracle: {
            iconType: true,
            oracle_state: {
              domain: true
            }
          }
        },
        satoshis: true,
        decided: true,
        shares: true,
        liquidity: true,
        decision: true,
        totalSatVolume: true
      },
      marketStateByFirststateid: {
        state: {
          transaction: {
            txid: true,
            broadcastedAt: true,
            minerTimestamp: true,
            processedAt: true
          }
        }
      },
      resolve: true,
      details: true,
      options: {
        name: true
      }
    }
  }

  $: console.log(jsonToGraphQLQuery(jsonQuery))
  $: marketQuery = gql`{${jsonToGraphQLQuery(jsonQuery)}}`

  $: marketRes = initializing ? undefined : query(marketQuery)

  // For debugging the masonry grid
  // $: if ($marketRes.data) markets = dummyMarkets.filter(e => Math.random() > 0.5)

  let items = []
  $: if ($marketRes && $marketRes.data) {
    items = $marketRes.data.market.map((market, index) => {
      return { ...market, id: market.marketStateByFirststateid.state.transaction.txid }
    })
  }
  $: if (isCurrentOracle) items.unshift({ id: "createMarket" })

  function remToPixels(rem) {
    return rem * parseFloat(getComputedStyle(document.documentElement).fontSize)
  }

  // $: console.log("items markets", items)

  // const [send, receive] = crossfade({ duration: 300, fallback: fade })

  let initializing = true
  onMount(() => {
    if (isCurrentOracle) filterOptions = [...filterOptions, "Unpublished Markets"]

    initializing = false
  })
</script>

<div class="markets">
  {#if searchBar}
    <div class="search">
      <Searchbar bind:value={search} placeholder="Search Bets {oracle ? 'by ' + oracle.oracle_state[0].domain : ''}" />
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
  {:else if $marketRes && !$marketRes.loading}
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
