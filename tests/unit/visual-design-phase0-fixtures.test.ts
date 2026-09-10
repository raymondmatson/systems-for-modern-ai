import {describe, expect, it} from 'vitest';

import schema from '../../content/RSCs/reference_system.schema.json';
import capabilities from '../../runtime/generated/capabilities.json';
import h100 from '../../runtime/generated/systems/nvidia-dgx-h100-superpod.json';
import gb300 from '../../runtime/generated/systems/nvidia-dgx-gb300-nvl72-superpod.json';
import meta from '../../runtime/generated/systems/meta-h100-roce-24k.json';
import fixtureJson from '../fixtures/visual-design-phase0.json';

const fixture = fixtureJson as any;

const systems: Record<string, any> = {
  'nvidia-dgx-h100-superpod': h100,
  'nvidia-dgx-gb300-nvl72-superpod': gb300,
  'meta-h100-roce-24k': meta,
};

const sorted = (values: readonly string[]) => [...values].sort();

describe('Phase 0 visual-design fixtures', () => {
  it('freezes pilot contexts and exact validation Scenarios against generated runtime data', () => {
    for (const pilot of fixture.pilotContexts) {
      const system = systems[pilot.systemId];
      expect(system, `system ${pilot.systemId}`).toBeDefined();
      const configuration = system.configurations[pilot.configurationId];
      expect(configuration, `configuration ${pilot.configurationId}`).toBeDefined();

      const location = pilot.structuralLocation;
      if (location.kind === 'entity') {
        expect(configuration.entities[location.entityId], `entity ${location.entityId}`).toBeDefined();
      } else {
        const aggregate = configuration.entities[location.aggregateId];
        expect(aggregate, `aggregate ${location.aggregateId}`).toBeDefined();
        expect(aggregate.population?.expansionMode).toBe('representative_member');
        expect(location.path[0]).toBe(location.aggregateId);
      }

      for (const scenarioId of pilot.validationScenarios) {
        expect(configuration.scenarios[scenarioId], `scenario ${scenarioId}`).toBeDefined();
      }
      expect(pilot.validationScenarios).toContain(pilot.primaryScenarioId);
    }
  });

  it('covers the complete canonical Cross-Connection taxonomy and all authored directionality values', () => {
    const relationshipTypes = (schema as any).$defs.connection.properties.relationship_type.enum as string[];
    const directionality = (schema as any).$defs.connection.properties.directionality.enum as string[];

    expect(sorted(fixture.relationshipCases.map((item) => item.relationshipType))).toEqual(
      sorted(relationshipTypes),
    );
    expect(new Set(fixture.relationshipCases.map((item) => item.directionality))).toEqual(
      new Set(directionality),
    );
  });

  it('covers every contract-supported Expansion Mode without fabricating production addressable members', () => {
    const expansionModes = (schema as any).$defs.population.properties.expansion_mode.enum as string[];
    expect(sorted(fixture.expansionModeCases.map((item) => item.expansionMode))).toEqual(
      sorted(expansionModes),
    );

    const addressable = fixture.expansionModeCases.find(
      (item) => item.expansionMode === 'addressable_members',
    );
    expect(addressable?.syntheticOnly).toBe(true);
  });

  it('covers documented and simplified Anatomy evidence plus schematic and synthetic documented placement', () => {
    const evidenceStatuses = (schema as any).$defs.evidence.properties.status.enum as string[];
    const placementBases = (schema as any).$defs.anatomyDepiction.properties.placement_basis.enum as string[];
    const depictionKinds = (schema as any).$defs.anatomyDepiction.properties.depiction_kind.enum as string[];

    const depictions = fixture.anatomyCases.map((item) => item.depiction);
    expect(depictions.some((item) => item.evidence.status === 'documented')).toBe(true);
    expect(depictions.some((item) => item.evidence.status === 'simplified')).toBe(true);
    expect(sorted([...new Set<string>(depictions.map((item: any) => item.placementBasis as string))])).toEqual(
      sorted(placementBases),
    );

    for (const item of depictions) {
      expect(evidenceStatuses).toContain(item.evidence.status);
      expect(depictionKinds).toContain(item.depictionKind);
    }

    const documentedPlacement = fixture.anatomyCases.find(
      (item) => item.depiction.placementBasis === 'documented',
    );
    expect(documentedPlacement?.synthetic).toBe(true);
  });

  it('defines a total entity_type-to-visual-role map with an explicit neutral fallback', () => {
    const registeredEntityTypes = Object.keys((capabilities as any).entityTypes);
    const mappedEntityTypes = Object.keys(fixture.visualRoleMap);

    expect(sorted(mappedEntityTypes)).toEqual(sorted(registeredEntityTypes));
    expect(fixture.allowedVisualRoles).toContain(fixture.visualRoleFallback);
    expect(fixture.visualRoleFallback).toBe('neutral_support');
    expect(fixture.visualRoleFallbackFixture).toMatchObject({
      expectedVisualRole: 'neutral_support',
      synthetic: true,
    });
    expect(registeredEntityTypes).not.toContain(fixture.visualRoleFallbackFixture.entityType);

    for (const visualRole of Object.values(fixture.visualRoleMap) as string[]) {
      expect(fixture.allowedVisualRoles).toContain(visualRole);
    }
  });

  it('locks the pilot to presentation-only changes with no source-schema mutation', () => {
    expect(fixture.semanticBoundary).toMatchObject({
      requiresSourceSchemaChange: false,
      productionSemanticDataMutations: false,
      geometryIsPresentationOnly: true,
      anatomyRemainsNoninteractive: true,
      conceptDerivedTopologyInferenceAllowed: false,
    });
  });
});
