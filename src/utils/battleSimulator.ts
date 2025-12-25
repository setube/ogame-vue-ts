import type { Fleet, Resources } from '@/types/game'
import { ShipType, DefenseType } from '@/types/game'
import { SHIPS, DEFENSES } from '@/config/gameConfig'

// 战斗单位接口
interface CombatUnit {
  type: ShipType | DefenseType
  count: number
  attack: number
  shield: number
  armor: number
  rapidFire?: Record<string, number> // 快速射击
  // 战斗状态追踪（用于护盾再生和装甲损坏效果）
  currentShield?: number // 当前护盾值（每轮开始恢复）
  armorDamage?: number // 累积装甲损坏（降低防御效果）
}

// 战斗方
interface BattleSide {
  ships: Partial<Fleet>
  defense?: Partial<Record<DefenseType, number>>
  weaponTech?: number
  shieldTech?: number
  armorTech?: number
}

// 战斗轮次结果
interface RoundResult {
  attackerLosses: Partial<Fleet>
  defenderLosses: {
    fleet: Partial<Fleet>
    defense: Partial<Record<DefenseType, number>>
  }
  attackerRemainingPower: number
  defenderRemainingPower: number
}

/**
 * 计算科技加成后的数值
 */
const applyTechBonus = (baseValue: number, techLevel: number = 0, bonusPerLevel: number = 0.1): number => {
  return Math.floor(baseValue * (1 + techLevel * bonusPerLevel))
}

/**
 * 将舰队和防御转换为战斗单位数组
 */
const prepareCombatUnits = (side: BattleSide, isDefender: boolean = false): CombatUnit[] => {
  const units: CombatUnit[] = []

  // 处理舰船
  if (side.ships) {
    for (const [shipType, count] of Object.entries(side.ships)) {
      if (count > 0) {
        const config = SHIPS[shipType as ShipType]
        units.push({
          type: shipType as ShipType,
          count: count,
          attack: applyTechBonus(config.attack, side.weaponTech),
          shield: applyTechBonus(config.shield, side.shieldTech),
          armor: applyTechBonus(config.armor, side.armorTech),
          rapidFire: config.rapidFire as Record<string, number> | undefined
        })
      }
    }
  }

  // 处理防御设施（仅防守方）
  if (isDefender && side.defense) {
    for (const [defenseType, count] of Object.entries(side.defense)) {
      if (count > 0) {
        const config = DEFENSES[defenseType as DefenseType]
        units.push({
          type: defenseType as DefenseType,
          count: count,
          attack: applyTechBonus(config.attack, side.weaponTech),
          shield: applyTechBonus(config.shield, side.shieldTech),
          armor: applyTechBonus(config.armor, side.armorTech)
          // 防御设施没有rapidFire
        })
      }
    }
  }

  return units
}

/**
 * 战斗效果配置
 */
const COMBAT_EFFECTS = {
  // 护盾弹回阈值：攻击力低于护盾此比例时大概率弹回
  SHIELD_BOUNCE_THRESHOLD: 0.01,
  // 护盾弹回时仍有此概率穿透
  SHIELD_BOUNCE_PENETRATION_CHANCE: 0.01,
  // 每轮护盾再生比例（恢复最大护盾的百分比）
  SHIELD_REGEN_RATE: 0.7,
  // 装甲损坏累积效果：每次受到未被护盾完全吸收的伤害，累积装甲损坏
  ARMOR_DAMAGE_RATE: 0.05,
  // 装甲损坏上限（最多降低防御效果的百分比）
  MAX_ARMOR_DAMAGE: 0.3,
  // 重型武器对护盾穿透概率（攻击力>5000的武器）
  HEAVY_WEAPON_SHIELD_PENETRATION: 0.15,
  // 重型武器阈值
  HEAVY_WEAPON_THRESHOLD: 5000
}

/**
 * 计算一个单位对另一个单位造成的伤害
 * 增强版：包含护盾弹回、重型武器穿透、装甲损坏累积
 */
const calculateDamage = (attacker: CombatUnit, defender: CombatUnit): { destroyed: number; damagedShield: number; armorDamageDealt: number } => {
  const attackPower = attacker.attack
  // 使用当前护盾值（如果有），否则使用最大护盾
  const defenderCurrentShield = defender.currentShield ?? defender.shield
  // 考虑装甲损坏后的有效装甲
  const armorDamageMultiplier = 1 - (defender.armorDamage ?? 0)
  const effectiveArmor = defender.armor * armorDamageMultiplier

  let destroyed = 0
  let damagedShield = 0
  let armorDamageDealt = 0

  // 重型武器穿透：高攻击力武器有概率部分无视护盾
  let shieldPenetration = 0
  if (attackPower >= COMBAT_EFFECTS.HEAVY_WEAPON_THRESHOLD) {
    if (Math.random() < COMBAT_EFFECTS.HEAVY_WEAPON_SHIELD_PENETRATION) {
      // 穿透30%-50%的护盾
      shieldPenetration = 0.3 + Math.random() * 0.2
    }
  }

  // 计算实际护盾值（考虑穿透）
  const effectiveShield = defenderCurrentShield * (1 - shieldPenetration)

  // 如果攻击力小于护盾的1%，有很大概率无法击穿护盾（护盾弹回机制）
  if (attackPower < effectiveShield * COMBAT_EFFECTS.SHIELD_BOUNCE_THRESHOLD) {
    if (Math.random() > COMBAT_EFFECTS.SHIELD_BOUNCE_PENETRATION_CHANCE) {
      return { destroyed: 0, damagedShield: 0, armorDamageDealt: 0 }
    }
  }

  // 计算伤害
  let remainingDamage = attackPower

  // 先消耗护盾
  if (remainingDamage > effectiveShield) {
    remainingDamage -= effectiveShield
    damagedShield = effectiveShield
    // 更新单位的当前护盾
    defender.currentShield = Math.max(0, defenderCurrentShield - damagedShield)
  } else {
    damagedShield = remainingDamage
    defender.currentShield = Math.max(0, defenderCurrentShield - damagedShield)
    return { destroyed: 0, damagedShield, armorDamageDealt: 0 }
  }

  // 穿透护盾后对装甲造成损坏累积
  if (remainingDamage > 0) {
    armorDamageDealt = Math.min(
      COMBAT_EFFECTS.ARMOR_DAMAGE_RATE,
      COMBAT_EFFECTS.MAX_ARMOR_DAMAGE - (defender.armorDamage ?? 0)
    )
    defender.armorDamage = Math.min(
      COMBAT_EFFECTS.MAX_ARMOR_DAMAGE,
      (defender.armorDamage ?? 0) + armorDamageDealt
    )
  }

  // 再消耗装甲
  if (remainingDamage > effectiveArmor) {
    destroyed = 1
  } else {
    // 有概率摧毁（基于伤害与有效装甲的比例）
    const destroyChance = remainingDamage / effectiveArmor
    if (Math.random() < destroyChance) {
      destroyed = 1
    }
  }

  return { destroyed, damagedShield, armorDamageDealt }
}

/**
 * 执行单个攻击单位的射击（包含快速射击机制）
 * OGame规则：如果攻击者对目标有rapidFire值N，攻击后有(N-1)/N的概率再次攻击
 * @param attacker 攻击单位
 * @param targets 目标单位数组
 * @param losses 损失记录对象
 * @param isShipLoss 是否是舰船损失（用于区分舰船和防御）
 */
const executeAttack = (
  attacker: CombatUnit,
  targets: CombatUnit[],
  shipLosses: Partial<Fleet>,
  defenseLosses: Partial<Record<DefenseType, number>>
): void => {
  if (targets.length === 0) return

  // 随机选择一个目标
  const targetIndex = Math.floor(Math.random() * targets.length)
  const target = targets[targetIndex]
  if (!target) return

  const { destroyed } = calculateDamage(attacker, target)

  if (destroyed > 0) {
    target.count -= destroyed

    // 记录损失
    if (Object.values(ShipType).includes(target.type as ShipType)) {
      const shipType = target.type as ShipType
      shipLosses[shipType] = (shipLosses[shipType] || 0) + destroyed
    } else {
      const defenseType = target.type as DefenseType
      defenseLosses[defenseType] = (defenseLosses[defenseType] || 0) + destroyed
    }

    // 如果目标被全部摧毁，从列表中移除
    if (target.count <= 0) {
      targets.splice(targetIndex, 1)
    }
  }

  // 快速射击机制：如果攻击者对目标类型有rapidFire，有概率继续攻击
  if (attacker.rapidFire && targets.length > 0) {
    const rapidFireValue = attacker.rapidFire[target.type]
    if (rapidFireValue && rapidFireValue > 1) {
      // 继续攻击的概率 = (N-1)/N
      const continueChance = (rapidFireValue - 1) / rapidFireValue
      if (Math.random() < continueChance) {
        // 递归执行下一次攻击
        executeAttack(attacker, targets, shipLosses, defenseLosses)
      }
    }
  }
}

/**
 * 执行一轮战斗
 */
const executeRound = (attackerUnits: CombatUnit[], defenderUnits: CombatUnit[]): RoundResult => {
  const attackerLosses: Partial<Fleet> = {}
  const defenderShipLosses: Partial<Fleet> = {}
  const defenderDefenseLosses: Partial<Record<DefenseType, number>> = {}

  // 攻击方向防守方射击（带快速射击）
  for (const attacker of attackerUnits) {
    for (let i = 0; i < attacker.count; i++) {
      if (defenderUnits.length === 0) break
      executeAttack(attacker, defenderUnits, defenderShipLosses, defenderDefenseLosses)
    }
  }

  // 防守方向攻击方射击（防御设施没有rapidFire，使用简化逻辑）
  for (const defender of defenderUnits) {
    for (let i = 0; i < defender.count; i++) {
      if (attackerUnits.length === 0) break

      const targetIndex = Math.floor(Math.random() * attackerUnits.length)
      const target = attackerUnits[targetIndex]

      if (!target) continue

      const { destroyed } = calculateDamage(defender, target)

      if (destroyed > 0) {
        target.count -= destroyed

        // 记录损失
        const shipType = target.type as ShipType
        attackerLosses[shipType] = (attackerLosses[shipType] || 0) + destroyed

        // 如果目标被全部摧毁，从列表中移除
        if (target.count <= 0) {
          attackerUnits.splice(targetIndex, 1)
        }
      }
    }
  }

  // 计算剩余战斗力
  const attackerPower = attackerUnits.reduce((sum, unit) => sum + unit.count * unit.attack, 0)
  const defenderPower = defenderUnits.reduce((sum, unit) => sum + unit.count * unit.attack, 0)

  return {
    attackerLosses,
    defenderLosses: {
      fleet: defenderShipLosses,
      defense: defenderDefenseLosses
    },
    attackerRemainingPower: attackerPower,
    defenderRemainingPower: defenderPower
  }
}

/**
 * 模拟完整战斗
 * @param attacker 攻击方
 * @param defender 防守方
 * @param maxRounds 最大回合数（默认6回合）
 */
export const simulateBattle = (
  attacker: BattleSide,
  defender: BattleSide,
  maxRounds: number = 6
): {
  winner: 'attacker' | 'defender' | 'draw'
  rounds: number
  attackerLosses: Partial<Fleet>
  defenderLosses: {
    fleet: Partial<Fleet>
    defense: Partial<Record<DefenseType, number>>
  }
  attackerRemaining: Partial<Fleet>
  defenderRemaining: {
    fleet: Partial<Fleet>
    defense: Partial<Record<DefenseType, number>>
  }
  roundDetails: Array<{
    round: number
    attackerLosses: Partial<Fleet>
    defenderLosses: {
      fleet: Partial<Fleet>
      defense: Partial<Record<DefenseType, number>>
    }
    attackerRemainingPower: number
    defenderRemainingPower: number
  }>
} => {
  // 准备战斗单位
  let attackerUnits = prepareCombatUnits(attacker, false)
  let defenderUnits = prepareCombatUnits(defender, true)

  // 初始化战斗状态
  const initializeCombatState = (units: CombatUnit[]) => {
    for (const unit of units) {
      unit.currentShield = unit.shield
      unit.armorDamage = 0
    }
  }
  initializeCombatState(attackerUnits)
  initializeCombatState(defenderUnits)

  // 护盾再生函数：每轮战斗后恢复部分护盾
  const regenerateShields = (units: CombatUnit[]) => {
    for (const unit of units) {
      if (unit.currentShield !== undefined && unit.currentShield < unit.shield) {
        // 恢复最大护盾的70%（但不超过最大值）
        const regenAmount = unit.shield * COMBAT_EFFECTS.SHIELD_REGEN_RATE
        unit.currentShield = Math.min(unit.shield, unit.currentShield + regenAmount)
      }
    }
  }

  const totalAttackerLosses: Partial<Fleet> = {}
  const totalDefenderShipLosses: Partial<Fleet> = {}
  const totalDefenderDefenseLosses: Partial<Record<DefenseType, number>> = {}
  const roundDetails: Array<{
    round: number
    attackerLosses: Partial<Fleet>
    defenderLosses: {
      fleet: Partial<Fleet>
      defense: Partial<Record<DefenseType, number>>
    }
    attackerRemainingPower: number
    defenderRemainingPower: number
  }> = []

  let rounds = 0

  // 执行最多maxRounds轮战斗
  for (let round = 0; round < maxRounds; round++) {
    if (attackerUnits.length === 0 || defenderUnits.length === 0) {
      break
    }

    rounds++

    const roundResult = executeRound(attackerUnits, defenderUnits)

    // 每轮结束后护盾再生
    regenerateShields(attackerUnits)
    regenerateShields(defenderUnits)

    // 保存当前回合详情
    roundDetails.push({
      round: rounds,
      attackerLosses: { ...roundResult.attackerLosses },
      defenderLosses: {
        fleet: { ...roundResult.defenderLosses.fleet },
        defense: { ...roundResult.defenderLosses.defense }
      },
      attackerRemainingPower: roundResult.attackerRemainingPower,
      defenderRemainingPower: roundResult.defenderRemainingPower
    })

    // 累计损失
    for (const [shipType, count] of Object.entries(roundResult.attackerLosses)) {
      totalAttackerLosses[shipType as ShipType] = (totalAttackerLosses[shipType as ShipType] || 0) + count
    }

    for (const [shipType, count] of Object.entries(roundResult.defenderLosses.fleet)) {
      totalDefenderShipLosses[shipType as ShipType] = (totalDefenderShipLosses[shipType as ShipType] || 0) + count
    }

    for (const [defenseType, count] of Object.entries(roundResult.defenderLosses.defense)) {
      totalDefenderDefenseLosses[defenseType as DefenseType] = (totalDefenderDefenseLosses[defenseType as DefenseType] || 0) + count
    }
  }

  // 防御设施有概率修复（70%概率）
  const repairedDefense: Partial<Record<DefenseType, number>> = {}
  for (const [defenseType, count] of Object.entries(totalDefenderDefenseLosses)) {
    const repaired = Math.floor(count * 0.7)
    if (repaired > 0) {
      repairedDefense[defenseType as DefenseType] = repaired
      totalDefenderDefenseLosses[defenseType as DefenseType] = count - repaired
    }
  }

  // 计算剩余单位
  const attackerRemaining: Partial<Fleet> = {}
  for (const unit of attackerUnits) {
    if (unit.count > 0) {
      attackerRemaining[unit.type as ShipType] = unit.count
    }
  }

  const defenderShipRemaining: Partial<Fleet> = {}
  const defenderDefenseRemaining: Partial<Record<DefenseType, number>> = {}
  for (const unit of defenderUnits) {
    if (unit.count > 0) {
      if (Object.values(ShipType).includes(unit.type as ShipType)) {
        defenderShipRemaining[unit.type as ShipType] = unit.count
      } else {
        defenderDefenseRemaining[unit.type as DefenseType] = unit.count
      }
    }
  }

  // 添加修复的防御设施
  for (const [defenseType, count] of Object.entries(repairedDefense)) {
    defenderDefenseRemaining[defenseType as DefenseType] = (defenderDefenseRemaining[defenseType as DefenseType] || 0) + count
  }

  // 判断胜负
  let winner: 'attacker' | 'defender' | 'draw'
  if (attackerUnits.length === 0 && defenderUnits.length === 0) {
    winner = 'draw'
  } else if (attackerUnits.length === 0) {
    winner = 'defender'
  } else if (defenderUnits.length === 0) {
    winner = 'attacker'
  } else {
    // OGame原版规则：6回合后双方都有剩余单位时判定为平局
    winner = 'draw'
  }

  return {
    winner,
    rounds,
    attackerLosses: totalAttackerLosses,
    defenderLosses: {
      fleet: totalDefenderShipLosses,
      defense: totalDefenderDefenseLosses
    },
    attackerRemaining,
    defenderRemaining: {
      fleet: defenderShipRemaining,
      defense: defenderDefenseRemaining
    },
    roundDetails
  }
}

/**
 * 计算掠夺的资源
 * 攻击方最多可以掠夺防守方50%的资源，但受运输船载货量限制
 */
export const calculatePlunder = (defenderResources: Resources, attackerFleet: Partial<Fleet>): Resources => {
  // 计算总载货量
  let totalCapacity = 0
  for (const [shipType, count] of Object.entries(attackerFleet)) {
    const config = SHIPS[shipType as ShipType]
    totalCapacity += config.cargoCapacity * count
  }

  // 计算可掠夺资源（50%）
  const availableResources = {
    metal: Math.floor(defenderResources.metal * 0.5),
    crystal: Math.floor(defenderResources.crystal * 0.5),
    deuterium: Math.floor(defenderResources.deuterium * 0.5),
    darkMatter: Math.floor(defenderResources.darkMatter * 0.5),
    energy: 0
  }

  const totalAvailable =
    availableResources.metal + availableResources.crystal + availableResources.deuterium + availableResources.darkMatter

  // 如果载货量足够，全部掠夺
  if (totalCapacity >= totalAvailable) {
    return availableResources
  }

  // 否则按比例分配
  const ratio = totalCapacity / totalAvailable
  return {
    metal: Math.floor(availableResources.metal * ratio),
    crystal: Math.floor(availableResources.crystal * ratio),
    deuterium: Math.floor(availableResources.deuterium * ratio),
    darkMatter: Math.floor(availableResources.darkMatter * ratio),
    energy: 0
  }
}

/**
 * 计算残骸场
 * 被摧毁的舰船和防御会产生30%的金属和晶体残骸
 */
export const calculateDebrisField = (
  attackerLosses: Partial<Fleet>,
  defenderLosses: {
    fleet: Partial<Fleet>
    defense: Partial<Record<DefenseType, number>>
  }
): Resources => {
  let totalMetal = 0
  let totalCrystal = 0

  // 计算攻击方损失产生的残骸
  for (const [shipType, count] of Object.entries(attackerLosses)) {
    const config = SHIPS[shipType as ShipType]
    totalMetal += config.cost.metal * count * 0.3
    totalCrystal += config.cost.crystal * count * 0.3
  }

  // 计算防守方舰船损失产生的残骸
  for (const [shipType, count] of Object.entries(defenderLosses.fleet)) {
    const config = SHIPS[shipType as ShipType]
    totalMetal += config.cost.metal * count * 0.3
    totalCrystal += config.cost.crystal * count * 0.3
  }

  // 计算防守方防御损失产生的残骸
  for (const [defenseType, count] of Object.entries(defenderLosses.defense)) {
    const config = DEFENSES[defenseType as DefenseType]
    totalMetal += config.cost.metal * count * 0.3
    totalCrystal += config.cost.crystal * count * 0.3
  }

  return {
    metal: Math.floor(totalMetal),
    crystal: Math.floor(totalCrystal),
    deuterium: 0,
    darkMatter: 0,
    energy: 0
  }
}
