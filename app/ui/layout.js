import { renderDoorHeader } from './components/doorHeader.js'
import { renderSidebar } from './components/sidebarNav.js'
import { renderRunBar } from './components/runBar.js'
import { createToastsHost } from './components/toasts.js'

export function renderLayout(pack, store, drawer, modal) {
  const root = document.createElement('div')
  const toasts = createToastsHost()
  root.append(toasts.host)

  const runbar = renderRunBar(pack, store, modal)
  root.append(runbar)

  const shell = document.createElement('div')
  shell.style.display = 'grid'
  shell.style.gridTemplateColumns = '220px 1fr'
  shell.style.minHeight = 'calc(100vh - 52px)'

  const content = document.createElement('main')
  content.innerHTML = pack.contentHtml

  const sidebar = renderSidebar(pack.manifest, content)
  sidebar.style.padding = '1rem'
  sidebar.style.borderRight = '1px solid var(--border)'
  sidebar.style.position = 'sticky'
  sidebar.style.top = '52px'
  sidebar.style.height = 'calc(100vh - 52px)'
  sidebar.style.overflowY = 'auto'

  shell.append(sidebar, content)
  root.append(shell, drawer.drawer, modal.overlay)

  content.addEventListener('click', (event) => {
    const target = event.target.closest('[data-open-resource]')
    if (!target) return
    const resId = target.dataset.openResource
    drawer.openResource(resId)
  })

  const header = renderDoorHeader(pack.meta)
  content.prepend(header)

  if (pack.cssText) {
    const style = document.createElement('style')
    style.textContent = pack.cssText
    document.head.append(style)
  }

  return { root, content }
}
