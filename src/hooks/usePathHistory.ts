import { useCallback, useState } from 'react'

export interface UsePathHistoryResult {
  selectedEntityId: string | null
  path: string[]
  select: (id: string) => void
  reset: () => void
}

export function usePathHistory(initialEntityId: string | null = null): UsePathHistoryResult {
  const [path, setPath] = useState<string[]>(initialEntityId ? [initialEntityId] : [])
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(initialEntityId)

  const select = useCallback((id: string) => {
    if (!id) {
      setSelectedEntityId(null)
      return
    }
    setSelectedEntityId(id)
    setPath((prev) => {
      const existingIndex = prev.indexOf(id)
      if (existingIndex !== -1) return prev.slice(0, existingIndex + 1)
      return [...prev, id]
    })
  }, [])

  const reset = useCallback(() => {
    setPath([])
    setSelectedEntityId(null)
  }, [])

  return { selectedEntityId, path, select, reset }
}
