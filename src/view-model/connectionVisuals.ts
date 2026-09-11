import {relationshipTypeLabel} from './labels';

export const CANONICAL_RELATIONSHIP_FAMILIES = [
  'physical_connectivity',
  'data_communication_path',
  'dependency_service',
  'affinity_locality',
  'shared_resource_membership',
  'redundancy_protection',
  'control_management',
] as const;

export type CanonicalRelationshipFamily = (typeof CANONICAL_RELATIONSHIP_FAMILIES)[number];
export type ConnectionEndpointMarker =
  | 'connector'
  | 'path'
  | 'dependency'
  | 'affinity'
  | 'membership'
  | 'redundancy'
  | 'control'
  | 'generic';

export interface ConnectionVisualSpec {
  relationshipType: string;
  canonical: boolean;
  className: string;
  label: string;
  marker: ConnectionEndpointMarker;
  dashArray?: string;
}

const relationshipVisuals: Record<CanonicalRelationshipFamily, Omit<ConnectionVisualSpec, 'relationshipType' | 'canonical'>> = {
  physical_connectivity: {
    className: 'relationship-physical-connectivity',
    label: 'Physical connectivity',
    marker: 'connector',
  },
  data_communication_path: {
    className: 'relationship-data-communication-path',
    label: 'Data / communication path',
    marker: 'path',
    dashArray: '12 4',
  },
  dependency_service: {
    className: 'relationship-dependency-service',
    label: 'Dependency / service',
    marker: 'dependency',
    dashArray: '7 5',
  },
  affinity_locality: {
    className: 'relationship-affinity-locality',
    label: 'Affinity / locality',
    marker: 'affinity',
    dashArray: '2 5',
  },
  shared_resource_membership: {
    className: 'relationship-shared-resource-membership',
    label: 'Shared resource / membership',
    marker: 'membership',
    dashArray: '1 4',
  },
  redundancy_protection: {
    className: 'relationship-redundancy-protection',
    label: 'Redundancy / protection',
    marker: 'redundancy',
    dashArray: '10 3 2 3',
  },
  control_management: {
    className: 'relationship-control-management',
    label: 'Control / management',
    marker: 'control',
    dashArray: '9 4 2 4',
  },
};

export function connectionVisualFor(relationshipType: string): ConnectionVisualSpec {
  const canonical = CANONICAL_RELATIONSHIP_FAMILIES.includes(
    relationshipType as CanonicalRelationshipFamily,
  );
  if (canonical) {
    return {
      relationshipType,
      canonical: true,
      ...relationshipVisuals[relationshipType as CanonicalRelationshipFamily],
    };
  }
  return {
    relationshipType,
    canonical: false,
    className: 'relationship-generic',
    label: relationshipTypeLabel(relationshipType),
    marker: 'generic',
    dashArray: '5 4',
  };
}

export type ConnectionDirectionality = 'undirected' | 'source_to_target' | 'bidirectional' | string;
export type DirectionalityVisual = 'none' | 'forward' | 'bidirectional';

export function directionalityVisual(directionality: ConnectionDirectionality): DirectionalityVisual {
  switch (directionality) {
    case 'source_to_target': return 'forward';
    case 'bidirectional': return 'bidirectional';
    default: return 'none';
  }
}

export interface RoutePoint {
  x: number;
  y: number;
}

export interface RoutingNode {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ConnectionRoute {
  id: string;
  points: RoutePoint[];
  endpointNodeId?: string;
  endpointMarkerAtStart: boolean;
  endpointMarkerAtEnd: boolean;
  arrowAtStart: boolean;
  arrowAtEnd: boolean;
  trunk: boolean;
}

export type BoundarySide = 'left' | 'right';

export interface BoundaryRoutePresentation {
  side: BoundarySide;
  boundaryPoint: RoutePoint;
  insidePoint: RoutePoint;
  labelPoint: RoutePoint;
  labelAnchor: 'start' | 'end';
  routes: ConnectionRoute[];
  visibleNodeId?: string;
  externalEndpointLabels: string[];
}

function center(node: RoutingNode): RoutePoint {
  return {x: node.x + node.width / 2, y: node.y + node.height / 2};
}

function rectAnchor(node: RoutingNode, toward: RoutePoint): RoutePoint {
  const c = center(node);
  const dx = toward.x - c.x;
  const dy = toward.y - c.y;
  if (Math.abs(dx) * node.height >= Math.abs(dy) * node.width) {
    return {x: dx >= 0 ? node.x + node.width : node.x, y: c.y};
  }
  return {x: c.x, y: dy >= 0 ? node.y + node.height : node.y};
}

function uniquePoints(points: RoutePoint[]): RoutePoint[] {
  return points.filter((point, index) => {
    const previous = points[index - 1];
    return !previous || previous.x !== point.x || previous.y !== point.y;
  });
}

function segmentIntersectsNode(a: RoutePoint, b: RoutePoint, node: RoutingNode, clearance = 10): boolean {
  const left = node.x - clearance;
  const right = node.x + node.width + clearance;
  const top = node.y - clearance;
  const bottom = node.y + node.height + clearance;
  if (a.x === b.x) {
    if (a.x <= left || a.x >= right) return false;
    const minY = Math.min(a.y, b.y);
    const maxY = Math.max(a.y, b.y);
    return maxY > top && minY < bottom;
  }
  if (a.y === b.y) {
    if (a.y <= top || a.y >= bottom) return false;
    const minX = Math.min(a.x, b.x);
    const maxX = Math.max(a.x, b.x);
    return maxX > left && minX < right;
  }
  return false;
}

function routeIntersectsNodes(
  points: RoutePoint[],
  blockers: RoutingNode[],
  clearance = 10,
): boolean {
  for (let index = 1; index < points.length; index += 1) {
    const a = points[index - 1]!;
    const b = points[index]!;
    if (blockers.some((node) => segmentIntersectsNode(a, b, node, clearance))) return true;
  }
  return false;
}

function routeLength(points: RoutePoint[]): number {
  let length = 0;
  for (let index = 1; index < points.length; index += 1) {
    const a = points[index - 1]!;
    const b = points[index]!;
    length += Math.abs(b.x - a.x) + Math.abs(b.y - a.y);
  }
  return length;
}

function escapePoint(node: RoutingNode, anchor: RoutePoint, distance = 18): RoutePoint {
  if (anchor.x === node.x) return {x: anchor.x - distance, y: anchor.y};
  if (anchor.x === node.x + node.width) return {x: anchor.x + distance, y: anchor.y};
  if (anchor.y === node.y) return {x: anchor.x, y: anchor.y - distance};
  if (anchor.y === node.y + node.height) return {x: anchor.x, y: anchor.y + distance};
  return anchor;
}

function shortestClearRoute(
  candidates: RoutePoint[][],
  blockers: RoutingNode[],
  clearance = 6,
): RoutePoint[] {
  const clear = candidates.filter((candidate) => !routeIntersectsNodes(candidate, blockers, clearance));
  return (clear.length > 0 ? clear : candidates)
    .slice()
    .sort((a, b) => routeLength(a) - routeLength(b))[0]!;
}

function binaryRoute(
  first: RoutingNode,
  second: RoutingNode,
  allNodes: RoutingNode[],
  directionality: ConnectionDirectionality,
): ConnectionRoute[] {
  const firstCenter = center(first);
  const secondCenter = center(second);
  const start = rectAnchor(first, secondCenter);
  const end = rectAnchor(second, firstCenter);
  const horizontal = Math.abs(secondCenter.x - firstCenter.x) >= Math.abs(secondCenter.y - firstCenter.y);
  const blockers = allNodes.filter((node) => node.id !== first.id && node.id !== second.id);
  const minX = Math.min(...allNodes.map((node) => node.x));
  const maxX = Math.max(...allNodes.map((node) => node.x + node.width));
  const minY = Math.min(...allNodes.map((node) => node.y));
  const maxY = Math.max(...allNodes.map((node) => node.y + node.height));
  const clearance = 24;
  const startEscape = escapePoint(first, start);
  const endEscape = escapePoint(second, end);

  const midpointCandidate = horizontal
    ? uniquePoints([
        start,
        {x: (start.x + end.x) / 2, y: start.y},
        {x: (start.x + end.x) / 2, y: end.y},
        end,
      ])
    : uniquePoints([
        start,
        {x: start.x, y: (start.y + end.y) / 2},
        {x: end.x, y: (start.y + end.y) / 2},
        end,
      ]);

  const candidates: RoutePoint[][] = [
    midpointCandidate,
    uniquePoints([start, {x: end.x, y: start.y}, end]),
    uniquePoints([start, {x: start.x, y: end.y}, end]),
  ];

  // If a simple elbow is blocked, first escape the endpoint card into a row
  // or column gap, then take a corridor outside the visible node envelope.
  // These are deterministic presentation routes only; they do not add modeled
  // waypoints or imply literal cable/path geometry.
  for (const corridorY of [minY - clearance, maxY + clearance]) {
    candidates.push(uniquePoints([
      start,
      startEscape,
      {x: startEscape.x, y: corridorY},
      {x: endEscape.x, y: corridorY},
      endEscape,
      end,
    ]));
  }
  for (const corridorX of [minX - clearance, maxX + clearance]) {
    candidates.push(uniquePoints([
      start,
      startEscape,
      {x: corridorX, y: startEscape.y},
      {x: corridorX, y: endEscape.y},
      endEscape,
      end,
    ]));
  }

  const points = shortestClearRoute(candidates, blockers);
  const visual = directionalityVisual(directionality);
  return [{
    id: `${first.id}--${second.id}`,
    points,
    endpointMarkerAtStart: true,
    endpointMarkerAtEnd: true,
    arrowAtStart: visual === 'bidirectional',
    arrowAtEnd: visual === 'forward' || visual === 'bidirectional',
    trunk: false,
  }];
}

interface RoutingRow {
  centerY: number;
  nodes: RoutingNode[];
}

function routingRows(nodes: RoutingNode[]): RoutingRow[] {
  const rows: RoutingRow[] = [];
  for (const node of [...nodes].sort((a, b) => center(a).y - center(b).y || a.x - b.x)) {
    const cy = center(node).y;
    const row = rows.find((candidate) => Math.abs(candidate.centerY - cy) <= 12);
    if (row) {
      row.nodes.push(node);
      row.centerY = row.nodes.reduce((sum, item) => sum + center(item).y, 0) / row.nodes.length;
    } else {
      rows.push({centerY: cy, nodes: [node]});
    }
  }
  return rows;
}

function naryRoutes(
  nodes: RoutingNode[],
  allNodes: RoutingNode[],
  directionality: ConnectionDirectionality,
): ConnectionRoute[] {
  const rows = routingRows(nodes);
  const direction = directionalityVisual(directionality);

  // A single visual row retains the compact top-trunk grammar used by the
  // existing pilot scenes.
  if (rows.length === 1) {
    const row = rows[0]!;
    const trunkY = Math.min(...row.nodes.map((node) => node.y)) - 18;
    const anchors = row.nodes.map((node) => ({node, point: {x: center(node).x, y: node.y}}));
    const trunkStartX = Math.min(...anchors.map(({point}) => point.x));
    const trunkEndX = Math.max(...anchors.map(({point}) => point.x));
    const branches = anchors.map(({node, point}, index) => ({
      id: `branch-${node.id}`,
      points: uniquePoints([point, {x: point.x, y: trunkY}]),
      endpointNodeId: node.id,
      endpointMarkerAtStart: true,
      endpointMarkerAtEnd: false,
      arrowAtStart: direction === 'bidirectional' || (direction === 'forward' && index > 0),
      arrowAtEnd: direction === 'bidirectional' && index === 0,
      trunk: false,
    } satisfies ConnectionRoute));
    return [
      {
        id: 'trunk',
        points: [{x: trunkStartX, y: trunkY}, {x: trunkEndX, y: trunkY}],
        endpointMarkerAtStart: false,
        endpointMarkerAtEnd: false,
        arrowAtStart: false,
        arrowAtEnd: false,
        trunk: true,
      },
      ...branches,
    ];
  }

  // Multi-row n-ary relationships use one side bus plus a row bus above each
  // participating row. The side bus sits outside the full visible-node
  // envelope, so branches do not cut through unrelated cards merely because
  // the participating endpoints span multiple rows.
  const sideX = Math.max(...allNodes.map((node) => node.x + node.width)) + 24;
  const rowBusYs = rows.map((row) => Math.min(...row.nodes.map((node) => node.y)) - 16);
  const routes: ConnectionRoute[] = [{
    id: 'side-trunk',
    points: [
      {x: sideX, y: Math.min(...rowBusYs)},
      {x: sideX, y: Math.max(...rowBusYs)},
    ],
    endpointMarkerAtStart: false,
    endpointMarkerAtEnd: false,
    arrowAtStart: false,
    arrowAtEnd: false,
    trunk: true,
  }];
  let endpointIndex = 0;
  rows.forEach((row, rowIndex) => {
    const rowBusY = rowBusYs[rowIndex]!;
    const minAnchorX = Math.min(...row.nodes.map((node) => center(node).x));
    routes.push({
      id: `row-trunk-${rowIndex}`,
      points: [{x: minAnchorX, y: rowBusY}, {x: sideX, y: rowBusY}],
      endpointMarkerAtStart: false,
      endpointMarkerAtEnd: false,
      arrowAtStart: false,
      arrowAtEnd: false,
      trunk: true,
    });
    for (const node of row.nodes) {
      const point = {x: center(node).x, y: node.y};
      routes.push({
        id: `branch-${node.id}`,
        points: uniquePoints([point, {x: point.x, y: rowBusY}]),
        endpointNodeId: node.id,
        endpointMarkerAtStart: true,
        endpointMarkerAtEnd: false,
        arrowAtStart: direction === 'bidirectional' || (direction === 'forward' && endpointIndex > 0),
        arrowAtEnd: direction === 'bidirectional' && endpointIndex === 0,
        trunk: false,
      });
      endpointIndex += 1;
    }
  });
  return routes;
}

export function buildConnectionRoutes(
  allNodes: RoutingNode[],
  endpointNodeIds: string[],
  directionality: ConnectionDirectionality,
): ConnectionRoute[] {
  const byId = new Map(allNodes.map((node) => [node.id, node]));
  const nodes = endpointNodeIds
    .map((id) => byId.get(id))
    .filter((node): node is RoutingNode => Boolean(node));
  if (nodes.length < 2) return [];
  if (nodes.length === 2) return binaryRoute(nodes[0]!, nodes[1]!, allNodes, directionality);
  return naryRoutes(nodes, allNodes, directionality);
}

function stableHash(value: string): number {
  let hash = 0;
  for (const character of value) hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  return hash;
}

export function buildBoundaryRoute({
  connectionId,
  allNodes,
  visibleNodeId,
  directionality,
  visibleEndpointIsSource,
  visibleEndpointIsTarget,
  enclosure,
  slotIndex,
  slotCount,
  externalEndpointLabels,
}: {
  connectionId: string;
  allNodes: RoutingNode[];
  visibleNodeId?: string;
  directionality: ConnectionDirectionality;
  visibleEndpointIsSource: boolean;
  visibleEndpointIsTarget: boolean;
  enclosure: {x: number; y: number; width: number; height: number; headerHeight: number};
  slotIndex: number;
  slotCount: number;
  externalEndpointLabels: string[];
}): BoundaryRoutePresentation {
  const node = visibleNodeId ? allNodes.find((candidate) => candidate.id === visibleNodeId) : undefined;
  const centerX = enclosure.x + enclosure.width / 2;
  const side: BoundarySide = node
    ? center(node).x < centerX ? 'left' : 'right'
    : stableHash(connectionId) % 2 === 0 ? 'right' : 'left';
  const usableTop = enclosure.y + enclosure.headerHeight + 24;
  const usableBottom = enclosure.y + enclosure.height - 28;
  const spacing = (usableBottom - usableTop) / Math.max(1, slotCount);
  const boundaryY = Math.min(usableBottom, usableTop + spacing * (slotIndex + 0.5));
  const boundaryX = side === 'right' ? enclosure.x + enclosure.width : enclosure.x;
  const boundaryPoint = {x: boundaryX, y: boundaryY};
  const inward = side === 'right' ? -1 : 1;
  const gutterInsidePoint = {x: boundaryX + inward * 14, y: boundaryY};
  const labelPoint = {x: boundaryX - inward * 12, y: boundaryY - 7};
  const visual = directionalityVisual(directionality);
  const arrowAtStart = visual === 'bidirectional' || (visual === 'forward' && visibleEndpointIsTarget);
  const arrowAtEnd = visual === 'bidirectional' || (visual === 'forward' && visibleEndpointIsSource);

  // When the modeled endpoint is the current enclosure itself (rather than a
  // visible child), keep the continuation stub in the enclosure gutter. A
  // longer inward line can otherwise cross an unrelated child and imply a
  // semantic attachment that does not exist.
  if (!node) {
    return {
      side,
      boundaryPoint,
      insidePoint: gutterInsidePoint,
      labelPoint,
      labelAnchor: side === 'right' ? 'start' : 'end',
      routes: [{
        id: `boundary-${connectionId}`,
        points: [gutterInsidePoint, boundaryPoint],
        endpointMarkerAtStart: false,
        endpointMarkerAtEnd: true,
        arrowAtStart,
        arrowAtEnd,
        trunk: false,
      }],
      externalEndpointLabels,
    };
  }

  const targetPoint = rectAnchor(node, boundaryPoint);
  const targetEscape = escapePoint(node, targetPoint, 18);
  const nearBoundaryX = boundaryX + inward * 18;
  const blockers = allNodes.filter((candidate) => candidate.id !== node.id);
  const minY = allNodes.length ? Math.min(...allNodes.map((candidate) => candidate.y)) : usableTop;
  const maxY = allNodes.length
    ? Math.max(...allNodes.map((candidate) => candidate.y + candidate.height))
    : usableBottom;
  const candidates: RoutePoint[][] = [
    uniquePoints([
      targetPoint,
      targetEscape,
      {x: nearBoundaryX, y: targetEscape.y},
      {x: nearBoundaryX, y: boundaryY},
      boundaryPoint,
    ]),
  ];
  for (const corridorY of [node.y - 16, node.y + node.height + 16, minY - 20, maxY + 20]) {
    candidates.push(uniquePoints([
      targetPoint,
      targetEscape,
      {x: targetEscape.x, y: corridorY},
      {x: nearBoundaryX, y: corridorY},
      {x: nearBoundaryX, y: boundaryY},
      boundaryPoint,
    ]));
  }
  const routePoints = shortestClearRoute(candidates, blockers, 4);

  return {
    side,
    boundaryPoint,
    insidePoint: targetPoint,
    labelPoint,
    labelAnchor: side === 'right' ? 'start' : 'end',
    routes: [{
      id: `boundary-${connectionId}`,
      points: routePoints,
      endpointNodeId: visibleNodeId,
      endpointMarkerAtStart: true,
      endpointMarkerAtEnd: true,
      arrowAtStart,
      arrowAtEnd,
      trunk: false,
    }],
    visibleNodeId,
    externalEndpointLabels,
  };
}

export function pathData(points: RoutePoint[]): string {
  return points.map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x} ${point.y}`).join(' ');
}

export function routeMidpoint(route: ConnectionRoute): RoutePoint {
  const points = route.points;
  if (points.length === 0) return {x: 0, y: 0};
  if (points.length === 1) return points[0]!;
  let total = 0;
  const lengths: number[] = [];
  for (let index = 1; index < points.length; index += 1) {
    const a = points[index - 1]!;
    const b = points[index]!;
    const length = Math.hypot(b.x - a.x, b.y - a.y);
    lengths.push(length);
    total += length;
  }
  let remaining = total / 2;
  for (let index = 0; index < lengths.length; index += 1) {
    const length = lengths[index]!;
    if (remaining <= length) {
      const a = points[index]!;
      const b = points[index + 1]!;
      const ratio = length === 0 ? 0 : remaining / length;
      return {x: a.x + (b.x - a.x) * ratio, y: a.y + (b.y - a.y) * ratio};
    }
    remaining -= length;
  }
  return points[points.length - 1]!;
}
