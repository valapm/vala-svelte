<script>
  import { Chasing } from "svelte-loading-spinners"

  export let message
</script>

<div class="centered">
  <Chasing size="60" color="#1B3FBC" unit="px" />
  {#if message}
    <p>{message}</p>
  {/if}
</div>

<style>
  .centered {
    transform: translate(-50%, -50%);
    position: absolute;
    left: 50%;
    top: 50%;
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    align-items: center;
  }
</style>
