<script>
  import Market from "../components/Market.svelte"

  export let params
</script>

{#key params.firstTxTxid}
  <Market marketTxid={params.firstTxTxid} />
{/key}
