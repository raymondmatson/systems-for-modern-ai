/**
 * Stable Explore SVG composition order established by Visual Design Phase 1.
 * Later phases populate currently reserved layers without reordering semantic
 * interaction targets around one another.
 */
export const EXPLORE_SVG_LAYER_ORDER = [
  'scenario-underlays',
  'enclosure-frame',
  'anatomy-context',
  'connections-routing',
  'interactive-entity-shells',
  'labels-counts-role-rails',
  'scenario-markers',
  'selection-focus-descendant-overlays',
] as const;

export type ExploreSvgLayerName = (typeof EXPLORE_SVG_LAYER_ORDER)[number];
