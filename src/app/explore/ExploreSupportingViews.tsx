import type {buildExploreScene, SceneConnection} from '../../view-model/explore';
import {entityTypeLabel, formatMetadataValue} from '../../view-model/labels';
import type {PreviewHandlers, SelectTarget} from './types';

function ConnectionCards({
  connections,
  selectTarget,
  previewHandlers,
}: {
  connections: SceneConnection[];
  selectTarget: SelectTarget;
  previewHandlers: PreviewHandlers;
}) {
  return (
    <div className="connection-cards">
      {connections.map((connection) => (
        <button
          key={connection.id}
          aria-pressed={connection.selected}
          onClick={() => selectTarget(connection.locator)}
          {...previewHandlers(connection.locator)}
        >
          <strong>{connection.name}</strong>
          <span>{connection.visual.label} · {formatMetadataValue(connection.directionality)}</span>
          <small>{connection.endpointLabels.join(' ↔ ')}</small>
        </button>
      ))}
    </div>
  );
}

export function ContextConnections({
  scene,
  selectTarget,
  previewHandlers,
}: {
  scene: ReturnType<typeof buildExploreScene>;
  selectTarget: SelectTarget;
  previewHandlers: PreviewHandlers;
}) {
  const allConnections = [...scene.connections, ...scene.contextConnections];
  const boundaryConnections = allConnections.filter((connection) => connection.boundary);
  const summarizedConnections = scene.contextConnections.filter(
    (connection) => connection.visibility === 'summarized',
  );
  if (boundaryConnections.length === 0 && summarizedConnections.length === 0) return null;
  return (
    <section className="context-connections" aria-label="Connections outside or summarized within the current visual grouping">
      {boundaryConnections.length > 0 && (
        <section aria-labelledby="cross-connections-title">
          <h2 id="cross-connections-title">Cross-connections beyond this enclosure</h2>
          <ConnectionCards
            connections={boundaryConnections}
            selectTarget={selectTarget}
            previewHandlers={previewHandlers}
          />
        </section>
      )}
      {summarizedConnections.length > 0 && (
        <section aria-labelledby="summarized-connections-title">
          <h2 id="summarized-connections-title">Connections summarized inside visible aggregates</h2>
          <ConnectionCards
            connections={summarizedConnections}
            selectTarget={selectTarget}
            previewHandlers={previewHandlers}
          />
        </section>
      )}
    </section>
  );
}

export function SemanticExploreOutline({
  scene,
  selectTarget,
  previewHandlers,
}: {
  scene: ReturnType<typeof buildExploreScene>;
  selectTarget: SelectTarget;
  previewHandlers: PreviewHandlers;
}) {
  const allConnections = [...scene.connections, ...scene.contextConnections];
  if (scene.nodes.length === 0 && allConnections.length === 0) return null;
  return (
    <section className="semantic-outline" aria-label="Explore semantic structure">
      <h2>Explore structure</h2>
      <div className="semantic-targets">
        {scene.nodes.map((node) => (
          <button
            key={`semantic-${node.entity.id}`}
            aria-pressed={node.selected}
            onClick={() => selectTarget(node.locator)}
            {...previewHandlers(node.locator)}
          >
            <strong>{node.entity.name}</strong>
            <span>{entityTypeLabel(node.entity.entityType)}</span>
            {(node.scenarioEmphasized ||
              node.containsSelection ||
              node.locator.kind === 'representative_member') && (
              <small>
                {[
                  node.locator.kind === 'representative_member' ? 'Representative' : undefined,
                  node.containsSelection ? 'Contains current selection' : undefined,
                  node.scenarioEmphasized ? 'Scenario affected' : undefined,
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </small>
            )}
          </button>
        ))}
        {allConnections.map((connection) => (
          <button
            key={`semantic-${connection.id}`}
            aria-pressed={connection.selected}
            onClick={() => selectTarget(connection.locator)}
            {...previewHandlers(connection.locator)}
          >
            <strong>{connection.name}</strong>
            <span>{connection.visual.label} · {formatMetadataValue(connection.directionality)}</span>
            <small>{connection.endpointLabels.join(' ↔ ')}</small>
          </button>
        ))}
      </div>
    </section>
  );
}
