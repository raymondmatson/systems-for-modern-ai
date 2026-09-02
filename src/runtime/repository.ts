import type {
  ReferenceSystem,
  RuntimeConcept,
  RuntimeManifest,
} from '../domain/types';

export interface RuntimeOccurrence {
  systemId: string;
  configurationId: string;
  conceptId: string;
  role: string;
  target: {
    type: 'entity' | 'connection' | 'configuration';
    id: string;
  };
  note?: string;
}

export interface BootContent {
  manifest: RuntimeManifest;
  systems: Record<string, ReferenceSystem>;
  concepts: Record<string, RuntimeConcept>;
  occurrences: Record<string, RuntimeOccurrence[]>;
}

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Content unavailable: ${url} (${response.status})`);
  }
  return response.json() as Promise<T>;
}

export class BrowserContentRepository {
  async loadBoot(): Promise<BootContent> {
    const manifest = await getJson<RuntimeManifest>('./runtime/manifest.json');

    const systemEntries = await Promise.all(
      manifest.initialSystemIds.map(async (id) => [
        id,
        await getJson<ReferenceSystem>(`./runtime/systems/${id}.json`),
      ] as const),
    );

    const conceptEntries = await Promise.all(
      manifest.conceptIds.map(async (id) => [
        id,
        await getJson<RuntimeConcept>(`./runtime/concepts/${id}.json`),
      ] as const),
    );

    return {
      manifest,
      systems: Object.fromEntries(systemEntries),
      concepts: Object.fromEntries(conceptEntries),
      occurrences: await getJson<Record<string, RuntimeOccurrence[]>>(
        './runtime/concepts/occurrences.json',
      ),
    };
  }
}

export type {RuntimeConcept};
