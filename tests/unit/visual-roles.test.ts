import {describe, expect, it} from 'vitest';

import capabilities from '../../runtime/generated/capabilities.json';
import phase0Fixture from '../fixtures/visual-design-phase0.json';
import {
  VISUAL_ROLE_FALLBACK,
  VISUAL_ROLE_MAP,
  structuralShellFamilyForEntityType,
  visualRoleForEntityType,
} from '../../src/view-model/visualRoles';

const fixture = phase0Fixture as any;

const sorted = (values: readonly string[]) => [...values].sort();

describe('Phase 2 visual-role presentation mapping', () => {
  it('implements the Phase 0 entity_type mapping exactly and keeps a neutral fallback', () => {
    expect(VISUAL_ROLE_MAP).toEqual(fixture.visualRoleMap);
    expect(VISUAL_ROLE_FALLBACK).toBe(fixture.visualRoleFallback);
    expect(sorted(Object.keys(VISUAL_ROLE_MAP))).toEqual(
      sorted(Object.keys((capabilities as any).entityTypes)),
    );
    expect(visualRoleForEntityType('fixture-unknown-entity-type')).toBe('neutral_support');
  });

  it('derives structural shell families from entity_type with a conservative support fallback', () => {
    expect(structuralShellFamilyForEntityType('rack_scale_system')).toBe('rack-enclosure');
    expect(structuralShellFamilyForEntityType('rack_topology_domain')).toBe('fabric-domain');
    expect(structuralShellFamilyForEntityType('compute_node')).toBe('assembly');
    expect(structuralShellFamilyForEntityType('gpu')).toBe('device');
    expect(structuralShellFamilyForEntityType('storage_system')).toBe('support');
    expect(structuralShellFamilyForEntityType('fixture-unknown-entity-type')).toBe('support');
  });
});
