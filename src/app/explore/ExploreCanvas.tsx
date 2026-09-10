import type {MouseEvent} from 'react';

import type {buildExploreScene} from '../../view-model/explore';
import {AnatomyGlyph} from './AnatomyGlyph';
import {CompositionRegionGlyph} from './CompositionRegionGlyph';
import {BoundaryConnectionGlyph} from './BoundaryConnectionGlyph';
import {ConnectionGlyph} from './ConnectionGlyph';
import {EnclosureGlyph} from './EnclosureGlyph';
import {NodeGlyph, NodeLabelGlyph} from './NodeGlyph';
import {EXPLORE_SVG_LAYER_ORDER} from './layers';
import type {PreviewHandlers, SelectTarget} from './types';

export type ExploreScene = ReturnType<typeof buildExploreScene>;

export function ExploreCanvas({
  scene,
  locationLabel,
  previewHandlers,
  selectTarget,
  onEmptyCanvasClick,
}: {
  scene: ExploreScene;
  locationLabel: string;
  previewHandlers: PreviewHandlers;
  selectTarget: SelectTarget;
  onEmptyCanvasClick: () => void;
}) {
  return (
    <div className="canvas-viewport">
      <svg
        className="explore-canvas"
        viewBox={`0 0 ${scene.width} ${scene.height}`}
        role="group"
        aria-label={`Explore ${locationLabel}`}
        data-layout={scene.layoutKind}
        onClick={(event: MouseEvent<SVGSVGElement>) => {
          if (event.target === event.currentTarget) onEmptyCanvasClick();
        }}
      >
        <g data-layer={EXPLORE_SVG_LAYER_ORDER[0]} aria-hidden="true" />

        <g data-layer={EXPLORE_SVG_LAYER_ORDER[1]} aria-hidden="true">
          <EnclosureGlyph enclosure={scene.enclosure} />
        </g>

        <g data-layer={EXPLORE_SVG_LAYER_ORDER[2]} aria-hidden="true">
          {scene.compositionRegions.map((region) => (
            <CompositionRegionGlyph key={`region-${region.id}`} region={region} />
          ))}
          {scene.anatomyDepictions.map((item) => (
            <AnatomyGlyph key={`anatomy-${item.depiction.id}`} item={item} />
          ))}
        </g>

        <g data-layer={EXPLORE_SVG_LAYER_ORDER[3]}>
          {scene.connections.map((connection) => (
            <ConnectionGlyph
              key={connection.id}
              connection={connection}
              nodes={scene.nodes}
              previewHandlers={previewHandlers}
              selectTarget={selectTarget}
            />
          ))}
          {scene.contextConnections.map((connection) => (
            <BoundaryConnectionGlyph key={`boundary-${connection.id}`} connection={connection} />
          ))}
        </g>

        <g data-layer={EXPLORE_SVG_LAYER_ORDER[4]}>
          {scene.nodes.map((node) => (
            <NodeGlyph
              key={`${node.entity.id}-${node.locator.kind}`}
              node={node}
              previewHandlers={previewHandlers}
              selectTarget={selectTarget}
            />
          ))}
        </g>

        <g data-layer={EXPLORE_SVG_LAYER_ORDER[5]} aria-hidden="true">
          {scene.nodes.map((node) => (
            <NodeLabelGlyph key={`label-${node.entity.id}-${node.locator.kind}`} node={node} />
          ))}
        </g>

        <g data-layer={EXPLORE_SVG_LAYER_ORDER[6]} aria-hidden="true" />
        <g data-layer={EXPLORE_SVG_LAYER_ORDER[7]} aria-hidden="true" />

        {scene.nodes.length === 0 && scene.anatomyDepictions.length === 0 && (
          <text
            className="empty-scene"
            x={scene.width / 2}
            y={scene.height / 2}
            textAnchor="middle"
          >
            No deeper modeled structure at this location.
          </text>
        )}
      </svg>
    </div>
  );
}
