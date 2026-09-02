# Implementation Changelog

This log records implementation-level changes for the browser-based **Systems for Modern AI** application. Product semantics remain governed by `Systems_for_Modern_AI_Project_Source_of_Truth.md`; technical implementation decisions remain governed by `Delivery_Rendering_and_Platform_Implementation_Plan.md`.

## 2026-09-01 — GitHub Pages hosting setup

- **Change or issue addressed:** Public static hosting for the Version 1 browser application.
- **Reason for the change:** Provide a browser-first deployment matching the approved static-hosting direction and a stable public review URL.
- **Files added or modified:** Existing hosting configuration is represented by `.github/workflows/pages.yml` and `vite.config.ts`. These files were not modified during the discrepancy-correction task recorded below.
- **Summary of the implementation:** Vite uses a relative `base` so static assets and generated runtime content resolve below the GitHub Pages subpath. The Pages workflow builds and deploys the static output.
- **Validation or testing performed:** The public deployment shell was fetched successfully at `https://raymondmatson.com/systems-for-modern-ai/`; source review confirmed relative runtime-content paths.
- **Result and any remaining limitations:** Hosting is live. The available automated browser in the implementation environment is administratively blocked from navigating to the public site, so live SPA interactions could not be driven from this environment.
- **Deployment status:** **Live** at `https://raymondmatson.com/systems-for-modern-ai/`.

## 2026-09-01 — Cross-tier and n-ary Cross-Connection presentation

- **Change or issue addressed:** Cross-Connections disappeared unless all endpoints were immediate visible siblings, and multi-endpoint relationships were reduced to two endpoints.
- **Reason for the change:** Cross-Connections must remain semantically discoverable across tiers and must not lose authored endpoint identity when represented at a higher scale.
- **Files added or modified:** `src/view-model/explore.ts`, `src/app/App.tsx`, `src/view-model/detail.ts`, `tests/unit/view-models.test.ts`, `tests/e2e/explore.spec.ts`.
- **Summary of the implementation:** Connection view models now preserve every authored endpoint, project deep endpoints to visible structural branches, distinguish visually projected versus contextual relationships, and render n-ary relationships as one semantic connection with a hub rather than inventing binary copies. Detail and semantic-outline presentations retain canonical endpoint names.
- **Validation or testing performed:** View-model unit coverage verifies deep/n-ary projection; the initial-five runtime smoke traversed all 49 modeled entities and produced 12 projected graphical connections plus 42 context connections without invalid endpoint sets.
- **Result and any remaining limitations:** **Corrected.** The final Playwright suite includes cross-tier discoverability coverage but could not be executed here because npm dependencies are unavailable.
- **Deployment status:** Not yet deployed; user will update GitHub and redeploy.

## 2026-09-01 — Architecture-aware deterministic Explore layouts

- **Change or issue addressed:** Explore used essentially one generic grid at every structural context.
- **Reason for the change:** Physical containment views need stable layouts appropriate to system, rack, assembly/device, fabric/topology, and internal-detail contexts while keeping geometry presentation-only.
- **Files added or modified:** `src/view-model/layout.ts`, `src/view-model/explore.ts`, `src/styles/app.css`.
- **Summary of the implementation:** Added deterministic structural layout profiles. System layouts separate compute, fabric, and support rows; rack layouts use structural lanes; assembly layouts prioritize local devices and accelerators; fabric layouts emphasize topology; internal contexts use compact device layouts. No coordinates enter semantic state.
- **Validation or testing performed:** Strict core type-check passed; the initial-five runtime smoke constructed 65 scenes across real configurations and representative contexts without layout failures.
- **Result and any remaining limitations:** **Corrected for Version 1 structural families.** No Canvas/WebGL or ELK fallback was introduced because current content does not require it.
- **Deployment status:** Not yet deployed.

## 2026-09-01 — Direct View Change, Return, and cross-view origin semantics

- **Change or issue addressed:** Top-level Explore could behave like Return; direct Concepts entry replaced retained state; Concept browsing and history replay could discard the original Explore Return Context.
- **Reason for the change:** Direct View Change, chronological Back/Forward, and semantic Return are distinct established operations.
- **Files added or modified:** `src/domain/types.ts`, `src/state/engine.ts`, `src/app/App.tsx`, `tests/unit/state-engine.test.ts`, `tests/e2e/explore.spec.ts`.
- **Summary of the implementation:** Added explicit direct-view operations, retained Concepts state across ordinary workspace switches, preserved Explore-origin Return Context through Concept-to-Concept browsing, ended the old chain only on deliberate physical occurrence traversal, and preserved valid originating Scenario state for explicit Return.
- **Validation or testing performed:** Fallback semantic unit harness passed the Return/direct-view and Back/Forward cases; runtime smoke independently verified Return preservation through Concept browsing and direct workspace switches.
- **Result and any remaining limitations:** **Corrected.** Browser-level Playwright confirmation remains pending a dependency-capable environment.
- **Deployment status:** Not yet deployed.

## 2026-09-01 — Capability-driven Detail and Property presentation

- **Change or issue addressed:** Detail exposed only a thin summary, omitted measurement/evidence semantics, and inferred Enter mostly from child count rather than capability plus context.
- **Reason for the change:** Detail must progressively expose identity, properties, Scenario state, containment, connections, Concepts, evidence, and meaningful actions without manufacturing navigation destinations.
- **Files added or modified:** `src/domain/types.ts`, `src/runtime/repository.ts`, `src/view-model/detail.ts`, `src/view-model/labels.ts`, `src/app/App.tsx`, `tests/unit/view-models.test.ts`.
- **Summary of the implementation:** The browser now loads the generated entity-type capability registry and Property Registry. Detail uses capability profiles, structured property metadata, Product Identity, population/count semantics, connection/evidence information, canonical Concept names, and context-sensitive Enterability. Black boxes and true dead-end leaves no longer expose unsupported Enter actions.
- **Validation or testing performed:** Runtime capability/property artifacts passed existing validators; unit coverage verifies Property scope/count basis, Concept names, representative actions, and suppression of Enter on an unconnected leaf.
- **Result and any remaining limitations:** **Corrected.** Detail remains intentionally progressive rather than an exhaustive dump of authored fields.
- **Deployment status:** Not yet deployed.

## 2026-09-01 — Shared Architectural Context and persistent Concepts state

- **Change or issue addressed:** Concepts lacked shared System/Configuration/Scenario controls; query state was component-local; Concept relationship metadata was not exposed as navigable links.
- **Reason for the change:** System, Configuration, and Scenario are shared Architectural Context, while query/current Concept/browse state is Concepts-owned dormant state.
- **Files added or modified:** `src/domain/types.ts`, `src/state/engine.ts`, `src/app/App.tsx`, `tests/unit/state-engine.test.ts`, `tests/e2e/explore.spec.ts`.
- **Summary of the implementation:** The same Architectural Context controls now appear in both primary views. Configuration switching in Concepts resets dormant Explore structural state/default Scenario while preserving the current global Concept. Search query and Concept browse history live in application state, and prerequisites/related/contrast/specialization data render as typed navigable relationship lists.
- **Validation or testing performed:** State-engine unit coverage verifies Concept preservation during configuration switches and query history exclusion; E2E coverage was added for shared controls and Concept retention.
- **Result and any remaining limitations:** **Corrected.** Context-free Concepts remains representable in the semantic model, while the current browser startup establishes normal default Architectural Context.
- **Deployment status:** Not yet deployed.

## 2026-09-01 — Empty-background Selection clearing

- **Change or issue addressed:** Selection could be cleared by Escape/explicit controls but not by an unambiguous empty Explore background click/tap.
- **Reason for the change:** Empty-background activation is an established Selection-clearing path and must remain distinct from activating a node/connection.
- **Files added or modified:** `src/app/App.tsx`, `tests/e2e/explore.spec.ts`.
- **Summary of the implementation:** The SVG root clears Selection only when the SVG background itself is the event target; node and connection activation continue to stop at their own semantic Select behavior.
- **Validation or testing performed:** Source/type review confirmed the target/currentTarget guard; E2E coverage was added for Select followed by empty-background clear.
- **Result and any remaining limitations:** **Corrected.** Panning/dragging is not currently an implemented interaction, so no conflicting drag gesture exists.
- **Deployment status:** Not yet deployed.

## 2026-09-01 — Inspect Preview behavior

- **Change or issue addressed:** Inspect changed only graphical emphasis and did not provide the specified lightweight Preview experience.
- **Reason for the change:** Pointer hover and keyboard focus should support transient, nonessential inspection without replacing persistent selected Detail.
- **Files added or modified:** `src/view-model/explore.ts`, `src/app/App.tsx`, `src/styles/app.css`, `tests/e2e/explore.spec.ts`.
- **Summary of the implementation:** Added lightweight entity/connection Preview view models. Pointer Preview uses 250 ms activation and 150 ms dismissal grace; keyboard focus previews immediately and remains transient. Preview is noninteractive and never replaces selected Detail.
- **Validation or testing performed:** Source/type checks passed; E2E cases cover hover dwell and keyboard-focus Preview semantics.
- **Result and any remaining limitations:** **Corrected.** Exact timing remains presentation-tunable under the approved design.
- **Deployment status:** Not yet deployed.

## 2026-09-01 — Representative Member Context presentation and conservative Scenario state

- **Change or issue addressed:** Representative labels/breadcrumbs were generic or misleading, aggregate population semantics were absent from Detail, and parent aggregate Scenario state was not explained conservatively inside exemplar contexts.
- **Reason for the change:** Representative contexts are reconstructable exemplars, not numbered physical instances, and aggregate state must not be silently asserted as member-specific state.
- **Files added or modified:** `src/view-model/labels.ts`, `src/view-model/detail.ts`, `src/app/App.tsx`, `tests/unit/view-models.test.ts`, `tests/e2e/explore.spec.ts`.
- **Summary of the implementation:** Representative labels use member type where available, breadcrumbs retain canonical ancestry plus typed exemplar suffix/path, population Detail exposes Count Basis/Expansion Mode/addressability, and representative child Detail reports parent aggregate Scenario conditions separately with “individual state not specified” when appropriate.
- **Validation or testing performed:** Unit coverage verifies conservative parent aggregate Scenario display; initial-five runtime smoke entered 16 real representative contexts and confirmed noncanonical labeling and Selection clearing.
- **Result and any remaining limitations:** **Corrected.** No ordinal or generated canonical identity is created for representative contexts.
- **Deployment status:** Not yet deployed.

## 2026-09-01 — Navigation history, peer movement, and browser-history mirroring

- **Change or issue addressed:** Browser Back/Forward was not mirrored to application history, peer/lateral movement lacked a first-class affordance, and Enter on the already-current breadcrumb could create redundant history.
- **Reason for the change:** Application history, structural history, containment ancestry, and semantic Return must stay distinct while browser navigation mirrors—not defines—the application model.
- **Files added or modified:** `src/domain/types.ts`, `src/state/engine.ts`, `src/platform/browserHistory.ts`, `src/view-model/detail.ts`, `src/app/App.tsx`, `tests/unit/state-engine.test.ts`, `tests/e2e/explore.spec.ts`.
- **Summary of the implementation:** Added a narrow browser-history adapter, typed cross-view history destinations with their Architectural Context, no-op Enter for the current structural locator, deterministic Forward-branch truncation after new navigation, and previous/next peer actions derived from canonical siblings. Browser `popstate` requests replay from the semantic engine.
- **Validation or testing performed:** State unit coverage passes current-location no-op, Back/Forward, and Forward-branch truncation cases; platform-boundary scan confirms browser APIs remain outside domain/state/view-model modules.
- **Result and any remaining limitations:** **Corrected at source/semantic level.** Package-backed browser-history E2E execution is pending an environment with Playwright dependencies.
- **Deployment status:** Not yet deployed.

## 2026-09-01 — Explore accessibility-state model

- **Change or issue addressed:** Graphical targets were keyboard focusable but accessible state semantics and a renderer-independent semantic representation were incomplete.
- **Reason for the change:** Location, Preview/focus, Selection, Scenario emphasis, names, and actions must remain accessible without relying only on pixels or color.
- **Files added or modified:** `src/app/App.tsx`, `src/styles/app.css`, `tests/e2e/explore.spec.ts`.
- **Summary of the implementation:** SVG targets now expose accessible names plus selected/current/Scenario/representative state; focus and selection remain visually distinct; full text remains available through SVG titles; and a semantic Explore structure lists the same nodes/connections as ordinary focusable controls independent of raw SVG hit testing.
- **Validation or testing performed:** Static/type review passed, reduced-motion behavior remains present, and E2E coverage was added for keyboard Inspect/Select/Escape plus semantic-structure availability.
- **Result and any remaining limitations:** **Corrected for the identified Version 1 gap.** A full assistive-technology audit still belongs in the deployment/browser accessibility verification cycle.
- **Deployment status:** Not yet deployed.

## 2026-09-01 — User-facing labels and identifier leakage

- **Change or issue addressed:** Machine IDs, Concept slugs, raw endpoint IDs, and minimally humanized type/property identifiers leaked into normal UI; fixed-length canvas truncation could obscure labels.
- **Reason for the change:** Stable machine identifiers should remain internal while normal presentation uses canonical names and readable technical terminology.
- **Files added or modified:** `src/view-model/labels.ts`, `src/view-model/detail.ts`, `src/app/App.tsx`, `src/styles/app.css`, `tests/e2e/explore.spec.ts`.
- **Summary of the implementation:** Added centralized acronym-aware labels, canonical Concept/entity/connection resolution, friendly occurrence labels including System/Configuration/target, and two-line SVG label wrapping with full text retained in accessible/title text.
- **Validation or testing performed:** Runtime smoke used canonical endpoint/name resolution across all initial-five scenes; E2E coverage asserts Concept occurrences do not expose raw H100 target IDs.
- **Result and any remaining limitations:** **Corrected.** Source/reference IDs remain visible only where evidence/provenance Detail intentionally presents them.
- **Deployment status:** Not yet deployed.

## 2026-09-01 — Narrow-screen Explore readability

- **Change or issue addressed:** The fixed 960×600 SVG scaled down with the viewport, making semantic labels too small on phone-width layouts.
- **Reason for the change:** Responsive presentation may change form, but essential Explore labels and controls must remain usable rather than being uniformly shrunk.
- **Files added or modified:** `src/view-model/layout.ts`, `src/app/App.tsx`, `src/styles/app.css`, `tests/e2e/explore.spec.ts`.
- **Summary of the implementation:** Scene dimensions now come from the deterministic layout profile. On narrow screens, the Explore canvas retains a readable minimum width inside a horizontally scrollable viewport instead of shrinking all labels; context controls and Detail continue to stack responsively.
- **Validation or testing performed:** CSS/source review passed; E2E coverage checks that a 390 px viewport produces horizontal canvas overflow and retains a 760 px minimum canvas width.
- **Result and any remaining limitations:** **Corrected for the identified readability defect.** Dense Explore remains primarily optimized for desktop/laptop, consistent with the approved browser-support direction.
- **Deployment status:** Not yet deployed.

## 2026-09-01 — Final cumulative correction verification

- **Change or issue addressed:** Regression and cross-file consistency review after all corrections above.
- **Reason for the change:** Later fixes must not overwrite or conflict with earlier semantic corrections.
- **Files added or modified:** `IMPLEMENTATION_CHANGELOG.md` plus the implementation/test files listed in the entries above.
- **Summary of the implementation:** Re-ran canonical/runtime validation, deterministic generation, strict platform-neutral TypeScript checks, full TS/TSX syntax diagnostics, initial-five runtime traversal, semantic unit cases, platform-boundary scans, and canonical/generated diff checks.
- **Validation or testing performed:** 16 systems / 18 configurations pass; 15 Concepts validate with zero canonical errors/warnings; initial-five V1 validation has zero errors; runtime generation is deterministic across 37 artifacts; runtime integrity has zero errors; property fixtures pass 5/5; fallback semantic/unit harness passes 14/14; initial-five smoke traverses 49 entities / 65 scenes / 16 representative contexts; 18 TS/TSX files parse with zero syntax diagnostics; no browser API appears in `src/domain`, `src/state`, or `src/view-model`; canonical content and generated runtime are unchanged by this implementation-only task.
- **Result and any remaining limitations:** **Implementation corrections pass every executable source/content gate available in this environment.** `npm install` cannot complete because registry access times out; therefore pinned-project Vitest, Vite production build, and `@playwright/test` Chromium/Firefox/WebKit execution could not be run here. The external Documentation Confidence evidence remains unavailable exactly as before and was not changed by this task.
- **Deployment status:** Corrections not yet deployed; user will update GitHub and GitHub Pages.
