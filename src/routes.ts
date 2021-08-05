import Market from "./routes/Market.svelte"
import CreateMarket from "./routes/CreateMarket.svelte"
import Dashboard from "./routes/Dashboard.svelte"
import OracleDashboard from "./routes/OracleDashboard.svelte"
import Login from "./routes/Login.svelte"
import Register from "./routes/Register.svelte"
import Wallet from "./routes/Wallet.svelte"
import Options from "./routes/Options.svelte"

export const routes = {
  "/": Dashboard,
  "/market/:firstTxTxid": Market,
  "/create": CreateMarket,
  "/oracle": OracleDashboard,
  "/login": Login,
  "/register": Register,
  "/wallet": Wallet,
  "/options": Options
}
