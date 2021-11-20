<script>
  import { getCreationDate } from "../utils/pm"

  export let market

  $: status = market && market.market_state.decided ? "Resolved" : "Live"
  $: creationDate =
    market && getCreationDate(market).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })
  $: marketOracle = market.market_state.market_oracles[0]
  $: oracleId = marketOracle.oracle.oracleStateByCurrentstateid
    ? marketOracle.oracle.oracleStateByCurrentstateid.domain
    : "????"
</script>

<div id="title">
  <div id="oracle">{oracleId}</div>
  <h1>{market.resolve}</h1>
  <div id="subheader">
    <div id="market-dates">Created: {creationDate}</div>
    <div id="status">
      <div id="status-dot" style="background-color: {status === 'Live' ? '#00FFC5' : 'rgba(255, 255, 255, 0.5)'};" />
      <div>{status}</div>
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

  #oracle {
    font-size: 0.75rem;
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
