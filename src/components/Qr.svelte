<script>
  import QRCodeStyling from "qr-code-styling"
  import { onMount } from "svelte"

  export let string

  let canvas

  const options = {
    width: 200,
    height: 200,
    type: "svg",
    data: string,
    margin: 0,
    qrOptions: { typeNumber: "0", mode: "Byte", errorCorrectionLevel: "Q" },
    imageOptions: { hideBackgroundDots: true, imageSize: 0.4, margin: 0 },
    dotsOptions: { type: "rounded", color: "#323841", gradient: null },
    backgroundOptions: { color: "#ffffff" },
    image: null,
    dotsOptionsHelper: {
      colorType: { single: true, gradient: false }
    },
    cornersSquareOptions: { type: "", color: "#323841" },
    cornersSquareOptionsHelper: {
      colorType: { single: true, gradient: false }
    },
    cornersDotOptions: { type: "", color: "#323841" },
    cornersDotOptionsHelper: {
      colorType: { single: true, gradient: false }
    },
    backgroundOptionsHelper: {
      colorType: { single: true, gradient: false }
    }
  }

  const qrCode = new QRCodeStyling(options)

  onMount(() => {
    qrCode.append(canvas)
  })
</script>

<div bind:this={canvas} />
