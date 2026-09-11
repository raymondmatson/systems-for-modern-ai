import {describe, expect, it} from 'vitest';

import type {AppState, Configuration, ContextLocator, Entity} from '../../src/domain/types';
import {buildExploreScene} from '../../src/view-model/explore';
import {layoutForContext} from '../../src/view-model/layout';
import h100 from '../../runtime/generated/systems/nvidia-dgx-h100-superpod.json';
import gb300 from '../../runtime/generated/systems/nvidia-dgx-gb300-nvl72-superpod.json';
import meta from '../../runtime/generated/systems/meta-h100-roce-24k.json';
import ironwood from '../../runtime/generated/systems/google-tpu7x-ironwood.json';
import cerebras from '../../runtime/generated/systems/cerebras-cs3-condor-galaxy3.json';

function stateFor(
  systemId: string,
  configurationId: string,
  scenarioId: string,
  structuralLocation: ContextLocator,
): AppState {
  return {
    view: 'explore',
    explore: {
      systemId,
      configurationId,
      scenarioId,
      structuralLocation,
      structuralHistory: [structuralLocation],
      detailVisible: true,
    },
    concepts: {query: '', browseHistory: []},
    appHistory: [{view: 'explore', locator: structuralLocation}],
    historyIndex: 0,
  };
}

function config(system: any, id: string): Configuration {
  return system.configurations[id] as Configuration;
}

function overlaps(a: {x:number;y:number;width:number;height:number}, b: {x:number;y:number;width:number;height:number}) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

function rootScene(system: any, configurationId: string) {
  const configuration = config(system, configurationId);
  const location: ContextLocator = {
    kind: 'entity',
    systemId: system.id,
    configurationId,
    entityId: configuration.rootEntityId,
  };
  return buildExploreScene(
    stateFor(system.id, configurationId, configuration.defaultScenarioId, location),
    configuration,
  );
}

describe('Phase 3 deterministic composition, density fit, and integrated anatomy', () => {
  it('integrates H100 anatomy inside a distinct support region without competing with semantic children', () => {
    const configuration = config(h100, 'h100-superpod-4su-reference');
    const location: ContextLocator = {
      kind: 'representative_member',
      systemId: h100.id,
      configurationId: configuration.id,
      aggregateId: 'dgx-h100-node',
      path: ['dgx-h100-node'],
    };
    const scene = buildExploreScene(
      stateFor(h100.id, configuration.id, 'baseline-normal-operation', location),
      configuration,
    );

    expect(scene.enclosure?.arrangementNotice).toContain('positions are not literal');
    expect(scene.anatomyDepictions).toHaveLength(4);
    const anatomyRegion = scene.compositionRegions.find((region) => region.kind === 'anatomy-support');
    expect(anatomyRegion?.label).toBe('Physical anatomy · noninteractive');
    for (const anatomy of scene.anatomyDepictions) {
      expect(anatomy.x).toBeGreaterThanOrEqual(scene.enclosure!.interior.x);
      expect(anatomy.y).toBeGreaterThanOrEqual(scene.enclosure!.interior.y);
      expect(anatomy.x + anatomy.width).toBeLessThanOrEqual(scene.enclosure!.x + scene.enclosure!.width);
      expect(anatomy.y + anatomy.height).toBeLessThanOrEqual(scene.enclosure!.y + scene.enclosure!.height);
      expect(anatomy.showPlacementBadge).toBe(false);
      expect(scene.nodes.some((node) => overlaps(node, anatomy))).toBe(false);
    }
    expect(scene.nodes.every((node) => node.mediaMode === 'compact')).toBe(true);
    expect(scene.nodes.every((node) => node.labelTruncated === false)).toBe(true);
    expect(scene.nodes.find((node) => node.entity.id === 'h100-storage-cx7')?.labelLines.join(' '))
      .toContain('Ethernet cards');
  });

  it('uses nonliteral GB300 rack population bands and a separate anatomy-support zone', () => {
    const configuration = config(gb300, 'gb300-nvl72-superpod-reference');
    const location: ContextLocator = {
      kind: 'entity',
      systemId: gb300.id,
      configurationId: configuration.id,
      entityId: 'gb300-nvl72-rack',
    };
    const scene = buildExploreScene(
      stateFor(gb300.id, configuration.id, 'baseline-normal-operation', location),
      configuration,
    );

    const rackBands = scene.compositionRegions.filter((region) => region.kind === 'rack-population');
    expect(rackBands).toHaveLength(2);
    expect(rackBands.map((region) => region.id)).toEqual([
      'rack-compute-population',
      'rack-network-population',
    ]);
    expect(rackBands.every((region) => region.nonliteral)).toBe(true);
    expect(scene.enclosure?.arrangementNotice).toContain('population bands and anatomy positions are nonliteral');
    expect(scene.anatomyDepictions).toHaveLength(1);
    expect(scene.compositionRegions.filter((region) => region.kind === 'anatomy-support')).toHaveLength(1);
    expect(scene.nodes.some((node) => overlaps(node, scene.anatomyDepictions[0]!))).toBe(false);
  });

  it('keeps Meta, Ironwood, and Cerebras root labels readable with deterministic media fallback', () => {
    const scenes = [
      rootScene(meta, 'meta-24576-h100-roce'),
      rootScene(ironwood, 'tpu7x-9216-chip-superpod'),
      rootScene(cerebras, 'condor-galaxy-3-64-cs3'),
    ];
    for (const scene of scenes) {
      expect(scene.nodes.every((node) => node.labelTruncated === false)).toBe(true);
      expect(scene.nodes.every((node) => ['full', 'compact'].includes(node.mediaMode))).toBe(true);
      expect(scene.nodes.every((node) => node.x >= scene.enclosure!.interior.x)).toBe(true);
    }
    expect(scenes[2]!.nodes.find((node) => node.entity.name.startsWith('MemoryX'))?.mediaMode).toBe('compact');
  });

  it('compacts terminal Anatomy-only contexts without inventing physical placement', () => {
    const current: Entity = {
      id: 'terminal-anatomy-device',
      name: 'Terminal anatomy device',
      entityType: 'nic',
      exploreTier: 3,
      representation: 'explicit',
      evidence: {status: 'documented', sourceIds: ['fixture']},
      inventory: {category: 'fixture', item: 'fixture'},
      properties: {},
      childIds: [],
      anatomyDepictions: [{
        id: 'terminal-port-bank',
        label: 'Port bank',
        inventory: {category: 'fixture', item: 'port bank'},
        evidence: {status: 'documented', sourceIds: ['fixture']},
        depictionKind: 'io',
        placementBasis: 'schematic',
      }],
    };
    const layout = layoutForContext(current, []);
    expect(layout.nodes).toHaveLength(0);
    expect(layout.regions.filter((region) => region.kind === 'semantic-content')).toHaveLength(0);
    expect(layout.anatomy).toHaveLength(1);
    expect(layout.enclosure.arrangementNotice).toContain('positions are not literal');
    expect(layout.anatomy[0]!.y - layout.enclosure.interior.y).toBeLessThan(90);
    expect(layout.height).toBeLessThan(360);
  });

  it('keeps documented placement distinct and synthetic without adding canonical coordinates', () => {
    const current: Entity = {
      id: 'fixture-device',
      name: 'Fixture device',
      entityType: 'gpu',
      exploreTier: 3,
      representation: 'explicit',
      evidence: {status: 'documented', sourceIds: ['fixture']},
      inventory: {category: 'fixture', item: 'fixture'},
      properties: {},
      childIds: [],
      anatomyDepictions: [{
        id: 'documented-placement-fixture',
        label: 'Documented placement fixture',
        inventory: {category: 'fixture', item: 'fixture'},
        evidence: {status: 'documented', sourceIds: ['fixture']},
        depictionKind: 'structural',
        placementBasis: 'documented',
      }],
    };
    const layout = layoutForContext(current, []);
    expect(layout.anatomy).toHaveLength(1);
    expect(layout.enclosure.arrangementNotice).toBeUndefined();
    expect(Object.keys(current.anatomyDepictions![0]!)).not.toContain('x');
    expect(Object.keys(current.anatomyDepictions![0]!)).not.toContain('y');

    const configuration: Configuration = {
      id: 'fixture-config',
      name: 'Fixture configuration',
      status: 'fixture',
      rootEntityId: current.id,
      defaultScenarioId: 'baseline',
      entities: {[current.id]: current},
      connections: {},
      conceptOccurrences: [],
      scenarios: {
        baseline: {
          id: 'baseline',
          name: 'Baseline',
          description: 'Fixture baseline',
          isDefault: true,
          scenarioTypes: ['baseline'],
          effects: [],
        },
      },
      scopeNotes: 'Synthetic Phase 3 placement fixture.',
      modelingNotes: [],
    };
    const location: ContextLocator = {
      kind: 'entity',
      systemId: 'fixture-system',
      configurationId: configuration.id,
      entityId: current.id,
    };
    const scene = buildExploreScene(
      stateFor('fixture-system', configuration.id, configuration.defaultScenarioId, location),
      configuration,
    );
    expect(scene.anatomyDepictions).toHaveLength(1);
    expect(scene.anatomyDepictions[0]?.placementLabel).toBe('Documented placement');
    expect(scene.anatomyDepictions[0]?.showPlacementBadge).toBe(true);
  });
});
