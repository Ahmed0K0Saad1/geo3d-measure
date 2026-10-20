// @vitest-environment jsdom
import 'fake-indexeddb/auto'

import { cleanup, render } from '@testing-library/react'
import axe from 'axe-core'
import i18n from 'i18next'
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'

import '../src/i18n/i18n.ts'
import { applyDocumentLanguage, type AppLanguage } from '../src/i18n/i18n.ts'
import { Header } from '../src/components/Header.tsx'
import { Sidebar } from '../src/components/Sidebar.tsx'
import type { GeoPoint } from '../src/core/geo/GeoPoint.ts'
import { usePointsStore } from '../src/store/usePointsStore.ts'
import { usePolygonStore } from '../src/store/usePolygonStore.ts'

/**
 * اختبار إتاحة مبني على axe-core (T7.1 — NFR-7).
 *
 * حدود معروفة: jsdom بلا محرك تخطيط/رسم، لذا قاعدة `color-contrast`
 * معطّلة هنا ويُغطى التباين يدويًا في T7.3 وقائمة ما قبل الإطلاق.
 * كما أن خريطة Cesium نفسها لا تُركَّب في jsdom (تحتاج WebGL)؛
 * تُغطى بفحص يدوي في A-11.
 */
const axeOptions: axe.RunOptions = {
  runOnly: {
    type: 'tag',
    values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'],
  },
  rules: {
    'color-contrast': { enabled: false },
  },
}

function buildPoint(
  id: string,
  label: string,
  lat: number,
  lon: number,
): GeoPoint {
  return {
    id,
    label,
    lat,
    lon,
    source: 'manual',
    createdAt: new Date('2026-10-21T08:00:00.000Z'),
  }
}

function renderShell() {
  return render(
    <>
      <Header />
      <Sidebar
        isClickMode={false}
        onToggleClickMode={() => undefined}
        isPolygonMode={false}
        onTogglePolygonMode={() => undefined}
        onFocusPoint={() => undefined}
      />
    </>,
  )
}

async function expectNoWcagViolations(container: HTMLElement): Promise<void> {
  const results = await axe.run(container, axeOptions)
  const violations = results.violations.map((violation) => ({
    id: violation.id,
    impact: violation.impact,
    targets: violation.nodes.map((node) => node.target),
  }))
  expect(violations).toEqual([])
}

async function useLanguage(language: AppLanguage): Promise<void> {
  await i18n.changeLanguage(language)
  applyDocumentLanguage(language)
}

beforeAll(async () => {
  if (!i18n.isInitialized) {
    await new Promise<void>((resolve) => {
      i18n.on('initialized', () => resolve())
    })
  }
})

beforeEach(() => {
  usePointsStore.setState({
    points: [],
    selectedPointId: null,
    selectedSegmentIndex: null,
  })
  usePolygonStore.setState({ vertices: [], status: 'idle' })
})

afterEach(() => {
  cleanup()
  document.body.innerHTML = ''
})

describe('إتاحة WCAG AA (axe-core)', () => {
  it('الهيكل الفارغ بالعربية وRTL بلا انتهاكات A/AA', async () => {
    await useLanguage('ar')
    const { container } = renderShell()

    await expectNoWcagViolations(container)
  })

  it('الهيكل بالإنجليزية مع نقاط ومضلع بلا انتهاكات A/AA', async () => {
    await useLanguage('en')
    usePointsStore.setState({
      points: [
        buildPoint('point-1', 'Riyadh', 24.7136, 46.6753),
        buildPoint('point-2', 'Jeddah', 21.4858, 39.1925),
        buildPoint('point-3', 'Dammam', 26.4207, 50.0888),
      ],
      selectedPointId: 'point-2',
      selectedSegmentIndex: 0,
    })
    usePolygonStore.setState({
      vertices: [
        { id: 'vertex-1', lat: 24.7136, lon: 46.6753 },
        { id: 'vertex-2', lat: 21.4858, lon: 39.1925 },
        { id: 'vertex-3', lat: 26.4207, lon: 50.0888 },
      ],
      status: 'closed',
    })

    const { container } = renderShell()

    await expectNoWcagViolations(container)
  })
})
