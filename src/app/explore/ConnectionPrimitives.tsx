import type {ConnectionEndpointMarker, ConnectionRoute, RoutePoint} from '../../view-model/connectionVisuals';
import {pathData, routeMidpoint} from '../../view-model/connectionVisuals';
import type {SceneConnection} from '../../view-model/explore';

function markerAt(marker: ConnectionEndpointMarker, point: RoutePoint, key: string) {
  const common = {key, className: `edge-endpoint-marker marker-${marker}`};
  switch (marker) {
    case 'connector':
      return <rect {...common} x={point.x - 3.5} y={point.y - 3.5} width="7" height="7" rx="1.5" />;
    case 'path':
      return <circle {...common} cx={point.x} cy={point.y} r="4" />;
    case 'dependency':
      return <path {...common} d={`M${point.x} ${point.y - 5}L${point.x + 5} ${point.y}L${point.x} ${point.y + 5}L${point.x - 5} ${point.y}Z`} />;
    case 'affinity':
      return (
        <g {...common}>
          <circle cx={point.x - 2.5} cy={point.y} r="2" />
          <circle cx={point.x + 2.5} cy={point.y} r="2" />
        </g>
      );
    case 'membership':
      return <path {...common} d={`M${point.x + 4} ${point.y - 5}H${point.x - 3}V${point.y + 5}H${point.x + 4}`} />;
    case 'redundancy':
      return (
        <g {...common}>
          <circle cx={point.x - 2} cy={point.y} r="3.5" />
          <circle cx={point.x + 2} cy={point.y} r="3.5" />
        </g>
      );
    case 'control':
      return <rect {...common} x={point.x - 4} y={point.y - 4} width="8" height="8" />;
    default:
      return <circle {...common} cx={point.x} cy={point.y} r="3" />;
  }
}

function distinctSegment(points: RoutePoint[], atStart: boolean): [RoutePoint, RoutePoint] | undefined {
  if (points.length < 2) return undefined;
  if (atStart) {
    const start = points[0]!;
    for (let index = 1; index < points.length; index += 1) {
      const next = points[index]!;
      if (next.x !== start.x || next.y !== start.y) return [start, next];
    }
    return undefined;
  }
  const end = points[points.length - 1]!;
  for (let index = points.length - 2; index >= 0; index -= 1) {
    const previous = points[index]!;
    if (previous.x !== end.x || previous.y !== end.y) return [previous, end];
  }
  return undefined;
}

function arrowSegment(route: ConnectionRoute, atStart: boolean): {from: RoutePoint; to: RoutePoint} | undefined {
  const segment = distinctSegment(route.points, atStart);
  if (!segment) return undefined;
  const [a, b] = segment;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const length = Math.hypot(dx, dy);
  if (length < 18) return undefined;
  const ux = dx / length;
  const uy = dy / length;
  if (atStart) {
    return {
      from: {x: a.x + ux * Math.min(28, length * 0.55), y: a.y + uy * Math.min(28, length * 0.55)},
      to: {x: a.x + ux * Math.min(11, length * 0.25), y: a.y + uy * Math.min(11, length * 0.25)},
    };
  }
  return {
    from: {x: b.x - ux * Math.min(28, length * 0.55), y: b.y - uy * Math.min(28, length * 0.55)},
    to: {x: b.x - ux * Math.min(11, length * 0.25), y: b.y - uy * Math.min(11, length * 0.25)},
  };
}

export function ConnectionDefs() {
  return (
    <defs>
      <marker id="connection-direction-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto" markerUnits="strokeWidth">
        <path className="edge-direction-marker" d="M0 0L7 3.5L0 7Z" />
      </marker>
    </defs>
  );
}

export function ConnectionBaseRoutes({connection, routes}: {connection: SceneConnection; routes: ConnectionRoute[]}) {
  const endpointMarkers: Array<ReturnType<typeof markerAt>> = [];
  routes.forEach((route) => {
    if (route.endpointMarkerAtStart && route.points[0]) {
      endpointMarkers.push(markerAt(connection.visual.marker, route.points[0], `${route.id}-start`));
    }
    const end = route.points[route.points.length - 1];
    if (route.endpointMarkerAtEnd && end) {
      endpointMarkers.push(markerAt(connection.visual.marker, end, `${route.id}-end`));
    }
  });
  const nonTrunk = routes.find((route) => !route.trunk) ?? routes[0];
  const aggregatePoint = nonTrunk ? routeMidpoint(nonTrunk) : undefined;

  return (
    <>
      {connection.aggregated && routes.map((route) => (
        <path key={`aggregate-${route.id}`} className="edge-aggregate-bundle" d={pathData(route.points)} />
      ))}
      {connection.relationshipType === 'redundancy_protection' && routes.map((route) => (
        <path key={`redundancy-${route.id}`} className="edge-redundancy-companion" d={pathData(route.points)} />
      ))}
      {routes.map((route) => (
        <path
          key={`visible-${route.id}`}
          className="edge-visible"
          d={pathData(route.points)}
          strokeDasharray={connection.visual.dashArray}
        />
      ))}
      {endpointMarkers}
      {routes.flatMap((route) => {
        const arrows: any[] = [];
        if (route.arrowAtStart) {
          const segment = arrowSegment(route, true);
          if (segment) arrows.push(
            <line
              key={`${route.id}-arrow-start`}
              className="edge-direction-arrow"
              x1={segment.from.x}
              y1={segment.from.y}
              x2={segment.to.x}
              y2={segment.to.y}
              markerEnd="url(#connection-direction-arrow)"
            />,
          );
        }
        if (route.arrowAtEnd) {
          const segment = arrowSegment(route, false);
          if (segment) arrows.push(
            <line
              key={`${route.id}-arrow-end`}
              className="edge-direction-arrow"
              x1={segment.from.x}
              y1={segment.from.y}
              x2={segment.to.x}
              y2={segment.to.y}
              markerEnd="url(#connection-direction-arrow)"
            />,
          );
        }
        return arrows;
      })}
      {connection.aggregated && aggregatePoint && (
        <g className="edge-aggregate-marker" transform={`translate(${aggregatePoint.x} ${aggregatePoint.y})`} aria-hidden="true">
          <path d="M-6 -4H6M-6 0H6M-6 4H6" />
        </g>
      )}
    </>
  );
}

export function ConnectionHitRoutes({routes}: {routes: ConnectionRoute[]}) {
  return <>{routes.map((route) => <path key={`hit-${route.id}`} className="edge-hit" d={pathData(route.points)} />)}</>;
}

export function ConnectionScenarioUnderlay({connection, routes}: {connection: SceneConnection; routes: ConnectionRoute[]}) {
  if (!connection.scenarioEmphasized) return null;
  return (
    <g className="edge-scenario-underlay" aria-hidden="true">
      {routes.map((route) => <path key={`scenario-${route.id}`} d={pathData(route.points)} />)}
    </g>
  );
}

export function ConnectionInteractionOverlay({connection, routes}: {connection: SceneConnection; routes: ConnectionRoute[]}) {
  if (!connection.selected && !connection.previewed) return null;
  return (
    <g className="edge-interaction-overlay" aria-hidden="true">
      {connection.previewed && routes.map((route) => (
        <path key={`focus-${route.id}`} className="edge-focus-halo" d={pathData(route.points)} />
      ))}
      {connection.selected && routes.map((route) => (
        <path key={`selection-${route.id}`} className="edge-selection-halo" d={pathData(route.points)} />
      ))}
      {connection.selected && routes.flatMap((route) => {
        const markers: any[] = [];
        if (route.endpointMarkerAtStart && route.points[0]) {
          const point = route.points[0];
          markers.push(<rect key={`${route.id}-selected-start`} className="edge-selection-handle" x={point.x - 5} y={point.y - 5} width="10" height="10" rx="2" />);
        }
        const end = route.points[route.points.length - 1];
        if (route.endpointMarkerAtEnd && end) {
          markers.push(<rect key={`${route.id}-selected-end`} className="edge-selection-handle" x={end.x - 5} y={end.y - 5} width="10" height="10" rx="2" />);
        }
        return markers;
      })}
    </g>
  );
}
