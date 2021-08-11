<script>
  import { onMount } from "svelte"

  import SlIcon from "@shoelace-style/shoelace/dist/components/icon/icon"

  export let number = 1
  export let min = 1
  export let max

  function increase() {
    if (max === undefined || number < max) number += 1
  }

  function decrease() {
    if (number > min) number -= 1
  }

  function validateNumber() {
    if (number > max) number = max
    if (number < min) number = min
  }

  $: validateNumber() && min && max && number
</script>

<div class="counter">
  <span class="input-number-decrement" on:click={decrease}><sl-icon name="dash" /></span>
  <input class="input-number" type="number" {min} {max} bind:value={number} />
  <span class="input-number-increment" on:click={increase}><sl-icon name="plus" /></span>
</div>

<style>
  sl-icon {
    font-size: 1.3rem;
  }

  * {
    box-sizing: border-box;
  }

  .counter {
    display: flex;
  }

  .input-number {
    width: 10rem;
    flex-grow: 1;
    vertical-align: top;
    text-align: center;
    outline: none;
    font-family: var(--sl-input-font-family);
    letter-spacing: var(--sl-input-letter-spacing);
    color: var(--sl-input-color);
  }

  .input-number-decrement:hover,
  .input-number-increment:hover {
    background: var(--sl-color-gray-200);
    transition: var(--sl-transition-fast) background-color;
  }

  .input-number,
  .input-number-decrement,
  .input-number-increment {
    border: solid var(--sl-input-border-width) var(--sl-input-border-color);
    height: var(--sl-input-height-medium);
    user-select: none;
  }

  .input-number-decrement,
  .input-number-increment {
    flex-shrink: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    width: var(--sl-input-height-medium);
    background: var(--sl-color-gray-100);
    cursor: pointer;
  }
  .input-number-decrement:active,
  .input-number-increment:active {
    background: var(--sl-color-gray-300);
  }

  .input-number-decrement {
    border-right: none;
    border-radius: var(--sl-input-border-radius-medium) 0 0 var(--sl-input-border-radius-medium);
  }

  .input-number-increment {
    border-left: none;
    border-radius: 0 var(--sl-input-border-radius-medium) var(--sl-input-border-radius-medium) 0;
  }

  input::-webkit-inner-spin-button,
  input::-webkit-outer-spin-button {
    -webkit-appearance: none !important;
    margin: 0 !important;
  }

  input {
    -moz-appearance: textfield !important;
  }
</style>
