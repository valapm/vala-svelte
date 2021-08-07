<script>
  import { address, seed, usdBalance } from "../store/wallet"
  import Qr from "../components/Qr.svelte"
  import Header from "../components/Header.svelte"
</script>

<Header />

<div class="container">
  {#if $seed}
    <div>Balance: ${$usdBalance}</div>
    <div>{$address.toString()}</div>
    <Qr value={$address.toString()} />
  {/if}
</div>
