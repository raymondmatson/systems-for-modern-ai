---
title: "Systems for Modern AI Project — Delivery, Rendering, and Platform Implementation Plan"
project: "Systems for Modern AI Project"
status: "Implementation-planning companion"
last_updated: "2026-08-26"
source_of_truth_section: "Section 8 — Delivery, Rendering, and Platform Baseline"
version: "0.2"
---

# Systems for Modern AI Project — Delivery, Rendering, and Platform Implementation Plan

**Last updated:** 2026-08-26  
**Status:** Implementation-planning companion  
**Authority:** `Systems_for_Modern_AI_Project_Source_of_Truth.md` remains authoritative for product behavior and binding design decisions. This document translates the established delivery/platform decisions in Source of Truth Section 8 into implementation boundaries and migration guidance. If the two documents conflict, the Source of Truth governs.

## 1. Purpose and scope

This document exists because detailed Version-1 technology, module-boundary, migration, testing, and future-native-client guidance is more specific than the product-level Source of Truth should carry. It also serves as the current implementation decision register for technical choices that operationalize established Source-of-Truth semantics without becoming product-level truth.

It does **not** create a second product specification. It provides implementation guidance for preserving the established decisions that:

- Version 1 is browser-first;
- Explore uses a layered **2D semantic canvas** and 2D remains the long-term rendering direction;
- browser-specific presentation and platform services should remain isolated from semantic/domain logic; and
- a future genuinely native standalone client may be implemented in **C++20-or-later with Qt 6**, without treating a packaged browser wrapper as the native-client target.

Most Version-1 implementation choices are now resolved or provisionally resolved below. Only renderer fallback/virtualization thresholds that require representative performance evidence remain intentionally open.

## Table of contents

1. [Purpose and scope](#1-purpose-and-scope)
2. [Binding decisions consumed from the Source of Truth](#2-binding-decisions-consumed-from-the-source-of-truth)
3. [Recommended Version-1 architecture boundary](#3-recommended-version-1-architecture-boundary)
4. [Dependency rules for Version 1](#4-dependency-rules-for-version-1)
5. [Version-1 implementation decisions](#5-version-1-implementation-decisions)
6. [Future native client target](#6-future-native-client-target)
7. [Native-client migration model](#7-native-client-migration-model)
8. [Browser-specific coupling to avoid](#8-browser-specific-coupling-to-avoid)
9. [Cross-language conformance strategy](#9-cross-language-conformance-strategy)
10. [Version-1 complexity impact](#10-version-1-complexity-impact)
11. [Implementation handoff checklist](#11-implementation-handoff-checklist)
12. [Summary](#12-summary)

## 2. Binding decisions consumed from the Source of Truth

The following table is a concise cross-reference, not a duplicate normative specification.

| Source-of-Truth decision | Implementation consequence |
|---|---|
| **PLT-001 / PLT-002** — long-term 2D; browser-first Version 1 | Optimize the first client for a browser-hosted layered 2D Explore experience. Do not design a 3D scene model or camera abstraction. |
| **PLT-003 / PLT-004** — context-driven 2D presentation; geometry is not architectural truth | Navigation/state selects semantic context; the renderer derives the current 2D scene. Pixel coordinates, DOM nodes, and canvas objects never become entity identity or canonical Containment. |
| **PLT-005 / PLT-006** — platform-neutral semantic core; browser services isolated | Domain/state/content/validation/business rules must not directly depend on HTML, DOM, `window`, browser storage, browser history, or other browser-only APIs. |
| **PLT-007 / PLT-008** — possible native standalone client; wrapper is distinct | A future Electron/Tauri-style wrapper may package the web client, but does not satisfy the planned meaning of a genuinely native desktop client. |
| **PLT-009** — preferred native target | If the native client is pursued, the default target is compiled **C++20-or-later + Qt 6**. Exact Qt rendering classes remain future implementation choices. |
| **PLT-009 / PLT-010** — migration/reuse expectations; avoid speculative overengineering | Preserve content contracts, IDs, behavior specifications, and test vectors. Do not force Version 1 into C++/WebAssembly or a generalized cross-platform UI abstraction solely for hypothetical source-code reuse. |
| **PLT-011** — implementation-owned browser technology | Record concrete Version-1 technology choices here rather than in product-level source truth; preserve the prototype gate for performance-sensitive renderer fallback. |

## 3. Recommended Version-1 architecture boundary

The preferred dependency direction is:

```text
Canonical YAML / Markdown / Schemas
              ↓
     Content parsing / normalization
              ↓
   Platform-neutral domain model
              ↓
 Platform-neutral application/state rules
              ↓
     View-model / presentation model
              ↓
     Browser 2D presentation layer
```

Platform-dependent services should enter through narrow adapters rather than through the domain model:

```text
Browser APIs ──> Browser adapters ──> application/service ports
                                      ↑
Native APIs  ──> Future Qt adapters ──┘
```

### 3.1 Domain model

The domain layer should represent semantic project objects and relationships such as:

- Reference System and Reference Configuration;
- entities and configuration-local IDs;
- Containment and Cross-Connections;
- Aggregate Entity / Representative Member Context / Addressable Member semantics;
- Concepts and Concept occurrences;
- Scenario definitions and resolved Scenario state;
- Property Values and measurement semantics; and
- evidence, representation, and provenance metadata.

The domain layer should not contain:

- DOM nodes;
- HTML element IDs as object identity;
- CSS classes;
- browser URLs as semantic identity;
- canvas/SVG/WebGL object handles;
- screen coordinates as canonical location; or
- direct calls to browser or operating-system services.

Stable project IDs and Context Locators remain the semantic identity layer.

### 3.2 Application and state-transition layer

Navigation and interaction rules should be implemented as semantic operations over serializable state, not as side effects owned by the renderer.

Representative commands include:

```text
Inspect(target)
Select(target)
ClearSelection()
Enter(context_locator)
Follow(connection_or_destination)
ChangeScenario(scenario_id)
SwitchConfiguration(configuration_id)
OpenConcept(concept_id)
ReturnToOrigin()
Back()
Forward()
```

The resulting state should describe semantic outcomes such as Structural Location, Tier, Selection, history, Scenario, Current Concept, and Return Context. The browser renderer should observe the result rather than define the rules.

Where practical, state-transition functions should be deterministic and testable without a browser runtime.

### 3.3 Content-loading boundary

Canonical authoring remains YAML/Markdown plus the established schemas and validators. Runtime loading should be separated into two concerns:

1. **Transport/source adapter** — where bytes/text come from; and
2. **parse/normalize/validate pipeline** — what those bytes/text mean.

A browser source adapter may load generated/bundled artifacts through `fetch()` or static imports. A future native adapter may load the same logical content from application resources or local files. Domain code should receive normalized semantic data rather than fetch responses, URLs, or filesystem handles.

A useful conceptual interface is:

```text
ContentRepository
  loadReferenceSystem(id)
  loadConcept(id)
  loadScenarioCatalog(configuration_id)
  loadInventory()
```

This is a boundary concept, not a requirement to create an elaborate repository framework before the application needs it.

### 3.4 Validation boundary

Validation rules are part of the language-neutral project contract even when their current executable implementation is Python or another Version-1 tooling language.

Keep these distinct:

- **schemas and rule definitions** — reusable project contract;
- **validator implementations** — language-specific tooling;
- **validation fixtures / expected results** — reusable conformance assets.

A future C++ client may consume prevalidated build artifacts, reimplement selected runtime validation, or both. Version 1 does not need a C++ validator solely to prepare for that future.

Cross-file rules that exceed JSON Schema should remain explicit and covered by tests so they can be reproduced in another language without reverse-engineering browser code.

### 3.5 Rendering and layout boundary

The 2D renderer consumes semantic state and produces a context-appropriate scene. It may use different layouts at different Tiers or Structural Locations.

Conceptually:

```text
Resolved Configuration Graph
+ Architectural Context
+ Structural Location / Tier
+ Scenario state
+ Selection / Preview
              ↓
      2D presentation model
              ↓
    browser renderer technology
```

The renderer may emit semantic user intents back to the application:

```text
pointer/focus hit → semantic target ID → Inspect / Select / Enter / Follow
```

The following must remain presentation-only unless separately established as architectural facts:

- x/y coordinates;
- bounding boxes;
- route geometry for drawn edges;
- label placement;
- zoom level;
- viewport transform;
- DOM/SVG/canvas handles; and
- animation state.

If a layout is cached, the cache is derived presentation data and can be discarded/recomputed without changing architectural truth.

### 3.6 Persistence boundary

The initial semantic contract requires only session/application-state behavior already established in the Source of Truth; durable cross-session restoration remains deferred. Version 1 therefore keeps semantic navigation/session state **in memory by default** and does not require `localStorage`, IndexedDB, or another durable browser store for architectural state.

If a small nonsemantic preference later justifies persistence, browser storage must sit behind a narrow interface rather than spread platform calls through application logic.

Conceptually:

```text
PersistenceStore
  loadPreferences()
  savePreferences(...)
  loadSessionState()      # only if/when initial implementation needs it
  saveSessionState(...)
```

A future native implementation can replace the adapter with application preferences, files, SQLite, or another native mechanism without changing the state model.

Persist stable semantic IDs and reconstructable state—not renderer coordinates or DOM identity.

### 3.7 File access and platform services

Only introduce service ports for capabilities the application actually uses. Likely boundaries include:

| Capability | Version-1 browser implementation | Possible native implementation |
|---|---|---|
| Content source | Bundled/static assets or HTTP fetch | Application resources or filesystem |
| User file open/import | Browser file APIs when needed | Qt/native file dialog |
| Save/export | Browser download APIs when needed | Qt/native save dialog |
| Persistence | Browser storage | Native preferences/file/SQLite |
| Clipboard | Browser Clipboard API | Qt clipboard |
| External links | Browser navigation | Native default-browser launch |
| Notifications | Web notifications if ever required | Native/Qt notification path |

Do not create ports for speculative capabilities solely to make the code look cross-platform.

## 4. Dependency rules for Version 1

The following rules should guide code review and module organization.

### IMP-PLT-001 — Core modules do not import browser presentation APIs

Domain, state-transition, content-normalization, validation-rule, and business-rule modules should not import or require `window`, `document`, DOM types, browser history, browser storage, or renderer-specific classes.

### IMP-PLT-002 — Semantic identity never depends on rendered identity

State stores stable IDs/Context Locators. DOM IDs, SVG elements, canvas display objects, and hit-test objects are adapters to semantic identity rather than its source.

### IMP-PLT-003 — Browser history is not the canonical application history

Application Navigation History, Explore Structural History, and Return Context follow the Source of Truth. Browser URL/history synchronization may be added as presentation/navigation integration, but it must not redefine those semantics.

### IMP-PLT-004 — Browser persistence is an adapter

Do not let `localStorage`, IndexedDB, cookies, or service-worker caches become domain contracts.

### IMP-PLT-005 — HTTP is not the content model

URLs and HTTP response shapes are transport details. The semantic content contract is the validated/normalized project data model.

### IMP-PLT-006 — Layout coordinates are not source-of-truth data by default

Coordinates may be generated, tuned, or cached for presentation, but they do not establish physical identity, Containment, or cross-view context.

### IMP-PLT-007 — Accessibility semantics do not live only in the drawing technology

Maintain semantic focus targets, labels, actions, and Detail behavior independently enough that the chosen browser renderer can be replaced without changing Inspect/Select/Enter rules.

### IMP-PLT-008 — Keep external dependencies at the edge

Third-party graph/layout/rendering libraries may operate on adapter/view-model structures. Avoid allowing a library-specific graph object to become the project's domain model.

### IMP-PLT-009 — Use language-neutral serialization at major seams

Where state, generated content, fixtures, or migration artifacts cross process/language boundaries, prefer stable JSON-like structures governed by explicit schemas or documented contracts rather than framework-specific object serialization.

### IMP-PLT-010 — Future portability does not justify speculative dual implementation

Version 1 should not create a second native implementation, a C++/WebAssembly core, or a generalized multi-platform UI framework unless a present Version-1 requirement independently justifies it.

## 5. Version-1 implementation decisions

This section records **technical implementation choices**, not product-level semantics. The Source of Truth remains authoritative for user behavior and durable architectural constraints. A choice marked **Provisionally Resolved** is the current default but has an explicit evidence-based review trigger. A choice marked **Still Open** requires prototype or migration evidence before it is frozen; it does not require a new product decision unless that evidence reveals a semantic conflict.

### 5.1 Browser application stack

#### IMP-STACK-001 — Browser client language

**Status: Resolved**  
**Confidence: High**

Use **TypeScript with strict type checking** for the Version-1 browser client.

TypeScript types implement the project's language-neutral contracts; they do not replace YAML/JSON Schemas, stable identifiers, or serialized conformance fixtures. Keep framework/browser types out of domain contracts.

#### IMP-STACK-002 — UI framework

**Status: Resolved**  
**Confidence: High**

Use **React 19.x** for the browser application shell, Concepts, Detail, controls, and accessible document-oriented UI. Pin a compatible current stable minor when the dependency lock is created rather than encoding a minor version into project semantics.

React components consume view models and semantic actions. Canonical Navigation, Scenario, Selection, Concept, and Return behavior must not live only in component-local state.

#### IMP-STACK-003 — Application state

**Status: Resolved**  
**Confidence: High**

Use **Redux Toolkit + React-Redux** for application-level state and action coordination. Domain/state-transition functions should remain deterministic and independently testable where practical; Redux is the Version-1 host for those semantics rather than their definition.

Do not serialize Redux implementation internals into language-neutral fixtures or future native-client contracts.

#### IMP-STACK-004 — Build/bundling

**Status: Resolved**  
**Confidence: High**

Use **Vite** with the current stable release compatible with the selected React/TypeScript toolchain. Generated runtime content remains ordinary language-neutral assets rather than Vite-specific serialized objects.

### 5.2 Explore rendering and layout

#### IMP-RENDER-001 — SVG-first layered 2D renderer

**Status: Provisionally Resolved**  
**Confidence: Medium**  
**Assumption:** semantic aggregation keeps the ordinary interactive scene small enough that DOM-backed SVG remains responsive.  
**Review trigger:** the representative initial-five rendering prototype fails agreed interaction/performance criteria because of SVG scene size, edge density, hit testing, or update cost.

Implement Explore **SVG-first**, with ordinary HTML/React for surrounding Detail, Concepts, controls, and document UI. SVG is preferred initially because the application is label-heavy, object-interactive, keyboard/focus sensitive, and accessibility conscious.

Do not build a generalized multi-renderer framework. If profiling shows a genuine dense-layer bottleneck, add a Canvas/WebGL presentation backplane only for the affected nonsemantic/dense layers while keeping semantic actions, focusable targets, Selection, and identity outside that drawing technology.

#### IMP-RENDER-002 — Layout strategy

**Status: Provisionally Resolved**  
**Confidence: Medium–High**  
**Assumption:** most physical containment views benefit more from stable architecture-specific layout than from generic graph optimization.  
**Review trigger:** a topology-heavy initial configuration cannot be laid out clearly or maintainably with deterministic project layouts plus the selected graph-layout adapter.

Use **deterministic architecture-specific layout functions** for physical containment views such as racks, trays, servers, packages, and repeated structural groups. Use **elkjs** as an adapter for graph/topology-heavy contexts where layered automatic layout materially improves readability. Run expensive ELK layout work in a Web Worker when needed.

ELK objects and generated coordinates remain presentation data, never the domain graph or canonical Containment.

#### IMP-RENDER-003 — Semantic visibility before renderer budgets

**Status: Resolved policy; numeric thresholds Still Open**  
**Confidence: Medium**

Apply authored/semantic aggregation, current Tier, Structural Location, educational relevance, Selection/Preview, and Scenario emphasis **before** renderer-level virtualization. Do not establish one global object-count cutoff.

Exact visibility thresholds remain open until representative scenes are measured. They are renderer tuning, not Reference-System source data unless an author is explicitly expressing a semantic representation decision.

#### IMP-RENDER-004 — Virtualization

**Status: Provisionally Resolved behavior; activation limit Still Open**  
**Confidence: Medium**  
**Assumption:** many V1 scenes will not require aggressive virtualization because aggregate semantics reduce visible population.  
**Review trigger:** benchmarked frame/update latency or memory exceeds the agreed prototype budget.

When needed, virtualize rendered **Addressable Members** outside the viewport using viewport plus overscan. Semantic identity and navigation remain complete even when a glyph is not materialized. Never virtualize the selected or keyboard-focused semantic target out of the accessible interaction model.

The exact activation limit remains open pending prototype measurements.

### 5.3 Navigation and view-state presentation

#### IMP-NAV-001 — Explore Structural History UI

**Status: Resolved**  
**Confidence: High**

Retain the complete session-local linear Explore Structural History without compression/deduplication. Use canonical containment breadcrumbs for ancestry/parent movement and application Back/Forward for chronological application navigation. Do not create a second permanent set of structural-history Back/Forward controls.

If direct history browsing proves useful, add an optional compact **Recent Explore locations** affordance backed by Context Locators.

#### IMP-NAV-002 — Back/Forward/Return presentation

**Status: Resolved**  
**Confidence: High**

Expose **Back** and **Forward** as global application controls. Expose semantic **Return** separately and contextually, using a destination-aware label such as **Return to GPU 5** or **Return to RDMA** when Return Context exists.

Mirror browser Back/Forward through a narrow history adapter. Browser `popstate` requests semantic replay from the application's own history engine; browser history is not canonical. Do not introduce a routing framework solely to implement the project's Navigation semantics.

#### IMP-NAV-003 — Best-effort local presentation restoration

**Status: Resolved**  
**Confidence: High**

Keep scroll position, expanded Detail/Concept sections, and similar nonsemantic presentation state **in memory** and view-local. They do not enter Application Navigation History, Return Context, canonical URLs, or persisted semantic state. Reset gracefully when the destination/content no longer matches.

#### IMP-NAV-004 — Detail presentation tuning

**Status: Resolved baseline; usability tuning permitted**  
**Confidence: High**

Retain the Source-of-Truth hover baseline of approximately **250 ms activation / 150 ms dismissal grace** as the first prototype values. Use a persistent side Detail Area on wide layouts and a drawer/bottom-sheet style surface on constrained layouts. Keep dimensions/breakpoints as presentation tokens rather than semantic state. Honor reduced-motion preferences and avoid adding extra V1 keyboard accelerators unless testing demonstrates a need.

### 5.4 Runtime content, build, and validation

#### IMP-DATA-001 — Generated runtime artifacts

**Status: Resolved**  
**Confidence: High**

Compile canonical YAML/Markdown into **versioned generated JSON artifacts** for the browser runtime. A recommended logical structure is:

```text
runtime/
  manifest.json
  systems/<system-id>.json
  scenarios/<configuration-id>.json
  concepts/index.json
  concepts/<concept-id>.json
```

The manifest records runtime-format version, relevant source-schema revisions, Concept Library revision, and default identifiers. Runtime system artifacts may contain derived lookup indexes such as parent/child maps, connection maps, Concept occurrences, and normalized comparison data. Layout coordinates, if cached, remain separately regenerable presentation data.

Generated JSON is a derivative build artifact and never replaces canonical YAML/Markdown authoring sources.

#### IMP-DATA-002 — Python content compiler/validator pipeline

**Status: Resolved**  
**Confidence: High**

Extend the existing **Python** validators into the deterministic content build pipeline:

`canonical validation → cross-file/referential validation → normalization → runtime JSON generation → runtime-artifact validation → browser build`

Do not duplicate the full canonical source validator in TypeScript for V1. The browser consumes prevalidated packaged artifacts and performs only lightweight runtime-format/version/integrity checks. A full browser-side JSON-Schema validator may be added later if user-supplied content/import becomes a product requirement.

#### IMP-DATA-003 — Invalid-content and runtime failure behavior

**Status: Resolved**  
**Confidence: High**

- canonical or blocking cross-file validation failure → fail CI/build;
- do not emit an invalid blocking artifact;
- missing/corrupt runtime chunk → present a concise **Content unavailable** state and preserve the last valid context where possible;
- if the default packaged system cannot load, use another fallback only when that fallback is explicitly declared valid; and
- never guess replacement entity IDs, Concept IDs, Scenarios, or cross-system equivalents.

Detailed diagnostics remain developer-facing while user-facing behavior stays conservative.

### 5.5 Reference-System schema, aggregation, and capability implementation

#### IMP-RSC-001 — Coordinated source-schema migration

**Status: Provisionally Resolved**  
**Confidence: Medium–High**  
**Assumption:** the required new fields can be introduced additively while retaining temporary legacy compatibility.  
**Review trigger:** an initial-five migration pilot demonstrates that the required semantic changes cannot be represented cleanly without breaking the 1.x contract.

Target one coordinated **Reference-System schema 1.3.0** implementation revision for the Version-1 additions rather than several overlapping micro-migrations. Until that migration is complete, **1.2.0 remains the current authoritative source-schema baseline** in the Source of Truth.

The planned additive revision covers structured population/repetition metadata, canonical Concept occurrence links, Scenario-catalog linkage/default identity, and structured comparison-capable Property Values. Legacy authoring forms may remain temporarily accepted with migration warnings; the **Ship-Ready** validation profile rejects unresolved legacy forms that violate RDY requirements.

Migrate the initial five systems first, then apply the migration to later-candidate configurations when appropriate.

#### IMP-RSC-002 — Population/repetition encoding

**Status: Provisionally Resolved**  
**Confidence: Medium–High**  
**Assumption:** repeated Aggregate Entities can be enriched without conflating heterogeneous aggregates with homogeneous populations.  
**Review trigger:** the initial-five migration pilot finds repeated structures that cannot be represented without additional repetition dimensions.

Use an optional `population` block for repeated Aggregate Entities. Initial conceptual shape:

```yaml
population:
  count:
    value: 32
    form: scalar
    basis: documented_fixed
  expansion_mode: representative_member
  individually_addressable: false
```

`representation: aggregate` does not imply a repeated homogeneous population. Count Basis, Expansion Mode, and member addressability remain distinct. Use existing entity type/child structure for common member structure where sufficient rather than duplicating a full template inside every `population` block.

#### IMP-RSC-003 — Deterministic generated member IDs

**Status: Resolved**  
**Confidence: High**

For generated Addressable Members use:

`<aggregate-id>--member-<member-key>`

For index-generated homogeneous populations, `member-key` is a stable decimal index beginning at 1 without display-dependent zero padding. Example: `gpu-bank--member-1`.

These IDs identify modeled configuration-local instances only. Representative Member Contexts do not receive generated entity IDs and continue to use typed runtime Context Locators.

#### IMP-RSC-004 — Entity-type capability registry

**Status: Resolved**  
**Confidence: High**

Implement a **language-neutral capability registry** keyed by `entity_type`. Use reusable capability profiles/traits so many entity types can share behavior. Profiles may define applicable Detail sections, Scenario-state categories, Property expectations, structural/render roles, relationship capabilities, and semantic actions.

Enterability itself remains a resolved object/context capability under SDC-025 rather than a static type boolean. Keep browser visual style mappings separate from semantic capability metadata. Never use Organizational inventory categories as behavior switches.

### 5.6 Scenario implementation

#### IMP-SCN-001 — Modular Scenario catalogs

**Status: Resolved**  
**Confidence: High**

Store expanded named Scenarios in **one modular companion YAML catalog per Reference Configuration**, using the logical path:

`scenarios/<configuration-id>.yaml`

Each catalog remains owned by exactly one configuration. The Reference Configuration points to/identifies its catalog/default Scenario through the coordinated schema. Scenario IDs remain configuration-local.

#### IMP-SCN-002 — Scenario validation

**Status: Resolved**  
**Confidence: High**

Extend the Python cross-file validator with the SCN-029 checks: unique Scenario IDs, exactly one default, target resolution, type/capability compatibility, stable-structure immutability, active-path integrity, evidence/source integrity, and Property/Metric validation.

Do not build a general causal simulator. Authored Scenario outcomes remain authoritative in V1.

#### IMP-SCN-003 — Initial Scenario catalogs

**Status: Resolved as implementation/content process**  
**Confidence: High**

Author Scenario catalogs during Reference-System readiness work. Follow RDY-011/012: every exposed configuration needs its default plus at least one meaningful non-default Scenario. Scenario choice remains architecture-specific rather than a universal checklist.

### 5.7 Concept implementation

The canonical Concept authoring format is now established in Source-of-Truth CON-I01 and is not repeated normatively here.

#### IMP-CON-001 — Canonical occurrence-link migration

**Status: Resolved; migration execution remains**  
**Confidence: High**

Migrate legacy Reference-System Concept links to the established canonical occurrence form:

```yaml
concept_links:
  - concept_id: rdma
    role: uses
    target:
      type: entity
      id: backend-nic
```

Supported target types remain **entity**, **connection**, and **configuration**; supported roles remain those established by the Concept model. Legacy compatibility may remain during development, but Ship-Ready initial configurations must use canonical links.

#### IMP-CON-002 — Client-side Concept search/indexing

**Status: Resolved**  
**Confidence: High**

Use **Fuse.js** for client-side Concept search. Weight canonical name and aliases highest, then summary/tags, with long explanatory content lower. Generate lightweight Concept and reverse-occurrence indexes during the content build.

A dedicated graphical Concept graph is outside V1 under CON-I03; show prerequisites/related/contrast/specialization as navigable relationship lists/links.

Use in-memory search caching only. Resolve contextual occurrences/examples lazily from the generated reverse-occurrence index.

#### IMP-CON-003 — Markdown rendering

**Status: Resolved**  
**Confidence: High**

Use **react-markdown** with **remark-gfm** for Concept Markdown in the browser client. Keep raw HTML disabled by default. Canonical authoring remains Markdown rather than pre-rendered HTML.

### 5.8 Property and measurement implementation

#### IMP-PROP-001 — Structured Property Value shape

**Status: Provisionally Resolved**  
**Confidence: Medium–High**  
**Assumption:** the established Property semantics map cleanly to a property-ID-keyed YAML structure without duplicating registry metadata.  
**Review trigger:** initial-five migration examples expose a required semantic dimension that cannot be represented without awkward special cases.

Use `properties` as a mapping keyed by stable **Property Definition ID**. Comparison-capable values use structured records, conceptually:

```yaml
properties:
  memory_capacity:
    status: known
    value:
      form: scalar
      number: 192
      unit: GiB
      approximate: false
    basis: advertised
    scope: per_device
    evidence:
      status: documented
      source_ids:
        - source-id
```

Include `directional_basis` and `derivation` only where applicable. Non-`known` availability states omit ordinary numeric magnitude. Do not repeat a `kind` field when the Property Registry already defines it.

#### IMP-PROP-002 — Property Registry

**Status: Provisionally Resolved**  
**Confidence: Medium**  
**Assumption:** a minimal registry derived from actual initial-five content is preferable to designing a broad metric ontology up front.  
**Review trigger:** the initial-five + initial-Scenario property audit is complete.

Maintain one canonical global `property_registry.yaml`. Seed it only with comparison-capable properties actually required by the initial five systems and initial Scenario catalogs, then expand incrementally. Obvious initial definitions include `memory_capacity`, `link_rate`, `power`, and `component_count`; the final initial membership is determined by the content audit rather than by speculation.

#### IMP-PROP-003 — Numeric normalization

**Status: Resolved**  
**Confidence: High**

Canonical YAML stores source-faithful values. Build/runtime normalization may emit regenerable normalized mathematical values for comparison and derivation. Use **decimal.js** (or an explicitly equivalent arbitrary-precision decimal library only after a documented implementation revision) rather than relying on binary JavaScript `number` arithmetic for every exact unit conversion/derivation.

Conformance fixtures define the expected mathematical result independently of the JavaScript library.

#### IMP-PROP-004 — Display-unit preferences

**Status: Resolved by Source-of-Truth PROP-033**  
**Confidence: High**

Do not create a global user-unit preference subsystem in V1. Display source-faithful units and optional useful conversions under the established significant-figure rules. Because display conversion is separate from canonical Property Values, a future preference feature requires no authoring-schema redesign.

#### IMP-PROP-005 — Property validation/comparison implementation split

**Status: Resolved**  
**Confidence: High**

- JSON Schema: structural shape/enumerations;
- Python validator: unit/property applicability, scope/direction compatibility, derivation/evidence/count semantics;
- TypeScript pure functions: runtime formatting, normalization access, and user-requested comparisons; and
- shared JSON conformance fixtures: deterministic cross-language examples.

### 5.9 Persistence, deployment, and browser support

#### IMP-WEB-001 — V1 semantic persistence

**Status: Resolved**  
**Confidence: High**

Keep V1 semantic Navigation/Scenario/Concept state **in memory**. Do not add durable application-state restoration merely because browser storage is available. If a later small preference needs persistence, use the `PersistenceStore` boundary from Section 3.6.

No PWA/service-worker offline installation is required for V1.

#### IMP-WEB-002 — Deployment

**Status: Resolved**  
**Confidence: High**

Ship the core browser application as a **static build** with no required application server or database. Keep output host-neutral and **GitHub Pages compatible** so public repository evaluation is straightforward. Use a GitHub Actions Pages workflow if/when the repository is published that way.

Core packaged architecture content must not require a live remote database once the application assets are available.

#### IMP-WEB-003 — Browser support policy

**Status: Resolved**  
**Confidence: High**

Use the build tool's **Baseline Widely Available** production target rather than freezing an arbitrary long-lived legacy-browser matrix. At dependency-lock/release time, record the concrete browser versions implied by the chosen Vite release.

Test at least Chromium, Firefox, and WebKit families, with desktop/laptop as the primary dense-Explore target and representative touch/tablet coverage. Do not add legacy polyfill commitments without a demonstrated user requirement.

### 5.10 Testing and acceptance tooling

#### IMP-TEST-001 — Test stack

**Status: Resolved**  
**Confidence: High**

Use:

- existing/extended **Python** tests for canonical source/schema/cross-file/readiness validation;
- **Vitest** for TypeScript domain/state/view-model/unit tests;
- **Playwright** for end-to-end browser interaction across Chromium, Firefox, and WebKit; and
- language-neutral JSON conformance fixtures for behavior that a future C++/Qt client must reproduce.

Use curated visual-regression cases for representative scenes rather than blanket pixel snapshots of every system/state. Exercise keyboard and accessible names/actions in E2E tests in addition to visual behavior.

#### IMP-TEST-002 — Required conformance domains

**Status: Resolved**  
**Confidence: High**

Prioritize fixtures/tests for Select/Clear/Enter; parent/lateral/Cross-Connection movement; Representative Member traversal; Scenario changes; configuration switching; Explore↔Concepts transitions; Back/Forward/Return; stale-context degradation; aggregate identity; and Property unit/normalization/comparison behavior.

### 5.11 Current technology basis

Framework/library versions should be pinned when implementation begins and updated deliberately. The following official/primary references support the current selections; exact ecosystem state should be rechecked when a dependency is first locked or materially upgraded.

| Technology | Current role | Primary reference |
|---|---|---|
| TypeScript | Strict browser implementation language | <https://www.typescriptlang.org/tsconfig/strict.html> |
| React | Browser UI shell / Concepts / Detail | <https://react.dev/> |
| Vite | Build/dev tooling | <https://vite.dev/guide/> |
| Redux Toolkit | Application-state implementation | <https://redux-toolkit.js.org/> |
| SVG | Primary Explore drawing model | <https://developer.mozilla.org/en-US/docs/Web/SVG> |
| elkjs | Optional topology-heavy layout adapter | <https://github.com/kieler/elkjs> |
| Fuse.js | Client-side Concept search | <https://www.fusejs.io/> |
| react-markdown | Concept Markdown rendering | <https://github.com/remarkjs/react-markdown> |
| decimal.js | Decimal/unit arithmetic | <https://github.com/MikeMcl/decimal.js> |
| Vitest | TypeScript/unit tests | <https://vitest.dev/> |
| Playwright | Cross-browser E2E tests | <https://playwright.dev/> |
| GitHub Pages | Optional static public deployment | <https://docs.github.com/pages> |

### 5.12 Implementation decision register

| Area | Decision | Status | Confidence / review trigger |
|---|---|---|---|
| Browser language | TypeScript, strict | **Resolved** | High |
| UI framework | React 19.x | **Resolved** | High |
| Build system | Vite | **Resolved** | High |
| Application state | Redux Toolkit + React-Redux | **Resolved** | High |
| Explore rendering | SVG-first; dense Canvas/WebGL backplane only if measured need | **Provisionally Resolved** | Medium — initial-five render prototype |
| Physical layout | Deterministic project layouts | **Resolved** | High |
| Graph-heavy layout | elkjs adapter / Worker where useful | **Provisionally Resolved** | Medium–High — topology prototype/dependency review |
| Semantic visibility | Aggregation/relevance first; no universal numeric cutoff | **Resolved policy** | High |
| Numeric visibility/virtualization limits | Determine from measured prototype | **Still Open** | Medium — benchmark evidence |
| Runtime content | Versioned generated JSON chunks | **Resolved** | High |
| Canonical validation/compiler | Python toolchain | **Resolved** | High |
| RSC source-schema evolution | Coordinated additive target 1.3.0; 1.2.0 remains current until migrated | **Provisionally Resolved** | Medium–High — initial-five migration pilot |
| Population metadata | Optional `population` block | **Provisionally Resolved** | Medium–High — initial-five migration pilot |
| Generated member IDs | `<aggregate-id>--member-<member-key>` | **Resolved** | High |
| Entity capabilities | Language-neutral reusable capability registry | **Resolved** | High |
| Scenario storage | One YAML catalog per Reference Configuration | **Resolved** | High |
| Scenario validation | Configuration-aware Python cross-file validation | **Resolved** | High |
| Concept storage | Source-of-Truth YAML+Markdown hybrid | **Resolved** | High |
| Concept occurrence migration | Stable `concept_id` + role + explicit target | **Resolved** | High |
| Concept search | Fuse.js client-side | **Resolved** | High |
| Concept graph visualization | Not required in V1; relationship lists | **Resolved by Source of Truth** | High |
| Markdown rendering | react-markdown + remark-gfm; raw HTML disabled | **Resolved** | High |
| Property YAML | Structured values keyed by Property ID | **Provisionally Resolved** | Medium–High — migration examples |
| Property Registry | Minimal initial-five-driven global registry | **Provisionally Resolved** | Medium — property audit |
| Numeric math | decimal.js / equivalent only by explicit revision | **Resolved** | High |
| User unit preferences | No V1 global preference system | **Resolved by Source of Truth** | High |
| App Back/Forward | Global controls + browser-history adapter | **Resolved** | High |
| Explicit Return | Contextual destination-aware action | **Resolved** | High |
| Structural History UI | Session-linear; optional Recent Explore locations | **Resolved** | High |
| Local scroll/panel state | Best-effort in memory | **Resolved** | High |
| Durable semantic browser storage | Not required in V1 | **Resolved** | High |
| Deployment | Static-hosted, GitHub Pages compatible | **Resolved** | High |
| Browser support | Baseline Widely Available + three-engine tests | **Resolved** | High |
| Unit tests | Vitest + existing Python tests | **Resolved** | High |
| E2E | Playwright | **Resolved** | High |

### 5.13 Intentionally open implementation questions

Only performance-derived renderer parameters remain genuinely open.

#### OPEN-RENDER-001 — Dense-renderer fallback threshold

**Status: Still Open**  
**Preferred default:** remain SVG-first; introduce a Canvas/WebGL backplane only when representative scenes demonstrate a real bottleneck.

**Evidence required:** measure representative initial-five scenes with realistic labels, typed Cross-Connections, Hover/Focus Preview, Selection, Scenario emphasis, and keyboard/accessibility targets. Record frame/update latency, input latency, hit-testing cost, DOM/scene size, and memory behavior.

No product-owner input is currently required unless the measurements reveal a conflict between performance and an established interaction/accessibility rule.

#### OPEN-RENDER-002 — Visibility/virtualization numeric limits

**Status: Still Open**  
**Preferred default:** semantic aggregation first, then viewport/dynamic renderer budgeting where measured need exists; do not establish one global count threshold.

**Evidence required:** the same representative rendering prototype and interaction tests. Numeric limits should remain implementation configuration, not canonical Reference-System facts.

No other approved implementation-phase item currently requires a new product decision.

### Early rendering prototype acceptance gate

Before treating IMP-RENDER-001/002/004 as final, prototype representative scenes from the initial five Reference Systems with:

- aggregate and Representative Member rendering;
- typed Cross-Connections;
- hover/focus Preview;
- persistent Selection;
- explicit Enter/Follow actions;
- keyboard-focus targets;
- Scenario emphasis; and
- realistic information density and labels.

The prototype should exercise Chromium, Firefox, and WebKit. Exact numeric pass/fail budgets may be set when the prototype harness exists, but the test must verify that performance optimization does not change semantic Expansion Mode, identity, Selection, Navigation, or accessibility behavior.

## 6. Future native client target

### 6.1 Preferred language and framework

**Established preferred target:** if a genuinely native standalone client is pursued, use **C++20-or-later with Qt 6** unless future requirements or ecosystem changes justify an explicit revision.

This choice is intended to provide:

- high-performance compiled 2D graphics and graph-processing headroom;
- mature cross-platform desktop support;
- robust keyboard/input and application-window behavior;
- mature rich-text support for Concepts/Detail;
- conventional standalone desktop packaging; and
- a large, established ecosystem.

The exact Qt UI/rendering path is deliberately **not** frozen. Qt Widgets/Graphics View is a strong candidate for the Explore canvas; Qt Quick or another Qt 2D approach may be preferable when native implementation actually begins.

### 6.2 Current external basis for the Qt choice

As of 2026-08-26, official Qt 6.11 documentation provides the relevant evidence:

- Qt lists supported desktop configurations for **Windows, macOS, and Linux**: <https://doc.qt.io/qt-6/supported-platforms.html>
- Qt Widgets includes the **Graphics View Framework** for managing and interacting with large numbers of custom 2D items, including zooming: <https://doc.qt.io/qt-6/qtwidgets-index.html> and <https://doc.qt.io/qt-6.11/graphicsview.html>
- `QTextDocument` supports CommonMark and a useful subset of GitHub-flavored Markdown, including tables: <https://doc.qt.io/qt-6/qtextdocument.html>

These links justify Qt 6 as the current preferred future target; exact supported operating-system versions, Qt release, deployment tooling, and licensing should be rechecked when native-client work actually starts.

## 7. Native-client migration model

A native client should be treated as a **new presentation/frontend implementation over the established semantic contracts**, not as a promise that browser UI code will transfer directly.

### 7.1 Expected reuse

| Asset / layer | Expected reuse in a C++/Qt native client |
|---|---|
| Canonical YAML/Markdown content | **Near-total** |
| JSON Schemas and identifier conventions | **Near-total** |
| Organizational taxonomy and controlled vocabularies | **Near-total** |
| Reference-System, Scenario, Concept, aggregation, property semantics | **Near-total conceptual/contract reuse** |
| State-transition specifications and conformance fixtures | **Near-total** |
| Readiness/validation test cases | **High**, though test harness code may change |
| Generated normalized content format | **High** if kept language-neutral |
| Browser-independent algorithms implemented in a portable form | **Case by case** |
| Browser application/state source code | **Limited direct source reuse** if written in TypeScript/JavaScript rather than C++ |
| Browser Explore renderer | **Rewritten** |
| DOM/CSS Detail and Concepts presentation | **Rewritten** |
| Browser platform adapters | **Replaced by Qt/native adapters** |

Direct executable-code reuse is **not** the success metric. If Version 1 is implemented in a browser-native language such as TypeScript and the future client is C++, direct source reuse may be modest—potentially well below one-third of the browser application—while the high-value content, schemas, semantics, fixtures, and expected behavior remain reusable.

### 7.2 Realistic difficulty

| Future path | Difficulty | Interpretation |
|---|---|---|
| Package the web application in a desktop wrapper | Low | High source reuse, but **not** the project's intended native-client direction. |
| Build a desktop-enhanced web client with native services | Low–moderate | Still principally the browser UI; also not the intended final native architecture. |
| Build a genuine C++/Qt native client | **High but manageable** | New frontend/rendering implementation; semantic/data contracts and conformance assets substantially reduce product-design and content migration risk. |

The native rewrite should be planned as a real implementation project, not a trivial port. Clean Version-1 boundaries reduce uncertainty and duplicated design work, but cannot eliminate the cost of replacing the presentation technology and language.

### 7.3 Suggested future migration sequence

If native work begins later:

1. freeze a tested language-neutral runtime/content contract revision;
2. port or reimplement the domain objects and state-transition engine in C++ using the same conformance fixtures;
3. implement Qt content adapters and validation/loading paths;
4. implement the native Detail and Concepts surfaces;
5. implement the native 2D Explore renderer against the same semantic actions/state;
6. add native persistence/file/platform adapters; and
7. run the same project-level readiness, navigation, cross-view, and content conformance suites against the native client.

## 8. Browser-specific coupling to avoid

Avoid these patterns because they make both Version 1 harder to test and a later native rewrite harder to reproduce:

- storing DOM elements instead of semantic IDs in state;
- making CSS or screen coordinates the source of Containment/layout truth;
- treating browser Back/Forward as the actual Application Navigation History engine;
- scattering `window`, `document`, `localStorage`, IndexedDB, or browser File APIs through core modules;
- treating HTTP URLs as Concept/entity identity;
- making `fetch()` the domain-level content-loading contract;
- exposing third-party renderer/graph-library objects as domain entities;
- placing required Inspect/Select/Enter semantics only inside hover or other browser-specific gestures;
- serializing framework component state as the durable application state format; or
- requiring a remote service/database for core static architecture exploration when the same validated content can be bundled locally.

## 9. Cross-language conformance strategy

The strongest future-native preparation is a reusable behavioral test corpus rather than premature shared executable code.

Representative test-vector form:

```text
Given:
  configuration = dgx-h100-default
  location = server-3
  selection = gpu-2
  scenario = baseline

Action:
  Enter(gpu-2)

Expect:
  structural_location = gpu-2
  selection = none
  scenario = baseline
  structural_history += gpu-2
```

The same vectors can exercise the Version-1 implementation and a later C++ implementation.

Prioritize conformance fixtures for:

- Select / Clear Selection / Enter;
- Representative Member traversal;
- parent/lateral/Cross-Connection navigation;
- Scenario changes;
- configuration switching;
- Explore ↔ Concepts contextual transitions;
- Back / Forward / Return;
- stale-context degradation; and
- property/unit normalization and comparison rules where deterministic.

## 10. Version-1 complexity impact

Preserving a credible native migration path should add only **modest architectural discipline**, not a separate product feature.

Version 1 should incur the cost of:

- clean module boundaries;
- pure/testable state transitions where practical;
- platform service adapters at actual external boundaries;
- language-neutral content/state contracts; and
- explicit conformance fixtures.

Version 1 should **not** incur the cost of:

- C++/Qt code before a native client exists;
- WebAssembly solely for future source reuse;
- desktop packaging/update infrastructure;
- a universal renderer plugin framework;
- speculative native filesystem/windowing features; or
- duplicated web/native UI implementations.

These boundaries improve browser maintainability and testing even if a native client is never built, so the portability cost is expected to remain small relative to the core Version-1 implementation.

## 11. Implementation handoff checklist

Before the browser implementation architecture is considered stable, verify:

- [ ] TypeScript strict mode, React, Redux Toolkit, and Vite are integrated without leaking framework types into semantic contracts;
- [ ] domain/state modules can run unit tests without a DOM/browser runtime;
- [ ] stable IDs and Context Locators, not rendered objects, drive semantic state;
- [ ] current renderer coordinates are derived/presentation data;
- [ ] the initial-five SVG/layout prototype has been run and the two OPEN-RENDER items have evidence-backed outcomes;
- [ ] semantic aggregation precedes any renderer virtualization/fallback;
- [ ] browser history is not the authoritative project history model;
- [ ] browser persistence/file APIs are isolated behind explicit adapters where used;
- [ ] V1 semantic state remains in-memory unless a separately justified preference uses the persistence adapter;
- [ ] content parsing/normalization is distinct from content transport;
- [ ] canonical validation/runtime JSON generation is deterministic and Python-driven;
- [ ] runtime artifacts record their format/source revisions and remain regenerable;
- [ ] the coordinated RSC schema migration has been piloted on the initial five before 1.3.0 is finalized;
- [ ] population metadata, canonical Concept links, Scenario catalogs, and structured Properties validate in the Ship-Ready profile;
- [ ] cross-file validation semantics are explicit and test-covered;
- [ ] Explore renderer emits semantic actions rather than directly rewriting domain state;
- [ ] Detail and Concepts consume semantic/view-model data rather than renderer internals;
- [ ] no essential interaction depends solely on hover or DOM-specific behavior;
- [ ] generated/runtime content remains language-neutral enough for future C++ consumption;
- [ ] Vitest, Playwright, Python validation tests, and language-neutral state-transition fixtures cover the major Navigation/Cross-View rules;
- [ ] static deployment works without a required application server/database; and
- [ ] no Version-1 dependency has been added solely to mimic a future native stack.

## 12. Summary

> **Implement Version 1 as a browser-first layered 2D application using the current TypeScript/React/Redux/Vite browser stack, generated language-neutral runtime content, Python source validation, and an SVG-first Explore renderer whose performance fallback remains prototype-gated. Preserve portability through stable semantic contracts, pure state transitions, explicit data/schema migrations, conformance fixtures, and narrow platform adapters—not through premature native code. If a native client is later built, target C++20-or-later with Qt 6 and treat it as a new standalone frontend over the established project semantics rather than as a packaged web application.**
