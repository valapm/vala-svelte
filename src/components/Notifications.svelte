<script>
  import { notifications } from "../store/notifications"
  import { flip } from "svelte/animate"

  import Notification from "./Notification.svelte"
</script>

<div class="notifications">
  {#each Object.entries($notifications) as [key, notification] (key)}
    <div animate:flip>
      <Notification {notification} />
    </div>
  {/each}
</div>

<style>
  .notifications {
    position: fixed;
    top: 6rem;
    right: 1rem;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 1rem;
    z-index: 10;
  }
</style>
