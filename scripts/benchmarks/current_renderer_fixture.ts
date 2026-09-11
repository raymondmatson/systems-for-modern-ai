/*
 * Dependency-light benchmark adapter for the current Explore presentation.
 *
 * render_density.py compiles this file together with src/domain, src/view-model,
 * and src/app/explore using a benchmark-only JSX factory. The adapter executes
 * the real view-model and exact Explore components, then serializes their
 * presentation tree for browser DOM/materialization measurements. It is not a
 * substitute for the pinned React/Vite/Playwright test matrix.
 */
declare const require: any;
declare const process: any;

type VNode = {type: string; props: Record<string, any>; children: any[]};
const FRAGMENT = Symbol('fragment');

function flatten(children: any[]): any[] {
  const out: any[] = [];
  for (const child of children) {
    if (Array.isArray(child)) out.push(...flatten(child));
    else if (child !== null && child !== undefined && child !== false && child !== true) out.push(child);
  }
  return out;
}

function __jsx(type: any, props: any, ...children: any[]): any {
  props = props || {};
  const merged = flatten(children.length ? children : (props.children === undefined ? [] : [props.children]));
  if (type === FRAGMENT) return merged;
  if (typeof type === 'function') return type({...props, children: merged});
  return {type, props, children: merged} as VNode;
}

(globalThis as any).__jsx = __jsx;
(globalThis as any).__Fragment = FRAGMENT;

const ESC: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

function esc(value: any): string {
  return String(value).replace(/[&<>"']/g, (match) => ESC[match]);
}

const attrMap: Record<string, string> = {
  className: 'class',
  tabIndex: 'tabindex',
  strokeWidth: 'stroke-width',
  strokeDasharray: 'stroke-dasharray',
  strokeLinecap: 'stroke-linecap',
  strokeLinejoin: 'stroke-linejoin',
  fillRule: 'fill-rule',
  clipRule: 'clip-rule',
  textAnchor: 'text-anchor',
  dominantBaseline: 'dominant-baseline',
  vectorEffect: 'vector-effect',
  markerEnd: 'marker-end',
  pointerEvents: 'pointer-events',
  preserveAspectRatio: 'preserveAspectRatio',
  viewBox: 'viewBox',
};

function styleText(style: any): string {
  if (!style || typeof style !== 'object') return String(style ?? '');
  return Object.entries(style)
    .map(([key, value]) => `${key.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`)}:${value}`)
    .join(';');
}

function serialize(node: any): string {
  if (node === null || node === undefined || node === false || node === true) return '';
  if (Array.isArray(node)) return node.map(serialize).join('');
  if (typeof node === 'string' || typeof node === 'number') return esc(node);

  const {type, props, children} = node as VNode;
  const attrs: string[] = [];
  for (const [key, raw] of Object.entries(props || {})) {
    if (
      key === 'children' ||
      key === 'key' ||
      key === 'ref' ||
      key.startsWith('on') ||
      raw === undefined ||
      raw === null ||
      (raw === false && !key.startsWith('aria-') && !key.startsWith('data-'))
    ) {
      continue;
    }
    const name = attrMap[key] || key;
    const value = key === 'style' ? styleText(raw) : raw;
    if (raw === true && !key.startsWith('aria-') && !key.startsWith('data-')) attrs.push(name);
    else attrs.push(`${name}="${esc(value)}"`);
  }
  return `<${type}${attrs.length ? ` ${attrs.join(' ')}` : ''}>${flatten(children || []).map(serialize).join('')}</${type}>`;
}

const fs = require('fs');
const path = require('path');
const ROOT = process.argv[2];
const COMPILED_ROOT = process.argv[3];
const sceneId = process.argv[4];
const fixtureRelativePath = process.argv[5] || 'tests/fixtures/visual-regression-phase5a.json';
const fixture = JSON.parse(
  fs.readFileSync(path.join(ROOT, fixtureRelativePath), 'utf8'),
);
const spec = fixture.scenes.find((scene: any) => scene.id === sceneId);
if (!spec) throw new Error(`Unknown current-renderer scene ${sceneId} in ${fixtureRelativePath}`);
const system = JSON.parse(fs.readFileSync(path.join(ROOT, spec.systemRuntime), 'utf8'));
const configuration = system.configurations[spec.configurationId];
if (!configuration) throw new Error(`Missing configuration ${spec.configurationId}`);

const makeState = () => ({
  view: 'explore',
  explore: {
    systemId: spec.structuralLocation.systemId,
    configurationId: spec.configurationId,
    scenarioId: spec.scenarioId,
    structuralLocation: spec.structuralLocation,
    selection: spec.selection,
    preview: spec.preview,
    structuralHistory: [],
    detailVisible: true,
  },
  concepts: {query: '', browseHistory: []},
  appHistory: [],
  historyIndex: -1,
});

const {buildExploreScene} = require(path.join(COMPILED_ROOT, 'src/view-model/explore'));
const {ExploreCanvas} = require(path.join(COMPILED_ROOT, 'src/app/explore/ExploreCanvas'));
const {ScenarioStrip} = require(path.join(COMPILED_ROOT, 'src/app/explore/ScenarioStrip'));
const {VisualKey} = require(path.join(COMPILED_ROOT, 'src/app/explore/VisualKey'));
const {ContextConnections, SemanticExploreOutline} = require(
  path.join(COMPILED_ROOT, 'src/app/explore/ExploreSupportingViews'),
);

const previewHandlers = (_locator: any) => ({});
const selectTarget = (_locator: any) => {};

function renderOnce() {
  const state = makeState();
  const started = process.hrtime.bigint();
  const scene = buildExploreScene(state, configuration);
  const viewModelReady = process.hrtime.bigint();
  const tree = __jsx(
    'div',
    {className: 'phase6-benchmark-shell'},
    ScenarioStrip({scenario: scene.scenario}),
    ExploreCanvas({
      scene,
      locationLabel: scene.enclosure?.title ?? 'Explore scene',
      previewHandlers,
      selectTarget,
      onEmptyCanvasClick: () => {},
    }),
    VisualKey({scene}),
    ContextConnections({scene, selectTarget, previewHandlers}),
    SemanticExploreOutline({scene, selectTarget, previewHandlers}),
  );
  const markup = serialize(tree);
  const serialized = process.hrtime.bigint();
  return {
    scene,
    markup,
    viewModelMs: Number(viewModelReady - started) / 1e6,
    componentSerializeMs: Number(serialized - viewModelReady) / 1e6,
  };
}

const samples: any[] = [];
for (let index = 0; index < 25; index += 1) samples.push(renderOnce());
const median = (values: number[]) => {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2
    ? sorted[middle]
    : (sorted[middle - 1] + sorted[middle]) / 2;
};
const last = samples.at(-1);
const allConnections = [...last.scene.connections, ...last.scene.contextConnections];

console.log(JSON.stringify({
  sceneId,
  markup: last.markup,
  metrics: {
    viewModelMedianMs: median(samples.map((sample) => sample.viewModelMs)),
    componentSerializeMedianMs: median(samples.map((sample) => sample.componentSerializeMs)),
    interactiveNodes: last.scene.nodes.length,
    anatomyDepictions: last.scene.anatomyDepictions.length,
    canvasConnections: last.scene.connections.length,
    contextConnections: last.scene.contextConnections.length,
    boundaryConnections: allConnections.filter((connection: any) => connection.boundary).length,
    summarizedConnections: last.scene.contextConnections.filter(
      (connection: any) => connection.visibility === 'summarized',
    ).length,
    width: last.scene.width,
    height: last.scene.height,
    layoutKind: last.scene.layoutKind,
  },
}));
