/**
 * مُسلسلات التصدير النقية (T6.3 — ADR-035): GeoJSON / KML / CSV.
 * لا تلمس المتصفح ولا المتاجر؛ الاختبارات تستدعيها مباشرة.
 */

import type { GeoPoint } from '@/core/geo/GeoPoint.ts'
import type { PolygonVertex } from '@/store/usePolygonStore.ts'

export interface ExportData {
  points: readonly GeoPoint[]
  polygon: readonly PolygonVertex[]
}

type Position = [number, number] | [number, number, number]

function positionOf(point: Pick<GeoPoint, 'lon' | 'lat' | 'height'>): Position {
  return point.height === undefined
    ? [point.lon, point.lat]
    : [point.lon, point.lat, point.height]
}

function closedVertices(
  vertices: readonly PolygonVertex[],
): readonly PolygonVertex[] {
  if (vertices.length < 3) {
    return vertices
  }
  const first = vertices[0]
  const last = vertices[vertices.length - 1]
  if (first.lat === last.lat && first.lon === last.lon) {
    return vertices
  }
  return [...vertices, first]
}

/** GeoJSON RFC 7946 — WGS84 وترتيب [lon, lat]. */
export function toGeoJson(data: ExportData): string {
  const features: Array<Record<string, unknown>> = data.points.map(
    (point, index) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: positionOf(point),
      },
      properties: {
        kind: 'point',
        index: index + 1,
        label: point.label ?? null,
        source: point.source,
        accuracy: point.accuracy ?? null,
        createdAt: point.createdAt.toISOString(),
      },
    }),
  )

  if (data.polygon.length >= 3) {
    const ring = closedVertices(data.polygon).map((vertex) =>
      positionOf(vertex),
    )
    features.push({
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [ring],
      },
      properties: {
        kind: 'polygon',
        vertexCount: data.polygon.length,
      },
    })
  }

  return JSON.stringify(
    {
      type: 'FeatureCollection',
      features,
    },
    null,
    2,
  )
}

export function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

function kmlCoordinates(
  point: Pick<GeoPoint, 'lon' | 'lat' | 'height'>,
): string {
  return point.height === undefined
    ? `${point.lon},${point.lat}`
    : `${point.lon},${point.lat},${point.height}`
}

/** KML 2.2 — النقاط والمضلع مع تثبيت ما لا ارتفاع له على الأرض. */
export function toKml(data: ExportData): string {
  const placemarks: string[] = []

  data.points.forEach((point, index) => {
    const name = point.label?.trim() || `Point ${index + 1}`
    const altitudeMode =
      point.height === undefined ? 'clampToGround' : 'absolute'
    placemarks.push(
      [
        '    <Placemark>',
        `      <name>${escapeXml(name)}</name>`,
        '      <Point>',
        `        <altitudeMode>${altitudeMode}</altitudeMode>`,
        `        <coordinates>${kmlCoordinates(point)}</coordinates>`,
        '      </Point>',
        '    </Placemark>',
      ].join('\n'),
    )
  })

  if (data.polygon.length >= 3) {
    const ring = closedVertices(data.polygon)
      .map((vertex) => kmlCoordinates(vertex))
      .join(' ')
    placemarks.push(
      [
        '    <Placemark>',
        '      <name>Polygon</name>',
        '      <Polygon>',
        '        <altitudeMode>clampToGround</altitudeMode>',
        '        <outerBoundaryIs>',
        '          <LinearRing>',
        `            <coordinates>${ring}</coordinates>`,
        '          </LinearRing>',
        '        </outerBoundaryIs>',
        '      </Polygon>',
        '    </Placemark>',
      ].join('\n'),
    )
  }

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<kml xmlns="http://www.opengis.net/kml/2.2">',
    '  <Document>',
    '    <name>Geo3D Measure</name>',
    ...placemarks,
    '  </Document>',
    '</kml>',
  ].join('\n')
}

const CSV_HEADER = [
  'kind',
  'index',
  'label',
  'latitude',
  'longitude',
  'height',
  'source',
  'created_at',
] as const

/** RFC 4180: اقتباس الحقول التي تحوي فاصلة أو علامة اقتباس أو سطرًا جديدًا. */
export function escapeCsv(value: string): string {
  if (/[",\r\n]/.test(value)) {
    return `"${value.replaceAll('"', '""')}"`
  }
  return value
}

export function toCsv(data: ExportData): string {
  const rows: string[] = [CSV_HEADER.join(',')]

  data.points.forEach((point, index) => {
    rows.push(
      [
        'point',
        String(index + 1),
        escapeCsv(point.label ?? ''),
        String(point.lat),
        String(point.lon),
        point.height === undefined ? '' : String(point.height),
        point.source,
        point.createdAt.toISOString(),
      ].join(','),
    )
  })

  data.polygon.forEach((vertex, index) => {
    rows.push(
      [
        'polygon',
        String(index + 1),
        '',
        String(vertex.lat),
        String(vertex.lon),
        vertex.height === undefined ? '' : String(vertex.height),
        '',
        '',
      ].join(','),
    )
  })

  return `${rows.join('\r\n')}\r\n`
}

/** Excel على Windows يحتاج BOM لقراءة العربية UTF-8. */
export function withUtf8Bom(content: string): string {
  return `\uFEFF${content}`
}
