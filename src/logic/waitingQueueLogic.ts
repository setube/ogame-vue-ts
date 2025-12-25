/**
 * 等待队列逻辑模块
 * 处理建筑、科技、舰船、防御的等待队列功能
 */

import type { Planet, Player, WaitingQueueItem, Resources, Officer, BuildQueueItem } from '@/types/game'
import { BuildingType, TechnologyType, ShipType, DefenseType, OfficerType } from '@/types/game'
import * as buildingLogic from './buildingLogic'
import * as researchLogic from './researchLogic'
import * as shipLogic from './shipLogic'
import * as resourceLogic from './resourceLogic'
import * as publicLogic from './publicLogic'
import * as officerLogic from './officerLogic'
import * as buildingValidation from './buildingValidation'
import * as researchValidation from './researchValidation'
import * as shipValidation from './shipValidation'

/**
 * 获取等待队列最大容量
 * 与正式队列相同（建筑: 3 + 纳米工厂等级，科技: 3 + 计算机技术等级，最多10）
 */
export const getMaxBuildWaitingQueue = (planet: Planet, additionalBuildQueue: number = 0): number => {
  return publicLogic.getMaxBuildQueue(planet, additionalBuildQueue)
}

export const getMaxResearchWaitingQueue = (technologies: Partial<Record<TechnologyType, number>>): number => {
  return publicLogic.getMaxResearchQueue(technologies)
}

/**
 * 创建建筑等待队列项
 */
export const createBuildingWaitingItem = (buildingType: BuildingType, targetLevel: number, planetId: string): WaitingQueueItem => {
  return {
    id: `waiting_building_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: 'building',
    itemType: buildingType,
    targetLevel,
    priority: Date.now(),
    addedTime: Date.now(),
    planetId
  }
}

/**
 * 创建拆除等待队列项
 */
export const createDemolishWaitingItem = (buildingType: BuildingType, targetLevel: number, planetId: string): WaitingQueueItem => {
  return {
    id: `waiting_demolish_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: 'demolish',
    itemType: buildingType,
    targetLevel,
    priority: Date.now(),
    addedTime: Date.now(),
    planetId
  }
}

/**
 * 创建科技等待队列项
 */
export const createResearchWaitingItem = (techType: TechnologyType, targetLevel: number): WaitingQueueItem => {
  return {
    id: `waiting_tech_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: 'technology',
    itemType: techType,
    targetLevel,
    priority: Date.now(),
    addedTime: Date.now()
  }
}

/**
 * 创建舰船等待队列项
 */
export const createShipWaitingItem = (shipType: ShipType, quantity: number, planetId: string): WaitingQueueItem => {
  return {
    id: `waiting_ship_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: 'ship',
    itemType: shipType,
    quantity,
    priority: Date.now(),
    addedTime: Date.now(),
    planetId
  }
}

/**
 * 创建防御等待队列项
 */
export const createDefenseWaitingItem = (defenseType: DefenseType, quantity: number, planetId: string): WaitingQueueItem => {
  return {
    id: `waiting_defense_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: 'defense',
    itemType: defenseType,
    quantity,
    priority: Date.now(),
    addedTime: Date.now(),
    planetId
  }
}

/**
 * 计算等待队列项的预估成本
 */
export const calculateWaitingItemCost = (item: WaitingQueueItem): Resources => {
  switch (item.type) {
    case 'building':
      return buildingLogic.calculateBuildingCost(item.itemType as BuildingType, item.targetLevel || 1)
    case 'demolish':
      // 拆除不需要资源
      return { metal: 0, crystal: 0, deuterium: 0, darkMatter: 0, energy: 0 }
    case 'technology':
      return researchLogic.calculateTechnologyCost(item.itemType as TechnologyType, item.targetLevel || 1)
    case 'ship':
      return shipLogic.calculateShipCost(item.itemType as ShipType, item.quantity || 1)
    case 'defense':
      return shipLogic.calculateDefenseCost(item.itemType as DefenseType, item.quantity || 1)
    default:
      return { metal: 0, crystal: 0, deuterium: 0, darkMatter: 0, energy: 0 }
  }
}

/**
 * 检查资源是否足够执行等待队列项
 */
export const canExecuteWaitingItem = (item: WaitingQueueItem, resources: Resources): boolean => {
  const cost = calculateWaitingItemCost(item)
  return resourceLogic.checkResourcesAvailable(resources, cost)
}

/**
 * 检查是否可以添加到建筑等待队列
 */
export const canAddToBuildWaitingQueue = (
  planet: Planet,
  item: WaitingQueueItem,
  officers: Record<OfficerType, Officer>
): { canAdd: boolean; reason?: string } => {
  const bonuses = officerLogic.calculateActiveBonuses(officers, Date.now())
  const maxQueue = getMaxBuildWaitingQueue(planet, bonuses.additionalBuildQueue)
  const waitingQueue = planet.waitingBuildQueue || []

  if (waitingQueue.length >= maxQueue) {
    return { canAdd: false, reason: 'errors.waitingQueueFull' }
  }

  // 建筑允许多次排队（比如金属矿升级到2、3、4、5级）
  // 拆除类型：不允许重复排队
  if (item.type === 'demolish') {
    const buildingType = item.itemType as BuildingType
    const existsInWaiting = waitingQueue.some(q => q.type === 'demolish' && q.itemType === buildingType)
    const existsInQueue = planet.buildQueue.some(q => q.type === 'demolish' && q.itemType === buildingType)
    if (existsInWaiting || existsInQueue) {
      return { canAdd: false, reason: 'errors.buildingAlreadyInQueue' }
    }
  }

  return { canAdd: true }
}

/**
 * 检查是否可以添加到研究等待队列
 */
export const canAddToResearchWaitingQueue = (player: Player, _item: WaitingQueueItem): { canAdd: boolean; reason?: string } => {
  const maxQueue = getMaxResearchWaitingQueue(player.technologies)
  const waitingQueue = player.waitingResearchQueue || []

  if (waitingQueue.length >= maxQueue) {
    return { canAdd: false, reason: 'errors.waitingQueueFull' }
  }

  // 科技允许多次排队（比如能源技术升级到2、3、4、5级）
  return { canAdd: true }
}

/**
 * 添加到建筑等待队列
 */
export const addToBuildWaitingQueue = (planet: Planet, item: WaitingQueueItem): void => {
  // 确保数组存在（向后兼容）
  if (!planet.waitingBuildQueue) {
    planet.waitingBuildQueue = []
  }
  planet.waitingBuildQueue.push(item)
  // 按优先级排序（数字越小越靠前）
  planet.waitingBuildQueue.sort((a, b) => a.priority - b.priority)
}

/**
 * 添加到研究等待队列
 */
export const addToResearchWaitingQueue = (player: Player, item: WaitingQueueItem): void => {
  // 确保数组存在（向后兼容）
  if (!player.waitingResearchQueue) {
    player.waitingResearchQueue = []
  }
  player.waitingResearchQueue.push(item)
  // 按优先级排序
  player.waitingResearchQueue.sort((a, b) => a.priority - b.priority)
}

/**
 * 从建筑等待队列移除
 */
export const removeFromBuildWaitingQueue = (planet: Planet, itemId: string): WaitingQueueItem | null => {
  if (!planet.waitingBuildQueue) return null
  const index = planet.waitingBuildQueue.findIndex(q => q.id === itemId)
  if (index === -1) return null
  const [removed] = planet.waitingBuildQueue.splice(index, 1)
  return removed ?? null
}

/**
 * 从研究等待队列移除
 */
export const removeFromResearchWaitingQueue = (player: Player, itemId: string): WaitingQueueItem | null => {
  if (!player.waitingResearchQueue) return null
  const index = player.waitingResearchQueue.findIndex(q => q.id === itemId)
  if (index === -1) return null
  const [removed] = player.waitingResearchQueue.splice(index, 1)
  return removed ?? null
}

/**
 * 处理单个星球的建筑等待队列
 * 当正式队列为空且资源足够时，自动将等待队列项移至正式队列
 */
export const processPlanetWaitingQueue = (
  planet: Planet,
  player: Player,
  officers: Record<OfficerType, Officer>
): { executed: WaitingQueueItem[]; messages: string[] } => {
  const executed: WaitingQueueItem[] = []
  const messages: string[] = []
  const bonuses = officerLogic.calculateActiveBonuses(officers, Date.now())

  // 检查正式队列是否为空
  const maxBuildQueue = publicLogic.getMaxBuildQueue(planet, bonuses.additionalBuildQueue)
  const buildingQueueCount = planet.buildQueue.filter(item => item.type === 'building' || item.type === 'demolish').length

  // 队列已满，不处理
  if (buildingQueueCount >= maxBuildQueue) {
    return { executed, messages }
  }

  // 遍历等待队列（已按优先级排序）
  const waitingQueue = planet.waitingBuildQueue || []
  const itemsToProcess = [...waitingQueue]
  for (const waitingItem of itemsToProcess) {
    // 检查正式队列是否还有空位
    const currentBuildQueueCount = planet.buildQueue.filter(item => item.type === 'building' || item.type === 'demolish').length
    if (currentBuildQueueCount >= maxBuildQueue) break

    // 根据类型执行不同处理
    if (waitingItem.type === 'building') {
      const result = tryExecuteBuildingWaitingItem(planet, waitingItem, player.technologies, officers)
      if (result.success && result.queueItem) {
        planet.buildQueue.push(result.queueItem)
        removeFromBuildWaitingQueue(planet, waitingItem.id)
        executed.push(waitingItem)
        messages.push(result.message || '')
      }
    } else if (waitingItem.type === 'demolish') {
      const result = tryExecuteDemolishWaitingItem(planet, waitingItem, officers)
      if (result.success && result.queueItem) {
        planet.buildQueue.push(result.queueItem)
        removeFromBuildWaitingQueue(planet, waitingItem.id)
        executed.push(waitingItem)
        messages.push(result.message || '')
      }
    } else if (waitingItem.type === 'ship') {
      const result = tryExecuteShipWaitingItem(planet, waitingItem, player.technologies, officers)
      if (result.success && result.queueItem) {
        planet.buildQueue.push(result.queueItem)
        removeFromBuildWaitingQueue(planet, waitingItem.id)
        executed.push(waitingItem)
        messages.push(result.message || '')
      }
    } else if (waitingItem.type === 'defense') {
      const result = tryExecuteDefenseWaitingItem(planet, waitingItem, player.technologies, officers)
      if (result.success && result.queueItem) {
        planet.buildQueue.push(result.queueItem)
        removeFromBuildWaitingQueue(planet, waitingItem.id)
        executed.push(waitingItem)
        messages.push(result.message || '')
      }
    }
  }

  return { executed, messages }
}

/**
 * 处理研究等待队列
 */
export const processResearchWaitingQueue = (
  player: Player,
  currentPlanet: Planet,
  officers: Record<OfficerType, Officer>
): { executed: WaitingQueueItem[]; messages: string[] } => {
  const executed: WaitingQueueItem[] = []
  const messages: string[] = []

  // 检查正式队列是否为空
  const maxResearchQueue = publicLogic.getMaxResearchQueue(player.technologies)
  if (player.researchQueue.length >= maxResearchQueue) {
    return { executed, messages }
  }

  // 遍历等待队列
  const waitingResearchQueue = player.waitingResearchQueue || []
  const itemsToProcess = [...waitingResearchQueue]
  for (const waitingItem of itemsToProcess) {
    if (player.researchQueue.length >= maxResearchQueue) break

    if (waitingItem.type === 'technology') {
      const result = tryExecuteResearchWaitingItem(currentPlanet, waitingItem, player, officers)
      if (result.success && result.queueItem) {
        player.researchQueue.push(result.queueItem)
        removeFromResearchWaitingQueue(player, waitingItem.id)
        executed.push(waitingItem)
        messages.push(result.message || '')
      }
    }
  }

  return { executed, messages }
}

/**
 * 尝试执行建筑等待项
 */
const tryExecuteBuildingWaitingItem = (
  planet: Planet,
  item: WaitingQueueItem,
  technologies: Partial<Record<TechnologyType, number>>,
  officers: Record<OfficerType, Officer>
): { success: boolean; queueItem?: BuildQueueItem; message?: string } => {
  const buildingType = item.itemType as BuildingType
  const currentLevel = planet.buildings[buildingType] || 0
  const waitingTargetLevel = item.targetLevel || currentLevel + 1

  // 检查目标等级是否仍然正确（可能在等待期间已经升级了）
  if (currentLevel >= waitingTargetLevel) {
    return { success: false, message: 'errors.levelAlreadyReached' }
  }

  // 实际执行的目标等级是当前等级+1
  const actualTargetLevel = currentLevel + 1

  // 验证升级条件
  // 跳过以下错误，因为它们不影响下一级升级：
  // - buildQueueFull: 我们已经在外层检查了
  // - buildingAlreadyInQueue: 同一建筑可能在队列中（等待前一级完成）
  // - insufficientResources: 我们会在下面单独检查实际需要的资源
  const validation = buildingValidation.validateBuildingUpgrade(planet, buildingType, technologies, officers)
  if (!validation.valid &&
      validation.reason !== 'errors.buildQueueFull' &&
      validation.reason !== 'errors.buildingAlreadyInQueue' &&
      validation.reason !== 'errors.insufficientResources') {
    return { success: false, message: validation.reason }
  }

  // 检查同一建筑是否已在正式队列中（等待前一级完成）
  const existingInQueue = planet.buildQueue.find(
    q => (q.type === 'building' || q.type === 'demolish') && q.itemType === buildingType
  )
  if (existingInQueue) {
    // 同一建筑已在队列中，暂时不执行，等待完成后再处理
    return { success: false, message: 'errors.buildingAlreadyInQueue' }
  }

  // 检查实际需要的资源（下一级的成本，不是等待队列项的目标等级）
  const cost = buildingLogic.calculateBuildingCost(buildingType, actualTargetLevel)
  if (!resourceLogic.checkResourcesAvailable(planet.resources, cost)) {
    return { success: false, message: 'errors.insufficientResources' }
  }

  // 执行升级
  const queueItem = buildingValidation.executeBuildingUpgrade(planet, buildingType, officers)
  return { success: true, queueItem, message: 'queue.movedToQueue' }
}

/**
 * 尝试执行拆除等待项
 */
const tryExecuteDemolishWaitingItem = (
  planet: Planet,
  item: WaitingQueueItem,
  officers: Record<OfficerType, Officer>
): { success: boolean; queueItem?: BuildQueueItem; message?: string } => {
  const buildingType = item.itemType as BuildingType
  const currentLevel = planet.buildings[buildingType] || 0
  const waitingTargetLevel = item.targetLevel || currentLevel - 1

  // 检查等级是否仍然可拆除
  if (currentLevel <= 0 || currentLevel <= waitingTargetLevel) {
    return { success: false, message: 'errors.buildingLevelZero' }
  }

  // 验证拆除条件
  const validation = buildingValidation.validateBuildingDemolish(planet, buildingType, officers)
  if (!validation.valid && validation.reason !== 'errors.buildQueueFull') {
    return { success: false, message: validation.reason }
  }

  // 检查同一建筑是否已在正式队列中（等待前一次拆除完成）
  const existingInQueue = planet.buildQueue.find(
    q => (q.type === 'building' || q.type === 'demolish') && q.itemType === buildingType
  )
  if (existingInQueue) {
    // 同一建筑已在队列中，暂时不执行，等待完成后再处理
    return { success: false, message: 'errors.buildingAlreadyInQueue' }
  }

  // 执行拆除
  const queueItem = buildingValidation.executeBuildingDemolish(planet, buildingType, officers)
  return { success: true, queueItem, message: 'queue.movedToQueue' }
}

/**
 * 尝试执行舰船等待项
 */
const tryExecuteShipWaitingItem = (
  planet: Planet,
  item: WaitingQueueItem,
  technologies: Partial<Record<TechnologyType, number>>,
  officers: Record<OfficerType, Officer>
): { success: boolean; queueItem?: BuildQueueItem; message?: string } => {
  const shipType = item.itemType as ShipType
  const quantity = item.quantity || 1

  // 验证建造条件
  const validation = shipValidation.validateShipBuild(planet, shipType, quantity, technologies)
  if (!validation.valid) {
    return { success: false, message: validation.reason }
  }

  // 执行建造
  const queueItem = shipValidation.executeShipBuild(planet, shipType, quantity, officers)
  return { success: true, queueItem, message: 'queue.movedToQueue' }
}

/**
 * 尝试执行防御等待项
 */
const tryExecuteDefenseWaitingItem = (
  planet: Planet,
  item: WaitingQueueItem,
  technologies: Partial<Record<TechnologyType, number>>,
  officers: Record<OfficerType, Officer>
): { success: boolean; queueItem?: BuildQueueItem; message?: string } => {
  const defenseType = item.itemType as DefenseType
  const quantity = item.quantity || 1

  // 验证建造条件
  const validation = shipValidation.validateDefenseBuild(planet, defenseType, quantity, technologies)
  if (!validation.valid) {
    return { success: false, message: validation.reason }
  }

  // 执行建造
  const queueItem = shipValidation.executeDefenseBuild(planet, defenseType, quantity, officers)
  return { success: true, queueItem, message: 'queue.movedToQueue' }
}

/**
 * 尝试执行研究等待项
 */
const tryExecuteResearchWaitingItem = (
  planet: Planet,
  item: WaitingQueueItem,
  player: Player,
  officers: Record<OfficerType, Officer>
): { success: boolean; queueItem?: BuildQueueItem; message?: string } => {
  const techType = item.itemType as TechnologyType
  const currentLevel = player.technologies[techType] || 0
  const waitingTargetLevel = item.targetLevel || currentLevel + 1

  // 检查目标等级是否仍然正确
  if (currentLevel >= waitingTargetLevel) {
    return { success: false, message: 'errors.levelAlreadyReached' }
  }

  // 实际执行的目标等级是当前等级+1
  const actualTargetLevel = currentLevel + 1

  // 验证研究条件
  // 跳过以下错误：
  // - researchQueueFull: 我们已经在外层检查了
  // - technologyAlreadyInQueue: 同一科技可能在队列中（等待前一级完成）
  // - insufficientResources: 我们会在下面单独检查实际需要的资源
  const validation = researchValidation.validateTechnologyResearch(planet, techType, player.technologies, player.researchQueue)
  if (!validation.valid &&
      validation.reason !== 'errors.researchQueueFull' &&
      validation.reason !== 'errors.technologyAlreadyInQueue' &&
      validation.reason !== 'errors.insufficientResources') {
    return { success: false, message: validation.reason }
  }

  // 检查同一科技是否已在研究队列中（等待前一级完成）
  const existingInQueue = player.researchQueue.find(q => q.itemType === techType)
  if (existingInQueue) {
    // 同一科技已在队列中，暂时不执行，等待完成后再处理
    return { success: false, message: 'errors.technologyAlreadyInQueue' }
  }

  // 检查实际需要的资源（下一级的成本，不是等待队列项的目标等级）
  const cost = researchLogic.calculateTechnologyCost(techType, actualTargetLevel)
  if (!resourceLogic.checkResourcesAvailable(planet.resources, cost)) {
    return { success: false, message: 'errors.insufficientResources' }
  }

  // 执行研究
  const result = researchValidation.executeTechnologyResearch(planet, techType, currentLevel, officers, player.technologies)
  return { success: true, queueItem: result.queueItem, message: 'queue.movedToQueue' }
}

/**
 * 处理所有等待队列（在 gameLoop 中调用）
 */
export const processAllWaitingQueues = (player: Player, _now: number): { executed: WaitingQueueItem[]; messages: string[] } => {
  const allExecuted: WaitingQueueItem[] = []
  const allMessages: string[] = []

  // 处理所有星球的建筑等待队列
  for (const planet of player.planets) {
    const result = processPlanetWaitingQueue(planet, player, player.officers)
    allExecuted.push(...result.executed)
    allMessages.push(...result.messages)
  }

  // 处理研究等待队列（使用第一个有研究实验室的星球）
  const labPlanet = player.planets.find(p => (p.buildings[BuildingType.ResearchLab] || 0) > 0)
  if (labPlanet) {
    const result = processResearchWaitingQueue(player, labPlanet, player.officers)
    allExecuted.push(...result.executed)
    allMessages.push(...result.messages)
  }

  return { executed: allExecuted, messages: allMessages }
}

/**
 * 获取等待队列项的显示名称
 */
export const getWaitingItemName = (item: WaitingQueueItem): string => {
  switch (item.type) {
    case 'building':
    case 'demolish':
      return `buildings.${item.itemType}`
    case 'technology':
      return `technologies.${item.itemType}`
    case 'ship':
      return `ships.${item.itemType}`
    case 'defense':
      return `defenses.${item.itemType}`
    default:
      return 'unknown'
  }
}
