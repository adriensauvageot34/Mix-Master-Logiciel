import { createRunner } from '../../core/runner.js'

export function createModal(store) {
  const overlay = document.createElement('div')
  overlay.style.position = 'fixed'
  overlay.style.inset = '0'
  overlay.style.display = 'none'
  overlay.style.alignItems = 'center'
  overlay.style.justifyContent = 'center'
  overlay.style.background = 'rgba(0,0,0,0.35)'
  overlay.style.zIndex = '30'

  const modal = document.createElement('div')
  modal.style.background = 'white'
  modal.style.padding = '1rem'
  modal.style.borderRadius = '8px'
  modal.style.minWidth = '320px'

  const title = document.createElement('h3')
  title.textContent = 'Run wizard'

  const runner = createRunner(store)

  const stepOne = document.createElement('div')
  const lead = document.createElement('input')
  lead.type = 'checkbox'
  lead.checked = true
  stepOne.append(lead, document.createTextNode(' Lead run'))

  const back = document.createElement('input')
  back.type = 'checkbox'
  back.checked = false
  const backLabel = document.createElement('label')
  backLabel.style.marginLeft = '0.5rem'
  backLabel.append(back, document.createTextNode(' Back run'))

  const setup = document.createElement('div')
  setup.append(stepOne, backLabel)

  const placement = document.createElement('div')
  const depth = document.createElement('input')
  depth.placeholder = 'Depth'
  const width = document.createElement('input')
  width.placeholder = 'Width'
  const height = document.createElement('input')
  height.placeholder = 'Height'
  placement.style.display = 'flex'
  placement.style.gap = '0.5rem'
  placement.append(depth, width, height)

  const actions = document.createElement('div')
  actions.style.marginTop = '1rem'
  actions.style.display = 'flex'
  actions.style.gap = '0.5rem'

  const closeBtn = document.createElement('button')
  closeBtn.className = 'button'
  closeBtn.textContent = 'Cancel'
  closeBtn.addEventListener('click', () => (overlay.style.display = 'none'))

  const confirmBtn = document.createElement('button')
  confirmBtn.className = 'button primary'
  confirmBtn.textContent = 'Queue run'
  confirmBtn.addEventListener('click', () => {
    runner.queueRun({ lead: lead.checked, back: back.checked, placement: { depth: depth.value, width: width.value, height: height.value } })
    overlay.style.display = 'none'
  })

  actions.append(confirmBtn, closeBtn)
  modal.append(title, setup, placement, actions)
  overlay.append(modal)

  const open = () => (overlay.style.display = 'flex')

  return { overlay, open }
}
