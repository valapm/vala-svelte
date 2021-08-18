<script>
  import { onMount } from "svelte"

  import SlAlert from "@shoelace-style/shoelace/dist/components/alert/alert"

  export let notification = {}
  export let onRemove = null

  let alert

  const handleButtonClick = () => {
    onRemove()
  }
</script>

<sl-alert
  class="notification"
  type={notification.type}
  duration="3000"
  bind:this={alert}
  open="true"
  on:hide={handleButtonClick}
  closable
>
  <sl-icon slot="icon" name="exclamation-octagon" />
  <strong>{notification.text}</strong><br />
  {@html notification.description}
</sl-alert>

<style>
  sl-alert {
    margin: 1rem;
  }

  .notification :global(a) {
    text-decoration: underline;
  }
</style>
