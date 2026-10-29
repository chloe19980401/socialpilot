import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const instagram = readFileSync(new URL('../supabase/functions/sync-instagram/index.ts', import.meta.url), 'utf8')
const facebook = readFileSync(new URL('../supabase/functions/sync-facebook/index.ts', import.meta.url), 'utf8')
const tiktok = readFileSync(new URL('../supabase/functions/sync-tiktok/index.ts', import.meta.url), 'utf8')

test('Instagram imports API media that is not already in the content center', () => {
  assert.match(instagram, /if \(!post\) \{/)
  assert.match(instagram, /platform: 'instagram'/)
  assert.match(instagram, /postsImported\+\+/)
  assert.match(instagram, /posts_imported=/)
})

test('Facebook imports latest Page posts before refreshing stored objects', () => {
  assert.match(facebook, /\/published_posts\?fields=/)
  assert.match(facebook, /platform: 'facebook'/)
  assert.match(facebook, /postsImported\+\+/)
  assert.match(facebook, /posts_imported=/)
})

test('new post imports retain account and brand ownership', () => {
  for (const source of [instagram, facebook]) {
    assert.match(source, /account_id: (?:row|account)\.id/)
    assert.match(source, /brand_id: (?:row|account)\.brand_id \|\| null/)
  }
})

test('TikTok post write failures are counted and exposed instead of silently ignored', () => {
  assert.match(tiktok, /postErrors\.push/)
  assert.match(tiktok, /failed\+\+/)
  assert.match(tiktok, /errors: postErrors\.slice/)
})
