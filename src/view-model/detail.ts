import type {
  AppState,
  CapabilityRegistry,
  Configuration,
  ContextLocator,
  Entity,
  PropertyRegistry,
  PropertyValue,
  RuntimeConcept,
} from '../domain/types';
import {
  entityTypeLabel,
  formatMetadataValue,
  propertyLabel,
  relationshipTypeLabel,
  representativeEntityLabel,
} from './labels';

export type DetailAction = {
  kind: 'enter' | 'follow' | 'concept';
  label: string;
  target?: ContextLocator;
  conceptId?: string;
};

export interface DetailProperty {
  id: string;
  label: string;
  value: string;
  metadata: string[];
}

export interface DetailConnection {
  id: string;
  name: string;
  relationshipType: string;
  endpoints: string[];
}

export interface DetailConcept {
  id: string;
  name: string;
  role: string;
}

export interface DetailVM {
  title: string;
  subtitle: string;
  summary: string;
  identity: Array<[string, string]>;
  properties: DetailProperty[];
  scenarioState: Array<[string, string]>;
  containment: Array<[string, string]>;
  connections: DetailConnection[];
  traversal: Array<[string, string]>;
  evidence: Array<[string, string]>;
  actions: DetailAction[];
  peerActions: DetailAction[];
  concepts: DetailConcept[];
  isCurrentLocationSummary: boolean;
  sections: string[];
}

export interface DetailResources {
  capabilities: CapabilityRegistry;
  propertyRegistry: PropertyRegistry;
  concepts: Record<string, RuntimeConcept>;
}

function formatProperty(value: PropertyValue): string {
  const prefix = value.value?.approximate ? '≈ ' : '';
  if (value.value?.form === 'scalar') {
    const magnitude = value.value.number ?? '';
    return `${prefix}${magnitude}${value.value.unit ? ` ${value.value.unit}` : ''}`;
  }
  if (value.value?.form === 'range') {
    const min = value.value.min ?? '';
    const max = value.value.max ?? '';
    const unit = value.value.unit ? ` ${value.value.unit}` : '';
    return `${prefix}${min}–${max}${unit}`;
  }
  if (value.value?.text) return value.value.text;
  return formatMetadataValue(value.status ?? 'unavailable');
}

function entityIdForLocator(locator: ContextLocator): string | undefined {
  if (locator.kind === 'entity') return locator.entityId;
  if (locator.kind === 'representative_member') {
    return locator.path.at(-1) ?? locator.aggregateId;
  }
  return undefined;
}

function entityForLocator(
  configuration: Configuration,
  locator: ContextLocator,
): Entity | undefined {
  const entityId = entityIdForLocator(locator);
  return entityId ? configuration.entities[entityId] : undefined;
}

function conceptOccurrencesForTarget(
  configuration: Configuration,
  target: ContextLocator,
) {
  const entityId = entityIdForLocator(target);
  return configuration.conceptOccurrences.filter((occurrence) => {
    if (entityId) {
      return occurrence.target.type === 'entity' && occurrence.target.id === entityId;
    }
    if (target.kind === 'connection') {
      return (
        occurrence.target.type === 'connection' &&
        occurrence.target.id === target.connectionId
      );
    }
    return false;
  });
}

function scenarioStateForTarget(
  state: AppState,
  configuration: Configuration,
  target: ContextLocator,
): Array<[string, string]> {
  const scenario = configuration.scenarios[state.explore.scenarioId];
  if (!scenario) return [];

  if (target.kind === 'representative_member') {
    const modeledIds = [...target.path].reverse();
    if (!modeledIds.includes(target.aggregateId)) modeledIds.push(target.aggregateId);
    const contextualEffect = scenario.effects.find(
      (candidate) =>
        candidate.target.type === 'entity' && modeledIds.includes(candidate.target.id),
    );
    if (!contextualEffect) return [];
    const contextEntity = configuration.entities[contextualEffect.target.id];
    const prefix = contextEntity?.population ? 'Parent aggregate' : 'Modeled context';
    return [
      ...Object.entries(contextualEffect.state).map(([key, value]) => [
        `${prefix} ${formatMetadataValue(key)}`,
        typeof value === 'string' ? formatMetadataValue(value) : JSON.stringify(value),
      ] as [string, string]),
      ['Representative member', 'Individual state not specified'],
    ];
  }

  const entityId = entityIdForLocator(target);
  const targetType = target.kind === 'connection' ? 'connection' : entityId ? 'entity' : undefined;
  const targetId = target.kind === 'connection' ? target.connectionId : entityId;
  if (!targetType || !targetId) return [];

  const effect = scenario.effects.find(
    (candidate) =>
      candidate.target.type === targetType && candidate.target.id === targetId,
  );
  return effect
    ? Object.entries(effect.state).map(([key, value]) => [
        formatMetadataValue(key),
        typeof value === 'string' ? formatMetadataValue(value) : JSON.stringify(value),
      ])
    : [];
}

function locatorLabel(configuration: Configuration, locator: ContextLocator): string {
  if (locator.kind === 'entity') {
    return configuration.entities[locator.entityId]?.name ?? locator.entityId;
  }
  if (locator.kind === 'connection') {
    return configuration.connections[locator.connectionId]?.name ?? locator.connectionId;
  }
  if (locator.kind === 'representative_member') {
    const entity = configuration.entities[locator.path.at(-1) ?? locator.aggregateId];
    return entity ? representativeEntityLabel(entity) : 'Representative member';
  }
  if (locator.kind === 'concept') return locator.conceptId;
  return 'Concept Library';
}

function capabilityFor(resources: DetailResources, entity: Entity) {
  const capability = resources.capabilities.entity_types.find(
    (candidate) => candidate.entity_type === entity.entityType,
  );
  const profile = capability
    ? resources.capabilities.profiles[capability.profile]
    : undefined;
  return {capability, profile};
}

function isEnterable(
  entity: Entity,
  target: ContextLocator,
  configuration: Configuration,
  resources: DetailResources,
): boolean {
  const {capability} = capabilityFor(resources, entity);
  if (!capability || capability.enterability !== 'contextual') return false;
  if (entity.population?.expansionMode === 'representative_member') return true;
  if (entity.childIds.length > 0) return true;
  if (entity.representation === 'black_box') return false;
  const hasArchitecturalRelationships = Object.values(configuration.connections).some(
    (connection) => connection.endpointIds.includes(entity.id),
  );
  return hasArchitecturalRelationships &&
    (target.kind === 'entity' || target.kind === 'representative_member');
}

function propertyRows(
  entityProperties: Record<string, PropertyValue>,
  resources: DetailResources,
): DetailProperty[] {
  return Object.entries(entityProperties).map(([id, value]) => {
    const metadata = [
      value.scope ? `Scope: ${formatMetadataValue(value.scope)}` : undefined,
      value.basis ? `Basis: ${formatMetadataValue(value.basis)}` : undefined,
      value.directionalBasis
        ? `Direction: ${formatMetadataValue(value.directionalBasis)}`
        : undefined,
      value.evidence?.status
        ? `Evidence: ${formatMetadataValue(value.evidence.status)}`
        : undefined,
      value.derivation ? `Derivation: ${value.derivation}` : undefined,
    ].filter((item): item is string => Boolean(item));
    return {
      id,
      label: propertyLabel(id, resources.propertyRegistry.properties[id]),
      value: formatProperty(value),
      metadata,
    };
  });
}

function peerActions(state: AppState, configuration: Configuration): DetailAction[] {
  const locator = state.explore.structuralLocation;
  const entityId = entityIdForLocator(locator);
  if (!entityId) return [];
  const entity = configuration.entities[entityId];
  if (!entity?.parentId) return [];
  const parent = configuration.entities[entity.parentId];
  if (!parent) return [];
  const index = parent.childIds.indexOf(entity.id);
  if (index < 0) return [];

  const candidates = [
    {label: 'Previous peer', id: parent.childIds[index - 1]},
    {label: 'Next peer', id: parent.childIds[index + 1]},
  ].filter((candidate): candidate is {label: string; id: string} => Boolean(candidate.id));

  return candidates.map((candidate) => {
    const target: ContextLocator =
      locator.kind === 'representative_member'
        ? {
            ...locator,
            path: [...locator.path.slice(0, -1), candidate.id],
          }
        : {
            kind: 'entity',
            systemId: state.explore.systemId,
            configurationId: configuration.id,
            entityId: candidate.id,
          };
    return {
      kind: 'enter',
      label: `${candidate.label}: ${configuration.entities[candidate.id]?.name ?? candidate.id}`,
      target,
    };
  });
}

export function buildDetailVM(
  state: AppState,
  configuration: Configuration,
  resources: DetailResources,
): DetailVM {
  const selected = state.explore.selection;
  const target = selected ?? state.explore.structuralLocation;
  const isCurrentLocationSummary = selected === undefined;
  let title = 'Current location';
  let subtitle = '';
  let summary = '';
  let identity: Array<[string, string]> = [];
  let properties: DetailProperty[] = [];
  let containment: Array<[string, string]> = [];
  let connections: DetailConnection[] = [];
  const traversal: Array<[string, string]> = state.explore.traversalContext
    ? [
        ['Arrived from', locatorLabel(configuration, state.explore.traversalContext.origin)],
        ['Via relationship', locatorLabel(configuration, state.explore.traversalContext.via)],
      ]
    : [];
  let evidence: Array<[string, string]> = [];
  const actions: DetailAction[] = [];
  let sections = ['overview', 'properties', 'scenario', 'containment', 'connections', 'concepts', 'evidence', 'actions'];

  if (target.kind === 'entity' || target.kind === 'representative_member') {
    const entity = entityForLocator(configuration, target);
    if (entity) {
      const representative = target.kind === 'representative_member';
      const resolvedCapability = capabilityFor(resources, entity);
      sections = [...(resolvedCapability.profile?.detail_sections ?? sections)];
      if ((entity.childIds.length > 0 || entity.population) && !sections.includes('containment')) sections.push('containment');
      title = representative ? representativeEntityLabel(entity) : entity.name;
      subtitle = entityTypeLabel(entity.entityType);
      const explanatorySummary = representative
        ? 'Educational exemplar of a modeled repeated population; this context is not a numbered physical instance.'
        : entity.representation === 'black_box'
          ? 'Known architectural boundary; deeper internals are intentionally not modeled.'
          : entity.evidence.note ||
            `Tier ${entity.exploreTier} ${formatMetadataValue(entity.representation)} architectural entity.`;
      summary =
        isCurrentLocationSummary && entity.id === configuration.rootEntityId && configuration.scopeNotes
          ? `Current location. ${configuration.scopeNotes}`
          : isCurrentLocationSummary
            ? `Current location. ${explanatorySummary}`
            : explanatorySummary;

      identity = [
        ['Representation', formatMetadataValue(entity.representation)],
        ['Home tier', `Tier ${entity.exploreTier}`],
        ['Inventory classification', `${entity.inventory.category} — ${entity.inventory.item}`],
      ];
      if (representative) identity.push(['Identity', 'Representative / noncanonical exemplar']);
      for (const [key, value] of Object.entries(entity.productIdentity ?? {})) {
        identity.push([formatMetadataValue(key), value]);
      }

      properties = propertyRows(entity.properties, resources);

      const parent = entity.parentId ? configuration.entities[entity.parentId] : undefined;
      if (parent) containment.push(['Contained by', parent.name]);
      if (entity.childIds.length > 0) {
        containment.push([
          'Constituents',
          entity.childIds
            .map((id) => configuration.entities[id]?.name ?? id)
            .join(', '),
        ]);
      }
      if (entity.population) {
        const count =
          entity.population.count.form === 'unknown'
            ? 'Unknown'
            : (entity.population.count.value ?? entity.population.count.form);
        containment.push(['Population', count]);
        containment.push(['Count basis', formatMetadataValue(entity.population.count.basis)]);
        containment.push(['Expansion mode', formatMetadataValue(entity.population.expansionMode)]);
        containment.push([
          'Member identity',
          entity.population.individuallyAddressable
            ? 'Individually addressable'
            : 'Not individually addressable',
        ]);
      }

      connections = Object.values(configuration.connections)
        .filter((connection) => connection.endpointIds.includes(entity.id))
        .map((connection) => ({
          id: connection.id,
          name: connection.name,
          relationshipType: relationshipTypeLabel(connection.relationshipType),
          endpoints: connection.endpointIds.map(
            (id) => configuration.entities[id]?.name ?? id,
          ),
        }));

      evidence = [
        ['Evidence', formatMetadataValue(entity.evidence.status)],
        ...(entity.evidence.sourceIds.length > 0
          ? [['Source references', entity.evidence.sourceIds.join(', ')] as [string, string]]
          : []),
        ...(entity.evidence.note
          ? [['Evidence note', entity.evidence.note] as [string, string]]
          : []),
        ...(entity.id === configuration.rootEntityId
          ? configuration.modelingNotes.map(
              (note, index) => [
                configuration.modelingNotes.length === 1
                  ? 'Modeling note'
                  : `Modeling note ${index + 1}`,
                note,
              ] as [string, string],
            )
          : []),
      ];

      if (selected && isEnterable(entity, target, configuration, resources)) {
        actions.push({
          kind: 'enter',
          label:
            entity.population?.expansionMode === 'representative_member'
              ? 'Explore representative member'
              : 'Enter',
          target,
        });
      }
    }
  } else if (target.kind === 'connection') {
    const connection = configuration.connections[target.connectionId];
    if (connection) {
      title = connection.name;
      subtitle = relationshipTypeLabel(connection.relationshipType);
      const endpointNames = connection.endpointIds.map(
        (id) => configuration.entities[id]?.name ?? id,
      );
      summary = `Connects ${endpointNames.join(' ↔ ')}.`;
      identity = [
        ['Relationship', relationshipTypeLabel(connection.relationshipType)],
        ['Directionality', formatMetadataValue(connection.directionality)],
      ];
      properties = propertyRows(connection.properties, resources);
      connections = [
        {
          id: connection.id,
          name: connection.name,
          relationshipType: relationshipTypeLabel(connection.relationshipType),
          endpoints: endpointNames,
        },
      ];
      evidence = [
        ['Evidence', formatMetadataValue(connection.evidence.status)],
        ...(connection.evidence.sourceIds.length > 0
          ? [['Source references', connection.evidence.sourceIds.join(', ')] as [string, string]]
          : []),
      ];

      for (const entityId of connection.endpointIds) {
        actions.push({
          kind: 'follow',
          label: `Follow to ${configuration.entities[entityId]?.name ?? entityId}`,
          target: {
            kind: 'entity',
            systemId: state.explore.systemId,
            configurationId: configuration.id,
            entityId,
          },
        });
      }
    }
  }

  const conceptOccurrences = conceptOccurrencesForTarget(configuration, target);
  const concepts: DetailConcept[] = conceptOccurrences.map((occurrence) => ({
    id: occurrence.conceptId,
    name: resources.concepts[occurrence.conceptId]?.name ?? occurrence.conceptId,
    role: formatMetadataValue(occurrence.role),
  }));
  for (const concept of concepts) {
    actions.push({kind: 'concept', label: `Open ${concept.name}`, conceptId: concept.id});
  }

  return {
    title,
    subtitle,
    summary,
    identity,
    properties,
    scenarioState: scenarioStateForTarget(state, configuration, target),
    containment,
    connections,
    traversal,
    evidence,
    actions,
    peerActions: peerActions(state, configuration),
    concepts,
    isCurrentLocationSummary,
    sections,
  };
}
