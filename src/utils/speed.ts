import type { Resources } from '@/types/game'

/**
 * 按倍率缩放一个数值
 * - 支持合法的 0（例如用于“暂停”）
 */
export const scaleNumber = (value: number, multiplier: number): number => value * multiplier

/**
 * 按倍率缩放 Resources（常用于“每小时产量/消耗”等展示）
 * - 支持合法的 0（例如用于“暂停”）
 */
export const scaleResources = (resources: Resources, multiplier: number): Resources => ({
  metal: resources.metal * multiplier,
  crystal: resources.crystal * multiplier,
  deuterium: resources.deuterium * multiplier,
  darkMatter: resources.darkMatter * multiplier,
  energy: resources.energy * multiplier
})

/**
 * 计算游戏循环的间隔（毫秒）
 * - multiplier <= 0 或非有限值时，回退到 baseMs，避免除 0
 */
export const getGameLoopIntervalMs = (multiplier: number, baseMs: number = 1000): number => {
  if (!Number.isFinite(multiplier) || multiplier <= 0) return baseMs
  return baseMs / multiplier
}
