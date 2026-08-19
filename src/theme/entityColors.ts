import type { EntityType, RelationshipGroup } from '../types/entity'

export type ThemeMode = 'light' | 'dark'

export type NodeShape = 'diamond' | 'hexagon' | 'ellipse' | 'triangle' | 'star' | 'round-rectangle'

interface TypeStyle {
  shape: NodeShape
  label: string
  /** node/badge fill */
  fill: string
  /** node border / dot / line color */
  line: string
  /** text color for use on top of `fill` */
  text: string
}

const TYPE_COLORS: Record<ThemeMode, Record<EntityType, TypeStyle>> = {
  dark: {
    primordial: { shape: 'diamond', label: 'Primordial', fill: '#3c3557', line: '#9089c2', text: '#c7c2e8' },
    titan: { shape: 'hexagon', label: 'Titan', fill: '#5c471f', line: '#d1a83a', text: '#e9c874' },
    god: { shape: 'ellipse', label: 'God', fill: '#6b5316', line: '#e6b84a', text: '#f4cf74' },
    hero: { shape: 'triangle', label: 'Hero', fill: '#253764', line: '#7c9cff', text: '#aec0ff' },
    creature: { shape: 'star', label: 'Creature', fill: '#5c2726', line: '#e2726f', text: '#f0a29f' },
    place: { shape: 'round-rectangle', label: 'Place', fill: '#1f4a37', line: '#6fcf9d', text: '#9fe3bf' },
  },
  light: {
    primordial: { shape: 'diamond', label: 'Primordial', fill: '#dcd6f0', line: '#57508c', text: '#38315e' },
    titan: { shape: 'hexagon', label: 'Titan', fill: '#e8cf8a', line: '#8a6412', text: '#5c470d' },
    god: { shape: 'ellipse', label: 'God', fill: '#f5cf4a', line: '#9c6a00', text: '#6b4700' },
    hero: { shape: 'triangle', label: 'Hero', fill: '#c9d6ff', line: '#3a56c4', text: '#1f2f70' },
    creature: { shape: 'star', label: 'Creature', fill: '#f3b3ae', line: '#a13530', text: '#7a211d' },
    place: { shape: 'round-rectangle', label: 'Place', fill: '#a8e6c2', line: '#157a45', text: '#0f5c34' },
  },
}

const GROUP_COLORS: Record<ThemeMode, Record<RelationshipGroup, string>> = {
  dark: { family: '#9089c2', conflict: '#e2726f', place: '#6fcf9d' },
  light: { family: '#6b62a3', conflict: '#b8403c', place: '#1f7a4f' },
}

export function getTypeStyle(theme: ThemeMode, type: EntityType): TypeStyle {
  return TYPE_COLORS[theme][type]
}

export function getTypeStyles(theme: ThemeMode): Record<EntityType, TypeStyle> {
  return TYPE_COLORS[theme]
}

export function getGroupColor(theme: ThemeMode, group: RelationshipGroup): string {
  return GROUP_COLORS[theme][group]
}

export function getGroupColors(theme: ThemeMode): Record<RelationshipGroup, string> {
  return GROUP_COLORS[theme]
}
