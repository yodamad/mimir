import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { getGroupColors, getTypeStyles, TYPE_ORDER, type NodeShape, type ThemeMode } from '../theme/entityColors'
import { RELATIONSHIP_GROUPS } from '../types/relationshipMeta'

function ShapeGlyph({ shape, fill, line }: { shape: NodeShape; fill: string; line: string }) {
  const common = { stroke: line, strokeWidth: 1.5, fill }
  switch (shape) {
    case 'diamond':
      return <polygon points="8,1.5 14.5,8 8,14.5 1.5,8" {...common} />
    case 'hexagon':
      return <polygon points="4.5,2 11.5,2 15,8 11.5,14 4.5,14 1,8" {...common} />
    case 'ellipse':
      return <circle cx="8" cy="8" r="6.5" {...common} />
    case 'triangle':
      return <polygon points="8,2 14.5,14 1.5,14" {...common} />
    case 'star':
      return <polygon points="8,1 9.8,6 15,6 10.8,9.2 12.4,14.2 8,11.2 3.6,14.2 5.2,9.2 1,6 6.2,6" {...common} />
    case 'round-rectangle':
      return <rect x="1.5" y="4" width="13" height="8" rx="3" {...common} />
  }
}

interface LegendProps {
  theme: ThemeMode
}

export function Legend({ theme }: LegendProps) {
  const [open, setOpen] = useState(true)
  const types = getTypeStyles(theme)
  const groups = getGroupColors(theme)

  return (
    <div className="absolute bottom-5 left-5 z-20 w-56 overflow-hidden rounded-2xl border border-hairline bg-panel/90 shadow-xl backdrop-blur-xl">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between px-4 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
      >
        <span className="font-sans text-[11px] font-semibold uppercase tracking-widest text-muted">Legend</span>
        {open ? <ChevronDown className="h-3.5 w-3.5 text-muted" /> : <ChevronUp className="h-3.5 w-3.5 text-muted" />}
      </button>

      {open && (
        <div className="flex flex-col gap-3 border-t border-hairline px-4 py-3">
          <ul className="flex flex-col gap-1.5">
            {TYPE_ORDER.map((type) => {
              const style = types[type]
              return (
                <li key={type} className="flex items-center gap-2.5">
                  <svg width="16" height="16" viewBox="0 0 16 16" className="shrink-0">
                    <ShapeGlyph shape={style.shape} fill={style.fill} line={style.line} />
                  </svg>
                  <span className="font-sans text-xs text-ink">{style.label}</span>
                </li>
              )
            })}
          </ul>

          <div className="flex flex-col gap-1.5 border-t border-hairline pt-3">
            {RELATIONSHIP_GROUPS.map((group) => (
              <div key={group.id} className="flex items-center gap-2.5">
                <span className="h-[3px] w-4 shrink-0 rounded-full" style={{ backgroundColor: groups[group.id] }} />
                <span className="font-sans text-xs text-ink">{group.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
