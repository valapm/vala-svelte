<script>
  import { createEventDispatcher } from "svelte"
  import { price } from "../store/price"
  import { round } from "../utils/format"
  import { lmsr } from "bitcoin-predict"

  import Table from "../components/Table.svelte"
  import Modal from "../components/Modal.svelte"
  import Button from "../components/Button.svelte"
  import OutcomeSelect from "./OutcomeSelect.svelte"

  const dispatch = createEventDispatcher()

  export let loading
  export let market

  let selectOption = false
  let selectedOption = market.market_state.shares.indexOf(Math.max(...market.market_state.shares))

  $: redeemInvalid =
    market.market_state.decided &&
    market.market_state.shares.reduce((a, b, i) => (i === market.market_state.decision ? a : a + b)) > 0

  $: redeemInvalidSats = redeemInvalid
    ? lmsr.getLmsrSats(market.market_state) -
      lmsr.getLmsrSats({
        liquidity: market.market_state.liquidity,
        shares: market.market_state.shares.map((a, i) => (i === market.market_state.decision ? a : 0))
      })
    : 0

  $: redeemInvalidUSD = (redeemInvalidSats * $price) / 100000000

  function resolve() {
    selectOption = false
    dispatch("resolve", { option: selectedOption })
  }
</script>

<div class="card">
  <Table>
    <div>
      <div class="label">Total Fee Earnings</div>
      <div><b>${round((market.market_state.creatorSatEarnings * $price) / 100000000)}</b></div>
    </div>
  </Table>
  {#if !market.market_state.decided}
    <Button type="filled-blue full-width" on:click={() => (selectOption = true)} {loading}>Resolve Market</Button>
  {:else if redeemInvalidSats}
    <Button type="filled-blue full-width" on:click={() => dispatch("redeemInvalid")} {loading}>
      Redeem Invalid Shares ${Math.round(redeemInvalidUSD * 100) / 100}
    </Button>
  {/if}
  <Modal bind:open={selectOption}>
    <div class="modal">
      <h1>Resolve Market</h1>
      <p>Select the Market Outcome</p>
      <div class="outcomes">
        {#each market.options as option, index}
          <OutcomeSelect
            {market}
            option={index}
            on:click={() => (selectedOption = index)}
            selected={selectedOption === index}
          />
        {/each}
      </div>
      <div class="buttons">
        <Button type="filled-grey full-width" on:click={() => (selectOption = false)}>Cancel</Button>
        <Button type="filled-yellow full-width" on:click={resolve}>Resolve</Button>
      </div>
    </div>
  </Modal>
</div>

<style>
  .card {
    background-color: #323841;
    border-radius: 0.376rem;
    padding: 1.125rem;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    align-items: center;
  }

  .modal {
    display: flex;
    flex-direction: column;
    gap: 1.125rem;
    padding: 2.375rem;
    align-items: center;
    color: #ffffff;
    width: 24rem;
    max-width: 100%;
  }

  h1 {
    font-size: 2.125rem;
    font-weight: 700;
  }

  p {
    font-size: 1rem;
  }

  .buttons {
    margin-top: 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    gap: 1rem;
  }

  .outcomes {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
</style>
