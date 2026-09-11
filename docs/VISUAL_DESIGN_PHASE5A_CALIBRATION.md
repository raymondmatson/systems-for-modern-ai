# Visual Design Phase 5A — Integrated visual calibration

**Status:** Completed 2026-09-10  
**Scope:** Presentation calibration of the completed H100, GB300, and Meta pilot grammar before Phase 6 software/accessibility validation. No canonical content, semantic model, state-engine rule, or asset contract changed.

## What was reviewed

The post-Phase-5 renderer was reviewed as an integrated visual system rather than as separate feature layers. Real generated runtime data was used for seven deterministic pilot states:

- H100 Representative compute node — baseline;
- H100 Representative compute node — checkpoint/storage Scenario with the representative storage NIC selected and Previewed;
- GB300 rack — baseline;
- GB300 rack — North/South storage pressure with the compute-tray aggregate selected and Previewed;
- Meta root — baseline;
- Meta root — checkpoint/storage burst with the storage-path Cross-Connection selected and Previewed;
- Meta root — RoCE congestion with the RoCE fabric selected and Previewed.

Additional renders exercised a narrow canvas, grayscale, and Chromium forced-colors emulation. The exact future regression states are recorded in `tests/fixtures/visual-regression-phase5a.json`; Phase 6 should generate its own pinned Playwright screenshots from that manifest rather than committing this handoff's ad-hoc calibration images.

## Calibration findings

The integrated hierarchy is coherent after Phases 2–5:

- enclosure frames read as Structural Location without competing with child Selection;
- semantic component shells remain visually stronger than noninteractive Anatomy Depictions;
- role rail/icon/text cues remain usable when color is removed;
- aggregate/Representative cues remain distinct from Selection/focus and Scenario state;
- Phase-4 relationship syntax remains readable underneath Phase-5 edge overlays;
- Meta's checkpoint data path avoids the RoCE shell and remains visibly distinct from the physical RoCE connection;
- Scenario deemphasis leaves unaffected structure legible;
- the imagery-ready zero-asset fallback reads as a complete schematic rather than an unfinished image placeholder;
- rack/system spacing does not introduce a new literal placement or dimension claim.

One concrete presentation issue remained: boundary destination labels were limited to one 28-character line, so several H100 and GB300 destinations were visibly ellipsized even though the available 150-pixel presentation gutter could support a second line. This weakened rapid distinction among compute-fabric, storage-fabric, management, cooling, and power continuations.

## Adjustment made

`BoundaryConnectionGlyph` now uses a bounded two-line `svgLabelFit(..., 28, 2)` treatment, vertically centered around the existing schematic boundary-label anchor. The boundary-label text size was calibrated from 9px to 9.5px. No endpoint name, route, port position, relationship family, interaction target, or containment rule changed.

The pilot destination labels now render without ellipsis, including:

- In-band management Ethernet switches;
- Out-of-band management network;
- Compute-fabric InfiniBand switches;
- Storage-fabric InfiniBand switches;
- East/West compute fabric switches;
- North/South converged fabric switches;
- Rack-scale liquid-cooling infrastructure;
- SN2201 out-of-band management switches;
- Rack power shelves.

The full relationship name remains available through the existing `<title>` and accessible relationship presentation. The two-line text remains noninteractive for decorative boundary continuations and remains part of the same interactive relationship group when the boundary relationship itself is the focusable target.

## Rendered verification

A system-Chromium `set_content` harness rendered the exact current Explore view-model and extracted SVG components after dependency-free TypeScript compilation. It generated desktop renders for all seven states above, plus narrow, grayscale, and forced-colors variants.

A rendered geometry check using browser `getBoundingClientRect()` found, after the label calibration:

- H100 baseline: 4 boundary labels, 9 semantic nodes, 4 Anatomy Depictions, **0 checked label/bounds collisions**;
- H100 stressed: 4 boundary labels, 9 semantic nodes, 4 Anatomy Depictions, **0 checked label/bounds collisions**;
- GB300 baseline: 5 boundary labels, 2 semantic nodes, 1 Anatomy Depiction, **0 checked label/bounds collisions**;
- GB300 stressed: 5 boundary labels, 2 semantic nodes, 1 Anatomy Depiction, **0 checked label/bounds collisions**;
- Meta baseline/checkpoint/RoCE-congestion: 3 semantic nodes each, **0 checked label/bounds collisions**.

The automated geometry check verifies that calibrated boundary labels remain inside the SVG area, do not overlap one another, and that visible node/Anatomy text remains within its corresponding shell. It is a calibration aid, not a replacement for the Phase-6 project Playwright/browser matrix.

## Narrow and non-color review

The established narrow-screen behavior remains appropriate: the semantic canvas retains its 760px minimum width and scrolls rather than shrinking labels to illegibility. Scenario Context stacks above the canvas, and the Connection Key wraps below it.

Grayscale review retains differentiation through shell/rail geometry, role icons and text, relationship dash/marker syntax, Selection/focus outlines, Scenario `S` markers, aggregate count chips/backplates, and Representative text. Chromium forced-colors emulation likewise preserves the structure and text hierarchy in the calibration harness. Phase 6 still owns authoritative keyboard, screen-reader, high-contrast, reduced-motion, and supported-browser verification with the pinned application dependencies.

## Approved Phase-6 regression candidates

`tests/fixtures/visual-regression-phase5a.json` freezes seven semantic scene states and ten bounded render variants. It intentionally does **not** include Ironwood or Cerebras; those remain the Phase-7 transfer gate. It also does not commit screenshots produced by this handoff, because Phase 6 must generate regression baselines from the pinned project/browser environment.

## Verification-harness corrections and remaining limitations

The calibration harness was reconciled against current generated runtime before the Phase-5A fixture was accepted. Two stale shorthand identifiers were corrected: `baseline` was replaced by the authored `baseline-normal-operation` Scenario ID, and the Meta root fixture was corrected from `meta-cluster` to the generated root entity `meta-h100-roce`. The H100 stress state also uses the established Representative locator path rather than a canonical child locator. These were verification-fixture corrections only; no production semantics changed.

- The supplied repository still has no `node_modules`. `npm test` therefore reports `vitest: not found`; normal `npm run typecheck` cannot resolve the pinned Node/Vite/Vitest types; `npm run build` completes content generation/validation and then stops at that typecheck gate before Vite bundling; and `npm run test:e2e` cannot invoke the project Playwright runner from the absent dependency tree. Phase 6 may not be marked complete until those dependency-backed gates are actually run or the phase remains explicitly incomplete.
- Chromium forced-colors emulation is useful calibration evidence but not a substitute for OS/browser assistive-technology testing.
- The current textual Cross-Connection views remain alongside boundary stubs pending Phase-6 accessibility/tab-order evaluation.

No Planning decision or project-owner input is required from Phase 5A.
