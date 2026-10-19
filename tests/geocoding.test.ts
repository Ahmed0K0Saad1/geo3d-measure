import { beforeEach, describe, expect, it } from 'vitest'
import {
  GeocodingError,
  buildSearchUrl,
  clearGeocodingCache,
  searchGeocoding,
  type GeocodingErrorCode,
} from '../src/services/geocoding.ts'

const riyadhPayload = [
  {
    place_id: 123,
    lat: '24.7136',
    lon: '46.6753',
    display_name: 'Riyadh, Saudi Arabia',
  },
  {
    place_id: 456,
    lat: '-33.8688',
    lon: '151.2093',
    display_name: 'Sydney, Australia',
  },
]

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function stubFetch(
  response: Response | (() => Promise<Response>),
): typeof fetch {
  return async () => (typeof response === 'function' ? response() : response)
}

async function expectGeocodingError(
  run: () => Promise<unknown>,
  code: GeocodingErrorCode,
): Promise<void> {
  try {
    await run()
  } catch (error) {
    expect(error).toBeInstanceOf(GeocodingError)
    expect((error as GeocodingError).code).toBe(code)
    return
  }
  throw new Error(`توقعنا خطأ بالكود ${code} لكن الدالة نجحت`)
}

describe('خدمة البحث الجغرافي (T2.6)', () => {
  beforeEach(() => {
    clearGeocodingCache()
  })

  it('تبني عنوان Nominatim مع ترميز الاستعلام والحدود', () => {
    const url = buildSearchUrl('برج المملكة, الرياض')
    const params = new URL(url).searchParams
    expect(url.startsWith('https://nominatim.openstreetmap.org/search?')).toBe(
      true,
    )
    expect(params.get('q')).toBe('برج المملكة, الرياض')
    expect(params.get('format')).toBe('jsonv2')
    expect(params.get('limit')).toBe('5')
    expect(params.get('addressdetails')).toBe('1')
  })

  it('تحوّل استجابة Nominatim إلى نتائج موحّدة', async () => {
    const results = await searchGeocoding('Riyadh', {
      fetchImpl: stubFetch(jsonResponse(riyadhPayload)),
    })
    expect(results).toHaveLength(2)
    expect(results[0]).toEqual({
      id: '123',
      label: 'Riyadh, Saudi Arabia',
      lat: 24.7136,
      lon: 46.6753,
    })
  })

  it('تستخدم الكاش ولا تعيد الطلب لنفس الاستعلام', async () => {
    let calls = 0
    const fetchImpl: typeof fetch = async () => {
      calls += 1
      return jsonResponse(riyadhPayload)
    }

    await searchGeocoding('Riyadh', { fetchImpl })
    await searchGeocoding('  riyadh  ', { fetchImpl })
    expect(calls).toBe(1)
  })

  it('تعيد [] للاستعلام الفارغ دون شبكة', async () => {
    let calls = 0
    const fetchImpl: typeof fetch = async () => {
      calls += 1
      return jsonResponse([])
    }
    const results = await searchGeocoding('   ', { fetchImpl })
    expect(results).toEqual([])
    expect(calls).toBe(0)
  })

  it('تعالج 429 برمز مترجم', async () => {
    await expectGeocodingError(
      () =>
        searchGeocoding('Riyadh', {
          fetchImpl: stubFetch(jsonResponse({ error: 'rate limited' }, 429)),
        }),
      'rate-limited',
    )
  })

  it('ترفض أخطاء الخادم والشبكة', async () => {
    await expectGeocodingError(
      () =>
        searchGeocoding('Riyadh', {
          fetchImpl: stubFetch(jsonResponse({}, 500)),
        }),
      'network',
    )
    await expectGeocodingError(
      () =>
        searchGeocoding('Riyadh', {
          fetchImpl: stubFetch(() => Promise.reject(new Error('offline'))),
        }),
      'network',
    )
  })

  it('ترفض الاستجابات غير الصالحة وتتجاهل الإحداثيات الشاذة', async () => {
    await expectGeocodingError(
      () =>
        searchGeocoding('Riyadh', {
          fetchImpl: stubFetch(jsonResponse({ not: 'an array' })),
        }),
      'invalid-response',
    )

    const results = await searchGeocoding('Riyadh', {
      fetchImpl: stubFetch(
        jsonResponse([
          ...riyadhPayload,
          {
            place_id: 789,
            lat: '91',
            lon: '46',
            display_name: 'Invalid latitude',
          },
        ]),
      ),
    })
    expect(results).toHaveLength(2)
  })
})
