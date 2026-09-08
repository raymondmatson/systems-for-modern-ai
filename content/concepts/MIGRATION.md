# Concept-Link Migration and Compatibility Note

## Current state

The current Reference-System authoring path supports a mixed source corpus. `content/RSCs/reference_system.schema.json` is the active additive **1.4.0** schema for migrated files; the repository also preserves explicit 1.3.0 and 1.2.0 compatibility schemas. The Version-1 initial configurations have migrated to stable `concept_id`/`role`/`target` Concept occurrences. Later-candidate configurations may still use the legacy display `name`, Organizational Content Inventory mapping, and one or more configuration-local `entity_ids`.

The current compatibility scan reports **27 legacy-link warnings and zero errors**, all outside the five-system Version-1 user-facing set. Those records remain useful architecture-occurrence seeds, but display names and inventory paths are not stable Concept identity.

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

`python content/concepts/validate_concepts.py --reference-systems content/RSCs` understands the canonical `concept_id`/`role`/`target` contract. Legacy `name`/`inventory`/`entity_ids` links are reported as migration warnings rather than validation failures so later-candidate 1.2.0 sources can coexist with migrated 1.4.0 sources.

The Version-1 initial configurations are already strict/canonical. Remaining migration work applies to later-candidate content before it is promoted to release scope; it does not block the current five-system user experience. When a later candidate is migrated, every user-facing Concept occurrence should resolve to a global `concept_id` and valid local target.

Scenario Concept references, if introduced later, should follow the same global identity rule: Scenario-specific state remains in Scenario data and never moves into global Concept definitions.
