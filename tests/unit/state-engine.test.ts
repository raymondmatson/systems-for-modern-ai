import {describe, expect, it} from 'vitest';
import type {ReferenceSystem} from '../../src/domain/types';
import {
  back,
  changeScenario,
  clearSelection,
  createInitialState,
  enter,
  forward,
  openConcept,
  openConceptDirect,
  openConceptsDirect,
  openExploreDirect,
  returnToOrigin,
  select,
  setConceptQuery,
  switchConfiguration,
  type DomainIndex,
} from '../../src/state/engine';

function system(id: string, configurationId: string): ReferenceSystem {
  return {
    id,
    name: id,
    summary: 'fixture',
    planningStatus: 'recommended_initial',
    sourceSchemaVersion: '1.3.0',
    configurations: {
      [configurationId]: {
        id: configurationId,
        name: configurationId,
        status: 'baseline',
        rootEntityId: 'root',
        defaultScenarioId: 'baseline',
        scopeNotes: 'fixture',
        modelingNotes: [],
        entities: {
          root: {
            id: 'root',
            name: 'Root',
            entityType: 'compute_cluster',
            exploreTier: 1,
            representation: 'explicit',
            evidence: {status: 'documented', sourceIds: []},
            inventory: {
              category: 'Physical infrastructure hierarchy',
              item: 'Compute clusters',
            },
            properties: {},
            childIds: ['node-bank', 'peer-bank'],
          },
          'node-bank': {
            id: 'node-bank',
            name: 'Nodes',
            entityType: 'compute_node',
            exploreTier: 3,
            representation: 'aggregate',
            evidence: {status: 'documented', sourceIds: []},
            inventory: {
              category: 'Physical infrastructure hierarchy',
              item: 'Servers / compute nodes',
            },
            properties: {},
            childIds: ['gpu-template'],
            parentId: 'root',
            population: {
              count: {form: 'scalar', basis: 'documented_fixed', value: '32'},
              expansionMode: 'representative_member',
              individuallyAddressable: false,
              memberEntityType: 'compute_node',
            },
          },
          'peer-bank': {
            id: 'peer-bank',
            name: 'Peer nodes',
            entityType: 'compute_node',
            exploreTier: 3,
            representation: 'aggregate',
            evidence: {status: 'documented', sourceIds: []},
            inventory: {
              category: 'Physical infrastructure hierarchy',
              item: 'Servers / compute nodes',
            },
            properties: {},
            childIds: [],
            parentId: 'root',
          },
          'gpu-template': {
            id: 'gpu-template',
            name: 'GPU template',
            entityType: 'gpu',
            exploreTier: 4,
            representation: 'aggregate',
            evidence: {status: 'documented', sourceIds: []},
            inventory: {category: 'Server-level hardware', item: 'GPUs'},
            properties: {},
            childIds: [],
            parentId: 'node-bank',
          },
        },
        connections: {},
        conceptOccurrences: [
          {
            conceptId: 'latency',
            role: 'illustrates',
            target: {type: 'entity', id: 'node-bank'},
          },
        ],
        scenarios: {
          baseline: {
            id: 'baseline',
            name: 'Baseline',
            description: 'baseline',
            isDefault: true,
            scenarioTypes: ['baseline'],
            effects: [],
          },
          degraded: {
            id: 'degraded',
            name: 'Degraded',
            description: 'degraded',
            isDefault: false,
            scenarioTypes: ['failure_degradation'],
            effects: [],
          },
        },
      },
    },
  };
}

const index: DomainIndex = {
  systems: {a: system('a', 'a-cfg'), b: system('b', 'b-cfg')},
};

describe('semantic state engine', () => {
  it('keeps Select persistent without navigation and Enter navigational', () => {
    let state = createInitialState(index, 'a');
    const location = state.explore.structuralLocation;
    const target = {
      kind: 'entity',
      systemId: 'a',
      configurationId: 'a-cfg',
      entityId: 'node-bank',
    } as const;
    state = select(state, target);
    expect(state.explore.structuralLocation).toEqual(location);
    expect(state.appHistory).toHaveLength(1);
    state = enter(index, state, target);
    expect(state.explore.structuralLocation).toEqual(target);
    expect(state.explore.selection).toBeUndefined();
    expect(state.explore.structuralHistory).toHaveLength(2);
    expect(state.appHistory).toHaveLength(2);
  });

  it('treats Enter of the current structural location as a no-op', () => {
    const state = createInitialState(index, 'a');
    const next = enter(index, state, state.explore.structuralLocation);
    expect(next).toBe(state);
    expect(next.appHistory).toHaveLength(1);
  });

  it('does not add scenario, query, or selection changes to history', () => {
    let state = createInitialState(index, 'a');
    state = changeScenario(index, state, 'degraded');
    state = setConceptQuery(state, 'latency');
    state = select(state, {
      kind: 'entity',
      systemId: 'a',
      configurationId: 'a-cfg',
      entityId: 'node-bank',
    });
    state = clearSelection(state);
    expect(state.appHistory).toHaveLength(1);
    expect(state.explore.scenarioId).toBe('degraded');
    expect(state.concepts.query).toBe('latency');
  });

  it('switches configuration to destination default and root while preserving active view', () => {
    let state = createInitialState(index, 'a');
    state = openConceptsDirect(state);
    state = openConceptDirect(state, 'latency');
    state = changeScenario(index, state, 'degraded');
    state = switchConfiguration(index, state, 'b', 'b-cfg');
    expect(state.view).toBe('concepts');
    expect(state.concepts.conceptId).toBe('latency');
    expect(state.explore.systemId).toBe('b');
    expect(state.explore.scenarioId).toBe('baseline');
    expect(state.explore.selection).toBeUndefined();
    expect(state.explore.structuralHistory).toHaveLength(1);
  });

  it('preserves semantic Return for Explore to Concept and through subsequent Concept browsing', () => {
    let state = createInitialState(index, 'a');
    const target = {
      kind: 'entity',
      systemId: 'a',
      configurationId: 'a-cfg',
      entityId: 'node-bank',
    } as const;
    state = select(state, target);
    state = openConcept(index, state, 'latency', target);
    expect(state.view).toBe('concepts');
    expect(state.returnContext?.kind).toBe('explore_origin');
    state = openConceptDirect(state, 'rdma');
    expect(state.returnContext?.kind).toBe('explore_origin');
    expect(state.concepts.browseHistory).toEqual(['latency', 'rdma']);
    state = returnToOrigin(index, state);
    expect(state.view).toBe('explore');
    expect(state.explore.selection).toEqual(target);
  });

  it('keeps Direct View Change distinct from explicit Return', () => {
    let state = createInitialState(index, 'a');
    const target = {
      kind: 'entity',
      systemId: 'a',
      configurationId: 'a-cfg',
      entityId: 'node-bank',
    } as const;
    state = select(state, target);
    state = openConcept(index, state, 'latency', target);
    const returnContext = state.returnContext;
    state = openExploreDirect(state);
    expect(state.view).toBe('explore');
    expect(state.returnContext).toEqual(returnContext);
    state = openConceptsDirect(state);
    expect(state.view).toBe('concepts');
    expect(state.concepts.conceptId).toBe('latency');
    expect(state.returnContext).toEqual(returnContext);
  });

  it('supports application Back and Forward independent of structural path', () => {
    let state = createInitialState(index, 'a');
    state = enter(index, state, {
      kind: 'entity',
      systemId: 'a',
      configurationId: 'a-cfg',
      entityId: 'node-bank',
    });
    state = openConcept(index, state, 'latency');
    state = back(index, state);
    expect(state.view).toBe('explore');
    state = forward(index, state);
    expect(state.view).toBe('concepts');
  });

  it('keeps representative member contexts typed and noncanonical', () => {
    let state = createInitialState(index, 'a');
    const representative = {
      kind: 'representative_member',
      systemId: 'a',
      configurationId: 'a-cfg',
      aggregateId: 'node-bank',
      path: ['node-bank'],
    } as const;
    state = enter(index, state, representative);
    expect(state.explore.structuralLocation).toEqual(representative);
    expect(state.explore.structuralHistory.at(-1)?.kind).toBe(
      'representative_member',
    );
  });

  it('direct view switching records application history without creating Return', () => {
    let state = createInitialState(index, 'a');
    state = openConceptsDirect(state);
    expect(state.returnContext).toBeUndefined();
    expect(state.concepts.conceptId).toBeUndefined();
    state = openConceptDirect(state, 'latency');
    state = openExploreDirect(state);
    expect(state.view).toBe('explore');
    expect(state.returnContext).toBeUndefined();
    expect(state.appHistory.at(-1)?.view).toBe('explore');
  });

  it('clears the Forward branch when new navigation follows Back', () => {
    let state = createInitialState(index, 'a');
    state = openConceptsDirect(state);
    state = openConceptDirect(state, 'latency');
    const oldLength = state.appHistory.length;
    state = back(index, state);
    state = openConceptDirect(state, 'rdma');
    expect(state.appHistory).toHaveLength(oldLength);
    expect(state.appHistory.at(-1)?.view).toBe('concepts');
    expect(state.appHistory.at(-1)?.locator).toEqual({kind: 'concept', conceptId: 'rdma'});
    expect(forward(index, state)).toBe(state);
  });
});
