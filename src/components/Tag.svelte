<script>
  import { sha } from "bitcoin-predict"
  import { Buffer } from "buffer"

  export let name

  $: color = "#" + sha.sha256(Buffer.from(name).toString("hex")).slice(0, 6)
</script>

<div style="color: {color}; border: 1px solid {color}">
  {name}
</div>

<style>
  div {
    font-size: 0.625rem;
    font-weight: 500;
    border-radius: 500px;
    display: flex;
    align-items: center;
    padding: 0.1875rem 0.78125rem;
  }
</style>
