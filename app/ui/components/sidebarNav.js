import { createNavigation, attachScrollSpy } from '../../core/navigation.js'

export function renderSidebar(manifest, contentEl) {
  const nav = createNavigation(manifest, (sectionId) => {
    const target = contentEl.querySelector(`[data-section-id="${sectionId}"]`)
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
  requestAnimationFrame(() => attachScrollSpy(nav, contentEl))
  return nav
}
