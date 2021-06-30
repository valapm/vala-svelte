<script>
  import { address, seed, usdBalance } from "../store/wallet"
  import Qr from "../components/Qr.svelte"
  import Header from "../components/Header.svelte"
</script>

<Header />

{#if $seed}
  $ {$usdBalance}
  <Qr value={$address.toString()} />
{/if}
