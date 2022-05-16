<script>
  import { onMount, tick } from "svelte"
  import { fly } from "svelte/transition"

  let frame

  onMount(() => {
    setTimeout(() => {
      for (const vector of frame.childNodes) {
        vector.style.transform = "translate(0, 0)"
        vector.style.opacity = "100%"
      }
    }, 200)
  })
</script>

<div id="landingpage_logo">
  <svg
    width="601"
    height="554"
    style="overflow: visible;"
    viewBox="0 0 601 554"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g id="Frame 1170" bind:this={frame}>
      <path
        id="vector1"
        d="M317.831 550.878L212.604 367.014L598.436 62.4313L317.831 550.878Z"
        stroke="#00FFC2"
        stroke-width="3"
      />
      <path id="vector2" d="M404.601 147.862L186.763 320.583L4 3L404.601 147.862Z" stroke="#00B2FF" stroke-width="3" />
      <path
        id="vector3"
        d="M452.61 118.147L280.924 55.0015L594.759 4.85684L452.61 118.147Z"
        stroke="#00FFE3"
        stroke-width="3"
      />
    </g>
  </svg>
</div>

<style>
  #landingpage_logo {
    position: relative;
    margin-top: 3.125rem;
    width: 594.44px;
    height: 547.88px;
  }

  #vector1,
  #vector2,
  #vector3 {
    transition: transform 3s cubic-bezier(0.59, 0.64, 0.4, 1.01), opacity 2s ease-in;
    opacity: 0;
  }

  #vector1 {
    transform: translate(-70%, 70%);
    filter: drop-shadow(0px 0px 0.5rem #00ffc2);
    /* box-shadow: 0px 0px 0.5rem #00ffc270; */
  }

  #vector2 {
    transform: translate(70%, 70%);
    filter: drop-shadow(0px 0px 0.5rem #00b2ff);
    /* box-shadow: 0px 0px 0.5rem #00b2ff70; */
  }

  #vector3 {
    transform: translate(-70%, 10%);
    filter: drop-shadow(0px 0px 0.5rem #00ffe3);
    /* box-shadow: 0px 0px 0.5rem #00ffe370; */
  }
</style>
