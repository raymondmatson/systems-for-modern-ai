import type {AnatomyDepiction, Entity} from '../domain/types';

export interface LayoutRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type NodeMediaMode = 'full' | 'compact';

export interface LayoutNode extends LayoutRect {
  id: string;
  mediaMode: NodeMediaMode;
  labelMaxCharacters: number;
  labelMaxLines: number;
}

export type LayoutRegionKind =
  | 'semantic-content'
  | 'rack-population'
  | 'system-band'
  | 'fabric-band'
  | 'anatomy-support';

export interface LayoutRegion extends LayoutRect {
  id: string;
  kind: LayoutRegionKind;
  label?: string;
  memberIds: string[];
  nonliteral: boolean;
}

export interface LayoutAnatomy extends LayoutRect {
  id: string;
}

export interface LayoutEnclosure extends LayoutRect {
  headerHeight: number;
  interior: LayoutRect;
  portReserve: {top: number; right: number; bottom: number; left: number};
  arrangementNotice?: string;
}

export interface LayoutResult {
  nodes: LayoutNode[];
  anatomy: LayoutAnatomy[];
  regions: LayoutRegion[];
  width: number;
  height: number;
  kind: 'system' | 'rack' | 'assembly' | 'fabric' | 'internal' | 'generic';
  enclosure: LayoutEnclosure;
}

type BaseLayoutResult = Omit<LayoutResult, 'anatomy' | 'enclosure'>;

const nodeWidth = 236;
const nodeHeight = 112;
const enclosureMarginX = 18;
const enclosureMarginTop = 14;
const enclosureHeaderHeight = 64;
const enclosureNoticeHeaderHeight = 82;
const enclosureBottomMargin = 12;
const regionInsetX = 34;

function longestTokenLength(value: string): number {
  return Math.max(0, ...value.split(/\s+/).map((token) => token.length));
}

function nodeFit(entity: Entity, density: number): Pick<LayoutNode, 'mediaMode' | 'labelMaxCharacters' | 'labelMaxLines'> {
  const compact = density >= 7 || entity.name.length > 30 || longestTokenLength(entity.name) > 18;
  return compact
    ? {mediaMode: 'compact', labelMaxCharacters: 27, labelMaxLines: 3}
    : {mediaMode: 'full', labelMaxCharacters: 20, labelMaxLines: 2};
}

function makeNode(entity: Entity, x: number, y: number, density: number): LayoutNode {
  return {
    id: entity.id,
    x,
    y,
    width: nodeWidth,
    height: nodeHeight,
    ...nodeFit(entity, density),
  };
}

function anatomyArrangementNotice(
  kind: LayoutResult['kind'],
  anatomy: AnatomyDepiction[],
): string | undefined {
  const placementBases = new Set(anatomy.map((item) => item.placementBasis));
  if (kind === 'rack') {
    if (placementBases.size === 1 && placementBases.has('schematic')) {
      return 'Schematic rack organization · population bands and anatomy positions are nonliteral';
    }
    return 'Schematic rack organization · population bands are nonliteral';
  }
  if (placementBases.size === 1 && placementBases.has('schematic')) {
    return 'Schematic arrangement · anatomy presence is supported; positions are not literal';
  }
  if (placementBases.size > 1) {
    return 'Mixed anatomy placement basis · see item placement badges';
  }
  return undefined;
}

function anatomyLayout(
  width: number,
  startY: number,
  anatomy: AnatomyDepiction[],
): {items: LayoutAnatomy[]; region?: LayoutRegion; bottom: number} {
  if (anatomy.length === 0) return {items: [], bottom: startY};

  const outerX = regionInsetX;
  const outerWidth = width - regionInsetX * 2;
  const horizontalPadding = 14;
  const available = outerWidth - horizontalPadding * 2;
  const gap = 14;
  const preferredWidth = 180;
  const columns = Math.max(
    1,
    Math.min(4, anatomy.length, Math.floor((available + gap) / (preferredWidth + gap)) || 1),
  );
  const cardWidth = Math.min(
    240,
    Math.floor((available - gap * (columns - 1)) / columns),
  );
  const cardHeight = 84;
  const rowGap = 12;
  const rows = Math.ceil(anatomy.length / columns);
  const contentWidth = columns * cardWidth + (columns - 1) * gap;
  const startX = outerX + (outerWidth - contentWidth) / 2;
  const cardStartY = startY + 30;
  const items = anatomy.map((item, index) => ({
    id: item.id,
    x: startX + (index % columns) * (cardWidth + gap),
    y: cardStartY + Math.floor(index / columns) * (cardHeight + rowGap),
    width: cardWidth,
    height: cardHeight,
  }));
  const regionHeight = 30 + rows * cardHeight + Math.max(0, rows - 1) * rowGap + 14;
  return {
    items,
    region: {
      id: 'anatomy-support',
      kind: 'anatomy-support',
      label: 'Physical anatomy · noninteractive',
      memberIds: anatomy.map((item) => item.id),
      nonliteral: anatomy.some((item) => item.placementBasis === 'schematic'),
      x: outerX,
      y: startY,
      width: outerWidth,
      height: regionHeight,
    },
    bottom: startY + regionHeight,
  };
}

function withEnclosure(layout: BaseLayoutResult, anatomy: AnatomyDepiction[]): LayoutResult {
  const notice = anatomyArrangementNotice(layout.kind, anatomy);
  const headerHeight = notice ? enclosureNoticeHeaderHeight : enclosureHeaderHeight;
  const semanticBottom = Math.max(
    layout.height,
    ...layout.nodes.map((node) => node.y + node.height + 24),
    ...layout.regions.map((region) => region.y + region.height + 18),
  );
  const anatomyStartY = semanticBottom + (anatomy.length ? 10 : 0);
  const anatomyResult = anatomyLayout(layout.width, anatomyStartY, anatomy);
  const contentBottom = Math.max(semanticBottom, anatomyResult.bottom);

  const shiftedNodes = layout.nodes.map((node) => ({...node, y: node.y + headerHeight}));
  const shiftedRegions = [...layout.regions, ...(anatomyResult.region ? [anatomyResult.region] : [])]
    .map((region) => ({...region, y: region.y + headerHeight}));
  const shiftedAnatomy = anatomyResult.items.map((item) => ({...item, y: item.y + headerHeight}));
  const height = contentBottom + headerHeight + enclosureBottomMargin;
  const enclosure: LayoutEnclosure = {
    x: enclosureMarginX,
    y: enclosureMarginTop,
    width: Math.max(320, layout.width - enclosureMarginX * 2),
    height: Math.max(220, height - enclosureMarginTop - enclosureBottomMargin),
    headerHeight,
    interior: {
      x: enclosureMarginX + 14,
      y: enclosureMarginTop + headerHeight,
      width: Math.max(280, layout.width - enclosureMarginX * 2 - 28),
      height: Math.max(140, contentBottom - enclosureMarginTop - 2),
    },
    portReserve: {top: 16, right: 20, bottom: 16, left: 20},
    arrangementNotice: notice,
  };
  return {
    ...layout,
    nodes: shiftedNodes,
    regions: shiftedRegions,
    anatomy: shiftedAnatomy,
    height,
    enclosure,
  };
}

function semanticRegion(
  id: string,
  width: number,
  nodes: LayoutNode[],
  label?: string,
): LayoutRegion | undefined {
  if (nodes.length === 0) return undefined;
  const top = Math.min(...nodes.map((node) => node.y)) - 22;
  const bottom = Math.max(...nodes.map((node) => node.y + node.height)) + 16;
  return {
    id,
    kind: 'semantic-content',
    label,
    memberIds: nodes.map((node) => node.id),
    nonliteral: true,
    x: regionInsetX,
    y: top,
    width: width - regionInsetX * 2,
    height: bottom - top,
  };
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
  const nodes = entities.map((entity, index) =>
    makeNode(
      entity,
      left + (index % cols) * (nodeWidth + gap),
      top + Math.floor(index / cols) * rowGap,
      entities.length,
    ),
  );
  const rows = Math.max(1, Math.ceil(entities.length / cols));
  const width = Math.max(760, left * 2 + cols * nodeWidth + (cols - 1) * gap);
  const region = semanticRegion('modeled-components', width, nodes);
  return {
    nodes,
    regions: region ? [region] : [],
    width,
    height: Math.max(320, top * 2 + rows * nodeHeight + (rows - 1) * (rowGap - nodeHeight)),
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
    'storage_group',
    'storage_server',
    'memory_appliance',
    'management_node',
    'preprocess_server',
    'cooling_system',
    'power_system',
  ]);
  const compute = entities.filter((entity) => computeTypes.has(entity.entityType));
  const fabrics = entities.filter((entity) => fabricTypes.has(entity.entityType));
  const support = entities.filter((entity) => supportTypes.has(entity.entityType));
  const other = entities.filter(
    (entity) => !compute.includes(entity) && !fabrics.includes(entity) && !support.includes(entity),
  );
  const rows = [
    {id: 'compute-domain', label: 'Compute / structural', items: compute},
    {id: 'network-domain', label: 'Network / fabric', items: fabrics},
    {id: 'support-domain', label: 'Storage / support', items: [...support, ...other]},
  ].filter((row) => row.items.length > 0);
  const width = Math.max(
    820,
    ...rows.map((row) => 112 + row.items.length * nodeWidth + Math.max(0, row.items.length - 1) * 40),
  );
  const nodes: LayoutNode[] = [];
  const regions: LayoutRegion[] = [];
  let y = 36;
  rows.forEach((row) => {
    const total = row.items.length * nodeWidth + Math.max(0, row.items.length - 1) * 40;
    const start = Math.max(56, (width - total) / 2);
    const rowNodes = row.items.map((entity, index) =>
      makeNode(entity, start + index * (nodeWidth + 40), y + 28, entities.length),
    );
    nodes.push(...rowNodes);
    regions.push({
      id: row.id,
      kind: 'system-band',
      label: row.label,
      memberIds: row.items.map((item) => item.id),
      nonliteral: true,
      x: regionInsetX,
      y,
      width: width - regionInsetX * 2,
      height: nodeHeight + 54,
    });
    y += nodeHeight + 72;
  });
  return {
    nodes,
    regions,
    width,
    height: Math.max(320, y + 10),
    kind: 'system',
  };
}

function rackLayout(entities: Entity[]): BaseLayoutResult {
  const computeTypes = new Set(['compute_tray', 'compute_node', 'compute_assembly', 'ai_accelerator']);
  const networkTypes = new Set(['switch_tray', 'network_switch', 'network_fabric', 'scale_up_switch']);
  const compute = entities.filter((entity) => computeTypes.has(entity.entityType));
  const network = entities.filter((entity) => networkTypes.has(entity.entityType));
  const other = entities.filter((entity) => !compute.includes(entity) && !network.includes(entity));
  const bands = [
    {id: 'rack-compute-population', label: 'Compute population · schematic', items: compute},
    {id: 'rack-network-population', label: 'Network / switching population · schematic', items: network},
    {id: 'rack-other-contents', label: 'Other modeled rack contents · schematic', items: other},
  ].filter((band) => band.items.length > 0);
  const width = Math.max(760, 116 + Math.min(3, Math.max(1, ...bands.map((band) => band.items.length))) * nodeWidth + 80);
  const nodes: LayoutNode[] = [];
  const regions: LayoutRegion[] = [];
  let y = 34;
  for (const band of bands) {
    const columns = Math.max(1, Math.min(3, band.items.length));
    const gap = 28;
    const rows = Math.ceil(band.items.length / columns);
    const bandHeight = 36 + rows * nodeHeight + Math.max(0, rows - 1) * 24 + 18;
    const rowWidth = columns * nodeWidth + Math.max(0, columns - 1) * gap;
    const start = Math.max(54, (width - rowWidth) / 2);
    band.items.forEach((entity, index) => {
      nodes.push(
        makeNode(
          entity,
          start + (index % columns) * (nodeWidth + gap),
          y + 32 + Math.floor(index / columns) * (nodeHeight + 24),
          entities.length,
        ),
      );
    });
    regions.push({
      id: band.id,
      kind: 'rack-population',
      label: band.label,
      memberIds: band.items.map((item) => item.id),
      nonliteral: true,
      x: regionInsetX,
      y,
      width: width - regionInsetX * 2,
      height: bandHeight,
    });
    y += bandHeight + 18;
  }
  return {
    nodes,
    regions,
    width,
    height: Math.max(300, y + 12),
    kind: 'rack',
  };
}

function assemblyLayout(entities: Entity[]): BaseLayoutResult {
  const accelerators = entities.filter((entity) =>
    ['gpu', 'tpu', 'ai_accelerator', 'apu'].includes(entity.entityType),
  );
  const local = entities.filter((entity) =>
    ['cpu', 'system_memory', 'hbm', 'scale_up_switch', 'nic', 'smartnic', 'dpu', 'local_storage', 'management_node', 'power_system'].includes(entity.entityType),
  );
  const other = entities.filter(
    (entity) => !accelerators.includes(entity) && !local.includes(entity),
  );
  const ordered = [...accelerators, ...local, ...other];
  return gridLayout(ordered, ordered.length >= 8 ? 3 : 3, 'assembly', 148);
}

function fabricLayout(entities: Entity[]): BaseLayoutResult {
  const switches = entities.filter((entity) =>
    ['network_switch', 'scale_up_switch', 'switch_tray', 'switch_asic'].includes(entity.entityType),
  );
  const groups = entities.filter((entity) => !switches.includes(entity));
  const rows = [
    {id: 'fabric-attached-domain', label: 'Attached topology / systems', items: groups},
    {id: 'fabric-switching-domain', label: 'Switching / fabric', items: switches},
  ].filter((row) => row.items.length > 0);
  const width = 940;
  const nodes: LayoutNode[] = [];
  const regions: LayoutRegion[] = [];
  let y = 40;
  for (const row of rows) {
    const total = row.items.length * nodeWidth + Math.max(0, row.items.length - 1) * 36;
    const start = Math.max(48, (width - total) / 2);
    row.items.forEach((entity, index) => {
      nodes.push(makeNode(entity, start + index * (nodeWidth + 36), y + 30, entities.length));
    });
    regions.push({
      id: row.id,
      kind: 'fabric-band',
      label: row.label,
      memberIds: row.items.map((item) => item.id),
      nonliteral: true,
      x: regionInsetX,
      y,
      width: width - regionInsetX * 2,
      height: nodeHeight + 56,
    });
    y += nodeHeight + 78;
  }
  return {nodes, regions, width, height: Math.max(320, y + 14), kind: 'fabric'};
}

export function layoutForContext(current: Entity, entities: Entity[]): LayoutResult {
  let layout: BaseLayoutResult;

  if (entities.length === 0) {
    layout = {nodes: [], regions: [], width: 760, height: 180, kind: 'generic'};
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

  return withEnclosure(layout, current.anatomyDepictions ?? []);
}
