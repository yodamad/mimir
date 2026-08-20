const REPO_OWNER = 'yodamad'
const REPO_NAME = 'mimir'
const ISSUE_TEMPLATE = 'new-entity-request.yml'

export function buildRequestEntityIssueUrl(entityName: string, mythologyName: string): string {
  const params = new URLSearchParams({
    template: ISSUE_TEMPLATE,
    title: `[New Entity] ${entityName}`,
    entity_name: entityName,
    mythology: mythologyName,
  })
  return `https://github.com/${REPO_OWNER}/${REPO_NAME}/issues/new?${params.toString()}`
}
