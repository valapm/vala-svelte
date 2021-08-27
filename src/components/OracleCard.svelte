<script lang="ts">
  import { round } from "../utils/format"

  import { price } from "../store/price"

  import HelpModal from "./HelpModal.svelte"
  import FaqOracles from "./FaqOracles.svelte"

  import SlCard from "@shoelace-style/shoelace/dist/components/card/card.js"
  import SlFormatNumber from "@shoelace-style/shoelace/dist/components/format-number/format-number"
  import SlIconButton from "@shoelace-style/shoelace/dist/components/icon/icon.js"

  export let market_oracles = []

  function getBurnedUSD(sats: number): number {
    return round((sats * $price) / 100000000)
  }
</script>

<sl-card>
  <div slot="header" class="header">Oracles <HelpModal label="FAQ: Oracles" content={FaqOracles} /></div>
  {#each market_oracles as market_oracle}
    <a href="#/oracle/{market_oracle.oracle.pubKey}">
      <h3>{market_oracle.oracle.name}</h3>
      <table>
        <tr>
          <th> Committed </th>
          <td>
            {#if market_oracle.committed}
              <sl-icon name="check-circle-fill" class="green" />
            {:else}
              <sl-icon name="x-circle-fill" class="red" />
            {/if}
          </td>
        </tr>
        <tr>
          <th> Burned </th>
          <td>
            <sl-format-number
              type="currency"
              currency="USD"
              value={getBurnedUSD(market_oracle.oracle.burnedSats)}
              locale="en-US"
            />
          </td>
        </tr>
      </table>
    </a>
  {/each}
</sl-card>

<style>
  .header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    justify-content: space-between;
  }

  h3 {
    font-size: 1.2rem;
    color: var(--sl-color-info-500);
  }

  th {
    text-align: left;
    font-weight: normal;
  }

  tr {
    text-align: right;
    font-weight: bold;
  }

  .green::part(base) {
    color: var(--sl-color-success-500);
  }

  .red::part(base) {
    color: var(--sl-color-danger-400);
  }
</style>
