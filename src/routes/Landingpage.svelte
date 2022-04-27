<script>
  import { onMount } from "svelte"
  import { seed } from "../store/wallet"
  import { push } from "svelte-spa-router"
  import { fade } from "svelte/transition"

  import { query } from "svelte-apollo"
  import { gql } from "@apollo/client/core"

  import WaitlistSignup from "../components/WaitlistSignup.svelte"
  import LandingpageLogo from "../components/LandingpageLogo.svelte"

  import SlButton from "@shoelace-style/shoelace/dist/components/button/button.js"
  import SlCard from "@shoelace-style/shoelace/dist/components/card/card.js"

  const testQuery = query(gql`
    query {
      market {
        market_state {
          state {
            transactionTxid
          }
          balanceMerkleRoot
          shares
        }
      }
    }
  `)

  $: console.log($testQuery)

  onMount(() => {
    if ($seed) push("#/markets")
  })
</script>

<main in:fade={{ duration: 300 }} out:fade={{ duration: 0 }}>
  <div class="header">
    <div class="title">
      <h1>Bitcoin’s First <br />Peer to Peer <br />Prediction Market</h1>

      <p>Bet on anything you can imagine using Bitcoin SV.</p>
      <WaitlistSignup />
    </div>
    <LandingpageLogo />
  </div>

  <!-- <div class="paragraphs">
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
  </div> -->
</main>

<style>
  main {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6rem;
    width: min(65rem, 95%);
  }

  h1 {
    font-size: 3.125rem;
    font-weight: bold;
  }

  .banner {
    display: flex;
    align-items: center;
  }

  .header {
    width: 100%;
    display: flex;
    gap: 1rem;
    position: relative;
    flex-wrap: wrap-reverse;
    justify-content: center;
  }

  .title {
    justify-content: center;
    gap: 4rem;
    text-align: left;
    display: flex;
    flex-direction: column;
    gap: 3.375rem;
    flex-shrink: 0;
    white-space: nowrap;
  }

  .title > p {
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
