<script>
  import { lmsr } from "bitcoin-predict"
  import { createEventDispatcher } from "svelte"

  const dispatch = createEventDispatcher()

  export let market
  export let option
  export let selected = false

  let marketBalance = {
    shares: market.market_state.shares,
    liquidity: market.market_state.liquidity
  }
  let probability = lmsr.getProbability(marketBalance, marketBalance.shares[option])
</script>

<button class={selected ? "selected" : ""} on:click={() => dispatch("click")}>
  <div class="content">
    <h3>{market.options[option].name}</h3>
    <div>{Math.round(probability * 100)}%</div>
  </div>
  <div class="gradient" style="width: {probability * 100}%;" />
</button>

<style>
  button {
    width: 100%;
    padding: 0.8rem 1.125rem;
    background-color: #323841;
    border-radius: 0.375rem;
    position: relative;
    overflow: hidden;
    z-index: 0;
    border: 1px solid #323841;
    transition: all 0.15s ease-in-out;
  }

  .content {
    display: flex;
    justify-content: space-between;
    cursor: pointer;
    width: 100%;
    z-index: 1;
  }

  h3 {
    font-weight: 700;
  }

  .gradient {
    position: absolute;
    left: 0;
    top: 0;
    height: 5.875rem;
    background: linear-gradient(180deg, #434c56 7.81%, rgba(67, 76, 86, 0) 100%);
    z-index: -1;
  }

  .selected {
    border-color: #ffa800;
    box-shadow: 0 0 1.125rem #ffa80080;
  }

  .content > div {
    font-size: 0.875rem;
    font-family: "Roboto Mono", sans-serif;
    font-weight: 700;
    opacity: 50%;
  }
</style>
