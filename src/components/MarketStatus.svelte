<script>
  export let status // 0-2

  export let label = true

  const labels = ["Unpublished", "Live Market", "Resolved"]

  const colors = ["#6CD4FF", "#00FFC5", "rgba(255, 255, 255, 0.5)"]
</script>

<div class="status">
  {#if label}
    <div class="label">{labels[status]}</div>
  {/if}
  <div class="dot" style="background-color: {colors[status]};" />
</div>

<style>
  .status {
    display: flex;
    align-items: center;
    gap: 0.625rem;
  }
  .label {
    font-size: 0.75rem;
    opacity: 50%;
    font-weight: 500;
  }

  .dot {
    border-radius: 50%;
    width: 0.6875rem;
    height: 0.6875rem;
    flex-shrink: 0;
  }
</style>
