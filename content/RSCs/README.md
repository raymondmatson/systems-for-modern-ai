# Reference System Configuration Bundle

This source set contains the reusable reference-system configuration model and one YAML file for every system currently in either **Initial implementation** (`recommended_initial`) or **Worth considering later** (`worth_considering_later`) scope.

## Canonical authoring model

- YAML 1.2-compatible, JSON-like data only.
- JSON Schema draft 2020-12 validation (`reference_system.schema.json`).
- Current schema version: **1.2.0**.
- Stable slug-like IDs for systems, configurations, entities, connections, functional groups, and sources.
- Physical hierarchy is nested under `hierarchy.root`; cross-connections reference entity IDs.
- `entity_type` defines the structural/behavioral type of an entity; inventory classification is organizational/documentation metadata and does not control behavior.
- Every current `inventory` mapping uses an exact category/item from `Organizational_Content_Inventory.md` and is marked `status: existing`.
- `status: proposed_addition` remains reserved for future modeling gaps that are not yet present in the Organizational Content Inventory; the validator rejects stale proposal status for an item that has already been incorporated.
- Evidence states: `documented`, `inferred`, `simplified`, `unknown`, `proprietary`.
- Representation states: `explicit`, `aggregate`, `black_box`.
- Configuration statuses: `baseline`, `alternative`, `historical`, `emerging`.
- Authored-system planning statuses: `recommended_initial`, `worth_considering_later`; reviewed-but-not-recommended candidates remain outside the authored bundle.
- Unknown/proprietary details are omitted or represented as black boxes rather than invented.

## Canonical relationship types

Cross-connections use exactly these `relationship_type` identifiers in schema version 1.2.0:

- `physical_connectivity`
- `data_communication_path`
- `dependency_service`
- `affinity_locality`
- `shared_resource_membership`
- `redundancy_protection`
- `control_management`

These identifiers describe relationship semantics; they do not establish containment or physical ownership.

## Controlled `entity_type` vocabulary

Schema version 1.2.0 makes `entity_type` a controlled vocabulary. The current canonical identifiers are grouped below for readability; the JSON Schema enum is the machine-readable authority.

- **System / structural containers:** `compute_cluster`, `hpc_ai_system`, `inference_system`, `rack_scale_system`, `pod_group`, `rack_group`, `rack_topology_domain`, `topology_group`, `compute_group`, `storage_group`.
- **Assemblies / infrastructure units:** `rack`, `compute_assembly`, `compute_node`, `compute_tray`, `switch_tray`, `storage_server`, `management_node`, `preprocess_server`, `storage_system`, `cooling_system`, `memory_appliance`, `fabric_appliance`.
- **Devices / fabrics:** `gpu`, `tpu`, `ai_accelerator`, `apu`, `cpu`, `nic`, `smartnic`, `dpu`, `network_switch`, `network_fabric`, `optical_network`, `scale_up_switch`, `local_storage`.
- **Internal detail:** `accelerator_die`, `cpu_die`, `compute_core`, `tensor_core`, `sparse_core`, `collective_engine`, `hbm`, `on_chip_memory`, `dma_engine`, `switch_asic`.

Intentional distinctions include: `rack` for an ordinary physical rack, `rack_scale_system` when the rack is itself a coherent tightly coupled system, `rack_group` for an aggregate of multiple racks/cabinets, and `rack_topology_domain` when a rack/cube is modeled primarily as a named topology domain. `compute_cluster` is the general cluster-scale container, while `hpc_ai_system` and `inference_system` are reserved for top-level systems whose defining modeled role would be obscured by the generic cluster label. Generic `*_group` types are structural aggregates used when a more specific physical enclosure is not justified. `ai_accelerator` is used only when a more specific accelerator class such as `gpu`, `tpu`, or `apu` is not appropriate. `network_switch` represents a switch device or switch aggregate, while `network_fabric` represents the fabric-level connectivity domain.

New entity types require an explicit schema/taxonomy update and a defined capability mapping; inventory additions alone do not create new behavior types. Multiple entity types may share the same implementation capability profile.

## Explore-tier rule

Tier 5 remains a single **Internal Detail** navigation band. It may contain multiple physically meaningful same-tier containment steps—for example package → die/chiplet → core/cache/controller—without introducing formal Tier 5a/5b subtiers. Breadcrumbs and canonical containment express that deeper nesting while the semantic tier remains Tier 5.

## Product identity metadata

Entities may optionally include `product_identity` when they represent an identifiable real product or component. This metadata supports comparison, search, and reuse across Reference Configurations without creating shared physical identity.

Allowed subfields are:

- `manufacturer`
- `product_family`
- `model`
- `variant`
- `generation`
- `architecture`
- `codename`

When `product_identity` is present, `manufacturer` and at least one additional qualifier are required. Only fields that are useful, source-supported, and nonredundant should be included. Unsupported information is omitted rather than represented by placeholders such as `unknown`, `N/A`, `TBD`, or `proprietary`. Heterogeneous aggregates containing multiple product models normally do not receive a singular `product_identity` block.

The identity layers therefore remain distinct:

- entity `id` — configuration-local modeled physical/entity identity;
- `entity_type` — structural/behavioral type and applicable functionality;
- `product_identity` — optional real product/model/family metadata;
- `inventory` — Organizational Content Inventory classification.

## Files

- `reference_system.schema.json` — structural validation contract.
- `reference_system.template.yaml` — reusable valid example/template.
- `manifest.yaml` — file/status/configuration index.
- System `*.yaml` files — 16 current Reference-System files. The validator supports both the flat shared-source layout and a `systems/` subdirectory layout.
- `validate_configs.py` — reusable validator.
- `validator_run.txt` — most recent validation output for this bundle.

`Organizational_Content_Inventory.md` is a separate canonical project source file rather than a duplicated bundle member. The validator accepts it either beside this directory or one directory above it.

## Inventory conformance

The validator reads the current Organizational Content Inventory directly. For each system entity, connection, and concept link:

- `status: existing` requires an exact canonical category/item match.
- `status: proposed_addition` is allowed only for a genuine gap not already represented by that category/item in the current inventory.
- Numbered section headings, their named subsections, and listed items are valid inventory-controlled references; section-level umbrella mappings are allowed where intentionally used.

This keeps the YAML configurations synchronized with the living organizational source rather than duplicating the inventory vocabulary inside the schema.

## Modeling boundary

These are **initial architectural configurations**, not final implementation specifications. They intentionally capture stable physical organization and educationally important relationships while leaving deployment-specific, proprietary, ambiguous, or poorly documented details as black boxes or omissions. Product identity is likewise intentionally conservative: it records only product information that can be supported without guessing.
