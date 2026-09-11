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

function routeIntersectsNodes(points: RoutePoint[], blockers: RoutingNode[]): boolean {
  for (let index = 1; index < points.length; index += 1) {
    const a = points[index - 1]!;
    const b = points[index]!;
    if (blockers.some((node) => segmentIntersectsNode(a, b, node))) return true;
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

  // When the direct orthogonal routes are blocked, detour around the visible
  // component envelope. These coordinates are presentation-only and never
  // imply that a modeled connection physically follows this drawn route.
  if (horizontal) {
    candidates.push(
      uniquePoints([start, {x: start.x, y: minY - clearance}, {x: end.x, y: minY - clearance}, end]),
      uniquePoints([start, {x: start.x, y: maxY + clearance}, {x: end.x, y: maxY + clearance}, end]),
    );
  } else {
    candidates.push(
      uniquePoints([start, {x: minX - clearance, y: start.y}, {x: minX - clearance, y: end.y}, end]),
      uniquePoints([start, {x: maxX + clearance, y: start.y}, {x: maxX + clearance, y: end.y}, end]),
    );
  }

  const clearCandidates = candidates.filter((candidate) => !routeIntersectsNodes(candidate, blockers));
  const points = (clearCandidates.length > 0 ? clearCandidates : candidates)
    .slice()
    .sort((a, b) => routeLength(a) - routeLength(b))[0]!;

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

function naryRoutes(
  nodes: RoutingNode[],
  directionality: ConnectionDirectionality,
): ConnectionRoute[] {
  const minX = Math.min(...nodes.map((node) => node.x));
  const maxX = Math.max(...nodes.map((node) => node.x + node.width));
  const minY = Math.min(...nodes.map((node) => node.y));
  const maxY = Math.max(...nodes.map((node) => node.y + node.height));
  const spreadX = maxX - minX;
  const spreadY = maxY - minY;
  const horizontalTrunk = spreadX >= spreadY;
  const direction = directionalityVisual(directionality);

  if (horizontalTrunk) {
    const trunkY = minY - 18;
    const anchors = nodes.map((node) => ({node, point: {x: center(node).x, y: node.y}}));
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

  const trunkX = maxX + 18;
  const anchors = nodes.map((node) => ({node, point: {x: node.x + node.width, y: center(node).y}}));
  const trunkStartY = Math.min(...anchors.map(({point}) => point.y));
  const trunkEndY = Math.max(...anchors.map(({point}) => point.y));
  const branches = anchors.map(({node, point}, index) => ({
    id: `branch-${node.id}`,
    points: uniquePoints([point, {x: trunkX, y: point.y}]),
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
      points: [{x: trunkX, y: trunkStartY}, {x: trunkX, y: trunkEndY}],
      endpointMarkerAtStart: false,
      endpointMarkerAtEnd: false,
      arrowAtStart: false,
      arrowAtEnd: false,
      trunk: true,
    },
    ...branches,
  ];
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
  return naryRoutes(nodes, directionality);
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
  const stubInsidePoint = {x: boundaryX + inward * 34, y: boundaryY};
  const labelPoint = {x: boundaryX - inward * 12, y: boundaryY - 7};
  const targetPoint = node ? rectAnchor(node, boundaryPoint) : stubInsidePoint;
  const routePoints = side === 'right'
    ? uniquePoints([
        targetPoint,
        {x: Math.max(targetPoint.x + 18, boundaryX - 34), y: targetPoint.y},
        {x: boundaryX - 34, y: boundaryY},
        boundaryPoint,
      ])
    : uniquePoints([
        targetPoint,
        {x: Math.min(targetPoint.x - 18, boundaryX + 34), y: targetPoint.y},
        {x: boundaryX + 34, y: boundaryY},
        boundaryPoint,
      ]);

  const visual = directionalityVisual(directionality);
  const arrowAtStart = visual === 'bidirectional' || (visual === 'forward' && visibleEndpointIsTarget);
  const arrowAtEnd = visual === 'bidirectional' || (visual === 'forward' && visibleEndpointIsSource);

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
      endpointMarkerAtStart: Boolean(node),
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
