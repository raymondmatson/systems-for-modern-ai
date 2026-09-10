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
  endpointNodeIds: string[];
  endpointLabels: string[];
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
      width: 760,
      height: 360,
      layoutKind: 'generic' as const,
    };
  }

  const visibleEntities = current.childIds
    .map((id) => configuration.entities[id])
    .filter((entity): entity is Entity => Boolean(entity));
  const layout = layoutForContext(current, visibleEntities);
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
        : 'documented placement',
      showPlacementBadge: placementBases.size > 1 || depiction.placementBasis === 'documented',
      visualRole,
      visualRoleLabel: visualRoleLabel(visualRole),
      countLabel: anatomyCountLabel(depiction),
      ...position,
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
    enclosure,
    nodes,
    connections,
    contextConnections,
    compositionRegions: layout.regions,
    anatomyDepictions,
    width: layout.width,
    height: layout.height,
    layoutKind: layout.kind,
  };
}
