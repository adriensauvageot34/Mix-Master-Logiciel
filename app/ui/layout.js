import { renderDoorHeader } from './components/doorHeader.js'
import { renderSidebar } from './components/sidebarNav.js'
import { renderRunBar } from './components/runBar.js'
import { createToastsHost } from './components/toasts.js'

function enhanceCollapsibleSections(manifest, contentEl, store) {
  ;(manifest.sections || []).forEach((section) => {
    if (!section.collapsible) return
    const sectionEl = contentEl.querySelector(`[data-section-id="${section.id}"]`)
    if (!sectionEl) return

    sectionEl.classList.add('collapsible')
    const titleEl = sectionEl.querySelector('h2, h3, h4')
    const body = document.createElement('div')
    body.className = 'card-body'

    while (sectionEl.children.length > 1) {
      body.append(sectionEl.children[1])
    }

    const header = document.createElement('div')
    header.className = 'card-header'
    if (titleEl) header.append(titleEl)

    const toggle = document.createElement('button')
    toggle.type = 'button'
    toggle.className = 'button ghost toggle-section'
    toggle.textContent = 'Toggle'

    const applyState = () => {
      const collapsed = Boolean(store.get(`ui.collapsedSections.${section.id}`))
      sectionEl.classList.toggle('collapsed', collapsed)
      toggle.textContent = collapsed ? 'Expand' : 'Collapse'
    }

    toggle.addEventListener('click', () => {
      const collapsed = !Boolean(store.get(`ui.collapsedSections.${section.id}`))
      store.set(`ui.collapsedSections.${section.id}`, collapsed)
      applyState()
    })

    header.append(toggle)
    sectionEl.prepend(header)
    sectionEl.append(body)
    applyState()
  })
}

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

  const handleResourceClick = (event) => {
    const target = event.target.closest('[data-open-resource]')
    if (!target) return
    const resId = target.dataset.openResource
    drawer.openResource(resId)
  }

  root.addEventListener('click', handleResourceClick)

  const header = renderDoorHeader(pack.meta)
  content.prepend(header)

  enhanceCollapsibleSections(pack.manifest, content, store)

  if (pack.cssText) {
    const style = document.createElement('style')
    style.textContent = pack.cssText
    document.head.append(style)
  }

  return { root, content }
}
