<script>
  import { createEventDispatcher } from "svelte"

  const dispatch = createEventDispatcher()

  export let active = false
  export let disabled = false
  export let loading = false
</script>

<button
  on:click={() => dispatch("click")}
  class="{disabled ? 'disabled' : ''} {active ? 'active' : ''} {loading ? 'loading' : ''}"
  >{#if !loading}<slot />{:else}
    <div class="loader" />{/if}</button
>

<style>
  button {
    padding: 0.625rem 1.5rem;
    background: linear-gradient(149.62deg, #01a781 17.39%, #00ffc5 124.46%);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 0.375rem;
    min-width: 10rem;
    position: relative;
    height: 2.25rem;
  }

  /* @keyframes spinner {
    0% {
      transform: translate3d(-50%, -50%, 0) rotate(0deg);
    }
    100% {
      transform: translate3d(-50%, -50%, 0) rotate(360deg);
    }
  } */

  /* .spin::before {
    animation: 1s linear infinite spinner;
    animation-play-state: inherit;
    border: solid 2px transparent;
    border-bottom-color: white;
    border-left-color: white;
    border-radius: 50%;
    content: "";
    height: 1rem;
    width: 1rem;
    position: absolute;
    transform: translate3d(-50%, -50%, 0);
    will-change: transform;
  } */

  .loader,
  .loader:before,
  .loader:after {
    border-radius: 50%;
    width: 2.5em;
    height: 2.5em;
    animation-fill-mode: both;
    animation: load7 1.8s infinite ease-in-out;
  }
  .loader {
    color: #ffffff;
    font-size: 0.3rem;
    margin: 80px auto;
    position: relative;
    text-indent: -9999em;
    transform: translateZ(0) translateY(-2.8em);
    animation-delay: -0.16s;
  }
  .loader:before,
  .loader:after {
    content: "";
    position: absolute;
    top: 0;
  }
  .loader:before {
    left: -3.5em;
    animation-delay: -0.32s;
  }
  .loader:after {
    left: 3.5em;
  }
  @keyframes load7 {
    0%,
    80%,
    100% {
      box-shadow: 0 2.8em 0 -1.3em;
    }
    40% {
      box-shadow: 0 2.8em 0 0;
    }
  }
</style>
