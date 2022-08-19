<script>
  import { seed, publicKey, username } from "../store/wallet"
  import WalletCard from "../components/WalletCard.svelte"
  import { pm, lmsr } from "bitcoin-predict"
  import { price } from "../store/price"
  import { round } from "../utils/format"
  import { push } from "svelte-spa-router"

  import { gql } from "@apollo/client/core"
  import { query } from "svelte-apollo"

  import SendBsvModal from "../components/SendBsvModal.svelte"
  import Button from "../components/Button.svelte"
  import ReceiveBsvModal from "../components/ReceiveBsvModal.svelte"
  import Markets from "../components/Markets.svelte"
  import SubHeader from "../components/SubHeader.svelte"
  import Table from "../components/Table.svelte"
  import MarketStatus from "../components/MarketStatus.svelte"

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
            market_oracles {
              committed
            }
            market {
              marketStateByFirststateid {
                state {
                  transactionTxid
                }
              }
              resolve
              options {
                name
              }
            }
          }
        }
      }
    `
  const entries = query(entryQuery)

  function getMarketStatus(entry) {
    return entry.market_state.market.decided ? 2 : entry.market_state.market_oracles[0].committed ? 1 : 0
  }

  $: satPositions = $entries.data
    ? $entries.data.entry.map(entry => {
        const stateBalance = lmsr.getLmsrSats(entry.market_state)

        const sharesArray = entry.shares.reduce((sharesArray, shares, shareIndex) => {
          if (!entry.market_state.decided) {
            const changedBalance = {
              liquidity: entry.market_state.liquidity,
              shares: entry.market_state.shares.map((marketShares, index) =>
                index === shareIndex ? marketShares - shares : marketShares
              )
            }
            sharesArray.push(stateBalance - lmsr.getLmsrSats(changedBalance))
            return sharesArray
          }

          if (entry.market_state.decision === shareIndex) {
            sharesArray.push(shares * lmsr.SatScaling)
            return sharesArray
          }

          sharesArray.push(0)
          return sharesArray
        }, [])

        return sharesArray
      })
    : []

  $: console.log("satPositions", satPositions)

  $: liquiditySats = $entries.data
    ? $entries.data.entry.map(entry => {
        const changedBalance = {
          liquidity: entry.market_state.liquidity - entry.liquidity,
          shares: entry.market_state.shares
        }
        return lmsr.getLmsrSats(entry.market_state) - lmsr.getLmsrSats(changedBalance)
      })
    : []

  $: usdLiquidity = ($price * liquiditySats.reduce((total, sats) => total + sats, 0)) / 100000000
  $: usdPositions =
    ($price *
      satPositions.reduce((total, shares) => total + shares.reduce((totalSats, sats) => totalSats + sats, 0), 0)) /
    100000000

  let selected = 0
</script>

<SubHeader>
  <button class={selected === 0 ? "selected" : ""} on:click={() => (selected = 0)}>Wallet</button>
  <button class={selected === 1 ? "selected" : ""} on:click={() => (selected = 1)}>Positions</button>
  <!-- <button class={selected === 2 ? "selected" : ""} on:click={() => (selected = 2)}>History</button> -->
</SubHeader>

<div class="container">
  {#if $seed}
    {#if selected === 0}
      <h1>
        <div class="label">Wallet ID</div>
        {$username}
      </h1>

      <div class="card">
        <WalletCard />

        <div class="wallet-buttons">
          <Button type="filled-grey full-width" on:click={() => (showReceiveModal = true)}>Receive BSV</Button>
          <Button type="filled-green full-width" on:click={() => (showSendModal = true)}>Send BSV</Button>
        </div>
      </div>

      <ReceiveBsvModal bind:open={showReceiveModal} />
      <SendBsvModal bind:open={showSendModal} />
    {:else if selected === 1}
      {#if $entries.data}
        {#if usdLiquidity === 0 && usdPositions === 0}
          <p class="nothing_found">Nothing here yet. Go make some bets!</p>
        {:else}
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

          <Table>
            <thead>
              <tr>
                <th>Market</th>
                <th />
                <th>Option</th>
                <th>Amount</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {#each $entries.data.entry as entry, entryIndex}
                {#each entry.shares as shares, shareIndex}
                  {#if shares > 0}
                    <tr
                      on:click={() =>
                        push("/market/" + entry.market_state.market.marketStateByFirststateid.state.transactionTxid)}
                    >
                      <td>{entry.market_state.market.resolve}</td>

                      <td><MarketStatus status={getMarketStatus(entry)} label={false} /></td>
                      <td>{entry.market_state.market.options[shareIndex].name}</td>
                      <td>{shares}</td>
                      <td
                        ><b>${Math.round(((satPositions[entryIndex][shareIndex] * $price) / 100000000) * 100) / 100}</b
                        ></td
                      >
                    </tr>
                  {/if}
                {/each}
                {#if entry.liquidity > 0}
                  <tr
                    on:click={() =>
                      push("/market/" + entry.market_state.market.marketStateByFirststateid.state.transactionTxid)}
                  >
                    <td>{entry.market_state.market.resolve}</td>

                    <td><MarketStatus status={getMarketStatus(entry)} label={false} /></td>
                    <td>Liquidity</td>
                    <td>{entry.liquidity}</td>
                    <td><b>${Math.round(((liquiditySats[entryIndex] * $price) / 100000000) * 100) / 100}</b></td>
                  </tr>
                {/if}
              {/each}
            </tbody>
          </Table>
        {/if}
      {/if}
    {/if}
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
    width: 12rem;
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

  td:nth-of-type(4),
  td:nth-of-type(5),
  th:nth-of-type(4),
  th:nth-of-type(5) {
    text-align: right;
  }
  tbody tr {
    cursor: pointer;
  }

  tbody tr:hover {
    background-color: #434c56;
  }

  .nothing_found {
    font-size: 2rem;
    opacity: 60%;
    font-weight: 700;
  }

  h1 {
    font-size: 2rem;
    color: #d8d9e5;
    font-weight: 500;
  }

  .label {
    font-size: 1rem;
    font-weight: 400;
    color: white;
    opacity: 50%;
  }
</style>
