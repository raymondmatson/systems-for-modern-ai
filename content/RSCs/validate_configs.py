#!/usr/bin/env python3
"""Validate mixed 1.2.0/1.3.0 Reference-System sources and cross-file references."""
from __future__ import annotations
from pathlib import Path
from typing import Any
import json,re,sys,yaml
from jsonschema import Draft202012Validator
ROOT=Path(__file__).resolve().parent
DOCS=ROOT.parents[1]/'docs'
INVENTORY_PATH=DOCS/'Organizational_Content_Inventory.md'
SCHEMA_12=json.loads((ROOT/'reference_system.schema.v1.2.0.json').read_text(encoding='utf-8'))
SCHEMA_13=json.loads((ROOT/'reference_system.schema.json').read_text(encoding='utf-8'))
VALIDATORS={'1.2.0':Draft202012Validator(SCHEMA_12),'1.3.0':Draft202012Validator(SCHEMA_13)}
PRODUCT_KEYS={'manufacturer','product_family','model','variant','generation','architecture','codename'}
PLACEHOLDERS={'unknown','n/a','na','none','unspecified','proprietary','tbd','to be determined','generic'}
REL_TYPES={'physical_connectivity','data_communication_path','dependency_service','affinity_locality','shared_resource_membership','redundancy_protection','control_management'}
CONCEPT_ROLES={'embodies','uses','illustrates','applies_to','measured_at'}

def parse_inventory(path:Path)->dict[str,set[str]]:
    out={}; cur=None
    for raw in path.read_text(encoding='utf-8').splitlines():
        m=re.match(r'^##\s+\d+\.\s+(.*\S)\s*$',raw)
        if m: cur=m.group(1).strip(); out[cur]={cur}; continue
        if cur is None: continue
        m=re.match(r'^###\s+(.*\S)\s*$',raw) or re.match(r'^\s*-\s+(.*\S)\s*$',raw)
        if m: out[cur].add(re.sub(r'\*\*(.*?)\*\*',r'\1',m.group(1).strip()))
    return out
INVENTORY=parse_inventory(INVENTORY_PATH)

def files():
    return [p for p in sorted(ROOT.glob('*.yaml')) if p.name not in {'manifest.yaml','reference_system.template.yaml'} and isinstance(yaml.safe_load(p.read_text(encoding='utf-8')),dict) and 'reference_system' in yaml.safe_load(p.read_text(encoding='utf-8'))]
def flatten(e:dict[str,Any]):
    yield e
    for c in e.get('children',[]) or []: yield from flatten(c)
def invcheck(inv,label,errors):
    cat,item,status=inv.get('category'),inv.get('item'),inv.get('status')
    known=cat in INVENTORY and item in INVENTORY.get(cat,set())
    if status=='existing' and not known: errors.append(f'{label}: noncanonical inventory mapping {cat!r} / {item!r}')
    if status=='proposed_addition' and known: errors.append(f'{label}: stale proposed_addition for canonical inventory item')
def evidencecheck(obj,label,sources,errors):
    for sid in (obj.get('evidence') or {}).get('source_ids',[]) or []:
        if sid not in sources: errors.append(f'{label}: missing evidence source {sid}')
def productcheck(e,label,errors):
    pi=e.get('product_identity')
    if not pi:return
    if set(pi)-PRODUCT_KEYS: errors.append(f'{label}: unsupported product_identity keys')
    if not pi.get('manufacturer') or not any(pi.get(k) for k in PRODUCT_KEYS-{'manufacturer'}): errors.append(f'{label}: incomplete product_identity')
    for k,v in pi.items():
        if not isinstance(v,str) or not v.strip() or v.strip().lower() in PLACEHOLDERS: errors.append(f'{label}: invalid product_identity.{k}')
def custom(data):
    errors=[]; version=data['schema_version']; sources={s['id'] for s in data['sources']}
    if len(sources)!=len(data['sources']):errors.append('duplicate source IDs')
    for sid in data['reference_system']['source_ids']:
        if sid not in sources:errors.append(f'reference_system missing source {sid}')
    cfgids=[c['id'] for c in data['configurations']]
    if len(cfgids)!=len(set(cfgids)):errors.append('duplicate configuration IDs')
    for cfg in data['configurations']:
        cid=cfg['id']
        for sid in cfg['source_ids']:
            if sid not in sources:errors.append(f'{cid}: missing source {sid}')
        root=cfg['hierarchy']['root']
        if root['explore_tier']!=1:errors.append(f'{cid}: hierarchy root must be Tier 1')
        ents=list(flatten(root)); ids=[e['id'] for e in ents]; eset=set(ids)
        if len(ids)!=len(eset):errors.append(f'{cid}: duplicate entity IDs')
        def tiers(e,parent=None):
            if parent and e['explore_tier']<parent['explore_tier']: errors.append(f'{cid}: child tier moves upward {e["id"]}')
            for ch in e.get('children',[]) or []:tiers(ch,e)
        tiers(root)
        for e in ents:
            invcheck(e['inventory'],f'{cid}: entity {e["id"]}',errors); evidencecheck(e,f'{cid}: entity {e["id"]}',sources,errors); productcheck(e,f'{cid}: entity {e["id"]}',errors)
            if version=='1.3.0' and 'population' in e:
                pop=e['population']
                if pop['expansion_mode']=='addressable_members' and not pop['individually_addressable']: errors.append(f'{cid}: {e["id"]} addressable_members requires individually_addressable=true')
        conids=[]
        for c in cfg.get('connections',[]):
            conids.append(c['id']); invcheck(c['inventory'],f'{cid}: connection {c["id"]}',errors); evidencecheck(c,f'{cid}: connection {c["id"]}',sources,errors)
            if c['relationship_type'] not in REL_TYPES:errors.append(f'{cid}: invalid relationship type {c["relationship_type"]}')
            for ep in c['endpoints']:
                if ep not in eset:errors.append(f'{cid}: connection {c["id"]} endpoint missing {ep}')
        if len(conids)!=len(set(conids)):errors.append(f'{cid}: duplicate connection IDs')
        cset=set(conids)
        for g in cfg.get('functional_groups',[]):
            evidencecheck(g,f'{cid}: functional group {g["id"]}',sources,errors)
            for m in g['member_ids']:
                if m not in eset:errors.append(f'{cid}: functional group {g["id"]} member missing {m}')
        for l in cfg.get('concept_links',[]):
            if version=='1.2.0':
                invcheck(l['inventory'],f'{cid}: concept link {l["name"]}',errors)
                for eid in l.get('entity_ids',[]):
                    if eid not in eset:errors.append(f'{cid}: concept link {l["name"]} missing entity {eid}')
            else:
                if l['role'] not in CONCEPT_ROLES:errors.append(f'{cid}: invalid concept role')
                t=l['target']; tid=t['id']
                if t['type']=='entity' and tid not in eset:errors.append(f'{cid}: concept {l["concept_id"]} missing entity {tid}')
                elif t['type']=='connection' and tid not in cset:errors.append(f'{cid}: concept {l["concept_id"]} missing connection {tid}')
                elif t['type']=='configuration' and tid!=cid:errors.append(f'{cid}: concept {l["concept_id"]} configuration target must be owning config')
        for u in cfg.get('unknowns',[]):
            for eid in u['affected_entity_ids']:
                if eid not in eset:errors.append(f'{cid}: unknown target missing {eid}')
        if version=='1.3.0':
            ref=cfg['scenario_catalog']
            if ref['default_scenario_id']!=cfg['default_scenario']['id']:errors.append(f'{cid}: scenario catalog default mismatch')
            expected=f'scenarios/{cid}.yaml'
            if ref['path']!=expected:errors.append(f'{cid}: scenario catalog path must be {expected}')
    return errors

def validate(path):
    try:data=yaml.safe_load(path.read_text(encoding='utf-8'))
    except Exception as e:return [f'YAML parse error: {e}']
    if not isinstance(data,dict):return ['top-level document must be a mapping']
    v=data.get('schema_version')
    if v not in VALIDATORS:return [f'unsupported schema_version {v!r}']
    errs=[f'schema: {e.message} @ {"/".join(map(str,e.path))}' for e in sorted(VALIDATORS[v].iter_errors(data),key=lambda e:list(e.path))]
    return errs or custom(data)

def validate_manifest(system_files):
    errors=[]; d=yaml.safe_load((ROOT/'manifest.yaml').read_text(encoding='utf-8')); entries=d.get('systems',[])
    if d.get('system_file_count')!=len(system_files):errors.append('manifest system_file_count mismatch')
    by={p.name:p for p in system_files}; seen=[]
    for e in entries:
        fn=Path(e['file']).name;seen.append(fn)
        if fn not in by:errors.append(f'manifest missing file {fn}');continue
        sd=yaml.safe_load(by[fn].read_text(encoding='utf-8'));rs=sd['reference_system']
        if e['id']!=rs['id'] or e['name']!=rs['name'] or e['planning_status']!=rs['planning_status']:errors.append(f'manifest metadata mismatch {fn}')
        if e.get('configuration_count')!=len(sd['configurations']):errors.append(f'manifest configuration count mismatch {fn}')
        if e.get('source_schema_version')!=sd['schema_version']:errors.append(f'manifest source_schema_version mismatch {fn}')
    if set(by)!=set(seen):errors.append('manifest file listing mismatch')
    return errors

def main():
    sysfiles=files(); failed=False; configs=0; versions={}
    for p in sysfiles:
        d=yaml.safe_load(p.read_text(encoding='utf-8'));configs+=len(d['configurations']);versions[d['schema_version']]=versions.get(d['schema_version'],0)+1
        errs=validate(p);print(f'{p.name}: {"PASS" if not errs else "FAIL"}')
        for e in errs:print('  -',e)
        failed|=bool(errs)
    merr=validate_manifest(sysfiles);print(f'manifest.yaml: {"PASS" if not merr else "FAIL"}')
    for e in merr:print('  -',e)
    failed|=bool(merr)
    print(f'SUMMARY: systems={len(sysfiles)}, configurations={configs}, schema_versions={versions}, inventory_categories={len(INVENTORY)}, result={"FAIL" if failed else "PASS"}')
    raise SystemExit(1 if failed else 0)
if __name__=='__main__':main()
