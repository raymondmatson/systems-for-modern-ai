import type {MouseEvent} from 'react';

import type {buildExploreScene} from '../../view-model/explore';
import {AnatomyGlyph} from './AnatomyGlyph';
import {CompositionRegionGlyph} from './CompositionRegionGlyph';
import {BoundaryConnectionGlyph} from './BoundaryConnectionGlyph';
import {ConnectionGlyph} from './ConnectionGlyph';
import {
  ConnectionDefs,
  ConnectionInteractionOverlay,
  ConnectionScenarioUnderlay,
} from './ConnectionPrimitives';
import {EnclosureGlyph} from './EnclosureGlyph';
import {NodeGlyph, NodeLabelGlyph} from './NodeGlyph';
import {
  EnclosureInteractionOverlayGlyph,
  EnclosureScenarioMarkerGlyph,
  EnclosureScenarioUnderlayGlyph,
  NodeInteractionOverlayGlyph,
  NodeScenarioMarkerGlyph,
  NodeScenarioUnderlayGlyph,
} from './StateOverlayGlyphs';
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
  const allConnections = [...scene.connections, ...scene.contextConnections];
  const boundaryConnections = allConnections.filter((connection) => connection.boundary);

  return (
    <div className="canvas-viewport">
      <svg
        className={`explore-canvas ${scene.scenario && !scene.scenario.isDefault ? 'scenario-active' : 'scenario-baseline'}`}
        viewBox={`0 0 ${scene.width} ${scene.height}`}
        role="group"
        aria-label={`Explore ${locationLabel}`}
        data-layout={scene.layoutKind}
        onClick={(event: MouseEvent<SVGSVGElement>) => {
          if (event.target === event.currentTarget) onEmptyCanvasClick();
        }}
      >
        <ConnectionDefs />

        <g data-layer={EXPLORE_SVG_LAYER_ORDER[0]} aria-hidden="true">
          <EnclosureScenarioUnderlayGlyph enclosure={scene.enclosure} />
          {scene.nodes.map((node) => (
            <NodeScenarioUnderlayGlyph key={`scenario-node-${node.entity.id}`} node={node} />
          ))}
          {allConnections.map((connection) => (
            <ConnectionScenarioUnderlay
              key={`scenario-edge-${connection.id}`}
              connection={connection}
              routes={connection.routes}
            />
          ))}
          {boundaryConnections.map((connection) => (
            <ConnectionScenarioUnderlay
              key={`scenario-boundary-${connection.id}`}
              connection={connection}
              routes={connection.boundary?.routes ?? []}
            />
          ))}
        </g>

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
              previewHandlers={previewHandlers}
              selectTarget={selectTarget}
            />
          ))}
          {boundaryConnections.map((connection) => (
            <BoundaryConnectionGlyph
              key={`boundary-${connection.id}`}
              connection={connection}
              previewHandlers={previewHandlers}
              selectTarget={selectTarget}
            />
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

        <g data-layer={EXPLORE_SVG_LAYER_ORDER[6]} aria-hidden="true">
          <EnclosureScenarioMarkerGlyph enclosure={scene.enclosure} />
          {scene.nodes.map((node) => (
            <NodeScenarioMarkerGlyph key={`scenario-marker-${node.entity.id}`} node={node} />
          ))}
        </g>

        <g data-layer={EXPLORE_SVG_LAYER_ORDER[7]} aria-hidden="true">
          <EnclosureInteractionOverlayGlyph enclosure={scene.enclosure} />
          {scene.nodes.map((node) => (
            <NodeInteractionOverlayGlyph key={`interaction-node-${node.entity.id}`} node={node} />
          ))}
          {allConnections.map((connection) => (
            <ConnectionInteractionOverlay
              key={`interaction-edge-${connection.id}`}
              connection={connection}
              routes={connection.routes}
            />
          ))}
          {boundaryConnections.map((connection) => (
            <ConnectionInteractionOverlay
              key={`interaction-boundary-${connection.id}`}
              connection={connection}
              routes={connection.boundary?.routes ?? []}
            />
          ))}
        </g>

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
