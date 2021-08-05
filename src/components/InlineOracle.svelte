<script>
  import { price } from "../store/price"

  export let oracle

  $: burnedUSD = ($price * oracle.burnedSats) / 100000000
</script>

<a href="#/oracle/{oracle.pubKey}" class="oracle">
  <h2>{oracle.name}</h2>
  <h3>Burned</h3>
  <p>${Math.round(burnedUSD * 100) / 100}</p>
</a>

<style>
  .oracle {
    padding: 1rem;
    background-color: white;
    border: 1px solid grey;
  }

  h2 {
    font-size: 1.3rem;
  }

  h3 {
    font-size: 1.1rem;
  }
</style>
