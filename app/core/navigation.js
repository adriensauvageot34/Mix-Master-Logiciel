export function createNavigation(manifest, onNavigate) {
  const nav = document.createElement('nav')
  nav.className = 'sidebar'
  const list = document.createElement('ul')
  ;(manifest.sections || []).forEach((section) => {
    const item = document.createElement('li')
    const link = document.createElement('button')
    link.textContent = section.title
    link.type = 'button'
    link.dataset.sectionId = section.id
    link.addEventListener('click', () => onNavigate(section.id))
    item.append(link)
    list.append(item)
  })
  nav.append(list)
  return nav
}

export function attachScrollSpy(navEl, contentEl) {
  const links = Array.from(navEl.querySelectorAll('button[data-section-id]'))
  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
      if (visible[0]) {
        const id = visible[0].target.dataset.sectionId
        links.forEach((l) => l.classList.toggle('active', l.dataset.sectionId === id))
      }
    },
    { rootMargin: '0px 0px -70% 0px' }
  )

  links.forEach((link) => {
    const target = contentEl.querySelector(`[data-section-id="${link.dataset.sectionId}"]`)
    if (target) observer.observe(target)
  })
}
