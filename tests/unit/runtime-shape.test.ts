import {describe, expect, it} from 'vitest';
import Decimal from 'decimal.js';

import type {CapabilityRegistry, PropertyRegistry, ReferenceSystem} from '../../src/domain/types';
import {createInitialState} from '../../src/state/engine';
import {buildDetailVM} from '../../src/view-model/detail';
import capabilities from '../../runtime/generated/capabilities.json';
import manifest from '../../runtime/generated/manifest.json';
import propertyRegistry from '../../runtime/generated/property-registry.json';
import h100 from '../../runtime/generated/systems/nvidia-dgx-h100-superpod.json';

describe('generated runtime contracts', () => {
  it('ships exactly the approved initial five in the initial experience', () => {
    expect(manifest.initialSystemIds).toEqual([
      'nvidia-dgx-h100-superpod',
      'nvidia-dgx-gb300-nvl72-superpod',
      'google-tpu7x-ironwood',
      'cerebras-cs3-condor-galaxy3',
      'meta-h100-roce-24k',
    ]);
    expect(manifest.defaultSystemId).toBe('nvidia-dgx-h100-superpod');
  });

  it('uses normalized population keys and string decimal magnitudes', () => {
    const cfg = Object.values(h100.configurations)[0] as any;
    const gpu = cfg.entities['h100-gpus'];
    expect(gpu.population.expansionMode).toBe('representative_member');
    expect(gpu.population.expansion_mode).toBeUndefined();
    expect(typeof gpu.properties.aggregate_hbm_gb.value.number).toBe('string');
    expect(new Decimal(gpu.properties.aggregate_hbm_gb.value.number).equals(640)).toBe(true);
  });

  it('feeds the generated capability registry directly into initial Detail rendering', () => {
    const system = h100 as unknown as ReferenceSystem;
    const state = createInitialState({systems: {[system.id]: system}}, system.id);
    const configuration = Object.values(system.configurations)[0]!;

    expect(() =>
      buildDetailVM(state, configuration, {
        capabilities: capabilities as CapabilityRegistry,
        propertyRegistry: propertyRegistry as PropertyRegistry,
        concepts: {},
      }),
    ).not.toThrow();

    expect((capabilities as CapabilityRegistry).entityTypes.compute_cluster.entityType).toBe(
      'compute_cluster',
    );
  });
});
