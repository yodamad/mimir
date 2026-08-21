export interface MythologyMeta {
  id: string
  name: string
  entitiesPath: string
  relationshipsPath: string
}

const entityModules = import.meta.glob('./*/entities.json', { eager: true }) as Record<
  string,
  { default: unknown }
>
const relationshipModules = import.meta.glob('./*/relationships.json', { eager: true }) as Record<
  string,
  { default: unknown }
>

const MYTHOLOGY_NAMES: Record<string, string> = {
  greek: 'Greek',
  lotr: 'Lord of the Rings',
}

export const MYTHOLOGIES: MythologyMeta[] = Object.keys(entityModules)
  .map((path) => {
    const id = path.split('/')[1]
    return {
      id,
      name: MYTHOLOGY_NAMES[id] ?? id,
      entitiesPath: path,
      relationshipsPath: path.replace('entities.json', 'relationships.json'),
    }
  })
  .filter((meta) => relationshipModules[meta.relationshipsPath] !== undefined)

export function getMythologyData(mythologyId: string) {
  const meta = MYTHOLOGIES.find((m) => m.id === mythologyId)
  if (!meta) throw new Error(`Unknown mythology: ${mythologyId}`)
  return {
    entities: entityModules[meta.entitiesPath].default,
    relationships: relationshipModules[meta.relationshipsPath].default,
  }
}

/**
 * Reads a mythology id from a bare query flag, e.g. `?greek` rather than
 * `?mythology=greek`, so links like `mimir.app/?lotr` pick that mythology.
 */
export function getMythologyIdFromSearch(search: string): string | null {
  const params = new URLSearchParams(search)
  return MYTHOLOGIES.find((m) => params.has(m.id))?.id ?? null
}
