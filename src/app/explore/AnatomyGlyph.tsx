import type {SceneAnatomyDepiction} from '../../view-model/explore';
import {RoleIcon} from './RoleIcon';

function evidencePattern(item: SceneAnatomyDepiction) {
  if (item.depiction.evidence.status === 'documented') return null;
  if (item.depiction.evidence.status === 'inferred' || item.depiction.evidence.status === 'simplified') {
    return <path className="anatomy-evidence-pattern" d={`M${item.width - 34} 10l24 24M${item.width - 24} 10l14 14`} />;
  }
  return <path className="anatomy-evidence-pattern limited" d={`M${item.width - 34} 12h22M${item.width - 34} 20h15M${item.width - 34} 28h9`} />;
}

export function AnatomyGlyph({item}: {item: SceneAnatomyDepiction}) {
  const evidenceBadgeWidth = Math.min(item.width - 78, Math.max(54, 18 + item.evidenceLabel.length * 5.4));
  return (
    <g
      className={`anatomy-depiction role-${item.visualRole} evidence-${item.depiction.evidence.status}`}
      transform={`translate(${item.x} ${item.y})`}
      aria-hidden="true"
      data-placement-basis={item.depiction.placementBasis}
      data-evidence-status={item.depiction.evidence.status}
      data-visual-role={item.visualRole}
    >
      <rect className="anatomy-shell" width={item.width} height={item.height} rx="8" />
      <rect className="anatomy-role-rail" width="5" height={item.height} rx="2" />
      <RoleIcon role={item.visualRole} x={13} y={13} />
      {evidencePattern(item)}
      <text className="anatomy-label" x="48" y="22">
        {item.labelLines.map((line, index) => (
          <tspan key={`${item.depiction.id}-line-${index}`} x="48" dy={index === 0 ? 0 : 15}>
            {line}
          </tspan>
        ))}
      </text>
      <g className="anatomy-evidence-badge" transform={`translate(48 ${item.height - 24})`}>
        <rect width={evidenceBadgeWidth} height="17" rx="8.5" />
        <text x={evidenceBadgeWidth / 2} y="12" textAnchor="middle">{item.evidenceLabel}</text>
      </g>
      {item.countLabel && (
        <text className="anatomy-count" x={48 + evidenceBadgeWidth + 8} y={item.height - 12}>
          {item.countLabel}
        </text>
      )}
      {item.showPlacementBadge && (
        <text className="anatomy-placement" x={item.width - 10} y={item.height - 12} textAnchor="end">
          {item.placementLabel}
        </text>
      )}
    </g>
  );
}
