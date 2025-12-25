import type {
  NPC,
  Planet,
  Player,
  FleetMission,
  SpyReport,
  SpiedNotification,
  IncomingFleetAlert,
  Fleet,
  DebrisField,
  Resources,
  TradeOffer,
  IntelReport,
  JointAttackInvite,
  IntelType,
  AidNotification,
  AllyDefenseNotification,
  AttitudeChangeNotification
} from '@/types/game'
import { MissionType, ShipType, TechnologyType, RelationStatus, NPCAIType } from '@/types/game'

// 重新导出类型供外部使用
export type { TradeOffer, IntelReport, JointAttackInvite, IntelType, AidNotification, AllyDefenseNotification, AttitudeChangeNotification }
import * as fleetLogic from './fleetLogic'
import * as diplomaticLogic from './diplomaticLogic'
import * as resourceLogic from './resourceLogic'
import { DIPLOMATIC_CONFIG, SHIPS } from '@/config/gameConfig'

// ========== 敌对NPC增强行为类型定义 ==========

/**
 * 骚扰任务类型
 */
export type HarassmentType = 'spy' | 'raid' | 'intimidate'

/**
 * 报复等级
 */
export interface RevengeLevel {
  attackCount: number
  fleetMultiplier: number
  attackInterval: number
  name: string
}

/**
 * 围攻协调信息
 */
export interface SiegeCoordination {
  targetPlanetId: string
  targetPosition: { galaxy: number; system: number; position: number }
  coordinatorNpcId: string
  participantNpcIds: string[]
  arrivalTime: number
  startedAt: number
}

// TradeOffer, IntelReport, JointAttackInvite, IntelType 类型已移至 @/types/game.ts

/**
 * NPC之间的关系
 */
export interface NPCRelation {
  npcId: string
  targetNpcId: string
  status: 'ally' | 'neutral' | 'enemy'
  strength: number // 关系强度 0-100
  lastUpdated: number
}

/**
 * NPC联盟
 */
export interface NPCAlliance {
  id: string
  name: string
  leaderNpcId: string
  memberNpcIds: string[]
  enemyNpcIds: string[]
  createdAt: number
}

/**
 * 辅助函数：获取舰队中最慢船只的速度
 * 用于计算飞行时间
 */
const getFleetMinSpeed = (fleet: Partial<Fleet>): number => {
  let minSpeed = Infinity
  for (const [shipType, count] of Object.entries(fleet)) {
    if ((count || 0) > 0) {
      const shipConfig = SHIPS[shipType as ShipType]
      if (shipConfig) {
        minSpeed = Math.min(minSpeed, shipConfig.speed)
      }
    }
  }
  return minSpeed === Infinity ? 10000 : minSpeed // 默认使用基础速度
}

/**
 * AI 类型行为修改器
 * 根据 NPC 的 AI 类型调整其行为参数
 */
export interface AIBehaviorModifier {
  spyFrequencyMultiplier: number // 侦查频率倍率（越高侦查越频繁）
  attackFrequencyMultiplier: number // 攻击频率倍率
  attackProbabilityMultiplier: number // 攻击概率倍率
  fleetSizeMultiplier: number // 出击舰队比例倍率
  giftProbabilityMultiplier: number // 赠送礼物概率倍率
  revengeMultiplier: number // 反击倾向倍率
  defenseFocus: boolean // 是否优先发展防御
  willAttackWhenHostile: boolean // 敌对时是否会主动攻击
  willSpyWhenHostile: boolean // 敌对时是否会侦查
}

/**
 * 获取 AI 类型的行为修改器
 */
export const getAIBehaviorModifier = (aiType?: NPCAIType): AIBehaviorModifier => {
  switch (aiType) {
    case NPCAIType.Aggressive:
      // 侵略型：高频侦查攻击，大舰队出击，不送礼，强烈反击
      return {
        spyFrequencyMultiplier: 1.5,
        attackFrequencyMultiplier: 1.5,
        attackProbabilityMultiplier: 1.3,
        fleetSizeMultiplier: 1.2,
        giftProbabilityMultiplier: 0,
        revengeMultiplier: 2.0,
        defenseFocus: false,
        willAttackWhenHostile: true,
        willSpyWhenHostile: true
      }

    case NPCAIType.Defensive:
      // 防守型：低频侦查，几乎不主动攻击，但被攻击后强烈反击
      return {
        spyFrequencyMultiplier: 0.3,
        attackFrequencyMultiplier: 0.1,
        attackProbabilityMultiplier: 0.1,
        fleetSizeMultiplier: 0.5,
        giftProbabilityMultiplier: 0.5,
        revengeMultiplier: 3.0, // 反击很强烈
        defenseFocus: true,
        willAttackWhenHostile: false, // 即使敌对也不主动攻击
        willSpyWhenHostile: true // 但会侦查监视
      }

    case NPCAIType.Trader:
      // 商人型：几乎不攻击，高概率送礼，被攻击后轻微反击
      return {
        spyFrequencyMultiplier: 0.2,
        attackFrequencyMultiplier: 0.05,
        attackProbabilityMultiplier: 0.05,
        fleetSizeMultiplier: 0.3,
        giftProbabilityMultiplier: 3.0, // 高概率送礼
        revengeMultiplier: 0.5, // 反击意愿低
        defenseFocus: false,
        willAttackWhenHostile: false,
        willSpyWhenHostile: false
      }

    case NPCAIType.Expansionist:
      // 扩张型：中等侦查频率，较少攻击，专注发展
      return {
        spyFrequencyMultiplier: 0.7,
        attackFrequencyMultiplier: 0.4,
        attackProbabilityMultiplier: 0.5,
        fleetSizeMultiplier: 0.6,
        giftProbabilityMultiplier: 1.0,
        revengeMultiplier: 1.0,
        defenseFocus: false,
        willAttackWhenHostile: true,
        willSpyWhenHostile: true
      }

    case NPCAIType.Balanced:
    default:
      // 平衡型（默认）：标准行为
      return {
        spyFrequencyMultiplier: 1.0,
        attackFrequencyMultiplier: 1.0,
        attackProbabilityMultiplier: 1.0,
        fleetSizeMultiplier: 1.0,
        giftProbabilityMultiplier: 1.0,
        revengeMultiplier: 1.0,
        defenseFocus: false,
        willAttackWhenHostile: true,
        willSpyWhenHostile: true
      }
  }
}

/**
 * 根据 AI 类型调整动态行为配置
 */
export const applyAIModifierToConfig = (config: DynamicBehaviorConfig, modifier: AIBehaviorModifier): DynamicBehaviorConfig => {
  return {
    ...config,
    spyInterval: Math.floor(config.spyInterval / modifier.spyFrequencyMultiplier),
    attackInterval: Math.floor(config.attackInterval / modifier.attackFrequencyMultiplier),
    attackProbability: Math.min(1.0, config.attackProbability * modifier.attackProbabilityMultiplier),
    attackFleetSizeRatio: Math.min(1.0, config.attackFleetSizeRatio * modifier.fleetSizeMultiplier)
  }
}

/**
 * NPC行为决策系统
 *
 * 流程：
 * 1. NPC定期侦查玩家星球
 * 2. 玩家收到"被侦查"通知
 * 3. 基于侦查结果，NPC决定是否攻击
 * 4. NPC发起攻击，玩家收到实时警告
 * 5. NPC检测并回收自己星球附近的残骸
 * 6. NPC被攻击后会做出防御性反应或反击
 */

// 动态行为配置接口
export interface DynamicBehaviorConfig {
  spyInterval: number
  attackInterval: number
  attackProbability: number
  minSpyProbes: number
  attackFleetSizeRatio: number
  maxConcurrentSpyMissions: number // 同时最多多少个侦查任务
  maxConcurrentAttackMissions: number // 同时最多多少个攻击任务
}

/**
 * 根据玩家积分计算动态NPC行为配置
 * 积分越高，NPC越激进
 */
export const calculateDynamicBehavior = (playerPoints: number): DynamicBehaviorConfig => {
  if (playerPoints < 1000) {
    // 新手阶段：NPC温和但会主动侦查攻击
    return {
      spyInterval: 300, // 5分钟侦查一次
      attackInterval: 300, // 5分钟攻击一次（与侦查同步，侦查完就攻击）
      attackProbability: 0.4,
      minSpyProbes: 1,
      attackFleetSizeRatio: 0.3, // 只派30%舰队
      maxConcurrentSpyMissions: 3,
      maxConcurrentAttackMissions: 2
    }
  } else if (playerPoints < 5000) {
    // 初级阶段：NPC比较激进
    return {
      spyInterval: 420, // 7分钟侦查一次
      attackInterval: 420, // 7分钟攻击一次（与侦查同步）
      attackProbability: 0.45,
      minSpyProbes: 2,
      attackFleetSizeRatio: 0.5, // 派50%舰队
      maxConcurrentSpyMissions: 5,
      maxConcurrentAttackMissions: 3
    }
  } else if (playerPoints < 20000) {
    // 中级阶段：NPC很激进
    return {
      spyInterval: 360, // 6分钟侦查一次
      attackInterval: 360, // 6分钟攻击一次（与侦查同步）
      attackProbability: 0.55,
      minSpyProbes: 3,
      attackFleetSizeRatio: 0.7, // 派70%舰队
      maxConcurrentSpyMissions: 8,
      maxConcurrentAttackMissions: 5
    }
  } else if (playerPoints < 50000) {
    // 高级阶段：NPC非常激进
    return {
      spyInterval: 300, // 5分钟侦查一次
      attackInterval: 300, // 5分钟攻击一次（与侦查同步）
      attackProbability: 0.65,
      minSpyProbes: 4,
      attackFleetSizeRatio: 0.85, // 派85%舰队
      maxConcurrentSpyMissions: 10,
      maxConcurrentAttackMissions: 8
    }
  } else {
    // 专家阶段：NPC极度激进
    return {
      spyInterval: 240, // 4分钟侦查一次
      attackInterval: 240, // 4分钟攻击一次（与侦查同步）
      attackProbability: 0.8,
      minSpyProbes: 5,
      attackFleetSizeRatio: 0.95, // 派95%舰队
      maxConcurrentSpyMissions: 15,
      maxConcurrentAttackMissions: 12
    }
  }
}

/**
 * 检查NPC是否应该侦查玩家
 */
export const shouldNPCSpyPlayer = (npc: NPC, player: Player, currentTime: number, config: DynamicBehaviorConfig): boolean => {
  // 新手保护：积分低于1000的玩家不会被侦查
  const playerPoints = player.points || 0
  if (playerPoints < 1000) {
    return false
  }

  // 获取 AI 行为修改器
  const aiModifier = getAIBehaviorModifier(npc.aiType)

  // 检查外交关系 - 统一使用 npc.relations
  const relation = npc.relations?.[player.id]

  // 如果没有关系数据，视为中立，不侦查
  if (!relation) {
    return false
  }

  // 友好或中立NPC不侦查
  if (relation.status === RelationStatus.Friendly || relation.status === RelationStatus.Neutral) {
    return false
  }

  // 只有敌对NPC才会继续
  if (relation.status !== RelationStatus.Hostile) {
    return false
  }

  // 根据 AI 类型判断是否会侦查
  if (!aiModifier.willSpyWhenHostile) {
    return false
  }

  // 只有敌对NPC才会到达这里，检查冷却时间（根据 AI 类型调整）
  const adjustedConfig = applyAIModifierToConfig(config, aiModifier)
  const lastSpyTime = npc.lastSpyTime || 0
  if (currentTime - lastSpyTime < adjustedConfig.spyInterval * 1000) {
    return false
  }

  // 敌对NPC且冷却结束，执行侦查
  return true
}

/**
 * 检查NPC是否应该攻击玩家
 */
export const shouldNPCAttackPlayer = (npc: NPC, player: Player, currentTime: number, config: DynamicBehaviorConfig): boolean => {
  // 新手保护：积分低于1000的玩家不会被攻击
  const playerPoints = player.points || 0
  if (playerPoints < 1000) {
    return false
  }

  // 获取 AI 行为修改器
  const aiModifier = getAIBehaviorModifier(npc.aiType)

  // 检查外交关系 - 统一使用 npc.relations
  const relation = npc.relations?.[player.id]

  // 如果没有关系数据，视为中立，不攻击
  if (!relation) {
    return false
  }

  // 友好或中立NPC不攻击
  if (relation.status === RelationStatus.Friendly || relation.status === RelationStatus.Neutral) {
    return false
  }

  // 只有敌对NPC才会继续
  if (relation.status !== RelationStatus.Hostile) {
    return false
  }

  // 根据 AI 类型判断是否会主动攻击
  if (!aiModifier.willAttackWhenHostile) {
    return false
  }

  // 检查攻击冷却（根据 AI 类型调整）
  const adjustedConfig = applyAIModifierToConfig(config, aiModifier)
  const lastAttackTime = npc.lastAttackTime || 0
  if (currentTime - lastAttackTime < adjustedConfig.attackInterval * 1000) {
    return false
  }

  // 必须有侦查报告才能攻击
  if (!npc.playerSpyReports || Object.keys(npc.playerSpyReports).length === 0) {
    return false
  }

  // 根据 AI 类型的攻击概率决定是否攻击
  // 侵略型总是攻击，其他类型按概率
  if (aiModifier.attackProbabilityMultiplier < 1.0) {
    if (Math.random() > adjustedConfig.attackProbability) {
      return false
    }
  }

  return true
}

/**
 * 检查NPC是否应该赠送资源给玩家
 */
export const shouldNPCGiftPlayer = (npc: NPC, player: Player, currentTime: number): boolean => {
  const { NPC_GIFT_CONFIG } = DIPLOMATIC_CONFIG

  // 检查功能是否启用
  if (!NPC_GIFT_CONFIG.ENABLED) {
    return false
  }

  // 获取 AI 行为修改器
  const aiModifier = getAIBehaviorModifier(npc.aiType)

  // 侵略型 NPC 永远不送礼
  if (aiModifier.giftProbabilityMultiplier === 0) {
    return false
  }

  // 检查上次赠送时间（商人型间隔更短）
  const lastGiftTime = (npc as any).lastGiftTime || 0
  const giftInterval = NPC_GIFT_CONFIG.CHECK_INTERVAL / aiModifier.giftProbabilityMultiplier
  if (currentTime - lastGiftTime < giftInterval * 1000) {
    return false
  }

  // 检查好感度 - 统一使用 npc.relations
  // 商人型 NPC 好感度门槛更低
  const relation = npc.relations?.[player.id]
  const minReputation = npc.aiType === NPCAIType.Trader ? NPC_GIFT_CONFIG.MIN_REPUTATION * 0.5 : NPC_GIFT_CONFIG.MIN_REPUTATION
  if (!relation || relation.reputation < minReputation) {
    return false
  }

  // 随机概率（根据 AI 类型调整）
  const giftProbability = NPC_GIFT_CONFIG.GIFT_PROBABILITY * aiModifier.giftProbabilityMultiplier
  return Math.random() < giftProbability
}

/**
 * 计算玩家的总资源产量（每小时）
 */
const calculatePlayerTotalProduction = (player: Player): { metal: number; crystal: number; deuterium: number } => {
  let totalMetal = 0
  let totalCrystal = 0
  let totalDeuterium = 0

  // 计算当前激活的军官加成
  const bonuses = player.officers
    ? {
        resourceProductionBonus: Object.values(player.officers).reduce((sum, officer) => {
          if (officer.active && officer.expiresAt && officer.expiresAt > Date.now()) {
            return sum + (officer.bonuses?.resourceProductionBonus || 0)
          }
          return sum
        }, 0),
        darkMatterProductionBonus: Object.values(player.officers).reduce((sum, officer) => {
          if (officer.active && officer.expiresAt && officer.expiresAt > Date.now()) {
            return sum + (officer.bonuses?.darkMatterProductionBonus || 0)
          }
          return sum
        }, 0),
        energyProductionBonus: Object.values(player.officers).reduce((sum, officer) => {
          if (officer.active && officer.expiresAt && officer.expiresAt > Date.now()) {
            return sum + (officer.bonuses?.energyProductionBonus || 0)
          }
          return sum
        }, 0)
      }
    : { resourceProductionBonus: 0, darkMatterProductionBonus: 0, energyProductionBonus: 0 }

  // 遍历所有星球计算总产量
  for (const planet of player.planets) {
    if (planet.isMoon) continue // 月球没有矿场

    const production = resourceLogic.calculateResourceProduction(planet, bonuses)

    totalMetal += production.metal || 0
    totalCrystal += production.crystal || 0
    totalDeuterium += production.deuterium || 0
  }

  return { metal: totalMetal, crystal: totalCrystal, deuterium: totalDeuterium }
}

/**
 * NPC向玩家赠送资源
 * 动态计算赠送量：基于玩家每小时产量的4-8倍
 * 赠送的资源会从NPC主星球扣除
 */
export const giftResourcesToPlayer = (npc: NPC, player: Player): void => {
  const { NPC_GIFT_CONFIG } = DIPLOMATIC_CONFIG
  const dynamicConfig = NPC_GIFT_CONFIG.DYNAMIC_GIFT
  const baseConfig = NPC_GIFT_CONFIG.BASE_GIFT_AMOUNT

  // 获取NPC主星球
  const npcPlanet = npc.planets[0]
  if (!npcPlanet) return

  let giftResources = {
    metal: 0,
    crystal: 0,
    deuterium: 0,
    darkMatter: 0,
    energy: 0
  }

  if (dynamicConfig?.ENABLED) {
    // 动态计算：根据玩家产量
    const playerProduction = calculatePlayerTotalProduction(player)

    // 随机生成产量倍数（4-8倍）
    const multiplierRange = dynamicConfig.PRODUCTION_MULTIPLIER
    const multiplier = multiplierRange.min + Math.random() * (multiplierRange.max - multiplierRange.min)

    // 计算赠送量（产量 × 倍数）
    let metalGift = Math.floor(playerProduction.metal * multiplier)
    let crystalGift = Math.floor(playerProduction.crystal * multiplier)
    let deuteriumGift = Math.floor(playerProduction.deuterium * multiplier)

    // 应用最小值保底
    metalGift = Math.max(metalGift, dynamicConfig.MIN_AMOUNT.METAL)
    crystalGift = Math.max(crystalGift, dynamicConfig.MIN_AMOUNT.CRYSTAL)
    deuteriumGift = Math.max(deuteriumGift, dynamicConfig.MIN_AMOUNT.DEUTERIUM)

    // 应用最大值封顶
    metalGift = Math.min(metalGift, dynamicConfig.MAX_AMOUNT.METAL)
    crystalGift = Math.min(crystalGift, dynamicConfig.MAX_AMOUNT.CRYSTAL)
    deuteriumGift = Math.min(deuteriumGift, dynamicConfig.MAX_AMOUNT.DEUTERIUM)

    giftResources.metal = metalGift
    giftResources.crystal = crystalGift
    giftResources.deuterium = deuteriumGift
  } else {
    // 使用基础配置（后备方案）
    giftResources.metal = Math.floor(Math.random() * (baseConfig.METAL.max - baseConfig.METAL.min + 1)) + baseConfig.METAL.min
    giftResources.crystal = Math.floor(Math.random() * (baseConfig.CRYSTAL.max - baseConfig.CRYSTAL.min + 1)) + baseConfig.CRYSTAL.min
    giftResources.deuterium =
      Math.floor(Math.random() * (baseConfig.DEUTERIUM.max - baseConfig.DEUTERIUM.min + 1)) + baseConfig.DEUTERIUM.min
  }

  // 根据好感度额外加成：好感度越高，赠送越多
  const relation = npc.relations?.[player.id]
  if (relation && relation.reputation > 60) {
    // 好感度60-100区间，额外增加0-40%
    const reputationBonus = 1 + (relation.reputation - 60) / 100
    giftResources.metal = Math.floor(giftResources.metal * reputationBonus)
    giftResources.crystal = Math.floor(giftResources.crystal * reputationBonus)
    giftResources.deuterium = Math.floor(giftResources.deuterium * reputationBonus)
  }

  // 限制赠送量不超过NPC拥有的资源（只赠送NPC实际拥有的部分）
  giftResources.metal = Math.min(giftResources.metal, Math.floor(npcPlanet.resources.metal))
  giftResources.crystal = Math.min(giftResources.crystal, Math.floor(npcPlanet.resources.crystal))
  giftResources.deuterium = Math.min(giftResources.deuterium, Math.floor(npcPlanet.resources.deuterium))

  // 如果NPC资源不足（所有资源都为0），则不赠送
  if (giftResources.metal <= 0 && giftResources.crystal <= 0 && giftResources.deuterium <= 0) {
    return
  }

  // 从NPC星球扣除资源
  npcPlanet.resources.metal -= giftResources.metal
  npcPlanet.resources.crystal -= giftResources.crystal
  npcPlanet.resources.deuterium -= giftResources.deuterium

  // 处理赠送
  diplomaticLogic.handleNPCGiftToPlayer(npc, player, giftResources)

  // 更新上次赠送时间
  ;(npc as any).lastGiftTime = Date.now()
}

/**
 * 检查NPC是否应该协防玩家
 * 当玩家受到攻击且NPC是友好状态时触发
 */
export const shouldNPCDefendPlayer = (npc: NPC, player: Player, currentTime: number): boolean => {
  const { ALLY_DEFENSE_CONFIG } = DIPLOMATIC_CONFIG

  // 检查功能是否启用
  if (!ALLY_DEFENSE_CONFIG?.ENABLED) {
    return false
  }

  // 检查好感度
  const relation = npc.relations?.[player.id]
  if (!relation || relation.reputation < ALLY_DEFENSE_CONFIG.MIN_REPUTATION) {
    return false
  }

  // 检查上次协防时间
  const lastDefendTime = (npc as any).lastDefendTime || 0
  if (currentTime - lastDefendTime < ALLY_DEFENSE_CONFIG.CHECK_INTERVAL * 1000) {
    return false
  }

  // 检查当前协防任务数量
  const activeDefenseMissions = npc.fleetMissions?.filter(m => m.missionType === MissionType.Station && m.status === 'outbound').length || 0
  if (activeDefenseMissions >= ALLY_DEFENSE_CONFIG.MAX_CONCURRENT_DEFENSES) {
    return false
  }

  // 检查玩家是否有来袭攻击舰队
  const incomingAttacks =
    player.incomingFleetAlerts?.filter(
      alert => alert.missionType === MissionType.Attack && alert.fleetSize >= ALLY_DEFENSE_CONFIG.MIN_INCOMING_FLEET_SIZE
    ) || []
  if (incomingAttacks.length === 0) {
    return false
  }

  // 根据好感度计算协防概率
  const reputationBonus = (relation.reputation - ALLY_DEFENSE_CONFIG.MIN_REPUTATION) / 30 // 70-100区间
  const defenseProbability = ALLY_DEFENSE_CONFIG.BASE_DEFENSE_PROBABILITY + reputationBonus * 0.3
  return Math.random() < defenseProbability
}

/**
 * NPC派舰队协防玩家
 */
export const sendDefenseFleet = (npc: NPC, _player: Player, targetPlanet: Planet): FleetMission | null => {
  const { ALLY_DEFENSE_CONFIG } = DIPLOMATIC_CONFIG

  // 选择最近且有舰队的NPC星球
  const sourcePlanet = selectBestNPCPlanet(npc, targetPlanet.position)
  if (!sourcePlanet) return null

  // 计算派遣舰队（战斗舰船的30%-60%）
  const fleetRatio =
    ALLY_DEFENSE_CONFIG.FLEET_RATIO.min + Math.random() * (ALLY_DEFENSE_CONFIG.FLEET_RATIO.max - ALLY_DEFENSE_CONFIG.FLEET_RATIO.min)

  const combatShipTypes = [
    ShipType.LightFighter,
    ShipType.HeavyFighter,
    ShipType.Cruiser,
    ShipType.Battleship,
    ShipType.Battlecruiser,
    ShipType.Bomber,
    ShipType.Destroyer
  ]

  const defenseFleet: Partial<Fleet> = {}
  let hasShips = false

  for (const shipType of combatShipTypes) {
    const available = sourcePlanet.fleet[shipType] || 0
    if (available > 0) {
      const toSend = Math.floor(available * fleetRatio)
      if (toSend > 0) {
        defenseFleet[shipType] = toSend
        sourcePlanet.fleet[shipType] = available - toSend
        hasShips = true
      }
    }
  }

  if (!hasShips) return null

  // 计算飞行时间
  const distance = fleetLogic.calculateDistance(sourcePlanet.position, targetPlanet.position)
  const minSpeed = getFleetMinSpeed(defenseFleet)
  const flightTime = fleetLogic.calculateFlightTime(distance, minSpeed)

  const currentTime = Date.now()
  const arrivalTime = currentTime + flightTime

  // 创建协防任务
  const mission: FleetMission = {
    id: `ally_defend_${currentTime}_${npc.id}`,
    playerId: npc.id,
    npcId: npc.id,
    originPlanetId: sourcePlanet.id,
    targetPosition: targetPlanet.position,
    targetPlanetId: targetPlanet.id,
    fleet: defenseFleet as Fleet,
    missionType: MissionType.Station,
    departureTime: currentTime,
    arrivalTime: arrivalTime,
    returnTime: arrivalTime + ALLY_DEFENSE_CONFIG.STATION_DURATION,
    status: 'outbound',
    cargo: { metal: 0, crystal: 0, deuterium: 0, darkMatter: 0, energy: 0 },
    isGift: false,
    isHostile: false // 盟友协防不是敌对任务
  }

  // 添加到NPC任务列表
  if (!npc.fleetMissions) {
    npc.fleetMissions = []
  }
  npc.fleetMissions.push(mission)

  // 更新上次协防时间
  ;(npc as any).lastDefendTime = currentTime

  return mission
}

/**
 * 检查并执行NPC协防行为
 */
export const checkAndExecuteAllyDefense = (npc: NPC, player: Player, currentTime: number): void => {
  if (!shouldNPCDefendPlayer(npc, player, currentTime)) {
    return
  }

  // 找到受攻击的玩家星球
  const incomingAttacks = player.incomingFleetAlerts?.filter(alert => alert.missionType === MissionType.Attack) || []

  if (incomingAttacks.length === 0) return

  // 选择一个受攻击的星球进行协防
  const targetAlert = incomingAttacks[Math.floor(Math.random() * incomingAttacks.length)]
  if (!targetAlert) return

  const targetPlanet = player.planets.find(p => p.id === targetAlert.targetPlanetId)

  if (!targetPlanet) return

  // 派遣协防舰队
  const mission = sendDefenseFleet(npc, player, targetPlanet)

  if (mission) {
    // 可以在这里添加通知玩家的逻辑
    diplomaticLogic.notifyPlayerOfAllyDefense(npc, player, targetPlanet, mission)
  }
}

/**
 * 选择NPC的最佳攻击来源星球
 */
const selectBestNPCPlanet = (npc: NPC, targetPosition: { galaxy: number; system: number; position: number }): Planet | null => {
  if (npc.planets.length === 0) return null

  // 选择距离最近且有舰队的星球
  let bestPlanet: Planet | null = null
  let minDistance = Infinity

  for (const planet of npc.planets) {
    const distance = fleetLogic.calculateDistance(planet.position, targetPosition)
    const hasFleet = Object.values(planet.fleet).some(count => (count || 0) > 0)

    if (hasFleet && distance < minDistance) {
      minDistance = distance
      bestPlanet = planet
    }
  }

  return bestPlanet
}

/**
 * 计算NPC星球的战斗舰队总攻击力
 * 用于判断NPC是否有足够的战斗力来发起有意义的攻击
 */
const calculateNPCCombatPower = (npcPlanet: Planet): number => {
  // 各舰船的攻击力
  const shipAttackPower: Record<string, number> = {
    [ShipType.LightFighter]: 50,
    [ShipType.HeavyFighter]: 150,
    [ShipType.Cruiser]: 400,
    [ShipType.Battleship]: 1200,
    [ShipType.Bomber]: 700,
    [ShipType.Destroyer]: 2500,
    [ShipType.Battlecruiser]: 1000,
    [ShipType.Deathstar]: 200000
  }

  let totalPower = 0
  for (const [shipType, attack] of Object.entries(shipAttackPower)) {
    const count = npcPlanet.fleet[shipType as ShipType] || 0
    totalPower += count * attack
  }
  return totalPower
}

// 最小战斗力阈值：相当于约10艘轻型战斗机的攻击力
// 这样避免NPC只有几艘小飞机就频繁侦查骚扰玩家
const MIN_COMBAT_POWER_FOR_SPY = 500

/**
 * 创建NPC侦查任务
 */
export const createNPCSpyMission = (
  npc: NPC,
  targetPlanet: Planet,
  _planets: Planet[],
  config: DynamicBehaviorConfig
): FleetMission | null => {
  // 选择NPC的最佳星球作为起点
  const npcPlanet = selectBestNPCPlanet(npc, targetPlanet.position)
  if (!npcPlanet) {
    return null
  }

  // 检查NPC是否有足够的间谍探测器
  const spyProbes = npcPlanet.fleet[ShipType.EspionageProbe] || 0
  if (spyProbes < config.minSpyProbes) {
    return null
  }

  // 检查NPC是否有足够的战斗力
  // 战斗力太低的话侦查没有意义，也避免频繁骚扰玩家
  const combatPower = calculateNPCCombatPower(npcPlanet)
  if (combatPower < MIN_COMBAT_POWER_FOR_SPY) {
    return null
  }

  // 创建侦查舰队
  const fleet: Partial<Fleet> = {
    [ShipType.EspionageProbe]: config.minSpyProbes
  }

  // 从NPC星球扣除舰队
  npcPlanet.fleet[ShipType.EspionageProbe] = (npcPlanet.fleet[ShipType.EspionageProbe] || 0) - config.minSpyProbes

  // 计算飞行时间
  const distance = fleetLogic.calculateDistance(npcPlanet.position, targetPlanet.position)
  const spyProbeSpeed = 100000000 // 间谍探测器速度
  const flightTime = fleetLogic.calculateFlightTime(distance, spyProbeSpeed)

  const now = Date.now()
  const mission: FleetMission = {
    id: `npc-spy-${npc.id}-${now}`,
    playerId: npc.id,
    npcId: npc.id,
    isHostile: true,
    originPlanetId: npcPlanet.id,
    targetPosition: targetPlanet.position,
    targetPlanetId: targetPlanet.id,
    missionType: MissionType.Spy,
    fleet,
    cargo: { metal: 0, crystal: 0, deuterium: 0, darkMatter: 0, energy: 0 },
    departureTime: now,
    arrivalTime: now + flightTime * 1000,
    status: 'outbound'
  }

  // 更新NPC的上次侦查时间
  npc.lastSpyTime = now

  // 添加到NPC任务列表
  if (!npc.fleetMissions) {
    npc.fleetMissions = []
  }
  npc.fleetMissions.push(mission)

  return mission
}

/**
 * 处理NPC侦查到达
 * 返回：被侦查通知（给玩家）和侦查报告（给NPC）
 */
export const processNPCSpyArrival = (
  npc: NPC,
  mission: FleetMission,
  targetPlanet: Planet,
  player: Player
): { spiedNotification: SpiedNotification; spyReport: SpyReport } => {
  // 计算侦查等级（基于NPC的间谍科技）
  const npcSpyTech = npc.technologies[TechnologyType.EspionageTechnology] || 0
  const playerSpyTech = player.technologies[TechnologyType.EspionageTechnology] || 0
  const spyProbeCount = mission.fleet[ShipType.EspionageProbe] || 0

  // 计算被发现的概率
  const detectionChance = Math.max(0, Math.min(100, 50 + (playerSpyTech - npcSpyTech) * 10 - spyProbeCount * 5))
  const detected = Math.random() * 100 < detectionChance

  // 创建NPC的侦查报告
  const spyReport: SpyReport = {
    id: `npc-spy-report-${mission.id}`,
    timestamp: Date.now(),
    spyId: npc.id,
    targetPlanetId: targetPlanet.id,
    targetPlanetName: targetPlanet.name,
    targetPosition: targetPlanet.position,
    targetPlayerId: player.id,
    resources: { ...targetPlanet.resources },
    fleet: npcSpyTech >= 2 ? { ...targetPlanet.fleet } : undefined,
    defense: npcSpyTech >= 4 ? { ...targetPlanet.defense } : undefined,
    buildings: npcSpyTech >= 6 ? { ...targetPlanet.buildings } : undefined,
    technologies: npcSpyTech >= 8 ? { ...player.technologies } : undefined,
    detectionChance
  }

  // 保存到NPC的侦查报告
  if (!npc.playerSpyReports) {
    npc.playerSpyReports = {}
  }
  npc.playerSpyReports[targetPlanet.id] = spyReport

  // 创建被侦查通知（给玩家）
  const spiedNotification: SpiedNotification = {
    id: `spied-${mission.id}`,
    timestamp: Date.now(),
    npcId: npc.id,
    npcName: npc.name,
    targetPlanetId: targetPlanet.id,
    targetPlanetName: targetPlanet.name,
    detectionSuccess: detected,
    read: false
  }

  // 舰队返回
  mission.status = 'returning'
  mission.returnTime = Date.now() + (mission.arrivalTime - mission.departureTime)

  return { spiedNotification, spyReport }
}

/**
 * 决定NPC攻击舰队组成
 * 基于侦查报告和NPC实力
 */
const decideAttackFleet = (_npc: NPC, npcPlanet: Planet, _spyReport: SpyReport, config: DynamicBehaviorConfig): Partial<Fleet> | null => {
  // 简单策略：派出一定比例的可用舰队
  const attackFleet: Partial<Fleet> = {}
  let hasShips = false

  // 优先派出战斗舰船
  const combatShips = [
    ShipType.LightFighter,
    ShipType.HeavyFighter,
    ShipType.Cruiser,
    ShipType.Battleship,
    ShipType.Bomber,
    ShipType.Destroyer,
    ShipType.Battlecruiser,
    ShipType.Deathstar
  ]

  for (const shipType of combatShips) {
    const available = npcPlanet.fleet[shipType] || 0
    if (available > 0) {
      // 使用 Math.ceil 确保至少派出1艘（如果有的话）
      // 但不能超过可用数量
      const sendCount = Math.min(available, Math.max(1, Math.floor(available * config.attackFleetSizeRatio)))
      attackFleet[shipType] = sendCount
      hasShips = true
    }
  }

  return hasShips ? attackFleet : null
}

/**
 * 创建NPC攻击任务
 */
export const createNPCAttackMission = (
  npc: NPC,
  targetPlanet: Planet,
  spyReport: SpyReport,
  config: DynamicBehaviorConfig
): FleetMission | null => {
  // 选择NPC的最佳星球作为起点
  const npcPlanet = selectBestNPCPlanet(npc, targetPlanet.position)
  if (!npcPlanet) {
    return null
  }

  // 决定攻击舰队
  const attackFleet = decideAttackFleet(npc, npcPlanet, spyReport, config)
  if (!attackFleet) {
    return null
  }

  // 从NPC星球扣除舰队
  for (const [shipType, count] of Object.entries(attackFleet)) {
    npcPlanet.fleet[shipType as ShipType] = (npcPlanet.fleet[shipType as ShipType] || 0) - (count as number)
  }

  // 计算飞行时间
  const distance = fleetLogic.calculateDistance(npcPlanet.position, targetPlanet.position)
  // 找出舰队中最慢的船速
  let minSpeed = Infinity
  for (const _shipType of Object.keys(attackFleet)) {
    // 这里简化处理，实际应该从SHIPS配置中获取速度
    const baseSpeed = 10000 // 简化
    minSpeed = Math.min(minSpeed, baseSpeed)
  }
  const flightTime = fleetLogic.calculateFlightTime(distance, minSpeed)

  const now = Date.now()
  const mission: FleetMission = {
    id: `npc-attack-${npc.id}-${now}`,
    playerId: npc.id,
    npcId: npc.id,
    isHostile: true,
    originPlanetId: npcPlanet.id,
    targetPosition: targetPlanet.position,
    targetPlanetId: targetPlanet.id,
    missionType: MissionType.Attack,
    fleet: attackFleet,
    cargo: { metal: 0, crystal: 0, deuterium: 0, darkMatter: 0, energy: 0 },
    departureTime: now,
    arrivalTime: now + flightTime * 1000,
    status: 'outbound'
  }

  // 更新NPC的上次攻击时间
  npc.lastAttackTime = now

  // 添加到NPC任务列表
  if (!npc.fleetMissions) {
    npc.fleetMissions = []
  }
  npc.fleetMissions.push(mission)

  return mission
}

/**
 * 创建或更新即将到来的舰队警告
 */
export const createIncomingFleetAlert = (mission: FleetMission, npc: NPC, targetPlanet: Planet): IncomingFleetAlert => {
  const fleetSize = Object.values(mission.fleet).reduce((sum, count) => sum + (count || 0), 0)

  return {
    id: mission.id,
    npcId: npc.id,
    npcName: npc.name,
    missionType: mission.missionType,
    targetPlanetId: targetPlanet.id,
    targetPlanetName: targetPlanet.name,
    arrivalTime: mission.arrivalTime,
    fleetSize,
    read: false
  }
}

/**
 * 更新玩家的即将到来的舰队警告
 * 删除已到达或已返回的任务警告
 */
export const updateIncomingFleetAlerts = (player: Player, currentTime: number): void => {
  if (!player.incomingFleetAlerts) {
    player.incomingFleetAlerts = []
  }

  // 删除已过期的警告（舰队已到达）
  player.incomingFleetAlerts = player.incomingFleetAlerts.filter(alert => alert.arrivalTime > currentTime)
}

/**
 * NPC主动行为主更新函数
 * 应该在游戏循环中定期调用
 */
export const updateNPCBehavior = (
  npc: NPC,
  player: Player,
  allPlanets: Planet[],
  debrisFields: Record<string, DebrisField>,
  currentTime: number
): void => {
  // 根据玩家积分计算动态行为配置
  const config = calculateDynamicBehavior(player.points)

  // 1. 检查并回收附近的残骸（优先级最高）
  const nearbyDebris = findNearbyDebris(npc, debrisFields)
  if (nearbyDebris.length > 0) {
    // 检查是否已经有正在执行的回收任务
    const activeRecycleMissions = npc.fleetMissions?.filter(m => m.missionType === MissionType.Recycle && m.status === 'outbound') || []
    const activeDebrisIds = new Set(activeRecycleMissions.map(m => m.debrisFieldId).filter(Boolean))

    // 找到还没有被回收的残骸
    const availableDebris = nearbyDebris.filter(d => !activeDebrisIds.has(d.id))

    if (availableDebris.length > 0) {
      // 随机选择一个残骸场进行回收
      const targetDebris = availableDebris[Math.floor(Math.random() * availableDebris.length)]
      if (targetDebris) {
        createNPCRecycleMission(npc, targetDebris, player, allPlanets)
      }
    }
  }

  // 2. 检查是否应该反击（优先于普通攻击）
  if (shouldNPCRevenge(npc, currentTime)) {
    const revengeMission = createNPCRevengeMission(npc, allPlanets, config)
    if (revengeMission) {
      // 找到目标星球创建警告
      const targetPlanet = allPlanets.find(p => p.id === revengeMission.targetPlanetId)
      if (targetPlanet) {
        const alert = createIncomingFleetAlert(revengeMission, npc, targetPlanet)
        if (!player.incomingFleetAlerts) {
          player.incomingFleetAlerts = []
        }
        player.incomingFleetAlerts.push(alert)
      }
      // 反击后跳过普通攻击
      return
    }
  }

  // 3. 检查是否应该侦查玩家
  if (shouldNPCSpyPlayer(npc, player, currentTime, config)) {
    // 随机选择一个玩家星球进行侦查
    const playerPlanets = allPlanets.filter(p => p.ownerId === player.id)
    if (playerPlanets.length > 0) {
      const targetPlanet = playerPlanets[Math.floor(Math.random() * playerPlanets.length)]
      if (!targetPlanet) {
        return
      }

      const spyMission = createNPCSpyMission(npc, targetPlanet, allPlanets, config)

      if (spyMission) {
        // 创建即将到来的舰队警告
        const alert = createIncomingFleetAlert(spyMission, npc, targetPlanet)
        if (!player.incomingFleetAlerts) {
          player.incomingFleetAlerts = []
        }
        player.incomingFleetAlerts.push(alert)
      }
    }
  }

  // 4. 检查是否应该攻击玩家
  if (shouldNPCAttackPlayer(npc, player, currentTime, config)) {
    // 检查是否有最近的侦查报告
    if (npc.playerSpyReports && Object.keys(npc.playerSpyReports).length > 0) {
      // 选择一个侦查过的星球进行攻击
      const spyReports = Object.values(npc.playerSpyReports)
      const recentReport = spyReports[Math.floor(Math.random() * spyReports.length)]

      // 确保找到了侦查报告
      if (!recentReport) {
        return
      }

      // 找到目标星球
      const targetPlanet = allPlanets.find(p => p.id === recentReport.targetPlanetId)
      if (targetPlanet) {
        const attackMission = createNPCAttackMission(npc, targetPlanet, recentReport, config)

        if (attackMission) {
          // 创建即将到来的舰队警告
          const alert = createIncomingFleetAlert(attackMission, npc, targetPlanet)
          if (!player.incomingFleetAlerts) {
            player.incomingFleetAlerts = []
          }
          player.incomingFleetAlerts.push(alert)
        }
      }
    }
  }

  // 5. 检查是否应该赠送资源给玩家（仅友好NPC）
  if (shouldNPCGiftPlayer(npc, player, currentTime)) {
    giftResourcesToPlayer(npc, player)
  }

  // 6. 检查是否应该协防玩家（仅友好NPC，玩家被攻击时）
  checkAndExecuteAllyDefense(npc, player, currentTime)

  // 7. 更新即将到来的舰队警告（删除过期的）
  updateIncomingFleetAlerts(player, currentTime)
}

/**
 * 带并发限制的NPC行为更新函数
 * 防止同时产生过多侦查和攻击任务导致游戏卡顿
 */
export const updateNPCBehaviorWithLimit = (
  npc: NPC,
  player: Player,
  allPlanets: Planet[],
  debrisFields: Record<string, DebrisField>,
  currentTime: number,
  limits: {
    activeSpyMissions: number
    activeAttackMissions: number
    config: DynamicBehaviorConfig
  }
): { spyCreated: boolean; attackCreated: boolean } => {
  const { activeSpyMissions, activeAttackMissions, config } = limits
  let spyCreated = false
  let attackCreated = false

  // 1. 检查并回收附近的残骸（优先级最高，不受并发限制）
  const nearbyDebris = findNearbyDebris(npc, debrisFields)
  if (nearbyDebris.length > 0) {
    const activeRecycleMissions = npc.fleetMissions?.filter(m => m.missionType === MissionType.Recycle && m.status === 'outbound') || []
    const activeDebrisIds = new Set(activeRecycleMissions.map(m => m.debrisFieldId).filter(Boolean))
    const availableDebris = nearbyDebris.filter(d => !activeDebrisIds.has(d.id))

    if (availableDebris.length > 0) {
      const targetDebris = availableDebris[Math.floor(Math.random() * availableDebris.length)]
      if (targetDebris) {
        createNPCRecycleMission(npc, targetDebris, player, allPlanets)
      }
    }
  }

  // 2. 检查是否应该反击（优先于普通攻击，受攻击并发限制）
  if (activeAttackMissions < config.maxConcurrentAttackMissions && shouldNPCRevenge(npc, currentTime)) {
    const revengeMission = createNPCRevengeMission(npc, allPlanets, config)
    if (revengeMission) {
      const targetPlanet = allPlanets.find(p => p.id === revengeMission.targetPlanetId)
      if (targetPlanet) {
        const alert = createIncomingFleetAlert(revengeMission, npc, targetPlanet)
        if (!player.incomingFleetAlerts) {
          player.incomingFleetAlerts = []
        }
        player.incomingFleetAlerts.push(alert)
        attackCreated = true
      }
      return { spyCreated, attackCreated }
    }
  }

  // 3. 检查是否应该侦查玩家（受侦查并发限制）
  if (activeSpyMissions < config.maxConcurrentSpyMissions && shouldNPCSpyPlayer(npc, player, currentTime, config)) {
    const playerPlanets = allPlanets.filter(p => p.ownerId === player.id)
    if (playerPlanets.length > 0) {
      const targetPlanet = playerPlanets[Math.floor(Math.random() * playerPlanets.length)]
      if (targetPlanet) {
        const spyMission = createNPCSpyMission(npc, targetPlanet, allPlanets, config)
        if (spyMission) {
          const alert = createIncomingFleetAlert(spyMission, npc, targetPlanet)
          if (!player.incomingFleetAlerts) {
            player.incomingFleetAlerts = []
          }
          player.incomingFleetAlerts.push(alert)
          spyCreated = true
        }
      }
    }
  }

  // 4. 检查是否应该攻击玩家（受攻击并发限制）
  if (activeAttackMissions < config.maxConcurrentAttackMissions && shouldNPCAttackPlayer(npc, player, currentTime, config)) {
    if (npc.playerSpyReports && Object.keys(npc.playerSpyReports).length > 0) {
      const spyReports = Object.values(npc.playerSpyReports)
      const recentReport = spyReports[Math.floor(Math.random() * spyReports.length)]

      if (recentReport) {
        const targetPlanet = allPlanets.find(p => p.id === recentReport.targetPlanetId)
        if (targetPlanet) {
          const attackMission = createNPCAttackMission(npc, targetPlanet, recentReport, config)
          if (attackMission) {
            const alert = createIncomingFleetAlert(attackMission, npc, targetPlanet)
            if (!player.incomingFleetAlerts) {
              player.incomingFleetAlerts = []
            }
            player.incomingFleetAlerts.push(alert)
            attackCreated = true
          }
        }
      }
    }
  }

  // 5. 检查是否应该赠送资源给玩家（仅友好NPC，不受并发限制）
  if (shouldNPCGiftPlayer(npc, player, currentTime)) {
    giftResourcesToPlayer(npc, player)
  }

  // 6. 检查是否应该协防玩家（仅友好NPC，玩家被攻击时，不受并发限制）
  checkAndExecuteAllyDefense(npc, player, currentTime)

  // 7. 更新即将到来的舰队警告（删除过期的）
  updateIncomingFleetAlerts(player, currentTime)

  return { spyCreated, attackCreated }
}

// ========== 测试辅助函数 ==========

/**
 * 测试函数：强制NPC立即侦查玩家
 * 用于开发和测试
 */
export const forceNPCSpyPlayer = (npc: NPC, player: Player, allPlanets: Planet[], targetPlanetIndex = 0): FleetMission | null => {
  const config = calculateDynamicBehavior(player.points)

  // 选择目标星球
  const playerPlanets = allPlanets.filter(p => p.ownerId === player.id)
  if (playerPlanets.length === 0) {
    console.error('[Test] No player planets found')
    return null
  }

  const targetPlanet = playerPlanets[targetPlanetIndex] || playerPlanets[0]
  if (!targetPlanet) {
    console.error('[Test] Target planet not found')
    return null
  }

  // 创建侦查任务
  const spyMission = createNPCSpyMission(npc, targetPlanet, allPlanets, config)

  if (spyMission) {
    // 创建即将到来的舰队警告
    const alert = createIncomingFleetAlert(spyMission, npc, targetPlanet)
    if (!player.incomingFleetAlerts) {
      player.incomingFleetAlerts = []
    }
    player.incomingFleetAlerts.push(alert)
  } else {
    console.error('[Test] Failed to create spy mission - NPC may not have spy probes')
  }

  return spyMission
}

/**
 * 测试函数：强制NPC立即攻击玩家
 * 需要先有侦查报告
 */
export const forceNPCAttackPlayer = (npc: NPC, player: Player, allPlanets: Planet[], targetPlanetIndex = 0): FleetMission | null => {
  const config = calculateDynamicBehavior(player.points)

  // 检查是否有侦查报告
  if (!npc.playerSpyReports || Object.keys(npc.playerSpyReports).length === 0) {
    console.error('[Test] No spy reports available - NPC must spy first!')
    return null
  }

  // 选择目标星球
  const playerPlanets = allPlanets.filter(p => p.ownerId === player.id)
  if (playerPlanets.length === 0) {
    console.error('[Test] No player planets found')
    return null
  }

  const targetPlanet = playerPlanets[targetPlanetIndex] || playerPlanets[0]
  if (!targetPlanet) {
    console.error('[Test] Target planet not found')
    return null
  }

  // 获取该星球的侦查报告
  const spyReport = npc.playerSpyReports[targetPlanet.id]
  if (!spyReport) {
    console.error(`[Test] No spy report for ${targetPlanet.name} - spy this planet first!`)
    return null
  }

  // 创建攻击任务
  const attackMission = createNPCAttackMission(npc, targetPlanet, spyReport, config)

  if (attackMission) {
    // 创建即将到来的舰队警告
    const alert = createIncomingFleetAlert(attackMission, npc, targetPlanet)
    if (!player.incomingFleetAlerts) {
      player.incomingFleetAlerts = []
    }
    player.incomingFleetAlerts.push(alert)
  } else {
    console.error('[Test] Failed to create attack mission - NPC may not have ships')
  }

  return attackMission
}

/**
 * 测试函数：强制NPC先侦查再攻击
 * 一步到位的测试函数
 */
export const forceNPCSpyAndAttack = (
  npc: NPC,
  player: Player,
  allPlanets: Planet[],
  targetPlanetIndex = 0
): { spyMission: FleetMission | null; attackMission: FleetMission | null } => {
  // 1. 先侦查
  const spyMission = forceNPCSpyPlayer(npc, player, allPlanets, targetPlanetIndex)

  if (!spyMission) {
    return { spyMission: null, attackMission: null }
  }

  // 2. 模拟侦查到达，立即生成侦查报告
  const playerPlanets = allPlanets.filter(p => p.ownerId === player.id)
  const targetPlanet = playerPlanets[targetPlanetIndex] || playerPlanets[0]
  if (!targetPlanet) {
    console.error('[Test] Target planet not found')
    return { spyMission, attackMission: null }
  }

  const { spyReport, spiedNotification } = processNPCSpyArrival(npc, spyMission, targetPlanet, player)

  // 保存侦查报告到NPC
  if (!npc.playerSpyReports) {
    npc.playerSpyReports = {}
  }
  npc.playerSpyReports[targetPlanet.id] = spyReport

  // 添加被侦查通知给玩家
  if (!player.spiedNotifications) {
    player.spiedNotifications = []
  }
  player.spiedNotifications.push(spiedNotification)

  // 3. 立即发起攻击
  const attackMission = forceNPCAttackPlayer(npc, player, allPlanets, targetPlanetIndex)

  return { spyMission, attackMission }
}

/**
 * 测试函数：加速舰队任务到达时间
 * 将任务的到达时间设置为现在+指定秒数
 */
export const accelerateNPCMission = (npc: NPC, missionId: string, arriveInSeconds = 5, player?: Player): boolean => {
  if (!npc.fleetMissions) {
    console.error('[Test] NPC has no fleet missions')
    return false
  }

  const mission = npc.fleetMissions.find(m => m.id === missionId)
  if (!mission) {
    console.error('[Test] Mission not found')
    return false
  }

  const now = Date.now()
  const flightTime = arriveInSeconds * 1000 // 飞行时间（毫秒）

  // 同时修改 departureTime 和 arrivalTime，保持飞行时间为指定秒数
  mission.departureTime = now
  mission.arrivalTime = now + flightTime

  // 同时更新对应的 IncomingFleetAlert
  if (player && player.incomingFleetAlerts) {
    const alert = player.incomingFleetAlerts.find(a => a.id === missionId)
    if (alert) {
      alert.arrivalTime = mission.arrivalTime
    }
  }

  return true
}

/**
 * 测试函数：加速所有NPC舰队任务
 */
export const accelerateAllNPCMissions = (npc: NPC, arriveInSeconds = 5, player?: Player): number => {
  if (!npc.fleetMissions) {
    console.error('[Test] NPC has no fleet missions')
    return 0
  }

  const now = Date.now()
  const flightTime = arriveInSeconds * 1000
  let count = 0

  npc.fleetMissions.forEach(mission => {
    if (mission.status === 'outbound') {
      // 同时修改 departureTime 和 arrivalTime
      mission.departureTime = now
      mission.arrivalTime = now + flightTime

      // 同时更新对应的 IncomingFleetAlert
      if (player && player.incomingFleetAlerts) {
        const alert = player.incomingFleetAlerts.find(a => a.id === mission.id)
        if (alert) {
          alert.arrivalTime = mission.arrivalTime
        }
      }

      count++
    } else if (mission.status === 'returning' && mission.returnTime) {
      // 对于返回任务，保持原来的逻辑
      mission.returnTime = now + flightTime
      count++
    }
  })

  return count
}

/**
 * 检查NPC星球附近是否有残骸场
 * 返回NPC可以回收的残骸场列表
 * NPC会主动寻找同一星系内的残骸进行回收
 */
export const findNearbyDebris = (npc: NPC, debrisFields: Record<string, DebrisField>): DebrisField[] => {
  const nearbyDebris: DebrisField[] = []

  for (const debris of Object.values(debrisFields)) {
    // 检查残骸是否在NPC的星球附近（同一星系内）
    for (const npcPlanet of npc.planets) {
      if (debris.position.galaxy === npcPlanet.position.galaxy && debris.position.system === npcPlanet.position.system) {
        // 检查残骸是否有足够资源值得回收（至少1000金属或水晶）
        if (debris.resources.metal > 1000 || debris.resources.crystal > 1000) {
          // 计算距离，确保不会太远（最多在同一星系内）
          const distance = Math.abs(debris.position.position - npcPlanet.position.position)
          if (distance <= 15) {
            // 同一星系内最多15个位置
            nearbyDebris.push(debris)
          }
        }
      }
    }
  }

  return nearbyDebris
}

/**
 * 创建NPC回收残骸任务
 */
export const createNPCRecycleMission = (npc: NPC, debris: DebrisField, player: Player, allPlanets: Planet[]): FleetMission | null => {
  // 找到离残骸最近的NPC星球
  let closestPlanet: Planet | null = null
  let minDistance = Infinity

  for (const npcPlanet of npc.planets) {
    if (npcPlanet.position.galaxy === debris.position.galaxy && npcPlanet.position.system === debris.position.system) {
      const distance = Math.abs(npcPlanet.position.position - debris.position.position)
      if (distance < minDistance) {
        minDistance = distance
        closestPlanet = npcPlanet
      }
    }
  }

  if (!closestPlanet) {
    return null
  }

  // 检查NPC是否有回收船
  const recyclers = closestPlanet.fleet[ShipType.Recycler] || 0
  if (recyclers === 0) {
    return null
  }

  // 计算需要多少回收船（每艘回收船容量20000）
  const totalDebris = debris.resources.metal + debris.resources.crystal
  const recyclersNeeded = Math.min(Math.ceil(totalDebris / 20000), recyclers)

  // 创建回收舰队
  const fleet: Partial<Fleet> = {
    [ShipType.Recycler]: recyclersNeeded
  }

  // 从NPC星球扣除舰队
  closestPlanet.fleet[ShipType.Recycler] = recyclers - recyclersNeeded

  // 计算飞行时间
  const distance = fleetLogic.calculateDistance(closestPlanet.position, debris.position)
  const recyclerSpeed = 2000 // 回收船基础速度
  const flightTime = fleetLogic.calculateFlightTime(distance, recyclerSpeed)

  const now = Date.now()
  const mission: FleetMission = {
    id: `npc-recycle-${npc.id}-${now}`,
    playerId: npc.id,
    npcId: npc.id,
    isHostile: false,
    originPlanetId: closestPlanet.id,
    targetPosition: debris.position,
    debrisFieldId: debris.id,
    missionType: MissionType.Recycle,
    fleet,
    cargo: { metal: 0, crystal: 0, deuterium: 0, darkMatter: 0, energy: 0 },
    departureTime: now,
    arrivalTime: now + flightTime * 1000,
    status: 'outbound'
  }

  // 添加到NPC任务列表
  if (!npc.fleetMissions) {
    npc.fleetMissions = []
  }
  npc.fleetMissions.push(mission)

  // 检查残骸位置是否有玩家星球，如果有则发送警告
  const playerPlanetAtDebris = allPlanets.find(
    p =>
      p.ownerId === player.id &&
      p.position.galaxy === debris.position.galaxy &&
      p.position.system === debris.position.system &&
      p.position.position === debris.position.position
  )

  if (playerPlanetAtDebris) {
    // 创建即将到来的舰队警告（非敌对）
    const alert = createIncomingFleetAlert(mission, npc, playerPlanetAtDebris)
    if (!player.incomingFleetAlerts) {
      player.incomingFleetAlerts = []
    }
    player.incomingFleetAlerts.push(alert)

    // 创建NPC活动通知
    if (!player.npcActivityNotifications) {
      player.npcActivityNotifications = []
    }
    player.npcActivityNotifications.push({
      id: `npc-activity-${mission.id}`,
      timestamp: now,
      npcId: npc.id,
      npcName: npc.name,
      activityType: 'recycle',
      targetPosition: debris.position,
      targetPlanetId: playerPlanetAtDebris.id,
      targetPlanetName: playerPlanetAtDebris.name,
      arrivalTime: mission.arrivalTime,
      read: false
    })
  }

  return mission
}

/**
 * NPC被攻击后的反应
 * 记录攻击者，并根据情况决定是否反击或加强防御
 */
export const handleNPCAttacked = (npc: NPC, attackerId: string, attackerPlanetId: string | undefined): void => {
  // 初始化被攻击记录
  if (!npc.attackedBy) {
    npc.attackedBy = {}
  }

  // 记录攻击者和被攻击次数
  if (!npc.attackedBy[attackerId]) {
    npc.attackedBy[attackerId] = {
      count: 0,
      lastAttackTime: 0,
      planetId: attackerPlanetId
    }
  }
  npc.attackedBy[attackerId].count++
  npc.attackedBy[attackerId].lastAttackTime = Date.now()
  if (attackerPlanetId) {
    npc.attackedBy[attackerId].planetId = attackerPlanetId
  }

  // 设置警戒状态（被攻击后1小时内保持警戒）
  npc.alertUntil = Date.now() + 3600 * 1000

  // 如果被同一个玩家攻击超过3次，标记为高优先级反击目标
  if (npc.attackedBy[attackerId].count >= 3) {
    npc.revengeTarget = attackerId
  }
}

/**
 * 检查NPC是否应该反击
 */
export const shouldNPCRevenge = (npc: NPC, currentTime: number): boolean => {
  // 如果没有复仇目标，不反击
  if (!npc.revengeTarget || !npc.attackedBy) {
    return false
  }

  // 获取 AI 行为修改器
  const aiModifier = getAIBehaviorModifier(npc.aiType)

  // 商人型 NPC 反击意愿很低，可能选择不反击
  if (aiModifier.revengeMultiplier < 1.0 && Math.random() > aiModifier.revengeMultiplier) {
    return false
  }

  const attackRecord = npc.attackedBy[npc.revengeTarget]
  if (!attackRecord) {
    return false
  }

  // 被攻击后24小时内可以反击（防守型可能更长时间记仇）
  const revengeWindow = 24 * 3600 * 1000 * aiModifier.revengeMultiplier
  const timeSinceLastAttack = currentTime - attackRecord.lastAttackTime
  if (timeSinceLastAttack > revengeWindow) {
    return false
  }

  // 至少等待一段时间后再反击（防守型反应更快）
  const minWaitTime = aiModifier.defenseFocus ? 300 * 1000 : 600 * 1000 // 防守型5分钟，其他10分钟
  if (timeSinceLastAttack < minWaitTime) {
    return false
  }

  return true
}

/**
 * 创建NPC反击任务
 */
export const createNPCRevengeMission = (npc: NPC, allPlanets: Planet[], config: DynamicBehaviorConfig): FleetMission | null => {
  if (!npc.revengeTarget || !npc.attackedBy) {
    return null
  }

  const attackRecord = npc.attackedBy[npc.revengeTarget]
  if (!attackRecord || !attackRecord.planetId) {
    return null
  }

  // 找到攻击者的星球
  const targetPlanet = allPlanets.find(p => p.id === attackRecord.planetId)
  if (!targetPlanet) {
    return null
  }

  // 选择NPC的最佳星球作为起点
  const npcPlanet = selectBestNPCPlanet(npc, targetPlanet.position)
  if (!npcPlanet) {
    return null
  }

  // 获取 AI 行为修改器
  const aiModifier = getAIBehaviorModifier(npc.aiType)

  // 反击时派出更多舰队（基础多50%，根据 AI 类型调整）
  // 防守型/侵略型反击更猛烈
  const revengeMultiplier = 1.5 * aiModifier.revengeMultiplier
  const revengeFleet = decideAttackFleet(npc, npcPlanet, {} as SpyReport, {
    ...config,
    attackFleetSizeRatio: Math.min(1.0, config.attackFleetSizeRatio * revengeMultiplier)
  })

  if (!revengeFleet) {
    return null
  }

  // 从NPC星球扣除舰队
  for (const [shipType, count] of Object.entries(revengeFleet)) {
    npcPlanet.fleet[shipType as ShipType] = (npcPlanet.fleet[shipType as ShipType] || 0) - (count as number)
  }

  // 计算飞行时间
  const distance = fleetLogic.calculateDistance(npcPlanet.position, targetPlanet.position)
  let minSpeed = Infinity
  for (const _shipType of Object.keys(revengeFleet)) {
    const baseSpeed = 10000
    minSpeed = Math.min(minSpeed, baseSpeed)
  }
  const flightTime = fleetLogic.calculateFlightTime(distance, minSpeed)

  const now = Date.now()
  const mission: FleetMission = {
    id: `npc-revenge-${npc.id}-${now}`,
    playerId: npc.id,
    npcId: npc.id,
    isHostile: true,
    originPlanetId: npcPlanet.id,
    targetPosition: targetPlanet.position,
    targetPlanetId: targetPlanet.id,
    missionType: MissionType.Attack,
    fleet: revengeFleet,
    cargo: { metal: 0, crystal: 0, deuterium: 0, darkMatter: 0, energy: 0 },
    departureTime: now,
    arrivalTime: now + flightTime * 1000,
    status: 'outbound'
  }

  // 添加到NPC任务列表
  if (!npc.fleetMissions) {
    npc.fleetMissions = []
  }
  npc.fleetMissions.push(mission)

  // 清除复仇目标（已经反击）
  npc.revengeTarget = undefined

  return mission
}

/**
 * NPC状态诊断函数 - 用于调试和了解NPC当前状态
 */

// 诊断原因类型，包含翻译键和参数
export interface DiagnosticReason {
  key: string // 翻译键，如 'friendlyNoAction', 'insufficientProbes'
  params?: Record<string, string | number> // 翻译参数，如 { current: 5, required: 10 }
}

// 关系状态翻译键类型
export type RelationStatusKey = 'friendly' | 'hostile' | 'neutral' | 'noRelation' | 'noRelationNeutral'

export interface NPCDiagnosticInfo {
  npcId: string
  npcName: string
  difficulty: string
  aiType?: NPCAIType // AI 行为类型
  relationStatus: string // 保持原有字段用于显示
  relationStatusKey: RelationStatusKey // 翻译键
  reputation: number
  canSpy: boolean
  canAttack: boolean
  spyProbes: number
  totalFleetPower: number
  lastSpyTime: number
  lastAttackTime: number
  timeSinceLastSpy: number
  timeSinceLastAttack: number
  nextSpyIn: number
  nextAttackIn: number
  attackProbability: number
  reasons: DiagnosticReason[] // 改为结构化原因数组
}

export const diagnoseNPCBehavior = (npcs: NPC[], player: Player, currentTime: number): NPCDiagnosticInfo[] => {
  const playerPoints = player.points || 0
  const config = calculateDynamicBehavior(playerPoints)

  return npcs.map(npc => {
    const planet = npc.planets[0]
    const relation = npc.relations?.[player.id]
    const reasons: DiagnosticReason[] = []

    // 检查外交关系
    let canSpy = false // 默认不能侦查，只有敌对NPC才能侦查
    let canAttack = false // 默认不能攻击，只有敌对NPC才能攻击
    let relationStatus = ''
    let relationStatusKey: RelationStatusKey = 'noRelation'
    let reputation = 0

    if (relation) {
      reputation = relation.reputation || 0

      if (relation.status === RelationStatus.Friendly) {
        relationStatus = 'friendly'
        relationStatusKey = 'friendly'
        reasons.push({ key: 'friendlyNoAction' })
      } else if (relation.status === RelationStatus.Neutral) {
        relationStatus = 'neutral'
        relationStatusKey = 'neutral'
        reasons.push({ key: 'neutralNoAction' })
      } else if (relation.status === RelationStatus.Hostile) {
        relationStatus = 'hostile'
        relationStatusKey = 'hostile'
        canSpy = true
        canAttack = true
        reasons.push({ key: 'hostileWillAct' })
      }
    } else {
      // 无关系的NPC视为中立
      relationStatus = 'noRelationNeutral'
      relationStatusKey = 'noRelationNeutral'
      reasons.push({ key: 'noRelationNeutral' })
    }

    // 检查侦查探测器数量
    const spyProbes = planet?.fleet?.[ShipType.EspionageProbe] || 0
    if (spyProbes < config.minSpyProbes) {
      canSpy = false
      reasons.push({ key: 'insufficientProbes', params: { current: spyProbes, required: config.minSpyProbes } })
    }

    // 计算舰队战力
    let totalFleetPower = 0
    if (planet?.fleet) {
      Object.entries(planet.fleet).forEach(([shipType, count]) => {
        const shipConfig = SHIPS[shipType as ShipType]
        if (shipConfig) {
          const power = shipConfig.attack + shipConfig.shield + shipConfig.armor / 10
          totalFleetPower += power * (count as number)
        }
      })
    }

    if (totalFleetPower === 0) {
      canAttack = false
      reasons.push({ key: 'noFleet' })
    }

    // 时间检查
    const lastSpyTime = npc.lastSpyTime || 0
    const lastAttackTime = npc.lastAttackTime || 0
    const timeSinceLastSpy = Math.floor((currentTime - lastSpyTime) / 1000)
    const timeSinceLastAttack = Math.floor((currentTime - lastAttackTime) / 1000)

    const nextSpyIn = Math.max(0, config.spyInterval - timeSinceLastSpy)
    const nextAttackIn = Math.max(0, config.attackInterval - timeSinceLastAttack)

    if (timeSinceLastSpy < config.spyInterval) {
      reasons.push({ key: 'spyCooldown', params: { min: Math.floor(nextSpyIn / 60), sec: nextSpyIn % 60 } })
    }

    if (timeSinceLastAttack < config.attackInterval) {
      reasons.push({ key: 'attackCooldown', params: { min: Math.floor(nextAttackIn / 60), sec: nextAttackIn % 60 } })
    }

    // 检查是否已经侦查过玩家
    const hasSpiedPlayer = npc.playerSpyReports && Object.keys(npc.playerSpyReports).length > 0

    if (!hasSpiedPlayer && canAttack) {
      canAttack = false
      reasons.push({ key: 'notSpiedYet' })
    }

    // 计算实际攻击概率
    let actualAttackProbability = config.attackProbability
    if (relation?.status === RelationStatus.Hostile) {
      actualAttackProbability = Math.min(config.attackProbability * 2.0, 1.0)
    }

    return {
      npcId: npc.id,
      npcName: npc.name,
      difficulty: npc.difficulty,
      aiType: npc.aiType,
      relationStatus,
      relationStatusKey,
      reputation,
      canSpy,
      canAttack,
      spyProbes,
      totalFleetPower: Math.floor(totalFleetPower),
      lastSpyTime,
      lastAttackTime,
      timeSinceLastSpy,
      timeSinceLastAttack,
      nextSpyIn,
      nextAttackIn,
      attackProbability: actualAttackProbability,
      reasons
    }
  })
}

// ========== 敌对NPC增强行为系统 ==========

/**
 * 获取NPC的报复等级
 * 基于被攻击次数确定报复强度
 */
export const getRevengeLevel = (npc: NPC, playerId: string): RevengeLevel => {
  const { HOSTILE_BEHAVIOR_CONFIG } = DIPLOMATIC_CONFIG
  const levels = HOSTILE_BEHAVIOR_CONFIG.REVENGE_ESCALATION.LEVELS
  const memoryDuration = HOSTILE_BEHAVIOR_CONFIG.REVENGE_ESCALATION.MEMORY_DURATION

  // 默认等级（用于数组为空或未找到时）
  const defaultLevel: RevengeLevel = levels[0] || { attackCount: 1, fleetMultiplier: 1.0, attackInterval: 600, name: 'mild' }

  const attackRecord = npc.attackedBy?.[playerId]
  if (!attackRecord) {
    return defaultLevel // 默认最低等级
  }

  // 检查记忆是否过期
  const now = Date.now()
  if (now - attackRecord.lastAttackTime > memoryDuration) {
    return defaultLevel // 记忆过期，重置为最低等级
  }

  // 根据被攻击次数确定报复等级
  const attackCount = attackRecord.count
  let currentLevel = defaultLevel

  for (const level of levels) {
    if (attackCount >= level.attackCount) {
      currentLevel = level
    }
  }

  return currentLevel
}

/**
 * 检查NPC是否应该执行骚扰战术
 */
export const shouldNPCHarass = (npc: NPC, player: Player, currentTime: number): boolean => {
  const { HOSTILE_BEHAVIOR_CONFIG } = DIPLOMATIC_CONFIG
  const harassConfig = HOSTILE_BEHAVIOR_CONFIG.HARASSMENT

  if (!harassConfig.ENABLED) {
    return false
  }

  // 检查外交关系
  const relation = npc.relations?.[player.id]
  if (!relation || relation.status !== RelationStatus.Hostile) {
    return false
  }

  // 检查好感度是否足够低
  if (relation.reputation > harassConfig.TRIGGER_REPUTATION) {
    return false
  }

  // 检查骚扰冷却时间
  const lastHarassTime = (npc as any).lastHarassTime || 0
  if (currentTime - lastHarassTime < harassConfig.INTERVAL * 1000) {
    return false
  }

  // 概率判断
  return Math.random() < harassConfig.PROBABILITY
}

/**
 * 选择骚扰类型
 */
export const selectHarassmentType = (): HarassmentType => {
  const { HOSTILE_BEHAVIOR_CONFIG } = DIPLOMATIC_CONFIG
  const types = HOSTILE_BEHAVIOR_CONFIG.HARASSMENT.TYPES

  const rand = Math.random()
  if (rand < types.spy) {
    return 'spy'
  } else if (rand < types.spy + types.raid) {
    return 'raid'
  } else {
    return 'intimidate'
  }
}

/**
 * 创建骚扰任务
 */
export const createHarassmentMission = (
  npc: NPC,
  player: Player,
  allPlanets: Planet[],
  harassmentType: HarassmentType
): FleetMission | null => {
  const { HOSTILE_BEHAVIOR_CONFIG } = DIPLOMATIC_CONFIG
  const harassConfig = HOSTILE_BEHAVIOR_CONFIG.HARASSMENT

  // 选择随机玩家星球作为目标
  const playerPlanets = allPlanets.filter(p => p.ownerId === player.id)
  if (playerPlanets.length === 0) return null

  const targetPlanet = playerPlanets[Math.floor(Math.random() * playerPlanets.length)]
  if (!targetPlanet) return null

  // 选择NPC最佳星球
  const npcPlanet = selectBestNPCPlanet(npc, targetPlanet.position)
  if (!npcPlanet) return null

  let fleet: Partial<Fleet> = {}
  let missionType: MissionType = MissionType.Attack

  if (harassmentType === 'spy') {
    // 侦查骚扰：派出间谍探测器
    const probes = npcPlanet.fleet[ShipType.EspionageProbe] || 0
    if (probes < 1) return null
    fleet = { [ShipType.EspionageProbe]: Math.min(probes, 3) }
    missionType = MissionType.Spy
  } else {
    // 袭击或威慑：派出小规模战斗舰队
    const fleetRatio =
      harassConfig.FLEET_SIZE_RATIO.min + Math.random() * (harassConfig.FLEET_SIZE_RATIO.max - harassConfig.FLEET_SIZE_RATIO.min)

    const combatShips = [ShipType.LightFighter, ShipType.HeavyFighter, ShipType.Cruiser]

    let hasShips = false
    for (const shipType of combatShips) {
      const available = npcPlanet.fleet[shipType] || 0
      if (available > 0) {
        const sendCount = Math.max(1, Math.floor(available * fleetRatio))
        fleet[shipType] = sendCount
        hasShips = true
      }
    }

    if (!hasShips) return null

    // 威慑任务使用部署类型（不攻击，只是展示武力）
    if (harassmentType === 'intimidate') {
      missionType = MissionType.Deploy
    }
  }

  // 从NPC星球扣除舰队
  for (const [shipType, count] of Object.entries(fleet)) {
    npcPlanet.fleet[shipType as ShipType] = (npcPlanet.fleet[shipType as ShipType] || 0) - (count as number)
  }

  // 计算飞行时间
  const distance = fleetLogic.calculateDistance(npcPlanet.position, targetPlanet.position)
  const fleetMinSpeed = getFleetMinSpeed(fleet)
  const flightTime = fleetLogic.calculateFlightTime(distance, fleetMinSpeed)

  const now = Date.now()
  const mission: FleetMission = {
    id: `npc-harass-${harassmentType}-${npc.id}-${now}`,
    playerId: npc.id,
    npcId: npc.id,
    isHostile: harassmentType !== 'intimidate', // 威慑不是敌对行动
    originPlanetId: npcPlanet.id,
    targetPosition: targetPlanet.position,
    targetPlanetId: targetPlanet.id,
    missionType,
    fleet,
    cargo: { metal: 0, crystal: 0, deuterium: 0, darkMatter: 0, energy: 0 },
    departureTime: now,
    arrivalTime: now + flightTime * 1000,
    status: 'outbound'
  }

  // 更新骚扰时间
  ;(npc as any).lastHarassTime = now

  // 添加到NPC任务列表
  if (!npc.fleetMissions) {
    npc.fleetMissions = []
  }
  npc.fleetMissions.push(mission)

  return mission
}

/**
 * 检查是否可以发起围攻
 * 需要多个敌对NPC协调
 */
export const canInitiateSiege = (npcs: NPC[], player: Player, currentTime: number): { canSiege: boolean; eligibleNpcs: NPC[] } => {
  const { HOSTILE_BEHAVIOR_CONFIG } = DIPLOMATIC_CONFIG
  const siegeConfig = HOSTILE_BEHAVIOR_CONFIG.SIEGE

  if (!siegeConfig.ENABLED) {
    return { canSiege: false, eligibleNpcs: [] }
  }

  // 找出所有符合围攻条件的敌对NPC
  const eligibleNpcs = npcs.filter(npc => {
    const relation = npc.relations?.[player.id]
    if (!relation || relation.status !== RelationStatus.Hostile) {
      return false
    }

    // 检查好感度是否足够低
    if (relation.reputation > siegeConfig.TRIGGER_REPUTATION) {
      return false
    }

    // 检查围攻冷却
    const lastSiegeTime = (npc as any).lastSiegeTime || 0
    if (currentTime - lastSiegeTime < siegeConfig.COOLDOWN) {
      return false
    }

    // 检查是否有足够的舰队
    const npcPlanet = npc.planets[0]
    if (!npcPlanet) return false

    const combatPower = calculateNPCCombatPower(npcPlanet)
    return combatPower >= MIN_COMBAT_POWER_FOR_SPY * 10 // 围攻需要较大战力
  })

  // 检查是否有足够的NPC参与围攻
  const canSiege = eligibleNpcs.length >= siegeConfig.MIN_HOSTILE_NPCS

  return { canSiege, eligibleNpcs }
}

/**
 * 发起围攻
 * 协调多个NPC同时攻击玩家
 */
export const initiateSiege = (
  eligibleNpcs: NPC[],
  player: Player,
  allPlanets: Planet[]
): { missions: FleetMission[]; coordination: SiegeCoordination } | null => {
  const { HOSTILE_BEHAVIOR_CONFIG } = DIPLOMATIC_CONFIG
  const siegeConfig = HOSTILE_BEHAVIOR_CONFIG.SIEGE

  if (eligibleNpcs.length < siegeConfig.MIN_HOSTILE_NPCS) {
    return null
  }

  // 选择目标星球（选择资源最多的）
  const playerPlanets = allPlanets.filter(p => p.ownerId === player.id)
  if (playerPlanets.length === 0) return null

  let targetPlanet = playerPlanets[0]
  let maxResources = 0
  for (const planet of playerPlanets) {
    const totalResources = planet.resources.metal + planet.resources.crystal + planet.resources.deuterium
    if (totalResources > maxResources) {
      maxResources = totalResources
      targetPlanet = planet
    }
  }

  if (!targetPlanet) return null

  // 计算统一到达时间（以最远NPC的飞行时间为基准）
  let maxFlightTime = 0
  for (const npc of eligibleNpcs) {
    const npcPlanet = selectBestNPCPlanet(npc, targetPlanet.position)
    if (npcPlanet) {
      const distance = fleetLogic.calculateDistance(npcPlanet.position, targetPlanet.position)
      const flightTime = fleetLogic.calculateFlightTime(distance, 10000) // 使用基准速度
      maxFlightTime = Math.max(maxFlightTime, flightTime)
    }
  }

  const now = Date.now()
  const coordWindow = siegeConfig.COORDINATION_WINDOW
  const baseArrivalTime = now + maxFlightTime * 1000 + coordWindow

  const missions: FleetMission[] = []
  const participantNpcIds: string[] = []

  // 为每个NPC创建攻击任务
  for (const npc of eligibleNpcs) {
    const npcPlanet = selectBestNPCPlanet(npc, targetPlanet.position)
    if (!npcPlanet) continue

    // 计算围攻舰队
    const fleetRatio = siegeConfig.FLEET_RATIO.min + Math.random() * (siegeConfig.FLEET_RATIO.max - siegeConfig.FLEET_RATIO.min)

    const combatShips = [
      ShipType.LightFighter,
      ShipType.HeavyFighter,
      ShipType.Cruiser,
      ShipType.Battleship,
      ShipType.Bomber,
      ShipType.Destroyer,
      ShipType.Battlecruiser
    ]

    const siegeFleet: Partial<Fleet> = {}
    let hasShips = false

    for (const shipType of combatShips) {
      const available = npcPlanet.fleet[shipType] || 0
      if (available > 0) {
        const sendCount = Math.max(1, Math.floor(available * fleetRatio))
        siegeFleet[shipType] = sendCount
        hasShips = true
      }
    }

    if (!hasShips) continue

    // 从NPC星球扣除舰队
    for (const [shipType, count] of Object.entries(siegeFleet)) {
      npcPlanet.fleet[shipType as ShipType] = (npcPlanet.fleet[shipType as ShipType] || 0) - (count as number)
    }

    // 计算随机偏移的到达时间（在协调窗口内）
    const arrivalOffset = Math.random() * coordWindow
    const arrivalTime = baseArrivalTime + arrivalOffset

    // 反推出发时间
    const distance = fleetLogic.calculateDistance(npcPlanet.position, targetPlanet.position)
    const siegeMinSpeed = getFleetMinSpeed(siegeFleet)
    const actualFlightTime = fleetLogic.calculateFlightTime(distance, siegeMinSpeed)
    const departureTime = arrivalTime - actualFlightTime * 1000

    const mission: FleetMission = {
      id: `npc-siege-${npc.id}-${now}`,
      playerId: npc.id,
      npcId: npc.id,
      isHostile: true,
      originPlanetId: npcPlanet.id,
      targetPosition: targetPlanet.position,
      targetPlanetId: targetPlanet.id,
      missionType: MissionType.Attack,
      fleet: siegeFleet,
      cargo: { metal: 0, crystal: 0, deuterium: 0, darkMatter: 0, energy: 0 },
      departureTime: Math.max(now, departureTime),
      arrivalTime,
      status: 'outbound'
    }

    // 更新NPC的围攻时间
    ;(npc as any).lastSiegeTime = now

    // 添加到NPC任务列表
    if (!npc.fleetMissions) {
      npc.fleetMissions = []
    }
    npc.fleetMissions.push(mission)

    missions.push(mission)
    participantNpcIds.push(npc.id)
  }

  if (missions.length < siegeConfig.MIN_HOSTILE_NPCS) {
    return null // 没有足够的NPC成功发起围攻
  }

  const coordination: SiegeCoordination = {
    targetPlanetId: targetPlanet.id,
    targetPosition: targetPlanet.position,
    coordinatorNpcId: eligibleNpcs[0]?.id || '',
    participantNpcIds,
    arrivalTime: baseArrivalTime,
    startedAt: now
  }

  return { missions, coordination }
}

/**
 * 执行报复升级攻击
 * 根据报复等级派出不同强度的攻击
 */
export const executeEscalatedRevenge = (
  npc: NPC,
  player: Player,
  allPlanets: Planet[],
  config: DynamicBehaviorConfig
): FleetMission | null => {
  const { HOSTILE_BEHAVIOR_CONFIG } = DIPLOMATIC_CONFIG
  const escalationConfig = HOSTILE_BEHAVIOR_CONFIG.REVENGE_ESCALATION

  if (!escalationConfig.ENABLED) {
    return null
  }

  // 获取报复等级
  const revengeLevel = getRevengeLevel(npc, player.id)

  // 检查攻击间隔
  const lastRevengeTime = npc.lastAttackTime || 0
  const now = Date.now()
  if (now - lastRevengeTime < revengeLevel.attackInterval * 1000) {
    return null
  }

  // 找到攻击者的星球
  const attackRecord = npc.attackedBy?.[player.id]
  if (!attackRecord?.planetId) {
    return null
  }

  const targetPlanet = allPlanets.find(p => p.id === attackRecord.planetId)
  if (!targetPlanet) {
    return null
  }

  // 选择NPC最佳星球
  const npcPlanet = selectBestNPCPlanet(npc, targetPlanet.position)
  if (!npcPlanet) {
    return null
  }

  // 根据报复等级计算舰队规模
  const baseFleetRatio = config.attackFleetSizeRatio
  const escalatedRatio = Math.min(1.0, baseFleetRatio * revengeLevel.fleetMultiplier)

  const combatShips = [
    ShipType.LightFighter,
    ShipType.HeavyFighter,
    ShipType.Cruiser,
    ShipType.Battleship,
    ShipType.Bomber,
    ShipType.Destroyer,
    ShipType.Battlecruiser,
    ShipType.Deathstar
  ]

  const revengeFleet: Partial<Fleet> = {}
  let hasShips = false

  for (const shipType of combatShips) {
    const available = npcPlanet.fleet[shipType] || 0
    if (available > 0) {
      const sendCount = Math.max(1, Math.floor(available * escalatedRatio))
      revengeFleet[shipType] = sendCount
      hasShips = true
    }
  }

  if (!hasShips) {
    return null
  }

  // 从NPC星球扣除舰队
  for (const [shipType, count] of Object.entries(revengeFleet)) {
    npcPlanet.fleet[shipType as ShipType] = (npcPlanet.fleet[shipType as ShipType] || 0) - (count as number)
  }

  // 计算飞行时间
  const distance = fleetLogic.calculateDistance(npcPlanet.position, targetPlanet.position)
  const revengeMinSpeed = getFleetMinSpeed(revengeFleet)
  const flightTime = fleetLogic.calculateFlightTime(distance, revengeMinSpeed)

  const mission: FleetMission = {
    id: `npc-revenge-escalated-${revengeLevel.name}-${npc.id}-${now}`,
    playerId: npc.id,
    npcId: npc.id,
    isHostile: true,
    originPlanetId: npcPlanet.id,
    targetPosition: targetPlanet.position,
    targetPlanetId: targetPlanet.id,
    missionType: MissionType.Attack,
    fleet: revengeFleet,
    cargo: { metal: 0, crystal: 0, deuterium: 0, darkMatter: 0, energy: 0 },
    departureTime: now,
    arrivalTime: now + flightTime * 1000,
    status: 'outbound'
  }

  // 更新攻击时间
  npc.lastAttackTime = now

  // 添加到NPC任务列表
  if (!npc.fleetMissions) {
    npc.fleetMissions = []
  }
  npc.fleetMissions.push(mission)

  return mission
}

/**
 * 呼叫盟友NPC助战
 * 在报复等级较高时，可能呼叫盟友一起攻击
 */
export const callAlliesForRevenge = (
  npc: NPC,
  allNpcs: NPC[],
  player: Player,
  allPlanets: Planet[],
  _config: DynamicBehaviorConfig
): FleetMission[] => {
  const { HOSTILE_BEHAVIOR_CONFIG } = DIPLOMATIC_CONFIG
  const escalationConfig = HOSTILE_BEHAVIOR_CONFIG.REVENGE_ESCALATION

  if (!escalationConfig.CALL_ALLIES) {
    return []
  }

  // 获取报复等级
  const revengeLevel = getRevengeLevel(npc, player.id)

  // 计算呼叫盟友概率（报复等级越高概率越大）
  const levelIndex = HOSTILE_BEHAVIOR_CONFIG.REVENGE_ESCALATION.LEVELS.findIndex(l => l.name === revengeLevel.name)
  const allyCallProbability = escalationConfig.ALLY_CALL_BASE_PROBABILITY * (levelIndex + 1)

  if (Math.random() > allyCallProbability) {
    return []
  }

  // 找到NPC的盟友（同样敌对玩家的NPC）
  const allyMissions: FleetMission[] = []
  const attackRecord = npc.attackedBy?.[player.id]
  if (!attackRecord?.planetId) {
    return []
  }

  const targetPlanet = allPlanets.find(p => p.id === attackRecord.planetId)
  if (!targetPlanet) {
    return []
  }

  for (const allyNpc of allNpcs) {
    if (allyNpc.id === npc.id) continue // 跳过自己

    // 检查是否是盟友（也敌对玩家）
    const allyRelation = allyNpc.relations?.[player.id]
    if (!allyRelation || allyRelation.status !== RelationStatus.Hostile) {
      continue
    }

    // 检查NPC之间是否有盟友关系
    const interNpcRelation = allyNpc.allies?.includes(npc.id) || npc.allies?.includes(allyNpc.id)
    if (!interNpcRelation) {
      // 即使不是正式盟友，敌对同一玩家的NPC也有概率响应
      if (Math.random() > 0.3) continue
    }

    // 选择盟友NPC的最佳星球
    const allyPlanet = selectBestNPCPlanet(allyNpc, targetPlanet.position)
    if (!allyPlanet) continue

    // 派出援军舰队（较小规模）
    const combatShips = [ShipType.LightFighter, ShipType.HeavyFighter, ShipType.Cruiser, ShipType.Battleship]

    const allyFleet: Partial<Fleet> = {}
    let hasShips = false

    for (const shipType of combatShips) {
      const available = allyPlanet.fleet[shipType] || 0
      if (available > 0) {
        const sendCount = Math.max(1, Math.floor(available * 0.3)) // 援军派30%
        allyFleet[shipType] = sendCount
        hasShips = true
      }
    }

    if (!hasShips) continue

    // 从盟友星球扣除舰队
    for (const [shipType, count] of Object.entries(allyFleet)) {
      allyPlanet.fleet[shipType as ShipType] = (allyPlanet.fleet[shipType as ShipType] || 0) - (count as number)
    }

    // 计算飞行时间
    const distance = fleetLogic.calculateDistance(allyPlanet.position, targetPlanet.position)
    const allyMinSpeed = getFleetMinSpeed(allyFleet)
    const flightTime = fleetLogic.calculateFlightTime(distance, allyMinSpeed)

    const now = Date.now()
    const mission: FleetMission = {
      id: `npc-ally-revenge-${allyNpc.id}-${now}`,
      playerId: allyNpc.id,
      npcId: allyNpc.id,
      isHostile: true,
      originPlanetId: allyPlanet.id,
      targetPosition: targetPlanet.position,
      targetPlanetId: targetPlanet.id,
      missionType: MissionType.Attack,
      fleet: allyFleet,
      cargo: { metal: 0, crystal: 0, deuterium: 0, darkMatter: 0, energy: 0 },
      departureTime: now,
      arrivalTime: now + flightTime * 1000,
      status: 'outbound'
    }

    // 添加到盟友NPC任务列表
    if (!allyNpc.fleetMissions) {
      allyNpc.fleetMissions = []
    }
    allyNpc.fleetMissions.push(mission)

    allyMissions.push(mission)
  }

  return allyMissions
}

/**
 * 增强版NPC行为更新函数
 * 包含围攻、骚扰、报复升级等增强行为
 */
export const updateHostileNPCBehavior = (
  npc: NPC,
  allNpcs: NPC[],
  player: Player,
  allPlanets: Planet[],
  _debrisFields: Record<string, DebrisField>,
  currentTime: number,
  activeSiege?: SiegeCoordination
): {
  harassMission?: FleetMission
  siegeMissions?: FleetMission[]
  revengeMission?: FleetMission
  allyRevengeMissions?: FleetMission[]
  newSiegeCoordination?: SiegeCoordination
} => {
  const result: {
    harassMission?: FleetMission
    siegeMissions?: FleetMission[]
    revengeMission?: FleetMission
    allyRevengeMissions?: FleetMission[]
    newSiegeCoordination?: SiegeCoordination
  } = {}

  const config = calculateDynamicBehavior(player.points)

  // 检查是否是敌对NPC
  const relation = npc.relations?.[player.id]
  if (!relation || relation.status !== RelationStatus.Hostile) {
    return result
  }

  // 1. 检查报复升级（优先级最高）
  if (npc.revengeTarget === player.id) {
    const revengeMission = executeEscalatedRevenge(npc, player, allPlanets, config)
    if (revengeMission) {
      result.revengeMission = revengeMission

      // 创建警告
      const targetPlanet = allPlanets.find(p => p.id === revengeMission.targetPlanetId)
      if (targetPlanet) {
        const alert = createIncomingFleetAlert(revengeMission, npc, targetPlanet)
        if (!player.incomingFleetAlerts) {
          player.incomingFleetAlerts = []
        }
        player.incomingFleetAlerts.push(alert)
      }

      // 呼叫盟友助战
      const allyMissions = callAlliesForRevenge(npc, allNpcs, player, allPlanets, config)
      if (allyMissions.length > 0) {
        result.allyRevengeMissions = allyMissions

        // 为盟友任务创建警告
        for (const allyMission of allyMissions) {
          const targetPlanet = allPlanets.find(p => p.id === allyMission.targetPlanetId)
          const allyNpc = allNpcs.find(n => n.id === allyMission.npcId)
          if (targetPlanet && allyNpc) {
            const alert = createIncomingFleetAlert(allyMission, allyNpc, targetPlanet)
            player.incomingFleetAlerts.push(alert)
          }
        }
      }

      return result // 报复后不执行其他行为
    }
  }

  // 2. 检查围攻（如果没有正在进行的围攻）
  if (!activeSiege) {
    const { canSiege, eligibleNpcs } = canInitiateSiege(allNpcs, player, currentTime)
    if (canSiege && eligibleNpcs.includes(npc)) {
      // 概率触发围攻
      const { HOSTILE_BEHAVIOR_CONFIG } = DIPLOMATIC_CONFIG
      if (Math.random() < HOSTILE_BEHAVIOR_CONFIG.SIEGE.BASE_PROBABILITY) {
        const siegeResult = initiateSiege(eligibleNpcs, player, allPlanets)
        if (siegeResult) {
          result.siegeMissions = siegeResult.missions
          result.newSiegeCoordination = siegeResult.coordination

          // 为所有围攻任务创建警告
          for (const mission of siegeResult.missions) {
            const targetPlanet = allPlanets.find(p => p.id === mission.targetPlanetId)
            const attackerNpc = allNpcs.find(n => n.id === mission.npcId)
            if (targetPlanet && attackerNpc) {
              const alert = createIncomingFleetAlert(mission, attackerNpc, targetPlanet)
              if (!player.incomingFleetAlerts) {
                player.incomingFleetAlerts = []
              }
              player.incomingFleetAlerts.push(alert)
            }
          }

          return result // 围攻后不执行其他行为
        }
      }
    }
  }

  // 3. 检查骚扰战术
  if (shouldNPCHarass(npc, player, currentTime)) {
    const harassmentType = selectHarassmentType()
    const harassMission = createHarassmentMission(npc, player, allPlanets, harassmentType)
    if (harassMission) {
      result.harassMission = harassMission

      // 创建警告
      const targetPlanet = allPlanets.find(p => p.id === harassMission.targetPlanetId)
      if (targetPlanet) {
        const alert = createIncomingFleetAlert(harassMission, npc, targetPlanet)
        if (!player.incomingFleetAlerts) {
          player.incomingFleetAlerts = []
        }
        player.incomingFleetAlerts.push(alert)
      }
    }
  }

  return result
}

// ========== 中立NPC行为系统 ==========

/**
 * 检查中立NPC是否应该提议贸易
 */
export const shouldNPCOfferTrade = (npc: NPC, player: Player, currentTime: number): boolean => {
  const { NEUTRAL_BEHAVIOR_CONFIG } = DIPLOMATIC_CONFIG
  const tradeConfig = NEUTRAL_BEHAVIOR_CONFIG.TRADE

  if (!tradeConfig.ENABLED) {
    return false
  }

  // 检查玩家当前贸易提议数量是否已达上限
  const maxOffers = (tradeConfig as any).MAX_PENDING_OFFERS || 30
  if ((player.tradeOffers?.length || 0) >= maxOffers) {
    return false
  }

  // 检查外交关系
  const relation = npc.relations?.[player.id]
  if (!relation || relation.status !== RelationStatus.Neutral) {
    return false
  }

  // 检查好感度范围
  if (relation.reputation < tradeConfig.MIN_REPUTATION || relation.reputation > tradeConfig.MAX_REPUTATION) {
    return false
  }

  // 检查贸易冷却
  const lastTradeTime = (npc as any).lastTradeOfferTime || 0
  if (currentTime - lastTradeTime < tradeConfig.CHECK_INTERVAL * 1000) {
    return false
  }

  // 概率判断
  return Math.random() < tradeConfig.PROBABILITY
}

/**
 * 创建贸易提议
 */
export const createTradeOffer = (npc: NPC, player: Player): TradeOffer | null => {
  const { NEUTRAL_BEHAVIOR_CONFIG } = DIPLOMATIC_CONFIG
  const tradeConfig = NEUTRAL_BEHAVIOR_CONFIG.TRADE

  // 获取NPC主星球
  const npcPlanet = npc.planets[0]
  if (!npcPlanet) return null

  // 计算玩家总产量
  const playerProduction = calculatePlayerTotalProduction(player)

  // 随机决定贸易量
  const tradeMultiplier = tradeConfig.TRADE_AMOUNT.min + Math.random() * (tradeConfig.TRADE_AMOUNT.max - tradeConfig.TRADE_AMOUNT.min)

  // 随机选择交易类型
  const tradeTypes: Array<{ offer: 'metal' | 'crystal' | 'deuterium'; request: 'metal' | 'crystal' | 'deuterium'; rate: number }> = [
    { offer: 'crystal', request: 'metal', rate: tradeConfig.EXCHANGE_RATES.metalToCrystal },
    { offer: 'deuterium', request: 'metal', rate: tradeConfig.EXCHANGE_RATES.metalToDeuterium },
    { offer: 'deuterium', request: 'crystal', rate: tradeConfig.EXCHANGE_RATES.crystalToDeuterium }
  ]

  const selectedTrade = tradeTypes[Math.floor(Math.random() * tradeTypes.length)]
  if (!selectedTrade) return null

  // 计算交易量（基于玩家产量和NPC资源）
  const baseAmount = playerProduction[selectedTrade.request] * tradeMultiplier
  const npcHas = Math.floor(npcPlanet.resources[selectedTrade.offer] || 0)

  // 验证基础数值有效性
  if (!isFinite(baseAmount) || baseAmount <= 0 || !isFinite(npcHas) || npcHas <= 0) {
    return null
  }

  // NPC提供的资源量
  const offerAmount = Math.min(Math.floor(baseAmount / selectedTrade.rate), npcHas)
  if (!isFinite(offerAmount) || offerAmount <= 0) return null

  // 玩家需要支付的资源量（含手续费）
  const requestAmount = Math.floor(offerAmount * selectedTrade.rate * (1 + tradeConfig.FEE_PERCENTAGE / 100))
  if (!isFinite(requestAmount) || requestAmount <= 0) return null

  const now = Date.now()
  const offer: TradeOffer = {
    id: `trade-${npc.id}-${now}`,
    npcId: npc.id,
    npcName: npc.name,
    timestamp: now,
    offeredResources: {
      type: selectedTrade.offer,
      amount: offerAmount
    },
    requestedResources: {
      type: selectedTrade.request,
      amount: requestAmount
    },
    expiresAt: now + 30 * 60 * 1000, // 30分钟后过期
    status: 'pending'
  }

  // 更新NPC的贸易时间
  ;(npc as any).lastTradeOfferTime = now

  return offer
}

/**
 * 处理贸易接受
 */
export const acceptTradeOffer = (
  offer: TradeOffer,
  npc: NPC,
  player: Player,
  playerPlanet: Planet
): { success: boolean; reason?: string } => {
  const { NEUTRAL_BEHAVIOR_CONFIG } = DIPLOMATIC_CONFIG
  const tradeConfig = NEUTRAL_BEHAVIOR_CONFIG.TRADE

  // 检查贸易是否过期
  if (Date.now() > offer.expiresAt) {
    offer.status = 'expired'
    return { success: false, reason: 'errors.tradeExpired' }
  }

  // 检查玩家是否有足够资源
  const playerHas = playerPlanet.resources[offer.requestedResources.type]
  if (playerHas < offer.requestedResources.amount) {
    return { success: false, reason: 'errors.insufficientResources' }
  }

  // 获取NPC主星球
  const npcPlanet = npc.planets[0]
  if (!npcPlanet) {
    return { success: false, reason: 'errors.npcPlanetNotFound' }
  }

  // 检查NPC是否还有足够资源
  const npcHas = npcPlanet.resources[offer.offeredResources.type]
  if (npcHas < offer.offeredResources.amount) {
    return { success: false, reason: 'errors.npcInsufficientResources' }
  }

  // 执行交易
  // 从玩家扣除
  playerPlanet.resources[offer.requestedResources.type] -= offer.requestedResources.amount

  // 给玩家资源
  playerPlanet.resources[offer.offeredResources.type] += offer.offeredResources.amount

  // 从NPC扣除
  npcPlanet.resources[offer.offeredResources.type] -= offer.offeredResources.amount

  // 给NPC资源
  npcPlanet.resources[offer.requestedResources.type] += offer.requestedResources.amount

  // 增加好感度
  const relation = npc.relations?.[player.id]
  if (relation) {
    relation.reputation = Math.min(DIPLOMATIC_CONFIG.MAX_REPUTATION, relation.reputation + tradeConfig.REPUTATION_GAIN)
    relation.lastUpdated = Date.now()
  }

  offer.status = 'accepted'
  return { success: true }
}

/**
 * 检查中立NPC是否应该摇摆态度
 */
export const shouldNPCSwingAttitude = (
  npc: NPC,
  player: Player,
  currentTime: number
): { shouldSwing: boolean; direction?: 'friendly' | 'hostile' } => {
  const { NEUTRAL_BEHAVIOR_CONFIG } = DIPLOMATIC_CONFIG
  const swingConfig = NEUTRAL_BEHAVIOR_CONFIG.SWING

  if (!swingConfig.ENABLED) {
    return { shouldSwing: false }
  }

  // 检查外交关系
  const relation = npc.relations?.[player.id]
  if (!relation || relation.status !== RelationStatus.Neutral) {
    return { shouldSwing: false }
  }

  // 检查摇摆冷却
  const lastSwingCheck = (npc as any).lastSwingCheck || 0
  if (currentTime - lastSwingCheck < swingConfig.CHECK_INTERVAL * 1000) {
    return { shouldSwing: false }
  }

  // 更新检查时间
  ;(npc as any).lastSwingCheck = currentTime

  // 检查是否达到摇摆阈值
  if (relation.reputation >= swingConfig.SWING_THRESHOLD.toFriendly) {
    // 好感度足够高，可能变友好
    const probability = swingConfig.BASE_PROBABILITY * (relation.reputation / 20)
    if (Math.random() < probability) {
      return { shouldSwing: true, direction: 'friendly' }
    }
  } else if (relation.reputation <= swingConfig.SWING_THRESHOLD.toHostile) {
    // 好感度足够低，可能变敌对
    const probability = swingConfig.BASE_PROBABILITY * (Math.abs(relation.reputation) / 20)
    if (Math.random() < probability) {
      return { shouldSwing: true, direction: 'hostile' }
    }
  }

  return { shouldSwing: false }
}

/**
 * 执行NPC态度摇摆
 */
export const executeNPCSwing = (npc: NPC, player: Player, direction: 'friendly' | 'hostile'): void => {
  const relation = npc.relations?.[player.id]
  if (!relation) return

  if (direction === 'friendly') {
    relation.status = RelationStatus.Friendly
    relation.reputation = Math.max(relation.reputation, DIPLOMATIC_CONFIG.FRIENDLY_THRESHOLD + 5)
  } else {
    relation.status = RelationStatus.Hostile
    relation.reputation = Math.min(relation.reputation, DIPLOMATIC_CONFIG.HOSTILE_THRESHOLD - 5)
  }

  relation.lastUpdated = Date.now()
}

/**
 * 中立NPC观察附近事件并调整好感度
 */
export const observeNearbyEvents = (neutralNpc: NPC, eventNpc: NPC, player: Player, eventType: 'attack' | 'help'): void => {
  const { NEUTRAL_BEHAVIOR_CONFIG } = DIPLOMATIC_CONFIG
  const observeConfig = NEUTRAL_BEHAVIOR_CONFIG.OBSERVE

  if (!observeConfig.ENABLED) return

  // 检查是否是中立NPC
  const relation = neutralNpc.relations?.[player.id]
  if (!relation || relation.status !== RelationStatus.Neutral) return

  // 检查是否在同一星系（如果配置要求）
  if (observeConfig.SAME_GALAXY_ONLY) {
    const neutralPlanet = neutralNpc.planets[0]
    const eventPlanet = eventNpc.planets[0]
    if (!neutralPlanet || !eventPlanet) return
    if (neutralPlanet.position.galaxy !== eventPlanet.position.galaxy) return
  }

  // 根据事件类型调整好感度
  if (eventType === 'attack') {
    relation.reputation = Math.max(DIPLOMATIC_CONFIG.MIN_REPUTATION, relation.reputation + observeConfig.ATTACK_NEARBY_PENALTY)
  } else if (eventType === 'help') {
    relation.reputation = Math.min(DIPLOMATIC_CONFIG.MAX_REPUTATION, relation.reputation + observeConfig.HELP_NEARBY_BONUS)
  }

  relation.lastUpdated = Date.now()
}

// ========== 友好NPC增强行为系统 ==========

/**
 * 检查友好NPC是否应该分享情报
 */
export const shouldNPCShareIntel = (npc: NPC, player: Player, currentTime: number): boolean => {
  const { FRIENDLY_BEHAVIOR_CONFIG } = DIPLOMATIC_CONFIG
  const intelConfig = FRIENDLY_BEHAVIOR_CONFIG.INTEL_SHARING

  if (!intelConfig.ENABLED) {
    return false
  }

  // 检查外交关系
  const relation = npc.relations?.[player.id]
  if (!relation || relation.status !== RelationStatus.Friendly) {
    return false
  }

  // 检查好感度
  if (relation.reputation < intelConfig.MIN_REPUTATION) {
    return false
  }

  // 检查分享冷却
  const lastIntelTime = (npc as any).lastIntelShareTime || 0
  if (currentTime - lastIntelTime < intelConfig.INTERVAL * 1000) {
    return false
  }

  // 概率判断
  return Math.random() < intelConfig.PROBABILITY
}

/**
 * 选择情报类型
 */
export const selectIntelType = (): IntelType => {
  const { FRIENDLY_BEHAVIOR_CONFIG } = DIPLOMATIC_CONFIG
  const types = FRIENDLY_BEHAVIOR_CONFIG.INTEL_SHARING.INTEL_TYPES

  const rand = Math.random()
  if (rand < types.enemyFleet) {
    return 'enemyFleet'
  } else if (rand < types.enemyFleet + types.enemyResources) {
    return 'enemyResources'
  } else {
    return 'enemyMovement'
  }
}

/**
 * 创建情报报告
 */
export const createIntelReport = (friendlyNpc: NPC, allNpcs: NPC[], player: Player): IntelReport | null => {
  // 找到一个敌对NPC作为情报目标
  const hostileNpcs = allNpcs.filter(n => {
    const relation = n.relations?.[player.id]
    return relation && relation.status === RelationStatus.Hostile
  })

  if (hostileNpcs.length === 0) return null

  const targetNpc = hostileNpcs[Math.floor(Math.random() * hostileNpcs.length)]
  if (!targetNpc) return null

  const targetPlanet = targetNpc.planets[0]
  if (!targetPlanet) return null

  const intelType = selectIntelType()
  const now = Date.now()

  const report: IntelReport = {
    id: `intel-${friendlyNpc.id}-${now}`,
    fromNpcId: friendlyNpc.id,
    fromNpcName: friendlyNpc.name,
    timestamp: now,
    targetNpcId: targetNpc.id,
    targetNpcName: targetNpc.name,
    intelType,
    data: {},
    read: false
  }

  // 根据情报类型填充数据
  switch (intelType) {
    case 'enemyFleet':
      report.data.fleet = { ...targetPlanet.fleet }
      break
    case 'enemyResources':
      report.data.resources = { ...targetPlanet.resources }
      break
    case 'enemyMovement':
      // 检查NPC是否有正在进行的任务
      const activeMission = targetNpc.fleetMissions?.find(m => m.status === 'outbound')
      if (activeMission) {
        report.data.movement = {
          targetPosition: activeMission.targetPosition,
          arrivalTime: activeMission.arrivalTime,
          missionType: activeMission.missionType
        }
      } else {
        // 没有活动任务，改为分享舰队信息
        report.intelType = 'enemyFleet'
        report.data.fleet = { ...targetPlanet.fleet }
      }
      break
  }

  // 更新NPC的情报分享时间
  ;(friendlyNpc as any).lastIntelShareTime = now

  return report
}

/**
 * 检查友好NPC是否应该邀请联合攻击
 */
export const shouldNPCInviteJointAttack = (npc: NPC, player: Player, currentTime: number): boolean => {
  const { FRIENDLY_BEHAVIOR_CONFIG } = DIPLOMATIC_CONFIG
  const jointConfig = FRIENDLY_BEHAVIOR_CONFIG.JOINT_ATTACK

  if (!jointConfig.ENABLED) {
    return false
  }

  // 检查外交关系
  const relation = npc.relations?.[player.id]
  if (!relation || relation.status !== RelationStatus.Friendly) {
    return false
  }

  // 检查好感度
  if (relation.reputation < jointConfig.MIN_REPUTATION) {
    return false
  }

  // 检查邀请冷却
  const lastInviteTime = (npc as any).lastJointAttackInvite || 0
  if (currentTime - lastInviteTime < jointConfig.INTERVAL * 1000) {
    return false
  }

  // 概率判断
  return Math.random() < jointConfig.PROBABILITY
}

/**
 * 创建联合攻击邀请
 */
export const createJointAttackInvite = (friendlyNpc: NPC, allNpcs: NPC[], player: Player): JointAttackInvite | null => {
  const { FRIENDLY_BEHAVIOR_CONFIG } = DIPLOMATIC_CONFIG
  const jointConfig = FRIENDLY_BEHAVIOR_CONFIG.JOINT_ATTACK

  // 找到合适的攻击目标
  let targetNpc: NPC | null = null

  if (jointConfig.PREFER_COMMON_ENEMY) {
    // 优先选择共同敌人（对友好NPC也敌对的NPC）
    const commonEnemies = allNpcs.filter(n => {
      const playerRelation = n.relations?.[player.id]
      const npcRelation = n.relations?.[friendlyNpc.id]
      return playerRelation?.status === RelationStatus.Hostile && npcRelation?.status === RelationStatus.Hostile
    })
    if (commonEnemies.length > 0) {
      targetNpc = commonEnemies[Math.floor(Math.random() * commonEnemies.length)] || null
    }
  }

  // 如果没有共同敌人，选择任意敌对NPC
  if (!targetNpc) {
    const hostileNpcs = allNpcs.filter(n => {
      const relation = n.relations?.[player.id]
      return relation && relation.status === RelationStatus.Hostile
    })
    if (hostileNpcs.length > 0) {
      targetNpc = hostileNpcs[Math.floor(Math.random() * hostileNpcs.length)] || null
    }
  }

  if (!targetNpc) return null

  const targetPlanet = targetNpc.planets[0]
  if (!targetPlanet) return null

  // 计算NPC承诺的舰队
  const npcPlanet = friendlyNpc.planets[0]
  if (!npcPlanet) return null

  const fleetRatio = jointConfig.NPC_FLEET_RATIO.min + Math.random() * (jointConfig.NPC_FLEET_RATIO.max - jointConfig.NPC_FLEET_RATIO.min)

  const combatShips = [
    ShipType.LightFighter,
    ShipType.HeavyFighter,
    ShipType.Cruiser,
    ShipType.Battleship,
    ShipType.Bomber,
    ShipType.Destroyer
  ]

  const committedFleet: Partial<Fleet> = {}
  let hasShips = false

  for (const shipType of combatShips) {
    const available = npcPlanet.fleet[shipType] || 0
    if (available > 0) {
      const commitCount = Math.floor(available * fleetRatio)
      if (commitCount > 0) {
        committedFleet[shipType] = commitCount
        hasShips = true
      }
    }
  }

  if (!hasShips) return null

  const now = Date.now()
  const invite: JointAttackInvite = {
    id: `joint-attack-${friendlyNpc.id}-${now}`,
    fromNpcId: friendlyNpc.id,
    fromNpcName: friendlyNpc.name,
    timestamp: now,
    targetNpcId: targetNpc.id,
    targetNpcName: targetNpc.name,
    targetPlanetId: targetPlanet.id,
    targetPosition: targetPlanet.position,
    npcFleetCommitment: committedFleet,
    expectedLootRatio: jointConfig.PLAYER_LOOT_RATIO,
    expiresAt: now + 2 * 60 * 60 * 1000, // 2小时后过期
    status: 'pending'
  }

  // 更新NPC的邀请时间
  ;(friendlyNpc as any).lastJointAttackInvite = now

  return invite
}

/**
 * 检查友好NPC是否应该提供资源援助
 */
export const shouldNPCProvideAid = (npc: NPC, player: Player, currentTime: number): boolean => {
  const { FRIENDLY_BEHAVIOR_CONFIG } = DIPLOMATIC_CONFIG
  const aidConfig = FRIENDLY_BEHAVIOR_CONFIG.RESOURCE_AID

  if (!aidConfig.ENABLED) {
    return false
  }

  // 检查外交关系
  const relation = npc.relations?.[player.id]
  if (!relation || relation.status !== RelationStatus.Friendly) {
    return false
  }

  // 检查好感度
  if (relation.reputation < aidConfig.MIN_REPUTATION) {
    return false
  }

  // 检查援助冷却
  const lastAidTime = (npc as any).lastAidTime || 0
  if (currentTime - lastAidTime < aidConfig.CHECK_INTERVAL * 1000) {
    return false
  }

  // 检查玩家是否资源紧张
  const playerProduction = calculatePlayerTotalProduction(player)
  const lowResourceThreshold = {
    metal: playerProduction.metal * aidConfig.TRIGGER_LOW_RESOURCES_HOURS,
    crystal: playerProduction.crystal * aidConfig.TRIGGER_LOW_RESOURCES_HOURS,
    deuterium: playerProduction.deuterium * aidConfig.TRIGGER_LOW_RESOURCES_HOURS
  }

  // 检查玩家总资源
  let totalPlayerResources = { metal: 0, crystal: 0, deuterium: 0 }
  for (const planet of player.planets) {
    totalPlayerResources.metal += planet.resources.metal
    totalPlayerResources.crystal += planet.resources.crystal
    totalPlayerResources.deuterium += planet.resources.deuterium
  }

  // 如果玩家资源充足，不援助
  if (
    totalPlayerResources.metal > lowResourceThreshold.metal &&
    totalPlayerResources.crystal > lowResourceThreshold.crystal &&
    totalPlayerResources.deuterium > lowResourceThreshold.deuterium
  ) {
    return false
  }

  // 概率判断
  return Math.random() < aidConfig.PROBABILITY
}

/**
 * 执行资源援助
 */
export const executeResourceAid = (npc: NPC, player: Player): Resources | null => {
  const { FRIENDLY_BEHAVIOR_CONFIG } = DIPLOMATIC_CONFIG
  const aidConfig = FRIENDLY_BEHAVIOR_CONFIG.RESOURCE_AID

  // 获取NPC主星球
  const npcPlanet = npc.planets[0]
  if (!npcPlanet) return null

  // 计算援助量
  const playerProduction = calculatePlayerTotalProduction(player)
  const aidAmount = {
    metal: Math.floor(playerProduction.metal * aidConfig.AID_AMOUNT_HOURS),
    crystal: Math.floor(playerProduction.crystal * aidConfig.AID_AMOUNT_HOURS),
    deuterium: Math.floor(playerProduction.deuterium * aidConfig.AID_AMOUNT_HOURS),
    darkMatter: 0,
    energy: 0
  }

  // 限制为NPC实际拥有的资源
  aidAmount.metal = Math.min(aidAmount.metal, Math.floor(npcPlanet.resources.metal * 0.5))
  aidAmount.crystal = Math.min(aidAmount.crystal, Math.floor(npcPlanet.resources.crystal * 0.5))
  aidAmount.deuterium = Math.min(aidAmount.deuterium, Math.floor(npcPlanet.resources.deuterium * 0.5))

  // 如果援助量太少，不援助
  if (aidAmount.metal <= 0 && aidAmount.crystal <= 0 && aidAmount.deuterium <= 0) {
    return null
  }

  // 从NPC扣除
  npcPlanet.resources.metal -= aidAmount.metal
  npcPlanet.resources.crystal -= aidAmount.crystal
  npcPlanet.resources.deuterium -= aidAmount.deuterium

  // 给玩家主星球
  const playerMainPlanet = player.planets[0]
  if (playerMainPlanet) {
    playerMainPlanet.resources.metal += aidAmount.metal
    playerMainPlanet.resources.crystal += aidAmount.crystal
    playerMainPlanet.resources.deuterium += aidAmount.deuterium
  }

  // 更新援助时间
  ;(npc as any).lastAidTime = Date.now()

  return aidAmount
}

/**
 * 更新中立NPC行为
 */
export const updateNeutralNPCBehavior = (
  npc: NPC,
  _allNpcs: NPC[],
  player: Player,
  currentTime: number
): {
  tradeOffer?: TradeOffer
  swingDirection?: 'friendly' | 'hostile'
} => {
  const result: {
    tradeOffer?: TradeOffer
    swingDirection?: 'friendly' | 'hostile'
  } = {}

  // 检查是否是中立NPC
  const relation = npc.relations?.[player.id]
  if (!relation || relation.status !== RelationStatus.Neutral) {
    return result
  }

  // 1. 检查贸易提议
  if (shouldNPCOfferTrade(npc, player, currentTime)) {
    const offer = createTradeOffer(npc, player)
    if (offer) {
      result.tradeOffer = offer
    }
  }

  // 2. 检查态度摇摆
  const swingResult = shouldNPCSwingAttitude(npc, player, currentTime)
  if (swingResult.shouldSwing && swingResult.direction) {
    executeNPCSwing(npc, player, swingResult.direction)
    result.swingDirection = swingResult.direction
  }

  return result
}

/**
 * 更新友好NPC行为
 */
export const updateFriendlyNPCBehavior = (
  npc: NPC,
  allNpcs: NPC[],
  player: Player,
  currentTime: number
): {
  intelReport?: IntelReport
  jointAttackInvite?: JointAttackInvite
  aidProvided?: Resources
} => {
  const result: {
    intelReport?: IntelReport
    jointAttackInvite?: JointAttackInvite
    aidProvided?: Resources
  } = {}

  // 检查是否是友好NPC
  const relation = npc.relations?.[player.id]
  if (!relation || relation.status !== RelationStatus.Friendly) {
    return result
  }

  // 1. 检查情报分享
  if (shouldNPCShareIntel(npc, player, currentTime)) {
    const report = createIntelReport(npc, allNpcs, player)
    if (report) {
      result.intelReport = report
    }
  }

  // 2. 检查联合攻击邀请
  if (shouldNPCInviteJointAttack(npc, player, currentTime)) {
    const invite = createJointAttackInvite(npc, allNpcs, player)
    if (invite) {
      result.jointAttackInvite = invite
    }
  }

  // 3. 检查资源援助
  if (shouldNPCProvideAid(npc, player, currentTime)) {
    const aid = executeResourceAid(npc, player)
    if (aid) {
      result.aidProvided = aid
    }
  }

  return result
}

/**
 * 综合NPC行为更新函数
 * 根据NPC与玩家的关系状态调用相应的行为更新
 */
export const updateAllNPCBehaviors = (
  npcs: NPC[],
  player: Player,
  allPlanets: Planet[],
  debrisFields: Record<string, DebrisField>,
  currentTime: number,
  activeSiege?: SiegeCoordination
): {
  hostileResults: Map<string, ReturnType<typeof updateHostileNPCBehavior>>
  neutralResults: Map<string, ReturnType<typeof updateNeutralNPCBehavior>>
  friendlyResults: Map<string, ReturnType<typeof updateFriendlyNPCBehavior>>
  newSiegeCoordination?: SiegeCoordination
} => {
  const hostileResults = new Map<string, ReturnType<typeof updateHostileNPCBehavior>>()
  const neutralResults = new Map<string, ReturnType<typeof updateNeutralNPCBehavior>>()
  const friendlyResults = new Map<string, ReturnType<typeof updateFriendlyNPCBehavior>>()
  let newSiegeCoordination: SiegeCoordination | undefined

  for (const npc of npcs) {
    const relation = npc.relations?.[player.id]

    if (relation?.status === RelationStatus.Hostile) {
      // 敌对NPC
      const result = updateHostileNPCBehavior(npc, npcs, player, allPlanets, debrisFields, currentTime, activeSiege)
      hostileResults.set(npc.id, result)
      if (result.newSiegeCoordination) {
        newSiegeCoordination = result.newSiegeCoordination
      }
    } else if (relation?.status === RelationStatus.Neutral) {
      // 中立NPC
      const result = updateNeutralNPCBehavior(npc, npcs, player, currentTime)
      neutralResults.set(npc.id, result)
    } else if (relation?.status === RelationStatus.Friendly) {
      // 友好NPC
      const result = updateFriendlyNPCBehavior(npc, npcs, player, currentTime)
      friendlyResults.set(npc.id, result)
    }
  }

  return {
    hostileResults,
    neutralResults,
    friendlyResults,
    newSiegeCoordination
  }
}

// ========== NPC联盟系统 ==========

/**
 * 获取NPC之间的AI类型兼容性分数
 */
export const getAITypeCompatibility = (type1?: NPCAIType, type2?: NPCAIType): number => {
  const { NPC_ALLIANCE_CONFIG } = DIPLOMATIC_CONFIG
  const compatibility = NPC_ALLIANCE_CONFIG.INTER_NPC_RELATIONS.TYPE_COMPATIBILITY

  // 默认类型为平衡型
  const t1 = type1 || NPCAIType.Balanced
  const t2 = type2 || NPCAIType.Balanced

  // 商人型与任何类型都友好
  if (t1 === NPCAIType.Trader || t2 === NPCAIType.Trader) {
    return compatibility.trader_any
  }

  // 侵略型与防守型互为敌人
  if ((t1 === NPCAIType.Aggressive && t2 === NPCAIType.Defensive) || (t1 === NPCAIType.Defensive && t2 === NPCAIType.Aggressive)) {
    return compatibility.aggressive_defensive
  }

  // 扩张型互相竞争
  if (t1 === NPCAIType.Expansionist && t2 === NPCAIType.Expansionist) {
    return compatibility.expansionist_expansionist
  }

  // 平衡型保持中立
  if (t1 === NPCAIType.Balanced || t2 === NPCAIType.Balanced) {
    return compatibility.balanced_any
  }

  // 默认中立
  return 0
}

/**
 * 初始化NPC之间的关系
 */
export const initializeInterNPCRelations = (npcs: NPC[]): void => {
  const { NPC_ALLIANCE_CONFIG } = DIPLOMATIC_CONFIG

  if (!NPC_ALLIANCE_CONFIG.ENABLED) return

  const config = NPC_ALLIANCE_CONFIG.INTER_NPC_RELATIONS

  for (const npc of npcs) {
    if (!npc.allies) npc.allies = []
    if (!npc.enemies) npc.enemies = []

    const npcPlanet = npc.planets[0]
    if (!npcPlanet) continue

    for (const otherNpc of npcs) {
      if (npc.id === otherNpc.id) continue

      const otherPlanet = otherNpc.planets[0]
      if (!otherPlanet) continue

      // 计算关系分数
      let relationScore = 0

      // 1. AI类型兼容性
      const typeCompatibility = getAITypeCompatibility(npc.aiType, otherNpc.aiType)
      relationScore += typeCompatibility * 50 // 将-1到1映射到-50到50

      // 2. 同一星系加成
      if (npcPlanet.position.galaxy === otherPlanet.position.galaxy) {
        relationScore += config.SAME_GALAXY_ALLY_BONUS * 100 // 30点加成
      }

      // 3. 随机因素（如果是mixed模式）
      if (config.INIT_MODE === 'mixed' || config.INIT_MODE === 'random') {
        relationScore += (Math.random() - 0.5) * 40 // -20到20的随机值
      }

      // 根据分数决定关系
      if (relationScore > 30) {
        // 盟友
        if (!npc.allies.includes(otherNpc.id)) {
          npc.allies.push(otherNpc.id)
        }
      } else if (relationScore < -30) {
        // 敌人
        if (!npc.enemies.includes(otherNpc.id)) {
          npc.enemies.push(otherNpc.id)
        }
      }
      // 否则保持中立
    }
  }
}

/**
 * 传播连坐效应
 * 当玩家攻击/帮助NPC时，影响其盟友的好感度
 */
export const propagateGuiltByAssociation = (
  targetNpc: NPC,
  allNpcs: NPC[],
  player: Player,
  eventType: 'attack' | 'help',
  depth: number = 0
): void => {
  const { NPC_ALLIANCE_CONFIG } = DIPLOMATIC_CONFIG
  const guiltConfig = NPC_ALLIANCE_CONFIG.GUILT_BY_ASSOCIATION

  if (!guiltConfig.ENABLED) return
  if (depth >= guiltConfig.MAX_PROPAGATION_DEPTH) return

  // 获取目标NPC的盟友
  const allies = targetNpc.allies || []

  for (const allyId of allies) {
    const allyNpc = allNpcs.find(n => n.id === allyId)
    if (!allyNpc) continue

    // 获取盟友与玩家的关系
    const relation = allyNpc.relations?.[player.id]
    if (!relation) continue

    // 计算好感度变化
    let reputationChange = eventType === 'attack' ? guiltConfig.ALLY_REPUTATION_PENALTY : guiltConfig.ALLY_REPUTATION_BONUS

    // 如果启用强度乘数，根据传播深度减弱效果
    if (guiltConfig.STRENGTH_MULTIPLIER) {
      reputationChange = Math.floor(reputationChange * Math.pow(0.5, depth))
    }

    // 应用好感度变化
    relation.reputation = Math.max(
      DIPLOMATIC_CONFIG.MIN_REPUTATION,
      Math.min(DIPLOMATIC_CONFIG.MAX_REPUTATION, relation.reputation + reputationChange)
    )
    relation.lastUpdated = Date.now()

    // 更新关系状态
    if (relation.reputation < DIPLOMATIC_CONFIG.HOSTILE_THRESHOLD) {
      relation.status = RelationStatus.Hostile
    } else if (relation.reputation > DIPLOMATIC_CONFIG.FRIENDLY_THRESHOLD) {
      relation.status = RelationStatus.Friendly
    } else {
      relation.status = RelationStatus.Neutral
    }

    // 递归传播到盟友的盟友
    propagateGuiltByAssociation(allyNpc, allNpcs, player, eventType, depth + 1)
  }
}

/**
 * NPC盟友互助：当NPC被攻击时，盟友可能响应
 */
export const checkAllyMutualDefense = (
  attackedNpc: NPC,
  attackerPlayerId: string,
  allNpcs: NPC[],
  allPlanets: Planet[],
  currentTime: number
): FleetMission[] => {
  const { NPC_ALLIANCE_CONFIG } = DIPLOMATIC_CONFIG
  const defenseConfig = NPC_ALLIANCE_CONFIG.MUTUAL_DEFENSE

  if (!defenseConfig.ENABLED) return []

  const defenseMissions: FleetMission[] = []
  const allies = attackedNpc.allies || []

  // 找到攻击者的星球
  const attackerPlanet = allPlanets.find(p => p.ownerId === attackerPlayerId)
  if (!attackerPlanet) return []

  for (const allyId of allies) {
    const allyNpc = allNpcs.find(n => n.id === allyId)
    if (!allyNpc) continue

    // 检查响应冷却
    const lastDefenseTime = (allyNpc as any).lastMutualDefenseTime || 0
    if (currentTime - lastDefenseTime < defenseConfig.COOLDOWN * 1000) {
      continue
    }

    // 概率检查
    if (Math.random() > defenseConfig.RESPONSE_PROBABILITY) {
      continue
    }

    // 选择盟友最佳星球
    const allyPlanet = selectBestNPCPlanet(allyNpc, attackerPlanet.position)
    if (!allyPlanet) continue

    // 计算响应舰队
    const fleetRatio = defenseConfig.FLEET_RATIO.min + Math.random() * (defenseConfig.FLEET_RATIO.max - defenseConfig.FLEET_RATIO.min)

    const combatShips = [
      ShipType.LightFighter,
      ShipType.HeavyFighter,
      ShipType.Cruiser,
      ShipType.Battleship,
      ShipType.Bomber,
      ShipType.Destroyer
    ]

    const defenseFleet: Partial<Fleet> = {}
    let hasShips = false

    for (const shipType of combatShips) {
      const available = allyPlanet.fleet[shipType] || 0
      if (available > 0) {
        const sendCount = Math.max(1, Math.floor(available * fleetRatio))
        defenseFleet[shipType] = sendCount
        hasShips = true
      }
    }

    if (!hasShips) continue

    // 从盟友星球扣除舰队
    for (const [shipType, count] of Object.entries(defenseFleet)) {
      allyPlanet.fleet[shipType as ShipType] = (allyPlanet.fleet[shipType as ShipType] || 0) - (count as number)
    }

    // 计算飞行时间
    const distance = fleetLogic.calculateDistance(allyPlanet.position, attackerPlanet.position)
    const defenseMinSpeed = getFleetMinSpeed(defenseFleet)
    const flightTime = fleetLogic.calculateFlightTime(distance, defenseMinSpeed)

    const now = Date.now()
    const mission: FleetMission = {
      id: `npc-mutual-defense-${allyNpc.id}-${now}`,
      playerId: allyNpc.id,
      npcId: allyNpc.id,
      isHostile: true,
      originPlanetId: allyPlanet.id,
      targetPosition: attackerPlanet.position,
      targetPlanetId: attackerPlanet.id,
      missionType: MissionType.Attack,
      fleet: defenseFleet,
      cargo: { metal: 0, crystal: 0, deuterium: 0, darkMatter: 0, energy: 0 },
      departureTime: now,
      arrivalTime: now + flightTime * 1000,
      status: 'outbound'
    }

    // 更新响应时间
    ;(allyNpc as any).lastMutualDefenseTime = now

    // 添加到盟友NPC任务列表
    if (!allyNpc.fleetMissions) {
      allyNpc.fleetMissions = []
    }
    allyNpc.fleetMissions.push(mission)

    defenseMissions.push(mission)
  }

  return defenseMissions
}

/**
 * NPC之间的资源共享
 */
export const executeNPCResourceSharing = (npcs: NPC[], currentTime: number): void => {
  const { NPC_ALLIANCE_CONFIG } = DIPLOMATIC_CONFIG
  const sharingConfig = NPC_ALLIANCE_CONFIG.RESOURCE_SHARING

  if (!sharingConfig.ENABLED) return

  for (const npc of npcs) {
    // 检查共享冷却
    const lastShareTime = (npc as any).lastResourceShareTime || 0
    if (currentTime - lastShareTime < sharingConfig.INTERVAL * 1000) {
      continue
    }

    const npcPlanet = npc.planets[0]
    if (!npcPlanet) continue

    const allies = npc.allies || []
    if (allies.length === 0) continue

    // 计算可共享资源
    const shareAmount = {
      metal: Math.floor(npcPlanet.resources.metal * sharingConfig.SHARE_RATIO),
      crystal: Math.floor(npcPlanet.resources.crystal * sharingConfig.SHARE_RATIO),
      deuterium: Math.floor(npcPlanet.resources.deuterium * sharingConfig.SHARE_RATIO)
    }

    // 平均分配给所有盟友
    const perAlly = {
      metal: Math.floor(shareAmount.metal / allies.length),
      crystal: Math.floor(shareAmount.crystal / allies.length),
      deuterium: Math.floor(shareAmount.deuterium / allies.length)
    }

    if (perAlly.metal <= 0 && perAlly.crystal <= 0 && perAlly.deuterium <= 0) {
      continue
    }

    // 从NPC扣除
    npcPlanet.resources.metal -= perAlly.metal * allies.length
    npcPlanet.resources.crystal -= perAlly.crystal * allies.length
    npcPlanet.resources.deuterium -= perAlly.deuterium * allies.length

    // 分配给盟友
    for (const allyId of allies) {
      const allyNpc = npcs.find(n => n.id === allyId)
      if (!allyNpc) continue

      const allyPlanet = allyNpc.planets[0]
      if (!allyPlanet) continue

      allyPlanet.resources.metal += perAlly.metal
      allyPlanet.resources.crystal += perAlly.crystal
      allyPlanet.resources.deuterium += perAlly.deuterium
    }

    // 更新共享时间
    ;(npc as any).lastResourceShareTime = currentTime
  }
}

/**
 * 获取NPC的所有盟友信息
 */
export const getNPCAllies = (npc: NPC, allNpcs: NPC[]): NPC[] => {
  const allies: NPC[] = []
  const allyIds = npc.allies || []

  for (const allyId of allyIds) {
    const allyNpc = allNpcs.find(n => n.id === allyId)
    if (allyNpc) {
      allies.push(allyNpc)
    }
  }

  return allies
}

/**
 * 获取NPC的所有敌人信息
 */
export const getNPCEnemies = (npc: NPC, allNpcs: NPC[]): NPC[] => {
  const enemies: NPC[] = []
  const enemyIds = npc.enemies || []

  for (const enemyId of enemyIds) {
    const enemyNpc = allNpcs.find(n => n.id === enemyId)
    if (enemyNpc) {
      enemies.push(enemyNpc)
    }
  }

  return enemies
}

/**
 * 增强版NPC被攻击处理
 * 包含连坐效应和盟友互助
 */
export const handleNPCAttackedWithAlliance = (
  npc: NPC,
  attackerId: string,
  attackerPlanetId: string | undefined,
  allNpcs: NPC[],
  player: Player,
  allPlanets: Planet[],
  currentTime: number
): FleetMission[] => {
  // 基础被攻击处理
  handleNPCAttacked(npc, attackerId, attackerPlanetId)

  // 传播连坐效应
  propagateGuiltByAssociation(npc, allNpcs, player, 'attack')

  // 检查盟友互助
  const defenseMissions = checkAllyMutualDefense(npc, attackerId, allNpcs, allPlanets, currentTime)

  return defenseMissions
}

/**
 * 更新NPC联盟系统
 * 在游戏循环中调用
 */
export const updateNPCAllianceSystem = (npcs: NPC[], currentTime: number): void => {
  const { NPC_ALLIANCE_CONFIG } = DIPLOMATIC_CONFIG

  if (!NPC_ALLIANCE_CONFIG.ENABLED) return

  // 执行NPC之间的资源共享
  executeNPCResourceSharing(npcs, currentTime)
}
