import type { Entity } from '../types/entity'

interface SeoContentProps {
  entities: Entity[]
  mythologyName: string
}

/**
 * Real DOM content describing every entity, visually hidden but readable by
 * search engines and screen readers. The graph itself renders to a <canvas>,
 * so without this the page has no indexable text. The TopBar already renders
 * the page's one visible <h1> ("Mimir" / "{mythologyName} Mythology"), so this
 * starts at h2 rather than duplicating it.
 */
export function SeoContent({ entities, mythologyName }: SeoContentProps) {
  return (
    <div className="sr-only">
      <p>
        Mimir is a free interactive graph explorer for world mythology, currently featuring{' '}
        {mythologyName} mythology: gods, titans, heroes, creatures and places, and how they're
        connected through family, rivalry, rulership and myth. Search for any figure, filter by
        category, and click through the relationships between them.
      </p>
      <h2>{mythologyName} Mythology Figures</h2>
      <ul>
        {entities.map((entity) => (
          <li key={entity.id}>
            <strong>{entity.name}</strong>
            {entity.title ? ` — ${entity.title}` : ''} ({entity.category}): {entity.description}
          </li>
        ))}
      </ul>
    </div>
  )
}
