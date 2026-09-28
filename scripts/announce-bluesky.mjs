// Posts to Bluesky for every entity or mythology added between two commits.
//
// Usage: node scripts/announce-bluesky.mjs <before-sha> <after-sha>
// Env:   BLUESKY_HANDLE, BLUESKY_APP_PASSWORD (skips posting when unset)
//        DRY_RUN=1 prints the posts instead of sending them.

import { execFileSync } from 'node:child_process'
import { readdirSync, readFileSync } from 'node:fs'

const SITE_URL = 'https://mimir.yodamad.fr/'
const PDS_URL = 'https://bsky.social'
const MAX_ENTITY_POSTS = 5
const MAX_POST_GRAPHEMES = 300

const [before, after] = process.argv.slice(2)
const dryRun = process.env.DRY_RUN === '1'

function gitShow(sha, path) {
  try {
    return execFileSync('git', ['show', `${sha}:${path}`], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] })
  } catch {
    return null
  }
}

function mythologyNames(sha) {
  const source = gitShow(sha, 'src/data/mythologies.ts') ?? ''
  const block = source.match(/MYTHOLOGY_NAMES[^{]*\{([\s\S]*?)\}/)?.[1] ?? ''
  return Object.fromEntries([...block.matchAll(/(\w+)\s*:\s*'([^']*)'/g)].map(([, id, name]) => [id, name]))
}

function findAdditions() {
  const names = mythologyNames(after)
  const newMythologies = []
  const newEntities = []

  for (const id of readdirSync('src/data', { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name)) {
    const path = `src/data/${id}/entities.json`
    const current = gitShow(after, path)
    if (!current) continue
    const entities = JSON.parse(current)
    const mythology = { id, name: names[id] ?? id }
    const previous = gitShow(before, path)

    if (!previous) {
      newMythologies.push({ ...mythology, count: entities.length })
      continue
    }
    const previousIds = new Set(JSON.parse(previous).map((e) => e.id))
    for (const entity of entities) {
      if (!previousIds.has(entity.id)) newEntities.push({ entity, mythology })
    }
  }
  return { newMythologies, newEntities }
}

function truncate(text, max) {
  const graphemes = [...new Intl.Segmenter().segment(text)].map((s) => s.segment)
  return graphemes.length <= max ? text : graphemes.slice(0, max - 1).join('').trimEnd() + '…'
}

function graphemeLength(text) {
  return [...new Intl.Segmenter().segment(text)].length
}

/** Builds post text ending with `url`, shortening `body` so the whole post fits Bluesky's limit. */
function buildPost(headline, body, url, card) {
  const fixed = `${headline}\n\n\n\n${url}`
  const text = `${headline}\n\n${truncate(body, MAX_POST_GRAPHEMES - graphemeLength(fixed))}\n\n${url}`
  return { text, url, card }
}

function mythologyPost({ id, name, count }) {
  const url = `${SITE_URL}?${id}`
  return buildPost(
    `🌳 New mythology on Mímir: ${name}`,
    `Explore ${count} entities and how they are connected.`,
    url,
    { title: `${name} — Mímir`, description: `Explore the ${name} family tree on Mímir.` },
  )
}

function entityPost({ entity, mythology }) {
  const url = `${SITE_URL}?${mythology.id}&entity=${encodeURIComponent(entity.id)}`
  const title = entity.title ? `${entity.name}, ${entity.title}` : entity.name
  return buildPost(`✨ New in ${mythology.name}: ${title}`, entity.description ?? '', url, {
    title: `${entity.name} — ${mythology.name} | Mímir`,
    description: entity.description ?? '',
  })
}

function summaryPost(newEntities) {
  const byMythology = new Map()
  for (const { entity, mythology } of newEntities) {
    byMythology.set(mythology.id, [...(byMythology.get(mythology.id) ?? []), entity.name])
  }
  const [firstId] = byMythology.keys()
  const lines = [...byMythology].map(([id, names]) => {
    const mythology = newEntities.find((e) => e.mythology.id === id).mythology
    return `${mythology.name}: ${names.join(', ')}`
  })
  const url = `${SITE_URL}?${firstId}`
  return buildPost(`✨ ${newEntities.length} new entities on Mímir`, lines.join('\n'), url, {
    title: 'Mímir',
    description: `${newEntities.length} new entities added.`,
  })
}

async function xrpc(method, body, accessJwt) {
  const response = await fetch(`${PDS_URL}/xrpc/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(accessJwt && { Authorization: `Bearer ${accessJwt}` }) },
    body: JSON.stringify(body),
  })
  if (!response.ok) throw new Error(`${method} failed: ${response.status} ${await response.text()}`)
  return response.json()
}

async function publish(session, { text, url, card }) {
  // Facet offsets are UTF-8 byte offsets, not string indices.
  const byteStart = Buffer.byteLength(text.slice(0, text.lastIndexOf(url)))
  await xrpc(
    'com.atproto.repo.createRecord',
    {
      repo: session.did,
      collection: 'app.bsky.feed.post',
      record: {
        $type: 'app.bsky.feed.post',
        text,
        createdAt: new Date().toISOString(),
        langs: ['en'],
        facets: [
          {
            index: { byteStart, byteEnd: byteStart + Buffer.byteLength(url) },
            features: [{ $type: 'app.bsky.richtext.facet#link', uri: url }],
          },
        ],
        embed: { $type: 'app.bsky.embed.external', external: { uri: url, ...card } },
      },
    },
    session.accessJwt,
  )
}

if (!before || !after || /^0+$/.test(before)) {
  console.log('No previous commit to compare against, nothing to announce.')
  process.exit(0)
}

const { newMythologies, newEntities } = findAdditions()
const posts = [
  ...newMythologies.map(mythologyPost),
  ...(newEntities.length > MAX_ENTITY_POSTS ? [summaryPost(newEntities)] : newEntities.map(entityPost)),
]

if (posts.length === 0) {
  console.log('No new entities or mythologies, nothing to announce.')
  process.exit(0)
}

if (dryRun || !process.env.BLUESKY_HANDLE || !process.env.BLUESKY_APP_PASSWORD) {
  if (!dryRun) console.log('BLUESKY_HANDLE / BLUESKY_APP_PASSWORD not set, printing posts instead.')
  for (const post of posts) console.log(`---\n${post.text}\n`)
  process.exit(0)
}

const session = await xrpc('com.atproto.server.createSession', {
  identifier: process.env.BLUESKY_HANDLE,
  password: process.env.BLUESKY_APP_PASSWORD,
})
for (const post of posts) {
  await publish(session, post)
  console.log(`Posted: ${post.text.split('\n')[0]}`)
}
