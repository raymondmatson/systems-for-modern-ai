# Visual Design Phase 1 — Explore Renderer Composition

**Status:** Phase 1 implementation note  
**Date:** 2026-09-10  
**Authority:** Implementation-facing documentation only. Product semantics remain governed by `Systems_for_Modern_AI_Project_Source_of_Truth.md`; the approved visual channel contract remains in `VISUAL_DESIGN_PHASE0_PRESENTATION_CONTRACT.md`.

## Purpose

Phase 1 refactors the browser Explore presentation into composable React/SVG layers without implementing the later enclosure, role, relationship, Scenario, or state redesigns. The goal is to give those later phases stable renderer seams while preserving the current semantic actions and current visible behavior as closely as possible.

No canonical content, source schema, generated runtime format, state-engine semantics, Context Locator behavior, or view-model geometry contract changes in this phase.

## Renderer component boundary

Explore rendering now lives under `src/app/explore/`:

- `ExploreCanvas.tsx` — owns the SVG viewport and ordered rendering layers.
- `NodeGlyph.tsx` — owns interactive entity shells and the separate noninteractive label glyph.
- `ConnectionGlyph.tsx` — owns current interactive projected Cross-Connection rendering.
- `AnatomyGlyph.tsx` — owns current noninteractive Anatomy Depiction rendering.
- `EnclosureGlyph.tsx` — reserved Phase 2 seam; intentionally renders nothing in Phase 1.
- `BoundaryConnectionGlyph.tsx` — reserved Phase 4 seam; intentionally renders nothing in Phase 1 while current external relationship cards remain authoritative UI.
- `ScenarioStrip.tsx` — extracts the existing authored Scenario description presentation; Phase 5 owns its instructional redesign.
- `VisualKey.tsx` — reserved Phase 4 seam; intentionally renders nothing in Phase 1.
- `ExploreSupportingViews.tsx` — owns the existing external Cross-Connection cards and semantic Explore outline without changing their behavior.
- `layers.ts` — single ordered layer contract used by the SVG renderer and unit coverage.
- `types.ts` — shared callback contracts for Preview and Selection dispatch supplied by `App.tsx`.

`src/app/App.tsx` remains responsible for application/state wiring: it builds view models, owns Preview timers, dispatches semantic actions, handles browser-history integration, and supplies semantic callbacks to the extracted Explore presentation.

## SVG layer order

The canvas renders the following direct SVG groups in this order:

1. `scenario-underlays`
2. `enclosure-frame`
3. `anatomy-context`
4. `connections-routing`
5. `interactive-entity-shells`
6. `labels-counts-role-rails`
7. `scenario-markers`
8. `selection-focus-descendant-overlays`

Phase 1 deliberately leaves several layers empty. This is intentional sequencing, not incomplete Phase 1 work:

- Scenario underlays and markers are populated in Phase 5.
- Enclosure geometry is populated in Phase 2.
- On-canvas boundary connections and Visual Key are populated in Phase 4.
- Dedicated Selection/focus/descendant overlay rendering is populated in Phase 5.

Current node/edge state CSS remains attached to the existing interactive shell/edge elements until Phase 5 so this structural refactor does not silently introduce the new state visual language early.

## Interaction preservation

The extracted renderer preserves the established action boundary:

- interactive SVG nodes and connections receive already-derived Context Locators;
- pointer/focus Inspect callbacks are supplied by `App.tsx`;
- click/tap and Enter/Space invoke the same Selection callback as before;
- empty SVG background invokes the same clear-Selection callback;
- Anatomy Depictions remain nonfocusable and `aria-hidden` in the SVG interaction layer;
- external Cross-Connections remain visible/selectable in the existing card list;
- the semantic Explore outline remains available and mirrors the same semantic targets;
- the extracted renderer imports no state-engine transition functions and does not mutate AppState.

Entity labels were moved into the dedicated label layer above interactive shells. The label layer has `pointer-events: none`, so pointer interaction resolves to the semantic shell beneath it and keyboard focus remains on the interactive shell.

## Validation coverage

Phase 1 adds:

- `tests/unit/explore-renderer-layers.test.ts` to lock the eight-layer ordering contract;
- a Playwright case in `tests/e2e/explore.spec.ts` that verifies the direct SVG layer order and confirms keyboard focus/Enter still reaches the interactive entity target.

Existing E2E coverage remains the primary behavioral regression suite for Inspect, Select, Enter, clear Selection, Return, breadcrumbs, Cross-Connections, representative traversal, narrow scrolling, and Anatomy noninteraction.

## Deferred by design

The following are **not** Phase 1 defects or omissions; they belong to later approved phases:

- visible Structural Location enclosure geometry;
- semantic component shells, role rails/icons, media region, Representative header, and aggregate stack/count treatment;
- integrated interior Anatomy zones/evidence treatment;
- canonical seven-family connection syntax, directionality markers, routing, and boundary ports;
- contextual Visual Key;
- orthogonal Selection/focus/Scenario/descendant overlays;
- explanatory Scenario strip redesign.
