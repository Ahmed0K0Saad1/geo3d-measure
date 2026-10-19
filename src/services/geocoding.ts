/**
 * خدمة البحث الجغرافي (Nominatim) خلف واجهة قابلة للاستبدال — ADR-014.
 * منطق نقي بلا React؛ تُحقَّق استجابة الشبكة بـzod قبل عرضها.
 */

import { z } from 'zod'

const NOMINATIM_ENDPOINT = 'https://nominatim.openstreetmap.org/search'
const RESULT_LIMIT = 5
const CACHE_LIMIT = 50

/** نتيجة بحث موحّدة (مستقلة عن مزوّد الخدمة). */
export interface GeocodingResult {
  id: string
  label: string
  lat: number
  lon: number
}

/** واجهة المزوّد — تسمح باستبدال Nominatim دون تغيير الواجهة (ADR-014). */
export interface GeocodingProvider {
  search(
    query: string,
    options?: { signal?: AbortSignal },
  ): Promise<GeocodingResult[]>
}

/** أكواد أخطاء البحث — تترجمها الواجهة (ADR-004). */
export type GeocodingErrorCode = 'network' | 'rate-limited' | 'invalid-response'

export class GeocodingError extends Error {
  readonly code: GeocodingErrorCode

  constructor(code: GeocodingErrorCode) {
    super(`geocoding:${code}`)
    this.name = 'GeocodingError'
    this.code = code
  }
}

const nominatimItemSchema = z.object({
  place_id: z.union([z.string(), z.number()]),
  lat: z.string(),
  lon: z.string(),
  display_name: z.string(),
})

const nominatimResponseSchema = z.array(nominatimItemSchema)

const cache = new Map<string, GeocodingResult[]>()

/** يفرّغ كاش البحث (للاختبارات وإعادة التهيئة). */
export function clearGeocodingCache(): void {
  cache.clear()
}

/** يبني عنوان البحث مع ترميز الاستعلام — قابل للاختبار بلا شبكة. */
export function buildSearchUrl(query: string): string {
  const params = new URLSearchParams({
    q: query.trim(),
    format: 'jsonv2',
    limit: String(RESULT_LIMIT),
    addressdetails: '1',
  })
  return `${NOMINATIM_ENDPOINT}?${params.toString()}`
}

/** يحوّل عنصر Nominatim إلى نتيجة موحّدة، ويرفض الإحداثيات غير الصالحة. */
function toResult(
  item: z.infer<typeof nominatimItemSchema>,
): GeocodingResult | null {
  const lat = Number(item.lat)
  const lon = Number(item.lon)
  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lon) ||
    lat < -90 ||
    lat > 90 ||
    lon < -180 ||
    lon > 180
  ) {
    return null
  }
  return {
    id: String(item.place_id),
    label: item.display_name,
    lat,
    lon,
  }
}

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError'
}

function remember(key: string, results: GeocodingResult[]): void {
  if (!cache.has(key) && cache.size >= CACHE_LIMIT) {
    const oldestKey = cache.keys().next().value
    if (oldestKey !== undefined) {
      cache.delete(oldestKey)
    }
  }
  cache.set(key, results)
}

/**
 * يبحث في Nominatim ويعيد نتائج موحّدة.
 * - يمرّر `signal` لإلغاء الطلب عند تغيير الاستعلام أو إغلاق المكوّن.
 * - يعيد [] للاستعلام الفارغ دون شبكة.
 * - يعالج 429 ويرفض الاستجابات غير الصالحة.
 */
export async function searchGeocoding(
  query: string,
  options: { signal?: AbortSignal; fetchImpl?: typeof fetch } = {},
): Promise<GeocodingResult[]> {
  const normalized = query.trim()
  if (normalized === '') {
    return []
  }

  const cacheKey = normalized.toLocaleLowerCase()
  const cached = cache.get(cacheKey)
  if (cached) {
    return cached
  }

  const fetchImpl = options.fetchImpl ?? fetch
  let response: Response
  try {
    response = await fetchImpl(buildSearchUrl(normalized), {
      signal: options.signal,
      // لا نضع User-Agent: محظورة في المتصفح وتسبب CORS preflight
      headers: { Accept: 'application/json' },
    })
  } catch (error) {
    if (isAbortError(error)) {
      throw error
    }
    throw new GeocodingError('network')
  }

  if (response.status === 429) {
    throw new GeocodingError('rate-limited')
  }
  if (!response.ok) {
    throw new GeocodingError('network')
  }

  let payload: unknown
  try {
    payload = await response.json()
  } catch (error) {
    if (isAbortError(error)) {
      throw error
    }
    throw new GeocodingError('invalid-response')
  }

  const parsed = nominatimResponseSchema.safeParse(payload)
  if (!parsed.success) {
    throw new GeocodingError('invalid-response')
  }

  const results = parsed.data
    .map(toResult)
    .filter((result): result is GeocodingResult => result !== null)
  remember(cacheKey, results)
  return results
}

/** المزوّد الافتراضي: Nominatim (OSM) — قابل للاستبدال لاحقًا. */
export const nominatimGeocoder: GeocodingProvider = {
  search: (query, options) => searchGeocoding(query, options),
}
