#!/usr/bin/env python3
from decimal import Decimal
from pathlib import Path
import json
ROOT=Path(__file__).resolve().parents[2];p=ROOT/'tests/fixtures/property-conformance.json';fixtures=json.loads(p.read_text());errors=[]
for f in fixtures:
 n=Decimal(f['number']);factor=Decimal(f['factor']);got=str(n*factor)
 if Decimal(got)!=Decimal(f['expected']):errors.append(f"{f['id']}: {got} != {f['expected']}")
print(f'PROPERTY FIXTURES: passed={len(fixtures)-len(errors)}/{len(fixtures)}')
for e in errors:print('  -',e)
raise SystemExit(1 if errors else 0)
