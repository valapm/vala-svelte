import Market from "./routes/Market.svelte"
import CreateMarket from "./routes/CreateMarket.svelte"
import Dashboard from "./routes/Dashboard.svelte"

export const routes = {
  "/": Dashboard,
  "/market/:firstTxTxid": Market,
  "/create": CreateMarket
}