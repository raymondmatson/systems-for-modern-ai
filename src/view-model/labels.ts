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

export interface SvgLabelFit {
  lines: string[];
  truncated: boolean;
}

export function svgLabelFit(
  value: string,
  maxCharacters = 24,
  maxLines = 2,
): SvgLabelFit {
  const words = value.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return {lines: [''], truncated: false};

  const lines: string[] = [];
  let current = '';
  let index = 0;
  while (index < words.length && lines.length < maxLines) {
    const word = words[index]!;
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxCharacters || current.length === 0) {
      current = candidate;
      index += 1;
      continue;
    }
    lines.push(current);
    current = '';
  }
  if (current && lines.length < maxLines) lines.push(current);

  const consumedWords = lines.join(' ').split(/\s+/).filter(Boolean).length;
  const truncated = consumedWords < words.length;
  if (truncated && lines.length > 0) {
    const last = lines.length - 1;
    const available = Math.max(4, maxCharacters - 1);
    lines[last] = `${lines[last]!.replace(/[.…]+$/, '').slice(0, available)}…`;
  }
  return {lines, truncated};
}

export function svgLabelLines(
  value: string,
  maxCharacters = 24,
  maxLines = 2,
): string[] {
  return svgLabelFit(value, maxCharacters, maxLines).lines;
}
