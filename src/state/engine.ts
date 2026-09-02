import type {
  AppState,
  Configuration,
  ContextLocator,
  HistoryDestination,
  Id,
  Entity,
  ReferenceSystem,
  ReturnContext,
} from '../domain/types';

export interface DomainIndex {
  systems: Record<Id, ReferenceSystem>;
}

const same = (a: ContextLocator, b: ContextLocator) =>
  JSON.stringify(a) === JSON.stringify(b);

const configurationFor = (index: DomainIndex, systemId: Id, configurationId: Id) =>
  index.systems[systemId]?.configurations[configurationId];

const rootLocator = (systemId: Id, configuration: Configuration): ContextLocator => ({
  kind: 'entity',
  systemId,
  configurationId: configuration.id,
  entityId: configuration.rootEntityId,
});

const locatorExists = (configuration: Configuration, locator: ContextLocator) => {
  if (locator.kind === 'entity') return Boolean(configuration.entities[locator.entityId]);
  if (locator.kind === 'connection') return Boolean(configuration.connections[locator.connectionId]);
  if (locator.kind === 'representative_member') {
    return (
      Boolean(configuration.entities[locator.aggregateId]) &&
      locator.path.every((id) => Boolean(configuration.entities[id]))
    );
  }
  return true;
};

const containmentPath = (configuration: Configuration, locator: ContextLocator) => {
  if (locator.kind !== 'entity') return [];
  const output: Id[] = [];
  let current: Entity | undefined = configuration.entities[locator.entityId];
  while (current) {
    output.unshift(current.id);
    current = current.parentId ? configuration.entities[current.parentId] : undefined;
  }
  return output;
};

function pushDestination(state: AppState, destination: HistoryDestination): AppState {
  const history = state.appHistory.slice(0, state.historyIndex + 1);
  history.push(destination);
  return {...state, appHistory: history, historyIndex: history.length - 1};
}

function conceptsDestination(state: AppState): HistoryDestination {
  const locator: ContextLocator = state.concepts.conceptId
    ? {kind: 'concept', conceptId: state.concepts.conceptId}
    : {kind: 'concept_library'};
  return {
    view: 'concepts',
    locator,
    systemId: state.explore.systemId,
    configurationId: state.explore.configurationId,
  };
}

function appendConceptBrowse(state: AppState, conceptId: Id) {
  const history = state.concepts.browseHistory;
  return history.at(-1) === conceptId ? history : [...history, conceptId];
}

export function activeConfiguration(index: DomainIndex, state: AppState) {
  const configuration = configurationFor(
    index,
    state.explore.systemId,
    state.explore.configurationId,
  );
  if (!configuration) throw new Error('Active configuration unavailable');
  return configuration;
}

export function createInitialState(
  index: DomainIndex,
  systemId = 'nvidia-dgx-h100-superpod',
): AppState {
  const system = index.systems[systemId];
  if (!system) throw new Error(`Unknown initial system ${systemId}`);
  const configuration = Object.values(system.configurations)[0];
  if (!configuration) throw new Error('Initial system has no configuration');
  const root = rootLocator(systemId, configuration);
  return {
    view: 'explore',
    explore: {
      systemId,
      configurationId: configuration.id,
      scenarioId: configuration.defaultScenarioId,
      structuralLocation: root,
      structuralHistory: [root],
      detailVisible: true,
    },
    concepts: {query: '', browseHistory: []},
    appHistory: [{view: 'explore', locator: root}],
    historyIndex: 0,
  };
}

export const inspect = (state: AppState, target?: ContextLocator): AppState => ({
  ...state,
  explore: {...state.explore, preview: target},
});

export const select = (state: AppState, target: ContextLocator): AppState => ({
  ...state,
  explore: {...state.explore, selection: target, preview: undefined},
});

export const clearSelection = (state: AppState): AppState => ({
  ...state,
  explore: {...state.explore, selection: undefined},
});

export const toggleDetail = (state: AppState): AppState => ({
  ...state,
  explore: {...state.explore, detailVisible: !state.explore.detailVisible},
});

export function enter(
  index: DomainIndex,
  state: AppState,
  target: ContextLocator,
): AppState {
  if (target.kind !== 'entity' && target.kind !== 'representative_member') {
    throw new Error('Enter requires a structural target');
  }
  const configuration = configurationFor(index, target.systemId, target.configurationId);
  if (!configuration || !locatorExists(configuration, target)) {
    throw new Error('Enter destination unavailable');
  }
  if (
    target.systemId === state.explore.systemId &&
    target.configurationId === state.explore.configurationId &&
    same(state.explore.structuralLocation, target)
  ) {
    return state;
  }

  const next: AppState = {
    ...state,
    view: 'explore',
    explore: {
      ...state.explore,
      systemId: target.systemId,
      configurationId: target.configurationId,
      structuralLocation: target,
      selection: undefined,
      preview: undefined,
      structuralHistory: [...state.explore.structuralHistory, target],
      traversalOrigin: undefined,
    },
  };
  return pushDestination(next, {view: 'explore', locator: target});
}

export function follow(
  index: DomainIndex,
  state: AppState,
  destination: ContextLocator,
  origin: ContextLocator,
): AppState {
  const next = enter(index, state, destination);
  if (next === state) return state;
  return {...next, explore: {...next.explore, traversalOrigin: origin}};
}

export function changeScenario(index: DomainIndex, state: AppState, id: Id) {
  const configuration = activeConfiguration(index, state);
  if (!configuration.scenarios[id]) throw new Error(`Unknown scenario ${id}`);
  return {...state, explore: {...state.explore, scenarioId: id}};
}

export function switchConfiguration(
  index: DomainIndex,
  state: AppState,
  systemId: Id,
  configurationId: Id,
) {
  const configuration = configurationFor(index, systemId, configurationId);
  if (!configuration) throw new Error('Destination configuration unavailable');
  const root = rootLocator(systemId, configuration);
  const next: AppState = {
    ...state,
    explore: {
      ...state.explore,
      systemId,
      configurationId,
      scenarioId: configuration.defaultScenarioId,
      structuralLocation: root,
      selection: undefined,
      preview: undefined,
      structuralHistory: [root],
      traversalOrigin: undefined,
    },
  };
  return pushDestination(
    next,
    next.view === 'explore' ? {view: 'explore', locator: root} : conceptsDestination(next),
  );
}

export function setConceptQuery(state: AppState, query: string): AppState {
  return {...state, concepts: {...state.concepts, query}};
}

export function openConcept(
  index: DomainIndex,
  state: AppState,
  conceptId: Id,
  origin?: ContextLocator,
) {
  let returnContext = state.returnContext;
  if (origin && state.view === 'explore') {
    const configuration = activeConfiguration(index, state);
    const sourceLabel =
      origin.kind === 'entity'
        ? (configuration.entities[origin.entityId]?.name ?? origin.entityId)
        : origin.kind === 'connection'
          ? (configuration.connections[origin.connectionId]?.name ?? origin.connectionId)
          : origin.kind === 'representative_member'
            ? (configuration.entities[origin.path.at(-1) ?? origin.aggregateId]?.name ??
              configuration.entities[origin.aggregateId]?.name ??
              'representative member')
            : 'Explore';
    returnContext = {
      kind: 'explore_origin',
      systemId: state.explore.systemId,
      configurationId: state.explore.configurationId,
      scenarioId: state.explore.scenarioId,
      structuralLocation: state.explore.structuralLocation,
      structuralPath: containmentPath(configuration, state.explore.structuralLocation),
      selection: state.explore.selection,
      sourceConceptId: conceptId,
      label: `Return to ${sourceLabel}`,
    } satisfies ReturnContext;
  }

  const locator: ContextLocator = {kind: 'concept', conceptId};
  const next: AppState = {
    ...state,
    view: 'concepts',
    concepts: {
      ...state.concepts,
      conceptId,
      browseHistory: appendConceptBrowse(state, conceptId),
    },
    explore: {...state.explore, preview: undefined},
    returnContext,
  };
  return pushDestination(next, {
    view: 'concepts',
    locator,
    systemId: next.explore.systemId,
    configurationId: next.explore.configurationId,
  });
}

export function openConceptDirect(state: AppState, conceptId: Id) {
  const locator: ContextLocator = {kind: 'concept', conceptId};
  const next: AppState = {
    ...state,
    view: 'concepts',
    concepts: {
      ...state.concepts,
      conceptId,
      browseHistory: appendConceptBrowse(state, conceptId),
    },
    explore: {...state.explore, preview: undefined},
  };
  return pushDestination(next, {
    view: 'concepts',
    locator,
    systemId: next.explore.systemId,
    configurationId: next.explore.configurationId,
  });
}

export function openConceptsDirect(state: AppState) {
  if (state.view === 'concepts') return state;
  const next: AppState = {
    ...state,
    view: 'concepts',
    explore: {...state.explore, preview: undefined},
  };
  return pushDestination(next, conceptsDestination(next));
}

export function openExploreDirect(state: AppState) {
  if (state.view === 'explore') return state;
  const locator = state.explore.structuralLocation;
  const next: AppState = {
    ...state,
    view: 'explore',
    explore: {...state.explore, preview: undefined},
  };
  return pushDestination(next, {view: 'explore', locator});
}

export function conceptToExploreOccurrence(
  index: DomainIndex,
  state: AppState,
  occurrence: {
    systemId: Id;
    configurationId: Id;
    target: {type: 'entity' | 'connection' | 'configuration'; id: Id};
  },
) {
  if (state.view !== 'concepts' || !state.concepts.conceptId) {
    throw new Error('Active concept required');
  }
  const configuration = configurationFor(index, occurrence.systemId, occurrence.configurationId);
  if (!configuration) throw new Error('Occurrence configuration unavailable');

  let destination = rootLocator(occurrence.systemId, configuration);
  let selection: ContextLocator | undefined;

  if (occurrence.target.type === 'entity') {
    const entity = configuration.entities[occurrence.target.id];
    if (!entity) throw new Error('Occurrence entity unavailable');
    if (entity.parentId) {
      destination = {
        kind: 'entity',
        systemId: occurrence.systemId,
        configurationId: occurrence.configurationId,
        entityId: entity.parentId,
      };
      selection = {
        kind: 'entity',
        systemId: occurrence.systemId,
        configurationId: occurrence.configurationId,
        entityId: entity.id,
      };
    } else {
      destination = {
        kind: 'entity',
        systemId: occurrence.systemId,
        configurationId: occurrence.configurationId,
        entityId: entity.id,
      };
    }
  } else if (occurrence.target.type === 'connection') {
    const connection = configuration.connections[occurrence.target.id];
    if (!connection) throw new Error('Occurrence connection unavailable');
    const endpoint = configuration.entities[connection.endpointIds[0] ?? ''];
    if (endpoint) {
      destination = {
        kind: 'entity',
        systemId: occurrence.systemId,
        configurationId: occurrence.configurationId,
        entityId: endpoint.parentId ?? endpoint.id,
      };
    }
    selection = {
      kind: 'connection',
      systemId: occurrence.systemId,
      configurationId: occurrence.configurationId,
      connectionId: connection.id,
    };
  }

  const crossConfiguration =
    state.explore.systemId !== occurrence.systemId ||
    state.explore.configurationId !== occurrence.configurationId;
  const root = rootLocator(occurrence.systemId, configuration);
  const structuralHistory = crossConfiguration
    ? same(root, destination)
      ? [root]
      : [root, destination]
    : same(state.explore.structuralLocation, destination)
      ? state.explore.structuralHistory
      : [...state.explore.structuralHistory, destination];

  const next: AppState = {
    ...state,
    view: 'explore',
    explore: {
      ...state.explore,
      systemId: occurrence.systemId,
      configurationId: occurrence.configurationId,
      scenarioId: crossConfiguration
        ? configuration.defaultScenarioId
        : state.explore.scenarioId,
      structuralLocation: destination,
      selection,
      preview: undefined,
      structuralHistory,
      traversalOrigin: undefined,
    },
    returnContext: {
      kind: 'concept_origin',
      conceptId: state.concepts.conceptId,
      label: 'Return to Concept',
    },
  };
  return pushDestination(next, {view: 'explore', locator: destination});
}

export function returnToOrigin(index: DomainIndex, state: AppState) {
  const returnContext = state.returnContext;
  if (!returnContext) return state;

  if (returnContext.kind === 'concept_origin') {
    const cleared = {...state, returnContext: undefined};
    return openConceptDirect(cleared, returnContext.conceptId);
  }

  const configuration = configurationFor(
    index,
    returnContext.systemId,
    returnContext.configurationId,
  );
  if (!configuration) return state;

  let destination = locatorExists(configuration, returnContext.structuralLocation)
    ? returnContext.structuralLocation
    : undefined;
  if (!destination) {
    for (const id of [...returnContext.structuralPath].reverse()) {
      if (configuration.entities[id]) {
        destination = {
          kind: 'entity',
          systemId: returnContext.systemId,
          configurationId: returnContext.configurationId,
          entityId: id,
        };
        break;
      }
    }
  }
  destination ??= rootLocator(returnContext.systemId, configuration);
  const scenarioId = configuration.scenarios[returnContext.scenarioId]
    ? returnContext.scenarioId
    : configuration.defaultScenarioId;
  const selection =
    returnContext.selection && locatorExists(configuration, returnContext.selection)
      ? returnContext.selection
      : undefined;

  const next: AppState = {
    ...state,
    view: 'explore',
    explore: {
      ...state.explore,
      systemId: returnContext.systemId,
      configurationId: returnContext.configurationId,
      scenarioId,
      structuralLocation: destination,
      selection,
      preview: undefined,
      structuralHistory: same(state.explore.structuralLocation, destination)
        ? state.explore.structuralHistory
        : [...state.explore.structuralHistory, destination],
    },
    returnContext: undefined,
  };
  return pushDestination(next, {view: 'explore', locator: destination});
}

function replay(index: DomainIndex, state: AppState, destination: HistoryDestination): AppState {
  if (destination.view === 'concepts') {
    const configuration = configurationFor(
      index,
      destination.systemId,
      destination.configurationId,
    );
    if (!configuration) return state;
    const crossConfiguration =
      state.explore.systemId !== destination.systemId ||
      state.explore.configurationId !== destination.configurationId;
    const root = rootLocator(destination.systemId, configuration);
    return {
      ...state,
      view: 'concepts',
      concepts: {
        ...state.concepts,
        conceptId:
          destination.locator.kind === 'concept'
            ? destination.locator.conceptId
            : undefined,
      },
      explore: {
        ...state.explore,
        systemId: destination.systemId,
        configurationId: destination.configurationId,
        scenarioId: crossConfiguration
          ? configuration.defaultScenarioId
          : state.explore.scenarioId,
        structuralLocation: crossConfiguration
          ? root
          : state.explore.structuralLocation,
        selection: crossConfiguration ? undefined : state.explore.selection,
        preview: undefined,
        structuralHistory: crossConfiguration ? [root] : state.explore.structuralHistory,
      },
    };
  }

  if ('systemId' in destination.locator) {
    const configuration = configurationFor(
      index,
      destination.locator.systemId,
      destination.locator.configurationId,
    );
    if (!configuration) return state;
    const locator = locatorExists(configuration, destination.locator)
      ? destination.locator
      : rootLocator(destination.locator.systemId, configuration);
    const crossConfiguration =
      state.explore.systemId !== destination.locator.systemId ||
      state.explore.configurationId !== destination.locator.configurationId;
    return {
      ...state,
      view: 'explore',
      explore: {
        ...state.explore,
        systemId: destination.locator.systemId,
        configurationId: destination.locator.configurationId,
        scenarioId: crossConfiguration
          ? configuration.defaultScenarioId
          : state.explore.scenarioId,
        structuralLocation: locator,
        selection: undefined,
        preview: undefined,
        structuralHistory: crossConfiguration
          ? (() => {
              const root = rootLocator(destination.locator.systemId, configuration);
              return same(root, locator) ? [root] : [root, locator];
            })()
          : state.explore.structuralHistory,
      },
    };
  }

  return state;
}

export function goToHistoryIndex(index: DomainIndex, state: AppState, historyIndex: number) {
  if (historyIndex < 0 || historyIndex >= state.appHistory.length) return state;
  return {...replay(index, state, state.appHistory[historyIndex]!), historyIndex};
}

export function back(index: DomainIndex, state: AppState) {
  return state.historyIndex <= 0
    ? state
    : goToHistoryIndex(index, state, state.historyIndex - 1);
}

export function forward(index: DomainIndex, state: AppState) {
  return state.historyIndex >= state.appHistory.length - 1
    ? state
    : goToHistoryIndex(index, state, state.historyIndex + 1);
}

export const sameLocator = same;
