import type { Resources, BuildQueueItem } from '@/types/game'
import { TechnologyType, BuildingType } from '@/types/game'
import { TECHNOLOGIES } from '@/config/gameConfig'
import * as pointsLogic from './pointsLogic'

// 用于生成唯一ID的计数器
let researchQueueIdCounter = 0

/**
 * 计算科技研究成本
 */
export const calculateTechnologyCost = (techType: TechnologyType, targetLevel: number): Resources => {
  const config = TECHNOLOGIES[techType]
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
 * 计算科技研究时间
 * @param techType 科技类型
 * @param currentLevel 当前等级
 * @param researchSpeedBonus 军官等提供的研究速度加成百分比
 * @param researchLabLevel 研究实验室等级
 * @param energyTechLevel 能源技术等级
 */
export const calculateTechnologyTime = (
  techType: TechnologyType,
  currentLevel: number,
  researchSpeedBonus: number = 0,
  researchLabLevel: number = 1,
  energyTechLevel: number = 0
): number => {
  const config = TECHNOLOGIES[techType]
  const baseTime = config.baseTime * Math.pow(config.costMultiplier, currentLevel)

  // 研究实验室和能源技术的加速：研究时间 / (研究实验室等级 × (1 + 能源技术等级))
  // 研究实验室等级至少为1，防止除以0
  const labLevel = Math.max(1, researchLabLevel)
  const techSpeedDivisor = labLevel * (1 + energyTechLevel)

  // 军官等的百分比加成
  const speedMultiplier = 1 - researchSpeedBonus / 100

  return Math.floor((baseTime / techSpeedDivisor) * speedMultiplier)
}

/**
 * 检查科技研究条件
 */
export const checkTechnologyRequirements = (
  techType: TechnologyType,
  buildings: Partial<Record<BuildingType, number>>,
  technologies: Partial<Record<TechnologyType, number>>
): boolean => {
  const config = TECHNOLOGIES[techType]
  if (!config.requirements) return true

  for (const [key, level] of Object.entries(config.requirements)) {
    if (Object.values(BuildingType).includes(key as BuildingType)) {
      if ((buildings[key as BuildingType] || 0) < level) {
        return false
      }
    } else if (Object.values(TechnologyType).includes(key as TechnologyType)) {
      if ((technologies[key as TechnologyType] || 0) < level) {
        return false
      }
    }
  }
  return true
}

/**
 * 创建研究队列项
 */
export const createResearchQueueItem = (techType: TechnologyType, targetLevel: number, researchTime: number): BuildQueueItem => {
  const now = Date.now()
  researchQueueIdCounter++
  return {
    id: `research_${now}_${researchQueueIdCounter}`,
    type: 'technology',
    itemType: techType,
    targetLevel,
    startTime: now,
    endTime: now + researchTime * 1000
  }
}

/**
 * 处理研究完成
 */
export const completeResearchQueue = (
  researchQueue: BuildQueueItem[],
  technologies: Partial<Record<TechnologyType, number>>,
  now: number,
  onPointsEarned?: (points: number, type: 'technology', itemType: string, level: number) => void,
  onCompleted?: (type: 'technology', itemType: string, level: number) => void
): BuildQueueItem[] => {
  return researchQueue.filter(item => {
    if (now >= item.endTime) {
      // 研究完成
      const oldLevel = technologies[item.itemType as TechnologyType] || 0
      // 研究完成时，等级+1（而不是直接使用targetLevel，保持一致性）
      const newLevel = oldLevel + 1
      technologies[item.itemType as TechnologyType] = newLevel

      // 计算并累积积分
      if (onPointsEarned && newLevel > oldLevel) {
        const points = pointsLogic.calculateTechnologyPoints(item.itemType as TechnologyType, oldLevel, newLevel)
        onPointsEarned(points, 'technology', item.itemType, newLevel)
      }

      // 通知完成
      if (onCompleted) {
        onCompleted('technology', item.itemType, newLevel)
      }

      return false
    }
    return true
  })
}
