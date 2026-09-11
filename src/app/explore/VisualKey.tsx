import type {buildExploreScene} from '../../view-model/explore';
import type {ConnectionEndpointMarker} from '../../view-model/connectionVisuals';

function KeyMarker({marker}: {marker: ConnectionEndpointMarker}) {
  switch (marker) {
    case 'connector': return <rect className="visual-key-marker" x="38" y="7" width="7" height="7" rx="1.5" />;
    case 'path': return <circle className="visual-key-marker" cx="41.5" cy="10.5" r="4" />;
    case 'dependency': return <path className="visual-key-marker" d="M41.5 5.5L46.5 10.5L41.5 15.5L36.5 10.5Z" />;
    case 'affinity': return <><circle className="visual-key-marker" cx="39" cy="10.5" r="2"/><circle className="visual-key-marker" cx="44" cy="10.5" r="2"/></>;
    case 'membership': return <path className="visual-key-marker" d="M46 5.5H38V15.5H46" />;
    case 'redundancy': return <><circle className="visual-key-marker" cx="39.5" cy="10.5" r="3.5"/><circle className="visual-key-marker" cx="43.5" cy="10.5" r="3.5"/></>;
    case 'control': return <rect className="visual-key-marker" x="37.5" y="6.5" width="8" height="8" />;
    default: return <circle className="visual-key-marker" cx="41.5" cy="10.5" r="3" />;
  }
}

export function VisualKey({scene}: {scene: ReturnType<typeof buildExploreScene>}) {
  const byType = new Map(
    [...scene.connections, ...scene.contextConnections].map((connection) => [
      connection.relationshipType,
      connection.visual,
    ]),
  );
  const topology = scene.topologyDepictions[0];
  if (byType.size === 0 && !topology) return null;
  const visuals = [...byType.values()].sort((a, b) => a.label.localeCompare(b.label));
  const hasBoundary = [...scene.connections, ...scene.contextConnections].some((connection) => connection.boundary);
  const hasDirectionality = [...scene.connections, ...scene.contextConnections].some(
    (connection) => connection.directionality !== 'undirected',
  );

  return (
    <section className="visual-key" aria-labelledby="visual-key-title">
      <h2 id="visual-key-title">Connection key</h2>
      {visuals.length > 0 && (
        <>
          <ul>
            {visuals.map((visual) => (
              <li key={visual.relationshipType} data-relationship-type={visual.relationshipType}>
                <svg className="visual-key-swatch" width="50" height="21" viewBox="0 0 50 21" aria-hidden="true">
                  {visual.relationshipType === 'redundancy_protection' && (
                    <line className="visual-key-redundancy-companion" x1="4" y1="10.5" x2="42" y2="10.5" />
                  )}
                  <line
                    className="visual-key-line"
                    x1="4"
                    y1="10.5"
                    x2="42"
                    y2="10.5"
                    strokeDasharray={visual.dashArray}
                  />
                  <KeyMarker marker={visual.marker} />
                </svg>
                <span>{visual.label}</span>
              </li>
            ))}
          </ul>
          <p>
            {hasDirectionality ? 'Arrow markers show authored system directionality. ' : ''}
            {hasBoundary ? 'Boundary stubs show that a relationship continues outside the current enclosure; their side/position is schematic. ' : ''}
            Line type and endpoint marker identify relationship family without relying on color.
          </p>
        </>
      )}
      {topology && (
        <div className="topology-key" aria-label="Flattened torus topology explanation">
          <h3>Flattened torus guide</h3>
          <p>{topology.accessibleDescription}</p>
        </div>
      )}
    </section>
  );
}
