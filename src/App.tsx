import { useMemo, useState } from 'react'
import { TopBar } from './components/TopBar'
import { GraphView } from './components/GraphView'
import { EntityCard } from './components/EntityCard'
import { Legend } from './components/Legend'
import { SeoContent } from './components/SeoContent'
import { useMythologyData } from './hooks/useMythologyData'
import { useTheme } from './hooks/useTheme'
import { usePathHistory } from './hooks/usePathHistory'
import { resolveRelationshipsForEntity } from './utils/relationshipLabels'
import { MYTHOLOGIES, getMythologyData, getMythologyIdFromSearch } from './data/mythologies'
import { RELATIONSHIP_GROUPS } from './types/relationshipMeta'
import { TYPE_ORDER } from './theme/entityColors'
import type { Entity, EntityType, RelationshipGroup } from './types/entity'

function App() {
  const [activeMythologyId, setActiveMythologyId] = useState(
    () => getMythologyIdFromSearch(window.location.search) ?? MYTHOLOGIES[0]?.id ?? 'greek',
  )
  const { entities, relationships, entityById } = useMythologyData(activeMythologyId)
  const mythologyName = MYTHOLOGIES.find((m) => m.id === activeMythologyId)?.name ?? activeMythologyId
  const { theme, toggleTheme } = useTheme()

  const categoryToType = useMemo(() => {
    const map: Record<string, EntityType> = {}
    for (const entity of entities) map[entity.category] ??= entity.type
    return map
  }, [entities])

  const categories = useMemo(() => {
    const present = Array.from(new Set(entities.map((e) => e.category)))
    return present.sort((a, b) => {
      const typeDiff = TYPE_ORDER.indexOf(categoryToType[a]) - TYPE_ORDER.indexOf(categoryToType[b])
      return typeDiff !== 0 ? typeDiff : a.localeCompare(b)
    })
  }, [entities, categoryToType])

  const pathHistory = usePathHistory()
  const { selectedEntityId } = pathHistory
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategories, setActiveCategories] = useState<Set<string>>(() => new Set(categories))
  const [activeGroups, setActiveGroups] = useState<Set<RelationshipGroup>>(
    () => new Set(RELATIONSHIP_GROUPS.map((g) => g.id)),
  )

  const handleChangeMythology = (id: string) => {
    const { entities: nextEntities } = getMythologyData(id) as { entities: Entity[] }
    setActiveMythologyId(id)
    pathHistory.reset()
    setSearchQuery('')
    setActiveCategories(new Set(nextEntities.map((e) => e.category)))
    window.history.replaceState(null, '', `?${id}`)
  }

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

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-canvas text-ink">
      <SeoContent entities={entities} mythologyName={mythologyName} />
      <GraphView
        key={activeMythologyId}
        entities={entities}
        relationships={relationships}
        searchQuery={searchQuery}
        activeCategories={activeCategories}
        activeGroups={activeGroups}
        selectedEntityId={selectedEntityId}
        path={pathHistory.path}
        onNodeClick={pathHistory.select}
        theme={theme}
      />
      <TopBar
        mythologies={MYTHOLOGIES}
        activeMythologyId={activeMythologyId}
        onChangeMythology={handleChangeMythology}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        categories={categories}
        categoryToType={categoryToType}
        activeCategories={activeCategories}
        onToggleCategory={toggleCategory}
        activeGroups={activeGroups}
        onToggleGroup={toggleGroup}
        theme={theme}
        onToggleTheme={toggleTheme}
        path={pathHistory.path}
        entityById={entityById}
        selectedEntityId={selectedEntityId}
        onSelectPathEntry={pathHistory.select}
      />
      <Legend theme={theme} />
      <EntityCard
        entity={selectedEntity}
        relationships={selectedRelationships}
        onSelectRelated={pathHistory.select}
        onClose={() => pathHistory.select('')}
        theme={theme}
      />
    </div>
  )
}

export default App
