# Copilot Instructions for mix-doors-app

## Architecture Overview
This is a modular "door pack" engine built with Vite. The app engine (`app/`) is strictly separated from door content (`doors/`). Doors are static bundles imported at build-time, not fetched at runtime. Each door contains JSON configs (meta, manifest, rules, tests, paths, targets) and HTML/CSS content.

Key components:
- **Core**: Bootstrap loads door pack, validates/normalizes, creates store, indexes resources, renders layout with mounts/bindings.
- **Domain**: Doorpacks registry (manually import each door), schema validation/normalization.
- **UI**: Layout renders sidebar (from manifest.sections), content (door.contentHtml), drawer (resources), modal.
- **Mounts**: Dynamic UI generation for [data-mount] elements (path-picker, target-picker, tests-table).
- **Bindings**: Two-way data binding for [data-bind] elements, synced to store.
- **Store**: Path-based get/set state manager, persisted to localStorage as `mix-doors-state:{doorId}:{runId}`.

## Adding a New Door
1. Run `node tools/scaffold-door.js Pxx` to copy `_template` and replace placeholders.
2. Edit the new door's JSON/HTML files in `doors/Pxx/`.
3. Add imports in `app/domain/doorpacks.js` for all 9 files (meta.json, manifest.json, etc.).
4. Add entry to PACKS object in `doorpacks.js`.
5. Run `node tools/validate-pack.js doors/Pxx` to check validity.
6. Update `app/main.js` bootstrap call if needed (defaults to '_template').

## Key Conventions
- **Door Structure**: Each door folder must have exactly: door.meta.json, door.manifest.json, door.rules.json, door.tests.json, door.paths.json, door.targets.json, door.content.html, door.resources.html, door.css.
- **Content HTML**: Use `[data-section-id]` for sections listed in manifest.sections. Use `[data-mount="path-picker|target-picker|tests-table"]` for dynamic UI. Use `[data-bind="store.path"]` for form inputs. Use `[data-open-resource="id"]` for drawer links.
- **Resources HTML**: Wrap each resource in element with `[data-resource-id]` matching manifest.resources.
- **State Paths**: `paths.selection.trials` (array), `paths.selection.commit` (string), `targets.primary` (string), `targets.secondary` (array), `tests[idx].skipped` (bool).
- **Rules**: `trialMax` limits selected trials, `commitRequired` enforces commit selection, `done` array defines completion conditions (e.g., requiredField, requiredTestNotSkipped).
- **Validation**: Sections/resources must have matching content, test IDs unique.

## Development Workflow
- **Build/Run**: `npm run dev` (Vite dev server), `npm run build` (production bundle), `npm run preview` (serve build).
- **Debugging**: State changes auto-save to localStorage. Use browser dev tools to inspect store (no console logs by default).
- **Testing**: No automated tests; manual validation via UI and `validate-pack.js`.
- **Styling**: Per-door CSS injected into document.head. Use CSS custom properties from `themes/tokens.css`.

## Examples
- Mount path picker: `<div data-mount="path-picker"></div>` → generates trials checkboxes (limited by rules.trialMax) and commits radio buttons.
- Bind input: `<input data-bind="targets.primary" type="radio" value="option1">` → syncs to store.targets.primary.
- Open resource: `<button data-open-resource="res-overview">View</button>` → opens drawer with indexed resource.</content>
<parameter name="filePath">/workspaces/Mix-Master-Logiciel/.github/copilot-instructions.md