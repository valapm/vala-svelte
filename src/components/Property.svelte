<script>
  export let label
  export let centered = true
</script>

<div class="property" style="align-items: {centered ? 'center' : 'left'}">
  <label for="prop">{label}</label>
  <div id="prop"><slot /></div>
</div>

<style>
  .property {
    display: flex;
    flex-direction: column;
    /* gap: 0.3rem; */
    justify-content: space-between;
    color: white;
    height: 3.5rem;
  }

  .property > div {
    display: flex;
    align-items: center;
    font-size: 1.25rem;
  }

  label {
    font-family: "Roboto Mono", sans-serif;
    font-size: 0.875rem;
    opacity: 50%;
    font-weight: 700;
  }
</style>
