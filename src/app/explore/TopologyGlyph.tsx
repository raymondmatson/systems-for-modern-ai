import type {SceneTopologyDepiction} from '../../view-model/topologyDepictions';

function DimensionLegend({depiction}: {depiction: SceneTopologyDepiction}) {
  const x = depiction.bounds.x + depiction.bounds.width - 154;
  const y = depiction.bounds.y + 20;
  return (
    <g className="topology-dimension-legend">
      {depiction.dimensions.map((dimension, index) => (
        <g key={dimension} transform={`translate(${x + index * 46} ${y})`}>
          <rect x="0" y="-11" width="34" height="17" rx="8.5" />
          <text x="17" y="1" textAnchor="middle">{dimension}</text>
        </g>
      ))}
    </g>
  );
}

/**
 * Presentation-only conceptual topology illustration. The glyph is purposely
 * aria-hidden and nonfocusable: it creates no system entity/connection target.
 * A visible/accessibility explanation is supplied by VisualKey.
 */
export function TopologyGlyph({depiction}: {depiction: SceneTopologyDepiction}) {
  return (
    <g
      className="topology-depiction topology-flattened-3d-torus"
      data-topology-depiction-id={depiction.id}
      data-topology-kind={depiction.kind}
      data-source-concept={depiction.sourceConceptId}
      data-nonliteral="true"
      aria-hidden="true"
    >
      <rect
        className="topology-depiction-shell"
        x={depiction.bounds.x}
        y={depiction.bounds.y}
        width={depiction.bounds.width}
        height={depiction.bounds.height}
        rx="10"
      />
      <text className="topology-depiction-title" x={depiction.bounds.x + 14} y={depiction.bounds.y + 20}>
        {depiction.title}
      </text>
      <text className="topology-depiction-subtitle" x={depiction.bounds.x + 14} y={depiction.bounds.y + 36}>
        {depiction.subtitle}
      </text>
      <DimensionLegend depiction={depiction} />

      <rect
        className="topology-field"
        x={depiction.field.x}
        y={depiction.field.y}
        width={depiction.field.width}
        height={depiction.field.height}
        rx="7"
      />

      {depiction.samplePoints.map((sample) => (
        <circle
          key={sample.id}
          className="topology-sample-point"
          cx={sample.x}
          cy={sample.y}
          r="4.5"
        />
      ))}

      {depiction.wrapConnections.map((connection) => (
        <g
          key={connection.id}
          className={`topology-connection topology-dimension-${connection.dimension.toLowerCase()}`}
          data-topology-connection-key={connection.id}
          data-topology-dimension={connection.dimension}
        >
          {connection.segments.map((segment) => (
            <line
              key={segment.id}
              className="topology-link"
              data-topology-segment-id={segment.id}
              x1={segment.x1}
              y1={segment.y1}
              x2={segment.x2}
              y2={segment.y2}
            />
          ))}
          {connection.markers.map((marker, index) => (
            <g
              key={`${connection.id}-marker-${index}`}
              className="topology-continuation-marker"
              data-continuation-label={marker.label}
            >
              <circle cx={marker.x} cy={marker.y - 3} r="8" />
              <text x={marker.x} y={marker.y} textAnchor={marker.anchor}>{marker.label}</text>
            </g>
          ))}
        </g>
      ))}

      <text
        className="topology-field-note"
        x={depiction.bounds.x + 14}
        y={depiction.bounds.y + depiction.bounds.height - 10}
      >
        Matching edge markers = one wraparound connection · placement and dimension lengths are schematic
      </text>
    </g>
  );
}
