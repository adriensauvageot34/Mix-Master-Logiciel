export function indexResources(htmlString) {
  const template = document.createElement('template')
  template.innerHTML = htmlString
  const map = new Map()
  template.content.querySelectorAll('[data-resource-id]').forEach((node) => {
    map.set(node.dataset.resourceId, node)
  })
  return map
}
