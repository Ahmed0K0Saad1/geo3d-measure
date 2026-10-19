import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import {
  MgrsError,
  mgrsToWgs84,
  wgs84ToMgrs,
  type MgrsErrorCode,
} from '@/core/coords/mgrs'
import {
  CoordinateParseError,
  formatDD,
  formatDMS,
  parseCoordinate,
  type Axis,
  type CoordinateParseErrorCode,
} from '@/core/coords/parsers'
import {
  UtmError,
  formatUtm,
  utmToWgs84,
  wgs84ToUtm,
  type UtmErrorCode,
  type UtmHemisphere,
} from '@/core/coords/utm'
import type { GeoPoint } from '@/core/geo/GeoPoint.ts'
import { geoPointSchema } from '@/lib/validators'
import { usePointsStore } from '@/store/usePointsStore'

type InputMode = 'dd' | 'utm' | 'mgrs'
type ManualSource = 'manual' | 'utm' | 'mgrs'

interface DraftPoint {
  lat: number
  lon: number
  source: ManualSource
}

interface AxisField {
  value: number | null
  error: CoordinateParseErrorCode | null
}

interface PreviewLine {
  key: 'dd' | 'dms' | 'utm' | 'mgrs'
  value: string
}

function parseAxisField(raw: string, axis: Axis): AxisField {
  if (raw.trim() === '') {
    return { value: null, error: null }
  }
  try {
    return { value: parseCoordinate(raw, axis), error: null }
  } catch (error) {
    return {
      value: null,
      error: error instanceof CoordinateParseError ? error.code : 'invalid',
    }
  }
}

interface DdEvaluation {
  draft: DraftPoint | null
  lat: AxisField
  lon: AxisField
}

function evaluateDd(latText: string, lonText: string): DdEvaluation {
  const lat = parseAxisField(latText, 'lat')
  const lon = parseAxisField(lonText, 'lon')
  return {
    draft:
      lat.value !== null && lon.value !== null
        ? { lat: lat.value, lon: lon.value, source: 'manual' }
        : null,
    lat,
    lon,
  }
}

interface UtmEvaluation {
  draft: DraftPoint | null
  error: UtmErrorCode | null
}

function evaluateUtm(
  zoneText: string,
  hemisphere: UtmHemisphere,
  eastingText: string,
  northingText: string,
): UtmEvaluation {
  if (
    zoneText.trim() === '' ||
    eastingText.trim() === '' ||
    northingText.trim() === ''
  ) {
    return { draft: null, error: null }
  }

  const zone = Number(zoneText.trim())
  const easting = Number(eastingText.trim())
  const northing = Number(northingText.trim())

  if (!Number.isInteger(zone) || zone < 1 || zone > 60) {
    return { draft: null, error: 'invalid-zone' }
  }
  if (!Number.isFinite(easting) || !Number.isFinite(northing)) {
    return { draft: null, error: 'invalid-coordinate' }
  }

  try {
    const { lat, lon } = utmToWgs84(easting, northing, zone, hemisphere)
    return { draft: { lat, lon, source: 'utm' }, error: null }
  } catch (error) {
    return {
      draft: null,
      error: error instanceof UtmError ? error.code : 'invalid-coordinate',
    }
  }
}

interface MgrsEvaluation {
  draft: DraftPoint | null
  error: MgrsErrorCode | null
}

function evaluateMgrs(value: string): MgrsEvaluation {
  if (value.trim() === '') {
    return { draft: null, error: null }
  }
  try {
    const { lat, lon } = mgrsToWgs84(value)
    return { draft: { lat, lon, source: 'mgrs' }, error: null }
  } catch (error) {
    return {
      draft: null,
      error: error instanceof MgrsError ? error.code : 'invalid-mgrs',
    }
  }
}

/** يبني معاينة الصيغ الأربع؛ UTM/MGRS تُحذف خارج نطاقهما (المناطق القطبية). */
function buildPreview(draft: DraftPoint): PreviewLine[] {
  const lines: PreviewLine[] = [
    { key: 'dd', value: `${formatDD(draft.lat)}, ${formatDD(draft.lon)}` },
    {
      key: 'dms',
      value: `${formatDMS(draft.lat, 'lat')} · ${formatDMS(draft.lon, 'lon')}`,
    },
  ]

  try {
    lines.push({
      key: 'utm',
      value: formatUtm(wgs84ToUtm(draft.lat, draft.lon)),
    })
  } catch {
    // UTM غير معرّف خارج ±80/84 — تكفي الصيغ الأخرى.
  }

  try {
    lines.push({ key: 'mgrs', value: wgs84ToMgrs(draft.lat, draft.lon) })
  } catch {
    // MGRS لا يدعم المناطق القطبية.
  }

  return lines
}

/** يبني النقطة خارج دورة الرسم (ADR-023) ويتحقق منها بـzod (T2.4). */
function buildPoint(draft: DraftPoint): GeoPoint | null {
  const point: GeoPoint = {
    id: `${draft.source}-${Date.now()}`,
    lat: draft.lat,
    lon: draft.lon,
    source: draft.source,
    createdAt: new Date(),
  }
  return geoPointSchema.safeParse(point).success ? point : null
}

/** إدخال يدوي DD/DMS أو UTM أو MGRS مع معاينة فورية للصيغ الأربع (T2.3/T2.4). */
export function ManualPointInput() {
  const { t } = useTranslation()
  const addPoint = usePointsStore((state) => state.addPoint)
  const [mode, setMode] = useState<InputMode>('dd')
  const [latText, setLatText] = useState('')
  const [lonText, setLonText] = useState('')
  const [zoneText, setZoneText] = useState('')
  const [hemisphere, setHemisphere] = useState<UtmHemisphere>('N')
  const [eastingText, setEastingText] = useState('')
  const [northingText, setNorthingText] = useState('')
  const [mgrsText, setMgrsText] = useState('')

  const dd = evaluateDd(latText, lonText)
  const utm = evaluateUtm(zoneText, hemisphere, eastingText, northingText)
  const mgrs = evaluateMgrs(mgrsText)

  const draft =
    mode === 'dd' ? dd.draft : mode === 'utm' ? utm.draft : mgrs.draft

  const submit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    if (draft === null) {
      return
    }
    const point = buildPoint(draft)
    if (point === null) {
      return
    }
    addPoint(point)
    if (mode === 'dd') {
      setLatText('')
      setLonText('')
    } else if (mode === 'utm') {
      setZoneText('')
      setEastingText('')
      setNorthingText('')
    } else {
      setMgrsText('')
    }
  }

  const preview = draft === null ? [] : buildPreview(draft)

  return (
    <form className="manual-point" onSubmit={submit}>
      <h3 className="points-subtitle">{t('points.manual.title')}</h3>

      <div
        className="manual-modes"
        role="group"
        aria-label={t('points.manual.format')}
      >
        {(['dd', 'utm', 'mgrs'] as const).map((item) => (
          <button
            key={item}
            type="button"
            className="manual-mode"
            aria-pressed={mode === item}
            onClick={() => setMode(item)}
          >
            {t(`points.manual.formats.${item}`)}
          </button>
        ))}
      </div>

      {mode === 'dd' && (
        <>
          <label className="manual-field">
            <span>{t('points.manual.latitude')}</span>
            <input
              dir="ltr"
              value={latText}
              onChange={(event) => setLatText(event.target.value)}
              placeholder="24.7136 · 24°42′48.96″ N"
              spellCheck={false}
            />
          </label>
          {dd.lat.error !== null && (
            <p className="points-error" role="alert">
              {t(`points.manual.errors.${dd.lat.error}`)}
            </p>
          )}

          <label className="manual-field">
            <span>{t('points.manual.longitude')}</span>
            <input
              dir="ltr"
              value={lonText}
              onChange={(event) => setLonText(event.target.value)}
              placeholder="46.6753 · 46°40′31.08″ E"
              spellCheck={false}
            />
          </label>
          {dd.lon.error !== null && (
            <p className="points-error" role="alert">
              {t(`points.manual.errors.${dd.lon.error}`)}
            </p>
          )}
        </>
      )}

      {mode === 'utm' && (
        <>
          <div className="manual-grid">
            <label className="manual-field">
              <span>{t('points.manual.utm.zone')}</span>
              <input
                dir="ltr"
                inputMode="numeric"
                value={zoneText}
                onChange={(event) => setZoneText(event.target.value)}
                placeholder="38"
                spellCheck={false}
              />
            </label>
            <label className="manual-field">
              <span>{t('points.manual.utm.hemisphere')}</span>
              <select
                dir="ltr"
                value={hemisphere}
                onChange={(event) =>
                  setHemisphere(event.target.value === 'S' ? 'S' : 'N')
                }
              >
                <option value="N">N</option>
                <option value="S">S</option>
              </select>
            </label>
            <label className="manual-field">
              <span>{t('points.manual.utm.easting')}</span>
              <input
                dir="ltr"
                inputMode="decimal"
                value={eastingText}
                onChange={(event) => setEastingText(event.target.value)}
                placeholder="669460"
                spellCheck={false}
              />
            </label>
            <label className="manual-field">
              <span>{t('points.manual.utm.northing')}</span>
              <input
                dir="ltr"
                inputMode="decimal"
                value={northingText}
                onChange={(event) => setNorthingText(event.target.value)}
                placeholder="2734272"
                spellCheck={false}
              />
            </label>
          </div>
          {utm.error !== null && (
            <p className="points-error" role="alert">
              {t(`points.manual.utm.errors.${utm.error}`)}
            </p>
          )}
        </>
      )}

      {mode === 'mgrs' && (
        <>
          <label className="manual-field">
            <span>{t('points.manual.mgrs.label')}</span>
            <input
              dir="ltr"
              value={mgrsText}
              onChange={(event) => setMgrsText(event.target.value)}
              placeholder="38RPN6945934271"
              spellCheck={false}
            />
          </label>
          {mgrs.error !== null && (
            <p className="points-error" role="alert">
              {t(`points.manual.mgrs.errors.${mgrs.error}`)}
            </p>
          )}
        </>
      )}

      {preview.length > 0 && (
        <dl className="manual-preview-list">
          {preview.map((line) => (
            <div key={line.key} className="manual-preview-row">
              <dt>{t(`points.manual.preview.${line.key}`)}</dt>
              <dd dir="ltr">{line.value}</dd>
            </div>
          ))}
        </dl>
      )}

      <button type="submit" className="sidebar-tool" disabled={draft === null}>
        {t('points.manual.add')}
      </button>
    </form>
  )
}
