import { evaluateDone } from '../../core/gates.js'

export function renderRunBar(pack, store, modal) {
  const bar = document.createElement('div')
  bar.className = 'runbar'

  const title = document.createElement('div')
  title.textContent = pack.meta?.title || pack.meta?.id

  const actions = document.createElement('div')
  actions.className = 'runbar-actions'

  const runBtn = document.createElement('button')
  runBtn.className = 'button'
  runBtn.textContent = 'RUN'
  runBtn.addEventListener('click', () => modal.open())

  const doneBtn = document.createElement('button')
  doneBtn.className = 'button primary'
  doneBtn.textContent = 'DONE'

  const blockersEl = document.createElement('div')
  blockersEl.className = 'blockers'

  const sync = () => {
    const { ok, blockers } = evaluateDone(pack.rules, store.get())
    doneBtn.disabled = !ok
    blockersEl.innerHTML = ''
    if (!ok) {
      const list = document.createElement('ul')
      blockers.forEach((msg) => {
        const item = document.createElement('li')
        item.textContent = msg
        list.append(item)
      })
      blockersEl.append(list)
    }
  }

  sync()
  store.subscribe(sync)

  actions.append(runBtn, doneBtn)
  bar.append(title, actions, blockersEl)
  return bar
}
