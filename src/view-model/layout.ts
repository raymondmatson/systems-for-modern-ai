import type {Entity} from '../domain/types';

export interface LayoutRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface LayoutNode extends LayoutRect {
  id: string;
}

export interface LayoutEnclosure extends LayoutRect {
  headerHeight: number;
  interior: LayoutRect;
}

export interface LayoutResult {
  nodes: LayoutNode[];
  width: number;
  height: number;
  kind: 'system' | 'rack' | 'assembly' | 'fabric' | 'internal' | 'generic';
  enclosure: LayoutEnclosure;
}

type BaseLayoutResult = Omit<LayoutResult, 'enclosure'>;

const nodeWidth = 236;
const nodeHeight = 112;
const enclosureMarginX = 18;
const enclosureMarginTop = 14;
const enclosureHeaderHeight = 64;
const enclosureBottomMargin = 10;

function withEnclosure(layout: BaseLayoutResult): LayoutResult {
  const shiftedNodes = layout.nodes.map((node) => ({
    ...node,
    y: node.y + enclosureHeaderHeight,
  }));
  const height = layout.height + enclosureHeaderHeight + enclosureBottomMargin;
  const enclosure: LayoutEnclosure = {
    x: enclosureMarginX,
    y: enclosureMarginTop,
    width: Math.max(320, layout.width - enclosureMarginX * 2),
    height: Math.max(220, height - enclosureMarginTop - enclosureBottomMargin),
    headerHeight: enclosureHeaderHeight,
    interior: {
      x: enclosureMarginX + 14,
      y: enclosureMarginTop + enclosureHeaderHeight,
      width: Math.max(280, layout.width - enclosureMarginX * 2 - 28),
      height: Math.max(140, layout.height - enclosureMarginTop - 4),
    },
  };
  return {...layout, nodes: shiftedNodes, height, enclosure};
}

function gridLayout(
  entities: Entity[],
  columns: number,
  kind: LayoutResult['kind'],
  rowGap = 152,
): BaseLayoutResult {
  const cols = Math.max(1, Math.min(columns, entities.length || 1));
  const gap = 36;
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

function systemLayout(entities: Entity[]): BaseLayoutResult {
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
    ...rows.map((row) => 84 + row.length * nodeWidth + Math.max(0, row.length - 1) * 40),
  );
  const nodes: LayoutNode[] = [];
  rows.forEach((row, rowIndex) => {
    const total = row.length * nodeWidth + Math.max(0, row.length - 1) * 40;
    const start = Math.max(42, (width - total) / 2);
    row.forEach((entity, index) => {
      nodes.push({
        id: entity.id,
        x: start + index * (nodeWidth + 40),
        y: 48 + rowIndex * 164,
        width: nodeWidth,
        height: nodeHeight,
      });
    });
  });
  return {
    nodes,
    width,
    height: Math.max(446, 112 + rows.length * 164),
    kind: 'system',
  };
}

function rackLayout(entities: Entity[]): BaseLayoutResult {
  const leftTypes = new Set(['compute_tray', 'compute_node', 'compute_assembly', 'ai_accelerator']);
  const rightTypes = new Set(['switch_tray', 'network_switch', 'network_fabric', 'storage_system']);
  const left = entities.filter((entity) => leftTypes.has(entity.entityType));
  const right = entities.filter((entity) => rightTypes.has(entity.entityType));
  const middle = entities.filter((entity) => !left.includes(entity) && !right.includes(entity));
  const lanes = [left, middle, right].filter((lane) => lane.length > 0);
  const gap = 42;
  const rowStep = 136;
  const nodes: LayoutNode[] = [];
  lanes.forEach((lane, laneIndex) => {
    lane.forEach((entity, rowIndex) => {
      nodes.push({
        id: entity.id,
        x: 42 + laneIndex * (nodeWidth + gap),
        y: 48 + rowIndex * rowStep,
        width: nodeWidth,
        height: nodeHeight,
      });
    });
  });
  const maxRows = Math.max(1, ...lanes.map((lane) => lane.length));
  return {
    nodes,
    width: Math.max(760, 84 + lanes.length * nodeWidth + (lanes.length - 1) * gap),
    height: Math.max(320, 96 + maxRows * rowStep),
    kind: 'rack',
  };
}

function assemblyLayout(entities: Entity[]): BaseLayoutResult {
  const accelerators = entities.filter((entity) =>
    ['gpu', 'tpu', 'ai_accelerator', 'apu'].includes(entity.entityType),
  );
  const local = entities.filter((entity) =>
    ['cpu', 'nic', 'smartnic', 'dpu', 'local_storage', 'system_memory', 'hbm', 'power_system'].includes(entity.entityType),
  );
  const other = entities.filter(
    (entity) => !accelerators.includes(entity) && !local.includes(entity),
  );
  const ordered = [...local, ...accelerators, ...other];
  return gridLayout(ordered, accelerators.length >= 4 ? 4 : 3, 'assembly', 148);
}

function fabricLayout(entities: Entity[]): BaseLayoutResult {
  const switches = entities.filter((entity) =>
    ['network_switch', 'scale_up_switch', 'switch_tray', 'switch_asic'].includes(entity.entityType),
  );
  const groups = entities.filter((entity) => !switches.includes(entity));
  const width = 940;
  const nodes: LayoutNode[] = [];
  const placeRow = (row: Entity[], y: number) => {
    const total = row.length * nodeWidth + Math.max(0, row.length - 1) * 36;
    const start = Math.max(38, (width - total) / 2);
    row.forEach((entity, index) => {
      nodes.push({id: entity.id, x: start + index * (nodeWidth + 36), y, width: nodeWidth, height: nodeHeight});
    });
  };
  placeRow(groups, 56);
  placeRow(switches, groups.length ? 250 : 138);
  return {nodes, width, height: 500, kind: 'fabric'};
}

export function layoutForContext(current: Entity, entities: Entity[]): LayoutResult {
  let layout: BaseLayoutResult;

  if (entities.length === 0) {
    layout = {nodes: [], width: 760, height: 360, kind: 'generic'};
  } else if (['rack', 'rack_group', 'rack_scale_system'].includes(current.entityType)) {
    layout = rackLayout(entities);
  } else if (
    ['compute_node', 'compute_assembly', 'compute_tray', 'switch_tray'].includes(
      current.entityType,
    )
  ) {
    layout = assemblyLayout(entities);
  } else if (
    ['network_fabric', 'topology_group', 'rack_topology_domain', 'optical_network'].includes(
      current.entityType,
    )
  ) {
    layout = fabricLayout(entities);
  } else if (['gpu', 'tpu', 'ai_accelerator', 'apu', 'accelerator_die', 'cpu'].includes(current.entityType)) {
    layout = gridLayout(entities, 3, 'internal', 144);
  } else if (
    ['compute_cluster', 'compute_group', 'pod_group', 'hpc_ai_system', 'inference_system', 'storage_system'].includes(
      current.entityType,
    )
  ) {
    layout = systemLayout(entities);
  } else {
    layout = gridLayout(entities, Math.min(3, Math.max(1, entities.length)), 'generic');
  }

  return withEnclosure(layout);
}
