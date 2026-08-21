import { useEffect, useState } from 'react'
import { ExternalLink, X } from 'lucide-react'
import type { MythologyMeta } from '../data/mythologies'
import { buildRequestEntityIssueUrl, OTHER_MYTHOLOGY_ID, OTHER_MYTHOLOGY_LABEL } from '../utils/requestEntity'

interface RequestEntityModalProps {
  open: boolean
  mythologies: MythologyMeta[]
  activeMythologyId: string
  onClose: () => void
}

export function RequestEntityModal({ open, mythologies, activeMythologyId, onClose }: RequestEntityModalProps) {
  const [entityName, setEntityName] = useState('')
  const [mythologyId, setMythologyId] = useState(activeMythologyId)
  const [newMythologyName, setNewMythologyName] = useState('')

  useEffect(() => {
    if (open) {
      setEntityName('')
      setMythologyId(activeMythologyId)
      setNewMythologyName('')
    }
  }, [open, activeMythologyId])

  useEffect(() => {
    if (!open) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  if (!open) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedName = entityName.trim()
    if (!trimmedName) return

    if (mythologyId === OTHER_MYTHOLOGY_ID) {
      const trimmedMythology = newMythologyName.trim()
      if (!trimmedMythology) return
      const url = buildRequestEntityIssueUrl(trimmedName, OTHER_MYTHOLOGY_LABEL, trimmedMythology)
      window.open(url, '_blank', 'noopener,noreferrer')
      onClose()
      return
    }

    const mythology = mythologies.find((m) => m.id === mythologyId)
    if (!mythology) return
    const url = buildRequestEntityIssueUrl(trimmedName, mythology.name)
    window.open(url, '_blank', 'noopener,noreferrer')
    onClose()
  }

  return (
    <div
      className="pointer-events-auto fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-hairline bg-panel/95 p-6 shadow-2xl backdrop-blur-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <h2 className="font-display text-xl font-semibold text-ink">Request a new entity</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-muted transition-colors hover:bg-panel-2 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="mt-1.5 font-sans text-sm text-muted">
          This opens a pre-filled GitHub issue. An agent researches the request and comments with its findings, then
          a maintainer decides whether to approve it — after which another agent opens a pull request for review.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="request-entity-name" className="font-sans text-xs font-medium text-muted">
              Entity name
            </label>
            <input
              id="request-entity-name"
              type="text"
              value={entityName}
              onChange={(e) => setEntityName(e.target.value)}
              placeholder="e.g. Hades"
              required
              autoFocus
              className="rounded-lg border border-hairline bg-panel py-2 px-3 font-sans text-sm text-ink placeholder:text-muted outline-none transition-colors focus:border-accent focus-visible:ring-2 focus-visible:ring-accent/40"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="request-entity-mythology" className="font-sans text-xs font-medium text-muted">
              Mythology
            </label>
            <select
              id="request-entity-mythology"
              value={mythologyId}
              onChange={(e) => setMythologyId(e.target.value)}
              className="rounded-lg border border-hairline bg-panel py-2 px-3 font-sans text-sm text-ink outline-none transition-colors focus:border-accent focus-visible:ring-2 focus-visible:ring-accent/40"
            >
              {mythologies.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
              <option value={OTHER_MYTHOLOGY_ID}>{OTHER_MYTHOLOGY_LABEL}</option>
            </select>
          </div>

          {mythologyId === OTHER_MYTHOLOGY_ID && (
            <div className="flex flex-col gap-1.5">
              <label htmlFor="request-entity-new-mythology" className="font-sans text-xs font-medium text-muted">
                New mythology name
              </label>
              <input
                id="request-entity-new-mythology"
                type="text"
                value={newMythologyName}
                onChange={(e) => setNewMythologyName(e.target.value)}
                placeholder="e.g. Norse"
                required
                className="rounded-lg border border-hairline bg-panel py-2 px-3 font-sans text-sm text-ink placeholder:text-muted outline-none transition-colors focus:border-accent focus-visible:ring-2 focus-visible:ring-accent/40"
              />
            </div>
          )}

          <button
            type="submit"
            className="mt-1 flex items-center justify-center gap-2 rounded-full border border-accent bg-accent-soft px-4 py-2 font-sans text-sm font-medium text-accent-ink transition-colors hover:bg-accent/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-panel"
          >
            Open request on GitHub
            <ExternalLink className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  )
}
