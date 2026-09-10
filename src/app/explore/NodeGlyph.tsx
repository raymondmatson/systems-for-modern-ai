import type {SceneNode} from '../../view-model/explore';
import {
  entityTypeLabel,
  formatMetadataValue,
  svgLabelLines,
} from '../../view-model/labels';
import type {Population} from '../../domain/types';
import type {PreviewHandlers, SelectTarget} from './types';

function populationText(population: Population) {
  if (population.count.form === 'unknown') return 'Population unknown';
  const count = population.count.value ? `${population.count.value} members` : 'Repeated population';
  return `${count} · ${formatMetadataValue(population.expansionMode)}`;
}

function nodeStateDescription(node: SceneNode) {
  return [
    node.location ? 'current location' : undefined,
    node.selected ? 'selected' : undefined,
    node.containsSelection ? 'contains current selection' : undefined,
    node.scenarioEmphasized ? 'affected by active scenario' : undefined,
    node.locator.kind === 'representative_member' ? 'representative context' : undefined,
  ]
    .filter(Boolean)
    .join(', ');
}

export function NodeGlyph({
  node,
  previewHandlers,
  selectTarget,
}: {
  node: SceneNode;
  previewHandlers: PreviewHandlers;
  selectTarget: SelectTarget;
}) {
  const stateDescription = nodeStateDescription(node);
  return (
    <g
      transform={`translate(${node.x} ${node.y})`}
      className={`node ${node.selected ? 'selected ' : ''}${node.previewed ? 'previewed ' : ''}${
        node.location ? 'location ' : ''
      }${node.containsSelection ? 'contains-selection ' : ''}${
        node.scenarioEmphasized ? 'scenario-emphasized ' : ''
      }`}
      tabIndex={0}
      role="button"
      aria-pressed={node.selected}
      aria-current={node.location ? 'location' : undefined}
      aria-label={`${node.entity.name}, ${entityTypeLabel(node.entity.entityType)}${
        stateDescription ? `, ${stateDescription}` : ''
      }`}
      {...previewHandlers(node.locator)}
      onClick={() => selectTarget(node.locator)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          event.stopPropagation();
          selectTarget(node.locator);
        }
      }}
    >
      <rect width={node.width} height={node.height} rx="10" />
      <title>{node.entity.name}</title>
    </g>
  );
}

/**
 * Text is rendered in a dedicated layer above entity shells. It is deliberately
 * noninteractive so pointer interaction continues to resolve to NodeGlyph.
 */
export function NodeLabelGlyph({node}: {node: SceneNode}) {
  const lines = svgLabelLines(node.entity.name);
  const typeY = lines.length > 1 ? 67 : 55;
  const metaY = lines.length > 1 ? 84 : 75;
  return (
    <g
      className="node-label-layer"
      transform={`translate(${node.x} ${node.y})`}
      aria-hidden="true"
    >
      <text className="node-name" x="12" y="27">
        {lines.map((line, index) => (
          <tspan key={`${line}-${index}`} x="12" dy={index === 0 ? 0 : 17}>
            {line}
          </tspan>
        ))}
      </text>
      <text className="node-type" x="12" y={typeY}>
        {entityTypeLabel(node.entity.entityType)}
      </text>
      {node.entity.population && (
        <text className="node-meta" x="12" y={metaY}>
          {populationText(node.entity.population)}
        </text>
      )}
    </g>
  );
}
