import type {
  AppState,
  Configuration,
  ContextLocator,
  Entity,
  AnatomyDepiction,
} from '../domain/types';
import {
  layoutForContext,
  type LayoutRect,
  type LayoutRegion,
  type NodeMediaMode,
} from './layout';
import {
  buildTopologyDepiction,
  shouldCompactTransferContext,
  topologyDepictionSpecForContext,
  type SceneTopologyDepiction,
} from './topologyDepictions';
import {
  structuralShellFamilyForEntityType,
  visualRoleForDepictionKind,
  visualRoleForEntityType,
  visualRoleLabel,
  type StructuralShellFamily,
  type VisualRole,
} from './visualRoles';
import {
  entityTypeLabel,
  relationshipTypeLabel,
  representativeEntityLabel,
  svgLabelFit,
} from './labels';
import {
  buildBoundaryRoute,
  buildConnectionRoutes,
  connectionVisualFor,
  type BoundaryRoutePresentation,
  type ConnectionRoute,
  type ConnectionVisualSpec,
} from './connectionVisuals';

export interface ScenePopulationPresentation {
  countLabel: string;
  basisLabel: string;
  expansionLabel: string;
  accessibleLabel: string;
}

export interface SceneEnclosure {
  entity: Entity;
  title: string;
  typeLabel: string;
  shellFamily: StructuralShellFamily;
  x: number;
  y: number;
  width: number;
  height: number;
  headerHeight: number;
  interior: LayoutRect;
  portReserve: {top: number; right: number; bottom: number; left: number};
  arrangementNotice?: string;
  representative: boolean;
  contextLabel: string;
  population?: ScenePopulationPresentation;
  selected: boolean;
  previewed: boolean;
  containsSelection: boolean;
  scenarioEmphasized: boolean;
}

export interface SceneNode {
  entity: Entity;
  locator: ContextLocator;
  x: number;
  y: number;
  width: number;
  height: number;
  visualRole: VisualRole;
  visualRoleLabel: string;
  shellFamily: StructuralShellFamily;
  mediaMode: NodeMediaMode;
  labelLines: string[];
  labelTruncated: boolean;
  population?: ScenePopulationPresentation;
  selected: boolean;
  containsSelection: boolean;
  previewed: boolean;
  location: boolean;
  scenarioEmphasized: boolean;
}

export type SceneCompositionRegion = LayoutRegion;

export interface SceneConnection {
  id: string;
  name: string;
  relationshipType: string;
  directionality: string;
  visual: ConnectionVisualSpec;
  endpointNodeIds: string[];
  endpointLabels: string[];
  routes: ConnectionRoute[];
  boundary?: BoundaryRoutePresentation;
  visibility: 'canvas' | 'boundary' | 'summarized';
  locator: ContextLocator;
  selected: boolean;
  previewed: boolean;
  scenarioEmphasized: boolean;
  aggregated: boolean;
}

export interface SceneAnatomyDepiction {
  depiction: AnatomyDepiction;
  labelLines: string[];
  evidenceLabel: string;
  placementLabel: string;
  showPlacementBadge: boolean;
  visualRole: VisualRole;
  visualRoleLabel: string;
  countLabel?: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PreviewVM {
  title: string;
  subtitle: string;
  summary: string;
  scenarioState?: string;
}

export interface SceneScenarioPresentation {
  id: string;
  name: string;
  description: string;
  isDefault: boolean;
  affectedTargetLabels: string[];
  structureNotice: string;
  representativeCaveat?: string;
}

function sameLocator(a: ContextLocator | undefined, b: ContextLocator) {
  return a !== undefined && JSON.stringify(a) === JSON.stringify(b);
}

function anatomyEvidenceLabel(depiction: AnatomyDepiction): string {
  switch (depiction.evidence.status) {
    case 'documented': return 'verified';
    case 'inferred':
    case 'simplified': return 'representative';
    case 'proprietary': return 'limited detail';
    case 'unknown': return 'unknown detail';
    default: return depiction.evidence.status.replaceAll('_', ' ');
  }
}

function anatomyCountLabel(depiction: AnatomyDepiction): string | undefined {
  if (!depiction.count?.value) return undefined;
  return `×${depiction.count.value}`;
}


function populationPresentation(population: Entity['population']): ScenePopulationPresentation | undefined {
  if (!population) return undefined;
  const basisLabel = population.count.basis.replaceAll('_', ' ');
  const accessibleExpansionLabel = population.expansionMode.replaceAll('_', ' ');
  const expansionLabel = population.expansionMode === 'representative_member'
    ? 'representative'
    : population.expansionMode === 'addressable_members'
      ? 'addressable'
      : 'aggregate';
  const countLabel = population.count.form === 'unknown'
    ? '×?'
    : population.count.value
      ? `×${population.count.value}`
      : 'Repeated';
  const accessibleCount = population.count.form === 'unknown'
    ? 'population count unknown'
    : population.count.value
      ? `population ${population.count.value}`
      : 'repeated population';
  return {
    countLabel,
    basisLabel,
    expansionLabel,
    accessibleLabel: `${accessibleCount}, count basis ${basisLabel}, ${accessibleExpansionLabel}`,
  };
}

function buildSceneEnclosure(
  state: AppState,
  configuration: Configuration,
  current: Entity,
  layout: ReturnType<typeof layoutForContext>,
): SceneEnclosure {
  const structuralLocation = state.explore.structuralLocation;
  const representative = structuralLocation.kind === 'representative_member';
  const currentPopulation = populationPresentation(current.population);
  const aggregate = structuralLocation.kind === 'representative_member'
    ? configuration.entities[structuralLocation.aggregateId]
    : undefined;
  const aggregatePopulation = currentPopulation ?? populationPresentation(aggregate?.population);
  const title = representative ? representativeEntityLabel(current) : current.name;
  const populationSuffix = representative && aggregatePopulation
    ? ` · exemplar from population ${aggregatePopulation.countLabel}`
    : '';
  const scenario = configuration.scenarios[state.explore.scenarioId];
  const representativeIds = structuralLocation.kind === 'representative_member'
    ? new Set([structuralLocation.aggregateId, ...structuralLocation.path])
    : undefined;
  const scenarioEmphasized = scenario?.effects.some(
    (effect) => effect.target.type === 'entity' && (
      representativeIds
        ? representativeIds.has(effect.target.id)
        : effect.target.id === current.id
    ),
  ) ?? false;
  return {
    entity: current,
    title,
    typeLabel: entityTypeLabel(current.entityType),
    shellFamily: structuralShellFamilyForEntityType(current.entityType),
    ...layout.enclosure,
    representative,
    contextLabel: representative
      ? `Representative context${populationSuffix}`
      : 'Current structural location',
    population: aggregatePopulation,
    selected: sameLocator(state.explore.selection, structuralLocation),
    previewed: sameLocator(state.explore.preview, structuralLocation),
    containsSelection: Boolean(state.explore.selection) && !sameLocator(state.explore.selection, structuralLocation),
    scenarioEmphasized,
  };
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

function pathStartsWith(path: readonly string[], prefix: readonly string[]) {
  return prefix.length <= path.length && prefix.every((id, index) => path[index] === id);
}

function nodeContainsSelection(
  configuration: Configuration,
  nodeEntity: Entity,
  nodeLocator: ContextLocator,
  selection: ContextLocator | undefined,
): boolean {
  if (!selection || sameLocator(selection, nodeLocator)) return false;

  if (selection.kind === 'entity') {
    return isDescendantOrSelf(configuration, selection.entityId, nodeEntity.id);
  }
  if (selection.kind === 'representative_member') {
    if (nodeLocator.kind === 'representative_member') {
      return (
        selection.aggregateId === nodeLocator.aggregateId &&
        pathStartsWith(selection.path, nodeLocator.path) &&
        selection.path.length > nodeLocator.path.length
      );
    }
    const selectionEntityId = entityIdForRepresentative(selection);
    return isDescendantOrSelf(configuration, selectionEntityId, nodeEntity.id);
  }
  if (selection.kind === 'connection') {
    return configuration.connections[selection.connectionId]?.endpointIds.some((endpointId) =>
      isDescendantOrSelf(configuration, endpointId, nodeEntity.id),
    ) ?? false;
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
  if (locator.kind === 'representative_member') {
    const modeledIds = [...locator.path].reverse();
    if (!modeledIds.includes(locator.aggregateId)) modeledIds.push(locator.aggregateId);
    const effect = scenario.effects.find(
      (candidate) =>
        candidate.target.type === 'entity' && modeledIds.includes(candidate.target.id),
    );
    if (!effect) return undefined;
    const stateText = Object.entries(effect.state)
      .slice(0, 1)
      .map(([key, value]) => `${key.replaceAll('_', ' ')}: ${String(value)}`)
      .join(' · ');
    return `${stateText} (modeled aggregate/context; representative member state not specified)`;
  }

  const targetType = locator.kind === 'connection' ? 'connection' : 'entity';
  const targetId =
    locator.kind === 'connection'
      ? locator.connectionId
      : locator.kind === 'entity'
        ? locator.entityId
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

function buildScenarioPresentation(
  state: AppState,
  configuration: Configuration,
): SceneScenarioPresentation | undefined {
  const scenario = configuration.scenarios[state.explore.scenarioId];
  if (!scenario) return undefined;
  const affectedTargetLabels = scenario.effects.map((effect) => {
    if (effect.target.type === 'entity') {
      return configuration.entities[effect.target.id]?.name ?? effect.target.id;
    }
    if (effect.target.type === 'connection') {
      return configuration.connections[effect.target.id]?.name ?? effect.target.id;
    }
    return configuration.name;
  });
  const location = state.explore.structuralLocation;
  const representativeCaveat = location.kind === 'representative_member' && scenario.effects.some(
    (effect) => effect.target.type === 'entity' && (
      effect.target.id === location.aggregateId || location.path.includes(effect.target.id)
    ),
  )
    ? 'Parent aggregate/context is Scenario-affected; individual representative-member state is not specified.'
    : undefined;
  return {
    id: scenario.id,
    name: scenario.name,
    description: scenario.description,
    isDefault: scenario.isDefault,
    affectedTargetLabels,
    structureNotice: 'Physical structure unchanged',
    representativeCaveat,
  };
}

export function buildExploreScene(state: AppState, configuration: Configuration) {
  const current = entityForLocation(configuration, state.explore.structuralLocation);
  if (!current) {
    return {
      current: undefined,
      enclosure: undefined as SceneEnclosure | undefined,
      nodes: [] as SceneNode[],
      connections: [] as SceneConnection[],
      contextConnections: [] as SceneConnection[],
      compositionRegions: [] as SceneCompositionRegion[],
      anatomyDepictions: [] as SceneAnatomyDepiction[],
      topologyDepictions: [] as SceneTopologyDepiction[],
      scenario: buildScenarioPresentation(state, configuration),
      width: 760,
      height: 360,
      layoutKind: 'generic' as const,
    };
  }

  const visibleEntities = current.childIds
    .map((id) => configuration.entities[id])
    .filter((entity): entity is Entity => Boolean(entity));
  const hasBoundaryCrossing = Object.values(configuration.connections).some((connection) => {
    const inside = connection.endpointIds.some((endpointId) =>
      isDescendantOrSelf(configuration, endpointId, current.id),
    );
    const outside = connection.endpointIds.some((endpointId) =>
      !isDescendantOrSelf(configuration, endpointId, current.id),
    );
    return inside && outside;
  });
  const topologySpec = topologyDepictionSpecForContext(configuration, current);
  const layout = layoutForContext(
    current,
    visibleEntities,
    {
      boundaryGutter: hasBoundaryCrossing ? 150 : 0,
      compactSparse: shouldCompactTransferContext(configuration, current),
      topologyDepiction: topologySpec,
    },
  );
  const enclosure = buildSceneEnclosure(state, configuration, current, layout);
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
      visualRole: visualRoleForEntityType(entity.entityType),
      visualRoleLabel: visualRoleLabel(visualRoleForEntityType(entity.entityType)),
      shellFamily: structuralShellFamilyForEntityType(entity.entityType),
      mediaMode: position.mediaMode,
      ...(() => {
        const fit = svgLabelFit(entity.name, position.labelMaxCharacters, position.labelMaxLines);
        return {labelLines: fit.lines, labelTruncated: fit.truncated};
      })(),
      population: populationPresentation(entity.population),
      selected: sameLocator(state.explore.selection, locator),
      containsSelection: nodeContainsSelection(
        configuration,
        entity,
        locator,
        state.explore.selection,
      ),
      previewed: sameLocator(state.explore.preview, locator),
      location: sameLocator(state.explore.structuralLocation, locator),
      scenarioEmphasized: emphasizedVisibleEntities.has(entity.id),
    };
  });

  const anatomyPositions = new Map(layout.anatomy.map((item) => [item.id, item]));
  const placementBases = new Set((current.anatomyDepictions ?? []).map((item) => item.placementBasis));
  const anatomyDepictions: SceneAnatomyDepiction[] = (current.anatomyDepictions ?? []).map((depiction) => {
    const position = anatomyPositions.get(depiction.id);
    if (!position) throw new Error(`Missing Phase 3 anatomy layout for ${depiction.id}`);
    const visualRole = visualRoleForDepictionKind(depiction.depictionKind);
    const maxChars = Math.max(18, Math.floor((position.width - 64) / 6.4));
    return {
      depiction,
      labelLines: svgLabelFit(depiction.label, maxChars, position.width < 200 ? 3 : 2).lines,
      evidenceLabel: anatomyEvidenceLabel(depiction),
      placementLabel: depiction.placementBasis === 'schematic'
        ? 'schematic placement'
        : 'Documented placement',
      showPlacementBadge: placementBases.size > 1 || depiction.placementBasis === 'documented',
      visualRole,
      visualRoleLabel: visualRoleLabel(visualRole),
      countLabel: anatomyCountLabel(depiction),
      ...position,
    };
  });

  const topologyDepictions: SceneTopologyDepiction[] = layout.topologyDepictions.map((position) => {
    const depiction = buildTopologyDepiction(configuration, current, position);
    if (!depiction) throw new Error(`Missing Phase 7 topology depiction source basis for ${position.id}`);
    return depiction;
  });

  const connections: SceneConnection[] = [];
  const contextConnections: SceneConnection[] = [];
  const boundaryCandidates: Array<{
    sceneConnection: SceneConnection;
    visibleNodeId?: string;
    externalEndpointLabels: string[];
    visibleEndpointIsSource: boolean;
    visibleEndpointIsTarget: boolean;
  }> = [];
  const routingNodes = nodes.map((node) => ({
    id: node.entity.id,
    x: node.x,
    y: node.y,
    width: node.width,
    height: node.height,
  }));

  for (const connection of Object.values(configuration.connections)) {
    if (connection.endpointIds.length < 2) continue;
    const insideEndpointIds = connection.endpointIds.filter((endpointId) =>
      isDescendantOrSelf(configuration, endpointId, current.id),
    );
    if (insideEndpointIds.length === 0) continue;
    const outsideEndpointIds = connection.endpointIds.filter((endpointId) =>
      !isDescendantOrSelf(configuration, endpointId, current.id),
    );

    const projectedByEndpoint = connection.endpointIds.map((endpointId) => ({
      endpointId,
      projectedId: projectEndpointToVisible(configuration, endpointId, visible, current.id),
    }));
    const endpointNodeIds = [
      ...new Set(
        projectedByEndpoint
          .map((item) => item.projectedId)
          .filter((id): id is string => Boolean(id)),
      ),
    ];
    const locator: ContextLocator = {
      kind: 'connection',
      systemId: state.explore.systemId,
      configurationId: configuration.id,
      connectionId: connection.id,
    };
    const crossesStructuralBoundary = outsideEndpointIds.length > 0;
    const sceneConnection: SceneConnection = {
      id: connection.id,
      name: connection.name,
      relationshipType: connection.relationshipType,
      directionality: connection.directionality,
      visual: connectionVisualFor(connection.relationshipType),
      endpointNodeIds,
      endpointLabels: connection.endpointIds.map(
        (id) => configuration.entities[id]?.name ?? id,
      ),
      routes: endpointNodeIds.length >= 2
        ? buildConnectionRoutes(routingNodes, endpointNodeIds, connection.directionality)
        : [],
      visibility: endpointNodeIds.length >= 2
        ? 'canvas'
        : crossesStructuralBoundary
          ? 'boundary'
          : 'summarized',
      locator,
      selected: sameLocator(state.explore.selection, locator),
      previewed: sameLocator(state.explore.preview, locator),
      scenarioEmphasized: emphasizedConnections.has(connection.id),
      aggregated:
        endpointNodeIds.length !== connection.endpointIds.length ||
        connection.endpointIds.some((id) => !visible.has(id)),
    };

    if (crossesStructuralBoundary) {
      const visibleNodeId = endpointNodeIds.length === 1 ? endpointNodeIds[0] : undefined;
      const sourceId = connection.endpointIds[0];
      const sourceProjection = sourceId
        ? projectEndpointToVisible(configuration, sourceId, visible, current.id)
        : undefined;
      const visibleEndpointIsSource = connection.directionality === 'source_to_target' && (
        visibleNodeId
          ? sourceProjection === visibleNodeId
          : sourceId === current.id
      );
      const visibleEndpointIsTarget = connection.directionality === 'source_to_target' && (
        visibleNodeId
          ? projectedByEndpoint.slice(1).some((item) => item.projectedId === visibleNodeId)
          : connection.endpointIds.slice(1).includes(current.id)
      );
      boundaryCandidates.push({
        sceneConnection,
        visibleNodeId,
        externalEndpointLabels: outsideEndpointIds.map(
          (id) => configuration.entities[id]?.name ?? id,
        ),
        visibleEndpointIsSource,
        visibleEndpointIsTarget,
      });
    }

    if (endpointNodeIds.length >= 2) connections.push(sceneConnection);
    else contextConnections.push(sceneConnection);
  }

  if (enclosure) {
    boundaryCandidates.forEach((candidate, index) => {
      candidate.sceneConnection.boundary = buildBoundaryRoute({
        connectionId: candidate.sceneConnection.id,
        allNodes: routingNodes,
        visibleNodeId: candidate.visibleNodeId,
        directionality: candidate.sceneConnection.directionality,
        visibleEndpointIsSource: candidate.visibleEndpointIsSource,
        visibleEndpointIsTarget: candidate.visibleEndpointIsTarget,
        enclosure,
        slotIndex: index,
        slotCount: boundaryCandidates.length,
        externalEndpointLabels: candidate.externalEndpointLabels,
      });
    });
  }

  return {
    current,
    enclosure,
    nodes,
    connections,
    contextConnections,
    compositionRegions: layout.regions,
    anatomyDepictions,
    topologyDepictions,
    scenario: buildScenarioPresentation(state, configuration),
    width: layout.width,
    height: layout.height,
    layoutKind: layout.kind,
  };
}
