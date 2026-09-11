#!/usr/bin/env python3
"""Exhaustive Phase-8 visual coverage audit for the five initial systems.

The audit mirrors the DEP-033/RDY-018 Explore enterability rule, materializes the
exact current Explore view-model/components through the dependency-light renderer
adapter, and performs source-geometry plus system-Chromium sanity checks. It is
implementation evidence, not a substitute for the pinned React/Vite/three-engine
regression matrix or moderated comprehension evidence.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import math
import subprocess
import sys
import tempfile
from collections import Counter
from pathlib import Path
from typing import Any

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[2]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))
from scripts.benchmarks import render_density

FIXTURE = ROOT / "tests" / "fixtures" / "visual-coverage-phase8.json"
DEFAULT_OUTPUT = ROOT / "reports" / "implementation" / "visual-coverage-initial-five.json"
DEFAULT_IMAGE_DIR = ROOT / "reports" / "implementation" / "phase8-coverage-images"


def _entity_locator(system_id: str, config_id: str, entity_id: str, entities: dict[str, Any]) -> dict[str, Any]:
    chain: list[str] = []
    cursor = entity_id
    while cursor:
        chain.append(cursor)
        parent = entities.get(cursor, {}).get("parentId")
        if not parent:
            break
        cursor = parent
    chain.reverse()
    representative_index: int | None = None
    for index, candidate_id in enumerate(chain):
        population = entities.get(candidate_id, {}).get("population") or {}
        if population.get("expansionMode") == "representative_member":
            representative_index = index
            break
    if representative_index is None:
        return {
            "kind": "entity",
            "systemId": system_id,
            "configurationId": config_id,
            "entityId": entity_id,
        }
    aggregate_id = chain[representative_index]
    return {
        "kind": "representative_member",
        "systemId": system_id,
        "configurationId": config_id,
        "aggregateId": aggregate_id,
        "path": chain[representative_index:],
    }


def _child_locator(location: dict[str, Any], child_id: str) -> dict[str, Any]:
    if location["kind"] == "representative_member":
        return {
            "kind": "representative_member",
            "systemId": location["systemId"],
            "configurationId": location["configurationId"],
            "aggregateId": location["aggregateId"],
            "path": [*location["path"], child_id],
        }
    return {
        "kind": "entity",
        "systemId": location["systemId"],
        "configurationId": location["configurationId"],
        "entityId": child_id,
    }


def _make_fixture() -> dict[str, Any]:
    manifest = json.loads((ROOT / "runtime" / "generated" / "manifest.json").read_text())
    capabilities = json.loads((ROOT / "runtime" / "generated" / "capabilities.json").read_text()).get("entityTypes", {})
    scenes: list[dict[str, Any]] = []
    baseline_contexts = 0
    for system_id in manifest.get("initialSystemIds", []):
        system_path = ROOT / "runtime" / "generated" / "systems" / f"{system_id}.json"
        system = json.loads(system_path.read_text())
        for configuration in system.get("configurations", {}).values():
            entities = configuration.get("entities", {})
            connections = list(configuration.get("connections", {}).values())
            endpoint_ids = {endpoint for connection in connections for endpoint in connection.get("endpointIds", [])}
            for entity in entities.values():
                capability = capabilities.get(entity.get("entityType"), {})
                contextual = capability.get("enterability") == "contextual"
                representative = (entity.get("population") or {}).get("expansionMode") == "representative_member"
                has_children = bool(entity.get("childIds"))
                has_anatomy = bool(entity.get("anatomyDepictions"))
                relationship_enterable = entity.get("representation") != "black_box" and entity.get("id") in endpoint_ids
                if not (contextual and (representative or has_children or has_anatomy or relationship_enterable)):
                    continue
                baseline_contexts += 1
                location = _entity_locator(system_id, configuration["id"], entity["id"], entities)
                base_id = f"{system_id}__{configuration['id']}__{entity['id']}"
                scenes.append({
                    "id": f"{base_id}__baseline",
                    "variant": "baseline",
                    "systemRuntime": str(system_path.relative_to(ROOT)),
                    "configurationId": configuration["id"],
                    "scenarioId": configuration["defaultScenarioId"],
                    "structuralLocation": location,
                    "auditEntityId": entity["id"],
                })
                scenarios = list(configuration.get("scenarios", {}).values())
                non_default = next((item for item in scenarios if not item.get("isDefault")), None)
                stress_scenario = non_default or configuration["scenarios"][configuration["defaultScenarioId"]]
                stress: dict[str, Any] = {
                    "id": f"{base_id}__stress",
                    "variant": "stress",
                    "systemRuntime": str(system_path.relative_to(ROOT)),
                    "configurationId": configuration["id"],
                    "scenarioId": stress_scenario["id"],
                    "structuralLocation": location,
                    "auditEntityId": entity["id"],
                }
                child_ids = entity.get("childIds") or []
                if child_ids:
                    stress["selection"] = _child_locator(location, child_ids[0])
                    stress["preview"] = stress["selection"]
                scenes.append(stress)
    fixture = {
        "schemaVersion": 1,
        "purpose": "Phase 8 exhaustive initial-five baseline/stress visual coverage fixture generated from current runtime enterability.",
        "enteredContextCount": baseline_contexts,
        "scenes": scenes,
    }
    FIXTURE.parent.mkdir(parents=True, exist_ok=True)
    FIXTURE.write_text(json.dumps(fixture, indent=2) + "\n")
    return fixture


def _render_scene(entry: Path, compiled_root: Path, scene_id: str) -> dict[str, Any]:
    completed = subprocess.run(
        [
            "node", str(entry), str(ROOT), str(compiled_root), scene_id,
            str(FIXTURE.relative_to(ROOT)), "1",
        ],
        cwd=ROOT,
        text=True,
        capture_output=True,
        check=False,
    )
    if completed.returncode != 0:
        raise RuntimeError(f"Phase-8 renderer adapter failed for {scene_id}:\n{completed.stdout}{completed.stderr}")
    return json.loads(completed.stdout)


def _strict_segment_crosses_rect(a: dict[str, float], b: dict[str, float], rect: dict[str, float]) -> bool:
    left, right = rect["x"], rect["x"] + rect["width"]
    top, bottom = rect["y"], rect["y"] + rect["height"]
    if a["x"] == b["x"]:
        return left < a["x"] < right and max(a["y"], b["y"]) > top and min(a["y"], b["y"]) < bottom
    if a["y"] == b["y"]:
        return top < a["y"] < bottom and max(a["x"], b["x"]) > left and min(a["x"], b["x"]) < right
    return False


def _source_checks(result: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    coverage = result["coverage"]
    enclosure = coverage.get("enclosure")
    if not enclosure:
        return ["scene has no derived enclosure"]
    ex1, ey1 = enclosure["x"], enclosure["y"]
    ex2, ey2 = ex1 + enclosure["width"], ey1 + enclosure["height"]
    for kind in ("nodes", "anatomy", "topologyDepictions"):
        for item in coverage.get(kind, []):
            if not (item["x"] >= ex1 - 0.1 and item["y"] >= ey1 - 0.1 and item["x"] + item["width"] <= ex2 + 0.1 and item["y"] + item["height"] <= ey2 + 0.1):
                errors.append(f"{kind}:{item['id']} escapes enclosure")
    truncated = [node["id"] for node in coverage.get("nodes", []) if node.get("labelTruncated")]
    if truncated:
        errors.append(f"truncated node labels: {', '.join(truncated)}")
    nodes = {node["id"]: node for node in coverage.get("nodes", [])}
    for connection in coverage.get("connections", []):
        endpoint_ids = set(connection.get("endpointNodeIds") or [])
        route_sets = [*(connection.get("routes") or []), *(connection.get("boundaryRoutes") or [])]
        for route in route_sets:
            points = route.get("points") or []
            for blocker_id, blocker in nodes.items():
                if blocker_id in endpoint_ids:
                    continue
                if any(_strict_segment_crosses_rect(points[i - 1], points[i], blocker) for i in range(1, len(points))):
                    errors.append(f"connection {connection['id']} route {route['id']} crosses unrelated node {blocker_id}")
    return errors


BROWSER_JS = r"""
() => {
  const svg = document.querySelector('svg.explore-canvas');
  if (!svg) throw new Error('Explore SVG missing');
  const box = element => element ? element.getBoundingClientRect() : null;
  const svgBox = box(svg);
  const nodes = [...svg.querySelectorAll('.node[role="button"]')].map(box);
  const labels = [...svg.querySelectorAll('.boundary-stub-label')].map(box);
  const overlap = (a,b,t=1) => a.left < b.right-t && a.right > b.left+t && a.top < b.bottom-t && a.bottom > b.top+t;
  const inside = (a,b,t=2) => a.left >= b.left-t && a.top >= b.top-t && a.right <= b.right+t && a.bottom <= b.bottom+t;
  let labelNodeCollisions = 0;
  let labelLabelCollisions = 0;
  for (const label of labels) if (nodes.some(node => overlap(label,node))) labelNodeCollisions++;
  for (let i=0;i<labels.length;i++) for (let j=i+1;j<labels.length;j++) if (overlap(labels[i],labels[j])) labelLabelCollisions++;
  return {
    boundaryLabelsInsideSvg: labels.every(label => inside(label, svgBox)),
    boundaryLabelNodeCollisions: labelNodeCollisions,
    boundaryLabelCollisions: labelLabelCollisions,
    truncatedNodeLabels: svg.querySelectorAll('.node[data-label-truncated="true"]').length,
    anatomyFocusTargets: svg.querySelectorAll('.anatomy-depiction[tabindex]').length,
    topologyFocusTargets: svg.querySelectorAll('.topology-depiction[tabindex], .topology-depiction [tabindex]').length,
  };
}
"""


def _slug_base(scene_id: str) -> str:
    return scene_id.rsplit("__", 1)[0]


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", default=str(DEFAULT_OUTPUT))
    parser.add_argument("--image-dir", default=str(DEFAULT_IMAGE_DIR))
    parser.add_argument("--chromium", default="/usr/bin/chromium")
    args = parser.parse_args()

    fixture = _make_fixture()
    css = (ROOT / "src" / "styles" / "app.css").read_text()
    image_dir = Path(args.image_dir)
    image_dir.mkdir(parents=True, exist_ok=True)
    output = Path(args.output)
    all_errors: list[str] = []
    cases: list[dict[str, Any]] = []
    layout_counts: Counter[str] = Counter()

    # A bounded manual-review image set spans known dense, sparse, topology,
    # network, storage, accelerator, management, and Anatomy-only cases.
    preferred_tokens = [
        ("nvidia-dgx-h100-superpod", "dgx-h100-node"),
        ("nvidia-dgx-h100-superpod", "h100-superpod"),
        ("nvidia-dgx-gb300-nvl72-superpod", "gb300-nvl72-rack"),
        ("nvidia-dgx-gb300-nvl72-superpod", "gb300-bf3"),
        ("google-tpu7x-ironwood", "ironwood-cube"),
        ("google-tpu7x-ironwood", "ironwood-chiplets"),
        ("google-tpu7x-ironwood", "ironwood-tpu"),
        ("cerebras-cs3-condor-galaxy3", "cg3"),
        ("cerebras-cs3-condor-galaxy3", "cg3-cs3"),
        ("cerebras-cs3-condor-galaxy3", "cg3-wse3"),
        ("meta-h100-roce-24k", "meta-h100-roce"),
        ("meta-h100-roce-24k", "meta-roce-switches"),
    ]
    selected_image_ids: set[str] = set()
    for system_token, entity_token in preferred_tokens:
        candidate = next((scene["id"] for scene in fixture["scenes"] if scene["variant"] == "baseline" and system_token in scene["id"] and f"__{entity_token}__baseline" in scene["id"]), None)
        if candidate:
            selected_image_ids.add(candidate)

    with tempfile.TemporaryDirectory(prefix="syma-phase8-") as temporary:
        compiled_root, compiler = render_density._compile_current_renderer(Path(temporary))
        entry = compiled_root / "scripts" / "benchmarks" / "current_renderer_fixture.js"
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch(executable_path=args.chromium, headless=True)
            page = browser.new_page(viewport={"width": 1320, "height": 980})
            for spec in fixture["scenes"]:
                result = _render_scene(entry, compiled_root, spec["id"])
                source_errors = _source_checks(result)
                page.set_content(f"<!doctype html><meta charset='utf-8'><div id='root'>{result['markup']}</div>")
                page.add_style_tag(content=css)
                browser_metrics = page.evaluate(BROWSER_JS)
                browser_errors: list[str] = []
                if not browser_metrics["boundaryLabelsInsideSvg"]:
                    browser_errors.append("boundary label escapes SVG")
                if browser_metrics["boundaryLabelNodeCollisions"]:
                    browser_errors.append(f"{browser_metrics['boundaryLabelNodeCollisions']} boundary-label/node collision(s)")
                if browser_metrics["boundaryLabelCollisions"]:
                    browser_errors.append(f"{browser_metrics['boundaryLabelCollisions']} boundary-label collision(s)")
                if browser_metrics["truncatedNodeLabels"]:
                    browser_errors.append(f"{browser_metrics['truncatedNodeLabels']} rendered truncated node label(s)")
                if browser_metrics["anatomyFocusTargets"]:
                    browser_errors.append("Anatomy created a focus target")
                if browser_metrics["topologyFocusTargets"]:
                    browser_errors.append("topology depiction created a focus target")
                errors = [*source_errors, *browser_errors]
                all_errors.extend(f"{spec['id']}: {error}" for error in errors)
                if spec["variant"] == "baseline":
                    layout_counts[result["metrics"]["layoutKind"]] += 1
                screenshot = None
                if spec["id"] in selected_image_ids:
                    path = image_dir / f"{_slug_base(spec['id'])}.png"
                    page.locator("#root").screenshot(path=str(path))
                    screenshot = {
                        "path": str(path.relative_to(ROOT)),
                        "sha256": hashlib.sha256(path.read_bytes()).hexdigest(),
                        "bytes": path.stat().st_size,
                    }
                cases.append({
                    "sceneId": spec["id"],
                    "variant": spec["variant"],
                    "layoutKind": result["metrics"]["layoutKind"],
                    "interactiveNodes": result["metrics"]["interactiveNodes"],
                    "anatomyDepictions": result["metrics"]["anatomyDepictions"],
                    "sourceErrors": source_errors,
                    "browser": browser_metrics,
                    "screenshot": screenshot,
                    "status": "PASS" if not errors else "FAIL",
                })
            page.close()
            browser.close()

    report = {
        "phase": "8",
        "date": "2026-09-11",
        "status": "PASS" if not all_errors else "FAIL",
        "basis": "Exact current Explore view-model/components through the dependency-light JSX adapter plus system-Chromium rendered geometry checks. This does not replace the required post-Phase-8 pinned TypeScript/Vitest/Vite/three-engine Playwright/accessibility rerun.",
        "fixture": str(FIXTURE.relative_to(ROOT)),
        "compiler": compiler,
        "enteredContexts": fixture["enteredContextCount"],
        "baselineScenes": sum(1 for scene in fixture["scenes"] if scene["variant"] == "baseline"),
        "stressScenes": sum(1 for scene in fixture["scenes"] if scene["variant"] == "stress"),
        "layoutFamilies": dict(sorted(layout_counts.items())),
        "errors": all_errors,
        "warnings": [],
        "truncatedLabelContexts": sum(1 for case in cases if case["browser"]["truncatedNodeLabels"]),
        "manualReviewScreenshots": [case["screenshot"] for case in cases if case["screenshot"]],
        "cases": cases,
        "decision": {
            "coverageAudit": "PASS" if not all_errors else "FAIL",
            "semanticChanges": False,
            "phaseCompletion": "blocked_pending_fresh_pinned_post_change_regression_accessibility_run",
        },
    }
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(report, indent=2) + "\n")
    print(f"SUMMARY: contexts={fixture['enteredContextCount']} baseline={report['baselineScenes']} stress={report['stressScenes']} errors={len(all_errors)} screenshots={len(report['manualReviewScreenshots'])}")
    if all_errors:
        for error in all_errors[:40]:
            print("ERROR:", error)
    return 0 if not all_errors else 1


if __name__ == "__main__":
    raise SystemExit(main())
