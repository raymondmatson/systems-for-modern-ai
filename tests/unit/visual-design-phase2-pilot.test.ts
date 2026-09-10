import {describe, expect, it} from 'vitest';

import type {AppState, Configuration, ContextLocator} from '../../src/domain/types';
import {buildExploreScene} from '../../src/view-model/explore';
import h100 from '../../runtime/generated/systems/nvidia-dgx-h100-superpod.json';
import gb300 from '../../runtime/generated/systems/nvidia-dgx-gb300-nvl72-superpod.json';

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

describe('Phase 2 H100 + GB300 pilot presentation', () => {
  it('builds a representative H100 node enclosure with role and population cues', () => {
    const configuration = config(h100, 'h100-superpod-4su-reference');
    const location: ContextLocator = {
      kind: 'representative_member',
      systemId: 'nvidia-dgx-h100-superpod',
      configurationId: configuration.id,
      aggregateId: 'dgx-h100-node',
      path: ['dgx-h100-node'],
    };
    const scene = buildExploreScene(
      stateFor('nvidia-dgx-h100-superpod', configuration.id, 'baseline-normal-operation', location),
      configuration,
    );

    expect(scene.enclosure).toMatchObject({
      representative: true,
      shellFamily: 'assembly',
      title: 'Representative Compute node',
    });
    expect(scene.enclosure?.contextLabel).toContain('exemplar from population ×32');

    const gpu = scene.nodes.find((node) => node.entity.id === 'h100-gpus');
    const memory = scene.nodes.find((node) => node.entity.id === 'h100-system-memory');
    const bmc = scene.nodes.find((node) => node.entity.id === 'h100-bmc');
    expect(gpu).toMatchObject({visualRole: 'compute', shellFamily: 'device'});
    expect(gpu?.population?.countLabel).toBe('×8');
    expect(memory?.visualRole).toBe('memory');
    expect(memory?.population?.countLabel).toBe('×32');
    expect(bmc?.visualRole).toBe('management');

    for (const node of scene.nodes) {
      expect(node.x).toBeGreaterThanOrEqual(scene.enclosure!.interior.x);
      expect(node.y).toBeGreaterThanOrEqual(scene.enclosure!.interior.y);
      expect(node.x + node.width).toBeLessThanOrEqual(scene.enclosure!.x + scene.enclosure!.width);
      expect(node.y + node.height).toBeLessThanOrEqual(scene.enclosure!.y + scene.enclosure!.height);
    }
  });

  it('renders GB300 rack children as distinct repeated populations inside a rack enclosure', () => {
    const configuration = config(gb300, 'gb300-nvl72-superpod-reference');
    const location: ContextLocator = {
      kind: 'entity',
      systemId: 'nvidia-dgx-gb300-nvl72-superpod',
      configurationId: configuration.id,
      entityId: 'gb300-nvl72-rack',
    };
    const scene = buildExploreScene(
      stateFor('nvidia-dgx-gb300-nvl72-superpod', configuration.id, 'baseline-normal-operation', location),
      configuration,
    );

    expect(scene.enclosure).toMatchObject({
      representative: false,
      shellFamily: 'rack-enclosure',
      title: 'GB300 NVL72 rack / scalable unit',
      contextLabel: 'Current structural location',
    });
    const compute = scene.nodes.find((node) => node.entity.id === 'gb300-compute-trays');
    const switches = scene.nodes.find((node) => node.entity.id === 'gb300-switch-trays');
    expect(compute).toMatchObject({visualRole: 'compute', shellFamily: 'assembly'});
    expect(compute?.population?.countLabel).toBe('×18');
    expect(switches).toMatchObject({visualRole: 'network', shellFamily: 'assembly'});
    expect(switches?.population?.countLabel).toBe('×9');
  });

  it('keeps the Phase 2 enclosure contract compatible with later integrated anatomy', () => {
    const configuration = config(h100, 'h100-superpod-4su-reference');
    const location: ContextLocator = {
      kind: 'representative_member',
      systemId: 'nvidia-dgx-h100-superpod',
      configurationId: configuration.id,
      aggregateId: 'dgx-h100-node',
      path: ['dgx-h100-node'],
    };
    const scene = buildExploreScene(
      stateFor('nvidia-dgx-h100-superpod', configuration.id, 'baseline-normal-operation', location),
      configuration,
    );
    expect(scene.anatomyDepictions.length).toBeGreaterThan(0);
    expect(scene.enclosure?.interior).toBeDefined();
    for (const item of scene.anatomyDepictions) {
      expect(item.x).toBeGreaterThanOrEqual(scene.enclosure!.interior.x);
      expect(item.y).toBeGreaterThanOrEqual(scene.enclosure!.interior.y);
    }
  });
});
