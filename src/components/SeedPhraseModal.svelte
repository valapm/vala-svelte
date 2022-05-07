<script>
  import Modal from "./Modal.svelte"
  import { seed } from "../store/wallet"
  import Button from "./Button.svelte"

  export let open = false
</script>

<Modal bind:open>
  <div class="container">
    <h1>Recovery Seed</h1>
    <div class="seed">
      {#each $seed.split(" ") as word, index}
        <div class="word">{index + 1}. {word}</div>
      {/each}
    </div>
    <Button type="filled-grey" on:click={() => (open = false)}>Close</Button>
  </div>
</Modal>

<style>
  .container {
    padding: 1.7rem 2.8rem;
    color: white;
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .seed {
    background-color: #323841;
    border-radius: 0.375rem;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-around;
    max-width: 22.5rem;
    padding: 1rem;
  }

  .word {
    min-width: 10rem;
    padding: 0.5rem 1rem;
  }

  h1 {
    font-size: 2.125rem;
    font-weight: 700;
  }
</style>
