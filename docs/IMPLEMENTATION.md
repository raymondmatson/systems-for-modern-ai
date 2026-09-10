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
- `src/app/App.tsx` — browser application shell, semantic action dispatch, Preview timing, and Explore/Concepts orchestration.
- `src/app/explore/` — composable SVG Explore presentation layers and supporting Explore-only views; these consume view-model data and callbacks and do not own semantic state transitions.
- `scripts/content/` — canonical validation, 1.4 physical-anatomy/Product-Catalog migration/runtime compilation, runtime integrity, property fixtures, and readiness.

## Rendering decision

Version 1 remains SVG-first. Current initial-five authored scenes are heavily aggregated and do not justify a Canvas/WebGL dense-layer backplane or renderer virtualization. The benchmark evidence is recorded under `reports/implementation/`.

The Explore SVG is organized into a stable eight-layer presentation order: Scenario underlays; enclosure frame; Anatomy/background context; Cross-Connections/routing; interactive entity shells; labels/counts/role rails; Scenario markers; and Selection/focus/descendant overlays. Phase 1 established these composition seams. Phase 2 populated the enclosure layer and semantic component shells with derived Structural-Location bounds, structural shell families, `entity_type`-driven role rails/icons, a media-capable presentation region, Representative-context headers, and bounded aggregate repetition/count cues. Phase 3 now derives deterministic composition regions inside the enclosure, adapts zero-image media/label fit for dense scenes, gives rack populations explicitly nonliteral bands, and integrates Anatomy Depictions into subdued support regions inside the current enclosure. Boundary connections/Visual Key remain deferred to Phase 4; orthogonal cross-object state overlays remain deferred to Phase 5. `App.tsx` continues to supply semantic callbacks rather than placing state-transition rules inside renderer components.

Renderer optimization may change visual materialization only; it may not change semantic identity, Expansion Mode, Selection, Navigation, or accessibility targets.

Phase 3 presentation geometry remains discardable view-model state. `src/view-model/visualRoles.ts` implements the Phase-0-frozen `entity_type` → visual-role mapping with a neutral fallback and maps Anatomy `depictionKind` into the same presentation-role family without turning depictions into Entities. Inventory category and entity names do not drive rendering behavior. Interactive component shells remain media-capable, but a no-asset fallback may collapse to an icon-only mode when deterministic density/name-fit rules require the space; no canonical image/asset field or loader exists yet. Population backplates/count chips are visual replicas only and do not create member identity. Composition regions and rack population bands are renderer-only groupings and never become canonical containment parents.

## Schema state

- The current authored RSC corpus is split evenly by configuration: **9 configurations on 1.4.0** and **9 configurations on preserved 1.2.0**. The five Version-1 systems are all on 1.4.0; AMD Helios, AWS Trainium2/Rainier, and both OCI configurations have also migrated to 1.4.0 as later-candidate content work.
- The coordinated additive 1.4.0 contract retains the 1.3.0 population/Concept/Scenario/property model and adds exact revisioned Product Catalog references plus noninteractive Anatomy Depictions for source-supported physical orientation. The 1.3.0 schema is retained for compatibility/history even though no current authored system file uses it.
- Concept metadata remains separately versioned at 1.0.0.

## Device-interior physical coverage

Explore contextual Entry is intentionally broader than semantic containment: a contextual-capability entity may be enterable because it has representative-member expansion, semantic children, authored Anatomy Depictions, or a direct architectural relationship. The physical-orientation audit mirrors those UI rules so relationship endpoints cannot silently open to an empty scene.

For the initial five Reference Systems, terminal devices with useful physical detail now use authored Anatomy Depictions when a deeper interactive entity hierarchy would add little semantic value. Examples include accelerator packages and attached memory, CPU/memory interfaces, NIC/DPU controllers and external interfaces, NVMe controller/media/interface groupings, switch silicon/port banks/management I/O/power/fan assemblies, rack power/cooling support, optical/DCN boundaries, Cerebras appliance internals at published generality, and Meta switch/storage internals.

An Anatomy Depiction remains noninteractive and does not become an Entity, Selection target, Scenario target, Concept occurrence, or independent accessibility focus target. A terminal entity with authored anatomy may nevertheless expose **Enter** so the user can inspect its physical interior. Explore now renders Anatomy Depictions inside a subdued, presentation-only support region within the current Structural Location enclosure. All-schematic scenes carry an enclosure-level notice that presence is supported while positions are not literal; documented placement remains distinct when authored and is currently exercised synthetically because the initial-five production depictions are schematic. Evidence uses badges/patterns rather than Cross-Connection/state dash syntax. The compact canvas cue shows an authored count when present, while Count Basis and the fuller evidence/placement wording remain in Detail. Device-specific documented details are labeled verified; inferred/simplified details remain explicitly representative/simplified. Detail remains the equivalent accessible semantic summary, and Anatomy remains absent from keyboard/focus targets.

Vendor- or deployment-specific boundaries remain explicit black boxes where physical internals cannot be established reliably. The renderer must not infer a standard server/switch/storage anatomy merely from `entity_type`.

## Generated artifacts

`python scripts/content/build_runtime.py` writes deterministic runtime assets to `runtime/generated/` and mirrors them into `public/runtime/`. The generated manifest includes source/runtime revisions, initial/default system IDs, Concept IDs, and checksums.

The generated capability registry is part of that normalized runtime contract: it uses camelCase keys (`schemaVersion`, `entityTypes`, `entityType`, `supportsConcepts`, `detailSections`, `scenarioStateCategories`, and `structuralRole`). Browser/domain consumers must read that generated shape directly rather than reusing the snake_case canonical YAML field names. Runtime-shape unit coverage exercises the generated registry through initial Detail rendering so compiler/consumer drift fails before deployment.

Do not edit generated JSON directly.

## Tests

- Canonical Python validators and readiness checks: `python scripts/content/validate_all.py`
- TypeScript semantic/runtime tests: `npm test`
- Cross-browser E2E: `npm run test:e2e`
- Type checking: `npm run typecheck`

The Playwright configuration defines Chromium, Firefox, and WebKit projects and runs against the Vite production preview.
