<script>
  import { address, seed, usdBalance, publicKey } from "../store/wallet"
  import { username } from "../store/profile"
  import WalletCard from "../components/WalletCard.svelte"
  import { pm, lmsr } from "bitcoin-predict"
  import { price } from "../store/price"
  import { round } from "../utils/format"

  import { gql } from "@apollo/client/core"
  import { query } from "svelte-apollo"

  import SendBsvModal from "../components/SendBsvModal.svelte"
  import Button from "../components/Button.svelte"
  import ReceiveBsvModal from "../components/ReceiveBsvModal.svelte"

  let showReceiveModal = false
  let showSendModal = false

  const entryQuery = gql`
      query {
        entry(where: { _not: { market_state: {state: {states: {}}}}, investorPubKey: { _eq: "${$publicKey.toString()}"}}) {
          liquidity
          shares
          market_state {
            liquidity
            shares
            decided
            decision
          }
        }
      }
    `
  const entries = query(entryQuery)

  $: satPositions = entries.data
    ? entries.data.reduce((sats, entry) => {
        if (entry.market_state.decided) {
          return sats + entry.shares[entry.market_state.decision] * lmsr.SatScaling
        } else {
          const changedBalance = {
            liquidity: entry.market_state.liquidity,
            shares: entry.market_state.shares.map((shares, index) => shares - entry.shares[index])
          }
          return sats + lmsr.getLmsrSats(entry.market_state) - lmsr.getLmsrSats(changedBalance)
        }
      })
    : 0

  $: liquiditySats = entries.data
    ? entries.data.reduce((sats, entry) => {
        const changedBalance = {
          liquidity: 0,
          shares: entry.market_state.shares
        }
        return sats + lmsr.getLmsrSats(entry.market_state) - lmsr.getLmsrSats(changedBalance)
      })
    : 0

  $: usdLiquidity = ($price * liquiditySats) / 100000000
  $: usdPositions = ($price * satPositions) / 100000000
  $: totalAssets = usdPositions + $usdBalance + usdLiquidity
</script>

<div class="container">
  {#if $seed}
    <div class="card">
      <WalletCard address={$address.toString()} username={$username} />

      <div class="wallet-buttons">
        <Button type="filled-grey full-width" on:click={() => (showReceiveModal = true)}>Receive BSV</Button>
        <Button type="filled-green full-width" on:click={() => (showSendModal = true)}>Send BSV</Button>
      </div>
    </div>

    <ReceiveBsvModal bind:open={showReceiveModal} />
    <SendBsvModal bind:open={showSendModal} />

    <div class="balances">
      <!-- <div>
        <label for="usdBalance">Wallet Balance</label>
        <div name="usdBalance">
          ${Math.round($usdBalance * 100) / 100}
        </div>
      </div> -->

      <div>
        <label for="usdPositions">Positions</label>
        <div name="usdPositions">
          ${Math.round(usdPositions * 100) / 100}
        </div>
      </div>

      <div>
        <label for="usdPositions">Provided Liquidity</label>
        <div name="usdLiquidity">
          ${Math.round(usdLiquidity * 100) / 100}
        </div>
      </div>

      <!-- <div>
        <label for="totalAssets">Total Assets</label>
        <div name="totalAssets">
          ${Math.round(totalAssets * 100) / 100}
        </div>
      </div> -->
    </div>
  {/if}
</div>

<style>
  .container {
    align-items: center;
    gap: 3rem;
    margin-bottom: 5rem;
    width: min(65rem, 95%);
    margin-top: 6.5rem;
  }

  .balances {
    display: flex;
    justify-content: center;
    gap: 3rem;
    flex-wrap: wrap;
  }

  .balances label {
    font-weight: bold;
  }
  .balances > div {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .balances > div > div {
    font-size: 2rem;
  }

  .wallet-buttons {
    display: flex;
    justify-content: space-between;
    /* width: min(21rem, 90%); */
    width: 100%;
    gap: 1rem;
  }

  .card {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: min(21rem, 90%);
  }
</style>
