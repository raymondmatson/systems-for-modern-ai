#!/usr/bin/env python3
from __future__ import annotations
import subprocess,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
cmds=[
 [sys.executable,str(ROOT/'content/RSCs/validate_configs.py')],
 [sys.executable,str(ROOT/'scripts/content/validate_products_anatomy.py')],
 [sys.executable,'-m','unittest','tests.content.test_products_anatomy','-v'],
 [sys.executable,str(ROOT/'content/concepts/validate_concepts.py')],
 [sys.executable,'-m','unittest','discover','-s',str(ROOT/'content/concepts/tests'),'-v'],
 [sys.executable,str(ROOT/'content/concepts/validate_concepts.py'),'--inventory',str(ROOT/'docs/Organizational_Content_Inventory.md'),'--reference-systems',str(ROOT/'content/RSCs')],
 [sys.executable,str(ROOT/'scripts/content/validate_v1.py')],
 [sys.executable,str(ROOT/'scripts/content/build_runtime.py'),'--check'],
 [sys.executable,str(ROOT/'scripts/content/validate_runtime.py')],
 [sys.executable,str(ROOT/'scripts/content/audit_branch_coverage.py')],
 [sys.executable,str(ROOT/'scripts/content/audit_physical_orientation.py')],
 [sys.executable,str(ROOT/'scripts/content/test_property_fixtures.py')],
 [sys.executable,str(ROOT/'scripts/content/readiness.py')],
]
for cmd in cmds:
 print('+',' '.join(cmd)); subprocess.run(cmd,check=True,cwd=ROOT)
print('PASS: all canonical/runtime validation commands succeeded')
