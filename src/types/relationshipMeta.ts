import type { RelationshipGroup, RelationshipTypeId } from './entity'

interface RelationshipMeta {
  label: string
  inverseLabel?: string
  bidirectional: boolean
  group: RelationshipGroup
}

export const RELATIONSHIP_TYPES: Record<RelationshipTypeId, RelationshipMeta> = {
  parent_of: { label: 'Parent of', inverseLabel: 'Child of', bidirectional: false, group: 'family' },
  spouse_of: { label: 'Spouse of', bidirectional: true, group: 'family' },
  sibling_of: { label: 'Sibling of', bidirectional: true, group: 'family' },
  rival_of: { label: 'Rival of', bidirectional: true, group: 'conflict' },
  ally_of: { label: 'Ally of', bidirectional: true, group: 'conflict' },
  slain_by: { label: 'Slain by', inverseLabel: 'Slew', bidirectional: false, group: 'conflict' },
  ruler_of: { label: 'Rules', inverseLabel: 'Ruled by', bidirectional: false, group: 'place' },
  located_in: { label: 'Located in', inverseLabel: 'Contains', bidirectional: false, group: 'place' },
}

export const RELATIONSHIP_GROUPS: { id: RelationshipGroup; label: string }[] = [
  { id: 'family', label: 'Family' },
  { id: 'conflict', label: 'Rivalries & Alliances' },
  { id: 'place', label: 'Places' },
]
