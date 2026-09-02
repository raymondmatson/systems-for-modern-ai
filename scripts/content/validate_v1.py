#!/usr/bin/env python3
from pathlib import Path
import json,yaml
ROOT=Path(__file__).resolve().parents[2];RSC=ROOT/'content/RSCs';CON=ROOT/'content/concepts/metadata';SCN=ROOT/'scenarios';REG=ROOT/'property/property_registry.yaml'
INITIAL={'nvidia-dgx-h100-superpod':'nvidia_dgx_h100_superpod.yaml','nvidia-dgx-gb300-nvl72-superpod':'nvidia_dgx_gb300_nvl72_superpod.yaml','google-tpu7x-ironwood':'google_tpu7x_ironwood.yaml','cerebras-cs3-condor-galaxy3':'cerebras_cs3_condor_galaxy3.yaml','meta-h100-roce-24k':'meta_h100_roce_24k.yaml'}
concepts={yaml.safe_load(p.read_text())['concept_id'] for p in CON.glob('*.yaml')};registry=yaml.safe_load(REG.read_text())['properties'];errors=[]
def walk(e):
 yield e
 for c in e.get('children',[]):yield from walk(c)
for sid,fn in INITIAL.items():
 d=yaml.safe_load((RSC/fn).read_text());
 if d['schema_version']!='1.3.0':errors.append(f'{sid}: must use RSC 1.3.0')
 if d['reference_system']['id']!=sid:errors.append(f'{sid}: id/file mismatch')
 for cfg in d['configurations']:
  ents={e['id']:e for e in walk(cfg['hierarchy']['root'])};cons={c['id']:c for c in cfg['connections']}
  for l in cfg['concept_links']:
   if l['concept_id'] not in concepts:errors.append(f'{cfg["id"]}: missing concept {l["concept_id"]}')
  for e in ents.values():
   for pid in e.get('properties',{}):
    if pid not in registry:errors.append(f'{cfg["id"]}: unregistered property {pid}')
  for c in cons.values():
   for pid in c.get('properties',{}):
    if pid not in registry:errors.append(f'{cfg["id"]}: unregistered property {pid}')
  sp=SCN/f'{cfg["id"]}.yaml'
  if not sp.exists():errors.append(f'{cfg["id"]}: missing scenario catalog');continue
  sc=yaml.safe_load(sp.read_text());ss=sc.get('scenarios',[]);defs=[s for s in ss if s.get('default')]
  if len(defs)!=1:errors.append(f'{cfg["id"]}: scenario catalog needs exactly one default')
  if len(ss)<2:errors.append(f'{cfg["id"]}: Ship-Ready needs default + non-default scenario')
  if defs and defs[0]['id']!=cfg['scenario_catalog']['default_scenario_id']:errors.append(f'{cfg["id"]}: default scenario link mismatch')
  for s in ss:
   for eff in s.get('effects',[]):
    t=eff['target'];ok=t['type']=='entity' and t['id'] in ents or t['type']=='connection' and t['id'] in cons or t['type']=='configuration' and t['id']==cfg['id']
    if not ok:errors.append(f'{cfg["id"]}/{s["id"]}: unresolved target {t}')
print(f'V1 SUMMARY: systems={len(INITIAL)}, concepts={len(concepts)}, properties={len(registry)}, errors={len(errors)}')
for e in errors:print('  -',e)
raise SystemExit(1 if errors else 0)
