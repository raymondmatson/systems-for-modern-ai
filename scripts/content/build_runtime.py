#!/usr/bin/env python3
from __future__ import annotations
import argparse, hashlib, json, shutil
from pathlib import Path
import yaml

ROOT=Path(__file__).resolve().parents[2]
RSC=ROOT/'content'/'RSCs'; CONCEPTS=ROOT/'content'/'concepts'; PRODUCTS=ROOT/'content'/'products'; SCENARIOS=ROOT/'scenarios'; OUT=ROOT/'runtime'/'generated'
INITIAL=['nvidia-dgx-h100-superpod','nvidia-dgx-gb300-nvl72-superpod','google-tpu7x-ironwood','cerebras-cs3-condor-galaxy3','meta-h100-roce-24k']

def stable(obj): return json.dumps(obj, ensure_ascii=False, sort_keys=True, separators=(',',':'))+'\n'
def digest_bytes(b:bytes): return hashlib.sha256(b).hexdigest()
def evidence(e): return {'status':e['status'],'sourceIds':e.get('source_ids',[]),'note':e.get('note','')}
def normalize_property(v):
    if not (isinstance(v, dict) and 'status' in v):
        return {'status':'known','value':{'form':'text','text':str(v)}}
    out={'status':v['status']}
    if 'value' in v:
        value=dict(v['value'])
        for key in ('number','min','max'):
            if key in value: value[key]=str(value[key])
        out['value']=value
    if 'basis' in v: out['basis']=v['basis']
    if 'scope' in v: out['scope']=v['scope']
    if 'directional_basis' in v: out['directionalBasis']=v['directional_basis']
    if 'derivation' in v: out['derivation']=v['derivation']
    if 'evidence' in v: out['evidence']=evidence(v['evidence'])
    return out

def normalize_population(p):
    out={'expansionMode':p['expansion_mode'],'individuallyAddressable':p['individually_addressable']}
    if p.get('member_entity_type'): out['memberEntityType']=p['member_entity_type']
    if p.get('count'):
        c=p['count']; out['count']={'form':c['form'],'basis':c['basis']}
        if 'value' in c: out['count']['value']=str(c['value'])
    return out


def load_products():
    products={}
    if not PRODUCTS.exists(): return products
    for p in sorted(PRODUCTS.glob('*.yaml')):
        if p.name == 'manifest.yaml': continue
        d=yaml.safe_load(p.read_text())
        if not isinstance(d,dict) or 'product' not in d: continue
        pr=d['product']; key=(pr['id'], int(pr['revision']))
        products[key]={
            'id':pr['id'],'revision':int(pr['revision']),'recordLevel':pr['record_level'],
            'name':pr['name'],'entityType':pr['entity_type'],'identity':pr['identity'],
            'summary':pr['summary'],'properties':{k:normalize_property(v) for k,v in sorted(pr.get('properties',{}).items())},
            'sourceIds':pr.get('source_ids',[])
        }
    return products

def normalize_anatomy(items):
    out=[]
    for a in items or []:
        item={'id':a['id'],'label':a['label'],'inventory':{'category':a['inventory']['category'],'item':a['inventory']['item']},
              'evidence':evidence(a['evidence']),'depictionKind':a['depiction_kind'],'placementBasis':a['placement_basis']}
        if a.get('description'): item['description']=a['description']
        if a.get('count'):
            item['count']={'basis':a['count']['basis']}
            if 'value' in a['count']: item['count']['value']=str(a['count']['value'])
        out.append(item)
    return out

def flatten_entity(e,parent=None,out=None,products=None):
    out = {} if out is None else out
    item={'id':e['id'],'name':e['name'],'entityType':e['entity_type'],'exploreTier':e['explore_tier'],'representation':e['representation'],'evidence':evidence(e['evidence']),'inventory':{'category':e['inventory']['category'],'item':e['inventory']['item']},'properties':{k:normalize_property(v) for k,v in sorted(e.get('properties',{}).items())},'childIds':[c['id'] for c in e.get('children',[])]}
    if parent: item['parentId']=parent
    if e.get('product_identity'): item['productIdentity']=e['product_identity']
    if e.get('product_ref'):
        ref=e['product_ref']; item['productRef']={'id':ref['id'],'revision':int(ref['revision'])}
        resolved=(products or {}).get((ref['id'],int(ref['revision'])))
        if resolved: item['resolvedProduct']=resolved
    if e.get('anatomy'): item['anatomyDepictions']=normalize_anatomy(e['anatomy'])
    if e.get('population'): item['population']=normalize_population(e['population'])
    out[e['id']]=item
    for c in e.get('children',[]): flatten_entity(c,e['id'],out,products)
    return out

def normalize_connection(c):
    return {'id':c['id'],'name':c['name'],'relationshipType':c['relationship_type'],'endpointIds':c['endpoints'],'directionality':c['directionality'],'evidence':evidence(c['evidence']),'properties':{k:normalize_property(v) for k,v in sorted(c.get('properties',{}).items())}}

def scenarios_for(cfg):
    p=SCENARIOS/f"{cfg['id']}.yaml"
    if p.exists():
        d=yaml.safe_load(p.read_text())
        return {s['id']:{'id':s['id'],'name':s['name'],'description':s['description'],'isDefault':s.get('default',False),'scenarioTypes':s.get('scenario_types',[]),'effects':s.get('effects',[])} for s in d['scenarios']}
    s=cfg['default_scenario']
    return {s['id']:{'id':s['id'],'name':s['name'],'description':s['description'],'isDefault':True,'scenarioTypes':['baseline'],'effects':[]}}

def occurrences(cfg):
    out=[]
    for l in cfg.get('concept_links',[]):
        if 'concept_id' in l:
            out.append({'conceptId':l['concept_id'],'role':l['role'],'target':l['target'],'note':l.get('note','')})
        else:
            out.append({'legacyName':l['name'],'legacyEntityIds':l.get('entity_ids',[]),'note':l.get('note','')})
    return out

def build_system(path,products):
    d=yaml.safe_load(path.read_text()); rs=d['reference_system']; configs={}
    for c in d['configurations']:
        entities=flatten_entity(c['hierarchy']['root'],products=products)
        sc=scenarios_for(c); defaults=[s['id'] for s in sc.values() if s['isDefault']]
        default_id=(defaults[0] if defaults else c['default_scenario']['id'])
        configs[c['id']]={'id':c['id'],'name':c['name'],'status':c['configuration_status'],'rootEntityId':c['hierarchy']['root']['id'],'defaultScenarioId':default_id,'entities':entities,'connections':{x['id']:normalize_connection(x) for x in c.get('connections',[])},'conceptOccurrences':occurrences(c),'scenarios':sc,'scopeNotes':c['scope_notes'],'modelingNotes':c.get('modeling_notes',[])}
    return {'id':rs['id'],'name':rs['name'],'summary':rs['summary'],'planningStatus':rs['planning_status'],'configurations':configs,'sourceSchemaVersion':d['schema_version']}

def build_concepts():
    result={}
    for p in sorted((CONCEPTS/'metadata').glob('*.yaml')):
        d=yaml.safe_load(p.read_text()); md=(CONCEPTS/'content'/f"{d['concept_id']}.md").read_text()
        result[d['concept_id']]={**d,'markdown':md}
    return result

def write_file(path,obj): path.parent.mkdir(parents=True,exist_ok=True); path.write_text(stable(obj),encoding='utf-8')
def generate(target):
    if target.exists(): shutil.rmtree(target)
    target.mkdir(parents=True)
    products=load_products()
    systems={}
    for p in sorted(RSC.glob('*.yaml')):
        if p.name in {'manifest.yaml','reference_system.template.yaml'}: continue
        d=yaml.safe_load(p.read_text())
        if not isinstance(d,dict) or 'reference_system' not in d: continue
        sys=build_system(p,products); systems[sys['id']]=sys; write_file(target/'systems'/f"{sys['id']}.json",sys)
    for (_, _),pr in sorted(products.items()): write_file(target/'products'/f"{pr['id']}@{pr['revision']}.json",pr)
    product_index=[{'id':pr['id'],'revision':pr['revision'],'name':pr['name'],'entityType':pr['entityType']} for pr in products.values()]
    write_file(target/'products'/'index.json',product_index)
    concepts=build_concepts()
    for cid,c in concepts.items(): write_file(target/'concepts'/f'{cid}.json',c)
    concept_index=[{'conceptId':c['concept_id'],'name':c['name'],'summary':c['summary'],'aliases':c.get('aliases',[]),'tags':c.get('tags',[])} for c in concepts.values()]
    write_file(target/'concepts'/'index.json',concept_index)
    occurrences={}
    for sid,s in systems.items():
        for cid,cfg in s['configurations'].items():
            for o in cfg['conceptOccurrences']:
                if 'conceptId' in o: occurrences.setdefault(o['conceptId'],[]).append({'systemId':sid,'configurationId':cid,**o})
    write_file(target/'concepts'/'occurrences.json',occurrences)
    reg=ROOT/'property'/'property_registry.yaml'
    if reg.exists(): write_file(target/'property-registry.json',yaml.safe_load(reg.read_text()))
    caps=ROOT/'content'/'capabilities'/'entity_type_capabilities.yaml'
    if caps.exists():
        raw=yaml.safe_load(caps.read_text())
        normalized={'schemaVersion':raw['schema_version'],'profiles':{k:{'detailSections':v['detail_sections'],'scenarioStateCategories':v['scenario_state_categories'],'structuralRole':v['structural_role']} for k,v in raw['profiles'].items()},'entityTypes':{e['entity_type']:{'entityType':e['entity_type'],'profile':e['profile'],'selectable':e['selectable'],'inspectable':e['inspectable'],'enterability':e['enterability'],'supportsConcepts':e['supports_concepts']} for e in raw['entity_types']}}
        write_file(target/'capabilities.json',normalized)
    manifest={'runtimeFormatVersion':'1.1.0','sourceSchemaVersions':sorted({s['sourceSchemaVersion'] for s in systems.values()}),'conceptSchemaVersion':'1.0.0','defaultSystemId':'nvidia-dgx-h100-superpod','initialSystemIds':INITIAL,'systemIds':sorted(systems),'conceptIds':sorted(concepts),'productIds':sorted({pr['id'] for pr in products.values()}),'productCatalogSchemaVersion':'1.0.0'}
    write_file(target/'manifest.json',manifest)
    hashes={str(p.relative_to(target)):digest_bytes(p.read_bytes()) for p in sorted(target.rglob('*.json'))}
    write_file(target/'checksums.json',hashes)

def main():
    ap=argparse.ArgumentParser(); ap.add_argument('--check',action='store_true'); a=ap.parse_args()
    tmp=ROOT/'runtime'/'.check-generated' if a.check else OUT
    generate(tmp)
    if a.check:
        if not OUT.exists(): raise SystemExit('runtime/generated does not exist')
        left={str(p.relative_to(OUT)):p.read_bytes() for p in OUT.rglob('*') if p.is_file()}
        right={str(p.relative_to(tmp)):p.read_bytes() for p in tmp.rglob('*') if p.is_file()}
        shutil.rmtree(tmp)
        if left!=right: raise SystemExit('generated runtime artifacts are not deterministic/current')
        print(f'PASS: deterministic runtime artifacts ({len(left)} files)')
    else: print(f'PASS: generated runtime artifacts at {OUT}')
if __name__=='__main__': main()
