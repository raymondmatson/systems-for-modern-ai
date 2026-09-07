#!/usr/bin/env python3
"""Validate reference-system YAML files against schema, inventory, product-identity, and cross-reference rules.

The validator supports either of these layouts:
  - shared-source/flat: system YAML files beside this script
  - bundle: system YAML files under ./systems/

Canonical inventory-controlled values are read from Organizational_Content_Inventory.md.
"""
from __future__ import annotations

from pathlib import Path
import json
import re
import sys
from typing import Any

import yaml
from jsonschema import Draft202012Validator

ROOT = Path(__file__).resolve().parent
SCHEMA_PATH = ROOT / "reference_system.schema.json"
SCHEMA_BY_VERSION = {
    "1.2.0": ROOT / "reference_system.schema.v1.2.0.json",
    "1.3.0": ROOT / "reference_system.schema.v1.3.0.json",
    "1.4.0": ROOT / "reference_system.schema.json",
}

def resolve_inventory_path() -> Path:
    """Locate the canonical inventory without requiring a duplicate bundle-local copy."""
    candidates = (
        ROOT.parents[1] / "docs" / "Organizational_Content_Inventory.md",
        ROOT / "Organizational_Content_Inventory.md",
        ROOT.parent / "Organizational_Content_Inventory.md",
    )
    for candidate in candidates:
        if candidate.is_file():
            return candidate
    return candidates[0]

INVENTORY_PATH = resolve_inventory_path()
TEMPLATE_PATH = ROOT / "reference_system.template.yaml"
MANIFEST_PATH = ROOT / "manifest.yaml"
CURRENT_SCHEMA_VERSION = "1.4.0"
PRODUCT_IDENTITY_KEYS = {"manufacturer", "product_family", "model", "variant", "generation", "architecture", "codename"}
PRODUCT_IDENTITY_PLACEHOLDERS = {"unknown", "n/a", "na", "none", "unspecified", "proprietary", "tbd", "to be determined", "generic"}

SCHEMA = json.loads(SCHEMA_PATH.read_text(encoding="utf-8"))
VALIDATOR = Draft202012Validator(SCHEMA)


def system_dir() -> Path:
    candidate = ROOT / "systems"
    return candidate if candidate.is_dir() else ROOT


def discover_system_files() -> list[Path]:
    """Discover YAML files that are reference-system documents."""
    result: list[Path] = []
    for path in sorted(system_dir().glob("*.yaml")):
        if path.name in {TEMPLATE_PATH.name, MANIFEST_PATH.name}:
            continue
        try:
            data = yaml.safe_load(path.read_text(encoding="utf-8"))
        except Exception:
            # Include parse failures so validate_file can report them.
            result.append(path)
            continue
        if isinstance(data, dict) and "reference_system" in data and "configurations" in data:
            result.append(path)
    return result


def parse_inventory(path: Path) -> dict[str, set[str]]:
    """Return canonical category -> accepted item names from the numbered inventory.

    Accepted inventory items include:
      - bullet items under the numbered section,
      - named subsection headings (e.g. "Scale-up"), and
      - the section heading itself for intentional umbrella mappings.

    Markdown emphasis is stripped, but wording/case/punctuation otherwise remains exact.
    """
    categories: dict[str, set[str]] = {}
    current: str | None = None
    for raw in path.read_text(encoding="utf-8").splitlines():
        section = re.match(r"^##\s+\d+\.\s+(.*\S)\s*$", raw)
        if section:
            current = section.group(1).strip()
            categories[current] = {current}
            continue
        if current is None:
            continue
        subsection = re.match(r"^###\s+(.*\S)\s*$", raw)
        if subsection:
            item = re.sub(r"\*\*(.*?)\*\*", r"\1", subsection.group(1).strip())
            categories[current].add(item)
            continue
        bullet = re.match(r"^\s*-\s+(.*\S)\s*$", raw)
        if bullet:
            item = re.sub(r"\*\*(.*?)\*\*", r"\1", bullet.group(1).strip())
            categories[current].add(item)
    return categories


INVENTORY = parse_inventory(INVENTORY_PATH)


def flatten(entity: dict[str, Any]) -> list[dict[str, Any]]:
    out = [entity]
    for child in entity.get("children", []) or []:
        out.extend(flatten(child))
    return out


def check_inventory_mapping(inv: dict[str, Any], label: str, errors: list[str]) -> None:
    category = inv.get("category")
    item = inv.get("item")
    status = inv.get("status")

    category_known = category in INVENTORY
    item_known = category_known and item in INVENTORY[category]

    if status == "existing":
        if not category_known:
            errors.append(f"{label}: inventory category is not canonical: {category!r}")
        elif not item_known:
            errors.append(
                f"{label}: inventory item is not canonical under {category!r}: {item!r}"
            )
    elif status == "proposed_addition":
        # Proposed additions remain a supported authoring state for future gaps, but a
        # proposal must not duplicate something that is already in the source inventory.
        if item_known:
            errors.append(
                f"{label}: stale proposed_addition; {category!r} / {item!r} now exists in the inventory"
            )


def check_product_identity(entity: dict[str, Any], label: str, errors: list[str]) -> None:
    pi = entity.get("product_identity")
    if pi is None:
        return
    unknown = set(pi) - PRODUCT_IDENTITY_KEYS
    if unknown:
        errors.append(f"{label}: unsupported product_identity fields: {sorted(unknown)}")
    if not pi.get("manufacturer"):
        errors.append(f"{label}: product_identity requires manufacturer")
    if not any(pi.get(k) for k in PRODUCT_IDENTITY_KEYS - {"manufacturer"}):
        errors.append(f"{label}: product_identity requires at least one non-manufacturer qualifier")
    for key, value in pi.items():
        if not isinstance(value, str) or not value.strip():
            errors.append(f"{label}: product_identity.{key} must be a nonblank string")
        elif value.strip().lower() in PRODUCT_IDENTITY_PLACEHOLDERS:
            errors.append(f"{label}: product_identity.{key} uses placeholder {value!r}; omit unsupported fields instead")


def validate_custom(data: dict[str, Any]) -> list[str]:
    errors: list[str] = []

    if data.get("schema_version") not in SCHEMA_BY_VERSION:
        errors.append(f"unsupported schema_version: {data.get('schema_version')}")

    source_ids = [s["id"] for s in data["sources"]]
    source_set = set(source_ids)
    if len(source_ids) != len(source_set):
        errors.append("duplicate source IDs")

    for sid in data["reference_system"]["source_ids"]:
        if sid not in source_set:
            errors.append(f"reference system references missing source: {sid}")

    config_ids = [c["id"] for c in data["configurations"]]
    if len(config_ids) != len(set(config_ids)):
        errors.append("duplicate configuration IDs")

    for cfg in data["configurations"]:
        cid = cfg["id"]
        for sid in cfg["source_ids"]:
            if sid not in source_set:
                errors.append(f"{cid}: configuration references missing source: {sid}")

        root = cfg["hierarchy"]["root"]
        if root["explore_tier"] != 1:
            errors.append(f"{cid}: hierarchy root must be Tier 1")

        entities = flatten(root)
        entity_ids = [e["id"] for e in entities]
        entity_set = set(entity_ids)
        if len(entity_ids) != len(entity_set):
            errors.append(f"{cid}: duplicate entity IDs")

        def tiercheck(entity: dict[str, Any], parent: dict[str, Any] | None = None) -> None:
            if parent and entity["explore_tier"] < parent["explore_tier"]:
                errors.append(
                    f"{cid}: child tier moves upward: {entity['id']} "
                    f"({entity['explore_tier']}) under {parent['id']} ({parent['explore_tier']})"
                )
            for child in entity.get("children", []) or []:
                tiercheck(child, entity)

        tiercheck(root)

        def check_evidence(obj: dict[str, Any], label: str) -> None:
            for sid in obj.get("evidence", {}).get("source_ids", []) or []:
                if sid not in source_set:
                    errors.append(f"{cid}: {label} references missing source: {sid}")

        for entity in entities:
            check_evidence(entity, f"entity {entity['id']}")
            check_inventory_mapping(entity["inventory"], f"{cid}: entity {entity['id']}", errors)
            check_product_identity(entity, f"{cid}: entity {entity['id']}", errors)

        connection_ids = [c["id"] for c in cfg.get("connections", [])]
        if len(connection_ids) != len(set(connection_ids)):
            errors.append(f"{cid}: duplicate connection IDs")
        for connection in cfg.get("connections", []):
            check_evidence(connection, f"connection {connection['id']}")
            check_inventory_mapping(
                connection["inventory"], f"{cid}: connection {connection['id']}", errors
            )
            for endpoint in connection["endpoints"]:
                if endpoint not in entity_set:
                    errors.append(
                        f"{cid}: connection {connection['id']} endpoint missing: {endpoint}"
                    )

        group_ids = [g["id"] for g in cfg.get("functional_groups", [])]
        if len(group_ids) != len(set(group_ids)):
            errors.append(f"{cid}: duplicate functional-group IDs")
        for group in cfg.get("functional_groups", []):
            check_evidence(group, f"functional group {group['id']}")
            for member in group["member_ids"]:
                if member not in entity_set:
                    errors.append(
                        f"{cid}: functional group {group['id']} member missing: {member}"
                    )

        for link in cfg.get("concept_links", []):
            label = link.get("concept_id") or link.get("name") or "concept-link"
            if link.get("inventory"):
                check_inventory_mapping(link["inventory"], f"{cid}: concept link {label}", errors)
            if "target" in link:
                target=link["target"]
                if target.get("type")=="entity" and target.get("id") not in entity_set:
                    errors.append(f"{cid}: concept link {label} entity missing: {target.get('id')}")
                if target.get("type")=="connection" and target.get("id") not in set(connection_ids):
                    errors.append(f"{cid}: concept link {label} connection missing: {target.get('id')}")
            else:
                for eid in link.get("entity_ids", []):
                    if eid not in entity_set:
                        errors.append(f"{cid}: concept link {label} entity missing: {eid}")

        for unknown in cfg.get("unknowns", []):
            for eid in unknown["affected_entity_ids"]:
                if eid not in entity_set:
                    errors.append(f"{cid}: unknown entry target missing: {eid}")

    return errors


def validate_file(path: Path) -> list[str]:
    try:
        data = yaml.safe_load(path.read_text(encoding="utf-8"))
    except Exception as exc:
        return [f"YAML parse error: {exc}"]
    if not isinstance(data, dict):
        return ["top-level YAML value must be a mapping"]
    version=data.get("schema_version")
    schema_path=SCHEMA_BY_VERSION.get(version)
    if not schema_path or not schema_path.exists():
        return [f"unsupported/missing schema_version: {version}"]
    validator=Draft202012Validator(json.loads(schema_path.read_text(encoding="utf-8")))
    schema_errors = [
        f"schema: {err.message} @ {'/'.join(map(str, err.path))}"
        for err in sorted(validator.iter_errors(data), key=lambda e: list(e.path))
    ]
    if schema_errors:
        return schema_errors
    return validate_custom(data)


def validate_template(path: Path) -> list[str]:
    try:
        data = yaml.safe_load(path.read_text(encoding="utf-8"))
    except Exception as exc:
        return [f"YAML parse error: {exc}"]
    errors = [
        f"schema: {err.message} @ {'/'.join(map(str, err.path))}"
        for err in sorted(VALIDATOR.iter_errors(data), key=lambda e: list(e.path))
    ]
    if not errors:
        errors.extend(validate_custom(data))
    return errors


def validate_manifest(path: Path, system_files: list[Path]) -> list[str]:
    errors: list[str] = []
    try:
        data = yaml.safe_load(path.read_text(encoding="utf-8"))
    except Exception as exc:
        return [f"YAML parse error: {exc}"]
    if not isinstance(data, dict):
        return ["manifest top-level YAML value must be a mapping"]

    entries = data.get("systems")
    if not isinstance(entries, list):
        return ["manifest systems must be an array"]
    if data.get("system_file_count") != len(entries):
        errors.append(
            f"manifest system_file_count={data.get('system_file_count')} does not match entries={len(entries)}"
        )

    by_name = {p.name: p for p in system_files}
    manifest_names: list[str] = []
    for entry in entries:
        file_value = entry.get("file", "")
        file_name = Path(file_value).name
        manifest_names.append(file_name)
        if file_name not in by_name:
            errors.append(f"manifest references missing system file: {file_value}")
            continue
        try:
            system_data = yaml.safe_load(by_name[file_name].read_text(encoding="utf-8"))
        except Exception:
            continue
        rs = system_data.get("reference_system", {})
        if entry.get("id") != rs.get("id"):
            errors.append(f"manifest {file_name}: id does not match system file")
        if entry.get("name") != rs.get("name"):
            errors.append(f"manifest {file_name}: name does not match system file")
        if entry.get("planning_status") != rs.get("planning_status"):
            errors.append(f"manifest {file_name}: planning_status does not match system file")
        if entry.get("configuration_count") != len(system_data.get("configurations", [])):
            errors.append(f"manifest {file_name}: configuration_count does not match system file")

    if len(manifest_names) != len(set(manifest_names)):
        errors.append("manifest contains duplicate file entries")

    unlisted = sorted(set(by_name) - set(manifest_names))
    for file_name in unlisted:
        errors.append(f"system file missing from manifest: {file_name}")

    if data.get("system_file_count") != len(system_files):
        errors.append(
            f"manifest system_file_count={data.get('system_file_count')} does not match discovered files={len(system_files)}"
        )
    return errors


def main() -> None:
    missing = [p.name for p in (SCHEMA_PATH, INVENTORY_PATH, TEMPLATE_PATH, MANIFEST_PATH) if not p.exists()]
    if missing:
        for name in missing:
            print(f"MISSING: {name}")
        raise SystemExit(1)

    files = discover_system_files()
    failed = False

    for path in files:
        errors = validate_file(path)
        print(f"{path.name}: {'PASS' if not errors else 'FAIL'}")
        for error in errors:
            print("  -", error)
        failed |= bool(errors)

    template_errors = validate_template(TEMPLATE_PATH)
    print(f"{TEMPLATE_PATH.name}: {'PASS' if not template_errors else 'FAIL'}")
    for error in template_errors:
        print("  -", error)
    failed |= bool(template_errors)

    manifest_errors = validate_manifest(MANIFEST_PATH, files)
    print(f"{MANIFEST_PATH.name}: {'PASS' if not manifest_errors else 'FAIL'}")
    for error in manifest_errors:
        print("  -", error)
    failed |= bool(manifest_errors)

    print(
        f"SUMMARY: systems={len(files)}, yaml_documents={len(files)+2}, "
        f"inventory_categories={len(INVENTORY)}, active_schema_version={CURRENT_SCHEMA_VERSION}, result={'FAIL' if failed else 'PASS'}"
    )
    raise SystemExit(1 if failed else 0)


if __name__ == "__main__":
    main()
