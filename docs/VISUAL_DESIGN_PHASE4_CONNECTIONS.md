# Visual Design Phase 4 — Connection Language, Boundary Ports, and Edge-State Separation

**Status:** Implemented 2026-09-10  
**Scope:** Visual Design Plan Phase 4 only. Node/enclosure state overlays and the Scenario strip remain Phase 5 work.

## Purpose

Phase 4 makes the existing typed Cross-Connection model perceptible without changing relationship semantics. Each canonical relationship family now owns a stable base stroke/endpoint language, authored directionality is rendered separately, visible binary/n-ary relations receive deterministic presentation routing, and relationships that truly cross the current Structural Location can continue to labeled schematic boundary stubs.

All connection paths, stub sides, and port positions are presentation-only. They do not assert cable routes, physical port placement, ownership, containment, or unmodeled topology.

## Implemented presentation contract

### Seven canonical relationship families

`src/view-model/connectionVisuals.ts` centralizes the renderer mapping for:

- physical connectivity;
- data / communication path;
- dependency / service;
- affinity / locality;
- shared resource / membership;
- redundancy / protection;
- control / management.

Each family combines a stable line pattern with a distinct endpoint/relationship marker so color is not required. Unknown future relation strings fall back to a generic presentation rather than being reclassified from names or endpoint types.

### Authored directionality remains separate

Arrow markers are derived only from the authored `directionality` value. An undirected relation never receives an inferred arrow because of its family or label. `source_to_target` and `bidirectional` remain visually separate from the family syntax.

### Deterministic routing without semantic hubs

Binary connections use orthogonal presentation paths. The router now checks intervening visible component rectangles and, when a simple route would cross another card, deterministically detours around the visible component envelope. This was added after rendered Meta inspection found that the storage data-path line could otherwise cross the RoCE node.

N-ary connections use a presentation trunk and branches. The trunk has no semantic ID, focus target, or hardware glyph and is not presented as a physical switch/hub.

### True boundary crossings versus summarized internal relations

`src/view-model/explore.ts` now distinguishes three connection visibility cases:

- `canvas` — two or more endpoints are represented in the visible scene;
- `boundary` — the relation has modeled membership inside the current Structural Location and at least one modeled endpoint outside it;
- `summarized` — the relation is relevant to a visible aggregate/context but does not actually cross the current enclosure.

Only true `boundary` relations receive boundary stubs. This prevents, for example, the GB300 host-memory path—which is entirely inside the summarized compute-tray population—from looking like an external rack connection.

Boundary stub side and vertical slot are deterministic schematic presentation choices. The on-canvas label is concise; the full relationship and endpoint names remain available through the interactive target/Preview/Detail and the existing textual relationship cards.

### Connection-specific state separation

The base relationship-family path never changes because a connection is Previewed, selected, Scenario-affected, or aggregated. Those meanings use separate SVG layers/channels:

- Scenario: broad underlay beneath the unchanged base path;
- aggregation: bundle/companion treatment and explicit aggregation marker;
- Selection: strong outer overlay plus endpoint handles;
- Preview/focus: local overlay independent of Selection;
- base relationship family: unchanged line/marker syntax.

This is the edge-state seam Phase 5 reuses rather than replacing.

### Contextual visual key

The Explore view now displays a text-backed **Connection key** containing only relationship families present in the current scene. The key explains that arrow markers represent authored directionality and that boundary-stub position is schematic. Its swatches use the same base line/marker tokens as the canvas, so the taxonomy remains decodable without color.

## Pilot outcomes

### DGX H100 representative compute node

The node shows its local typed connections alongside four true external continuations: compute fabric, storage fabric, in-band management, and out-of-band management. Boundary labels remain outside the enclosure; they do not become child entities. The local NVLink/NVSwitch relation remains undirected and therefore has no invented arrow.

### GB300 rack

External compute/converged fabric, cooling dependency, OOB management, and rack-power relations receive boundary continuations. The host-memory relation remains summarized inside the compute-tray aggregate and does not receive a false external port.

### Meta root

Physical RoCE connectivity and the compute-to-storage data path use different base relation syntax. The storage path retains its authored bidirectional directionality. Collision-aware binary routing detours the storage path around the intervening RoCE component instead of visually running through it.

## Problems found and resolved

1. **Off-canvas was not equivalent to boundary crossing.** The original presentation split would have shown any non-two-visible-endpoint relation as external. Runtime inspection exposed GB300 host memory as a counterexample. The scene contract now distinguishes true boundary crossings from internal relationships summarized by aggregates.
2. **Boundary labels overlapped the enclosure interior.** Initial rendered H100/GB300 stubs had insufficient exterior drawing room. `layoutForContext` now accepts a presentation-only boundary gutter derived from true crossing presence; node/enclosure semantics are unchanged.
3. **Meta storage path crossed the RoCE component.** The original midpoint route passed through an unrelated visible card. Binary routing now tests visible blockers and uses a deterministic outer detour when needed.

None of these corrections required a canonical content, schema, or product-semantic decision.

## Validation performed

- dependency-free TypeScript source compilation — **PASS**;
- dependency-free Phase-4 unit-spec compilation — **PASS**;
- dependency-free E2E-spec syntax/type smoke — **PASS**;
- executable real-runtime Phase-4 connection contract smoke — **PASS**;
- system-Chromium rendered inspection of H100, GB300, and Meta — **PASS after boundary-gutter and Meta routing corrections**;
- canonical/runtime validation is rerun cumulatively with the Phase-4/5 handoff.

The supplied repository still has no `node_modules`, so pinned Vitest/Vite/project-Playwright execution remains a dependency-environment verification gap rather than a known Phase-4 defect.

## Deferred by design

Phase 4 does **not** redefine node/enclosure Selection/focus/descendant state or add the explanatory Scenario strip. Those are owned by Phase 5. It also does not remove the existing textual external/summarized relationship views before keyboard/assistive-technology behavior is verified in the later software-validation phase.
