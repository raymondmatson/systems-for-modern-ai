import type {SceneAnatomyDepiction} from '../../view-model/explore';

export function AnatomySectionLabel({items}: {items: SceneAnatomyDepiction[]}) {
  if (items.length === 0) return null;
  return (
    <text
      className="anatomy-section-label"
      x="40"
      y={Math.min(...items.map((item) => item.y)) - 18}
      aria-hidden="true"
    >
      Physical anatomy · noninteractive
    </text>
  );
}

export function AnatomyGlyph({item}: {item: SceneAnatomyDepiction}) {
  return (
    <g
      className={`anatomy-depiction anatomy-${item.depiction.depictionKind} evidence-${item.depiction.evidence.status}`}
      transform={`translate(${item.x} ${item.y})`}
      aria-hidden="true"
      data-placement-basis={item.depiction.placementBasis}
      data-evidence-status={item.depiction.evidence.status}
    >
      <rect width={item.width} height={item.height} rx="8" />
      <text className="anatomy-label" x="12" y="23">
        {item.labelLines.map((line, index) => (
          <tspan key={`${item.depiction.id}-line-${index}`} x="12" dy={index === 0 ? 0 : 16}>
            {line}
          </tspan>
        ))}
      </text>
      <text className="anatomy-meta" x="12" y="61">
        {item.evidenceLabel} · {item.placementLabel}
      </text>
      {item.countLabel && (
        <text className="anatomy-count" x="12" y="78">
          {item.countLabel}
        </text>
      )}
    </g>
  );
}
