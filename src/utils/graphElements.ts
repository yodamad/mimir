import type { ElementDefinition } from 'cytoscape'
import { RELATIONSHIP_TYPES } from '../types/relationshipMeta'
import type { Entity, Relationship } from '../types/entity'

const CANVAS_LABEL_MAX_LENGTH = 20

// Long free-text relationship labels wrap onto many rotated lines on the graph
// canvas and become unreadable. Cap what's drawn on the edge itself to a single
// line's worth; the full sentence is preserved in `fullLabel` for the hover
// tooltip and entity card.
function truncateLabel(label: string, maxLength = CANVAS_LABEL_MAX_LENGTH): string {
  if (label.length <= maxLength) return label
  const cut = label.slice(0, maxLength)
  const lastSpace = cut.lastIndexOf(' ')
  const trimmed = lastSpace > maxLength * 0.4 ? cut.slice(0, lastSpace) : cut
  return `${trimmed.trimEnd()}…`
}

export function buildGraphElements(entities: Entity[], relationships: Relationship[]): ElementDefinition[] {
  const nodes: ElementDefinition[] = entities.map((entity) => ({
    data: {
      id: entity.id,
      name: entity.name,
      type: entity.type,
      category: entity.category,
    },
  }))

  const edges: ElementDefinition[] = relationships.map((rel, index) => {
    const fullLabel = rel.label ?? RELATIONSHIP_TYPES[rel.type].label
    return {
      data: {
        id: `edge-${index}-${rel.source}-${rel.target}`,
        source: rel.source,
        target: rel.target,
        relType: rel.type,
        group: RELATIONSHIP_TYPES[rel.type].group,
        label: truncateLabel(fullLabel),
        fullLabel,
      },
    }
  })

  return [...nodes, ...edges]
}
