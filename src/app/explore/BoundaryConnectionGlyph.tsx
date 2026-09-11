import type {SceneConnection} from '../../view-model/explore';
import {svgLabelFit} from '../../view-model/labels';
import type {PreviewHandlers, SelectTarget} from './types';
import {ConnectionBaseRoutes, ConnectionHitRoutes} from './ConnectionPrimitives';
import {connectionAriaLabel} from './ConnectionGlyph';

export function BoundaryConnectionGlyph({
  connection,
  previewHandlers,
  selectTarget,
}: {
  connection: SceneConnection;
  previewHandlers: PreviewHandlers;
  selectTarget: SelectTarget;
}) {
  const boundary = connection.boundary;
  if (!boundary) return null;
  const interactive = connection.routes.length === 0;
  const externalLabel = boundary.externalEndpointLabels.join(' / ');
  const label = svgLabelFit(externalLabel || 'External relationship', 28, 1).lines[0] ?? externalLabel;
  const content = (
    <>
      {interactive && <ConnectionHitRoutes routes={boundary.routes} />}
      <ConnectionBaseRoutes connection={connection} routes={boundary.routes} />
      <circle className="boundary-stub-terminal" cx={boundary.boundaryPoint.x} cy={boundary.boundaryPoint.y} r="5" />
      <text
        className="boundary-stub-label"
        x={boundary.labelPoint.x}
        y={boundary.labelPoint.y}
        textAnchor={boundary.labelAnchor}
      >
        {label}
      </text>
      <title>{connection.name}: continues beyond current enclosure to {externalLabel}</title>
    </>
  );

  if (!interactive) {
    return (
      <g
        className={`boundary-edge decorative ${connection.visual.className}`}
        data-relationship-type={connection.relationshipType}
        data-boundary-side={boundary.side}
        aria-hidden="true"
      >
        {content}
      </g>
    );
  }

  return (
    <g
      className={`edge boundary-edge ${connection.visual.className} ${connection.aggregated ? 'aggregated ' : ''}${connection.selected ? 'selected ' : ''}${connection.previewed ? 'previewed ' : ''}${connection.scenarioEmphasized ? 'scenario-emphasized ' : ''}`}
      data-relationship-type={connection.relationshipType}
      data-directionality={connection.directionality}
      data-connection-visibility="boundary"
      data-boundary-side={boundary.side}
      tabIndex={0}
      role="button"
      aria-pressed={connection.selected}
      aria-label={`${connectionAriaLabel(connection)}, crosses current structural boundary to ${externalLabel}; boundary position is schematic`}
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
      {content}
    </g>
  );
}
