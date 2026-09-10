import type {buildExploreScene} from '../../view-model/explore';
import {entityTypeLabel, relationshipTypeLabel} from '../../view-model/labels';
import type {PreviewHandlers, SelectTarget} from './types';

export function ContextConnections({
  scene,
  selectTarget,
  previewHandlers,
}: {
  scene: ReturnType<typeof buildExploreScene>;
  selectTarget: SelectTarget;
  previewHandlers: PreviewHandlers;
}) {
  if (scene.contextConnections.length === 0) return null;
  return (
    <section className="context-connections" aria-labelledby="cross-connections-title">
      <h2 id="cross-connections-title">Cross-connections beyond this visual grouping</h2>
      <div className="connection-cards">
        {scene.contextConnections.map((connection) => (
          <button
            key={connection.id}
            aria-pressed={connection.selected}
            onClick={() => selectTarget(connection.locator)}
            {...previewHandlers(connection.locator)}
          >
            <strong>{connection.name}</strong>
            <span>{relationshipTypeLabel(connection.relationshipType)}</span>
            <small>{connection.endpointLabels.join(' ↔ ')}</small>
          </button>
        ))}
      </div>
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
            <span>{relationshipTypeLabel(connection.relationshipType)}</span>
            <small>{connection.endpointLabels.join(' ↔ ')}</small>
          </button>
        ))}
      </div>
    </section>
  );
}
