import {
  AchievementTier,
  BuildingType,
  TechnologyType,
  ShipType,
  DefenseType,
  type AchievementStats,
  type AchievementProgress,
  type AchievementReward,
  type Player,
  type Resources,
  type BattleResult
} from '@/types/game'
import { ACHIEVEMENTS, ACHIEVEMENT_MAP, getNextTier, getTierIndex } from '@/config/achievementConfig'

// 初始化空的成就统计数据
export const initializeAchievementStats = (): AchievementStats => {
  const emptyShipRecord = Object.values(ShipType).reduce((acc, type) => {
    acc[type] = 0
    return acc
  }, {} as Record<ShipType, number>)

  const emptyDefenseRecord = Object.values(DefenseType).reduce((acc, type) => {
    acc[type] = 0
    return acc
  }, {} as Record<DefenseType, number>)

  const emptyBuildingRecord = Object.values(BuildingType).reduce((acc, type) => {
    acc[type] = 0
    return acc
  }, {} as Record<BuildingType, number>)

  const emptyTechRecord = Object.values(TechnologyType).reduce((acc, type) => {
    acc[type] = 0
    return acc
  }, {} as Record<TechnologyType, number>)

  return {
    // 资源统计
    totalMetalProduced: 0,
    totalCrystalProduced: 0,
    totalDeuteriumProduced: 0,
    totalDarkMatterProduced: 0,
    totalMetalConsumed: 0,
    totalCrystalConsumed: 0,
    totalDeuteriumConsumed: 0,
    totalDarkMatterConsumed: 0,

    // 建造统计
    buildingsUpgraded: 0,
    maxBuildingLevel: { ...emptyBuildingRecord },
    researchCompleted: 0,
    maxTechnologyLevel: { ...emptyTechRecord },
    shipsProduced: { ...emptyShipRecord },
    totalShipsProduced: 0,
    defensesBuilt: { ...emptyDefenseRecord },
    totalDefensesBuilt: 0,

    // 战斗统计
    attacksLaunched: 0,
    attacksWon: 0,
    attacksLost: 0,
    fleetLostInAttack: { ...emptyShipRecord },
    totalFleetLostInAttack: 0,
    debrisCreatedFromAttacks: 0,
    defensesSuccessful: 0,
    defensesFailed: 0,
    fleetLostInDefense: { ...emptyShipRecord },
    totalFleetLostInDefense: 0,
    defenseLostInDefense: { ...emptyDefenseRecord },
    totalDefenseLostInDefense: 0,
    enemyFleetDestroyedInDefense: { ...emptyShipRecord },
    totalEnemyFleetDestroyedInDefense: 0,
    debrisCreatedFromDefenses: 0,

    // 任务统计
    totalFlightMissions: 0,
    transportMissions: 0,
    transportedResources: 0,
    colonizations: 0,
    spyMissions: 0,
    deployments: 0,
    expeditionsTotal: 0,
    expeditionsSuccessful: 0,
    recyclingMissions: 0,
    recycledResources: 0,
    planetDestructions: 0,
    fuelConsumed: 0,

    // 外交统计
    friendlyNPCCount: 0,
    hostileNPCCount: 0,
    giftsSent: 0,
    giftResourcesTotal: 0,
    attackedByNPC: 0,
    spiedByNPC: 0,
    debrisRecycledByNPC: 0,
    debrisResourcesLostToNPC: 0
  }
}

// 初始化所有成就进度
export const initializeAchievements = (): Record<string, AchievementProgress> => {
  const achievements: Record<string, AchievementProgress> = {}

  for (const config of ACHIEVEMENTS) {
    achievements[config.id] = {
      id: config.id,
      currentTier: null,
      currentValue: 0,
      tierUnlocks: {
        [AchievementTier.Bronze]: null,
        [AchievementTier.Silver]: null,
        [AchievementTier.Gold]: null,
        [AchievementTier.Platinum]: null,
        [AchievementTier.Diamond]: null
      }
    }
  }

  return achievements
}

// 获取成就的当前值
const getAchievementValue = (stats: AchievementStats, statKey: string, checkType: string): number => {
  // 处理特殊的组合统计键
  if (statKey === 'totalResourcesConsumed') {
    return stats.totalMetalConsumed + stats.totalCrystalConsumed + stats.totalDeuteriumConsumed + stats.totalDarkMatterConsumed
  }

  if (statKey === 'totalDebrisCreated') {
    return stats.debrisCreatedFromAttacks + stats.debrisCreatedFromDefenses
  }

  if (statKey === 'totalFleetLost') {
    return stats.totalFleetLostInAttack + stats.totalFleetLostInDefense
  }

  // 处理普通统计键
  const value = stats[statKey as keyof AchievementStats]
  if (typeof value === 'number') {
    return value
  }

  // 处理 Record 类型的值（如果需要求和）
  if (checkType === 'sum' && typeof value === 'object') {
    return Object.values(value as Record<string, number>).reduce((a, b) => a + b, 0)
  }

  return 0
}

// 检查并更新成就进度，返回新解锁的成就
export interface AchievementUnlock {
  id: string
  tier: AchievementTier
  reward: AchievementReward
}

export const checkAchievements = (player: Player): AchievementUnlock[] => {
  if (!player.achievementStats || !player.achievements) {
    return []
  }

  const unlocks: AchievementUnlock[] = []
  const stats = player.achievementStats
  const achievements = player.achievements

  for (const config of ACHIEVEMENTS) {
    const progress = achievements[config.id]
    if (!progress) continue

    // 获取当前值
    const currentValue = getAchievementValue(stats, config.statKey, config.checkType)
    progress.currentValue = currentValue

    // 检查每个等级
    for (const tierConfig of config.tiers) {
      // 如果已经解锁这个等级，跳过
      if (progress.tierUnlocks[tierConfig.tier] !== null) continue

      // 检查是否达到目标
      let achieved = false
      if (config.checkType === 'gte' || config.checkType === 'sum') {
        achieved = currentValue >= tierConfig.target
      } else if (config.checkType === 'eq') {
        achieved = currentValue === tierConfig.target
      } else if (config.checkType === 'max') {
        achieved = currentValue >= tierConfig.target
      }

      if (achieved) {
        // 解锁成就
        const now = Date.now()
        progress.tierUnlocks[tierConfig.tier] = now

        // 更新当前最高等级
        if (progress.currentTier === null || getTierIndex(tierConfig.tier) > getTierIndex(progress.currentTier)) {
          progress.currentTier = tierConfig.tier
          progress.unlockedAt = now
        }

        unlocks.push({
          id: config.id,
          tier: tierConfig.tier,
          reward: tierConfig.reward
        })
      }
    }
  }

  return unlocks
}

// 应用成就奖励
export const applyAchievementReward = (player: Player, reward: AchievementReward): void => {
  const firstPlanet = player.planets[0]
  if (reward.darkMatter && firstPlanet) {
    // 奖励添加到第一个星球的资源中
    firstPlanet.resources.darkMatter += reward.darkMatter
  }

  if (reward.points) {
    player.points += reward.points
  }
}

// ==================== 统计更新函数 ====================

// 更新资源生产统计
export const updateResourceProductionStats = (
  stats: AchievementStats,
  produced: { metal?: number; crystal?: number; deuterium?: number; darkMatter?: number }
): void => {
  if (produced.metal) stats.totalMetalProduced += produced.metal
  if (produced.crystal) stats.totalCrystalProduced += produced.crystal
  if (produced.deuterium) stats.totalDeuteriumProduced += produced.deuterium
  if (produced.darkMatter) stats.totalDarkMatterProduced += produced.darkMatter
}

// 更新资源消耗统计
export const updateResourceConsumptionStats = (stats: AchievementStats, consumed: Partial<Resources>): void => {
  if (consumed.metal) stats.totalMetalConsumed += consumed.metal
  if (consumed.crystal) stats.totalCrystalConsumed += consumed.crystal
  if (consumed.deuterium) stats.totalDeuteriumConsumed += consumed.deuterium
  if (consumed.darkMatter) stats.totalDarkMatterConsumed += consumed.darkMatter
}

// 更新建筑升级统计
export const updateBuildingStats = (stats: AchievementStats, buildingType: BuildingType, level: number): void => {
  stats.buildingsUpgraded += 1

  // 更新最高等级记录
  if (level > (stats.maxBuildingLevel[buildingType] || 0)) {
    stats.maxBuildingLevel[buildingType] = level
  }
}

// 更新科技研究统计
export const updateResearchStats = (stats: AchievementStats, techType: TechnologyType, level: number): void => {
  stats.researchCompleted += 1

  // 更新最高等级记录
  if (level > (stats.maxTechnologyLevel[techType] || 0)) {
    stats.maxTechnologyLevel[techType] = level
  }
}

// 更新舰船生产统计
export const updateShipProductionStats = (stats: AchievementStats, shipType: ShipType, quantity: number): void => {
  stats.shipsProduced[shipType] = (stats.shipsProduced[shipType] || 0) + quantity
  stats.totalShipsProduced += quantity
}

// 更新防御建造统计
export const updateDefenseProductionStats = (stats: AchievementStats, defenseType: DefenseType, quantity: number): void => {
  stats.defensesBuilt[defenseType] = (stats.defensesBuilt[defenseType] || 0) + quantity
  stats.totalDefensesBuilt += quantity
}

// 更新攻击统计（玩家作为攻击者）
export const updateAttackStats = (stats: AchievementStats, battleResult: BattleResult, won: boolean, debrisValue: number): void => {
  // 攻击也算飞行任务
  stats.totalFlightMissions += 1
  stats.attacksLaunched += 1

  if (won) {
    stats.attacksWon += 1
  } else if (battleResult.winner === 'defender') {
    stats.attacksLost += 1
  }

  // 记录攻击中损失的舰队
  if (battleResult.attackerLosses) {
    for (const [shipType, count] of Object.entries(battleResult.attackerLosses)) {
      if (count && count > 0) {
        stats.fleetLostInAttack[shipType as ShipType] = (stats.fleetLostInAttack[shipType as ShipType] || 0) + count
        stats.totalFleetLostInAttack += count
      }
    }
  }

  // 记录产生的残骸
  stats.debrisCreatedFromAttacks += debrisValue
}

// 更新防御统计（玩家作为防御者）
export const updateDefenseStats = (stats: AchievementStats, battleResult: BattleResult, won: boolean, debrisValue: number): void => {
  if (won) {
    stats.defensesSuccessful += 1
  } else {
    stats.defensesFailed += 1
  }

  // 记录防御中损失的舰队
  if (battleResult.defenderLosses?.fleet) {
    for (const [shipType, count] of Object.entries(battleResult.defenderLosses.fleet)) {
      if (count && count > 0) {
        stats.fleetLostInDefense[shipType as ShipType] = (stats.fleetLostInDefense[shipType as ShipType] || 0) + count
        stats.totalFleetLostInDefense += count
      }
    }
  }

  // 记录防御中损失的防御设施
  if (battleResult.defenderLosses?.defense) {
    for (const [defenseType, count] of Object.entries(battleResult.defenderLosses.defense)) {
      if (count && count > 0) {
        stats.defenseLostInDefense[defenseType as DefenseType] = (stats.defenseLostInDefense[defenseType as DefenseType] || 0) + count
        stats.totalDefenseLostInDefense += count
      }
    }
  }

  // 记录防御中消灭的敌方舰队
  if (battleResult.attackerLosses) {
    for (const [shipType, count] of Object.entries(battleResult.attackerLosses)) {
      if (count && count > 0) {
        stats.enemyFleetDestroyedInDefense[shipType as ShipType] = (stats.enemyFleetDestroyedInDefense[shipType as ShipType] || 0) + count
        stats.totalEnemyFleetDestroyedInDefense += count
      }
    }
  }

  // 记录产生的残骸
  stats.debrisCreatedFromDefenses += debrisValue
}

// 更新飞行任务统计
export const updateFlightMissionStats = (stats: AchievementStats): void => {
  stats.totalFlightMissions += 1
}

// 更新运输任务统计
export const updateTransportStats = (stats: AchievementStats, resourcesAmount: number): void => {
  stats.transportMissions += 1
  stats.transportedResources += resourcesAmount
}

// 更新殖民统计
export const updateColonizationStats = (stats: AchievementStats): void => {
  stats.colonizations += 1
}

// 更新侦查统计
export const updateSpyStats = (stats: AchievementStats): void => {
  stats.spyMissions += 1
}

// 更新部署统计
export const updateDeploymentStats = (stats: AchievementStats): void => {
  stats.deployments += 1
}

// 更新探险统计
export const updateExpeditionStats = (stats: AchievementStats, successful: boolean): void => {
  stats.expeditionsTotal += 1
  if (successful) {
    stats.expeditionsSuccessful += 1
  }
}

// 更新回收统计
export const updateRecyclingStats = (stats: AchievementStats, resourcesAmount: number): void => {
  stats.recyclingMissions += 1
  stats.recycledResources += resourcesAmount
}

// 更新行星毁灭统计
export const updatePlanetDestructionStats = (stats: AchievementStats): void => {
  stats.planetDestructions += 1
}

// 更新燃料消耗统计
export const updateFuelConsumptionStats = (stats: AchievementStats, fuelAmount: number): void => {
  stats.fuelConsumed += fuelAmount
}

// 更新友好NPC数量
export const updateFriendlyNPCStats = (stats: AchievementStats, count: number): void => {
  stats.friendlyNPCCount = count
}

// 更新敌对NPC数量
export const updateHostileNPCStats = (stats: AchievementStats, count: number): void => {
  stats.hostileNPCCount = count
}

// 更新送礼统计
export const updateGiftStats = (stats: AchievementStats, resourcesAmount: number): void => {
  stats.giftsSent += 1
  stats.giftResourcesTotal += resourcesAmount
}

// 更新被NPC攻击统计
export const updateAttackedByNPCStats = (stats: AchievementStats): void => {
  stats.attackedByNPC += 1
}

// 更新被NPC侦查统计
export const updateSpiedByNPCStats = (stats: AchievementStats): void => {
  stats.spiedByNPC += 1
}

// 更新被NPC回收残骸统计
export const updateDebrisRecycledByNPCStats = (stats: AchievementStats, resourcesAmount: number): void => {
  stats.debrisRecycledByNPC += 1
  stats.debrisResourcesLostToNPC += resourcesAmount
}

// 获取成就的下一个目标
export const getNextTarget = (achievementId: string, currentTier: AchievementTier | null): number | null => {
  const config = ACHIEVEMENT_MAP[achievementId]
  if (!config) return null

  const nextTier = getNextTier(currentTier)
  if (!nextTier) return null

  const tierConfig = config.tiers.find(t => t.tier === nextTier)
  return tierConfig?.target ?? null
}

// 获取成就进度百分比
export const getAchievementProgress = (achievementId: string, currentValue: number, currentTier: AchievementTier | null): number => {
  const config = ACHIEVEMENT_MAP[achievementId]
  if (!config) return 0

  const nextTier = getNextTier(currentTier)
  if (!nextTier) return 100 // 已达到最高等级

  const tierConfig = config.tiers.find(t => t.tier === nextTier)
  if (!tierConfig) return 0

  // 计算当前等级的起始值
  let startValue = 0
  if (currentTier) {
    const currentTierConfig = config.tiers.find(t => t.tier === currentTier)
    startValue = currentTierConfig?.target ?? 0
  }

  const progress = ((currentValue - startValue) / (tierConfig.target - startValue)) * 100
  return Math.min(100, Math.max(0, progress))
}
