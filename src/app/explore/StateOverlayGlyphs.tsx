import type {SceneEnclosure, SceneNode} from '../../view-model/explore';

function nodeRadius(node: SceneNode) {
  switch (node.shellFamily) {
    case 'rack-enclosure': return 4;
    case 'fabric-domain': return 6;
    case 'device': return 14;
    case 'system-domain': return 12;
    default: return 9;
  }
}

function bracketPath(x: number, y: number, width: number, height: number, length = 13) {
  return [
    `M${x} ${y + length}V${y}H${x + length}`,
    `M${x + width - length} ${y}H${x + width}V${y + length}`,
    `M${x + width} ${y + height - length}V${y + height}H${x + width - length}`,
    `M${x + length} ${y + height}H${x}V${y + height - length}`,
  ].join('');
}

export function NodeScenarioUnderlayGlyph({node}: {node: SceneNode}) {
  if (!node.scenarioEmphasized) return null;
  return (
    <rect
      className="node-scenario-underlay"
      x={node.x - 6}
      y={node.y - 6}
      width={node.width + 12}
      height={node.height + 12}
      rx={nodeRadius(node) + 5}
    />
  );
}

export function EnclosureScenarioUnderlayGlyph({enclosure}: {enclosure: SceneEnclosure | undefined}) {
  if (!enclosure?.scenarioEmphasized) return null;
  return (
    <rect
      className="enclosure-scenario-underlay"
      x={enclosure.x - 7}
      y={enclosure.y - 7}
      width={enclosure.width + 14}
      height={enclosure.height + 14}
      rx="12"
    />
  );
}

export function NodeScenarioMarkerGlyph({node}: {node: SceneNode}) {
  if (!node.scenarioEmphasized) return null;
  return (
    <g
      className="node-scenario-marker"
      transform={`translate(${node.x + node.width - 28} ${node.y + 10})`}
      aria-hidden="true"
    >
      <path d="M10 0L20 10L10 20L0 10Z" />
      <text x="10" y="13" textAnchor="middle">S</text>
    </g>
  );
}

export function EnclosureScenarioMarkerGlyph({enclosure}: {enclosure: SceneEnclosure | undefined}) {
  if (!enclosure?.scenarioEmphasized) return null;
  return (
    <g
      className="enclosure-scenario-marker"
      transform={`translate(${enclosure.x + enclosure.width - 32} ${enclosure.y + enclosure.headerHeight - 26})`}
      aria-hidden="true"
    >
      <path d="M10 0L20 10L10 20L0 10Z" />
      <text x="10" y="13" textAnchor="middle">S</text>
    </g>
  );
}

export function NodeInteractionOverlayGlyph({node}: {node: SceneNode}) {
  if (!node.selected && !node.previewed && !node.containsSelection) return null;
  const radius = nodeRadius(node);
  return (
    <g className="node-interaction-overlay" aria-hidden="true">
      {node.previewed && (
        <path
          className="node-focus-brackets"
          d={bracketPath(node.x - 5, node.y - 5, node.width + 10, node.height + 10)}
        />
      )}
      {node.selected && (
        <>
          <rect
            className="node-selection-ring"
            x={node.x - 4}
            y={node.y - 4}
            width={node.width + 8}
            height={node.height + 8}
            rx={radius + 4}
          />
          <path
            className="node-selection-corner"
            d={`M${node.x + 5} ${node.y - 4}H${node.x - 4}V${node.y + 5}`}
          />
        </>
      )}
      {node.containsSelection && !node.selected && (
        <g className="node-descendant-marker" transform={`translate(${node.x + node.width - 27} ${node.y + node.height - 25})`}>
          <rect x="2" y="2" width="14" height="12" rx="2" />
          <rect x="7" y="6" width="14" height="12" rx="2" />
        </g>
      )}
    </g>
  );
}

export function EnclosureInteractionOverlayGlyph({enclosure}: {enclosure: SceneEnclosure | undefined}) {
  if (!enclosure || (!enclosure.selected && !enclosure.previewed && !enclosure.containsSelection)) return null;
  return (
    <g className="enclosure-interaction-overlay" aria-hidden="true">
      {enclosure.previewed && (
        <path
          className="enclosure-focus-brackets"
          d={bracketPath(enclosure.x - 5, enclosure.y - 5, enclosure.width + 10, enclosure.height + 10, 18)}
        />
      )}
      {enclosure.selected && (
        <rect
          className="enclosure-selection-ring"
          x={enclosure.x - 4}
          y={enclosure.y - 4}
          width={enclosure.width + 8}
          height={enclosure.height + 8}
          rx="12"
        />
      )}
      {enclosure.containsSelection && !enclosure.selected && (
        <g className="enclosure-descendant-marker" transform={`translate(${enclosure.x + enclosure.width - 62} ${enclosure.y + enclosure.headerHeight - 26})`}>
          <rect x="2" y="2" width="14" height="12" rx="2" />
          <rect x="7" y="6" width="14" height="12" rx="2" />
        </g>
      )}
    </g>
  );
}
