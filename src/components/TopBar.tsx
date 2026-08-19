import { Search } from 'lucide-react'
import { RELATIONSHIP_GROUPS } from '../types/relationshipMeta'
import type { RelationshipGroup } from '../types/entity'

interface TopBarProps {
  mythologyName: string
  searchQuery: string
  onSearchChange: (value: string) => void
  categories: string[]
  activeCategories: Set<string>
  onToggleCategory: (category: string) => void
  activeGroups: Set<RelationshipGroup>
  onToggleGroup: (group: RelationshipGroup) => void
}

export function TopBar({
  mythologyName,
  searchQuery,
  onSearchChange,
  categories,
  activeCategories,
  onToggleCategory,
  activeGroups,
  onToggleGroup,
}: TopBarProps) {
  return (
    <header className="absolute top-0 left-0 right-0 z-20 flex flex-col gap-3 bg-gradient-to-b from-[#0f0c1d] via-[#0f0c1d]/95 to-transparent px-6 pt-5 pb-6 pointer-events-none">
      <div className="flex items-center gap-4 pointer-events-auto">
        <h1 className="font-[Cinzel] text-xl tracking-wide text-[#e3b341]">
          Mimir <span className="text-sm font-normal text-[#8b85a8] font-[Cormorant_Garamond]">— {mythologyName} Mythology</span>
        </h1>
        <div className="relative ml-auto w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8b85a8]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search entities..."
            className="w-full rounded-full border border-[#3a3358] bg-[#1b1530]/90 py-2 pl-9 pr-4 text-sm text-[#f0ecff] placeholder:text-[#6b6489] outline-none transition-colors focus:border-[#e3b341]"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 pointer-events-auto">
        {categories.map((category) => {
          const active = activeCategories.has(category)
          return (
            <button
              key={category}
              onClick={() => onToggleCategory(category)}
              className={`rounded-full border px-3 py-1 text-xs font-medium tracking-wide transition-colors ${
                active
                  ? 'border-[#e3b341] bg-[#e3b341]/15 text-[#e3b341]'
                  : 'border-[#3a3358] bg-transparent text-[#8b85a8] hover:border-[#6b6489] hover:text-[#c9c3e6]'
              }`}
            >
              {category}
            </button>
          )
        })}

        <span className="mx-1 h-4 w-px bg-[#3a3358]" />

        {RELATIONSHIP_GROUPS.map((group) => {
          const active = activeGroups.has(group.id)
          return (
            <button
              key={group.id}
              onClick={() => onToggleGroup(group.id)}
              className={`rounded-full border px-3 py-1 text-xs font-medium tracking-wide transition-colors ${
                active
                  ? 'border-[#7c9cff] bg-[#7c9cff]/15 text-[#a9bdff]'
                  : 'border-[#3a3358] bg-transparent text-[#8b85a8] hover:border-[#6b6489] hover:text-[#c9c3e6]'
              }`}
            >
              {group.label}
            </button>
          )
        })}
      </div>
    </header>
  )
}
