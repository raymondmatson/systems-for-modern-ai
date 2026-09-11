# Visual Design Phase 7 — Ironwood / Cerebras transfer and sparse calibration

**Status:** Completed 2026-09-10  
**Scope:** Transfer the approved visual grammar to Ironwood and Cerebras, implement the approved presentation-only flattened Ironwood torus, and compact sparse transfer contexts without adding canonical topology or physical dimensions.

## Transfer scenes

Phase 7 validates five real-runtime contexts:

- Ironwood root;
- Ironwood cube / topology domain;
- Cerebras root;
- Representative CS-3;
- Representative WSE-3.

The deterministic fixture is `tests/fixtures/visual-regression-phase7.json`. Render/geometry evidence is in `reports/implementation/phase7-transfer-validation.json` and `reports/implementation/phase7-transfer-images/`.

## Flattened Ironwood torus

The torus is a **presentation-only topology depiction** derived only in the specifically authorized Ironwood cube context when the current runtime supplies the `torus` Concept occurrence and documented 3D-torus evidence.

- The flat field teaches three **abstract topology dimensions A / B / C**. They are not physical X/Y/Z axes.
- It intentionally does not instantiate 64 chip nodes, choose an undocumented 4×4×4 lattice, or claim exact chip coordinates/dimension lengths.
- Each example wrap connection has two visible portions at opposite field boundaries. Both portions share one presentation key and matching continuation marker (`A1`, `B1`, or `C1`), so they represent one conceptual wraparound connection rather than two system elements.
- The depiction is `aria-hidden`, nonfocusable, nonselectable, has no Context Locator / canonical Connection ID / Follow action / Scenario target, and does not create containment.
- A visible `Flattened torus guide` provides the static accessible/explanatory correspondence. No essential meaning depends on hover.

The implementation lives in `src/view-model/topologyDepictions.ts` and `src/app/explore/TopologyGlyph.tsx`. This is a narrow presentation exception, not a generalized Concept-to-topology rendering rule.

## Sparse transfer compaction

Phase 7 found that the initial transfer layouts reserved more blank internal height than their visible content justified in three known entered contexts. `shouldCompactTransferContext()` now scopes deterministic compaction to:

- the Ironwood cube;
- Representative CS-3;
- Representative WSE-3.

The rule is presentation-only and content-derived. It does not infer dimensions, hidden children, empty chassis volume, or physical distances. WSE-3 was added after rendered validation exposed the same issue there; its current compact scene shows AI compute cores `×900000`, SRAM, and wafer mesh without literal member materialization.

## Phase-6 regression dependency

Phase 7 touches shared renderer/view-model/CSS files, so the pilot baseline was checked explicitly against the supplied post-Implementation-Continued baseline. All seven frozen Phase-5A pilot states serialize to byte-identical exact-current-renderer markup with identical non-timing structural metrics. Existing CSS is an exact prefix of the Phase-7 stylesheet; the additions are topology-scoped. `reports/implementation/phase7-pilot-regression.json` records the hashes and result.

Therefore the Phase-7 branches do not invalidate the user-confirmed Phase-6 pilot screenshots/accessibility evidence. This comparison does **not** claim that the new transfer-specific Vitest/Playwright tests were executed by this handoff in the pinned npm environment.

## Validation

- `scripts/validation/phase7_transfer.py` — pass across all five transfer scenes using the exact current Explore view-model/components and system Chromium geometry inspection.
- `tests/unit/visual-design-phase7-transfer.test.ts` — transfer contract coverage for source scoping, split-wrap identity, no canonical-ID collision, sparse compaction, disaggregation, and symbolic `×900000` aggregation.
- `tests/e2e/explore.spec.ts` — browser-contract coverage added for the flattened torus, no topology focus targets/semantic-outline elements, matching wrap markers, and Cerebras compact aggregate scenes.
- Canonical/runtime validation remains unchanged/green; no RSC, schema, generated runtime, domain-state semantic, or package-dependency change is part of Phase 7.

## Phase 7A handoff

The transfer implementation is ready for human comprehension testing. The finalized moderated protocol and empty results template are under `reports/testing/`. No participant comprehension claim is made by Phase 7 implementation evidence.
