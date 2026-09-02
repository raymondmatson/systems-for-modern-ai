import {describe,expect,it} from 'vitest';
import Decimal from 'decimal.js';
import manifest from '../../runtime/generated/manifest.json';
import h100 from '../../runtime/generated/systems/nvidia-dgx-h100-superpod.json';
describe('generated runtime contracts',()=>{
 it('ships exactly the approved initial five in the initial experience',()=>{expect(manifest.initialSystemIds).toEqual(['nvidia-dgx-h100-superpod','nvidia-dgx-gb300-nvl72-superpod','google-tpu7x-ironwood','cerebras-cs3-condor-galaxy3','meta-h100-roce-24k']);expect(manifest.defaultSystemId).toBe('nvidia-dgx-h100-superpod')});
 it('uses normalized population keys and string decimal magnitudes',()=>{const cfg=Object.values(h100.configurations)[0] as any;const gpu=cfg.entities['h100-gpus'];expect(gpu.population.expansionMode).toBe('representative_member');expect(gpu.population.expansion_mode).toBeUndefined();expect(typeof gpu.properties.aggregate_hbm_gb.value.number).toBe('string');expect(new Decimal(gpu.properties.aggregate_hbm_gb.value.number).equals(640)).toBe(true)})
});
