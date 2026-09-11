import {describe, expect, it} from 'vitest';

import type {AppState, Configuration, ContextLocator} from '../../src/domain/types';
import {
  CANONICAL_RELATIONSHIP_FAMILIES,
  buildBoundaryRoute,
  buildConnectionRoutes,
  connectionVisualFor,
  directionalityVisual,
} from '../../src/view-model/connectionVisuals';
import {buildExploreScene} from '../../src/view-model/explore';
import fixture from '../fixtures/visual-design-phase0.json';
import h100 from '../../runtime/generated/systems/nvidia-dgx-h100-superpod.json';
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

describe('Phase 4 typed Cross-Connection presentation', () => {
  it('maps all seven canonical relationship families with a non-color marker and stable base pattern', () => {
    expect(CANONICAL_RELATIONSHIP_FAMILIES).toEqual(
      fixture.relationshipCases.map((item) => item.relationshipType),
    );
    const visuals = CANONICAL_RELATIONSHIP_FAMILIES.map(connectionVisualFor);
    expect(visuals.every((visual) => visual.canonical)).toBe(true);
    expect(new Set(visuals.map((visual) => visual.marker)).size).toBe(7);
    expect(visuals.find((visual) => visual.relationshipType === 'physical_connectivity')?.dashArray).toBeUndefined();
    expect(visuals.filter((visual) => visual.relationshipType !== 'physical_connectivity').every((visual) => Boolean(visual.dashArray))).toBe(true);
    expect(connectionVisualFor('future_relation').canonical).toBe(false);
  });

  it('keeps authored directionality separate from relationship family', () => {
    expect(directionalityVisual('undirected')).toBe('none');
    expect(directionalityVisual('source_to_target')).toBe('forward');
    expect(directionalityVisual('bidirectional')).toBe('bidirectional');
    expect(directionalityVisual('unknown')).toBe('none');
  });

  it('renders n-ary relations as a trunk plus branches without a semantic hardware hub', () => {
    const nodes = [
      {id: 'a', x: 20, y: 80, width: 100, height: 60},
      {id: 'b', x: 180, y: 80, width: 100, height: 60},
      {id: 'c', x: 340, y: 80, width: 100, height: 60},
    ];
    const routes = buildConnectionRoutes(nodes, ['a', 'b', 'c'], 'source_to_target');
    expect(routes.filter((route) => route.trunk)).toHaveLength(1);
    expect(routes.filter((route) => !route.trunk)).toHaveLength(3);
    expect(routes.some((route) => route.id.includes('hub'))).toBe(false);
    expect(routes.filter((route) => route.arrowAtStart)).toHaveLength(2);
  });

  it('detours blocked binary relationships around unrelated component interiors', () => {
    const nodes = [
      {id: 'source', x: 20, y: 80, width: 100, height: 60},
      {id: 'blocker', x: 180, y: 80, width: 100, height: 60},
      {id: 'target', x: 340, y: 80, width: 100, height: 60},
    ];
    const route = buildConnectionRoutes(nodes, ['source', 'target'], 'undirected')[0]!;
    const blocker = nodes[1]!;
    const crosses = route.points.slice(1).some((point, index) => {
      const previous = route.points[index]!;
      if (previous.x === point.x) {
        return previous.x > blocker.x && previous.x < blocker.x + blocker.width
          && Math.max(previous.y, point.y) > blocker.y
          && Math.min(previous.y, point.y) < blocker.y + blocker.height;
      }
      if (previous.y === point.y) {
        return previous.y > blocker.y && previous.y < blocker.y + blocker.height
          && Math.max(previous.x, point.x) > blocker.x
          && Math.min(previous.x, point.x) < blocker.x + blocker.width;
      }
      return false;
    });
    expect(crosses).toBe(false);
  });

  it('uses side and row buses for multi-row n-ary relationships', () => {
    const nodes = [
      {id: 'a', x: 20, y: 80, width: 100, height: 60},
      {id: 'b', x: 180, y: 80, width: 100, height: 60},
      {id: 'c', x: 20, y: 220, width: 100, height: 60},
      {id: 'd', x: 180, y: 220, width: 100, height: 60},
    ];
    const routes = buildConnectionRoutes(nodes, ['a', 'b', 'c', 'd'], 'bidirectional');
    expect(routes.some((route) => route.id === 'side-trunk')).toBe(true);
    expect(routes.filter((route) => route.id.startsWith('row-trunk-'))).toHaveLength(2);
    expect(routes.filter((route) => route.id.startsWith('branch-'))).toHaveLength(4);
  });

  it('keeps enclosure-level boundary stubs in the gutter when no visible child endpoint exists', () => {
    const boundary = buildBoundaryRoute({
      connectionId: 'context-boundary',
      allNodes: [{id: 'child', x: 80, y: 100, width: 236, height: 112}],
      directionality: 'undirected',
      visibleEndpointIsSource: false,
      visibleEndpointIsTarget: false,
      enclosure: {x: 40, y: 20, width: 500, height: 340, headerHeight: 64},
      slotIndex: 0,
      slotCount: 1,
      externalEndpointLabels: ['External system'],
    });
    expect(boundary.visibleNodeId).toBeUndefined();
    expect(boundary.routes[0]!.points).toHaveLength(2);
    expect(Math.abs(boundary.boundaryPoint.x - boundary.routes[0]!.points[0]!.x)).toBe(14);
  });

  it('routes visible-child boundary continuations around unrelated sibling cards', () => {
    const nodes = [
      {id: 'source', x: 60, y: 100, width: 100, height: 60},
      {id: 'blocker', x: 190, y: 100, width: 100, height: 60},
    ];
    const boundary = buildBoundaryRoute({
      connectionId: 'visible-boundary',
      allNodes: nodes,
      visibleNodeId: 'source',
      directionality: 'source_to_target',
      visibleEndpointIsSource: true,
      visibleEndpointIsTarget: false,
      enclosure: {x: 40, y: 20, width: 520, height: 340, headerHeight: 64},
      slotIndex: 0,
      slotCount: 1,
      externalEndpointLabels: ['External system'],
    });
    const route = boundary.routes[0]!;
    const blocker = nodes[1]!;
    const crosses = route.points.slice(1).some((point, index) => {
      const previous = route.points[index]!;
      if (previous.x === point.x) {
        return previous.x > blocker.x && previous.x < blocker.x + blocker.width
          && Math.max(previous.y, point.y) > blocker.y
          && Math.min(previous.y, point.y) < blocker.y + blocker.height;
      }
      if (previous.y === point.y) {
        return previous.y > blocker.y && previous.y < blocker.y + blocker.height
          && Math.max(previous.x, point.x) > blocker.x
          && Math.min(previous.x, point.x) < blocker.x + blocker.width;
      }
      return false;
    });
    expect(crosses).toBe(false);
  });

  it('shows H100 true external relationships as boundary stubs while retaining local connection syntax', () => {
    const configuration = config(h100, 'h100-superpod-4su-reference');
    const location = fixture.pilotContexts[0]!.structuralLocation as ContextLocator;
    const scene = buildExploreScene(
      stateFor(h100.id, configuration.id, 'checkpoint-storage-pressure', location),
      configuration,
    );
    const boundary = [...scene.connections, ...scene.contextConnections].filter((connection) => connection.boundary);
    expect(boundary.map((connection) => connection.id).sort()).toEqual([
      'h100-inband-management-link',
      'h100-oob-management-link',
      'h100-scaleout-link',
      'h100-storage-fabric-link',
    ]);
    expect(boundary.every((connection) => connection.boundary!.externalEndpointLabels.length > 0)).toBe(true);
    expect(scene.connections.find((connection) => connection.id === 'h100-nvlink-domain')?.directionality).toBe('undirected');
    expect(scene.connections.find((connection) => connection.id === 'h100-nvlink-domain')?.routes.every((route) => !route.arrowAtStart && !route.arrowAtEnd)).toBe(true);
  });

  it('does not misclassify GB300 relationships collapsed inside the compute-tray aggregate as boundary crossings', () => {
    const configuration = config(gb300, 'gb300-nvl72-superpod-reference');
    const location = fixture.pilotContexts[1]!.structuralLocation as ContextLocator;
    const scene = buildExploreScene(
      stateFor(gb300.id, configuration.id, 'east-west-compute-plane-degradation', location),
      configuration,
    );
    const hostMemory = scene.contextConnections.find((connection) => connection.id === 'gb300-host-memory-path');
    expect(hostMemory?.visibility).toBe('summarized');
    expect(hostMemory?.boundary).toBeUndefined();
    const cooling = scene.contextConnections.find((connection) => connection.id === 'gb300-cooling-dependency');
    const coolingEndpoint = configuration.entities['gb300-cooling'];
    expect(coolingEndpoint?.entityType).toBe('cooling_system');
    expect(cooling?.visibility).toBe('boundary');
    expect(cooling?.boundary?.visibleNodeId).toBeUndefined();
    expect(cooling?.boundary?.externalEndpointLabels).toEqual([coolingEndpoint!.name]);
  });

  it('keeps Meta physical and data-path relations distinct while preserving bidirectional authored arrows', () => {
    const configuration = config(meta, 'meta-24576-h100-roce');
    const location = fixture.pilotContexts[2]!.structuralLocation as ContextLocator;
    const scene = buildExploreScene(
      stateFor(meta.id, configuration.id, 'checkpoint-storage-burst', location),
      configuration,
    );
    const physical = scene.connections.find((connection) => connection.id === 'meta-roce-link');
    const storage = scene.connections.find((connection) => connection.id === 'meta-storage-path');
    expect(physical?.visual.label).toBe('Physical connectivity');
    expect(storage?.visual.label).toBe('Data / communication path');
    expect(storage?.directionality).toBe('bidirectional');
    expect(storage?.routes.some((route) => route.arrowAtStart && route.arrowAtEnd)).toBe(true);
    expect(storage?.scenarioEmphasized).toBe(true);
    expect(storage?.visual.dashArray).toBe('12 4');

    const roce = scene.nodes.find((node) => node.entity.id === 'meta-roce-switches');
    expect(roce).toBeDefined();
    const routeCrossesRoce = storage?.routes.some((route) => route.points.slice(1).some((point, index) => {
      const previous = route.points[index]!;
      const left = roce!.x;
      const right = roce!.x + roce!.width;
      const top = roce!.y;
      const bottom = roce!.y + roce!.height;
      if (previous.x === point.x) {
        return previous.x > left && previous.x < right
          && Math.max(previous.y, point.y) > top
          && Math.min(previous.y, point.y) < bottom;
      }
      if (previous.y === point.y) {
        return previous.y > top && previous.y < bottom
          && Math.max(previous.x, point.x) > left
          && Math.min(previous.x, point.x) < right;
      }
      return false;
    }));
    expect(routeCrossesRoce).toBe(false);
  });
});
