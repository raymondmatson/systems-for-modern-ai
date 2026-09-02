const HISTORY_INDEX_KEY = 'systemsForModernAiHistoryIndex';

type HistoryState = {[HISTORY_INDEX_KEY]?: number};

function available(): boolean {
  return typeof window !== 'undefined' && typeof window.history !== 'undefined';
}

export function replaceBrowserHistoryIndex(index: number): void {
  if (!available()) return;
  const current = (window.history.state ?? {}) as HistoryState;
  window.history.replaceState({...current, [HISTORY_INDEX_KEY]: index}, '');
}

export function pushBrowserHistoryIndex(index: number): void {
  if (!available()) return;
  window.history.pushState({[HISTORY_INDEX_KEY]: index}, '');
}

export function requestBrowserHistory(delta: -1 | 1): boolean {
  if (!available()) return false;
  window.history.go(delta);
  return true;
}

export function subscribeBrowserHistory(
  listener: (historyIndex: number) => void,
): () => void {
  if (!available()) return () => undefined;
  const handler = (event: PopStateEvent) => {
    const state = (event.state ?? {}) as HistoryState;
    if (typeof state[HISTORY_INDEX_KEY] === 'number') {
      listener(state[HISTORY_INDEX_KEY]!);
    }
  };
  window.addEventListener('popstate', handler);
  return () => window.removeEventListener('popstate', handler);
}
