/** تثبيت تلميح الدبوس داخل حاوية الخريطة — دالة نقية (T4.1). */

const TOOLTIP_OFFSET = 14
export const TOOLTIP_WIDTH = 220
export const TOOLTIP_HEIGHT = 68

export function clampTooltipPosition(
  x: number,
  y: number,
  containerWidth: number,
  containerHeight: number,
): { left: number; top: number } {
  return {
    left: Math.max(
      4,
      Math.min(x + TOOLTIP_OFFSET, containerWidth - TOOLTIP_WIDTH - 4),
    ),
    top: Math.max(
      4,
      Math.min(y + TOOLTIP_OFFSET, containerHeight - TOOLTIP_HEIGHT - 4),
    ),
  }
}
