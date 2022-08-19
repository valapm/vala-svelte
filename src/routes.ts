import Market from "./routes/Market.svelte"
import CreateMarket from "./routes/CreateMarket.svelte"
import Markets from "./routes/Markets.svelte"
import OracleDashboard from "./routes/OracleDashboard.svelte"
import Login from "./routes/Login.svelte"
import Logout from "./routes/Logout.svelte"
import Register from "./routes/Register.svelte"
import Wallet from "./routes/Wallet.svelte"
import Options from "./routes/Options.svelte"
import Oracles from "./routes/Oracles.svelte"
import Oracle from "./routes/Oracle.svelte"
import Landingpage from "./routes/Landingpage.svelte"
import Dev from "./routes/Dev.svelte"
import Recover from "./routes/Recover.svelte"

export const routes = {
  "/": Landingpage,
  "/markets": Markets,
  "/market/:firstTxTxid": Market,
  "/create": CreateMarket,
  "/oracles/:rabinPubKey": Oracle,
  "/oracles": Oracles,
  "/oracle": OracleDashboard,
  "/login": Login,
  "/logout": Logout,
  "/register": Register,
  "/wallet": Wallet,
  "/options": Options,
  "/dev": Dev,
  "/recover": Recover
}
