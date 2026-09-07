#!/usr/bin/env python3
"""Audit root-level material branches for architectural connectivity.

A root branch is not required to have a graph edge merely to exist. This audit catches
isolated peer branches when a configuration has multiple root branches; single-branch
hierarchies remain valid. A black-box branch may be isolated only when its evidence note
explicitly marks an intentional boundary/unknown.
"""
from __future__ import annotations
import json
from pathlib import Path
ROOT = Path(__file__).resolve().parents[2]
RUNTIME = ROOT / 'runtime' / 'generated'
REPORT = ROOT / 'reports' / 'readiness' / 'branch-coverage.json'

def subtree(entities, start):
    out=set(); stack=[start]
    while stack:
        cur=stack.pop()
        if cur in out: continue
        out.add(cur); stack.extend(entities[cur].get('childIds',[]))
    return out

def main():
    manifest=json.loads((RUNTIME/'manifest.json').read_text())
    errors=[]; rows=[]
    for sid in manifest['systemIds']:
        sys=json.loads((RUNTIME/'systems'/f'{sid}.json').read_text())
        for cfg in sys['configurations'].values():
            entities=cfg['entities']; conns=cfg['connections']; root=entities[cfg['rootEntityId']]
            children=root.get('childIds',[])
            for child in children:
                sub=subtree(entities,child)
                crossing=[]; internal=[]
                for cid,c in conns.items():
                    eps=set(c.get('endpointIds',[]))
                    if eps & sub and not eps <= sub: crossing.append(cid)
                    elif eps and eps <= sub: internal.append(cid)
                e=entities[child]
                note=(e.get('evidence') or {}).get('note','').lower()
                bounded=e.get('representation')=='black_box' and any(k in note for k in ('boundary','unknown','not modeled','not asserted','proprietary'))
                # A configuration with one root branch needs no cross-branch edge. With
                # peers, an isolated branch needs an explicit boundary justification.
                valid=bool(crossing) or len(children)<=1 or bounded
                if not valid:
                    errors.append(f"{sid}/{cfg['id']}/{child}: root branch is isolated from peer branches without an explicit black-box boundary justification")
                rows.append({'system':sid,'configuration':cfg['id'],'branch':child,'subtree_entity_count':len(sub),'crossing_connection_ids':sorted(crossing),'internal_connection_ids':sorted(internal),'black_box_boundary_exception':bounded,'valid':valid})
    REPORT.parent.mkdir(parents=True,exist_ok=True)
    REPORT.write_text(json.dumps({'result':'PASS' if not errors else 'FAIL','errors':errors,'branches':rows},indent=2,sort_keys=True)+'\n')
    for e in errors: print('ERROR:',e)
    print(f'BRANCH COVERAGE: branches={len(rows)}, errors={len(errors)}, result={"PASS" if not errors else "FAIL"}')
    raise SystemExit(1 if errors else 0)
if __name__=='__main__': main()
