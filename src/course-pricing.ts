export type CoursePrice = {
  listPrice: number
  currentPrice: number
  campaignPrice: number | null
  campaignStartsAt: string | null
  campaignEndsAt: string | null
  status: 'planned' | 'live'
  version?: number
}

// Proposed prices for completed courses. The current public prototype has no checkout.
export const proposedCoursePrices: Record<string, CoursePrice> = {
  'ziwei-foundations': { listPrice: 2680, currentPrice: 1880, campaignPrice: null, campaignStartsAt: null, campaignEndsAt: null, status: 'planned' },
  'tarot-practice': { listPrice: 1980, currentPrice: 1480, campaignPrice: null, campaignStartsAt: null, campaignEndsAt: null, status: 'planned' },
  'website-building': { listPrice: 2680, currentPrice: 1980, campaignPrice: null, campaignStartsAt: null, campaignEndsAt: null, status: 'planned' },
  'social-graphic-editor': { listPrice: 1980, currentPrice: 1480, campaignPrice: null, campaignStartsAt: null, campaignEndsAt: null, status: 'planned' },
  'facebook-ads': { listPrice: 2480, currentPrice: 1780, campaignPrice: null, campaignStartsAt: null, campaignEndsAt: null, status: 'planned' },
  'short-video-filming': { listPrice: 2480, currentPrice: 1780, campaignPrice: null, campaignStartsAt: null, campaignEndsAt: null, status: 'planned' },
  'ai-video-editing': { listPrice: 2980, currentPrice: 2180, campaignPrice: null, campaignStartsAt: null, campaignEndsAt: null, status: 'planned' },
  'ai-copy-design': { listPrice: 1980, currentPrice: 1480, campaignPrice: null, campaignStartsAt: null, campaignEndsAt: null, status: 'planned' },
  'ai-resume-service': { listPrice: 1680, currentPrice: 1180, campaignPrice: null, campaignStartsAt: null, campaignEndsAt: null, status: 'planned' },
  'online-course-building': { listPrice: 2980, currentPrice: 2180, campaignPrice: null, campaignStartsAt: null, campaignEndsAt: null, status: 'planned' },
  'ai-still-to-video': { listPrice: 2480, currentPrice: 1780, campaignPrice: null, campaignStartsAt: null, campaignEndsAt: null, status: 'planned' },
  'ai-digital-presenter': { listPrice: 2480, currentPrice: 1780, campaignPrice: null, campaignStartsAt: null, campaignEndsAt: null, status: 'planned' },
  'private-domain-operations': { listPrice: 2680, currentPrice: 1880, campaignPrice: null, campaignStartsAt: null, campaignEndsAt: null, status: 'planned' },
}

export function formatTwd(amount: number) {
  return `NT$${amount.toLocaleString('en-US')}`
}

export function activeCampaign(price: CoursePrice, now = new Date()) {
  if (price.status !== 'live' || price.campaignPrice === null || !price.campaignStartsAt || !price.campaignEndsAt) return false
  const start = Date.parse(price.campaignStartsAt)
  const end = Date.parse(price.campaignEndsAt)
  return Number.isFinite(start) && Number.isFinite(end) && start <= now.getTime() && now.getTime() < end
}

export function payablePrice(price: CoursePrice, now = new Date()) {
  return activeCampaign(price, now) ? price.campaignPrice! : price.currentPrice
}

export function validCoursePrice(value: unknown): value is CoursePrice {
  if (!value || typeof value !== 'object') return false
  const p = value as CoursePrice
  if (!Number.isSafeInteger(p.listPrice) || !Number.isSafeInteger(p.currentPrice) || p.listPrice <= 0 || p.currentPrice <= 0 || p.currentPrice >= p.listPrice) return false
  if (p.status !== 'planned' && p.status !== 'live') return false
  if (p.campaignPrice === null) return p.campaignStartsAt === null && p.campaignEndsAt === null
  if (!Number.isSafeInteger(p.campaignPrice) || p.campaignPrice <= 0 || p.campaignPrice >= p.currentPrice) return false
  if (!p.campaignStartsAt || !p.campaignEndsAt) return false
  const start = Date.parse(p.campaignStartsAt)
  const end = Date.parse(p.campaignEndsAt)
  return Number.isFinite(start) && Number.isFinite(end) && start < end
}
