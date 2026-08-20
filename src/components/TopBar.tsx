import { Moon, Search, Sun } from 'lucide-react'
import { RELATIONSHIP_GROUPS } from '../types/relationshipMeta'
import { getGroupColors, getTypeStyles, type ThemeMode } from '../theme/entityColors'
import type { MythologyMeta } from '../data/mythologies'
import type { Entity, EntityType, RelationshipGroup } from '../types/entity'
import { PathTrail } from './PathTrail'

const CHIP_BASE =
  'flex items-center gap-1.5 rounded-full border px-3 py-1 font-sans text-xs font-medium tracking-wide transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas'
const CHIP_ACTIVE = 'border-accent bg-accent-soft text-accent-ink'
const CHIP_INACTIVE = 'border-hairline bg-transparent text-muted hover:border-accent/50 hover:text-ink'

interface TopBarProps {
  mythologies: MythologyMeta[]
  activeMythologyId: string
  onChangeMythology: (id: string) => void
  searchQuery: string
  onSearchChange: (value: string) => void
  categories: string[]
  categoryToType: Record<string, EntityType>
  activeCategories: Set<string>
  onToggleCategory: (category: string) => void
  activeGroups: Set<RelationshipGroup>
  onToggleGroup: (group: RelationshipGroup) => void
  theme: ThemeMode
  onToggleTheme: () => void
  path: string[]
  entityById: Map<string, Entity>
  selectedEntityId: string | null
  onSelectPathEntry: (id: string) => void
}

export function TopBar({
  mythologies,
  activeMythologyId,
  onChangeMythology,
  searchQuery,
  onSearchChange,
  categories,
  categoryToType,
  activeCategories,
  onToggleCategory,
  activeGroups,
  onToggleGroup,
  theme,
  onToggleTheme,
  path,
  entityById,
  selectedEntityId,
  onSelectPathEntry,
}: TopBarProps) {
  const typeStyles = getTypeStyles(theme)
  const groupColors = getGroupColors(theme)
  const mythologyName = mythologies.find((m) => m.id === activeMythologyId)?.name ?? activeMythologyId

  return (
    <header className="pointer-events-none absolute top-0 left-0 right-0 z-20 flex flex-col gap-3 bg-gradient-to-b from-canvas via-canvas/95 to-transparent px-6 pt-5 pb-8">
      <div className="pointer-events-auto flex items-center gap-3">
        <h1 className="flex items-baseline gap-2.5">
          <span className="font-display text-2xl font-semibold text-ink">Mimir</span>
          {mythologies.length > 1 ? (
            <select
              value={activeMythologyId}
              onChange={(e) => onChangeMythology(e.target.value)}
              aria-label="Mythology"
              className="rounded-full border border-hairline bg-panel/80 py-1 pl-2.5 pr-6 font-sans text-[11px] font-medium uppercase tracking-[0.18em] text-muted outline-none backdrop-blur-md transition-colors focus:border-accent focus-visible:ring-2 focus-visible:ring-accent/40"
            >
              {mythologies.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} Mythology
                </option>
              ))}
            </select>
          ) : (
            <span className="font-sans text-[11px] font-medium uppercase tracking-[0.18em] text-muted">
              {mythologyName} Mythology
            </span>
          )}
        </h1>

        <div className="relative ml-auto w-64">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search entities…"
            className="w-full rounded-full border border-hairline bg-panel/80 py-2 pl-9 pr-4 font-sans text-sm text-ink placeholder:text-muted outline-none backdrop-blur-md transition-colors focus:border-accent focus-visible:ring-2 focus-visible:ring-accent/40"
          />
        </div>

        <button
          onClick={onToggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-hairline bg-panel/80 text-muted backdrop-blur-md transition-colors hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      </div>

      <div className="pointer-events-auto flex flex-wrap items-center gap-2">
        {categories.map((category) => {
          const active = activeCategories.has(category)
          const dotColor = typeStyles[categoryToType[category] ?? 'god'].line
          return (
            <button
              key={category}
              onClick={() => onToggleCategory(category)}
              className={`${CHIP_BASE} ${active ? CHIP_ACTIVE : CHIP_INACTIVE}`}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: dotColor }} />
              {category}
            </button>
          )
        })}

        <span className="mx-1 h-4 w-px bg-hairline" />

        {RELATIONSHIP_GROUPS.map((group) => {
          const active = activeGroups.has(group.id)
          return (
            <button
              key={group.id}
              onClick={() => onToggleGroup(group.id)}
              className={`${CHIP_BASE} ${active ? CHIP_ACTIVE : CHIP_INACTIVE}`}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: groupColors[group.id] }} />
              {group.label}
            </button>
          )
        })}
      </div>

      <PathTrail
        path={path}
        entityById={entityById}
        selectedEntityId={selectedEntityId}
        onSelect={onSelectPathEntry}
        theme={theme}
      />
    </header>
  )
}
