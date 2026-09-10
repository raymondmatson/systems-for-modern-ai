# Visual Design Phase 3 — Deterministic Layout, Density Fit, and Integrated Anatomy

**Status:** Implemented 2026-09-10  
**Scope:** Visual Design Plan Phase 3 only. Phase 4 connection-language/boundary-port work has not begun.

## Purpose

Phase 3 strengthens the enclosure-first Explore presentation established in Phases 1–2 without changing product semantics. It gives each current Structural Location deterministic presentation regions, adapts zero-image component shells for dense labels, makes repeated rack populations read as schematic populations rather than empty mechanical volume, and places noninteractive Anatomy Depictions inside the enclosure they describe.

All geometry and region membership in this phase are derived renderer state. They do not create canonical containment, physical coordinates, dimensions, ordering, member identity, or new connection semantics.

## Implemented presentation contract

### Deterministic composition regions

`src/view-model/layout.ts` now derives presentation regions alongside node positions. The layout families remain deterministic and architecture-sensitive:

- **system/domain** scenes receive broad compute/structural, network/fabric, and storage/support bands when those roles are present;
- **rack** scenes receive explicit nonliteral population bands, including separate compute and network/switching populations for GB300;
- **assembly/node/device** scenes retain compact semantic-child composition with reserved support/anatomy space;
- **fabric/topology** scenes receive topology-oriented role bands without inferring unmodeled topology;
- **generic/internal** scenes retain deterministic grid behavior with a bounded support region where anatomy is present.

The layout result also reserves enclosure header and future boundary-port space. These regions are visual groupings only; `SceneNode` identity and Context Locators remain unchanged.

### Density-aware media and label fit

The Phase-2 component shell remains imagery-capable, but an empty media placeholder no longer has to consume a fixed visible block in dense or long-name scenes. Deterministic fit rules select either:

- **full** fallback: media-capable box plus role icon; or
- **compact** fallback: role icon only, leaving additional width for the component name.

Name wrapping is deterministic and records whether visible truncation occurred. Full semantic names remain in accessible/title/Preview/Detail presentation. The real H100 dense scene now uses compact fallbacks for all nine semantic children and retains distinguishing labels such as the storage/in-band Ethernet card name without avoidable truncation.

### GB300 rack population composition

The GB300 rack now derives separate **Compute population · schematic** and **Network / switching population · schematic** bands. The bands are explicitly `nonliteral` presentation regions and do not assert U positions, front/rear placement, rack dimensions, mechanical ordering, or new containment.

The rack enclosure-level notice states that population bands and Anatomy positions are nonliteral. This reduces unsupported-looking empty enclosure volume while retaining the approved schematic treatment.

### Integrated Anatomy Depictions

Anatomy Depictions now occupy a subdued **Physical anatomy · noninteractive** support region inside the current enclosure rather than a detached card tray below the structural scene. The semantic-child layer remains visually primary and layout checks prevent Anatomy cards from overlapping semantic nodes.

Anatomy remains noninteractive:

- no Context Locator or semantic Entity identity is created;
- no Selection, Enter, Follow, Concept occurrence, or Scenario target is introduced;
- renderer groups remain `aria-hidden`/nonfocusable;
- Detail provides the equivalent accessible physical-orientation summary.

### Placement and evidence treatment

All initial-five production Anatomy Depictions currently use schematic placement, so those scenes use an enclosure-level message such as **Schematic arrangement · anatomy presence is supported; positions are not literal** rather than repeating a placement badge on every card.

A synthetic fixture verifies the documented-placement treatment. The fixture shows **Documented placement** at the depiction level while also verifying that the source depiction receives no `x`/`y` coordinate fields. No production content was changed merely to exercise this presentation state.

Evidence is encoded with quiet badges and internal treatment rather than line-dash syntax reserved for later relationship/state work. A compact Anatomy card displays an authored count such as `×6` when useful; Count Basis stays in Detail so the visual card does not become overcrowded.

## Pilot outcomes

### DGX H100 representative compute node

- nine semantic children remain visually primary and readable with zero external component images;
- all use compact no-image role-icon fallbacks under the current density rule;
- the Representative enclosure continues to communicate exemplar-from-`×32` context;
- four Anatomy Depictions—power supply, baseboard assemblies, fan/airflow, and PCIe/interposer fabric—now appear inside a separate support region;
- semantic nodes and Anatomy cards do not overlap;
- the enclosure states that Anatomy placement is schematic/nonliteral.

### GB300 NVL72 rack

- compute trays `×18` and NVLink switch trays `×9` occupy separate nonliteral rack population bands;
- the rack cooling Anatomy Depiction sits in an internal support/anatomy zone;
- the layout no longer depends on a large empty rack box to imply organization;
- no literal U positions or mechanical dimensions are introduced.

### Early root-fit smoke

Meta, Ironwood, and Cerebras root scenes were rendered as a lightweight fit smoke—not the later Phase-7 transfer test. Their current visible labels fit without recorded truncation, and the deterministic composition did not require a GPU-server-only metaphor. No Ironwood torus edges were inferred.

## Problems found and resolved

1. **Anatomy count/basis overflow in H100.** The first rendered H100 browser inspection showed `6 · documented fixed` overflowing the compact power-supply Anatomy card. The canvas cue was reduced to the authored count `×6`; Count Basis remains in the Detail summary. This preserves information while respecting the canvas label hierarchy.
2. **Browser file-navigation restriction in the verification harness.** Local `file:`/localhost navigation was blocked by the execution environment. Browser visual inspection was still completed with system Chromium by injecting the generated static HTML through Playwright `set_content`. This is an external verification-harness adjustment, not a repository/runtime behavior change.
3. **Synthetic documented-placement coverage was initially layout-only.** The Phase-3 unit fixture was strengthened to build an Explore scene and verify the visible documented-placement badge while confirming that no canonical coordinates were added.

No problem required a substantive product or plan decision.

## Validation performed

- `python scripts/content/validate_all.py` — **PASS**, including deterministic runtime integrity, 75/75 branch coverage, 65 entered physical-orientation contexts with zero errors, and 5/5 Property fixtures.
- Dependency-free TypeScript compilation of source/view-model modules — **PASS**.
- Dependency-free TypeScript compilation of changed/new unit tests — **PASS**.
- E2E-spec TypeScript/syntax smoke using external temporary declarations — **PASS**.
- Executable real-runtime view-model smoke for H100, GB300, Meta, Ironwood, and Cerebras — **PASS**.
- Executable extracted Explore SVG-component smoke — **PASS**.
- System-Chromium rendered inspection of the five Phase-3 smoke scenes — **PASS after the H100 Anatomy count-fit correction**.

The shared repository ZIP does not contain `node_modules`, so the normal pinned `npm test`, repository `npm run typecheck`, Vite build, and project Playwright browser matrix cannot be executed in this environment. Dedicated regression coverage has been added/updated for the next dependency-capable run; this is a verification-environment gap rather than a known Phase-3 defect.

## Deferred by design

Phase 3 does **not** implement:

- relationship-family visual syntax;
- connection-specific overlay separation;
- boundary ports/stubs or routing redesign;
- Visual Key behavior;
- cross-object Selection/focus/Scenario visual redesign;
- Scenario strip;
- component image asset source/schema/loader.

Those remain assigned to later phases in the revised visual-design plan.
