# Product Catalog

The Product Catalog stores reusable, non-instance facts about real product families, models, and variants. Physical realizations remain configuration-local Reference-System entities.

## Record layout

- One YAML file per Product Definition: `<product-id>.yaml`.
- `product.id` is globally unique lowercase kebab-case and must match the filename.
- `product.revision` is a positive integer record revision and is pinned exactly by RSC `product_ref` records.
- `record_level` is `family`, `model`, or `variant`; a record may contain only claims appropriate to that level.
- Product-intrinsic properties belong here. Deployment/configuration facts remain on the RSC entity.
- Product Definitions never become Explore entities, containment parents, Concept occurrences, Scenario targets, or reusable child templates.

RSC migration rules:

1. Inline `product_identity` only: valid uncataloged/legacy form.
2. `product_ref` only: preferred cataloged form.
3. Both and equivalent: temporarily valid with a migration warning; `product_ref` is authoritative for reusable identity.
4. Both and conflicting: validation error.
5. Neither: valid for generic, heterogeneous, unsupported, or identity-irrelevant entities.
