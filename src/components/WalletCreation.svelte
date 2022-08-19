<script lang="ts">
  import { seed, profileDerivationPath, address, newSeed } from "../store/wallet"
  import Mnemonic from "../utils/mnemonic"
  import { AUTH_HOST } from "../config"
  import { onMount } from "svelte"
  import stringEntropy from "fast-password-entropy"
  import { tweened } from "svelte/motion"
  import { notify } from "../store/notifications"
  import { cubicOut } from "svelte/easing"
  import type { HDPrivateKey } from "bsv"
  import { push } from "svelte-spa-router"
  import { getUserId } from "../utils/wallet"
  import { hex2patp } from "urbit-ob"

  import Qr from "./Qr.svelte"
  import Button from "../components/Button.svelte"
  import PasswordInput from "../components/PasswordInput.svelte"
  import Checkbox from "../components/Checkbox.svelte"
  import AutoResizeTextarea from "./AutoResizeTextarea.svelte"

  export let recover = false

  let creationStep = 0
  let password = ""
  let password2 = ""
  let loading = false
  let checked1 = false
  let checked2 = false

  let hdPrivKey: HDPrivateKey
  $: if ($newSeed) hdPrivKey = $newSeed.toHDPrivateKey("", "livenet")

  $: privKey = hdPrivKey ? hdPrivKey.deriveChild(profileDerivationPath).privateKey : null
  $: userId = privKey ? getUserId(privKey.publicKey) : null
  $: username = userId ? hex2patp(userId) : null
  $: validPws = password !== "" && password === password2
  $: canRegister = validPws && checked1 && checked2

  const entropyTarget = 170
  $: strength.set(stringEntropy(password))
  const strength = tweened(0, {
    duration: 400,
    easing: cubicOut
  })

  async function copyAddress(event) {
    await navigator.clipboard.writeText($address.toString())
    notify({
      type: "success",
      text: "Copied address to clipboard"
    })
  }

  async function register(password) {
    loading = true
    try {
      await window.valaauth.register(password, $newSeed.toString(), AUTH_HOST, privKey.toString(), recover)
    } catch (e) {
      console.error(e)
      notify({
        type: "danger",
        text: "Something went wrong",
        description: "Please try again or contact Support."
      })
      loading = false
      return
    }

    $seed = $newSeed.toString()
    loading = false
    creationStep = 2
  }

  let seedInput
  function loadSeed() {
    try {
      const parsedSeed = seedInput.trim().split(/\s/).join(" ") // Remove potential newlines
      $newSeed = Mnemonic.fromString(parsedSeed)
    } catch (e) {
      console.error(e)
      notify({
        type: "danger",
        text: "Invalid seed phrase"
      })
      return
    }
    creationStep = 1
  }

  onMount(async () => {
    if (!$newSeed && !recover) $newSeed = Mnemonic.fromRandom()
  })
</script>

{#if creationStep === 0}
  {#if recover}
    <h1>Recover a wallet</h1>
    <div class="seed seedinput">
      <AutoResizeTextarea bind:value={seedInput} placeholder="Enter your seed phrase" />
    </div>
    <p class="warning-message" />
    <Button type="filled" on:click={loadSeed} disabled={!loadSeed}>Next</Button>
  {:else}
    <h1>Your Wallet</h1>
    <p>This is your generated wallet seed. Store it safely.</p>
    <div class="seed">
      {#if $newSeed}
        {#each $newSeed.toString().split(" ") as word, index}
          <span class="word"><span style="user-select: none;">{index + 1}. </span>{word}</span>
        {/each}
      {/if}
    </div>
    <p class="warning-message">
      Your encrypted Wallet will be stored on Vala's servers. Vala will never have access to your seed or keys.
    </p>
    <Button
      type="filled"
      on:click={() => {
        creationStep = 1
      }}>Next</Button
    >
  {/if}
{:else if creationStep === 1}
  <h1>{username}</h1>
  <p style="opacity: 50%;">This is your wallet ID. You can use it to access your wallet from other devices.</p>
  <div class="inputs">
    <div class="pw_input">
      <PasswordInput placeholder="Password" name="password" bind:value={password} />
      <progress value={$strength} max={entropyTarget} />
    </div>
    <PasswordInput placeholder="Please repeat password" name="password2" bind:value={password2} />
  </div>

  <div class="checkboxes">
    <button class="checkbox" on:click={() => (checked1 = !checked1)}>
      <Checkbox bind:checked={checked1} />
      <p>I understand that Vala cannot recover my wallet should I lose my seed phrase</p>
    </button>

    <button class="checkbox" on:click={() => (checked2 = !checked2)}>
      <Checkbox bind:checked={checked2} />
      <p>This password is <b>unique</b> and I have not used it on any other websites</p>
    </button>
  </div>

  <!-- <p class="warning-message">
    If you loose your password or username, you will have to recover your wallet using the seed phrase!
  </p> -->

  <div class="buttons">
    <Button
      on:click={() => {
        creationStep = 0
      }}>Back</Button
    >
    <Button type="filled" disabled={!canRegister} on:click={() => register(password)} {loading}
      >Finish Registration</Button
    >
  </div>
{:else if creationStep === 2}
  <h1>Success</h1>
  <p>Send some funds to your wallet</p>
  <div class="warning">Only send Bitcoin SV to this address</div>
  {#if $address}
    <div class="qr">
      <Qr string={$address.toString()} />
    </div>
    <div class="address">
      <label for="address">Address</label>
      <button id="address" on:click={copyAddress}>{$address.toString()}</button>
    </div>
  {/if}

  <Button type="filled" on:click={() => push("/")}>Finish</Button>
{/if}

<style>
  .inputs,
  .checkboxes {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;
  }

  .checkbox {
    cursor: pointer;
  }

  h1 {
    font-size: 2.125rem;
    font-weight: 700;
    /* margin-bottom: 1rem; */
  }

  p {
    font-size: 0.875rem;
  }

  .seed {
    background-color: #323841;
    border-radius: 0.375rem;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-around;
    max-width: 22.5rem;
    padding: 1rem;
  }

  .seedinput {
    width: 100%;
  }

  .seedinput :global(textarea) {
    min-height: 100px;
  }

  .word {
    min-width: 10rem;
    padding: 0.5rem 1rem;
  }

  .warning-message {
    font-weight: bold;
  }

  .pw_input {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  progress {
    height: 0.6rem;
    width: 100%;
  }

  progress[value]::-webkit-progress-bar {
    border-radius: 0.375rem;
  }

  progress[value]::-webkit-progress-value {
    background: linear-gradient(149.62deg, #01a781 17.39%, #00ffc5 124.46%);

    border-radius: 0.375rem;
  }

  .checkbox {
    border-radius: 0.375rem;
    padding: 0.75rem 1.45rem;
    background-color: #323841;
    display: flex;
    align-items: center;
    gap: 1.5rem;
  }

  .checkbox p {
    color: #b9b9b9;
    font-size: 0.875rem;
    text-align: left;
  }

  .checkbox :global(input) {
    flex-shrink: 0;
  }

  .buttons {
    display: flex;
    gap: 1rem;
    align-items: center;
    justify-content: space-around;
  }

  .address {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    font-size: 1.125rem;
    font-weight: 500;
    align-items: center;
  }

  .address > label {
    opacity: 50%;
  }

  .qr {
    padding: 0.625rem;
    border-radius: 0.75rem;
    background-color: #ffffff;
  }

  .warning {
    opacity: 50%;
  }
</style>
