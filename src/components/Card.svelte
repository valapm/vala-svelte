<script>
  import MarketCard from "./MarketCard.svelte"
  import CreateMarketCard from "./CreateMarketCard.svelte"

  export let item
</script>

{#if item.id === "createMarket"}
  <CreateMarketCard />
{:else}
  <MarketCard market={item} />
{/if}
