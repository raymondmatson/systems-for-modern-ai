import type {SceneEnclosure} from '../../view-model/explore';

function FamilyDecoration({enclosure}: {enclosure: SceneEnclosure}) {
  const {x, y, width, height, shellFamily} = enclosure;

  if (shellFamily === 'rack-enclosure') {
    return (
      <g className="enclosure-family-detail enclosure-rack-rails">
        <line x1={x + 10} y1={y + 8} x2={x + 10} y2={y + height - 8} />
        <line x1={x + width - 10} y1={y + 8} x2={x + width - 10} y2={y + height - 8} />
      </g>
    );
  }

  if (shellFamily === 'fabric-domain') {
    return (
      <g className="enclosure-family-detail enclosure-domain-corners">
        <path d={`M${x + 14} ${y + 34}v-12h12M${x + width - 14} ${y + 34}v-12h-12`} />
        <path d={`M${x + 14} ${y + height - 18}v10h12M${x + width - 14} ${y + height - 18}v10h-12`} />
      </g>
    );
  }

  if (shellFamily === 'assembly') {
    return (
      <path
        className="enclosure-family-detail enclosure-assembly-header"
        d={`M${x + 12} ${y + 8}h54l8 8h${Math.max(24, width - 94)}`}
      />
    );
  }

  if (shellFamily === 'device') {
    return (
      <g className="enclosure-family-detail enclosure-device-pins">
        <path d={`M${x - 4} ${y + 88}h8M${x - 4} ${y + 116}h8M${x + width - 4} ${y + 88}h8M${x + width - 4} ${y + 116}h8`} />
      </g>
    );
  }

  return null;
}

/**
 * Presentation-only depiction of the already-current Structural Location.
 * It is intentionally noninteractive and never creates containment or identity.
 */
export function EnclosureGlyph({enclosure}: {enclosure: SceneEnclosure | undefined}) {
  if (!enclosure) return null;
  const radius = enclosure.shellFamily === 'rack-enclosure'
    ? 4
    : enclosure.shellFamily === 'fabric-domain'
      ? 6
      : enclosure.shellFamily === 'system-domain'
        ? 16
        : 10;

  return (
    <g
      className={`scene-enclosure enclosure-${enclosure.shellFamily}${enclosure.representative ? ' representative' : ''}`}
      data-shell-family={enclosure.shellFamily}
      data-representative={enclosure.representative ? 'true' : 'false'}
    >
      <rect
        className="enclosure-frame"
        x={enclosure.x}
        y={enclosure.y}
        width={enclosure.width}
        height={enclosure.height}
        rx={radius}
      />
      <line
        className="enclosure-header-divider"
        x1={enclosure.x + 1}
        x2={enclosure.x + enclosure.width - 1}
        y1={enclosure.y + enclosure.headerHeight}
        y2={enclosure.y + enclosure.headerHeight}
      />
      <FamilyDecoration enclosure={enclosure} />
      <text className="enclosure-title" x={enclosure.x + 20} y={enclosure.y + 27}>
        {enclosure.title}
      </text>
      <text className="enclosure-context" x={enclosure.x + 20} y={enclosure.y + 47}>
        {enclosure.typeLabel} · {enclosure.contextLabel}
      </text>
      {enclosure.arrangementNotice && (
        <text className="enclosure-arrangement-notice" x={enclosure.x + 20} y={enclosure.y + 66}>
          {enclosure.arrangementNotice}
        </text>
      )}
      {enclosure.representative && (
        <g className="representative-ribbon" transform={`translate(${enclosure.x + enclosure.width - 132} ${enclosure.y + 14})`}>
          <rect width="112" height="24" rx="12" />
          <text x="56" y="16" textAnchor="middle">Representative</text>
        </g>
      )}
    </g>
  );
}
