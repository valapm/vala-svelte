<script>
  import { address, seed, usdBalance, publicKey } from "../store/wallet"
  import { username } from "../store/profile"
  import WalletCard from "../components/WalletCard.svelte"
  import { gql } from "graphql-request"
  import { gqlClient } from "../utils/graphql"
  import { pm, lmsr } from "bitcoin-predict"
  import { price } from "../store/price"
  import { round } from "../utils/format"

  import SendBsvModal from "../components/SendBsvModal.svelte"

  import SlFormatNumber from "@shoelace-style/shoelace/dist/components/format-number/format-number"
  import SlButton from "@shoelace-style/shoelace/dist/components/button/button"

  let payment_modal

  $: entryQuery = gql`
      {
        entry(where: { _not: { market_state: {market_states: {}} }, investorPubKey: { _eq: "${$publicKey.toString()}"}}) {
          liquidity
          shares
          market_state {
            liquidity
            shares
          }
        }
      }
    `

  $: if ($publicKey) getPositions()

  let satPositions = 0
  $: usdPositions = ($price * satPositions) / 100000000
  $: totalAssets = usdPositions + $usdBalance

  async function getPositions() {
    console.log("test")
    const res = await gqlClient.request(entryQuery)

    let sats = 0
    for (const entry of res.entry) {
      const changedBalance = {
        liquidity: entry.market_state.liquidity - entry.liquidity,
        shares: entry.market_state.shares.map((shares, index) => shares - entry.shares[index])
      }

      const satChange = lmsr.getLmsrSats(entry.market_state) - lmsr.getLmsrSats(changedBalance)
      sats += satChange
    }
    satPositions = sats
  }
</script>

<div class="container">
  {#if $seed}
    <WalletCard address={$address.toString()} username={$username} />

    <div class="wallet-buttons">
      <sl-button type="primary" on:click={() => payment_modal.show()}>Send BSV</sl-button>
    </div>

    <SendBsvModal bind:this={payment_modal} />

    <div class="balances">
      <div>
        <label for="usdBalance">Wallet Balance</label>
        <div name="usdBalance">
          <sl-format-number type="currency" currency="USD" value={$usdBalance} locale="en-US" />
        </div>
      </div>

      <div>
        <label for="usdPositions">Positions</label>
        <div name="usdPositions">
          <sl-format-number type="currency" currency="USD" value={usdPositions} locale="en-US" />
        </div>
      </div>

      <div>
        <label for="totalAssets">Total Assets</label>
        <div name="totalAssets">
          <sl-format-number type="currency" currency="USD" value={totalAssets} locale="en-US" />
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .container {
    align-items: center;
    gap: 3rem;
    margin-bottom: 5rem;
    width: min(65rem, 95%);
  }

  .balances {
    display: flex;
    justify-content: center;
    gap: 3rem;
    flex-wrap: wrap;
  }

  .balances label {
    font-weight: bold;
    color: var(--sl-color-gray-400);
  }
  .balances sl-format-number {
    font-weight: bold;
    font-size: 2rem;
  }

  .balances > div {
    display: flex;
    flex-direction: column;
  }

  .wallet-buttons {
    display: flex;
    justify-content: center;
  }
</style>
