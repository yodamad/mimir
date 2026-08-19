export type EntityType =
  | 'primordial'
  | 'titan'
  | 'god'
  | 'hero'
  | 'creature'
  | 'place'

export interface Entity {
  id: string
  mythology: string
  name: string
  wikipedia?: string
  type: EntityType
  category: string
  title?: string
  domain?: string[]
  description: string
  symbols?: string[]
  image?: string
  aliases?: string[]
  tags?: string[]
}

export type RelationshipTypeId =
  | 'parent_of'
  | 'spouse_of'
  | 'sibling_of'
  | 'rival_of'
  | 'ally_of'
  | 'ruler_of'
  | 'located_in'
  | 'slain_by'

export interface Relationship {
  source: string
  target: string
  type: RelationshipTypeId
  label?: string
}

export type RelationshipGroup = 'family' | 'conflict' | 'place'
