export type notification = {
  type: string
  title: string
  description: string
}

export function getMarketNotifications(market) {
  const notifications: notification[] = []

  if (market.market_state.hidden) {
    notifications.push({
      type: "warning",
      title: "Market is hidden",
      description:
        "This market is hidden. There are no limits on trading but it will not appear on vala.ai unless you have the link or are already invested."
    })
  }

  return notifications
}
