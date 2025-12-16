/**
 * 公共业务逻辑模块
 * 提供跨模块共享的通用业务逻辑功能
 */

import { BuildingType, TechnologyType } from '@/types/game'
import type { Planet, Resources, Officer, BuildingConfig, TechnologyConfig } from '@/types/game'
import { OfficerType } from '@/types/game'
import * as officerLogic from '@/logic/officerLogic'
import * as resourceLogic from '@/logic/resourceLogic'
import { scaleResources } from '@/utils/speed'

/**
 * 获取特定等级的升级条件
 * 合并基础 requirements 和等级门槛 levelRequirements
 * @param config 建筑或科技配置
 * @param targetLevel 目标等级
 * @returns 合并后的前置条件
 */
export const getLevelRequirements = (
  config: BuildingConfig | TechnologyConfig,
  targetLevel: number
): Partial<Record<BuildingType | TechnologyType, number>> => {
  const requirements: Partial<Record<BuildingType | TechnologyType, number>> = {}

  // 1. 添加基础 requirements（如果存在）
  if (config.requirements) {
    Object.assign(requirements, config.requirements)
  }

  // 2. 添加等级门槛 requirements（如果存在）
  if (config.levelRequirements) {
    // 找出所有小于等于目标等级的门槛
    const applicableLevels = Object.keys(config.levelRequirements)
      .map(Number)
      .filter(level => level <= targetLevel)
      .sort((a, b) => a - b)

    // 依次合并所有适用的等级要求（后面的覆盖前面的）
    for (const level of applicableLevels) {
      const levelReqs = config.levelRequirements[level]
      if (levelReqs) {
        // 合并要求，取最大值
        for (const [key, value] of Object.entries(levelReqs)) {
          const currentValue = requirements[key as BuildingType | TechnologyType] || 0
          requirements[key as BuildingType | TechnologyType] = Math.max(currentValue, value)
        }
      }
    }
  }

  return requirements
}

/**
 * 检查建造/研发前置条件是否满足
 * @param planet 星球对象
 * @param technologies 已研究的科技等级
 * @param requirements 前置条件要求（建筑等级或科技等级）
 * @returns 是否满足前置条件
 */
export const checkRequirements = (
  planet: Planet | undefined,
  technologies: Partial<Record<TechnologyType, number>>,
  requirements?: Partial<Record<BuildingType | TechnologyType, number>>
): boolean => {
  // 如果星球不存在或没有前置条件，默认返回 true
  if (!planet || !requirements) return true

  // 检查所有前置条件
  for (const [key, requiredLevel] of Object.entries(requirements)) {
    // 检查是否为建筑类型
    if (Object.values(BuildingType).includes(key as BuildingType)) {
      const currentLevel = planet.buildings[key as BuildingType] || 0
      if (currentLevel < requiredLevel) {
        return false
      }
    }
    // 检查是否为科技类型
    else if (Object.values(TechnologyType).includes(key as TechnologyType)) {
      const currentLevel = technologies[key as TechnologyType] || 0
      if (currentLevel < requiredLevel) {
        return false
      }
    }
  }

  return true
}

/**
 * 计算星球的资源产量（包含军官加成）
 * @param planet 星球对象
 * @param officers 玩家的军官对象
 * @returns 每小时各类资源的产量
 */
export const getResourceProduction = (planet: Planet, officers: Record<OfficerType, Officer>, resourceSpeed: number = 1): Resources => {
  // 计算当前激活的军官加成
  const bonuses = officerLogic.calculateActiveBonuses(officers, Date.now())
  // 根据建筑等级和军官加成计算资源产量
  const base = resourceLogic.calculateResourceProduction(planet, bonuses)
  return scaleResources(base, resourceSpeed)
}

/**
 * 计算星球的资源存储容量（包含军官加成）
 * @param planet 星球对象
 * @param officers 玩家的军官对象
 * @returns 各类资源的最大存储容量
 */
export const getResourceCapacity = (planet: Planet, officers: Record<OfficerType, Officer>): Resources => {
  // 计算当前激活的军官加成
  const bonuses = officerLogic.calculateActiveBonuses(officers, Date.now())
  // 根据仓库建筑等级和军官加成计算存储容量
  return resourceLogic.calculateResourceCapacity(planet, bonuses.storageCapacityBonus)
}

/**
 * 计算最大建造队列数量
 * @param planet 星球对象
 * @param additionalBuildQueue 军官提供的额外队列数量
 * @returns 最大建造队列数量（基础1个 + 纳米工厂等级 + 军官加成，最多10个）
 */
export const getMaxBuildQueue = (planet: Planet, additionalBuildQueue: number = 0): number => {
  const naniteFactoryLevel = planet.buildings[BuildingType.NaniteFactory] || 0
  return Math.min(1 + naniteFactoryLevel + additionalBuildQueue, 10)
}

/**
 * 计算最大研究队列数量
 * @param technologies 已研究的科技等级
 * @returns 最大研究队列数量（基础1个 + 计算机技术等级，最多10个）
 */
export const getMaxResearchQueue = (technologies: Partial<Record<TechnologyType, number>>): number => {
  const computerTechLevel = technologies[TechnologyType.ComputerTechnology] || 0
  return Math.min(1 + computerTechLevel, 10)
}

/**
 * 计算最大舰队任务数量
 * @param additionalFleetSlots 军官提供的额外槽位数量
 * @returns 最大舰队任务数量（基础1个 + 军官加成，最多10个）
 */
export const getMaxFleetMissions = (additionalFleetSlots: number = 0): number => {
  return Math.min(1 + additionalFleetSlots, 10)
}
