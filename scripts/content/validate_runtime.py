#!/usr/bin/env python3
from pathlib import Path
import hashlib,json
ROOT=Path(__file__).resolve().parents[2];OUT=ROOT/'runtime/generated';errors=[]
def load(p):return json.loads(p.read_text(encoding='utf-8'))
m=load(OUT/'manifest.json');checks=load(OUT/'checksums.json')
for rel,h in checks.items():
 p=OUT/rel
 if not p.exists() or hashlib.sha256(p.read_bytes()).hexdigest()!=h:errors.append(f'checksum mismatch {rel}')
for sid in m['initialSystemIds']:
 p=OUT/'systems'/f'{sid}.json'
 if not p.exists():errors.append(f'missing initial runtime system {sid}');continue
 s=load(p)
 for cfg in s['configurations'].values():
  if cfg['rootEntityId'] not in cfg['entities']:errors.append(f'{cfg["id"]}: missing root')
  if cfg['defaultScenarioId'] not in cfg['scenarios']:errors.append(f'{cfg["id"]}: missing default scenario')
  for e in cfg['entities'].values():
   if 'population'in e and 'expansion_mode'in e['population']:errors.append(f'{cfg["id"]}: authoring snake_case leaked into runtime population')
   for v in e['properties'].values():
    if 'directional_basis'in v:errors.append(f'{cfg["id"]}: authoring snake_case leaked into runtime property')
occ=load(OUT/'concepts/occurrences.json')
for cid,items in occ.items():
 if cid not in m['conceptIds']:errors.append(f'occurrence references missing concept {cid}')
print(f'RUNTIME SUMMARY: files={len([p for p in OUT.rglob("*") if p.is_file()])}, errors={len(errors)}')
for e in errors:print('  -',e)
raise SystemExit(1 if errors else 0)
