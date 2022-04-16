<script>
  export let show = false
  export let position = "top: 0; left: 0;"
</script>

<div style="position: absolute; {position}">
  {#if show}
    <div class="modal-bg" on:click={() => (show = false)} />
  {/if}
  <div class="content" style="opacity: {show ? '100%' : '0%'}; pointer-events: {show ? 'auto' : 'none'};">
    <slot />
  </div>
</div>

<style>
  .content {
    z-index: 30;
    transition: opacity 0.3s ease;
    position: relative;
  }

  .modal-bg {
    position: fixed;
    width: 100vw;
    height: 100vh;
    z-index: 20;
    top: 0;
    left: 0;
  }
</style>
