import Market from "./routes/Market.svelte"
import Dashboard from "./routes/Dashboard.svelte"

export const routes = [
  {
    name: "/",
    component: Dashboard
  },
  {
    name: "market/:firstTxTxid",
    component: Market
  }
]
