<script>
  import { fade } from "svelte/transition"
  import { push } from "svelte-spa-router"

  export let notification = {}

  async function handleClick() {
    const link = notification.link

    notification.remove()

    push(link)
  }
</script>

<button class="notification {notification.type}" on:click={handleClick} transition:fade={{ duration: 200 }}>
  <strong>{notification.text}</strong>
  <p>{@html notification.description || ""}</p>
</button>

<style>
  .notification {
    padding: 1rem;
    min-width: 15rem;
    background-color: #323841;
    border-radius: 0.375rem;
    color: white;
    max-width: 23rem;
    box-shadow: 0 0.25rem 1.5rem #00000040;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.3rem;
  }

  .notification :global(a) {
    text-decoration: underline;
  }

  .success {
    border: 1px solid #01a781;
  }

  .danger {
    border: 1px solid #ff0060;
  }
</style>
