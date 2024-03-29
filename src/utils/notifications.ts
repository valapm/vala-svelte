import { isCompatibleVersion } from "../utils/pm"

export type notification = {
  type: string
  title: string
  description: string
}

export function getMarketNotifications(market) {
  const notifications: notification[] = []

  if (market.market_state[0].hidden) {
    notifications.push({
      type: "warning",
      title: "Market is hidden",
      description:
        "This market is hidden. There are no limits on trading but it will not appear on vala.ai unless you have the link or already traded in the market."
    })
  }

  if (!isCompatibleVersion(market.version)) {
    notifications.push({
      type: "warning",
      title: "Market is unsupported",
      description: "This market uses an unsupported contract version."
    })
  }

  return notifications
}
