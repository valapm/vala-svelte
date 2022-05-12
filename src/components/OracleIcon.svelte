<script>
  import { parseHostname } from "../utils/url"
  import { backendHost } from "../config"

  export let oracle

  let icon

  $: hostname = parseHostname(oracle.oracleStateByCurrentstateid.domain)
</script>

<div class="image">
  <img
    src="{backendHost}/static/{hostname}.{oracle.iconType}"
    alt="icon"
    bind:this={icon}
    on:error={() => (icon.style.display = "none")}
  />
</div>

<style>
  img {
    height: auto;
    padding: 0.3rem;
  }

  .image {
    border-radius: 10rem;
    overflow: hidden;
    max-width: 3rem;
    max-height: 3rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
