#!/usr/bin/env python3
from __future__ import annotations
from pathlib import Path
import json,yaml
ROOT=Path(__file__).resolve().parents[2];manifest=yaml.safe_load((ROOT/'readiness/initial-five.yaml').read_text());runtime=ROOT/'runtime/generated';errors=[];systems={}
for item in manifest['systems']:
 pass
# YAML systems is mapping, not list
for sid,spec in manifest['systems'].items():
 p=runtime/'systems'/f'{sid}.json'
 if not p.exists():errors.append(f'{sid}: runtime system missing');continue
 d=json.loads(p.read_text());cfg=d['configurations'].get(spec['configuration_id'])
 if not cfg:errors.append(f'{sid}: configuration {spec["configuration_id"]} missing');continue
 claim_results=[]
 for claim in spec.get('claims',[]):
  missing=[]
  for eid in claim.get('entities',[]):
   if eid not in cfg['entities']:missing.append(f'entity:{eid}')
  for cid in claim.get('connections',[]):
   if cid not in cfg['connections']:missing.append(f'connection:{cid}')
  for concept in claim.get('concepts',[]):
   if not (runtime/'concepts'/f'{concept}.json').exists():missing.append(f'concept:{concept}')
  if missing:errors.append(f'{sid}: claim {claim["claim"]!r} missing {missing}')
  claim_results.append({'claim':claim['claim'],'valid':not missing})
 domain_results={}
 for name,domain in spec.get('domains',{}).items():
  valid=True
  for eid in domain.get('entities',[]):valid &= eid in cfg['entities']
  for cid in domain.get('connections',[]):valid &= cid in cfg['connections']
  for concept in domain.get('concepts',[]):valid &= (runtime/'concepts'/f'{concept}.json').exists()
  if not valid:errors.append(f'{sid}: domain {name} references missing content')
  domain_results[name]={'status':domain['status'],'valid':bool(valid)}
 systems[sid]={'configuration_id':cfg['id'],'claims':claim_results,'domains':domain_results,'scenario_count':len(cfg['scenarios']),'concept_occurrence_count':len(cfg['conceptOccurrences'])}
release=manifest.get('release_evidence',{})
pending=[]
for key,val in release.items():
 if val.get('status')!='pass':pending.append(f"{key}: {val.get('status')}: {val.get('note','')}")
report={'content_readiness':'PASS' if not errors else 'FAIL','ship_ready':'PASS' if not errors and not pending else 'PENDING' if not errors else 'FAIL','errors':errors,'systems':systems,'release_evidence':release,'pending_release_evidence':pending}
out=ROOT/'reports/readiness/initial-five.json';out.parent.mkdir(parents=True,exist_ok=True);out.write_text(json.dumps(report,indent=2,sort_keys=True)+'\n')
print(f"READINESS: content={report['content_readiness']}, ship_ready={report['ship_ready']}, errors={len(errors)}, pending_evidence={len(pending)}")
for e in errors:print('  ERROR',e)
for p in pending:print('  PENDING',p)
raise SystemExit(1 if errors else 0)
