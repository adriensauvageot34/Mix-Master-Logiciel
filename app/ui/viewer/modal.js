import runConfig from '../../resources/global/run-config.json'
import { createRunner, nextRun, prevRun } from '../../core/runner.js'

const createRadioGroup = (name, options, selected) => {
  const group = document.createElement('div')
  group.className = 'option-grid'
  options.forEach((opt) => {
    const label = document.createElement('label')
    label.className = 'option-card'

    const input = document.createElement('input')
    input.type = 'radio'
    input.name = name
    input.value = opt.id
    input.checked = selected === opt.id

    const title = document.createElement('div')
    title.className = 'option-title'
    title.textContent = opt.label || opt.id

    const help = document.createElement('div')
    help.className = 'option-help'
    help.textContent = opt.help || ''

    label.append(input, title, help)
    group.append(label)
  })
  return group
}

export function createModal(store) {
  const overlay = document.createElement('div')
  overlay.className = 'modal-overlay'
  overlay.style.display = 'none'

  const modal = document.createElement('div')
  modal.className = 'modal card'

  const header = document.createElement('div')
  header.className = 'modal-header'

  const title = document.createElement('h3')
  title.textContent = 'Run wizard'

  const closeBtn = document.createElement('button')
  closeBtn.className = 'button ghost'
  closeBtn.textContent = 'Close'
  closeBtn.addEventListener('click', () => {
    overlay.style.display = 'none'
  })

  header.append(title, closeBtn)

  const body = document.createElement('div')
  body.className = 'modal-body'

  modal.append(header, body)
  overlay.append(modal)

  const runner = createRunner(store)
  let step = 'setup'

  const setStep = (newStep) => {
    step = newStep
    render()
  }

  const renderWarnings = (family, selection) => {
    const warnBox = document.createElement('div')
    warnBox.className = 'warn-box'
    const matches = (family?.warnings || []).filter((w) => !w.ifWidth || w.ifWidth === selection.width)
    if (!matches.length) return null
    warnBox.innerHTML = ''
    matches.forEach((w) => {
      const p = document.createElement('p')
      p.textContent = w.msg
      warnBox.append(p)
    })
    return warnBox
  }

  const renderSetup = () => {
    body.innerHTML = ''
    title.textContent = 'Setup runs'

    const description = document.createElement('p')
    description.textContent = 'Choisis les familles de pistes à travailler. Un run sera créé par famille.'
    body.append(description)

    const existing = new Set((store.get('runs.queue') || []).map((r) => r.family))
    const defaults = existing.size ? existing : new Set(['LEAD', 'BACKS'])

    const selections = new Set(defaults)

    const list = document.createElement('div')
    list.className = 'option-grid'

    runConfig.families.forEach((fam) => {
      const label = document.createElement('label')
      label.className = 'option-card'
      const input = document.createElement('input')
      input.type = 'checkbox'
      input.value = fam.id
      input.checked = selections.has(fam.id)
      input.addEventListener('change', () => {
        if (input.checked) selections.add(fam.id)
        else selections.delete(fam.id)
      })

      const titleEl = document.createElement('div')
      titleEl.className = 'option-title'
      titleEl.textContent = fam.label

      const defaultsEl = document.createElement('div')
      defaultsEl.className = 'option-help'
      defaultsEl.textContent = `Default: ${[fam.defaults.depth, fam.defaults.width, fam.defaults.height]
        .filter(Boolean)
        .join(' / ')}`

      label.append(input, titleEl, defaultsEl)
      list.append(label)
    })

    const actions = document.createElement('div')
    actions.className = 'modal-actions'

    const startBtn = document.createElement('button')
    startBtn.className = 'button primary'
    startBtn.textContent = 'Valider setup'
    startBtn.addEventListener('click', () => {
      const chosen = Array.from(selections)
      if (!chosen.length) return
      runner.startRuns(chosen)
      setStep('placement')
    })

    actions.append(startBtn)
    body.append(list, actions)
  }

  const renderPlacement = () => {
    const runs = store.get('runs.queue') || []
    const activeId = store.get('runs.activeRunId') || runs[0]?.id
    const activeRun = runs.find((r) => r.id === activeId)

    if (!activeRun) {
      setStep('setup')
      return
    }

    body.innerHTML = ''
    title.textContent = `Placement — ${activeRun.label}`

    const family = runConfig.families.find((f) => f.id === activeRun.family)

    const depthGroup = createRadioGroup('depth', runConfig.placement.depth, activeRun.placement.depth)
    const widthGroup = createRadioGroup('width', runConfig.placement.width, activeRun.placement.width)
    const heightGroup = createRadioGroup('height', runConfig.placement.height, activeRun.placement.height)

    const section = document.createElement('div')
    section.className = 'stack'

    const sub = (label, node) => {
      const wrap = document.createElement('div')
      const h = document.createElement('h4')
      h.textContent = label
      wrap.append(h, node)
      return wrap
    }

    section.append(sub('Depth', depthGroup), sub('Width', widthGroup), sub('Height', heightGroup))

    const warning = renderWarnings(family, activeRun.placement)
    if (warning) section.append(warning)

    const actions = document.createElement('div')
    actions.className = 'modal-actions'

    const backBtn = document.createElement('button')
    backBtn.className = 'button'
    backBtn.textContent = 'Précédent'
    backBtn.disabled = !prevRun(runs, activeId)
    backBtn.addEventListener('click', () => {
      const prev = prevRun(runs, activeId)
      if (prev) {
        runner.goPrev()
        setStep('placement')
      } else {
        setStep('setup')
      }
    })

    const nextBtn = document.createElement('button')
    nextBtn.className = 'button primary'
    nextBtn.textContent = 'Valider placement'
    nextBtn.addEventListener('click', () => {
      const depth = depthGroup.querySelector('input:checked')?.value
      const width = widthGroup.querySelector('input:checked')?.value
      const height = heightGroup.querySelector('input:checked')?.value
      if (!depth || !width || !height) return
      runner.applyPlacement(activeId, { depth, width, height })
      setStep('priority')
    })

    actions.append(backBtn, nextBtn)
    body.append(section, actions)
  }

  const renderPriority = () => {
    const runs = store.get('runs.queue') || []
    const activeId = store.get('runs.activeRunId') || runs[0]?.id
    const activeRun = runs.find((r) => r.id === activeId)
    if (!activeRun) return setStep('setup')

    body.innerHTML = ''
    title.textContent = `Priority — ${activeRun.label}`

    const group = createRadioGroup('priority', runConfig.priority, activeRun.priority)

    const actions = document.createElement('div')
    actions.className = 'modal-actions'

    const prevBtn = document.createElement('button')
    prevBtn.className = 'button'
    prevBtn.textContent = 'Placement'
    prevBtn.addEventListener('click', () => setStep('placement'))

    const nextBtn = document.createElement('button')
    nextBtn.className = 'button primary'
    nextBtn.textContent = 'Valider priorité'
    nextBtn.addEventListener('click', () => {
      const selected = group.querySelector('input:checked')?.value
      if (!selected) return
      runner.applyPriority(activeId, selected)
      setStep('reference')
    })

    actions.append(prevBtn, nextBtn)
    body.append(group, actions)
  }

  const renderReference = () => {
    const runs = store.get('runs.queue') || []
    const activeId = store.get('runs.activeRunId') || runs[0]?.id
    const activeRun = runs.find((r) => r.id === activeId)
    if (!activeRun) return setStep('setup')

    body.innerHTML = ''
    title.textContent = `Reference — ${activeRun.label}`

    const usedWrap = document.createElement('div')
    usedWrap.className = 'option-grid compact'

    const yesLabel = document.createElement('label')
    yesLabel.className = 'option-card'
    const yes = document.createElement('input')
    yes.type = 'radio'
    yes.name = 'ref-used'
    yes.value = 'yes'
    yes.checked = activeRun.reference.used
    yesLabel.append(yes, document.createTextNode('Reference utilisée'))

    const noLabel = document.createElement('label')
    noLabel.className = 'option-card'
    const no = document.createElement('input')
    no.type = 'radio'
    no.name = 'ref-used'
    no.value = 'no'
    no.checked = !activeRun.reference.used
    noLabel.append(no, document.createTextNode('Pas de reference'))

    usedWrap.append(yesLabel, noLabel)

    const textarea = document.createElement('textarea')
    textarea.placeholder = 'Ce que je vérifie avec la référence'
    textarea.rows = 3
    textarea.value = activeRun.reference.whatToVerify || ''

    const actions = document.createElement('div')
    actions.className = 'modal-actions'

    const prevBtn = document.createElement('button')
    prevBtn.className = 'button'
    prevBtn.textContent = 'Priorité'
    prevBtn.addEventListener('click', () => setStep('priority'))

    const doneBtn = document.createElement('button')
    doneBtn.className = 'button primary'
    doneBtn.textContent = 'Enregistrer le run'
    doneBtn.addEventListener('click', () => {
      const used = usedWrap.querySelector('input[value="yes"]')?.checked || false
      const note = textarea.value.trim()
      if (used && !note) return
      runner.applyReference(activeId, used, note)
      runner.applyStatus(activeId, 'VALID')
      const nextId = nextRun(runs, activeId)
      if (nextId) {
        runner.goNext()
        setStep('placement')
      } else {
        overlay.style.display = 'none'
      }
    })

    actions.append(prevBtn, doneBtn)
    body.append(usedWrap, textarea, actions)
  }

  const render = () => {
    if (step === 'setup') return renderSetup()
    if (step === 'placement') return renderPlacement()
    if (step === 'priority') return renderPriority()
    if (step === 'reference') return renderReference()
  }

  const open = () => {
    step = (store.get('runs.queue') || []).length ? 'placement' : 'setup'
    overlay.style.display = 'flex'
    render()
  }

  return { overlay, open }
}
