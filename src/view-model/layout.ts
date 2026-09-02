import type {Entity} from '../domain/types';

export interface LayoutNode {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface LayoutResult {
  nodes: LayoutNode[];
  width: number;
  height: number;
  kind: 'system' | 'rack' | 'assembly' | 'fabric' | 'internal' | 'generic';
}

const nodeWidth = 218;
const nodeHeight = 96;

function gridLayout(
  entities: Entity[],
  columns: number,
  kind: LayoutResult['kind'],
  rowGap = 136,
): LayoutResult {
  const cols = Math.max(1, Math.min(columns, entities.length || 1));
  const gap = 34;
  const left = 42;
  const top = 54;
  const nodes = entities.map((entity, index) => ({
    id: entity.id,
    x: left + (index % cols) * (nodeWidth + gap),
    y: top + Math.floor(index / cols) * rowGap,
    width: nodeWidth,
    height: nodeHeight,
  }));
  const rows = Math.max(1, Math.ceil(entities.length / cols));
  return {
    nodes,
    width: Math.max(760, left * 2 + cols * nodeWidth + (cols - 1) * gap),
    height: Math.max(430, top * 2 + rows * nodeHeight + (rows - 1) * (rowGap - nodeHeight)),
    kind,
  };
}


function systemLayout(entities: Entity[]): LayoutResult {
  const computeTypes = new Set([
    'compute_group',
    'pod_group',
    'rack',
    'rack_group',
    'rack_scale_system',
    'rack_topology_domain',
    'compute_node',
    'compute_assembly',
    'wafer_scale_system',
  ]);
  const fabricTypes = new Set([
    'network_fabric',
    'network_switch',
    'optical_network',
    'fabric_appliance',
    'scale_up_switch',
  ]);
  const supportTypes = new Set([
    'storage_system',
    'memory_appliance',
    'management_node',
    'cooling_system',
    'power_system',
  ]);
  const compute = entities.filter((entity) => computeTypes.has(entity.entityType));
  const fabrics = entities.filter((entity) => fabricTypes.has(entity.entityType));
  const support = entities.filter((entity) => supportTypes.has(entity.entityType));
  const other = entities.filter(
    (entity) => !compute.includes(entity) && !fabrics.includes(entity) && !support.includes(entity),
  );
  const rows = [compute, fabrics, [...support, ...other]].filter((row) => row.length > 0);
  const width = Math.max(
    820,
    ...rows.map((row) => 84 + row.length * nodeWidth + Math.max(0, row.length - 1) * 38),
  );
  const nodes: LayoutNode[] = [];
  rows.forEach((row, rowIndex) => {
    const total = row.length * nodeWidth + Math.max(0, row.length - 1) * 38;
    const start = Math.max(42, (width - total) / 2);
    row.forEach((entity, index) => {
      nodes.push({
        id: entity.id,
        x: start + index * (nodeWidth + 38),
        y: 48 + rowIndex * 148,
        width: nodeWidth,
        height: nodeHeight,
      });
    });
  });
  return {
    nodes,
    width,
    height: Math.max(430, 104 + rows.length * 148),
    kind: 'system',
  };
}

function rackLayout(entities: Entity[]): LayoutResult {
  const leftTypes = new Set(['compute_tray', 'compute_node', 'compute_assembly', 'ai_accelerator']);
  const rightTypes = new Set(['switch_tray', 'network_switch', 'network_fabric', 'storage_system']);
  const left = entities.filter((entity) => leftTypes.has(entity.entityType));
  const right = entities.filter((entity) => rightTypes.has(entity.entityType));
  const middle = entities.filter((entity) => !left.includes(entity) && !right.includes(entity));
  const lanes = [left, middle, right].filter((lane) => lane.length > 0);
  const gap = 40;
  const nodes: LayoutNode[] = [];
  lanes.forEach((lane, laneIndex) => {
    lane.forEach((entity, rowIndex) => {
      nodes.push({
        id: entity.id,
        x: 42 + laneIndex * (nodeWidth + gap),
        y: 48 + rowIndex * 118,
        width: nodeWidth,
        height: nodeHeight,
      });
    });
  });
  const maxRows = Math.max(1, ...lanes.map((lane) => lane.length));
  return {
    nodes,
    width: Math.max(760, 84 + lanes.length * nodeWidth + (lanes.length - 1) * gap),
    height: Math.max(460, 96 + maxRows * 118),
    kind: 'rack',
  };
}

function assemblyLayout(entities: Entity[]): LayoutResult {
  const accelerators = entities.filter((entity) =>
    ['gpu', 'tpu', 'ai_accelerator', 'apu'].includes(entity.entityType),
  );
  const local = entities.filter((entity) =>
    ['cpu', 'nic', 'smartnic', 'dpu', 'local_storage', 'hbm'].includes(entity.entityType),
  );
  const other = entities.filter(
    (entity) => !accelerators.includes(entity) && !local.includes(entity),
  );
  const ordered = [...local, ...accelerators, ...other];
  return gridLayout(ordered, accelerators.length >= 4 ? 4 : 3, 'assembly', 128);
}

function fabricLayout(entities: Entity[]): LayoutResult {
  const switches = entities.filter((entity) =>
    ['network_switch', 'scale_up_switch', 'switch_tray', 'switch_asic'].includes(entity.entityType),
  );
  const groups = entities.filter((entity) => !switches.includes(entity));
  const width = 900;
  const nodes: LayoutNode[] = [];
  const placeRow = (row: Entity[], y: number) => {
    const total = row.length * nodeWidth + Math.max(0, row.length - 1) * 34;
    const start = Math.max(38, (width - total) / 2);
    row.forEach((entity, index) => {
      nodes.push({id: entity.id, x: start + index * (nodeWidth + 34), y, width: nodeWidth, height: nodeHeight});
    });
  };
  placeRow(groups, 56);
  placeRow(switches, groups.length ? 238 : 130);
  return {nodes, width, height: 480, kind: 'fabric'};
}

export function layoutForContext(current: Entity, entities: Entity[]): LayoutResult {
  if (entities.length === 0) {
    return {nodes: [], width: 760, height: 360, kind: 'generic'};
  }

  if (['rack', 'rack_group', 'rack_scale_system'].includes(current.entityType)) {
    return rackLayout(entities);
  }

  if (
    ['compute_node', 'compute_assembly', 'compute_tray', 'switch_tray'].includes(
      current.entityType,
    )
  ) {
    return assemblyLayout(entities);
  }

  if (
    ['network_fabric', 'topology_group', 'rack_topology_domain', 'optical_network'].includes(
      current.entityType,
    )
  ) {
    return fabricLayout(entities);
  }

  if (['gpu', 'tpu', 'ai_accelerator', 'apu', 'accelerator_die', 'cpu'].includes(current.entityType)) {
    return gridLayout(entities, 3, 'internal', 126);
  }

  if (
    ['compute_cluster', 'compute_group', 'pod_group', 'hpc_ai_system', 'inference_system', 'storage_system'].includes(
      current.entityType,
    )
  ) {
    return systemLayout(entities);
  }

  return gridLayout(entities, Math.min(3, Math.max(1, entities.length)), 'generic');
}
