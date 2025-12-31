export function resolveIssue(issueKey, context = {}) {
  if (!issueKey) return []
  return [{ key: issueKey, context }]
}
