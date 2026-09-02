# Implementation architecture

## Durable dependency direction

```text
Canonical YAML / Markdown / Schemas
              ↓
Validation and normalization (Python)
              ↓
Generated language-neutral runtime JSON
              ↓
Platform-neutral TypeScript domain contracts
              ↓
Platform-neutral application/state transitions
              ↓
Presentation/view models
              ↓
React + SVG browser presentation
```

The semantic core stores project IDs and typed Context Locators. It does not store DOM elements, SVG handles, rendered coordinates, browser history objects, or renderer-library graph objects.

## Key modules

- `src/domain/types.ts` — language-neutral runtime/domain contracts.
- `src/state/engine.ts` — deterministic semantic transitions for Selection, structural Entry/Follow, Scenarios, configuration switching, Concepts, Return, and Back/Forward.
- `src/state/store.ts` — Redux Toolkit host for semantic AppState; Redux is not the semantic contract.
- `src/view-model/` — deterministic Explore layout/scene and Detail view models.
- `src/runtime/repository.ts` — browser transport adapter for generated runtime JSON.
- `src/app/App.tsx` — browser presentation and semantic action dispatch.
- `scripts/content/` — canonical validation, 1.3 migration/runtime compilation, runtime integrity, property fixtures, and readiness.

## Rendering decision

Version 1 remains SVG-first. Current initial-five authored scenes are heavily aggregated and do not justify a Canvas/WebGL dense-layer backplane or renderer virtualization. The benchmark evidence is recorded under `reports/implementation/`.

Renderer optimization may change visual materialization only; it may not change semantic identity, Expansion Mode, Selection, Navigation, or accessibility targets.

## Schema state

- Later-candidate RSC content remains valid under the preserved 1.2.0 schema.
- The five Version-1 systems use the coordinated additive 1.3.0 migration covering population metadata, canonical Concept occurrence links, Scenario catalog identity, and structured properties.
- Concept metadata remains separately versioned at 1.0.0.

## Generated artifacts

`python scripts/content/build_runtime.py` writes deterministic runtime assets to `runtime/generated/` and mirrors them into `public/runtime/`. The generated manifest includes source/runtime revisions, initial/default system IDs, Concept IDs, and checksums.

Do not edit generated JSON directly.

## Tests

- Canonical Python validators and readiness checks: `python scripts/content/validate_all.py`
- TypeScript semantic/runtime tests: `npm test`
- Cross-browser E2E: `npm run test:e2e`
- Type checking: `npm run typecheck`

The Playwright configuration defines Chromium, Firefox, and WebKit projects and runs against the Vite production preview.
