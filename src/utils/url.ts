export function isValidUrl(string) {
  try {
    parseHostname(string)
  } catch (_) {
    return false
  }

  return true
}

export function parseHostname(string) {
  // Make sure that url has scheme
  const parts = string.split("://")
  const url = parts.length > 1 ? parts.join("://") : "https://" + parts[0]

  return new URL(url).hostname
}
