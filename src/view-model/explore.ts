import type {
  AppState,
  Configuration,
  ContextLocator,
  Entity,
} from '../domain/types';
import {grid} from './layout';

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

export interface SceneEdge {
  id: string;
  name: string;
  from: string;
  to: string;
  relationshipType: string;
  locator: ContextLocator;
  selected: boolean;
  previewed: boolean;
  scenarioEmphasized: boolean;
}

function sameLocator(a: ContextLocator | undefined, b: ContextLocator) {
  return a !== undefined && JSON.stringify(a) === JSON.stringify(b);
}

function entityForLocation(configuration: Configuration, locator: ContextLocator) {
  if (locator.kind === 'entity') return configuration.entities[locator.entityId];
  if (locator.kind === 'representative_member') {
    const deepestId = locator.path.at(-1) ?? locator.aggregateId;
    return configuration.entities[deepestId] ?? configuration.entities[locator.aggregateId];
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

export function buildExploreScene(state: AppState, configuration: Configuration) {
  const current = entityForLocation(configuration, state.explore.structuralLocation);
  const ids = current?.childIds.length
    ? current.childIds
    : [current?.id ?? configuration.rootEntityId];
  const positions = grid(ids);
  const scenario = configuration.scenarios[state.explore.scenarioId];
  const emphasizedEntities = new Set(
    scenario?.effects
      .filter((effect) => effect.target.type === 'entity')
      .map((effect) => effect.target.id) ?? [],
  );
  const emphasizedConnections = new Set(
    scenario?.effects
      .filter((effect) => effect.target.type === 'connection')
      .map((effect) => effect.target.id) ?? [],
  );

  const nodes: SceneNode[] = positions.map((position) => {
    const entity = configuration.entities[position.id]!;
    const locator = childLocator(state, configuration, entity.id);
    return {
      ...position,
      entity,
      locator,
      selected: sameLocator(state.explore.selection, locator),
      previewed: sameLocator(state.explore.preview, locator),
      location: sameLocator(state.explore.structuralLocation, locator),
      scenarioEmphasized: emphasizedEntities.has(entity.id),
    };
  });

  const visible = new Set(ids);
  const edges: SceneEdge[] = Object.values(configuration.connections)
    .filter(
      (connection) =>
        connection.endpointIds.length >= 2 &&
        connection.endpointIds.every((endpoint) => visible.has(endpoint)),
    )
    .map((connection) => {
      const locator: ContextLocator = {
        kind: 'connection',
        systemId: state.explore.systemId,
        configurationId: configuration.id,
        connectionId: connection.id,
      };
      return {
        id: connection.id,
        name: connection.name,
        from: connection.endpointIds[0]!,
        to: connection.endpointIds[1]!,
        relationshipType: connection.relationshipType,
        locator,
        selected: sameLocator(state.explore.selection, locator),
        previewed: sameLocator(state.explore.preview, locator),
        scenarioEmphasized: emphasizedConnections.has(connection.id),
      };
    });

  return {current, nodes, edges};
}
