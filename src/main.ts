import App from "./App.svelte"
import "../public/global.css"
import "@shoelace-style/shoelace/dist/themes/base.css"
import { setBasePath } from "@shoelace-style/shoelace/dist/utilities/base-path.js"

// Set the base path to the folder you copied Shoelace's assets to
setBasePath("/includes/shoelace")

const app = new App({
  target: document.body
})

export default app
