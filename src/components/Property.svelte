<script>
  export let label
  export let centered = false
</script>

<div class="property">
  <label for="prop" style={centered ? "text-align: center;" : ""}>{label}</label>
  <div id="prop" style={centered ? "justify-content: center;" : ""}><slot /></div>
</div>

<style>
  .property {
    display: flex;
    flex-direction: column;
    width: 6rem;
    justify-content: space-between;
  }

  .property > div {
    font-weight: bold;
    display: flex;
    align-items: center;
  }

  label {
    font-size: var(--sl-font-size-small);
    color: var(--sl-color-gray-400);
  }
</style>
