import { X } from 'lucide-react'
import type { Entity, EntityType } from '../types/entity'
import type { ResolvedRelationship } from '../utils/relationshipLabels'

const TYPE_STYLES: Record<EntityType, { color: string; label: string }> = {
  primordial: { color: '#8079a3', label: 'Primordial' },
  titan: { color: '#c9a227', label: 'Titan' },
  god: { color: '#e3b341', label: 'God' },
  hero: { color: '#7c9cff', label: 'Hero' },
  creature: { color: '#e2726f', label: 'Creature' },
  place: { color: '#8fd6ab', label: 'Place' },
}

interface EntityCardProps {
  entity: Entity | null
  relationships: ResolvedRelationship[]
  onSelectRelated: (id: string) => void
  onClose: () => void
}

export function EntityCard({ entity, relationships, onSelectRelated, onClose }: EntityCardProps) {
  const typeStyle = entity ? TYPE_STYLES[entity.type] : null

  return (
    <aside
      className={`absolute top-0 right-0 z-30 h-full w-full max-w-sm overflow-y-auto border-l border-[#3a3358] bg-[#150f27]/97 shadow-2xl transition-transform duration-300 ease-out ${
        entity ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      {entity && typeStyle && (
        <div className="flex flex-col gap-5 p-6 pt-16">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 rounded-full p-1.5 text-[#8b85a8] transition-colors hover:bg-[#2a2347] hover:text-[#f0ecff]"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>

          <div
            className="flex h-20 w-20 items-center justify-center rounded-full border-2 font-[Cinzel] text-2xl"
            style={{ borderColor: typeStyle.color, color: typeStyle.color, backgroundColor: `${typeStyle.color}1a` }}
          >
            {entity.name.charAt(0)}
          </div>

          <div>
            <span
              className="inline-block rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest"
              style={{ color: typeStyle.color, backgroundColor: `${typeStyle.color}22` }}
            >
              {entity.category}
            </span>
            <h2 className="mt-2 font-[Cinzel] text-2xl text-[#f0ecff]">{entity.name}</h2>
            {entity.title && <p className="font-[Cormorant_Garamond] text-base italic text-[#a9a2cc]">{entity.title}</p>}
            {entity.aliases && entity.aliases.length > 0 && (
              <p className="mt-1 text-xs text-[#6b6489]">Also known as: {entity.aliases.join(', ')}</p>
            )}
          </div>

          {entity.domain && entity.domain.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {entity.domain.map((d) => (
                <span key={d} className="rounded-full border border-[#3a3358] px-2.5 py-0.5 text-xs text-[#c9c3e6]">
                  {d}
                </span>
              ))}
            </div>
          )}

          <p className="font-[Cormorant_Garamond] text-[15px] leading-relaxed text-[#dcd8f0]">{entity.description}</p>

          {entity.symbols && entity.symbols.length > 0 && (
            <div>
              <h3 className="mb-1.5 text-[11px] font-semibold uppercase tracking-widest text-[#6b6489]">Symbols</h3>
              <p className="text-sm text-[#c9c3e6]">{entity.symbols.join(', ')}</p>
            </div>
          )}

          {relationships.length > 0 && (
            <div>
              <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-[#6b6489]">
                Relationships ({relationships.length})
              </h3>
              <ul className="flex flex-col gap-1">
                {relationships.map((rel, i) => (
                  <li key={`${rel.relatedEntity.id}-${i}`}>
                    <button
                      onClick={() => onSelectRelated(rel.relatedEntity.id)}
                      className="flex w-full items-center justify-between rounded-lg border border-transparent px-2.5 py-2 text-left transition-colors hover:border-[#3a3358] hover:bg-[#1f1938]"
                    >
                      <span className="text-sm text-[#f0ecff]">{rel.relatedEntity.name}</span>
                      <span className="text-xs text-[#8b85a8]">{rel.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </aside>
  )
}
