import { describe, expect, it } from 'vitest'
import type { GeoPoint } from '../src/core/geo/GeoPoint.ts'
import {
  escapeCsv,
  escapeXml,
  toCsv,
  toGeoJson,
  toKml,
  withUtf8Bom,
  type ExportData,
} from '../src/services/exportFormat.ts'
import { exportFileName } from '../src/services/exportService.ts'

const points: GeoPoint[] = [
  {
    id: 'p1',
    lat: 24.7136,
    lon: 46.6753,
    height: 612,
    label: 'Riyadh, "A"',
    source: 'manual',
    createdAt: new Date('2026-10-20T08:00:00.000Z'),
  },
  {
    id: 'p2',
    lat: 21.4858,
    lon: 39.1925,
    label: 'Jeddah <port>',
    source: 'geocoding',
    createdAt: new Date('2026-10-20T08:01:00.000Z'),
  },
]

const data: ExportData = {
  points,
  polygon: [
    { id: 'v1', lat: 24.6, lon: 46.6 },
    { id: 'v2', lat: 24.7, lon: 46.7 },
    { id: 'v3', lat: 24.8, lon: 46.8 },
  ],
}

describe('مُسلسلات التصدير', () => {
  it('ينتج GeoJSON صالحًا بترتيب lon,lat وإغلاق حلقة المضلع', () => {
    const parsed = JSON.parse(toGeoJson(data)) as {
      type: string
      features: Array<{
        geometry: {
          type: string
          coordinates: unknown
        }
        properties: Record<string, unknown>
      }>
    }

    expect(parsed.type).toBe('FeatureCollection')
    expect(parsed.features).toHaveLength(3)
    expect(parsed.features[0].geometry).toEqual({
      type: 'Point',
      coordinates: [46.6753, 24.7136, 612],
    })
    expect(parsed.features[2].geometry.type).toBe('Polygon')
    const ring = parsed.features[2].geometry.coordinates as number[][][]
    expect(ring[0]).toHaveLength(4)
    expect(ring[0][0]).toEqual(ring[0][3])
  })

  it('ينتج KML مع تهريب XML وإغلاق المضلع', () => {
    const kml = toKml(data)

    expect(kml).toContain('<kml xmlns="http://www.opengis.net/kml/2.2">')
    expect(kml).toContain('Jeddah &lt;port&gt;')
    expect(kml).toContain('Riyadh, &quot;A&quot;')
    expect(kml).not.toContain('Jeddah <port>')
    expect(kml).toContain('<altitudeMode>clampToGround</altitudeMode>')
    expect(kml).toContain('<altitudeMode>absolute</altitudeMode>')
    expect(kml.match(/46.6,24.6/g)?.length).toBe(2)
  })

  it('ينتج CSV وفق RFC 4180 مع CRLF واقتباس صحيح', () => {
    const csv = toCsv(data)
    const lines = csv.split('\r\n')

    expect(lines[0]).toBe(
      'kind,index,label,latitude,longitude,height,source,created_at',
    )
    expect(lines[1]).toContain('"Riyadh, ""A"""')
    expect(lines[1]).toContain('612')
    expect(lines[3]).toContain('polygon,1,,24.6,46.6')
    expect(csv.endsWith('\r\n')).toBe(true)
  })

  it('يهرب الحقول ويضيف BOM', () => {
    expect(escapeXml(`<&>"'`)).toBe('&lt;&amp;&gt;&quot;&apos;')
    expect(escapeCsv('a,b')).toBe('"a,b"')
    expect(escapeCsv('a"b')).toBe('"a""b"')
    expect(escapeCsv('plain')).toBe('plain')
    expect(withUtf8Bom('x')).toBe('\uFEFFx')
  })

  it('يبني اسم ملف آمنًا', () => {
    expect(exportFileName('Riyadh / route', 'geojson')).toBe(
      'Riyadh---route.geojson',
    )
    expect(exportFileName('   ', 'kml')).toBe('geo3d-measure.kml')
    expect(exportFileName('a:b*c?', 'csv')).toBe('a-b-c.csv')
  })
})
