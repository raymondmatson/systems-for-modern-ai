#!/usr/bin/env python3
"""Measure SVG scene density using the generated initial-five runtime.

This benchmark intentionally measures presentation density only. It does not alter
semantic aggregation, identity, Selection, Navigation, or accessibility rules.
It launches the system Chromium binary through Python Playwright so it can run
without the project's npm dependency tree.
"""
from __future__ import annotations

import argparse
import json
import statistics
from pathlib import Path
from typing import Any

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[2]
RUNTIME = ROOT / "runtime" / "generated"
DEFAULT_OUTPUT = ROOT / "reports" / "implementation" / "render-benchmark.json"


def is_descendant(entities: dict[str, dict[str, Any]], entity_id: str, ancestor_id: str) -> bool:
    current = entities.get(entity_id)
    while current:
        if current.get("id") == ancestor_id:
            return True
        parent_id = current.get("parentId")
        current = entities.get(parent_id) if parent_id else None
    return False


def project_endpoint(
    entities: dict[str, dict[str, Any]], endpoint_id: str, visible: set[str], current_id: str
) -> str | None:
    current = entities.get(endpoint_id)
    while current:
        entity_id = current.get("id")
        if entity_id in visible:
            return entity_id
        if entity_id == current_id:
            return None
        parent_id = current.get("parentId")
        current = entities.get(parent_id) if parent_id else None
    return None


def scene_profile(configuration: dict[str, Any], entity: dict[str, Any]) -> dict[str, Any]:
    entities = configuration.get("entities", {})
    visible_ids = [entity_id for entity_id in entity.get("childIds", []) if entity_id in entities]
    visible = set(visible_ids)
    graphical_connections = 0
    context_connections = 0
    for connection in configuration.get("connections", {}).values():
        endpoints = connection.get("endpointIds", [])
        if len(endpoints) < 2 or not any(is_descendant(entities, endpoint, entity["id"]) for endpoint in endpoints):
            continue
        projected = {
            projected
            for endpoint in endpoints
            if (projected := project_endpoint(entities, endpoint, visible, entity["id"])) is not None
        }
        if len(projected) >= 2:
            graphical_connections += 1
        else:
            context_connections += 1
    anatomy = entity.get("anatomyDepictions", [])
    return {
        "entityId": entity["id"],
        "label": entity.get("name", entity["id"]),
        "interactiveNodes": len(visible_ids),
        "anatomyDepictions": len(anatomy),
        "visibleGlyphs": len(visible_ids) + len(anatomy),
        "graphicalConnections": graphical_connections,
        "contextConnections": context_connections,
    }


def representative_scene() -> dict[str, Any]:
    manifest = json.loads((RUNTIME / "manifest.json").read_text(encoding="utf-8"))
    candidates: list[dict[str, Any]] = []
    for system_id in manifest["initialSystemIds"]:
        system = json.loads((RUNTIME / "systems" / f"{system_id}.json").read_text(encoding="utf-8"))
        for configuration in system["configurations"].values():
            for entity in configuration["entities"].values():
                profile = scene_profile(configuration, entity)
                profile.update({"systemId": system_id, "configurationId": configuration["id"]})
                candidates.append(profile)
    return max(
        candidates,
        key=lambda item: (
            item["visibleGlyphs"],
            item["graphicalConnections"],
            item["contextConnections"],
        ),
    )


BENCHMARK_JS = r"""
({interactiveNodes, anatomyDepictions, connections, rounds, hitIterations}) => {
  const NS = 'http://www.w3.org/2000/svg';
  const root = document.getElementById('root');
  const createScene = () => {
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
      g.setAttribute('aria-label', `Interactive architecture target ${i + 1}`);
      g.dataset.semanticId = `node-${i + 1}`;
      const rect = document.createElementNS(NS, 'rect');
      rect.setAttribute('x', String(x)); rect.setAttribute('y', String(y));
      rect.setAttribute('width', '118'); rect.setAttribute('height', '68');
      const text = document.createElementNS(NS, 'text');
      text.setAttribute('x', String(x + 8)); text.setAttribute('y', String(y + 25));
      text.textContent = `Architecture target ${i + 1}`;
      g.append(rect, text); svg.appendChild(g);
    }

    for (let i = 0; i < anatomyDepictions; i++) {
      const row = Math.floor(i / 8) + Math.ceil(interactiveNodes / 8);
      const x = 34 + (i % 8) * 142;
      const y = 42 + row * 112;
      const g = document.createElementNS(NS, 'g');
      g.setAttribute('aria-hidden', 'true');
      g.style.pointerEvents = 'none';
      const rect = document.createElementNS(NS, 'rect');
      rect.setAttribute('x', String(x)); rect.setAttribute('y', String(y));
      rect.setAttribute('width', '118'); rect.setAttribute('height', '58');
      const text = document.createElementNS(NS, 'text');
      text.setAttribute('x', String(x + 8)); text.setAttribute('y', String(y + 23));
      text.textContent = `Visible anatomy ${i + 1}`;
      g.append(rect, text); svg.appendChild(g);
    }

    for (let i = 0; i < connections; i++) {
      if (interactiveNodes < 2) break;
      const a = positions[i % positions.length];
      const b = positions[(i * 7 + 1) % positions.length];
      const line = document.createElementNS(NS, 'line');
      line.setAttribute('x1', String(a[0])); line.setAttribute('y1', String(a[1]));
      line.setAttribute('x2', String(b[0])); line.setAttribute('y2', String(b[1]));
      line.setAttribute('aria-hidden', 'true');
      svg.insertBefore(line, svg.firstChild);
    }
    return {svg, positions};
  };

  const creation = [];
  let scene;
  for (let r = 0; r < rounds; r++) {
    const t0 = performance.now();
    scene = createScene();
    creation.push(performance.now() - t0);
  }

  const updates = [];
  const semantic = [...scene.svg.querySelectorAll('[data-semantic-id]')];
  for (let r = 0; r < rounds; r++) {
    const t0 = performance.now();
    semantic.forEach((el, i) => {
      el.toggleAttribute('data-selected', (i + r) % 7 === 0);
      el.toggleAttribute('data-scenario', (i + r) % 11 === 0);
    });
    scene.svg.getBoundingClientRect();
    updates.push(performance.now() - t0);
  }

  const box = scene.svg.getBoundingClientRect();
  let hits = 0;
  const h0 = performance.now();
  for (let i = 0; i < hitIterations; i++) {
    const x = box.left + 40 + ((i * 41) % Math.max(1, Math.floor(box.width - 80)));
    const y = box.top + 40 + ((i * 29) % Math.max(1, Math.floor(box.height - 80)));
    if (document.elementFromPoint(x, y)?.closest?.('[data-semantic-id]')) hits++;
  }
  const hitTestMs = performance.now() - h0;

  const sorted = xs => [...xs].sort((a,b) => a-b);
  const median = xs => {
    const s = sorted(xs); const m = Math.floor(s.length / 2);
    return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
  };
  return {
    createMedianMs: median(creation),
    updateMedianMs: median(updates),
    hitTestMs,
    domElements: scene.svg.querySelectorAll('*').length,
    focusTargets: scene.svg.querySelectorAll('[tabindex="0"]').length,
    anatomyFocusTargets: scene.svg.querySelectorAll('[aria-hidden="true"][tabindex]').length,
    hits,
  };
}
"""


def run_case(page, *, interactive_nodes: int, anatomy: int, connections: int) -> dict[str, Any]:
    result = page.evaluate(
        BENCHMARK_JS,
        {
            "interactiveNodes": interactive_nodes,
            "anatomyDepictions": anatomy,
            "connections": connections,
            "rounds": 15,
            "hitIterations": max(500, interactive_nodes * 10),
        },
    )
    return {
        "interactiveNodes": interactive_nodes,
        "anatomyDepictions": anatomy,
        "visibleGlyphs": interactive_nodes + anatomy,
        "connections": connections,
        **result,
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument("--chromium", default="/usr/bin/chromium")
    args = parser.parse_args()

    representative = representative_scene()
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(
            executable_path=args.chromium,
            headless=True,
            args=["--no-sandbox", "--disable-dev-shm-usage"],
        )
        page = browser.new_page(viewport={"width": 1280, "height": 900})
        page.set_content("<!doctype html><meta charset='utf-8'><div id='root'></div>")
        real = run_case(
            page,
            interactive_nodes=representative["interactiveNodes"],
            anatomy=representative["anatomyDepictions"],
            connections=representative["graphicalConnections"],
        )
        synthetic = []
        for total in (50, 100, 250, 500, 1000, 2000):
            anatomy = max(1, round(total * 0.2))
            interactive = total - anatomy
            synthetic.append(
                run_case(
                    page,
                    interactive_nodes=interactive,
                    anatomy=anatomy,
                    connections=round(interactive * 1.5),
                )
            )
        user_agent = page.evaluate("navigator.userAgent")
        browser.close()

    report = {
        "benchmarkVersion": 2,
        "basis": "Generated initial-five runtime after Product Catalog / Anatomy Depiction migration",
        "representativeCase": representative,
        "real": real,
        "synthetic": synthetic,
        "userAgent": user_agent,
        "enginesTested": ["chromium-system"],
        "decision": {
            "denseBackplane": "not_required_for_v1_representative_scenes",
            "virtualization": "not_required_for_v1_representative_scenes",
            "accessibility": "anatomy_depictions_create_no_focus_targets",
            "reviewRule": "Re-profile if semantic visibility materially increases; do not alter semantic Expansion Mode, identity, Selection, Navigation, or accessibility to meet renderer budgets.",
        },
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
