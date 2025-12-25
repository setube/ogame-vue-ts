import type { Planet, Resources, BuildQueueItem } from '@/types/game'
import { BuildingType, TechnologyType, ShipType, DefenseType } from '@/types/game'
import { BUILDINGS } from '@/config/gameConfig'
import * as pointsLogic from './pointsLogic'

// 用于生成唯一ID的计数器
let queueIdCounter = 0

/**
 * 计算建筑升级成本
 */
export const calculateBuildingCost = (buildingType: BuildingType, targetLevel: number): Resources => {
  const config = BUILDINGS[buildingType]
  const multiplier = Math.pow(config.costMultiplier, targetLevel - 1)
  return {
    metal: Math.floor(config.baseCost.metal * multiplier),
    crystal: Math.floor(config.baseCost.crystal * multiplier),
    deuterium: Math.floor(config.baseCost.deuterium * multiplier),
    darkMatter: Math.floor(config.baseCost.darkMatter * multiplier),
    energy: 0
  }
}

/**
 * 计算建筑升级时间
 * @param buildingType 建筑类型
 * @param targetLevel 目标等级
 * @param buildingSpeedBonus 指挥官等提供的速度加成百分比
 * @param roboticsFactoryLevel 机器人工厂等级
 * @param naniteFactoryLevel 纳米工厂等级
 */
export const calculateBuildingTime = (
  buildingType: BuildingType,
  targetLevel: number,
  buildingSpeedBonus: number = 0,
  roboticsFactoryLevel: number = 0,
  naniteFactoryLevel: number = 0
): number => {
  const config = BUILDINGS[buildingType]
  const multiplier = Math.pow(config.costMultiplier, targetLevel - 1)
  const baseTime = config.baseTime * multiplier

  // 机器人工厂和纳米工厂的加速：建造时间 / (1 + 机器人工厂等级 + 纳米工厂等级 × 2)
  const factorySpeedDivisor = 1 + roboticsFactoryLevel + naniteFactoryLevel * 2

  // 指挥官等的百分比加成
  const speedMultiplier = 1 - buildingSpeedBonus / 100

  return Math.floor((baseTime / factorySpeedDivisor) * speedMultiplier)
}

/**
 * 计算已用空间
 */
export const calculateUsedSpace = (planet: Planet): number => {
  let usedSpace = 0
  Object.entries(planet.buildings).forEach(([buildingType, level]) => {
    if (level > 0) {
      const config = BUILDINGS[buildingType as BuildingType]
      usedSpace += config.spaceUsage * level
    }
  })
  return usedSpace
}

/**
 * 检查建筑升级条件
 */
export const checkBuildingRequirements = (
  buildingType: BuildingType,
  planet: Planet,
  technologies: Partial<Record<TechnologyType, number>>
): boolean => {
  const config = BUILDINGS[buildingType]
  const requirements = (config as any).requirements
  if (!requirements) return true

  for (const [key, level] of Object.entries(requirements)) {
    const requiredLevel = level as number
    if (Object.values(BuildingType).includes(key as BuildingType)) {
      if ((planet.buildings[key as BuildingType] || 0) < requiredLevel) {
        return false
      }
    } else if (Object.values(TechnologyType).includes(key as TechnologyType)) {
      if ((technologies[key as TechnologyType] || 0) < requiredLevel) {
        return false
      }
    }
  }
  return true
}

/**
 * 检查是否有足够空间建造
 */
export const checkSpaceAvailable = (planet: Planet, buildingType: BuildingType): boolean => {
  const usedSpace = calculateUsedSpace(planet)
  const buildingConfig = BUILDINGS[buildingType]
  const requiredSpace = buildingConfig.spaceUsage
  return usedSpace + requiredSpace <= planet.maxSpace
}

/**
 * 创建建造队列项
 */
export const createBuildQueueItem = (buildingType: BuildingType, targetLevel: number, buildTime: number): BuildQueueItem => {
  const now = Date.now()
  queueIdCounter++
  return {
    id: `build_${now}_${queueIdCounter}`,
    type: 'building',
    itemType: buildingType,
    targetLevel,
    startTime: now,
    endTime: now + buildTime * 1000
  }
}

/**
 * 处理建造完成
 */
export const completeBuildQueue = (
  planet: Planet,
  now: number,
  onPointsEarned?: (points: number, type: 'building' | 'ship' | 'defense', itemType: string, level?: number, quantity?: number) => void,
  onCompleted?: (type: 'building' | 'ship' | 'defense' | 'demolish', itemType: string, level?: number, quantity?: number) => void
): void => {
  planet.buildQueue = planet.buildQueue.filter(item => {
    if (now >= item.endTime) {
      // 建造完成
      if (item.type === 'building') {
        const oldLevel = planet.buildings[item.itemType as BuildingType] || 0
        // 升级完成时，等级+1（而不是直接使用targetLevel，避免在升级过程中被拆除后跳级）
        const newLevel = oldLevel + 1
        planet.buildings[item.itemType as BuildingType] = newLevel

        // 计算并累积积分
        if (onPointsEarned && newLevel > oldLevel) {
          const points = pointsLogic.calculateBuildingPoints(item.itemType as BuildingType, oldLevel, newLevel)
          onPointsEarned(points, 'building', item.itemType, newLevel)
        }

        if (onCompleted) {
          onCompleted('building', item.itemType, newLevel)
        }
      } else if (item.type === 'ship') {
        const shipType = item.itemType as ShipType
        const quantity = item.quantity || 0
        planet.fleet[shipType] = (planet.fleet[shipType] || 0) + quantity

        // 计算并累积积分
        if (onPointsEarned && quantity > 0) {
          const points = pointsLogic.calculateShipPoints(shipType, quantity)
          onPointsEarned(points, 'ship', item.itemType, undefined, quantity)
        }
      } else if (item.type === 'defense') {
        const defenseType = item.itemType as DefenseType
        const quantity = item.quantity || 0
        planet.defense[defenseType] = (planet.defense[defenseType] || 0) + quantity

        // 计算并累积积分
        if (onPointsEarned && quantity > 0) {
          const points = pointsLogic.calculateDefensePoints(defenseType, quantity)
          onPointsEarned(points, 'defense', item.itemType, undefined, quantity)
        }
      } else if (item.type === 'demolish') {
        // 拆除完成，降低建筑等级
        const buildingType = item.itemType as BuildingType
        const currentLevel = planet.buildings[buildingType] || 0
        planet.buildings[buildingType] = Math.max(0, currentLevel - 1)
      }
      return false
    }
    return true
  })
}

/**
 * 计算拆除返还资源
 * @param buildingType 建筑类型
 * @param currentLevel 当前等级
 * @returns 返还50%的当前等级建造成本
 */
export const calculateDemolishRefund = (buildingType: BuildingType, currentLevel: number): Resources => {
  const cost = calculateBuildingCost(buildingType, currentLevel)
  return {
    metal: Math.floor(cost.metal * 0.5),
    crystal: Math.floor(cost.crystal * 0.5),
    deuterium: Math.floor(cost.deuterium * 0.5),
    darkMatter: Math.floor(cost.darkMatter * 0.5),
    energy: 0
  }
}

/**
 * 计算拆除时间
 * @param buildingType 建筑类型
 * @param currentLevel 当前等级
 * @param buildingSpeedBonus 建筑速度加成
 * @param roboticsFactoryLevel 机器人工厂等级
 * @param naniteFactoryLevel 纳米工厂等级
 * @returns 拆除时间（建造时间的50%）
 */
export const calculateDemolishTime = (
  buildingType: BuildingType,
  currentLevel: number,
  buildingSpeedBonus: number = 0,
  roboticsFactoryLevel: number = 0,
  naniteFactoryLevel: number = 0
): number => {
  const buildTime = calculateBuildingTime(buildingType, currentLevel, buildingSpeedBonus, roboticsFactoryLevel, naniteFactoryLevel)
  return Math.floor(buildTime * 0.5)
}

/**
 * 创建拆除队列项
 * @param buildingType 建筑类型
 * @param currentLevel 当前等级
 * @param demolishTime 拆除时间
 * @returns 拆除队列项
 */
export const createDemolishQueueItem = (buildingType: BuildingType, currentLevel: number, demolishTime: number): BuildQueueItem => {
  const now = Date.now()
  queueIdCounter++
  return {
    id: `demolish_${now}_${queueIdCounter}`,
    type: 'demolish',
    itemType: buildingType,
    targetLevel: currentLevel - 1, // 目标等级为当前等级-1
    startTime: now,
    endTime: now + demolishTime * 1000
  }
}
