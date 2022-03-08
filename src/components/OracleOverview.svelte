<script>
  import OracleCard from "./OracleCard.svelte"
  import Markets from "./Markets.svelte"

  export let oracle
</script>

<div id="overview">
  <OracleCard {oracle} large={true} />
  <Markets {oracle} />
</div>

<style>
  #overview {
    gap: 3.0625rem;
    margin-top: 4.3125rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: min(65rem, 95%);
  }
</style>
