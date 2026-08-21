const REPO_OWNER = 'yodamad'
const REPO_NAME = 'mimir'
const ISSUE_TEMPLATE = 'new-entity-request.yml'

// Sentinel option for "this mythology isn't listed yet". The label text must match,
// character for character, the last option in the "Mythology" dropdown in
// .github/ISSUE_TEMPLATE/new-entity-request.yml, since GitHub prefills a dropdown by
// matching this string against its option text.
export const OTHER_MYTHOLOGY_ID = '__other__'
export const OTHER_MYTHOLOGY_LABEL = 'Other (not listed — describe below)'

export function buildRequestEntityIssueUrl(
  entityName: string,
  mythologyName: string,
  newMythologyName?: string,
): string {
  const params = new URLSearchParams({
    template: ISSUE_TEMPLATE,
    title: `[New Entity] ${entityName}`,
    entity_name: entityName,
    mythology: mythologyName,
  })
  if (newMythologyName) params.set('new_mythology_name', newMythologyName)
  return `https://github.com/${REPO_OWNER}/${REPO_NAME}/issues/new?${params.toString()}`
}
