#!/usr/bin/env python3
from __future__ import annotations
import argparse,hashlib,json,shutil
from pathlib import Path
import yaml
ROOT=Path(__file__).resolve().parents[2];RSC=ROOT/'content/RSCs';CON=ROOT/'content/concepts';SCN=ROOT/'scenarios';OUT=ROOT/'runtime/generated';PUBLIC=ROOT/'public/runtime'
INITIAL=['nvidia-dgx-h100-superpod','nvidia-dgx-gb300-nvl72-superpod','google-tpu7x-ironwood','cerebras-cs3-condor-galaxy3','meta-h100-roce-24k']
def stable(o):return json.dumps(o,ensure_ascii=False,sort_keys=True,separators=(',',':'))+'\n'
def sha(b):return hashlib.sha256(b).hexdigest()
def evidence(e):return {'status':e['status'],'sourceIds':e.get('source_ids',[]),'note':e.get('note','')}
def prop(v):
 if not(isinstance(v,dict) and 'status'in v):return {'status':'known','value':{'form':'text','text':str(v)}}
 out={'status':v['status']}
 if 'value'in v:
  val=dict(v['value'])
  for k in ('number','min','max'):
   if k in val:val[k]=str(val[k])
  out['value']=val
 for a,b in [('basis','basis'),('scope','scope'),('directional_basis','directionalBasis'),('derivation','derivation')]:
  if a in v:out[b]=v[a]
 if 'evidence'in v:out['evidence']=evidence(v['evidence'])
 return out
def population(p):
 out={'expansionMode':p['expansion_mode'],'individuallyAddressable':p['individually_addressable'],'count':{'form':p['count']['form'],'basis':p['count']['basis']}}
 if 'value'in p['count']:out['count']['value']=str(p['count']['value'])
 if p.get('member_entity_type'):out['memberEntityType']=p['member_entity_type']
 return out
def flatten(e,parent=None,out=None):
 out={} if out is None else out
 x={'id':e['id'],'name':e['name'],'entityType':e['entity_type'],'exploreTier':e['explore_tier'],'representation':e['representation'],'evidence':evidence(e['evidence']),'inventory':{'category':e['inventory']['category'],'item':e['inventory']['item']},'properties':{k:prop(v) for k,v in sorted(e.get('properties',{}).items())},'childIds':[c['id'] for c in e.get('children',[])]}
 if parent:x['parentId']=parent
 if e.get('product_identity'):x['productIdentity']=e['product_identity']
 if e.get('population'):x['population']=population(e['population'])
 out[e['id']]=x
 for c in e.get('children',[]):flatten(c,e['id'],out)
 return out
def connection(c):return {'id':c['id'],'name':c['name'],'relationshipType':c['relationship_type'],'endpointIds':c['endpoints'],'directionality':c['directionality'],'evidence':evidence(c['evidence']),'properties':{k:prop(v) for k,v in sorted(c.get('properties',{}).items())}}
def scenario_catalog(cfg):
 p=SCN/f"{cfg['id']}.yaml"
 if p.exists():
  d=yaml.safe_load(p.read_text(encoding='utf-8'));return {s['id']:{'id':s['id'],'name':s['name'],'description':s['description'],'isDefault':s.get('default',False),'scenarioTypes':s.get('scenario_types',[]),'effects':s.get('effects',[])} for s in d['scenarios']}
 s=cfg['default_scenario'];return {s['id']:{'id':s['id'],'name':s['name'],'description':s['description'],'isDefault':True,'scenarioTypes':['baseline'],'effects':[]}}
def occurrences(cfg):
 out=[]
 for l in cfg.get('concept_links',[]):
  if 'concept_id'in l:out.append({'conceptId':l['concept_id'],'role':l['role'],'target':l['target'],'note':l.get('note','')})
 return out
def system(path):
 d=yaml.safe_load(path.read_text(encoding='utf-8'));rs=d['reference_system'];configs={}
 for c in d['configurations']:
  entities=flatten(c['hierarchy']['root']);sc=scenario_catalog(c);defaults=[s['id'] for s in sc.values() if s['isDefault']];default=defaults[0] if defaults else c['default_scenario']['id']
  configs[c['id']]={'id':c['id'],'name':c['name'],'status':c['configuration_status'],'rootEntityId':c['hierarchy']['root']['id'],'defaultScenarioId':default,'entities':entities,'connections':{x['id']:connection(x) for x in c.get('connections',[])},'conceptOccurrences':occurrences(c),'scenarios':sc,'scopeNotes':c['scope_notes'],'modelingNotes':c.get('modeling_notes',[])}
 return {'id':rs['id'],'name':rs['name'],'summary':rs['summary'],'planningStatus':rs['planning_status'],'sourceSchemaVersion':d['schema_version'],'configurations':configs}
def concepts():
 out={}
 for p in sorted((CON/'metadata').glob('*.yaml')):
  d=yaml.safe_load(p.read_text(encoding='utf-8'));out[d['concept_id']]={**d,'markdown':(CON/'content'/f"{d['concept_id']}.md").read_text(encoding='utf-8')}
 return out
def write(p,o):p.parent.mkdir(parents=True,exist_ok=True);p.write_text(stable(o),encoding='utf-8')
def generate(target):
 if target.exists():shutil.rmtree(target)
 target.mkdir(parents=True)
 systems={}
 for p in sorted(RSC.glob('*.yaml')):
  if p.name in {'manifest.yaml','reference_system.template.yaml'}:continue
  d=yaml.safe_load(p.read_text(encoding='utf-8'))
  if not(isinstance(d,dict) and 'reference_system'in d):continue
  s=system(p);systems[s['id']]=s;write(target/'systems'/f"{s['id']}.json",s)
 cs=concepts()
 for cid,c in cs.items():write(target/'concepts'/f'{cid}.json',c)
 write(target/'concepts/index.json',[{'conceptId':c['concept_id'],'name':c['name'],'summary':c['summary'],'aliases':c.get('aliases',[]),'tags':c.get('tags',[])} for c in cs.values()])
 occ={}
 for sid,s in systems.items():
  for cid,c in s['configurations'].items():
   for o in c['conceptOccurrences']:occ.setdefault(o['conceptId'],[]).append({'systemId':sid,'configurationId':cid,**o})
 write(target/'concepts/occurrences.json',occ)
 reg=yaml.safe_load((ROOT/'property/property_registry.yaml').read_text(encoding='utf-8'));write(target/'property-registry.json',reg)
 cap=yaml.safe_load((ROOT/'content/capabilities/entity_type_capabilities.yaml').read_text(encoding='utf-8'));write(target/'capabilities.json',cap)
 manifest={'runtimeFormatVersion':'1.0.0','sourceSchemaVersions':sorted({s['sourceSchemaVersion'] for s in systems.values()}),'conceptSchemaVersion':'1.0.0','defaultSystemId':INITIAL[0],'initialSystemIds':INITIAL,'systemIds':sorted(systems),'conceptIds':sorted(cs)};write(target/'manifest.json',manifest)
 hashes={str(p.relative_to(target)):sha(p.read_bytes()) for p in sorted(target.rglob('*.json'))};write(target/'checksums.json',hashes)
def sync_public():
 if PUBLIC.exists():shutil.rmtree(PUBLIC)
 shutil.copytree(OUT,PUBLIC)
def snapshot(path):return {str(p.relative_to(path)):p.read_bytes() for p in path.rglob('*') if p.is_file()}
def main():
 ap=argparse.ArgumentParser();ap.add_argument('--check',action='store_true');a=ap.parse_args()
 if a.check:
  tmp=ROOT/'runtime/.check-generated';generate(tmp)
  if not OUT.exists() or snapshot(tmp)!=snapshot(OUT):shutil.rmtree(tmp,ignore_errors=True);raise SystemExit('generated runtime artifacts are stale or nondeterministic')
  shutil.rmtree(tmp);print(f'PASS: deterministic runtime artifacts ({len(snapshot(OUT))} files)');return
 generate(OUT);sync_public();print(f'PASS: generated runtime artifacts at {OUT} and mirrored to {PUBLIC}')
if __name__=='__main__':main()
