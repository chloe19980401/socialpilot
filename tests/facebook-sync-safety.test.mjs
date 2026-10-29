import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const syncSource = readFileSync(new URL('../supabase/functions/sync-facebook/index.ts', import.meta.url), 'utf8')
const contentSource = readFileSync(new URL('../src/pages/Content.jsx', import.meta.url), 'utf8')

test('Facebook link parser supports reels and query-string object ids', () => {
  assert.match(contentSource, /\['story_fbid', 'fbid', 'v'\]/)
  assert.match(contentSource, /posts\|videos\|photos\|reel\|watch/)
})

test('Facebook sync prefers the current URL over a stale external id', () => {
  assert.match(syncSource, /const urlIds = ids\(post\.url \|\| ''\)/)
  assert.match(syncSource, /\[\.\.\.urlIds, \.\.\.ids\(post\.external_id \|\| ''\)\]/)
})

test('Facebook sync never clears metrics on a transient lookup failure', () => {
  assert.doesNotMatch(syncSource, /update\(\{ views: null \}\)/)
  assert.match(syncSource, /if \(item\.views != null\) update\.views = Number\(item\.views\)/)
  assert.match(syncSource, /if \(item\.likes\?\.summary\?\.total_count != null\)/)
  assert.match(syncSource, /if \(item\.comments\?\.summary\?\.total_count != null\)/)
})
