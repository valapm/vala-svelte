<script>
  import { onMount } from "svelte"
  import { fade } from "svelte/transition"

  export let notification = {}
</script>

<button class="notification {notification.type}" on:click={notification.remove} transition:fade={{ duration: 200 }}>
  <strong>{notification.text}</strong><br />
  {@html notification.description || ""}
</button>

<style>
  .notification {
    padding: 1rem;
    min-width: 15rem;
    background-color: #323841;
    border-radius: 0.375rem;
    color: white;
    box-shadow: 0 0.25rem 1.5rem #00000040;
  }

  .notification :global(a) {
    text-decoration: underline;
  }
</style>
