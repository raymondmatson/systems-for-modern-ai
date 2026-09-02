import {describe, expect, it} from 'vitest';
import type {
  AppState,
  CapabilityRegistry,
  Configuration,
  PropertyRegistry,
  RuntimeConcept,
} from '../../src/domain/types';
import {buildDetailVM} from '../../src/view-model/detail';
import {buildExploreScene} from '../../src/view-model/explore';

const configuration: Configuration = {
  id: 'cfg',
  name: 'Fixture',
  status: 'baseline',
  rootEntityId: 'root',
  defaultScenarioId: 'baseline',
  scopeNotes: '',
  modelingNotes: [],
  entities: {
    root: entity('root', 'System', 'compute_cluster', 1, undefined, ['rack-a', 'fabric', 'orphan']),
    'rack-a': entity('rack-a', 'Rack A', 'rack', 2, 'root', ['node-bank']),
    fabric: entity('fabric', 'Backend Fabric', 'network_fabric', 2, 'root', ['switch']),
    'node-bank': {
      ...entity('node-bank', 'Compute nodes', 'compute_node', 3, 'rack-a', ['gpu']),
      representation: 'aggregate',
      population: {
        count: {form: 'scalar', basis: 'documented_fixed', value: '32'},
        expansionMode: 'representative_member',
        individuallyAddressable: false,
        memberEntityType: 'compute_node',
      },
      properties: {
        quantity: {
          status: 'known',
          value: {form: 'scalar', number: '32'},
          basis: 'documented',
          scope: 'per_configuration',
          evidence: {status: 'documented', sourceIds: ['source-a']},
        },
      },
    },
    gpu: entity('gpu', 'H100 GPU', 'gpu', 4, 'node-bank', []),
    switch: entity('switch', 'Fabric switch', 'network_switch', 3, 'fabric', []),
    orphan: entity('orphan', 'Unconnected device', 'gpu', 4, 'root', []),
  },
  connections: {
    'backend-path': {
      id: 'backend-path',
      name: 'Backend accelerator path',
      relationshipType: 'data_communication_path',
      endpointIds: ['gpu', 'switch', 'fabric'],
      directionality: 'bidirectional',
      evidence: {status: 'documented', sourceIds: ['source-a']},
      properties: {},
    },
  },
  conceptOccurrences: [
    {conceptId: 'hbm', role: 'embodies', target: {type: 'entity', id: 'node-bank'}},
  ],
  scenarios: {
    baseline: {
      id: 'baseline',
      name: 'Baseline',
      description: 'Baseline',
      isDefault: true,
      scenarioTypes: ['baseline'],
      effects: [{target: {type: 'entity', id: 'node-bank'}, state: {health: 'degraded'}}],
    },
  },
};

function entity(
  id: string,
  name: string,
  entityType: string,
  exploreTier: number,
  parentId?: string,
  childIds: string[] = [],
) {
  return {
    id,
    name,
    entityType,
    exploreTier,
    representation: 'explicit' as const,
    evidence: {status: 'documented', sourceIds: ['source-a']},
    inventory: {category: 'Physical infrastructure hierarchy', item: 'Compute clusters'},
    properties: {},
    childIds,
    parentId,
  };
}

const state: AppState = {
  view: 'explore',
  explore: {
    systemId: 'system',
    configurationId: 'cfg',
    scenarioId: 'baseline',
    structuralLocation: {kind: 'entity', systemId: 'system', configurationId: 'cfg', entityId: 'root'},
    structuralHistory: [{kind: 'entity', systemId: 'system', configurationId: 'cfg', entityId: 'root'}],
    detailVisible: true,
  },
  concepts: {query: '', browseHistory: []},
  appHistory: [{view: 'explore', locator: {kind: 'entity', systemId: 'system', configurationId: 'cfg', entityId: 'root'}}],
  historyIndex: 0,
};

const capabilities: CapabilityRegistry = {
  schema_version: '1.0.0',
  profiles: {
    structural_group: {detail_sections: ['overview', 'properties', 'containment', 'connections', 'concepts', 'evidence', 'actions'], scenario_state_categories: [], structural_role: 'group'},
    device: {detail_sections: ['overview', 'properties', 'scenario', 'connections', 'concepts', 'evidence', 'actions'], scenario_state_categories: [], structural_role: 'device'},
  },
  entity_types: [
    {entity_type: 'compute_node', profile: 'structural_group', selectable: true, inspectable: true, enterability: 'contextual', supports_concepts: true},
    {entity_type: 'gpu', profile: 'device', selectable: true, inspectable: true, enterability: 'contextual', supports_concepts: true},
  ],
};

const propertyRegistry: PropertyRegistry = {
  schema_version: '1.0.0',
  properties: {quantity: {id: 'quantity', name: 'Quantity', value_kind: 'number'}},
};

const concepts: Record<string, RuntimeConcept> = {
  hbm: {schema_version: '1.0.0', concept_id: 'hbm', name: 'HBM', concept_kind: 'technology', summary: '', content_file: 'hbm.md', markdown: ''},
};

describe('Explore and Detail view models', () => {
  it('projects deep cross-tier endpoints to visible structural branches without dropping n-ary identity', () => {
    const scene = buildExploreScene(state, configuration);
    expect(scene.connections).toHaveLength(1);
    expect(scene.connections[0]?.endpointNodeIds).toEqual(['rack-a', 'fabric']);
    expect(scene.connections[0]?.endpointLabels).toEqual(['H100 GPU', 'Fabric switch', 'Backend Fabric']);
    expect(scene.connections[0]?.aggregated).toBe(true);
    expect(scene.nodes.find((node) => node.entity.id === 'rack-a')?.scenarioEmphasized).toBe(true);
  });

  it('uses structured population, property semantics, concept names, and capability-driven actions in Detail', () => {
    const selectedState: AppState = {
      ...state,
      explore: {
        ...state.explore,
        selection: {kind: 'entity', systemId: 'system', configurationId: 'cfg', entityId: 'node-bank'},
      },
    };
    const detail = buildDetailVM(selectedState, configuration, {capabilities, propertyRegistry, concepts});
    expect(detail.containment).toContainEqual(['Count basis', 'Documented fixed']);
    expect(detail.properties[0]?.metadata).toContain('Scope: Per configuration');
    expect(detail.concepts[0]?.name).toBe('HBM');
    expect(detail.actions.some((action) => action.label === 'Explore representative member')).toBe(true);
  });

  it('keeps aggregate Scenario state conservative inside Representative Member Contexts', () => {
    const representativeState: AppState = {
      ...state,
      explore: {
        ...state.explore,
        structuralLocation: {
          kind: 'representative_member',
          systemId: 'system',
          configurationId: 'cfg',
          aggregateId: 'node-bank',
          path: ['node-bank', 'gpu'],
        },
      },
    };
    const detail = buildDetailVM(representativeState, configuration, {capabilities, propertyRegistry, concepts});
    expect(detail.scenarioState).toContainEqual(['Parent aggregate Health', 'Degraded']);
    expect(detail.scenarioState).toContainEqual(['Representative member', 'Individual state not specified']);
  });

  it('does not expose Enter for a leaf with no deeper structure or architectural relationship', () => {
    const selectedState: AppState = {
      ...state,
      explore: {
        ...state.explore,
        selection: {kind: 'entity', systemId: 'system', configurationId: 'cfg', entityId: 'orphan'},
      },
    };
    const detail = buildDetailVM(selectedState, configuration, {capabilities, propertyRegistry, concepts});
    expect(detail.actions.some((action) => action.kind === 'enter')).toBe(false);
  });
});
