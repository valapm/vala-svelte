<script>
  import { getCreationDate } from "../utils/pm"

  export let market

  const labels = ["Unpublished", "Live", "Resolved"]

  const colors = ["#6CD4FF", "#00FFC5", "rgba(255, 255, 255, 0.5)"]

  $: status = market && market.market_state[0].decided ? 2 : market.market_state[0].market_oracles[0].committed ? 1 : 0
  $: creationDate =
    market && getCreationDate(market).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })
</script>

<div id="title">
  <h1>{market.resolve}</h1>
  <div id="subheader">
    <div id="market-dates">Created: {creationDate}</div>
    <div id="status">
      <div id="status-dot" style="background-color: {colors[status]};" />
      <div>{labels[status]}</div>
    </div>
  </div>
</div>

<style>
  #title {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
  }

  h1 {
    font-weight: 600;
    font-size: 2.125rem;
    color: white;
  }

  #subheader {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  #market-dates {
    color: rgba(255, 255, 255, 0.5);
    font-size: 0.875rem;
    /* line-height: 1.625rem; */
  }

  #status {
    font-size: 0.75rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.8);
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  #status-dot {
    border-radius: 50%;
    width: 0.75rem;
    height: 0.75rem;
  }
</style>
