import { writable } from "svelte/store"

let notificationId = 0

export const notifications = writable({})

export function removeNotification(id) {
  notifications.update($notifications => {
    delete $notifications[id]
    return $notifications
  })
}

export function notify(data): number {
  const id = notificationId
  notificationId += 1

  const notification = {
    ...data,
    id,
    remove: () => {
      notifications.update($notifications => {
        delete $notifications[id]
        return $notifications
      })
    }
  }

  notifications.update($notifications => {
    return { [id]: notification, ...$notifications }
  })

  // Remove notification again
  const timeout = new Promise(r => setTimeout(r, 2000))
  timeout.then(() => {
    notification.remove()
  })

  return id
}
