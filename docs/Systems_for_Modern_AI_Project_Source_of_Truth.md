---
title: "Systems for Modern AI Project — Working Design Source of Truth"
project: "Systems for Modern AI Project"
status: "Living planning document"
last_updated: "2026-08-26"
version: "0.7"
---

# Systems for Modern AI Project — Working Design Source of Truth

**Last updated:** 2026-08-26  
**Status:** Living planning document  
**Purpose:** Central working context for project chats. This document records current design decisions, explicitly deferred or unresolved matters when they exist, rejected approaches, and dependencies. Later decisions supersede earlier ones when conflicts arise.

## Status labels

| Label | Meaning |
|---|---|
| **Established** | Accepted working decision. Future planning should assume it unless explicitly revised. |
| **Provisionally Resolved** | Current implementation/default decision with a specific evidence-based review trigger; treat it as the working choice until that trigger is evaluated. |
| **Tentative** | Preferred direction, but still subject to validation or implementation-driven revision. |
| **Unresolved** | Important question intentionally left open. |
| **Rejected** | Considered approach that should not be assumed in later planning. |
| **Deferred** | Intentionally postponed to a later project phase, especially the Features chat. |

## Related planning artifacts

| Artifact | Role | Status |
|---|---|---|
| `explore_tier_inventory_baseline.xlsx` | Item-by-item baseline mapping of the Organizational inventory into Explore tiers, Concepts, Scenario Context, System Context, and Future Guided Modes. | Current baseline |
| `ai_infra_layout_snapshot.mmd` | Editable Mermaid snapshot of the high-level tool layout. | Temporary snapshot |
| `ai_infra_layout_snapshot.svg` | Rendered version of the same high-level layout. | Temporary snapshot |
| `reference_systems_candidate_comparison.xlsx` | Learning-oriented comparison of researched Reference System candidates, ratings, sources, and initial/later/not-recommended classifications. | Current research baseline |
| `Delivery_Rendering_and_Platform_Implementation_Plan.md` | Implementation companion for the established browser-first layered-2D baseline and the current Version-1 technical decision register, including platform isolation, runtime/content tooling, schema migration defaults, testing, and possible future C++/Qt native-client migration. | Current implementation plan |

## Table of contents

1. [Explore](#1-explore)
2. [Navigation and Orientation State](#2-navigation-and-orientation-state)
3. [Reference Systems and Configurations](#3-reference-systems-and-configurations)
4. [Scenarios](#4-scenarios)
5. [Concepts](#5-concepts)
6. [Cross-View Integration](#6-cross-view-integration)
7. [Property and Measurement Conventions](#7-property-and-measurement-conventions)
8. [Delivery, Rendering, and Platform Baseline](#8-delivery-rendering-and-platform-baseline)
9. [Current Cross-Section Dependencies](#9-current-cross-section-dependencies)
10. [Project-Level Change Log](#10-project-level-change-log)

---

# 1. Explore

## 1.1 Purpose and scope

**Status: Established**

Explore is the tool's **primary physical/spatial exploration environment**. Its purpose is to help the user understand:

- how realistic AI infrastructure is physically organized;
- where components reside;
- how physical structures nest;
- how components connect, interact, and depend on one another;
- how architecture changes in representation as the user moves between scales; and
- how abstract concepts connect back to concrete physical infrastructure.

Explore should prioritize **stable navigation and physical scale** rather than functional organization as its primary hierarchy.

Functional systems such as networking, storage, power, cooling, management, and compute may span multiple physical levels. They should generally appear as **cross-cutting relationships or future functional lenses**, not competing containment hierarchies.

Explore is distinct from **Concepts**, which is the primary home for abstractions, protocols, algorithms, policies, mechanisms, software concepts, metrics, and other nonphysical explanatory material.

## 1.2 Core terminology

| Term | Status | Definition |
|---|---|---|
| **Reference System** | **Established** | The overarching named architectural reference being explored or compared as a whole. |
| **Reference Configuration** | **Established** | The specific setup/details used to instantiate a Reference System, including its physical hierarchy, components, topology, and cross-connections. |
| **Tier** | **Established** | A navigation/inspection scale. Tiers describe useful semantic levels of representation rather than mandatory physical nesting depths. |
| **Containment** | **Established** | The primary structural relationship answering: **“What larger physical or structural unit is this object part of?”** |
| **Canonical Home** | **Established** | The single primary containment location assigned to a physical Explore object within the current reference system. |
| **Home Tier** | **Established** | The tier at which an object receives its primary/full independent representation. |
| **Cross-Connection** | **Established** | A meaningful interaction, dependency, physical connection, affinity, membership, shared-resource relation, control relation, or similar relation that does not redefine containment. |
| **Inspect** | **Established** | Temporarily previewing an Explore target without changing persistent Selection, Structural Location, or navigation history. |
| **Selection** | **Established** | Making one Explore target the persistent Current Selection so that its Detail Context remains available without changing Structural Location. |
| **Entering / Drill-down** | **Established** | Deliberately making an object or lower-scale context the current structural navigation location. |
| **Aggregation** | **Established** | Representing multiple lower-level objects or links as a higher-level summary. |
| **Semantic Zoom** | **Established** | Changing what information is represented as scale changes, rather than merely enlarging the same drawing. |
| **Structural Location** | **Established** | The current canonical physical/structural context the user has entered. |
| **Explore Structural History** | **Established** | The sequence of meaningful physical Structural Location changes inside Explore, distinct from canonical Containment Path and from application-level Back/Forward history. |
| **Scenario Context** | **Established** | Workload or operating conditions that may change emphasis, state, traffic, failures, bottlenecks, etc. without normally changing containment. |

## 1.3 Explore tier structure

**Status: Established**

The five-tier structure below is the finalized Explore baseline. Tiers are **navigation bands**, not rigid graph depths.

| Tier | Purpose and boundary |
|---|---|
| **Tier 1 — System / Deployment** | Whole reference architecture and major physical/topological organization. |
| **Tier 2 — Group / Topology Domain** | Meaningful intermediate-scale collections such as campuses, data centers, regions/AZs, clusters, pods, rows, racks, or topology domains where appropriate. |
| **Tier 3 — Node / Assembly** | Coherent hardware assemblies such as servers, compute nodes, switches, storage appliances, chassis, trays, and similar units. |
| **Tier 4 — Device / Link** | Individual hardware elements and physical connections such as GPUs, CPUs, NICs, memory/storage devices, ports, cables, and local interconnects. |
| **Tier 5 — Internal Detail** | Physical or structurally meaningful internals needed to explain device behavior: packages, dies/chiplets, cores, caches, controllers, memory structures, datapaths, packaging, etc. Multiple meaningful containment steps may remain within Tier 5. |

### Tier-5 nesting rule

**Status: Established**

Tier 5 remains one **Internal Detail** navigation band rather than being divided into formal subtiers. Multiple physically meaningful containment steps may occur within Tier 5—for example `accelerator package → die/chiplet → core/cache/controller`—and the user remains at Tier 5 while moving through those nested internals. Canonical containment and breadcrumbs express the deeper structure.

**Rationale:** The project's tiers represent semantic navigation scale rather than fixed graph depth. Different accelerators, CPUs, DPUs, memory devices, and packages expose unequal internal depth, so fixed Tier 5a/5b subtiers would impose artificial uniformity and add implementation complexity without improving orientation. The existing same-tier nesting rule already handles this variation cleanly.

## 1.4 Explore rules

### Containment

#### EXP-001 — One canonical home
**Status: Established**

Every physical Explore object must have one canonical containment home within a given reference system.

**Rationale:** This guarantees unambiguous breadcrumbs, parent navigation, and structural orientation even when an object participates in many other systems or groupings.

#### EXP-002 — Containment represents structure
**Status: Established**

Containment describes genuine physical or structural composition/location, not conceptual relevance.

- Valid: `Server → GPU`
- Invalid: `GPU → Tensor Parallelism`

Conceptual or behavioral relationships belong primarily in **Concepts**.

#### EXP-003 — Tiers are not mandatory one-step depths
**Status: Established**

Containment may skip tiers, and multiple containment steps may occur within one tier.

Examples:

- `System → Server → GPU` is valid when no meaningful Tier-2 grouping is required.
- `Row → Rack → Rack Unit` may involve several physical nesting steps within approximately the same navigation band.

#### EXP-004 — Multiple memberships do not create multiple homes
**Status: Established**

An object may simultaneously belong to functional, scheduling, network, redundancy, or resource groups, but those relationships do not redefine its canonical containment parent.

Example: a server may be physically contained in **Rack A** while also belonging to **Network Rail 2** and **Compute Partition B**.

#### EXP-005 — Prefer the most physically meaningful parent
**Status: Established**

When multiple plausible parents exist, containment should generally prefer:

`physical enclosure/location → structural assembly → broader logical grouping`

Example: a GPU belongs under its server rather than directly under the cluster.

#### EXP-006 — Containment is configuration-specific
**Status: Established**

The same component type may have different containment structures in different reference configurations.

Example: a GPU may belong to a conventional server in one architecture and to a different tray/chassis structure in another.

#### EXP-007 — Scenarios normally do not change containment
**Status: Established**

Training, inference, failures, bottlenecks, workload changes, and similar scenarios may change state or emphasis while leaving the physical hierarchy unchanged.

If the physical architecture materially changes, that should generally be represented as a different reference system/configuration rather than merely a scenario.

### Cross-connections

#### EXP-008 — Cross-connections do not establish ownership
**Status: Established**

Cross-connections describe meaningful interaction without changing canonical containment.

Examples:

- GPU ↔ GPU;
- GPU ↔ NIC;
- NIC ↔ switch;
- server ↔ power delivery;
- component ↔ cooling resource;
- GPU ↔ preferred NIC through locality/affinity.

#### EXP-009 — Cross-connections may span any tiers
**Status: Established**

Connections are not restricted to same-tier objects. Real systems routinely cross physical-scale boundaries.

#### EXP-010 — Relationship direction and navigation direction are separate
**Status: Established**

A relationship may be directional in system behavior—such as power delivery or data movement—while remaining navigable in either direction by the user.

#### EXP-011 — Cross-connections use a controlled relationship taxonomy
**Status: Established**

A generic “related to” edge should be avoided. The canonical relationship families and machine identifiers are:

- **physical connectivity** — `physical_connectivity`;
- **data / communication path** — `data_communication_path`;
- **dependency / service** — `dependency_service`;
- **affinity / locality** — `affinity_locality`;
- **shared resource / membership** — `shared_resource_membership`;
- **redundancy / protection** — `redundancy_protection`; and
- **control / management** — `control_management`.

These types describe relationship semantics and do not establish containment. New relationship families require an explicit taxonomy/schema revision rather than ad hoc labels.

#### EXP-012 — Prefer direct relationships over inferred transitive links
**Status: Established**

A multi-hop physical path should not automatically create direct edges between all endpoints.

Example: `GPU → NIC → Switch → NIC → GPU` does not by itself imply that Explore should create a permanent direct `GPU ↔ remote GPU` edge unless that relation has independent architectural meaning.

#### EXP-013 — Functional subsystems are normally cross-cutting
**Status: Established**

Frontend networks, backend fabrics, storage networks, power systems, monitoring systems, scale-up fabrics, scale-out fabrics, and similar systems should generally not become alternative containment trees.

They should identify or emphasize sets of physically contained objects and relationships.

#### EXP-014 — Physical links may be both objects and connections
**Status: Established**

A cable, fiber link, PCIe connection, NVLink connection, or similar physical link may deserve its own Tier-4 representation while also defining endpoint relationships.

No universal standalone **Links** containment branch is required.

### Cross-tier visibility

#### EXP-015 — One identity across scales
**Status: Established**

An object remains conceptually the same object wherever it is represented. A GPU summarized at Tier 2 and examined at Tier 4 is not two different entities.

#### EXP-016 — Home tier defines full representation
**Status: Established**

An object's home tier is generally where it first receives its complete independent representation. Presence at other tiers does not change its home tier.

#### EXP-017 — Higher tiers compress; lower tiers resolve
**Status: Established**

Moving outward aggregates lower-level detail. Moving inward progressively resolves that aggregation into constituent objects and connections.

Example: `compute region → rack with 64 GPUs → servers → individual GPUs`.

#### EXP-018 — Visibility may be explicit, aggregated, or implicit
**Status: Established as a design principle**

At a given scale, a lower-tier object may be:

- **explicitly visible**;
- **aggregated** into a parent summary; or
- **implicit**, contributing to visible behavior/properties without being drawn.

These are design categories, not necessarily user-facing labels.

#### EXP-019 — Visibility is relevance-based, not completeness-based
**Status: Established**

Explore should not display every technically present object at every scale. Only information that materially helps explain the architecture at the current scale should be shown.

#### EXP-020 — Lower-level exploration retains enclosing context
**Status: Established**

When entering lower tiers, the user should retain awareness of the enclosing system, group, assembly, or device as appropriate. The full ancestry need not always be visually prominent, but it must remain recoverable.

#### EXP-021 — Higher-level views retain awareness of deeper selection
**Status: Established**

If a selected object becomes aggregated when moving upward, the visible containing object should preserve meaningful indication that it contains the current selection.

#### EXP-022 — Connections scale semantically with objects
**Status: Established**

Cross-connections aggregate and resolve along with their endpoints.

Example views of the same underlying distributed connectivity:

- Tier 1: `Compute region ↔ accelerator fabric`
- Tier 2: `Rack A ↔ fabric ↔ Rack B`
- Tier 3: `Server A ↔ backend network ↔ Server B`
- Tier 4: detailed NIC/cable/switch path

#### EXP-023 — Aggregates must not masquerade as literal hardware
**Status: Established**

High-level representations such as “Backend Fabric” may summarize many physical components, but should not imply that the aggregate is itself necessarily one physical device.

### Movement

#### EXP-024 — Explore supports four movement classes
**Status: Established**

1. **Vertical** — move between containment scales.
2. **Lateral** — move between peers at similar scale.
3. **Cross-connection traversal** — follow a real system relationship.
4. **Contextual jump** — move directly to a known related destination.

#### EXP-025 — Movement changes focus, not structural truth
**Status: Established**

Following a cross-connection never rewrites the canonical containment path of the destination object.

#### EXP-026 — Structural Location and Explore Structural History are distinct
**Status: Established**

Example:

- Explore Structural History: `GPU A → NIC A → Switch B`
- Structural location of destination: `System → Network Domain → Switch B`

Both may matter, but they must not be conflated.

#### EXP-027 — Tier skipping is permitted
**Status: Established**

Navigation may jump directly across intermediate tiers when the destination is known and an intermediate view would add little value. Skipping a view does not remove that tier from the underlying hierarchy.

#### EXP-028 — Inspect, Select, and Enter are separate actions
**Status: Established**

Explore distinguishes transient **Inspect**, persistent **Select**, and navigational **Enter** intents. Inspect and Select do not change Structural Location; Enter does. The finalized interaction contract is defined in Section 1.6.

Selection must not automatically force navigation.

#### EXP-029 — Cross-connections normally require deliberate traversal
**Status: Established**

Preferred pattern: `select → inspect relationship → deliberately follow`, rather than automatic navigation when an object is selected. Connection selection/detail and deliberate **Follow** behavior are defined further in Section 1.6.

#### EXP-030 — Moving upward restores the tier-appropriate abstraction
**Status: Established**

Returning to a higher tier should remove inappropriate lower-tier detail while retaining useful selection emphasis.

**Principle:** `Tier determines representation; selection determines emphasis.`

#### EXP-031 — Lateral navigation is first-class
**Status: Established**

Users should be able to move among sibling racks, servers, GPUs, switches, etc. without repeatedly returning to the system root.

#### EXP-032 — Cross-tier movement preserves orientation
**Status: Established**

When a traversal crosses structural boundaries, the user should still be able to understand where they moved, even if every intermediate physical step is not shown.

### Explore / Concepts boundary

#### EXP-033 — Physical navigation stays in Explore
**Status: Established**

Explore owns physical entities, spatial relationships, containment, connectivity, and physically meaningful internal structures.

#### EXP-034 — Abstract mechanisms belong primarily in Concepts
**Status: Established**

Protocols, algorithms, parallelism strategies, software abstractions, policies, metrics, performance principles, and similar material should not be placed into deeper Explore tiers merely because they are technically advanced.

Examples primarily belonging to Concepts include:

- collective algorithms;
- TCP/RDMA behavior;
- tensor parallelism;
- scheduling;
- congestion control;
- memory coherence as an abstract mechanism;
- performance metrics.

#### EXP-035 — Explore and Concepts are bidirectionally linked
**Status: Established**

Explore objects may expose relevant concepts, and Concepts should link back to physical locations where those ideas appear.

Concepts remains a distinct view rather than existing solely as an Explore overlay.

## 1.5 Aggregation and repetition semantics

**Status: Established**

Aggregation is both a modeling and navigation mechanism, not merely a rendering optimization. Aggregate entities allow large, repeated, heterogeneous, or only partially documented populations to remain faithful and navigable without requiring every physical instance to be authored or materialized.

### Definitions

| Term | Status | Definition |
|---|---|---|
| **Aggregate Entity** | **Established** | A configuration-local modeled entity representing a population, collection, repeated structure, or summarized subsystem as one canonical navigable object. |
| **Repeated Population** | **Established** | The members represented by an Aggregate Entity when the aggregate denotes multiple instances of a common member type. |
| **Representative Member Context** | **Established** | A noncanonical exemplar view showing the modeled structure of one unspecified member of a sufficiently homogeneous Repeated Population. It is an educational navigation context, not a uniquely identified physical member. |
| **Addressable Member** | **Established** | An individual modeled member with stable configuration-local identity, allowing member-specific Selection, relationships, Scenario targeting, or navigation. |
| **Explicit Individual Entity** | **Established** | An individually authored entity used when members differ materially or require separately documented structure/provenance. |
| **Visual Replica** | **Established** | A rendered copy used to communicate count or spatial repetition without creating distinct semantic identity. |
| **Count Basis** | **Established** | The basis of a population count: **documented fixed**, **documented deployment-dependent**, **representative / educational**, or **unknown**, as defined by REF-027. |
| **Expansion Mode** | **Established** | The semantic degree to which an Aggregate Entity may resolve: **aggregate-only**, **representative-member**, or **addressable-members**. |
| **Member Template / Common Structure** | **Established conceptual term** | Shared modeled structure that a Representative Member Context or repeated Addressable Members may expose. A template is an authoring/runtime definition, not itself a physical entity. |

Core distinction:

> **A Representative Member Context explains what one member is like. An Addressable Member represents which modeled member it is.**

### Aggregation and repetition rules

#### AGG-001 — Aggregate Entities are first-class canonical objects
**Status: Established**

An Aggregate Entity remains independently selectable, inspectable, linkable, and navigable even when its population can be expanded.

**Rationale:** Aggregate identity often carries meaningful group-level structure or properties that no single member represents.

#### AGG-002 — Every repeated aggregate has one semantic expansion mode
**Status: Established**

A repeated Aggregate Entity uses one of:

1. **aggregate-only**;
2. **representative-member**; or
3. **addressable-members**.

The mode is part of the content/model semantics rather than a renderer heuristic.

**Rationale:** The model must distinguish “many exist,” “one typical member can be explained,” and “individual members matter.”

#### AGG-003 — Aggregate-only is the default when member expansion would mislead
**Status: Established**

Keep an aggregate as one navigable object when member-level expansion would create false uniformity or unsupported detail, including when:

- the population is heterogeneous;
- member structure is insufficiently documented;
- the count is unknown and no defensible representative model exists;
- individual differences are architecturally significant but undocumented;
- the aggregate primarily represents a fabric/service/domain rather than interchangeable physical members; or
- member expansion adds little educational value.

**Rationale:** Refusing to expand is preferable to manufacturing uniformity.

#### AGG-004 — Representative-member expansion requires meaningful homogeneity
**Status: Established**

A Representative Member Context may be offered when the aggregate represents repeated members of substantially the same modeled type, their relevant internal structure is sufficiently common and supportable, and examining one member materially improves understanding.

**Rationale:** A representative context provides useful physical depth without requiring dozens or thousands of redundant entity records.

#### AGG-005 — A Representative Member Context is not a specific physical member
**Status: Established**

A Representative Member Context must not silently become a numbered physical instance, configuration-local entity ID, Scenario target, unique Concept occurrence, or unique Cross-Connection endpoint.

Prefer labels such as:

`Representative DGX H100 node — population: 32`

rather than:

`DGX Node 1 of 32`

unless a true Addressable Member exists.

**Rationale:** Ordinal labeling implies member identity that an aggregate-only model does not contain.

#### AGG-006 — Representative contexts may nest
**Status: Established**

Representative expansion may occur through several aggregate levels when each independently satisfies the representative-member criteria, for example:

`32 DGX nodes → representative DGX node → 8 H100 GPUs → representative H100 GPU`

The existing tier-skipping and same-tier nesting rules remain authoritative.

**Rationale:** Nested aggregates are common in the current Reference-System corpus and can expose useful internal structure without exhaustive materialization.

#### AGG-007 — Canonical Containment Path stops at the canonical aggregate
**Status: Established**

A Representative Member Context is not inserted into canonical physical ancestry as though it were an authored entity. The interface may append a clearly marked exemplar suffix, for example:

`SuperPOD → Scalable Unit → DGX compute nodes (32) / Representative node`

The path through the Aggregate Entity remains canonical; the representative suffix is contextual.

**Rationale:** This preserves one canonical home and unambiguous structural ancestry.

#### AGG-008 — Representative-member traversal participates in structural navigation
**Status: Established**

Entering or leaving a Representative Member Context is a meaningful Explore structural-context change and participates in Explore Structural History. The history entry must remain identifiable as an exemplar context rather than a canonical entity.

If an exemplar can no longer be reconstructed, restoration falls back to its Aggregate Entity.

**Rationale:** Back/Forward and orientation should work naturally even when the destination is a representative context rather than an individually identified member.

#### AGG-009 — Addressable Members exist only when individual identity matters
**Status: Established**

Members should become individually addressable only when at least one of the following requires distinct identity:

- member-specific connectivity/topology;
- member-specific Scenario state;
- individual failure/degradation;
- member-specific Concept occurrence;
- meaningful lateral navigation among members;
- nonuniform properties;
- documented placement/position that materially teaches the architecture; or
- a user-facing comparison that depends on particular members.

A small count alone does not require individual identity.

**Rationale:** Identity should be driven by architectural meaning rather than rendering convenience.

#### AGG-010 — Addressable Members may be generated deterministically
**Status: Established conceptually**

For homogeneous repeated structures, Implementation may derive stable modeled member identifiers from a canonical aggregate identity plus a stable member key/index rather than requiring nearly identical YAML blocks for every instance.

These are modeled instance IDs, not claims about serial numbers, asset tags, or vendor-assigned labels. Heterogeneous or specially documented members should instead be authored explicitly.

**Rationale:** This keeps large configurations practical while preserving stable identity when it is genuinely required.

#### AGG-011 — Semantic materialization and render materialization are separate
**Status: Established**

An addressable population may logically contain many members while the renderer instantiates only visible members. Conversely, an Aggregate Entity may render many Visual Replicas without those replicas becoming independently addressable entities.

**Rationale:** Performance optimizations must not determine physical identity semantics.

#### AGG-012 — Counts expose their basis when interpretation depends on it
**Status: Established**

Where the distinction materially affects interpretation, user-facing content should differentiate examples such as:

- **32 nodes** — documented fixed;
- **up to 144 chips** — documented deployment-dependent maximum;
- **representative 64-node configuration** — educational/modeling choice; and
- **multiple switches; exact count not modeled** — unknown/aggregate.

Internal evidence labels need not dominate the UI, but variable, representative, and unknown counts must not appear as fixed literal populations.

**Rationale:** Count basis directly affects spatial understanding and comparison.

#### AGG-013 — Automatic expansion requires machine-readable repetition metadata
**Status: Established implementation dependency**

Before Implementation automatically expands repeated populations, the resolved model must identify at least:

- modeled count, when known;
- Count Basis;
- Expansion Mode;
- member type/common structure; and
- whether members are individually addressable.

Optional ranges, maxima, and source notes may be included where useful. Exact schema field names remain an Implementation/schema decision.

**Rationale:** Expansion semantics cannot be inferred safely from free-form property names such as `quantity_per_rack`, `gpus`, or `max_*`.

#### AGG-014 — Selection follows the semantic object represented
**Status: Established**

- selecting an Aggregate Entity selects the group;
- selecting a Visual Replica resolves to the Aggregate Entity unless the replica represents an Addressable Member;
- selections inside a Representative Member Context are explicitly representative/exemplar selections; and
- selecting an Addressable Member selects that member normally.

Entering continues to clear the prior Selection under NAV-025.

**Rationale:** Selection must never imply stronger identity than the model provides.

#### AGG-015 — Aggregate Scenario effects remain aggregate-level by default
**Status: Established**

A Scenario targeted at an Aggregate Entity describes the state of the aggregate as modeled. It does not automatically assert the same state for every represented member.

Member-level propagation requires explicit semantics such as **all members**, a defined subset, or a particular Addressable Member. Representative Member Contexts are never canonical Scenario targets.

**Rationale:** Group-level degradation or failure must not silently become identical per-member state.

#### AGG-016 — Representative contexts show Scenario state conservatively
**Status: Established**

If an Aggregate Entity has only a group-level Scenario condition, a Representative Member Context may show that condition as parent context but must not assign unsupported member-specific state.

Example:

`Parent group: degraded`  
`Representative member: individual health not specified`

**Rationale:** An exemplar is not evidence that every member shares the aggregate condition.

#### AGG-017 — Concept links remain anchored to canonical modeled identities
**Status: Established**

Concept links associated with an Aggregate Entity may be available while examining a Representative Member Context, but the canonical Concept occurrence remains attached to the Aggregate Entity unless an Addressable Member has its own explicit occurrence.

Opening Concepts from a Representative Member Context may preserve that exemplar in Return Context, but must not create a permanent physical occurrence ID.

**Rationale:** Cross-view convenience must not manufacture physical identity.

#### AGG-018 — Aggregate connections may be summarized but not falsely individualized
**Status: Established**

A Representative Member Context may show that members participate in an aggregate fabric or common connection pattern. It must not show a specific cable, switch, peer, or path unless that relationship is actually addressable in the resolved model.

**Rationale:** Group topology and instance topology are not interchangeable.

#### AGG-019 — Expansion priority is semantic before practical
**Status: Established**

Expansion decisions should be made in this order:

1. architectural accuracy;
2. available evidence/detail;
3. educational value;
4. current Tier/scale;
5. interaction usefulness; and
6. rendering/performance constraints.

Performance may change virtualization or visual density, but not semantic Expansion Mode.

**Rationale:** The project's purpose is understanding architecture rather than maximizing the number of rendered objects.

#### AGG-020 — Stable identity exists only where the model promises it
**Status: Established**

Identity guarantees are:

- **Aggregate Entity:** stable configuration-local entity ID;
- **Representative Member Context:** stable/reconstructable runtime locator derived from the aggregate, but no canonical entity ID;
- **Addressable Member:** stable modeled configuration-local entity ID; and
- **Visual Replica:** no independent semantic identity.

**Rationale:** Rendered glyphs, exemplar contexts, and canonical physical entities must not be conflated.

### Aggregation assumptions and implementation boundary

**Status: Established**

- Large AI systems are expected to remain aggregate-heavy.
- Representative expansion will normally be more common than exhaustive individual materialization.
- Explicit individuals are preferred for heterogeneous or architecturally special members.
- The initial product does not require serial-number-level physical identity.
- Lazy rendering/virtualization of addressable populations is an Implementation concern.
- Aggregation applies at Tier 5 as well as higher tiers; documented counts such as hundreds of thousands of cores do not imply equal numbers of rendered or individually identified entities.

The Version-1 population encoding is provisionally resolved under REF-I02, and deterministic generated Addressable Member ID syntax is resolved in the implementation companion. Exact renderer virtualization/visibility limits remain intentionally open pending the representative initial-five rendering prototype.

## 1.6 Selection and Detail Context

**Status: Established**

Selection and Detail Context defines the primary Explore interaction contract for inspecting architecture without conflating inspection with structural navigation. The finalized baseline is **Option F — Hybrid interaction model**:

- **Hover or keyboard focus → Inspect / lightweight Preview** without changing persistent Explore state;
- **primary click/tap or keyboard activation → Select** the target and expose persistent Detail Context; and
- **explicit Enter or other clearly labeled traversal action → navigate** to a new structural context.

Hover is an enhancement rather than a prerequisite. Touch and keyboard users receive the complete persistent workflow without relying on hover, double-click, right-click, or modifier gestures.

Core interaction invariant:

> **Inspect is transient. Select is persistent. Enter is navigational.**

### Selection and Detail terminology

| Term | Status | Definition |
|---|---|---|
| **Preview Target** | **Established** | The transient entity or relationship currently being inspected through hover or equivalent keyboard focus behavior. Preview Target is ephemeral UI state, not persistent Explore state. |
| **Current Selection** | **Established** | The one persistent Explore target currently selected for inspection, if any. This is the Navigation-state Selection defined in Section 2. |
| **Detail Context** | **Established** | The structured information and available actions appropriate to the Current Selection or, when no Selection exists, the current Structural Location. |
| **Detail Area** | **Established** | The persistent UI surface presenting Detail Context. It may be a side panel, drawer, bottom sheet, or other responsive presentation without changing semantics. |
| **Current-Location Summary** | **Established** | Detail Context shown when no object is selected. It describes the current Structural Location without treating that location as selected. |
| **Enterable Target** | **Established** | A target for which moving into or focusing its structural context creates a meaningful Explore navigation destination or finer architectural representation. |
| **Detail Visibility** | **Established** | Whether the Detail Area is currently displayed. It is presentation state only and does not determine Selection or object interaction semantics. |
| **Persistent Detail** | **Established** | Detail content driven by Current Selection rather than transient Preview. Selection itself is the persistence/pinning mechanism; no separate pin state exists in the initial design. |

### Primary interaction rules

#### SDC-001 — Inspect, Select, and Enter are distinct intents
**Status: Established**

The three intents have different state effects:

| Intent | Persistent Selection | Structural Location | Detail behavior | Navigation history |
|---|---:|---:|---|---:|
| **Inspect** | No change | No change | Temporary lightweight Preview | No |
| **Select** | Change | No change | Persistent selected Detail Context | No |
| **Enter** | Clear under NAV-025 | Change | Current-Location Summary after transition | Yes |

**Rationale:** Inspection should be reversible and low-risk, Selection should support persistent study, and navigation should remain deliberate and historically meaningful.

#### SDC-002 — Ordinary primary click/tap performs Selection
**Status: Established**

A normal primary click or tap on a selectable target makes it the Current Selection and exposes its persistent Detail Context. It does not Enter the target.

**Rationale:** Selection is the safer, more discoverable first action and works consistently across mouse, trackpad, touch, and keyboard input.

#### SDC-003 — Enter is an explicit deliberate action
**Status: Established**

An Enterable Target exposes a visible **Enter** action. The action may appear in the Detail Area and, where useful, as a redundant nearby/inline affordance, but it has one semantic meaning regardless of presentation.

Entering follows the established Navigation contract: the destination becomes Structural Location, Tier and Containment Path adapt, prior Selection clears under NAV-025, Scenario is preserved unless another established transition rule says otherwise, and the navigation histories record the movement under NAV-026 and CVI-029.

**Rationale:** Deliberate Entry prevents accidental pointer activation from filling structural history or disorienting the learner.

#### SDC-004 — Entering transforms an object's role from Selection to Structural Location
**Status: Established**

When a selected object is entered, the object becomes the new Structural Location and Selection clears. The Detail Area then transitions naturally from **Selected Object Detail** to **Current-Location Summary** for that same physical context.

Example:

`Selected: Server 3 → Enter → Location: Server 3; Selection: none`

**Rationale:** This preserves NAV-025 while maintaining visual and educational continuity.

#### SDC-005 — The Detail Area defaults to Current-Location Summary
**Status: Established**

When Explore has no Current Selection, a visible Detail Area shows a concise Current-Location Summary rather than remaining blank or implicitly selecting the Structural Location.

Where useful, the summary includes:

- current Structural Location and type;
- current Tier;
- relevant containment/context;
- a short explanation;
- important aggregate/count information;
- material current Scenario state; and
- a lightweight instruction such as **Select an object for details**.

On initial Explore entry, the baseline state is:

`Structural Location: default configuration root → Current Tier: Tier 1 → Current Selection: none → Preview Target: none → Detail Visibility: visible → Detail Context: Current-Location Summary → Scenario: destination Default Scenario`

#### SDC-006 — Hover/focus Preview is lightweight and nonessential
**Status: Established**

Pointer hover or equivalent keyboard focus may expose a lightweight Preview containing only enough information to decide whether the target is worth selecting, normally:

- name;
- entity/relationship type or short role;
- one-line summary;
- material current Scenario state;
- aggregate/count indication where useful; and
- a subtle hint such as **Click for details**.

Required buttons, Concept links, long property tables, scrolling content, and other essential interaction must not live only inside transient Preview UI.

**Rationale:** Preview accelerates scanning for pointer users without becoming an inaccessible second interaction system.

#### SDC-007 — Hover Preview uses a short dwell and dismissal grace period
**Status: Established baseline; exact timing is implementation-tunable**

The initial interaction target is approximately:

- **250 ms** stable hover before Preview appears; and
- **150 ms** dismissal grace after pointer departure.

Keyboard-focus Preview persists while focus remains and does not use a mouse-style timeout. Exact timing may be tuned through usability testing without changing the semantic contract.

**Rationale:** Small delays reduce flicker in dense architecture views while retaining rapid inspection.

#### SDC-008 — Clicking a previewed target selects it
**Status: Established**

Clicking/tapping a target makes it the Current Selection regardless of whether its Preview has already appeared. If it was previewed, its transient Preview gives way to persistent Detail Context.

Selection itself is the persistence/pinning mechanism; no separate **pin** state is required.

#### SDC-009 — Pointer departure never clears Selection
**Status: Established**

Once selected, a target remains selected when the pointer leaves it. Its persistent Detail Context and Selection emphasis remain until another action changes or clears Selection.

Hovering another target may show that other target's transient Preview without replacing persistent selected Detail.

#### SDC-010 — Preview never replaces persistent selected Detail
**Status: Established**

If one target is selected and another is previewed, the Detail Area continues to show the selected target. Clicking the previewed target replaces Current Selection with that target.

**Rationale:** Pointer movement must not make persistent Detail unreliable.

#### SDC-011 — Selection is singular in the initial design
**Status: Established**

Explore has at most one Current Selection. Selecting another target replaces the previous Selection.

Multi-selection is not part of the initial Selection and Detail contract.

#### SDC-012 — Selection has explicit clearing behavior
**Status: Established**

Current Selection may be cleared by:

- clicking/tapping an unambiguous empty Explore background;
- pressing **Escape** when no higher-priority dismissible UI consumes that key;
- using an explicit **Clear selection** affordance where useful;
- entering another structural context under NAV-025; or
- configuration/system reset under the established Reference-System rules.

Panning/dragging the Explore canvas is not a background click and must not clear Selection. Clicking the already-selected target again normally leaves it selected rather than toggling Selection off.

#### SDC-013 — Detail visibility changes presentation only
**Status: Established**

A Detail open/close/toggle control affects **Detail Visibility only**. Hiding the Detail Area:

- does not clear Current Selection;
- does not change click/tap behavior;
- does not alter Structural Location;
- does not create history;
- does not change Scenario or Concept state.

The selected target remains visually identifiable while Detail is hidden.

**Rationale:** A display preference must not silently become an interaction mode.

#### SDC-014 — Detail presentation is responsive, not semantically device-specific
**Status: Established**

The same Detail Context may be presented as a persistent side panel on large viewports, a drawer or bottom sheet on smaller/touch viewports, or another accessibility-appropriate surface. Presentation may adapt; Selection and Entry semantics do not.

### Detail information contract

#### SDC-015 — Every selected target receives a common identity/context header
**Status: Established**

Where applicable, persistent Detail begins with enough information to answer **what is this and where is it?**

The common header may include:

- canonical display name;
- entity or relationship type;
- relevant Product Identity;
- Representation State;
- Aggregate/Representative status where material;
- canonical home/structural location;
- current or Home Tier where useful;
- enclosing context; and
- count/Count Basis for aggregates.

#### SDC-016 — Detail uses progressive, type-aware sections
**Status: Established**

Persistent Detail supports the following sections where relevant:

1. **Overview / why it matters**;
2. **Key properties**;
3. **Current Scenario state**;
4. **Containment / constituents**;
5. **Connections and relationships**;
6. **Relevant Concepts**;
7. **Evidence, uncertainty, and sources**; and
8. **Available actions**.

The semantic categories remain stable, but entity-type capability profiles determine which sections and actions apply. Empty or irrelevant sections should not be shown merely for structural uniformity.

#### SDC-017 — Key properties obey the Property and Measurement contract
**Status: Established**

Properties shown in Detail preserve Section 7 semantics for unit, scope, measurement basis, approximation/range, evidence, and provenance where applicable. The primary Detail view should emphasize educationally important properties rather than dumping every authored property indiscriminately.

#### SDC-018 — Material uncertainty is visible; routine provenance is secondary
**Status: Established**

Evidence metadata does not need to dominate normal Detail presentation. Detail should surface uncertainty prominently when it materially changes interpretation, including representative populations, simplified or inferred architecture, black-box boundaries, unknown/proprietary detail, and deployment-dependent counts.

Full sources/provenance may remain in a secondary expandable area when the uncertainty does not otherwise require prominent treatment.

### Target-specific behavior and edge cases

#### SDC-019 — Aggregate Entity Detail exposes aggregate semantics
**Status: Established**

Aggregate Detail shows relevant population/count, Count Basis, Expansion Mode, addressability, aggregate Scenario state, and available expansion behavior.

Action labels should match the modeled semantics, for example **Enter**, **Explore representative node**, or **View members**, rather than using one generic expansion label for every case.

#### SDC-020 — Representative selections remain visibly noncanonical
**Status: Established**

A selection inside a Representative Member Context must be identified as representative/exemplar content and must not display an invented ordinal or canonical physical member ID.

Example:

`Representative H100 GPU — example member of the modeled eight-GPU population`

This behavior follows AGG-005, AGG-014, and AGG-020.

#### SDC-021 — Visual Replicas resolve to their semantic target
**Status: Established**

A Visual Replica has no independent Selection identity. Activating it selects its Aggregate Entity unless the rendered replica genuinely represents an Addressable Member, in which case that member is selected normally.

#### SDC-022 — Connections and relationship edges are selectable
**Status: Established**

A typed Cross-Connection may be selected when its information is meaningful. Connection Detail may include:

- relationship type;
- endpoints;
- system directionality versus navigation direction;
- relevant properties such as rate/capacity;
- current active/inactive Scenario state;
- evidence;
- Concept links; and
- deliberate endpoint/traversal actions.

A relationship uses **Follow** or destination-specific wording instead of **Enter** when that more accurately describes the navigation action.

**Rationale:** This directly implements the established `select → inspect relationship → deliberately follow` pattern.

#### SDC-023 — Black-box boundaries remain inspectable at their supported depth
**Status: Established**

A Black-Box Boundary may be selected normally. Detail should explain its known role, supported boundary, known relationships, and—when material—why deeper information is unavailable.

If no deeper supported structural context exists, the **Enter** action is absent rather than leading to an empty or fabricated internal view.

#### SDC-024 — Non-enterable targets remain ordinary selectable targets
**Status: Established**

A target does not need to be Enterable to support Selection, properties, Scenario state, relationships, Concept links, or provenance. If Enter would create no meaningful structural/representational change, do not show it.

Other valid actions such as **Follow** or Concept traversal remain available where applicable.

#### SDC-025 — Enterability is capability-driven rather than child-count-driven
**Status: Established**

Enterability depends on the resolved configuration, meaningful architectural focus, and entity/interaction capability profile rather than only on whether an object has literal authored children.

An object may be Enterable when entering it meaningfully changes architectural focus even if no deeper child entity is authored. Conversely, an object need not be Enterable merely because the renderer can center it.

**Rationale:** A graph-oriented spatial explorer needs a richer criterion than `has_children`.

#### SDC-026 — Detail reflects the active Scenario without changing Selection
**Status: Established**

Scenario changes update Scenario-dependent portions of selected Detail Context without clearing Selection or navigating. A selected object remains selected if it becomes failed, degraded, isolated, inactive, or otherwise affected because physical identity remains unchanged.

#### SDC-027 — Aggregate Scenario Detail remains conservative
**Status: Established**

When only aggregate-level Scenario state is known, Representative Member Detail may show the aggregate condition as parent context while stating that individual member state is unspecified. It must not infer per-member state from aggregate state.

#### SDC-028 — Concept actions originate from persistent Detail rather than transient Preview
**Status: Established**

Relevant explicit Concept links appear in persistent Detail Context rather than being available only through transient Preview. Following one invokes the established contextual Explore → Concepts transition in Section 6, preserving Explore Selection/state and creating Return Context.

### History, persistence, and cross-view interaction

#### SDC-029 — Inspect, Select, Detail visibility, and local Detail interaction do not create navigation history
**Status: Established**

Hover/focus Preview, Selection changes, clearing Selection, Detail open/close, and local Detail-section interaction do not create Explore Structural History or Application Navigation History entries.

Structural Entry and deliberate relationship traversal create navigation history according to NAV-026 and CVI-029. Opening a Concept through an explicit Concept link creates an Application Navigation History destination but not an Explore Structural History entry under Section 6.

#### SDC-030 — Current Selection survives ordinary view changes; Preview does not
**Status: Established**

Current Selection remains part of dormant Explore state when Concepts is opened and is restored when returning to Explore if still valid. Preview Target is ephemeral and is cleared when leaving Explore; it is not part of Return Context or Application Navigation History.

Detail Visibility is Explore-local presentation state and may be retained across ordinary view changes within the active session, but it never changes semantic Return Context.

#### SDC-031 — Configuration changes clear incompatible Selection
**Status: Established**

Existing Reference-System switching behavior remains authoritative. Selection and Detail behavior must not map a selected target into another Reference Configuration merely because a similarly named, similarly typed, or related object exists there.

#### SDC-032 — Cross-view occurrence arrival avoids redundant Location/Selection states
**Status: Established**

When a Concept → Explore occurrence traversal arrives at a target:

- if the occurrence is best represented **inside an enclosing Structural Location**, navigate to that enclosing context and select/highlight the occurrence; but
- if the occurrence itself becomes Structural Location and persistent `Location: X; Selection: X` would be redundant, use a temporary arrival highlight rather than retaining an identical persistent Selection.

Section 6 owns the cross-view transition; this rule preserves NAV-025's established separation of Location and Selection.

### Keyboard, pointer, touch, and accessibility behavior

#### SDC-033 — No essential action depends on hover, double-click, right-click, or modifier gestures
**Status: Established**

Every persistent action must have a visible/focusable equivalent, including Select, Clear Selection, Enter, Follow, open Concept, and show/hide Detail.

Right-click/context menus, modifier-click, long-press, or double-click may be added later only as redundant convenience shortcuts. They must not contain functionality unavailable through the canonical interaction path.

#### SDC-034 — Keyboard focus provides the Inspect equivalent
**Status: Established**

Keyboard users can move focus among visible/selectable Explore targets. Focus provides the equivalent lightweight Inspect/Preview state where useful, exposes an accessible name/type description, and always has a clear focus indicator that does not rely on color alone.

Keyboard focus itself does not create persistent Selection.

#### SDC-035 — Enter/Space on a focused target performs Selection
**Status: Established**

For consistency with primary click/tap, pressing **Enter** or **Space** on a focused selectable target makes it the Current Selection. The visible **Enter**, **Follow**, Concept, and other Detail actions are ordinary focusable controls activated through standard keyboard behavior.

Optional navigation accelerators may be introduced later but are not part of the required initial contract.

#### SDC-036 — Escape clears Selection
**Status: Established**

When keyboard focus is in the main Explore interaction context and no higher-priority dismissible UI such as a menu or dialog consumes the key, **Escape** clears Current Selection. It does not navigate Back.

#### SDC-037 — Touch uses Selection as the safe first interaction
**Status: Established**

Touch does not require a transient Inspect gesture. Baseline touch behavior is:

`tap target → Select → inspect persistent Detail → activate Enter/Follow/etc. deliberately`

Long-press may later provide a redundant context action or Preview but is not required.

#### SDC-038 — Structural Location, Preview, Selection, and Scenario emphasis remain visually distinguishable
**Status: Established**

The interface must visually and accessibly distinguish:

- **where I am** — Structural Location;
- **what I am temporarily inspecting** — Preview/focus;
- **what I have selected** — Current Selection; and
- **what the active Scenario affects or emphasizes** — dynamic state.

These states may coexist and must not rely on color alone.

### Selection and Detail assumptions and implementation boundary

**Status: Established**

- Option F — the Hybrid interaction model—is the canonical initial interaction model.
- Hover Preview is supplemental; complete functionality remains available through Selection and persistent Detail.
- Selection is the only persistence/pinning state for object Detail in the initial design.
- The Detail Area is visible by default on initial Explore entry, with a Current-Location Summary when Selection is empty.
- Exact panel dimensions, responsive breakpoints, animation, hover timing fine-tuning, and optional shortcut accelerators are Implementation/testing choices.
- Entity-type capability profiles defined under REF-I01 should map the common Detail contract to type-appropriate sections and actions rather than creating unrelated bespoke interaction systems.

Selection and Detail summary invariant:

> **Explore distinguishes transient inspection, persistent selection, and structural entry. Hover or keyboard focus may preview a target without changing semantic state; ordinary click/tap selects the target and exposes persistent, context-aware details; structural navigation occurs only through an explicit Enter or other clearly labeled traversal action. Selection does not change Structural Location or navigation history, while Entering changes Structural Location, clears the prior Selection, and records navigation. The Detail Area presents Current-Location context when nothing is selected, remains independent of visibility controls, and adapts its contents and actions to entities, aggregates, representative contexts, connections, black boxes, Scenarios, and Concept links without overstating identity or evidence.**

## 1.7 Representative examples and edge cases

| Case | Status | Expected treatment |
|---|---|---|
| Server with eight GPUs | **Established** | Server home: Tier 3. GPUs home: Tier 4. At higher scales GPUs may be aggregated into counts/capacity. |
| GPU connected to NIC through PCIe | **Established** | GPU and NIC retain their homes; PCIe is represented as a link/cross-connection. |
| Backend accelerator network | **Established** | Cross-cutting functional fabric, not an alternative containment tree. |
| Rack belongs to cluster and network rail | **Established** | Physical containment supplies canonical home; rail participation is membership/cross-connection. |
| No meaningful Tier 2 in a small system | **Established** | A tier may be skipped: `System → Assembly → Device`. |
| Row → Rack → Rack Unit | **Established** | Several containment steps may occur within approximately the same navigation band. |
| GPU internal cache/controller structures | **Established** | Tier 5 when physically useful to system understanding. |
| Tensor parallelism | **Established** | Concept, not Tier 5. Link to relevant GPUs/interconnects through Concepts. |
| Fiber cable between racks | **Established** | May exist as a Tier-4 link object with endpoints in separate containment branches. |
| Scenario causes thermal throttling | **Established** | Physical hierarchy remains unchanged; scenario alters state/emphasis. |
| Different accelerator chassis architecture | **Established** | Treat as a different reference configuration if physical organization materially changes. |
| Backend fabric shown at system level | **Established** | May be an aggregate that resolves into physical switches/links when drilling down. |

## 1.8 Assumptions and constraints

| Item | Status |
|---|---|
| Physical/spatial understanding is the central value proposition of Explore. | **Established** |
| Stable navigation scale takes precedence over using functional subsystem categories as hierarchy. | **Established** |
| Real architectures are graph-like; containment primarily preserves orientation. | **Established** |
| The same physical object may participate in many cross-cutting systems. | **Established** |
| Not every Organizational inventory item belongs in Explore; many belong primarily in Concepts, Scenario Context, System Context, or future guided modes. | **Established** |
| Detailed transistor-level logic is outside the likely project boundary. | **Established baseline** |
| Security remains comparatively shallow unless future requirements justify expansion. | **Established baseline** |
| Different reference systems may expose different physical depths. | **Established** |
| Explore should use semantic abstraction rather than attempting to display the entire architecture at all scales simultaneously. | **Established** |

## 1.9 Future considerations and implementation details

### EXP-I01 — Visibility thresholds and aggregation tuning
**Status: Provisionally Resolved implementation policy; numeric tuning remains open**

EXP-018 through EXP-023 establish explicit/aggregated/implicit visibility and relevance-based semantic zoom. Version 1 uses **semantic aggregation first**: visibility is derived from Structural Location, Tier, authored aggregation semantics, architectural relevance, and interaction state rather than from one global object-count threshold. Renderer virtualization or dense-layer fallback may be introduced only as presentation optimization and must not change Expansion Mode, identity, Selection, or Navigation semantics.

Exact numeric visibility/virtualization limits remain intentionally open until representative scenes from the initial five systems are profiled. The current implementation default and review trigger are recorded in `Delivery_Rendering_and_Platform_Implementation_Plan.md`.

### EXP-F01 — Exact Functional Lens behavior
**Status: Deferred to Features**

Functional systems are established as cross-cutting rather than containment hierarchies. Persistent user-selectable Functional Lenses are defined at a high level in the Navigation section; multi-lens behavior, cross-configuration persistence, and detailed visualization remain deferred.

## 1.10 Rejected Explore approaches

| ID | Status | Rejected approach | Reason |
|---|---|---|---|
| **EXP-R01** | **Rejected** | Strict tree architecture with no cross-links | Real AI infrastructure contains essential many-to-many connectivity and cross-tier relationships. |
| **EXP-R02** | **Rejected** | Functional subsystem hierarchy as primary Explore structure | Compute/network/storage/power/etc. overlap heavily and would create ambiguous ownership. |
| **EXP-R03** | **Rejected** | One rigid physical depth per tier | Real configurations have variable structural depth. |
| **EXP-R04** | **Rejected** | Full detail visible at all scales | Creates visual overload and defeats semantic abstraction. |
| **EXP-R05** | **Rejected** | One broad “Components” tier | Servers/assemblies and individual devices need different navigation scales. |
| **EXP-R06** | **Rejected** | All technically deep topics belong under Internal Detail | Technical depth is not equivalent to physical depth. |
| **EXP-R07** | **Rejected** | Concepts exist only as overlays within Explore | Full Concepts content needs its own distinct, bidirectionally linked view. |
| **EXP-R08** | **Rejected as default** | Scenario-specific copies of the physical hierarchy | Scenarios should normally modify state/context, not duplicate the architecture. |

## 1.11 Explore dependencies

| Dependency | Status | Relationship to Explore |
|---|---|---|
| **Reference Systems and Configurations** | **Established dependency** | Instantiates the shared Explore hierarchy with concrete architectures; the initial five-system baseline is defined in Section 3. |
| **Concepts** | **Established dependency** | Owns abstract explanatory content and links bidirectionally to physical Explore objects. |
| **Scenario Context** | **Established dependency** | May alter state, emphasis, traffic, failures, and bottlenecks without normally changing containment. |
| **Guided Modes / Flows** | **Future dependency** | Expected to traverse the same Explore structure sequentially; not part of the initial Explore scope. |
| **Organizational inventory** | **Established input** | Source inventory from which Explore-relevant physical entities and linked concepts are derived. |

## 1.12 Explore summary invariant

**Status: Established**

> **Explore is a stable physical containment hierarchy overlaid by a typed cross-connection graph, presented through semantic zoom and navigated without losing structural context.**

---

# 2. Navigation and Orientation State

## 2.1 Purpose

**Status: Established**

Navigation/orientation state exists so that the user can reliably answer:

1. **What reference system am I in?**
2. **Where am I structurally within it?**
3. **At what semantic tier am I viewing it?**
4. **What object, if any, have I selected?**
5. **What is the canonical containment path to this location?**
6. **What scenario is active?**
7. **If I arrived through a non-hierarchical relationship, where did I come from and what did I follow?**

The state should remain conceptually independent of any particular reference architecture wherever possible.

## 2.2 State model

| State element | Status | Purpose |
|---|---|---|
| **Current Reference System** | **Established** | Identifies the active Reference System. |
| **Current Reference Configuration** | **Established** | Identifies the active configuration whose physical hierarchy and cross-connections instantiate Explore. |
| **Scenario Context** | **Established** | Identifies the active operating/workload Scenario, including the configuration-defined Default Scenario. |
| **Structural Location** | **Established** | The physical/structural context the user has currently entered. |
| **Current Tier** | **Established** | The semantic representation scale associated with the current structural location in the initial design. |
| **Containment Path** | **Established** | Canonical ancestry of the current structural location. |
| **Current Selection** | **Established** | Object currently selected for inspection, if any. |
| **Selection Relationship to View** | **Established** | Whether the selected object is directly visible, aggregated beneath a visible ancestor, or otherwise represented indirectly. |
| **Traversal Context** | **Established** | Immediate origin and relationship used when arriving by cross-connection or direct traversal. |
| **Explore Structural History** | **Established** | Linear sequence of successful physical Structural Location changes inside Explore. |
| **Functional Lens State** | **Future feature direction** | Optional cross-cutting emphasis that persists during navigation when enabled. Detailed feature behavior is deferred. |

Preview Target and Detail Visibility are Explore interaction/presentation state defined in Section 1.6 rather than core orientation facts. Current Selection remains the persistent Selection state used by Navigation.

## 2.3 Orientation prominence

### Always apparent
**Status: Established**

The user should normally be able to determine without leaving the current Explore view:

- current Reference System and Reference Configuration;
- current structural location;
- current tier;
- containment path;
- current selection, if any; and
- current scenario.

### Always recoverable
**Status: Established**

The following should persist but do not need equal visual prominence:

- full Explore Structural History;
- immediate traversal origin;
- relationship followed to reach the current location;
- deeper selection ancestry;
- previous structural locations.

## 2.4 Navigation rules

#### NAV-001 — Current Reference System and Reference Configuration must always be explicit
**Status: Established**

Explore must never leave the user uncertain about which Reference System and Reference Configuration are active, even if only one currently exists.

#### NAV-002 — Structural location must always be defined
**Status: Established**

At any moment, Explore has one current structural navigation context: the part of the physical architecture the user is currently inside or centered on.

#### NAV-003 — Structural location and selection are separate
**Status: Established**

A user may remain located at a rack while selecting a server, or remain at a server while selecting a GPU. Selection does not automatically become navigation context. The canonical Inspect/Select/Enter interaction behavior is defined in Explore Section 1.6.

#### NAV-004 — Current tier must always be knowable
**Status: Established**

The semantic scale currently being represented must be clear. The selected object may have a different home tier from the current view.

Example: current tier is Tier 2 while a Tier-3 server is selected from the rack view.

#### NAV-005 — Tier and containment depth are not equivalent
**Status: Established**

The navigation state must not assume that every step in the containment path corresponds to a tier change.

#### NAV-006 — Canonical containment path must remain recoverable
**Status: Established**

The user's current structural location must always have an unambiguous canonical ancestry, even if the whole path is not permanently prominent.

#### NAV-007 — Containment Path never becomes Explore Structural History
**Status: Established**

The sequence used to reach an object must remain distinct from the object's canonical structural location.

#### NAV-008 — Selection is optional; structural location is not
**Status: Established**

A valid Explore state may have `Selection: none`. The user should never need a selected object simply to remain oriented.

#### NAV-009 — Selection should persist across outward scale changes when meaningful
**Status: Established**

If a selected lower-tier object becomes aggregated, its selection should remain conceptually active as long as that remains meaningful.

#### NAV-010 — Aggregated selections must remain identifiable
**Status: Established**

If a selected object is hidden by semantic aggregation, the visible ancestor containing it should indicate that it contains the current selection.

#### NAV-011 — Entering an object updates structural location
**Status: Established**

Deliberately entering an object makes it the new structural context and updates the containment path and tier accordingly.

#### NAV-012 — Moving upward restores the correct abstraction
**Status: Established**

Moving to a higher structural context updates location, tier, and visible detail while preserving meaningful selection state.

#### NAV-013 — Lateral movement preserves scale where practical
**Status: Established**

Moving between peers should normally retain the current semantic tier.

Examples: `Server 3 → Server 4`, `GPU 2 → GPU 3`.

#### NAV-014 — Cross-connection traversal reorients to the destination's real context
**Status: Established**

Following a relationship to another object updates structural location according to the destination's own canonical home.

#### NAV-015 — Cross-connection traversal preserves immediate origin
**Status: Established**

After a structural jump, the user should retain temporary awareness of where they came from and which relationship was followed.

#### NAV-016 — Explore Structural History is independent of canonical containment
**Status: Established**

The user's path may cross multiple canonical branches and need not resemble the containment hierarchy.

#### NAV-017 — Direct jumps may skip tiers without losing orientation
**Status: Established**

Known destinations may be entered directly. On arrival, Explore reconstructs the destination's canonical structural context.

#### NAV-018 — Scenario context must always be explicit
**Status: Established**

Explore always has a scenario state, including a configuration-defined default/baseline scenario.

#### NAV-019 — Scenario changes normally preserve structural state
**Status: Established**

Changing scenario should ordinarily preserve current system, structural location, tier, containment path, and selection. Scenario changes may alter highlighting, utilization, data paths, health, bottlenecks, and other contextual state.

#### NAV-020 — Scenario state does not silently redefine physical identity
**Status: Established**

Degrading, disabling, rerouting, or emphasizing an object in a scenario does not create a new physical object or containment model.

#### NAV-021 — Navigation changes must be legible rather than implicit
**Status: Established**

Structural location should change only through an interaction whose navigational effect is understandable. Selection, highlighting, or scenario changes should not silently move the user.

#### NAV-022 — Orientation survives semantic zoom
**Status: Established**

Changing scale must feel like viewing the same system at a different abstraction level, not entering an unrelated diagram.

#### NAV-023 — Cross-system object state must not be silently inferred
**Status: Established baseline**

When the reference configuration changes, object-specific structural/selection state should not be mapped into the destination configuration unless an explicit equivalence is defined later.

Incompatible selections should be cleared rather than guessed.

#### NAV-024 — Tier follows structural location in the initial design
**Status: Established for initial scope; Deferred to Features for reconsideration**

The current semantic tier is determined by the user's current structural navigation context. Independent semantic zoom while retaining the same structural location is outside the initial scope.

#### NAV-025 — Entering clears the prior Selection
**Status: Established**

When the user deliberately enters an object or child context:

1. that destination becomes the new Structural Location;
2. the previous Selection is cleared; and
3. valid children/elements of the new location become selectable.

This applies whether the destination was selected first or entered directly. It avoids redundant states such as `Location: Server 3; Selection: Server 3` and preserves the distinction among **Inspect**, **Select**, and **Enter** defined in Section 1.6. The Detail Area then transitions to the destination's Current-Location Summary under SDC-004.

#### NAV-026 — Explore Structural History records every successful structural-context change
**Status: Established**

Explore Structural History records each successful change to physical structural context caused by hierarchical, lateral, cross-connection, direct-jump, or Representative Member Context traversal. Canonical Structural Location remains entity-based; representative contexts are stored as explicitly typed exemplar history destinations under AGG-008 rather than being promoted to canonical entities.

Inspect/Preview changes, Selection changes, clearing Selection, highlighting, Detail open/close or local Detail interaction, Scenario changes, filters, and Lens changes do not create Explore Structural History entries.

The initial history is linear and does not require compression or deduplication. Version-1 presentation guidance is recorded under NAV-I01 and in the implementation companion; Application-level Back/Forward behavior remains defined separately in Section 6.

Example:

`System → Rack 4 → Server 2 → GPU 5 → NIC 1 → Switch 7`

A temporary Selection of GPU 3 while remaining structurally located at Server 2 does not appear in that history.

#### NAV-027 — Every Reference Configuration has a Default Scenario
**Status: Established**

Each Reference Configuration must define one valid Default Scenario.

#### NAV-028 — Switching configurations activates the destination Default Scenario
**Status: Established**

Whenever the active Reference Configuration changes, the destination configuration's Default Scenario is applied globally. A previously selected non-default scenario from another configuration is not automatically translated or restored.

#### NAV-029 — Scenario selection after configuration load
**Status: Established for initial scope**

After a configuration's Default Scenario is applied, the user may select another named Scenario available for that configuration. Arbitrary user modification of Scenario state is outside the initial scope and is reserved for a future bounded-editing capability.

#### NAV-030 — Functional lenses are outside the baseline orientation state
**Status: Established for initial scope**

Functional lenses are not required for the baseline Navigation/Orientation state. They are a deferred feature described below.

## 2.5 Navigation-history participation baseline

**Status: Established**

| Action | Create an Explore Structural History entry? |
|---|---:|
| Inspect / change Preview Target | No |
| Select object | No |
| Clear/change selection | No |
| Enter child | Yes |
| Move to parent | Yes |
| Move to peer | Yes |
| Follow cross-connection | Yes |
| Direct jump to another object | Yes |
| Change scenario | No |
| Highlight relationship | No |
| Open/close Detail or local information without moving | No |

## 2.6 Scenario behavior across configurations

**Status: Established**

Baseline transition:

`System A + selected Scenario A → switch configuration → System B + System B Default Scenario`

The destination Default Scenario is applied whenever the user switches Reference Configurations. Users may then select another named Scenario available for the destination configuration.

Remembering/restoring a previously selected non-default Scenario for each configuration is not part of the baseline behavior and may be considered later as a convenience feature.

## 2.7 Functional lenses

### NAV-F01 — Persistent functional lenses
**Status: Established future-feature direction; detailed behavior Deferred to Features**

A functional lens is an optional user-controlled emphasis over the existing physical Explore structure. Candidate lenses include:

- backend / accelerator networking;
- storage;
- power delivery;
- cooling;
- management;
- scale-up connectivity;
- scale-out connectivity.

The intended interaction is:

- users can toggle a lens on or off within the current local collection/context;
- once enabled, the lens **persists globally as the user navigates between locations and tiers**;
- the lens emphasizes relevant objects and relationships without changing canonical containment or physical identity;
- the lens does not change tier by itself;
- the lens does not silently navigate the user; and
- the lens remains distinct from Scenario Context.

Conceptual distinction:

> **Scenario = what is happening to/in the system.**  
> **Lens = which cross-cutting aspect of the system the user wants emphasized.**

Example state:

`System: A`  
`Location: Rack 4`  
`Scenario: Network bottleneck`  
`Lens: Backend Network`

The lens remains active if the user enters Server 2, follows NIC 1, or navigates to Switch 7, until explicitly disabled or changed.

### NAV-F01 deferred details

**Status: Deferred to Features**

- Whether multiple lenses may be active simultaneously.
- Whether lens state survives switching to a different reference configuration.
- Exact contextual controls and visualization behavior.

## 2.8 State-transition baseline

| User action | Location | Tier | Selection | Containment path | Scenario |
|---|---|---|---|---|---|
| **Inspect / Preview** | Preserve | Preserve | Preserve | Preserve | Preserve |
| **Select object** | Preserve | Preserve | Change | Preserve | Preserve |
| **Clear selection** | Preserve | Preserve | Clear | Preserve | Preserve |
| **Enter child** | Change | Move to destination tier | Clear | Update/extend | Preserve |
| **Move to parent** | Change | Move outward | Preserve if meaningful | Shorten/update | Preserve |
| **Move to peer** | Change | Usually preserve | Update/clear as appropriate | Replace terminal branch | Preserve |
| **Follow cross-connection** | Change to destination | Adapt to destination | Update/clear as appropriate | Reconstruct destination canonical path | Preserve |
| **Jump to known object** | Change | Adapt to destination | Update/clear as appropriate | Reconstruct canonical path | Preserve |
| **Change scenario** | Preserve | Preserve | Preserve | Preserve | Change |
| **Show/hide Detail** | Preserve | Preserve | Preserve | Preserve | Preserve |
| **Switch configuration** | Reset to destination's highest valid structural level | Highest valid tier (normally Tier 1) | Clear | Reset/rebuild from destination root | Apply destination default |

## 2.9 Navigation assumptions and constraints

| Item | Status |
|---|---|
| Current system, structural location, tier, selection, containment path, and scenario are the core orientation facts. | **Established** |
| Structural location, selection, and tier are distinct state variables even though tier follows location in the initial design. | **Established** |
| Explore Structural History and Containment Path are different data. | **Established** |
| Selection is optional and must not be required for orientation. | **Established** |
| Cross-connection traversal must preserve immediate origin enough to explain the jump. | **Established** |
| Scenario changes do not normally move the user. | **Established** |
| Configuration switching does not attempt speculative object/scenario equivalence. | **Established baseline** |
| Independent semantic zoom is deferred to Features. | **Deferred** |
| Persistent functional lenses are a desired future feature, not a baseline requirement. | **Deferred** |

## 2.10 Future considerations and implementation details

### NAV-I01 — Explore Structural History presentation
**Status: Established implementation guidance within Established semantics**

The semantics are established by NAV-026: every successful physical Structural Location change creates a linear Explore Structural History entry, while inspection/state changes do not. Version 1 retains the complete session-local linear structural history without semantic compression or deduplication. Canonical containment breadcrumbs remain the primary ancestry/navigation aid, while Application Back/Forward remains the chronological application-history control defined in Section 6.

The exact optional presentation of recent Explore locations remains a UI detail and must not create a second competing Back/Forward semantic. Current implementation guidance is recorded in `Delivery_Rendering_and_Platform_Implementation_Plan.md`.

## 2.11 Navigation summary invariant

**Status: Established**

> **The user should always know which Reference System and Reference Configuration they are in, where they are structurally, what Tier they are viewing, what they have selected, and which Scenario is active. When they move through a non-hierarchical relationship, they should additionally understand where they came from without confusing that traversal with the destination's canonical structure.**

---

# 3. Reference Systems and Configurations

## 3.1 Purpose and scope

**Status: Established**

Reference Systems provide the concrete architectural learning environments that instantiate the shared Explore and Navigation models. The library should help users understand how important AI infrastructure architectures work, why they matter, how they differ, and how they relate to one another.

The initial library should remain deliberately small and complementary. New systems should be added when they contribute meaningful educational or architectural coverage rather than simply because they are newer, famous, or commercially important.

Reference-System content is maintained as structured, validated configuration data rather than application-specific hard-coded architecture wherever practical. The current authored configuration corpus is broader than the initial implementation target so that later candidates can be researched, compared, and refined without changing initial product scope.

## 3.2 Core terminology

| Term | Status | Definition |
|---|---|---|
| **Reference System** | **Established** | The overarching named architectural reference used when discussing, grouping, comparing, or exploring an architecture as a whole. |
| **Reference Configuration** | **Established** | The specific setup/details through which a Reference System is represented, including its physical hierarchy, components, topology, cross-connections, and other setup-specific information. A system may eventually have multiple configurations. |
| **Configuration Status** | **Established** | Structured configuration classification using `baseline`, `alternative`, `historical`, or `emerging`. It describes the modeled configuration's role/state in the library and is distinct from the Reference System lifecycle label. |
| **Reference-System Library** | **Established** | The collection of Reference Systems available to users. The library is expected to grow and must not conceptually assume a fixed number of systems. |
| **Default Reference System** | **Established** | The Reference System loaded as the starting learning environment when Explore is entered without another deliberately established valid context. |
| **Default Scenario** | **Established** | A valid baseline scenario defined by every Reference Configuration and automatically applied whenever that configuration becomes active. |
| **Entity ID** | **Established** | A stable, configuration-local machine-readable identifier for a modeled entity. It identifies the entity within the current configuration and does not imply cross-configuration physical identity. |
| **Entity Type** | **Established** | The controlled structural/behavioral type of a modeled entity. `entity_type` answers what the entity is and is the metadata layer intended to govern applicable behavior and functionality. The canonical machine vocabulary is enforced by the Reference-System schema. |
| **Inventory Classification** | **Established** | The entity's mapping to the Organizational Content Inventory. It describes where the entity belongs in the project's organizational/documentation taxonomy and does not directly control behavior. |
| **Product Identity** | **Established** | Optional structured `product_identity` metadata for a real, identifiable product/component. It supports comparison, search, and shared explanatory context without creating shared physical identity. |
| **Representation State** | **Established** | How a configuration represents an entity, using the machine values `explicit`, `aggregate`, or `black_box`. |
| **Evidence State** | **Established** | The support level for modeled information, using `documented`, `inferred`, `simplified`, `unknown`, or `proprietary`. |
| **System Classification** | **Established** | Nonexclusive learning-oriented labels describing a system's role, such as **Archetypal**, **Representative**, **Specialized**, **Frontier / emerging**, or **Historical / transitional**. |
| **Lifecycle / Newness** | **Established** | System age is represented using both an objective introduction date/year and a qualitative lifecycle label: **Historical**, **Mature**, **Current**, **New**, or **Emerging**. |
| **Candidate Status** | **Established planning terminology** | Candidate research may use **Initial implementation**, **Worth considering later**, or **Reviewed but not currently recommended**. Authored Reference-System YAMLs contain only the first two scopes and use `planning_status: recommended_initial` or `planning_status: worth_considering_later`; reviewed-but-not-recommended candidates remain in research artifacts rather than the authored configuration bundle. Candidate Status describes project scope, not field importance. |
| **Black-Box Boundary** | **Established** | A representation used when a known component or subsystem is structurally important but its internal implementation is unknown, proprietary, or insufficiently documented. The boundary acknowledges unavailable internals rather than inventing them. |

### Terminology rule

**Status: Established**

**System** and **configuration** must not be used interchangeably in authoritative project documentation:

- use **Reference System** for the reference as a whole and for grouping/comparison among references;
- use **Reference Configuration** for the specific architectural setup/details of a system.

The entity metadata layers must also remain distinct:

`configuration-local entity ID → entity type / behavior → optional product identity → inventory classification / documentation`

These layers may describe the same object from different perspectives, but they do not substitute for one another.

## 3.3 Initial Reference-System baseline

**Status: Established baseline**

The initial implementation target is **five Reference Systems**:

| Reference System | Primary learning role |
|---|---|
| **NVIDIA DGX H100 SuperPOD** | Default mature server-centered GPU baseline; clearly exposes conventional intra-server scale-up and cluster scale-out. |
| **NVIDIA DGX GB300 NVL72 / SuperPOD** | Demonstrates the move toward dense rack-scale accelerator domains and newer AI-factory architecture. |
| **Google Cloud TPU7x (Ironwood) Pod / Superpod** | Provides a major custom-accelerator/pod architecture and prevents GPU systems from becoming synonymous with AI infrastructure. |
| **Cerebras CS-3 / Condor Galaxy 3** | Provides a strong wafer-scale architectural alternative with substantially different compute/memory organization. |
| **Meta 24K H100 RoCE Training Cluster** | Provides a documented production-scale deployment emphasizing Ethernet/RoCE, storage, reliability, and operational scale. |

**NVIDIA DGX H100 SuperPOD** is the established default starting Reference System. It is a **default learning system**, not a claim that it is the uniquely standard or preferred AI architecture.

Additional systems are evaluated case by case. Architectural diversity and collective educational coverage take priority over maximizing library size.

### Current authored configuration corpus

**Status: Established current data baseline**

The current reference-system source set contains **16 system YAML files and 18 Reference Configurations**. The five systems above remain the initial implementation target; the additional authored configurations support later expansion, architectural comparison, and continued content validation rather than changing that initial scope.

Current authored systems in **Worth Considering Later** scope are:

- AWS Trainium3 UltraServer / EC2 UltraCluster 3.0;
- AMD Helios rack-scale AI platform;
- Microsoft Azure Maia 200;
- Groq LPU rack / GroqCloud infrastructure;
- LLNL El Capitan;
- xAI Colossus 1;
- NVIDIA Vera Rubin NVL72 / Rubin POD;
- Google TPU 8t / TPU 8i family;
- AWS Trainium2 / Project Rainier;
- OCI GB200 / GB300 NVL72 Supercluster; and
- CoreWeave GB200 NVL72 cluster.

Google TPU 8t / 8i and OCI GB200 / GB300 each currently contain two configurations within one Reference System file; the remaining authored systems currently contain one configuration each.

The current configuration corpus uses the revised Organizational Content Inventory vocabulary, including the inventory additions introduced during configuration modeling. All current entity, connection, and concept-link mappings use canonical inventory category/item values; no current system YAML relies on an outstanding `proposed_addition` mapping.

The Organizational Content Inventory now also includes the emerging 800 VDC / high-voltage DC power-distribution concepts **High-voltage DC / 800 VDC distribution**, **Side power rack / power sidecar**, **Direct MVAC-to-HVDC conversion**, **DC busway / row-level DC distribution**, and **Facility-to-rack power-conversion topology**. These additions expand canonical project scope but do not require automatic changes to existing Reference Configurations. The current authored configurations retain their documented power architectures; an 800 VDC component or path should be instantiated only when configuration-specific sources establish that it is genuinely part of the modeled system.

The current schema baseline is **1.2.0**, and the full source set currently passes YAML parsing, JSON Schema validation, canonical-inventory checks, hierarchy/ID/reference checks, and the project's custom configuration validator.

## 3.4 Reference-System rules

#### REF-001 — Reference Systems instantiate Explore
**Status: Established**

The Explore hierarchy and Navigation rules are shared and architecture-independent. A Reference Configuration supplies the concrete physical objects, containment relationships, cross-connections, topology, available depth, and setup-specific context that instantiate those rules.

#### REF-002 — Systems must represent meaningful architectural approaches
**Status: Established**

A Reference System should not be added merely because it is famous, new, or associated with an important vendor. It should materially contribute to understanding at least one distinct architectural family, physical scale, important system relationship, scaling strategy, representative deployment model, historical transition, or other meaningful architectural idea.

#### REF-003 — Educational coverage takes priority over raw system count
**Status: Established**

The system library should be selected for complementary learning value. Systems that are individually important but highly redundant with existing references may be deferred or represented primarily through comparisons.

#### REF-004 — Initial library size is five systems
**Status: Established baseline**

The initial implementation target is the five systems listed in Section 3.3. The library is expected to expand later.

Authoring a configuration for a later candidate does **not** by itself promote that system into the initial implementation set.

#### REF-005 — Users are not required to choose a system before entering Explore
**Status: Established**

Explore should open directly into the default Reference System and its default scenario when no other valid context has been deliberately established. The active system must remain obvious and straightforward to change.

**Rationale:** Requiring first-time users to choose among unfamiliar architectures before exploration begins creates unnecessary learning and usability friction.

#### REF-006 — The default is a starting reference, not a universal canonical architecture
**Status: Established**

The default system must be framed as the default learning/starting reference. The project should make clear that modern AI infrastructure includes multiple important architectural families.

#### REF-007 — Every Reference Configuration defines one valid physical hierarchy
**Status: Established**

A configuration must provide enough structure to establish canonical homes and containment paths for its Explore objects. It may skip tiers, contain multiple physical nesting steps within one tier, and expose different depths in different branches, while still obeying the shared Explore rules.

#### REF-008 — Reference Configurations may differ structurally
**Status: Established**

The same component type does not need identical containment across configurations. A GPU may, for example, belong to a conventional server in one configuration and a different rack-scale tray/chassis organization in another.

Reference architectures must not be distorted merely to make different systems appear structurally uniform.

#### REF-009 — Material physical changes are configuration/system changes, not scenario changes
**Status: Established**

Scenarios may change workload, operating state, utilization, traffic, health, bottlenecks, and emphasis. If the underlying physical architecture changes materially, the difference should normally be represented as another Reference Configuration or Reference System.

#### REF-010 — Every Reference Configuration has a Default Scenario
**Status: Established**

Each Reference Configuration must define one valid Default Scenario.

#### REF-011 — Switching systems/configurations applies the destination Default Scenario
**Status: Established**

Whenever the active Reference System or Reference Configuration changes, the destination configuration's Default Scenario is applied globally. A previously selected non-default Scenario is not translated or automatically restored in the baseline design.

Users may select another named Scenario available for the new configuration after it loads.

#### REF-012 — Cross-system object equivalence must not be inferred
**Status: Established**

Similarly named or similarly positioned objects in different configurations are not assumed to be equivalent. Object-specific structural or selection state may only be mapped across configurations if an explicit equivalence is deliberately defined later.

#### REF-013 — Educational simplification is allowed, but unsupported physical detail must not be invented
**Status: Established**

A Reference Configuration may omit or simplify information that does not materially aid the project's educational goals, provided important physical relationships are not knowingly misrepresented.

Facts, reasonable inferences, and educational simplifications should be evaluated case by case during content development rather than through a single universal rule.

#### REF-014 — Unknown or proprietary internals create boundaries rather than invented certainty
**Status: Established**

When important internal details are unavailable:

1. omit the detail if it is unnecessary to understanding the architecture; or
2. use a clear **black-box boundary** if the component/subsystem is structurally important or the hierarchy continues below/through it.

When a black box is shown, briefly explain to the user that the underlying details are unavailable, proprietary, or insufficiently documented.

The distinction between documented fact, inference, and simplification does **not** need to be continuously exposed to the user unless uncertainty materially affects interpretation.

#### REF-015 — Documentation quality affects implementation suitability
**Status: Established**

A system may be architecturally important yet unsuitable for detailed implementation if reliable public information is insufficient to construct a trustworthy model. Documentation confidence therefore remains an explicit candidate-evaluation criterion.

#### REF-016 — Comparability must not force structural uniformity
**Status: Established**

Reference Systems should use the shared Explore terminology and conceptual model where appropriate, but comparisons should preserve meaningful architectural differences rather than normalize them away.

#### REF-017 — Reference-System extensibility is an implementation requirement
**Status: Established future implementation requirement**

The Implementation design should make Reference Systems and Configurations modular and straightforward to add, update, replace, or remove without requiring redesign of the fundamental Explore or Navigation model wherever practical.

The conceptual design must not assume a fixed or hard-coded system library.

#### REF-018 — New-system selection optimizes collective coverage
**Status: Established**

When evaluating a candidate, the project should ask both:

> **Is this system valuable?**

and:

> **What does it teach that the existing library does not?**

New architectural families, physical scales, relationships, representative deployments, and historically important transitions are stronger reasons for inclusion than novelty alone.

#### REF-019 — Provenance distinctions primarily guide development and validation
**Status: Established**

The difference between directly documented facts, reasonable inference, and educational simplification should generally remain an internal content-development concern. It should be surfaced to users only when doing so is necessary to avoid a misleading interpretation.

#### REF-020 — Historical systems may be full Reference Systems
**Status: Established**

Historical and transitional systems are eligible for full Reference-System treatment when they materially help explain architectural evolution, the origin of modern structures, changes in scaling models, or important superseded technologies.

Age alone is not a reason to exclude a system.

#### REF-021 — Switching systems/configurations resets structural location
**Status: Established**

When the user switches to another Reference System or Reference Configuration:

1. the destination becomes active;
2. the destination configuration's Default Scenario is applied;
3. Explore returns to the destination's **highest valid structural level** (normally its Tier-1 / whole-system view);
4. incompatible selection is cleared; and
5. subsequent navigation uses the destination's canonical containment structure.

The tool does not attempt to preserve location by guessing cross-system equivalence.

#### REF-022 — Entity type governs structural/functional behavior
**Status: Established**

`entity_type` defines what a modeled component is and is the metadata layer intended to determine which structural behaviors, selection/detail behaviors, rendering rules, scenario capabilities, property expectations, and other functionality may apply.

Inventory classification must not be used as a substitute for entity type or as the primary behavior switch.

#### REF-023 — Inventory classification is organizational metadata
**Status: Established**

The `inventory` mapping identifies a modeled entity, connection, or concept link within the Organizational Content Inventory. Its purposes include content organization, coverage auditing, terminology consistency, and traceability to project scope.

Inventory classification does **not** directly control application behavior.

Current mappings using `status: existing` must match a canonical inventory category/item. `status: proposed_addition` is reserved only for a genuine future modeling gap that is not already represented in the current inventory.

#### REF-024 — Product identity is optional cross-configuration metadata, not physical identity
**Status: Established**

An entity may include `product_identity` when it represents an identifiable real product/component and the metadata materially aids comparison, search, reuse, or explanation across Reference Configurations.

The approved product-identity subfields are:

- `manufacturer`;
- `product_family`;
- `model`;
- `variant`;
- `generation`;
- `architecture`; and
- `codename`.

When `product_identity` is present, `manufacturer` and at least one additional useful qualifier are required by the current schema.

Product identity does not make two configuration-local entities the same physical object and does not authorize automatic transfer of navigation, selection, or scenario state across systems.

#### REF-025 — Product identity must be conservative and nonredundant
**Status: Established**

Only product-identity fields that are relevant, source-supported, and nonredundant should be populated.

Unsupported or ambiguous qualifiers must be omitted rather than represented with placeholders such as `unknown`, `N/A`, `TBD`, or `proprietary`.

A heterogeneous aggregate containing multiple product models should normally **not** receive one singular `product_identity` block unless a valid product identity exists for the aggregate itself.

#### REF-026 — Physical/entity identity remains configuration-local
**Status: Established**

Stable entity IDs identify the modeled entity inside its Reference Configuration. Cross-configuration similarity is expressed through explicit metadata such as `entity_type`, `product_identity`, inventory classification, and Concept links rather than by reusing physical identity.

This preserves the distinction among:

- **which modeled entity this is**;
- **what kind of entity it is**;
- **which real product/family it represents, when known**; and
- **where it belongs in the project's organizational taxonomy**.

#### REF-027 — Aggregate and component-count semantics must be distinguished
**Status: Established conceptual rule**

Counts associated with repeated or aggregated entities must be interpreted according to their evidence and modeling basis. At minimum, planning distinguishes:

1. **documented fixed count** — the count is established for the modeled configuration;
2. **documented deployment-dependent count** — the architecture supports a known variable population;
3. **representative / educational count** — a deliberately chosen population is used to make scale tangible without claiming universal deployment size; and
4. **unknown count** — available evidence is insufficient to support a concrete population.

These cases must not be presented as equivalent.

#### REF-028 — Representative counts are permitted when they aid spatial learning and are supportable
**Status: Established**

When a system is scalable or deployment-variable, a Reference Configuration may choose a representative component count for visualization if that count is supported by the architecture or a defensible reference configuration and materially improves spatial understanding.

The accompanying explanation must make clear that actual deployment counts may vary.

Where a count is genuinely unknown or inadequately documented, the configuration must retain an aggregate, simplified, or black-box representation rather than invent a representative population.

#### REF-029 — Representation and evidence state are separate dimensions
**Status: Established**

Configuration entities use one representation state—`explicit`, `aggregate`, or `black_box`—and one evidence state—`documented`, `inferred`, `simplified`, `unknown`, or `proprietary`.

Representation answers **how the architecture is modeled**; evidence answers **how strongly the modeled information is supported**. One must not be inferred automatically from the other.

#### REF-030 — Canonical configuration authoring model is YAML plus JSON Schema validation
**Status: Established current data-contract baseline**

Reference-System source files are authored as YAML 1.2-compatible, JSON-like data using a deliberately restricted style. The current structural contract is JSON Schema Draft 2020-12, schema version **1.2.0**.

The baseline data model uses:

- stable slug-like IDs;
- a controlled `entity_type` vocabulary;
- nested physical hierarchy under `hierarchy.root`;
- typed cross-connections using the canonical seven relationship identifiers and entity-ID references;
- configuration-defined default scenarios;
- evidence and representation metadata;
- Organizational Content Inventory mappings; and
- optional `product_identity` metadata.

Runtime representation remains an Implementation concern and does not need to remain YAML.

#### REF-031 — Every authored configuration must pass structural and cross-file validation
**Status: Established**

A configuration is not considered ready merely because the YAML parses. Validation should include, where applicable:

- YAML syntax;
- JSON Schema compliance;
- stable-ID uniqueness;
- source-reference integrity;
- connection endpoint integrity;
- functional-group and Concept-link references;
- hierarchy/tier consistency;
- Organizational Content Inventory category/item conformance; and
- product-identity constraints.

The validator should read the living Organizational Content Inventory rather than duplicating its vocabulary as a second hard-coded taxonomy inside the schema.

#### REF-032 — Current configuration artifacts remain educational models, not exhaustive deployment specifications
**Status: Established**

The authored YAML corpus captures stable physical organization and educationally important relationships. It may deliberately aggregate, simplify, black-box, or omit deployment-specific detail that is unnecessary, proprietary, ambiguous, or insufficiently documented.

Passing validation means the configuration is structurally and internally consistent with the current data contract; it does not imply that every possible physical component or deployment-specific detail has been modeled.

#### REF-033 — Inventory expansion does not force configuration retrofit
**Status: Established**

Adding a concept or component to the Organizational Content Inventory expands the project's canonical content scope; it does **not** make that item mandatory in every Reference Configuration.

Existing or future configurations should incorporate a newly available inventory item only when it is genuinely relevant to that system, sufficiently supported, and useful to the educational model. Otherwise the configuration should preserve its existing architecture rather than being retrofitted to satisfy the inventory as a checklist.

The emerging 800 VDC / high-voltage DC power-distribution concepts are the current example of this rule: they are now valid canonical inventory targets, but no existing configuration should acquire an 800 VDC power path without configuration-specific evidence that the modeled architecture actually uses one.

#### REF-034 — Configuration count is determined case by case
**Status: Established**

Every Reference System represented in the library has at least one Reference Configuration, but there is no global target or maximum number of configurations per system. Additional configurations are authored only when they represent materially useful setup variants that cannot be explained adequately through Scenario state or comparison metadata.

#### REF-035 — `entity_type` uses a controlled extensible vocabulary
**Status: Established**

Reference-System schema version 1.2.0 defines the canonical `entity_type` identifiers used by the current corpus. Existing distinctions such as `rack`, `rack_scale_system`, `rack_group`, and `rack_topology_domain` are intentional and describe different structural roles rather than synonyms. Generic `*_group` values identify structural aggregates when a more specific enclosure type is not justified.

Adding a new `entity_type` requires an explicit schema/taxonomy revision and a defined application capability profile; inventory additions alone do not create behavior types. Multiple entity types may share one implementation capability profile when their interaction/rendering behavior is the same.

## 3.5 Learning and comparison metadata

**Status: Established baseline**

Before detailed configuration research, candidate Reference Systems should maintain the following learning-oriented record where practical:

| Property | Purpose / representation |
|---|---|
| **System name** | Canonical Reference System identifier. |
| **Brief explanation** | What the system is and what distinguishes it. |
| **When / where used** | Typical environments, organizations, or deployment situations. |
| **Primary workloads** | Training, inference, hybrid, HPC/AI, etc. |
| **Typical physical scale** | Categorical range such as single-node, multi-node, rack-scale, cluster-scale, data-center-scale, or multi-site/regional. |
| **Scale-up / scale-out character** | **Scale-up**, **Scale-out**, or **Hybrid**. |
| **Introduction date/year** | Objective age/newness indicator. |
| **Lifecycle label** | **Historical**, **Mature**, **Current**, **New**, or **Emerging**. |
| **Importance** | 1–5 significance to the field. |
| **Commonality** | 1–5 frequency within the system's applicable architectural class. |
| **Learning value** | 1–5 educational usefulness for this project. |
| **Architectural distinctiveness** | 1–5 amount of genuinely new architectural coverage relative to the current library. |
| **Documentation confidence** | 1–5 confidence that a trustworthy configuration can be constructed from reliable information. |
| **Major concepts demonstrated** | Important project concepts particularly visible in the system. |
| **System classification** | Archetypal, Representative, Specialized, Frontier/emerging, Historical/transitional; labels may be nonexclusive. |
| **Relationship to other systems** | Successor, predecessor, alternative, contrast, similar family, etc. |
| **Key reason to include** | Concise educational justification. |
| **Candidate status** | Initial implementation, Worth considering later, or Reviewed but not currently recommended. |
| **Rating notes / supporting sources** | Brief rationale and evidence for factual claims and judgment-heavy ratings. |

### Rating scales

**Status: Established baseline**

All scored criteria use **1–5**, but each scale retains its own meaning.

| Score | Importance | Commonality | Learning value | Architectural distinctiveness | Documentation confidence |
|---:|---|---|---|---|---|
| **1** | Peripheral | Rare | Low | Highly redundant | Largely undocumented / speculative |
| **2** | Specialized | Limited | Limited | Mostly familiar | Fragmentary |
| **3** | Significant | Moderate | Good | Meaningfully different | Sufficient for plausible high-level modeling |
| **4** | Major | Common | High | Distinctive | Strong documentation |
| **5** | Foundational / defining | Pervasive within applicable class | Exceptional | Unique / archetypal | Exceptionally well documented for project needs |

Ratings are comparison aids, not an automatic inclusion formula.

### Component identity and classification metadata

**Status: Established**

Component-level comparison should preserve the following distinct metadata layers where applicable:

| Metadata | Purpose |
|---|---|
| **Entity ID** | Identifies the modeled entity within its Reference Configuration. |
| **Entity type** | Defines the entity's structural/behavioral kind and is the intended basis for applicable functionality. |
| **Product identity** | Optionally identifies a real manufacturer/product family/model/variant/generation/architecture/codename when supported and useful. |
| **Inventory classification** | Maps the object into the Organizational Content Inventory for documentation, coverage, and taxonomy purposes. |
| **Concept links** | Connect the physical entity to abstract mechanisms, principles, protocols, or learning topics. |
| **Evidence / representation state** | Records how confidently the information is supported and how literally or abstractly the object is modeled. |

These layers allow the project to express, for example, that two entities in different configurations are both GPUs, may even represent the same GPU model, and may link to the same Concepts, while still remaining different configuration-local modeled entities.

## 3.6 Initial content-depth policy

**Status: Established**

The Organizational Content Inventory guides scope, terminology, and coverage analysis; it is not a checklist requiring each category to appear physically in every Reference Configuration. Content depth is determined by architectural learning value, spatial relevance, available evidence, and the approved learning role of the Reference System.

### Definitions

| Term | Status | Definition |
|---|---|---|
| **Content Depth** | **Established** | The physical and explanatory level to which a Reference Configuration models a branch of the architecture. |
| **Core Architectural Coverage** | **Established** | The minimum physical structures and relationships needed to understand the Reference System's approved learning role. |
| **Architecture-Defining Item** | **Established** | An inventory item whose presence, arrangement, relationship, or absence materially distinguishes the system or supports a Primary Learning Claim. |
| **Supporting Physical Item** | **Established** | A real physical element that helps explain an Architecture-Defining Item but is not itself central. |
| **Concepts-Only Treatment** | **Established** | Coverage through the global Concept Library without creating an independent physical Explore entity for that configuration. |
| **Black-Box Treatment** | **Established** | Physical representation of a known important boundary while intentionally withholding unsupported internal detail under REF-014. |
| **Intentional Omission** | **Established** | Deliberate exclusion because material is outside scope, low educational value, insufficiently evidenced, or unnecessarily duplicative. |
| **Depth Stop Condition** | **Established** | The point beyond which additional physical decomposition would not materially improve understanding of the architecture's approved learning goals. |
| **Learning Completeness** | **Established** | Whether the system's important architectural relationships can be understood accurately, regardless of raw object count or deepest Tier reached. |
| **Core Release Boundary** | **Established** | The approved initial content-depth boundary beyond which valid additional content is treated as later expansion rather than a release prerequisite. |

### Content-depth rules

#### DEP-001 — No inventory category is universally mandatory as physical content
**Status: Established**

No Organizational Content Inventory category is required to appear as physical content in every Reference Configuration. Applicability and depth are system-specific.

**Rationale:** The inventory organizes total project scope rather than defining a universal bill of materials.

#### DEP-002 — Every configuration covers its architecture-defining physical backbone
**Status: Established**

Each Reference Configuration must physically represent enough of the following, where applicable, to explain its architecture accurately:

- overall deployment/system grouping;
- compute/accelerator organization;
- relevant host/assembly organization;
- architecture-defining memory structures;
- principal local/scale-up connectivity;
- principal scale-out/network connectivity;
- defining topology/relationships;
- materially important data paths; and
- distinctive support infrastructure when its physical arrangement changes the architecture.

**Rationale:** These are the structures that make Explore useful as a spatial learning environment.

#### DEP-003 — Applicability is determined by the Reference System's learning role
**Status: Established**

A subsystem becomes required for a configuration when omitting it would prevent or materially distort one of that system's approved Primary Learning Claims. Inventory presence alone does not make it required.

**Rationale:** The same technical area may be central in one system and incidental in another.

#### DEP-004 — Physical representation requires spatial or structural educational value
**Status: Established**

Prefer physical Explore representation when one or more of the following materially aids understanding:

- location;
- containment;
- constituent structure;
- physical connectivity;
- repeated population/count;
- topology;
- relationship to scale;
- failure/operating state tied to a physical object; or
- a physical distinction central to the architecture.

**Rationale:** Explore is a physical/spatial learning environment rather than an illustrated encyclopedia.

#### DEP-005 — Abstract behavior belongs primarily in Concepts
**Status: Established**

Use Concepts-only treatment when the important learning question is principally how a protocol, topology behavior, algorithm, software abstraction, metric, or principle works and a dedicated physical object would not improve spatial understanding.

**Rationale:** This preserves EXP-034 and avoids using Tier 5 as a home for nonphysical technical depth.

#### DEP-006 — Physical embodiment may coexist with Concepts content
**Status: Established**

When a technology both physically exists in the architecture and benefits from general explanation, model its physical occurrence in Explore and its reusable explanation in Concepts.

**Rationale:** Physical occurrence and explanatory knowledge have different ownership roles.

#### DEP-007 — Use black boxes when the boundary matters more than unsupported internals
**Status: Established**

Apply REF-014 when a subsystem definitely exists, its placement/relationship is important, and its internal structure is unknown, proprietary, deployment-variable, or inadequately documented.

**Rationale:** A truthful physical boundary is preferable to invention or disappearance.

#### DEP-008 — Omit items that add neither meaningful structure nor a useful boundary
**Status: Established**

Intentional Omission is appropriate for items that are irrelevant to the learning role, generic infrastructure with no architectural distinction, outside the established project boundary, redundant with a sufficient higher-level representation, or too poorly documented to represent meaningfully when the boundary itself is not important.

**Rationale:** More modeled objects do not automatically create more understanding.

#### DEP-009 — Absence from configuration data means “not modeled,” not “not present”
**Status: Established**

A Reference Configuration must not imply that a system lacks an item solely because that item has no YAML entity. Actual architectural absence requires an explicit, supportable claim when the distinction matters.

**Rationale:** Reference Configurations are intentionally nonexhaustive educational models.

#### DEP-010 — Initial systems need comparable Learning Completeness, not comparable physical depth
**Status: Established**

Systems do not need equal entity counts, branch counts, deepest Tiers, Concept-link counts, or physical decomposition. Unequal depth is correct when it reflects architecture and evidence honestly.

**Rationale:** Visual uniformity must not override architectural fidelity.

#### DEP-011 — Evidence determines allowable physical depth
**Status: Established**

Model deeper only while evidence is adequate for the intended claim. When support stops, stop decomposition, aggregate, use a black box, or omit rather than extrapolating from another system.

**Rationale:** Documentation asymmetry is not permission to invent symmetry.

#### DEP-012 — Lack of evidence cannot erase a required Primary Learning Claim
**Status: Established**

If insufficient documentation prevents an architecture-defining feature from being represented accurately, the result is a readiness blocker rather than deeper unsupported inference.

**Rationale:** Primary learning goals establish a hard fidelity floor.

#### DEP-013 — Tier 5 is selective rather than expected
**Status: Established**

Use Tier 5 only where internal physical structure materially explains an important or differentiating architectural idea and is sufficiently supportable. Do not add Tier 5 solely for apparent completeness.

**Rationale:** Technical depth and educational importance are not equivalent.

#### DEP-014 — Repeated structures follow the established aggregation model
**Status: Established**

Depth into repeated populations follows Section 1.5 and depends on homogeneity, evidence, architectural importance, and educational usefulness. Repeated structures use aggregate-only, representative-member, or addressable-members semantics rather than automatic full materialization.

**Rationale:** Large documented populations do not imply equal numbers of independently modeled entities.

#### DEP-015 — Large populations do not force shallow explanatory depth
**Status: Established**

An aggregate may expose deep representative structure even when its members are not individually materialized.

**Rationale:** Aggregation controls repetition, not the amount of supportable explanation.

#### DEP-016 — Management infrastructure is modeled only to architectural relevance
**Status: Established**

Model dedicated management nodes, networks, or control relationships physically when they materially aid understanding. Otherwise keep management at a shallow aggregate level, cover it conceptually, or omit it physically.

**Rationale:** Management exists widely but is not equally important to every Reference System's learning role.

#### DEP-017 — Software normally remains Concepts/context rather than physical hierarchy
**Status: Established**

Operating systems, frameworks, communication libraries, schedulers, runtimes, and orchestration generally belong in Concepts or explanatory/detail context. They enter Explore only through architecture-defining physical nodes, deployment/resource relationships, or other concrete structural effects.

**Rationale:** Software execution is not physical containment in the same sense as hardware composition.

#### DEP-018 — Facility infrastructure is selective
**Status: Established**

Generic grid, UPS, busway, chiller, and similar facility detail is not mandatory. Model facility power/cooling physically when it is architecture-defining, materially controls rack organization, changes the facility-to-rack topology, or is required by a Scenario that depends on a physical support path.

**Rationale:** Support infrastructure becomes central only when it changes the architecture being taught.

#### DEP-019 — Storage may remain high-level when deployment-specific
**Status: Established**

When storage is required to understand a system but its vendor/topology details vary, represent the storage subsystem or important data path at an appropriate aggregate/black-box level rather than inventing one canonical implementation or removing storage entirely.

**Rationale:** Role and topology certainty may differ even when storage remains educationally relevant.

#### DEP-020 — Operational behavior belongs primarily in Scenarios
**Status: Established**

Failures, bottlenecks, utilization, dynamic routing, workload placement, and other operating conditions should not normally increase static configuration depth. Model the physical structure in Explore and its changing operating state through Scenario Context.

**Rationale:** This preserves the Configuration/Scenario ownership boundary.

#### DEP-021 — Optional subsystem support does not create initial depth obligations
**Status: Established**

A configuration need not instantiate every supported optional storage system, fabric, DPU, management component, or other variant. Options may be represented through a coherent aggregate choice, another Reference Configuration when physically material, or explanatory metadata.

**Rationale:** Reference Configurations represent coherent learning setups rather than every possible SKU/deployment permutation.

#### DEP-022 — Material simplification and omission use existing fidelity mechanisms
**Status: Established**

Record material scope limitations through existing mechanisms such as `scope_notes`, `modeling_notes`, `unknowns`, Evidence State, and Black-Box Representation State. Do not create placeholder omitted entities merely to prove that every inventory item was considered.

**Rationale:** A per-item omission matrix would recreate the inventory-as-checklist model already rejected.

#### DEP-023 — Material omissions are visible when they could change interpretation
**Status: Established**

When a learner could reasonably mistake “not modeled” for “does not exist,” relevant system/detail content should communicate the limitation.

**Rationale:** Nonexhaustive models should not imply false completeness.

#### DEP-024 — Minor omissions need no user-facing disclaimer
**Status: Established**

Do not clutter the learning interface with warnings for every unmodeled fan, connector, firmware revision, or generic facility component. Only omissions material to architectural interpretation require prominent disclosure.

**Rationale:** Transparency should remain proportional to educational significance.

#### DEP-025 — The initial release has an explicit Core Release Boundary
**Status: Established**

The initial physical content boundary is:

> **Model the architecture-defining physical path from deployment/grouping through compute/accelerator assemblies, relevant memory, principal local/scale-up and scale-out connectivity/topology, and any support infrastructure whose physical arrangement materially affects the architecture. Use Tier 5 selectively for differentiating internals. Keep general software, algorithms, protocols, metrics, and operational behavior primarily in Concepts or Scenarios.**

Existing limits remain in force: transistor-level logic is outside the core scope; security remains shallow; exhaustive inventory and Concept-Library coverage are not initial requirements.

**Rationale:** A defined release boundary prevents the core product from expanding indefinitely.

#### DEP-026 — Content beyond the Core Release Boundary is an enhancement unless it closes a blocker
**Status: Established**

Once a system satisfies its approved learning claims and readiness criteria, further legitimate depth may be deferred unless it resolves a known readiness blocker.

**Rationale:** The project needs a principled stopping rule for “one more detail” expansion.

#### DEP-027 — Content-depth policy and Reference-System readiness are complementary
**Status: Established**

Content depth answers **what should be modeled**; readiness answers **whether that selected scope has been modeled well enough to ship**. A configuration may be intentionally shallow in one branch and still be ready when that branch is outside its learning requirements.

**Rationale:** “Ready” must not drift toward “exhaustive.”

#### DEP-028 — Content depth is reevaluated when a Primary Learning Claim changes
**Status: Established**

Adding or materially changing a Reference System's learning purpose may make previously optional content required.

**Rationale:** Content relevance follows educational intent rather than being permanently attached to an inventory category.

### Practical per-item inclusion test

**Status: Established authoring policy**

For each candidate inventory item in a Reference Configuration:

1. **Relevant to this system?** If no, omit it.
2. **Architecture-defining or required for a Primary Learning Claim?** If yes, provide sufficient treatment to support that claim.
3. **Does physical location, containment, count, connectivity, topology, or physical failure state materially aid understanding?** If yes, prefer Explore representation.
4. **Is the important subject mainly an abstract mechanism, protocol, algorithm, software abstraction, metric, or principle?** If yes, prefer Concepts-only unless a physical occurrence also matters.
5. **Does the physical boundary matter while internals are insufficiently known?** If yes, use a black box.
6. **Is the structure repeated?** If yes, apply Section 1.5 expansion semantics.
7. **Is evidence adequate for the proposed depth?** If no, stop higher, aggregate, black-box, or omit; if this destroys a Primary Learning Claim, mark a readiness blocker.
8. **Would another deeper layer materially improve understanding?** If no, the Depth Stop Condition has been reached.

| Relevance / evidence condition | Default treatment |
|---|---|
| Central + well documented + spatially meaningful | Explicit or aggregate physical Explore representation |
| Central + repeated/homogeneous | Aggregate with representative expansion as appropriate |
| Central boundary + weak/proprietary internals | Black box |
| Abstract/general mechanism | Concepts-only, optionally linked to a physical occurrence |
| Dynamic operating condition | Scenario |
| Real but incidental/generic | Shallow aggregate or Intentional Omission |
| Poor evidence + nonessential | Intentional Omission |
| Poor evidence + essential to Primary Learning Claim | Readiness blocker |
| Outside Core Release Boundary | Omit/defer |
| Added only for cross-system visual symmetry | Do not model |

### Content-depth assumptions

**Status: Established**

- The Organizational Content Inventory remains broader than any one Reference Configuration.
- Physical modeling is driven by learning value and spatial relevance rather than inventory coverage percentage.
- Unequal physical depth among systems is desirable when it reflects architecture and evidence honestly.
- Concepts and Scenarios absorb much of the nonphysical depth that would otherwise overload Explore.
- Intentional omissions are expected and legitimate.
- The initial five systems should reach comparable **Learning Completeness**, not structural uniformity.
- Reference-System readiness criteria determine when an omission becomes too important to remain nonblocking.

No foundational content-depth decision remains unresolved; system-by-system audits may still reveal research or readiness blockers.

## 3.7 Shared and reusable architecture semantics

**Status: Established**

Shared architecture is represented through reusable **definitions, family/variant lineage, Product Identity, and global Concepts**, not by sharing physical entity identity across Reference Configurations. Reuse is an authoring and comparison mechanism; Explore continues to consume system-specific configuration-local realizations.

### Definitions

| Term | Status | Definition |
|---|---|---|
| **Shared Definition** | **Established** | A globally identified, non-instance record containing reusable facts intended to be common across multiple realizations. |
| **Reusable Architecture Definition** | **Established** | A Shared Definition describing a structural platform, assembly, topology building block, or other reusable physical architecture. It is a blueprint/reference, not a deployed physical object. |
| **Architecture Family** | **Established** | A stable grouping of related architecture definitions or realizations that share meaningful design lineage without asserting exact structural identity. |
| **Architecture Variant** | **Established** | A separately identified reusable definition that differs materially from another definition while remaining part of the same Architecture Family. |
| **System-Specific Realization** | **Established** | A configuration-local physical implementation of a Reusable Architecture Definition or Architecture Family, with its own entity IDs, evidence, counts, connections, and system-specific differences. |
| **Realization Parameter** | **Established** | A bounded local value such as population, optional component, or supported sizing choice that does not change reusable-definition identity. |
| **Realization Delta / Override** | **Established** | An explicit system-specific departure from a Shared Definition, retained with provenance rather than hidden in inheritance. |
| **Resolved Configuration Graph** | **Established** | The complete configuration-local hierarchy and relationship graph after any reuse/composition mechanism has been applied. Explore consumes this resolved graph. |
| **Individual Instance** | **Established** | A configuration-local modeled physical entity. Individual Instances are never globally shared merely because they derive from the same definition. |

### Shared-architecture rules

#### SHR-001 — Physical entities are never shared across Reference Configurations
**Status: Established**

Even when two configurations use the same hardware product, platform, rack pattern, switch family, or architecture, each contains separate configuration-local physical entity identity.

**Rationale:** Different realizations may have different containment, connections, Scenarios, evidence, or surrounding architecture.

#### SHR-002 — Global identity is reserved for reusable definitions, not physical instances
**Status: Established**

Configurations may reference the same global Concept ID, Reusable Architecture Definition ID/version, Architecture Family, or Product Identity. They do not share configuration-local entity IDs.

**Rationale:** This represents genuine commonality without false physical equivalence.

#### SHR-003 — Product Identity remains the preferred mechanism for shared product/model identity
**Status: Established**

When separate configuration-local entities represent the same supported product family/model, use compatible `product_identity` metadata rather than creating a globally shared physical component entity.

**Rationale:** The existing Product Identity layer already separates product commonality from physical identity.

#### SHR-004 — Reusable Architecture Definitions are for structural reuse beyond one product
**Status: Established**

Introduce a reusable physical definition only when multiple configurations genuinely share a meaningful sourced structural pattern such as a rack-scale platform, tray arrangement, repeatable node architecture, interconnect building block, or similar reusable assembly.

Generic ideas such as Clos or scale-up remain Concepts rather than reusable physical definitions.

**Rationale:** Architecture definitions and explanatory Concepts have different ownership.

#### SHR-005 — Architecture Family does not imply exact conformance
**Status: Established**

Two systems may belong to the same Architecture Family while differing in generation, population, surrounding networks/storage, operator integration, or other physical details.

**Rationale:** Family membership means meaningful lineage, not interchangeability.

#### SHR-006 — Reuse one definition/version only when architecture-defining structure remains valid
**Status: Established**

Two realizations may reference the same reusable definition/version when their shared architecture-defining structure is genuinely invariant enough. Differences limited to sizing, labels, bounded supported parameters, optional nondefining peripherals, or operator metadata may remain local realization parameters.

Differences that alter containment, architecture-defining entity types, principal scale-up topology, principal connection pattern, defining product generation, or another major structural invariant require a separate Architecture Variant or definition.

**Rationale:** Reuse should expose commonality rather than hide architectural differences behind overrides.

#### SHR-007 — Prefer composition over inheritance
**Status: Established**

Reference Configurations should conceptually compose reusable architecture definitions rather than inherit from complete Reference Configurations.

Prefer:

`OCI configuration = NVL72 definition + OCI-specific network/storage/support realization`

rather than:

`OCI configuration extends NVIDIA configuration extends base NVL72 configuration`.

**Rationale:** Composition preserves provenance and avoids implying that one real-world system is a subclass of another.

#### SHR-008 — Reference Configurations never inherit from other Reference Configurations
**Status: Established**

A complete Reference Configuration is a concrete learning environment, not a reusable parent class. Reuse occurs through lower-level Shared Definitions.

**Rationale:** System-specific architectures should remain independently coherent and auditable.

#### SHR-009 — Multiple reusable definitions may be composed
**Status: Established**

A configuration may combine reusable compute/rack, networking, power/cooling, or other structural definitions while adding configuration-local relationships and components. No multiple-inheritance semantics are required.

**Rationale:** Real infrastructure is subsystem composition rather than one inheritance tree.

#### SHR-010 — System-specific differences remain explicit
**Status: Established**

A resolved configuration must make clear what came from a shared definition, which Realization Parameters were selected, which local components/connections were added, which shared facts were replaced, and why material differences exist.

**Rationale:** Architectural differences are part of the educational value and must remain auditable.

#### SHR-011 — Material recurring overrides become Architecture Variants
**Status: Established**

If several realizations repeatedly override the same architecture-defining part of a definition, create a separate Architecture Variant instead of accumulating complex override chains.

**Rationale:** Repeated exception patterns indicate that the shared definition is too broad.

#### SHR-012 — Reuse does not alter configuration-local containment
**Status: Established**

After resolution, every physical entity still has one canonical home, one configuration-local identity, normal Tier semantics, and normal Cross-Connections. Shared-definition lineage is metadata/provenance rather than another containment parent.

**Rationale:** Explore navigates the realized system rather than its authoring template hierarchy.

#### SHR-013 — Shared definitions and realizations have separate provenance
**Status: Established**

A Reusable Architecture Definition has sources/evidence for its shared claims. A System-Specific Realization separately sources local populations, topology, optional components, operator/vendor changes, and Realization Deltas.

**Rationale:** A platform source does not automatically prove deployment-specific facts.

#### SHR-014 — Local evidence overrides shared defaults only explicitly
**Status: Established**

A realization may override a shared fact only through an explicit, provenance-bearing delta. Architecture-defining deltas trigger reconsideration under SHR-006 and SHR-011.

**Rationale:** Silent overrides make resolved architecture difficult to audit and compare.

#### SHR-015 — Reusable definitions are versioned and configurations pin exact versions
**Status: Established**

Each Reusable Architecture Definition has a stable definition ID and explicit version/revision. A Reference Configuration references an exact version; later definition updates do not silently change already validated configurations.

**Rationale:** Reuse must preserve reproducibility as common platforms evolve.

#### SHR-016 — Shared lineage never authorizes navigation-state transfer
**Status: Established**

Architecture Family, definition identity, or Product Identity does not authorize transfer of Selection, Structural Location, Scenario state, or Return Context across Reference Configurations. Existing configuration-switch behavior remains authoritative.

**Rationale:** Shared derivation is not shared physical identity.

#### SHR-017 — Explore shows realizations, not reusable definitions
**Status: Established**

Normal Explore containment displays the system-specific physical realization. Detail/comparison surfaces may expose lineage metadata such as a shared platform family, but reusable definitions do not become fake physical ancestors.

**Rationale:** Explore remains concrete and spatial.

#### SHR-018 — Shared architecture improves comparison without flattening differences
**Status: Established**

Comparison may group realizations by Architecture Family, shared definition/version, Product Identity, or common Concepts, then emphasize their system-specific deltas.

**Rationale:** Learning value comes from both common structure and meaningful differences.

#### SHR-019 — Concepts explain principles; reusable architecture definitions describe concrete structure
**Status: Established**

Reusable architecture blueprints do not live in the Concept Library merely to gain global identity. Concepts explain general mechanisms and patterns; reusable definitions describe sourced physical/platform structure. The two may link bidirectionally.

**Rationale:** This prevents Concepts from becoming a second physical-configuration database.

#### SHR-020 — Reuse reduces authoring effort without changing the resolved configuration contract
**Status: Established**

Implementation may use composition/templates to author systems efficiently, but validation and Explore ultimately consume a complete Resolved Configuration Graph with ordinary configuration-local entities and relationships.

**Rationale:** Sophisticated authoring should not complicate the runtime identity/navigation model.

#### SHR-021 — Shared-definition support does not block the initial five systems
**Status: Established implementation sequencing decision**

The initial five systems do not require a reusable architecture-definition engine before implementation begins. Add the mechanism when multiple configurations demonstrably reuse substantial structural platforms and the reduction in duplication justifies the complexity.

**Rationale:** The semantics should be established before reuse appears, but implementation cost should follow actual need.

### Shared-architecture assumptions and ownership

**Status: Established**

- Most reusable physical structure is expected at component, tray, rack, platform, or subsystem level rather than whole-system level.
- Product Identity is sufficient for many shared-component cases and should be preferred when no larger structural definition is needed.
- Architecture Family is broader than exact Reusable Architecture Definition identity.
- Reusable Architecture Definitions are sourced architectural artifacts, not generic explanatory Concepts.
- A Resolved Configuration Graph remains independently inspectable and valid even when composition was used during authoring.
- Existing configuration-switch behavior continues to reject inferred cross-system physical equivalence.

| Layer | Responsibility |
|---|---|
| **Source of Truth** | Defines identity, Family/Variant, realization, composition, provenance, versioning, and no-false-equivalence semantics. |
| **Reference-System schema/data** | Owns configuration-local physical entities and may later add optional lineage/definition references. |
| **Reusable architecture source** | If introduced, stores separately validated reusable physical definitions rather than Concept records. |
| **Concept Library** | Owns global explanatory Concepts and may link to architecture families/realizations without storing physical blueprints. |
| **Organizational Content Inventory** | Continues to organize scope/terminology only; it does not own reuse behavior. |
| **Implementation** | Resolves composition, namespaces generated/reused structures, tracks lineage, and produces the Resolved Configuration Graph. |
| **Explore / Navigation** | Displays and navigates the system-specific realization using configuration-local identities. |
| **Scenarios** | Targets resolved configuration-local entities/relationships, never reusable definition IDs directly. |

### Shared-architecture implementation boundary

**Status: Established**

Exact filenames, directories, YAML keys, composition timing, namespacing, and whether resolved graphs are generated artifacts or runtime products remain Implementation decisions. If reusable definitions are introduced, they should use a separately validated physical-architecture source library rather than Concept files. Scenario targets and Navigation continue to use resolved configuration-local identities.

No foundational shared-architecture product decision remains unresolved.

## 3.8 Reference-system readiness criteria

**Status: Established**

Readiness is evaluated against the approved educational role of each Reference System rather than exhaustive implementation of the Organizational Content Inventory. Structural/schema validity is necessary but not sufficient: a system is ready only when its architecture-defining learning claims can be taught accurately, navigated coherently, linked to complete explanatory content, exercised through meaningful Scenarios, and validated without blocking integrity defects.

### Definitions

| Term | Status | Definition |
|---|---|---|
| **Primary Learning Claim** | **Established** | An architecture-defining idea the Reference System is explicitly included to teach, normally grounded in its `learning_value` statements and supporting summary. |
| **Material Architectural Element** | **Established** | A physical component, grouping, connection, topology, or boundary required to understand a Primary Learning Claim accurately. |
| **Documented Omission** | **Established** | Deliberately excluded detail whose absence, reason, and effect on interpretation are recorded in scope/modeling notes, `unknowns`, or equivalent provenance. |
| **Ship-Ready Configuration** | **Established** | A Reference Configuration that passes every applicable mandatory readiness gate. |
| **Ship-Ready Reference System** | **Established** | A Reference System for which every configuration exposed in the initial user experience is Ship-Ready and the system-level Concept/Scenario learning contract is satisfied. |
| **Readiness Blocker** | **Established** | Failure of a mandatory readiness criterion. |
| **Readiness Note** | **Established** | A documented limitation or enhancement opportunity that does not compromise architectural accuracy or the approved learning role. |

### Readiness rules

#### RDY-001 — Readiness is a pass/fail release gate
**Status: Established**

Use **Ship-ready** or **Not ship-ready**, with accompanying Readiness Notes. Existing 1–5 candidate ratings remain research/prioritization tools rather than release scores.

**Rationale:** A weighted score could allow a serious integrity failure to be numerically offset by unrelated detail.

#### RDY-002 — Primary Learning Claims define the stopping boundary
**Status: Established**

The existing `reference_system.learning_value` statements are the starting source of Primary Learning Claims. A configuration is deep enough when every Primary Learning Claim can be located in Explore, explained structurally, connected to relevant Concepts where needed, and supported by adequate evidence.

**Rationale:** This creates a principled stopping condition for content development.

#### RDY-003 — Ship readiness does not require all five Explore tiers
**Status: Established**

A Ship-Ready Configuration requires a valid Tier-1/system root and sufficient architecture-specific breadth/depth beneath it. Tier 4 is expected only when device-level distinctions are central; Tier 5 is required only when supportable internals materially explain the architecture.

**Rationale:** Mandatory five-tier depth would encourage invented or educationally irrelevant detail.

#### RDY-004 — Readiness reviews a common set of architectural domains
**Status: Established**

For every configuration, explicitly review:

- compute/accelerator organization;
- memory organization;
- local/scale-up connectivity where applicable;
- scale-out/network organization where applicable;
- topology-defining connections;
- storage/data movement where architecturally important;
- management/control where architecturally important; and
- power/cooling where distinctive or necessary to the physical architecture.

Each domain is either modeled sufficiently or documented as not materially relevant to the approved learning role.

**Rationale:** Consistent breadth review is possible without forcing identical diagrams.

#### RDY-005 — Material relationships must be modeled structurally
**Status: Established**

When a Primary Learning Claim depends on a relationship, that relationship must exist formally as containment, a Cross-Connection, or another explicit architectural relationship rather than appearing only in prose.

**Rationale:** Spatial/system relationships are the project's central learning medium.

#### RDY-006 — Black boxes may not conceal the principal lesson
**Status: Established**

A black box passes readiness when its boundary/location is correct, existence/function is supportable, unavailable internals are acknowledged, and the learner can still understand the relevant architecture. A Primary Learning Claim cannot depend entirely on unexplained proprietary internals.

**Rationale:** Black boxes preserve fidelity; they are not substitutes for missing core research.

#### RDY-007 — Evidence requirements are strongest for Primary Learning Claims
**Status: Established**

All modeled information continues to use the established Evidence State. Architecture-defining claims should normally be documented; inferred or simplified material may support them only when sources/reasoning are clear and false precision is avoided. Unknown/proprietary evidence defines boundaries rather than invented internals.

A system intended for detailed initial Explore treatment should have Documentation Confidence of at least **3** under the existing candidate scale.

**Rationale:** Peripheral simplification is acceptable, but core architectural claims require a stronger confidence floor.

#### RDY-008 — Product Identity is required only when supportable and materially useful
**Status: Established**

Readiness does not require `product_identity` on every entity. It should be present for architecture-defining real components when reliable manufacturer/family/model information materially improves distinction or understanding. Heterogeneous, generic, unsupported, or redundant cases may omit it under REF-024/025.

**Rationale:** Conservative identity is preferable to invented completeness.

#### RDY-009 — Aggregate/repetition semantics must be resolved before shipping
**Status: Established**

Every user-visible repeated Aggregate Entity must have enough metadata to determine Count Basis, Expansion Mode, and whether individual members are addressable. Unknown populations may remain aggregate-only.

**Rationale:** Implementation must not infer user-facing repetition semantics from arbitrary properties.

#### RDY-010 — User-facing Concept links must resolve completely
**Status: Established**

Before an initial Reference System ships:

- every user-facing Concept–Architecture Link resolves to a stable canonical `concept_id`;
- its architecture target resolves;
- the canonical Concept YAML/Markdown content exists and validates;
- direct foundational prerequisites required by the Architecture-Anchored Foundational Library are available; and
- no legacy name-only Concept link remains in the user-facing initial configuration.

A Primary Learning Claim needing abstract explanation must provide at least one meaningful Concept route.

**Rationale:** A visible explanatory affordance must not end in provisional or missing content.

#### RDY-011 — A Ship-Ready Configuration includes at least two curated named Scenarios
**Status: Established release criterion**

The Scenario data-model validity minimum remains one named Scenario with exactly one Default Scenario. For initial release quality, a Ship-Ready Configuration requires:

- the Default/baseline Scenario; and
- at least one meaningful non-default architecture-relevant Scenario.

Roughly two to four total Scenarios remains a useful case-by-case target.

**Rationale:** A baseline-only configuration does not demonstrate the dynamic Scenario learning model meaningfully.

#### RDY-012 — Non-default Scenario coverage must teach a meaningful system relationship
**Status: Established**

The required non-default Scenario must illuminate an architecture-relevant condition such as a characteristic fabric bottleneck, supported failover, component degradation, workload pressure, power/thermal constraint, or architecture-specific reconfiguration rather than existing only to satisfy a count.

**Rationale:** Scenario quantity without learning purpose recreates the checklist problem.

#### RDY-013 — Material omissions must be documented
**Status: Established**

An omission is acceptable when it is irrelevant, proprietary, insufficiently documented, deployment-variable, intentionally simplified, or beyond the Core Release Boundary. Material omissions must be recorded through the existing scope/modeling/evidence mechanisms and surfaced to users when they could materially mislead interpretation.

**Rationale:** An omission is safe when its boundary is intentional and auditable.

#### RDY-014 — One Reference Configuration is sufficient unless another is educationally necessary
**Status: Established**

A Reference System does not need multiple configurations for completeness. Add another configuration only when a materially different physical setup contributes to the approved learning role and cannot correctly be represented as Scenario state or comparison metadata.

Every configuration exposed in the initial user experience must independently pass readiness.

**Rationale:** This preserves REF-034 and prevents unnecessary variant proliferation.

#### RDY-015 — Release validation must be clean
**Status: Established**

A Ship-Ready Configuration must pass all applicable syntax, schema, identity, hierarchy, relationship, source/evidence, inventory, functional-group, Concept-link, Scenario-target, Product Identity, property/measurement, and aggregate/repetition checks with **zero errors**.

Warnings may remain only when explicitly classified as nonblocking and unrelated to a Primary Learning Claim or broken user-facing relationship.

**Rationale:** Referential-integrity debt should not become runtime educational failure.

#### RDY-016 — Readiness includes interaction smoke tests
**Status: Established**

For each shipped configuration, verify at least:

- Inspect/Select/Detail/Enter behavior, including Selection clearing and non-enterable targets;
- enter/up/lateral navigation;
- canonical breadcrumbs;
- aggregate and Representative Member behavior;
- relevant Cross-Connection traversal;
- Scenario activation;
- aggregate Scenario presentation;
- Concept opening and explicit return;
- configuration-switch/reset behavior; and
- absence of unintended dead-end navigation except supported black-box boundaries.

**Rationale:** A valid content graph can still fail educationally if its interaction semantics are unusable.

#### RDY-017 — Readiness results are versioned and reproducible
**Status: Established**

Record readiness against the Reference-System/configuration IDs, schema version, Concept Library revision, Scenario-content revision, and validation date. Material source changes may require reevaluation.

**Rationale:** “Ready” should identify a concrete validated content snapshot.

### Practical initial-system readiness checklist

**Status: Established release gate**

| # | Mandatory gate | Pass condition |
|---:|---|---|
| **1** | Identity and scope | Valid system/configuration IDs, summary, learning value, scope/modeling notes, status, and sources. |
| **2** | Learning-claim coverage | Every Primary Learning Claim is concretely represented and supportable. |
| **3** | Physical hierarchy | Valid Tier-1 root and sufficient architecture-specific depth; no mandatory five-tier completeness. |
| **4** | Architectural breadth | Every material compute/memory/connectivity/topology/support domain is modeled or explicitly not relevant. |
| **5** | Relationships | Architecture-defining interactions exist as formal containment/Cross-Connections or other explicit architecture relationships, not prose only. |
| **6** | Aggregation | Population/count/Expansion Mode semantics are unambiguous. |
| **7** | Black boxes | Boundaries are justified; no core learning claim disappears behind an unexplained black box. |
| **8** | Evidence | Core claims are adequately supported; Documentation Confidence ≥ 3; modeled evidence is valid. |
| **9** | Product identity | Architecture-defining products are identified where reliably supportable; no invented qualifiers. |
| **10** | Concepts | All exposed links resolve to canonical Concept IDs/content and necessary foundations exist. |
| **11** | Scenarios | Default Scenario plus at least one meaningful non-default Scenario. |
| **12** | Omissions/unknowns | All material omissions and uncertainties are documented. |
| **13** | Referential integrity | Current schema/cross-file validation passes with zero errors and no blocking warnings. |
| **14** | Navigation smoke test | Structural navigation, aggregation, connections, and switching behave correctly. |
| **15** | Cross-view smoke test | Concept traversal/return and Scenario context behavior work correctly. |
| **16** | Reproducibility | Readiness result identifies exact validated source/schema/library revisions. |

A Reference Configuration is **Ship-ready only when every applicable mandatory gate passes**.

### Readiness assumptions

**Status: Established**

- Readiness is judged against the Reference System's approved learning value rather than exhaustive physical reality.
- Unequal physical depth across systems is expected.
- A Documented Omission is preferable to unsupported physical detail.
- Additional detail after readiness is normally an enhancement unless it closes a Readiness Blocker.
- Candidate evaluation ratings and Ship-Readiness are separate processes.
- System-specific readiness audits may expose content blockers without reopening the readiness model itself.

No foundational readiness decision remains unresolved; applying the checklist to the initial five is a content/validation task.

## 3.9 Assumptions and constraints

| ID | Status | Assumption / constraint |
|---|---|---|
| **REF-A01** | **Established** | Real, documented systems are the primary basis for the initial Reference-System library. |
| **REF-A02** | **Established** | Configuration fidelity is educational rather than exhaustive; model the detail necessary to teach important physical relationships accurately. |
| **REF-A03** | **Established** | Different systems and branches may expose unequal depth when public information or educational value differs. |
| **REF-A04** | **Established** | Architectural diversity is desirable when it teaches meaningful alternatives; the project should not converge every system toward one canonical diagram. |
| **REF-A05** | **Established** | Reference-System content is expected to evolve as architectures and public documentation change. |
| **REF-A06** | **Established** | The initial five-system baseline is deliberately limited; future additions are evaluated case by case. |
| **REF-A07** | **Established** | A Reference System may ultimately have one or multiple Reference Configurations depending on whether materially useful setup variants exist. |
| **REF-A08** | **Established** | Inventory classification is an organizational/documentation mechanism; behavior belongs to the entity-type layer. |
| **REF-A09** | **Established** | Product identity is optional and intentionally conservative; incomplete product metadata is preferable to unsupported certainty. |
| **REF-A10** | **Established** | Aggregate and representative populations are legitimate educational representations when clearly distinguished from literal fixed deployment counts. |
| **REF-A11** | **Established** | The current authored corpus may include later candidates without changing their planning status or the five-system initial implementation baseline. |

## 3.10 Future considerations and implementation dependencies

### REF-F01 — Generic / archetypal teaching system
**Status: Deferred — future Sandbox direction**

A deliberately generic teaching architecture is educationally valuable, but its contents and role are deferred. It may become the foundation of a future **Sandbox** mode rather than an initial fixed Reference System.

### REF-F02 — User-created or user-modified configurations / Sandbox design
**Status: Deferred — future Sandbox direction**

User-created or editable configurations, the relationship to a generic archetypal system, and the broader Sandbox interaction model are deferred to a later phase. The current Reference-System data model should remain extensible enough not to block that future direction.

### REF-I01 — Entity-type capability profiles
**Status: Established implementation architecture within an Established taxonomy**

The controlled `entity_type` vocabulary is finalized in schema version 1.2.0. Version-1 Implementation uses a **data-driven capability registry** keyed by `entity_type`, with multiple types permitted to share reusable semantic capability profiles/traits. Those profiles govern applicable Detail sections, Scenario-state categories, Property expectations, structural/render roles, and interaction capabilities. Enterability remains resolved from the current object/context under SDC-025 rather than being a permanent type flag.

Organizational inventory classification must not be used as a behavior switch. Browser-specific visual styling remains separate from the language-neutral capability contract. Concrete registry organization is maintained in `Delivery_Rendering_and_Platform_Implementation_Plan.md`.

### REF-I02 — Machine-readable aggregate/count-basis encoding
**Status: Provisionally Resolved implementation encoding within Established count semantics**

REF-027 and REF-028 establish the four Count Basis values, and Section 1.5 establishes Aggregate Entity Expansion Mode and identity behavior. Current configurations still express many count facts through free-form properties plus evidence/modeling notes. Before automatic representative/addressable expansion or comparison derives values from population counts, Version-1 Implementation must introduce explicit structured population/repetition metadata consistent with AGG-013 and Section 7.

The planned encoding keeps Count Basis, Expansion Mode, and member addressability as distinct fields and must not infer one from another or from legacy property names. The exact schema shape is **provisionally resolved** in `Delivery_Rendering_and_Platform_Implementation_Plan.md` and should be confirmed by a migration pilot over the initial five systems before the schema revision is finalized.

### Emerging power-architecture scope note — 800 VDC

**Status: Established scope addition; emerging/current rather than default**

High-voltage DC / **800 VDC** distribution is now part of the canonical Organizational Content Inventory under **Power infrastructure**. The addition reflects an industry transition toward moving major power-conversion stages out of increasingly dense compute racks and distributing higher-voltage DC closer to the row/rack boundary.

The currently documented architecture patterns include:

- a **side power rack / power sidecar** that can convert existing facility AC distribution to 800 VDC beside or within the compute row;
- **row-level 800 VDC distribution / DC busway**, including multi-megawatt row-scale distribution; and
- a longer-term **direct MVAC-to-HVDC conversion** path that converts medium-voltage facility power directly to 800 VDC before distribution through the data hall.

These concepts should be treated as **emerging/current architecture**, not as the default power model for existing AI systems. Their educational importance is primarily that they change **where power conversion occurs** and therefore change the physical relationship among facility electrical infrastructure, row-level distribution, power racks, and megawatt-class compute racks.

The current 16-system / 18-configuration YAML corpus is intentionally **not** retrofitted solely because these concepts entered the inventory. Add the relevant power entities or connections to a Reference Configuration only when sources for that specific configuration establish that the modeled deployment uses them. A future configuration centered on a native or transitional 800 VDC AI-factory architecture may warrant explicit facility/row/rack power modeling at greater depth.

### Current deliberate content uncertainties

**Status: Established omissions pending stronger evidence or a more specific configuration**

The following current omissions are intentional and should not be treated as validation defects:

- **Groq LPU / GroqCloud** — the modeled 256-LPU rack is not reliably tied to a specific released LPU model/generation in the configuration's established sources, so product identity remains at the supported family level.
- **Meta 24K H100 RoCE cluster** — the RoCE switch entity aggregates multiple switch products; a singular switch `product_identity` would misrepresent that heterogeneous aggregate.
- **NVIDIA DGX GB300 NVL72 / SuperPOD** — the NVSwitch ASIC remains identified at family level because the current configuration sources do not establish a distinct ASIC model identifier; generic cache SSDs likewise remain untagged without a supported manufacturer/model.
- **NVIDIA Vera Rubin** — the scale-out fabric intentionally represents alternative Quantum-X800 InfiniBand and Spectrum-X Ethernet paths, so the aggregate does not receive one singular product identity.
- **xAI Colossus 1** — the modeled GPU fleet is heterogeneous across H100, H200, and GB200-era hardware, so one singular GPU product identity would be misleading.

Previously reviewed product-identity uncertainties that now have sufficient support are represented in the current YAML corpus, including the Trainium3 Trainium-family generation qualifier, HPE **Slingshot 11** for El Capitan, and NVIDIA **ConnectX-8** / ConnectX-8 SuperNIC identity in the relevant OCI GB200/GB300 configurations.

## 3.11 Interactions with Explore

**Status: Established**

Reference Systems **instantiate Explore; they do not redefine its shared rules**.

The following Explore invariants remain global across configurations:

- one canonical home per physical object within a configuration;
- containment represents physical/structural membership;
- tiers are navigation bands rather than mandatory graph depths;
- cross-connections may span tiers;
- higher levels aggregate and lower levels resolve;
- functional subsystems remain cross-cutting rather than alternative containment trees; and
- abstract mechanisms belong primarily in Concepts.

Actual physical objects, containment, cross-connections, topology, visibility depth, and black-box boundaries are configuration-specific.

A configuration may skip tiers or use multiple containment steps within a tier, and different architectures should remain visibly different rather than being forced into identical structures.

`entity_type` should be the basis for type-dependent Explore behavior. Inventory classification remains organizational metadata and should not silently alter navigation, rendering, interaction, or scenario behavior.

Aggregate entities may resolve into repeated components or remain aggregate depending on the modeled configuration, available evidence, and current tier. Representative populations must remain distinguishable from fixed literal populations.

## 3.12 Interactions with Navigation

**Status: Established**

The active Reference System is core orientation state, while the active Reference Configuration supplies its current setup.

On a system/configuration switch:

`activate destination → apply destination default scenario → return to highest valid structural level → clear incompatible selection → navigate using destination containment`

Additional rules:

- similarly named objects across configurations are not assumed equivalent;
- matching `product_identity` metadata may support comparison/search but does not preserve or transfer physical selection/location state;
- another named Scenario may be selected after the destination default is applied;
- a previously selected non-default Scenario is not automatically restored in the baseline design;
- functional lenses remain independent of system/configuration state and are still a deferred feature; and
- future cross-configuration lens persistence remains a Features question.

## 3.13 Reference-System summary invariant

**Status: Established**

> **A Reference System is a coherent architectural learning environment whose validated Reference Configuration instantiates the shared Explore and Navigation models without forcing different architectures into artificial uniformity. Configuration-local identity, behavior-controlling entity type, optional product identity, and Organizational inventory classification remain distinct metadata layers. The library should remain complementary, trustworthy, learning-oriented, and straightforward to expand over time.**

---

# 4. Scenarios

## 4.1 Purpose and scope

**Status: Established**

Scenarios define **the operating or workload conditions under which a fixed Reference Configuration is examined**. They provide a configuration-local, declarative state layer over the physical architecture so that users can study normal operation, workload differences, bottlenecks, degradation, failures, recovery conditions, and supported reconfiguration without duplicating or redefining the underlying system.

Scenarios are intended to make dynamic systems behavior understandable while preserving the project's physical/spatial learning model. They should explain **what is happening in or to the system**, which components or relationships are affected, what consequences are visible, and why those consequences matter.

The initial implementation should use **named, curated Scenarios** rather than a general-purpose scenario editor or simulation engine. Scenario outcomes should be authored and deterministic where practical, with qualitative state preferred over unsupported numerical precision.

## 4.2 Core terminology

| Term | Status | Definition |
|---|---|---|
| **Scenario** | **Established** | A named, configuration-compatible description of what is happening in or to a Reference Configuration under a particular operating condition. A Scenario may alter dynamic state, workload, traffic, health, utilization, active paths, bottlenecks, and explanatory emphasis without normally changing physical architecture. |
| **Scenario Context** | **Established** | The complete currently active Scenario state associated with the selected named Scenario. In the initial design this is the resolved state of one curated Scenario; future bounded user overrides may extend it. |
| **Default Scenario** | **Established** | The named Scenario automatically activated whenever a Reference Configuration loads. It represents a valid baseline or normal operating condition for that configuration. |
| **Baseline / Normal Operation** | **Established convention** | A Scenario in which no abnormal condition is deliberately injected. It may still define a representative workload appropriate to the Reference Configuration, such as training, inference, or HPC/AI operation. |
| **Scenario Definition** | **Established** | The authored reusable content describing a named Scenario, including identity, explanation, workload context, targets, state/effects, and evidence where applicable. |
| **Active Scenario State** | **Established** | The resolved dynamic state presented by the currently selected named Scenario. |
| **Scenario Effect / Override** | **Established** | A Scenario-defined change to an entity, connection, workload, metric, or other supported dynamic state relative to the configuration's ordinary structural facts. |
| **Scenario Target** | **Established** | The configuration-local entity, connection, aggregate, or supported configuration-level state to which a Scenario effect applies. |
| **Scenario Type** | **Established** | One or more broad, nonexclusive classifications describing a Scenario's purpose. Initial families are **baseline**, **workload**, **performance / bottleneck**, **failure / degradation**, **recovery / resilience**, and **reconfiguration**. |
| **Workload Context** | **Established** | Scenario information describing what work is occurring, such as training, inference, serving, checkpointing, preprocessing, or HPC/AI operation, together with relevant operating assumptions. |
| **Health State** | **Established** | A dynamic condition for health-capable components. The baseline conceptual states are **healthy**, **degraded**, **straggling / performance-impaired**, **silently corrupting data**, and **failed**, matching the Organizational Content Inventory. |
| **Operational State** | **Established concept** | Whether and how an entity participates in the current operation, such as active, idle, standby, disabled, or isolated where meaningful. Valid values should be type-dependent rather than forced into one universal enumeration. |
| **Scenario Metric / Dynamic Property** | **Established** | A dynamic measurement or condition such as utilization, traffic load, latency, bandwidth use, temperature, power, queue depth, or storage throughput. |
| **Active Path** | **Established** | A physical or logical path currently participating in Scenario behavior. A Scenario may activate, deactivate, reroute, or emphasize paths already supported by the Reference Configuration. |
| **Scenario Explanation** | **Established** | Authored educational context describing the condition, affected objects, symptoms, consequences, and learning purpose. |
| **Scenario Evidence** | **Established** | Provenance/evidence associated with Scenario-specific claims, using the existing **documented**, **inferred**, **simplified**, **unknown**, and **proprietary** conventions where applicable. |
| **Bounded Scenario Modification** | **Deferred future capability** | Future user-controlled changes to supported Scenario state within limits defined by the active configuration and entity types. Not part of the initial named-Scenario interface. |
| **Scenario Sequence / Simulation** | **Deferred** | A time-ordered progression through multiple states. The initial Scenario model represents coherent snapshots rather than a general event simulator. Sequential walkthroughs belong primarily to future Guided Modes / Flows. |

### Scenario-state layering

**Status: Established for initial scope**

Initial state resolution is:

`Reference Configuration → selected named Scenario → Active Scenario Context`

The implementation should avoid unnecessary restrictions that would prevent a later extension to:

`Reference Configuration → selected named Scenario → bounded user overrides → Active Scenario Context`

The future override layer is not required for the initial interface and should not complicate initial behavior beyond preserving a compatible data/state boundary.

## 4.3 Initial Scenario baseline

**Status: Established baseline**

The initial version uses **named, curated Scenarios only**. Users may choose among Scenarios authored for the active Reference Configuration but may not arbitrarily edit Scenario state.

Every Reference Configuration must contain **at least one valid named Scenario**, and exactly one must be designated as its default. This is the Scenario-model validity minimum. Initial **Ship-Readiness** is stricter: RDY-011 requires the Default Scenario plus at least one meaningful non-default Scenario for each configuration exposed in the initial product.

A useful content-planning target is approximately **two to four Scenarios per Reference System**, but this is not a hard model-wide requirement. The appropriate count should be determined case by case according to architectural relevance, learning value, documentation quality, and implementation effort. Scenario catalogs may differ substantially among systems and should remain straightforward to expand later without changing the core architecture.

The current Reference-System YAML corpus already defines a `default_scenario` for every authored Reference Configuration. That field is the current minimal Scenario representation. The richer named-Scenario data contract described in this section remains an Implementation/schema extension; it should preserve compatibility with the established configuration-local IDs, evidence model, and data-driven authoring approach.

Scenario presentation should use **qualitative state by default** in the initial version. Exact numerical values may still be stored or displayed when documented or deliberately defined, and the model should support future numeric controls without structural redesign.

## 4.4 Scenario rules

#### SCN-001 — Every Reference Configuration has at least one named Scenario and exactly one default
**Status: Established**

Each Reference Configuration must define at least one valid named Scenario. Exactly one Scenario is designated as the default and is activated whenever that configuration loads.

#### SCN-002 — Exactly one named Scenario is active at a time
**Status: Established for initial scope**

The initial interface does not stack or compose multiple named Scenarios. Selecting another Scenario replaces the previously active named Scenario.

Named-Scenario composition is deferred because it would require precedence, conflict-resolution, causality, and validation semantics that are unnecessary for the initial educational experience.

#### SCN-003 — Scenarios modify dynamic state, not structural identity
**Status: Established**

A Scenario must not change canonical containment, entity IDs, `entity_type`, inventory classification, `product_identity`, or other stable physical identity metadata.

A failed GPU, degraded NIC, or inactive link remains the same modeled object under a different dynamic state.

#### SCN-004 — Material physical changes require another Reference Configuration
**Status: Established**

If a change materially alters which physical architecture exists, it should normally be represented as another Reference Configuration or Reference System rather than as a Scenario.

Scenario-appropriate changes include failure, degradation, utilization changes, workload placement, traffic shifts, supported rerouting, thermal or power constraints, and activation/deactivation of already modeled paths.

#### SCN-005 — Dynamic topology may change only within configuration-defined possibilities
**Status: Established**

A Scenario may alter which supported connections or paths are active, including failover, rerouting, redundant networking, optical circuit switching, or similar behavior.

A Scenario must not invent a physical connection that is absent from the Reference Configuration merely to satisfy an abstract routing or workload condition.

#### SCN-006 — Scenario effects require explicit targets
**Status: Established**

Scenario effects should identify the configuration-local entity, connection, aggregate, or supported configuration-level state they affect.

Vague statements such as “the network is slow” should be resolved into explicit targeted conditions where the architecture and educational purpose support doing so.

#### SCN-007 — Aggregate targeting must not imply unsupported per-instance state
**Status: Established**

Aggregate Scenario semantics follow AGG-015 and AGG-016 in Section 1.5. A Scenario targeted at an Aggregate Entity applies at the aggregate level unless it explicitly targets all members, a supported subset, or an Addressable Member. Representative Member Contexts are not canonical Scenario targets, and group-level state must not be presented as identical per-member state without support.

#### SCN-008 — Black-box boundaries may receive known boundary state
**Status: Established**

A black-box subsystem may be marked active, degraded, failed, constrained, or otherwise affected at the level actually modeled and supported.

Scenario content must not invent unavailable internal components or internal failure mechanisms merely to explain the black-box state.

#### SCN-009 — Omitted baseline state does not create fabricated telemetry
**Status: Established**

Absence of an abnormal health override in a baseline/default Scenario means that the Scenario is not deliberately introducing an abnormal health condition. It does not assert that a real deployment was empirically observed to be healthy.

Similarly, absence of a dynamic metric does not imply a value of zero.

#### SCN-010 — Numeric state must not create false precision
**Status: Established**

Use exact numeric Scenario values when they are documented, deliberately defined as synthetic parameters, or clearly identified as representative/simplified values needed to teach an important relationship. Numeric Scenario metrics should use the Property and Measurement conventions in Section 7 where applicable.

Otherwise prefer qualitative conditions such as **normal**, **elevated**, **high**, **saturated**, or other type-appropriate states rather than inventing precise percentages or rates.

#### SCN-011 — Scenario-specific factual claims use the existing evidence model
**Status: Established**

Architecture-specific Scenario claims should use the same evidence vocabulary as Reference Configurations: **documented**, **inferred**, **simplified**, **unknown**, or **proprietary**.

A deliberately constructed educational fault or bottleneck may be represented as **simplified** rather than presented as an observed production event.

#### SCN-012 — Scenarios are broader than failures
**Status: Established**

Valid Scenarios include normal workloads, checkpointing, model startup, high-concurrency inference, communication-heavy operation, bottlenecks, degradation, failures, recovery, and other useful operating conditions.

Scenario Context answers **under what conditions the architecture is being examined**, not merely **what is broken**.

#### SCN-013 — Workload context and infrastructure state remain distinct
**Status: Established**

A Scenario may describe both the work being performed and the current infrastructure condition, but those concepts should remain distinguishable.

This allows the same workload family to be examined under multiple infrastructure conditions and the same infrastructure condition to be associated with different workloads where meaningful.

#### SCN-014 — Health state and performance impairment remain distinct
**Status: Established**

A component may be healthy but highly utilized, healthy but currently limiting performance, degraded but active, straggling without having failed, silently corrupting data, or fully failed.

Scenario modeling should preserve these distinctions rather than using one generic “bad” state.

#### SCN-015 — Bottleneck status is dynamic Scenario state, not an entity type
**Status: Established**

An entity does not change `entity_type` because it becomes a bottleneck, straggler, failed component, or other Scenario-specific role.

Dynamic operating state must not leak into the stable entity-type taxonomy.

#### SCN-016 — Causal relationships should be authored rather than generally simulated
**Status: Established for initial scope**

A Scenario may explicitly describe a causal chain such as:

`link failure → traffic reroutes → remaining path saturates → collective latency rises`

The initial implementation should not attempt to derive all consequences automatically from incomplete topology, capacity, workload, or failure models.

Simple deterministic derivation may be introduced later only where it is trustworthy and educationally useful.

#### SCN-017 — Nontrivial Scenarios should explain cause, symptoms, consequences, and learning purpose where applicable
**Status: Established content guideline**

A useful Scenario should normally make clear:

1. what condition is present or introduced;
2. which objects or relationships are affected;
3. what the user can observe;
4. why the system behaves that way; and
5. what concept or systems relationship the Scenario is intended to teach.

Not every Scenario requires all five elements; for example, normal operation may not have an initiating abnormal cause.

#### SCN-018 — Scenario activation does not automatically navigate or select
**Status: Established**

Changing the active Scenario preserves current system, Reference Configuration, structural location, tier, containment path, and current selection where those remain valid.

A selected object remains selected if the new Scenario marks it failed, isolated, inactive, congested, or otherwise affected because the physical object still exists.

#### SCN-019 — Scenario changes do not create navigation-history entries
**Status: Established**

Selecting another named Scenario is a context/state change rather than a structural movement and therefore does not create an Explore Structural History or Application Navigation History entry.

A separate Scenario-history or undo system is not required in the initial design.

#### SCN-020 — Inactive or failed physical objects and relationships remain inspectable
**Status: Established**

A failed component, inactive path, disconnected link, or similar physical object should normally remain visible or recoverable and inspectable under the Scenario.

Where navigation across such a relationship is supported for inspection, the interface must clearly communicate that it is currently inactive or unavailable in Scenario behavior.

#### SCN-021 — Scenario state aggregates and resolves with semantic scale
**Status: Established**

Lower-level Scenario conditions should roll up into meaningful higher-level summaries when their detailed targets are aggregated, and should resolve back to the specific affected object when the user moves inward and the configuration supports that detail.

Example: a failed Tier-4 NIC may cause its enclosing rack to present a degraded network summary at a higher tier without changing the rack's physical identity.

#### SCN-022 — Scenario emphasis is distinct from Functional Lens state
**Status: Established**

A Scenario may naturally emphasize the subsystem involved in the current condition, but it does not automatically enable a future Functional Lens.

> **Scenario = what is happening in or to the system.**  
> **Lens = which cross-cutting aspect of the system the user wants emphasized.**

#### SCN-023 — Scenario IDs and definitions are configuration-local
**Status: Established**

Two configurations may contain similarly named Scenarios without implying identical implementation, severity, affected objects, or state.

Cross-system discovery or comparison should rely on Scenario-type metadata and explicit explanatory relationships rather than inferred identity.

#### SCN-024 — Reference Configurations need not offer identical Scenario catalogs
**Status: Established**

A Scenario should be authored only when it is meaningful and educationally useful for that architecture. Uniform checklists must not force every system to include the same failures, workloads, or bottlenecks.

Architectural distinctiveness should remain visible in the Scenario catalog just as it remains visible in the physical configuration.

#### SCN-025 — Initial Scenario interaction uses named selection only
**Status: Established for initial scope**

Users may select among curated named Scenarios available for the active Reference Configuration. Arbitrary editing of Scenario metrics, targets, failures, routing, or causal relationships is not part of the initial interface.

The underlying state model should preserve a clean boundary for future bounded user modifications without requiring the initial implementation to expose or simulate them.

#### SCN-026 — Previously selected non-default Scenarios are not automatically restored after configuration switches
**Status: Established for initial scope**

Switching Reference Configurations activates the destination's default Scenario. Returning to a previously visited configuration does not automatically restore the prior non-default Scenario selection.

Per-configuration Scenario-selection persistence may be considered later as a convenience feature.

#### SCN-027 — Named-Scenario stacking and general-purpose editing are deferred
**Status: Deferred**

The initial model does not require composition rules for stacking multiple named Scenarios or a general-purpose user-authored Scenario language.

A future bounded modification model may add selected user controls. Fully generic editing belongs with future Sandbox functionality.

#### SCN-028 — Scenarios are coherent snapshots, not a general event simulation
**Status: Established for initial scope**

A Scenario represents a coherent operating state. If before/during/after states are educationally useful, they may initially be represented as separate named Scenarios and later connected by Guided Modes / Flows.

Arbitrary time-series simulation is outside the initial Scenario model.

#### SCN-029 — Scenario validation is configuration-aware
**Status: Established implementation requirement**

When the richer named-Scenario data contract is implemented, validation should ensure at minimum that:

- Scenario IDs are unique within the Reference Configuration;
- at least one named Scenario exists and exactly one is designated as default;
- all entity and connection targets resolve to valid configuration-local IDs;
- target state is valid for the target's entity/relationship type where a behavior contract exists;
- Scenario data does not alter stable structural metadata;
- active-path references resolve to valid supported relationships;
- evidence/source references are valid; and
- state/metric forms conform to the schema and type-specific contracts.

#### SCN-030 — Scenario authoring should remain data-driven and extensible
**Status: Established implementation requirement**

Adding another curated Scenario should normally be a content/data operation rather than requiring custom application architecture.

The implementation should make it straightforward to expand a Reference Configuration's Scenario catalog later and to add future bounded editing without redesigning the core Scenario/Explore state model.

## 4.5 Assumptions and constraints

| ID | Status | Assumption / constraint |
|---|---|---|
| **SCN-A01** | **Established** | Scenario Context describes dynamic/operational conditions; Reference Configurations describe structural architecture. |
| **SCN-A02** | **Established** | The initial project is an educational explorer, not a high-fidelity performance or failure simulator. |
| **SCN-A03** | **Established** | Authored deterministic outcomes are preferable to speculative automatic simulation when system information is incomplete. |
| **SCN-A04** | **Established** | Every Reference Configuration has at least one named Scenario and exactly one default; the representative workload used by the default may differ between systems. |
| **SCN-A05** | **Established** | Scenario definitions and targets are configuration-local; similarly named Scenarios across systems are not automatically equivalent. |
| **SCN-A06** | **Established** | Scenario state may apply to explicit entities, aggregate entities, cross-connections, and supported configuration-level workload context. |
| **SCN-A07** | **Established** | Black-box components may have observable boundary state without inventing hidden internal state. |
| **SCN-A08** | **Established** | Exact telemetry is not required for a useful Scenario; qualitative state is valid and generally preferred in the initial interface. |
| **SCN-A09** | **Established** | The data model should remain capable of carrying supported numerical values so future exact controls do not require structural redesign. |
| **SCN-A10** | **Established** | Scenario state uses the existing evidence/provenance conventions rather than creating a parallel uncertainty system. |
| **SCN-A11** | **Established** | Scenario state should remain meaningful across Explore tiers through aggregation and resolution. |
| **SCN-A12** | **Established** | Scenario catalogs may vary substantially among Reference Systems because architectural learning value takes priority over catalog uniformity. |
| **SCN-A13** | **Established** | A target of roughly two to four Scenarios per Reference System is useful for initial content planning but is not a universal requirement. |
| **SCN-A14** | **Established** | Full temporal simulation, named-Scenario composition, and generic user editing are outside the initial Scenario scope. |
| **SCN-A15** | **Established** | Generic ideas such as “network congestion” may recur across systems, but each Scenario must instantiate them against the actual destination configuration rather than assuming cross-system equivalence. |

## 4.6 Future considerations and implementation dependencies

### SCN-F01 — Bounded user Scenario modification
**Status: Deferred — planned compatibility direction**

A future version may allow users to modify a selected named Scenario through bounded controls that are valid for the active configuration and entity types, such as failing/degrading a supported component, adjusting workload intensity, changing qualitative network pressure, or activating a supported redundant route.

The initial implementation should preserve a clean state-model boundary for such overrides, but Option B functionality is not part of the initial interface and should not complicate initial authoring unnecessarily.

### SCN-F02 — General-purpose Scenario editing / Sandbox
**Status: Deferred — future Sandbox direction**

Fully generic Scenario construction, arbitrary metric/state editing, user-authored causal logic, and similar open-ended capabilities are deferred to a later phase and should be considered together with Sandbox mode.

The immediate design need only avoid unnecessary restrictions that would make later experimentation impossible.

### SCN-F03 — Exact numerical controls
**Status: Deferred interface capability**

The initial interface should primarily present qualitative Scenario state. The data model should nevertheless support exact numerical values where documented or deliberately defined so that future numeric controls can be added without a major Scenario-model restructure.

### SCN-I01 — Scenario storage/schema organization
**Status: Established implementation organization**

The current configuration files contain `default_scenario` as the minimal Scenario representation. The Version-1 implementation uses **modular companion Scenario catalogs scoped to one Reference Configuration** rather than expanding ordinary Scenario authoring inline inside already-large Reference-System files. Scenario identity remains configuration-local, catalogs remain data-driven, and every target is validated against the owning configuration's entities/connections.

Exact filenames, schema nesting, and migration mechanics are implementation details recorded in `Delivery_Rendering_and_Platform_Implementation_Plan.md`; they do not create global Scenario identity or change the Scenario semantics in this section.

### SCN-I02 — Curated Scenario catalog authoring
**Status: Established content policy / implementation task**

Exact named Scenarios are selected per Reference System during scenario authoring and system-specific research. A practical target remains approximately two to four Scenarios per Reference System, selected for architectural relevance and learning value rather than uniform category coverage. Every Reference Configuration has at least one named Scenario and exactly one Default Scenario. Adding further curated Scenarios is a data/content operation rather than a core-architecture change.

## 4.7 Interactions with Explore

**Status: Established**

Explore and Scenario Context answer different questions:

- **Explore:** What exists, where is it, and how is it structurally connected?
- **Scenario:** What is happening in or to that fixed architecture under the current operating condition?

Scenario state may affect visible health/status, utilization, traffic, data-flow emphasis, active/inactive connections, bottleneck indication, power/thermal state, workload placement, failure state, and higher-level aggregate summaries.

Scenario state must not alter canonical home, containment ancestry, home tier, physical entity identity, entity type, product identity, or Organizational inventory classification.

Failed or inactive infrastructure remains part of the physical model and should normally remain inspectable. Scenario state follows semantic zoom: lower-level conditions may aggregate into higher-level summaries and resolve again as the user drills into the architecture.

Functional lenses remain separate from Scenario state. A network-bottleneck Scenario may emphasize affected networking objects, but does not itself activate the future Backend Network Lens.

## 4.8 Interactions with Navigation and Orientation

**Status: Established**

Scenario Context remains one of the persistent orientation facts defined by Navigation.

Selecting another named Scenario should:

- preserve the active Reference System and Reference Configuration;
- preserve structural location;
- preserve current tier;
- preserve containment path;
- preserve current selection where valid; and
- change only Scenario Context and Scenario-dependent presentation/state.

Changing Scenario does not create an Explore Structural History or Application Navigation History entry and does not automatically navigate to an affected object.

If a selected object becomes failed, inactive, degraded, or otherwise affected under the newly selected Scenario, it remains selected because its physical identity has not changed.

Switching Reference Configurations continues to apply the destination's default Scenario and reset structural location according to the existing Navigation rules. A prior non-default Scenario selection is not automatically restored in the baseline design.

## 4.9 Interactions with Reference Systems and Configurations

**Status: Established**

A Reference Configuration owns the set of Scenario definitions that are valid against its architecture. The conceptual relationship is:

`Reference System → Reference Configuration → physical hierarchy / cross-connections + named Scenario catalog`

The distinction remains:

> **Reference Configuration = which physical architecture exists.**  
> **Scenario = under what operating conditions that architecture is being examined.**

Scenario content must obey the same fidelity principles as Reference-System content:

- unsupported system-specific behavior must not be invented;
- black-box boundaries remain black boxes;
- documented/inferred/simplified/unknown/proprietary distinctions remain available;
- architecture-specific claims should be supportable; and
- educational simplification is acceptable when clearly represented as such.

`product_identity`, inventory classification, stable IDs, and containment do not change under Scenario state.

`entity_type` is the intended basis for determining which Scenario capabilities, states, metrics, and future controls are applicable to a component. The controlled `entity_type` vocabulary is finalized in Reference-System schema 1.2.0. Richer Scenario validation uses the data-driven type-to-capability registry established under REF-I01 and detailed in the implementation companion.

The current YAML corpus's `default_scenario` objects should be treated as the minimal first form of this richer Scenario model. Expanding the schema to support complete named Scenario catalogs must not invalidate the established physical hierarchy or require system-specific application code for ordinary Scenario additions.

## 4.10 Scenario summary invariant

**Status: Established**

> **A Scenario is a configuration-local, declarative operating-state overlay that explains what is happening in or to a fixed Reference Configuration. It may modify workload, health, utilization, traffic, active paths, performance conditions, failures, and related dynamic state without changing canonical physical identity or containment. The initial interface uses one curated named Scenario at a time, with qualitative state preferred over unsupported numerical precision and future bounded editing preserved as an extensibility direction rather than baseline functionality.**

---

# 5. Concepts

## 5.1 Purpose and scope

**Status: Established**

Concepts is the project's **global explanatory knowledge layer**. It provides reusable explanations of ideas, mechanisms, technologies, protocols, topologies, operations, metrics, abstractions, workflows, and other learning subjects whose primary purpose is understanding rather than physical containment.

Concepts remains a distinct view from Explore. Explore answers **what physically exists, where it is, and how it is structurally connected**. Concepts answers **how and why the underlying ideas work, what tradeoffs they create, and where they appear across architectures**.

The Concept Library is global rather than configuration-local. A Concept such as RDMA, HBM, tensor parallelism, Clos topology, or latency should normally have one canonical explanation that may link to many Reference Configurations. Configuration-specific behavior and examples belong in explicit Concept–Architecture Links rather than duplicate Concept records.

The initial implementation uses an **Architecture-Anchored Foundational Library**: Concept coverage should be fairly comprehensive for understanding the included architectures, but should not attempt exhaustive coverage of the full Organizational Content Inventory. Excessive detail that does not materially improve understanding should be deferred so that Concepts supports rather than overwhelms the core learning experience.

## 5.2 Core terminology

| Term | Status | Definition |
|---|---|---|
| **Concept** | **Established** | A reusable explanatory unit representing an idea, mechanism, technology, protocol, topology, operation, metric, abstraction, principle, workflow, comparison, or other subject whose primary purpose is understanding rather than physical containment. |
| **Concept Library** | **Established** | The global collection of canonical Concepts available independently of any one Reference System or Reference Configuration. |
| **Concept Record** | **Established** | The authoritative content record for one Concept, including stable identity, explanation, organizational mappings, relationships, aliases, sources, and related explanatory metadata. |
| **Concept ID** | **Established** | A stable, global machine-readable identifier for a Concept. Unlike Reference-Configuration entity IDs, Concept IDs are intentionally reusable across systems and configurations. |
| **Concept Name** | **Established** | The canonical user-facing name of a Concept. The display name may evolve editorially without changing Concept ID. |
| **Concept Kind** | **Established descriptive metadata** | A broad classification of the Concept's explanatory nature. It supports browsing, filtering, and presentation but does not control physical behavior like `entity_type`. |
| **Inventory Mapping** | **Established** | A mapping from a Concept into one or more locations in the Organizational Content Inventory. Inventory placement organizes coverage and browsing; it does not define Concept identity. |
| **Primary Inventory Home** | **Established** | The Concept's default Organizational Content Inventory location when one hierarchy/path must be shown. A Concept may also have secondary inventory mappings. |
| **Concept Relationship** | **Established** | An explicit typed semantic relationship between two Concepts. |
| **Prerequisite** | **Established** | A Concept whose basic understanding materially helps a learner understand another Concept. It is a learning dependency, not a physical containment relationship or access gate. |
| **Concept–Architecture Link** | **Established** | An explicit relationship between a global Concept and a configuration-local entity, connection, or broader architectural context showing where or how that Concept appears in a real system. |
| **Concept Occurrence** | **Established** | A concrete architectural manifestation of a Concept in a particular Reference Configuration, represented through a Concept–Architecture Link. |
| **Concept-Link Role** | **Established** | The semantic role describing how an occurrence relates to the Concept, such as **embodies**, **uses**, **illustrates**, **applies_to**, or **measured_at**. |
| **Contextual Example** | **Established** | Configuration-specific explanatory material showing how a global Concept manifests in a particular system without modifying the Concept's global definition. |
| **Concept Alias** | **Established** | A recognized acronym, abbreviation, alternate term, or common spelling that resolves to the canonical Concept rather than creating a duplicate Concept. |
| **Concept View Context** | **Established** | The Reference System, Reference Configuration, Scenario, and originating Explore state retained while the user is examining Concepts. The Concept itself remains global even when its presentation is context-aware. |
| **Cross-View Origin** | **Established** | The Explore object/location from which the user entered Concepts, retained so the user can return to the same physical context. |
| **Concept Source / Evidence** | **Established** | Supporting documentation for global Concept content or configuration-specific Concept occurrences. Global Concept evidence and system-specific occurrence evidence may be different. |

### Concept-kind baseline

**Status: Established**

The canonical `concept_kind` machine identifiers are:

| Identifier | Meaning / examples |
|---|---|
| `principle` | Locality, abstraction, scalability, fault tolerance. |
| `mechanism` | Caching, congestion control, memory coherence. |
| `protocol_standard` | Ethernet, RoCE, CXL. |
| `topology` | Clos, torus, Dragonfly, Boardfly. |
| `operation_workflow` | All-reduce, checkpointing, prefill, decode. |
| `metric` | Latency, throughput, time to first token, model FLOPs utilization. |
| `software_abstraction` | Tensor parallelism, Kubernetes Pods, FSDP. |
| `hardware_technology` | HBM, NVLink, optical switching, 800 VDC distribution. |
| `comparison_distinction` | Scale-up versus scale-out, copper versus fiber. |

Concept kind is descriptive metadata rather than a second behavior taxonomy. It may guide organization and presentation but does not determine Explore or Scenario behavior. Display labels may use spaces or punctuation, but authored YAML uses the exact identifiers above.


## 5.3 Initial Concept-Library baseline

**Status: Established baseline**

The initial version uses an **Architecture-Anchored Foundational Library** rather than exhaustive inventory coverage.

The initial Concept Library should provide fairly comprehensive coverage of the knowledge required to understand the included Reference Systems and should, at minimum, cover:

1. every Concept link exposed by the **initial five Reference Systems**;
2. the direct prerequisite/foundational Concepts needed to understand those linked Concepts; and
3. the major cross-cutting backbone topics necessary to understand the included architectures coherently, including networking, memory, data movement, distributed computation, training/inference, power/thermal behavior, reliability, and other architecture-relevant foundations.

Coverage beyond that baseline should be added when it materially improves the learning experience. The project does **not** require every Organizational Content Inventory item to become a standalone Concept page before the core product ships.

The exact initial Concept count should therefore be determined by a Concept-link/prerequisite coverage audit rather than by an arbitrary numeric target.

A much larger or near-exhaustive Concept Library is a valid future direction, but it is deferred until after the core product is complete. Future expansion should preserve the same Concept identity, relationship, and cross-view rules rather than require a new model.

## 5.4 Concept rules

#### CON-001 — Concepts form a global library rather than configuration-local copies
**Status: Established**

A Concept such as RDMA, HBM, torus, tensor parallelism, or latency should normally have one canonical Concept record even when it appears in many Reference Systems or Configurations.

Configuration-specific behavior belongs in occurrences/contextual examples rather than duplicate Concept definitions.

#### CON-002 — Concept identity is independent of Organizational inventory placement
**Status: Established**

A Concept ID must not be derived from its Organizational Content Inventory path.

The inventory organizes project scope and content; Concept identity represents semantic identity. A cross-cutting Concept may therefore remain one Concept even when it appears in several inventory contexts.

#### CON-003 — A Concept may have multiple inventory mappings but one primary organizational home
**Status: Established**

A Concept may map to multiple valid Organizational Content Inventory locations when it is genuinely cross-cutting. Exactly one mapping should be designated the **Primary Inventory Home** when a single browsing path or breadcrumb is required.

Secondary mappings improve discoverability without creating duplicate Concept records.

#### CON-004 — One semantic Concept should normally have one canonical record
**Status: Established**

System- or vendor-specific copies should not be created merely because the same Concept appears in several architectures.

For example, RoCE should remain one global Concept with multiple configuration-specific occurrences rather than separate DGX, Meta, xAI, or OCI RoCE Concepts.

#### CON-005 — Materially different technologies remain separate Concepts
**Status: Established**

Concept reuse must not erase meaningful technical distinctions.

Examples:

- RDMA and RoCE are related but not identical Concepts;
- RoCE and RoCEv2 may remain distinct where the difference materially affects learning; and
- scale-up and scale-out remain distinct Concepts even if a comparison Concept also explains their relationship.

Aliases are for alternate names, not for technically distinct mechanisms.

#### CON-006 — Physical subjects may exist simultaneously as Explore entities and Concepts
**Status: Established**

A physical technology such as HBM, NVLink, an optical circuit switch, or an 800 VDC power sidecar may have both:

1. a physical manifestation in Explore when it exists in the active Reference Configuration; and
2. a global Concept explaining how the technology works and why it matters.

These are complementary representations rather than duplicated physical objects.

#### CON-007 — Concept records use layered explanatory content
**Status: Established**

A Concept Record should support, where relevant:

- canonical name and aliases;
- short summary;
- why it matters;
- core explanation;
- how it works / mechanism;
- key tradeoffs or limitations;
- examples / applications;
- prerequisites;
- related/contrasting/specialized Concepts; and
- sources / further reading.

Not every Concept must populate every optional section.

#### CON-008 — One Concept record serves multiple knowledge depths
**Status: Established**

The initial model should not create separate beginner, intermediate, and advanced identities for the same Concept.

A single Concept should support progressive disclosure of detail. Future Guided Modes may choose how much of that content to expose, but they should not duplicate Concept identity.

#### CON-009 — Aliases and acronyms are first-class metadata
**Status: Established**

Recognized acronyms, abbreviations, alternate terms, and common spellings should resolve to the canonical Concept.

Examples include RDMA for Remote Direct Memory Access, TTFT for Time to First Token, and CXL for Compute Express Link.

#### CON-010 — Concept-to-Concept relationships are typed
**Status: Established**

The initial Concept graph should support four relationship families:

- **prerequisite** — one Concept should generally be understood before another;
- **specializes** — one Concept is a narrower or specialized form of another;
- **contrasts_with** — the Concepts are usefully compared or distinguished; and
- **related** — a meaningful explanatory relationship that does not fit the other families.

This vocabulary should remain small initially rather than becoming a large general-purpose ontology.

#### CON-011 — Prerequisites describe direct learning dependencies only
**Status: Established**

Prerequisite edges should represent direct learning dependencies rather than every transitive dependency.

If A is a prerequisite for B and B is a prerequisite for C, A does not need a separate prerequisite edge to C unless that direct relationship independently improves understanding.

#### CON-012 — Prerequisite relationships must be acyclic
**Status: Established**

The prerequisite graph must not contain cycles. Other relationship types may form cycles when semantically appropriate.

#### CON-013 — Prerequisites are advisory, not access controls
**Status: Established**

Users may open any Concept at any time. The interface may recommend prerequisites but should not block access based on prerequisite completion.

Enforced sequencing, if ever desired, belongs to future Structured Learning Paths rather than the Concept model itself.

#### CON-014 — Concept–Architecture Links must be explicit
**Status: Established**

A Concept should link to a Reference Configuration only when that architecture provides a meaningful occurrence of the Concept.

The system should not automatically infer every possible Concept from `entity_type`, product names, or inventory classification. Explicit links preserve educational relevance and avoid turning the inventory into a checklist.

#### CON-015 — Concept–Architecture Links should use stable Concept IDs
**Status: Established target data contract**

Once the canonical Concept Library is implemented, Reference-Configuration Concept links should identify Concepts through stable global `concept_id` values rather than using display names as identity.

The current configuration `concept_links` representation should be treated as a transitional seed for this richer contract.

#### CON-016 — Concept links may target entities, connections, or configuration-level architecture
**Status: Established**

Concept–Architecture Links should be able to target:

- configuration-local canonical entities, including Aggregate Entities and Addressable Members;
- configuration-local connections/relationships; and
- broader configuration-level architectural context where no single entity or connection is the correct occurrence.

Representative Member Contexts are not independent canonical occurrence targets; their Concept affordances resolve through the Aggregate Entity unless an Addressable Member owns an explicit occurrence under AGG-017.

This is necessary because many Concepts—such as RoCE, topology-aware placement, or scale-up—are fundamentally relational or system-level rather than tied to one component.

#### CON-017 — Concept–Architecture Links use a small typed role vocabulary
**Status: Established**

The initial Concept-link roles should be:

- **embodies** — the target physically realizes the Concept;
- **uses** — the target uses or participates in the Concept;
- **illustrates** — the target is a useful example of a broader Concept;
- **applies_to** — the Concept is relevant to the target without being physically embodied by it; and
- **measured_at** — a metric Concept is meaningfully observed at the target.

These roles describe explanatory relationship, not containment or physical ownership.

#### CON-018 — Global explanation and system-specific explanation remain separate
**Status: Established**

The canonical Concept Record explains the general idea once. Architecture-specific claims belong in configuration-specific occurrences/contextual examples.

A system-specific implementation must not silently redefine the global Concept.

#### CON-019 — Global Concept evidence and occurrence evidence remain distinct
**Status: Established**

Evidence supporting a general Concept is different from evidence supporting a specific system's implementation of that Concept.

A well-established global Concept may therefore have a configuration-specific occurrence whose evidence is documented, inferred, simplified, unknown, or proprietary according to the established project conventions.

#### CON-020 — Concept coverage is relevance-based rather than exhaustive
**Status: Established**

Reference Configurations do not need links to every Concept that is technically applicable, and the Concept Library does not need a page for every inventory item merely to achieve completeness.

Concepts and links should be included when they materially improve understanding of the architecture or surrounding systems ideas.

#### CON-021 — The Concept Library is global but context-aware
**Status: Established**

While the user is examining a Concept, the active Reference System/Configuration should remain known when a valid Explore context exists.

The Concept view may therefore emphasize:

- **Where this appears in the current system**; and
- **Other Reference Systems that illustrate it**.

The full Concept Library remains available even when the current system does not demonstrate the Concept.

#### CON-022 — Current-system relevance should be emphasized, not used as a hard filter
**Status: Established**

Concepts linked to the active Reference Configuration may be ranked, grouped, or highlighted for relevance, but unrelated Concepts should remain searchable and browseable.

A hard system-only filter would undermine learning about architectural alternatives.

#### CON-023 — Explore → Concepts preserves physical context
**Status: Established**

Opening a Concept from Explore preserves the current:

- Reference System;
- Reference Configuration;
- Scenario;
- structural location;
- tier;
- containment path;
- selection; and
- Cross-View Origin.

Changing to the Concepts view does not itself change physical state.

#### CON-024 — Concept → Explore traversal is deliberate
**Status: Established**

A Concept may expose several physical occurrences. The user should deliberately choose which occurrence to visit rather than having the application silently choose one.

For an occurrence within the current Reference Configuration, the current Scenario is preserved and Explore reconstructs the target's canonical physical context using the established contextual-jump/navigation rules.

For an occurrence in another Reference System or Configuration, the system change must be explicit and the normal configuration-switch behavior applies, including activation of the destination default Scenario.

#### CON-025 — Returning from a Concept restores the originating Explore state when still valid
**Status: Established**

If a Concept was opened from Explore and the user has not deliberately chosen another physical occurrence, returning to Explore should restore the originating physical context.

#### CON-026 — Concept-to-Concept browsing does not mutate Explore state
**Status: Established**

Moving among Concepts changes Concept-view state only. The underlying Explore system, configuration, Scenario, structural location, tier, containment path, and selection remain unchanged unless the user deliberately traverses to a physical occurrence.

#### CON-027 — Concept browsing does not enter Explore Structural History
**Status: Established**

Concept-to-Concept browsing should not create entries in Explore Structural History.

Concepts uses Concept Browse History and application-level Back/Forward; Concept browsing is not part of Explore Structural History.

#### CON-028 — Scenario state may affect Concept relevance but not Concept truth
**Status: Established**

An active Scenario may make certain Concepts more relevant or prominent—for example congestion control during a network-bottleneck Scenario—but it does not alter the canonical Concept definition.

Scenario describes current operating state; Concept describes explanatory knowledge.

#### CON-029 — Concepts and Functional Lenses remain distinct
**Status: Established**

A Concept may explain a cross-cutting subsystem such as backend networking, while a future Functional Lens may visually emphasize that subsystem throughout Explore.

Opening a Concept must not automatically enable or modify Functional Lens state.

#### CON-030 — Proprietary implementation does not prevent explanation of the public Concept
**Status: Established**

A Concept may explain a public/general mechanism even when a particular vendor implementation is proprietary or incompletely documented.

The system-specific occurrence must stop at the supported boundary rather than invent hidden implementation detail.

#### CON-031 — Concept sources should remain available without dominating the learning view
**Status: Established**

Concept records should expose a readily available but visually secondary **Sources / Further Reading** area.

Evidence uncertainty should be surfaced more prominently only when it materially affects interpretation.

#### CON-032 — Concept authoring should be data-driven and independent of application code
**Status: Established implementation requirement**

Adding or revising a Concept, alias, source, relationship, or occurrence should normally be a content/data operation rather than requiring custom application logic.

#### CON-033 — Concept validation should be cross-file and graph-aware
**Status: Established implementation requirement**

The eventual Concept data contract should validate at least:

- globally unique Concept IDs;
- required canonical names/summaries;
- valid Organizational Content Inventory mappings;
- exactly one Primary Inventory Home where inventory mappings exist;
- valid aliases;
- valid Concept-relationship targets;
- absence of prerequisite cycles;
- absence of dangling Concept IDs in Reference Configurations;
- valid entity/connection/configuration targets for occurrences; and
- valid source/evidence references.

#### CON-034 — Current Reference-Configuration `concept_links` are seeds, not the entire Concept Library
**Status: Established**

The existing configuration YAMLs intentionally contain a small number of architecture-relevant Concept links. These links should seed the physical-occurrence mapping but must not define the full scope of the Concept Library.

The initial library is determined by architecture-anchored learning coverage, prerequisites, and foundational topics rather than by the number of current YAML `concept_links` alone.

#### CON-035 — No Concept is required to have a physical occurrence
**Status: Established**

Some Concepts may be globally important even if no included Reference Configuration exposes them cleanly or directly.

Concepts is a knowledge layer, not merely an index of visible hardware.

#### CON-036 — No physical entity is required to have a Concept link
**Status: Established**

A physical component may have no Concept links when additional explanation would add little educational value.

Requiring links for every object would create noise and encourage shallow or redundant content.

## 5.5 Assumptions and constraints

| ID | Status | Assumption / constraint |
|---|---|---|
| **CON-A01** | **Established** | Concepts is a distinct explanatory view rather than another Explore tier or an overlay-only mechanism. |
| **CON-A02** | **Established** | Concept identity is global; physical entity identity remains configuration-local. |
| **CON-A03** | **Established** | The Organizational Content Inventory organizes Concept coverage but does not define Concept identity or behavior. |
| **CON-A04** | **Established** | One Concept may map to multiple inventory locations and many physical/configuration occurrences. |
| **CON-A05** | **Established** | A physical technology may simultaneously have a physical Explore representation and a Concept explanation without being considered duplicated physical content. |
| **CON-A06** | **Established** | Global Concept explanations remain system-independent; system-specific differences belong in occurrence/contextual-example metadata. |
| **CON-A07** | **Established** | Concept prerequisites guide learning but do not gate access. |
| **CON-A08** | **Established** | Progressive disclosure is preferable to separate beginner/intermediate/advanced identities for the same Concept. |
| **CON-A09** | **Established** | Concepts may be browsed independently of the active Reference Configuration while current-system relevance remains visible. |
| **CON-A10** | **Established** | Concept browsing does not change physical structural state or Explore Structural History. |
| **CON-A11** | **Established** | Global Concept content and configuration-specific occurrences may have different provenance/evidence. |
| **CON-A12** | **Established** | Concept authoring and Concept–Architecture linking should remain data-driven and extensible. |
| **CON-A13** | **Established** | The initial Concept Library is fairly comprehensive for the included architectures but is not exhaustive across the full Organizational Content Inventory. |
| **CON-A14** | **Established** | Guided learning paths may later consume Concept prerequisites and relationships, but Guided Modes do not own the Concept graph. |
| **CON-A15** | **Established** | Concepts preserve meaningful technical distinctions rather than forcing architecture-independent uniformity. |
| **CON-A16** | **Established** | Excessive explanatory depth that does not materially improve understanding should be deferred to protect the core learning experience from information overload. |

## 5.6 Future considerations and implementation dependencies

### CON-F01 — Expanded / near-exhaustive Concept Library
**Status: Deferred — future feature**

A future phase may substantially expand the Concept Library toward much broader Organizational Content Inventory coverage after the core product is complete.

This is not a launch requirement. Expansion should remain selective enough to preserve navigability and avoid overwhelming users, and should reuse the same global Concept IDs, relationship model, inventory mappings, and occurrence-link semantics established for the initial library.

### CON-F02 — Guided learning over the Concept graph
**Status: Deferred — future Guided Modes direction**

Future Structured Learning Paths may use Concept prerequisites and relationships to sequence content, but they should consume the established Concept graph rather than creating a separate Concept hierarchy.

### CON-I01 — Concept storage and authoring format
**Status: Established current authoring contract**

The canonical Concept source uses the existing **hybrid YAML + Markdown** structure, with one metadata record and one explanatory content file per Concept:

- `metadata/<concept_id>.yaml` — stable identity, kind, summary, aliases, inventory mappings, relationships, tags, and sources; and
- `content/<concept_id>.md` — explanatory prose and progressive learning content.

Concept IDs remain global/stable; the YAML `content_file` reference must resolve to the matching canonical Markdown content. Generated indexes, rendered HTML, or runtime JSON may be derived from these sources, but they do not become independently authored Concept sources of truth.

**Rationale:** This format is already implemented and validated by the current Concept Library and cleanly separates structured graph/query metadata from long-form educational content.

### CON-I02 — Migration of configuration `concept_links` to global Concept IDs
**Status: Established schema direction; migration execution remains**

Reference-Configuration Concept occurrence links use the established canonical form: a stable global `concept_id`, an explicit Concept-link role, and exactly one explicit architecture target of type **entity**, **connection**, or **configuration**. The migration must preserve existing physical hierarchy and configuration-local identity.

Legacy compatibility may remain temporarily during development, but RDY-010 requires all user-facing links in initial Ship-Ready configurations to use the canonical form and resolve to validated Concept content. Concrete migration tooling and the coordinated schema revision are maintained in `Delivery_Rendering_and_Platform_Implementation_Plan.md`.

### CON-I03 — Concept search, indexing, and visualization
**Status: Established Version-1 scope; implementation technology resolved in companion**

Version 1 provides searchable Concept browsing and navigable prerequisite/related/contrast/specialization relationships, but it does **not** require a dedicated graphical Concept-graph visualization. Relationship lists/links are sufficient for the initial learning experience. Contextual examples and Concept occurrences may be assembled from derived indexes without becoming independently authored data.

The chosen client-side search/indexing, Markdown rendering, caching, and reverse-occurrence strategy are technical implementation decisions recorded in `Delivery_Rendering_and_Platform_Implementation_Plan.md` and must not alter the semantic Concept graph defined here.

## 5.7 Interactions with Explore

**Status: Established**

Explore and Concepts have separate ownership boundaries:

- **Explore:** what physically exists, where it is, how it is contained, and how it is physically/structurally connected;
- **Concepts:** how and why mechanisms, technologies, protocols, topologies, metrics, workflows, abstractions, and principles work.

A Concept–Architecture Link connects these views without changing physical structure.

Concept links do **not**:

- establish containment;
- create canonical homes;
- change Explore tiers;
- change entity identity;
- change `entity_type`;
- create physical connections; or
- replace inventory classification.

Physical subjects may appear in both views for different purposes. For example, an HBM stack may be a physical Explore entity while the HBM Concept explains bandwidth, capacity, packaging, and system implications.

Abstract topics such as tensor parallelism, congestion control, or scaling efficiency do not need artificial physical Explore objects. They remain Concepts and link back to the physical entities/connections/configurations where they become meaningful.

## 5.8 Interactions with Navigation and Orientation

**Status: Established**

Concept browsing creates a Concept-view navigation domain without redefining structural Navigation.

The state model should preserve the distinction:

`Physical state = System + Configuration + Scenario + Structural Location + Tier + Containment Path + Selection`

`Concept state = Current Concept + Concept browsing context/history + Cross-View Origin`

Opening a Concept from Explore preserves physical state. Moving Concept-to-Concept changes Concept state only and does not create Explore Structural History entries.

Returning to Explore restores the originating physical state when still valid unless the user deliberately chooses another physical occurrence.

A deliberate Concept → Explore occurrence traversal uses the existing contextual-jump behavior. If the destination is in another Reference System/Configuration, the configuration change is explicit and normal destination-default-Scenario/reset rules apply.

The active Scenario may influence which Concepts or occurrences are emphasized, but does not change canonical Concept definitions.

## 5.9 Interactions with Reference Systems and Configurations

**Status: Established**

Reference Configurations reference the global Concept Library; they do not own or duplicate canonical Concept definitions.

Conceptually:

`Global Concept Library ↔ Reference-Configuration Concept–Architecture Links ↔ configuration-local entities / connections / architecture`

The target data contract should evolve from the current configuration `concept_links` toward:

`stable concept_id + occurrence target(s) + Concept-link role + contextual explanation/evidence`

without changing the underlying physical hierarchy.

This provides legitimate cross-system commonality without creating shared physical identity. Entities in several configurations may remain distinct configuration-local objects while pointing to the same global Concept.

Concept occurrence links should obey the same fidelity principles as other Reference-System content:

- unsupported system-specific claims must not be invented;
- black-box boundaries remain respected;
- configuration-specific evidence remains documented/inferred/simplified/unknown/proprietary as appropriate; and
- educational relevance takes priority over exhaustive linking.

Adding a Concept to the global library does **not** force every Reference Configuration to acquire a corresponding occurrence link. A configuration should add a Concept link only when the architecture genuinely demonstrates the Concept and the connection is useful to the learning model.

## 5.10 Concept summary invariant

**Status: Established**

> **A Concept is a globally identified explanatory unit that describes an idea, mechanism, technology, protocol, topology, metric, workflow, abstraction, or other learning subject independently of any single Reference Configuration. Concepts are organized—but not identified—by the Organizational Content Inventory, connected through a small typed knowledge graph, and linked explicitly to configuration-local physical occurrences. Concepts and Explore remain separate views with shared context: Explore shows where and what the system physically is; Concepts explains how and why its underlying ideas work. The initial Concept Library is architecture-anchored and fairly comprehensive for the included systems without requiring exhaustive coverage.**

---

# 6. Cross-View Integration

## 6.1 Purpose and scope

**Status: Established**

Cross-View Integration defines how the **Explore** and **Concepts** views share architectural context while retaining distinct view-local state and navigation semantics.

The governing model is:

> **Explore and Concepts are separate stateful views operating over shared Architectural Context.**

The integration layer should preserve orientation without forcing one view to imitate the other. Explore remains responsible for physical/spatial navigation and selection; Concepts remains responsible for explanatory/knowledge navigation. Explicit Concept–Architecture Links connect the two views and may create returnable context, while ordinary view switching simply changes which workspace is active.

The initial design assumes one active primary view at a time. Split/pinned presentations may be added later without changing the underlying state ownership rules.

## 6.2 Core terminology

| Term | Status | Definition |
|---|---|---|
| **Active View** | **Established** | The primary view currently presented to the user. Initial values are **Explore** and **Concepts**. |
| **Architectural Context** | **Established** | The shared system-level context consisting of the active **Reference System**, **Reference Configuration**, and **Scenario**. It is global across views when present. |
| **Context-Free Concepts State** | **Established** | A valid Concepts state with no active Architectural Context. Concepts may be browsed globally without first selecting a Reference System. Explore cannot operate without valid Architectural Context. |
| **Explore State** | **Established** | View-local physical-navigation state: structural location, current tier, canonical containment path, physical selection, selection relationship to the view, traversal context, Explore filters, and future Functional Lens state. |
| **Concepts State** | **Established** | View-local knowledge-navigation state: current Concept, Concept browsing context/history, Concept search/query state, Concept filters, and related Concepts-view interaction state. |
| **Dormant View State** | **Established** | State belonging to an inactive view that remains retained but does not actively affect the displayed view. |
| **Cross-View Transition** | **Established** | A transition in which Active View changes between Explore and Concepts. |
| **Direct View Change** | **Established** | A user action whose purpose is simply to switch views without asserting a semantic relationship between a specific source and destination. |
| **Contextual Link** | **Established** | An explicit semantic link from a specific object/context in one view to a specific meaningful destination in the other, such as `GPU → HBM Concept` or `RoCE Concept → Meta RoCE fabric occurrence`. |
| **Cross-View Origin** | **Established** | The Explore object/location from which a contextual Explore → Concepts transition originated. |
| **Return Context** | **Established** | A validated semantic snapshot that allows an explicit return action to restore the context from which a contextual cross-view transition originated. `Cross-View Origin` is the Explore-origin form of Return Context. |
| **Concept Return Context** | **Established** | The Concepts state retained when a user deliberately traverses from a Concept to a physical occurrence, allowing an explicit return to that Concept. |
| **Application Navigation History** | **Established** | Chronological history used by application-level **Back** and **Forward** across both views. It is distinct from Explore Structural History. |
| **Explore Structural History** | **Established** | History of meaningful physical-location changes inside Explore. |
| **Concept Browse History** | **Established** | Concepts-view navigation among Concept destinations. It does not enter Explore Structural History. |
| **Context Degradation** | **Established** | Safe fallback from stale or no-longer-representable state to the closest valid semantic context without guessing identity or equivalence. |
| **Context Locator** | **Established conceptual term** | Stable IDs and structural information sufficient to reconstruct semantic state. It should not depend on rendered geometry, pixel coordinates, or other ephemeral presentation details. |

### State layering baseline

**Status: Established**

The initial conceptual state model is:

`Application State → Active View + shared Architectural Context + Explore State + Concepts State + Cross-View Integration State`

Cross-View Integration State includes transition type, Return Context, and Application Navigation History.

## 6.3 State ownership and persistence

**Status: Established**

| State | Owner | Explore → Concepts | Concepts → Explore | Notes |
|---|---|---|---|---|
| **Active View** | Application | Change | Change | One active primary view initially. |
| **Reference System** | Shared Architectural Context | Preserve | Preserve | May be absent in Context-Free Concepts State; required by Explore. |
| **Reference Configuration** | Shared Architectural Context | Preserve | Preserve | Configuration changes affect both views. |
| **Scenario** | Shared Architectural Context | Preserve | Preserve | May affect relevance/presentation but not canonical Concept truth. |
| **Structural Location** | Explore | Retain dormant | Restore | Not translated into Concept hierarchy. |
| **Tier** | Explore | Retain dormant | Restore/recompute if needed | Still follows Structural Location in the initial design. |
| **Containment Path** | Explore | Retain dormant | Restore/recompute | Reconstruct from current canonical containment when stale. |
| **Physical Selection** | Explore | Retain dormant | Restore if valid | Does not become Current Concept. |
| **Preview Target** | Explore UI | Clear | None | Ephemeral Inspect state; never part of Return Context or history. |
| **Detail Visibility** | Explore UI | Retain dormant | Restore | Presentation-only state; does not change Selection or Return Context semantics. |
| **Traversal Context** | Explore | Retain dormant | Restore if valid | Distinct from Cross-View Origin. |
| **Explore filters** | Explore | Retain dormant | Restore | Invalid values may be pruned after context changes. |
| **Functional Lens state** | Explore | Retain dormant | Restore where valid | Future feature; does not affect Concepts. |
| **Current Concept** | Concepts | Set/preserve according to transition | Retain dormant | Does not alter physical Selection. |
| **Concept search/query** | Concepts | Preserve or initialize | Retain dormant | View-local. |
| **Concept filters** | Concepts | Preserve | Retain dormant | Context-dependent filters recalculate against shared context. |
| **Concept Browse History** | Concepts | Preserve | Preserve dormant | Separate from Explore Structural History. |
| **Return Context** | Cross-View Integration | May create | May create | Created by contextual transitions, not ordinary view switching. |
| **Scroll position / expanded panels** | UI / Implementation | Best effort | Best effort | Not part of the formal semantic contract. |

#### CVI-001 — System, Configuration, and Scenario form shared Architectural Context
**Status: Established**

When valid Architectural Context exists, Explore and Concepts refer to the same active Reference System, Reference Configuration, and Scenario.

Changing any of these from either view updates the shared context rather than creating view-specific copies.

#### CVI-002 — Concepts may operate without Architectural Context
**Status: Established**

Concepts may be browsed globally without a selected Reference System or Reference Configuration.

When no Architectural Context exists:

- the global Concept Library remains fully available;
- current-system occurrence/relevance sections have no current-system context; and
- entering Explore establishes the project's normal default Reference System, valid/default Reference Configuration, and default Scenario before Explore is shown.

#### CVI-003 — Explore requires valid Architectural Context
**Status: Established**

Explore must always have a valid Reference System, Reference Configuration, and Scenario because physical hierarchy, containment, and structural navigation are configuration-dependent.

#### CVI-004 — Physical structural state is Explore-owned rather than global
**Status: Established**

Structural Location, Tier, Containment Path, physical Selection, selection relationship to view, and physical Traversal Context remain Explore state.

While Concepts is active, those values are retained as dormant state rather than translated into Concept equivalents.

#### CVI-005 — Concept navigation state is Concepts-owned
**Status: Established**

Current Concept, Concept Browse History, search/query state, and Concept filters remain Concepts state while Explore is active.

Returning to Concepts should normally restore that retained state unless the user follows a contextual link to a specific Concept.

#### CVI-006 — Physical Selection and Current Concept are independent
**Status: Established**

A physical object may remain selected in dormant Explore state while a Concept is active in Concepts. Neither state silently replaces the other.

#### CVI-007 — View-local filters remain local
**Status: Established**

Explore filters do not filter the Concept Library, and Concept filters do not hide physical Explore entities.

Both normally survive cross-view transitions within the active session. Context-dependent filters should recalculate or prune only incompatible values after architectural-context changes.

#### CVI-008 — Functional Lens state is Explore-owned and dormant in Concepts
**Status: Established**

A future active Functional Lens remains retained while Concepts is open, does not alter canonical Concept content or Concept filters, and is restored when returning to compatible Explore state.

Opening a Concept must not enable, disable, or otherwise modify Functional Lens state.

Exact cross-configuration Lens persistence remains governed by the deferred Functional Lens rules.

#### CVI-009 — View switching preserves persistent view-local state
**Status: Established**

Ordinary Explore ↔ Concepts switching preserves both views' persistent local states unless another action makes part of that state invalid. Ephemeral interaction state such as Explore Preview Target is cleared when leaving its view under SDC-030 rather than being treated as persistent cross-view state.

## 6.4 Cross-view transition rules and expected behavior

### Direct view changes and contextual links

**Status: Established**

A **Direct View Change** means **“show the other primary workspace.”** It does not imply that a selected object should be translated into a Concept or that a Concept should select an occurrence.

A **Contextual Link** means **“follow this explicit semantic relationship.”** It identifies a specific cross-view destination and may create Return Context.

#### CVI-010 — Direct Explore → Concepts restores Concepts state rather than inferring a Concept
**Status: Established**

When the user directly switches from Explore to Concepts:

1. preserve all Explore state;
2. restore the previous Concepts state if one exists;
3. otherwise open the neutral Concept Library landing/browse state;
4. current-system relevance may be emphasized when Architectural Context exists; and
5. do not automatically choose a Concept based on physical Selection.

#### CVI-011 — Direct Concepts → Explore restores current Explore state
**Status: Established**

A direct view switch to Explore restores the retained Explore state under the current shared Architectural Context.

It does not invoke special semantic-return behavior.

#### CVI-012 — Contextual Explore → Concepts opens the exact explicit Concept link
**Status: Established**

When the user follows a Concept–Architecture Link from Explore:

1. validate the target `concept_id`;
2. preserve shared Architectural Context;
3. preserve the complete valid Explore state;
4. create Cross-View Origin / Return Context;
5. activate Concepts; and
6. open the exact canonical Concept.

The interface may expose a compact cue identifying the physical source, system/configuration, and Scenario where useful.

#### CVI-013 — No Concept is inferred when no explicit link exists
**Status: Established**

If an Explore object has no explicit Concept link, the application must not infer one from `entity_type`, inventory classification, product identity, name similarity, or neighboring components.

A Direct View Change to Concepts remains available.

#### CVI-014 — Ambiguous Concept links require user choice
**Status: Established**

When an object exposes multiple relevant Concepts, the user chooses which Concept to open. The interface may rank or group choices but should not silently select one.

#### CVI-015 — Concept → Explore traversal uses explicit Concept occurrences
**Status: Established**

A Concept may expose configuration-specific physical occurrences derived from explicit Concept–Architecture Links.

The user deliberately chooses an occurrence before Explore changes.

#### CVI-016 — Same-configuration Concept → Explore traversal preserves Scenario
**Status: Established**

When the chosen occurrence belongs to the active Reference Configuration:

- preserve Reference System;
- preserve Reference Configuration;
- preserve Scenario;
- navigate to the target's real canonical structural context;
- adapt Tier to the destination; and
- select/highlight the intended target when representable under the Selection and Detail contract in Section 1.6.

If the occurrence is best represented inside an enclosing Structural Location, that occurrence may become Current Selection. If the occurrence itself becomes Structural Location, use a temporary arrival highlight rather than persisting redundant `Location: X; Selection: X` state, consistent with SDC-032 and NAV-025.

#### CVI-017 — Cross-configuration Concept → Explore traversal uses normal configuration-switch semantics
**Status: Established**

When the chosen occurrence belongs to another Reference Configuration:

1. the user explicitly chooses that system/configuration occurrence;
2. the destination configuration becomes active;
3. the destination default Scenario is applied;
4. Explore establishes the destination's valid structural model; and
5. the explicit occurrence target is then navigated to using its configuration-local identity.

The transition does not infer cross-system physical equivalence.

#### CVI-018 — Global Concept remains stable when Architectural Context changes
**Status: Established**

If the user changes Reference System, Reference Configuration, or Scenario while viewing a Concept, the same global Concept normally remains open.

Only context-aware presentation changes, such as current-system occurrences, contextual examples, or Scenario-related emphasis.

#### CVI-019 — Configuration changes from either view apply the same global rules
**Status: Established**

If a Reference Configuration changes while Concepts is active, dormant Explore state is normalized immediately according to established Reference-System rules:

- destination configuration becomes active;
- destination default Scenario applies;
- Structural Location resets to the destination's highest valid structural level;
- incompatible physical Selection is cleared; and
- Containment Path/Tier are rebuilt from the destination architecture.

The Current Concept remains open when still valid.

#### CVI-020 — Scenario changes in Concepts preserve physical structural state
**Status: Established**

A Scenario change while Concepts is active:

- updates shared Scenario Context;
- leaves Current Concept unchanged;
- preserves valid Explore Structural Location, Tier, Containment Path, and Selection; and
- may alter Concept relevance and later Explore presentation.

## 6.5 Origin and return-context behavior

#### CVI-021 — Contextual transitions create explicit Return Context
**Status: Established**

A contextual cross-view transition retains enough semantic information to restore its source meaningfully.

For Explore → Concepts, Return Context should include at minimum:

- Reference System / Reference Configuration identity;
- Scenario identity;
- Structural Location;
- Selection, if any; and
- originating Concept link / target.

Tier and Containment Path may be retained for diagnostic/presentation purposes but should be recalculated from current authoritative configuration data during restoration. View-local filters, Detail Visibility, and future Lens state remain retained separately and are restored where still valid. Preview Target is ephemeral and is never stored in Return Context.

#### CVI-022 — Concept-to-Concept browsing preserves the original Explore origin
**Status: Established**

If the user enters Concepts from Explore and then browses several related Concepts, the original Explore Return Context remains the semantic origin until the user deliberately chooses another physical occurrence or otherwise ends the contextual chain.

#### CVI-023 — Explicit Return differs from Direct View Change
**Status: Established**

An **explicit Return** means **“restore the semantic context I came from.”**

A **Direct View Change** means **“show the other workspace in its current retained state.”**

Those destinations may often coincide, but they are not semantically equivalent.

#### CVI-024 — Explicit Return restores the originating Scenario when still valid
**Status: Established**

When an explicit Return targets an originating Explore context, its saved Scenario should be restored if that Scenario still exists and is valid for the saved configuration.

This does not alter the existing rule that ordinary configuration switches do not automatically restore previously selected non-default Scenarios: explicit Return is a deliberate request to restore saved semantic origin.

#### CVI-025 — Deliberate Concept → Explore occurrence traversal ends the previous Explore-origin return chain
**Status: Established**

If a user entered a Concept from Explore and then deliberately chooses a physical occurrence, that chosen physical occurrence becomes the new active physical destination.

The previous Explore origin is no longer the primary contextual return action. Instead, Explore may expose a Concept Return Context such as **Return to HBM**. Earlier chronology remains available through Application Back history.

#### CVI-026 — Maintain one active semantic Return Context rather than a separate arbitrary return stack
**Status: Established for initial scope**

The initial application needs only one active contextual Return Context for the current cross-view chain.

Deeper chronology belongs to Application Navigation History rather than a second nested return stack.

#### CVI-027 — Return actions identify their destination
**Status: Established**

Where practical, explicit return affordances should identify the semantic destination, for example:

- **Return to GPU 5**;
- **Return to Rack 4**; or
- **Return to RDMA**.

Cross-system destinations should include enough architectural context to avoid surprise.

## 6.6 Navigation-history semantics

### History layers

**Status: Established**

Cross-view behavior uses three distinct history concepts:

1. **Application Navigation History** — chronological navigation destinations across the product;
2. **Explore Structural History** — physical Structural Location changes inside Explore; and
3. **Concept Browse History** — Concept destinations inside Concepts.

These histories may share entries/events internally in an implementation, but their semantics must remain distinct.

#### CVI-028 — Back and Forward operate on Application Navigation History
**Status: Established**

Application-level Back and Forward should cross view boundaries naturally and move among meaningful navigation destinations in chronological order.

#### CVI-029 — Application History records navigation destinations rather than ordinary state edits
**Status: Established**

| Action | Application History | Explore Structural History |
|---|---:|---:|
| Inspect / change Preview Target | No | No |
| Select/change physical object | No | No |
| Change Scenario | No | No |
| Change filter | No | No |
| Toggle Functional Lens | No | No |
| Expand/collapse panel or show/hide Detail | No | No |
| Scroll | No | No |
| Enter/move physical location | Yes | Yes |
| Follow Explore cross-connection | Yes | Yes |
| Direct physical jump | Yes | Yes |
| Open another Concept | Yes | No |
| Contextual Explore → Concept | Yes | No |
| Contextual Concept → Explore | Yes | Yes when Structural Location changes |
| Direct View Change | Yes | No |
| Explicit System/Configuration switch | Yes | No as an Explore Structural History event |
| Explicit Return action | Yes | Depends on destination |

#### CVI-030 — Scenario changes remain outside Back/Forward history
**Status: Established**

Within the same Reference Configuration, Application Back/Forward should not silently rewind Scenario selection.

Scenario changes remain state changes rather than navigation destinations.

#### CVI-031 — Back/Forward across configurations uses ordinary configuration activation
**Status: Established**

If a history destination belongs to another Reference Configuration:

1. activate that configuration;
2. apply its default Scenario;
3. establish its valid root structural state; and
4. replay the exact recorded destination if it still exists.

A previously selected non-default Scenario is not restored merely because it appeared in an older navigation destination.

#### CVI-032 — Explicit Return is intentionally stronger than Back
**Status: Established**

Back is chronological. Explicit Return is semantic.

A learner who browses several Concepts after opening one from a GPU may use Back to step through those Concepts or use **Return to GPU** to restore the originating physical context directly.

#### CVI-033 — Forward is cleared by new navigation after Back
**Status: Established**

Application Navigation History uses ordinary linear-history behavior: when the user navigates to a new destination after going Back, the prior Forward branch is cleared.

#### CVI-034 — Selection-only changes do not rewrite old history entries
**Status: Established**

Changing physical Selection without navigating does not retroactively mutate earlier navigation destinations. Preview Target and Detail Visibility likewise do not rewrite navigation history.

A contextual cross-view transition may capture the current Selection in Return Context because that Selection is semantically relevant to the transition; ephemeral Preview state is not captured.

## 6.7 Edge cases and fallback behavior

**Status: Established**

Fallback principle:

> **Preserve exact state when valid; degrade to the nearest valid semantic context when necessary; never invent cross-system equivalence or silently substitute a different Concept or physical entity.**

#### CVI-035 — Stored cross-view state is validated at restoration time
**Status: Established**

Return Context and retained dormant state must be revalidated when restored because Concept content, configurations, Scenario catalogs, and schemas may evolve.

#### CVI-036 — Stale Explore context degrades in a fixed order
**Status: Established**

When restoring Explore state:

1. **Reference System / Reference Configuration** — use exact saved IDs when valid. If unavailable, do not guess an equivalent configuration; fall back to the project's valid default architecture and indicate that the previous context is unavailable.
2. **Scenario** — restore the saved Scenario for explicit Return when still valid; otherwise use the destination default.
3. **Structural Location** — restore the exact location if it exists; otherwise use the nearest surviving known canonical ancestor when determinable without guessing; otherwise use configuration root.
4. **Containment Path** — recompute from current canonical containment.
5. **Tier** — recompute from restored Structural Location.
6. **Selection** — restore only if the exact configuration-local object still exists; otherwise clear it.

#### CVI-037 — Missing Concept IDs do not redirect to similar Concepts
**Status: Established**

If a contextual Concept target no longer exists:

- remain/open in Concepts with an unavailable-state or neutral library destination;
- preserve the source Return Context; and
- do not redirect by alias, name similarity, or topic similarity unless an explicit Concept-ID migration exists.

#### CVI-038 — Missing Concept occurrence targets do not trigger guessed physical substitution
**Status: Established**

If the global Concept still exists but a selected physical occurrence no longer resolves, the Concept remains valid and that occurrence is marked unavailable.

The application must not substitute a same-named entity, product, or occurrence in another configuration.

#### CVI-039 — Aggregated targets resolve to the nearest meaningful representable context
**Status: Established**

If a Concept occurrence identifies an Aggregate Entity or Addressable Member that is not individually explicit at the current scale, Explore should navigate to the nearest canonical context and Tier where the intended occurrence can be meaningfully represented, preserving an indication of the intended target. Representative Member Contexts may be restored as exemplar Return Context under AGG-017 but do not become canonical Concept occurrences.

#### CVI-040 — Black-box targets stop at the documented boundary
**Status: Established**

When an occurrence points toward proprietary or unmodeled internals, Explore should navigate only to the supported black-box boundary rather than inventing deeper structure.

#### CVI-041 — Configuration-level occurrences use the highest useful structural context
**Status: Established**

If a Concept occurrence applies to the Reference Configuration as a whole rather than one entity or connection, Explore should normally open at the highest useful structural level and emphasize the relevant architectural context without inventing a physical Selection.

#### CVI-042 — Invalid filters are pruned rather than forcing a full reset
**Status: Established**

When context changes make some filter values invalid, remove only the invalid values and preserve remaining valid filter state.

#### CVI-043 — Context-dependent Concept filters update against shared Architectural Context
**Status: Established**

A Concepts filter such as **Current system only** expresses an intent rather than one fixed system ID. If the active system changes, the filter remains enabled but its result set is recomputed for the new Architectural Context.

#### CVI-044 — Incompatible Functional Lens state fails safely
**Status: Established**

A view change alone never disables a compatible future Lens. If a configuration change makes retained Lens state invalid, the Lens should be disabled or marked unavailable rather than being remapped by guesswork.

The exact cross-configuration Lens-persistence policy remains deferred to the Functional Lens feature.

#### CVI-045 — Direct Concepts entry with no previous Concepts state opens a neutral library state
**Status: Established**

The initial Concepts destination should show the Concept Library, may emphasize current-system relevance when Architectural Context exists, must not hard-filter to the current system by default, and must not infer a Concept from Explore state.

#### CVI-046 — Direct Explore entry with no valid Explore state uses project defaults
**Status: Established**

If Explore has never been initialized or its retained architecture is no longer valid, initialize:

`default Reference System → valid/default Reference Configuration → default Scenario → highest valid structural level → no selection`

## 6.8 Assumptions and constraints

| ID | Status | Assumption / constraint |
|---|---|---|
| **CVI-A01** | **Established** | Explore and Concepts remain separate primary views in the initial product. |
| **CVI-A02** | **Established** | Only one primary view is active at a time in the initial design. |
| **CVI-A03** | **Established** | Reference System, Reference Configuration, and Scenario form shared Architectural Context when present. |
| **CVI-A04** | **Established** | Explore owns physical-navigation state; Concepts owns knowledge-navigation state. |
| **CVI-A05** | **Established** | Inactive view state is retained during ordinary cross-view transitions rather than recreated. |
| **CVI-A06** | **Established** | Concepts is valid without Architectural Context; Explore is not. |
| **CVI-A07** | **Established** | Physical Selection and Current Concept are independent state. |
| **CVI-A08** | **Established** | Explicit Concept–Architecture Links, not inferred similarity, drive contextual traversal. |
| **CVI-A09** | **Established** | Direct View Changes and Contextual Links have different semantics. |
| **CVI-A10** | **Established** | Contextual Concept browsing preserves its original Explore origin until the user deliberately chooses another physical occurrence or otherwise ends the contextual chain. |
| **CVI-A11** | **Established** | Application Back/Forward is distinct from Explore Structural History. |
| **CVI-A12** | **Established** | Scenario, filter, Lens, and Selection changes are state changes rather than ordinary navigation-history destinations. |
| **CVI-A13** | **Established** | Explicit Return may restore more context than chronological Back because it represents deliberate semantic restoration. |
| **CVI-A14** | **Established** | Stored context is reconstructed from stable semantic IDs and current authoritative data rather than rendered geometry. |
| **CVI-A15** | **Established** | Stale state degrades conservatively and is never repaired through speculative cross-system equivalence. |
| **CVI-A16** | **Established baseline** | Persistence guarantees in this section are session/application-state guarantees; durable restoration across application restarts is not required initially. |

## 6.9 Future considerations and implementation details

### CVI-F01 — Durable cross-session restoration
**Status: Deferred**

A future version may persist the last Explore location, Current Concept, filters, Scenario, and compatible Lens state across application restarts.

This is not required initially because durable persistence introduces stale-state/version-migration complexity as Reference Configurations and Concept content evolve.

### CVI-F02 — Simultaneous / split Explore + Concepts presentation
**Status: Deferred**

A future interface may show Explore and Concept content simultaneously, for example through a split or pinned Concept presentation.

The initial product should retain one active primary view. A future split-view implementation should consume the same shared Architectural Context and separate view-local state rather than collapsing ownership boundaries.

### CVI-I01 — Version-1 UI representation of Back, Forward, and Return
**Status: Established Version-1 interaction baseline; exact styling remains Implementation detail**

Application **Back** and **Forward** are exposed as global application-level chronological navigation controls. When semantic Return Context exists, **Return** is exposed separately as a contextual action labeled with its semantic destination where practical, for example **Return to GPU 5** or **Return to RDMA**. Return must never be presented as merely another spelling of Back.

In the browser client, browser-history integration may mirror/replay Application Navigation History through an adapter, but browser history remains non-authoritative under PLT-005 and the implementation-plan dependency rules. Exact placement, visual styling, and optional keyboard/browser integration remain implementation details.

## 6.10 Interactions with Explore

**Status: Established**

Cross-View Integration does not change Explore's ownership of physical structure.

Explore continues to own:

- Structural Location;
- Containment Path;
- Tier;
- semantic zoom;
- physical Selection;
- physical Cross-Connections / Traversal Context; and
- Explore Structural History.

Switching to Concepts makes this state dormant rather than discarding it.

Contextual Concept links are explanatory cross-view relationships and do not become containment relationships or physical Cross-Connections.

When returning to Explore, physical representation is reconstructed from the active Reference Configuration and canonical hierarchy rather than treated as a frozen diagram snapshot.

## 6.11 Interactions with Navigation and Orientation

**Status: Established**

Cross-View Integration adds an application-level navigation layer without redefining structural Navigation.

The distinction is:

- **Explore Structural Navigation:** where the user physically moved inside the architecture;
- **Application Navigation:** which meaningful view/destination the user visited across the product.

Selection changes and Scenario changes remain outside Explore Structural History. Application Back/Forward may cross views, while explicit Return restores semantic origin.

Containment Path remains canonical ancestry and must never be confused with either Application Navigation History or Return Context.

## 6.12 Interactions with Reference Systems and Configurations

**Status: Established**

Reference System and Reference Configuration are shared Architectural Context rather than Explore-only state.

A configuration change made while Concepts is active therefore immediately normalizes dormant Explore state according to established Reference-System rules.

Concept occurrences may explicitly target another Reference Configuration, but Concept–Architecture Links do not establish cross-system physical identity or equivalence.

Matching `product_identity`, `entity_type`, inventory classification, or naming does not authorize automatic transfer of physical Selection or Structural Location.

## 6.13 Interactions with Scenarios

**Status: Established**

Scenario is shared Architectural Context because both views need to know the current operating condition.

Explore uses Scenario to alter dynamic physical presentation/state. Concepts may use Scenario to alter relevance, contextual examples, or occurrence emphasis, but Scenario never changes canonical Concept truth.

Ordinary Scenario changes do not create Application Navigation History or Explore Structural History entries.

Explicit Return may restore its saved non-default Scenario when valid because the user is deliberately asking to restore the semantic origin. Ordinary configuration switching and Back/Forward continue to use the established destination-default-Scenario behavior.

## 6.14 Interactions with Concepts

**Status: Established**

Concept-to-Concept browsing changes Concepts State only and leaves dormant Explore State intact.

Explore → Concept transitions driven by explicit Concept–Architecture Links preserve Cross-View Origin through subsequent Concept browsing.

Concept → Explore occurrence traversal is explicit, configuration-aware, and may create Concept Return Context.

Global Concepts remain stable when Architectural Context changes because configuration-specific occurrences and contextual examples—not Concept identity—carry system-specific meaning.

## 6.15 Cross-View Integration summary invariant

**Status: Established**

> **Explore and Concepts are separate stateful views operating over shared Architectural Context. Reference System, Reference Configuration, and Scenario are shared when present; physical navigation and Selection remain owned by Explore; knowledge navigation, search, and filtering remain owned by Concepts. Ordinary view changes preserve each view's dormant state without inferring semantic relationships, while explicit Concept–Architecture Links create deliberate contextual transitions with returnable origins. Back and Forward follow chronological application navigation, explicit Return restores semantic origin, and stale state always degrades conservatively without guessed identity or cross-system equivalence.**

---

# 7. Property and Measurement Conventions

## 7.1 Purpose and scope

**Status: Established**

Property and Measurement Conventions define how configuration and Scenario values are authored, normalized, compared, derived, sourced, and displayed. The goal is to prevent ambiguous units, hidden scope differences, false precision, invalid aggregation, and misleading cross-system comparisons while preserving source-faithful evidence.

The current Reference-System schema's flexible `properties` mappings remain valid migration inputs, but comparison-capable properties should evolve toward the structured model below rather than relying on semantic information encoded in ad hoc key names.

## 7.2 Core terminology

| Term | Status | Definition |
|---|---|---|
| **Property Definition** | **Established** | A canonical semantic property identified by a stable machine key, independent of unit, scope, source, or display formatting. |
| **Property Registry** | **Established** | The controlled project vocabulary defining known Property Definitions, value kinds, compatible units, applicable entity types, and comparison semantics. |
| **Property Value** | **Established** | One configuration-specific assertion of a Property Definition for an entity, connection, Scenario target, or other supported object. |
| **Quantity Property** | **Established** | A Property Value consisting of numeric magnitude plus explicit unit and measurement semantics. |
| **Categorical Property** | **Established** | A controlled nonnumeric value such as topology family or cooling method. |
| **Text Property** | **Established** | Free explanatory metadata not intended for direct numeric comparison. |
| **Value Form** | **Established** | Whether a value is a **scalar**, **minimum**, **maximum**, **nominal**, or **range**. |
| **Approximation State** | **Established** | Whether the represented magnitude is exact as stated or explicitly approximate. |
| **Measurement Basis** | **Established** | What kind of value is asserted: **documented**, **theoretical**, **advertised**, **configured**, **measured**, or **effective**. |
| **Measurement Scope** | **Established** | The structural/population extent to which a Property Value applies, such as per-device, per-link, per-node, per-rack, Aggregate Entity, or whole configuration. |
| **Directional Basis** | **Established** | Whether a transfer-rate quantity is one-way, transmit-only, receive-only, per-direction full-duplex, bidirectional aggregate, or non-directional. |
| **Derived Property** | **Established** | A Property Value calculated from other modeled values rather than directly asserted by a source. |
| **Source Value** | **Established** | The original authored magnitude/unit corresponding to the supporting evidence. |
| **Normalized Value** | **Established implementation representation** | A mathematically normalized runtime/validation value used for safe conversion/comparison. It does not replace the Source Value. |

### Recommended property-value model

**Status: Established semantic contract; exact schema syntax is an Implementation decision**

A comparison-capable quantity should conceptually preserve at least:

```yaml
properties:
  hbm_capacity:
    kind: quantity
    status: known
    value:
      number: 192
      unit: GiB
      form: scalar
      approximate: false
    basis: advertised
    scope: per_device
    evidence:
      status: documented
      source_ids:
        - gcp-tpu7x
```

The exact YAML nesting and field names may differ, but the semantic dimensions must not be collapsed into an ad hoc property name.

## 7.3 Property and measurement rules

#### PROP-001 — Property IDs express meaning; units and scope are separate
**Status: Established**

Use stable semantic property keys such as `memory_capacity`, `link_rate`, `power`, or `component_count`. Units, bounds, scope, directionality, and basis belong to Property Value metadata rather than being encoded in names such as `hbm_gib_per_chip` or `max_link_gbps`.

**Rationale:** One physical quantity should remain comparable across sources and structural scopes.

#### PROP-002 — Comparison-capable properties use a controlled Property Registry
**Status: Established**

Each registered property defines its canonical ID, value kind, allowed units, valid scopes, applicable entity/connection types where useful, directional semantics when relevant, and comparison rules.

Ad hoc descriptive properties may remain possible during authoring but are not comparison-safe until registered.

**Rationale:** Comparison requires a shared semantic vocabulary rather than key-name conventions.

#### PROP-003 — Author source-faithful units and normalize mathematically at validation/runtime
**Status: Established**

Authors preserve the source magnitude and unit, for example `192 GiB` when that is what the source states. Validators/runtime may also normalize to a common mathematical representation such as bytes.

**Rationale:** Mandatory author-side conversion can obscure source convention and precision.

#### PROP-004 — Decimal and binary capacity prefixes have strict meanings
**Status: Established**

Use:

- `kB`, `MB`, `GB`, `TB`, `PB` for decimal SI powers of 1000; and
- `KiB`, `MiB`, `GiB`, `TiB`, `PiB` for binary IEC powers of 1024.

`GB` never silently means `GiB`.

**Rationale:** Silent reinterpretation creates material capacity comparison errors.

#### PROP-005 — Memory and storage do not receive hidden unit conventions
**Status: Established**

The unit symbol—not whether the target is memory or storage—defines the multiplier. Display may optionally show a normalized equivalent, but must retain the source convention.

**Rationale:** Domain convention cannot override an explicitly sourced unit.

#### PROP-006 — Network/link signaling rates default to bits per second
**Status: Established**

Physical network and serial-link rates should normally use decimal `Mb/s`, `Gb/s`, or `Tb/s`. User-facing display standardizes on forms such as **Gb/s** rather than mixing `Gbps`, `Gbit/s`, and other spellings.

**Rationale:** Physical link rates are conventionally specified in bits/s and must remain distinct from byte throughput.

#### PROP-007 — Byte throughput is represented separately
**Status: Established**

Memory bandwidth, storage throughput, or application data movement may use `MB/s`, `GB/s`, or `TB/s` where appropriate. The model must preserve bit-versus-byte semantics explicitly.

**Rationale:** `Gb/s` and `GB/s` differ by a factor of eight and cannot be treated as formatting variants.

#### PROP-008 — Bit/byte conversion requires compatible measurement semantics
**Status: Established**

The comparison layer may convert units mathematically, but must not equate a physical line rate with application-effective payload throughput unless Measurement Basis and scope are also compatible.

**Rationale:** Unit convertibility is necessary but not sufficient for comparability.

#### PROP-009 — Value Form is explicit
**Status: Established**

Values distinguish **scalar**, **minimum**, **maximum**, **nominal**, and **range** forms. A documented maximum or range must not be flattened into an exact scalar.

**Rationale:** Bounds change the meaning of a number even when the unit is identical.

#### PROP-010 — Approximation is orthogonal to Value Form
**Status: Established**

A scalar, bound, nominal value, or range may additionally be approximate. Approximation must not be represented only through prose when the value is comparison-capable.

**Rationale:** Bound semantics and certainty/rounding semantics are different dimensions.

#### PROP-011 — Nominal does not mean approximate
**Status: Established**

`nominal` means a named/reference/configured design value whose real operation may vary. `approximate` means the magnitude itself is uncertain or intentionally rounded.

**Rationale:** These qualifiers support different comparison and display behavior.

#### PROP-012 — Measurement Basis is explicit where performance/capacity interpretation could differ
**Status: Established**

Initial Measurement Basis values are:

- `documented` — source-stated fact without a more specific performance basis;
- `theoretical` — mathematical architectural maximum;
- `advertised` — vendor/rated specification;
- `configured` — value belonging to the modeled deployment/configuration;
- `measured` — empirical observation; and
- `effective` — usable/achievable value after explicitly modeled overhead/constraints.

**Rationale:** A generic number labeled “bandwidth” is insufficient for trustworthy comparison.

#### PROP-013 — Effective values require methodology
**Status: Established**

An `effective` value requires either a direct source or an explicit derivation/method note. It must not be produced by applying an arbitrary discount to a theoretical or advertised value.

**Rationale:** “Effective” must remain evidence-bearing rather than a label for guesses.

#### PROP-014 — Measurement Scope is explicit
**Status: Established**

The initial scope vocabulary supports at least:

- `per_device`;
- `per_member`;
- `per_link`;
- `per_interface`;
- `per_node`;
- `per_tray`;
- `per_rack`;
- `aggregate_entity`; and
- `configuration_total`.

Additional scopes may be added through the Property Registry.

**Rationale:** The same quantity at device and aggregate scope is a different assertion.

#### PROP-015 — Property names do not encode scope
**Status: Established target contract**

Patterns such as `quantity_per_node` should migrate toward a stable property plus `scope: per_node` rather than proliferating scope-specific property IDs.

**Rationale:** Scope belongs to the assertion, not the property identity.

#### PROP-016 — Aggregate values may be sourced directly or derived
**Status: Established**

Use derived aggregation when member values/counts are homogeneous and arithmetic is valid for the intended basis. Prefer a directly sourced aggregate when the source states the aggregate, membership is heterogeneous, overhead/disabled capacity breaks simple arithmetic, or count/value bases differ.

**Rationale:** Both component arithmetic and authoritative aggregate specifications are legitimate evidence forms.

#### PROP-017 — Direct and derived aggregate values may coexist
**Status: Established**

A directly sourced aggregate and an independently derived aggregate may both be retained. The source assertion remains canonical for its stated basis; validation may compare the derivation as a consistency cross-check.

**Rationale:** Provenance and mathematical validation are complementary.

#### PROP-018 — Derived properties record their inputs
**Status: Established**

A Derived Property identifies its source properties/entities, operation/formula, and nontrivial assumptions.

**Rationale:** Derived capacity, bandwidth, or power must remain auditable.

#### PROP-019 — Directional Basis is separate from connection directionality
**Status: Established**

Transfer-rate values use a separate Directional Basis. Initial values are:

- `one_way`;
- `transmit`;
- `receive`;
- `per_direction`;
- `bidirectional_aggregate`; and
- `not_directional`.

**Rationale:** A Cross-Connection's system/navigation direction does not determine how its bandwidth specification was measured or advertised.

#### PROP-020 — Full-duplex rates normally store the per-direction specification
**Status: Established**

If a link is specified as 400 Gb/s full duplex, prefer `400 Gb/s` with `per_direction` rather than silently storing `800 Gb/s`. A derived bidirectional aggregate may be displayed separately when useful and clearly labeled.

**Rationale:** This matches common link specification practice and avoids accidental double counting.

#### PROP-021 — Value availability states are distinct
**Status: Established**

For an applicable Property Definition, use distinct states:

- `known` — a value is modeled;
- `unknown` — available evidence does not establish it;
- `unavailable` — relevant public/source material does not supply it;
- `proprietary` — the value is nonpublic/restricted;
- `not_applicable` — the property has no semantic meaning for this target; and
- `omitted` — deliberately excluded from the educational model.

An optional property that is simply irrelevant to authoring may be absent entirely.

**Rationale:** Missing data must not carry several incompatible meanings.

#### PROP-022 — Missing or unavailable values are never interpreted as zero
**Status: Established**

Unknown, unavailable, proprietary, not-applicable, omitted, and absent values must not participate in numeric comparison or aggregation as `0`.

**Rationale:** Zero is a factual quantity, not a missing-data sentinel.

#### PROP-023 — Inferred and simplified values use the existing Evidence State
**Status: Established**

Do not create parallel flags such as `is_inferred`. Property-level claims use the established `documented`, `inferred`, `simplified`, `unknown`, and `proprietary` Evidence State vocabulary.

**Rationale:** The project should have one epistemic classification system.

#### PROP-024 — Property-level evidence may refine enclosing entity/connection evidence
**Status: Established**

Entity/connection Evidence State remains valid overall, but individual properties may provide more specific evidence and sources when they are supported, inferred, or simplified independently. Property evidence may inherit enclosing provenance only when the same evidence genuinely supports the claim.

**Rationale:** A well-documented component can still contain one weakly documented specification.

#### PROP-025 — Comparison-critical numeric properties require explicit provenance
**Status: Established**

A quantity intended for cross-system comparison must identify its supporting source or derivation directly rather than relying solely on broad entity-level provenance.

**Rationale:** Comparison tables require auditable apples-to-apples claims.

#### PROP-026 — Authoring preserves source precision
**Status: Established**

Do not add significant figures that the source did not provide. Approximation and bounds must remain explicit.

**Rationale:** Extra digits imply unsupported accuracy.

#### PROP-027 — Calculations use unrounded normalized values
**Status: Established**

Conversions and derivations use exact conversion factors and full modeled numeric precision internally. Rounding occurs only for display.

**Rationale:** Repeated rounding can materially distort rack/cluster aggregates.

#### PROP-028 — User-facing conversions use sensible significant figures
**Status: Established display policy**

Converted/display values should normally use no more than approximately three significant figures unless the source supplies meaningful extra precision or additional precision is needed to distinguish values. The original Source Value remains recoverable.

**Rationale:** Human-readable conversion should not manufacture apparent precision.

#### PROP-029 — Direct comparison requires semantic compatibility
**Status: Established**

Values are directly comparable only when:

1. Property Definition is the same or explicitly declared comparable;
2. units are convertible;
3. scope is identical or explicitly normalized;
4. Directional Basis is compatible; and
5. Measurement Basis is compatible enough for the intended comparison.

**Rationale:** Mathematical normalization cannot repair semantic mismatch.

#### PROP-030 — Mixed Measurement Bases remain visible
**Status: Established**

When a user intentionally compares theoretical, advertised, configured, measured, or effective values together, the differing bases must be clearly labeled. Ratios or rankings must not silently treat them as equivalent.

**Rationale:** A measured value should not appear to underperform an unrelated theoretical maximum without context.

#### PROP-031 — Scope normalization is explicit and produces a Derived Property
**Status: Established**

A per-member value may be normalized to a larger population only when the member count is known at a compatible Count Basis, the population semantics permit derivation, relevant members share the property, and no required overhead/availability factor is omitted. The result is a Derived Property rather than a direct source assertion.

**Rationale:** This ties measurement aggregation to Section 1.5 rather than assuming that count multiplication is always valid.

#### PROP-032 — Schema, validator, documentation, and display have distinct responsibilities
**Status: Established**

**JSON Schema** should enforce recognized value shapes, allowed status/basis/scope/unit identifiers, required fields, and mutually exclusive scalar/range forms.

**Custom validators** should enforce property/unit compatibility, scope and direction semantics, derivation references, entity applicability, invalid bit/byte assumptions, direct-versus-derived consistency, and required provenance.

**Source-of-truth/authoring documentation** defines semantic meanings, examples, rounding, and comparison policy.

**Display/Implementation** chooses human-friendly unit scaling, localized formatting, optional converted equivalents, and visible comparison warnings without changing source semantics.

**Rationale:** These responsibilities cannot all be represented cleanly in JSON Schema alone.

#### PROP-033 — Version 1 does not require global user-unit preferences
**Status: Established for Version 1**

Version 1 should preserve and display the source-faithful unit as the primary authored value and may show a normalized/converted equivalent where it materially aids understanding. It does not require a global user preference system for choosing alternate unit conventions.

A future display-preference feature may be added without changing canonical Property Values because source representation and display conversion are already separate.

**Rationale:** Unit-preference state would add UI and persistence complexity without materially improving the initial architecture-learning workflow, while the existing conversion/display rules already preserve future extensibility.

## 7.4 Representative property cases

| Case | Recommended semantic representation |
|---|---|
| **TPU HBM capacity** | `memory_capacity = 192 GiB`, scalar, advertised/documented as supported, `per_device`, sourced. |
| **NIC line rate** | `link_rate = 400 Gb/s`, appropriate maximum/advertised basis, `per_interface`, directional basis explicitly stated. |
| **Rack HBM derived from devices** | Same `memory_capacity` Property Definition, aggregate scope, Derived Property with member value/count inputs. |
| **Source says “up to 144 chips”** | `component_count = 144`, `maximum`, appropriate aggregate/configuration scope. |
| **Approximately 220,000 GPUs** | Preserve supported bound/scalar semantics plus `approximate: true`; never flatten to an exact unqualified integer. |
| **80–120 kW deployment range** | Quantity range with min/max and configured/documented basis as appropriate. |
| **Unknown NIC count** | Availability state `unknown` or `unavailable`; no numeric magnitude. |
| **Property irrelevant to target** | `not_applicable` only when making that fact explicit is useful; otherwise omit the optional property. |
| **Known proprietary internal specification** | `proprietary`; no fabricated numeric magnitude. |
| **Educationally excluded detail** | `omitted` only where omission itself matters; otherwise no property record. |
| **Measured application throughput** | Source-defined bit/s or byte/s, `measured`, exact scope/test provenance retained. |
| **Effective usable memory** | `effective` with direct source or explicit derivation; does not replace advertised physical capacity. |

## 7.5 Validation baseline

**Status: Established implementation requirement**

The future property validator should reject or flag, as appropriate:

- treating `GB` and `GiB` as aliases;
- unregistered units for registered Property Definitions;
- unit/scope/bound semantics embedded in canonical registered property IDs;
- ambiguous bit-versus-byte bandwidth;
- directional link rates lacking required Directional Basis;
- ranges with `min > max`;
- non-`known` availability states combined with ordinary numeric values;
- `not_applicable` values carrying a magnitude;
- direct comparison of incompatible scopes;
- unlabeled comparison of incompatible Measurement Bases;
- aggregate derivation using an incompatible/unknown/representative count basis as though it were a fixed population;
- approximate/minimum/maximum claims authored as exact scalars;
- Derived Properties with missing inputs;
- comparison-critical quantities lacking explicit provenance; and
- units incompatible with their Property Definition.

## 7.6 Assumptions and implementation boundary

| Item | Status |
|---|---|
| The Property Registry should begin with properties needed by the initial five Reference Systems and expand incrementally. | **Established** |
| Source-faithful units are preferred over mandatory author-side normalization. | **Established** |
| Comparisons use normalized mathematical values internally while retaining source form and provenance. | **Established** |
| Descriptive Text Properties remain valid where numeric structure adds no value. | **Established** |
| Scenario Metric / Dynamic Property values should reuse these conventions where applicable rather than creating a second unit system. | **Established** |
| Existing free-form configuration properties are migration inputs rather than assumed comparison-safe data. | **Established** |
| Structured YAML shape, initial Property Registry membership, and generated normalized-value handling are provisionally resolved in the implementation companion and are reviewed against initial-five migration examples before schema finalization. | **Provisionally Resolved implementation** |

## 7.7 Interactions with aggregation, Reference Systems, Scenarios, and Concepts

**Status: Established**

- **Aggregation/Repetition:** Count Basis and Expansion Mode determine when component values may be normalized into aggregate Derived Properties; render replication alone never authorizes arithmetic.
- **Reference Systems:** configuration-specific factual quantities remain in Reference-System data, with property-level evidence when comparison or derivation requires it.
- **Scenarios:** dynamic metrics use the same units, scopes, basis, and evidence semantics where applicable, while qualitative Scenario state remains valid and often preferable.
- **Concepts:** Concepts explain what measurements such as latency, bandwidth, capacity, and utilization mean; they do not own configuration-specific numeric values.
- **Organizational Content Inventory:** inventory classification does not define property semantics or units.

## 7.8 Property and Measurement summary invariant

**Status: Established**

> **A comparison-capable Property Value is a source-faithful assertion whose semantic property, magnitude/unit, value form, scope, measurement basis, directionality, evidence, and derivation status are explicit. Normalization may change representation for calculation or display, but must not erase source units, provenance, uncertainty, or semantic differences that determine whether values are truly comparable.**

---

# 8. Delivery, Rendering, and Platform Baseline

## 8.1 Purpose and scope

**Status: Established**

This section defines the project's long-term rendering direction, Version-1 delivery baseline, and the architectural portability constraints needed to keep browser-specific implementation choices from becoming part of the semantic product model.

The product-level commitments belong here because they affect Explore, Concepts, Detail, application state, content loading, and future client delivery rather than any one feature area. Detailed module boundaries, dependency rules, platform-service adapters, migration sequencing, and framework-specific implementation guidance are maintained in the companion `Delivery_Rendering_and_Platform_Implementation_Plan.md` rather than duplicated here.

The governing direction is:

> **The project is a layered 2D system long-term. Version 1 is delivered browser-first through a 2D semantic Explore canvas. Browser-specific presentation and platform services remain isolated from the semantic core so a future genuinely native desktop client can reimplement the frontend without redefining the project's content, state, or behavioral contracts.**

## 8.2 Core terminology

| Term | Status | Definition |
|---|---|---|
| **Layered 2D Rendering** | **Established** | The long-term visual model in which Explore presents a context-appropriate two-dimensional representation of the architecture and changes that representation as Structural Location, Tier, aggregation, and Scenario context change. It does not require one literal drawing to persist unchanged across all scales. |
| **2D Semantic Canvas** | **Established** | The interactive Explore presentation surface used to render current physical/structural context, aggregates, connections, selection/emphasis, and Scenario state in two dimensions. “Semantic” means representation is derived from project state and learning relevance rather than being only a fixed geometric drawing. |
| **Browser-First Delivery** | **Established for Version 1** | The initial application is designed to run directly in a modern web browser as the primary delivery mode. Browser-first describes the Version-1 client platform; it does not make browser APIs part of the domain contract. |
| **Browser Presentation Layer** | **Established implementation boundary** | Browser-specific UI/rendering code, including HTML/DOM, CSS, browser input/event handling, and the concrete 2D drawing technology used by Version 1. |
| **Platform-Neutral Core** | **Established architectural constraint** | The semantic domain model, state-transition rules, content meaning/normalization, validation/business rules, and stable identity contracts that must not depend directly on HTML, DOM elements, renderer objects, or host-specific or external service APIs. |
| **Platform Service Adapter** | **Established architectural pattern** | A narrow implementation boundary through which platform-specific services such as persistence, file access, clipboard, external links, or similar host capabilities are exposed without leaking their APIs into semantic core logic. |
| **Native Desktop Client** | **Established future direction if pursued** | A separately implemented, compiled standalone desktop frontend that consumes the established project content and semantic contracts through native desktop technology rather than hosting the browser application. |
| **Packaged Browser Wrapper** | **Established distinction** | A desktop package that embeds or hosts the browser/web application. It may be useful independently, but it is not what this project means by a future **Native Desktop Client**. |

## 8.3 Delivery and rendering rules

#### PLT-001 — Two-dimensional rendering is the long-term direction
**Status: Established**

Explore should remain a layered **2D** visualization system beyond Version 1. The project does not treat 2D as a temporary limitation pending a future 3D replacement.

Different Structural Locations, Tiers, and architectural contexts may use different 2D compositions, diagrams, layouts, and degrees of abstraction while preserving the same semantic identity and Navigation rules.

3D is not part of the planned rendering architecture. Reintroducing it later would require a new explicit product decision rather than being assumed as an existing roadmap commitment.

**Rationale:** The project's primary educational tasks depend heavily on labels, hierarchy, topology, typed relationships, aggregate summaries, and dense explanatory context. Layered 2D representation supports those needs with lower interaction, accessibility, and maintenance complexity than a general 3D scene model.

#### PLT-002 — Version 1 uses browser-first 2D delivery
**Status: Established for Version 1**

The initial client is a **browser-first application** whose Explore workspace uses a **2D Semantic Canvas**. Concepts and persistent Detail may use conventional accessible document/UI surfaces around that canvas while preserving the established shared state and interaction semantics.

Browser-first is a delivery decision, not a requirement that canonical content or domain logic be web-native.

**Rationale:** The browser provides a practical initial delivery environment, straightforward future publication/evaluation, and mature document/UI capabilities without changing the project's long-term 2D design direction.

#### PLT-003 — The 2D scene is derived from current semantic context
**Status: Established**

As the user enters, leaves, or traverses the architecture, Explore may replace or reorganize the visible 2D graphics so the representation matches the current Structural Location, Tier, semantic aggregation, and relevant Scenario state.

The application is not required to preserve one global all-scales drawing and merely zoom the camera over it.

**Rationale:** This directly supports semantic zoom, unequal architecture depth, aggregate/representative behavior, and the project's emphasis on educational clarity over literal visual completeness.

#### PLT-004 — Rendered geometry is presentation, not architectural truth
**Status: Established**

Pixel coordinates, browser elements, canvas/SVG/WebGL objects, label positions, viewport transforms, and other renderer-specific geometry must not establish entity identity, canonical Containment, Cross-Connection semantics, Tier, Scenario identity, Concept occurrence identity, Selection, or Context Locators.

Those meanings come from the established semantic data/state model. Rendering may be recomputed or replaced without changing architectural truth.

**Rationale:** This preserves correctness under responsive layout, semantic zoom, renderer changes, and any future native reimplementation.

#### PLT-005 — Semantic core logic is isolated from browser presentation APIs
**Status: Established architectural constraint**

The core domain model, application/state-transition rules, content meaning/normalization, validation/business rules, and stable identity contracts must not depend directly on:

- HTML or DOM elements;
- browser rendering objects;
- CSS/layout identity;
- browser history as the authoritative Navigation model; or
- host-specific or external service APIs for storage, file access, content transport, or similar platform capabilities.

Browser presentation consumes and emits semantic state/actions rather than owning those semantics.

**Rationale:** This improves Version-1 testing and maintainability while preserving a realistic future native-client migration path.

#### PLT-006 — Platform-specific services remain at explicit boundaries
**Status: Established architectural constraint**

Persistence, file/content transport, clipboard, external links, and other platform-specific services should be accessed through narrow adapters where they are needed. The application should preserve language-neutral semantic data and stable IDs across those boundaries.

The exact interfaces and browser/native implementations are Implementation concerns described in the companion platform implementation plan.

**Rationale:** A future desktop client should replace platform adapters rather than requiring domain/state logic to be redesigned around a different host environment.

#### PLT-007 — A future desktop client, if built, should be genuinely native
**Status: Established future direction**

A future desktop version may be implemented as a **Native Desktop Client**. For this project, that means a standalone native frontend/application implementation rather than the Version-1 browser application packaged inside a desktop web wrapper.

A packaged browser wrapper remains a technically distinct option and does not satisfy this native-client direction by itself.

**Rationale:** The value of a future native client would come from genuine native application behavior, graphics, file/platform integration, and independence from the browser presentation stack rather than from changing only the packaging container.

#### PLT-008 — The preferred future native target is C++20-or-later with Qt 6
**Status: Established preferred future implementation target**

If native desktop development is pursued, the default target is **C++20-or-later with Qt 6**. The exact Qt UI/rendering classes should be selected when native implementation begins rather than frozen now.

Current supporting rationale and framework-specific guidance are recorded in `Delivery_Rendering_and_Platform_Implementation_Plan.md`. Platform support, licensing, deployment tooling, and the appropriate Qt release should be revalidated at that future implementation point.

**Rationale:** C++/Qt provides a mature cross-platform compiled desktop ecosystem, strong 2D graphics options, substantial performance headroom, and suitable rich-text/application UI capabilities without requiring the Version-1 browser codebase to adopt a native implementation language prematurely.

#### PLT-009 — Native migration preserves contracts more than browser UI source code
**Status: Established planning expectation**

A future C++/Qt native client should be expected to reuse or preserve:

- canonical YAML/Markdown content;
- schemas and controlled vocabularies;
- stable identifiers and Context Locator semantics;
- Reference-System, Scenario, Concept, aggregation, property, and evidence contracts;
- state-transition behavior; and
- conformance/readiness test cases.

The browser 2D renderer, DOM/CSS presentation, browser platform adapters, and much of the browser-specific UI implementation should be expected to be replaced.

Direct executable-code reuse is therefore not the primary portability objective.

**Rationale:** A true native rewrite crosses language and presentation-framework boundaries. Preserving language-neutral contracts and behavioral conformance is more reliable than distorting Version 1 to maximize hypothetical source-code reuse.

#### PLT-010 — Future native portability must not overengineer Version 1
**Status: Established**

Version 1 should maintain clean semantic/platform boundaries, but it should not introduce C++/WebAssembly, a generalized cross-platform UI layer, desktop packaging/update infrastructure, speculative native services, or a multi-renderer framework solely to prepare for a client that does not yet exist.

**Rationale:** The portability boundary is valuable only if it also improves the browser implementation. Premature dual-platform architecture would increase cost without improving the initial educational experience.

#### PLT-011 — Version-1 browser technology choices are implementation-owned
**Status: Established documentation ownership; renderer fallback remains prototype-gated**

The Source of Truth does not normatively require a particular browser framework, client language, state-management library, graph-layout package, build tool, search library, testing framework, or concrete SVG/Canvas/WebGL implementation. The current Version-1 selections are recorded in `Delivery_Rendering_and_Platform_Implementation_Plan.md` and may be revised there when implementation evidence warrants, provided PLT-001 through PLT-010 and the established accessibility/interaction contracts remain satisfied.

The only intentionally open renderer parameters are the measured threshold at which an SVG-first implementation may require a denser Canvas/WebGL presentation backplane and the exact visibility/virtualization limits used for dense scenes. Those choices must be driven by representative initial-five prototypes rather than by product semantics.

**Rationale:** Technology selections should be explicit and reviewable without turning framework/library versions into product-level truth; performance-sensitive renderer fallback still requires empirical evidence.

## 8.4 Interactions with established design sections

**Status: Established**

- **Explore:** layered 2D rendering presents the physical/spatial hierarchy, semantic zoom, aggregate/representative structures, Cross-Connections, Scenario emphasis, and Selection/Preview state without redefining their semantics.
- **Selection and Detail Context:** SDC-001 through SDC-038 remain input/interaction semantics independent of the browser renderer. Hover is supplemental; all persistent actions retain keyboard/focusable equivalents.
- **Navigation and Cross-View Integration:** histories, Structural Location, Selection, Return Context, and Context Locators remain semantic state rather than browser-history, URL, DOM, or coordinate state.
- **Reference Systems / Scenarios / Concepts / Property model:** canonical content remains data-driven and renderer-neutral. Runtime representation may be optimized for the browser but must preserve the established source contracts.
- **Accessibility:** browser rendering technology must provide a semantic interaction/accessibility layer; no essential action may depend solely on graphical hit-testing or hover.
- **Future native client:** the native frontend should consume the same semantic contracts and reproduce the same established behavior rather than translating browser presentation state.

## 8.5 Implementation companion and migration boundary

**Status: Established documentation ownership**

Detailed implementation guidance is maintained in:

`Delivery_Rendering_and_Platform_Implementation_Plan.md`

That companion owns non-product guidance including:

- recommended module/dependency boundaries;
- platform-service adapter patterns;
- content-loading and persistence separation;
- browser-specific coupling to avoid;
- cross-language conformance-test strategy;
- expected direct-code versus contract/content reuse;
- current Qt rationale and external support references; and
- a suggested future native migration sequence.

The companion may evolve during Implementation without changing product behavior. Any change that alters PLT-001 through PLT-010 or another established Source-of-Truth rule must first be reflected here.

## 8.6 Delivery, Rendering, and Platform summary invariant

**Status: Established**

> **The project uses layered 2D rendering as its long-term visualization direction. Version 1 is a browser-first application with a 2D Semantic Canvas, but browser presentation, renderer geometry, persistence, file/platform services, and other host-specific details do not define the semantic domain or Navigation model. A future genuinely native standalone client may reimplement the presentation layer using C++20-or-later and Qt 6 while preserving the project's language-neutral content, identifiers, state semantics, validation contracts, and conformance behavior.**

---

# 9. Current Cross-Section Dependencies

| Area | Current relationship |
|---|---|
| **Reference Systems / Configurations** | Definitions, rules, initial five-system set, default system, switching behavior, validated YAML/schema data contract, entity/inventory/product-identity separation, content-depth policy, shared/reusable architecture semantics, Ship-Readiness criteria, current authored corpus, comparison metadata, and future Sandbox-related considerations are established in Section 3. |
| **Aggregation / repetition** | Aggregate Entity identity, representative versus addressable expansion, Selection/navigation semantics, Scenario/Concept behavior, and Implementation prerequisites are established in Explore Section 1.5; count-basis evidence remains defined by REF-027/028. |
| **Property / measurement conventions** | Property identity, units, scope, basis, directionality, missing-data semantics, derivation, evidence, comparison, rounding, and validator responsibilities are established in Section 7. |
| **Concepts** | Formal global Concept Library, stable Concept identity, inventory-mapping rules, typed Concept graph, architecture-occurrence links, cross-view context behavior, Architecture-Anchored Foundational Library initial scope, and deferred exhaustive expansion are established in Section 5. |
| **Cross-View Integration** | Shared Architectural Context, view-local state ownership, direct versus contextual transitions, semantic Return Context, application-level Back/Forward behavior, stale-state degradation, and Explore/Concepts interoperability are established in Section 6. |
| **Scenarios / Scenario Context** | Formal Scenario definitions, named-Scenario initial scope, state/target/evidence rules, Explore/Navigation interactions, qualitative-state baseline, extensibility direction, and case-by-case catalog authoring policy are established in Section 4. |
| **Selection & Detail Context** | Finalized Option F Hybrid interaction model, Inspect/Select/Enter semantics, persistent Detail Context, default Current-Location Summary, input/accessibility behavior, Selection clearing, target-specific Detail, and history/cross-view effects are established in Explore Section 1.6; Navigation and Cross-View Integration retain ownership of their respective history and persistence semantics. |
| **Delivery / rendering / platform** | Long-term layered 2D rendering, browser-first Version-1 delivery, renderer-independent semantic truth, browser/platform isolation boundaries, and the possible future genuinely native C++/Qt desktop-client direction are established in Section 8. The current Version-1 technical stack, content/runtime build strategy, schema migration defaults, testing tools, provisional renderer/layout choices, and remaining performance-triggered open questions live in `Delivery_Rendering_and_Platform_Implementation_Plan.md`. |
| **Guided Modes / Flows** | Future feature expected to traverse the same Explore structure without redefining it. |
| **Functional Lenses** | Future feature with high-level persistence semantics established; detailed behavior deferred to Features. |

---

# 10. Project-Level Change Log

| Date | Change |
|---|---|
| **2026-08-19** | Created centralized living source-of-truth document. |
| **2026-08-19** | Consolidated Explore purpose, five-tier hierarchy, containment rules, cross-connection rules, cross-tier visibility, movement, boundaries, unresolved questions, and rejected designs. |
| **2026-08-19** | Added Navigation/Orientation state model and NAV-001 through NAV-030. |
| **2026-08-19** | Established that current tier follows structural location for the initial design; independent semantic zoom deferred to Features. |
| **2026-08-19** | Established configuration-defined default scenarios and reset-to-default behavior on configuration switches. |
| **2026-08-19** | Added NAV-F01: persistent functional lenses as a future feature, globally persistent during Explore navigation once enabled. |
| **2026-08-19** | Added authoritative Reference Systems and Configurations section with strict System/Configuration terminology, initial five-system baseline, DGX H100 SuperPOD default, candidate metadata/rating scales, fidelity/black-box rules, and extensibility requirements. |
| **2026-08-19** | Established system/configuration switching behavior: destination default scenario, reset to highest valid hierarchy level, and clearing of incompatible selection. |
| **2026-08-19** | Deferred generic archetypal and user-created configurations to a future Sandbox direction; historical systems remain eligible as full Reference Systems. |
| **2026-08-23** | Updated Reference Systems/Configurations to reflect the then-current validated 16-system / 18-configuration YAML corpus, schema 1.1.0, entity-type versus inventory semantics, product-identity metadata, aggregate/count rules, and current deliberate content uncertainties. |
| **2026-08-23** | Added the authoritative Scenarios section: configuration-local named Scenario model, dynamic-state/target/evidence rules, named-only initial interaction, qualitative-state baseline, per-system extensible catalog guidance, and deferred bounded editing / Sandbox directions. Updated directly related Navigation and Reference-System wording to remove the earlier baseline assumption of arbitrary user Scenario-state modification. |
| **2026-08-25** | Added high-voltage DC / 800 VDC power distribution as a narrow emerging Power-infrastructure scope expansion. Established that inventory expansion does not force Reference-Configuration retrofit; current configurations remain unchanged unless system-specific evidence supports the new power path. |
| **2026-08-25** | Added the authoritative Concepts section: global Concept identity and library, inventory mappings, Concept kinds, typed Concept relationships and prerequisites, explicit Concept–Architecture Links, cross-view context/navigation behavior, Architecture-Anchored Foundational Library initial scope, and deferred expanded/exhaustive Concept-library direction. |
| **2026-08-25** | Added the authoritative Cross-View Integration section: shared Architectural Context, view-local Explore/Concepts state ownership, direct-versus-contextual transition semantics, Return Context, application-level Back/Forward history, conservative stale-state fallback, and cross-view interactions with Reference Configurations and Scenarios. |
| **2026-08-25** | Completed taxonomy/finalization pass: retained Tier 5 as one Internal Detail navigation band with same-tier nesting, finalized the seven Cross-Connection relationship types, established entering-clears-Selection and linear Explore Structural History semantics, standardized controlled entity types in Reference-System schema 1.2.0, reconciled Concept/Inventory terminology, and reclassified remaining non-product choices as explicit Implementation details or Deferred features. |
| **2026-08-25** | Integrated the finalized Aggregation/Repetition, Reference-System Readiness, Shared/Reusable Architecture, Property/Measurement, and Initial Content-Depth decisions into their owning sections. Added Explore aggregate expansion semantics; Reference-System content-depth, reuse, and Ship-Readiness subsections; and a cross-cutting Property and Measurement Conventions section. |
| **2026-08-25** | Finalized Selection and Detail Context using **Option F — Hybrid interaction model**. Added Explore Section 1.6 defining transient Inspect/Preview, persistent singular Selection, explicit Enter/Follow navigation, Current-Location Summary and persistent Detail behavior, keyboard/touch/accessibility equivalents, clearing/history rules, target-specific edge cases, Scenario/Concept interactions, and responsive Detail semantics. Updated directly related Navigation and Cross-View Integration rules to preserve one normative contract without reintroducing duplicate state semantics. |
| **2026-08-26** | Established the Delivery, Rendering, and Platform baseline: layered 2D as the long-term rendering direction; browser-first 2D Semantic Canvas for Version 1; browser presentation/platform isolation from semantic domain/state/content/validation rules; genuinely native desktop client distinguished from packaged browser wrappers; C++20-or-later + Qt 6 selected as the preferred future native target; and contract/conformance reuse prioritized over browser UI source-code reuse. Added a separate implementation-planning companion for detailed module boundaries and migration guidance. |
| **2026-08-26** | Completed the implementation-decision pass following the platform baseline. Reconciled Concept authoring/storage with the implemented YAML+Markdown contract; established Version-1 Concept relationship presentation and Back/Forward/Return UI baselines; recorded the no-global-unit-preference Version-1 policy; promoted entity capability, Scenario storage, Concept-link migration, and structural-history guidance from open implementation questions to resolved/provisional implementation decisions; and narrowed remaining Explore rendering uncertainty to prototype-derived visibility/virtualization thresholds. Detailed technologies and migration defaults remain in the implementation companion. |
