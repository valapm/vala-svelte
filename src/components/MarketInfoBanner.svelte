<script lang="ts">
  import type { notification } from "../utils/notifications"

  import { fade } from "svelte/transition"

  export let notification: notification
</script>

<div class="banner {notification.type}" transition:fade>
  <h1>{notification.title}</h1>
  <p>{notification.description}</p>
</div>

<style>
  .banner {
    padding: 0.8rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    border-radius: 0.375rem;
    font-size: 0.9rem;
  }

  .warning {
    border: 1px solid #ffa800;
    background-color: #ffa80010;
  }

  h1 {
    font-weight: 700;
  }
</style>
