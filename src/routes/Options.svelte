<script>
  import { testnet } from "../store/options"
</script>

<div class="options">
  <div>
    <input type="checkbox" bind:checked={$testnet} />Use Testnet
  </div>
</div>

<style>
  .options {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  input {
    margin-right: 0.3rem;
  }
</style>
