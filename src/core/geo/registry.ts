import type { DistanceStrategy, DistanceStrategyRegistry } from './strategy.ts'

/**
 * سجل بسيط مبني على `Map`.
 * تسجيل استراتيجية بنفس `id` يستبدل السابقة (آخر تسجيل يفوز).
 */
export class StrategyRegistry implements DistanceStrategyRegistry {
  private readonly strategies = new Map<string, DistanceStrategy>()

  register(strategy: DistanceStrategy): void {
    this.strategies.set(strategy.id, strategy)
  }

  get(id: string): DistanceStrategy | undefined {
    return this.strategies.get(id)
  }

  list(): DistanceStrategy[] {
    return Array.from(this.strategies.values())
  }
}
