import type { ElementDefinition } from 'cytoscape'
import { RELATIONSHIP_TYPES } from '../types/relationshipMeta'
import type { Entity, Relationship } from '../types/entity'

export function buildGraphElements(entities: Entity[], relationships: Relationship[]): ElementDefinition[] {
  const nodes: ElementDefinition[] = entities.map((entity) => ({
    data: {
      id: entity.id,
      name: entity.name,
      type: entity.type,
      category: entity.category,
    },
  }))

  const edges: ElementDefinition[] = relationships.map((rel, index) => ({
    data: {
      id: `edge-${index}-${rel.source}-${rel.target}`,
      source: rel.source,
      target: rel.target,
      relType: rel.type,
      group: RELATIONSHIP_TYPES[rel.type].group,
      label: rel.label ?? RELATIONSHIP_TYPES[rel.type].label,
    },
  }))

  return [...nodes, ...edges]
}
