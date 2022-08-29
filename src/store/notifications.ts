import { writable } from "svelte/store"

let notificationId = 0

export const notifications = writable({})

export function removeNotification(id) {
  notifications.update($notifications => {
    delete $notifications[id]
    return $notifications
  })
}

export type Notification = {
  id: number
  remove: () => void
  [key: string]: any
}

export function notify(data, time = 5000): Notification {
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
  if (time) {
    const timeout = new Promise(r => setTimeout(r, time))
    timeout.then(() => {
      notification.remove()
    })
  }

  return notification
}
