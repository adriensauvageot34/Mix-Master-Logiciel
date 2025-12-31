export function createBadge(text) {
  const span = document.createElement('span')
  span.textContent = text
  span.style.background = '#e5e7eb'
  span.style.borderRadius = '999px'
  span.style.padding = '0.1rem 0.5rem'
  span.style.fontSize = '0.8rem'
  return span
}
