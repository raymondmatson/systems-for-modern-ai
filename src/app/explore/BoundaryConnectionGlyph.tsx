import type {SceneConnection} from '../../view-model/explore';

/**
 * Reserved Phase 4 renderer seam. External relationships remain in the
 * existing accessible card list until boundary-port behavior is implemented.
 */
export function BoundaryConnectionGlyph({connection}: {connection: SceneConnection}) {
  void connection;
  return null;
}
