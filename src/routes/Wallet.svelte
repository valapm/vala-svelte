<script>
  import { address, seed, usdBalance } from "../store/wallet"
  import { username } from "../store/profile"
  import WalletCard from "../components/WalletCard.svelte"
</script>

<div class="container">
  {#if $seed}
    <WalletCard address={$address.toString()} username={$username} />
    <div>Balance: ${$usdBalance}</div>
  {/if}
</div>

<style>
  .container {
    align-items: center;
  }
</style>
