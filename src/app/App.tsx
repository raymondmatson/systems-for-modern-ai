import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import Fuse from 'fuse.js';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import type {
  AppState,
  Configuration,
  Entity,
  ContextLocator,
  Population,
  ReturnContext,
} from '../domain/types';
import {
  BrowserContentRepository,
  type BootContent,
  type RuntimeOccurrence,
} from '../runtime/repository';
import {
  pushBrowserHistoryIndex,
  replaceBrowserHistoryIndex,
  requestBrowserHistory,
  subscribeBrowserHistory,
} from '../platform/browserHistory';
import {
  back,
  changeScenario,
  clearSelection,
  conceptToExploreOccurrence,
  createInitialState,
  enter,
  follow,
  forward,
  goToHistoryIndex,
  inspect,
  openConcept,
  openConceptDirect,
  openConceptsDirect,
  openExploreDirect,
  returnToOrigin,
  select,
  setConceptQuery,
  switchConfiguration,
  toggleDetail,
  type DomainIndex,
} from '../state/engine';
import type {AppDispatch, RootState} from '../state/store';
import {replace} from '../state/store';
import {buildDetailVM, type DetailAction, type DetailVM} from '../view-model/detail';
import {
  buildExploreScene,
  buildPreviewVM,
  type SceneConnection,
  type SceneNode,
} from '../view-model/explore';
import {
  entityTypeLabel,
  formatMetadataValue,
  relationshipTypeLabel,
  representativeEntityLabel,
  svgLabelLines,
} from '../view-model/labels';

const repository = new BrowserContentRepository();

type ApplyState = (next: AppState) => void;

type PreviewTimers = {
  show?: ReturnType<typeof setTimeout>;
  hide?: ReturnType<typeof setTimeout>;
};

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
  const stateRef = useRef(state);
  const indexRef = useRef(index);
  const previewTimers = useRef<PreviewTimers>({});
  const browserMirror = useRef({
    initialized: false,
    lastLength: 0,
    lastIndex: -1,
    lastDestination: '',
    handlingPop: false,
  });
  stateRef.current = state;
  indexRef.current = index;

  const system = boot.systems[state.explore.systemId];
  const configuration = system?.configurations[state.explore.configurationId];

  const apply: ApplyState = (next) => dispatch(replace(next));

  useEffect(() => {
    replaceBrowserHistoryIndex(stateRef.current.historyIndex);
    browserMirror.current.initialized = true;
    browserMirror.current.lastLength = stateRef.current.appHistory.length;
    browserMirror.current.lastIndex = stateRef.current.historyIndex;
    browserMirror.current.lastDestination = JSON.stringify(
      stateRef.current.appHistory[stateRef.current.historyIndex],
    );
    return subscribeBrowserHistory((historyIndex) => {
      const current = stateRef.current;
      if (historyIndex < 0 || historyIndex >= current.appHistory.length) return;
      browserMirror.current.handlingPop = true;
      apply(goToHistoryIndex(indexRef.current, current, historyIndex));
    });
  }, []);

  useEffect(() => {
    if (!browserMirror.current.initialized) return;
    const destination = JSON.stringify(state.appHistory[state.historyIndex]);
    if (browserMirror.current.handlingPop) {
      browserMirror.current.handlingPop = false;
      browserMirror.current.lastLength = state.appHistory.length;
      browserMirror.current.lastIndex = state.historyIndex;
      browserMirror.current.lastDestination = destination;
      return;
    }
    const isNewNavigation =
      state.historyIndex === state.appHistory.length - 1 &&
      (state.historyIndex !== browserMirror.current.lastIndex ||
        destination !== browserMirror.current.lastDestination);
    if (isNewNavigation) pushBrowserHistoryIndex(state.historyIndex);
    browserMirror.current.lastLength = state.appHistory.length;
    browserMirror.current.lastIndex = state.historyIndex;
    browserMirror.current.lastDestination = destination;
  }, [state.appHistory, state.historyIndex]);

  useEffect(
    () => () => {
      if (previewTimers.current.show) clearTimeout(previewTimers.current.show);
      if (previewTimers.current.hide) clearTimeout(previewTimers.current.hide);
    },
    [],
  );

  if (!system || !configuration) {
    return (
      <main className="fatal">
        <h1>Content unavailable</h1>
        <p>The active configuration cannot be resolved.</p>
      </main>
    );
  }

  const scene = buildExploreScene(state, configuration);
  const preview = buildPreviewVM(state, configuration);
  const detail = buildDetailVM(state, configuration, {
    capabilities: boot.capabilities,
    propertyRegistry: boot.propertyRegistry,
    concepts: boot.concepts,
  });
  const scenario = configuration.scenarios[state.explore.scenarioId];
  const breadcrumbs = containmentBreadcrumbs(
    configuration,
    state.explore.structuralLocation,
    system.id,
  );

  const clearPreviewTimers = () => {
    if (previewTimers.current.show) clearTimeout(previewTimers.current.show);
    if (previewTimers.current.hide) clearTimeout(previewTimers.current.hide);
    previewTimers.current = {};
  };

  const previewHandlers = (locator: ContextLocator) => ({
    onMouseEnter: () => {
      if (previewTimers.current.hide) clearTimeout(previewTimers.current.hide);
      if (previewTimers.current.show) clearTimeout(previewTimers.current.show);
      previewTimers.current.show = setTimeout(
        () => apply(inspect(stateRef.current, locator)),
        250,
      );
    },
    onMouseLeave: () => {
      if (previewTimers.current.show) clearTimeout(previewTimers.current.show);
      previewTimers.current.hide = setTimeout(
        () => apply(inspect(stateRef.current, undefined)),
        150,
      );
    },
    onFocus: () => {
      clearPreviewTimers();
      apply(inspect(stateRef.current, locator));
    },
    onBlur: () => {
      clearPreviewTimers();
      apply(inspect(stateRef.current, undefined));
    },
  });

  const selectTarget = (locator: ContextLocator) => {
    clearPreviewTimers();
    apply(select(stateRef.current, locator));
  };

  const onAppKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape' && state.view === 'explore' && !event.defaultPrevented) {
      clearPreviewTimers();
      apply(clearSelection(state));
    }
  };

  const navigateHistory = (delta: -1 | 1) => {
    if (requestBrowserHistory(delta)) return;
    apply(delta < 0 ? back(index, state) : forward(index, state));
  };

  const returnLabel = describeReturnContext(state.returnContext, boot, configuration);

  return (
    <div className="app-shell" onKeyDown={onAppKeyDown}>
      <header className="topbar">
        <div>
          <strong>Systems for Modern AI</strong>
          <span className="tag">Version 1</span>
        </div>
        <nav aria-label="Application">
          <button
            aria-pressed={state.view === 'explore'}
            onClick={() => apply(openExploreDirect(state))}
          >
            Explore
          </button>
          <button
            aria-pressed={state.view === 'concepts'}
            onClick={() => apply(openConceptsDirect(state))}
          >
            Concepts
          </button>
        </nav>
        <div className="history-controls">
          <button disabled={state.historyIndex <= 0} onClick={() => navigateHistory(-1)}>
            Back
          </button>
          <button
            disabled={state.historyIndex >= state.appHistory.length - 1}
            onClick={() => navigateHistory(1)}
          >
            Forward
          </button>
          {state.returnContext && (
            <button onClick={() => apply(returnToOrigin(index, state))}>{returnLabel}</button>
          )}
        </div>
      </header>

      <ArchitecturalContextControls
        boot={boot}
        state={state}
        index={index}
        apply={apply}
        tier={state.view === 'explore' ? scene.current?.exploreTier : undefined}
      />

      {state.view === 'explore' ? (
        <main className="workspace">
          <nav className="breadcrumbs" aria-label="Containment path">
            {breadcrumbs.map((crumb, crumbIndex) => (
              <span key={`${crumb.kind}-${crumb.label}-${crumbIndex}`}>
                {crumbIndex > 0 && <span aria-hidden="true"> › </span>}
                {crumb.locator && !crumb.current ? (
                  <button onClick={() => apply(enter(index, state, crumb.locator!))}>
                    {crumb.label}
                  </button>
                ) : (
                  <span aria-current={crumb.current ? 'location' : undefined}>{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>

          <section className="explore-grid">
            <div className="canvas-card">
              <div className="canvas-heading">
                <div>
                  <h1>{locationHeading(configuration, state.explore.structuralLocation)}</h1>
                  <p>{scenario?.description}</p>
                </div>
                <button onClick={() => apply(toggleDetail(state))}>
                  {state.explore.detailVisible ? 'Hide details' : 'Show details'}
                </button>
              </div>

              {preview && (
                <div className="preview-card" aria-label="Inspect preview">
                  <span className="eyebrow">Inspect</span>
                  <strong>{preview.title}</strong>
                  <span>{preview.subtitle}</span>
                  <p>{preview.summary}</p>
                  {preview.scenarioState && <p>{preview.scenarioState}</p>}
                </div>
              )}

              <div className="canvas-viewport">
                <svg
                  className="explore-canvas"
                  viewBox={`0 0 ${scene.width} ${scene.height}`}
                  role="group"
                  aria-label={`Explore ${locationHeading(configuration, state.explore.structuralLocation)}`}
                  data-layout={scene.layoutKind}
                  onClick={(event: MouseEvent<SVGSVGElement>) => {
                    if (event.target === event.currentTarget) {
                      clearPreviewTimers();
                      apply(clearSelection(stateRef.current));
                    }
                  }}
                >
                  {scene.connections.map((connection) => (
                    <ConnectionGlyph
                      key={connection.id}
                      connection={connection}
                      nodes={scene.nodes}
                      previewHandlers={previewHandlers}
                      selectTarget={selectTarget}
                    />
                  ))}

                  {scene.nodes.map((node) => (
                    <NodeGlyph
                      key={`${node.entity.id}-${node.locator.kind}`}
                      node={node}
                      previewHandlers={previewHandlers}
                      selectTarget={selectTarget}
                    />
                  ))}

                  {scene.nodes.length === 0 && (
                    <text className="empty-scene" x={scene.width / 2} y={scene.height / 2} textAnchor="middle">
                      No deeper modeled structure at this location.
                    </text>
                  )}
                </svg>
              </div>

              {scene.contextConnections.length > 0 && (
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
              )}

              <SemanticExploreOutline
                scene={scene}
                selectTarget={selectTarget}
                previewHandlers={previewHandlers}
              />

              <p className="hint">
                Hover briefly or focus to Inspect. Click, tap, Enter, or Space to Select.
                Structural movement uses explicit Enter, Follow, breadcrumb, or peer actions.
                Click empty canvas space or press Escape to clear Selection.
              </p>
            </div>

            {state.explore.detailVisible && (
              <Detail detail={detail} state={state} index={index} apply={apply} />
            )}
          </section>
        </main>
      ) : (
        <Concepts boot={boot} state={state} index={index} apply={apply} />
      )}
    </div>
  );
}

function ArchitecturalContextControls({
  boot,
  state,
  index,
  apply,
  tier,
}: {
  boot: BootContent;
  state: AppState;
  index: DomainIndex;
  apply: ApplyState;
  tier?: number;
}) {
  const system = boot.systems[state.explore.systemId];
  const configuration = system?.configurations[state.explore.configurationId];
  const scenario = configuration?.scenarios[state.explore.scenarioId];
  if (!system || !configuration) return null;

  return (
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
              switchConfiguration(index, state, system.id, event.target.value),
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
          onChange={(event) => apply(changeScenario(index, state, event.target.value))}
        >
          {Object.values(configuration.scenarios).map((candidate) => (
            <option key={candidate.id} value={candidate.id}>
              {candidate.name}
            </option>
          ))}
        </select>
      </label>
      {tier !== undefined && <span className="tier">Tier {tier}</span>}
    </section>
  );
}

function NodeGlyph({
  node,
  previewHandlers,
  selectTarget,
}: {
  node: SceneNode;
  previewHandlers: (locator: ContextLocator) => Record<string, () => void>;
  selectTarget: (locator: ContextLocator) => void;
}) {
  const lines = svgLabelLines(node.entity.name);
  const stateDescription = [
    node.location ? 'current location' : undefined,
    node.selected ? 'selected' : undefined,
    node.scenarioEmphasized ? 'affected by active scenario' : undefined,
    node.locator.kind === 'representative_member' ? 'representative context' : undefined,
  ]
    .filter(Boolean)
    .join(', ');
  const typeY = lines.length > 1 ? 67 : 55;
  const metaY = lines.length > 1 ? 84 : 75;
  return (
    <g
      transform={`translate(${node.x} ${node.y})`}
      className={`node ${node.selected ? 'selected ' : ''}${node.previewed ? 'previewed ' : ''}${
        node.location ? 'location ' : ''
      }${node.scenarioEmphasized ? 'scenario-emphasized ' : ''}`}
      tabIndex={0}
      role="button"
      aria-pressed={node.selected}
      aria-current={node.location ? 'location' : undefined}
      aria-label={`${node.entity.name}, ${entityTypeLabel(node.entity.entityType)}${
        stateDescription ? `, ${stateDescription}` : ''
      }`}
      {...previewHandlers(node.locator)}
      onClick={() => selectTarget(node.locator)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          event.stopPropagation();
          selectTarget(node.locator);
        }
      }}
    >
      <rect width={node.width} height={node.height} rx="10" />
      <text className="node-name" x="12" y="27">
        {lines.map((line, index) => (
          <tspan key={line} x="12" dy={index === 0 ? 0 : 17}>
            {line}
          </tspan>
        ))}
      </text>
      <text className="node-type" x="12" y={typeY}>
        {entityTypeLabel(node.entity.entityType)}
      </text>
      {node.entity.population && (
        <text className="node-meta" x="12" y={metaY}>
          {populationText(node.entity.population)}
        </text>
      )}
      <title>{node.entity.name}</title>
    </g>
  );
}

function ConnectionGlyph({
  connection,
  nodes,
  previewHandlers,
  selectTarget,
}: {
  connection: SceneConnection;
  nodes: SceneNode[];
  previewHandlers: (locator: ContextLocator) => Record<string, () => void>;
  selectTarget: (locator: ContextLocator) => void;
}) {
  const endpoints = connection.endpointNodeIds
    .map((id) => nodes.find((node) => node.entity.id === id))
    .filter((node): node is SceneNode => Boolean(node));
  if (endpoints.length < 2) return null;
  const centers = endpoints.map((node) => ({
    x: node.x + node.width / 2,
    y: node.y + node.height / 2,
  }));
  const segments =
    centers.length === 2
      ? [[centers[0]!, centers[1]!] as const]
      : centers.map((center) => {
          const hub = {
            x: centers.reduce((sum, point) => sum + point.x, 0) / centers.length,
            y: centers.reduce((sum, point) => sum + point.y, 0) / centers.length,
          };
          return [center, hub] as const;
        });
  const stateDescription = [
    connection.selected ? 'selected' : undefined,
    connection.scenarioEmphasized ? 'affected by active scenario' : undefined,
    connection.aggregated ? 'summarized at this scale' : undefined,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <g
      className={`edge ${connection.selected ? 'selected ' : ''}${
        connection.previewed ? 'previewed ' : ''
      }${connection.scenarioEmphasized ? 'scenario-emphasized ' : ''}${
        connection.aggregated ? 'aggregated ' : ''
      }`}
      tabIndex={0}
      role="button"
      aria-pressed={connection.selected}
      aria-label={`${connection.name}, ${relationshipTypeLabel(connection.relationshipType)}, ${
        connection.endpointLabels.join(' to ')
      }${stateDescription ? `, ${stateDescription}` : ''}`}
      {...previewHandlers(connection.locator)}
      onClick={() => selectTarget(connection.locator)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          event.stopPropagation();
          selectTarget(connection.locator);
        }
      }}
    >
      {segments.map(([start, end], segmentIndex) => (
        <g key={segmentIndex}>
          <line className="edge-hit" x1={start.x} y1={start.y} x2={end.x} y2={end.y} />
          <line className="edge-visible" x1={start.x} y1={start.y} x2={end.x} y2={end.y} />
        </g>
      ))}
      {centers.length > 2 && (
        <circle
          className="edge-hub"
          cx={centers.reduce((sum, point) => sum + point.x, 0) / centers.length}
          cy={centers.reduce((sum, point) => sum + point.y, 0) / centers.length}
          r="6"
        />
      )}
      <title>
        {connection.name}: {connection.endpointLabels.join(' ↔ ')}
      </title>
    </g>
  );
}

function SemanticExploreOutline({
  scene,
  selectTarget,
  previewHandlers,
}: {
  scene: ReturnType<typeof buildExploreScene>;
  selectTarget: (locator: ContextLocator) => void;
  previewHandlers: (locator: ContextLocator) => Record<string, () => void>;
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
            {(node.scenarioEmphasized || node.locator.kind === 'representative_member') && (
              <small>
                {[
                  node.locator.kind === 'representative_member' ? 'Representative' : undefined,
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

function Detail({
  detail,
  state,
  index,
  apply,
}: {
  detail: DetailVM;
  state: AppState;
  index: DomainIndex;
  apply: ApplyState;
}) {
  const activate = (action: DetailAction) => {
    if (action.kind === 'enter' && action.target) {
      if (action.target.kind === 'entity') {
        const configuration =
          index.systems[action.target.systemId]?.configurations[action.target.configurationId];
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

    if (action.kind === 'follow' && action.target && state.explore.selection) {
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

  const section = (name: string) => detail.sections.includes(name);

  return (
    <aside className="detail" aria-label="Detail">
      <div className="detail-header">
        <div>
          {detail.isCurrentLocationSummary && <span className="eyebrow">Current location</span>}
          <h2>{detail.title}</h2>
          <p>{detail.subtitle}</p>
        </div>
        {state.explore.selection && (
          <button onClick={() => apply(clearSelection(state))}>Clear selection</button>
        )}
      </div>
      <p>{detail.summary}</p>

      {section('overview') && detail.identity.length > 0 && (
        <DetailPairs title="Identity and context" rows={detail.identity} />
      )}

      {section('properties') && detail.properties.length > 0 && (
        <section>
          <h3>Key properties</h3>
          <dl className="property-list">
            {detail.properties.map((property) => (
              <div key={property.id}>
                <dt>{property.label}</dt>
                <dd>
                  <strong>{property.value}</strong>
                  {property.metadata.map((metadata) => (
                    <small key={metadata}>{metadata}</small>
                  ))}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {section('scenario') && detail.scenarioState.length > 0 && (
        <DetailPairs title="Current Scenario state" rows={detail.scenarioState} />
      )}

      {section('containment') && detail.containment.length > 0 && (
        <DetailPairs title="Containment and population" rows={detail.containment} />
      )}

      {section('connections') && detail.connections.length > 0 && (
        <section>
          <h3>Connections and relationships</h3>
          <ul className="detail-list">
            {detail.connections.map((connection) => (
              <li key={connection.id}>
                <strong>{connection.name}</strong>
                <span>{connection.relationshipType}</span>
                <small>{connection.endpoints.join(' ↔ ')}</small>
              </li>
            ))}
          </ul>
        </section>
      )}

      {section('concepts') && detail.concepts.length > 0 && (
        <section>
          <h3>Relevant Concepts</h3>
          <ul className="detail-list">
            {detail.concepts.map((concept) => (
              <li key={`${concept.id}-${concept.role}`}>
                <strong>{concept.name}</strong>
                <span>{concept.role}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {section('evidence') && detail.evidence.length > 0 && (
        <DetailPairs title="Evidence and provenance" rows={detail.evidence} />
      )}

      {detail.peerActions.length > 0 && (
        <section>
          <h3>Peer navigation</h3>
          <div className="actions">
            {detail.peerActions.map((action) => (
              <button key={action.label} onClick={() => activate(action)}>
                {action.label}
              </button>
            ))}
          </div>
        </section>
      )}

      {section('actions') && (
        <section>
          <h3>Available actions</h3>
          <div className="actions">
            {detail.actions.length > 0 ? (
              detail.actions.map((action, actionIndex) => (
                <button
                  key={`${action.kind}-${action.conceptId ?? action.label}-${actionIndex}`}
                  onClick={() => activate(action)}
                >
                  {action.label}
                </button>
              ))
            ) : (
              <span>No structural action at this depth.</span>
            )}
          </div>
        </section>
      )}
    </aside>
  );
}

function DetailPairs({title, rows}: {title: string; rows: Array<[string, string]>}) {
  return (
    <section>
      <h3>{title}</h3>
      <dl>
        {rows.map(([key, value]) => (
          <div key={`${key}-${value}`}>
            <dt>{key}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </section>
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

  const concepts = state.concepts.query
    ? search.search(state.concepts.query).map((result) => result.item)
    : Object.values(boot.concepts);
  const current = state.concepts.conceptId
    ? boot.concepts[state.concepts.conceptId]
    : undefined;
  const occurrences: RuntimeOccurrence[] = current
    ? (boot.occurrences[current.concept_id] ?? [])
    : [];

  const open = (conceptId: string) => apply(openConceptDirect(state, conceptId));

  return (
    <main className="concepts">
      <aside className="concept-list">
        <h1>Concepts</h1>
        <input
          aria-label="Search concepts"
          value={state.concepts.query}
          onChange={(event) => apply(setConceptQuery(state, event.target.value))}
          placeholder="Search concepts"
        />
        {concepts.map((concept) => (
          <button
            className={current?.concept_id === concept.concept_id ? 'active' : ''}
            aria-current={current?.concept_id === concept.concept_id ? 'page' : undefined}
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
            <p className="eyebrow">{formatMetadataValue(current.concept_kind)}</p>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{current.markdown}</ReactMarkdown>

            {Object.entries(current.relationships ?? {}).some(([, ids]) => ids.length > 0) && (
              <section className="concept-relationships">
                <h2>Concept relationships</h2>
                {Object.entries(current.relationships ?? {}).map(([relationship, ids]) =>
                  ids.length > 0 ? (
                    <div key={relationship}>
                      <h3>{formatMetadataValue(relationship)}</h3>
                      <div className="relationship-links">
                        {ids.map((conceptId) => (
                          <button key={conceptId} onClick={() => open(conceptId)}>
                            {boot.concepts[conceptId]?.name ?? conceptId}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null,
                )}
              </section>
            )}

            <h2>Where this appears</h2>
            {occurrences.length > 0 ? (
              occurrences.map((occurrence, occurrenceIndex) => {
                const label = occurrenceLabel(boot, occurrence);
                const currentContext =
                  occurrence.systemId === state.explore.systemId &&
                  occurrence.configurationId === state.explore.configurationId;
                return (
                  <button
                    className="occurrence"
                    key={`${occurrence.configurationId}-${occurrence.target.id}-${occurrenceIndex}`}
                    onClick={() => apply(conceptToExploreOccurrence(index, state, occurrence))}
                  >
                    <strong>{label}</strong>
                    <span>{formatMetadataValue(occurrence.role)}</span>
                    {currentContext && <small>Current architectural context</small>}
                  </button>
                );
              })
            ) : (
              <p>No authored Version-1 architecture occurrence.</p>
            )}
          </>
        ) : (
          <>
            <h1>Concept Library</h1>
            <p>
              Browse or search canonical Concepts. The current Reference System, Configuration,
              and Scenario remain shared above while Explore state stays dormant.
            </p>
          </>
        )}
      </article>
    </main>
  );
}

type Breadcrumb = {kind: 'canonical' | 'representative'; label: string; locator?: ContextLocator; current: boolean};

function containmentBreadcrumbs(
  configuration: Configuration,
  locator: ContextLocator,
  systemId: string,
): Breadcrumb[] {
  const aggregateId = locator.kind === 'representative_member' ? locator.aggregateId : undefined;
  const entityId =
    locator.kind === 'entity'
      ? locator.entityId
      : aggregateId ?? configuration.rootEntityId;
  const canonicalIds: string[] = [];
  let entity: Entity | undefined = configuration.entities[entityId];
  while (entity) {
    canonicalIds.unshift(entity.id);
    entity = entity.parentId ? configuration.entities[entity.parentId] : undefined;
  }

  const output: Breadcrumb[] = canonicalIds.map((id) => ({
    kind: 'canonical',
    label: configuration.entities[id]?.name ?? id,
    locator: {
      kind: 'entity',
      systemId,
      configurationId: configuration.id,
      entityId: id,
    },
    current: locator.kind === 'entity' && locator.entityId === id,
  }));

  if (locator.kind === 'representative_member') {
    const aggregate = configuration.entities[locator.aggregateId];
    const firstLabel = aggregate ? representativeEntityLabel(aggregate) : 'Representative member';
    output.push({
      kind: 'representative',
      label: firstLabel,
      locator: {
        ...locator,
        path: [locator.aggregateId],
      },
      current: locator.path.length <= 1,
    });
    locator.path.slice(1).forEach((id, indexInPath) => {
      const path = locator.path.slice(0, indexInPath + 2);
      output.push({
        kind: 'representative',
        label: configuration.entities[id]?.name ?? id,
        locator: {...locator, path},
        current: indexInPath === locator.path.slice(1).length - 1,
      });
    });
  }

  return output;
}

function locationHeading(configuration: Configuration, locator: ContextLocator) {
  if (locator.kind === 'representative_member') {
    const entity = configuration.entities[locator.path.at(-1) ?? locator.aggregateId];
    return entity ? representativeEntityLabel(entity) : 'Representative member';
  }
  if (locator.kind === 'entity') return configuration.entities[locator.entityId]?.name ?? locator.entityId;
  return configuration.entities[configuration.rootEntityId]?.name ?? configuration.name;
}

function populationText(population: Population) {
  if (population.count.form === 'unknown') return 'Population unknown';
  const count = population.count.value ? `${population.count.value} members` : 'Repeated population';
  return `${count} · ${formatMetadataValue(population.expansionMode)}`;
}

function occurrenceLabel(boot: BootContent, occurrence: RuntimeOccurrence) {
  const system = boot.systems[occurrence.systemId];
  const configuration = system?.configurations[occurrence.configurationId];
  let targetLabel = occurrence.target.id;
  if (occurrence.target.type === 'entity') {
    targetLabel = configuration?.entities[occurrence.target.id]?.name ?? targetLabel;
  } else if (occurrence.target.type === 'connection') {
    targetLabel = configuration?.connections[occurrence.target.id]?.name ?? targetLabel;
  } else if (occurrence.target.type === 'configuration') {
    targetLabel = configuration?.name ?? targetLabel;
  }
  return `${system?.name ?? occurrence.systemId} — ${configuration?.name ?? occurrence.configurationId} — ${targetLabel}`;
}

function describeReturnContext(
  returnContext: ReturnContext | undefined,
  boot: BootContent,
  configuration: Configuration,
) {
  if (!returnContext) return 'Return';
  if (returnContext.kind === 'concept_origin') {
    return `Return to ${boot.concepts[returnContext.conceptId]?.name ?? 'Concept'}`;
  }
  if (returnContext.label && !returnContext.label.endsWith('Explore')) return returnContext.label;
  const selection = returnContext.selection;
  if (selection?.kind === 'entity') {
    return `Return to ${configuration.entities[selection.entityId]?.name ?? 'Explore'}`;
  }
  return returnContext.label || 'Return to Explore';
}
