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
  const domainNameRegex = /(?:www\.)?(?<url>\w+(?:\.\w+)+)/gm
  const matches = domainNameRegex.exec(string)
  return matches.groups.url
}
