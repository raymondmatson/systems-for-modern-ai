import type {SceneConnection} from '../../view-model/explore';
import {formatMetadataValue} from '../../view-model/labels';
import type {PreviewHandlers, SelectTarget} from './types';
import {ConnectionBaseRoutes, ConnectionHitRoutes} from './ConnectionPrimitives';

export function connectionAriaLabel(connection: SceneConnection) {
  const stateDescription = [
    connection.selected ? 'selected' : undefined,
    connection.scenarioEmphasized ? 'affected by active scenario' : undefined,
    connection.aggregated ? 'summarized at this scale' : undefined,
  ]
    .filter(Boolean)
    .join(', ');
  return `${connection.name}, ${connection.visual.label}, ${formatMetadataValue(connection.directionality)}, ${
    connection.endpointLabels.join(' to ')
  }${stateDescription ? `, ${stateDescription}` : ''}`;
}

export function ConnectionGlyph({
  connection,
  previewHandlers,
  selectTarget,
}: {
  connection: SceneConnection;
  previewHandlers: PreviewHandlers;
  selectTarget: SelectTarget;
}) {
  if (connection.routes.length === 0) return null;
  return (
    <g
      className={`edge ${connection.visual.className} ${connection.aggregated ? 'aggregated ' : ''}${connection.selected ? 'selected ' : ''}${connection.previewed ? 'previewed ' : ''}${connection.scenarioEmphasized ? 'scenario-emphasized ' : ''}`}
      data-relationship-type={connection.relationshipType}
      data-directionality={connection.directionality}
      data-connection-visibility={connection.visibility}
      tabIndex={0}
      role="button"
      aria-pressed={connection.selected}
      aria-label={connectionAriaLabel(connection)}
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
      <ConnectionHitRoutes routes={connection.routes} />
      <ConnectionBaseRoutes connection={connection} routes={connection.routes} />
      <title>
        {connection.name}: {connection.endpointLabels.join(' ↔ ')} · {connection.visual.label} · {formatMetadataValue(connection.directionality)}
      </title>
    </g>
  );
}
