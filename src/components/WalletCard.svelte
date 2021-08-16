<script>
  import { onMount, tick } from "svelte"

  import SlCard from "@shoelace-style/shoelace/dist/components/card/card"
  import SlQrCode from "@shoelace-style/shoelace/dist/components/qr-code/qr-code"

  export let address
  export let username

  let card

  let counter = 0
  let updateRate = 10
  let isTimeToUpdate = function () {
    return counter++ % updateRate === 0
  }

  let cardCenterX
  let cardCenterY

  function handleMousemove(event) {
    // if (isTimeToUpdate(event)) {
    update(event)
    // }
  }

  function handleMouseleave(event) {
    // card.style = ""
    card.style.transition = "all 0.5s ease"
    card.style.transform = `rotateY(0deg) rotateX(0deg)`
  }

  async function handleMouseenter(event) {
    card.style.transition = "none"
    update(event)
  }

  function update(event) {
    const x = event.clientX - cardCenterX
    const y = (event.clientY - cardCenterY) * -1
    const xDeg = ((10 * y) / card.offsetHeight).toFixed(2)
    const yDeg = ((10 * x) / card.offsetWidth).toFixed(2)
    var style = "rotateX(" + xDeg + "deg) rotateY(" + yDeg + "deg)"
    card.style.transform = style
    card.style.webkitTransform = style
    card.style.mozTransform = style
    card.style.msTransform = style
    card.style.oTransform = style

    // let xAxis = (window.innerWidth / 2 - event.pageX) / 25
    // let yAxis = (window.innerHeight / 2 - event.pageY) / 25
    // card.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg)`
  }

  onMount(async () => {
    await tick()
    recenter()
  })

  function recenter() {
    cardCenterX = card.offsetLeft + Math.floor(card.offsetWidth / 2)
    cardCenterY = card.offsetTop + Math.floor(card.offsetHeight / 2)
  }
</script>

<svelte:body on:mousemove={handleMousemove} on:mouseenter={handleMouseenter} on:mouseleave={handleMouseleave} />

<svelte:window on:resize={recenter} />

<div class="container">
  <sl-card bind:this={card}>
    <div class="body">
      <div class="info">
        <div class="label">ADDRESS</div>
        <div class="address">{address.toUpperCase()}</div>
      </div>
      <sl-qr-code value={address} fill="white" background="transparent" />
    </div>
    <div class="footer">
      <span>{username.toUpperCase()}</span>
      <div class="logo-wrapper">
        <img src="./bitcoinsv_white.png" alt="Bitcoin SV" />
      </div>
    </div>
  </sl-card>
</div>

<style>
  @import url("https://fonts.googleapis.com/css2?family=Overpass+Mono&display=swap");

  :global(body) {
    min-height: 100vh;
    perspective: 1000px;
  }

  sl-card {
    color: white;
    font-family: "Overpass Mono", monospace;
    width: 21.9rem;
    transition: transform 0.3s;
  }

  sl-card::part(base) {
    height: 13.9rem;
    width: 21.9rem;
    border-radius: 0.6rem;
    background-image: linear-gradient(to right bottom, #fd696b, #fa616e, #f65871, #f15075, #ec4879);
  }

  sl-card::part(body) {
    border-radius: 0.6rem;
    box-shadow: 0 1rem 1rem rgba(0, 0, 0, 0.15), 0px 0px 50px rgba(0, 0, 0, 0.15);
  }

  .footer {
    display: flex;
    height: 2.5rem;
    justify-content: space-between;
    align-items: flex-end;
  }

  .footer img {
    height: 3.5rem;
    margin-bottom: -0.8rem;
  }

  .logo-wrapper {
    width: 128px;
    display: flex;
    justify-content: space-around;
    align-items: flex-end;
  }

  .footer > span {
    filter: drop-shadow(1px 1px 1px rgba(0, 0, 0, 0.3));
    letter-spacing: 2.5px;
  }

  sl-qr-code::part(base) {
    margin: 0.4rem 0;
  }

  .body {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    align-items: stretch;
  }

  .info {
    display: flex;
    flex-direction: column;
  }

  .address {
    font-size: 1.15em;
    letter-spacing: 2.5px;
    filter: drop-shadow(1px 1px 1px rgba(0, 0, 0, 0.3));
    word-break: break-all;

    display: block;
    word-wrap: break-word;
    columns: 2;
    column-gap: 0.2em;
  }

  .label {
    font-size: 0.8rem;
    filter: drop-shadow(1px 1px 1px rgba(0, 0, 0, 0.3));
    letter-spacing: 2px;
    color: var(--sl-color-gray-200);
  }
</style>
