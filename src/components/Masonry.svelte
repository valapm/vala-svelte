<script lang="ts">
  import { crossfade, fade } from "svelte/transition"
  import { flip } from "svelte/animate"

  export let items: Item[]
  export let minColWidth = 330
  export let maxColWidth = 500
  export let gap = 20
  export let masonryWidth = 0
  export let masonryHeight = 0

  type WithKey<K extends string | number | symbol> = {
    [key in K]: string | number
  }

  // on non-primitive types, we need a property to tell them apart
  // this component hard-codes the name of this property to 'id'
  // https://svelte.dev/tutorial/keyed-each-blocks
  type Item = WithKey<`id`>

  const [send, receive] = crossfade({
    duration: d => Math.sqrt(d * 200),
    fallback: fade
  })

  $: nCols = Math.min(items.length, Math.floor((masonryWidth + gap) / (minColWidth + gap)) || 1)

  $: cols = new Array(nCols)

  $: sortedItems = items.map((item, index) => {
    return {
      ...item,
      col: index % nCols
    }
  })

  // $: console.log("width", masonryWidth)
  // $: console.log("ITEMS:", sortedItems)
</script>

<div class="masonry" bind:clientWidth={masonryWidth} bind:clientHeight={masonryHeight} style="gap: {gap}px;">
  {#if masonryWidth > 0}
    {#each cols as col, colIndex (colIndex)}
      <div class="col" style="--max-width: {maxColWidth}px; gap: {gap}px;" in:fade>
        {#each sortedItems.filter(item => item.col === colIndex) as item (item.id)}
          <div in:receive|local={{ key: item.id }} out:send|local={{ key: item.id }} animate:flip>
            <slot {item} />
          </div>
        {/each}
      </div>
    {/each}
  {/if}
</div>

<style>
  .masonry {
    display: flex;
    justify-content: space-around;
    overflow-wrap: anywhere;
    box-sizing: border-box;
    width: 100%;
  }

  .col {
    display: grid;
    height: max-content;
    width: 100%;
    max-width: var(--max-width);
  }

  .col > div {
    max-width: var(--max-width);
  }
</style>
