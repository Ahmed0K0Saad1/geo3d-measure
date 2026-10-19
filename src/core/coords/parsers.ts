/**
 * تحليل وتنسيق الإحداثيات اليدوية (DD/DMS) — منطق نقي بلا React/Cesium.
 * الصيغة: decimal = degrees + minutes/60 + seconds/3600
 * (N/E موجب · S/W سالب)
 * مراجع الصيغة: FromDMS (Wolfram MathWorld) وdms_decode في GeographicLib.
 */

/** محور الإحداثية: خط عرض (±90) أو خط طول (±180). */
export type Axis = 'lat' | 'lon'

/** أكواد أخطاء التحليل — تترجمها الواجهة (ADR-004/026). */
export type CoordinateParseErrorCode =
  | 'invalid'
  | 'out-of-range'
  | 'invalid-minutes'
  | 'invalid-seconds'
  | 'hemisphere-mismatch'

/** خطأ تحليل إحداثية يحمل كودًا قابلًا للترجمة بدل رسالة جاهزة. */
export class CoordinateParseError extends Error {
  readonly code: CoordinateParseErrorCode

  constructor(code: CoordinateParseErrorCode) {
    super(`coords:${code}`)
    this.name = 'CoordinateParseError'
    this.code = code
  }
}

type Hemisphere = 'N' | 'S' | 'E' | 'W'

interface ParsedDms {
  value: number
  hemisphere: Hemisphere | null
}

const NUMBER_PATTERN = /^[+-]?\d+(?:\.\d+)?$/
const DMS_MARKER_PATTERN = /[d°:'’"”′″]/i
const DMS_MARKER_GLOBAL = /[d°:'’"”′″]/gi

/** يحوّل قيمة DD نصية إلى درجات عشرية (النطاق العام ±180). */
export function parseDD(input: string): number {
  const trimmed = input.trim()
  if (!NUMBER_PATTERN.test(trimmed)) {
    throw new CoordinateParseError('invalid')
  }
  const value = Number(trimmed)
  if (!Number.isFinite(value)) {
    throw new CoordinateParseError('invalid')
  }
  if (value < -180 || value > 180) {
    throw new CoordinateParseError('out-of-range')
  }
  return value
}

/** يفكّ صيغة DMS (رموز °/'/" أو d أو نقطتان أو مسافات + نصف كرة). */
function parseDmsInternal(input: string): ParsedDms {
  let text = input.trim()
  let hemisphere: Hemisphere | null = null

  const leading = /^([NSEW])\s*/i.exec(text)
  if (leading) {
    hemisphere = leading[1].toUpperCase() as Hemisphere
    text = text.slice(leading[0].length)
  }

  const trailing = /\s*([NSEW])$/i.exec(text)
  if (trailing) {
    if (hemisphere !== null) {
      throw new CoordinateParseError('invalid')
    }
    hemisphere = trailing[1].toUpperCase() as Hemisphere
    text = text.slice(0, trailing.index)
  }

  const hasMarker = DMS_MARKER_PATTERN.test(text)
  const tokens = text
    .replace(DMS_MARKER_GLOBAL, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)

  if (!hasMarker && hemisphere === null && tokens.length < 2) {
    throw new CoordinateParseError('invalid')
  }
  if (tokens.length === 0 || tokens.length > 3) {
    throw new CoordinateParseError('invalid')
  }
  if (!tokens.every((token) => NUMBER_PATTERN.test(token))) {
    throw new CoordinateParseError('invalid')
  }

  const [degreesToken, minutesToken, secondsToken] = tokens
  const degrees = Number(degreesToken)
  const minutes = minutesToken === undefined ? 0 : Number(minutesToken)
  const seconds = secondsToken === undefined ? 0 : Number(secondsToken)

  if (minutes < 0 || minutes >= 60) {
    throw new CoordinateParseError('invalid-minutes')
  }
  if (seconds < 0 || seconds >= 60) {
    throw new CoordinateParseError('invalid-seconds')
  }
  if (hemisphere !== null && degrees < 0) {
    throw new CoordinateParseError('hemisphere-mismatch')
  }

  let value = Math.abs(degrees) + minutes / 60 + seconds / 3600
  if (degrees < 0 || hemisphere === 'S' || hemisphere === 'W') {
    value = -value
  }
  if (value < -180 || value > 180) {
    throw new CoordinateParseError('out-of-range')
  }

  return { value, hemisphere }
}

/** يحوّل قيمة DMS نصية إلى درجات عشرية (النطاق العام ±180). */
export function parseDMS(input: string): number {
  return parseDmsInternal(input).value
}

/** يتحقق من نطاق القيمة بحسب المحور (±90 للعرض · ±180 للطول). */
function assertAxisRange(value: number, axis: Axis): void {
  const limit = axis === 'lat' ? 90 : 180
  if (value < -limit || value > limit) {
    throw new CoordinateParseError('out-of-range')
  }
}

/**
 * يحلّل إحداثية واحدة (DD أو DMS) بحسب المحور:
 * يتحقق من النطاق المحوري ومن تطابق نصف الكرة (N/S للعرض · E/W للطول).
 */
export function parseCoordinate(input: string, axis: Axis): number {
  const trimmed = input.trim()
  if (trimmed === '') {
    throw new CoordinateParseError('invalid')
  }

  if (NUMBER_PATTERN.test(trimmed)) {
    const value = parseDD(trimmed)
    assertAxisRange(value, axis)
    return value
  }

  const { value, hemisphere } = parseDmsInternal(trimmed)
  if (hemisphere !== null) {
    const allowed = axis === 'lat' ? ['N', 'S'] : ['E', 'W']
    if (!allowed.includes(hemisphere)) {
      throw new CoordinateParseError('hemisphere-mismatch')
    }
  }
  assertAxisRange(value, axis)
  return value
}

/** يعرض القيمة بصيغة DD بعدد المنازل المحدد. */
export function formatDD(value: number, decimals = 6): string {
  return value.toFixed(decimals)
}

/**
 * يعرض القيمة بصيغة DMS. عند تحديد المحور تُضاف لاحقة صحيحة
 * (N/S للعرض · E/W للطول)؛ وبلا محور تُحذف اللاحقة.
 */
export function formatDMS(value: number, axis?: Axis): string {
  const totalSeconds = Math.round(Math.abs(value) * 3600 * 100) / 100
  const degrees = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds - degrees * 3600 - minutes * 60

  const hemisphere =
    axis === 'lat'
      ? value >= 0
        ? 'N'
        : 'S'
      : axis === 'lon'
        ? value >= 0
          ? 'E'
          : 'W'
        : ''
  const suffix = hemisphere === '' ? '' : ` ${hemisphere}`

  return `${degrees}°${minutes}'${seconds.toFixed(2)}"${suffix}`
}
