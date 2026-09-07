from __future__ import annotations
import importlib.util, json, tempfile, unittest
from pathlib import Path
import yaml
from jsonschema import Draft202012Validator

REPO = Path(__file__).resolve().parents[2]
VALIDATOR_PATH = REPO / 'scripts' / 'content' / 'validate_products_anatomy.py'

spec = importlib.util.spec_from_file_location('validate_products_anatomy', VALIDATOR_PATH)
mod = importlib.util.module_from_spec(spec)
assert spec.loader
spec.loader.exec_module(mod)

class ProductAnatomyContractTests(unittest.TestCase):
    def test_anatomy_schema_rejects_semantic_fields(self):
        schema = json.loads((REPO/'content/RSCs/reference_system.schema.json').read_text())
        anatomy = schema['$defs']['anatomyDepiction']
        self.assertFalse(anatomy['additionalProperties'])
        self.assertIn('placement_basis', anatomy['required'])
        self.assertNotIn('properties', anatomy['properties'])
        self.assertNotIn('product_ref', anatomy['properties'])
        self.assertNotIn('children', anatomy['properties'])

    def test_product_ref_schema_is_exact_revision(self):
        schema = json.loads((REPO/'content/RSCs/reference_system.schema.json').read_text())
        product_ref = schema['$defs']['productRef']
        self.assertEqual(['id', 'revision'], product_ref['required'])
        self.assertEqual(1, product_ref['properties']['revision']['minimum'])
        self.assertFalse(product_ref['additionalProperties'])

    def test_duplicate_anatomy_and_product_conflict_are_errors(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp); rsc=root/'content/RSCs'; products=root/'content/products'; docs=root/'docs'
            rsc.mkdir(parents=True); products.mkdir(parents=True); docs.mkdir()
            for name in ('reference_system.schema.json','reference_system.schema.v1.2.0.json','reference_system.schema.v1.3.0.json'):
                (rsc/name).write_bytes((REPO/'content/RSCs'/name).read_bytes())
            (products/'product.schema.json').write_bytes((REPO/'content/products/product.schema.json').read_bytes())
            (docs/'Organizational_Content_Inventory.md').write_bytes((REPO/'docs/Organizational_Content_Inventory.md').read_bytes())
            prod={
              'schema_version':'1.0.0','product':{'id':'example-gpu','revision':1,'record_level':'model','name':'Example GPU','entity_type':'gpu','identity':{'manufacturer':'Example','model':'G1'},'summary':'Example product','properties':{},'source_ids':['p-src']},
              'sources':[{'id':'p-src','title':'Example','publisher':'Example','url':'https://example.invalid/product','accessed':'2026-09-07'}]
            }
            (products/'example-gpu.yaml').write_text(yaml.safe_dump(prod,sort_keys=False))
            (products/'manifest.yaml').write_text(yaml.safe_dump({'schema_version':'1.0.0','products':[{'id':'example-gpu','revision':1,'file':'example-gpu.yaml'}]},sort_keys=False))
            template=yaml.safe_load((REPO/'content/RSCs/reference_system.template.yaml').read_text())
            template['reference_system']['id']='test-system'; template['configurations'][0]['id']='test-config'
            root_entity=template['configurations'][0]['hierarchy']['root']
            gpu=root_entity['children'][0]['children'][0]['children'][0]
            gpu['product_ref']={'id':'example-gpu','revision':1}
            gpu['product_identity']={'manufacturer':'Different','model':'G2'}
            root_entity['anatomy']=[
              {'id':'dup','label':'Power-supply assembly','inventory':{'category':'Server-level hardware','item':'Power supplies','status':'existing'},'evidence':{'status':'documented','source_ids':['example-source']},'depiction_kind':'power','placement_basis':'schematic'},
              {'id':'dup','label':'Fan assembly','inventory':{'category':'Server-level hardware','item':'Fans','status':'existing'},'evidence':{'status':'documented','source_ids':['example-source']},'depiction_kind':'cooling','placement_basis':'schematic'}
            ]
            (rsc/'test.yaml').write_text(yaml.safe_dump(template,sort_keys=False))
            old=(mod.ROOT,mod.RSC,mod.PRODUCTS,mod.INVENTORY,mod.SCHEMA_BY_VERSION)
            try:
                mod.ROOT=root; mod.RSC=rsc; mod.PRODUCTS=products; mod.INVENTORY=docs/'Organizational_Content_Inventory.md'
                mod.SCHEMA_BY_VERSION={'1.2.0':rsc/'reference_system.schema.v1.2.0.json','1.3.0':rsc/'reference_system.schema.v1.3.0.json','1.4.0':rsc/'reference_system.schema.json'}
                errors,_=mod.validate_repo()
            finally:
                mod.ROOT,mod.RSC,mod.PRODUCTS,mod.INVENTORY,mod.SCHEMA_BY_VERSION=old
            self.assertTrue(any('duplicate anatomy depiction id dup' in e for e in errors), errors)
            self.assertTrue(any('inline product_identity conflicts with product_ref' in e for e in errors), errors)

if __name__=='__main__': unittest.main()
