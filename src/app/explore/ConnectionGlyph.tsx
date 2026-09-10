import type {SceneConnection, SceneNode} from '../../view-model/explore';
import {relationshipTypeLabel} from '../../view-model/labels';
import type {PreviewHandlers, SelectTarget} from './types';

export function ConnectionGlyph({
  connection,
  nodes,
  previewHandlers,
  selectTarget,
}: {
  connection: SceneConnection;
  nodes: SceneNode[];
  previewHandlers: PreviewHandlers;
  selectTarget: SelectTarget;
}) {
  const endpoints = connection.endpointNodeIds
    .map((id) => nodes.find((node) => node.entity.id === id))
    .filter((node): node is SceneNode => Boolean(node));
  if (endpoints.length < 2) return null;
  const centers = endpoints.map((node) => ({
    x: node.x + node.width / 2,
    y: node.y + node.height / 2,
  }));
  const segments =
    centers.length === 2
      ? [[centers[0]!, centers[1]!] as const]
      : centers.map((center) => {
          const hub = {
            x: centers.reduce((sum, point) => sum + point.x, 0) / centers.length,
            y: centers.reduce((sum, point) => sum + point.y, 0) / centers.length,
          };
          return [center, hub] as const;
        });
  const stateDescription = [
    connection.selected ? 'selected' : undefined,
    connection.scenarioEmphasized ? 'affected by active scenario' : undefined,
    connection.aggregated ? 'summarized at this scale' : undefined,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <g
      className={`edge ${connection.selected ? 'selected ' : ''}${
        connection.previewed ? 'previewed ' : ''
      }${connection.scenarioEmphasized ? 'scenario-emphasized ' : ''}${
        connection.aggregated ? 'aggregated ' : ''
      }`}
      tabIndex={0}
      role="button"
      aria-pressed={connection.selected}
      aria-label={`${connection.name}, ${relationshipTypeLabel(connection.relationshipType)}, ${
        connection.endpointLabels.join(' to ')
      }${stateDescription ? `, ${stateDescription}` : ''}`}
      {...previewHandlers(connection.locator)}
      onClick={() => selectTarget(connection.locator)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          event.stopPropagation();
          selectTarget(connection.locator);
        }
      }}
    >
      {segments.map(([start, end], segmentIndex) => (
        <g key={segmentIndex}>
          <line className="edge-hit" x1={start.x} y1={start.y} x2={end.x} y2={end.y} />
          <line className="edge-visible" x1={start.x} y1={start.y} x2={end.x} y2={end.y} />
        </g>
      ))}
      {centers.length > 2 && (
        <circle
          className="edge-hub"
          cx={centers.reduce((sum, point) => sum + point.x, 0) / centers.length}
          cy={centers.reduce((sum, point) => sum + point.y, 0) / centers.length}
          r="6"
        />
      )}
      <title>
        {connection.name}: {connection.endpointLabels.join(' ↔ ')}
      </title>
    </g>
  );
}
