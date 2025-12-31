export function createDrawer(resourceMap) {
  const drawer = document.createElement('aside')
  drawer.className = 'drawer'

  const header = document.createElement('header')
  const title = document.createElement('strong')
  const closeBtn = document.createElement('button')
  closeBtn.textContent = 'Close'
  closeBtn.className = 'button'
  closeBtn.addEventListener('click', () => drawer.classList.remove('open'))
  header.append(title, closeBtn)

  const content = document.createElement('div')
  content.className = 'content'
  drawer.append(header, content)

  const openResource = (resourceId) => {
    const node = resourceMap.get(resourceId)
    content.innerHTML = ''
    if (!node) {
      title.textContent = resourceId
      const fallback = document.createElement('p')
      fallback.textContent = 'Ressource introuvable.'
      content.append(fallback)
    } else {
      title.textContent = resourceId
      content.append(node.cloneNode(true))
    }
    drawer.classList.add('open')
  }

  return { drawer, openResource }
}
