<script>
  import { lmsr } from "bitcoin-predict"
  import { price } from "../store/price"
  import { onMount } from "svelte"
  import { testnet } from "../store/options"
  // import { navigateTo } from 'svelte-spa-router'

  import SlCard from "@shoelace-style/shoelace/dist/components/card/card.js"
  import SlFormatNumber from "@shoelace-style/shoelace/dist/components/format-number/format-number"
  import SlProgressBar from "@shoelace-style/shoelace/dist/components/progress-bar/progress-bar"
  import SlButton from "@shoelace-style/shoelace/dist/components/button/button.js"

  import Property from "../components/Property.svelte"

  export let market

  $: balance = {
    shares: market.market_state.shares,
    liquidity: market.market_state.liquidity
  }

  $: txid = market.marketStateByFirststateid.transaction.txid

  $: shares = market.market_state.shares.map((share, index) => {
    const newShares = [...market.market_state.shares]
    newShares[index] += 1

    const satPrice =
      lmsr.getLmsrSats({
        shares: newShares,
        liquidity: market.market_state.liquidity
      }) - lmsr.getLmsrSats(balance)

    const usdPrice = round((satPrice / 100000000) * $price)

    const probability = market.market_state.decided
      ? market.market_state.decision === index
        ? 1
        : 0
      : lmsr.getProbability(balance, share)

    return {
      usdPrice,
      probability
    }
  })

  $: bsvTotal = market.market_state.satoshis / 100000000
  $: usdTotal = bsvTotal * $price
  $: bsvLiquidity =
    lmsr.getLmsrSats({ liquidity: balance.liquidity, shares: new Array(market.options.length).fill(0) }) / 100000000
  $: usdLiquidity = bsvLiquidity * $price

  $: status = market.market_state.decided ? "Resolved" : "Open"

  function round(n) {
    return Math.round(n * 100) / 100
  }
</script>

<div style="width: 100%">
  <a href="#/market/{txid}">
    <sl-card style="width: 100%">
      <div style="font-weight: bold;" slot="header">
        {market.resolve}
      </div>
      <div class="properties">
        <Property label="Status">
          {status}
        </Property>
        {#if !market.market_state.decided}
          <Property label="Volume">
            <sl-format-number
              id="{txid}-liquidity"
              type="currency"
              currency="USD"
              value={round(usdTotal)}
              locale="en-US"
            />
          </Property>
          <Property label="Liquitidy">
            <sl-format-number
              id="{txid}-liquidity"
              type="currency"
              currency="USD"
              value={round(usdLiquidity)}
              locale="en-US"
            />
          </Property>
        {/if}

        <Property label="Oracle">
          {market.market_oracles_oracles[0].oracle.name}
        </Property>
      </div>

      <table class="options" slot="footer">
        {#each market.options as option, index}
          <tr class="option">
            <th>{option.name}</th>
            <td
              ><sl-progress-bar
                id="option-{txid}-{index}"
                class={market.market_state.decided ? (market.market_state.decision === index ? "won" : "") : ""}
                type="success"
                percentage={shares[index].probability * 100}
                >{Math.round(shares[index].probability * 100)}%</sl-progress-bar
              ></td
            >
          </tr>
        {/each}
      </table>
    </sl-card>
  </a>
  <a href={`https://${$testnet ? "test." : ""}whatsonchain.com/tx/${txid}`} class="txid">{txid.slice(0, 20)}...</a>
</div>

<style>
  .properties {
    display: flex;
    gap: 1.5rem;
  }

  .txid {
    font-size: var(--sl-font-size-x-small);
    color: var(--sl-color-gray-400);
    margin: 0.2rem;
  }

  .options {
    width: 100%;
  }

  .option th {
    font-size: var(--sl-font-size-small);
    font-weight: bold;
    text-align: left;
    max-width: 0.8rem;
  }

  .won {
    --indicator-color: var(--sl-color-success-500);
  }
</style>
