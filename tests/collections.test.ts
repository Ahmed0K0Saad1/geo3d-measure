import { describe, expect, it } from 'vitest'
import { moveItem } from '../src/lib/collections.ts'

describe('moveItem — إعادة ترتيب عنصر (T2.7)', () => {
  it('ينقل عنصرًا من الوسط لأعلى ويحافظ على الباقي', () => {
    expect(moveItem(['a', 'b', 'c'], 1, -1)).toEqual(['b', 'a', 'c'])
  })

  it('ينقل عنصرًا من الوسط لأسفل ويحافظ على الباقي', () => {
    expect(moveItem(['a', 'b', 'c'], 1, 1)).toEqual(['a', 'c', 'b'])
  })

  it('يعيد نفس المصفوفة عند محاولة تجاوز الحدود', () => {
    const items = ['a', 'b', 'c']
    expect(moveItem(items, 0, -1)).toBe(items)
    expect(moveItem(items, 2, 1)).toBe(items)
    expect(moveItem(items, -1, 1)).toBe(items)
    expect(moveItem(items, 3, -1)).toBe(items)
  })

  it('لا يعدّل المصفوفة الأصلية', () => {
    const items = ['a', 'b', 'c']
    moveItem(items, 0, 1)
    expect(items).toEqual(['a', 'b', 'c'])
  })
})
