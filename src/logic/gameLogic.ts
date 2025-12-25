import type { Planet, Player, BuildQueueItem, Officer } from '@/types/game'
import { TechnologyType, OfficerType } from '@/types/game'
import * as officerLogic from './officerLogic'
import * as buildingLogic from './buildingLogic'
import * as researchLogic from './researchLogic'
import * as pointsLogic from './pointsLogic'
import * as planetLogic from './planetLogic'
import * as resourceLogic from './resourceLogic'
import * as achievementLogic from './achievementLogic'
import * as unlockLogic from './unlockLogic'
import * as waitingQueueLogic from './waitingQueueLogic'
import type { UnlockedItem } from './unlockLogic'

/**
 * 初始化玩家数据
 */
export const initializePlayer = (playerId: string, playerName: string = 'Commander'): Player => {
  const player: Player = {
    id: playerId,
    name: playerName,
    planets: [],
    technologies: {} as Record<TechnologyType, number>,
    officers: {} as Record<OfficerType, Officer>,
    researchQueue: [],
    waitingResearchQueue: [], // 研究等待队列
    fleetMissions: [],
    missileAttacks: [],
    battleReports: [],
    spyReports: [],
    spiedNotifications: [],
    npcActivityNotifications: [],
    missionReports: [],
    incomingFleetAlerts: [],
    giftNotifications: [],
    giftRejectedNotifications: [],
    diplomaticReports: [],
    points: 0
  }

  // 初始化科技等级
  Object.values(TechnologyType).forEach(tech => {
    player.technologies[tech] = 0
  })

  // 初始化军官状态
  Object.values(OfficerType).forEach(officer => {
    player.officers[officer] = officerLogic.createInactiveOfficer(officer)
  })

  return player
}

/**
 * 检查是否需要初始化游戏
 */
export const shouldInitializeGame = (planets: Planet[]): boolean => {
  return planets.length === 0
}

/**
 * 更新所有星球的最后更新时间
 */
export const updatePlanetsLastUpdate = (planets: Planet[], now: number): void => {
  planets.forEach(planet => {
    planet.lastUpdate = now
  })
}

/**
 * 生成星系位置列表
 */
export const generateSystemPositions = (
  _galaxy: number,
  _system: number,
  count: number = 10
): Array<{ position: number; planet: Planet | null }> => {
  const result: Array<{ position: number; planet: Planet | null }> = []
  for (let pos = 1; pos <= count; pos++) {
    result.push({ position: pos, planet: null })
  }
  return result
}

/**
 * 生成随机NPC星球位置
 */
export const generateRandomPosition = (): { galaxy: number; system: number; position: number } => {
  return {
    galaxy: Math.floor(Math.random() * 9) + 1,
    system: Math.floor(Math.random() * 10) + 1,
    position: Math.floor(Math.random() * 10) + 1
  }
}

/**
 * 生成位置键
 */
export const generatePositionKey = (galaxy: number, system: number, position: number): string => {
  return `${galaxy}:${system}:${position}`
}

/**
 * 更新游戏状态 - 处理所有星球和任务
 */
export const processGameUpdate = (
  player: Player,
  now: number,
  gameSpeed: number = 1,
  onNotification?: (type: string, itemType: string, level?: number) => void,
  onUnlock?: (unlockedItems: UnlockedItem[]) => void
): {
  updatedResearchQueue: BuildQueueItem[]
} => {
  // 确保成就统计数据存在
  if (!player.achievementStats) {
    player.achievementStats = achievementLogic.initializeAchievementStats()
  }
  if (!player.achievements) {
    player.achievements = achievementLogic.initializeAchievements()
  }

  // 获取军官加成
  const bonuses = officerLogic.calculateActiveBonuses(player.officers, now)

  // 创建积分回调函数
  const onPointsEarned = (points: number, _type: string, _itemType: string, _level?: number, _quantity?: number) => {
    pointsLogic.addPoints(player, points)
  }

  // 保存完成前的状态（用于解锁检查）
  const previousTechnologies = { ...player.technologies }

  // 通知回调 + 成就统计更新
  const onCompleted = (type: string, itemType: string, level?: number, quantity?: number) => {
    if (onNotification) {
      onNotification(type, itemType, level)
    }
    // 更新成就统计
    if (player.achievementStats) {
      if (type === 'building' && level !== undefined) {
        achievementLogic.updateBuildingStats(player.achievementStats, itemType as any, level)
      } else if (type === 'technology' && level !== undefined) {
        achievementLogic.updateResearchStats(player.achievementStats, itemType as any, level)
      } else if (type === 'ship' && quantity !== undefined) {
        achievementLogic.updateShipProductionStats(player.achievementStats, itemType as any, quantity)
      } else if (type === 'defense' && quantity !== undefined) {
        achievementLogic.updateDefenseProductionStats(player.achievementStats, itemType as any, quantity)
      }
    }
  }

  // 更新所有星球资源（直接同步计算，避免 Worker 通信开销）
  player.planets.forEach(planet => {
    // 计算更新前的资源（用于计算生产量）
    const resourcesBefore = { ...planet.resources }

    resourceLogic.updatePlanetResources(planet, now, bonuses, gameSpeed)

    // 追踪资源生产统计
    if (player.achievementStats) {
      const metalProduced = Math.max(0, planet.resources.metal - resourcesBefore.metal)
      const crystalProduced = Math.max(0, planet.resources.crystal - resourcesBefore.crystal)
      const deuteriumProduced = Math.max(0, planet.resources.deuterium - resourcesBefore.deuterium)
      const darkMatterProduced = Math.max(0, planet.resources.darkMatter - resourcesBefore.darkMatter)

      if (metalProduced > 0 || crystalProduced > 0 || deuteriumProduced > 0 || darkMatterProduced > 0) {
        achievementLogic.updateResourceProductionStats(player.achievementStats, {
          metal: metalProduced,
          crystal: crystalProduced,
          deuterium: deuteriumProduced,
          darkMatter: darkMatterProduced
        })
      }
    }
  })

  // 收集所有新解锁的内容
  const allUnlockedItems: UnlockedItem[] = []

  // 更新所有星球其他状态
  player.planets.forEach(planet => {
    // 保存完成前的建筑状态
    const previousBuildings = { ...planet.buildings }

    // 检查建造队列
    buildingLogic.completeBuildQueue(planet, now, onPointsEarned, onCompleted)

    // 检查新解锁（只在主星球上检查，避免重复通知）
    if (!planet.isMoon && onUnlock) {
      const unlockedItems = unlockLogic.checkAllNewlyUnlocked(planet, player.technologies, previousBuildings, previousTechnologies)
      allUnlockedItems.push(...unlockedItems)
    }

    // 更新星球最大空间
    if (planet.isMoon) {
      planet.maxSpace = planetLogic.calculateMoonMaxSpace(planet)
    } else {
      const terraformingTechLevel = player.technologies[TechnologyType.TerraformingTechnology] || 0
      planet.maxSpace = planetLogic.calculatePlanetMaxSpace(planet, terraformingTechLevel)
    }
  })

  // 检查研究队列
  const updatedResearchQueue = researchLogic.completeResearchQueue(
    player.researchQueue,
    player.technologies,
    now,
    onPointsEarned,
    onCompleted
  )

  // 处理等待队列自动执行
  const waitingResult = waitingQueueLogic.processAllWaitingQueues(player, now)
  // 如果有等待队列项被执行，可以在这里添加通知（可选）
  if (waitingResult.executed.length > 0 && onNotification) {
    waitingResult.executed.forEach(item => {
      // 通知等待队列项已移至正式队列
      onNotification('waitingQueueMoved', item.itemType as string, item.targetLevel || item.quantity)
    })
  }

  // 如果科技完成，再次检查解锁（使用第一个非月球星球）
  if (onUnlock && player.technologies !== previousTechnologies) {
    const mainPlanet = player.planets.find(p => !p.isMoon)
    if (mainPlanet) {
      // 这里使用完成后的建筑状态，因为我们只关心科技完成带来的解锁
      const techUnlockedItems = unlockLogic.checkAllNewlyUnlocked(
        mainPlanet,
        player.technologies,
        mainPlanet.buildings,
        previousTechnologies
      )
      // 去重（避免与建筑完成时的解锁重复）
      techUnlockedItems.forEach(item => {
        if (!allUnlockedItems.some(existing => existing.type === item.type && existing.id === item.id)) {
          allUnlockedItems.push(item)
        }
      })
    }
  }

  // 触发解锁通知
  if (onUnlock && allUnlockedItems.length > 0) {
    onUnlock(allUnlockedItems)
  }

  return {
    updatedResearchQueue
  }
}

/**
 * 检查并返回过期的军官列表
 */
export const checkOfficersExpiration = (officers: Record<OfficerType, Officer>, now: number): void => {
  officerLogic.checkAndDeactivateExpiredOfficers(officers, now)
}

/**
 * 检查成就进度并解锁新成就
 */
export const checkAndUnlockAchievements = (player: Player): achievementLogic.AchievementUnlock[] => {
  if (!player.achievementStats || !player.achievements) {
    return []
  }

  const unlocks = achievementLogic.checkAchievements(player)

  // 应用奖励
  unlocks.forEach(unlock => {
    achievementLogic.applyAchievementReward(player, unlock.reward)
  })

  return unlocks
}

/**
 * 更新资源消耗统计
 */
export const trackResourceConsumption = (
  player: Player,
  consumed: { metal?: number; crystal?: number; deuterium?: number; darkMatter?: number }
): void => {
  if (!player.achievementStats) {
    player.achievementStats = achievementLogic.initializeAchievementStats()
  }
  achievementLogic.updateResourceConsumptionStats(player.achievementStats, consumed)
}

/**
 * 更新攻击统计（玩家作为攻击者）
 */
export const trackAttackStats = (player: Player, battleResult: any, won: boolean, debrisValue: number): void => {
  if (!player.achievementStats) {
    player.achievementStats = achievementLogic.initializeAchievementStats()
  }
  achievementLogic.updateAttackStats(player.achievementStats, battleResult, won, debrisValue)
}

/**
 * 更新防御统计（玩家作为防御者）
 */
export const trackDefenseStats = (player: Player, battleResult: any, won: boolean, debrisValue: number): void => {
  if (!player.achievementStats) {
    player.achievementStats = achievementLogic.initializeAchievementStats()
  }
  achievementLogic.updateDefenseStats(player.achievementStats, battleResult, won, debrisValue)
}

/**
 * 更新任务统计
 */
export const trackMissionStats = (
  player: Player,
  missionType: string,
  details?: {
    resourcesAmount?: number
    successful?: boolean
    fuelAmount?: number
  }
): void => {
  if (!player.achievementStats) {
    player.achievementStats = achievementLogic.initializeAchievementStats()
  }

  const stats = player.achievementStats
  achievementLogic.updateFlightMissionStats(stats)

  switch (missionType) {
    case 'transport':
      if (details?.resourcesAmount) {
        achievementLogic.updateTransportStats(stats, details.resourcesAmount)
      }
      break
    case 'colonize':
      achievementLogic.updateColonizationStats(stats)
      break
    case 'spy':
      achievementLogic.updateSpyStats(stats)
      break
    case 'deploy':
      achievementLogic.updateDeploymentStats(stats)
      break
    case 'expedition':
      achievementLogic.updateExpeditionStats(stats, details?.successful ?? false)
      break
    case 'recycle':
      // 回收任务总是计入任务次数，但只有有资源时才增加回收资源量
      achievementLogic.updateRecyclingStats(stats, details?.resourcesAmount ?? 0)
      break
    case 'destroy':
      achievementLogic.updatePlanetDestructionStats(stats)
      break
  }

  if (details?.fuelAmount) {
    achievementLogic.updateFuelConsumptionStats(stats, details.fuelAmount)
  }
}

/**
 * 更新外交统计
 */
export const trackDiplomacyStats = (
  player: Player,
  eventType: string,
  details?: {
    resourcesAmount?: number
    friendlyCount?: number
    hostileCount?: number
  }
): void => {
  if (!player.achievementStats) {
    player.achievementStats = achievementLogic.initializeAchievementStats()
  }

  const stats = player.achievementStats

  switch (eventType) {
    case 'gift':
      if (details?.resourcesAmount) {
        achievementLogic.updateGiftStats(stats, details.resourcesAmount)
      }
      break
    case 'attackedByNPC':
      achievementLogic.updateAttackedByNPCStats(stats)
      break
    case 'spiedByNPC':
      achievementLogic.updateSpiedByNPCStats(stats)
      break
    case 'debrisRecycledByNPC':
      if (details?.resourcesAmount) {
        achievementLogic.updateDebrisRecycledByNPCStats(stats, details.resourcesAmount)
      }
      break
    case 'updateRelations':
      if (details?.friendlyCount !== undefined) {
        achievementLogic.updateFriendlyNPCStats(stats, details.friendlyCount)
      }
      if (details?.hostileCount !== undefined) {
        achievementLogic.updateHostileNPCStats(stats, details.hostileCount)
      }
      break
  }
}

/**
 * 追踪燃料消耗（在舰队出发时调用）
 */
export const trackFuelConsumption = (player: Player, fuelAmount: number): void => {
  if (!player.achievementStats) {
    player.achievementStats = achievementLogic.initializeAchievementStats()
  }
  achievementLogic.updateFuelConsumptionStats(player.achievementStats, fuelAmount)
}
