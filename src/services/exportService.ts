/**
 * تنزيل ملفات التصدير من المتصفح (T6.3 — ADR-035).
 * تبقى المُسلسلات النقية في exportFormat.ts؛ هذا الملف يلمس DOM فقط.
 */

import {
  toCsv,
  toGeoJson,
  toKml,
  withUtf8Bom,
  type ExportData,
} from './exportFormat.ts'

export type ExportFormat = 'geojson' | 'kml' | 'csv'

const FORMAT_INFO: Record<
  ExportFormat,
  { extension: string; mimeType: string; csv: boolean }
> = {
  geojson: {
    extension: 'geojson',
    mimeType: 'application/geo+json;charset=utf-8',
    csv: false,
  },
  kml: {
    extension: 'kml',
    mimeType: 'application/vnd.google-earth.kml+xml;charset=utf-8',
    csv: false,
  },
  csv: {
    extension: 'csv',
    mimeType: 'text/csv;charset=utf-8',
    csv: true,
  },
}

export function buildExportContent(
  format: ExportFormat,
  data: ExportData,
): string {
  switch (format) {
    case 'geojson':
      return toGeoJson(data)
    case 'kml':
      return toKml(data)
    case 'csv':
      return toCsv(data)
  }
}

/** اسم ملف آمن مع امتداد الصيغة؛ يحتفظ بالعربية والشرطات. */
export function exportFileName(baseName: string, format: ExportFormat): string {
  const withoutControlChars = [...baseName]
    .filter((char) => char.charCodeAt(0) >= 32)
    .join('')
  const safe =
    withoutControlChars
      .trim()
      .replace(/[<>:"/\\|?*]/g, '-')
      .replace(/\s+/g, '-')
      .replace(/^[.-]+|[.-]+$/g, '')
      .slice(0, 80) || 'geo3d-measure'
  return `${safe}.${FORMAT_INFO[format].extension}`
}

/** ينزّل المحتوى كملف؛ يُستدعى من الواجهة فقط. */
export function downloadExport(
  format: ExportFormat,
  data: ExportData,
  baseName: string,
): void {
  const info = FORMAT_INFO[format]
  const content = buildExportContent(format, data)
  const blob = new Blob([info.csv ? withUtf8Bom(content) : content], {
    type: info.mimeType,
  })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = exportFileName(baseName, format)
  anchor.rel = 'noopener'
  document.body.append(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}
