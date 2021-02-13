import Market from "./routes/Market.svelte"
import Dashboard from "./routes/Dashboard.svelte"

export const routes = {
  "/": Dashboard,
  "/market/:firstTxTxid": Market
}
