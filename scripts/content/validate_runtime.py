#!/usr/bin/env python3
from __future__ import annotations
import hashlib,json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]; OUT=ROOT/'runtime'/'generated'

def main():
    errors=[]
    mp=OUT/'manifest.json'
    if not mp.exists(): raise SystemExit('ERROR: runtime/generated/manifest.json missing')
    manifest=json.loads(mp.read_text())
    if manifest.get('runtimeFormatVersion') not in {'1.0.0','1.1.0'}: errors.append('unsupported runtimeFormatVersion')
    product_index=[]
    if manifest.get('productIds'):
        pp=OUT/'products/index.json'
        if not pp.exists(): errors.append('productIds declared but products/index.json missing')
        else: product_index=json.loads(pp.read_text())
    product_keys={(p['id'],int(p['revision'])) for p in product_index}
    for p in product_index:
        rp=OUT/'products'/f"{p['id']}@{p['revision']}.json"
        if not rp.exists(): errors.append(f'missing runtime product {p["id"]}@{p["revision"]}')
    for sp in sorted((OUT/'systems').glob('*.json')) if (OUT/'systems').exists() else []:
        system=json.loads(sp.read_text())
        for cfg in system.get('configurations',{}).values():
            entity_ids=set(cfg.get('entities',{})); connection_ids=set(cfg.get('connections',{}))
            anatomy_ids=set()
            for entity in cfg.get('entities',{}).values():
                pref=entity.get('productRef')
                if pref:
                    key=(pref.get('id'),int(pref.get('revision',0)))
                    if key not in product_keys: errors.append(f'{sp.name}:{cfg.get("id")}:{entity.get("id")}: unresolved runtime productRef {key}')
                    resolved=entity.get('resolvedProduct')
                    if not resolved or (resolved.get('id'),int(resolved.get('revision',0)))!=key:
                        errors.append(f'{sp.name}:{cfg.get("id")}:{entity.get("id")}: missing/mismatched resolvedProduct')
                for depiction in entity.get('anatomyDepictions',[]) or []:
                    did=depiction.get('id')
                    if did in anatomy_ids: errors.append(f'{sp.name}:{cfg.get("id")}: duplicate runtime anatomy id {did}')
                    anatomy_ids.add(did)
                    forbidden={'locator','entityId','childIds','properties','productRef','conceptOccurrences','scenario','selectable','enterable'} & set(depiction)
                    if forbidden: errors.append(f'{sp.name}:{cfg.get("id")}:{did}: anatomy leaks semantic runtime fields {sorted(forbidden)}')
                    if depiction.get('placementBasis') not in {'schematic','documented'}: errors.append(f'{sp.name}:{cfg.get("id")}:{did}: invalid placementBasis')
            for c in cfg.get('connections',{}).values():
                for endpoint in c.get('endpointIds',[]):
                    if endpoint not in entity_ids: errors.append(f'{sp.name}:{cfg.get("id")}:{c.get("id")}: endpoint does not resolve to entity: {endpoint}')
                    if endpoint in anatomy_ids: errors.append(f'{sp.name}:{cfg.get("id")}:{c.get("id")}: connection targets anatomy depiction')
            for occ in cfg.get('conceptOccurrences',[]):
                target=occ.get('target',{})
                if target.get('id') in anatomy_ids: errors.append(f'{sp.name}:{cfg.get("id")}: Concept occurrence targets anatomy depiction')
    cp=OUT/'checksums.json'
    if cp.exists():
        checksums=json.loads(cp.read_text())
        for rel,expected in checksums.items():
            p=OUT/rel
            if not p.exists(): errors.append(f'checksum target missing: {rel}'); continue
            actual=hashlib.sha256(p.read_bytes()).hexdigest()
            if actual!=expected: errors.append(f'checksum mismatch: {rel}')
    for e in errors: print('ERROR:',e)
    print(f'SUMMARY: errors={len(errors)}, result={"PASS" if not errors else "FAIL"}')
    raise SystemExit(1 if errors else 0)
if __name__=='__main__': main()
