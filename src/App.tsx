import { useMemo, useState } from 'react'
import { TopBar } from './components/TopBar'
import { GraphView } from './components/GraphView'
import { EntityCard } from './components/EntityCard'
import { Legend } from './components/Legend'
import { SeoContent } from './components/SeoContent'
import { useMythologyData } from './hooks/useMythologyData'
import { useTheme } from './hooks/useTheme'
import { resolveRelationshipsForEntity } from './utils/relationshipLabels'
import { MYTHOLOGIES } from './data/mythologies'
import { RELATIONSHIP_GROUPS } from './types/relationshipMeta'
import type { RelationshipGroup } from './types/entity'

const CATEGORY_ORDER = ['Primordial', 'Titan', 'Olympian', 'Minor God', 'Hero', 'Creature', 'Place']

function App() {
  const activeMythologyId = 'greek'
  const { entities, relationships, entityById } = useMythologyData(activeMythologyId)
  const mythologyName = MYTHOLOGIES.find((m) => m.id === activeMythologyId)?.name ?? activeMythologyId
  const { theme, toggleTheme } = useTheme()

  const categories = useMemo(() => {
    const present = new Set(entities.map((e) => e.category))
    return CATEGORY_ORDER.filter((c) => present.has(c))
  }, [entities])

  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategories, setActiveCategories] = useState<Set<string>>(() => new Set(categories))
  const [activeGroups, setActiveGroups] = useState<Set<RelationshipGroup>>(
    () => new Set(RELATIONSHIP_GROUPS.map((g) => g.id)),
  )

  const toggleCategory = (category: string) => {
    setActiveCategories((prev) => {
      const next = new Set(prev)
      if (next.has(category)) next.delete(category)
      else next.add(category)
      return next
    })
  }

  const toggleGroup = (group: RelationshipGroup) => {
    setActiveGroups((prev) => {
      const next = new Set(prev)
      if (next.has(group)) next.delete(group)
      else next.add(group)
      return next
    })
  }

  const selectedEntity = selectedEntityId ? (entityById.get(selectedEntityId) ?? null) : null
  const selectedRelationships = useMemo(
    () => (selectedEntityId ? resolveRelationshipsForEntity(selectedEntityId, relationships, entityById) : []),
    [selectedEntityId, relationships, entityById],
  )

  const handleNodeClick = (id: string) => setSelectedEntityId(id || null)

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-canvas text-ink">
      <SeoContent entities={entities} mythologyName={mythologyName} />
      <GraphView
        entities={entities}
        relationships={relationships}
        searchQuery={searchQuery}
        activeCategories={activeCategories}
        activeGroups={activeGroups}
        selectedEntityId={selectedEntityId}
        onNodeClick={handleNodeClick}
        theme={theme}
      />
      <TopBar
        mythologyName={mythologyName}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        categories={categories}
        activeCategories={activeCategories}
        onToggleCategory={toggleCategory}
        activeGroups={activeGroups}
        onToggleGroup={toggleGroup}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
      <Legend theme={theme} />
      <EntityCard
        entity={selectedEntity}
        relationships={selectedRelationships}
        onSelectRelated={setSelectedEntityId}
        onClose={() => setSelectedEntityId(null)}
        theme={theme}
      />
    </div>
  )
}

export default App
