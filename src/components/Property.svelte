<script>
  export let label
</script>

<div class="property">
  <label for="prop">{label}</label>
  <div style="font-weight: bold;" id="prop"><slot /></div>
</div>

<style>
  .property {
    display: flex;
    flex-direction: column;
    width: 6rem;
    justify-content: space-between;
  }

  label {
    font-size: var(--sl-font-size-small);
    color: var(--sl-color-gray-400);
  }
</style>
