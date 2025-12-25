/**
 * 矿脉储量逻辑
 * 处理星球矿脉储量的生成、消耗和效率计算
 */

import type { Planet, OreDeposits } from '@/types/game'
import { ORE_DEPOSIT_CONFIG } from '@/config/gameConfig'

/**
 * 矿脉上限加成配置
 */
export const ORE_CAPACITY_BONUS = {
  // 深层钻探设施：每级增加20%矿脉上限
  DEEP_DRILLING_BONUS_PER_LEVEL: 0.2,
  // 采矿技术：每级增加15%矿脉上限（全局）
  MINING_TECH_BONUS_PER_LEVEL: 0.15
}

/**
 * 计算深层钻探设施的矿脉上限加成
 * @param deepDrillingLevel 深层钻探设施等级
 * @returns 加成倍数（1 + 等级 * 0.2）
 */
export const calculateDeepDrillingBonus = (deepDrillingLevel: number): number => {
  return 1 + deepDrillingLevel * ORE_CAPACITY_BONUS.DEEP_DRILLING_BONUS_PER_LEVEL
}

/**
 * 计算采矿技术的矿脉上限加成
 * @param miningTechLevel 采矿技术等级
 * @returns 加成倍数（1 + 等级 * 0.15）
 */
export const calculateMiningTechBonus = (miningTechLevel: number): number => {
  return 1 + miningTechLevel * ORE_CAPACITY_BONUS.MINING_TECH_BONUS_PER_LEVEL
}

/**
 * 根据星球位置动态计算基础储量上限（不含建筑/科技加成）
 * 这样修改配置后，所有星球的上限都会自动更新
 */
export const calculateInitialDeposits = (
  position:
    | {
        galaxy: number
        system: number
        position: number
      }
    | undefined
): { metal: number; crystal: number; deuterium: number } => {
  const { BASE_DEPOSITS, POSITION_MULTIPLIERS, GALAXY_MULTIPLIER } = ORE_DEPOSIT_CONFIG

  // 防御性检查：如果position无效，返回默认值（位置8，银河系1）
  if (!position || typeof position.position !== 'number' || typeof position.galaxy !== 'number') {
    console.warn('[OreDeposits] Invalid position, using defaults:', position)
    return {
      metal: BASE_DEPOSITS.metal,
      crystal: BASE_DEPOSITS.crystal,
      deuterium: BASE_DEPOSITS.deuterium
    }
  }

  // 位置索引 (0-14)
  const posIndex = Math.max(0, Math.min(14, position.position - 1))

  // 银河系加成 (银河系1为基础，每增加1个银河系增加5%)
  const galaxyBonus = 1 + (position.galaxy - 1) * GALAXY_MULTIPLIER

  // 计算每种资源的储量上限（不含随机浮动，确保一致性）
  const metal = Math.floor(BASE_DEPOSITS.metal * (POSITION_MULTIPLIERS.metal[posIndex] ?? 1) * galaxyBonus)
  const crystal = Math.floor(BASE_DEPOSITS.crystal * (POSITION_MULTIPLIERS.crystal[posIndex] ?? 1) * galaxyBonus)
  const deuterium = Math.floor(BASE_DEPOSITS.deuterium * (POSITION_MULTIPLIERS.deuterium[posIndex] ?? 1) * galaxyBonus)

  return { metal, crystal, deuterium }
}

/**
 * 计算带有建筑和科技加成的矿脉储量上限
 * @param position 星球位置
 * @param deepDrillingLevel 深层钻探设施等级（星球级）
 * @param miningTechLevel 采矿技术等级（全局）
 * @returns 包含加成的储量上限
 */
export const calculateEnhancedDeposits = (
  position: { galaxy: number; system: number; position: number } | undefined,
  deepDrillingLevel: number = 0,
  miningTechLevel: number = 0
): { metal: number; crystal: number; deuterium: number; bonusMultiplier: number } => {
  const baseDeposits = calculateInitialDeposits(position)

  // 计算总加成倍数
  const deepDrillingBonus = calculateDeepDrillingBonus(deepDrillingLevel)
  const miningTechBonus = calculateMiningTechBonus(miningTechLevel)
  const totalBonus = deepDrillingBonus * miningTechBonus

  return {
    metal: Math.floor(baseDeposits.metal * totalBonus),
    crystal: Math.floor(baseDeposits.crystal * totalBonus),
    deuterium: Math.floor(baseDeposits.deuterium * totalBonus),
    bonusMultiplier: totalBonus
  }
}

/**
 * 根据星球位置生成初始矿脉储量
 */
export const generateOreDeposits = (position: { galaxy: number; system: number; position: number }): OreDeposits => {
  const initialDeposits = calculateInitialDeposits(position)

  return {
    metal: initialDeposits.metal,
    crystal: initialDeposits.crystal,
    deuterium: initialDeposits.deuterium,
    position: { ...position }
  }
}

/**
 * 计算矿脉储量对产量的效率系数
 * 当储量低于衰减阈值时，产量会线性下降
 * 但即使耗尽也保留最低产量（MIN_PRODUCTION_EFFICIENCY）
 * @returns MIN_PRODUCTION_EFFICIENCY-1 之间的效率系数
 */
export const calculateDepositEfficiency = (deposits: OreDeposits | undefined, resourceType: 'metal' | 'crystal' | 'deuterium'): number => {
  if (!deposits) return 1 // 没有储量数据时返回满效率（向后兼容）

  const { DECAY_START_THRESHOLD, MIN_PRODUCTION_EFFICIENCY } = ORE_DEPOSIT_CONFIG

  const currentDeposit = deposits[resourceType]
  const initialDeposits = calculateInitialDeposits(deposits.position)
  const initialDeposit = initialDeposits[resourceType]

  // 如果初始储量为0，返回最低效率（避免除以0）
  if (initialDeposit <= 0) return MIN_PRODUCTION_EFFICIENCY

  // 计算剩余百分比
  const remainingPercentage = currentDeposit / initialDeposit

  // 如果高于衰减阈值，返回满效率
  if (remainingPercentage >= DECAY_START_THRESHOLD) return 1

  // 如果已耗尽，返回最低效率（保底产量）
  if (currentDeposit <= 0) return MIN_PRODUCTION_EFFICIENCY

  // 在衰减阈值以下，线性衰减
  // 从 DECAY_START_THRESHOLD 到 0，效率从 1 降到 MIN_PRODUCTION_EFFICIENCY
  const decayRange = 1 - MIN_PRODUCTION_EFFICIENCY
  const decayProgress = remainingPercentage / DECAY_START_THRESHOLD
  return MIN_PRODUCTION_EFFICIENCY + decayRange * decayProgress
}

/**
 * 消耗矿脉储量
 * @param deposits 矿脉储量对象
 * @param resourceType 资源类型
 * @param amount 要消耗的量
 * @returns 实际消耗的量（不会超过剩余储量）
 */
export const consumeDeposit = (deposits: OreDeposits, resourceType: 'metal' | 'crystal' | 'deuterium', amount: number): number => {
  const currentDeposit = deposits[resourceType]
  const actualConsumption = Math.min(currentDeposit, amount)

  deposits[resourceType] = Math.max(0, currentDeposit - actualConsumption)

  return actualConsumption
}

/**
 * 获取矿脉剩余百分比
 */
export const getDepositPercentage = (deposits: OreDeposits | undefined, resourceType: 'metal' | 'crystal' | 'deuterium'): number => {
  if (!deposits) return 100
  // 如果没有position信息，返回100%（向后兼容旧数据）
  if (!deposits.position) return 100

  const currentDeposit = deposits[resourceType]
  const initialDeposits = calculateInitialDeposits(deposits.position)
  const initialDeposit = initialDeposits[resourceType]

  if (initialDeposit <= 0) return 0

  return (currentDeposit / initialDeposit) * 100
}

/**
 * 检查矿脉是否处于警告状态（低于警告阈值）
 */
export const isDepositWarning = (deposits: OreDeposits | undefined, resourceType: 'metal' | 'crystal' | 'deuterium'): boolean => {
  if (!deposits) return false

  const percentage = getDepositPercentage(deposits, resourceType)
  return percentage < ORE_DEPOSIT_CONFIG.WARNING_THRESHOLD * 100 && percentage > 0
}

/**
 * 检查矿脉是否已耗尽
 */
export const isDepositDepleted = (deposits: OreDeposits | undefined, resourceType: 'metal' | 'crystal' | 'deuterium'): boolean => {
  if (!deposits) return false
  return deposits[resourceType] <= 0
}

/**
 * 为现有星球迁移/初始化矿脉储量
 * 如果星球没有矿脉数据，则生成新的储量
 * 如果有矿脉数据但缺少position，则补充position信息
 */
export const migrateOreDeposits = (planet: Planet): void => {
  // 月球不需要矿脉（没有采矿建筑）
  if (planet.isMoon) return

  if (!planet.oreDeposits) {
    planet.oreDeposits = generateOreDeposits(planet.position)
  } else if (!planet.oreDeposits.position) {
    // 旧数据迁移：补充position信息
    planet.oreDeposits.position = { ...planet.position }
  }
}

/**
 * 计算预计耗尽时间（小时）
 * @param deposits 矿脉储量
 * @param resourceType 资源类型
 * @param productionPerHour 每小时产量
 * @returns 预计耗尽时间（小时），如果产量为0则返回Infinity
 */
export const calculateDepletionTime = (
  deposits: OreDeposits | undefined,
  resourceType: 'metal' | 'crystal' | 'deuterium',
  productionPerHour: number
): number => {
  if (!deposits || productionPerHour <= 0) return Infinity

  const currentDeposit = deposits[resourceType]
  if (currentDeposit <= 0) return 0

  return currentDeposit / productionPerHour
}

/**
 * 格式化耗尽时间为可读字符串
 */
export const formatDepletionTime = (hours: number): string => {
  if (!isFinite(hours) || hours < 0) return '∞'
  if (hours === 0) return '0'

  const days = Math.floor(hours / 24)
  const remainingHours = Math.floor(hours % 24)

  if (days > 365) {
    const years = Math.floor(days / 365)
    return `${years}y+`
  }

  if (days > 0) {
    return `${days}d ${remainingHours}h`
  }

  if (hours < 1) {
    const minutes = Math.floor(hours * 60)
    return `${minutes}m`
  }

  return `${remainingHours}h`
}

/**
 * 计算地质研究站带来的恢复速率加成
 * @param geoStationLevel 地质研究站等级
 * @returns 恢复速率倍数（1 + 等级 * 0.5）
 */
export const calculateGeoStationBonus = (geoStationLevel: number): number => {
  // 每级地质研究站增加50%恢复速度
  // 0级 = 1倍, 1级 = 1.5倍, 2级 = 2倍, ..., 10级 = 6倍
  return 1 + geoStationLevel * 0.5
}

/**
 * 恢复矿脉储量
 * 矿脉会随时间缓慢恢复，模拟地质活动
 * @param deposits 矿脉储量对象
 * @param hoursElapsed 经过的小时数
 * @param geoStationLevel 地质研究站等级（可选，影响恢复速度）
 */
export const regenerateDeposits = (deposits: OreDeposits, hoursElapsed: number, geoStationLevel: number = 0): void => {
  const { REGENERATION } = ORE_DEPOSIT_CONFIG

  if (!REGENERATION.ENABLED || hoursElapsed <= 0) return

  // 计算地质研究站加成
  const geoBonus = calculateGeoStationBonus(geoStationLevel)

  // 动态计算初始储量上限
  const initialDeposits = calculateInitialDeposits(deposits.position)

  // 计算恢复量（基于初始储量的百分比，乘以地质研究站加成）
  const regenRate = REGENERATION.RATE_PER_HOUR * hoursElapsed * geoBonus
  const maxPercentage = REGENERATION.MAX_PERCENTAGE

  // 恢复每种资源
  const metalRegen = initialDeposits.metal * regenRate
  const crystalRegen = initialDeposits.crystal * regenRate
  const deuteriumRegen = initialDeposits.deuterium * regenRate

  // 添加恢复量，但不超过初始储量的最大百分比
  deposits.metal = Math.min(initialDeposits.metal * maxPercentage, deposits.metal + metalRegen)
  deposits.crystal = Math.min(initialDeposits.crystal * maxPercentage, deposits.crystal + crystalRegen)
  deposits.deuterium = Math.min(initialDeposits.deuterium * maxPercentage, deposits.deuterium + deuteriumRegen)
}

/**
 * 获取矿脉恢复状态信息
 * @param deposits 矿脉储量
 * @param geoStationLevel 地质研究站等级（可选，影响恢复时间计算）
 */
export const getRegenerationInfo = (
  deposits: OreDeposits | undefined,
  geoStationLevel: number = 0
): {
  metalRecovering: boolean
  crystalRecovering: boolean
  deuteriumRecovering: boolean
  hoursToFullMetal: number
  hoursToFullCrystal: number
  hoursToFullDeuterium: number
  geoStationBonus: number // 地质研究站加成倍数
} => {
  const geoBonus = calculateGeoStationBonus(geoStationLevel)

  if (!deposits) {
    return {
      metalRecovering: false,
      crystalRecovering: false,
      deuteriumRecovering: false,
      hoursToFullMetal: 0,
      hoursToFullCrystal: 0,
      hoursToFullDeuterium: 0,
      geoStationBonus: geoBonus
    }
  }

  // 动态计算初始储量上限
  const initialDeposits = calculateInitialDeposits(deposits.position)

  const { REGENERATION } = ORE_DEPOSIT_CONFIG
  const maxPercentage = REGENERATION.MAX_PERCENTAGE
  // 实际恢复速率 = 基础速率 * 地质研究站加成
  const ratePerHour = REGENERATION.RATE_PER_HOUR * geoBonus

  const metalMax = initialDeposits.metal * maxPercentage
  const crystalMax = initialDeposits.crystal * maxPercentage
  const deuteriumMax = initialDeposits.deuterium * maxPercentage

  const metalRecovering = deposits.metal < metalMax
  const crystalRecovering = deposits.crystal < crystalMax
  const deuteriumRecovering = deposits.deuterium < deuteriumMax

  // 计算恢复到满需要的小时数（考虑地质研究站加成）
  const hoursToFullMetal = metalRecovering ? (metalMax - deposits.metal) / (initialDeposits.metal * ratePerHour) : 0
  const hoursToFullCrystal = crystalRecovering ? (crystalMax - deposits.crystal) / (initialDeposits.crystal * ratePerHour) : 0
  const hoursToFullDeuterium = deuteriumRecovering ? (deuteriumMax - deposits.deuterium) / (initialDeposits.deuterium * ratePerHour) : 0

  return {
    metalRecovering,
    crystalRecovering,
    deuteriumRecovering,
    hoursToFullMetal,
    hoursToFullCrystal,
    hoursToFullDeuterium,
    geoStationBonus: geoBonus
  }
}
