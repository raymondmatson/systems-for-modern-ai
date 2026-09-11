import {describe, expect, it} from 'vitest';

import type {AppState, Configuration, ContextLocator} from '../../src/domain/types';
import {buildExploreScene} from '../../src/view-model/explore';
import {svgLabelFit} from '../../src/view-model/labels';
import fixture from '../fixtures/visual-regression-phase5a.json';
import h100 from '../../runtime/generated/systems/nvidia-dgx-h100-superpod.json';
import gb300 from '../../runtime/generated/systems/nvidia-dgx-gb300-nvl72-superpod.json';
import meta from '../../runtime/generated/systems/meta-h100-roce-24k.json';

const systems: Record<string, any> = {
  'runtime/generated/systems/nvidia-dgx-h100-superpod.json': h100,
  'runtime/generated/systems/nvidia-dgx-gb300-nvl72-superpod.json': gb300,
  'runtime/generated/systems/meta-h100-roce-24k.json': meta,
};

function stateFor(scene: (typeof fixture.scenes)[number]): AppState {
  const structuralLocation = scene.structuralLocation as ContextLocator;
  return {
    view: 'explore',
    explore: {
      systemId: (structuralLocation as any).systemId,
      configurationId: scene.configurationId,
      scenarioId: scene.scenarioId,
      structuralLocation,
      structuralHistory: [structuralLocation],
      selection: scene.selection as ContextLocator | undefined,
      preview: scene.preview as ContextLocator | undefined,
      detailVisible: true,
    },
    concepts: {query: '', browseHistory: []},
    appHistory: [{view: 'explore', locator: structuralLocation}],
    historyIndex: 0,
  };
}

describe('Phase 5A integrated visual calibration contract', () => {
  it('keeps every approved pilot scene resolvable against current generated runtime', () => {
    for (const item of fixture.scenes) {
      const system = systems[item.systemRuntime];
      expect(system, item.id).toBeDefined();
      const configuration = system.configurations[item.configurationId] as Configuration;
      expect(configuration, item.id).toBeDefined();
      expect(configuration.scenarios[item.scenarioId], item.id).toBeDefined();

      const scene = buildExploreScene(stateFor(item), configuration);
      expect(scene.enclosure, item.id).toBeDefined();
      expect(scene.nodes.length + scene.anatomyDepictions.length, item.id).toBeGreaterThan(0);

      if (item.selection) {
        const selected = [scene.enclosure, ...scene.nodes, ...scene.connections, ...scene.contextConnections]
          .filter(Boolean)
          .some((candidate: any) => candidate.selected);
        expect(selected, `${item.id} selection`).toBe(true);
      }
      if (item.preview) {
        const previewed = [scene.enclosure, ...scene.nodes, ...scene.connections, ...scene.contextConnections]
          .filter(Boolean)
          .some((candidate: any) => candidate.previewed);
        expect(previewed, `${item.id} preview`).toBe(true);
      }
    }
  });

  it('keeps all current H100 and GB300 boundary destinations fully distinguishable in the calibrated two-line label fit', () => {
    for (const item of fixture.scenes.filter((candidate) => candidate.id.includes('h100-') || candidate.id.includes('gb300-'))) {
      const system = systems[item.systemRuntime];
      const configuration = system.configurations[item.configurationId] as Configuration;
      const scene = buildExploreScene(stateFor(item), configuration);
      const boundaryConnections = [...scene.connections, ...scene.contextConnections].filter((connection) => connection.boundary);
      for (const connection of boundaryConnections) {
        const externalLabel = connection.boundary!.externalEndpointLabels.join(' / ');
        const fit = svgLabelFit(externalLabel || 'External relationship', 28, 2);
        expect(fit.lines.length, `${item.id}: ${externalLabel}`).toBeLessThanOrEqual(2);
        expect(fit.truncated, `${item.id}: ${externalLabel}`).toBe(false);
      }
    }
  });

  it('freezes a bounded curated render matrix for Phase 6 rather than proliferating screenshots', () => {
    const sceneIds = new Set(fixture.scenes.map((scene) => scene.id));
    expect(fixture.renderVariants).toHaveLength(10);
    expect(fixture.renderVariants.every((variant) => sceneIds.has(variant.sceneId))).toBe(true);
    expect(fixture.renderVariants.some((variant) => variant.viewport.width === 390)).toBe(true);
    expect(fixture.renderVariants.some((variant) => variant.colorMode === 'grayscale')).toBe(true);
    expect(fixture.renderVariants.some((variant) => variant.colorMode === 'forced-colors')).toBe(true);
  });
});
