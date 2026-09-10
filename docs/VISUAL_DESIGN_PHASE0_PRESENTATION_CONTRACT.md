# Visual Design Phase 0 — Presentation Contract and Pilot Fixtures

**Status:** Completed Phase 0 implementation handoff  
**Date:** 2026-09-10  
**Authority:** Implementation-facing visual-design note. This file does **not** replace `Systems_for_Modern_AI_Project_Source_of_Truth.md` or change canonical Reference-System semantics.  
**Fixture:** `tests/fixtures/visual-design-phase0.json`

## 1. Purpose

This note locks the presentation inputs required to begin the approved enclosure-first Explore visual pilot. Phase 0 deliberately does not refactor the React/SVG renderer, change layout geometry, alter state-engine behavior, add component imagery, or modify canonical Reference-System content/schema.

Implementation should treat the canonical model as authoritative and derive the presentation described here from existing runtime fields. If a later visual implementation requires new semantic truth rather than derived presentation state, stop and route that question to Planning.

## 2. Locked visual-channel ownership

Each meaning owns a primary visual channel so interaction, semantic, evidence, and Scenario cues do not compete.

| Visual channel | Primary meaning | Phase 0 constraint |
|---|---|---|
| Enclosure/frame geometry | Current Structural Location and modeled containment | Presentation-only geometry; never creates containment |
| Component shell + header | Structural object boundary/class | Must remain legible without future imagery |
| Narrow role rail + icon/pattern + label | Functional visual role | Derived from `entity_type`; color is secondary and never sufficient alone |
| Optional media region | Future component picture/visual representation | Reserved spatially only; no asset field, format, provenance model, or loader is introduced in Phase 0 |
| Base edge stroke + endpoint/center marker | Canonical Cross-Connection relationship family | The base family syntax must survive Selection, focus, Scenario, and aggregation overlays |
| Arrow/flow marker | Authored connection `directionality` | Never inferred from relationship family, entity name, or visual position |
| Boundary port/stub | Relationship crosses the current Structural Location | Does not create a new entity, endpoint, or containment relation |
| High-contrast outer ring | Persistent Current Selection | Never reused for Scenario or aggregation |
| Focus brackets/local halo | Inspect/keyboard focus | Transient; keyboard focus remains visible on selected items |
| Descendant marker/notch | Visible ancestor contains a deeper Selection | Must not resemble direct Selection |
| Scenario underlay/halo + `Scenario` marker | Active Scenario effect | Structural identity and base role/relation syntax remain fixed |
| Stack/repetition silhouette + count | Aggregate/repeated population | Never materializes fake member identity |
| `Representative` enclosure ribbon/header | Representative Member Context | Never assigns ordinal or canonical member identity |
| Subdued interior anatomy region/tile | Noninteractive Anatomy Depiction | Never gains Selection, focus, navigation, Concept, Scenario-target, or Cross-Connection semantics |
| Evidence badge / placement notice | Anatomy evidence and placement basis | Does not reuse relationship/state dash syntax |

## 3. Frozen pilot contexts and Scenarios

The exact machine-readable locators and Scenario IDs are in `tests/fixtures/visual-design-phase0.json`. They are verified against the generated runtime.

### 3.1 NVIDIA DGX H100 — representative compute node

- System: `nvidia-dgx-h100-superpod`
- Configuration: `h100-superpod-4su-reference`
- Structural Location: Representative Member Context for aggregate `dgx-h100-node`
- Representative path: `dgx-h100-node`
- Baseline validation Scenario: `baseline-normal-operation`
- Primary visual Scenario: `checkpoint-storage-pressure`
- Learning focus: node-local GPU/NVSwitch scale-up versus compute/storage paths that cross the node boundary.

### 3.2 NVIDIA DGX GB300 NVL72 — rack

- System: `nvidia-dgx-gb300-nvl72-superpod`
- Configuration: `gb300-nvl72-superpod-reference`
- Structural Location entity: `gb300-nvl72-rack`
- Baseline validation Scenario: `baseline-normal-operation`
- Primary visual Scenario: `east-west-compute-plane-degradation`
- Learning focus: compute-tray and NVLink-switch-tray populations contained by the rack versus scale-out relationships crossing the rack boundary.

`north-south-storage-pressure` and `rack-cooling-degradation` remain valid later Scenario cases, but they are not required for the Phase-0-frozen primary pilot scene.

### 3.3 Meta 24K H100 RoCE — root system

- System: `meta-h100-roce-24k`
- Configuration: `meta-24576-h100-roce`
- Structural Location entity: `meta-h100-roce`
- Baseline validation Scenario: `baseline-normal-operation`
- Primary visual Scenario: `checkpoint-storage-burst`
- Secondary state test: `roce-congestion`
- Learning focus: compute → RoCE → storage readability while keeping physical connectivity, data-path semantics, and Scenario emphasis distinct.

## 4. Presentation-role mapping

### 4.1 Contract

The visual role is **derived presentation data**, not a new canonical taxonomy. `entity_type` is the input. Inventory category/item must not become a rendering behavior switch. Unknown future `entity_type` values must fall back to `neutral_support` rather than being guessed from names or inventory metadata.

Allowed Phase 0 roles:

- `compute`
- `memory`
- `network`
- `storage`
- `power`
- `cooling`
- `management`
- `io_interconnect`
- `structure`
- `neutral_support`

The fixture contains a total mapping for all entity types in the current generated capability registry plus a synthetic unknown-type fallback case. Implementation may later encode this map in a renderer/view-model helper, but Phase 0 keeps it outside production code.

### 4.2 Current mapping

| `entity_type` | Visual role |
|---|---|
| `accelerator_die` | compute |
| `ai_accelerator` | compute |
| `apu` | compute |
| `collective_engine` | io_interconnect |
| `compute_assembly` | compute |
| `compute_cluster` | compute |
| `compute_core` | compute |
| `compute_group` | compute |
| `compute_node` | compute |
| `compute_tray` | compute |
| `cooling_system` | cooling |
| `cpu` | compute |
| `cpu_die` | compute |
| `dma_engine` | io_interconnect |
| `dpu` | io_interconnect |
| `fabric_appliance` | network |
| `gpu` | compute |
| `hbm` | memory |
| `hpc_ai_system` | compute |
| `inference_system` | compute |
| `local_storage` | storage |
| `management_node` | management |
| `memory_appliance` | memory |
| `network_fabric` | network |
| `network_switch` | network |
| `nic` | io_interconnect |
| `on_chip_memory` | memory |
| `optical_network` | network |
| `pod_group` | structure |
| `power_system` | power |
| `preprocess_server` | compute |
| `rack` | structure |
| `rack_group` | structure |
| `rack_scale_system` | structure |
| `rack_topology_domain` | structure |
| `scale_up_switch` | network |
| `smartnic` | io_interconnect |
| `sparse_core` | compute |
| `storage_group` | storage |
| `storage_server` | storage |
| `storage_system` | storage |
| `switch_asic` | network |
| `switch_tray` | network |
| `system_memory` | memory |
| `tensor_core` | compute |
| `topology_group` | network |
| `tpu` | compute |

This mapping is intentionally coarse. It is a visual teaching aid, not a claim that a component has only one architectural function.

### 4.3 Anatomy role mapping

Anatomy Depictions already author `depictionKind`. The later renderer may map those values to the same visual-role family without creating Entity semantics:

| `depictionKind` | Visual role |
|---|---|
| `compute` | compute |
| `memory` | memory |
| `network` | network |
| `storage` | storage |
| `power` | power |
| `cooling` | cooling |
| `management` | management |
| `io` | io_interconnect |
| `structural` | structure |
| `support` | neutral_support |
| `other` | neutral_support |

## 5. Deterministic fixture coverage

`tests/fixtures/visual-design-phase0.json` contains synthetic presentation-input fixtures for cases not currently represented in production content. Synthetic fixtures are explicitly marked and must not be compiled into runtime system data.

### 5.1 Anatomy cases

The fixture covers:

- documented evidence + schematic placement;
- simplified evidence + schematic placement;
- documented evidence + **synthetic documented placement**.

All 169 Anatomy Depictions in the initial five currently use schematic placement, so documented placement is intentionally exercised only by a synthetic test case.

### 5.2 Cross-Connection cases

All seven canonical relationship families are covered:

- `physical_connectivity`
- `data_communication_path`
- `dependency_service`
- `affinity_locality`
- `shared_resource_membership`
- `redundancy_protection`
- `control_management`

The current generated runtime uses the first three plus `control_management`. The fixture explicitly marks `affinity_locality`, `shared_resource_membership`, and `redundancy_protection` as synthetic because they are not currently present in generated production runtime data.

The fixtures collectively cover the authored directionality enum: `undirected`, `source_to_target`, and `bidirectional`.

### 5.3 Expansion Modes

The 1.4.0 Reference-System schema and TypeScript domain contract support:

- `aggregate_only`
- `representative_member`
- `addressable_members`

Current generated production content uses only the first two. The `addressable_members` fixture is therefore contract-only and explicitly synthetic. No production member identity is invented to exercise it.

## 6. Source-schema decision

**Confirmed: no source-schema change is required for the approved pilot.**

The needed presentation inputs already exist:

- Structural Location and canonical parent/child relationships;
- `entityType`;
- `relationshipType`, endpoints, and authored `directionality`;
- population count, Count Basis, Expansion Mode, and addressability;
- Anatomy Depiction label, `depictionKind`, evidence, placement basis, and optional count;
- Scenario descriptions/effects;
- Selection and Preview state;
- generated capability metadata.

Enclosure geometry, layout regions, port locations, routing anchors, role tokens, icon choices, state overlays, and the reserved future-media rectangle are all derived/discardable presentation state. They therefore do not belong in canonical RSC YAML or `src/domain/types.ts` merely to support the pilot.

Likewise, future component imagery is only spatially accommodated in the approved visual language. Phase 0 introduces no `image`, `asset_url`, media provenance, or fidelity field. That remains a later Planning decision when representative assets exist.

## 7. Verification contract

`tests/unit/visual-design-phase0-fixtures.test.ts` verifies that:

1. all three pilot locators resolve against the generated runtime;
2. every frozen Scenario exists in the corresponding configuration;
3. the fixture covers all seven canonical relationship families and all three directionality values;
4. the fixture covers all three schema-supported Expansion Modes, with `addressable_members` explicitly synthetic;
5. anatomy fixtures cover documented/simplified evidence and both placement-basis values, with documented placement explicitly synthetic;
6. the visual-role map covers every `entity_type` in the generated capability registry and declares `neutral_support` as the fallback;
7. the Phase 0 fixture explicitly locks the work to presentation-only changes with no source-schema mutation.

These checks are guardrails for later visual implementation. They do not make the fixture canonical product data.

## 8. Phase 0 completion and next boundary

Phase 0 is complete when the fixture test passes together with the repository's unchanged content/schema validation and baseline software checks.

**Do not begin Phase 1 from this note automatically.** Phase 1 is the renderer-component refactor described in the separate visual design and implementation plan and begins only when requested.
