import type {LayoutRegion} from '../../view-model/layout';

/**
 * Presentation-only region backing. Regions group already-modeled visible
 * content for readability; they never create a new semantic parent.
 */
export function CompositionRegionGlyph({region}: {region: LayoutRegion}) {
  return (
    <g
      className={`composition-region region-${region.kind}`}
      data-region-id={region.id}
      data-region-kind={region.kind}
      data-nonliteral={region.nonliteral ? 'true' : 'false'}
      aria-hidden="true"
    >
      <rect
        className="composition-region-shell"
        x={region.x}
        y={region.y}
        width={region.width}
        height={region.height}
        rx={region.kind === 'rack-population' ? 6 : 10}
      />
      {region.label && (
        <text className="composition-region-label" x={region.x + 14} y={region.y + 19}>
          {region.label}
        </text>
      )}
    </g>
  );
}
