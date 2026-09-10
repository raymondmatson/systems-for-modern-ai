import type {SceneNode} from '../../view-model/explore';
import {entityTypeLabel} from '../../view-model/labels';
import type {PreviewHandlers, SelectTarget} from './types';
import {RoleIcon} from './RoleIcon';

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

function shellRadius(node: SceneNode) {
  switch (node.shellFamily) {
    case 'rack-enclosure': return 4;
    case 'fabric-domain': return 6;
    case 'device': return 14;
    case 'system-domain': return 12;
    default: return 9;
  }
}

function ShellFamilyDetail({node}: {node: SceneNode}) {
  const w = node.width;
  const h = node.height;
  switch (node.shellFamily) {
    case 'rack-enclosure':
      return <path className="node-shell-detail" d={`M10 8v${h - 16}M${w - 10} 8v${h - 16}`} />;
    case 'assembly':
      return <path className="node-shell-detail" d={`M12 9h38l7 7h${Math.max(12, w - 69)}`} />;
    case 'device':
      return <path className="node-shell-detail" d={`M0 34h7M0 67h7M${w - 7} 34h7M${w - 7} 67h7`} />;
    case 'fabric-domain':
      return <path className="node-shell-detail" d={`M12 8h18M8 12v18M${w - 12} 8h-18M${w - 8} 12v18`} />;
    case 'support':
      return <path className="node-shell-detail" d={`M${w - 40} 9h28v10`} />;
    default:
      return null;
  }
}

function AggregateBackplates({node}: {node: SceneNode}) {
  if (!node.population) return null;
  return (
    <g className="node-aggregate-stack" aria-hidden="true">
      <rect className="node-stack-backplate node-stack-backplate-2" x="8" y="8" width={node.width} height={node.height} rx={shellRadius(node)} />
      <rect className="node-stack-backplate node-stack-backplate-1" x="4" y="4" width={node.width} height={node.height} rx={shellRadius(node)} />
    </g>
  );
}

function MediaFallback({node}: {node: SceneNode}) {
  if (node.mediaMode === 'compact') {
    return (
      <g className="node-media-fallback compact" aria-hidden="true">
        <RoleIcon role={node.visualRole} x={16} y={18} />
      </g>
    );
  }
  return (
    <g className="node-media-fallback full" aria-hidden="true">
      <rect className="node-media-region" x="17" y="17" width="48" height="48" rx="8" />
      <RoleIcon role={node.visualRole} x={28} y={28} />
    </g>
  );
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
  const populationDescription = node.population ? `, ${node.population.accessibleLabel}` : '';
  return (
    <g
      transform={`translate(${node.x} ${node.y})`}
      className={`node role-${node.visualRole} shell-${node.shellFamily} ${node.selected ? 'selected ' : ''}${node.previewed ? 'previewed ' : ''}${
        node.location ? 'location ' : ''
      }${node.containsSelection ? 'contains-selection ' : ''}${
        node.scenarioEmphasized ? 'scenario-emphasized ' : ''
      }`}
      data-visual-role={node.visualRole}
      data-shell-family={node.shellFamily}
      data-has-media="false"
      data-media-mode={node.mediaMode}
      data-label-truncated={node.labelTruncated ? 'true' : 'false'}
      data-population={node.population?.countLabel ?? 'single'}
      tabIndex={0}
      role="button"
      aria-pressed={node.selected}
      aria-current={node.location ? 'location' : undefined}
      aria-label={`${node.entity.name}, ${entityTypeLabel(node.entity.entityType)}, ${node.visualRoleLabel} role${populationDescription}${
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
      <AggregateBackplates node={node} />
      <rect className="node-shell" width={node.width} height={node.height} rx={shellRadius(node)} />
      <rect className="node-role-rail" x="0" y="0" width="7" height={node.height} rx="3" />
      <MediaFallback node={node} />
      <ShellFamilyDetail node={node} />
      <title>{node.entity.name}</title>
    </g>
  );
}

/**
 * Text and count badges are rendered in a dedicated layer above entity shells.
 * The layer remains noninteractive so pointer input resolves to NodeGlyph.
 */
export function NodeLabelGlyph({node}: {node: SceneNode}) {
  const lines = node.labelLines;
  const compact = node.mediaMode === 'compact';
  const nameX = compact ? 50 : 78;
  const nameY = compact ? 24 : 26;
  const lineHeight = compact ? 15 : 16;
  const typeY = Math.min(
    node.population ? node.height - 34 : node.height - 15,
    nameY + Math.max(0, lines.length - 1) * lineHeight + 22,
  );
  const metaY = node.height - 15;
  return (
    <g
      className={`node-label-layer media-${node.mediaMode}`}
      transform={`translate(${node.x} ${node.y})`}
      aria-hidden="true"
    >
      <text className="node-name" x={nameX} y={nameY}>
        {lines.map((line, index) => (
          <tspan key={`${line}-${index}`} x={nameX} dy={index === 0 ? 0 : lineHeight}>
            {line}
          </tspan>
        ))}
      </text>
      <text className="node-type" x={nameX} y={typeY}>
        {node.visualRoleLabel} · {entityTypeLabel(node.entity.entityType)}
      </text>
      {node.population && (
        <g className="node-population-label">
          <rect className="node-count-chip" x={nameX} y={metaY - 14} width="50" height="20" rx="10" />
          <text className="node-count-text" x={nameX + 25} y={metaY} textAnchor="middle">
            {node.population.countLabel}
          </text>
          <text className="node-expansion-text" x={nameX + 58} y={metaY}>
            {node.population.expansionLabel}
          </text>
        </g>
      )}
    </g>
  );
}
