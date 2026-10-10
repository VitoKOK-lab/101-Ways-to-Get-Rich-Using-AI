import { proposedCoursePrices, validCoursePrice, type CoursePrice } from '../src/course-pricing'

type Row = {
  slug: string; list_price: number; current_price: number; campaign_price: number | null
  campaign_starts_at: string | null; campaign_ends_at: string | null; status: 'planned' | 'live'; version: number
}
type Statement = { bind: (...values: unknown[]) => Statement; all: <T>() => Promise<{ results: T[] }>; first: <T>() => Promise<T | null>; run: () => Promise<unknown> }
type Database = { prepare: (sql: string) => Statement }
type Env = { PRICES_DB: Database; ACCESS_TEAM_DOMAIN: string; ACCESS_AUD: string; ADMIN_EMAILS: string }

function json(value: unknown, status = 200) {
  return new Response(JSON.stringify(value), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } })
}
function fromRow(row: Row): CoursePrice {
  return { listPrice: row.list_price, currentPrice: row.current_price, campaignPrice: row.campaign_price, campaignStartsAt: row.campaign_starts_at, campaignEndsAt: row.campaign_ends_at, status: row.status, version: row.version }
}
function bytes(value: string) {
  const binary = atob(value.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - value.length % 4) % 4))
  return Uint8Array.from(binary, (character) => character.charCodeAt(0))
}
function decodePart(value: string) { return JSON.parse(new TextDecoder().decode(bytes(value))) as Record<string, unknown> }

async function verifiedAdminEmail(request: Request, env: Env): Promise<string | null> {
  const token = request.headers.get('Cf-Access-Jwt-Assertion')
  if (!token || !env.ACCESS_TEAM_DOMAIN || !env.ACCESS_AUD || !env.ADMIN_EMAILS) return null
  const parts = token.split('.')
  if (parts.length !== 3) return null
  try {
    const header = decodePart(parts[0]); const claims = decodePart(parts[1])
    if (header.alg !== 'RS256' || typeof header.kid !== 'string') return null
    const domain = env.ACCESS_TEAM_DOMAIN.replace(/^https?:\/\//, '').replace(/\/$/, '')
    const issuer = `https://${domain}`
    if (claims.iss !== issuer || typeof claims.exp !== 'number' || claims.exp <= Date.now() / 1000 || (typeof claims.nbf === 'number' && claims.nbf > Date.now() / 1000)) return null
    if (claims.aud !== env.ACCESS_AUD && !(Array.isArray(claims.aud) && claims.aud.includes(env.ACCESS_AUD))) return null
    if (typeof claims.email !== 'string') return null
    const email = claims.email.toLowerCase()
    if (!env.ADMIN_EMAILS.split(',').map((item) => item.trim().toLowerCase()).includes(email)) return null
    const certs = await fetch(`${issuer}/cdn-cgi/access/certs`)
    if (!certs.ok) return null
    const { keys } = await certs.json() as { keys: JsonWebKey[] }
    const jwk = keys.find((key) => (key as JsonWebKey & { kid?: string }).kid === header.kid && key.kty === 'RSA')
    if (!jwk) return null
    const key = await crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify'])
    const signature = bytes(parts[2])
    const data = new TextEncoder().encode(`${parts[0]}.${parts[1]}`)
    return await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, signature, data) ? email : null
  } catch { return null }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    if (request.method === 'GET' && url.pathname === '/api/prices') {
      const rows = (await env.PRICES_DB.prepare('SELECT * FROM course_prices').all<Row>()).results
      return json(Object.fromEntries(rows.map((row) => [row.slug, fromRow(row)])))
    }
    const match = url.pathname.match(/^\/api\/admin\/prices\/([a-z0-9-]+)$/)
    if (request.method !== 'PUT' || !match || !proposedCoursePrices[match[1]]) return json({ error: 'Not found' }, 404)
    if (request.headers.get('Origin') !== url.origin || !request.headers.get('Content-Type')?.startsWith('application/json')) return json({ error: 'Invalid origin or content type' }, 403)
    const email = await verifiedAdminEmail(request, env)
    if (!email) return json({ error: 'Admin authorization required' }, 403)
    let incoming: CoursePrice
    try { incoming = await request.json() as CoursePrice } catch { return json({ error: 'Invalid JSON' }, 400) }
    if (!validCoursePrice(incoming)) return json({ error: 'Invalid price or campaign range' }, 400)
    const slug = match[1]
    const previous = await env.PRICES_DB.prepare('SELECT * FROM course_prices WHERE slug = ?').bind(slug).first<Row>()
    if (!previous) return json({ error: 'Price not seeded' }, 404)
    if (incoming.version !== previous.version) return json({ error: 'Price changed; reload before saving' }, 409)
    const updated = await env.PRICES_DB.prepare('UPDATE course_prices SET list_price = ?, current_price = ?, campaign_price = ?, campaign_starts_at = ?, campaign_ends_at = ?, status = ?, version = version + 1, updated_at = CURRENT_TIMESTAMP WHERE slug = ? AND version = ? RETURNING *')
      .bind(incoming.listPrice, incoming.currentPrice, incoming.campaignPrice, incoming.campaignStartsAt, incoming.campaignEndsAt, incoming.status, slug, previous.version).first<Row>()
    if (!updated) return json({ error: 'Price changed; reload before saving' }, 409)
    await env.PRICES_DB.prepare('INSERT INTO price_audit (slug, admin_email, before_json, after_json) VALUES (?, ?, ?, ?)').bind(slug, email, JSON.stringify(fromRow(previous)), JSON.stringify(fromRow(updated))).run()
    return json(fromRow(updated))
  },
}
