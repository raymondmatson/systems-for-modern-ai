#!/usr/bin/env python3
"""Mechanical + recorded qualitative support audit for DEP-033/RDY-018.

The machine checks do not invent physical completeness. They catch mechanically empty
entered contexts and combine those results with the explicit human/evidence review
recorded in readiness/initial-five.yaml.
"""
from __future__ import annotations
import json, yaml
from pathlib import Path
ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'runtime' / 'generated'
READINESS = ROOT / 'readiness' / 'initial-five.yaml'
REPORT = ROOT / 'reports' / 'readiness' / 'physical-orientation-initial-five.json'

def main() -> None:
    manifest = json.loads((OUT / 'manifest.json').read_text())
    readiness = yaml.safe_load(READINESS.read_text())
    capabilities = json.loads((OUT / 'capabilities.json').read_text()).get('entityTypes', {})
    errors: list[str] = []
    contexts: list[dict[str, object]] = []
    checked = 0
    for sid in manifest.get('initialSystemIds', []):
        system = json.loads((OUT / 'systems' / f'{sid}.json').read_text())
        spec = readiness.get('systems', {}).get(sid, {})
        human = spec.get('physical_orientation') or {}
        if human.get('review_status') != 'pass' or human.get('criterion') != 'DEP-033 / RDY-018':
            errors.append(f'{sid}: no PASS qualitative DEP-033 / RDY-018 review is recorded')
        for cfg in system.get('configurations', {}).values():
            connections = list(cfg.get('connections', {}).values())
            endpoint_ids = {endpoint for connection in connections for endpoint in connection.get('endpointIds', [])}
            for entity in cfg.get('entities', {}).values():
                capability = capabilities.get(entity.get('entityType'), {})
                contextual = capability.get('enterability') == 'contextual'
                has_children = bool(entity.get('childIds'))
                representative_member = entity.get('population', {}).get('expansionMode') == 'representative_member'
                has_anatomy = bool(entity.get('anatomyDepictions'))
                relationship_enterable = (
                    entity.get('representation') != 'black_box'
                    and entity.get('id') in endpoint_ids
                )
                enterable = contextual and (
                    representative_member or has_children or has_anatomy or relationship_enterable
                )
                if not enterable:
                    continue
                checked += 1
                children = entity.get('childIds', [])
                anatomy = entity.get('anatomyDepictions', []) or []
                if not children and not anatomy:
                    errors.append(f"{sid}/{cfg['id']}/{entity['id']}: enterable context has no visible constituents or Anatomy Depictions")
                physical_paths = sum(1 for c in connections if entity['id'] in c.get('endpointIds', []))
                contexts.append({
                    'system': sid,
                    'configuration': cfg['id'],
                    'entity': entity['id'],
                    'child_count': len(children),
                    'anatomy_count': len(anatomy),
                    'direct_connection_count': physical_paths,
                    'black_box': entity.get('representation') == 'black_box',
                })
    report = {
        'criterion': 'DEP-033 / RDY-018',
        'result': 'PASS' if not errors else 'FAIL',
        'entered_contexts_checked': checked,
        'mechanical_errors': errors,
        'qualitative_review_source': 'readiness/initial-five.yaml',
        'contexts': contexts,
        'note': 'PASS requires both mechanically non-empty entered contexts and explicit per-system qualitative orientation review. Enterability mirrors the Explore UI: contextual capability plus representative-member expansion, children, authored anatomy, or (for non-black-box entities) a direct architectural relationship. It is not a minimum-object-count claim.',
    }
    REPORT.parent.mkdir(parents=True, exist_ok=True)
    REPORT.write_text(json.dumps(report, indent=2, sort_keys=True) + '\n')
    for e in errors:
        print('ERROR:', e)
    print(f'SUMMARY: entered_contexts_checked={checked}, errors={len(errors)}, result={report["result"]}')
    raise SystemExit(1 if errors else 0)

if __name__ == '__main__':
    main()
