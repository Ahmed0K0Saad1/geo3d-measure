/**
 * نقل عنصر داخل مصفوفة بمقدار خطوة واحدة — دالة نقية (T2.7).
 * تعيد نفس المصفوفة إذا كان الموضع أو الهدف خارج الحدود.
 */
export function moveItem<T>(items: T[], index: number, offset: -1 | 1): T[] {
  const target = index + offset
  if (
    index < 0 ||
    index >= items.length ||
    target < 0 ||
    target >= items.length
  ) {
    return items
  }
  const next = [...items]
  const [item] = next.splice(index, 1)
  next.splice(target, 0, item)
  return next
}
