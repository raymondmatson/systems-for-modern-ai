import {describe, expect, it} from 'vitest';

import type {AppState, Configuration, ContextLocator} from '../../src/domain/types';
import {buildExploreScene} from '../../src/view-model/explore';
import fixture from '../fixtures/visual-regression-phase7.json';
import ironwood from '../../runtime/generated/systems/google-tpu7x-ironwood.json';
import cerebras from '../../runtime/generated/systems/cerebras-cs3-condor-galaxy3.json';

const systems: Record<string, any> = {
  'runtime/generated/systems/google-tpu7x-ironwood.json': ironwood,
  'runtime/generated/systems/cerebras-cs3-condor-galaxy3.json': cerebras,
};

function stateFor(item: (typeof fixture.scenes)[number]): AppState {
  const structuralLocation = item.structuralLocation as ContextLocator;
  return {
    view: 'explore',
    explore: {
      systemId: (structuralLocation as any).systemId,
      configurationId: item.configurationId,
      scenarioId: item.scenarioId,
      structuralLocation,
      structuralHistory: [structuralLocation],
      detailVisible: true,
    },
    concepts: {query: '', browseHistory: []},
    appHistory: [{view: 'explore', locator: structuralLocation}],
    historyIndex: 0,
  };
}

function sceneFor(id: string) {
  const item = fixture.scenes.find((candidate) => candidate.id === id);
  if (!item) throw new Error(`Missing Phase 7 fixture ${id}`);
  const system = systems[item.systemRuntime];
  if (!system) throw new Error(`Missing runtime ${item.systemRuntime}`);
  const configuration = system.configurations[item.configurationId] as Configuration;
  return {item, configuration, scene: buildExploreScene(stateFor(item), configuration)};
}

describe('Phase 7 Ironwood/Cerebras transfer contract', () => {
  it('derives one presentation-only flattened Ironwood 3D torus with paired wraparound portions', () => {
    const {configuration, scene} = sceneFor('ironwood-cube-flattened-torus');
    expect(scene.topologyDepictions).toHaveLength(1);
    const topology = scene.topologyDepictions[0]!;

    expect(topology.kind).toBe('flattened-3d-torus');
    expect(topology.sourceConceptId).toBe('torus');
    expect(topology.dimensions).toEqual(['A', 'B', 'C']);
    expect(topology.title).toContain('3D torus topology');
    expect(topology.accessibleDescription).toContain('two visually separated portions of one conceptual wraparound connection');
    expect(topology.wrapConnections).toHaveLength(3);

    for (const connection of topology.wrapConnections) {
      expect(connection.segments).toHaveLength(2);
      expect(connection.markers).toHaveLength(2);
      expect(new Set(connection.markers.map((marker) => marker.label)).size).toBe(1);
      expect(configuration.connections[connection.id]).toBeUndefined();
    }

    expect(scene.nodes.map((node) => node.entity.id)).toEqual(['ironwood-host']);
    expect(Object.values(configuration.connections)).not.toHaveLength(0);
  });

  it('keeps the flattened torus source-scoped rather than turning Concept occurrence into a generic renderer rule', () => {
    const {configuration, scene} = sceneFor('ironwood-root-transfer');
    expect(scene.topologyDepictions).toHaveLength(0);
    expect(configuration.conceptOccurrences.some((occurrence) => occurrence.conceptId === 'torus')).toBe(true);
  });

  it('compacts the known sparse transfer contexts without removing required boundary/anatomy space', () => {
    const ironwoodCube = sceneFor('ironwood-cube-flattened-torus').scene;
    const cs3 = sceneFor('cerebras-representative-cs3-transfer').scene;
    const wse3 = sceneFor('cerebras-representative-wse3-transfer').scene;

    const ironwoodNodeBottom = Math.max(...ironwoodCube.nodes.map((node) => node.y + node.height));
    const torusTop = ironwoodCube.topologyDepictions[0]!.bounds.y;
    expect(torusTop - ironwoodNodeBottom).toBeLessThan(90);

    const cs3NodeBottom = Math.max(...cs3.nodes.map((node) => node.y + node.height));
    const cs3AnatomyTop = Math.min(...cs3.anatomyDepictions.map((item) => item.y));
    expect(cs3AnatomyTop - cs3NodeBottom).toBeLessThan(100);
    expect(cs3.contextConnections.filter((connection) => connection.boundary).length).toBeGreaterThan(0);

    expect(wse3.height).toBeLessThan(320);
    expect(wse3.nodes.every((node) => node.labelTruncated === false)).toBe(true);
  });

  it('keeps WSE-3 900,000-core scale symbolic rather than materializing members', () => {
    const {scene} = sceneFor('cerebras-representative-wse3-transfer');
    expect(scene.nodes).toHaveLength(3);
    const cores = scene.nodes.find((node) => node.entity.id === 'cg3-ai-cores');
    expect(cores?.population?.countLabel).toBe('×900000');
    expect(cores?.population?.expansionLabel).toBe('aggregate');
    expect(scene.nodes.filter((node) => node.entity.entityType === 'compute_core')).toHaveLength(1);
  });

  it('keeps the transfer roots readable with their disaggregated architecture intact', () => {
    const ironwoodRoot = sceneFor('ironwood-root-transfer').scene;
    const cerebrasRoot = sceneFor('cerebras-root-transfer').scene;

    expect(ironwoodRoot.nodes.map((node) => node.entity.id)).toEqual([
      'ironwood-cube',
      'ironwood-ocs',
      'ironwood-dcn',
      'ironwood-cooling',
    ]);
    expect(ironwoodRoot.nodes.every((node) => node.labelTruncated === false)).toBe(true);

    expect(cerebrasRoot.nodes.map((node) => node.entity.id)).toEqual([
      'cg3-cs3',
      'cg3-swarmx',
      'cg3-memoryx',
      'cg3-input',
      'cg3-management',
    ]);
    expect(cerebrasRoot.nodes.every((node) => node.labelTruncated === false)).toBe(true);
    expect(cerebrasRoot.connections.some((connection) => connection.endpointNodeIds.length >= 3)).toBe(true);
  });
});
