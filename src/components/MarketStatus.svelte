<script>
  export let status // 0-2

  const labels = ["Unconfirmed", "Live Market", "Resolved"]

  const colors = ["#FAFF00", "#00FFC5", "#FF2E00"]
</script>

<div class="status">
  <div class="label">{labels[status]}</div>
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
  }
</style>
