<script>
  export let value
  export let min
  export let max
</script>

<input type="range" bind:value {min} {max} />

<style>
  input {
    -webkit-appearance: none;
    background: transparent;
    cursor: grab;
  }

  input:focus {
    outline: none;
  }

  input::-webkit-slider-runnable-track {
    background: #323841;
    height: 0.625rem;
    border-radius: 1rem;
    padding: 0 1rem;
    /* overflow: hidden; */
  }

  input::-moz-range-track {
    background: #323841;
    height: 0.625rem;
    border-radius: 1rem;
    /* overflow: hidden; */
  }

  input::-webkit-slider-thumb {
    -webkit-appearance: none;
    height: 0.82rem;
    width: 0.82rem;
    background: #b9b9b9;
    margin-top: -0.1rem;
    border-radius: 50%;
    /* box-shadow: calc(-0.41rem - 100vw) 0 0 100vw dodgerblue; */
  }

  input::-moz-range-thumb {
    height: 0.82rem;
    width: 0.82rem;
    background: #b9b9b9;
    margin-top: -0.1rem;
    border-radius: 50%;
    /* box-shadow: calc(-0.41rem - 100vw) 0 0 100vw dodgerblue; */
  }
</style>
