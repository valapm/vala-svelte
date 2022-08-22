<script lang="ts">
  import { onMount } from "svelte"
  import { seed } from "../store/wallet"
  import { push } from "svelte-spa-router"

  import WalletCreation from "../components/WalletCreation.svelte"
  import BigCard from "../components/BigCard.svelte"

  function initAuth() {
    console.debug("vala-auth loaded")
  }

  onMount(() => {
    if ($seed) push("/")
  })
</script>

<svelte:head>
  <script src="/includes/valaauth.min.js" on:load={initAuth}></script>
</svelte:head>

<div class="login">
  <BigCard>
    <WalletCreation recover={true} />
  </BigCard>
</div>

<style>
  .login {
    display: flex;
    flex-direction: column;
    margin-top: 10rem;
    gap: 2rem;
    align-items: center;
    width: min(30rem, 95%);
  }

  @media screen and (max-width: 425px) {
    .login {
      margin-top: 5rem;
    }
  }
</style>
