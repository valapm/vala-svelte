<script>
  import Markets from "../components/Markets.svelte"
</script>

<div>
  <Markets />
</div>

<style>
  div {
    margin-top: 5rem;
    width: min(65rem, 95%);
  }

  @media screen and (max-width: 600px) {
    div {
      margin-top: 1rem;
    }
  }
</style>
