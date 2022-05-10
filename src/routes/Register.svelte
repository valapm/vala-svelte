<script>
  import { seed, derivationPath } from "../store/wallet"
  import { email as emailSave } from "../store/profile"
  import { push } from "svelte-spa-router"
  import Mnemonic from "../utils/mnemonic"
  import { AUTH_HOST } from "../config"
  import Loader from "../components/Loader.svelte"
  import { onMount } from "svelte"
  import { EMAIL_REGEX } from "../utils/email"
  import { notify } from "../store/notifications"
  import stringEntropy from "fast-password-entropy"
  import { tweened } from "svelte/motion"
  import { cubicOut } from "svelte/easing"

  import Button from "../components/Button.svelte"
  import PasswordInput from "../components/PasswordInput.svelte"
  import Modal from "../components/Modal.svelte"
  import Checkbox from "../components/Checkbox.svelte"

  const unspecificErrorMessage = { title: "Something went wrong", details: "Please try again or contact Support." }

  let valaauth
  let loading

  let email = ""
  let password = ""
  let password2 = ""

  $: isValidEmail = email && EMAIL_REGEX.test(email)

  let generatedSeed = null
  $: publicKey = generatedSeed ? generatedSeed.toHDPrivateKey("livenet").deriveChild(derivationPath).publicKey : null

  let error = {}

  let showModal

  function initAuth() {
    console.debug("vala-auth loaded")
  }

  async function generateSeed() {
    if (password !== password2) {
      error = { title: "Passwords do not match" }
      notify({
        type: "danger",
        text: error.title,
        description: error.details || ""
      })
      return
    }

    generatedSeed = Mnemonic.fromRandom()
    showModal = true
  }

  async function register(email, password) {
    loading = true
    try {
      await window.valaauth.register(email, password, generatedSeed.toString(), AUTH_HOST, publicKey.toString())
    } catch (e) {
      if (e.message === "Email already taken") {
        error = {
          title: "Email already taken"
        }
      } else if (e.message === "Must be a valid email") {
        error = {
          title: "Must be a valid Email"
        }
      } else {
        error = unspecificErrorMessage
      }

      showModal = false

      notify({
        type: "danger",
        text: error.title,
        description: error.details || ""
      })
      loading = false
      return
    }

    $seed = generatedSeed ? generatedSeed.toString() : ""
    $emailSave = email
    loading = false

    showModal = false

    push("/")
  }

  function handleKeydown(event) {
    if (event.keyCode === 13) {
      event.preventDefault()
      if (showModal) {
        register(email, password)
      } else {
        if (isValidEmail && password && password2) {
          generateSeed()
        }
      }
    }
  }

  onMount(() => {
    if ($seed) push("/")
  })

  const entropyTarget = 170

  $: strength.set(stringEntropy(password))
  const strength = tweened(0, {
    duration: 400,
    easing: cubicOut
  })

  let checked1 = false
  let checked2 = false
</script>

<svelte:head>
  <script src="/includes/valaauth.min.js" on:load={initAuth}></script>
</svelte:head>

<svelte:window on:keydown={handleKeydown} />

<Modal bind:open={showModal}>
  <div class="modal">
    <h1>Your Wallet</h1>
    <p>
      This is your generated wallet seed. Your wallet is encrypted with your password and stored on our servers, we will
      never have access to it.
    </p>
    <div class="seed">
      {#if generatedSeed}
        {#each generatedSeed.toString().split(" ") as word, index}
          <div class="word">{index + 1}. {word}</div>
        {/each}
      {/if}
    </div>
    <p class="warning-message">If you loose your password, you will loose access to your wallet!</p>
    <Button type="filled" on:click={() => register(email, password)} {loading}>Finish Registration</Button>
  </div>
</Modal>

<div class="login">
  <h1>Sign up</h1>
  <p>Your password, seed and keys will never be revealed to Vala.</p>

  <div class="inputs">
    <input placeholder="Email" name="email" type="email" bind:value={email} />
    <div class="pw_input">
      <PasswordInput placeholder="Password" name="password" bind:value={password} />
      <progress value={$strength} max={entropyTarget} />
    </div>
    <PasswordInput placeholder="Please repeat password" name="password2" bind:value={password2} />
  </div>

  <div class="checkboxes">
    <div class="checkbox">
      <Checkbox bind:value={checked1} />
      <p>I understand that Vala cannot recover my wallet should I loose my password</p>
    </div>

    <div class="checkbox">
      <Checkbox bind:value={checked2} />
      <p>This password is <b>unique</b> and I have not used it on any other websites</p>
    </div>
  </div>

  <div class="buttons">
    <Button
      type="filled full-width"
      disabled={!isValidEmail || !password || !password2 || !checked1 || !checked2}
      on:click={generateSeed}>Register</Button
    >
    <Button type="full-width" on:click={() => push("/login")}>Login</Button>
  </div>
</div>

<style>
  .login {
    display: flex;
    flex-direction: column;
    transform: translate(-50%, -50%);
    position: absolute;
    left: 50%;
    top: 50%;
    gap: 2rem;
    text-align: center;
    /* width: min(90%, 15rem); */
    align-items: center;
    width: min(18rem, 100%);
  }

  .inputs,
  .checkboxes {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;
  }

  .inputs input {
    border-radius: 0.375rem;
    width: 100%;
    height: 2.8125rem;
    padding: 0 1.25rem;
    background-color: #323841;
  }

  h1 {
    font-size: 2.125rem;
    font-weight: 700;
    /* margin-bottom: 1rem; */
  }

  p {
    font-size: 0.875rem;
  }

  .buttons {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: center;
    width: 100%;
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

  .word {
    min-width: 10rem;
    padding: 0.5rem 1rem;
  }

  .warning-message {
    font-weight: bold;
  }

  .modal {
    display: flex;
    flex-direction: column;
    color: white;
    padding: 1.7rem 2.8rem;
    align-items: center;
    gap: 2rem;
    max-width: 35rem;
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
</style>
