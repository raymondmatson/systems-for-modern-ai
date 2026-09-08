# Reference-System canonical sources

This directory intentionally supports a **mixed source-schema corpus** during incremental migration. The current authored corpus contains **8 system files / 9 configurations on 1.4.0** and **8 system files / 9 configurations on 1.2.0**. No current authored system file remains on 1.3.0, but its compatibility schema is preserved.

- `reference_system.schema.v1.2.0.json` validates retained 1.2.0 sources.
- `reference_system.schema.v1.3.0.json` preserves the pre-anatomy/Product-Catalog 1.3.0 contract for compatibility/history.
- `reference_system.schema.json` is the current additive **1.4.0** authoring contract. It adds exact `product_ref` references, authored noninteractive `anatomy` depictions, and the controlled `system_memory` / `power_system` entity types.

Do not mass-rewrite older sources merely to make the corpus homogeneous. Migration is deliberate and file-by-file. Canonical physical identity remains configuration-local.

## Anatomy Depictions

An `anatomy` record is owned by an enclosing Entity but is **not an Entity**. It exists only when source-supported physical presence is needed for orientation without independent selection/navigation/relationship semantics. Depictions:

- have a stable depiction ID in a separate namespace;
- carry canonical inventory mapping and evidence;
- declare `depiction_kind` and `placement_basis` (`schematic` or `documented`);
- may carry a supported count/basis;
- cannot have children, properties, Product references, Concept links, connections, Scenario targeting, Selection, Enter, Follow, or addressable-member identity.

Promote a physical part to an ordinary Entity only when independent Detail, properties, connections, Concept occurrence, Scenario targeting, nested structure, or navigation is materially useful.

## Product references

Reusable product/model facts live under `content/products/`. An RSC may use:

```yaml
product_ref:
  id: nvidia-connectx-7
  revision: 1
```

Rules:

1. inline `product_identity` only: valid legacy/uncataloged form;
2. `product_ref` only: preferred cataloged form;
3. both equivalent: temporarily valid with migration warning; Product Catalog is reusable authority;
4. both conflicting: error;
5. neither: valid for generic, heterogeneous, unsupported, or identity-irrelevant entities.

Product definitions never become physical parents, navigation destinations, Scenario targets, Concept occurrences, or automatic child templates.

## Validation

Run the repository-level validators rather than assuming one schema version:

```bash
python content/RSCs/validate_configs.py
python scripts/content/validate_products_anatomy.py
```

The canonical Organizational Content Inventory remains `docs/Organizational_Content_Inventory.md` and must not be duplicated into this directory.
