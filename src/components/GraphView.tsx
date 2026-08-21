import { useEffect, useMemo, useRef, useState } from 'react'
import cytoscape from 'cytoscape'
import fcose from 'cytoscape-fcose'
import CytoscapeComponent from 'react-cytoscapejs'
import type { Core, StylesheetJsonBlock } from 'cytoscape'
import { buildGraphElements } from '../utils/graphElements'
import { RELATIONSHIP_TYPES } from '../types/relationshipMeta'
import { getGroupColors, getTypeStyles, type ThemeMode } from '../theme/entityColors'
import type { Entity, Relationship, RelationshipGroup } from '../types/entity'

cytoscape.use(fcose)

function buildStylesheet(theme: ThemeMode): StylesheetJsonBlock[] {
  const types = getTypeStyles(theme)
  const groups = getGroupColors(theme)
  const canvasBg = theme === 'dark' ? '#0c0a16' : '#f6f4fb'
  const inkColor = theme === 'dark' ? '#f2eefb' : '#17132a'
  const edgeTextColor = theme === 'dark' ? '#e5e1f5' : '#332c4d'
  const pathColor = theme === 'dark' ? '#f2b84a' : '#b8790a'

  return [
    {
      selector: 'node',
      style: {
        width: (ele: cytoscape.NodeSingular) => 22 + Math.min(ele.degree(false), 16) * 3,
        height: (ele: cytoscape.NodeSingular) => 22 + Math.min(ele.degree(false), 16) * 3,
        label: 'data(name)',
        color: inkColor,
        'font-size': 9,
        'font-family': 'Fraunces, Georgia, serif',
        'font-weight': 500,
        'text-valign': 'bottom',
        'text-margin-y': 6,
        'text-outline-width': 2.5,
        'text-outline-color': canvasBg,
        'border-width': 2,
        'transition-property': 'opacity, border-width, border-color, overlay-opacity',
        'transition-duration': 150,
      },
    },
    { selector: 'node[type = "primordial"]', style: { shape: 'diamond', 'background-color': types.primordial.fill, 'border-color': types.primordial.line } },
    { selector: 'node[type = "titan"]', style: { shape: 'hexagon', 'background-color': types.titan.fill, 'border-color': types.titan.line } },
    { selector: 'node[type = "god"]', style: { shape: 'ellipse', 'background-color': types.god.fill, 'border-color': types.god.line } },
    { selector: 'node[type = "hero"]', style: { shape: 'triangle', 'background-color': types.hero.fill, 'border-color': types.hero.line } },
    { selector: 'node[type = "creature"]', style: { shape: 'star', 'background-color': types.creature.fill, 'border-color': types.creature.line } },
    { selector: 'node[type = "place"]', style: { shape: 'round-rectangle', 'background-color': types.place.fill, 'border-color': types.place.line } },
    {
      selector: 'edge',
      style: {
        width: 1.2,
        'curve-style': 'bezier',
        opacity: theme === 'dark' ? 0.55 : 0.65,
        label: 'data(label)',
        'font-size': 9,
        'font-family': 'Inter, system-ui, sans-serif',
        'text-opacity': 0,
        'text-rotation': 'autorotate',
        'text-wrap': 'none',
        color: edgeTextColor,
        'text-background-color': canvasBg,
        'text-background-opacity': 0.85,
        'text-background-padding': '2px',
        'line-color': (ele: cytoscape.EdgeSingular) => groups[ele.data('group') as RelationshipGroup],
        'target-arrow-color': (ele: cytoscape.EdgeSingular) => groups[ele.data('group') as RelationshipGroup],
        'target-arrow-shape': (ele: cytoscape.EdgeSingular) =>
          RELATIONSHIP_TYPES[ele.data('relType') as keyof typeof RELATIONSHIP_TYPES].bidirectional ? 'none' : 'triangle',
        'arrow-scale': 0.8,
      },
    },
    { selector: '.category-hidden, .group-hidden', style: { display: 'none' } },
    { selector: '.context-dimmed, .search-dimmed', style: { opacity: 0.08, 'text-opacity': 0 } },
    {
      selector: 'node.focus-highlight, node.search-match',
      style: {
        'border-width': 4,
        opacity: 1,
        'overlay-color': inkColor,
        'overlay-opacity': theme === 'dark' ? 0.32 : 0.16,
        'overlay-padding': 6,
      },
    },
    { selector: 'edge.focus-edge', style: { 'text-opacity': 1, width: 2.2, opacity: 1 } },
    {
      selector: 'node.path-visited',
      style: { 'border-width': 3, 'border-style': 'dashed', 'border-color': pathColor, opacity: 1 },
    },
    { selector: 'edge.path-edge', style: { 'line-color': pathColor, 'target-arrow-color': pathColor, width: 2, opacity: 1 } },
    { selector: '.context-dimmed.path-visited', style: { opacity: 0.9 } },
    { selector: '.context-dimmed.path-edge', style: { opacity: 0.6 } },
  ]
}

function pairKey(a: string, b: string): string {
  return a < b ? `${a}|${b}` : `${b}|${a}`
}

interface GraphViewProps {
  entities: Entity[]
  relationships: Relationship[]
  searchQuery: string
  activeCategories: Set<string>
  activeGroups: Set<RelationshipGroup>
  selectedEntityId: string | null
  path: string[]
  onNodeClick: (id: string) => void
  theme: ThemeMode
}

export function GraphView({
  entities,
  relationships,
  searchQuery,
  activeCategories,
  activeGroups,
  selectedEntityId,
  path,
  onNodeClick,
  theme,
}: GraphViewProps) {
  const elements = useMemo(() => buildGraphElements(entities, relationships), [entities, relationships])
  const stylesheet = useMemo(() => buildStylesheet(theme), [theme])
  const edgeLookup = useMemo(() => {
    const map = new Map<string, string>()
    relationships.forEach((rel, index) => {
      map.set(pairKey(rel.source, rel.target), `edge-${index}-${rel.source}-${rel.target}`)
    })
    return map
  }, [relationships])
  const [cy, setCy] = useState<Core | null>(null)
  const [edgeTooltip, setEdgeTooltip] = useState<{ label: string; x: number; y: number } | null>(null)
  const layoutRanRef = useRef(false)
  const onNodeClickRef = useRef(onNodeClick)
  onNodeClickRef.current = onNodeClick

  useEffect(() => {
    if (!cy || layoutRanRef.current) return
    layoutRanRef.current = true
    cy.layout({ name: 'fcose', animate: false, randomize: true, nodeRepulsion: 9000, idealEdgeLength: 90 } as never).run()
    cy.fit(undefined, 40)

    cy.on('tap', 'node', (evt) => onNodeClickRef.current(evt.target.id()))
    cy.on('tap', (evt) => {
      if (evt.target === cy) onNodeClickRef.current('')
    })

    // Edge labels on canvas are truncated to stay legible; reveal the full
    // sentence on hover as ordinary DOM text instead of rotated canvas text.
    cy.on('mouseover', 'edge', (evt) => {
      const edge = evt.target
      if (!edge.hasClass('focus-edge')) return
      const fullLabel = edge.data('fullLabel') as string
      if (fullLabel === (edge.data('label') as string)) return
      const mid = edge.renderedMidpoint()
      setEdgeTooltip({ label: fullLabel, x: mid.x, y: mid.y })
    })
    cy.on('mouseout', 'edge', () => setEdgeTooltip(null))
    cy.on('pan zoom', () => setEdgeTooltip(null))
  }, [cy])

  // Keep Cytoscape's canvas-rendered styles in sync with the current theme.
  useEffect(() => {
    if (!cy) return
    cy.style(stylesheet).update()
  }, [cy, stylesheet])

  // Category + relationship-group filtering: class toggles only, no layout recompute.
  useEffect(() => {
    if (!cy) return
    const hiddenNodeIds = new Set(
      cy.nodes().filter((n) => !activeCategories.has(n.data('category'))).map((n) => n.id()),
    )
    cy.nodes().forEach((n) => {
      n.toggleClass('category-hidden', hiddenNodeIds.has(n.id()))
    })
    cy.edges().forEach((e) => {
      const groupHidden = !activeGroups.has(e.data('group'))
      const endpointHidden = hiddenNodeIds.has(e.data('source')) || hiddenNodeIds.has(e.data('target'))
      e.toggleClass('group-hidden', groupHidden)
      e.toggleClass('category-hidden', endpointHidden)
    })
  }, [cy, activeCategories, activeGroups])

  // Search: highlight matches, dim the rest.
  useEffect(() => {
    if (!cy) return
    const query = searchQuery.trim().toLowerCase()
    if (!query) {
      cy.elements().removeClass('search-dimmed').removeClass('search-match')
      return
    }
    const matches = cy.nodes().filter((n) => (n.data('name') as string).toLowerCase().includes(query))
    const matchIds = new Set(matches.map((n) => n.id()))
    cy.nodes().forEach((n) => {
      n.toggleClass('search-match', matchIds.has(n.id()))
      n.toggleClass('search-dimmed', !matchIds.has(n.id()))
    })
    cy.edges().forEach((e) => {
      e.toggleClass('search-dimmed', !matchIds.has(e.data('source')) && !matchIds.has(e.data('target')))
    })
  }, [cy, searchQuery])

  // Focus + context: dim everything outside the selected node's neighborhood, and
  // arrange that neighborhood in a clean ring around it so edges fan out from the
  // node instead of crossing through whatever the force layout happened to produce.
  useEffect(() => {
    if (!cy) return
    setEdgeTooltip(null)
    cy.elements().removeClass('context-dimmed focus-highlight focus-edge path-visited path-edge')

    path.forEach((id) => cy.getElementById(id).addClass('path-visited'))
    for (let i = 0; i < path.length - 1; i++) {
      const edgeId = edgeLookup.get(pairKey(path[i], path[i + 1]))
      if (edgeId) cy.getElementById(edgeId).addClass('path-edge')
    }

    if (!selectedEntityId) return
    const node = cy.getElementById(selectedEntityId)
    if (node.empty()) return

    const neighborhood = node.closedNeighborhood()
    cy.elements().difference(neighborhood).addClass('context-dimmed')
    node.addClass('focus-highlight')
    neighborhood.edges().addClass('focus-edge')

    const center = node.position()

    // Cytoscape's concentric layout sizes the ring purely from node count and
    // spacing, with no floor — a node with few neighbors (e.g. Persephone, 6)
    // gets a tiny radius that can't fit an edge label, while a node with
    // many (e.g. Zeus, 21) gets an oversized one. Position the ring ourselves
    // instead, so short edges still get enough room for their labels.
    const ringNodes = neighborhood.nodes().filter((n) => n.id() !== selectedEntityId)
    const count = ringNodes.length
    const radius = Math.min(300, Math.max(130, 90 + count * 9))
    const startAngle = -Math.PI / 2

    ringNodes.forEach((n, i) => {
      const theta = startAngle + (count > 0 ? (2 * Math.PI * i) / count : 0)
      n.animate(
        { position: { x: center.x + radius * Math.cos(theta), y: center.y + radius * Math.sin(theta) } },
        { duration: 350, easing: 'ease-out' },
      )
    })

    // The focal node lands back at the center of that bounding box, so we can pan
    // to it immediately rather than waiting on the layout to finish.
    const container = cy.container()
    const width = container?.clientWidth ?? 0
    const height = container?.clientHeight ?? 0
    const isMobile = width < 640
    const reservedRight = isMobile ? 0 : Math.min(420, width * 0.45)
    const reservedBottom = isMobile ? Math.min(height * 0.6, 420) : 0
    const targetX = (width - reservedRight) / 2
    const targetY = (height - reservedBottom) / 2

    const zoom = Math.max(cy.zoom(), 1.6)
    const pan = { x: targetX - center.x * zoom, y: targetY - center.y * zoom }

    cy.animate({ zoom, pan }, { duration: 400, easing: 'ease-out' })
  }, [cy, selectedEntityId, path, edgeLookup])

  return (
    <div className="graph-canvas absolute inset-0">
      <CytoscapeComponent
        elements={elements}
        stylesheet={stylesheet}
        layout={{ name: 'preset' }}
        style={{ width: '100%', height: '100%' }}
        cy={setCy}
      />
      {edgeTooltip && (
        <div
          className="pointer-events-none absolute z-10 max-w-[240px] -translate-x-1/2 -translate-y-[calc(100%+10px)] rounded-xl border border-hairline bg-panel/95 px-3 py-2 font-sans text-xs leading-snug text-ink shadow-lg backdrop-blur-md"
          style={{ left: edgeTooltip.x, top: edgeTooltip.y }}
        >
          {edgeTooltip.label}
        </div>
      )}
    </div>
  )
}
