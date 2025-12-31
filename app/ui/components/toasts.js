export function createToastsHost() {
  const host = document.createElement('div')
  host.className = 'toasts'
  host.style.position = 'fixed'
  host.style.bottom = '1rem'
  host.style.right = '1rem'
  host.style.display = 'flex'
  host.style.flexDirection = 'column'
  host.style.gap = '0.5rem'

  const push = (message) => {
    const toast = document.createElement('div')
    toast.textContent = message
    toast.style.background = 'white'
    toast.style.padding = '0.5rem 0.75rem'
    toast.style.border = '1px solid #e5e7eb'
    toast.style.borderRadius = '6px'
    host.append(toast)
    setTimeout(() => toast.remove(), 2000)
  }

  return { host, push }
}
