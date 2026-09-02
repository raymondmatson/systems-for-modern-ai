import type {
  AppState,
  Configuration,
  ContextLocator,
  Entity,
} from '../domain/types';
import {layoutForContext} from './layout';
import {
  entityTypeLabel,
  relationshipTypeLabel,
  representativeEntityLabel,
} from './labels';

export interface SceneNode {
  entity: Entity;
  locator: ContextLocator;
  x: number;
  y: number;
  width: number;
  height: number;
  selected: boolean;
  previewed: boolean;
  location: boolean;
  scenarioEmphasized: boolean;
}

export interface SceneConnection {
  id: string;
  name: string;
  relationshipType: string;
  endpointNodeIds: string[];
  endpointLabels: string[];
  locator: ContextLocator;
  selected: boolean;
  previewed: boolean;
  scenarioEmphasized: boolean;
  aggregated: boolean;
}

export interface PreviewVM {
  title: string;
  subtitle: string;
  summary: string;
  scenarioState?: string;
}

function sameLocator(a: ContextLocator | undefined, b: ContextLocator) {
  return a !== undefined && JSON.stringify(a) === JSON.stringify(b);
}

function entityIdForRepresentative(locator: Extract<ContextLocator, {kind: 'representative_member'}>) {
  return locator.path.at(-1) ?? locator.aggregateId;
}

export function entityForLocation(
  configuration: Configuration,
  locator: ContextLocator,
): Entity | undefined {
  if (locator.kind === 'entity') return configuration.entities[locator.entityId];
  if (locator.kind === 'representative_member') {
    return (
      configuration.entities[entityIdForRepresentative(locator)] ??
      configuration.entities[locator.aggregateId]
    );
  }
  return configuration.entities[configuration.rootEntityId];
}

function childLocator(
  state: AppState,
  configuration: Configuration,
  entityId: string,
): ContextLocator {
  const current = state.explore.structuralLocation;
  if (current.kind === 'representative_member') {
    return {
      kind: 'representative_member',
      systemId: state.explore.systemId,
      configurationId: configuration.id,
      aggregateId: current.aggregateId,
      path: [...current.path, entityId],
    };
  }
  return {
    kind: 'entity',
    systemId: state.explore.systemId,
    configurationId: configuration.id,
    entityId,
  };
}

function isDescendantOrSelf(
  configuration: Configuration,
  entityId: string,
  ancestorId: string,
): boolean {
  let current: Entity | undefined = configuration.entities[entityId];
  while (current) {
    if (current.id === ancestorId) return true;
    current = current.parentId ? configuration.entities[current.parentId] : undefined;
  }
  return false;
}

function projectEndpointToVisible(
  configuration: Configuration,
  endpointId: string,
  visible: Set<string>,
  currentId: string,
): string | undefined {
  let current: Entity | undefined = configuration.entities[endpointId];
  while (current) {
    if (visible.has(current.id)) return current.id;
    if (current.id === currentId) return undefined;
    current = current.parentId ? configuration.entities[current.parentId] : undefined;
  }
  return undefined;
}

function scenarioStateSummary(
  state: AppState,
  configuration: Configuration,
  locator: ContextLocator,
): string | undefined {
  const scenario = configuration.scenarios[state.explore.scenarioId];
  if (!scenario) return undefined;
  const targetType = locator.kind === 'connection' ? 'connection' : 'entity';
  const targetId =
    locator.kind === 'connection'
      ? locator.connectionId
      : locator.kind === 'entity'
        ? locator.entityId
        : locator.kind === 'representative_member'
          ? entityIdForRepresentative(locator)
          : undefined;
  if (!targetId) return undefined;
  const effect = scenario.effects.find(
    (candidate) =>
      candidate.target.type === targetType && candidate.target.id === targetId,
  );
  if (!effect) return undefined;
  const entries = Object.entries(effect.state);
  if (entries.length === 0) return undefined;
  return entries
    .slice(0, 2)
    .map(([key, value]) => `${key.replaceAll('_', ' ')}: ${String(value)}`)
    .join(' · ');
}

export function buildPreviewVM(
  state: AppState,
  configuration: Configuration,
): PreviewVM | undefined {
  const locator = state.explore.preview;
  if (!locator) return undefined;

  if (locator.kind === 'connection') {
    const connection = configuration.connections[locator.connectionId];
    if (!connection) return undefined;
    const endpointNames = connection.endpointIds.map(
      (id) => configuration.entities[id]?.name ?? id,
    );
    return {
      title: connection.name,
      subtitle: relationshipTypeLabel(connection.relationshipType),
      summary: endpointNames.join(' ↔ '),
      scenarioState: scenarioStateSummary(state, configuration, locator),
    };
  }

  if (locator.kind === 'entity' || locator.kind === 'representative_member') {
    const entity = entityForLocation(configuration, locator);
    if (!entity) return undefined;
    const representative = locator.kind === 'representative_member';
    const population = entity.population;
    const count = population?.count.form === 'unknown'
      ? 'Population count unknown'
      : population?.count.value
        ? `${population.count.value} modeled members`
        : undefined;
    return {
      title: representative ? representativeEntityLabel(entity) : entity.name,
      subtitle: entityTypeLabel(entity.entityType),
      summary: [
        `Tier ${entity.exploreTier}`,
        entity.representation.replaceAll('_', ' '),
        count,
      ]
        .filter(Boolean)
        .join(' · '),
      scenarioState: scenarioStateSummary(state, configuration, locator),
    };
  }

  return undefined;
}

export function buildExploreScene(state: AppState, configuration: Configuration) {
  const current = entityForLocation(configuration, state.explore.structuralLocation);
  if (!current) {
    return {
      current: undefined,
      nodes: [] as SceneNode[],
      connections: [] as SceneConnection[],
      contextConnections: [] as SceneConnection[],
      width: 760,
      height: 360,
      layoutKind: 'generic' as const,
    };
  }

  const visibleEntities = current.childIds
    .map((id) => configuration.entities[id])
    .filter((entity): entity is Entity => Boolean(entity));
  const layout = layoutForContext(current, visibleEntities);
  const positions = new Map(layout.nodes.map((node) => [node.id, node]));
  const visible = new Set(visibleEntities.map((entity) => entity.id));
  const scenario = configuration.scenarios[state.explore.scenarioId];

  const emphasizedVisibleEntities = new Set<string>();
  for (const effect of scenario?.effects ?? []) {
    if (effect.target.type !== 'entity') continue;
    const projected = projectEndpointToVisible(
      configuration,
      effect.target.id,
      visible,
      current.id,
    );
    if (projected) emphasizedVisibleEntities.add(projected);
  }

  const emphasizedConnections = new Set(
    scenario?.effects
      .filter((effect) => effect.target.type === 'connection')
      .map((effect) => effect.target.id) ?? [],
  );

  const nodes: SceneNode[] = visibleEntities.map((entity) => {
    const position = positions.get(entity.id)!;
    const locator = childLocator(state, configuration, entity.id);
    return {
      ...position,
      entity,
      locator,
      selected: sameLocator(state.explore.selection, locator),
      previewed: sameLocator(state.explore.preview, locator),
      location: sameLocator(state.explore.structuralLocation, locator),
      scenarioEmphasized: emphasizedVisibleEntities.has(entity.id),
    };
  });

  const connections: SceneConnection[] = [];
  const contextConnections: SceneConnection[] = [];

  for (const connection of Object.values(configuration.connections)) {
    if (connection.endpointIds.length < 2) continue;
    const relevant = connection.endpointIds.some((endpointId) =>
      isDescendantOrSelf(configuration, endpointId, current.id),
    );
    if (!relevant) continue;

    const projected = connection.endpointIds
      .map((endpointId) =>
        projectEndpointToVisible(configuration, endpointId, visible, current.id),
      )
      .filter((id): id is string => Boolean(id));
    const endpointNodeIds = [...new Set(projected)];
    const locator: ContextLocator = {
      kind: 'connection',
      systemId: state.explore.systemId,
      configurationId: configuration.id,
      connectionId: connection.id,
    };
    const sceneConnection: SceneConnection = {
      id: connection.id,
      name: connection.name,
      relationshipType: connection.relationshipType,
      endpointNodeIds,
      endpointLabels: connection.endpointIds.map(
        (id) => configuration.entities[id]?.name ?? id,
      ),
      locator,
      selected: sameLocator(state.explore.selection, locator),
      previewed: sameLocator(state.explore.preview, locator),
      scenarioEmphasized: emphasizedConnections.has(connection.id),
      aggregated:
        endpointNodeIds.length !== connection.endpointIds.length ||
        connection.endpointIds.some((id) => !visible.has(id)),
    };

    if (endpointNodeIds.length >= 2) connections.push(sceneConnection);
    else contextConnections.push(sceneConnection);
  }

  return {
    current,
    nodes,
    connections,
    contextConnections,
    width: layout.width,
    height: layout.height,
    layoutKind: layout.kind,
  };
}
