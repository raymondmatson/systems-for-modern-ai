import {describe, expect, it} from 'vitest';

import {EXPLORE_SVG_LAYER_ORDER} from '../../src/app/explore/layers';

describe('Explore renderer composition', () => {
  it('keeps the approved Phase 1 SVG layer order stable', () => {
    expect(EXPLORE_SVG_LAYER_ORDER).toEqual([
      'scenario-underlays',
      'enclosure-frame',
      'anatomy-context',
      'connections-routing',
      'interactive-entity-shells',
      'labels-counts-role-rails',
      'scenario-markers',
      'selection-focus-descendant-overlays',
    ]);
  });
});
