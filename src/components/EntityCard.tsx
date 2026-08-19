import { useEffect, useState } from 'react'
import { ChevronDown, ChevronUp, ExternalLink, X } from 'lucide-react'
import type { Entity } from '../types/entity'
import type { ResolvedRelationship } from '../utils/relationshipLabels'
import { getTypeStyle, type ThemeMode } from '../theme/entityColors'

function wikipediaUrl(title: string): string {
  return `https://en.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, '_'))}`
}

interface EntityCardProps {
  entity: Entity | null
  relationships: ResolvedRelationship[]
  onSelectRelated: (id: string) => void
  onClose: () => void
  theme: ThemeMode
}

export function EntityCard({ entity, relationships, onSelectRelated, onClose, theme }: EntityCardProps) {
  const typeStyle = entity ? getTypeStyle(theme, entity.type) : null
  const [relationshipsOpen, setRelationshipsOpen] = useState(false)

  useEffect(() => {
    setRelationshipsOpen(false)
  }, [entity?.id])

  return (
    <aside
      className={`absolute top-5 right-5 bottom-5 z-30 w-full max-w-sm overflow-y-auto rounded-2xl border border-hairline bg-panel/95 shadow-2xl backdrop-blur-xl transition-all duration-300 ease-out ${
        entity ? 'translate-x-0 opacity-100' : 'pointer-events-none translate-x-6 opacity-0'
      }`}
    >
      {entity && typeStyle && (
        <div className="flex flex-col gap-5 p-6">
          <div className="flex items-start justify-between">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-full border-2 font-display text-xl font-semibold"
              style={{ borderColor: typeStyle.line, color: typeStyle.text, backgroundColor: typeStyle.fill }}
            >
              {entity.name.charAt(0)}
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-1.5 text-muted transition-colors hover:bg-panel-2 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div>
            <span
              className="inline-block rounded-full px-2.5 py-0.5 font-sans text-[10px] font-semibold uppercase tracking-widest"
              style={{ color: typeStyle.text, backgroundColor: typeStyle.fill }}
            >
              {entity.category}
            </span>
            <h2 className="mt-2 font-display text-2xl font-semibold text-ink">{entity.name}</h2>
            {entity.title && <p className="font-display text-base italic text-muted">{entity.title}</p>}
            {entity.aliases && entity.aliases.length > 0 && (
              <p className="mt-1 font-sans text-xs text-muted">Also known as {entity.aliases.join(', ')}</p>
            )}
            {entity.wikipedia && (
              <a
                href={wikipediaUrl(entity.wikipedia)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1 font-sans text-xs font-medium text-accent-ink transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
              >
                View on Wikipedia
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>

          {entity.domain && entity.domain.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {entity.domain.map((d) => (
                <span key={d} className="rounded-full border border-hairline px-2.5 py-0.5 font-sans text-xs text-ink">
                  {d}
                </span>
              ))}
            </div>
          )}

          <p className="font-display text-[15px] leading-relaxed text-ink/90">{entity.description}</p>

          {entity.symbols && entity.symbols.length > 0 && (
            <div>
              <h3 className="mb-1.5 font-sans text-[11px] font-semibold uppercase tracking-widest text-muted">
                Symbols
              </h3>
              <p className="font-sans text-sm text-ink/80">{entity.symbols.join(', ')}</p>
            </div>
          )}

          {relationships.length > 0 && (
            <div>
              <button
                onClick={() => setRelationshipsOpen((v) => !v)}
                aria-expanded={relationshipsOpen}
                className="flex w-full items-center justify-between py-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
              >
                <h3 className="font-sans text-[11px] font-semibold uppercase tracking-widest text-muted">
                  Relationships ({relationships.length})
                </h3>
                {relationshipsOpen ? (
                  <ChevronUp className="h-3.5 w-3.5 text-muted" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5 text-muted" />
                )}
              </button>

              {relationshipsOpen && (
                <ul className="mt-1 flex flex-col gap-1">
                  {relationships.map((rel, i) => (
                    <li key={`${rel.relatedEntity.id}-${i}`}>
                      <button
                        onClick={() => onSelectRelated(rel.relatedEntity.id)}
                        className="flex w-full items-center justify-between rounded-lg border border-transparent px-2.5 py-2 text-left transition-colors hover:border-hairline hover:bg-panel-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
                      >
                        <span className="font-sans text-sm text-ink">{rel.relatedEntity.name}</span>
                        <span className="font-sans text-xs text-muted">{rel.label}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}
    </aside>
  )
}
