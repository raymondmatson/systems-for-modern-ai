#!/usr/bin/env python3
from __future__ import annotations
from pathlib import Path
import json, yaml

ROOT = Path(__file__).resolve().parents[2]
manifest = yaml.safe_load((ROOT / 'readiness/initial-five.yaml').read_text())
runtime = ROOT / 'runtime/generated'
errors: list[str] = []
systems: dict[str, object] = {}

runtime_manifest_path = runtime / 'manifest.json'
runtime_manifest = json.loads(runtime_manifest_path.read_text()) if runtime_manifest_path.exists() else {}

for sid, spec in manifest['systems'].items():
    p = runtime / 'systems' / f'{sid}.json'
    if not p.exists():
        errors.append(f'{sid}: runtime system missing')
        continue
    d = json.loads(p.read_text())
    cfg = d['configurations'].get(spec['configuration_id'])
    if not cfg:
        errors.append(f'{sid}: configuration {spec["configuration_id"]} missing')
        continue

    claim_results = []
    for claim in spec.get('claims', []):
        missing = []
        for eid in claim.get('entities', []):
            if eid not in cfg['entities']:
                missing.append(f'entity:{eid}')
        for cid in claim.get('connections', []):
            if cid not in cfg['connections']:
                missing.append(f'connection:{cid}')
        for concept in claim.get('concepts', []):
            if not (runtime / 'concepts' / f'{concept}.json').exists():
                missing.append(f'concept:{concept}')
        if missing:
            errors.append(f'{sid}: claim {claim["claim"]!r} missing {missing}')
        claim_results.append({'claim': claim['claim'], 'valid': not missing})

    domain_results = {}
    for name, domain in spec.get('domains', {}).items():
        valid = True
        for eid in domain.get('entities', []):
            valid &= eid in cfg['entities']
        for cid in domain.get('connections', []):
            valid &= cid in cfg['connections']
        for concept in domain.get('concepts', []):
            valid &= (runtime / 'concepts' / f'{concept}.json').exists()
        # Anatomy depictions are configuration-wide non-entity IDs. Verify authored
        # coverage without treating them as entities or population members.
        authored_anatomy = {
            dep['id']
            for entity in cfg['entities'].values()
            for dep in (entity.get('anatomyDepictions') or [])
        }
        for aid in domain.get('anatomy', []):
            valid &= aid in authored_anatomy
        if not valid:
            errors.append(f'{sid}: domain {name} references missing content')
        domain_results[name] = {'status': domain['status'], 'valid': bool(valid)}

    orientation = spec.get('physical_orientation') or {}
    orientation_pass = orientation.get('review_status') == 'pass' and orientation.get('criterion') == 'DEP-033 / RDY-018'
    if not orientation_pass:
        errors.append(f'{sid}: physical orientation review is not PASS under DEP-033 / RDY-018')

    systems[sid] = {
        'configuration_id': cfg['id'],
        'claims': claim_results,
        'domains': domain_results,
        'scenario_count': len(cfg['scenarios']),
        'concept_occurrence_count': len(cfg['conceptOccurrences']),
        'physical_orientation': {
            'status': 'PASS' if orientation_pass else 'FAIL',
            'criterion': orientation.get('criterion'),
            'note': orientation.get('note', ''),
        },
    }

release = manifest.get('release_evidence', {})
pending = []
for key, val in release.items():
    if val.get('status') != 'pass':
        pending.append(f"{key}: {val.get('status')}: {val.get('note', '')}")

report = {
    'content_readiness': 'PASS' if not errors else 'FAIL',
    'ship_ready': 'PASS' if not errors and not pending else ('PENDING' if not errors else 'FAIL'),
    'source_of_truth_version': manifest.get('source_of_truth_version'),
    'target_rsc_schema': manifest.get('rsc_target_schema'),
    'runtime_format_version': runtime_manifest.get('runtimeFormatVersion'),
    'runtime_source_schema_versions': runtime_manifest.get('sourceSchemaVersions', []),
    'concept_library_revision': manifest.get('concept_library_revision'),
    'product_catalog_revision': manifest.get('product_catalog_revision'),
    'product_catalog_schema_version': runtime_manifest.get('productCatalogSchemaVersion'),
    'errors': errors,
    'systems': systems,
    'release_evidence': release,
    'pending_release_evidence': pending,
}
out = ROOT / 'reports/readiness/initial-five.json'
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(json.dumps(report, indent=2, sort_keys=True) + '\n')
print(f"READINESS: content={report['content_readiness']}, ship_ready={report['ship_ready']}, errors={len(errors)}, pending_evidence={len(pending)}")
for e in errors:
    print('  ERROR', e)
for item in pending:
    print('  PENDING', item)
raise SystemExit(1 if errors else 0)
