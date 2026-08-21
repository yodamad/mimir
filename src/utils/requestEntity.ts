const REPO_OWNER = 'yodamad'
const REPO_NAME = 'mimir'
const ENTITY_ISSUE_TEMPLATE = 'new-entity-request.yml'
const MYTHOLOGY_ISSUE_TEMPLATE = 'new-mythology-request.yml'

export function buildRequestEntityIssueUrl(entityName: string, mythologyName: string): string {
  const params = new URLSearchParams({
    template: ENTITY_ISSUE_TEMPLATE,
    title: `[New Entity] ${entityName}`,
    entity_name: entityName,
    mythology: mythologyName,
  })
  return `https://github.com/${REPO_OWNER}/${REPO_NAME}/issues/new?${params.toString()}`
}

export function buildRequestMythologyIssueUrl(mythologyName: string, notes?: string): string {
  const params = new URLSearchParams({
    template: MYTHOLOGY_ISSUE_TEMPLATE,
    title: `[New Mythology] ${mythologyName}`,
    mythology_name: mythologyName,
  })
  if (notes) params.set('notes', notes)
  return `https://github.com/${REPO_OWNER}/${REPO_NAME}/issues/new?${params.toString()}`
}
