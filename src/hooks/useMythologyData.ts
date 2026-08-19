import { useMemo } from 'react'
import { getMythologyData } from '../data/mythologies'
import type { Entity, Relationship } from '../types/entity'

export function useMythologyData(mythologyId: string) {
  return useMemo(() => {
    const { entities, relationships } = getMythologyData(mythologyId) as {
      entities: Entity[]
      relationships: Relationship[]
    }
    const entityById = new Map(entities.map((e) => [e.id, e]))
    return { entities, relationships, entityById }
  }, [mythologyId])
}
