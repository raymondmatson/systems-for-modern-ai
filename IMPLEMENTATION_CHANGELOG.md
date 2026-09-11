# Implementation Changelog

## 2026-09-10 — Playwright production-base correction

- **Change or issue addressed:** After typecheck, Vitest, and production build began passing in the dependency-capable GitHub runner, the configured Playwright E2E gate still exited with code 1. The E2E harness launched Vite preview for a production build whose configured base is `/systems-for-modern-ai/`, but Playwright navigated every relative `page.goto('./')` from the server root (`http://127.0.0.1:4173/`).
- **Reason for the change:** The application is intentionally built and deployed beneath the `/systems-for-modern-ai/` GitHub Pages subpath, and browser runtime URLs such as `./runtime/manifest.json` are relative to that trailing-slash application location. The E2E harness must exercise that production deployment contract rather than an unconfigured root path.
- **Files modified:** `playwright.config.ts` and this changelog.
- **Summary of the fix:** Pointed both Playwright `use.baseURL` and the `webServer.url` readiness probe at `http://127.0.0.1:4173/systems-for-modern-ai/`. Existing E2E tests, browser projects, Vite base configuration, deployment configuration, runtime-loading behavior, and assertions are unchanged. A shared `APP_BASE_URL` constant prevents the navigation and readiness URLs from drifting independently inside the Playwright configuration.
- **Validation or testing performed:** Static deployment-contract checks confirm the Playwright path now exactly matches Vite's `/systems-for-modern-ai/` base, `new URL('./', baseURL)` resolves to that application subpath, and `new URL('./runtime/manifest.json', baseURL)` resolves to `/systems-for-modern-ai/runtime/manifest.json`, where the generated public runtime artifact exists. Dependency-light TypeScript/syntax checking of the Playwright config and E2E spec passes, and full Python canonical/runtime validation remains green. Exact configured Chromium/Firefox/WebKit execution remains unavailable in this container because the pinned npm dependency tree/browser packages are absent; GitHub remains the authoritative dependency-backed E2E run.
- **Result and remaining limitations:** This corrects the harness-level production-path mismatch without weakening any E2E assertion or changing application behavior. If GitHub still reports an E2E failure after this correction, provide the failing Playwright test title/browser plus the failure message/stack and the `test-results/.../trace.zip` (or the relevant trace artifact) so a browser-specific or behavioral failure can be diagnosed. The separate GitHub Actions Node-runtime deprecation warning remains nonblocking and unchanged.

## 2026-09-10 — Phase 3/4 npm-test regression correction

- **Change or issue addressed:** The dependency-backed GitHub `npm test` gate reported two assertion failures: the synthetic documented-placement fixture expected the Phase-3 display cue `Documented placement` while the Explore view model emitted lowercase `documented placement`; and the Phase-4 GB300 boundary test hard-coded the obsolete pre-expansion cooling display name `Data-center / facility liquid-cooling infrastructure` even though the current canonical entity is `Rack-scale liquid-cooling infrastructure`.
- **Reason for the change:** The Phase-3 implementation contract explicitly defines the visible documented-placement treatment as `Documented placement`, while Phase-4 boundary presentation should derive external labels from the authoritative endpoint entity rather than freeze incidental display copy. The boundary classification and GB300 cooling relationship themselves were already correct.
- **Files added or modified:** `src/view-model/explore.ts`, `tests/unit/visual-design-phase4-connections.test.ts`, `IMPLEMENTATION_CHANGELOG.md`.
- **Summary of the implementation:** Restored the documented-placement canvas cue to the documented title-cased presentation string without changing schematic-placement or Detail prose behavior. Replaced the stale Phase-4 cooling-name literal with an assertion that the boundary continuation exactly exposes the current `gb300-cooling` endpoint name and remains a `cooling_system`. No canonical content, generated runtime, routing, containment, Scenario, or connection semantics changed.
- **Validation or testing performed:** Reproduced both GitHub assertion mismatches from the current runtime/view-model state. After correction, a dependency-light strict TypeScript compile of the affected source/tests passes; direct executable assertions against the real generated GB300 runtime and synthetic documented-placement scene pass; full canonical/runtime Python validation remains green. Exact pinned Vitest execution remains unavailable in this container because the supplied repository has no `node_modules`; GitHub remains the authoritative dependency-backed run.
- **Result and remaining limitations:** The correction preserves the prior Phase-0 strict-TypeScript fix and strengthens the Phase-4 test against future presentation-copy drift without weakening its semantic endpoint check. No additional GitHub logs are currently required.

## 2026-09-10 — Phase 0 fixture strict-TypeScript correction

- **Change or issue addressed:** The dependency-backed GitHub `npm run typecheck` gate reported eight `TS7006` diagnostics in `tests/unit/visual-design-phase0-fixtures.test.ts` because callback parameter `item` was implicitly `any`.
- **Reason for the change:** The Phase-0 fixture is intended to be deterministic typed validation evidence. Its broad `fixtureJson as any` cast erased TypeScript's contextual typing for every fixture collection and also hid incomplete Structural-Location shape checks; adding more `any` annotations would weaken the contract rather than fix the cause.
- **Files modified:** `tests/unit/visual-design-phase0-fixtures.test.ts` and this changelog.
- **Summary of the fix:** Removed the fixture-wide `any` cast so imported JSON supplies callback types, removed an unnecessary per-item `any`, and made the pilot-locator check explicitly accept only the two Phase-0 locator forms (`entity` and `representative_member`) with their required IDs/path present. Unexpected/malformed fixture locator data now fails the test explicitly. No fixture data, production content, runtime artifact, visual-design decision, renderer behavior, or state semantics changed.
- **Validation or testing performed:** Reproduced the original eight `TS7006` diagnostics with strict TypeScript compilation, then recompiled the corrected fixture test with strict/no-implicit-any checking and a temporary Vitest declaration shim: PASS with zero diagnostics. Full canonical/runtime Python validation also passes (16 systems / 18 YAML documents, 54 deterministic runtime artifacts, 75/75 branches, 65 entered physical-orientation contexts / 0 errors, and 5/5 Property fixtures). The local container still cannot install the pinned npm dependency tree because `registry.npmjs.org` DNS resolution is unavailable, so the exact repository `npm run typecheck`/Vitest invocation remains to be confirmed by the dependency-capable GitHub runner.
- **Result and remaining limitations:** The screenshot's typecheck root cause is corrected without weakening assertions. The separate GitHub Actions Node-runtime deprecation warning is nonblocking and was not changed in this fix.
- **Deployment status:** Not deployed; user will apply the changed-files patch and refresh shared sources.

## 2026-09-10 — Visual Design Phase 6 partial validation and current-renderer benchmark

- **Change or issue addressed:** Phase 6 requires dependency-backed software/accessibility validation plus a benchmark that measures the post-Phase-5A renderer rather than the obsolete synthetic representative SVG.
- **Reason for the change:** The former benchmark materially undercounted current presentation structure and the completed visual phases introduced new enclosure, Anatomy, relationship, state, and Scenario layers that require updated evidence before transfer testing.
- **Files added or modified:** `scripts/benchmarks/render_density.py`, new benchmark adapter/shim files, `reports/implementation/render-benchmark.json`, new `reports/implementation/phase6-validation.json`, new comprehension-study packet/images, `tests/e2e/explore.spec.ts`, implementation/rendering documentation, and this changelog.
- **Summary of the implementation:** Replaced benchmark version 2's synthetic representative proxy with benchmark version 3, which executes the real Explore view-model and exact `src/app/explore` components through a benchmark-only JSX adapter and measures the resulting DOM in system Chromium. Added deterministic geometry checks across all seven frozen Phase-5A pilot states; added reduced-motion, forced-colors, semantic-outline parity, and boundary-Follow E2E source coverage; prepared the later comprehension-study packet and current-renderer study images. No canonical content/schema, domain/state semantics, package versions, or visual-product decision changed.
- **Problems found and resolved:** The benchmark review confirms SVG/semantic-outline/context-card targets are simultaneously exposed in Chromium's accessibility tree (36 buttons in the H100 baseline: 16 SVG, 16 semantic-outline, 4 connection-card targets). This is concrete duplication evidence, but without the pinned keyboard/screen-reader/cross-engine matrix it is not sufficient to consolidate safely; the accepted Section-20.5 policy therefore remains provisionally **retain until pinned accessibility evidence**. The npm bootstrap itself cannot complete because `registry.npmjs.org` DNS resolution is unavailable and the npm cache is empty; partial `node_modules` output was removed.
- **Validation or testing performed:** Canonical/runtime validation passes (16 systems / 18 YAML documents, 54 deterministic runtime artifacts, 75/75 branches, 65 entered physical-orientation contexts, 5/5 property fixtures). Dependency-light full-source/unit/E2E TypeScript compilation passes. Benchmark v3 passes all seven pilot geometry checks; current H100 baseline/stress contain 342/350 SVG descendants with 16 SVG focus targets and zero Anatomy focus targets. System-Chromium reduced-motion and forced-colors probes retain non-color geometry/state cues.
- **Result and any remaining limitations:** **Phase 6 remains incomplete.** `npm ci` cannot obtain the locked dependency tree, so pinned `npm run typecheck`, `npm test`, full Vite build, configured Chromium/Firefox/WebKit Playwright, authoritative screenshot baselines, and final keyboard/screen-reader resolution of SVG/semantic-outline duplication remain blocked. Exact closure work is recorded in `reports/implementation/phase6-validation.json`. Phase 7 must not begin until Phase 6's pinned exit criteria are satisfied.
- **Deployment status:** Not deployed; user will apply the changed-files patch and refresh shared sources.

## 2026-09-10 — Visual Design Phase 3 deterministic layout and integrated Anatomy

- **Change or issue addressed:** Phase 2 established enclosure/component shells, but dense zero-image scenes still spent too much space on the media fallback, the GB300 rack lacked meaningful internal population zoning, and Anatomy Depictions remained visually detached below the enclosure.
- **Reason for the change:** The revised Phase 3 plan requires deterministic composition regions, density-aware label/media fitting, explicitly schematic rack population bands, and noninteractive Anatomy integrated into the physical enclosure before relationship and state redesign begins.
- **Files added or modified:** `src/view-model/layout.ts`, `src/view-model/explore.ts`, `src/view-model/labels.ts`, `src/view-model/visualRoles.ts`, `src/view-model/detail.ts`, `src/app/explore/NodeGlyph.tsx`, `src/app/explore/AnatomyGlyph.tsx`, `src/app/explore/EnclosureGlyph.tsx`, `src/app/explore/ExploreCanvas.tsx`, new `src/app/explore/CompositionRegionGlyph.tsx`, `src/styles/app.css`, unit/E2E tests, `docs/IMPLEMENTATION.md`, new `docs/VISUAL_DESIGN_PHASE3_LAYOUT_AND_ANATOMY.md`, and this changelog.
- **Summary of the implementation:** Extended deterministic layouts with renderer-only composition/support regions and future port reserve; added compact/full no-image fit modes and deterministic name wrapping; introduced explicit nonliteral GB300 compute/network population bands; moved Anatomy Depictions into subdued internal support regions; mapped depiction kinds into the existing visual-role language; added enclosure-level schematic placement notices and non-dash evidence treatment; and expanded Detail Anatomy summaries with evidence, placement basis, and Count Basis. No canonical content/schema, runtime artifact, domain identity, state-engine rule, or connection semantic changed.
- **Problems found and resolved:** Rendered H100 inspection exposed an Anatomy count/basis string that overflowed the compact PSU card. The canvas now shows the authored count `×6` while Detail retains Count Basis. Local file/localhost navigation was blocked in the verification container, so static generated HTML was rendered through system Chromium using Playwright `set_content`; this changed only the external verification harness. Synthetic documented-placement coverage was strengthened to verify the Explore-scene badge while confirming that the source depiction receives no coordinates.
- **Validation/testing:** Full Python content/runtime validation PASS, including deterministic runtime, 75/75 branch coverage, 65/65 physical-orientation contexts, and Property fixtures 5/5. Dependency-free TypeScript source/unit and E2E-spec syntax smokes PASS. Executable real-runtime view-model and Explore-SVG component smokes PASS across H100/GB300 plus Meta/Ironwood/Cerebras root fit. System-Chromium rendered inspection PASS after the count-fit correction. Full pinned npm/Vite/Playwright gates remain unavailable because the shared ZIP contains no dependency tree.
- **Result and remaining limitation:** **Phase 3 implementation complete.** Relationship-family syntax, boundary ports/routing, and edge-state separation remain Phase 4; cross-object state/Scenario treatment remains Phase 5. Dependency-backed project tests remain pending a normal environment.
- **Deployment status:** Not deployed by this task; user will apply the changed-files patch and refresh shared sources.

## 2026-09-10 — Visual Design Phase 2 enclosure and component semantic shells

- **Change or issue addressed:** Explore's current Structural Location was still primarily navigation text, while interactive entities remained visually similar cards with weak role/scale cues despite the Phase 1 renderer seams.
- **Reason for the change:** Phase 2 of the approved visual-design plan requires enclosure-first physical context, stable subsystem-role syntax, imagery-ready semantic shells, Representative-context labeling, and bounded aggregate repetition without changing product semantics.
- **Files added or modified:** `src/view-model/layout.ts`, `src/view-model/explore.ts`, new `src/view-model/visualRoles.ts`, `src/app/explore/EnclosureGlyph.tsx`, `src/app/explore/NodeGlyph.tsx`, new `src/app/explore/RoleIcon.tsx`, `src/app/explore/ExploreCanvas.tsx`, `src/styles/app.css`, unit/E2E tests, `docs/IMPLEMENTATION.md`, new `docs/VISUAL_DESIGN_PHASE2_ENCLOSURES_AND_COMPONENT_SHELLS.md`, and this changelog.
- **Summary of the implementation:** Added derived `SceneEnclosure`/interior bounds; six structural shell families; the exact Phase-0 `entity_type` visual-role map with neutral fallback; restrained role rails + schematic icons + text labels; a reserved no-asset media region; Representative enclosure markers; bounded aggregate backplates and `×N` count labels; and minimally enlarged deterministic node spacing. Existing Cross-Connection styling, Anatomy grid placement, state-engine behavior, and Scenario/Selection visual syntax remain unchanged for their later phases. No canonical content/schema/runtime/domain-type change was required.
- **Problems found and resolved:** Rendered Chromium inspection exposed two presentation problems: SVG metadata inherited the generic 13px label rule and overflowed several H100 cards, and the legacy rack minimum height made the new GB300 enclosure look excessively empty/literal. CSS specificity now keeps metadata compact, and the rack's derived minimum bound was tightened without introducing U positions or Phase-3 rack bands.
- **Validation/testing:** `python scripts/content/validate_all.py` PASS, including deterministic runtime, 75/75 branch coverage, 65/65 physical-orientation contexts, and Property fixtures 5/5. Dependency-free TypeScript source/unit and E2E syntax smokes PASS. Executable generated-runtime smoke PASS for H100/GB300 enclosure/role/count invariants. Executable JSX renderer smoke PASS for layer order, enclosure/shell/media/repetition markup, keyboard Selection, and empty-canvas clearing. Chromium static-snapshot inspection PASS after the two fixes. Full pinned `npm test`, normal `npm run typecheck`, Vite build, and project Playwright execution remain unavailable because the supplied ZIP has no `node_modules`; `vitest` and configured type packages are absent.
- **Result and remaining limitation:** **Phase 2 implementation complete.** Anatomy remains intentionally detached until Phase 3, old connection rendering remains until Phase 4, and state/Scenario cue cleanup remains until Phase 5. Browser regression tests are included for the next dependency-capable run.
- **Deployment status:** Not deployed by this task; user will apply the changed-files patch and refresh shared sources.

## 2026-09-10 — Visual Design Phase 1 Explore renderer composition refactor

- **Change or issue addressed:** The Explore SVG renderer and semantic companion views were concentrated in the 1,100+ line `src/app/App.tsx`, which made the approved enclosure/role/connection/state redesign difficult to stage without cue-order and interaction regressions.
- **Reason for the change:** Phase 1 of the approved visual-design plan requires composable Explore rendering seams and a fixed SVG layer order before later phases introduce new visual treatments.
- **Files added or modified:** `src/app/App.tsx`, `src/app/explore/*`, `src/styles/app.css`, `tests/unit/explore-renderer-layers.test.ts`, `tests/e2e/explore.spec.ts`, `docs/IMPLEMENTATION.md`, `docs/VISUAL_DESIGN_PHASE1_RENDERER_COMPOSITION.md`, and this changelog.
- **Summary of the implementation:** Extracted `ExploreCanvas`, node/label, connection, Anatomy, Scenario-description, external-connection, and semantic-outline presentation from `App.tsx`; added reserved Phase-2/4 renderer seams for enclosure, boundary connections, and the Visual Key; established the eight approved SVG layer groups; and moved node labels to a noninteractive dedicated label layer. Current state styling remains on existing shells/edges until Phase 5 so this refactor does not prematurely implement the new visual language. No canonical content/schema, generated runtime, view-model geometry, or state-engine semantics changed.
- **Validation/testing:** `python scripts/content/validate_all.py` passes, including deterministic runtime checks and the 65-context physical-orientation audit. A dependency-free TypeScript smoke check over `src` and unit tests passes with temporary external-module/JSX declarations outside the repository. Source-level contract checks confirm the renderer components do not import state-engine transitions, layer order matches the approved contract, and Phase 2/4 reserved components remain presentation-only. Full pinned `npm test`, `npm run typecheck`, build, and Playwright execution could not be rerun because `node_modules` is absent from the shared ZIP and `npm ci` could not complete in the offline container; the partial install was removed and `package-lock.json` remained unchanged.
- **Result and remaining limitation:** **Phase 1 implementation complete.** Browser-level behavioral confirmation remains pending a dependency-capable environment, but dedicated unit/E2E regression coverage is included for the new renderer composition.
- **Deployment status:** Not yet deployed; user will apply this patch and redeploy.

## 2026-09-07 — Runtime capability contract and H100 representative-population correction

- **Change or issue addressed:** GitHub `npm test` reported the H100 GPU aggregate as `aggregate_only` where the established nested representative-member contract requires representative expansion, while the deployed browser could render a blank page during initial Detail construction.
- **Cause:** These were independent defects. The H100 canonical YAML had drifted from AGG-004/AGG-006 and the runtime-shape test correctly exposed it. Separately, `build_runtime.py` has long emitted the normalized capability registry as camelCase (`entityTypes` object and camelCase profile fields), but the current TypeScript capability interfaces/Detail lookup had regressed to the canonical YAML's snake_case/list shape. Initial Detail therefore attempted `capabilities.entity_types.find(...)` on `undefined` and threw before the application UI could paint.
- **Files added or modified:** `content/RSCs/nvidia_dgx_h100_superpod.yaml`, generated/runtime mirrors and checksums, `src/domain/types.ts`, `src/view-model/detail.ts`, `tests/unit/view-models.test.ts`, `tests/unit/runtime-shape.test.ts`, `docs/IMPLEMENTATION.md`, and this changelog.
- **Fix:** Restored the eight-H100 population to `representative_member`; regenerated deterministic runtime artifacts; aligned the TypeScript runtime contract and Detail consumer to `schemaVersion` / `entityTypes` / `entityType` / `supportsConcepts` and camelCase profile fields; updated the synthetic fixture; and added a regression test that feeds the real generated capability registry into initial Detail rendering. The generator/runtime format itself was not changed.
- **Validation/testing:** Canonical RSC/Product/Concept/V1/runtime validation passes; deterministic runtime remains 54 files; branch coverage is 75/75 with zero errors; physical-orientation coverage is 65 entered contexts with zero errors; Property fixtures pass 5/5. A dependency-free TypeScript smoke compiled the domain/state/Explore/Detail modules with zero diagnostics and rendered initial H100 Explore + Detail using the actual generated runtime registry without throwing. Local `npm ci` could not complete because this environment cannot resolve the npm registry, so pinned Vitest/Vite/Playwright execution remains dependent on GitHub/the user's networked environment.
- **Deployment-path review:** The repository's Vite base remains `/systems-for-modern-ai/`, matching the documented hosted subpath, and the browser repository's `./runtime/...` requests resolve under that same trailing-slash subpath. `content:generate` mirrors all 54 runtime files into `public/runtime`, which Vite includes in the static build. No deployment-path change was required for this incident.
- **Deployment status:** Not yet deployed; user will apply this patch and redeploy.

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
- **Deployment status:** **Deployed in the current GitHub Pages snapshot** (confirmed by the user on 2026-09-01).

## 2026-09-01 — Architecture-aware deterministic Explore layouts

- **Change or issue addressed:** Explore used essentially one generic grid at every structural context.
- **Reason for the change:** Physical containment views need stable layouts appropriate to system, rack, assembly/device, fabric/topology, and internal-detail contexts while keeping geometry presentation-only.
- **Files added or modified:** `src/view-model/layout.ts`, `src/view-model/explore.ts`, `src/styles/app.css`.
- **Summary of the implementation:** Added deterministic structural layout profiles. System layouts separate compute, fabric, and support rows; rack layouts use structural lanes; assembly layouts prioritize local devices and accelerators; fabric layouts emphasize topology; internal contexts use compact device layouts. No coordinates enter semantic state.
- **Validation or testing performed:** Strict core type-check passed; the initial-five runtime smoke constructed 65 scenes across real configurations and representative contexts without layout failures.
- **Result and any remaining limitations:** **Corrected for Version 1 structural families.** No Canvas/WebGL or ELK fallback was introduced because current content does not require it.
- **Deployment status:** **Deployed in the current GitHub Pages snapshot** (confirmed by the user on 2026-09-01).

## 2026-09-01 — Direct View Change, Return, and cross-view origin semantics

- **Change or issue addressed:** Top-level Explore could behave like Return; direct Concepts entry replaced retained state; Concept browsing and history replay could discard the original Explore Return Context.
- **Reason for the change:** Direct View Change, chronological Back/Forward, and semantic Return are distinct established operations.
- **Files added or modified:** `src/domain/types.ts`, `src/state/engine.ts`, `src/app/App.tsx`, `tests/unit/state-engine.test.ts`, `tests/e2e/explore.spec.ts`.
- **Summary of the implementation:** Added explicit direct-view operations, retained Concepts state across ordinary workspace switches, preserved Explore-origin Return Context through Concept-to-Concept browsing, ended the old chain only on deliberate physical occurrence traversal, and preserved valid originating Scenario state for explicit Return.
- **Validation or testing performed:** Fallback semantic unit harness passed the Return/direct-view and Back/Forward cases; runtime smoke independently verified Return preservation through Concept browsing and direct workspace switches.
- **Result and any remaining limitations:** **Corrected.** Browser-level Playwright confirmation remains pending a dependency-capable environment.
- **Deployment status:** **Deployed in the current GitHub Pages snapshot** (confirmed by the user on 2026-09-01).

## 2026-09-01 — Capability-driven Detail and Property presentation

- **Change or issue addressed:** Detail exposed only a thin summary, omitted measurement/evidence semantics, and inferred Enter mostly from child count rather than capability plus context.
- **Reason for the change:** Detail must progressively expose identity, properties, Scenario state, containment, connections, Concepts, evidence, and meaningful actions without manufacturing navigation destinations.
- **Files added or modified:** `src/domain/types.ts`, `src/runtime/repository.ts`, `src/view-model/detail.ts`, `src/view-model/labels.ts`, `src/app/App.tsx`, `tests/unit/view-models.test.ts`.
- **Summary of the implementation:** The browser now loads the generated entity-type capability registry and Property Registry. Detail uses capability profiles, structured property metadata, Product Identity, population/count semantics, connection/evidence information, canonical Concept names, and context-sensitive Enterability. Black boxes and true dead-end leaves no longer expose unsupported Enter actions.
- **Validation or testing performed:** Runtime capability/property artifacts passed existing validators; unit coverage verifies Property scope/count basis, Concept names, representative actions, and suppression of Enter on an unconnected leaf.
- **Result and any remaining limitations:** **Corrected.** Detail remains intentionally progressive rather than an exhaustive dump of authored fields.
- **Deployment status:** **Deployed in the current GitHub Pages snapshot** (confirmed by the user on 2026-09-01).

## 2026-09-01 — Shared Architectural Context and persistent Concepts state

- **Change or issue addressed:** Concepts lacked shared System/Configuration/Scenario controls; query state was component-local; Concept relationship metadata was not exposed as navigable links.
- **Reason for the change:** System, Configuration, and Scenario are shared Architectural Context, while query/current Concept/browse state is Concepts-owned dormant state.
- **Files added or modified:** `src/domain/types.ts`, `src/state/engine.ts`, `src/app/App.tsx`, `tests/unit/state-engine.test.ts`, `tests/e2e/explore.spec.ts`.
- **Summary of the implementation:** The same Architectural Context controls now appear in both primary views. Configuration switching in Concepts resets dormant Explore structural state/default Scenario while preserving the current global Concept. Search query and Concept browse history live in application state, and prerequisites/related/contrast/specialization data render as typed navigable relationship lists.
- **Validation or testing performed:** State-engine unit coverage verifies Concept preservation during configuration switches and query history exclusion; E2E coverage was added for shared controls and Concept retention.
- **Result and any remaining limitations:** **Corrected.** Context-free Concepts remains representable in the semantic model, while the current browser startup establishes normal default Architectural Context.
- **Deployment status:** **Deployed in the current GitHub Pages snapshot** (confirmed by the user on 2026-09-01).

## 2026-09-01 — Empty-background Selection clearing

- **Change or issue addressed:** Selection could be cleared by Escape/explicit controls but not by an unambiguous empty Explore background click/tap.
- **Reason for the change:** Empty-background activation is an established Selection-clearing path and must remain distinct from activating a node/connection.
- **Files added or modified:** `src/app/App.tsx`, `tests/e2e/explore.spec.ts`.
- **Summary of the implementation:** The SVG root clears Selection only when the SVG background itself is the event target; node and connection activation continue to stop at their own semantic Select behavior.
- **Validation or testing performed:** Source/type review confirmed the target/currentTarget guard; E2E coverage was added for Select followed by empty-background clear.
- **Result and any remaining limitations:** **Corrected.** Panning/dragging is not currently an implemented interaction, so no conflicting drag gesture exists.
- **Deployment status:** **Deployed in the current GitHub Pages snapshot** (confirmed by the user on 2026-09-01).

## 2026-09-01 — Inspect Preview behavior

- **Change or issue addressed:** Inspect changed only graphical emphasis and did not provide the specified lightweight Preview experience.
- **Reason for the change:** Pointer hover and keyboard focus should support transient, nonessential inspection without replacing persistent selected Detail.
- **Files added or modified:** `src/view-model/explore.ts`, `src/app/App.tsx`, `src/styles/app.css`, `tests/e2e/explore.spec.ts`.
- **Summary of the implementation:** Added lightweight entity/connection Preview view models. Pointer Preview uses 250 ms activation and 150 ms dismissal grace; keyboard focus previews immediately and remains transient. Preview is noninteractive and never replaces selected Detail.
- **Validation or testing performed:** Source/type checks passed; E2E cases cover hover dwell and keyboard-focus Preview semantics.
- **Result and any remaining limitations:** **Corrected.** Exact timing remains presentation-tunable under the approved design.
- **Deployment status:** **Deployed in the current GitHub Pages snapshot** (confirmed by the user on 2026-09-01).

## 2026-09-01 — Representative Member Context presentation and conservative Scenario state

- **Change or issue addressed:** Representative labels/breadcrumbs were generic or misleading, aggregate population semantics were absent from Detail, and parent aggregate Scenario state was not explained conservatively inside exemplar contexts.
- **Reason for the change:** Representative contexts are reconstructable exemplars, not numbered physical instances, and aggregate state must not be silently asserted as member-specific state.
- **Files added or modified:** `src/view-model/labels.ts`, `src/view-model/detail.ts`, `src/app/App.tsx`, `tests/unit/view-models.test.ts`, `tests/e2e/explore.spec.ts`.
- **Summary of the implementation:** Representative labels use member type where available, breadcrumbs retain canonical ancestry plus typed exemplar suffix/path, population Detail exposes Count Basis/Expansion Mode/addressability, and representative child Detail reports parent aggregate Scenario conditions separately with “individual state not specified” when appropriate.
- **Validation or testing performed:** Unit coverage verifies conservative parent aggregate Scenario display; initial-five runtime smoke entered 16 real representative contexts and confirmed noncanonical labeling and Selection clearing.
- **Result and any remaining limitations:** **Corrected.** No ordinal or generated canonical identity is created for representative contexts.
- **Deployment status:** **Deployed in the current GitHub Pages snapshot** (confirmed by the user on 2026-09-01).

## 2026-09-01 — Navigation history, peer movement, and browser-history mirroring

- **Change or issue addressed:** Browser Back/Forward was not mirrored to application history, peer/lateral movement lacked a first-class affordance, and Enter on the already-current breadcrumb could create redundant history.
- **Reason for the change:** Application history, structural history, containment ancestry, and semantic Return must stay distinct while browser navigation mirrors—not defines—the application model.
- **Files added or modified:** `src/domain/types.ts`, `src/state/engine.ts`, `src/platform/browserHistory.ts`, `src/view-model/detail.ts`, `src/app/App.tsx`, `tests/unit/state-engine.test.ts`, `tests/e2e/explore.spec.ts`.
- **Summary of the implementation:** Added a narrow browser-history adapter, typed cross-view history destinations with their Architectural Context, no-op Enter for the current structural locator, deterministic Forward-branch truncation after new navigation, and previous/next peer actions derived from canonical siblings. Browser `popstate` requests replay from the semantic engine.
- **Validation or testing performed:** State unit coverage passes current-location no-op, Back/Forward, and Forward-branch truncation cases; platform-boundary scan confirms browser APIs remain outside domain/state/view-model modules.
- **Result and any remaining limitations:** **Corrected at source/semantic level.** Package-backed browser-history E2E execution is pending an environment with Playwright dependencies.
- **Deployment status:** **Deployed in the current GitHub Pages snapshot** (confirmed by the user on 2026-09-01).

## 2026-09-01 — Explore accessibility-state model

- **Change or issue addressed:** Graphical targets were keyboard focusable but accessible state semantics and a renderer-independent semantic representation were incomplete.
- **Reason for the change:** Location, Preview/focus, Selection, Scenario emphasis, names, and actions must remain accessible without relying only on pixels or color.
- **Files added or modified:** `src/app/App.tsx`, `src/styles/app.css`, `tests/e2e/explore.spec.ts`.
- **Summary of the implementation:** SVG targets now expose accessible names plus selected/current/Scenario/representative state; focus and selection remain visually distinct; full text remains available through SVG titles; and a semantic Explore structure lists the same nodes/connections as ordinary focusable controls independent of raw SVG hit testing.
- **Validation or testing performed:** Static/type review passed, reduced-motion behavior remains present, and E2E coverage was added for keyboard Inspect/Select/Escape plus semantic-structure availability.
- **Result and any remaining limitations:** **Corrected for the identified Version 1 gap.** A full assistive-technology audit still belongs in the deployment/browser accessibility verification cycle.
- **Deployment status:** **Deployed in the current GitHub Pages snapshot** (confirmed by the user on 2026-09-01).

## 2026-09-01 — User-facing labels and identifier leakage

- **Change or issue addressed:** Machine IDs, Concept slugs, raw endpoint IDs, and minimally humanized type/property identifiers leaked into normal UI; fixed-length canvas truncation could obscure labels.
- **Reason for the change:** Stable machine identifiers should remain internal while normal presentation uses canonical names and readable technical terminology.
- **Files added or modified:** `src/view-model/labels.ts`, `src/view-model/detail.ts`, `src/app/App.tsx`, `src/styles/app.css`, `tests/e2e/explore.spec.ts`.
- **Summary of the implementation:** Added centralized acronym-aware labels, canonical Concept/entity/connection resolution, friendly occurrence labels including System/Configuration/target, and two-line SVG label wrapping with full text retained in accessible/title text.
- **Validation or testing performed:** Runtime smoke used canonical endpoint/name resolution across all initial-five scenes; E2E coverage asserts Concept occurrences do not expose raw H100 target IDs.
- **Result and any remaining limitations:** **Corrected.** Source/reference IDs remain visible only where evidence/provenance Detail intentionally presents them.
- **Deployment status:** **Deployed in the current GitHub Pages snapshot** (confirmed by the user on 2026-09-01).

## 2026-09-01 — Narrow-screen Explore readability

- **Change or issue addressed:** The fixed 960×600 SVG scaled down with the viewport, making semantic labels too small on phone-width layouts.
- **Reason for the change:** Responsive presentation may change form, but essential Explore labels and controls must remain usable rather than being uniformly shrunk.
- **Files added or modified:** `src/view-model/layout.ts`, `src/app/App.tsx`, `src/styles/app.css`, `tests/e2e/explore.spec.ts`.
- **Summary of the implementation:** Scene dimensions now come from the deterministic layout profile. On narrow screens, the Explore canvas retains a readable minimum width inside a horizontally scrollable viewport instead of shrinking all labels; context controls and Detail continue to stack responsively.
- **Validation or testing performed:** CSS/source review passed; E2E coverage checks that a 390 px viewport produces horizontal canvas overflow and retains a 760 px minimum canvas width.
- **Result and any remaining limitations:** **Corrected for the identified readability defect.** Dense Explore remains primarily optimized for desktop/laptop, consistent with the approved browser-support direction.
- **Deployment status:** **Deployed in the current GitHub Pages snapshot** (confirmed by the user on 2026-09-01).

## 2026-09-01 — Final cumulative correction verification

- **Change or issue addressed:** Regression and cross-file consistency review after all corrections above.
- **Reason for the change:** Later fixes must not overwrite or conflict with earlier semantic corrections.
- **Files added or modified:** `IMPLEMENTATION_CHANGELOG.md` plus the implementation/test files listed in the entries above.
- **Summary of the implementation:** Re-ran canonical/runtime validation, deterministic generation, strict platform-neutral TypeScript checks, full TS/TSX syntax diagnostics, initial-five runtime traversal, semantic unit cases, platform-boundary scans, and canonical/generated diff checks.
- **Validation or testing performed:** 16 systems / 18 configurations pass; 15 Concepts validate with zero canonical errors/warnings; initial-five V1 validation has zero errors; runtime generation is deterministic across 37 artifacts; runtime integrity has zero errors; property fixtures pass 5/5; fallback semantic/unit harness passes 14/14; initial-five smoke traverses 49 entities / 65 scenes / 16 representative contexts; 18 TS/TSX files parse with zero syntax diagnostics; no browser API appears in `src/domain`, `src/state`, or `src/view-model`; canonical content and generated runtime are unchanged by this implementation-only task.
- **Result and any remaining limitations:** **Implementation corrections pass every executable source/content gate available in this environment.** `npm install` cannot complete because registry access times out; therefore pinned-project Vitest, Vite production build, and `@playwright/test` Chromium/Firefox/WebKit execution could not be run here. The external Documentation Confidence evidence remains unavailable exactly as before and was not changed by this task.
- **Deployment status:** **Deployed in the current GitHub Pages snapshot** (confirmed by the user on 2026-09-01).

## 2026-09-01 — Traversal Context completeness and replay

- **Change or issue addressed:** A Cross-Connection Follow retained only one ambiguous locator and did not preserve both the physical origin and the relationship followed; chronological replay could therefore lose or stale the arrival explanation.
- **Reason for the change:** Navigation orientation requires the immediate physical origin and relationship followed to remain recoverable after non-hierarchical traversal, while Application Back/Forward must replay the application's semantic destination rather than infer it from browser state.
- **Files added or modified:** `src/domain/types.ts`, `src/state/engine.ts`, `src/view-model/detail.ts`, `src/app/App.tsx`, `tests/unit/state-engine.test.ts`, `tests/unit/view-models.test.ts`, `tests/e2e/explore.spec.ts`.
- **Summary of the implementation:** Replaced the single traversal-origin field with a typed `TraversalContext` containing `origin` and `via`. Follow captures Structural Location before traversal plus the selected connection, stores that context in the Explore state and the corresponding application-history destination, restores it through valid Forward replay and explicit Return, clears it when unrelated structural movement invalidates the arrival cue, and exposes friendly **Arrived from** / **Via relationship** rows in Detail.
- **Validation or testing performed:** Strict browser-independent TypeScript check passed; dependency-free semantic tests verify Follow origin/relationship capture, Back clearing, and Forward restoration; Detail tests verify friendly traversal labels.
- **Result and any remaining limitations:** **Corrected.** No renderer/DOM identity is stored in Traversal Context.
- **Deployment status:** Not yet deployed; user will update GitHub and redeploy.

## 2026-09-01 — Outward navigation preserves meaningful deeper Selection

- **Change or issue addressed:** Breadcrumb movement outward reused ordinary Enter semantics, clearing a still-meaningful deeper Selection; higher-level scenes also lacked an explicit indication that a visible aggregate contained that Selection.
- **Reason for the change:** Upward movement should restore the higher-scale abstraction while preserving a deeper Selection when it is still semantically within that context, and the visible containing object should identify that it contains the Selection.
- **Files added or modified:** `src/state/engine.ts`, `src/view-model/explore.ts`, `src/app/App.tsx`, `src/styles/app.css`, `tests/unit/state-engine.test.ts`, `tests/unit/view-models.test.ts`, `tests/e2e/explore.spec.ts`.
- **Summary of the implementation:** Added a dedicated ancestor-navigation operation rather than weakening Enter. It validates that the requested destination is a true canonical/representative ancestor, preserves only Selections that remain inside that context, records the structural/application movement, and clears obsolete traversal arrival state. Explore view models now derive `containsSelection` for visible ancestors; SVG and semantic-outline presentations expose that state textually/accessibly and with a non-color-only dash treatment.
- **Validation or testing performed:** Semantic unit coverage verifies Selection preservation and history participation; view-model coverage verifies the correct visible ancestor is marked; strict core TypeScript passes.
- **Result and any remaining limitations:** **Corrected.** Ordinary Enter still clears Selection as required; only genuine outward/ancestor navigation receives the preservation behavior.
- **Deployment status:** Not yet deployed; user will update GitHub and redeploy.

## 2026-09-01 — Representative-context terminology and Scenario conservatism hardening

- **Change or issue addressed:** Nested representative breadcrumbs could fall back to canonical plural entity names, and a Scenario effect on a canonical aggregate/template could be presented as though it were member-specific at the root Representative Member Context.
- **Reason for the change:** Representative Member Contexts are noncanonical exemplars at every nesting level, and aggregate/model-level Scenario state must never be silently assigned to an unspecified member.
- **Files added or modified:** `src/view-model/explore.ts`, `src/view-model/detail.ts`, `src/app/App.tsx`, `tests/unit/view-models.test.ts`, `tests/e2e/explore.spec.ts`.
- **Summary of the implementation:** Every representative breadcrumb segment now uses exemplar-aware labeling. Representative Preview and Detail resolve Scenario effects only as modeled aggregate/context state and explicitly state that individual representative-member state is unspecified, including at the first/root representative level.
- **Validation or testing performed:** Unit coverage now tests conservative Scenario state at both root and nested representative contexts; E2E source coverage asserts nested exemplar breadcrumb wording; initial-five runtime smoke includes representative contexts.
- **Result and any remaining limitations:** **Corrected.** No ordinal or addressable identity is manufactured.
- **Deployment status:** Not yet deployed; user will update GitHub and redeploy.

## 2026-09-01 — Concept search includes explanatory article content

- **Change or issue addressed:** Client Concept search indexed name, aliases, summary, and tags but omitted canonical Markdown article content.
- **Reason for the change:** The implementation plan specifies that long explanatory content participates in client search at lower weight than canonical names/aliases and concise metadata.
- **Files added or modified:** `src/app/App.tsx`, `tests/e2e/explore.spec.ts`.
- **Summary of the implementation:** Added canonical Concept `markdown` to the Fuse.js index at the lowest weight while retaining name/aliases as the strongest signals. Existing query state and contextual Concept behavior are unchanged.
- **Validation or testing performed:** Source/type checks pass; E2E coverage searches an RDMA phrase that exists only in its explanatory Markdown and expects the canonical RDMA Concept result.
- **Result and any remaining limitations:** **Corrected.** No fuzzy architecture identity inference was introduced; this change affects Concept Library text search only.
- **Deployment status:** Not yet deployed; user will update GitHub and redeploy.

## 2026-09-01 — Current-Location Detail uses authored scope and modeling context

- **Change or issue addressed:** Root Current-Location Detail relied on a generic entity description even though each Reference Configuration already contains authored `scopeNotes` and material `modelingNotes` describing the educational boundary and simplifications.
- **Reason for the change:** Current-Location Summary should explain the current architecture concisely, and material limitations already present in canonical content should be visible when they affect interpretation rather than being replaced by generic prose.
- **Files added or modified:** `src/view-model/detail.ts`, `tests/unit/view-models.test.ts`, `tests/e2e/explore.spec.ts`.
- **Summary of the implementation:** Root Current-Location Summary now uses the configuration's canonical `scopeNotes`; root Evidence/provenance includes authored `modelingNotes`. Non-root entities prefer an authored evidence note when one exists before falling back to a generic Tier/representation sentence.
- **Validation or testing performed:** Unit coverage verifies scope/modeling-note projection without changing canonical content; canonical/runtime diff checks confirm no source or generated-runtime data was altered by the presentation fix.
- **Result and any remaining limitations:** **Corrected.** The UI does not invent new architectural claims; it exposes existing canonical authored text.
- **Deployment status:** Not yet deployed; user will update GitHub and redeploy.

## 2026-09-01 — Changelog deployment-status reconciliation

- **Change or issue addressed:** Entries from the prior discrepancy-correction pass still said “Not yet deployed” after the user confirmed that corrected build is now the current GitHub Pages deployment.
- **Reason for the change:** The implementation log should remain a chronological record of known deployment state rather than carry stale handoff status.
- **Files added or modified:** `IMPLEMENTATION_CHANGELOG.md`.
- **Summary of the implementation:** Prior correction entries now record that they are present in the current GitHub Pages snapshot, based on the user's explicit deployment confirmation. The new corrections in this audit remain marked not yet deployed.
- **Validation or testing performed:** Final stale-reference scan verifies no prior correction entry still claims it is awaiting the already-completed deployment.
- **Result and any remaining limitations:** **Corrected documentation state.** No implementation behavior changed.
- **Deployment status:** This changelog revision is not yet deployed; user will update GitHub and redeploy.


## 2026-09-01 — Second-pass cumulative audit verification

- **Change or issue addressed:** Final regression, cross-fix contamination, terminology, stale-reference, and documentation consistency review after the second audit corrections.
- **Reason for the change:** The second-order fixes modify shared navigation/view-model seams and must coexist with the previously deployed correction set without reintroducing the original discrepancies.
- **Files added or modified:** `IMPLEMENTATION_CHANGELOG.md` plus the implementation/test files listed in the immediately preceding second-pass entries.
- **Summary of the implementation:** Rechecked the cumulative source for obsolete traversal fields, direct breadcrumb use of Enter, unresolved relative imports, canonical/generated-content drift, representative terminology consistency, selection ancestry presentation, and stale deployment-status text. No canonical content or generated runtime artifacts are part of this correction handoff.
- **Validation or testing performed:** Full Python content validation passes for 16 systems / 18 configurations and 15 Concepts; initial-five validation reports zero errors; deterministic runtime check passes for 37 artifacts; runtime integrity reports zero errors; Property fixtures pass 5/5; strict browser-independent TypeScript passes; dependency-free semantic/view-model unit harness passes 19/19; real-data smoke covers 49 entities, 65 Explore/Detail contexts, 16 Representative Member Contexts, and 44 deeper-selection visibility checks; all local TypeScript imports resolve. A package-backed `npm ci` attempt was made but did not complete because registry access remained unavailable in this environment, so project Vitest/Vite/Playwright execution remains pending the normal dependency-capable environment.
- **Result and any remaining limitations:** **All source/content gates available without npm dependencies pass.** No new product decision is required. The existing Documentation Confidence evidence dependency remains external and unchanged.
- **Deployment status:** Not yet deployed; user will update GitHub and redeploy.


## 2026-09-07 — Physical Orientation Baseline, Anatomy Depictions, and Product Catalog

- **Change or issue addressed:** Implemented Source-of-Truth v0.8 physical-orientation requirements and Product Catalog migration across the supplied executable baseline.
- **Reason:** Entered contexts must show source-supported physical anatomy without inventing entity identity; reusable product facts require exact revisioned references.
- **Files added or modified:** RSC schemas/content, Scenario catalogs, Product Catalog, capability/property registries, compiler/validators/readiness tools, runtime artifacts, Explore/Detail/accessibility code, tests, benchmark/report artifacts, and this changelog.
- **Summary:** Added additive RSC 1.4.0 support, exact `product_ref`, Product Definitions, noninteractive Anatomy Depictions, `system_memory`/`power_system`, initial-five and later-candidate reconciled content additions, physical-orientation readiness, and post-expansion Chromium density benchmarking.
- **Validation/testing:** Full Python/content pipeline PASS; 16 systems/18 configs; 15 Concepts; 45 Properties; 54 deterministic runtime artifacts; branch coverage 75/0 errors; RDY-018 21/0 errors; Product/Anatomy tests 3/3; Concept tests 9/9; Property fixtures 5/5; Chromium benchmark PASS.
- **Result/limitations:** Content/runtime implementation passes. npm-backed TypeScript/Vitest/Vite/Playwright gates are BLOCKED because `registry.npmjs.org` cannot resolve and the dependency tree is incomplete. Documentation Confidence evidence remains externally unavailable.
- **Deployment status:** Not deployed by Implementation.

## 2026-09-07 — Device-interior physical coverage expansion

- **Change or issue addressed:** Relationship-connected terminal devices could be contextually enterable in Explore while still opening to an empty scene because the physical-orientation audit modeled only child/representative-member Entry.
- **Reason:** The project's physical-first goal requires device interiors to expose source-supported physical constituents and uncertainty boundaries, including switches, accelerators, NICs/DPUs, storage devices, cooling/power subsystems, and support appliances.
- **Files added or modified:** Initial-five RSCs and generated runtime artifacts; Explore/Detail view-model and rendering code; physical-orientation audit/readiness records; unit/E2E coverage; implementation/content/handoff documentation; changelog.
- **Summary:** Expanded source-bounded Anatomy Depictions across all five initial systems. Device-specific documented hardware is marked verified; generic/inferred/simplified anatomy is marked representative or limited-detail. Terminal entities with authored anatomy can now expose contextual **Enter** without turning depictions into semantic Entities. Anatomy layout moved to wider three-column cards with visible evidence, placement, and count cues. The readiness audit now mirrors Explore Entry semantics, including architectural relationship endpoints and anatomy-bearing terminal devices.
- **Validation/testing:** Canonical/runtime Python pipeline PASS; 16 systems / 18 configurations; Product/Anatomy PASS; 15 Concepts; V1 5 systems / 45 Properties / 0 errors; deterministic runtime 54 artifacts; branch coverage 75 / 0 errors; RDY-018 **65 entered contexts / 0 errors**; Property fixtures 5/5. TypeScript/Vitest/Vite/Playwright execution remains unavailable in this snapshot because `node_modules` is absent; this is recorded as an environment limitation, not a baseline failure.
- **Remaining evidence limits:** Exact GB300 E1.S cache population, exact Meta Arista 7800 chassis/generation, deployment-specific external storage internals, private Ironwood CPU/DCN/OCS/cooling BOM details, and exact Cerebras support-appliance BOMs remain generic, representative, or black-box pending stronger evidence/user confirmation.
- **Deployment status:** Not deployed by Implementation; user will apply the changed-files patch locally.

## 2026-09-10 — Visual Design Phase 4 connection language and boundary presentation

- **Change or issue addressed:** Typed Cross-Connections were semantically rich but visually near-uniform; relationship-family dashes also competed with Preview, Selection, Scenario, and aggregation state, and true external continuations were separated from the schematic canvas.
- **Reason for the change:** Physical/data/dependency/management distinctions and enclosure crossings must be readable without changing containment or inferring physical cable routes.
- **Files added or modified:** `src/view-model/connectionVisuals.ts`, `src/view-model/explore.ts`, `src/view-model/layout.ts`, `src/app/explore/ConnectionPrimitives.tsx`, `src/app/explore/ConnectionGlyph.tsx`, `src/app/explore/BoundaryConnectionGlyph.tsx`, `src/app/explore/VisualKey.tsx`, `src/app/explore/ExploreCanvas.tsx`, `src/app/explore/ExploreSupportingViews.tsx`, `src/styles/app.css`, `tests/unit/visual-design-phase4-connections.test.ts`, `tests/e2e/explore.spec.ts`, `docs/VISUAL_DESIGN_PHASE4_CONNECTIONS.md`, `docs/IMPLEMENTATION.md`.
- **Summary of the implementation:** Added a total seven-family relationship visual map with non-color markers, separate authored directionality, deterministic orthogonal/n-ary routing, collision-aware binary detours, true boundary-crossing classification and schematic boundary stubs, a contextual Connection Key, and separate edge channels for aggregation/Scenario/Preview/Selection. Relationships summarized inside an aggregate are explicitly kept distinct from true boundary crossings.
- **Validation or testing performed:** Dependency-free TypeScript source/unit/E2E syntax checks pass; real-runtime Phase-4 connection smoke passes; H100, GB300, and Meta were rendered in system Chromium and inspected after correcting boundary gutter and Meta route collision behavior. Full canonical/runtime validation is recorded in the cumulative Phase-4/5 handoff.
- **Result and any remaining limitations:** **Implemented.** Textual Cross-Connection views remain alongside on-canvas stubs until the later dependency-backed accessibility/browser gate can verify whether focus-target consolidation is appropriate. Pinned npm/Playwright execution is unavailable in this repository snapshot because `node_modules` is absent.
- **Deployment status:** Not deployed by this handoff; user will apply the changed-files patch locally.

## 2026-09-10 — Visual Design Phase 5 orthogonal state language and Scenario strip

- **Change or issue addressed:** Node/enclosure Preview, Selection, descendant Selection, and Scenario emphasis competed for similar borders, while Scenario explanation was not integrated with the physical schematic.
- **Reason for the change:** Simultaneous interaction/dynamic states must remain distinguishable from role, relationship, aggregation, and Representative semantics, and Scenario context must be understandable without opening Detail.
- **Files added or modified:** `src/view-model/explore.ts`, `src/app/App.tsx`, `src/app/explore/StateOverlayGlyphs.tsx`, `src/app/explore/ScenarioStrip.tsx`, `src/app/explore/ExploreCanvas.tsx`, `src/app/explore/ConnectionGlyph.tsx`, `src/app/explore/BoundaryConnectionGlyph.tsx`, `src/styles/app.css`, `tests/unit/visual-design-phase5-state-scenario.test.ts`, `tests/e2e/explore.spec.ts`, `docs/VISUAL_DESIGN_PHASE5_STATE_AND_SCENARIO.md`, `docs/IMPLEMENTATION.md`.
- **Summary of the implementation:** Added separate Scenario underlays/markers, Selection rings, focus brackets, descendant markers, and an authored Scenario strip with explicit affected-target summary and physical-structure-stability wording. Connections reuse the Phase-4 overlay channels so family syntax remains unchanged. Representative-context Scenario wording remains conservative when individual member state is unspecified.
- **Validation or testing performed:** Dependency-free TypeScript source/unit/E2E syntax checks pass; real-runtime Phase-5 state/Scenario smoke passes; Meta edge-state collision, GB300 selected/focused/Scenario aggregate, GB300 descendant+Scenario, and H100 Scenario-context scenes were rendered in system Chromium. Render inspection found and resolved an enclosure-marker/header collision and caused the Phase-4 Meta route to be corrected before Phase 5 completion. Full canonical/runtime validation is recorded in the cumulative handoff.
- **Result and any remaining limitations:** **Implemented.** Phase 5A calibration and the dependency-backed Phase-6 software/accessibility gate have not begun. No state-engine or canonical content/schema changes were required.
- **Deployment status:** Not deployed by this handoff; user will apply the changed-files patch locally.

## 2026-09-10 — Visual Design Phase 5A integrated calibration gate

- **Change or issue addressed:** The completed enclosure/anatomy/connection/state/Scenario grammar needed a deliberate rendered integration pass before its screenshots could become Phase-6 regression candidates. The review found that several true boundary destinations were semantically correct but visually ellipsized by the one-line 28-character boundary-label treatment.
- **Reason for the change:** Phase 5A exists specifically to catch presentation interactions that source/type checks miss and to ensure the three pilots have a coherent cue hierarchy without introducing new semantics. Full destination names materially improve rapid distinction among compute, storage, management, cooling, and power continuations.
- **Files added or modified:** `src/app/explore/BoundaryConnectionGlyph.tsx`, `src/styles/app.css`, `tests/fixtures/visual-regression-phase5a.json`, `tests/unit/visual-design-phase5a-calibration.test.ts`, `tests/e2e/explore.spec.ts`, `docs/VISUAL_DESIGN_PHASE5A_CALIBRATION.md`, `docs/IMPLEMENTATION.md`, `IMPLEMENTATION_CHANGELOG.md`.
- **Summary of the implementation:** Calibrated boundary destination labels to a bounded two-line 28-character fit using the existing schematic gutter and increased their text size from 9px to 9.5px. Added a deterministic manifest covering seven approved H100/GB300/Meta semantic states and ten bounded render variants for Phase 6. No endpoint identity, route semantics, containment, state-engine behavior, canonical content, or asset contract changed.
- **Validation or testing performed:** Rendered the seven pilot states with the exact current Explore view model/SVG components after dependency-free TypeScript compilation; additionally rendered narrow, grayscale, and Chromium forced-colors variants. Browser geometry checks report zero checked boundary-label overlaps/out-of-bounds cases and zero node/Anatomy text-outside-shell cases across the seven states. Canonical/runtime validation, dependency-free source/unit/E2E TypeScript checks, and the Phase-5A runtime fixture smoke pass. The fixture was reconciled against current generated runtime (`baseline-normal-operation`; Meta root `meta-h100-roce`) before acceptance. Dependency-backed checks were attempted explicitly: `npm test` is blocked by missing Vitest, repository typecheck by missing pinned type packages, `npm run build` passes content generation/validation then stops at the typecheck gate, and project Playwright cannot run without the project dependency tree.
- **Result and any remaining limitations:** **Phase 5A completed.** The three pilot scenes are approved as visual-regression candidates. Phase 6 must generate authoritative screenshots in the pinned project/browser environment and still owns keyboard, screen-reader, high-contrast, reduced-motion, and browser-matrix validation. Existing textual Cross-Connection views remain pending that accessibility evaluation.
- **Deployment status:** Not deployed by this handoff; user will apply the changed-files patch locally.
