---
title: "Systems for Modern AI — Physical Anatomy and Product Catalog Implementation Handoff"
project: "Systems for Modern AI Project"
status: "Completed implementation handoff — historical record"
last_updated: "2026-09-07"
source_of_truth_version: "0.8"
implementation_plan_version: "0.3"
---

# Systems for Modern AI — Physical Anatomy and Product Catalog Implementation Handoff

**Last updated:** 2026-09-07  
**Status:** Completed implementation handoff — historical record  
**Authority:** Product/behavior semantics are owned by `Systems_for_Modern_AI_Project_Source_of_Truth.md`. Technical defaults and migration contracts are owned by `Delivery_Rendering_and_Platform_Implementation_Plan.md`. `CONTENT_ADDITION_MANIFEST.md` preserves the historical reconciliation and records the completed current content state. This file records the implementation work package that produced the current Product/Anatomy repository state; it is retained for traceability and does not override those sources or define a current work queue.

## 1. Concise change summary

Planning has now formalized the project's original physical-first purpose into an explicit **Physical Orientation Baseline** rather than relying only on system-specific Primary Learning Claims. Every user-enterable structural context must provide enough source-supported anatomy to form a credible physical mental model, without imposing a universal BOM or minimum object count.

The plan now distinguishes four independent questions: **existence/evidence**, **semantic representation**, **visual fidelity/placement basis**, and **interaction capability**. A known physical component may therefore need visible presence even when its exact product/model, count, specifications, or useful interaction are unavailable.

To support that case without inflating entity identity, Planning established **Anatomy Depictions**: configuration-local, evidence-bearing, visible but noninteractive leaf records owned by an enclosing semantic Entity. They are not Entities, aggregates, connection endpoints, Concept occurrences, Scenario targets, Selection targets, or navigation destinations. Their placement may be schematic unless specifically sourced, and their meaning must be conveyed accessibly through the enclosing interactive context.

Planning also established the lightweight reusable-product organization:

- physical realizations/Containment/relationships/Scenario state remain configuration-local in RSCs;
- reusable real product/model facts move into a directory-backed **Product Catalog** under `content/products/`;
- RSC entities may reference exact Product Definition revisions through `product_ref`;
- existing inline `product_identity` remains an uncataloged/migration fallback;
- Concepts remain educational explanations rather than product/BOM records; and
- automatic reusable child-subtree instantiation remains deferred until actual structural duplication justifies the existing Reusable Architecture Definition model.

`docs/Organizational_Content_Inventory.md` required **no Planning edit** in this pass. It already includes the relevant server hardware, memory, networking, power, cooling, management, packaging, and other physical taxonomy needed for the planned additions. It remains a classification system rather than a BOM or behavior registry.

## Current completion note

The executable work described below has been applied to the current repository. The active RSC schema is 1.4.0 for migrated sources; Product Catalog, exact `product_ref`, Anatomy Depictions, `system_memory`/`power_system`, canonical Concept-validator inventory-path handling, runtime generation, physical-orientation auditing, and the device-interior follow-up are present. Current Python validation reports 16 systems / 18 configurations, 15 Concepts, 45 Property Definitions, 54 deterministic runtime artifacts, 75 audited branches, and 65 entered contexts with zero physical-orientation errors.

The original task descriptions and baseline observations below are retained as historical implementation rationale. Do **not** interpret their imperative wording, 1.2/1.3 counts, stale-runtime observations, or unchecked boxes as current repository status. Current status is governed by the canonical sources, `docs/IMPLEMENTATION.md`, `docs/CONTENT_ADDITION_MANIFEST.md` completion sections, and `docs/RELEASE_REPORT.md`.

## 2. Historical pre-implementation baseline and reconciliation findings

The executable baseline for this handoff is the supplied `systems-for-modern-ai.zip`. There is no assumed newer repository containing the additions historically reported in the earlier content manifest.

Direct inspection found:

- `content/RSCs/reference_system.schema.json` is **1.3.0**;
- the five initial configurations are authored on **1.3.0**;
- eleven later-candidate system files remain **1.2.0** using `reference_system.schema.v1.2.0.json`;
- `content/RSCs/README.md` still says 1.2.0 is current and is stale relative to the repository;
- the baseline Concept library contains **15 Concepts**;
- many additions in the historical manifest are absent or partial even though their historical status says “Implemented”; and
- the pre-implementation reconciliation for every manifest ID is preserved in `CONTENT_ADDITION_MANIFEST.md`; current repository status is recorded in that manifest's implementation-completion sections.

### 2.1 Read-only validation observations from this Planning pass

Planning ran only read-only validation commands to ground the handoff. These results describe the supplied baseline **before** the physical-anatomy/Product-Catalog changes and must not be used as post-change acceptance evidence.

Observed:

- RSC validation: `systems=16`, `configurations=18`, schema versions `{'1.2.0': 11, '1.3.0': 5}`, **PASS**.
- Canonical Concept validation: `concepts=15`, `warnings=0`, `errors=0`, **PASS** when the canonical inventory path is supplied.
- Concept unit tests: **8 passed**.
- RSC/Concept integration scan: **27 expected legacy Concept-link migration warnings**, `errors=0`, **PASS**.
- V1 content validation: `systems=5`, `concepts=15`, `properties=36`, `errors=0`.
- `scripts/content/validate_all.py` did **not** complete successfully because `scripts/content/build_runtime.py --check` reported: **“generated runtime artifacts are stale or nondeterministic.”**
- Direct invocation of `content/concepts/validate_concepts.py` without `--inventory` fails because its default path resolves to `content/Organizational_Content_Inventory.md`; the canonical file is `docs/Organizational_Content_Inventory.md`.

No TypeScript unit/build/E2E claim was revalidated during this Planning-only pass.

## 3. Binding Planning decisions Implementation must consume

| Area | Governing decisions | Implementation consequence |
|---|---|---|
| Physical-first entered views | EXP-036–041, DEP-029–033, RDY-018 | Richer visible physical anatomy is a release obligation where supported/needed; no minimum object count. |
| Generic visible anatomy | EXP-037–041, DEP-030–032 | Add authored Anatomy Depictions; do not infer them from renderer templates or entity types. |
| Existing interaction model | SDC-001–038 | Anatomy Depictions remain noninteractive and must not weaken Inspect/Select/Enter semantics. |
| Aggregation | AGG-001–020 | Repeated real hardware stays aggregate/representative unless individual identity matters. Visual replicas/anatomy do not create identity. |
| Product reuse | REF-024–026, SHR-022–028 | Add Product Catalog + exact `product_ref`; local physical identity remains configuration-local. |
| Reusable structures | SHR-004–021 | Do **not** implement automatic reusable-subtree instantiation during this work unless concrete post-expansion duplication independently triggers a new review. |
| Evidence/fidelity | REF-013/014, DEP-011/030/032 | Reduce specificity rather than inventing SKU/count/topology/placement. Known existence may still warrant generic visible anatomy. |
| Schematic placement | EXP-040, DEP-031 | Layout may group schematically inside a supported boundary; coordinates/grouping must not imply sourced exact placement. |
| Readiness | RDY-001–018 | Initial five must pass the new entered-context Physical Orientation Completion Test after content migration. |
| Platform/rendering | PLT + implementation plan | Keep the existing browser-first 2D architecture; no renderer replacement is requested. Re-run dense-scene performance after anatomy expansion. |

## 4. Historical implementation work completed in dependency order

### IMP-ANAT-001 — Preserve baseline, enumerate versioned callers, and repair stale authoring metadata

**Affected paths**

- `content/RSCs/reference_system.schema.json`
- `content/RSCs/reference_system.schema.v1.2.0.json`
- `content/RSCs/reference_system.template.yaml`
- `content/RSCs/README.md`
- `content/RSCs/manifest.yaml`
- `scripts/content/`
- any schema-version dispatch in runtime/compiler/tests

**Governing decisions**

- REF-030/031/035
- IMP-RSC-001

**Manifest dependencies**

- Global prerequisite for all G/H100/GB300/TPU7/CER/META and later-candidate rows.

**Expected behavior / acceptance criteria**

1. Record a clean baseline before edits.
2. Enumerate every code/template/validator/report that assumes 1.2.0 or 1.3.0.
3. Repair `content/RSCs/README.md` so it describes the actual mixed 1.2/1.3 corpus and current active schema accurately.
4. Do not silently mass-rewrite later-candidate YAML.
5. Introduce the next Product/Anatomy schema version only after the caller inventory is complete; 1.4.0 is the preferred number if 1.3.0 remains the active baseline and no breaking condition appears.

**Why left for Implementation**

This changes executable schema/version dispatch and authoring tooling, not Planning semantics.

---

### IMP-ANAT-002 — Repair Concept-validator inventory-path behavior

**Affected paths**

- `content/concepts/validate_concepts.py`
- `content/concepts/README.md`
- `content/concepts/tests/test_validate_concepts.py`
- `scripts/content/validate_all.py`
- any other caller invoking the Concept validator

**Governing decisions**

- REF-031
- CON validation rules
- canonical inventory location: `docs/Organizational_Content_Inventory.md`

**Manifest dependencies**

- G-04 and all Concept-linked content additions/migrations.

**Expected behavior / acceptance criteria**

1. Inspect both explicit-path invocation and default-path behavior.
2. Repair the validator/callers so direct canonical invocation can locate `docs/Organizational_Content_Inventory.md` robustly from the repository layout.
3. Do **not** duplicate/copy the inventory into `content/` merely to satisfy the old fallback.
4. Existing explicit `--inventory` use remains supported.
5. Concept unit tests include the default-path case and pass.

**Why left for Implementation**

This is executable validator/caller behavior.

---

### IMP-ANAT-003 — Implement the Anatomy Depiction source/schema/compiler/runtime contract

**Affected paths**

- current/next RSC schemas
- `content/RSCs/reference_system.template.yaml`
- `scripts/content/build_runtime.py`
- `scripts/content/validate_runtime.py`
- `scripts/content/validate_v1.py`
- `scripts/content/readiness.py`
- `src/domain/types.ts`
- `src/runtime/repository.ts`
- `src/view-model/explore.ts`
- `src/view-model/layout.ts`
- `src/view-model/detail.ts`
- relevant unit/E2E fixtures

**Governing decisions**

- EXP-037–041
- DEP-030–033
- RDY-018
- IMP-PLT-011
- IMP-RSC-005

**Manifest dependencies**

- H100-11 and new H100-12/13
- GB300-11/12
- CER-07
- META-06
- future orientation-only later-candidate anatomy

**Expected behavior / acceptance criteria**

1. Add an authored Anatomy Depiction collection owned by a configuration-local Entity/context.
2. Depiction key is stable but in a separate non-entity namespace.
3. Validate inventory mapping, evidence/source references, enclosing context, depiction intent, placement basis, and optional supported count/basis.
4. Do not permit children, Product requirement, Concept occurrence, Cross-Connection endpoint, Scenario targeting, Selection, Enter, Follow, or Addressable-Member semantics.
5. Compiler emits a dedicated anatomy collection in runtime/presentation data.
6. Coverage/readiness tooling can account for anatomy without increasing entity/population counts.
7. SVG/layout renders the anatomy because it is authored—not because a template assumes “servers have fans/PSUs.”
8. Schematic vs documented placement is preserved in runtime data where relevant.
9. Accessibility exposes a concise anatomy summary through the enclosing interactive context; individual depictions are not fake focusable controls.
10. Existing entity behavior and SDC tests remain unchanged.

**Why left for Implementation**

Planning established the semantic contract; executable schema/runtime/rendering support is implementation work.

---

### IMP-ANAT-004 — Implement the Product Catalog and exact `product_ref` migration path

**Affected paths**

- new `content/products/README.md`
- new `content/products/product.schema.json`
- new `content/products/manifest.yaml` or equivalent generated index
- new `content/products/*.yaml`
- RSC schemas/template/README
- RSC validator and combined validator
- `scripts/content/build_runtime.py`
- `scripts/content/validate_runtime.py`
- `src/domain/types.ts`
- `src/runtime/repository.ts`
- `src/view-model/detail.ts`
- Product/Property conformance tests

**Governing decisions**

- REF-024–026
- SHR-022–028
- IMP-RSC-006–008

**Manifest dependencies**

- Product-bearing rows throughout the manifest; initial high-value seeds include repeated H100, ConnectX, NVIDIA switch, Grace/Blackwell, and other architecture-defining records where duplication is real and sources are adequate.

**Expected behavior / acceptance criteria**

1. One YAML file per global Product Definition under `content/products/`.
2. Stable lowercase kebab `product_id`; positive integer definition revision; family/model/variant semantics validated.
3. RSC `product_ref` pins exact `{id, revision}`.
4. Inline-only identity remains valid for uncataloged/legacy entities.
5. `product_ref` + equivalent inline identity is migration-compatible with warning; conflict is an error.
6. Missing identity remains valid for generic/heterogeneous/unsupported cases.
7. Product-intrinsic properties and RSC realization-local properties have separate ownership; conflicting duplicate intrinsic facts fail rather than silently override.
8. Homogeneous aggregate product references are allowed only when one product truthfully characterizes the represented members; heterogeneous aggregates remain unreferenced or use product identities on distinct children.
9. No automatic Product→child structure, Concept occurrence, Scenario state, connection, or navigation inheritance.
10. Runtime emits versioned product artifacts/index and resolved read-only product summaries without creating physical Product entities.
11. No generic Anatomy Depiction requires a fake Product record.

**Why left for Implementation**

Planning selected the organization/precedence semantics; this task creates new canonical schema/tooling/content files.

---

### IMP-ANAT-005 — Implement cross-cutting entity-type/property support needed by real interactive additions

**Affected paths**

- RSC schemas
- `content/capabilities/entity_type_capabilities.yaml`
- `property/property_registry.yaml`
- property schema/fixtures
- affected RSCs

**Governing decisions**

- REF-022/035
- REF-I01
- Section 7 Property rules
- IMP-RSC-004

**Manifest dependencies**

- **G-01** `system_memory`
- **G-02** `power_system`
- **G-03** Property Registry extensions

**Expected behavior / acceptance criteria**

1. Add `system_memory` only because host DRAM needs independent physical/data-path semantics in the affected systems.
2. Add `power_system` for architecture-relevant rack power-delivery assemblies/shelves, not every visible PSU.
3. Do not create entity types for orientation-only Anatomy Depictions.
4. Add only Property Definitions actually used by canonical migrated content.
5. Capability/Property validation and Detail behavior remain data-driven.

**Why left for Implementation**

Controlled vocabularies and registries are executable data contracts.

---

### IMP-ANAT-006 — Apply and verify H100 physical-orientation content

**Affected paths**

- `content/RSCs/nvidia_dgx_h100_superpod.yaml`
- `scenarios/h100-superpod-4su-reference.yaml`
- Product Catalog records as introduced
- Property Registry/capabilities as needed

**Governing decisions**

- DEP-029–033
- RDY-018
- aggregation/SDC/connection rules

**Manifest dependencies**

- H100-01 through H100-11
- new H100-12, H100-13, H100-14 in the reconciled manifest queue

**Expected behavior / acceptance criteria**

- compute HCAs separated from storage/in-band interfaces;
- OS NVMe and cache/data NVMe roles distinguishable;
- host/system DRAM visible;
- BMC/OOB path physically anchored;
- compute, storage, in-band, OOB, and storage data paths separated without invented port topology;
- storage remains an honest deployment-dependent boundary;
- power-supply assembly visibly present even if kept noninteractive;
- baseboard/cooling/internal-I/O additions included only after source verification at the supported level;
- checkpoint/storage-pressure Scenario added after target paths exist;
- representative/aggregate identity semantics remain valid; and
- entering the representative DGX node passes DEP-033 without requiring individual PSU/fan/DIMM materialization.

**Why left for Implementation**

Requires evidence verification, canonical RSC/Scenario edits, schemas/catalog/compiler outputs, and tests.

---

### IMP-ANAT-007 — Apply and verify GB300 physical-orientation content

**Affected paths**

- `content/RSCs/nvidia_dgx_gb300_nvl72_superpod.yaml`
- `scenarios/gb300-nvl72-superpod-reference.yaml`
- Product/Property/capability sources as needed

**Manifest dependencies**

- GB300-01 through GB300-10
- new GB300-11, GB300-12

**Expected behavior / acceptance criteria**

- representative compute tray shows GPU, Grace CPU, CX8 compute-network role, BlueField DPU/converged role, M.2 OS storage, and E1.S cache as supported;
- rack includes architecture-relevant power shelves as an interactive aggregate;
- East/West compute, North/South converged, OOB, and external-storage boundaries/paths are separated;
- cooling is physically contextualized without invented hose/manifold routing;
- optional board/support depiction remains schematic unless placement is sourced;
- new network Scenarios target the completed physical paths; and
- rack/tray entered contexts pass DEP-033.

**Why left for Implementation**

Canonical content and runtime/display work.

---

### IMP-ANAT-008 — Apply and verify TPU7x physical-orientation content

**Affected paths**

- `content/RSCs/google_tpu7x_ironwood.yaml`
- `scenarios/tpu7x-9216-chip-superpod.yaml`
- Product/Property/capability sources as needed

**Manifest dependencies**

- TPU7-01 through TPU7-06

**Expected behavior / acceptance criteria**

- TPU chiplet structure and VMEM/on-chip SRAM represented at Tier 5 as supported;
- host CPU-resource boundary + host memory visible without invented CPU product identity;
- PCIe host↔TPU path explicit;
- chiplet D2D remains aggregate topology metadata unless two real addressable endpoints exist;
- DCN no longer isolated; and
- memory-pressure Scenario validates against the fixed physical architecture.

**Why left for Implementation**

Requires canonical hierarchy/connection migration and evidence-aware layout/runtime work.

---

### IMP-ANAT-009 — Apply and verify Cerebras physical-orientation content

**Affected paths**

- `content/RSCs/cerebras_cs3_condor_galaxy3.yaml`
- `scenarios/condor-galaxy-3-64-cs3.yaml`
- Product/Property sources as needed

**Manifest dependencies**

- CER-01 through CER-06
- new CER-07

**Expected behavior / acceptance criteria**

- WSE-3 shows on-wafer 2D mesh/fabric plus core/SRAM relationships;
- MemoryX/SwarmX properties are added only to source-supported precision;
- management/control relationship is explicit;
- CER-04 remains evidence-gated rather than assumed;
- CS-3 enclosure support anatomy is shown only if source-supported, without importing generic conventional-server anatomy; and
- MemoryX/weight-stream Scenario validates.

**Why left for Implementation**

Requires vendor-evidence verification and canonical source changes.

---

### IMP-ANAT-010 — Apply and verify Meta physical-orientation content

**Affected paths**

- `content/RSCs/meta_h100_roce_24k.yaml`
- `scenarios/meta-24576-h100-roce.yaml`
- Product Catalog sources as needed

**Manifest dependencies**

- META-01 through META-05
- new META-06

**Expected behavior / acceptance criteria**

- switch-family child aggregates resolve the heterogeneous RoCE fabric without assigning one false product identity to the whole fabric;
- 400-Gb/s/topology-aware context remains within source bounds;
- Tectonic/Hammerspace remain explanatory service context, not physical software entities;
- checkpoint/storage burst Scenario added;
- Grand Teton stays a black box;
- current baseline evidence that Grand Teton integrates power/control/compute/fabric is used to add generic **noninteractive** support Anatomy Depictions, with no DGX-like chassis assumptions, H100-per-chassis count, or exact placement; and
- entering Grand Teton passes DEP-033 while retaining its evidence boundary.

**Why left for Implementation**

Requires anatomy runtime support plus canonical content migration.

---

### IMP-ANAT-011 — Apply later-candidate manifest work without changing release scope

**Affected paths**

- later-candidate files in `content/RSCs/`
- associated Product/Property/capability sources
- no new Version-1 Scenario-catalog requirement unless a later candidate is explicitly promoted

**Manifest dependencies**

- AMD-01–07
- TRN2-01–05
- TRN3-01–04
- TPU8T-01–05
- TPU8I-01–04
- GROQ-01–03
- ELCAP-01–04
- MAIA-01–04
- RUBIN-01–03
- OCI-01–09
- CW-01–05
- XAI-01–04

**Expected behavior / acceptance criteria**

1. Follow each row's reconciled **Planning disposition** rather than historical “Implemented” text.
2. Preserve deliberate closures: G-04, OCI-01, OCI-02, OCI-08, XAI-01.
3. Preserve/verify baseline-present rows; do not duplicate them.
4. Treat XAI-04 as superseded by the newer current mixed-fleet baseline wording.
5. Evidence-gated rows remain omitted/black-boxed until the cited/configuration-specific evidence passes review.
6. Apply Physical Orientation Baseline when a later-candidate branch is modified, but do not make later-candidate parity a Version-1 release blocker.
7. Do not auto-promote any candidate into the initial five.

**Why left for Implementation**

This is canonical content authoring/research validation beyond release-priority initial-five work.

---

### IMP-ANAT-012 — Update Explore layout, Detail, accessibility, and dense-scene performance for richer anatomy

**Affected paths**

- `src/view-model/explore.ts`
- `src/view-model/layout.ts`
- `src/view-model/detail.ts`
- `src/app/App.tsx`
- `src/styles/app.css`
- relevant tests/benchmark fixtures

**Governing decisions**

- EXP-036–041
- SDC-001–038
- IMP-RENDER-001–004

**Expected behavior / acceptance criteria**

- current `childIds`-driven interactive scene remains semantically correct but is enriched by authored anatomy depictions;
- layout visually groups compute/memory/I/O/support anatomy where useful without creating fake containment;
- schematic placement is visually/presentationally honest;
- anatomy depictions do not receive hover/focus/select/enter affordances;
- enclosing Detail lists/summarizes visible anatomy and evidence/uncertainty where material;
- keyboard/screen-reader users receive equivalent physical-orientation information;
- Location/Preview/Selection/Scenario states remain distinguishable;
- SVG-first remains the default unless measured evidence triggers the existing fallback; and
- rerun the representative initial-five dense-scene benchmark **after** the richer physical content is present before finalizing virtualization/dense-layer thresholds.

**Why left for Implementation**

UI/layout/accessibility/performance behavior requires executable code and empirical testing.

---

### IMP-ANAT-013 — Regenerate runtime artifacts and run the full validation/readiness/release gate

**Affected paths / commands**

- `scripts/content/build_runtime.py`
- `scripts/content/validate_runtime.py`
- `scripts/content/validate_all.py`
- `scripts/content/validate_v1.py`
- `scripts/content/readiness.py`
- `content/RSCs/validate_configs.py`
- `content/concepts/validate_concepts.py`
- Concept tests
- Property fixtures
- TypeScript/Vitest tests
- Vite build
- Playwright E2E
- readiness outputs
- runtime generated artifacts
- `IMPLEMENTATION_CHANGELOG.md`
- release report/manifest/package outputs

**Governing decisions**

- REF-031
- RDY-001–018
- implementation-plan Sections 5.4, 5.10, and 11

**Expected behavior / acceptance criteria**

Run/review at least:

1. RSC schema/inventory/hierarchy/source/connection/Product/anatomy validation across **all 16 systems / 18 configurations** and all supported source versions.
2. Concept canonical validation and Concept unit tests using the corrected inventory path.
3. RSC/Concept combined integration scan; no stale/broken canonical initial-five Concept references.
4. Property Registry/schema/conformance tests.
5. Product Catalog schema/reference/property/evidence tests.
6. Anatomy Depiction validation and duplicate-key/invalid-target tests.
7. Branch coverage audit: no disconnected material entity/fabric/storage/support branches unless intentionally bounded and documented.
8. Duplicate identity/reference audit: no duplicate product definitions, product-ref conflicts, duplicate entity IDs, duplicate depiction IDs within required scope, or stale manifest/runtime references.
9. Runtime regeneration followed by deterministic `build_runtime.py --check`; resolve the baseline stale-runtime failure rather than copying old generated artifacts.
10. Runtime-shape/type tests.
11. TypeScript/Vitest unit/state/view-model tests.
12. Vite production build.
13. Playwright pointer/keyboard/cross-view/Scenario tests in required engines.
14. New anatomy accessibility tests proving depictions are described but not fake focus targets.
15. Initial-five RDY audit including the new DEP-033/RDY-018 entered-context gate.
16. Dense-scene performance review using the richer initial-five scenes; resolve OPEN-RENDER items only from measured evidence.
17. Update implementation changelog/release report with actual changed-file list and validation results.
18. Produce a modified-files package/release artifact only after all applicable gates pass.

Historical reported passes do **not** waive any of these checks.

**Why left for Implementation**

These commands depend on the executable/content changes created by the preceding tasks.

## 5. Evidence-gated items and safe interim boundaries

The following items remain consequential research/verification gates, not product-design blockers:

| Item(s) | Question | Safe interim boundary if evidence remains insufficient |
|---|---|---|
| **CER-04** | Is the cited primary/corporate evidence adequate for the proposed SwarmX 400G/800G context? | Keep existing SwarmX role without the disputed numeric/link-family property. |
| **ELCAP-04** | Does the reviewed primary evidence support Rabbit near-node storage structure/population at the proposed depth? | Keep current parallel-filesystem boundary and add only the already-supported compute↔filesystem relationship when verified. |
| **RUBIN-02 / RUBIN-03** | Do STX/CMX and SPX support racks belong in this configuration's declared POD scope? | Preserve current NVL72-centered configuration and explicit scope/unknown note. |
| **OCI-09** | Is the specific GB200 power-delivery support claim sufficiently configuration-specific for a physical entity/property? | Leave power detail absent rather than generalizing from unrelated OCI service infrastructure. |
| **CW-02** | Does the selected CoreWeave source establish a concrete local NVMe/cache physical tier for this configuration? | Keep remote/accelerated storage boundary only. |
| **H100-12 / H100-13 / H100-14** | Which board, cooling, and internal I/O anatomy is specifically supportable for DGX H100? | Implement the confirmed P1 anatomy first; use no generic hardware imported from other DGX generations. |
| **GB300-11 / GB300-12** | Which cooling-distribution/board-support anatomy is supportable beyond the existing rack/tray boundaries? | Keep current rack cooling entity and tray boundary; add no invented manifold/board placement. |
| **CER-07** | Which CS-3 support anatomy is independently established? | Preserve CS-3/WSE/MemoryX/SwarmX boundaries; do not import conventional server anatomy. |

These questions do not require the user to stop routine implementation. Complete independent tasks first. Escalate only if evidence reveals two materially different, supportable user-facing architecture models or if a planning rule itself must change.

## 6. Deferred features that remain nonrequirements

The physical-anatomy clarification does **not** promote these into Version 1:

- reusable automatic architecture-subtree composition;
- exhaustive BOM or port/cable/connector materialization;
- serial-number/asset identity;
- multiple independent Anatomy Depiction interaction modes;
- 3D rendering;
- Functional Lenses;
- Scenario editing/stacking/simulation;
- durable cross-session restoration;
- graphical Concept graph;
- later-candidate release parity.

The Product Catalog is intentionally smaller than a reusable-architecture engine. Implementing it must not silently pull SHR-004–021 future composition into the current task.

## 7. Historical completion checklist and current result

The implementation work package is complete for canonical/content/runtime Python gates:

- [x] baseline/historical-manifest distinctions remain explicit;
- [x] Product Catalog and exact `product_ref` contracts are implemented/validated without shared physical identity;
- [x] Anatomy Depictions are implemented/validated/rendered/accessibly summarized without semantic entity behavior;
- [x] mixed source-schema compatibility remains explicit (current authored 1.4.0 and retained 1.2.0 sources; 1.3.0 compatibility schema preserved);
- [x] Concept-validator canonical inventory path is repaired without duplicating the inventory;
- [x] initial-five physical-orientation additions and device-interior follow-up are applied at supported evidence boundaries;
- [x] deliberate manifest closures/evidence limits remain explicit;
- [x] no later candidate is promoted into Version 1;
- [x] runtime artifacts are regenerated and deterministic;
- [x] branch/stale-reference/content audits in the Python validation path pass;
- [x] every initial-five user-enterable context passes DEP-033/RDY-018 mechanically (65 contexts / 0 errors); and
- [x] the implementation changelog records the applied Product/Anatomy work.

Remaining **release evidence**, not incomplete Product/Anatomy implementation: dependency-backed TypeScript/Vitest/Vite/Playwright execution in a normal installed environment, and reproducible Documentation Confidence evidence required by RDY-009.

## 8. Optional evidence inputs for greater device specificity

The current implementation is intentionally safe without these answers because each item has an explicit generic, representative, or black-box boundary. Provide the following only if future content should become more device-specific:

1. **GB300 cache population:** the retained source set contains conflicting cache-population descriptions. Confirm the intended NVL72 reference revision and whether Explore should display 4 E1.S devices per compute tray, 8 × 4 TB devices, or another exact population/capacity. Until confirmed, cache media/controller anatomy remains generic and the ambiguous exact count is not promoted into the depiction.
2. **Meta Arista 7800 identity:** confirm the exact 7800 generation/chassis used in the modeled 24,576-H100 cluster, and line-card population if known. Until then, the interior is labeled representative 7800-family anatomy rather than a specific chassis fact.
3. **Deployment-specific external storage:** provide the exact storage vendor/model/node/controller/drive configuration for the H100 certified-storage boundary or GB300 external-storage boundary if those interiors should become explorable. Otherwise they remain deliberate black boxes.
4. **Ironwood private physical details:** provide exact CPU-host SKU/socket layout, DCN switch models, OCS hardware model/port organization, or cooling component topology (for example CDU/manifold/cold-plate/pump boundaries) if available. Public evidence supports the roles and coarse boundaries but not those exact device identities.
5. **Cerebras support-appliance hardware:** provide exact preprocessing-server and management-server models/BOMs, plus MemoryX/SwarmX chassis/port/module details if available. Current content stays representative where public material establishes function and connectivity but not a complete BOM.
6. **H100 management-server SKU policy:** confirm whether the project should pin a specific server model for SuperPOD management nodes or continue using the documented hardware profile without asserting a fixed SKU.

None of these questions blocks the current physical-orientation acceptance test.
