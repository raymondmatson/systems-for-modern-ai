# Visual Design Phase 5 — Orthogonal State Language and Scenario Context

**Status:** Implemented 2026-09-10  
**Scope:** Visual Design Plan Phase 5 only. The Phase 5A rendered calibration gate has not begun.

## Purpose

Phase 5 completes the approved interaction/dynamic-state grammar without changing the semantic state engine. Structural Location, Current Selection, Preview/focus, descendant Selection, Scenario emphasis, aggregation, and Representative context now use independent presentation channels. Connections reuse the Phase-4 overlay seam so relationship-family syntax remains stable.

The phase also adds a concise Scenario strip that explains the authored Scenario and explicit affected targets while reiterating that the modeled physical structure remains unchanged.

## Implemented state channels

### Structural Location

The Phase-2 enclosure remains the primary visual representation of the current Structural Location. It is not a new selectable child.

### Preview / keyboard focus

Focused/Previewed nodes and enclosures use corner-bracket treatment rather than changing their semantic shell stroke pattern. Existing Preview timing and state transitions remain in `App.tsx`/the state layer; renderer components only consume derived flags.

### Persistent Selection

Nodes/enclosures use a strong outer Selection ring. Connections use the Phase-4 outer overlay and endpoint handles. Selection does not replace the role rail, component shell family, relationship pattern, Scenario marker, or aggregate count.

### Contains deeper Selection

A small overlapping-rectangles descendant marker indicates that a visible node/enclosure contains the current deeper Selection. It is not the direct Selection ring and is `aria-hidden` decoration; textual/accessibility presentation continues to expose “contains current selection.” Rendered testing moved the enclosure marker into reserved right-side header space after the first position overlapped the context header text.

### Scenario emphasis

Scenario-affected nodes/enclosures receive a soft underlay and a small diamond `S` marker. Scenario-affected connections retain their Phase-4 relationship-family path and receive a broad underlay underneath it. Unaffected scene objects are only mildly deemphasized and remain present/readable.

### Aggregation and Representative context

Phase-2 population backplates/count chips and Representative enclosure ribbon remain unchanged. They are not reused as Selection or Scenario indicators.

## Scenario strip

`src/app/explore/ScenarioStrip.tsx` presents:

- authored Scenario name;
- authored Scenario description;
- an explicit **Physical structure unchanged** notice for nondefault Scenarios;
- affected target names derived only from explicit Scenario effects;
- conservative Representative-member wording when the modeled parent aggregate/context is affected but individual exemplar state is unspecified.

The renderer does not infer causes, additional affected targets, physical reconfiguration, or member-specific state.

For a default/baseline Scenario with no explicit effects, the strip remains compact and states that no explicit effects are present.

## Simultaneous-state behavior exercised

- selected + focused/Previewed node;
- selected + Scenario-affected node;
- contains-Selection + Scenario-affected aggregate;
- aggregate + selected/Scenario-affected (`GB300 compute trays ×18`);
- selected + Previewed + Scenario-affected connection while preserving its data-path family syntax;
- Representative context with a synthetic parent-aggregate Scenario effect, producing the explicit member-state caveat.

## Pilot outcomes

### GB300 rack

The `×18` compute-tray aggregate can be Scenario-affected, focused, and selected simultaneously while retaining its compute role, aggregate count, and Representative expansion cue. A deeper BlueField-3 Selection produces a descendant marker on the visible compute-tray aggregate while Scenario emphasis remains separate.

### Meta root

The selected/focused checkpoint storage-path relation remains visibly a **Data / communication path** with authored bidirectional markers while its Scenario underlay and Selection/focus overlays coexist. The selected path's deeper Selection ancestry is indicated separately on the enclosure/components.

### H100 representative node

The Scenario strip remains visible even when an active Scenario's explicitly affected targets are outside the currently visible representative node scene. This communicates Scenario context without falsely assigning Scenario state to visible representative members.

## Problems found and resolved

1. **Enclosure descendant marker overlapped header text.** The initial marker position competed with current-location metadata. It was moved to reserved right-side header space, separate from the Representative ribbon and Scenario marker.
2. **Meta state-collision render exposed an edge-routing problem.** This was a Phase-4 presentation issue discovered during Phase-5 integration. The Phase-4 binary router was corrected to avoid intervening visible cards before Phase 5 was considered complete.
3. **Representative state could be overclaimed.** The presentation explicitly distinguishes aggregate/context Scenario state from unspecified individual Representative-member state; the existing conservative semantic behavior was preserved rather than weakened for visual convenience.

No state-engine or canonical semantic change was required.

## Validation performed

- dependency-free TypeScript source compilation — **PASS**;
- dependency-free Phase-5 unit-spec compilation — **PASS**;
- dependency-free E2E-spec syntax/type smoke — **PASS**;
- executable real-runtime state/Scenario scene smoke — **PASS**;
- system-Chromium rendered inspection of Meta selected+focused+Scenario edge, GB300 selected+focused+Scenario aggregate, GB300 descendant+Scenario state, and H100 active Scenario context — **PASS after marker/routing corrections**;
- canonical/runtime validation is rerun cumulatively with the Phase-4/5 handoff.

The supplied repository still has no `node_modules`, so pinned project Vitest/Vite/Playwright gates remain unavailable here. Phase 6 still requires those dependency-backed browser/software gates before it can be marked complete.

## Deferred by design

Phase 5 does **not** perform the broader presentation-token/spacing calibration assigned to Phase 5A, does not begin the Phase-6 browser/accessibility validation gate, and does not alter the component imagery data contract.
