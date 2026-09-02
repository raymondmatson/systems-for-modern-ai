import {useEffect, useMemo, useState, type KeyboardEvent} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import Fuse from 'fuse.js';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import type {
  AppState,
  Configuration,
  ContextLocator,
  Population,
} from '../domain/types';
import {
  BrowserContentRepository,
  type BootContent,
  type RuntimeOccurrence,
} from '../runtime/repository';
import {
  back,
  changeScenario,
  clearSelection,
  conceptToExploreOccurrence,
  createInitialState,
  enter,
  follow,
  forward,
  inspect,
  openConcept,
  openConceptDirect,
  openExploreDirect,
  returnToOrigin,
  select,
  switchConfiguration,
  toggleDetail,
  type DomainIndex,
} from '../state/engine';
import type {AppDispatch, RootState} from '../state/store';
import {replace} from '../state/store';
import {buildDetailVM, type DetailAction} from '../view-model/detail';
import {buildExploreScene} from '../view-model/explore';

const repository = new BrowserContentRepository();

type ApplyState = (next: AppState) => void;

export function AppBootstrap() {
  const dispatch = useDispatch<AppDispatch>();
  const [boot, setBoot] = useState<BootContent>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    let active = true;
    repository
      .loadBoot()
      .then((loaded) => {
        if (!active) return;
        setBoot(loaded);
        dispatch(
          replace(
            createInitialState(
              {systems: loaded.systems},
              loaded.manifest.defaultSystemId,
            ),
          ),
        );
      })
      .catch((reason: unknown) => {
        if (!active) return;
        setError(reason instanceof Error ? reason.message : String(reason));
      });

    return () => {
      active = false;
    };
  }, [dispatch]);

  if (error) {
    return (
      <main className="fatal">
        <h1>Content unavailable</h1>
        <p>{error}</p>
      </main>
    );
  }

  if (!boot) {
    return (
      <main className="loading">
        <h1>Systems for Modern AI</h1>
        <p>Loading validated architecture content…</p>
      </main>
    );
  }

  return <App boot={boot} />;
}

function App({boot}: {boot: BootContent}) {
  const state = useSelector((root: RootState) => root);
  const dispatch = useDispatch<AppDispatch>();
  const index = useMemo<DomainIndex>(() => ({systems: boot.systems}), [boot]);

  const system = boot.systems[state.explore.systemId];
  const configuration = system?.configurations[state.explore.configurationId];

  if (!system || !configuration) {
    return (
      <main className="fatal">
        <h1>Content unavailable</h1>
        <p>The active configuration cannot be resolved.</p>
      </main>
    );
  }

  const apply: ApplyState = (next) => dispatch(replace(next));
  const scene = buildExploreScene(state, configuration);
  const detail = buildDetailVM(state, configuration);
  const scenario = configuration.scenarios[state.explore.scenarioId];
  const crumbIds = containmentBreadcrumbIds(
    configuration,
    state.explore.structuralLocation,
  );

  const onAppKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      apply(clearSelection(state));
    }
  };

  const openConceptLibrary = () => {
    if (state.view === 'concepts') return;
    const firstConceptId = boot.manifest.conceptIds[0];
    if (firstConceptId) {
      apply(openConcept(index, state, firstConceptId));
    }
  };

  const showExplore = () => {
    if (state.view !== 'concepts') return;
    if (state.returnContext) {
      apply(returnToOrigin(index, state));
    } else {
      apply(openExploreDirect(state));
    }
  };

  return (
    <div className="app-shell" onKeyDown={onAppKeyDown}>
      <header className="topbar">
        <div>
          <strong>Systems for Modern AI</strong>
          <span className="tag">Version 1</span>
        </div>
        <nav aria-label="Application">
          <button aria-pressed={state.view === 'explore'} onClick={showExplore}>
            Explore
          </button>
          <button
            aria-pressed={state.view === 'concepts'}
            onClick={openConceptLibrary}
          >
            Concepts
          </button>
        </nav>
        <div className="history-controls">
          <button
            disabled={state.historyIndex <= 0}
            onClick={() => apply(back(index, state))}
          >
            Back
          </button>
          <button
            disabled={state.historyIndex >= state.appHistory.length - 1}
            onClick={() => apply(forward(index, state))}
          >
            Forward
          </button>
          {state.returnContext && (
            <button onClick={() => apply(returnToOrigin(index, state))}>
              {state.returnContext.label}
            </button>
          )}
        </div>
      </header>

      {state.view === 'explore' ? (
        <main className="workspace">
          <section className="contextbar" aria-label="Architectural context">
            <label>
              Reference System
              <select
                value={system.id}
                onChange={(event) => {
                  const destination = boot.systems[event.target.value];
                  const destinationConfiguration = destination
                    ? Object.values(destination.configurations)[0]
                    : undefined;
                  if (destination && destinationConfiguration) {
                    apply(
                      switchConfiguration(
                        index,
                        state,
                        destination.id,
                        destinationConfiguration.id,
                      ),
                    );
                  }
                }}
              >
                {boot.manifest.initialSystemIds.map((id) => (
                  <option key={id} value={id}>
                    {boot.systems[id]?.name ?? id}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Configuration
              <select
                value={configuration.id}
                onChange={(event) =>
                  apply(
                    switchConfiguration(
                      index,
                      state,
                      system.id,
                      event.target.value,
                    ),
                  )
                }
              >
                {Object.values(system.configurations).map((candidate) => (
                  <option key={candidate.id} value={candidate.id}>
                    {candidate.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Scenario
              <select
                value={scenario?.id ?? configuration.defaultScenarioId}
                onChange={(event) =>
                  apply(changeScenario(index, state, event.target.value))
                }
              >
                {Object.values(configuration.scenarios).map((candidate) => (
                  <option key={candidate.id} value={candidate.id}>
                    {candidate.name}
                  </option>
                ))}
              </select>
            </label>
            <span className="tier">Tier {scene.current?.exploreTier ?? 1}</span>
          </section>

          <nav className="breadcrumbs" aria-label="Containment path">
            {crumbIds.map((id, indexInPath) => (
              <span key={id}>
                {indexInPath > 0 && ' › '}
                <button
                  onClick={() =>
                    apply(
                      enter(index, state, {
                        kind: 'entity',
                        systemId: system.id,
                        configurationId: configuration.id,
                        entityId: id,
                      }),
                    )
                  }
                >
                  {configuration.entities[id]?.name ?? id}
                </button>
              </span>
            ))}
            {state.explore.structuralLocation.kind === 'representative_member' && (
              <span> / Representative member</span>
            )}
          </nav>

          <section className="explore-grid">
            <div className="canvas-card">
              <div className="canvas-heading">
                <div>
                  <h1>{scene.current?.name ?? system.name}</h1>
                  <p>{scenario?.description}</p>
                </div>
                <button onClick={() => apply(toggleDetail(state))}>
                  {state.explore.detailVisible ? 'Hide details' : 'Show details'}
                </button>
              </div>

              <svg
                className="explore-canvas"
                viewBox="0 0 960 600"
                role="group"
                aria-label={`Explore ${scene.current?.name ?? system.name}`}
              >
                {scene.edges.map((edge) => {
                  const from = scene.nodes.find((node) => node.entity.id === edge.from);
                  const to = scene.nodes.find((node) => node.entity.id === edge.to);
                  if (!from || !to) return null;
                  const x1 = from.x + from.width / 2;
                  const y1 = from.y + from.height / 2;
                  const x2 = to.x + to.width / 2;
                  const y2 = to.y + to.height / 2;
                  return (
                    <g
                      key={edge.id}
                      className={`edge ${edge.selected ? 'selected ' : ''}${
                        edge.previewed ? 'previewed ' : ''
                      }${edge.scenarioEmphasized ? 'scenario-emphasized ' : ''}`}
                      tabIndex={0}
                      role="button"
                      aria-label={`${edge.name}, ${edge.relationshipType.replaceAll('_', ' ')}`}
                      onMouseEnter={() => apply(inspect(state, edge.locator))}
                      onMouseLeave={() => apply(inspect(state, undefined))}
                      onFocus={() => apply(inspect(state, edge.locator))}
                      onBlur={() => apply(inspect(state, undefined))}
                      onClick={() => apply(select(state, edge.locator))}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          event.stopPropagation();
                          apply(select(state, edge.locator));
                        }
                      }}
                    >
                      <line className="edge-hit" x1={x1} y1={y1} x2={x2} y2={y2} />
                      <line className="edge-visible" x1={x1} y1={y1} x2={x2} y2={y2} />
                      <title>{edge.name}</title>
                    </g>
                  );
                })}

                {scene.nodes.map((node) => (
                  <g
                    key={`${node.entity.id}-${node.locator.kind}`}
                    transform={`translate(${node.x} ${node.y})`}
                    className={`node ${node.selected ? 'selected ' : ''}${
                      node.previewed ? 'previewed ' : ''
                    }${node.location ? 'location ' : ''}${node.scenarioEmphasized ? 'scenario-emphasized ' : ''}`}
                    tabIndex={0}
                    role="button"
                    aria-label={`${node.entity.name}, ${node.entity.entityType.replaceAll('_', ' ')}`}
                    onMouseEnter={() => apply(inspect(state, node.locator))}
                    onMouseLeave={() => apply(inspect(state, undefined))}
                    onFocus={() => apply(inspect(state, node.locator))}
                    onBlur={() => apply(inspect(state, undefined))}
                    onClick={() => apply(select(state, node.locator))}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        event.stopPropagation();
                        apply(select(state, node.locator));
                      }
                    }}
                  >
                    <rect width={node.width} height={node.height} rx="10" />
                    <text x="12" y="28">
                      {truncate(node.entity.name, 23)}
                    </text>
                    <text className="node-type" x="12" y="51">
                      {node.entity.entityType.replaceAll('_', ' ')}
                    </text>
                    {node.entity.population && (
                      <text className="node-meta" x="12" y="68">
                        {populationText(node.entity.population)}
                      </text>
                    )}
                  </g>
                ))}
              </svg>
              <p className="hint">
                Hover or focus to inspect. Click, tap, Enter, or Space to select.
                Structural movement uses explicit actions.
              </p>
            </div>

            {state.explore.detailVisible && (
              <Detail
                detail={detail}
                state={state}
                index={index}
                apply={apply}
              />
            )}
          </section>
        </main>
      ) : (
        <Concepts
          boot={boot}
          state={state}
          index={index}
          apply={apply}
        />
      )}
    </div>
  );
}

function Detail({
  detail,
  state,
  index,
  apply,
}: {
  detail: ReturnType<typeof buildDetailVM>;
  state: AppState;
  index: DomainIndex;
  apply: ApplyState;
}) {
  const activate = (action: DetailAction) => {
    if (action.kind === 'enter' && action.target) {
      if (action.target.kind === 'entity') {
        const configuration =
          index.systems[action.target.systemId]?.configurations[
            action.target.configurationId
          ];
        const entity = configuration?.entities[action.target.entityId];
        if (entity?.population?.expansionMode === 'representative_member') {
          apply(
            enter(index, state, {
              kind: 'representative_member',
              systemId: action.target.systemId,
              configurationId: action.target.configurationId,
              aggregateId: entity.id,
              path: [entity.id],
            }),
          );
          return;
        }
      }
      apply(enter(index, state, action.target));
      return;
    }

    if (
      action.kind === 'follow' &&
      action.target &&
      state.explore.selection
    ) {
      apply(follow(index, state, action.target, state.explore.selection));
      return;
    }

    if (action.kind === 'concept' && action.conceptId) {
      apply(
        openConcept(
          index,
          state,
          action.conceptId,
          state.explore.selection ?? state.explore.structuralLocation,
        ),
      );
    }
  };

  return (
    <aside className="detail" aria-label="Detail">
      <div className="detail-header">
        <div>
          <h2>{detail.title}</h2>
          <p>{detail.subtitle}</p>
        </div>
        {state.explore.selection && (
          <button onClick={() => apply(clearSelection(state))}>
            Clear selection
          </button>
        )}
      </div>
      <p>{detail.summary}</p>

      {detail.properties.length > 0 && (
        <>
          <h3>Key properties</h3>
          <dl>
            {detail.properties.map(([key, value]) => (
              <div key={key}>
                <dt>{key}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </>
      )}

      {detail.scenarioState.length > 0 && (
        <>
          <h3>Current Scenario state</h3>
          <dl>
            {detail.scenarioState.map(([key, value]) => (
              <div key={key}>
                <dt>{key}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </>
      )}

      <h3>Actions</h3>
      <div className="actions">
        {detail.actions.length > 0 ? (
          detail.actions.map((action, actionIndex) => (
            <button
              key={`${action.kind}-${action.conceptId ?? actionIndex}`}
              onClick={() => activate(action)}
            >
              {action.label}
            </button>
          ))
        ) : (
          <span>No structural action at this depth.</span>
        )}
      </div>
    </aside>
  );
}

function Concepts({
  boot,
  state,
  index,
  apply,
}: {
  boot: BootContent;
  state: AppState;
  index: DomainIndex;
  apply: ApplyState;
}) {
  const [query, setQuery] = useState('');
  const search = useMemo(
    () =>
      new Fuse(Object.values(boot.concepts), {
        keys: [
          {name: 'name', weight: 0.5},
          {name: 'aliases', weight: 0.3},
          {name: 'summary', weight: 0.15},
          {name: 'tags', weight: 0.05},
        ],
        threshold: 0.35,
      }),
    [boot],
  );

  const concepts = query
    ? search.search(query).map((result) => result.item)
    : Object.values(boot.concepts);
  const current = state.concepts.conceptId
    ? boot.concepts[state.concepts.conceptId]
    : undefined;
  const occurrences: RuntimeOccurrence[] = current
    ? (boot.occurrences[current.concept_id] ?? [])
    : [];

  const open = (conceptId: string) => {
    apply(
      state.view === 'concepts'
        ? openConceptDirect(state, conceptId)
        : openConcept(index, state, conceptId),
    );
  };

  return (
    <main className="concepts">
      <aside className="concept-list">
        <h1>Concepts</h1>
        <input
          aria-label="Search concepts"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search concepts"
        />
        {concepts.map((concept) => (
          <button
            className={current?.concept_id === concept.concept_id ? 'active' : ''}
            key={concept.concept_id}
            onClick={() => open(concept.concept_id)}
          >
            <strong>{concept.name}</strong>
            <span>{concept.summary}</span>
          </button>
        ))}
      </aside>

      <article className="concept-article">
        {current ? (
          <>
            <p className="eyebrow">
              {current.concept_kind.replaceAll('_', ' ')}
            </p>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {current.markdown}
            </ReactMarkdown>
            <h2>Where this appears</h2>
            {occurrences.length > 0 ? (
              occurrences.map((occurrence, occurrenceIndex) => (
                <button
                  className="occurrence"
                  key={`${occurrence.configurationId}-${occurrence.target.id}-${occurrenceIndex}`}
                  onClick={() =>
                    apply(conceptToExploreOccurrence(index, state, occurrence))
                  }
                >
                  {boot.systems[occurrence.systemId]?.name ?? occurrence.systemId} —{' '}
                  {occurrence.target.type}: {occurrence.target.id}
                </button>
              ))
            ) : (
              <p>No authored Version-1 architecture occurrence.</p>
            )}
          </>
        ) : (
          <>
            <h1>Concept Library</h1>
            <p>Select a Concept to read its canonical explanation.</p>
          </>
        )}
      </article>
    </main>
  );
}

function containmentBreadcrumbIds(
  configuration: Configuration,
  locator: ContextLocator,
): string[] {
  const entityId =
    locator.kind === 'entity'
      ? locator.entityId
      : locator.kind === 'representative_member'
        ? locator.aggregateId
        : configuration.rootEntityId;
  const output: string[] = [];
  let entity: import('../domain/types').Entity | undefined = configuration.entities[entityId];
  while (entity) {
    output.unshift(entity.id);
    entity = entity.parentId ? configuration.entities[entity.parentId] : undefined;
  }
  return output;
}

function truncate(value: string, length: number) {
  return value.length > length ? `${value.slice(0, length - 1)}…` : value;
}

function populationText(population: Population) {
  if (population.count.form === 'unknown') return 'population unknown';
  return `${population.count.value ?? ''} · ${population.expansionMode.replaceAll('_', ' ')}`;
}
