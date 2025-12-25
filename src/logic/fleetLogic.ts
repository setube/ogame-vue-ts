import type { FleetMission, Planet, Resources, Fleet, BattleResult, SpyReport, Player, Officer, DebrisField, NPC } from '@/types/game'
import type { Locale } from '@/locales'
import { ShipType, DefenseType, MissionType, BuildingType, OfficerType, TechnologyType, ExpeditionZone } from '@/types/game'
import { FLEET_STORAGE_CONFIG, EXPEDITION_ZONES } from '@/config/gameConfig'
import * as battleLogic from './battleLogic'
import * as moonLogic from './moonLogic'
import * as moonValidation from './moonValidation'
import * as diplomaticLogic from './diplomaticLogic'
import * as resourceLogic from './resourceLogic'
import * as fleetStorageLogic from './fleetStorageLogic'
import * as officerLogic from './officerLogic'
import * as planetLogic from './planetLogic'

/**
 * 计算两个星球之间的距离
 * 使用类似 OGame 的距离计算公式
 */
export const calculateDistance = (
  from: { galaxy: number; system: number; position: number },
  to: { galaxy: number; system: number; position: number }
): number => {
  // 同一位置
  if (from.galaxy === to.galaxy && from.system === to.system && from.position === to.position) {
    return 5
  }

  // 同星系内不同位置
  if (from.galaxy === to.galaxy && from.system === to.system) {
    return 1000 + Math.abs(to.position - from.position) * 5
  }

  // 同系统内不同星系
  if (from.galaxy === to.galaxy) {
    return 2700 + Math.abs(to.system - from.system) * 95
  }

  // 不同系统
  return 20000 + Math.abs(to.galaxy - from.galaxy) * 20000
}

/**
 * 计算飞行时间
 * 平衡后的时间倍率，确保游戏节奏合理
 */
export const calculateFlightTime = (distance: number, minSpeed: number): number => {
  return Math.max(10, Math.floor((distance * 50) / minSpeed)) // 至少10秒
}

/**
 * 创建舰队任务
 */
export const createFleetMission = (
  playerId: string,
  originPlanetId: string,
  targetPosition: { galaxy: number; system: number; position: number },
  missionType: MissionType,
  fleet: Partial<Fleet>,
  cargo: Resources,
  flightTime: number
): FleetMission => {
  const now = Date.now()
  return {
    id: `mission_${now}`,
    playerId,
    originPlanetId,
    // 深拷贝targetPosition，避免多个任务共享同一个引用
    targetPosition: { ...targetPosition },
    missionType,
    fleet,
    cargo,
    departureTime: now,
    arrivalTime: now + flightTime * 1000,
    returnTime: now + flightTime * 2 * 1000,
    status: 'outbound'
  }
}

/**
 * 运输任务失败原因
 */
export type TransportFailReason = 'targetNotFound' | 'giftRejected'

/**
 * 运输任务结果
 */
export interface TransportResult {
  success: boolean
  reputationGain?: number
  overflow?: Resources
  failReason?: TransportFailReason
}

/**
 * 处理运输任务到达
 */
export const processTransportArrival = (
  mission: FleetMission,
  targetPlanet: Planet | undefined,
  player?: Player,
  allNpcs?: NPC[],
  locale: Locale = 'zh-CN',
  storageCapacityBonus: number = 0
): TransportResult => {
  // 检查是否是赠送任务
  if (mission.isGift && mission.giftTargetNpcId && player && allNpcs) {
    const targetNpc = allNpcs.find(n => n.id === mission.giftTargetNpcId)
    if (targetNpc) {
      const giftResult = diplomaticLogic.handleGiftArrival(mission, player, targetNpc, locale)
      mission.status = 'returning'

      // 如果礼物被拒绝，资源返还给玩家
      if (!giftResult.accepted) {
        // 资源保留在cargo中，返回时会退还给玩家
        return { success: false, reputationGain: undefined, failReason: 'giftRejected' }
      }

      // 礼物被接受，清空货物
      mission.cargo = { metal: 0, crystal: 0, deuterium: 0, darkMatter: 0, energy: 0 }
      return { success: true, reputationGain: giftResult.reputationGain }
    }
  }

  // 正常运输任务
  if (targetPlanet) {
    // 使用安全添加函数，防止资源溢出
    const result = resourceLogic.addResourcesSafely(targetPlanet, mission.cargo, storageCapacityBonus)
    mission.status = 'returning'

    // 如果有溢出的资源，保留在cargo中返回给发送者
    if (result.overflow.metal > 0 || result.overflow.crystal > 0 || result.overflow.deuterium > 0 || result.overflow.darkMatter > 0) {
      mission.cargo = result.overflow
      return { success: true, overflow: result.overflow }
    }
    // 运输成功，清空货物
    mission.cargo = { metal: 0, crystal: 0, deuterium: 0, darkMatter: 0, energy: 0 }
    return { success: true }
  }
  // 目标星球不存在
  mission.status = 'returning'
  return { success: false, failReason: 'targetNotFound' }
}

/**
 * 处理攻击任务到达
 */
export const processAttackArrival = async (
  mission: FleetMission,
  targetPlanet: Planet | undefined,
  attacker: Player,
  defender: Player | null,
  allPlanets: Planet[]
): Promise<{ battleResult: BattleResult; moon: Planet | null; debrisField: DebrisField | null } | null> => {
  if (!targetPlanet || targetPlanet.ownerId === attacker.id) {
    mission.status = 'returning'
    return null
  }

  // 执行战斗（使用 Worker 进行异步计算）
  const battleResult = await battleLogic.simulateBattle(
    mission.fleet,
    targetPlanet.fleet,
    targetPlanet.defense,
    targetPlanet.resources,
    attacker.officers,
    defender?.officers || ({} as Record<OfficerType, Officer>),
    attacker.technologies,
    defender?.technologies || ({} as Record<TechnologyType, number>)
  )

  // 更新战斗报告ID
  battleResult.id = `battle_${Date.now()}`
  battleResult.attackerId = attacker.id
  battleResult.defenderId = targetPlanet.ownerId || 'unknown'
  battleResult.attackerPlanetId = mission.originPlanetId
  battleResult.defenderPlanetId = targetPlanet.id

  // 如果攻击方获胜，掠夺资源已经在战斗模拟中计算
  mission.cargo = battleResult.plunder

  // 更新舰队 - 计算幸存舰船
  const survivingFleet: Partial<Fleet> = {}
  Object.entries(mission.fleet).forEach(([shipType, initialCount]) => {
    const lost = battleResult.attackerLosses[shipType as ShipType] || 0
    const surviving = initialCount - lost
    if (surviving > 0) {
      survivingFleet[shipType as ShipType] = surviving
    }
  })
  mission.fleet = survivingFleet

  // 更新目标星球舰队和防御
  Object.entries(battleResult.defenderLosses.fleet).forEach(([shipType, lost]) => {
    targetPlanet.fleet[shipType as ShipType] = Math.max(0, targetPlanet.fleet[shipType as ShipType] - lost)
  })

  Object.entries(battleResult.defenderLosses.defense).forEach(([defenseType, lost]) => {
    targetPlanet.defense[defenseType as DefenseType] = Math.max(0, targetPlanet.defense[defenseType as DefenseType] - lost)
  })

  // 防御设施修复（70%概率）
  const defenseBeforeBattle: Partial<Record<DefenseType, number>> = { ...targetPlanet.defense }
  Object.entries(battleResult.defenderLosses.defense).forEach(([defenseType, lost]) => {
    defenseBeforeBattle[defenseType as DefenseType] = (defenseBeforeBattle[defenseType as DefenseType] || 0) + lost
  })
  targetPlanet.defense = battleLogic.repairDefense(defenseBeforeBattle, targetPlanet.defense) as Record<DefenseType, number>

  // 扣除掠夺的资源（防止下溢到负数）
  targetPlanet.resources.metal = Math.max(0, targetPlanet.resources.metal - battleResult.plunder.metal)
  targetPlanet.resources.crystal = Math.max(0, targetPlanet.resources.crystal - battleResult.plunder.crystal)
  targetPlanet.resources.deuterium = Math.max(0, targetPlanet.resources.deuterium - battleResult.plunder.deuterium)

  mission.status = 'returning'

  // 尝试生成月球（如果该位置还没有月球）
  let moon: Planet | null = null
  const moonCheck = moonValidation.canCreateMoon(allPlanets, targetPlanet.position, battleResult.debrisField)
  if (moonCheck.canCreate && moonCheck.chance) {
    if (moonValidation.shouldGenerateMoon(moonCheck.chance)) {
      moon = moonLogic.tryGenerateMoon(battleResult.debrisField, targetPlanet.position, targetPlanet.id, targetPlanet.ownerId || 'unknown')
    }
  }

  // 创建残骸场（如果有残骸）
  let debrisField: DebrisField | null = null
  const totalDebris = battleResult.debrisField.metal + battleResult.debrisField.crystal
  if (totalDebris > 0) {
    debrisField = {
      id: `debris_${targetPlanet.position.galaxy}_${targetPlanet.position.system}_${targetPlanet.position.position}`,
      position: targetPlanet.position,
      resources: {
        metal: battleResult.debrisField.metal,
        crystal: battleResult.debrisField.crystal
      },
      createdAt: Date.now()
    }
  }

  return { battleResult, moon, debrisField }
}

/**
 * 处理NPC攻击玩家星球
 * 专门用于NPC作为攻击方的情况
 */
export const processNPCAttackArrival = async (
  npc: NPC,
  mission: FleetMission,
  targetPlanet: Planet,
  defender: Player,
  allPlanets: Planet[]
): Promise<{ battleResult: BattleResult; moon: Planet | null; debrisField: DebrisField | null } | null> => {
  // 执行战斗（使用 Worker 进行异步计算）
  const battleResult = await battleLogic.simulateBattle(
    mission.fleet, // NPC舰队
    targetPlanet.fleet, // 玩家舰队
    targetPlanet.defense, // 玩家防御
    targetPlanet.resources, // 玩家资源
    {} as Record<OfficerType, Officer>, // NPC没有军官系统
    defender.officers || ({} as Record<OfficerType, Officer>), // 玩家军官
    npc.technologies, // NPC科技等级
    defender.technologies // 玩家科技等级
  )

  // 更新战斗报告ID和参与者信息
  battleResult.id = `battle_${Date.now()}`
  battleResult.attackerId = npc.id
  battleResult.defenderId = defender.id
  battleResult.attackerPlanetId = mission.originPlanetId
  battleResult.defenderPlanetId = targetPlanet.id
  battleResult.timestamp = Date.now()

  // 如果NPC获胜，掠夺的资源给NPC的起始星球
  if (battleResult.winner === 'attacker' && battleResult.plunder) {
    const npcOriginPlanet = npc.planets.find(p => p.id === mission.originPlanetId)
    if (npcOriginPlanet) {
      // NPC获得掠夺的资源（当舰队返回时）
      mission.cargo = battleResult.plunder
    }
  }

  // 更新NPC舰队 - 计算幸存舰船
  const survivingFleet: Partial<Fleet> = {}
  Object.entries(mission.fleet).forEach(([shipType, initialCount]) => {
    const lost = battleResult.attackerLosses[shipType as ShipType] || 0
    const surviving = initialCount - lost
    if (surviving > 0) {
      survivingFleet[shipType as ShipType] = surviving
    }
  })
  mission.fleet = survivingFleet

  // 更新玩家星球舰队和防御
  Object.entries(battleResult.defenderLosses.fleet).forEach(([shipType, lost]) => {
    targetPlanet.fleet[shipType as ShipType] = Math.max(0, (targetPlanet.fleet[shipType as ShipType] || 0) - lost)
  })

  Object.entries(battleResult.defenderLosses.defense).forEach(([defenseType, lost]) => {
    targetPlanet.defense[defenseType as DefenseType] = Math.max(0, (targetPlanet.defense[defenseType as DefenseType] || 0) - lost)
  })

  // 防御设施修复（70%概率）
  const defenseBeforeBattle: Partial<Record<DefenseType, number>> = { ...targetPlanet.defense }
  Object.entries(battleResult.defenderLosses.defense).forEach(([defenseType, lost]) => {
    defenseBeforeBattle[defenseType as DefenseType] = (defenseBeforeBattle[defenseType as DefenseType] || 0) + lost
  })
  targetPlanet.defense = battleLogic.repairDefense(defenseBeforeBattle, targetPlanet.defense) as Record<DefenseType, number>

  // 扣除玩家星球被掠夺的资源
  if (battleResult.plunder) {
    targetPlanet.resources.metal = Math.max(0, targetPlanet.resources.metal - battleResult.plunder.metal)
    targetPlanet.resources.crystal = Math.max(0, targetPlanet.resources.crystal - battleResult.plunder.crystal)
    targetPlanet.resources.deuterium = Math.max(0, targetPlanet.resources.deuterium - battleResult.plunder.deuterium)
  }

  mission.status = 'returning'

  // 尝试生成月球（如果该位置还没有月球）
  let moon: Planet | null = null
  const moonCheck = moonValidation.canCreateMoon(allPlanets, targetPlanet.position, battleResult.debrisField)
  if (moonCheck.canCreate && moonCheck.chance) {
    if (moonValidation.shouldGenerateMoon(moonCheck.chance)) {
      moon = moonLogic.tryGenerateMoon(battleResult.debrisField, targetPlanet.position, targetPlanet.id, targetPlanet.ownerId || 'unknown')
    }
  }

  // 创建残骸场（如果有残骸）
  let debrisField: DebrisField | null = null
  const totalDebris = battleResult.debrisField.metal + battleResult.debrisField.crystal
  if (totalDebris > 0) {
    debrisField = {
      id: `debris_${targetPlanet.position.galaxy}_${targetPlanet.position.system}_${targetPlanet.position.position}`,
      position: targetPlanet.position,
      resources: {
        metal: battleResult.debrisField.metal,
        crystal: battleResult.debrisField.crystal
      },
      createdAt: Date.now()
    }
  }

  // NPC攻击玩家后降低好感度
  if (!npc.relations) {
    npc.relations = {}
  }
  if (!npc.relations[defender.id]) {
    npc.relations[defender.id] = diplomaticLogic.initializeDiplomaticRelation(npc.id, defender.id)
  }

  // 根据战斗结果降低好感度
  // NPC获胜降低更多好感度，失败降低较少
  const reputationChange = battleResult.winner === 'attacker' ? -15 : -10
  const relation = npc.relations[defender.id]
  if (relation) {
    diplomaticLogic.updateReputation(relation, reputationChange, 'attack', `NPC ${npc.name} attacked player ${defender.name}`)
  }

  return { battleResult, moon, debrisField }
}

/**
 * 计算玩家最大星球数量
 * 基于天体物理学技术等级
 */
export const calculateMaxPlanets = (astrophysicsLevel: number): number => {
  // 基础1个星球（主星） + 每级天体物理学增加1个殖民地槽位
  return 1 + astrophysicsLevel
}

/**
 * 检查玩家是否可以殖民新星球
 */
export const canColonize = (player: Player): boolean => {
  const astrophysicsLevel = player.technologies[TechnologyType.Astrophysics] || 0
  const maxPlanets = calculateMaxPlanets(astrophysicsLevel)
  const currentPlanets = player.planets.length
  return currentPlanets < maxPlanets
}

/**
 * 殖民任务结果
 */
export interface ColonizeResult {
  success: boolean
  planet: Planet | null
  failReason?: 'positionOccupied' | 'maxColoniesReached'
}

/**
 * 处理殖民任务到达
 */
export const processColonizeArrival = (
  mission: FleetMission,
  targetPlanet: Planet | undefined,
  player: Player,
  colonyNameTemplate: string = 'Colony'
): ColonizeResult => {
  if (targetPlanet) {
    // 位置已被占用
    mission.status = 'returning'
    return { success: false, planet: null, failReason: 'positionOccupied' }
  }

  // 检查殖民地槽位限制
  if (!canColonize(player)) {
    // 超出殖民地数量限制，殖民船返回
    mission.status = 'returning'
    return { success: false, planet: null, failReason: 'maxColoniesReached' }
  }

  // 创建新殖民地
  const newPlanet: Planet = {
    id: `planet_${Date.now()}`,
    name: `${colonyNameTemplate} ${mission.targetPosition.galaxy}:${mission.targetPosition.system}:${mission.targetPosition.position}`,
    ownerId: player.id,
    position: mission.targetPosition,
    resources: { metal: 500, crystal: 500, deuterium: 0, darkMatter: 0, energy: 0 },
    buildings: {} as Record<BuildingType, number>,
    fleet: {
      [ShipType.LightFighter]: 0,
      [ShipType.HeavyFighter]: 0,
      [ShipType.Cruiser]: 0,
      [ShipType.Battleship]: 0,
      [ShipType.Battlecruiser]: 0,
      [ShipType.Bomber]: 0,
      [ShipType.Destroyer]: 0,
      [ShipType.SmallCargo]: 0,
      [ShipType.LargeCargo]: 0,
      [ShipType.ColonyShip]: 0,
      [ShipType.Recycler]: 0,
      [ShipType.EspionageProbe]: 0,
      [ShipType.SolarSatellite]: 0,
      [ShipType.DarkMatterHarvester]: 0,
      [ShipType.Deathstar]: 0
    },
    defense: {
      [DefenseType.RocketLauncher]: 0,
      [DefenseType.LightLaser]: 0,
      [DefenseType.HeavyLaser]: 0,
      [DefenseType.GaussCannon]: 0,
      [DefenseType.IonCannon]: 0,
      [DefenseType.PlasmaTurret]: 0,
      [DefenseType.SmallShieldDome]: 0,
      [DefenseType.LargeShieldDome]: 0,
      [DefenseType.AntiBallisticMissile]: 0,
      [DefenseType.InterplanetaryMissile]: 0,
      [DefenseType.PlanetaryShield]: 0
    },
    buildQueue: [],
    waitingBuildQueue: [], // 等待队列
    lastUpdate: Date.now(),
    maxSpace: 200,
    maxFleetStorage: FLEET_STORAGE_CONFIG.baseStorage,
    isMoon: false
  }

  Object.values(BuildingType).forEach(building => {
    newPlanet.buildings[building] = 0
  })

  // 初始化温度
  newPlanet.temperature = planetLogic.generatePlanetTemperature(mission.targetPosition.position)

  // 殖民船被消耗
  mission.fleet[ShipType.ColonyShip] = (mission.fleet[ShipType.ColonyShip] || 1) - 1
  mission.status = 'returning'

  return { success: true, planet: newPlanet }
}

/**
 * 计算间谍侦查信息可见度
 * 根据双方间谍技术等级差异决定显示哪些信息
 */
export const calculateSpyVisibility = (
  attackerSpyLevel: number,
  defenderSpyLevel: number,
  spyProbeCount: number
): {
  showFleet: boolean
  showDefense: boolean
  showBuildings: boolean
  showTechnologies: boolean
} => {
  // 技术等级差异 (考虑间谍探测器数量加成)
  const levelDiff = attackerSpyLevel - defenderSpyLevel + Math.floor(spyProbeCount / 5)

  return {
    showFleet: levelDiff >= -1, // Level 2: Resources + fleet
    showDefense: levelDiff >= 1, // Level 4: Resources + fleet + defense
    showBuildings: levelDiff >= 3, // Level 6: Resources + fleet + defense + buildings
    showTechnologies: levelDiff >= 5 // Level 8: Resources + fleet + defense + buildings + technologies
  }
}

/**
 * 计算间谍侦查被发现概率
 */
export const calculateSpyDetectionChance = (attackerSpyLevel: number, defenderSpyLevel: number, spyProbeCount: number): number => {
  // 基础被发现概率
  let baseChance = 0.25

  // 技术等级差异影响
  const levelDiff = defenderSpyLevel - attackerSpyLevel
  if (levelDiff > 0) {
    baseChance += levelDiff * 0.1 // 防守方技术高，增加被发现概率
  } else {
    baseChance += levelDiff * 0.05 // 攻击方技术高，减少被发现概率
  }

  // 间谍探测器数量影响
  baseChance -= spyProbeCount * 0.01 // 每个探测器降低1%被发现概率

  // 限制在 1% - 99% 之间
  return Math.max(0.01, Math.min(0.99, baseChance))
}

/**
 * 侦查任务失败原因
 */
export type SpyFailReason = 'targetNotFound'

/**
 * 侦查任务结果
 */
export interface SpyResult {
  success: boolean
  report?: SpyReport
  failReason?: SpyFailReason
}

/**
 * 处理间谍任务到达
 */
export const processSpyArrival = (
  mission: FleetMission,
  targetPlanet: Planet | undefined,
  attacker: Player,
  defender: Player | null,
  allNpcs?: NPC[],
  locale: Locale = 'zh-CN'
): SpyResult => {
  if (!targetPlanet) {
    mission.status = 'returning'
    return { success: false, failReason: 'targetNotFound' }
  }

  // 获取间谍技术等级
  const attackerSpyLevel = attacker.technologies[TechnologyType.EspionageTechnology] || 0
  const defenderSpyLevel = defender?.technologies[TechnologyType.EspionageTechnology] || 0
  const spyProbeCount = mission.fleet[ShipType.EspionageProbe] || 0

  // 计算信息可见度
  const visibility = calculateSpyVisibility(attackerSpyLevel, defenderSpyLevel, spyProbeCount)

  // 计算被发现概率
  const detectionChance = calculateSpyDetectionChance(attackerSpyLevel, defenderSpyLevel, spyProbeCount)

  // 判断是否被发现
  const wasDetected = Math.random() < detectionChance

  const spyReport: SpyReport = {
    id: `spy_${Date.now()}`,
    timestamp: Date.now(),
    spyId: attacker.id,
    targetPlanetId: targetPlanet.id,
    targetPlanetName: targetPlanet.name,
    targetPosition: { ...targetPlanet.position },
    targetPlayerId: targetPlanet.ownerId || 'unknown',
    resources: { ...targetPlanet.resources }, // 资源信息始终可见
    fleet: visibility.showFleet ? { ...targetPlanet.fleet } : undefined,
    defense: visibility.showDefense ? { ...targetPlanet.defense } : undefined,
    buildings: visibility.showBuildings ? { ...targetPlanet.buildings } : undefined,
    technologies: visibility.showTechnologies && defender ? { ...defender.technologies } : undefined,
    detectionChance
  }

  // 如果目标是NPC星球，调用外交逻辑
  if (allNpcs && targetPlanet.ownerId) {
    const targetNpc = allNpcs.find(npc => npc.planets.some(p => p.id === targetPlanet.id))
    if (targetNpc) {
      diplomaticLogic.handleSpyReputation(attacker, targetNpc, wasDetected, locale)
    }
  }

  mission.status = 'returning'
  return { success: true, report: spyReport }
}

/**
 * 部署任务失败原因
 */
export type DeployFailReason = 'targetNotFound' | 'notOwnPlanet'

/**
 * 部署任务结果
 */
export interface DeployResult {
  success: boolean
  overflow?: Partial<Record<ShipType, number>>
  failReason?: DeployFailReason
}

/**
 * 处理部署任务到达
 */
export const processDeployArrival = (
  mission: FleetMission,
  targetPlanet: Planet | undefined,
  playerId: string,
  technologies: Record<TechnologyType, number>
): DeployResult => {
  if (!targetPlanet) {
    mission.status = 'returning'
    return { success: false, failReason: 'targetNotFound' }
  }
  if (targetPlanet.ownerId !== playerId) {
    mission.status = 'returning'
    return { success: false, failReason: 'notOwnPlanet' }
  }

  // 使用安全添加函数，防止舰队仓储溢出
  const result = fleetStorageLogic.addFleetSafely(targetPlanet, mission.fleet, technologies)
  // 如果有溢出的舰船，保留在mission.fleet中返回给发送者
  const hasOverflow = Object.keys(result.overflow).length > 0
  if (hasOverflow) {
    mission.fleet = result.overflow as Fleet
    mission.status = 'returning'
    return { success: true, overflow: result.overflow }
  }
  // 部署任务直接完成，不返回
  return { success: true }
}

/**
 * 回收任务失败原因
 */
export type RecycleFailReason = 'noDebrisField' | 'debrisEmpty'

/**
 * 回收任务结果
 */
export interface RecycleResult {
  success: boolean
  collectedResources?: Pick<Resources, 'metal' | 'crystal'>
  remainingDebris?: Pick<Resources, 'metal' | 'crystal'> | null
  failReason?: RecycleFailReason
}

/**
 * 处理回收任务到达
 */
export const processRecycleArrival = (
  mission: FleetMission,
  debrisField: DebrisField | undefined,
  player?: Player,
  allNpcs?: NPC[],
  locale: Locale = 'zh-CN'
): RecycleResult => {
  if (!debrisField) {
    mission.status = 'returning'
    return { success: false, failReason: 'noDebrisField' }
  }

  // 计算回收船的货舱容量
  const recyclerCount = mission.fleet[ShipType.Recycler] || 0
  const recyclerCapacity = 20000 // 每艘回收船容量20000
  const totalCapacity = recyclerCount * recyclerCapacity

  // 计算已装载的货物
  const currentCargo = mission.cargo.metal + mission.cargo.crystal + mission.cargo.deuterium

  // 剩余容量
  const availableCapacity = totalCapacity - currentCargo

  // 计算可以收集的资源
  const totalDebris = debrisField.resources.metal + debrisField.resources.crystal
  const collectedAmount = Math.min(totalDebris, availableCapacity)

  // 防止除零：如果残骸为0，直接返回
  if (totalDebris === 0) {
    mission.status = 'returning'
    return { success: false, failReason: 'debrisEmpty' }
  }

  // 按比例收集金属和晶体
  const metalRatio = debrisField.resources.metal / totalDebris
  const crystalRatio = debrisField.resources.crystal / totalDebris

  const collectedMetal = Math.floor(collectedAmount * metalRatio)
  const collectedCrystal = Math.floor(collectedAmount * crystalRatio)

  // 更新任务货物
  mission.cargo.metal += collectedMetal
  mission.cargo.crystal += collectedCrystal

  // 更新残骸场
  const remainingMetal = debrisField.resources.metal - collectedMetal
  const remainingCrystal = debrisField.resources.crystal - collectedCrystal

  mission.status = 'returning'

  // 检查是否在NPC星球位置回收残骸，如果是则降低好感度
  if (player && allNpcs && collectedAmount > 0) {
    diplomaticLogic.handleDebrisRecycleReputation(player, debrisField.position, allNpcs, locale)
  }

  return {
    success: true,
    collectedResources: {
      metal: collectedMetal,
      crystal: collectedCrystal
    },
    remainingDebris:
      remainingMetal > 0 || remainingCrystal > 0
        ? {
            metal: remainingMetal,
            crystal: remainingCrystal
          }
        : null
  }
}

/**
 * 远征事件类型
 */
export type ExpeditionEventType = 'resources' | 'darkMatter' | 'fleet' | 'nothing' | 'pirates' | 'aliens'

/**
 * 远征结果
 */
export interface ExpeditionResult {
  eventType: ExpeditionEventType
  resources?: Partial<Resources>
  fleet?: Partial<Fleet>
  fleetLost?: Partial<Fleet>
  message: string
}

/**
 * 处理远征任务到达
 * 远征任务会随机触发各种事件，基于探险区域配置
 */
export const processExpeditionArrival = (mission: FleetMission): ExpeditionResult => {
  // 获取探险区域配置，默认为近空区域
  const zone = mission.expeditionZone || ExpeditionZone.NearSpace
  const zoneConfig = EXPEDITION_ZONES[zone]

  // 计算舰队总货舱容量
  let totalCargoCapacity = 0
  for (const [shipType, count] of Object.entries(mission.fleet)) {
    if (count > 0) {
      const shipConfig = getShipCargoCapacity(shipType as ShipType)
      totalCargoCapacity += shipConfig * count
    }
  }

  // 根据区域配置的概率计算随机事件
  const random = Math.random() * 100
  const probs = zoneConfig.probabilities
  let result: ExpeditionResult

  // 累积概率阈值
  const resourceThreshold = probs.resources
  const darkMatterThreshold = resourceThreshold + probs.darkMatter
  const fleetThreshold = darkMatterThreshold + probs.fleet
  const piratesThreshold = fleetThreshold + probs.pirates
  const aliensThreshold = piratesThreshold + probs.aliens

  if (random < resourceThreshold) {
    // 发现资源 - 大幅提升奖励
    const baseMultiplier = 0.3 + Math.random() * 0.5 // 30%-80% 的货舱容量
    const resourceMultiplier = baseMultiplier * zoneConfig.resourceMultiplier
    const resourceAmount = Math.floor(totalCargoCapacity * resourceMultiplier)
    const metalAmount = Math.floor(resourceAmount * 0.5)
    const crystalAmount = Math.floor(resourceAmount * 0.35)
    const deuteriumAmount = Math.floor(resourceAmount * 0.15)

    mission.cargo.metal += metalAmount
    mission.cargo.crystal += crystalAmount
    mission.cargo.deuterium += deuteriumAmount

    result = {
      eventType: 'resources',
      resources: { metal: metalAmount, crystal: crystalAmount, deuterium: deuteriumAmount, darkMatter: 0, energy: 0 },
      message: 'expedition.foundResources'
    }
  } else if (random < darkMatterThreshold) {
    // 发现暗物质 - 大幅提升奖励
    const baseDarkMatter = 200 + Math.random() * 500 // 200-700 暗物质
    const darkMatterAmount = Math.floor(baseDarkMatter * zoneConfig.darkMatterMultiplier)
    mission.cargo.darkMatter += darkMatterAmount

    result = {
      eventType: 'darkMatter',
      resources: { metal: 0, crystal: 0, deuterium: 0, darkMatter: darkMatterAmount, energy: 0 },
      message: 'expedition.foundDarkMatter'
    }
  } else if (random < fleetThreshold) {
    // 发现废弃舰船
    const foundFleet: Partial<Fleet> = {}
    // 高级区域可以发现更多种类的舰船
    const possibleShips: ShipType[] =
      zone === ExpeditionZone.DangerousNebula
        ? [ShipType.LightFighter, ShipType.HeavyFighter, ShipType.SmallCargo, ShipType.LargeCargo, ShipType.Cruiser, ShipType.Battleship]
        : zone === ExpeditionZone.UnchartedSpace
        ? [ShipType.LightFighter, ShipType.HeavyFighter, ShipType.SmallCargo, ShipType.LargeCargo, ShipType.Cruiser]
        : [ShipType.LightFighter, ShipType.HeavyFighter, ShipType.SmallCargo, ShipType.LargeCargo]

    const shipTypeIndex = Math.floor(Math.random() * possibleShips.length)
    const shipType = possibleShips[shipTypeIndex] ?? ShipType.LightFighter
    const baseCount = 3 + Math.random() * 12 // 3-15 艘
    const count = Math.floor(baseCount * zoneConfig.fleetFindMultiplier)
    foundFleet[shipType] = count

    // 将发现的舰船添加到任务舰队中
    mission.fleet[shipType] = (mission.fleet[shipType] || 0) + count

    result = {
      eventType: 'fleet',
      fleet: foundFleet,
      message: 'expedition.foundFleet'
    }
  } else if (random < piratesThreshold) {
    // 遭遇海盗（损失部分舰队）
    const fleetLost: Partial<Fleet> = {}
    let hasLoss = false
    const lossChance = Math.min(0.3 * zoneConfig.dangerMultiplier, 0.9) // 危险区域损失概率更高，上限90%

    for (const [shipType, count] of Object.entries(mission.fleet)) {
      if (count > 0 && Math.random() < lossChance) {
        const baseLossRate = Math.min(0.1 * zoneConfig.dangerMultiplier, 0.5) // 危险区域损失比例更高，上限50%
        const lossCount = Math.max(1, Math.floor(count * baseLossRate))
        const actualLoss = Math.min(lossCount, count)
        fleetLost[shipType as ShipType] = actualLoss
        mission.fleet[shipType as ShipType] = count - actualLoss
        hasLoss = true
      }
    }

    result = {
      eventType: 'pirates',
      fleetLost: hasLoss ? fleetLost : undefined,
      message: hasLoss ? 'expedition.piratesAttack' : 'expedition.piratesEscaped'
    }
  } else if (random < aliensThreshold) {
    // 遭遇外星人（损失更多舰队）
    const fleetLost: Partial<Fleet> = {}
    let hasLoss = false
    const lossChance = Math.min(0.5 * zoneConfig.dangerMultiplier, 0.95) // 危险区域损失概率更高，上限95%

    for (const [shipType, count] of Object.entries(mission.fleet)) {
      if (count > 0 && Math.random() < lossChance) {
        const baseLossRate = Math.min(0.2 * zoneConfig.dangerMultiplier, 0.6) // 危险区域损失比例更高，上限60%
        const lossCount = Math.max(1, Math.floor(count * baseLossRate))
        const actualLoss = Math.min(lossCount, count)
        fleetLost[shipType as ShipType] = actualLoss
        mission.fleet[shipType as ShipType] = count - actualLoss
        hasLoss = true
      }
    }

    result = {
      eventType: 'aliens',
      fleetLost: hasLoss ? fleetLost : undefined,
      message: hasLoss ? 'expedition.aliensAttack' : 'expedition.aliensEscaped'
    }
  } else {
    // 什么都没发现
    result = {
      eventType: 'nothing',
      message: 'expedition.nothing'
    }
  }

  mission.status = 'returning'
  return result
}

/**
 * 获取舰船货舱容量
 */
const getShipCargoCapacity = (shipType: ShipType): number => {
  const cargoCapacities: Record<ShipType, number> = {
    [ShipType.LightFighter]: 50,
    [ShipType.HeavyFighter]: 100,
    [ShipType.Cruiser]: 800,
    [ShipType.Battleship]: 1500,
    [ShipType.Battlecruiser]: 750,
    [ShipType.Bomber]: 500,
    [ShipType.Destroyer]: 2000,
    [ShipType.SmallCargo]: 5000,
    [ShipType.LargeCargo]: 25000,
    [ShipType.ColonyShip]: 7500,
    [ShipType.Recycler]: 20000,
    [ShipType.EspionageProbe]: 5,
    [ShipType.SolarSatellite]: 0,
    [ShipType.DarkMatterHarvester]: 1000,
    [ShipType.Deathstar]: 1000000
  }
  return cargoCapacities[shipType] || 0
}

/**
 * 计算行星毁灭概率
 */
export const calculateDestructionChance = (deathstarCount: number, planetaryShieldCount: number, planetDefensePower: number): number => {
  // 基础摧毁概率：每艘死星 10%
  let baseChance = deathstarCount * 10

  // 行星护盾减少概率：每个护盾 -5%
  const shieldReduction = planetaryShieldCount * 5

  // 防御力量减少概率：每 10000 防御力量 -1%
  const defensePowerReduction = Math.floor(planetDefensePower / 10000)

  // 最终概率
  let finalChance = baseChance - shieldReduction - defensePowerReduction

  // 限制在 1% - 99% 之间
  return Math.max(1, Math.min(99, finalChance))
}

/**
 * 计算星球总防御力量
 */
export const calculatePlanetDefensePower = (fleet: Partial<Fleet>, defense: Partial<Record<DefenseType, number>>): number => {
  let totalPower = 0

  // 计算舰队力量
  Object.entries(fleet).forEach(([_shipType, count]) => {
    if (count > 0) {
      // 简单估算：每艘船的攻击力 + 护盾 + 装甲 / 10
      totalPower += count * 100 // 简化计算
    }
  })

  // 计算防御设施力量
  Object.entries(defense).forEach(([_defenseType, count]) => {
    if (count > 0) {
      totalPower += count * 50 // 简化计算
    }
  })

  return totalPower
}

/**
 * 处理行星/月球毁灭任务到达
 * OGame规则：
 * - 月球销毁概率 = (100 - √diameter) × √deathstars
 * - 死星反向销毁概率 = √diameter / 2
 * - 两个概率独立判定
 */

/**
 * 毁灭任务失败原因
 */
export type DestroyFailReason = 'targetNotFound' | 'ownPlanet' | 'noDeathstar' | 'chanceFailed'

/**
 * 销毁任务结果
 */
export interface DestroyResult {
  success: boolean // 目标是否被销毁
  destructionChance: number // 销毁概率
  planetId?: string // 被销毁的星球/月球ID
  deathstarsLost: boolean // 死星是否被反向销毁
  deathstarDestructionChance: number // 死星反向销毁概率
  isMoon: boolean // 目标是否为月球
  failReason?: DestroyFailReason // 失败原因
}

export const processDestroyArrival = (mission: FleetMission, targetPlanet: Planet | undefined, attacker: Player): DestroyResult => {
  if (!targetPlanet) {
    mission.status = 'returning'
    return {
      success: false,
      destructionChance: 0,
      deathstarsLost: false,
      deathstarDestructionChance: 0,
      isMoon: false,
      failReason: 'targetNotFound'
    }
  }
  if (targetPlanet.ownerId === attacker.id) {
    mission.status = 'returning'
    return {
      success: false,
      destructionChance: 0,
      deathstarsLost: false,
      deathstarDestructionChance: 0,
      isMoon: targetPlanet.isMoon || false,
      failReason: 'ownPlanet'
    }
  }

  // 检查是否有死星
  const deathstarCount = mission.fleet[ShipType.Deathstar] || 0
  if (deathstarCount === 0) {
    mission.status = 'returning'
    return {
      success: false,
      destructionChance: 0,
      deathstarsLost: false,
      deathstarDestructionChance: 0,
      isMoon: targetPlanet.isMoon || false,
      failReason: 'noDeathstar'
    }
  }

  // 根据目标类型使用不同的销毁逻辑
  if (targetPlanet.isMoon) {
    // 月球销毁使用 OGame 公式
    const result = moonLogic.tryDestroyMoon(targetPlanet, deathstarCount)

    // 如果死星被反向销毁，从任务舰队中移除
    if (result.deathstarsDestroyed) {
      mission.fleet[ShipType.Deathstar] = 0
    }

    mission.status = 'returning'

    return {
      success: result.moonDestroyed,
      destructionChance: result.moonDestructionChance,
      planetId: result.moonDestroyed ? targetPlanet.id : undefined,
      deathstarsLost: result.deathstarsDestroyed,
      deathstarDestructionChance: result.deathstarDestructionChance,
      isMoon: true,
      failReason: result.moonDestroyed ? undefined : 'chanceFailed'
    }
  } else {
    // 行星销毁使用原有逻辑
    const planetaryShieldCount = targetPlanet.defense[DefenseType.PlanetaryShield] || 0
    const defensePower = calculatePlanetDefensePower(targetPlanet.fleet, targetPlanet.defense)
    const destructionChance = calculateDestructionChance(deathstarCount, planetaryShieldCount, defensePower)

    const randomValue = Math.random() * 100
    const success = randomValue < destructionChance

    mission.status = 'returning'

    return {
      success,
      destructionChance,
      planetId: success ? targetPlanet.id : undefined,
      deathstarsLost: false,
      deathstarDestructionChance: 0,
      isMoon: false,
      failReason: success ? undefined : 'chanceFailed'
    }
  }
}

/**
 * 处理舰队任务返回
 */
export const processFleetReturn = (
  mission: FleetMission,
  originPlanet: Planet,
  technologies: Record<TechnologyType, number>,
  storageCapacityBonus: number
): void => {
  // 舰船返回 - 使用安全添加函数
  fleetStorageLogic.addFleetSafely(originPlanet, mission.fleet, technologies)
  // 如果舰队仓储溢出，超出部分会丢失（这是合理的惩罚）

  // 资源返回（掠夺物或运输货物）- 使用安全添加函数
  resourceLogic.addResourcesSafely(originPlanet, mission.cargo, storageCapacityBonus)
  // 如果资源仓储溢出，超出部分会丢失（这是合理的惩罚）
}

/**
 * 更新舰队任务状态
 */
export const updateFleetMissions = async (
  missions: FleetMission[],
  planets: Map<string, Planet>,
  debrisFields: Map<string, DebrisField>,
  attacker: Player,
  defender: Player | null,
  now: number,
  allNpcs?: NPC[],
  locale?: Locale
): Promise<{
  completedMissions: string[]
  battleReports: BattleResult[]
  spyReports: SpyReport[]
  newColonies: Planet[]
  newMoons: Planet[]
  newDebrisFields: DebrisField[]
  updatedDebrisFields: DebrisField[]
  removedDebrisFieldIds: string[]
  destroyedPlanetIds: string[]
}> => {
  const completedMissions: string[] = []
  const battleReports: BattleResult[] = []
  const spyReports: SpyReport[] = []
  const newColonies: Planet[] = []
  const newMoons: Planet[] = []
  const newDebrisFields: DebrisField[] = []
  const updatedDebrisFields: DebrisField[] = []
  const removedDebrisFieldIds: string[] = []
  const destroyedPlanetIds: string[] = []

  // 获取所有星球列表（用于月球生成检查）
  const allPlanets = Array.from(planets.values())
  // 计算军官加成（用于资源容量计算）
  const bonuses = officerLogic.calculateActiveBonuses(attacker.officers, now)
  const storageCapacityBonus = bonuses.storageCapacityBonus

  // 使用 for...of 以支持 await
  for (const mission of missions) {
    const originPlanet = attacker.planets.find(p => p.id === mission.originPlanetId)

    if (mission.status === 'outbound' && now >= mission.arrivalTime) {
      // 任务到达目标
      const targetKey = `${mission.targetPosition.galaxy}:${mission.targetPosition.system}:${mission.targetPosition.position}`
      const targetPlanet = planets.get(targetKey)

      switch (mission.missionType) {
        case MissionType.Transport:
          processTransportArrival(mission, targetPlanet, attacker, allNpcs, locale, storageCapacityBonus)
          break

        case MissionType.Attack: {
          const attackResult = await processAttackArrival(mission, targetPlanet, attacker, defender, allPlanets)
          if (attackResult) {
            battleReports.push(attackResult.battleResult)
            if (attackResult.moon) {
              newMoons.push(attackResult.moon)
              // 将月球添加到planets map中
              const moonKey = `${attackResult.moon.position.galaxy}:${attackResult.moon.position.system}:${attackResult.moon.position.position}`
              planets.set(moonKey, attackResult.moon)
            }
            if (attackResult.debrisField) {
              // 检查该位置是否已存在残骸场
              const existingDebris = debrisFields.get(attackResult.debrisField.id)
              if (existingDebris) {
                // 累加残骸资源
                const updatedDebris: DebrisField = {
                  ...existingDebris,
                  resources: {
                    metal: existingDebris.resources.metal + attackResult.debrisField.resources.metal,
                    crystal: existingDebris.resources.crystal + attackResult.debrisField.resources.crystal
                  }
                }
                debrisFields.set(attackResult.debrisField.id, updatedDebris)
                updatedDebrisFields.push(updatedDebris)
              } else {
                // 新建残骸场
                debrisFields.set(attackResult.debrisField.id, attackResult.debrisField)
                newDebrisFields.push(attackResult.debrisField)
              }
            }
          }
          break
        }

        case MissionType.Colonize:
          const colonizeResult = processColonizeArrival(mission, targetPlanet, attacker)
          if (colonizeResult.success && colonizeResult.planet) {
            newColonies.push(colonizeResult.planet)
            planets.set(targetKey, colonizeResult.planet)
          }
          break

        case MissionType.Spy:
          const spyResult = processSpyArrival(mission, targetPlanet, attacker, defender)
          if (spyResult.success && spyResult.report) {
            spyReports.push(spyResult.report)
          }
          break

        case MissionType.Deploy:
          const deployed = processDeployArrival(mission, targetPlanet, attacker.id, attacker.technologies)
          if (deployed.success && !deployed.overflow) {
            completedMissions.push(mission.id)
          }
          break

        case MissionType.Recycle:
          const debrisId = `debris_${mission.targetPosition.galaxy}_${mission.targetPosition.system}_${mission.targetPosition.position}`
          const debrisField = debrisFields.get(debrisId)
          const recycleResult = processRecycleArrival(mission, debrisField, attacker, allNpcs)
          if (recycleResult.success && recycleResult.collectedResources) {
            if (recycleResult.remainingDebris) {
              // 更新残骸场
              const updatedDebris: DebrisField = {
                ...debrisField!,
                resources: recycleResult.remainingDebris
              }
              debrisFields.set(debrisId, updatedDebris)
              updatedDebrisFields.push(updatedDebris)
            } else {
              // 残骸场已被完全收集，删除
              debrisFields.delete(debrisId)
              removedDebrisFieldIds.push(debrisId)
            }
          }
          break

        case MissionType.Destroy:
          const destroyResult = processDestroyArrival(mission, targetPlanet, attacker)
          if (destroyResult.success && destroyResult.planetId) {
            // 星球被摧毁
            destroyedPlanetIds.push(destroyResult.planetId)

            // 处理外交关系（如果目标是NPC星球）
            if (targetPlanet && targetPlanet.ownerId && allNpcs && locale) {
              const planetOwner = allNpcs.find(npc => npc.id === targetPlanet.ownerId)
              if (planetOwner) {
                diplomaticLogic.handlePlanetDestructionReputation(attacker, targetPlanet, planetOwner, allNpcs, locale)
              }
            }

            planets.delete(targetKey)
          }
          break
      }
    }

    if (mission.status === 'returning' && mission.returnTime && now >= mission.returnTime) {
      // 舰队返回
      if (originPlanet) {
        processFleetReturn(mission, originPlanet, attacker.technologies, storageCapacityBonus)
      }
      completedMissions.push(mission.id)
    }
  }

  return {
    completedMissions,
    battleReports,
    spyReports,
    newColonies,
    newMoons,
    newDebrisFields,
    updatedDebrisFields,
    removedDebrisFieldIds,
    destroyedPlanetIds
  }
}

/**
 * 召回舰队
 */
export const recallFleetMission = (mission: FleetMission, now: number): boolean => {
  if (mission.status !== 'outbound') return false

  const elapsedTime = now - mission.departureTime

  // 如果还在飞行途中，立即返回
  if (now < mission.arrivalTime) {
    mission.status = 'returning'
    mission.returnTime = now + elapsedTime // 返回时间等于已飞行的时间
    return true
  }

  return false
}
