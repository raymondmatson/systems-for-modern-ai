import type {Configuration, Entity} from '../domain/types';
import type {LayoutRect, LayoutTopologyDepictionSpec} from './layout';

export type TopologyDimension = 'A' | 'B' | 'C';

export interface SceneTopologySegment {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface SceneTopologyMarker {
  label: string;
  x: number;
  y: number;
  anchor: 'middle';
}

export interface SceneTopologyWrapConnection {
  id: string;
  dimension: TopologyDimension;
  markerLabel: string;
  segments: [SceneTopologySegment, SceneTopologySegment];
  markers: [SceneTopologyMarker, SceneTopologyMarker];
}

export interface SceneTopologySamplePoint {
  id: string;
  x: number;
  y: number;
}

export interface SceneTopologyDepiction {
  id: string;
  kind: 'flattened-3d-torus';
  sourceConceptId: 'torus';
  title: string;
  subtitle: string;
  nonliteral: true;
  bounds: LayoutRect;
  field: LayoutRect;
  dimensions: TopologyDimension[];
  samplePoints: SceneTopologySamplePoint[];
  wrapConnections: SceneTopologyWrapConnection[];
  accessibleDescription: string;
}

const IRONWOOD_CONFIGURATION_ID = 'tpu7x-9216-chip-superpod';
const IRONWOOD_CUBE_ID = 'ironwood-cube';
const CEREBRAS_CONFIGURATION_ID = 'condor-galaxy-3-64-cs3';
const CEREBRAS_CS3_ID = 'cg3-cs3';
const CEREBRAS_WSE3_ID = 'cg3-wse3';

function supportsIronwoodTorusDepiction(configuration: Configuration, current: Entity): boolean {
  if (configuration.id !== IRONWOOD_CONFIGURATION_ID || current.id !== IRONWOOD_CUBE_ID) {
    return false;
  }

  const conceptBacked = configuration.conceptOccurrences.some(
    (occurrence) =>
      occurrence.conceptId === 'torus' &&
      occurrence.target.type === 'entity' &&
      occurrence.target.id === current.id,
  );
  const documented3dTorus = Object.values(configuration.connections).some(
    (connection) =>
      connection.endpointIds.includes(current.id) &&
      /3d\s+torus/i.test(connection.evidence.note ?? ''),
  );
  return conceptBacked && documented3dTorus;
}

/**
 * Phase-7 transfer-specific sparse compaction. This is deliberately scoped to
 * the two observed sparse contexts rather than becoming a global geometry
 * heuristic that could change already-approved pilot scenes.
 */
export function shouldCompactTransferContext(
  configuration: Configuration,
  current: Entity,
): boolean {
  return (
    (configuration.id === IRONWOOD_CONFIGURATION_ID && current.id === IRONWOOD_CUBE_ID) ||
    (configuration.id === CEREBRAS_CONFIGURATION_ID &&
      [CEREBRAS_CS3_ID, CEREBRAS_WSE3_ID].includes(current.id))
  );
}

/**
 * Reserve presentation-only space for the approved flattened Ironwood torus.
 * The returned spec carries no topology members, canonical IDs, or physical
 * coordinates; layout geometry remains discardable presentation state.
 */
export function topologyDepictionSpecForContext(
  configuration: Configuration,
  current: Entity,
): LayoutTopologyDepictionSpec | undefined {
  if (!supportsIronwoodTorusDepiction(configuration, current)) return undefined;
  return {
    id: 'ironwood-flattened-3d-torus',
    height: 226,
  };
}

function point(x: number, y: number): {x: number; y: number} {
  return {x, y};
}

/**
 * Build the approved presentation-only flattened 3D-torus explanation.
 * A/B/C are abstract topology dimensions, not physical axes. The six visible
 * paths are only two rendered portions of each of three conceptual wraparound
 * connections; they are not canonical system Connections.
 */
export function buildTopologyDepiction(
  configuration: Configuration,
  current: Entity,
  bounds: LayoutRect | undefined,
): SceneTopologyDepiction | undefined {
  if (!bounds || !supportsIronwoodTorusDepiction(configuration, current)) return undefined;

  const field: LayoutRect = {
    x: bounds.x + 18,
    y: bounds.y + 45,
    width: Math.max(320, bounds.width - 36),
    height: Math.max(120, bounds.height - 69),
  };
  const left = field.x;
  const right = field.x + field.width;
  const top = field.y;
  const bottom = field.y + field.height;
  const width = field.width;
  const height = field.height;

  const aLeft = point(left + width * 0.22, top + height * 0.30);
  const aRight = point(right - width * 0.22, top + height * 0.30);
  const bTop = point(left + width * 0.50, top + height * 0.20);
  const bBottom = point(left + width * 0.50, bottom - height * 0.20);
  const cTop = point(left + width * 0.30, top + height * 0.22);
  const cBottom = point(left + width * 0.70, bottom - height * 0.22);

  const wrapConnections: SceneTopologyWrapConnection[] = [
    {
      id: 'ironwood-torus-wrap-a1',
      dimension: 'A',
      markerLabel: 'A1',
      segments: [
        {id: 'ironwood-torus-wrap-a1-right', x1: aRight.x, y1: aRight.y, x2: right, y2: aRight.y},
        {id: 'ironwood-torus-wrap-a1-left', x1: left, y1: aLeft.y, x2: aLeft.x, y2: aLeft.y},
      ],
      markers: [
        {label: 'A1', x: right - 7, y: aRight.y - 8, anchor: 'middle'},
        {label: 'A1', x: left + 7, y: aLeft.y - 8, anchor: 'middle'},
      ],
    },
    {
      id: 'ironwood-torus-wrap-b1',
      dimension: 'B',
      markerLabel: 'B1',
      segments: [
        {id: 'ironwood-torus-wrap-b1-bottom', x1: bBottom.x, y1: bBottom.y, x2: bBottom.x, y2: bottom},
        {id: 'ironwood-torus-wrap-b1-top', x1: bTop.x, y1: top, x2: bTop.x, y2: bTop.y},
      ],
      markers: [
        {label: 'B1', x: bBottom.x + 9, y: bottom - 7, anchor: 'middle'},
        {label: 'B1', x: bTop.x + 9, y: top + 13, anchor: 'middle'},
      ],
    },
    {
      id: 'ironwood-torus-wrap-c1',
      dimension: 'C',
      markerLabel: 'C1',
      segments: [
        {
          id: 'ironwood-torus-wrap-c1-bottom',
          x1: cBottom.x,
          y1: cBottom.y,
          x2: left + width * 0.82,
          y2: bottom,
        },
        {
          id: 'ironwood-torus-wrap-c1-top',
          x1: left + width * 0.18,
          y1: top,
          x2: cTop.x,
          y2: cTop.y,
        },
      ],
      markers: [
        {label: 'C1', x: left + width * 0.82 - 8, y: bottom - 7, anchor: 'middle'},
        {label: 'C1', x: left + width * 0.18 + 8, y: top + 13, anchor: 'middle'},
      ],
    },
  ];

  return {
    id: 'ironwood-flattened-3d-torus',
    kind: 'flattened-3d-torus',
    sourceConceptId: 'torus',
    title: 'Flattened schematic · 3D torus topology',
    subtitle: 'A / B / C are abstract topology dimensions · sample positions only',
    nonliteral: true,
    bounds,
    field,
    dimensions: ['A', 'B', 'C'],
    samplePoints: [
      {id: 'sample-a-left', ...aLeft},
      {id: 'sample-a-right', ...aRight},
      {id: 'sample-b-top', ...bTop},
      {id: 'sample-b-bottom', ...bBottom},
      {id: 'sample-c-top', ...cTop},
      {id: 'sample-c-bottom', ...cBottom},
    ],
    wrapConnections,
    accessibleDescription:
      'Flattened schematic of the documented Ironwood 3D torus. A, B, and C are abstract topology dimensions, not physical axes. Matching edge markers such as A1 identify two visually separated portions of one conceptual wraparound connection. Sample positions, dimension lengths, chip coordinates, and exact chip-to-chip adjacency are not asserted.',
  };
}
