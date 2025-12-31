export function renderDoorHeader(meta) {
  const header = document.createElement('div')
  header.className = 'card'
  const title = document.createElement('h2')
  title.textContent = meta.title || 'Door'
  const intent = document.createElement('p')
  intent.textContent = meta.intent || 'Describe the door intent here.'
  header.append(title, intent)
  return header
}
