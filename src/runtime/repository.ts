import type {
  CapabilityRegistry,
  PropertyRegistry,
  ReferenceSystem,
  RuntimeConcept,
  RuntimeManifest,
  ResolvedProduct,
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
  capabilities: CapabilityRegistry;
  propertyRegistry: PropertyRegistry;
  products: Record<string, ResolvedProduct>;
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

    const productIndex = manifest.productIds?.length
      ? await getJson<Array<{id:string;revision:number}>>('./runtime/products/index.json')
      : [];
    const productEntries = await Promise.all(
      (manifest.productIds ?? []).map(async (id) => {
        const hit = productIndex.find((entry) => entry.id === id);
        return hit
          ? ([id, await getJson<ResolvedProduct>(`./runtime/products/${id}@${hit.revision}.json`)] as const)
          : undefined;
      }),
    );

    const [occurrences, capabilities, propertyRegistry] = await Promise.all([
      getJson<Record<string, RuntimeOccurrence[]>>('./runtime/concepts/occurrences.json'),
      getJson<CapabilityRegistry>('./runtime/capabilities.json'),
      getJson<PropertyRegistry>('./runtime/property-registry.json'),
    ]);

    return {
      manifest,
      systems: Object.fromEntries(systemEntries),
      concepts: Object.fromEntries(conceptEntries),
      occurrences,
      capabilities,
      propertyRegistry,
      products: Object.fromEntries(productEntries.filter((entry): entry is readonly [string, ResolvedProduct] => Boolean(entry))),
    };
  }
}

export type {RuntimeConcept};
