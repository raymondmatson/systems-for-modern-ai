import type {Entity, PropertyDefinition} from '../domain/types';

const tokenLabels: Record<string, string> = {
  ai: 'AI',
  apu: 'APU',
  cpu: 'CPU',
  dma: 'DMA',
  dpu: 'DPU',
  gb: 'GB',
  gbps: 'Gb/s',
  gib: 'GiB',
  gpu: 'GPU',
  h100: 'H100',
  hbm: 'HBM',
  hpc: 'HPC',
  nvlink: 'NVLink',
  nvswitch: 'NVSwitch',
  pcie: 'PCIe',
  rdma: 'RDMA',
  roce: 'RoCE',
  sram: 'SRAM',
  tpu: 'TPU',
};

export function humanizeIdentifier(value: string): string {
  const words = value
    .replaceAll('-', '_')
    .split('_')
    .filter(Boolean)
    .map((word) => tokenLabels[word.toLowerCase()] ?? word.toLowerCase());
  if (words.length === 0) return value;
  const [first, ...rest] = words;
  const leading = tokenLabels[first.toLowerCase()] ?? `${first.charAt(0).toUpperCase()}${first.slice(1)}`;
  return [leading, ...rest].join(' ');
}

export function entityTypeLabel(entityType: string): string {
  return humanizeIdentifier(entityType);
}

export function relationshipTypeLabel(relationshipType: string): string {
  return humanizeIdentifier(relationshipType);
}

export function propertyLabel(
  propertyId: string,
  definition?: PropertyDefinition,
): string {
  const source = definition?.name?.trim();
  if (source) {
    return source
      .split(/\s+/)
      .map((word) => tokenLabels[word.toLowerCase()] ?? word)
      .join(' ');
  }
  return humanizeIdentifier(propertyId);
}

export function representativeEntityLabel(entity: Entity): string {
  const memberType = entity.population?.memberEntityType;
  if (memberType) return `Representative ${entityTypeLabel(memberType)}`;
  return `Representative member of ${entity.name}`;
}

export function formatMetadataValue(value: string): string {
  return humanizeIdentifier(value);
}

export function svgLabelLines(value: string, maxCharacters = 24): string[] {
  if (value.length <= maxCharacters) return [value];
  const words = value.split(/\s+/);
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxCharacters || !current) {
      current = candidate;
      continue;
    }
    lines.push(current);
    current = word;
    if (lines.length === 2) break;
  }
  if (lines.length < 2 && current) lines.push(current);
  const consumed = lines.join(' ').length;
  if (consumed < value.length && lines.length > 0) {
    const last = lines.length - 1;
    const available = Math.max(4, maxCharacters - 1);
    lines[last] = `${lines[last]!.slice(0, available)}…`;
  }
  return lines.slice(0, 2);
}
