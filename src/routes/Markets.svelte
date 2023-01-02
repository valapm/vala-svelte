<script>
  // import Markets from "../components/Markets.svelte";
  import ThankYouNotice from "../components/ThankYouNotice.svelte";
</script>

<div>
  <!-- <Markets /> -->
  <ThankYouNotice />
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
