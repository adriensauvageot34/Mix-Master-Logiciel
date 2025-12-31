import { getDoorPack } from '../domain/doorpacks.js'
import { validatePack, normalizePack } from '../domain/schema.js'
import { createDefaultState, createStore } from './store.js'
import { load, save } from './persistence.js'
import { bindAll } from './bindings.js'
import { mountAll } from './mounts.js'
import { renderLayout } from '../ui/layout.js'
import { createDrawer } from '../ui/viewer/drawer.js'
import { createModal } from '../ui/viewer/modal.js'
import { indexResources } from './indexer.js'

export function bootstrap({ doorId, runId = 'default' }) {
  const pack = normalizePack(getDoorPack(doorId))
  validatePack(pack, doorId)

  const restored = load(doorId, runId)
  const initial = restored || createDefaultState(doorId, runId, pack.tests)
  const store = createStore(initial)

  const resourceMap = indexResources(pack.resourcesHtml)
  const drawer = createDrawer(resourceMap)
  const modal = createModal(store)
  const { root, content } = renderLayout(pack, store, drawer, modal)

  const appRoot = document.getElementById('app')
  appRoot.innerHTML = ''
  appRoot.append(root)

  bindAll(content, store)
  mountAll(content, pack, store)

  store.subscribe(() => save(store.get()))
}
