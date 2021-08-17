<script>
  import SlInput from "@shoelace-style/shoelace/dist/components/input/input.js"

  export let value = ""

  let search_input
</script>

<sl-input placeholder="Search" bind:this={search_input} {value} on:input={() => (value = search_input.value)} />
