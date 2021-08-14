import Market from "./routes/Market.svelte"
import CreateMarket from "./routes/CreateMarket.svelte"
import Markets from "./routes/Markets.svelte"
import OracleDashboard from "./routes/OracleDashboard.svelte"
import Login from "./routes/Login.svelte"
import Register from "./routes/Register.svelte"
import Wallet from "./routes/Wallet.svelte"
import Options from "./routes/Options.svelte"
import Oracles from "./routes/Oracles.svelte"
import Oracle from "./routes/Oracle.svelte"
import Landingpage from "./routes/Landingpage.svelte"

export const routes = {
  "/": Landingpage,
  "/markets": Markets,
  "/market/:firstTxTxid": Market,
  "/create": CreateMarket,
  "/oracles": Oracles,
  "/oracle": OracleDashboard,
  "/oracle/:rabinPubKey": Oracle,
  "/login": Login,
  "/register": Register,
  "/wallet": Wallet,
  "/options": Options
}
