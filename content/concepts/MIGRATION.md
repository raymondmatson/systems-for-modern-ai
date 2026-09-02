# Concept-Link Migration and Compatibility Note

## Current state

The current Reference-System schema is **1.2.0**, but its `concept_links` records still use the legacy display `name`, Organizational Content Inventory mapping, and one or more configuration-local `entity_ids`. The 1.2.0 taxonomy finalization intentionally did not perform the Concept-link migration because the Architecture-Anchored Foundational Library is not yet complete.

Those records are useful architecture-occurrence seeds, but display names and inventory paths are not stable Concept identity.

## Target state

Reference-Configuration Concept–Architecture Links should migrate to stable global `concept_id` references plus an explicit occurrence role and target. The simplest normalized form is one occurrence target per link:

```yaml
concept_links:
  - concept_id: rdma
    role: uses
    target:
      type: entity
      id: backend-nic
```

For relationship-oriented Concepts:

```yaml
concept_links:
  - concept_id: roce
    role: embodies
    target:
      type: connection
      id: backend-roce-link
```

For architecture-level ideas:

```yaml
concept_links:
  - concept_id: scale-up
    role: illustrates
    target:
      type: configuration
```

Allowed roles are `embodies`, `uses`, `illustrates`, `applies_to`, and `measured_at`. Allowed target types are `entity`, `connection`, and `configuration`.

## Migration rules

1. Preserve all existing physical entity IDs, connection IDs, hierarchy, product identity, evidence, and inventory classifications.
2. Resolve each legacy link to a real canonical global `concept_id`; do not derive the ID mechanically from the inventory path when the semantic identity needs review.
3. Assign an occurrence role explicitly rather than inferring one from `entity_type`, inventory classification, or product name.
4. Expand a legacy `entity_ids` list into one normalized occurrence link per target unless a later schema explicitly supports grouped targets.
5. Keep configuration-specific explanation/evidence with the Reference Configuration occurrence. Do not move vendor/deployment-specific claims into the global Concept article.
6. Do not add links merely because a Concept is technically applicable. Occurrences remain selective and educationally useful.
7. Do not create reverse occurrence lists in Concept YAML. Generate Concept → architecture indexes from Reference-Configuration data.

## Compatibility during transition

`validate_concepts.py --reference-systems <dir>` understands the target `concept_id`/`role`/`target` contract. Legacy `name`/`inventory`/`entity_ids` links are reported as migration warnings rather than validation failures so the current Reference-System corpus can coexist with the new Concept Library until a dedicated schema migration is approved.

Once the Reference-System schema is updated and the migration is complete, strict validation should require every configuration Concept occurrence to resolve to a global `concept_id` and valid local target.

Scenario Concept references should follow the same identity rule when the richer Scenario schema is implemented: Scenarios may reference stable `concept_id` values for explanatory relevance, but Scenario-specific state remains in Scenario data and never moves into global Concept definitions.
