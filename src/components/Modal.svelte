<script>
  export let open = false
</script>

{#if open}
  <div class="modal-background" on:click={() => (open = false)} />
  <div class="modal">
    <slot />
  </div>
{/if}

<style>
  .modal-background {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.4);
    z-index: 9;
  }

  .modal {
    z-index: 10;
    color: black;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translateX(-50%) translateY(-50%);
    border-radius: 0.75rem;
    background: #32384150;
    box-shadow: 0 0.25rem 1.5rem #00000040;
    backdrop-filter: blur(0.4rem);
    max-width: 90%;
  }
</style>
