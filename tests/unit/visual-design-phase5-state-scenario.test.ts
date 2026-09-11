import {describe, expect, it} from 'vitest';

import type {AppState, Configuration, ContextLocator} from '../../src/domain/types';
import {buildExploreScene} from '../../src/view-model/explore';
import gb300 from '../../runtime/generated/systems/nvidia-dgx-gb300-nvl72-superpod.json';
import meta from '../../runtime/generated/systems/meta-h100-roce-24k.json';

function config(system: any, id: string): Configuration {
  return system.configurations[id] as Configuration;
}

function stateFor(
  systemId: string,
  configurationId: string,
  scenarioId: string,
  structuralLocation: ContextLocator,
  selection?: ContextLocator,
  preview?: ContextLocator,
): AppState {
  return {
    view: 'explore',
    explore: {
      systemId,
      configurationId,
      scenarioId,
      structuralLocation,
      structuralHistory: [structuralLocation],
      selection,
      preview,
      detailVisible: true,
    },
    concepts: {query: '', browseHistory: []},
    appHistory: [{view: 'explore', locator: structuralLocation}],
    historyIndex: 0,
  };
}

describe('Phase 5 orthogonal state and Scenario presentation', () => {
  it('projects selected + focused + Scenario-affected state without changing aggregate identity', () => {
    const configuration = config(gb300, 'gb300-nvl72-superpod-reference');
    const location: ContextLocator = {
      kind: 'entity',
      systemId: gb300.id,
      configurationId: configuration.id,
      entityId: 'gb300-nvl72-rack',
    };
    const computeLocator: ContextLocator = {
      kind: 'entity',
      systemId: gb300.id,
      configurationId: configuration.id,
      entityId: 'gb300-compute-trays',
    };
    const scene = buildExploreScene(
      stateFor(
        gb300.id,
        configuration.id,
        'north-south-storage-pressure',
        location,
        computeLocator,
        computeLocator,
      ),
      configuration,
    );
    const compute = scene.nodes.find((node) => node.entity.id === 'gb300-compute-trays');
    expect(compute?.selected).toBe(true);
    expect(compute?.previewed).toBe(true);
    expect(compute?.scenarioEmphasized).toBe(true);
    expect(compute?.population?.countLabel).toBe('×18');
    expect(compute?.entity.representation).toBe('aggregate');
  });

  it('keeps contains-Selection independent from Scenario emphasis', () => {
    const configuration = config(gb300, 'gb300-nvl72-superpod-reference');
    const location: ContextLocator = {
      kind: 'entity',
      systemId: gb300.id,
      configurationId: configuration.id,
      entityId: 'gb300-nvl72-rack',
    };
    const deepSelection: ContextLocator = {
      kind: 'entity',
      systemId: gb300.id,
      configurationId: configuration.id,
      entityId: 'gb300-bf3',
    };
    const scene = buildExploreScene(
      stateFor(
        gb300.id,
        configuration.id,
        'north-south-storage-pressure',
        location,
        deepSelection,
      ),
      configuration,
    );
    const compute = scene.nodes.find((node) => node.entity.id === 'gb300-compute-trays');
    expect(compute?.containsSelection).toBe(true);
    expect(compute?.selected).toBe(false);
    expect(compute?.scenarioEmphasized).toBe(true);
    expect(scene.enclosure?.containsSelection).toBe(true);
  });

  it('preserves base relationship syntax while a Scenario-affected connection is selected and Previewed', () => {
    const configuration = config(meta, 'meta-24576-h100-roce');
    const location: ContextLocator = {
      kind: 'entity',
      systemId: meta.id,
      configurationId: configuration.id,
      entityId: configuration.rootEntityId,
    };
    const connectionLocator: ContextLocator = {
      kind: 'connection',
      systemId: meta.id,
      configurationId: configuration.id,
      connectionId: 'meta-storage-path',
    };
    const scene = buildExploreScene(
      stateFor(
        meta.id,
        configuration.id,
        'checkpoint-storage-burst',
        location,
        connectionLocator,
        connectionLocator,
      ),
      configuration,
    );
    const storage = scene.connections.find((connection) => connection.id === 'meta-storage-path');
    expect(storage?.selected).toBe(true);
    expect(storage?.previewed).toBe(true);
    expect(storage?.scenarioEmphasized).toBe(true);
    expect(storage?.visual.label).toBe('Data / communication path');
    expect(storage?.visual.dashArray).toBe('12 4');
    expect(storage?.directionality).toBe('bidirectional');
  });

  it('builds concise authored Scenario context without inventing causes or structural changes', () => {
    const configuration = config(meta, 'meta-24576-h100-roce');
    const location: ContextLocator = {
      kind: 'entity',
      systemId: meta.id,
      configurationId: configuration.id,
      entityId: configuration.rootEntityId,
    };
    const scene = buildExploreScene(
      stateFor(meta.id, configuration.id, 'checkpoint-storage-burst', location),
      configuration,
    );
    expect(scene.scenario?.name).toBe('Checkpoint / storage burst');
    expect(scene.scenario?.description).toBe(configuration.scenarios['checkpoint-storage-burst']?.description);
    expect(scene.scenario?.affectedTargetLabels).toEqual([
      'Training cluster to storage',
      'YV3 Sierra Point storage servers',
    ]);
    expect(scene.scenario?.structureNotice).toBe('Physical structure unchanged');
  });

  it('states the representative-member caveat when the modeled parent aggregate is explicitly Scenario-affected', () => {
    const configuration = structuredClone(config(gb300, 'gb300-nvl72-superpod-reference'));
    configuration.scenarios['synthetic-representative-state'] = {
      id: 'synthetic-representative-state',
      name: 'Synthetic representative state',
      description: 'Synthetic contract-only Scenario for representative-state wording.',
      isDefault: false,
      scenarioTypes: ['fixture'],
      effects: [{
        target: {type: 'entity', id: 'gb300-compute-trays'},
        state: {health: 'degraded'},
      }],
    };
    const location: ContextLocator = {
      kind: 'representative_member',
      systemId: gb300.id,
      configurationId: configuration.id,
      aggregateId: 'gb300-compute-trays',
      path: ['gb300-compute-trays'],
    };
    const scene = buildExploreScene(
      stateFor(gb300.id, configuration.id, 'synthetic-representative-state', location),
      configuration,
    );
    expect(scene.scenario?.representativeCaveat).toContain('individual representative-member state is not specified');
    expect(scene.enclosure?.representative).toBe(true);
    expect(scene.enclosure?.scenarioEmphasized).toBe(true);
  });
});
