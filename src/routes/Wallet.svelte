<script>
  import { address, seed, usdBalance } from "../store/wallet"
  import Qr from "../components/Qr.svelte"
</script>

<div class="container">
  {#if $seed}
    <div>Balance: ${$usdBalance}</div>
    <div>{$address.toString()}</div>
    <Qr value={$address.toString()} />
  {/if}
</div>
