/**
 * 外交系统逻辑
 *
 * 管理玩家与NPC之间的双向好感度、关系状态和外交事件
 */

import { DIPLOMATIC_CONFIG } from '@/config/gameConfig'
import { getLocale, type Locale } from '@/locales'
import * as resourceLogic from './resourceLogic'
import * as officerLogic from './officerLogic'
import type {
  DiplomaticRelation,
  RelationStatus,
  DiplomaticEventType,
  DiplomaticReport,
  Resources,
  Player,
  NPC,
  Planet,
  FleetMission,
  BattleResult,
  Position,
  GiftNotification,
  GiftRejectedNotification
} from '@/types/game'
import { RelationStatus as RS, DiplomaticEventType as DET } from '@/types/game'

/**
 * 获取翻译文本的辅助函数
 * @param key 翻译键
 * @param locale 语言代码
 * @param params 参数
 * @returns 翻译后的文本
 */
const t = (key: string, locale: Locale, params?: Record<string, string | number>): string => {
  const keys = key.split('.')
  let value: any = getLocale(locale)

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k]
    } else {
      return key // 如果找不到翻译，返回原始 key
    }
  }

  let result = typeof value === 'string' ? value : key

  // 替换参数占位符
  if (params) {
    Object.entries(params).forEach(([paramKey, paramValue]) => {
      result = result.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramValue))
    })
  }

  return result
}

/**
 * 根据好感度值计算关系状态
 * @param reputation 好感度值 (-100 到 +100)
 * @returns 关系状态
 */
export const calculateRelationStatus = (reputation: number): RelationStatus => {
  if (reputation <= DIPLOMATIC_CONFIG.HOSTILE_THRESHOLD) {
    return RS.Hostile
  } else if (reputation >= DIPLOMATIC_CONFIG.FRIENDLY_THRESHOLD) {
    return RS.Friendly
  }
  return RS.Neutral
}

/**
 * 初始化外交关系
 * @param fromId 关系发起方ID
 * @param toId 关系接收方ID
 * @returns 新的外交关系对象
 */
export const initializeDiplomaticRelation = (fromId: string, toId: string): DiplomaticRelation => {
  return {
    fromId,
    toId,
    reputation: 0, // 初始中立
    status: RS.Neutral,
    lastUpdated: Date.now(),
    history: []
  }
}

/**
 * 更新好感度值
 * @param relation 外交关系对象
 * @param change 好感度变化值
 * @param reason 变化原因
 * @param details 详细信息
 * @returns 更新后的外交关系对象
 */
export const updateReputation = (
  relation: DiplomaticRelation,
  change: number,
  reason: DiplomaticEventType,
  details?: string
): DiplomaticRelation => {
  const oldReputation = relation.reputation

  // 计算新的好感度（限制在范围内）
  const newReputation = Math.max(DIPLOMATIC_CONFIG.MIN_REPUTATION, Math.min(DIPLOMATIC_CONFIG.MAX_REPUTATION, oldReputation + change))

  // 更新状态
  const newStatus = calculateRelationStatus(newReputation)

  // 记录历史
  if (!relation.history) {
    relation.history = []
  }
  relation.history.push({
    timestamp: Date.now(),
    change,
    reason,
    details
  })

  // 只保留最近50条历史记录
  if (relation.history.length > 50) {
    relation.history = relation.history.slice(-50)
  }

  return {
    ...relation,
    reputation: newReputation,
    status: newStatus,
    lastUpdated: Date.now()
  }
}

/**
 * 计算赠送资源的好感度增加值
 * @param resources 赠送的资源
 * @returns 好感度增加值
 */
export const calculateGiftReputationGain = (resources: Resources): number => {
  const { REPUTATION_CHANGES } = DIPLOMATIC_CONFIG

  // 计算资源总价值（晶体和氘气价值更高）
  const totalValue = resources.metal + resources.crystal * 1.5 + resources.deuterium * 3

  // 检查是否达到最小价值门槛
  if (totalValue < REPUTATION_CHANGES.GIFT_MIN_VALUE) {
    return 0 // 低于门槛不获得好感度
  }

  // 基础好感度 + 基于价值的额外好感度
  const baseGain = REPUTATION_CHANGES.GIFT_BASE
  const valueGain = Math.floor(totalValue / 1000) * REPUTATION_CHANGES.GIFT_PER_1K_RESOURCES

  // 确保达到门槛的礼物至少获得1点好感度
  const totalGain = Math.max(baseGain + valueGain, 1)

  // 限制在最大值范围内
  return Math.min(totalGain, REPUTATION_CHANGES.GIFT_MAX_SINGLE)
}

/**
 * 获取或创建外交关系
 * @param relations 关系记录
 * @param fromId 关系发起方ID
 * @param toId 关系接收方ID
 * @returns 外交关系对象
 */
export const getOrCreateRelation = (relations: Record<string, DiplomaticRelation>, fromId: string, toId: string): DiplomaticRelation => {
  if (!relations[toId]) {
    relations[toId] = initializeDiplomaticRelation(fromId, toId)
  }
  return relations[toId]
}

/**
 * 计算NPC拒绝礼物的概率
 * @param npc NPC
 * @param player 玩家
 * @returns 拒绝概率（0-1）
 */
export const calculateNPCRejectionProbability = (npc: NPC, player: Player): number => {
  const { GIFT_ACCEPTANCE_CONFIG } = DIPLOMATIC_CONFIG

  // 获取NPC对玩家的好感度
  const relation = npc.relations?.[player.id]
  const reputation = relation?.reputation || 0

  // 基础概率 + 好感度修正
  // 好感度越低，拒绝概率越高
  let rejectionProb = GIFT_ACCEPTANCE_CONFIG.NPC_REJECTION_BASE_PROBABILITY

  // 好感度修正：每低于0一点，增加1%拒绝概率
  if (reputation < 0) {
    rejectionProb += Math.abs(reputation) * GIFT_ACCEPTANCE_CONFIG.NPC_REJECTION_REPUTATION_MODIFIER
  } else if (reputation > 0) {
    // 好感度为正时，降低拒绝概率
    rejectionProb -= reputation * GIFT_ACCEPTANCE_CONFIG.NPC_REJECTION_REPUTATION_MODIFIER
  }

  // 限制在最小和最大范围内
  return Math.max(
    GIFT_ACCEPTANCE_CONFIG.MIN_REJECTION_PROBABILITY,
    Math.min(GIFT_ACCEPTANCE_CONFIG.MAX_REJECTION_PROBABILITY, rejectionProb)
  )
}

/**
 * 处理赠送资源到达（需要NPC接受判定）
 * @param mission 舰队任务
 * @param player 玩家
 * @param targetNpc 目标NPC
 * @param locale 语言代码
 * @returns { accepted: boolean, reputationGain?: number }
 */
export const handleGiftArrival = (
  mission: FleetMission,
  player: Player,
  targetNpc: NPC,
  locale: Locale
): { accepted: boolean; reputationGain?: number } => {
  // 计算NPC拒绝概率
  const rejectionProb = calculateNPCRejectionProbability(targetNpc, player)
  const isRejected = Math.random() < rejectionProb

  if (isRejected) {
    // NPC拒绝礼物
    handleGiftRejection(player, targetNpc, mission.cargo, locale)
    return { accepted: false }
  }

  // NPC接受礼物
  // 计算好感度增加值
  const reputationGain = calculateGiftReputationGain(mission.cargo)

  // 更新NPC对玩家的关系（统一使用 npc.relations）
  if (!targetNpc.relations) {
    targetNpc.relations = {}
  }

  const npcRelation = getOrCreateRelation(targetNpc.relations, targetNpc.id, player.id)
  targetNpc.relations[player.id] = updateReputation(
    npcRelation,
    reputationGain,
    DET.GiftResources,
    t('diplomacy.reports.giftedResources', locale, {
      metal: mission.cargo.metal.toString(),
      crystal: mission.cargo.crystal.toString(),
      deuterium: mission.cargo.deuterium.toString()
    })
  )

  // 生成外交报告
  generateDiplomaticReport(
    player,
    targetNpc,
    DET.GiftResources,
    reputationGain,
    t('diplomacy.reports.giftedToNpc', locale, { npcName: targetNpc.name, reputation: reputationGain.toString() })
  )

  return { accepted: true, reputationGain }
}

/**
 * 处理礼物被拒绝
 * @param player 玩家
 * @param npc NPC
 * @param rejectedResources 被拒绝的资源
 * @param locale 语言代码
 */
const handleGiftRejection = (player: Player, npc: NPC, rejectedResources: Resources, locale: Locale): void => {
  const { GIFT_ACCEPTANCE_CONFIG } = DIPLOMATIC_CONFIG

  // 创建拒绝通知
  if (!player.giftRejectedNotifications) {
    player.giftRejectedNotifications = []
  }

  const relation = npc.relations?.[player.id]
  const currentReputation = relation?.reputation || 0

  const notification: GiftRejectedNotification = {
    id: `gift-rejected-${Date.now()}-${Math.random()}`,
    timestamp: Date.now(),
    npcId: npc.id,
    npcName: npc.name,
    rejectedResources,
    currentReputation,
    reason: currentReputation < -20 ? 'hostile' : currentReputation < 20 ? 'neutral_distrust' : 'polite_decline',
    read: false
  }

  player.giftRejectedNotifications.push(notification)

  // 限制通知数量
  if (player.giftRejectedNotifications.length > 50) {
    player.giftRejectedNotifications = player.giftRejectedNotifications.slice(-50)
  }

  // 拒绝礼物会降低好感度
  if (!npc.relations) {
    npc.relations = {}
  }

  const npcRelation = getOrCreateRelation(npc.relations, npc.id, player.id)
  npc.relations[player.id] = updateReputation(
    npcRelation,
    GIFT_ACCEPTANCE_CONFIG.REJECTION_REPUTATION_PENALTY,
    DET.GiftResources,
    t('diplomacy.reports.rejectedPlayerGift', locale)
  )

  // 生成外交报告
  generateDiplomaticReport(
    player,
    npc,
    DET.GiftResources,
    GIFT_ACCEPTANCE_CONFIG.REJECTION_REPUTATION_PENALTY,
    t('diplomacy.reports.npcRejectedGift', locale, {
      npcName: npc.name,
      reputation: GIFT_ACCEPTANCE_CONFIG.REJECTION_REPUTATION_PENALTY.toString()
    })
  )
}

/**
 * 处理攻击事件的好感度变化
 * @param attacker 攻击者（玩家）
 * @param defender 防御者（NPC）
 * @param battleResult 战斗结果
 * @param allNpcs 所有NPC列表
 * @param locale 语言代码
 */
export const handleAttackReputation = (
  attacker: Player,
  defender: NPC,
  battleResult: BattleResult,
  allNpcs: NPC[],
  locale: Locale
): void => {
  const { REPUTATION_CHANGES } = DIPLOMATIC_CONFIG

  // 计算好感度降低值
  let reputationLoss = REPUTATION_CHANGES.ATTACK

  if (battleResult.winner === 'attacker') {
    reputationLoss = REPUTATION_CHANGES.ATTACK_WIN
  }

  // 更新NPC对玩家的关系（统一使用 npc.relations）
  if (!defender.relations) {
    defender.relations = {}
  }

  const defenderRelation = getOrCreateRelation(defender.relations, defender.id, attacker.id)
  defender.relations[attacker.id] = updateReputation(
    defenderRelation,
    reputationLoss,
    DET.Attack,
    t('diplomacy.reports.wasAttackedByPlayer', locale)
  )

  // 检查盟友关系网络
  if (defender.allies && defender.allies.length > 0) {
    handleAllyAttackedReputation(attacker, defender, allNpcs, locale)
  }

  // 生成外交报告
  generateDiplomaticReport(
    attacker,
    defender,
    DET.Attack,
    reputationLoss,
    t('diplomacy.reports.youAttackedNpc', locale, { npcName: defender.name })
  )
}

/**
 * 处理盟友被攻击的好感度变化
 * @param attacker 攻击者（玩家）
 * @param attackedNpc 被攻击的NPC
 * @param allNpcs 所有NPC列表
 * @param locale 语言代码
 */
export const handleAllyAttackedReputation = (attacker: Player, attackedNpc: NPC, allNpcs: NPC[], locale: Locale): void => {
  const { REPUTATION_CHANGES } = DIPLOMATIC_CONFIG

  // 找到所有盟友
  const allies = allNpcs.filter(npc => attackedNpc.allies?.includes(npc.id))

  allies.forEach(ally => {
    // 更新盟友对玩家的关系
    if (!ally.relations) {
      ally.relations = {}
    }

    const allyRelation = getOrCreateRelation(ally.relations, ally.id, attacker.id)
    ally.relations[attacker.id] = updateReputation(
      allyRelation,
      REPUTATION_CHANGES.ALLY_ATTACKED,
      DET.AllyAttacked,
      t('diplomacy.reports.playerAttackedAlly', locale, { allyName: attackedNpc.name })
    )

    // 生成外交报告
    generateDiplomaticReport(
      attacker,
      ally,
      DET.AllyAttacked,
      REPUTATION_CHANGES.ALLY_ATTACKED,
      t('diplomacy.reports.allyDispleased', locale, { allyName: ally.name, targetName: attackedNpc.name })
    )
  })
}

/**
 * 处理侦查事件的好感度变化
 * @param spy 侦查者（玩家）
 * @param target 侦查目标（NPC）
 * @param wasDetected 是否被发现
 * @param locale 语言代码
 */
export const handleSpyReputation = (spy: Player, target: NPC, wasDetected: boolean, locale: Locale): void => {
  const { REPUTATION_CHANGES } = DIPLOMATIC_CONFIG

  const reputationLoss = wasDetected ? REPUTATION_CHANGES.SPY_DETECTED : REPUTATION_CHANGES.SPY_UNDETECTED

  // NPC对玩家的关系始终受影响
  if (!target.relations) {
    target.relations = {}
  }

  const targetRelation = getOrCreateRelation(target.relations, target.id, spy.id)
  target.relations[spy.id] = updateReputation(
    targetRelation,
    reputationLoss,
    DET.Spy,
    t('diplomacy.reports.wasSpiedByPlayer', locale, { detected: wasDetected ? 'true' : 'false' })
  )

  // 如果被发现，生成外交报告
  if (wasDetected) {
    generateDiplomaticReport(spy, target, DET.Spy, reputationLoss, t('diplomacy.reports.spyDetected', locale, { npcName: target.name }))
  }
}

/**
 * 处理回收残骸事件的好感度变化
 * 如果残骸在NPC星球位置，视为抢夺
 * @param player 玩家
 * @param debrisPosition 残骸位置
 * @param allNpcs 所有NPC列表
 * @param locale 语言代码
 */
export const handleDebrisRecycleReputation = (player: Player, debrisPosition: Position, allNpcs: NPC[], locale: Locale): void => {
  const { REPUTATION_CHANGES } = DIPLOMATIC_CONFIG

  // 找到该位置的NPC星球所有者
  const npcOwner = allNpcs.find(npc =>
    npc.planets.some(
      p =>
        p.position.galaxy === debrisPosition.galaxy &&
        p.position.system === debrisPosition.system &&
        p.position.position === debrisPosition.position
    )
  )

  if (npcOwner) {
    // 这是在NPC星球位置回收残骸，视为抢夺
    // 更新NPC对玩家的关系（统一使用 npc.relations）
    if (!npcOwner.relations) {
      npcOwner.relations = {}
    }

    const npcRelation = getOrCreateRelation(npcOwner.relations, npcOwner.id, player.id)
    npcOwner.relations[player.id] = updateReputation(
      npcRelation,
      REPUTATION_CHANGES.STEAL_DEBRIS,
      DET.StealDebris,
      t('diplomacy.reports.stoleDebrisFromTerritory', locale, { npcName: npcOwner.name })
    )

    // 生成外交报告
    generateDiplomaticReport(
      player,
      npcOwner,
      DET.StealDebris,
      REPUTATION_CHANGES.STEAL_DEBRIS,
      t('diplomacy.reports.recycledDebrisNearNpc', locale, { npcName: npcOwner.name })
    )
  }
}

/**
 * 处理星球摧毁事件的好感度变化
 * 摧毁星球是最严重的行为，直接导致敌对关系
 * @param attacker 攻击者（玩家）
 * @param destroyedPlanet 被摧毁的星球
 * @param planetOwner 星球所有者（NPC）
 * @param allNpcs 所有NPC列表
 * @param locale 语言代码
 */
export const handlePlanetDestructionReputation = (
  attacker: Player,
  destroyedPlanet: Planet,
  planetOwner: NPC,
  allNpcs: NPC[],
  locale: Locale
): void => {
  const { HOSTILE_THRESHOLD } = DIPLOMATIC_CONFIG
  const now = Date.now()

  // 更新星球所有者对玩家的关系 - 直接设为敌对（统一使用 npc.relations）
  if (!planetOwner.relations) {
    planetOwner.relations = {}
  }

  const ownerRelation = getOrCreateRelation(planetOwner.relations, planetOwner.id, attacker.id)
  const ownerEventDescription = t('diplomacy.reports.playerDestroyedPlanet', locale, {
    planetName: destroyedPlanet.name
  })

  planetOwner.relations[attacker.id] = {
    ...ownerRelation,
    reputation: HOSTILE_THRESHOLD, // 直接设为敌对阈值
    status: RS.Hostile,
    lastUpdated: now,
    history: [
      ...(ownerRelation.history || []),
      {
        timestamp: now,
        change: HOSTILE_THRESHOLD - ownerRelation.reputation,
        reason: DET.DestroyPlanet,
        details: ownerEventDescription
      }
    ]
  }

  // 生成外交报告
  generateDiplomaticReport(
    attacker,
    planetOwner,
    DET.DestroyPlanet,
    HOSTILE_THRESHOLD,
    t('diplomacy.reports.youDestroyedNpcPlanet', locale, {
      npcName: planetOwner.name,
      planetName: destroyedPlanet.name,
      reputation: HOSTILE_THRESHOLD
    }),
    'diplomacy.reports.youDestroyedNpcPlanet',
    { npcName: planetOwner.name, planetName: destroyedPlanet.name, reputation: HOSTILE_THRESHOLD }
  )

  // 检查盟友关系网络 - 摧毁星球对盟友的影响更严重
  if (planetOwner.allies && planetOwner.allies.length > 0) {
    handleAllyPlanetDestroyedReputation(attacker, planetOwner, destroyedPlanet, allNpcs, locale)
  }
}

/**
 * 处理盟友星球被摧毁的好感度变化
 * @param attacker 攻击者（玩家）
 * @param attackedNpc 星球被摧毁的NPC
 * @param destroyedPlanet 被摧毁的星球
 * @param allNpcs 所有NPC列表
 * @param locale 语言代码
 */
export const handleAllyPlanetDestroyedReputation = (
  attacker: Player,
  attackedNpc: NPC,
  destroyedPlanet: Planet,
  allNpcs: NPC[],
  locale: Locale
): void => {
  const { REPUTATION_CHANGES } = DIPLOMATIC_CONFIG

  // 找到所有盟友
  const allies = allNpcs.filter(npc => attackedNpc.allies?.includes(npc.id))

  allies.forEach(ally => {
    // 更新盟友对玩家的关系 - 摧毁盟友星球的惩罚是攻击的两倍
    if (!ally.relations) {
      ally.relations = {}
    }

    const allyRelation = getOrCreateRelation(ally.relations, ally.id, attacker.id)
    const reputationLoss = REPUTATION_CHANGES.ALLY_ATTACKED * 2 // 双倍惩罚
    ally.relations[attacker.id] = updateReputation(
      allyRelation,
      reputationLoss,
      DET.DestroyPlanet,
      t('diplomacy.reports.playerDestroyedAllyPlanet', locale, { allyName: attackedNpc.name, planetName: destroyedPlanet.name })
    )

    // 生成外交报告
    generateDiplomaticReport(
      attacker,
      ally,
      DET.DestroyPlanet,
      reputationLoss,
      t('diplomacy.reports.allyOutraged', locale, {
        allyName: ally.name,
        targetName: attackedNpc.name,
        planetName: destroyedPlanet.name
      }),
      'diplomacy.reports.allyOutraged',
      {
        allyName: ally.name,
        targetName: attackedNpc.name,
        planetName: destroyedPlanet.name
      }
    )
  })
}

/**
 * 生成外交报告
 * @param player 玩家
 * @param npc NPC
 * @param eventType 事件类型
 * @param reputationChange 好感度变化值
 * @param message 消息内容（已弃用，用于向后兼容）
 * @param messageKey 翻译键（可选）
 * @param messageParams 翻译参数（可选）
 */
const generateDiplomaticReport = (
  player: Player,
  npc: NPC,
  eventType: DiplomaticEventType,
  reputationChange: number,
  message: string,
  messageKey?: string,
  messageParams?: Record<string, string | number>
): void => {
  if (!player.diplomaticReports) {
    player.diplomaticReports = []
  }

  // 使用 npc.relations 作为唯一数据源
  const relation = npc.relations?.[player.id] || initializeDiplomaticRelation(npc.id, player.id)
  const oldStatus = relation.status
  const newReputation = Math.max(
    DIPLOMATIC_CONFIG.MIN_REPUTATION,
    Math.min(DIPLOMATIC_CONFIG.MAX_REPUTATION, relation.reputation + reputationChange)
  )
  const newStatus = calculateRelationStatus(newReputation)

  const report: DiplomaticReport = {
    id: `diplomatic-${Date.now()}-${Math.random()}`,
    timestamp: Date.now(),
    npcId: npc.id,
    npcName: npc.name,
    eventType,
    reputationChange,
    newReputation,
    oldStatus,
    newStatus,
    message,
    messageKey,
    messageParams,
    read: false
  }

  player.diplomaticReports.push(report)

  // 只保留最近100条报告
  if (player.diplomaticReports.length > 100) {
    player.diplomaticReports = player.diplomaticReports.slice(-100)
  }
}

/**
 * 处理NPC赠送资源给玩家（创建礼物通知，等待玩家接受/拒绝）
 * @param npc 赠送方NPC
 * @param player 接收方玩家
 * @param giftResources 赠送的资源
 */
export const handleNPCGiftToPlayer = (npc: NPC, player: Player, giftResources: Resources): void => {
  const { GIFT_ACCEPTANCE_CONFIG } = DIPLOMATIC_CONFIG

  // 创建礼物通知
  if (!player.giftNotifications) {
    player.giftNotifications = []
  }

  const npcRelation = npc.relations?.[player.id]
  const currentReputation = npcRelation?.reputation || 0
  const expectedReputationGain = Math.floor(calculateGiftReputationGain(giftResources) * 0.5)

  const notification: GiftNotification = {
    id: `gift-${Date.now()}-${Math.random()}`,
    timestamp: Date.now(),
    fromNpcId: npc.id,
    fromNpcName: npc.name,
    resources: giftResources,
    currentReputation,
    expectedReputationGain,
    expiresAt: Date.now() + GIFT_ACCEPTANCE_CONFIG.GIFT_EXPIRATION_DAYS * 24 * 3600 * 1000,
    read: false
  }

  player.giftNotifications.push(notification)

  // 限制通知数量
  if (player.giftNotifications.length > 50) {
    player.giftNotifications = player.giftNotifications.slice(-50)
  }
}

/**
 * 玩家接受NPC的礼物
 * @param player 玩家
 * @param npc NPC
 * @param giftNotification 礼物通知
 * @param locale 语言代码
 */
export const acceptNPCGift = (player: Player, npc: NPC, giftNotification: GiftNotification, locale: Locale): void => {
  // 将资源添加到玩家主星球（使用安全添加函数防止溢出）
  if (player.planets && player.planets.length > 0) {
    const mainPlanet = player.planets[0]
    if (mainPlanet) {
      // 计算军官加成
      const bonuses = officerLogic.calculateActiveBonuses(player.officers, Date.now())
      // 使用安全添加函数，超出容量的资源会丢失
      resourceLogic.addResourcesSafely(mainPlanet, giftNotification.resources, bonuses.storageCapacityBonus)
    }
  }

  // 更新NPC对玩家的关系
  if (!npc.relations) {
    npc.relations = {}
  }

  const npcRelation = getOrCreateRelation(npc.relations, npc.id, player.id)
  npc.relations[player.id] = updateReputation(
    npcRelation,
    giftNotification.expectedReputationGain,
    DET.GiftResources,
    t('diplomacy.reports.giftedResourcesToPlayer', locale)
  )

  // 生成外交报告
  generateDiplomaticReport(
    player,
    npc,
    DET.GiftResources,
    giftNotification.expectedReputationGain,
    t('diplomacy.reports.acceptedGiftFromNpc', locale, {
      npcName: npc.name,
      metal: giftNotification.resources.metal.toString(),
      crystal: giftNotification.resources.crystal.toString(),
      deuterium: giftNotification.resources.deuterium.toString()
    })
  )

  // 移除礼物通知
  if (player.giftNotifications) {
    player.giftNotifications = player.giftNotifications.filter(n => n.id !== giftNotification.id)
  }
}

/**
 * 玩家拒绝NPC的礼物
 * @param player 玩家
 * @param npc NPC
 * @param giftNotification 礼物通知
 * @param locale 语言代码
 */
export const rejectNPCGift = (player: Player, npc: NPC, giftNotification: GiftNotification, locale: Locale): void => {
  const { GIFT_ACCEPTANCE_CONFIG } = DIPLOMATIC_CONFIG

  // 拒绝礼物会降低好感度
  if (!npc.relations) {
    npc.relations = {}
  }

  const npcRelation = getOrCreateRelation(npc.relations, npc.id, player.id)
  npc.relations[player.id] = updateReputation(
    npcRelation,
    GIFT_ACCEPTANCE_CONFIG.REJECTION_REPUTATION_PENALTY,
    DET.GiftResources,
    t('diplomacy.reports.playerRejectedGift', locale)
  )

  // 生成外交报告
  generateDiplomaticReport(
    player,
    npc,
    DET.GiftResources,
    GIFT_ACCEPTANCE_CONFIG.REJECTION_REPUTATION_PENALTY,
    t('diplomacy.reports.rejectedGiftFromNpc', locale, {
      npcName: npc.name,
      reputation: GIFT_ACCEPTANCE_CONFIG.REJECTION_REPUTATION_PENALTY.toString()
    })
  )

  // 移除礼物通知
  if (player.giftNotifications) {
    player.giftNotifications = player.giftNotifications.filter(n => n.id !== giftNotification.id)
  }
}

/**
 * 处理NPC被彻底消灭（所有星球被摧毁）
 * @param eliminatedNpc 被消灭的NPC
 * @param player 玩家
 * @param allNpcs 所有NPC列表
 * @param locale 语言代码
 */
export const handleNPCElimination = (eliminatedNpc: NPC, player: Player, allNpcs: NPC[], locale: Locale): void => {
  const { HOSTILE_THRESHOLD } = DIPLOMATIC_CONFIG

  // 1. 将NPC对玩家的关系设为最低（敌对状态）
  if (!eliminatedNpc.relations) {
    eliminatedNpc.relations = {}
  }

  const relation = getOrCreateRelation(eliminatedNpc.relations, eliminatedNpc.id, player.id)
  const now = Date.now()

  eliminatedNpc.relations[player.id] = {
    ...relation,
    reputation: HOSTILE_THRESHOLD, // 设为敌对阈值
    status: RS.Hostile,
    lastUpdated: now,
    history: [
      ...(relation.history || []),
      {
        timestamp: now,
        change: HOSTILE_THRESHOLD - relation.reputation,
        reason: DET.DestroyPlanet,
        details: t('diplomacy.reports.npcEliminated', locale, { npcName: eliminatedNpc.name })
      }
    ]
  }

  // 2. 生成外交报告
  generateDiplomaticReport(
    player,
    eliminatedNpc,
    DET.DestroyPlanet,
    HOSTILE_THRESHOLD,
    t('diplomacy.reports.npcEliminatedMessage', locale, { npcName: eliminatedNpc.name }),
    'diplomacy.reports.npcEliminatedMessage',
    { npcName: eliminatedNpc.name }
  )

  // 3. 从所有其他NPC的盟友列表中移除被消灭的NPC
  allNpcs.forEach(npc => {
    if (npc.id !== eliminatedNpc.id && npc.allies && npc.allies.includes(eliminatedNpc.id)) {
      npc.allies = npc.allies.filter(allyId => allyId !== eliminatedNpc.id)
    }
  })
}

/**
 * 检查并处理被消灭的NPC（所有星球都被摧毁的NPC）
 * @param allNpcs 所有NPC列表
 * @param player 玩家
 * @param locale 语言代码
 * @returns 被消灭的NPC ID列表
 */
export const checkAndHandleEliminatedNPCs = (allNpcs: NPC[], player: Player, locale: Locale): string[] => {
  const eliminatedNpcIds: string[] = []

  allNpcs.forEach(npc => {
    // 检查NPC是否还有星球
    if (!npc.planets || npc.planets.length === 0) {
      // NPC被彻底消灭
      handleNPCElimination(npc, player, allNpcs, locale)
      eliminatedNpcIds.push(npc.id)
    }
  })

  return eliminatedNpcIds
}

/**
 * 通知玩家盟友正在协防
 * @param npc 派遣协防舰队的NPC
 * @param player 玩家
 * @param targetPlanet 被协防的星球
 * @param mission 协防任务
 */
export const notifyPlayerOfAllyDefense = (
  npc: NPC,
  player: Player,
  targetPlanet: Planet,
  mission: FleetMission
): void => {
  // 计算舰队规模
  const fleetSize = Object.values(mission.fleet).reduce((sum, count) => sum + (count || 0), 0)

  // 创建外交报告
  const report: DiplomaticReport = {
    id: `ally_defense_${Date.now()}_${npc.id}`,
    npcId: npc.id,
    npcName: npc.name,
    eventType: 'ally_defend' as DiplomaticEventType,
    timestamp: Date.now(),
    details: {
      targetPlanetName: targetPlanet.name,
      targetPosition: targetPlanet.position,
      fleetSize,
      arrivalTime: mission.arrivalTime,
      stationDuration: mission.returnTime ? mission.returnTime - mission.arrivalTime : 0
    },
    read: false
  }

  // 添加到玩家的外交报告列表
  if (!player.diplomaticReports) {
    player.diplomaticReports = []
  }
  player.diplomaticReports.unshift(report)

  // 限制报告数量
  if (player.diplomaticReports.length > 100) {
    player.diplomaticReports = player.diplomaticReports.slice(0, 100)
  }
}
