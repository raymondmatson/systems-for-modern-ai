#!/usr/bin/env python3
"""Render and validate the Phase-7 Ironwood/Cerebras transfer scenes.

This is implementation/readiness evidence. It executes the exact current
Explore view-model and ``src/app/explore`` component tree through the same
benchmark-only JSX adapter used by renderer benchmark v3, then inspects the
materialized SVG in system Chromium. It does not replace the user-confirmed
pinned React/Vite/three-engine Phase-6 matrix or human comprehension testing.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import subprocess
import sys
import tempfile
from pathlib import Path
from typing import Any

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[2]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from scripts.benchmarks import render_density
FIXTURE = ROOT / "tests" / "fixtures" / "visual-regression-phase7.json"
DEFAULT_OUTPUT = ROOT / "reports" / "implementation" / "phase7-transfer-validation.json"
DEFAULT_IMAGE_DIR = ROOT / "reports" / "implementation" / "phase7-transfer-images"


def _render_scene(entry: Path, compiled_root: Path, scene_id: str) -> dict[str, Any]:
    completed = subprocess.run(
        [
            "node",
            str(entry),
            str(ROOT),
            str(compiled_root),
            scene_id,
            "tests/fixtures/visual-regression-phase7.json",
        ],
        cwd=ROOT,
        text=True,
        capture_output=True,
        check=False,
    )
    if completed.returncode != 0:
        raise RuntimeError(
            f"Phase-7 renderer adapter failed for {scene_id}:\n"
            + completed.stdout
            + completed.stderr
        )
    return json.loads(completed.stdout)


MEASURE_JS = r"""
() => {
  const svg = document.querySelector('svg.explore-canvas');
  if (!svg) throw new Error('Explore SVG missing');
  const box = (element) => element ? element.getBoundingClientRect() : null;
  const enclosure = box(svg.querySelector('.enclosure-frame'));
  const nodes = [...svg.querySelectorAll('.node[role="button"]')];
  const anatomy = [...svg.querySelectorAll('.anatomy-depiction')];
  const topology = svg.querySelector('.topology-depiction');
  const regions = [...svg.querySelectorAll('.composition-region-shell')];
  const content = [...nodes, ...anatomy, ...regions, ...(topology ? [topology] : [])];
  const contentBoxes = content.map(box).filter(Boolean);
  const contentBottom = contentBoxes.length ? Math.max(...contentBoxes.map(item => item.bottom)) : enclosure?.top ?? 0;
  const topologyConnections = [...svg.querySelectorAll('.topology-connection')].map(group => ({
    key: group.getAttribute('data-topology-connection-key'),
    dimension: group.getAttribute('data-topology-dimension'),
    segments: group.querySelectorAll('.topology-link').length,
    markers: [...group.querySelectorAll('.topology-continuation-marker')].map(marker => marker.getAttribute('data-continuation-label')),
  }));
  const uniqueCanonicalConnectionIds = new Set(
    [...svg.querySelectorAll('.edge[role="button"]')].map(edge => edge.getAttribute('data-connection-id')).filter(Boolean)
  );
  const topologyKeys = topologyConnections.map(connection => connection.key);
  return {
    width: Number(svg.getAttribute('viewBox')?.split(/\s+/)[2] ?? 0),
    height: Number(svg.getAttribute('viewBox')?.split(/\s+/)[3] ?? 0),
    nodeCount: nodes.length,
    anatomyCount: anatomy.length,
    truncatedNodeLabels: svg.querySelectorAll('.node[data-label-truncated="true"]').length,
    topologyCount: svg.querySelectorAll('.topology-depiction').length,
    topologyFocusTargets: svg.querySelectorAll('.topology-depiction [tabindex], .topology-depiction[tabindex]').length,
    topologyConnections,
    topologyKeyCollidesWithCanonicalConnection: topologyKeys.some(key => uniqueCanonicalConnectionIds.has(key)),
    topologyAriaHidden: topology?.getAttribute('aria-hidden') ?? null,
    torusGuideVisible: document.body.textContent?.includes('Flattened torus guide') ?? false,
    torusGuideMentionsSharedPortions: document.body.textContent?.includes('two visually separated portions of one conceptual wraparound connection') ?? false,
    core900kCount: svg.querySelectorAll('.node[data-population="×900000"]').length,
    enclosureUnusedBottomPx: enclosure ? Math.max(0, enclosure.bottom - contentBottom) : null,
    semanticOutlineButtons: document.querySelectorAll('.semantic-outline button').length,
  };
}
"""


def _check(scene_id: str, metrics: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    if metrics["topologyFocusTargets"] != 0:
        errors.append("topology depiction created a focus target")
    if metrics["truncatedNodeLabels"] != 0:
        errors.append("visible transfer node label is truncated")
    if metrics["enclosureUnusedBottomPx"] is not None and metrics["enclosureUnusedBottomPx"] > 48:
        errors.append(f"unexplained enclosure bottom whitespace {metrics['enclosureUnusedBottomPx']:.1f}px exceeds 48px")

    if scene_id == "ironwood-cube-flattened-torus":
        if metrics["topologyCount"] != 1:
            errors.append("expected exactly one flattened torus depiction")
        if metrics["topologyAriaHidden"] != "true":
            errors.append("flattened torus SVG is not aria-hidden")
        if metrics["topologyKeyCollidesWithCanonicalConnection"]:
            errors.append("presentation topology key collides with a canonical connection ID")
        if not metrics["torusGuideVisible"] or not metrics["torusGuideMentionsSharedPortions"]:
            errors.append("visible/accessibility torus explanation is missing wraparound correspondence wording")
        expected_dimensions = {"A", "B", "C"}
        actual_dimensions = {item["dimension"] for item in metrics["topologyConnections"]}
        if actual_dimensions != expected_dimensions:
            errors.append(f"expected abstract dimensions A/B/C, found {sorted(actual_dimensions)}")
        if len(metrics["topologyConnections"]) != 3:
            errors.append("expected three conceptual wraparound connection depictions")
        for connection in metrics["topologyConnections"]:
            if connection["segments"] != 2:
                errors.append(f"{connection['key']} does not have two visible portions")
            if len(connection["markers"]) != 2 or len(set(connection["markers"])) != 1:
                errors.append(f"{connection['key']} does not repeat one matching continuation marker")

    if scene_id == "cerebras-representative-wse3-transfer":
        if metrics["core900kCount"] != 1:
            errors.append("WSE-3 does not expose exactly one symbolic ×900000 core aggregate")
        if metrics["nodeCount"] != 3:
            errors.append(f"WSE-3 expected three semantic children, found {metrics['nodeCount']}")

    return errors


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", default=str(DEFAULT_OUTPUT))
    parser.add_argument("--image-dir", default=str(DEFAULT_IMAGE_DIR))
    parser.add_argument("--chromium", default="/usr/bin/chromium")
    args = parser.parse_args()

    fixture = json.loads(FIXTURE.read_text())
    output = Path(args.output)
    image_dir = Path(args.image_dir)
    image_dir.mkdir(parents=True, exist_ok=True)
    css = (ROOT / "src" / "styles" / "app.css").read_text()

    with tempfile.TemporaryDirectory(prefix="syma-phase7-") as temporary:
        compiled_root, compiler = render_density._compile_current_renderer(Path(temporary))
        entry = compiled_root / "scripts" / "benchmarks" / "current_renderer_fixture.js"
        rendered = {
            spec["id"]: _render_scene(entry, compiled_root, spec["id"])
            for spec in fixture["scenes"]
        }

        cases: list[dict[str, Any]] = []
        all_errors: list[str] = []
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch(executable_path=args.chromium, headless=True)
            for spec in fixture["scenes"]:
                scene_id = spec["id"]
                result = rendered[scene_id]
                page = browser.new_page(viewport={"width": 1320, "height": 980})
                page.set_content(
                    "<!doctype html><meta charset='utf-8'><style>body{margin:18px;background:#f4f6f8}</style>"
                    f"<div id='root'>{result['markup']}</div>"
                )
                page.add_style_tag(content=css)
                metrics = page.evaluate(MEASURE_JS)
                errors = _check(scene_id, metrics)
                image_path = image_dir / f"{scene_id}.png"
                page.locator("#root").screenshot(path=str(image_path))
                image_sha = hashlib.sha256(image_path.read_bytes()).hexdigest()
                cases.append({
                    "sceneId": scene_id,
                    "requiredCues": spec.get("requiredCues", []),
                    "renderer": result["metrics"],
                    "browser": metrics,
                    "screenshot": {
                        "path": str(image_path.relative_to(ROOT)),
                        "sha256": image_sha,
                        "bytes": image_path.stat().st_size,
                    },
                    "errors": errors,
                    "status": "PASS" if not errors else "FAIL",
                })
                all_errors.extend(f"{scene_id}: {error}" for error in errors)
                page.close()
            browser.close()

    report = {
        "phase": "7",
        "date": "2026-09-10",
        "status": "PASS" if not all_errors else "FAIL",
        "basis": "Exact current Explore view-model/components through the renderer benchmark JSX adapter; rendered/geometry-inspected in system Chromium. This is transfer implementation evidence, not human comprehension evidence.",
        "compiler": compiler,
        "fixture": str(FIXTURE.relative_to(ROOT)),
        "cases": cases,
        "errors": all_errors,
        "semanticDecision": {
            "ironwoodTorus": "presentation_only_flattened_3d_torus_with_three_abstract_dimensions_and_paired_wraparound_markers",
            "canonicalTopologyChanged": False,
            "topologyActionTargetsCreated": False,
        },
    }
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(report, indent=2) + "\n")
    print(json.dumps(report, indent=2))
    return 0 if not all_errors else 1


if __name__ == "__main__":
    raise SystemExit(main())
