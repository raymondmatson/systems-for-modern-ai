import type {
  AppState,
  Configuration,
  ContextLocator,
  Entity,
  PropertyValue,
} from '../domain/types';

export type DetailAction = {
  kind: 'enter' | 'follow' | 'concept';
  label: string;
  target?: ContextLocator;
  conceptId?: string;
};

export interface DetailVM {
  title: string;
  subtitle: string;
  summary: string;
  properties: Array<[string, string]>;
  scenarioState: Array<[string, string]>;
  actions: DetailAction[];
  concepts: string[];
  isCurrentLocationSummary: boolean;
}

function formatProperty(value: PropertyValue): string {
  if (value.value?.form === 'scalar') {
    const magnitude = value.value.number ?? '';
    return `${magnitude}${value.value.unit ? ` ${value.value.unit}` : ''}`;
  }
  if (value.value?.form === 'range') {
    const min = value.value.min ?? '';
    const max = value.value.max ?? '';
    const unit = value.value.unit ? ` ${value.value.unit}` : '';
    return `${min}–${max}${unit}`;
  }
  if (value.value?.text) return value.value.text;
  return value.status ?? '';
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

function conceptIdsForTarget(
  configuration: Configuration,
  target: ContextLocator,
): string[] {
  const entityId = entityIdForLocator(target);
  return configuration.conceptOccurrences
    .filter((occurrence) => {
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
    })
    .map((occurrence) => occurrence.conceptId);
}

function scenarioStateForTarget(
  state: AppState,
  configuration: Configuration,
  target: ContextLocator,
): Array<[string, string]> {
  const scenario = configuration.scenarios[state.explore.scenarioId];
  if (!scenario) return [];
  const entityId = entityIdForLocator(target);
  const targetType = target.kind === 'connection' ? 'connection' : entityId ? 'entity' : undefined;
  const targetId = target.kind === 'connection' ? target.connectionId : entityId;
  if (!targetType || !targetId) return [];

  const effect = scenario.effects.find(
    (candidate) =>
      candidate.target.type === targetType && candidate.target.id === targetId,
  );
  if (!effect) return [];
  return Object.entries(effect.state).map(([key, value]) => [
    key.replaceAll('_', ' '),
    typeof value === 'string' ? value : JSON.stringify(value),
  ]);
}

export function buildDetailVM(
  state: AppState,
  configuration: Configuration,
): DetailVM {
  const selected = state.explore.selection;
  const target = selected ?? state.explore.structuralLocation;
  const isCurrentLocationSummary = selected === undefined;
  let title = 'Current location';
  let subtitle = '';
  let summary = '';
  let properties: Array<[string, string]> = [];
  const actions: DetailAction[] = [];

  if (target.kind === 'entity' || target.kind === 'representative_member') {
    const entity = entityForLocator(configuration, target);
    if (entity) {
      const representative = target.kind === 'representative_member';
      title = representative ? `Representative ${entity.name}` : entity.name;
      subtitle = entity.entityType.replaceAll('_', ' ');
      summary = representative
        ? 'Educational exemplar of the modeled repeated population; it is not a numbered physical instance.'
        : entity.representation === 'black_box'
          ? 'Known architectural boundary; deeper internals are intentionally not modeled.'
          : `Tier ${entity.exploreTier} ${entity.representation} entity.`;
      if (isCurrentLocationSummary) {
        summary = `Current location. ${summary}`;
      }

      properties = Object.entries(entity.properties).map(([key, value]) => [
        key.replaceAll('_', ' '),
        formatProperty(value),
      ]);

      if (selected) {
        const hasChildren = entity.childIds.length > 0;
        const representativePopulation =
          entity.population?.expansionMode === 'representative_member';
        if (hasChildren || representativePopulation) {
          actions.push({
            kind: 'enter',
            label: representativePopulation
              ? 'Explore representative member'
              : 'Enter',
            target,
          });
        }
      }
    }
  } else if (target.kind === 'connection') {
    const connection = configuration.connections[target.connectionId];
    if (connection) {
      title = connection.name;
      subtitle = connection.relationshipType.replaceAll('_', ' ');
      summary = `Connects ${connection.endpointIds.join(' ↔ ')}.`;
      properties = Object.entries(connection.properties).map(([key, value]) => [
        key.replaceAll('_', ' '),
        formatProperty(value),
      ]);

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

  const concepts = conceptIdsForTarget(configuration, target);
  for (const conceptId of concepts) {
    actions.push({kind: 'concept', label: `Open ${conceptId}`, conceptId});
  }

  return {
    title,
    subtitle,
    summary,
    properties,
    scenarioState: scenarioStateForTarget(state, configuration, target),
    actions,
    concepts,
    isCurrentLocationSummary,
  };
}
