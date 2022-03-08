<script>
  import Button from "./Button.svelte"
</script>

<div class="market">
  <h3>Create a new Market</h3>
  <a href="#/create"><Button type="filled wide">Create</Button></a>
</div>

<style>
  .market {
    background-color: #1f2329;
    width: 20.625rem;
    border-radius: 0.5625rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;
    padding: 2.5rem 1rem;
    text-align: center;
  }

  h3 {
    font-weight: 500;
    font-size: 20px;
  }
</style>
