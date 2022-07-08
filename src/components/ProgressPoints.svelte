<script>
  export let step = 1
  export let total = 4
</script>

<div>
  {#each new Array(total) as current, index}
    <span class={step === index + 1 ? "active" : ""} />
  {/each}
</div>

<style>
  div {
    display: flex;
    align-items: center;
    gap: 0.6rem;
  }

  span {
    border-radius: 50%;
    width: 0.6rem;
    height: 0.6rem;
    background: #323841;
  }

  .active {
    background: linear-gradient(149.62deg, #01a781 17.39%, #00ffc5 124.46%);
  }
</style>
