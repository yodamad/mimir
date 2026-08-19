import { RELATIONSHIP_TYPES } from '../types/relationshipMeta'
import type { Entity, Relationship, RelationshipTypeId } from '../types/entity'

export interface ResolvedRelationship {
  relatedEntity: Entity
  label: string
  type: RelationshipTypeId
}

/**
 * Custom `label` overrides are authored from the source entity's point of view
 * (e.g. "cronus" -> "uranus" rival_of "Overthrew"). When viewed from the target's
 * side, an asymmetric override would read backwards, so bidirectional types fall
 * back to their generic label and directional types use their inverseLabel.
 */
export function resolveRelationshipsForEntity(
  entityId: string,
  relationships: Relationship[],
  entityById: Map<string, Entity>,
): ResolvedRelationship[] {
  const results: ResolvedRelationship[] = []

  for (const rel of relationships) {
    const meta = RELATIONSHIP_TYPES[rel.type]
    if (rel.source === entityId) {
      const related = entityById.get(rel.target)
      if (!related) continue
      results.push({ relatedEntity: related, label: rel.label ?? meta.label, type: rel.type })
    } else if (rel.target === entityId) {
      const related = entityById.get(rel.source)
      if (!related) continue
      const label = meta.bidirectional ? meta.label : (meta.inverseLabel ?? meta.label)
      results.push({ relatedEntity: related, label, type: rel.type })
    }
  }

  return results.sort((a, b) => a.relatedEntity.name.localeCompare(b.relatedEntity.name))
}
