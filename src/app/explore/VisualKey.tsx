import type {buildExploreScene} from '../../view-model/explore';

/** Reserved Phase 4 seam for the contextual visual key. */
export function VisualKey({scene}: {scene: ReturnType<typeof buildExploreScene>}) {
  void scene;
  return null;
}
