export type Id = string;
export type ViewName = 'explore' | 'concepts';

export type ContextLocator =
  | {kind: 'entity'; systemId: Id; configurationId: Id; entityId: Id}
  | {kind: 'connection'; systemId: Id; configurationId: Id; connectionId: Id}
  | {
      kind: 'representative_member';
      systemId: Id;
      configurationId: Id;
      aggregateId: Id;
      path: readonly Id[];
    }
  | {kind: 'concept'; conceptId: Id}
  | {kind: 'concept_library'};

export interface Evidence {
  status: string;
  sourceIds: string[];
  note?: string;
}

export interface Population {
  count: {form: string; basis: string; value?: string};
  expansionMode:
    | 'aggregate_only'
    | 'representative_member'
    | 'addressable_members';
  individuallyAddressable: boolean;
  memberEntityType?: string;
}

export interface PropertyValue {
  status: string;
  value?: {
    form: string;
    number?: string;
    min?: string;
    max?: string;
    text?: string;
    unit?: string;
    approximate?: boolean;
  };
  basis?: string;
  scope?: string;
  directionalBasis?: string;
  derivation?: string;
  evidence?: Evidence;
}

export interface Entity {
  id: Id;
  name: string;
  entityType: string;
  exploreTier: number;
  representation: 'explicit' | 'aggregate' | 'black_box';
  evidence: Evidence;
  inventory: {category: string; item: string};
  properties: Record<Id, PropertyValue>;
  childIds: Id[];
  parentId?: Id;
  population?: Population;
  productIdentity?: Record<string, string>;
}

export interface Connection {
  id: Id;
  name: string;
  relationshipType: string;
  endpointIds: Id[];
  directionality: string;
  evidence: Evidence;
  properties: Record<Id, PropertyValue>;
}

export interface ScenarioEffect {
  target: {type: 'entity' | 'connection' | 'configuration'; id: Id};
  state: Record<string, unknown>;
}

export interface Scenario {
  id: Id;
  name: string;
  description: string;
  isDefault: boolean;
  scenarioTypes: string[];
  effects: ScenarioEffect[];
}

export interface ConceptOccurrence {
  conceptId: Id;
  role: string;
  target: {type: 'entity' | 'connection' | 'configuration'; id: Id};
  note?: string;
}

export interface Configuration {
  id: Id;
  name: string;
  status: string;
  rootEntityId: Id;
  defaultScenarioId: Id;
  entities: Record<Id, Entity>;
  connections: Record<Id, Connection>;
  conceptOccurrences: ConceptOccurrence[];
  scenarios: Record<Id, Scenario>;
  scopeNotes: string;
  modelingNotes: string[];
}

export interface ReferenceSystem {
  id: Id;
  name: string;
  summary: string;
  planningStatus: string;
  sourceSchemaVersion: string;
  configurations: Record<Id, Configuration>;
}

export interface RuntimeManifest {
  runtimeFormatVersion: string;
  sourceSchemaVersions: string[];
  conceptSchemaVersion: string;
  defaultSystemId: Id;
  initialSystemIds: Id[];
  systemIds: Id[];
  conceptIds: Id[];
}

export interface RuntimeConcept {
  schema_version: string;
  concept_id: Id;
  name: string;
  concept_kind: string;
  summary: string;
  content_file: string;
  aliases?: string[];
  relationships?: Record<string, Id[]>;
  tags?: string[];
  markdown: string;
}

export interface CapabilityProfile {
  detail_sections: string[];
  scenario_state_categories: string[];
  structural_role: string;
}

export interface EntityTypeCapability {
  entity_type: string;
  profile: string;
  selectable: boolean;
  inspectable: boolean;
  enterability: 'contextual' | string;
  supports_concepts: boolean;
}

export interface CapabilityRegistry {
  schema_version: string;
  profiles: Record<string, CapabilityProfile>;
  entity_types: EntityTypeCapability[];
}

export interface PropertyDefinition {
  id: Id;
  name: string;
  value_kind: string;
  canonical_unit?: string;
}

export interface PropertyRegistry {
  schema_version: string;
  properties: Record<Id, PropertyDefinition>;
}

export interface TraversalContext {
  origin: ContextLocator;
  via: ContextLocator;
}

export interface ExploreState {
  systemId: Id;
  configurationId: Id;
  scenarioId: Id;
  structuralLocation: ContextLocator;
  selection?: ContextLocator;
  preview?: ContextLocator;
  structuralHistory: ContextLocator[];
  traversalContext?: TraversalContext;
  detailVisible: boolean;
}

export interface ConceptsState {
  conceptId?: Id;
  query: string;
  browseHistory: Id[];
}

export type HistoryDestination =
  | {view: 'explore'; locator: ContextLocator; traversalContext?: TraversalContext}
  | {
      view: 'concepts';
      locator: ContextLocator;
      systemId: Id;
      configurationId: Id;
    };

export type ReturnContext =
  | {
      kind: 'explore_origin';
      systemId: Id;
      configurationId: Id;
      scenarioId: Id;
      structuralLocation: ContextLocator;
      structuralPath: Id[];
      selection?: ContextLocator;
      traversalContext?: TraversalContext;
      sourceConceptId: Id;
      label: string;
    }
  | {kind: 'concept_origin'; conceptId: Id; label: string};

export interface AppState {
  view: ViewName;
  explore: ExploreState;
  concepts: ConceptsState;
  appHistory: HistoryDestination[];
  historyIndex: number;
  returnContext?: ReturnContext;
}
