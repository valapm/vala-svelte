<script>
  import { createEventDispatcher } from "svelte"

  const dispatch = createEventDispatcher()

  export let type = ""
  export let active = false
  export let disabled = false
  export let loading = false
</script>

<button
  on:click={() => {
    if (!loading && !disabled) dispatch("click")
  }}
  class="{type} {disabled ? 'disabled' : ''} {loading ? 'loading' : ''} {active ? 'active' : ''}"
  ><span style={loading ? "opacity: 0%;" : ""}><slot /></span></button
>

<style>
  button {
    border-radius: 0.375rem;
    padding: 0.625rem 1.5rem;
    display: flex;
    justify-content: center;
    align-items: center;
    color: white;
    border: 1px solid #01a781;
    line-height: 1.1875em; /*
    Figma does this for some reason */
    position: relative;
  }

  span {
    display: flex;
    flex-direction: column;
  }

  .filled {
    border: none;
    /* background-color: #01a781; */
    background: linear-gradient(149.62deg, #01a781 17.39%, #00ffc5 124.46%);
  }

  .filled-blue {
    border: none;
    background: linear-gradient(149.62deg, #00acff 17.39%, #96d0ec 124.46%);
  }

  .filled-yellow {
    border: none;
    background: linear-gradient(149.62deg, #ffa800 17.39%, #e0c592 124.46%);
  }

  .filled-grey {
    border: none;
    background-color: #323841;
    color: #989ba0;
  }

  .blue {
    border: none;
    background-color: #5184e7;
  }

  .text {
    border: none;
    opacity: 50%;
    padding: 0;
  }

  .active {
    font-weight: 700;
    opacity: 100%;
  }

  .disabled {
    opacity: 50%;
    cursor: default !important;
  }

  .wide {
    padding: 0.625rem 3.5rem;
  }

  .full-width {
    width: 100%;
  }

  .loading::after {
    content: "";
    position: absolute;
    width: 1rem;
    height: 1rem;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    margin: auto;
    border: 4px solid transparent;
    border-top-color: #ffffff;
    border-radius: 50%;
    animation: button-loading-spinner 1s ease infinite;
  }

  @keyframes button-loading-spinner {
    from {
      transform: rotate(0turn);
    }

    to {
      transform: rotate(1turn);
    }
  }
</style>
