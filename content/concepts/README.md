# Global Concept Library Authoring Contract

This directory establishes the canonical authored source model for the project's global **Concept Library**. It implements the Source of Truth rule that Concepts are global explanatory objects, while Reference-Configuration entities and connections remain configuration-local.

## Canonical storage model

Each canonical Concept consists of exactly one pair:

```text
metadata/<concept_id>.yaml
content/<concept_id>.md
```

YAML is authoritative for stable identity, machine-readable metadata, relationships, inventory mappings, aliases, tags, and structured sources. Markdown is authoritative for human-authored educational explanation. Runtime databases, search indexes, graph indexes, or caches should be generated from these authored files rather than manually maintained as a second source of truth.

The initial metadata schema version is **1.0.0** and is intentionally separate from the Reference-System schema version.

## Stable IDs and filenames

`concept_id` values are global, stable, lowercase ASCII kebab-case identifiers. They are independent of vendor, Reference System, Organizational Content Inventory placement, and display name.

Examples:

- `rdma`
- `tensor-parallelism`
- `time-to-first-token`
- `scale-up`

Filenames must match the ID exactly: `<concept_id>.yaml` and `<concept_id>.md`. Renaming a Concept title does not require changing its published `concept_id`.

Concept display `name` values use conventional technical capitalization rather than forced title case. Acronyms and branded technology names retain their established forms; machine identifiers and tags remain lowercase kebab-case.

## Controlled vocabularies

### `concept_kind`

The schema permits only:

- `principle`
- `mechanism`
- `protocol_standard`
- `topology`
- `operation_workflow`
- `metric`
- `software_abstraction`
- `hardware_technology`
- `comparison_distinction`

`concept_kind` is descriptive metadata for browsing, filtering, and presentation. It is **not** analogous to Reference-Configuration `entity_type` and must not control physical behavior.

### Concept relationships

Relationships are authored from the current Concept's perspective:

- `prerequisites` — direct learning dependencies that should usually be understood first. These are advisory and must be acyclic.
- `specializes` — broader Concepts that the current Concept is a narrower/specialized form of.
- `contrasts_with` — Concepts that are especially useful to compare or distinguish from the current Concept.
- `related` — other directly relevant Concepts that do not fit the preceding relationships.

Only the authored direction is stored. Reverse lookup is derived. Do not add redundant transitive prerequisite edges.

### Concept–Architecture Link roles

Reference Configurations, not Concept files, own architecture-specific occurrences. The approved occurrence-role vocabulary is:

- `embodies` — the target physically realizes the Concept.
- `uses` — the target uses or participates in the Concept.
- `illustrates` — the target is a useful example of a broader Concept.
- `applies_to` — the Concept is relevant to the target without being physically embodied by it.
- `measured_at` — a metric Concept is meaningfully observed at the target.

The intended normalized target form is one explicit occurrence per link:

```yaml
concept_links:
  - concept_id: rdma
    role: uses
    target:
      type: entity
      id: backend-nic

  - concept_id: roce
    role: embodies
    target:
      type: connection
      id: accelerator-fabric-link

  - concept_id: scale-up
    role: illustrates
    target:
      type: configuration
```

Supported target types are `entity`, `connection`, and `configuration`. Reverse “where does this Concept appear?” indexes should be derived from Reference-Configuration links; occurrence lists are deliberately not stored in global Concept YAML.

## Inventory mappings

Inventory mappings organize content but never define Concept identity. A Concept may map to several current Organizational Content Inventory locations when genuinely cross-cutting. If mappings are present, exactly one must be marked `primary: true`.

The validator reads the living `Organizational_Content_Inventory.md` from the project root. Inventory vocabulary is not duplicated in the JSON Schema.

A valid Concept may omit `inventory_mappings` if no honest current mapping exists. Do not force an artificial classification.

## Aliases and tags

Aliases represent acronyms, abbreviations, alternate terminology, and common spellings that resolve to one canonical Concept. Alias collisions across Concepts are reported as warnings for editorial review rather than automatically resolved.

Tags are optional, broad lowercase kebab-case search/filter hints. They must not become a parallel taxonomy or repeat every inventory/classification fact.

## Sources

`sources` is optional. When used, each record requires `source_id`, `title`, and `url`; `publisher`, `year`, and `note` are optional. Source IDs are scoped to the Concept record in this initial contract because no global source library exists yet.

Canonical Concept data must not contain fake URLs or placeholder source records. Unsupported optional metadata should simply be omitted.

## Markdown responsibilities

Canonical Markdown must:

- begin with an H1 exactly matching the YAML `name`;
- contain meaningful `## Overview` and `## Why It Matters` sections;
- contain substantive prose rather than placeholders.

Other sections are optional and should be used only when they improve the explanation. One Concept article supports progressive disclosure; separate beginner/intermediate/advanced Concept IDs are not permitted merely to represent depth.

## Initial library scope

The initial library follows the **Architecture-Anchored Foundational Library** policy. It should eventually cover the Concepts directly exposed by the initial Reference Systems, their direct prerequisites, and major cross-cutting foundations needed to understand those architectures. It is not intended to exhaustively mirror every Organizational Content Inventory item.

The records currently under `metadata/` and `content/` are a small canonical example set that exercises the storage contract; they are not the final initial Concept Library.

## Validation

Run from the project root:

```bash
python concepts/validate_concepts.py
python -m unittest discover -s concepts/tests -v
```

The validator checks YAML/JSON Schema structure, filenames, content pairing, Markdown identity/minimum content, inventory mappings, relationship targets, self-references, duplicate edges, prerequisite cycles, aliases, tags, sources, and placeholder values.

Reference-System integration is compatibility-aware but intentionally not forced in this task. Pass a Reference-System source directory to inspect migrated links while reporting legacy name/inventory-based links as warnings:

```bash
python concepts/validate_concepts.py --reference-systems path/to/RSCs
```

See `MIGRATION.md` for the compatibility direction.
