import { useEffect, useMemo, useRef, useState } from 'react'
import cytoscape from 'cytoscape'
import fcose from 'cytoscape-fcose'
import CytoscapeComponent from 'react-cytoscapejs'
import type { Core, StylesheetJsonBlock } from 'cytoscape'
import { buildGraphElements } from '../utils/graphElements'
import { RELATIONSHIP_TYPES } from '../types/relationshipMeta'
import type { Entity, Relationship, RelationshipGroup } from '../types/entity'

cytoscape.use(fcose)

const GROUP_COLORS: Record<RelationshipGroup, string> = {
  family: '#9089b3',
  conflict: '#c15b57',
  place: '#5fae82',
}

const stylesheet: StylesheetJsonBlock[] = [
  {
    selector: 'node',
    style: {
      width: (ele: cytoscape.NodeSingular) => 22 + Math.min(ele.degree(false), 16) * 3,
      height: (ele: cytoscape.NodeSingular) => 22 + Math.min(ele.degree(false), 16) * 3,
      label: 'data(name)',
      color: '#f0ecff',
      'font-size': 9,
      'font-family': '"Cormorant Garamond", serif',
      'text-valign': 'bottom',
      'text-margin-y': 5,
      'text-outline-width': 2,
      'text-outline-color': '#0f0c1d',
      'border-width': 2,
      'transition-property': 'opacity, border-width, border-color',
      'transition-duration': 150,
    },
  },
  { selector: 'node[type = "primordial"]', style: { shape: 'diamond', 'background-color': '#4a4363', 'border-color': '#8079a3' } },
  { selector: 'node[type = "titan"]', style: { shape: 'hexagon', 'background-color': '#8a6d3b', 'border-color': '#c9a227' } },
  { selector: 'node[type = "god"]', style: { shape: 'ellipse', 'background-color': '#e3b341', 'border-color': '#fff2c2' } },
  { selector: 'node[category = "Minor God"]', style: { 'background-color': '#a6873f' } },
  { selector: 'node[type = "hero"]', style: { shape: 'triangle', 'background-color': '#7c9cff', 'border-color': '#c2d1ff' } },
  { selector: 'node[type = "creature"]', style: { shape: 'star', 'background-color': '#b3423f', 'border-color': '#e2726f' } },
  { selector: 'node[type = "place"]', style: { shape: 'round-rectangle', 'background-color': '#4a9d6f', 'border-color': '#8fd6ab' } },
  {
    selector: 'edge',
    style: {
      width: 1.4,
      'curve-style': 'bezier',
      opacity: 0.55,
      label: 'data(label)',
      'font-size': 9,
      'font-family': '"Cormorant Garamond", serif',
      'text-opacity': 0,
      color: '#e5e1f5',
      'text-background-color': '#0f0c1d',
      'text-background-opacity': 0.85,
      'text-background-padding': '2px',
      'line-color': (ele: cytoscape.EdgeSingular) => GROUP_COLORS[ele.data('group') as RelationshipGroup],
      'target-arrow-color': (ele: cytoscape.EdgeSingular) => GROUP_COLORS[ele.data('group') as RelationshipGroup],
      'target-arrow-shape': (ele: cytoscape.EdgeSingular) =>
        RELATIONSHIP_TYPES[ele.data('relType') as keyof typeof RELATIONSHIP_TYPES].bidirectional ? 'none' : 'triangle',
      'arrow-scale': 0.8,
    },
  },
  { selector: '.category-hidden, .group-hidden', style: { display: 'none' } },
  { selector: '.context-dimmed, .search-dimmed', style: { opacity: 0.08, 'text-opacity': 0 } },
  { selector: 'node.focus-highlight', style: { 'border-width': 4, 'border-color': '#e3b341', opacity: 1 } },
  { selector: 'node.search-match', style: { 'border-width': 4, 'border-color': '#e3b341', opacity: 1 } },
  { selector: 'edge.focus-edge', style: { 'text-opacity': 1, width: 2.2, opacity: 1 } },
]

interface GraphViewProps {
  entities: Entity[]
  relationships: Relationship[]
  searchQuery: string
  activeCategories: Set<string>
  activeGroups: Set<RelationshipGroup>
  selectedEntityId: string | null
  onNodeClick: (id: string) => void
}

export function GraphView({
  entities,
  relationships,
  searchQuery,
  activeCategories,
  activeGroups,
  selectedEntityId,
  onNodeClick,
}: GraphViewProps) {
  const elements = useMemo(() => buildGraphElements(entities, relationships), [entities, relationships])
  const [cy, setCy] = useState<Core | null>(null)
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
  }, [cy])

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

  // Focus + context: dim everything outside the selected node's neighborhood.
  useEffect(() => {
    if (!cy) return
    cy.elements().removeClass('context-dimmed').removeClass('focus-highlight').removeClass('focus-edge')
    if (!selectedEntityId) return
    const node = cy.getElementById(selectedEntityId)
    if (node.empty()) return

    const neighborhood = node.closedNeighborhood()
    cy.elements().difference(neighborhood).addClass('context-dimmed')
    node.addClass('focus-highlight')
    neighborhood.edges().addClass('focus-edge')

    node.animate({ position: node.position() }, { duration: 0 })
    cy.animate({ center: { eles: node }, zoom: Math.max(cy.zoom(), 1) }, { duration: 400 })
  }, [cy, selectedEntityId])

  return (
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#1b1530_0%,_#0f0c1d_70%)]">
      <CytoscapeComponent
        elements={elements}
        stylesheet={stylesheet}
        layout={{ name: 'preset' }}
        style={{ width: '100%', height: '100%' }}
        cy={setCy}
      />
    </div>
  )
}
