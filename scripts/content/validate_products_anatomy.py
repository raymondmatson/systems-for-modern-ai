#!/usr/bin/env python3
from __future__ import annotations
import argparse, json, re, sys
from pathlib import Path
from typing import Any
import yaml
from jsonschema import Draft202012Validator

ROOT=Path(__file__).resolve().parents[2]
RSC=ROOT/'content'/'RSCs'; PRODUCTS=ROOT/'content'/'products'; INVENTORY=ROOT/'docs'/'Organizational_Content_Inventory.md'
PROPERTY_REGISTRY=ROOT/'property'/'property_registry.yaml'
SCENARIOS=ROOT/'scenarios'
SCHEMA_BY_VERSION={
 '1.2.0':RSC/'reference_system.schema.v1.2.0.json',
 '1.3.0':RSC/'reference_system.schema.v1.3.0.json',
 '1.4.0':RSC/'reference_system.schema.json',
}

def parse_inventory(path:Path)->dict[str,set[str]]:
    cats={}; cur=None
    for raw in path.read_text(encoding='utf-8').splitlines():
        m=re.match(r'^##\s+\d+\.\s+(.*\S)\s*$',raw)
        if m: cur=m.group(1).strip(); cats[cur]={cur}; continue
        if not cur: continue
        m=re.match(r'^###\s+(.*\S)\s*$',raw)
        if m: cats[cur].add(re.sub(r'\*\*(.*?)\*\*',r'\1',m.group(1).strip())); continue
        m=re.match(r'^\s*-\s+(.*\S)\s*$',raw)
        if m: cats[cur].add(re.sub(r'\*\*(.*?)\*\*',r'\1',m.group(1).strip()))
    return cats

def flatten(e:dict[str,Any]):
    yield e
    for c in e.get('children',[]) or []: yield from flatten(c)

def equivalent_identity(a:dict[str,Any],b:dict[str,Any])->bool:
    keys={'manufacturer','product_family','model','variant','generation','architecture','codename'}
    return all(not a.get(k) or a.get(k)==b.get(k) for k in keys)

def load_products(errors:list[str]):
    schema_path=PRODUCTS/'product.schema.json'
    if not schema_path.exists(): errors.append('missing Product Catalog schema'); return {}
    schema=json.loads(schema_path.read_text()); validator=Draft202012Validator(schema)
    found={}; manifest_entries=[]
    for p in sorted(PRODUCTS.glob('*.yaml')):
        if p.name=='manifest.yaml': continue
        try: d=yaml.safe_load(p.read_text())
        except Exception as e: errors.append(f'{p.name}: YAML parse error: {e}'); continue
        for e in validator.iter_errors(d): errors.append(f'{p.name}: schema: {e.message} @ {"/".join(map(str,e.path))}')
        if not isinstance(d,dict) or not isinstance(d.get('product'),dict): continue
        prod=d['product']; pid=prod.get('id'); rev=prod.get('revision')
        level=prod.get('record_level'); ident=prod.get('identity',{})
        if level=='family' and (ident.get('model') or ident.get('variant')):
            errors.append(f'{p.name}: family-level Product Definition may not claim model/variant identity')
        if level=='model' and not ident.get('model'):
            errors.append(f'{p.name}: model-level Product Definition requires identity.model')
        if level=='variant' and not ident.get('variant'):
            errors.append(f'{p.name}: variant-level Product Definition requires identity.variant')
        if pid and p.stem!=pid: errors.append(f'{p.name}: filename must match product.id {pid!r}')
        key=(pid,rev)
        if key in found: errors.append(f'duplicate Product Definition {pid}@{rev}')
        found[key]=d
        source_ids={s.get('id') for s in d.get('sources',[])}
        for sid in prod.get('source_ids',[]):
            if sid not in source_ids: errors.append(f'{p.name}: product references missing source {sid}')
        manifest_entries.append({'id':pid,'revision':rev,'file':p.name})
    mp=PRODUCTS/'manifest.yaml'
    if mp.exists():
        m=yaml.safe_load(mp.read_text()) or {}; actual=m.get('products',[])
        if actual!=manifest_entries: errors.append('content/products/manifest.yaml is stale or not canonical-sort-equivalent')
    return found

def validate_repo()->tuple[list[str],list[str]]:
    errors=[]; warnings=[]
    if not INVENTORY.exists(): errors.append(f'missing canonical inventory: {INVENTORY}'); return errors,warnings
    inv=parse_inventory(INVENTORY); products=load_products(errors)
    registry_doc=yaml.safe_load(PROPERTY_REGISTRY.read_text()) if PROPERTY_REGISTRY.exists() else {}
    property_ids=set((registry_doc or {}).get('properties',{}))
    for (pid,rev),pd in products.items():
        for prop_id in (pd.get('product',{}).get('properties',{}) or {}):
            if prop_id not in property_ids: errors.append(f'Product {pid}@{rev}: unregistered property {prop_id}')
    depiction_ids_by_cfg={}
    for p in sorted(RSC.glob('*.yaml')):
        if p.name in {'manifest.yaml','reference_system.template.yaml'}: continue
        try: d=yaml.safe_load(p.read_text())
        except Exception as e: errors.append(f'{p.name}: YAML parse error: {e}'); continue
        if not isinstance(d,dict) or 'reference_system' not in d: continue
        ver=d.get('schema_version'); sp=SCHEMA_BY_VERSION.get(ver)
        if not sp or not sp.exists(): errors.append(f'{p.name}: unsupported/missing schema version {ver}'); continue
        schema=json.loads(sp.read_text()); validator=Draft202012Validator(schema)
        for e in validator.iter_errors(d): errors.append(f'{p.name}: schema: {e.message} @ {"/".join(map(str,e.path))}')
        source_ids={s.get('id') for s in d.get('sources',[])}
        for cfg in d.get('configurations',[]):
            cid=cfg.get('id','?'); seen=set(); depiction_ids_by_cfg[cid]=seen
            entity_ids=set()
            for e in flatten(cfg['hierarchy']['root']):
                eid=e.get('id'); entity_ids.add(eid)
                pref=e.get('product_ref'); inline=e.get('product_identity')
                if pref:
                    key=(pref.get('id'),pref.get('revision')); pd=products.get(key)
                    if not pd: errors.append(f'{p.name}:{cid}:{eid}: unresolved product_ref {key[0]}@{key[1]}')
                    else:
                        prod=pd['product']
                        if prod.get('entity_type')!=e.get('entity_type'):
                            errors.append(f'{p.name}:{cid}:{eid}: product entity_type {prod.get("entity_type")} incompatible with {e.get("entity_type")}')
                        if inline:
                            if equivalent_identity(inline,prod.get('identity',{})): warnings.append(f'{p.name}:{cid}:{eid}: equivalent inline product_identity is migration-redundant')
                            else: errors.append(f'{p.name}:{cid}:{eid}: inline product_identity conflicts with product_ref')
                        overlap=set(prod.get('properties',{})) & set(e.get('properties',{}))
                        for prop_id in sorted(overlap):
                            if prod['properties'][prop_id] == e['properties'][prop_id]:
                                warnings.append(f'{p.name}:{cid}:{eid}: property {prop_id} duplicates Product Definition; remove local duplicate after migration')
                            else:
                                errors.append(f'{p.name}:{cid}:{eid}: product/local property conflict: {prop_id}')
                for a in e.get('anatomy',[]) or []:
                    aid=a.get('id')
                    if aid in seen: errors.append(f'{p.name}:{cid}: duplicate anatomy depiction id {aid}')
                    seen.add(aid)
                    m=a.get('inventory',{}); cat=m.get('category'); item=m.get('item')
                    if m.get('status')=='existing' and (cat not in inv or item not in inv[cat]): errors.append(f'{p.name}:{cid}:{eid}:{aid}: noncanonical inventory {cat!r}/{item!r}')
                    for sid in a.get('evidence',{}).get('source_ids',[]) or []:
                        if sid not in source_ids: errors.append(f'{p.name}:{cid}:{eid}:{aid}: missing evidence source {sid}')
                    if a.get('placement_basis')=='documented' and not a.get('evidence',{}).get('source_ids'):
                        errors.append(f'{p.name}:{cid}:{eid}:{aid}: documented placement requires source evidence')
                    forbidden={'children','product_ref','product_identity','properties','concept_links','connections','scenario','population','entity_type','explore_tier'} & set(a)
                    if forbidden: errors.append(f'{p.name}:{cid}:{eid}:{aid}: anatomy contains forbidden semantic fields {sorted(forbidden)}')
            # Anatomy depictions cannot be graph/scenario/concept targets.
            for c in cfg.get('connections',[]):
                for endpoint in c.get('endpoints',[]):
                    if endpoint in seen: errors.append(f'{p.name}:{cid}: connection targets anatomy depiction {endpoint}')
            for l in cfg.get('concept_links',[]):
                t=l.get('target',{}) if isinstance(l,dict) else {}
                if t.get('id') in seen: errors.append(f'{p.name}:{cid}: Concept occurrence targets anatomy depiction {t.get("id")}')
            scenario_path=SCENARIOS/f'{cid}.yaml'
            if scenario_path.exists():
                scenario_doc=yaml.safe_load(scenario_path.read_text()) or {}
                for scenario in scenario_doc.get('scenarios',[]) or []:
                    for effect in scenario.get('effects',[]) or []:
                        target=effect.get('target',{}) or {}
                        if target.get('id') in seen:
                            errors.append(f'{p.name}:{cid}:{scenario.get("id")}: Scenario targets anatomy depiction {target.get("id")}')
    return errors,warnings

def main():
    errors,warnings=validate_repo()
    for w in warnings: print('WARNING:',w)
    for e in errors: print('ERROR:',e)
    print(f'SUMMARY: warnings={len(warnings)}, errors={len(errors)}, result={"PASS" if not errors else "FAIL"}')
    raise SystemExit(1 if errors else 0)
if __name__=='__main__': main()
