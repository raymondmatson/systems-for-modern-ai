#!/usr/bin/env python3
"""Validate the authored global Concept Library.

Canonical source model:
  metadata/<concept_id>.yaml  -- structured metadata and graph edges
  content/<concept_id>.md     -- long-form educational content

The validator intentionally reads the living Organizational Content Inventory
rather than hard-coding inventory vocabulary in the JSON Schema.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from collections import defaultdict
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Iterable

import yaml
from jsonschema import Draft202012Validator, FormatChecker

CURRENT_SCHEMA_VERSION = "1.0.0"
CONCEPT_ID_RE = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
TAG_RE = CONCEPT_ID_RE
RELATIONSHIP_KEYS = ("prerequisites", "specializes", "contrasts_with", "related")
OCCURRENCE_ROLES = {"embodies", "uses", "illustrates", "applies_to", "measured_at"}
TARGET_TYPES = {"entity", "connection", "configuration"}
PLACEHOLDER_VALUES = {"tbd", "todo", "n/a", "na", "replace-me", "placeholder"}
MARKDOWN_PLACEHOLDER_RE = re.compile(
    r"(?im)^\s*(?:TODO|TBD|N/?A|PLACEHOLDER|REPLACE\s+THIS(?:\s+TEXT)?)\s*[:.-]?\s*$"
)


@dataclass
class ValidationResult:
    errors: list[str]
    warnings: list[str]
    concept_count: int = 0

    @property
    def ok(self) -> bool:
        return not self.errors


def default_root() -> Path:
    return Path(__file__).resolve().parent


def load_schema(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def parse_inventory(path: Path) -> dict[str, set[str]]:
    """Return numbered inventory category -> accepted canonical item strings.

    Matches the Reference-System validator convention: numbered section headings,
    named ### subsections, and bullet items are valid controlled references.
    Markdown emphasis is stripped while wording/case/punctuation remains exact.
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


def discover_metadata(metadata_dir: Path) -> list[Path]:
    return sorted(metadata_dir.glob("*.yaml"))


def load_yaml(path: Path) -> tuple[Any | None, str | None]:
    try:
        return yaml.safe_load(path.read_text(encoding="utf-8")), None
    except Exception as exc:  # pragma: no cover - defensive wrapper
        return None, str(exc)


def exact_placeholder(value: str) -> bool:
    normalized = re.sub(r"[\s_]+", "-", value.strip().lower()).strip(".-:")
    return normalized in PLACEHOLDER_VALUES


def walk_strings(value: Any, path: str = "") -> Iterable[tuple[str, str]]:
    if isinstance(value, str):
        yield path, value
    elif isinstance(value, dict):
        for key, child in value.items():
            child_path = f"{path}.{key}" if path else str(key)
            yield from walk_strings(child, child_path)
    elif isinstance(value, list):
        for i, child in enumerate(value):
            child_path = f"{path}[{i}]"
            yield from walk_strings(child, child_path)


def markdown_sections(text: str) -> dict[str, str]:
    sections: dict[str, list[str]] = {}
    current: str | None = None
    for line in text.splitlines():
        m = re.match(r"^##\s+(.+?)\s*$", line)
        if m:
            current = m.group(1).strip()
            sections.setdefault(current, [])
            continue
        if current is not None:
            sections[current].append(line)
    return {name: "\n".join(lines).strip() for name, lines in sections.items()}


def check_markdown(path: Path, expected_name: str, errors: list[str]) -> None:
    if not path.is_file():
        errors.append(f"missing Markdown content file: {path}")
        return
    text = path.read_text(encoding="utf-8")
    if not text.strip():
        errors.append(f"{path}: Markdown file is empty")
        return
    first_nonblank = next((line.strip() for line in text.splitlines() if line.strip()), "")
    expected_h1 = f"# {expected_name}"
    if first_nonblank != expected_h1:
        errors.append(f"{path}: first heading must be exactly {expected_h1!r}")
    if MARKDOWN_PLACEHOLDER_RE.search(text):
        errors.append(f"{path}: contains placeholder-only Markdown content")
    sections = markdown_sections(text)
    for required in ("Overview", "Why It Matters"):
        body = sections.get(required, "")
        if len(re.sub(r"\s+", " ", body).strip()) < 80:
            errors.append(f"{path}: ## {required} must contain substantive explanatory prose")
    body_chars = len(re.sub(r"\s+", "", text))
    if body_chars < 400:
        errors.append(f"{path}: Markdown content is too short for a canonical Concept ({body_chars} non-space chars)")


def find_prerequisite_cycle(graph: dict[str, list[str]]) -> list[str] | None:
    state: dict[str, int] = {}  # 0 unseen, 1 visiting, 2 done
    stack: list[str] = []

    def visit(node: str) -> list[str] | None:
        state[node] = 1
        stack.append(node)
        for nxt in graph.get(node, []):
            if state.get(nxt, 0) == 0:
                cycle = visit(nxt)
                if cycle:
                    return cycle
            elif state.get(nxt) == 1:
                idx = stack.index(nxt)
                return stack[idx:] + [nxt]
        stack.pop()
        state[node] = 2
        return None

    for node in graph:
        if state.get(node, 0) == 0:
            cycle = visit(node)
            if cycle:
                return cycle
    return None


def validate_reference_systems(ref_dir: Path, concept_ids: set[str], warnings: list[str], errors: list[str]) -> None:
    """Compatibility-aware validation of migrated Concept–Architecture Links.

    Target contract is validated when concept_id/role/target are present. Legacy
    name/inventory/entity_ids records are reported as warnings during transition.
    """
    files = sorted(ref_dir.rglob("*.yaml"))
    for path in files:
        data, parse_error = load_yaml(path)
        if parse_error or not isinstance(data, dict) or "configurations" not in data:
            continue
        for cfg in data.get("configurations", []) or []:
            if not isinstance(cfg, dict):
                continue
            cid = str(cfg.get("id", "<unknown-config>"))
            entities: set[str] = set()

            def collect_entities(entity: Any) -> None:
                if not isinstance(entity, dict):
                    return
                if isinstance(entity.get("id"), str):
                    entities.add(entity["id"])
                for child in entity.get("children", []) or []:
                    collect_entities(child)

            root = ((cfg.get("hierarchy") or {}).get("root"))
            collect_entities(root)
            connections = {
                c.get("id") for c in (cfg.get("connections") or [])
                if isinstance(c, dict) and isinstance(c.get("id"), str)
            }
            for idx, link in enumerate(cfg.get("concept_links", []) or []):
                if not isinstance(link, dict):
                    errors.append(f"{path}:{cid}: concept_links[{idx}] must be a mapping")
                    continue
                label = f"{path.name}:{cid}:concept_links[{idx}]"
                if "concept_id" not in link:
                    if "name" in link or "inventory" in link or "entity_ids" in link:
                        warnings.append(f"{label}: legacy Concept link has not yet migrated to concept_id/role/target")
                    continue
                concept_id = link.get("concept_id")
                if concept_id not in concept_ids:
                    errors.append(f"{label}: unknown global concept_id {concept_id!r}")
                role = link.get("role")
                if role not in OCCURRENCE_ROLES:
                    errors.append(f"{label}: invalid role {role!r}; expected one of {sorted(OCCURRENCE_ROLES)}")
                target = link.get("target")
                if not isinstance(target, dict):
                    errors.append(f"{label}: target must be a mapping")
                    continue
                ttype = target.get("type")
                if ttype not in TARGET_TYPES:
                    errors.append(f"{label}: invalid target.type {ttype!r}")
                    continue
                tid = target.get("id")
                if ttype == "configuration":
                    if tid is not None:
                        errors.append(f"{label}: configuration target must omit target.id")
                elif not isinstance(tid, str) or not tid:
                    errors.append(f"{label}: {ttype} target requires nonblank target.id")
                elif ttype == "entity" and tid not in entities:
                    errors.append(f"{label}: missing entity target {tid!r}")
                elif ttype == "connection" and tid not in connections:
                    errors.append(f"{label}: missing connection target {tid!r}")

            # Lightweight future Scenario-reference check: validate any explicit
            # concept_ids arrays without assuming a complete future Scenario schema.
            def scan_concept_ids(obj: Any, obj_path: str) -> None:
                if isinstance(obj, dict):
                    for key, value in obj.items():
                        next_path = f"{obj_path}.{key}"
                        if key == "concept_ids" and isinstance(value, list):
                            for value_id in value:
                                if value_id not in concept_ids:
                                    errors.append(f"{path.name}:{cid}:{next_path}: unknown concept_id {value_id!r}")
                        else:
                            scan_concept_ids(value, next_path)
                elif isinstance(obj, list):
                    for i, value in enumerate(obj):
                        scan_concept_ids(value, f"{obj_path}[{i}]")

            scan_concept_ids(cfg, "configuration")


def validate_library(
    root: Path,
    inventory_path: Path | None = None,
    schema_path: Path | None = None,
    reference_systems: Path | None = None,
) -> ValidationResult:
    errors: list[str] = []
    warnings: list[str] = []

    metadata_dir = root / "metadata"
    content_dir = root / "content"
    schema_path = schema_path or root / "schemas" / "concept.schema.json"
    inventory_path = inventory_path or root.parent / "Organizational_Content_Inventory.md"

    if not metadata_dir.is_dir():
        return ValidationResult([f"missing metadata directory: {metadata_dir}"], warnings)
    if not content_dir.is_dir():
        return ValidationResult([f"missing content directory: {content_dir}"], warnings)
    if not schema_path.is_file():
        return ValidationResult([f"missing schema: {schema_path}"], warnings)
    if not inventory_path.is_file():
        return ValidationResult([f"missing Organizational Content Inventory: {inventory_path}"], warnings)

    schema = load_schema(schema_path)
    validator = Draft202012Validator(schema, format_checker=FormatChecker())
    inventory = parse_inventory(inventory_path)

    records: dict[str, dict[str, Any]] = {}
    metadata_paths: dict[str, Path] = {}
    claimed_content: dict[Path, str] = {}
    canonical_names: dict[str, str] = {}
    alias_owners: defaultdict[str, set[str]] = defaultdict(set)

    for path in discover_metadata(metadata_dir):
        data, parse_error = load_yaml(path)
        if parse_error:
            errors.append(f"{path}: YAML parse error: {parse_error}")
            continue
        if not isinstance(data, dict):
            errors.append(f"{path}: top-level YAML value must be a mapping")
            continue

        for err in sorted(validator.iter_errors(data), key=lambda e: list(e.path)):
            location = "/".join(map(str, err.path)) or "<root>"
            errors.append(f"{path}: schema: {err.message} @ {location}")
        if any(str(path) in e and "schema:" in e for e in errors):
            # Continue with best-effort custom checks only where keys exist.
            pass

        cid = data.get("concept_id")
        if not isinstance(cid, str) or not CONCEPT_ID_RE.fullmatch(cid):
            continue
        if cid in records:
            errors.append(f"duplicate concept_id {cid!r}: {metadata_paths[cid]} and {path}")
            continue
        records[cid] = data
        metadata_paths[cid] = path

        if path.name != f"{cid}.yaml":
            errors.append(f"{path}: filename must be {cid}.yaml")

        if data.get("schema_version") != CURRENT_SCHEMA_VERSION:
            errors.append(f"{path}: schema_version must be {CURRENT_SCHEMA_VERSION}")

        expected_content = f"../content/{cid}.md"
        if data.get("content_file") != expected_content:
            errors.append(f"{path}: content_file must be exactly {expected_content!r}")
        content_path = (path.parent / str(data.get("content_file", ""))).resolve()
        expected_resolved = (content_dir / f"{cid}.md").resolve()
        if content_path != expected_resolved:
            errors.append(f"{path}: content_file resolves outside the canonical pair path")
        else:
            prior = claimed_content.get(content_path)
            if prior and prior != cid:
                errors.append(f"{path}: content file is already claimed by concept_id {prior!r}")
            claimed_content[content_path] = cid
            check_markdown(content_path, str(data.get("name", "")), errors)

        for field_path, value in walk_strings(data):
            if exact_placeholder(value):
                errors.append(f"{path}: placeholder value at {field_path}: {value!r}; omit unsupported optional fields")
            if field_path.endswith(".url") and "example.invalid" in value.lower():
                errors.append(f"{path}: fake example.invalid URL is not allowed in canonical Concept data")

        mappings = data.get("inventory_mappings")
        if isinstance(mappings, list):
            primaries = 0
            seen_mappings: set[tuple[str, str]] = set()
            for i, mapping in enumerate(mappings):
                if not isinstance(mapping, dict):
                    continue
                category = mapping.get("category")
                item = mapping.get("item")
                if mapping.get("primary") is True:
                    primaries += 1
                key = (str(category), str(item))
                if key in seen_mappings:
                    errors.append(f"{path}: duplicate inventory mapping {key!r}")
                seen_mappings.add(key)
                if category not in inventory:
                    errors.append(f"{path}: inventory_mappings[{i}] unknown category {category!r}")
                elif item not in inventory[category]:
                    errors.append(f"{path}: inventory_mappings[{i}] item {item!r} is not canonical under {category!r}")
            if primaries != 1:
                errors.append(f"{path}: inventory_mappings must contain exactly one primary:true mapping (found {primaries})")

        relationships = data.get("relationships")
        if isinstance(relationships, dict):
            for rel in RELATIONSHIP_KEYS:
                values = relationships.get(rel)
                if isinstance(values, list):
                    if len(values) != len(set(values)):
                        errors.append(f"{path}: duplicate concept IDs in relationships.{rel}")
                    if cid in values:
                        errors.append(f"{path}: Concept must not reference itself in relationships.{rel}")

        source_ids: list[str] = []
        for source in data.get("sources", []) or []:
            if isinstance(source, dict) and isinstance(source.get("source_id"), str):
                source_ids.append(source["source_id"])
        if len(source_ids) != len(set(source_ids)):
            errors.append(f"{path}: duplicate source_id values within Concept record")

        name = data.get("name")
        if isinstance(name, str):
            normalized = name.strip().casefold()
            if normalized in canonical_names and canonical_names[normalized] != cid:
                errors.append(f"{path}: canonical name {name!r} collides with concept_id {canonical_names[normalized]!r}")
            canonical_names[normalized] = cid
        for alias in data.get("aliases", []) or []:
            if isinstance(alias, str):
                alias_owners[alias.strip().casefold()].add(cid)

    concept_ids = set(records)

    for cid, data in records.items():
        path = metadata_paths[cid]
        relationships = data.get("relationships") or {}
        if not isinstance(relationships, dict):
            continue
        for rel in RELATIONSHIP_KEYS:
            for target in relationships.get(rel, []) or []:
                if target not in concept_ids:
                    errors.append(f"{path}: relationships.{rel} references missing concept_id {target!r}")

    prereq_graph = {
        cid: list((data.get("relationships") or {}).get("prerequisites", []) or [])
        for cid, data in records.items()
    }
    cycle = find_prerequisite_cycle(prereq_graph)
    if cycle:
        errors.append("prerequisite cycle detected: " + " -> ".join(cycle))

    for alias_key, owners in sorted(alias_owners.items()):
        combined = set(owners)
        if alias_key in canonical_names:
            combined.add(canonical_names[alias_key])
        if len(combined) > 1:
            warnings.append(f"ambiguous alias/name {alias_key!r} resolves to multiple concepts: {sorted(combined)}")

    metadata_ids = set(records)
    markdown_ids = {path.stem for path in content_dir.glob("*.md")}
    for orphan in sorted(markdown_ids - metadata_ids):
        errors.append(f"orphan Markdown content without metadata: {content_dir / (orphan + '.md')}")
    for missing in sorted(metadata_ids - markdown_ids):
        errors.append(f"metadata Concept lacks canonical Markdown pair: {metadata_dir / (missing + '.yaml')}")

    if reference_systems is not None:
        if reference_systems.is_dir():
            validate_reference_systems(reference_systems, concept_ids, warnings, errors)
        else:
            errors.append(f"Reference-System path is not a directory: {reference_systems}")

    return ValidationResult(errors, warnings, concept_count=len(records))


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Validate global Concept Library authored YAML + Markdown")
    parser.add_argument("--root", type=Path, default=default_root(), help="Concept library root (default: script directory)")
    parser.add_argument("--inventory", type=Path, default=None, help="Path to Organizational_Content_Inventory.md")
    parser.add_argument("--schema", type=Path, default=None, help="Path to concept.schema.json")
    parser.add_argument("--reference-systems", type=Path, default=None, help="Optional Reference-System source directory for migration-aware Concept-link validation")
    args = parser.parse_args(argv)

    result = validate_library(args.root.resolve(), args.inventory.resolve() if args.inventory else None, args.schema.resolve() if args.schema else None, args.reference_systems.resolve() if args.reference_systems else None)

    for warning in result.warnings:
        print(f"WARNING: {warning}")
    for error in result.errors:
        print(f"ERROR: {error}")

    status = "PASS" if result.ok else "FAIL"
    print(f"SUMMARY: concepts={result.concept_count}, warnings={len(result.warnings)}, errors={len(result.errors)}, result={status}")
    return 0 if result.ok else 1


if __name__ == "__main__":
    sys.exit(main())
