import { ChevronRight, RotateCcw } from 'lucide-react'
import type { Entity } from '../types/entity'
import type { ThemeMode } from '../theme/entityColors'

interface PathTrailProps {
  path: string[]
  entityById: Map<string, Entity>
  selectedEntityId: string | null
  onSelect: (id: string) => void
  onReset: () => void
  theme: ThemeMode
}

export function PathTrail({ path, entityById, selectedEntityId, onSelect, onReset }: PathTrailProps) {
  if (path.length === 0) return null

  return (
    <nav
      aria-label="Selection path"
      className="pointer-events-auto flex w-fit max-w-full items-center gap-1 overflow-x-auto rounded-full border border-hairline bg-panel/80 px-3 py-1.5 backdrop-blur-md"
    >
      <button
        onClick={onReset}
        aria-label="Reset path"
        title="Reset path"
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
      >
        <RotateCcw className="h-3.5 w-3.5" />
      </button>
      <span className="h-3.5 w-px shrink-0 bg-hairline" />
      {path.map((id, i) => {
        const entity = entityById.get(id)
        const active = id === selectedEntityId
        return (
          <span key={`${id}-${i}`} className="flex shrink-0 items-center gap-1">
            {i > 0 && <ChevronRight className="h-3 w-3 shrink-0 text-muted" />}
            <button
              onClick={() => onSelect(id)}
              className={`whitespace-nowrap rounded-full px-2 py-1 font-sans text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 ${
                active ? 'bg-accent-soft text-accent-ink' : 'text-muted hover:text-ink'
              }`}
            >
              {entity?.name ?? id}
            </button>
          </span>
        )
      })}
    </nav>
  )
}
