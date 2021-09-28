<script>
  import { onMount } from "svelte"
  import { seed } from "../store/wallet"
  import { push } from "svelte-spa-router"
  import WaitlistSignup from "../components/WaitlistSignup.svelte"

  import SlButton from "@shoelace-style/shoelace/dist/components/button/button.js"
  import SlCard from "@shoelace-style/shoelace/dist/components/card/card.js"

  onMount(() => {
    if ($seed) push("#/markets")
  })
</script>

<main>
  <div class="header">
    <h1>Peer to Peer Prediction Markets</h1>

    <p>
      Vala is an open-source platform for traders and entrepreneurs to create and use decentralized betting markets. It
      lets you trade event derivates and earn by creating new markets or providing an Oracle service. It runs on an open
      protocol on Bitcoin SV.
    </p>
  </div>

  <WaitlistSignup />

  <!-- <div class="button-group">
  <a href="#/markets"><sl-button>Discover Forecasts</sl-button></a>
  <a href="#/register"><sl-button>Start Trading</sl-button></a>
  <a href="#/register"><sl-button>Create new Market</sl-button></a>
  <a href="#/register"><sl-button>Become an Oracle</sl-button></a>
</div> -->

  <div class="paragraphs">
    <sl-card>
      <p>Vala aggregates traders knowledge about future events, making it public and accessible to all.</p>
      <a href="#/markets"><sl-button type="primary">Discover Forecasts</sl-button></a>
    </sl-card>
    <sl-card>
      <p>Make money with your ability to predict the future by betting on event outcomes.</p>
      <a href="#/register"><sl-button type="primary">Start Trading</sl-button></a>
    </sl-card>
    <sl-card>
      <p>Vala is open source and runs on an open protocol on Bitcoin SV.</p>
      <a href="#/"><sl-button type="primary">Learn more</sl-button></a>
    </sl-card>
    <sl-card>
      <p>
        You can earn money by creating and managing markets. The more your markets get traded the higher your potential
        earnings!
      </p>
      <a href="#/register"><sl-button type="primary">Create new Market</sl-button></a>
    </sl-card>
    <sl-card>
      <p>Use Proof of Work to signal commitment in your reputation and earn money by helping to resolve markets</p>
      <a href="#/register"><sl-button type="primary">Become an Oracle</sl-button></a>
    </sl-card>
  </div>
</main>

<style>
  main {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6rem;
  }

  h1 {
    font-size: 3.5rem;
    font-weight: bold;
  }

  .header {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 5rem;
    gap: 4rem;
    text-align: center;
  }

  .header > p {
    width: min(95%, 40rem);
    font-size: 1.2rem;
  }

  .paragraphs {
    display: flex;
    gap: 3rem;
    justify-content: center;
    flex-wrap: wrap;
    align-items: stretch;
    width: min(95%, 75rem);
  }

  .paragraphs > sl-card {
    width: 20rem;
  }

  .paragraphs > sl-card::part(base) {
    height: 100%;
  }

  .paragraphs > sl-card::part(body) {
    display: flex;
    gap: 1rem;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    height: 100%;
  }
</style>
