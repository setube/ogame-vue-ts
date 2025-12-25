import type { NPC, Planet, Player } from '@/types/game'
import { TechnologyType, BuildingType, ShipType, DefenseType, NPCAIType } from '@/types/game'
import { BUILDINGS, SHIPS, TECHNOLOGIES } from '@/config/gameConfig'
import * as buildingLogic from './buildingLogic'
import * as researchLogic from './researchLogic'

/**
 * NPC成长系统
 *
 * 策略说明:
 * - Easy: NPC实力保持在玩家平均实力的60%左右，被动成长
 * - Medium: NPC实力保持在玩家平均实力的80%左右，半主动成长
 * - Hard: NPC实力保持在玩家平均实力的100-120%，主动成长
 */

// 简化的游戏状态接口（用于NPC成长系统）
export interface NPCGrowthGameState {
  planets: Planet[] // 所有星球（包括玩家和NPC的）
  player: Player // 玩家数据
  npcs: NPC[] // 所有NPC
}

// NPC成长配置（旧版，保留用于兼容）
export const NPC_GROWTH_CONFIG = {
  easy: {
    powerRatio: 0.6, // 实力比例(相对玩家)
    checkInterval: 300, // 检查间隔(秒) - 5分钟
    resourceGrowthRate: 0.5, // 资源增长速率系数
    buildingGrowthSpeed: 0.5, // 建筑升级速度系数
    techGrowthSpeed: 0.5 // 科技研究速度系数
  },
  medium: {
    powerRatio: 0.8,
    checkInterval: 180, // 3分钟
    resourceGrowthRate: 0.8,
    buildingGrowthSpeed: 0.8,
    techGrowthSpeed: 0.8
  },
  hard: {
    powerRatio: 1.1,
    checkInterval: 120, // 2分钟
    resourceGrowthRate: 1.2,
    buildingGrowthSpeed: 1.0,
    techGrowthSpeed: 1.0
  }
} as const

// 动态难度配置（基于玩家积分）
export interface DynamicDifficultyConfig {
  powerRatio: number
  checkInterval: number
  resourceGrowthRate: number
  buildingGrowthSpeed: number
  techGrowthSpeed: number
}

/**
 * 根据玩家积分计算动态难度配置
 */
export const calculateDynamicDifficulty = (playerPoints: number): DynamicDifficultyConfig => {
  // 积分区间和对应的难度参数
  if (playerPoints < 1000) {
    // 新手期：0-1,000分
    // NPC保持30-50%实力，给予充分发展空间，但资源增长速度加快
    const ratio = 0.3 + (playerPoints / 1000) * 0.2
    return {
      powerRatio: ratio,
      checkInterval: 300, // 5分钟
      resourceGrowthRate: 0.8, // 从0.4提升到0.8，确保NPC有足够资源发育
      buildingGrowthSpeed: 0.6, // 从0.4提升到0.6
      techGrowthSpeed: 0.6 // 从0.4提升到0.6
    }
  } else if (playerPoints < 5000) {
    // 初级期：1,000-5,000分
    // NPC保持50-70%实力，逐渐增加挑战
    const ratio = 0.5 + ((playerPoints - 1000) / 4000) * 0.2
    return {
      powerRatio: ratio,
      checkInterval: 240, // 4分钟
      resourceGrowthRate: 1.0, // 从0.6提升到1.0，与玩家资源产出相当
      buildingGrowthSpeed: 0.8, // 从0.6提升到0.8
      techGrowthSpeed: 0.8 // 从0.6提升到0.8
    }
  } else if (playerPoints < 20000) {
    // 中级期：5,000-20,000分
    // NPC保持70-90%实力，持续挑战
    const ratio = 0.7 + ((playerPoints - 5000) / 15000) * 0.2
    return {
      powerRatio: ratio,
      checkInterval: 180, // 3分钟
      resourceGrowthRate: 0.8,
      buildingGrowthSpeed: 0.8,
      techGrowthSpeed: 0.8
    }
  } else if (playerPoints < 50000) {
    // 高级期：20,000-50,000分
    // NPC保持90-110%实力，与玩家势均力敌
    const ratio = 0.9 + ((playerPoints - 20000) / 30000) * 0.2
    return {
      powerRatio: ratio,
      checkInterval: 150, // 2.5分钟
      resourceGrowthRate: 1.0,
      buildingGrowthSpeed: 1.0,
      techGrowthSpeed: 1.0
    }
  } else {
    // 专家期：50,000+分
    // NPC保持110-130%实力，超越玩家
    const ratio = Math.min(1.3, 1.1 + ((playerPoints - 50000) / 50000) * 0.2)
    return {
      powerRatio: ratio,
      checkInterval: 120, // 2分钟
      resourceGrowthRate: 1.2,
      buildingGrowthSpeed: 1.2,
      techGrowthSpeed: 1.2
    }
  }
}

/**
 * 计算玩家平均实力
 */
export const calculatePlayerAveragePower = (
  gameState: NPCGrowthGameState
): {
  avgBuildingLevel: number
  avgTechLevel: number
  totalFleetPower: number
  totalResources: number
} => {
  // 筛选出玩家的星球
  const playerPlanets = gameState.planets.filter(p => p.ownerId === gameState.player.id)

  if (playerPlanets.length === 0) {
    return {
      avgBuildingLevel: 0,
      avgTechLevel: 0,
      totalFleetPower: 0,
      totalResources: 0
    }
  }

  // 计算平均建筑等级
  let totalBuildingLevels = 0
  let buildingCount = 0
  playerPlanets.forEach(planet => {
    Object.values(planet.buildings).forEach(level => {
      totalBuildingLevels += level
      buildingCount++
    })
  })

  // 计算平均科技等级
  const techLevels = Object.values(gameState.player.technologies)
  const avgTechLevel = techLevels.length > 0 ? techLevels.reduce((sum, level) => sum + level, 0) / techLevels.length : 0

  // 计算总舰队战力
  let totalFleetPower = 0
  playerPlanets.forEach(planet => {
    Object.entries(planet.fleet).forEach(([shipType, count]) => {
      const shipConfig = SHIPS[shipType as ShipType]
      const power = shipConfig.attack + shipConfig.shield + shipConfig.armor / 10
      totalFleetPower += power * (count as number)
    })
  })

  // 计算总资源
  const totalResources = playerPlanets.reduce(
    (sum, planet) => sum + planet.resources.metal + planet.resources.crystal + planet.resources.deuterium,
    0
  )

  return {
    avgBuildingLevel: buildingCount > 0 ? totalBuildingLevels / buildingCount : 0,
    avgTechLevel,
    totalFleetPower,
    totalResources
  }
}

/**
 * 计算NPC当前实力
 */
export const calculateNPCPower = (
  npc: NPC
): {
  avgBuildingLevel: number
  avgTechLevel: number
  totalFleetPower: number
  totalResources: number
} => {
  // 计算平均建筑等级
  let totalBuildingLevels = 0
  let buildingCount = 0
  npc.planets.forEach(planet => {
    Object.values(planet.buildings).forEach(level => {
      totalBuildingLevels += level
      buildingCount++
    })
  })

  // 计算平均科技等级
  const techLevels = Object.values(npc.technologies)
  const avgTechLevel = techLevels.length > 0 ? techLevels.reduce((sum, level) => sum + level, 0) / techLevels.length : 0

  // 计算总舰队战力
  let totalFleetPower = 0
  npc.planets.forEach(planet => {
    Object.entries(planet.fleet).forEach(([shipType, count]) => {
      const shipConfig = SHIPS[shipType as ShipType]
      const power = shipConfig.attack + shipConfig.shield + shipConfig.armor / 10
      totalFleetPower += power * (count as number)
    })
  })

  // 计算总资源
  const totalResources = npc.planets.reduce(
    (sum, planet) => sum + planet.resources.metal + planet.resources.crystal + planet.resources.deuterium,
    0
  )

  return {
    avgBuildingLevel: buildingCount > 0 ? totalBuildingLevels / buildingCount : 0,
    avgTechLevel,
    totalFleetPower,
    totalResources
  }
}

/**
 * 自动升级NPC建筑
 */
export const autoUpgradeNPCBuildings = (npc: NPC): void => {
  const planet = npc.planets[0]
  if (!planet) return

  // 优先级队列：资源建筑 > 设施建筑 > 其他
  const priorityBuildings: BuildingType[] = [
    BuildingType.MetalMine,
    BuildingType.CrystalMine,
    BuildingType.DeuteriumSynthesizer,
    BuildingType.SolarPlant,
    BuildingType.RoboticsFactory,
    BuildingType.Shipyard,
    BuildingType.ResearchLab,
    BuildingType.MetalStorage,
    BuildingType.CrystalStorage,
    BuildingType.DeuteriumTank,
    BuildingType.DarkMatterCollector
  ]

  // 尝试升级建筑
  for (const buildingType of priorityBuildings) {
    const currentLevel = planet.buildings[buildingType] || 0
    const targetLevel = currentLevel + 1

    // 检查是否达到最大等级
    const buildingConfig = BUILDINGS[buildingType]
    if (buildingConfig.maxLevel && currentLevel >= buildingConfig.maxLevel) {
      continue
    }

    // 计算升级成本
    const cost = buildingLogic.calculateBuildingCost(buildingType, targetLevel)

    // 检查资源是否足够
    if (
      planet.resources.metal >= cost.metal &&
      planet.resources.crystal >= cost.crystal &&
      planet.resources.deuterium >= cost.deuterium &&
      planet.resources.darkMatter >= cost.darkMatter
    ) {
      // 扣除资源
      planet.resources.metal -= cost.metal
      planet.resources.crystal -= cost.crystal
      planet.resources.deuterium -= cost.deuterium
      planet.resources.darkMatter -= cost.darkMatter

      // 直接升级(NPC不需要等待建造时间)
      planet.buildings[buildingType] = targetLevel

      // 每次只升级一个建筑，避免一次性消耗太多资源
      break
    }
  }
}

/**
 * 自动研究NPC科技
 */
export const autoResearchNPCTechnologies = (npc: NPC): void => {
  const planet = npc.planets[0]
  if (!planet) return

  // 优先级队列：战斗科技 > 驱动科技 > 其他
  const priorityTechs: TechnologyType[] = [
    TechnologyType.EnergyTechnology,
    TechnologyType.ComputerTechnology,
    TechnologyType.WeaponsTechnology,
    TechnologyType.ShieldingTechnology,
    TechnologyType.ArmourTechnology,
    TechnologyType.CombustionDrive,
    TechnologyType.ImpulseDrive,
    TechnologyType.HyperspaceDrive,
    TechnologyType.LaserTechnology,
    TechnologyType.IonTechnology,
    TechnologyType.PlasmaTechnology,
    TechnologyType.Astrophysics,
    TechnologyType.EspionageTechnology
  ]

  // 尝试研究科技
  for (const techType of priorityTechs) {
    const currentLevel = npc.technologies[techType] || 0
    const targetLevel = currentLevel + 1

    // 检查是否达到最大等级
    const techConfig = TECHNOLOGIES[techType]
    if (techConfig.maxLevel && currentLevel >= techConfig.maxLevel) {
      continue
    }

    // 计算研究成本
    const cost = researchLogic.calculateTechnologyCost(techType, targetLevel)

    // 检查资源是否足够
    if (
      planet.resources.metal >= cost.metal &&
      planet.resources.crystal >= cost.crystal &&
      planet.resources.deuterium >= cost.deuterium &&
      planet.resources.darkMatter >= cost.darkMatter
    ) {
      // 扣除资源
      planet.resources.metal -= cost.metal
      planet.resources.crystal -= cost.crystal
      planet.resources.deuterium -= cost.deuterium
      planet.resources.darkMatter -= cost.darkMatter

      // 直接升级(NPC不需要等待研究时间)
      npc.technologies[techType] = targetLevel

      // 每次只研究一个科技
      break
    }
  }
}

/**
 * 自动建造NPC舰队
 */
export const autoBuildNPCFleet = (npc: NPC): void => {
  const planet = npc.planets[0]
  if (!planet) return

  // 根据难度决定舰队组成
  const fleetComposition: { shipType: ShipType; priority: number }[] = [
    { shipType: ShipType.LightFighter, priority: 1 },
    { shipType: ShipType.HeavyFighter, priority: 2 },
    { shipType: ShipType.Cruiser, priority: 3 },
    { shipType: ShipType.Battleship, priority: 4 },
    { shipType: ShipType.SmallCargo, priority: 5 },
    { shipType: ShipType.LargeCargo, priority: 6 },
    { shipType: ShipType.Recycler, priority: 7 },
    { shipType: ShipType.EspionageProbe, priority: 8 }
  ]

  // 按优先级排序
  fleetComposition.sort((a, b) => a.priority - b.priority)

  // 尝试建造舰船
  for (const { shipType } of fleetComposition) {
    const shipConfig = SHIPS[shipType]

    // 检查建造需求
    const canBuild = Object.entries(shipConfig.requirements || {}).every(([reqType, reqLevel]) => {
      if (reqType in BuildingType) {
        return (planet.buildings[reqType as BuildingType] || 0) >= reqLevel
      }
      if (reqType in TechnologyType) {
        return (npc.technologies[reqType as TechnologyType] || 0) >= reqLevel
      }
      return false
    })

    if (!canBuild) continue

    // 根据难度和当前资源决定建造数量（防止除零）
    const metalAffordable = shipConfig.cost.metal > 0 ? planet.resources.metal / shipConfig.cost.metal : Infinity
    const crystalAffordable = shipConfig.cost.crystal > 0 ? planet.resources.crystal / shipConfig.cost.crystal : Infinity
    const deuteriumAffordable = shipConfig.cost.deuterium > 0 ? planet.resources.deuterium / shipConfig.cost.deuterium : Infinity
    const darkMatterAffordable = shipConfig.cost.darkMatter > 0 ? planet.resources.darkMatter / shipConfig.cost.darkMatter : Infinity

    const maxAffordable = Math.floor(Math.min(metalAffordable, crystalAffordable, deuteriumAffordable, darkMatterAffordable))

    // 防止NaN或Infinity（如果所有成本都为0的极端情况）
    if (!Number.isFinite(maxAffordable) || maxAffordable <= 0) continue

    // 建造数量：简单1-5艘，中等5-10艘，困难10-20艘
    const buildCount = Math.min(maxAffordable, npc.difficulty === 'easy' ? 5 : npc.difficulty === 'medium' ? 10 : 20)

    if (buildCount > 0) {
      // 扣除资源
      planet.resources.metal -= shipConfig.cost.metal * buildCount
      planet.resources.crystal -= shipConfig.cost.crystal * buildCount
      planet.resources.deuterium -= shipConfig.cost.deuterium * buildCount
      planet.resources.darkMatter -= shipConfig.cost.darkMatter * buildCount

      // 添加舰船
      planet.fleet[shipType] = (planet.fleet[shipType] || 0) + buildCount

      // 建造一批后退出
      break
    }
  }
}

/**
 * 为NPC生成资源(模拟资源生产)
 */
export const generateNPCResources = (npc: NPC, deltaSeconds: number, config: DynamicDifficultyConfig, gameSpeed: number = 1): void => {
  const planet = npc.planets[0]
  if (!planet) return

  // 基于建筑等级计算资源产量
  const metalMineLevel = planet.buildings[BuildingType.MetalMine] || 0
  const crystalMineLevel = planet.buildings[BuildingType.CrystalMine] || 0
  const deuteriumLevel = planet.buildings[BuildingType.DeuteriumSynthesizer] || 0
  const darkMatterLevel = planet.buildings[BuildingType.DarkMatterCollector] || 0

  // 简化的资源产量计算(每秒产量) - 提升3倍让NPC更富有
  const metalProduction = 90 * metalMineLevel * Math.pow(1.1, metalMineLevel) * config.resourceGrowthRate
  const crystalProduction = 60 * crystalMineLevel * Math.pow(1.1, crystalMineLevel) * config.resourceGrowthRate
  const deuteriumProduction = 30 * deuteriumLevel * Math.pow(1.1, deuteriumLevel) * config.resourceGrowthRate
  const darkMatterProduction = ((75 * darkMatterLevel * Math.pow(1.5, darkMatterLevel)) / 3600) * config.resourceGrowthRate

  // 应用游戏速度倍率到时间
  const effectiveDeltaSeconds = deltaSeconds * gameSpeed

  // 增加资源
  planet.resources.metal += metalProduction * effectiveDeltaSeconds
  planet.resources.crystal += crystalProduction * effectiveDeltaSeconds
  planet.resources.deuterium += deuteriumProduction * effectiveDeltaSeconds
  planet.resources.darkMatter += darkMatterProduction * effectiveDeltaSeconds

  // 确保不超过存储上限
  const metalStorage = planet.buildings[BuildingType.MetalStorage] || 0
  const crystalStorage = planet.buildings[BuildingType.CrystalStorage] || 0
  const deuteriumStorage = planet.buildings[BuildingType.DeuteriumTank] || 0
  const darkMatterStorage = planet.buildings[BuildingType.DarkMatterTank] || 0

  planet.resources.metal = Math.min(planet.resources.metal, 10000 * Math.pow(2, metalStorage))
  planet.resources.crystal = Math.min(planet.resources.crystal, 10000 * Math.pow(2, crystalStorage))
  planet.resources.deuterium = Math.min(planet.resources.deuterium, 10000 * Math.pow(2, deuteriumStorage))
  planet.resources.darkMatter = Math.min(planet.resources.darkMatter, 1000 * Math.pow(2, darkMatterStorage))
}

/**
 * 主NPC成长更新函数
 * 应该在游戏循环中定期调用
 */
export const updateNPCGrowth = (npc: NPC, gameState: NPCGrowthGameState, deltaSeconds: number, gameSpeed: number = 1): void => {
  // 使用动态难度（基于玩家积分）而不是固定难度
  const config = calculateDynamicDifficulty(gameState.player.points)

  // 1. 持续生成资源（应用游戏速度倍率）
  generateNPCResources(npc, deltaSeconds, config, gameSpeed)

  // 2. 定期评估并调整实力(使用静态计数器或时间戳)
  const now = Date.now()
  const lastGrowthCheck = (npc as any).lastGrowthCheck || 0

  if (now - lastGrowthCheck >= config.checkInterval * 1000) {
    ;(npc as any).lastGrowthCheck = now

    // 计算玩家平均实力
    const playerPower = calculatePlayerAveragePower(gameState)
    const npcPower = calculateNPCPower(npc)

    // 计算目标实力
    const targetBuildingLevel = playerPower.avgBuildingLevel * config.powerRatio
    const targetTechLevel = playerPower.avgTechLevel * config.powerRatio
    const targetFleetPower = playerPower.totalFleetPower * config.powerRatio

    // 3. 如果实力不足，进行升级
    if (npcPower.avgBuildingLevel < targetBuildingLevel) {
      autoUpgradeNPCBuildings(npc)
    }

    if (npcPower.avgTechLevel < targetTechLevel) {
      autoResearchNPCTechnologies(npc)
    }

    if (npcPower.totalFleetPower < targetFleetPower) {
      autoBuildNPCFleet(npc)
    }
  }
}

/**
 * 初始化NPC时设置合理的起始实力
 */
export const initializeNPCStartingPower = (
  npc: NPC,
  playerPower: {
    avgBuildingLevel: number
    avgTechLevel: number
    totalFleetPower: number
    totalResources: number
  }
): void => {
  const config = NPC_GROWTH_CONFIG[npc.difficulty]
  const planet = npc.planets[0]
  if (!planet) return

  // 设置起始建筑等级(基于玩家实力)
  const targetBuildingLevel = Math.max(5, Math.floor(playerPower.avgBuildingLevel * config.powerRatio))

  // 设置资源建筑
  planet.buildings[BuildingType.MetalMine] = targetBuildingLevel
  planet.buildings[BuildingType.CrystalMine] = Math.floor(targetBuildingLevel * 0.8)
  planet.buildings[BuildingType.DeuteriumSynthesizer] = Math.floor(targetBuildingLevel * 0.6)
  planet.buildings[BuildingType.SolarPlant] = targetBuildingLevel + 2

  // 设置设施建筑
  planet.buildings[BuildingType.RoboticsFactory] = Math.floor(targetBuildingLevel * 0.5)
  planet.buildings[BuildingType.Shipyard] = Math.floor(targetBuildingLevel * 0.4)
  planet.buildings[BuildingType.ResearchLab] = Math.floor(targetBuildingLevel * 0.4)

  // 设置仓储
  planet.buildings[BuildingType.MetalStorage] = Math.floor(targetBuildingLevel * 0.3)
  planet.buildings[BuildingType.CrystalStorage] = Math.floor(targetBuildingLevel * 0.3)
  planet.buildings[BuildingType.DeuteriumTank] = Math.floor(targetBuildingLevel * 0.3)

  // 设置起始科技等级
  const targetTechLevel = Math.max(3, Math.floor(playerPower.avgTechLevel * config.powerRatio))

  npc.technologies[TechnologyType.EnergyTechnology] = targetTechLevel
  npc.technologies[TechnologyType.ComputerTechnology] = Math.floor(targetTechLevel * 0.8)
  npc.technologies[TechnologyType.WeaponsTechnology] = Math.floor(targetTechLevel * 0.7)
  npc.technologies[TechnologyType.ShieldingTechnology] = Math.floor(targetTechLevel * 0.7)
  npc.technologies[TechnologyType.ArmourTechnology] = Math.floor(targetTechLevel * 0.7)
  npc.technologies[TechnologyType.CombustionDrive] = Math.floor(targetTechLevel * 0.6)

  // 给予起始资源 - 大幅提升以让NPC更富有
  planet.resources.metal = 500000 * config.powerRatio
  planet.resources.crystal = 250000 * config.powerRatio
  planet.resources.deuterium = 100000 * config.powerRatio
  planet.resources.darkMatter = 5000 * config.powerRatio

  // 给予起始舰队（确保NPC能够立即侦查和攻击）
  // 使用平方根函数来平滑舰队数量增长，避免初期过于强大
  const fleetRatio = Math.sqrt(config.powerRatio)

  // 间谍探测器 - 必需，用于侦查玩家
  planet.fleet[ShipType.EspionageProbe] = Math.max(5, Math.floor(10 * fleetRatio))

  // 基础战斗舰队
  planet.fleet[ShipType.LightFighter] = Math.floor(20 * fleetRatio)
  planet.fleet[ShipType.HeavyFighter] = Math.floor(10 * fleetRatio)
  planet.fleet[ShipType.Cruiser] = Math.floor(5 * fleetRatio)

  // 运输和回收舰船
  planet.fleet[ShipType.SmallCargo] = Math.floor(5 * fleetRatio)
  planet.fleet[ShipType.Recycler] = Math.floor(3 * fleetRatio)
}

/**
 * 确保所有NPC都有最低数量的间谍探测器
 * 用于修复旧版本保存的NPC数据
 */
export const ensureNPCSpyProbes = (npcs: NPC[]): void => {
  npcs.forEach(npc => {
    const planet = npc.planets[0]
    if (!planet) return

    // 如果没有舰队数据，初始化
    if (!planet.fleet) {
      planet.fleet = {} as any
    }

    // 检查间谍探测器数量
    const currentProbes = planet.fleet[ShipType.EspionageProbe] || 0

    // 如果没有探测器，根据NPC难度给予基础数量
    if (currentProbes === 0) {
      const config = NPC_GROWTH_CONFIG[npc.difficulty]
      const fleetRatio = Math.sqrt(config.powerRatio)
      planet.fleet[ShipType.EspionageProbe] = Math.max(5, Math.floor(10 * fleetRatio))
    }
  })
}

/**
 * 初始化NPC外交关系网络
 * 为每个NPC随机分配盟友和敌人
 */
export const initializeNPCDiplomacy = (npcs: NPC[]): void => {
  // 确保所有NPC都有空的外交字段
  npcs.forEach(npc => {
    if (!npc.allies) npc.allies = []
    if (!npc.enemies) npc.enemies = []
    if (!npc.relations) npc.relations = {}
  })

  // 为每个NPC随机分配1-2个盟友
  npcs.forEach(npc => {
    // 获取还未建立关系的潜在盟友
    const potentialAllies = npcs.filter(n => n.id !== npc.id && !npc.allies!.includes(n.id) && !n.allies!.includes(npc.id))

    if (potentialAllies.length === 0) return

    // 随机选择1-2个盟友
    const allyCount = Math.min(Math.floor(Math.random() * 2) + 1, potentialAllies.length)

    for (let i = 0; i < allyCount; i++) {
      if (potentialAllies.length === 0) break

      const allyIndex = Math.floor(Math.random() * potentialAllies.length)
      const ally = potentialAllies.splice(allyIndex, 1)[0]

      if (!ally) continue

      // 建立双向盟友关系
      if (!npc.allies!.includes(ally.id)) {
        npc.allies!.push(ally.id)
      }
      if (!ally.allies!.includes(npc.id)) {
        ally.allies!.push(npc.id)
      }
    }
  })
}

// ==================== 距离难度系统 ====================

/**
 * 计算NPC星球到玩家母星的距离
 * 银河系距离权重最大，星系次之，位置最小
 */
export const calculateDistanceToHomeworld = (
  npcPosition: { galaxy: number; system: number; position: number },
  homeworldPosition: { galaxy: number; system: number; position: number }
): number => {
  const galaxyDistance = Math.abs(npcPosition.galaxy - homeworldPosition.galaxy)
  const systemDistance = Math.abs(npcPosition.system - homeworldPosition.system)
  const positionDistance = Math.abs(npcPosition.position - homeworldPosition.position)

  // 银河系跨度权重最大
  return galaxyDistance * 100 + systemDistance * 10 + positionDistance
}

/**
 * 基于距离计算难度等级（1-无限）
 */
export const calculateDifficultyLevel = (distance: number): number => {
  if (distance <= 10) return 1 // 新手
  if (distance <= 30) return 2 // 简单
  if (distance <= 60) return 3 // 普通
  if (distance <= 100) return 4 // 困难
  if (distance <= 200) return 5 // 专家
  if (distance <= 400) return 6 // 大师
  // 超过400继续增长
  return 6 + Math.floor((distance - 400) / 200)
}

/**
 * 距离难度倍率配置
 */
export interface DistanceDifficultyMultipliers {
  buildingMultiplier: number
  techMultiplier: number
  fleetMultiplier: number
  resourceMultiplier: number
  defenseMultiplier: number
}

/**
 * 基于距离计算实力倍率
 * 使用对数增长，确保数值合理
 *
 * 建筑等级上限：30
 * 科技等级上限：20
 *
 * 建筑等级示例（baseLevel=5）：
 * - 距离 0: 5级
 * - 距离 10: 8级
 * - 距离 50: 14级
 * - 距离 100: 18级
 * - 距离 200: 22级
 * - 距离 400: 26级
 * - 距离 800+: 30级（上限）
 */
export const calculateDistanceDifficultyMultiplier = (distance: number): DistanceDifficultyMultipliers => {
  // 使用对数增长，确保建筑等级在合理范围内
  // 公式: 1 + ln(1 + distance) * 0.8
  // 这样可以确保最大建筑倍率约为6倍（5*6=30）
  const logMultiplier = 1 + Math.log(1 + distance) * 0.8

  // 限制建筑倍率最大为6（因为基础等级是5，5*6=30）
  const buildingMultiplier = Math.min(6, Math.max(1, Math.round(logMultiplier)))

  // 科技倍率稍低，上限4倍（5*4=20）
  const techMultiplier = Math.min(4, Math.max(1, Math.round(logMultiplier * 0.7)))

  // 舰队倍率：使用更平缓的增长
  // 基础舰队10艘，最大约500艘左右
  const fleetMultiplier = Math.min(50, Math.max(1, Math.round(logMultiplier * 8)))

  // 资源倍率：限制最大20倍，避免Infinity
  const resourceMultiplier = Math.min(20, Math.max(1, logMultiplier * 3))

  // 防御倍率
  const defenseMultiplier = Math.min(30, Math.max(1, Math.round(logMultiplier * 5)))

  return {
    buildingMultiplier,
    techMultiplier,
    fleetMultiplier,
    resourceMultiplier,
    defenseMultiplier
  }
}

/**
 * 随机生成 NPC 的 AI 类型
 * 分布概率:
 * - Balanced: 35% （平衡型最常见）
 * - Aggressive: 25% （侵略型较常见）
 * - Defensive: 20% （防守型中等）
 * - Expansionist: 15% （扩张型较少）
 * - Trader: 5% （商人型最稀少）
 */
export const generateRandomAIType = (): NPCAIType => {
  const roll = Math.random() * 100
  if (roll < 35) return NPCAIType.Balanced
  if (roll < 60) return NPCAIType.Aggressive
  if (roll < 80) return NPCAIType.Defensive
  if (roll < 95) return NPCAIType.Expansionist
  return NPCAIType.Trader
}

/**
 * 确保 NPC 有 AI 类型，如果没有则随机分配
 */
export const ensureNPCAIType = (npc: NPC): void => {
  if (!npc.aiType) {
    npc.aiType = generateRandomAIType()
  }
}

/**
 * 确保所有 NPC 都有 AI 类型
 */
export const ensureAllNPCsAIType = (npcs: NPC[]): void => {
  npcs.forEach(npc => ensureNPCAIType(npc))
}

/**
 * 基于距离难度初始化NPC星球
 * 替代旧的 initializeNPCStartingPower
 *
 * 设计原则：
 * 1. 只设置行星可建造的建筑（不设置月球专属建筑）
 * 2. 建筑空间不超出 maxSpace 限制
 * 3. 舰队仓储不超出限制（基于船坞+机库+计算机技术计算）
 * 4. 建筑和科技等级合理，不是随机的，与难度成正比
 *
 * 空间占用（每级）：
 * - 金属矿/晶体矿: 1, 重氢合成器: 2, 太阳能电站: 2
 * - 聚变反应堆: 4, 金属/晶体/重氢仓库: 1
 * - 机器人工厂: 4, 造船厂: 5, 研究实验室: 3, 机库: 3
 * - 纳米工厂: 8, 导弹发射井: 6, 地形改造器: 5
 * - 暗物质收集器: 5, 暗物质储罐: 2, 地质研究站: 6, 深钻设施: 15
 *
 * 舰队仓储容量 = 1000 + 船坞×1000 + 机库×1500 + 计算机技术×500
 *
 * 舰船仓储占用：
 * - 轻型战斗机: 5, 重型战斗机: 10, 巡洋舰: 15, 战列舰: 25
 * - 战列巡洋舰: 20, 轰炸机: 35, 驱逐舰: 12
 * - 小型运输: 10, 大型运输: 20, 殖民船: 40, 回收船: 30
 * - 间谍探测器: 2, 太阳能卫星: 1, 暗物质收集船: 50, 死星: 100
 */
export const initializeNPCByDistance = (npc: NPC, homeworldPosition: { galaxy: number; system: number; position: number }): void => {
  const planet = npc.planets[0]
  if (!planet) return

  const distance = calculateDistanceToHomeworld(planet.position, homeworldPosition)

  // 保存距离和难度等级到NPC
  npc.distanceToHomeworld = distance
  npc.difficultyLevel = calculateDifficultyLevel(distance)

  // 分配随机 AI 类型（如果还没有）
  ensureNPCAIType(npc)

  // 难度等级 1-7+，有效等级 = 难度等级 + 2
  const difficultyLevel = npc.difficultyLevel || 1
  const effectiveLevel = difficultyLevel + 2 // 实力提升两档

  // ========== 第一步：设置建筑等级（确保不超出空间限制）==========
  // maxSpace 默认为 200，需要合理分配

  // 根据effectiveLevel计算建筑等级上限
  // effectiveLevel: 3,4,5,6,7,8,9 对应不同的建筑配置

  // 资源建筑（空间占用较低，优先配置）
  const metalMineLevel = Math.min(25, Math.floor(10 + effectiveLevel * 2)) // 16-28级
  const crystalMineLevel = Math.min(23, Math.floor(9 + effectiveLevel * 1.8)) // 14-25级
  const deutLevel = Math.min(20, Math.floor(8 + effectiveLevel * 1.5)) // 12-21级
  const solarPlantLevel = Math.min(28, Math.floor(12 + effectiveLevel * 2)) // 18-30级

  planet.buildings[BuildingType.MetalMine] = metalMineLevel // 空间: 16-28
  planet.buildings[BuildingType.CrystalMine] = crystalMineLevel // 空间: 14-25
  planet.buildings[BuildingType.DeuteriumSynthesizer] = deutLevel // 空间: 24-42
  planet.buildings[BuildingType.SolarPlant] = solarPlantLevel // 空间: 36-60

  // 仓储建筑（空间占用低，每级1）
  const storageLevel = Math.min(10, Math.floor(4 + effectiveLevel * 0.8)) // 6-11级
  planet.buildings[BuildingType.MetalStorage] = storageLevel // 空间: 6-11
  planet.buildings[BuildingType.CrystalStorage] = storageLevel // 空间: 6-11
  planet.buildings[BuildingType.DeuteriumTank] = storageLevel // 空间: 6-11

  // 关键设施建筑（决定舰队仓储容量）
  const shipyardLevel = Math.min(16, Math.floor(6 + effectiveLevel * 1.2)) // 10-17级
  const hangarLevel = Math.min(20, Math.floor(8 + effectiveLevel * 1.5)) // 12-21级
  const roboticsLevel = Math.min(14, Math.floor(5 + effectiveLevel)) // 8-14级
  const researchLabLevel = Math.min(14, Math.floor(5 + effectiveLevel)) // 8-14级

  planet.buildings[BuildingType.Shipyard] = shipyardLevel // 空间: 50-85
  planet.buildings[BuildingType.Hangar] = hangarLevel // 空间: 36-63
  planet.buildings[BuildingType.RoboticsFactory] = roboticsLevel // 空间: 32-56
  planet.buildings[BuildingType.ResearchLab] = researchLabLevel // 空间: 24-42

  // 其他设施
  planet.buildings[BuildingType.MissileSilo] = Math.min(8, effectiveLevel) // 3-9级, 空间: 18-54
  planet.buildings[BuildingType.FusionReactor] = Math.min(10, effectiveLevel) // 3-9级, 空间: 12-36

  // 高级设施（根据effectiveLevel逐步解锁）
  if (effectiveLevel >= 4) {
    planet.buildings[BuildingType.NaniteFactory] = Math.min(5, effectiveLevel - 3) // 1-6级, 空间: 8-48
  }
  if (effectiveLevel >= 5) {
    planet.buildings[BuildingType.DarkMatterCollector] = Math.min(4, effectiveLevel - 4) // 1-5级, 空间: 5-25
    planet.buildings[BuildingType.DarkMatterTank] = Math.min(5, effectiveLevel - 4) // 1-5级, 空间: 2-10
    planet.buildings[BuildingType.GeoResearchStation] = Math.min(3, effectiveLevel - 4) // 1-5级, 空间: 6-30
  }
  if (effectiveLevel >= 7) {
    planet.buildings[BuildingType.Terraformer] = Math.min(3, effectiveLevel - 6) // 1-3级, 空间: 5-15
    planet.buildings[BuildingType.DeepDrillingFacility] = Math.min(2, effectiveLevel - 6) // 1-3级, 空间: 15-45
  }

  // 计算并更新maxSpace（基于地形改造器）
  const terraformerLevel = planet.buildings[BuildingType.Terraformer] || 0
  planet.maxSpace = 200 + terraformerLevel * 10 // 地形改造器每级+10空间

  // ========== 第二步：设置科技等级（基于研究实验室等级）==========
  // 科技等级与研究实验室等级相关，不应超过实验室等级太多
  const baseTechLevel = Math.min(20, researchLabLevel + effectiveLevel) // 实验室+难度

  npc.technologies[TechnologyType.EnergyTechnology] = baseTechLevel
  npc.technologies[TechnologyType.ComputerTechnology] = Math.min(10, Math.floor(baseTechLevel * 0.6)) // 计算机技术上限10
  npc.technologies[TechnologyType.WeaponsTechnology] = Math.floor(baseTechLevel * 0.9)
  npc.technologies[TechnologyType.ShieldingTechnology] = Math.floor(baseTechLevel * 0.85)
  npc.technologies[TechnologyType.ArmourTechnology] = Math.floor(baseTechLevel * 0.85)
  npc.technologies[TechnologyType.CombustionDrive] = Math.floor(baseTechLevel * 0.8)
  npc.technologies[TechnologyType.ImpulseDrive] = Math.floor(baseTechLevel * 0.7)
  npc.technologies[TechnologyType.EspionageTechnology] = Math.floor(baseTechLevel * 0.7)
  npc.technologies[TechnologyType.LaserTechnology] = Math.floor(baseTechLevel * 0.8)
  npc.technologies[TechnologyType.Astrophysics] = Math.floor(baseTechLevel * 0.5)
  npc.technologies[TechnologyType.IonTechnology] = Math.min(10, effectiveLevel)
  npc.technologies[TechnologyType.HyperspaceTechnology] = Math.min(10, effectiveLevel)
  npc.technologies[TechnologyType.HyperspaceDrive] = Math.min(8, Math.max(0, effectiveLevel - 1))

  if (effectiveLevel >= 4) {
    npc.technologies[TechnologyType.PlasmaTechnology] = Math.min(10, effectiveLevel - 2)
  }
  if (effectiveLevel >= 5) {
    npc.technologies[TechnologyType.DarkMatterTechnology] = Math.min(6, effectiveLevel - 4)
    npc.technologies[TechnologyType.TerraformingTechnology] = Math.min(4, effectiveLevel - 4)
  }
  if (effectiveLevel >= 8) {
    npc.technologies[TechnologyType.GravitonTechnology] = 1
  }

  // ========== 第三步：计算舰队仓储容量 ==========
  // 舰队仓储 = 基础1000 + 船坞×1000 + 机库×1500 + 计算机技术×500
  const computerTechLevel = npc.technologies[TechnologyType.ComputerTechnology] || 0
  const maxFleetStorage = 1000 + shipyardLevel * 1000 + hangarLevel * 1500 + computerTechLevel * 500
  // effectiveLevel 3: 1000 + 10×1000 + 12×1500 + 6×500 = 1000+10000+18000+3000 = 32000
  // effectiveLevel 9: 1000 + 17×1000 + 21×1500 + 10×500 = 1000+17000+31500+5000 = 54500

  // ========== 第四步：设置舰队（确保不超出仓储限制）==========
  // 先清空舰队
  Object.values(ShipType).forEach(shipType => {
    planet.fleet[shipType] = 0
  })

  // 计算每种舰船的仓储占用
  const shipStorage: Record<ShipType, number> = {
    [ShipType.LightFighter]: 5,
    [ShipType.HeavyFighter]: 10,
    [ShipType.Cruiser]: 15,
    [ShipType.Battleship]: 25,
    [ShipType.Battlecruiser]: 20,
    [ShipType.Bomber]: 35,
    [ShipType.Destroyer]: 12,
    [ShipType.SmallCargo]: 10,
    [ShipType.LargeCargo]: 20,
    [ShipType.ColonyShip]: 40,
    [ShipType.Recycler]: 30,
    [ShipType.EspionageProbe]: 2,
    [ShipType.SolarSatellite]: 1,
    [ShipType.DarkMatterHarvester]: 50,
    [ShipType.Deathstar]: 100
  }

  // 根据 effectiveLevel 计算舰队基数
  // effectiveLevel 3: fleetMultiplier = 1, effectiveLevel 9: fleetMultiplier = 4
  const fleetMultiplier = Math.pow(effectiveLevel / 3, 2) // 1, 1.78, 2.78, 4, 5.44, 7.11, 9

  // 按优先级分配舰队（战斗舰优先）
  let usedStorage = 0

  // 辅助函数：添加舰船并追踪仓储使用
  const addShips = (shipType: ShipType, baseCount: number) => {
    const count = Math.floor(baseCount * fleetMultiplier)
    const availableStorage = maxFleetStorage - usedStorage
    const maxAffordable = Math.floor(availableStorage / shipStorage[shipType])
    const actualCount = Math.min(count, maxAffordable)
    if (actualCount > 0) {
      planet.fleet[shipType] = actualCount
      usedStorage += actualCount * shipStorage[shipType]
    }
  }

  // 主力战斗舰队
  addShips(ShipType.LightFighter, 800) // 800-7200
  addShips(ShipType.HeavyFighter, 400) // 400-3600
  addShips(ShipType.Cruiser, 200) // 200-1800
  addShips(ShipType.Battleship, 100) // 100-900
  addShips(ShipType.Battlecruiser, 80) // 80-720
  addShips(ShipType.Destroyer, 60) // 60-540
  addShips(ShipType.Bomber, 40) // 40-360

  // 辅助舰队
  addShips(ShipType.SmallCargo, 150) // 150-1350
  addShips(ShipType.LargeCargo, 60) // 60-540
  addShips(ShipType.Recycler, 50) // 50-450
  addShips(ShipType.EspionageProbe, 100) // 100-900
  addShips(ShipType.SolarSatellite, 200) // 200-1800

  // 特殊舰船
  if (effectiveLevel >= 4) {
    addShips(ShipType.ColonyShip, 3) // 3-27
  }
  if (effectiveLevel >= 5) {
    addShips(ShipType.DarkMatterHarvester, 10) // 10-90
  }
  if (effectiveLevel >= 8) {
    addShips(ShipType.Deathstar, 2) // 2-18
  }

  // ========== 第五步：设置防御设施 ==========
  // 防御不受仓储限制，使用 effectiveLevel 的平方增长
  const defenseMultiplier = effectiveLevel * effectiveLevel // 9, 16, 25, 36, 49, 64, 81

  planet.defense[DefenseType.RocketLauncher] = defenseMultiplier * 50 // 450-4050
  planet.defense[DefenseType.LightLaser] = defenseMultiplier * 40 // 360-3240
  planet.defense[DefenseType.HeavyLaser] = defenseMultiplier * 20 // 180-1620
  planet.defense[DefenseType.GaussCannon] = defenseMultiplier * 8 // 72-648
  planet.defense[DefenseType.IonCannon] = defenseMultiplier * 8 // 72-648
  planet.defense[DefenseType.PlasmaTurret] = defenseMultiplier * 4 // 36-324
  planet.defense[DefenseType.SmallShieldDome] = 1
  planet.defense[DefenseType.LargeShieldDome] = effectiveLevel >= 4 ? 1 : 0
  planet.defense[DefenseType.AntiBallisticMissile] = defenseMultiplier * 3 // 27-243
  planet.defense[DefenseType.InterplanetaryMissile] = effectiveLevel >= 4 ? defenseMultiplier : 0 // 0-81
  planet.defense[DefenseType.PlanetaryShield] = effectiveLevel >= 6 ? 1 : 0

  // ========== 第六步：设置资源 ==========
  // 基于仓储建筑等级计算容量上限，资源填充70-100%
  const metalCapacity = 10000 * Math.pow(2, planet.buildings[BuildingType.MetalStorage] || 0)
  const crystalCapacity = 10000 * Math.pow(2, planet.buildings[BuildingType.CrystalStorage] || 0)
  const deuteriumCapacity = 10000 * Math.pow(2, planet.buildings[BuildingType.DeuteriumTank] || 0)
  const darkMatterCapacity = 1000 * Math.pow(2, planet.buildings[BuildingType.DarkMatterTank] || 0)

  const resourceFillRate = 0.7 + (difficultyLevel / 10) * 0.3
  planet.resources.metal = Math.floor(metalCapacity * resourceFillRate)
  planet.resources.crystal = Math.floor(crystalCapacity * resourceFillRate)
  planet.resources.deuterium = Math.floor(deuteriumCapacity * resourceFillRate)
  planet.resources.darkMatter = Math.floor(darkMatterCapacity * resourceFillRate)
}

/**
 * 基于距离的NPC成长配置
 */
export interface DistanceBasedGrowthConfig {
  resourceGrowthRate: number
  buildingGrowthSpeed: number
  techGrowthSpeed: number
  checkInterval: number
}

/**
 * 根据距离计算NPC成长配置
 */
export const calculateDistanceBasedGrowthConfig = (distance: number): DistanceBasedGrowthConfig => {
  const multipliers = calculateDistanceDifficultyMultiplier(distance)

  return {
    resourceGrowthRate: multipliers.resourceMultiplier,
    buildingGrowthSpeed: multipliers.buildingMultiplier,
    techGrowthSpeed: multipliers.techMultiplier,
    checkInterval: 180 // 3分钟检查一次
  }
}

/**
 * 基于距离更新NPC成长
 * 替代旧的 updateNPCGrowth 中基于玩家积分的逻辑
 */
export const updateNPCGrowthByDistance = (
  npc: NPC,
  homeworldPosition: { galaxy: number; system: number; position: number },
  deltaSeconds: number,
  gameSpeed: number = 1
): void => {
  const planet = npc.planets[0]
  if (!planet) return

  // 如果没有距离信息，先计算
  if (npc.distanceToHomeworld === undefined) {
    npc.distanceToHomeworld = calculateDistanceToHomeworld(planet.position, homeworldPosition)
    npc.difficultyLevel = calculateDifficultyLevel(npc.distanceToHomeworld)
  }

  const config = calculateDistanceBasedGrowthConfig(npc.distanceToHomeworld)

  // 1. 持续生成资源（应用游戏速度倍率）
  generateNPCResourcesByDistance(npc, deltaSeconds, config, gameSpeed)

  // 2. 定期评估并调整实力
  const now = Date.now()
  const lastGrowthCheck = (npc as any).lastGrowthCheck || 0

  if (now - lastGrowthCheck >= config.checkInterval * 1000) {
    ;(npc as any).lastGrowthCheck = now

    // 计算目标实力（基于距离倍率）
    const multipliers = calculateDistanceDifficultyMultiplier(npc.distanceToHomeworld)
    const baseLevel = 5
    const targetBuildingLevel = Math.floor(baseLevel * multipliers.buildingMultiplier)
    const targetTechLevel = Math.floor(baseLevel * multipliers.techMultiplier)

    // 获取当前平均建筑等级
    let totalBuildingLevels = 0
    let buildingCount = 0
    Object.values(planet.buildings).forEach(level => {
      totalBuildingLevels += level
      buildingCount++
    })
    const avgBuildingLevel = buildingCount > 0 ? totalBuildingLevels / buildingCount : 0

    // 获取当前平均科技等级
    const techLevels = Object.values(npc.technologies)
    const avgTechLevel = techLevels.length > 0 ? techLevels.reduce((sum, level) => sum + level, 0) / techLevels.length : 0

    // 如果实力不足，进行升级
    if (avgBuildingLevel < targetBuildingLevel) {
      autoUpgradeNPCBuildings(npc)
    }

    if (avgTechLevel < targetTechLevel) {
      autoResearchNPCTechnologies(npc)
    }

    // 计算目标舰队战力
    const targetFleetPower = 1000 * multipliers.fleetMultiplier
    let currentFleetPower = 0
    Object.entries(planet.fleet).forEach(([shipType, count]) => {
      const shipConfig = SHIPS[shipType as ShipType]
      const power = shipConfig.attack + shipConfig.shield + shipConfig.armor / 10
      currentFleetPower += power * (count as number)
    })

    if (currentFleetPower < targetFleetPower) {
      autoBuildNPCFleet(npc)
    }
  }
}

/**
 * 基于距离生成NPC资源
 */
export const generateNPCResourcesByDistance = (
  npc: NPC,
  deltaSeconds: number,
  config: DistanceBasedGrowthConfig,
  gameSpeed: number = 1
): void => {
  const planet = npc.planets[0]
  if (!planet) return

  // 基于建筑等级计算资源产量
  const metalMineLevel = planet.buildings[BuildingType.MetalMine] || 0
  const crystalMineLevel = planet.buildings[BuildingType.CrystalMine] || 0
  const deuteriumLevel = planet.buildings[BuildingType.DeuteriumSynthesizer] || 0
  const darkMatterLevel = planet.buildings[BuildingType.DarkMatterCollector] || 0

  // 简化的资源产量计算(每秒产量) - 提升3倍让NPC更富有
  const metalProduction = 90 * metalMineLevel * Math.pow(1.1, metalMineLevel) * config.resourceGrowthRate
  const crystalProduction = 60 * crystalMineLevel * Math.pow(1.1, crystalMineLevel) * config.resourceGrowthRate
  const deuteriumProduction = 30 * deuteriumLevel * Math.pow(1.1, deuteriumLevel) * config.resourceGrowthRate
  const darkMatterProduction = ((75 * darkMatterLevel * Math.pow(1.5, darkMatterLevel)) / 3600) * config.resourceGrowthRate

  // 应用游戏速度倍率到时间
  const effectiveDeltaSeconds = deltaSeconds * gameSpeed

  // 增加资源
  planet.resources.metal += metalProduction * effectiveDeltaSeconds
  planet.resources.crystal += crystalProduction * effectiveDeltaSeconds
  planet.resources.deuterium += deuteriumProduction * effectiveDeltaSeconds
  planet.resources.darkMatter += darkMatterProduction * effectiveDeltaSeconds

  // 确保不超过存储上限
  const metalStorage = planet.buildings[BuildingType.MetalStorage] || 0
  const crystalStorage = planet.buildings[BuildingType.CrystalStorage] || 0
  const deuteriumStorage = planet.buildings[BuildingType.DeuteriumTank] || 0
  const darkMatterStorage = planet.buildings[BuildingType.DarkMatterTank] || 0

  planet.resources.metal = Math.min(planet.resources.metal, 10000 * Math.pow(2, metalStorage))
  planet.resources.crystal = Math.min(planet.resources.crystal, 10000 * Math.pow(2, crystalStorage))
  planet.resources.deuterium = Math.min(planet.resources.deuterium, 10000 * Math.pow(2, deuteriumStorage))
  planet.resources.darkMatter = Math.min(planet.resources.darkMatter, 1000 * Math.pow(2, darkMatterStorage))
}
