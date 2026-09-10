import type {Entity} from '../../domain/types';

/**
 * Reserved Phase 2 renderer seam. Phase 1 establishes the SVG layer without
 * introducing enclosure geometry or new presentation semantics early.
 */
export function EnclosureGlyph({current}: {current: Entity | undefined}) {
  void current;
  return null;
}
