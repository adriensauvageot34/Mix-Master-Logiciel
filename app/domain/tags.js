export function parseTags(str = '') {
  return str
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)
}
