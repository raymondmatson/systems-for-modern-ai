# Visual Design Phase 2 — Enclosures and Component Semantic Shells

**Status:** Implemented 2026-09-10  
**Scope:** Phase 2 only. No Phase 3 Anatomy integration, Phase 4 connection-language redesign, or Phase 5 state/Scenario overlay redesign is included here.

## Purpose

Phase 2 turns the Phase 0 visual contract and Phase 1 renderer seams into the first visible enclosure-first schematic language. The implementation is intentionally presentation-only: canonical containment, entity identity, Context Locators, Expansion Mode, Selection, Scenario semantics, and Anatomy interaction contracts remain unchanged.

The Phase 2 pilot focuses on the approved DGX H100 Representative compute-node context and the GB300 NVL72 rack context. The implementation is generic enough to render all current contexts, but the exit criteria are evaluated against those two pilot scenes.

## Implemented presentation contract

### Structural Location enclosure

`src/view-model/layout.ts` now returns derived enclosure geometry together with child-node geometry. `src/view-model/explore.ts` exposes that geometry as `SceneEnclosure`, including a presentation-only interior rectangle, title, structural shell family, Representative status, and optional population summary.

The enclosure represents the already-current Structural Location. It is not a semantic child, has no Context Locator of its own, is not focusable/selectable, and does not create containment.

`src/app/explore/EnclosureGlyph.tsx` renders structural shell families:

- `system-domain`
- `rack-enclosure`
- `assembly`
- `device`
- `fabric-domain`
- `support`

The distinctions are deliberately schematic. In particular, `rack_topology_domain` maps to `fabric-domain` rather than to a conventional rack shell so Ironwood is not forced into a server-rack visual metaphor before its later transfer test.

### Component role mapping

`src/view-model/visualRoles.ts` implements the exact Phase 0 `entity_type` → visual-role mapping for all 47 entity types in the current generated capability registry. Unknown future values fall back to `neutral_support`.

Allowed renderer roles remain:

- compute
- memory
- network
- storage
- power
- cooling
- management
- I/O / interconnect
- structure
- neutral support

The mapping uses `entity_type` only. Entity names and inventory classification do not control renderer behavior.

Each interactive component shell now includes three redundant role cues:

1. a restrained categorical role rail;
2. a small schematic role icon;
3. an explicit textual role label before the entity-type label.

Color therefore remains secondary and is not the sole role indicator.

### Imagery-ready media region

Every interactive component shell reserves a fixed, presentation-only media region. Phase 2 intentionally supplies only the role-icon fallback and marks the shell `data-has-media="false"`.

No canonical or runtime media field, file format, asset loader, image provenance model, or production method has been introduced. Future imagery can occupy this region without replacing the semantic name, role label, population cue, or interaction target.

### Aggregate and population treatment

Population-bearing entities now render with:

- two bounded decorative backplates to communicate repetition without materializing members;
- a prominent `×N`, `×?`, or `Repeated` count chip;
- a concise representation label (`aggregate`, `representative`, or `addressable`);
- the full population/count-basis/Expansion-Mode wording in the interactive target's accessible label.

Decorative backplates have no independent identity or focus target.

### Representative enclosure header

Representative Member Contexts now have an enclosure-level Representative marker and explicit context text. The H100 pilot renders as a Representative compute-node enclosure and states that it is an exemplar from population `×32`. No ordinal or generated member identity is created.

### Label hierarchy

Component glyphs now prioritize:

1. component name;
2. role + entity type;
3. population/representation status when present.

The rendered pilot exposed a CSS-specificity issue that initially enlarged metadata text and caused type labels to overrun the component shell. Phase 2 resolves it with label-layer-specific font rules rather than by hiding metadata or enlarging every card.

## Layout changes within Phase 2

The existing deterministic layout families remain in place. Phase 2 only makes the minimum geometry changes required for larger semantic shells and enclosure headers:

- component shells are now 236 × 112 presentation units;
- row/column spacing is increased enough to prevent aggregate backplate collisions;
- all semantic children are shifted below the enclosure header;
- `LayoutResult` now carries enclosure and interior bounds;
- the GB300 rack minimum height was reduced after rendered inspection because the legacy tall empty area became visually misleading once a physical enclosure frame existed.

That GB300 adjustment is intentionally bounded. Phase 3 still owns repeated rack-band composition and Anatomy placement zones; Phase 2 does not introduce literal U positions or detailed rack geometry.

## Deferred by design

The following remain unchanged or reserved for later approved phases:

- Anatomy Depictions still render in their existing detached three-column grid below the structural enclosure. Integration into enclosure interiors is Phase 3.
- Existing Cross-Connection strokes and external relationship cards remain unchanged. Relationship taxonomy, routing, and boundary ports are Phase 4.
- Existing Selection/focus/Scenario dash-based styling remains on the semantic shell/edge. Orthogonal state overlays are Phase 5.
- No Visual Key is populated yet.
- No component imagery asset is loaded or authored.
- No canonical schema, runtime format, state-engine rule, or domain type is changed for visual geometry/media.

## Verification

### Repository/content validation

`python scripts/content/validate_all.py` passes after the Phase 2 changes, including:

- all 16 Reference-System YAML files and 18 configuration documents;
- deterministic runtime artifact validation;
- 75/75 branch coverage audit;
- 65 entered physical-orientation contexts with zero errors;
- property fixtures 5/5.

The readiness report still has the same two pre-existing evidence gaps: documentation-confidence evidence and dependency/browser-E2E availability. Phase 2 introduces neither gap.

### Dependency-free TypeScript validation

A global TypeScript 5.8.3 smoke configuration with temporary React/Vitest declarations outside the repository compiles `src/**/*.ts(x)` and `tests/unit/**/*.ts` with zero diagnostics.

A separate temporary Playwright declaration smoke compiles the E2E test source, including the new Phase 2 browser assertions, with zero diagnostics.

### Executable view-model/runtime smoke

The actual generated H100 and GB300 runtime JSON was passed through the compiled `buildExploreScene()` implementation. Assertions verified:

- H100 current enclosure is `assembly` + Representative;
- H100 context states exemplar population `×32`;
- H100 GPU population `×8`, system-memory population `×32`, and BMC role `management`;
- all H100 semantic child bounds remain inside the derived enclosure;
- Anatomy stays below/outside that enclosure until Phase 3;
- GB300 current enclosure is `rack-enclosure`;
- compute trays are `compute`, `×18`, Representative-capable;
- NVLink switch trays are `network`, `×9`, Representative-capable.

### Executable renderer smoke

The extracted Phase 1 Explore components were compiled to a temporary CommonJS renderer with a minimal JSX-runtime adapter outside the repository. Assertions verified:

- the eight-layer SVG order remains unchanged;
- `EnclosureGlyph` produces a noninteractive enclosure frame and Representative ribbon;
- interactive entity targets retain `role="button"`, keyboard Selection, and semantic callbacks;
- node shells expose role/shell/population presentation attributes;
- aggregate backplates and media-region fallback are decorative children of the same semantic target;
- labels remain `aria-hidden` and noninteractive;
- empty-canvas clearing remains wired to the existing callback.

### Rendered Chromium inspection

Static snapshots generated from the real view model + extracted SVG components were loaded in system Chromium via Python Playwright and inspected for the two approved pilot scenes. This caught and resolved the metadata-size issue and the oversized GB300 legacy rack bound. The final snapshots show:

- H100: one explicit Representative compute-node enclosure, visible role distinctions, `×2/×4/×8/×32` population cues, and no per-member identity fabrication;
- GB300: one rack-scale enclosure containing two visually distinct repeated populations, `×18` compute trays and `×9` NVLink switch trays.

The static snapshot harness is verification-only and is not a repository artifact or substitute for the normal browser E2E suite.

### Pinned npm/browser gates

The supplied repository ZIP still contains no `node_modules`.

- `npm test` cannot execute because `vitest` is not installed.
- `npm run typecheck` cannot resolve the configured `node`, `vite/client`, and `vitest/globals` type packages.
- normal Vite build and project Playwright E2E are therefore not rerun in the pinned dependency environment here.

These are environment limitations, not observed Phase 2 code failures. Dedicated unit/E2E coverage has been added for the next dependency-capable run.

## Phase 2 exit assessment

**Satisfied.** The H100 and GB300 pilot scenes now visually answer the Phase 2 containment/scale questions before connection redesign:

- the current Structural Location is visible as an enclosure rather than only as navigation text;
- semantic children visibly sit inside that enclosure;
- subsystem roles are redundant and readable without color alone;
- aggregate populations read as repeated rather than as one literal device;
- H100 Representative context is visibly noncanonical and tied to the modeled population;
- GB300 compute trays and NVLink switch trays are visibly distinct `×18` and `×9` populations.

Phase 3 remains responsible for integrating Anatomy Depictions and refining deterministic composition templates. Do not interpret the current child coordinates or enclosure proportions as sourced mechanical placement or dimensions.
