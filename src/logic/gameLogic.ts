import type { Planet, Player, BuildQueueItem, Officer } from '@/types/game'
import { TechnologyType, OfficerType } from '@/types/game'
import * as officerLogic from './officerLogic'
import * as buildingLogic from './buildingLogic'
import * as researchLogic from './researchLogic'
import * as pointsLogic from './pointsLogic'
import * as planetLogic from './planetLogic'
import * as resourceLogic from './resourceLogic'

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
    diplomaticRelations: {},
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
  resourceSpeed: number = 1
): {
  updatedResearchQueue: BuildQueueItem[]
} => {
  // 获取军官加成
  const bonuses = officerLogic.calculateActiveBonuses(player.officers, now)

  // 创建积分回调函数
  const onPointsEarned = (points: number, _type: string, _itemType: string, _level?: number, _quantity?: number) => {
    pointsLogic.addPoints(player, points)
  }

  // 更新所有星球资源（直接同步计算，避免 Worker 通信开销）
  player.planets.forEach(planet => {
    resourceLogic.updatePlanetResources(planet, now, bonuses, resourceSpeed)
  })

  // 更新所有星球其他状态
  player.planets.forEach(planet => {
    // 检查建造队列
    buildingLogic.completeBuildQueue(planet, now, onPointsEarned)

    // 更新星球最大空间
    if (planet.isMoon) {
      planet.maxSpace = planetLogic.calculateMoonMaxSpace(planet)
    } else {
      const terraformingTechLevel = player.technologies[TechnologyType.TerraformingTechnology] || 0
      planet.maxSpace = planetLogic.calculatePlanetMaxSpace(planet, terraformingTechLevel)
    }
  })

  // 检查研究队列
  const updatedResearchQueue = researchLogic.completeResearchQueue(player.researchQueue, player.technologies, now, onPointsEarned)

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
