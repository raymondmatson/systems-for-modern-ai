export type VisualRole =
  | 'compute'
  | 'memory'
  | 'network'
  | 'storage'
  | 'power'
  | 'cooling'
  | 'management'
  | 'io_interconnect'
  | 'structure'
  | 'neutral_support';

export type StructuralShellFamily =
  | 'system-domain'
  | 'rack-enclosure'
  | 'assembly'
  | 'device'
  | 'fabric-domain'
  | 'support';

/**
 * Presentation-only mapping frozen by the Phase 0 visual-design contract.
 * `entity_type` is the only input. Inventory labels and entity names must not
 * become rendering-behavior switches.
 */
const visualRoleByEntityType: Record<string, VisualRole> = {
  accelerator_die: 'compute',
  ai_accelerator: 'compute',
  apu: 'compute',
  collective_engine: 'io_interconnect',
  compute_assembly: 'compute',
  compute_cluster: 'compute',
  compute_core: 'compute',
  compute_group: 'compute',
  compute_node: 'compute',
  compute_tray: 'compute',
  cooling_system: 'cooling',
  cpu: 'compute',
  cpu_die: 'compute',
  dma_engine: 'io_interconnect',
  dpu: 'io_interconnect',
  fabric_appliance: 'network',
  gpu: 'compute',
  hbm: 'memory',
  hpc_ai_system: 'compute',
  inference_system: 'compute',
  local_storage: 'storage',
  management_node: 'management',
  memory_appliance: 'memory',
  network_fabric: 'network',
  network_switch: 'network',
  nic: 'io_interconnect',
  on_chip_memory: 'memory',
  optical_network: 'network',
  pod_group: 'structure',
  power_system: 'power',
  preprocess_server: 'compute',
  rack: 'structure',
  rack_group: 'structure',
  rack_scale_system: 'structure',
  rack_topology_domain: 'structure',
  scale_up_switch: 'network',
  smartnic: 'io_interconnect',
  sparse_core: 'compute',
  storage_group: 'storage',
  storage_server: 'storage',
  storage_system: 'storage',
  switch_asic: 'network',
  switch_tray: 'network',
  system_memory: 'memory',
  tensor_core: 'compute',
  topology_group: 'network',
  tpu: 'compute',
};

const shellFamilyByEntityType: Record<string, StructuralShellFamily> = {
  compute_cluster: 'system-domain',
  compute_group: 'system-domain',
  hpc_ai_system: 'system-domain',
  inference_system: 'system-domain',
  pod_group: 'system-domain',
  storage_group: 'system-domain',

  rack: 'rack-enclosure',
  rack_group: 'rack-enclosure',
  rack_scale_system: 'rack-enclosure',

  network_fabric: 'fabric-domain',
  optical_network: 'fabric-domain',
  rack_topology_domain: 'fabric-domain',
  topology_group: 'fabric-domain',

  compute_assembly: 'assembly',
  compute_node: 'assembly',
  compute_tray: 'assembly',
  switch_tray: 'assembly',
  wafer_scale_system: 'assembly',

  cooling_system: 'support',
  management_node: 'support',
  memory_appliance: 'support',
  power_system: 'support',
  preprocess_server: 'support',
  storage_server: 'support',
  storage_system: 'support',

  accelerator_die: 'device',
  ai_accelerator: 'device',
  apu: 'device',
  collective_engine: 'device',
  compute_core: 'device',
  cpu: 'device',
  cpu_die: 'device',
  dma_engine: 'device',
  dpu: 'device',
  fabric_appliance: 'device',
  gpu: 'device',
  hbm: 'device',
  local_storage: 'device',
  network_switch: 'device',
  nic: 'device',
  on_chip_memory: 'device',
  scale_up_switch: 'device',
  smartnic: 'device',
  sparse_core: 'device',
  switch_asic: 'device',
  system_memory: 'device',
  tensor_core: 'device',
  tpu: 'device',
};

const visualRoleLabels: Record<VisualRole, string> = {
  compute: 'Compute',
  memory: 'Memory',
  network: 'Network',
  storage: 'Storage',
  power: 'Power',
  cooling: 'Cooling',
  management: 'Management',
  io_interconnect: 'I/O / interconnect',
  structure: 'Structure',
  neutral_support: 'Support',
};

export function visualRoleForEntityType(entityType: string): VisualRole {
  return visualRoleByEntityType[entityType] ?? 'neutral_support';
}

export function structuralShellFamilyForEntityType(entityType: string): StructuralShellFamily {
  return shellFamilyByEntityType[entityType] ?? 'support';
}

export function visualRoleLabel(role: VisualRole): string {
  return visualRoleLabels[role];
}

export const VISUAL_ROLE_MAP = Object.freeze({...visualRoleByEntityType});
export const VISUAL_ROLE_FALLBACK: VisualRole = 'neutral_support';
