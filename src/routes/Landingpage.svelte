<script>
  import { onMount } from "svelte"
  import { seed } from "../store/wallet"
  import { push } from "svelte-spa-router"
  import { fade } from "svelte/transition"

  import WaitlistSignup from "../components/WaitlistSignup.svelte"
  import LandingpageLogo from "../components/LandingpageLogo.svelte"
  import Button from "../components/Button.svelte"
  import BsvCricle from "../icons/BsvCircle.svelte"
  import Coins from "../icons/Coins.svelte"
  import Earth from "../icons/Earth.svelte"
  import Gas from "../icons/Gas.svelte"
  import Graphs from "../icons/Graphs.svelte"
  import Markets from "../components/Markets.svelte"

  onMount(() => {
    if ($seed) push("#/markets")
  })
</script>

<main>
  <div class="header">
    <div class="title">
      <h1>Peer to Peer <br />Prediction Markets <br />on Bitcoin</h1>

      <p>Start trading Event Derivatives on-chain</p>
      <WaitlistSignup />
    </div>
    <LandingpageLogo />
  </div>

  <div class="section">
    <Markets searchBar={false} limit={6} />
    <Button type="filled" on:click={() => push("/markets")}>View All Markets</Button>
  </div>

  <div class="section how">
    <h2>How it Works</h2>
    <p>
      Vala is an open-source platform for peer-to-peer betting markets. It lets you trade event derivates and earn
      Bitcoin by creating your own markets or providing liquidity. All markets and trades exist on an open protocol on
      Bitcoin SV.
    </p>
    <div class="paragraphs">
      <div>
        <Earth />
        <p>Vala aggregates traders knowledge about future events, making it public and accessible to all.</p>
      </div>
      <div>
        <Coins />
        <p>Make money with your ability to predict the future by trading event derivatives.</p>
      </div>
      <div>
        <Graphs />
        <p>Become an Oracle, create and manage new markets and earn money for every trade.</p>
      </div>
      <div>
        <BsvCricle />
        <p>Vala is open source and runs on an open protocol on Bitcoin SV.</p>
      </div>
      <div>
        <Gas />
        <p>Earn Bitcoin for providing liquidity to running markets.</p>
      </div>
    </div>
    <Button type="filled" on:click={() => push("/faq")}>Read the FAQ</Button>
  </div>
</main>

<style>
  main {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10rem;
    width: min(65rem, 95%);
  }

  h1 {
    font-size: 3.125rem;
    font-weight: bold;
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
    gap: 2rem;
    justify-content: center;
    flex-wrap: wrap;
    width: min(95%, 75rem);
  }

  .paragraphs > div {
    width: 18rem;
    display: flex;
    gap: 0.75rem;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    height: 100%;
    background-color: #1f2329;
    border-radius: 0.375rem;
    padding: 1rem;
    text-align: center;
  }

  .paragraphs p {
    font-weight: 500;
  }

  .paragraphs :global(svg) {
    height: 3rem;
    width: auto;
  }

  .section {
    display: flex;
    flex-direction: column;
    gap: 3rem;
    width: 100%;
    align-items: center;
  }

  .how {
    text-align: center;
  }

  .how h2 {
    font-size: 2.375rem;
    font-weight: 700;
  }

  .how p {
    opacity: 70%;
    font-weight: 500;
    max-width: 44rem;
  }
</style>
