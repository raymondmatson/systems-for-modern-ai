#!/usr/bin/env python3
"""Benchmark the current Explore renderer and retain separate synthetic headroom cases.

Benchmark version 3 compiles the real Explore view-model and exact
``src/app/explore`` components with a benchmark-only JSX adapter, serializes the
result, and measures browser DOM materialization/hit testing in system Chromium.
This makes the representative evidence track the renderer that ships today
without requiring the project's npm dependency tree.

The adapter deliberately bypasses React reconciliation and the full App shell.
Those costs and the cross-engine browser matrix remain owned by the pinned npm /
Vite / Playwright gates. Synthetic density cases remain a separate stress series
and are never used as a proxy for semantic scene materialization.
"""
from __future__ import annotations

import argparse
import json
import os
import shutil
import statistics
import subprocess
import tempfile
from pathlib import Path
from typing import Any

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[2]
DEFAULT_OUTPUT = ROOT / "reports" / "implementation" / "render-benchmark.json"
FIXTURE = ROOT / "tests" / "fixtures" / "visual-regression-phase5a.json"
ADAPTER = ROOT / "scripts" / "benchmarks" / "current_renderer_fixture.ts"
SHIM = ROOT / "scripts" / "benchmarks" / "current_renderer_shim.d.ts"

REAL_CASE_IDS = [
    "h100-representative-baseline",
    "h100-checkpoint-selected-storage-nic",
]


def _median(values: list[float]) -> float:
    return float(statistics.median(values)) if values else 0.0


def _typescript_files() -> list[str]:
    files: list[str] = []
    for relative in ("src/domain", "src/view-model", "src/app/explore"):
        base = ROOT / relative
        files.extend(str(path) for path in sorted(base.rglob("*.ts")))
        files.extend(str(path) for path in sorted(base.rglob("*.tsx")))
    return files


def _tsc_path() -> str:
    local = ROOT / "node_modules" / ".bin" / ("tsc.cmd" if os.name == "nt" else "tsc")
    if local.exists():
        return str(local)
    found = shutil.which("tsc")
    if not found:
        raise RuntimeError("TypeScript compiler not found (expected pinned node_modules/.bin/tsc or PATH tsc)")
    return found


def _compile_current_renderer(temp_root: Path) -> tuple[Path, dict[str, str]]:
    out = temp_root / "compiled"
    out.mkdir(parents=True, exist_ok=True)
    tsc = _tsc_path()
    cmd = [
        tsc,
        "--target", "ES2022",
        "--module", "commonjs",
        "--moduleResolution", "node",
        "--jsx", "react",
        "--jsxFactory", "__jsx",
        "--jsxFragmentFactory", "__Fragment",
        "--skipLibCheck",
        "--esModuleInterop",
        "--outDir", str(out),
        "--rootDir", str(ROOT),
        *_typescript_files(),
        str(ADAPTER),
        str(SHIM),
    ]
    completed = subprocess.run(cmd, cwd=ROOT, text=True, capture_output=True, check=False)
    if completed.returncode != 0:
        raise RuntimeError(
            "Current-renderer benchmark compile failed:\n"
            + completed.stdout
            + completed.stderr
        )
    compiler_version = subprocess.run(
        [tsc, "--version"], cwd=ROOT, text=True, capture_output=True, check=False
    ).stdout.strip()
    compiled_root = out
    entry = compiled_root / "scripts" / "benchmarks" / "current_renderer_fixture.js"
    if not entry.exists():
        raise RuntimeError(f"Compiled benchmark adapter missing: {entry}")
    return compiled_root, {"path": tsc, "version": compiler_version}


def _render_scene(entry: Path, compiled_root: Path, scene_id: str) -> dict[str, Any]:
    completed = subprocess.run(
        ["node", str(entry), str(ROOT), str(compiled_root), scene_id],
        cwd=ROOT,
        text=True,
        capture_output=True,
        check=False,
    )
    if completed.returncode != 0:
        raise RuntimeError(
            f"Current-renderer adapter failed for {scene_id}:\n"
            + completed.stdout
            + completed.stderr
        )
    return json.loads(completed.stdout)


BROWSER_MEASURE_JS = r"""
({markup, rounds, hitIterations}) => {
  const root = document.getElementById('root');
  const installations = [];
  for (let round = 0; round < rounds; round++) {
    const start = performance.now();
    root.innerHTML = markup;
    root.getBoundingClientRect();
    installations.push(performance.now() - start);
  }
  const svg = root.querySelector('svg.explore-canvas');
  if (!svg) throw new Error('Explore SVG missing from benchmark markup');
  const svgBox = svg.getBoundingClientRect();
  const interactive = [...svg.querySelectorAll('[role="button"][tabindex="0"]')];
  let semanticCenterHits = 0;
  const hitStart = performance.now();
  for (let index = 0; index < hitIterations; index++) {
    const target = interactive[index % Math.max(1, interactive.length)];
    if (!target) break;
    const box = target.getBoundingClientRect();
    const x = Math.min(svgBox.right - 1, Math.max(svgBox.left + 1, box.left + box.width / 2));
    const y = Math.min(svgBox.bottom - 1, Math.max(svgBox.top + 1, box.top + box.height / 2));
    if (document.elementFromPoint(x, y)?.closest?.('[role="button"][tabindex="0"]')) semanticCenterHits++;
  }
  const hitTestMs = performance.now() - hitStart;

  const enclosure = svg.querySelector('.enclosure-frame')?.getBoundingClientRect();
  const inside = (inner, outer, tolerance = 1.5) => !!inner && !!outer &&
    inner.left >= outer.left - tolerance && inner.top >= outer.top - tolerance &&
    inner.right <= outer.right + tolerance && inner.bottom <= outer.bottom + tolerance;
  const anatomy = [...svg.querySelectorAll('.anatomy-depiction')];
  const nodes = [...svg.querySelectorAll('.node[role="button"]')];
  const boundaryLabels = [...svg.querySelectorAll('.boundary-stub-label')];
  const overlap = (a, b, tolerance = 1) => a.left < b.right - tolerance && a.right > b.left + tolerance &&
    a.top < b.bottom - tolerance && a.bottom > b.top + tolerance;
  const nodeBoxes = nodes.map(node => node.getBoundingClientRect());
  const labelBoxes = boundaryLabels.map(label => label.getBoundingClientRect());
  let boundaryNodeCollisions = 0;
  for (const labelBox of labelBoxes) {
    if (nodeBoxes.some(nodeBox => overlap(labelBox, nodeBox))) boundaryNodeCollisions++;
  }
  let boundaryLabelCollisions = 0;
  for (let i = 0; i < labelBoxes.length; i++) {
    for (let j = i + 1; j < labelBoxes.length; j++) {
      if (overlap(labelBoxes[i], labelBoxes[j])) boundaryLabelCollisions++;
    }
  }
  const sorted = xs => [...xs].sort((a,b) => a-b);
  const median = xs => {
    const values = sorted(xs); const middle = Math.floor(values.length / 2);
    return values.length % 2 ? values[middle] : (values[middle - 1] + values[middle]) / 2;
  };
  return {
    domInstallMedianMs: median(installations),
    hitTestMs,
    hitIterations,
    semanticCenterHits,
    totalDomElements: root.querySelectorAll('*').length,
    svgDescendants: svg.querySelectorAll('*').length,
    svgFocusTargets: interactive.length,
    nodeFocusTargets: nodes.length,
    connectionFocusTargets: svg.querySelectorAll('.edge[role="button"][tabindex="0"]').length,
    anatomyFocusTargets: svg.querySelectorAll('.anatomy-depiction[tabindex]').length,
    semanticOutlineFocusTargets: root.querySelectorAll('.semantic-outline button').length,
    contextConnectionFocusTargets: root.querySelectorAll('.context-connections button').length,
    totalFocusTargets: root.querySelectorAll('button,[tabindex="0"]').length,
    truncatedNodeLabels: svg.querySelectorAll('.node[data-label-truncated="true"]').length,
    anatomyInsideEnclosure: anatomy.every(item => inside(item.getBoundingClientRect(), enclosure)),
    boundaryLabelsInsideSvg: boundaryLabels.every(item => inside(item.getBoundingClientRect(), svgBox, 2)),
    boundaryNodeCollisions,
    boundaryLabelCollisions,
  };
}
"""

SWAP_MEASURE_JS = r"""
({baseline, stressed, rounds}) => {
  const root = document.getElementById('root');
  root.innerHTML = baseline;
  root.getBoundingClientRect();
  const swaps = [];
  for (let round = 0; round < rounds; round++) {
    const start = performance.now();
    root.innerHTML = round % 2 ? baseline : stressed;
    root.getBoundingClientRect();
    swaps.push(performance.now() - start);
  }
  const sorted = [...swaps].sort((a,b) => a-b);
  const middle = Math.floor(sorted.length / 2);
  return {stateSwapMedianMs: sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2};
}
"""

SYNTHETIC_JS = r"""
({interactiveNodes, anatomyDepictions, connections, rounds}) => {
  const NS = 'http://www.w3.org/2000/svg';
  const root = document.getElementById('synthetic');
  const samples = [];
  for (let r = 0; r < rounds; r++) {
    const start = performance.now();
    root.replaceChildren();
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('width', '1200');
    svg.setAttribute('height', String(Math.max(700, Math.ceil((interactiveNodes + anatomyDepictions) / 8) * 118 + 120)));
    root.appendChild(svg);
    const positions = [];
    for (let i = 0; i < interactiveNodes; i++) {
      const x = 34 + (i % 8) * 142;
      const y = 42 + Math.floor(i / 8) * 112;
      positions.push([x + 58, y + 34]);
      const g = document.createElementNS(NS, 'g');
      g.setAttribute('tabindex', '0');
      g.setAttribute('role', 'button');
      const rect = document.createElementNS(NS, 'rect');
      rect.setAttribute('x', String(x)); rect.setAttribute('y', String(y));
      rect.setAttribute('width', '118'); rect.setAttribute('height', '68');
      const text = document.createElementNS(NS, 'text');
      text.setAttribute('x', String(x + 8)); text.setAttribute('y', String(y + 25));
      text.textContent = `Synthetic target ${i + 1}`;
      g.append(rect, text); svg.appendChild(g);
    }
    for (let i = 0; i < anatomyDepictions; i++) {
      const row = Math.floor(i / 8) + Math.ceil(interactiveNodes / 8);
      const x = 34 + (i % 8) * 142;
      const y = 42 + row * 112;
      const g = document.createElementNS(NS, 'g');
      g.setAttribute('aria-hidden', 'true');
      const rect = document.createElementNS(NS, 'rect');
      rect.setAttribute('x', String(x)); rect.setAttribute('y', String(y));
      rect.setAttribute('width', '118'); rect.setAttribute('height', '58');
      g.appendChild(rect); svg.appendChild(g);
    }
    for (let i = 0; i < connections; i++) {
      if (interactiveNodes < 2) break;
      const a = positions[i % positions.length];
      const b = positions[(i * 7 + 1) % positions.length];
      const line = document.createElementNS(NS, 'line');
      line.setAttribute('x1', String(a[0])); line.setAttribute('y1', String(a[1]));
      line.setAttribute('x2', String(b[0])); line.setAttribute('y2', String(b[1]));
      svg.insertBefore(line, svg.firstChild);
    }
    svg.getBoundingClientRect();
    samples.push(performance.now() - start);
  }
  const svg = root.querySelector('svg');
  const sorted = [...samples].sort((a,b) => a-b);
  const middle = Math.floor(sorted.length / 2);
  return {
    domInstallMedianMs: sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2,
    domElements: svg.querySelectorAll('*').length,
    focusTargets: svg.querySelectorAll('[tabindex="0"]').length,
    anatomyFocusTargets: svg.querySelectorAll('[aria-hidden="true"][tabindex]').length,
  };
}
"""


def _ax_summary(context, page) -> dict[str, Any]:
    session = context.new_cdp_session(page)
    tree = session.send("Accessibility.getFullAXTree")
    buttons = []
    for node in tree.get("nodes", []):
        role = (node.get("role") or {}).get("value")
        if role == "button":
            buttons.append((node.get("name") or {}).get("value", ""))
    return {
        "buttonCount": len(buttons),
        "buttonNameSample": buttons[:20],
        "note": "Chromium accessibility-tree evidence only; not a screen-reader or cross-engine result.",
    }


def _browser_metrics(browser, markup_by_id: dict[str, str], css: str) -> tuple[dict[str, Any], str]:
    context = browser.new_context(viewport={"width": 1280, "height": 900})
    page = context.new_page()
    page.set_content("<!doctype html><meta charset='utf-8'><div id='root'></div><div id='synthetic'></div>")
    page.add_style_tag(content=css)

    cases: dict[str, Any] = {}
    for scene_id, markup in markup_by_id.items():
        cases[scene_id] = page.evaluate(
            BROWSER_MEASURE_JS,
            {"markup": markup, "rounds": 20, "hitIterations": 600},
        )
    swap = page.evaluate(
        SWAP_MEASURE_JS,
        {
            "baseline": markup_by_id[REAL_CASE_IDS[0]],
            "stressed": markup_by_id[REAL_CASE_IDS[1]],
            "rounds": 30,
        },
    )
    page.evaluate("markup => { document.getElementById('root').innerHTML = markup; }", markup_by_id[REAL_CASE_IDS[0]])
    user_agent = page.evaluate("navigator.userAgent")
    ax = _ax_summary(context, page)

    synthetic = []
    for total in (50, 100, 250, 500, 1000, 2000):
        anatomy = max(1, round(total * 0.2))
        interactive = total - anatomy
        metrics = page.evaluate(
            SYNTHETIC_JS,
            {
                "interactiveNodes": interactive,
                "anatomyDepictions": anatomy,
                "connections": round(interactive * 1.5),
                "rounds": 12,
            },
        )
        synthetic.append(
            {
                "interactiveNodes": interactive,
                "anatomyDepictions": anatomy,
                "visibleGlyphs": total,
                "connections": round(interactive * 1.5),
                **metrics,
            }
        )

    context.close()
    return {"cases": cases, "stateSwap": swap, "accessibilityTree": ax, "synthetic": synthetic}, user_agent


def _media_checks(browser, markup: str, css: str) -> dict[str, Any]:
    reduced_context = browser.new_context(viewport={"width": 1280, "height": 900}, reduced_motion="reduce")
    reduced_page = reduced_context.new_page()
    reduced_page.set_content(f"<!doctype html><meta charset='utf-8'><div id='root'>{markup}</div>")
    reduced_page.add_style_tag(content=css)
    reduced = reduced_page.evaluate(
        """() => {
          const target = document.querySelector('.node[role="button"]');
          const style = getComputedStyle(target);
          return {transitionDuration: style.transitionDuration, animationDuration: style.animationDuration};
        }"""
    )
    reduced_context.close()

    forced_context = browser.new_context(viewport={"width": 1280, "height": 900}, forced_colors="active")
    forced_page = forced_context.new_page()
    forced_page.set_content(f"<!doctype html><meta charset='utf-8'><div id='root'>{markup}</div>")
    forced_page.add_style_tag(content=css)
    forced = forced_page.evaluate(
        """() => ({
          selectionRings: document.querySelectorAll('.node-selection-ring,.enclosure-selection-ring,.edge-selection-underlay').length,
          focusBrackets: document.querySelectorAll('.node-focus-brackets,.enclosure-focus-brackets,.edge-focus-underlay').length,
          scenarioMarkers: document.querySelectorAll('.node-scenario-marker,.enclosure-scenario-marker').length,
          relationshipTypes: [...document.querySelectorAll('.edge[data-relationship-type]')].map(el => el.getAttribute('data-relationship-type')),
        })"""
    )
    forced_context.close()
    return {"reducedMotion": reduced, "forcedColors": forced}


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument("--chromium", default="/usr/bin/chromium")
    args = parser.parse_args()

    fixture = json.loads(FIXTURE.read_text(encoding="utf-8"))
    all_scene_ids = [scene["id"] for scene in fixture["scenes"]]
    css = (ROOT / "src" / "styles" / "app.css").read_text(encoding="utf-8")

    with tempfile.TemporaryDirectory(prefix="symai-render-benchmark-") as temp:
        temp_root = Path(temp)
        compiled_root, compiler = _compile_current_renderer(temp_root)
        entry = compiled_root / "scripts" / "benchmarks" / "current_renderer_fixture.js"
        rendered = {scene_id: _render_scene(entry, compiled_root, scene_id) for scene_id in all_scene_ids}

        with sync_playwright() as playwright:
            browser = playwright.chromium.launch(
                executable_path=args.chromium,
                headless=True,
                args=["--no-sandbox", "--disable-dev-shm-usage"],
            )
            browser_result, user_agent = _browser_metrics(
                browser,
                {scene_id: result["markup"] for scene_id, result in rendered.items()},
                css,
            )
            media = _media_checks(browser, rendered[REAL_CASE_IDS[1]]["markup"], css)
            browser.close()

    real_cases = []
    for scene_id in REAL_CASE_IDS:
        real_cases.append(
            {
                "sceneId": scene_id,
                "renderer": rendered[scene_id]["metrics"],
                "browser": browser_result["cases"][scene_id],
            }
        )

    geometry = [
        {
            "sceneId": scene_id,
            **{
                key: browser_result["cases"][scene_id][key]
                for key in (
                    "anatomyInsideEnclosure",
                    "anatomyFocusTargets",
                    "boundaryLabelsInsideSvg",
                    "boundaryNodeCollisions",
                    "boundaryLabelCollisions",
                    "truncatedNodeLabels",
                )
            },
        }
        for scene_id in all_scene_ids
    ]
    geometry_pass = all(
        case["anatomyInsideEnclosure"]
        and case["anatomyFocusTargets"] == 0
        and case["boundaryLabelsInsideSvg"]
        and case["boundaryNodeCollisions"] == 0
        and case["boundaryLabelCollisions"] == 0
        and case["truncatedNodeLabels"] == 0
        for case in geometry
    )

    report = {
        "benchmarkVersion": 3,
        "basis": (
            "Current Explore view-model plus exact src/app/explore components rendered through the "
            "benchmark JSX adapter; DOM/materialization measured in system Chromium. React reconciliation "
            "and the pinned Vite/Playwright browser matrix are separate Phase-6 gates."
        ),
        "compiler": compiler,
        "realRendererCases": real_cases,
        "stateSwap": browser_result["stateSwap"],
        "pilotGeometry": {"status": "PASS" if geometry_pass else "FAIL", "cases": geometry},
        "accessibilityProbe": browser_result["accessibilityTree"],
        "mediaQueries": media,
        "syntheticHeadroom": browser_result["synthetic"],
        "userAgent": user_agent,
        "enginesTested": ["chromium-system"],
        "decision": {
            "denseBackplane": "not_required_for_current_initial_five",
            "virtualization": "not_required_for_current_initial_five",
            "accessibility": "anatomy_depictions_create_no_focus_targets_in_all_phase5a_pilot_states",
            "semanticOutlinePolicy": (
                "provisional_keep_until_pinned_accessibility_matrix; current Chromium probe confirms both "
                "SVG targets and semantic-outline buttons are exposed, so duplicate navigation cost must "
                "be evaluated in the pinned keyboard/screen-reader gate before consolidation"
            ),
            "reviewRule": (
                "Re-profile if semantic/presentation visibility materially increases; performance tuning "
                "must not alter semantic Expansion Mode, identity, Selection, Navigation, or accessibility targets."
            ),
        },
        "limitations": [
            "Benchmark JSX adapter executes the exact Explore components but bypasses React reconciliation.",
            "System Chromium is implementation evidence, not the pinned three-engine Playwright matrix.",
            "Accessibility.getFullAXTree is Chromium accessibility-tree evidence, not a screen-reader study.",
            "Synthetic headroom is a separate stress series and is not used as a proxy for real scene density.",
        ],
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report, indent=2))
    return 0 if geometry_pass else 1


if __name__ == "__main__":
    raise SystemExit(main())
