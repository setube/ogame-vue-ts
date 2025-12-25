import type { Planet, Resources, Officer } from '@/types/game'
import { BuildingType, OfficerType } from '@/types/game'
import * as officerLogic from './officerLogic'
import { OFFICERS } from '@/config/gameConfig'
import * as oreDepositLogic from './oreDepositLogic'
import * as planetLogic from './planetLogic'

/**
 * 计算电量产出
 */
export const calculateEnergyProduction = (
  planet: Planet,
  bonuses: {
    energyProductionBonus: number
  }
): number => {
  const solarPlantLevel = planet.buildings[BuildingType.SolarPlant] || 0
  const fusionReactorLevel = planet.buildings[BuildingType.FusionReactor] || 0
  const solarSatelliteCount = planet.fleet.solarSatellite || 0
  const energyBonus = 1 + (bonuses.energyProductionBonus || 0) / 100

  // 太阳能电站每级产出：50 * 1.1^等级
  const solarPlantProduction = solarPlantLevel * 50 * Math.pow(1.1, solarPlantLevel)

  // 核聚变反应堆每级产出：150 * 1.15^等级（消耗重氢）
  const fusionReactorProduction = fusionReactorLevel * 150 * Math.pow(1.15, fusionReactorLevel)

  // 太阳能卫星产出：基于星球温度计算
  // OGame 原版公式：(maxTemp + 160) / 6
  // 温度越高，太阳能卫星产能越高
  const maxTemp = planet.temperature?.max ?? 0
  const solarSatelliteOutputPerUnit = planetLogic.calculateSolarSatelliteOutput(maxTemp)
  const solarSatelliteProduction = solarSatelliteCount * solarSatelliteOutputPerUnit

  return (solarPlantProduction + fusionReactorProduction + solarSatelliteProduction) * energyBonus
}

/**
 * 计算电量消耗
 */
export const calculateEnergyConsumption = (planet: Planet): number => {
  // 资源建筑消耗
  const metalMineLevel = planet.buildings[BuildingType.MetalMine] || 0
  const crystalMineLevel = planet.buildings[BuildingType.CrystalMine] || 0
  const deuteriumSynthesizerLevel = planet.buildings[BuildingType.DeuteriumSynthesizer] || 0

  // 设施建筑消耗
  const roboticsFactoryLevel = planet.buildings[BuildingType.RoboticsFactory] || 0
  const naniteFactoryLevel = planet.buildings[BuildingType.NaniteFactory] || 0
  const shipyardLevel = planet.buildings[BuildingType.Shipyard] || 0
  const researchLabLevel = planet.buildings[BuildingType.ResearchLab] || 0
  const missileSiloLevel = planet.buildings[BuildingType.MissileSilo] || 0
  const terraformerLevel = planet.buildings[BuildingType.Terraformer] || 0
  const darkMatterCollectorLevel = planet.buildings[BuildingType.DarkMatterCollector] || 0

  // 月球建筑消耗
  const sensorPhalanxLevel = planet.buildings[BuildingType.SensorPhalanx] || 0
  const jumpGateLevel = planet.buildings[BuildingType.JumpGate] || 0

  // 矿场每级消耗：10 * 1.1^等级
  const metalConsumption = metalMineLevel * 10 * Math.pow(1.1, metalMineLevel)
  const crystalConsumption = crystalMineLevel * 10 * Math.pow(1.1, crystalMineLevel)
  const deuteriumConsumption = deuteriumSynthesizerLevel * 15 * Math.pow(1.1, deuteriumSynthesizerLevel)

  // 设施建筑消耗
  const roboticsConsumption = roboticsFactoryLevel * 5 * Math.pow(1.1, roboticsFactoryLevel)
  const naniteConsumption = naniteFactoryLevel * 20 * Math.pow(1.15, naniteFactoryLevel)
  const shipyardConsumption = shipyardLevel * 8 * Math.pow(1.1, shipyardLevel)
  const researchLabConsumption = researchLabLevel * 12 * Math.pow(1.1, researchLabLevel)
  const missileSiloConsumption = missileSiloLevel * 8 * Math.pow(1.1, missileSiloLevel)
  const terraformerConsumption = terraformerLevel * 25 * Math.pow(1.15, terraformerLevel)
  const darkMatterCollectorConsumption = darkMatterCollectorLevel * 10 * Math.pow(1.1, darkMatterCollectorLevel)

  // 月球建筑消耗
  const sensorPhalanxConsumption = sensorPhalanxLevel * 15 * Math.pow(1.12, sensorPhalanxLevel)
  const jumpGateConsumption = jumpGateLevel * 50 * Math.pow(1.2, jumpGateLevel)

  return (
    metalConsumption +
    crystalConsumption +
    deuteriumConsumption +
    roboticsConsumption +
    naniteConsumption +
    shipyardConsumption +
    researchLabConsumption +
    missileSiloConsumption +
    terraformerConsumption +
    darkMatterCollectorConsumption +
    sensorPhalanxConsumption +
    jumpGateConsumption
  )
}

/**
 * 计算资源产量（每小时）
 */
export const calculateResourceProduction = (
  planet: Planet,
  bonuses: {
    resourceProductionBonus: number
    darkMatterProductionBonus: number
    energyProductionBonus: number
  }
): Resources => {
  const metalMineLevel = planet.buildings[BuildingType.MetalMine] || 0
  const crystalMineLevel = planet.buildings[BuildingType.CrystalMine] || 0
  const deuteriumSynthesizerLevel = planet.buildings[BuildingType.DeuteriumSynthesizer] || 0
  const darkMatterCollectorLevel = planet.buildings[BuildingType.DarkMatterCollector] || 0

  const resourceBonus = 1 + (bonuses.resourceProductionBonus || 0) / 100
  const darkMatterBonus = 1 + (bonuses.darkMatterProductionBonus || 0) / 100

  // 计算能量产出（每小时）
  const energyProduction = calculateEnergyProduction(planet, { energyProductionBonus: bonuses.energyProductionBonus })

  // 计算能量消耗（每小时）
  const energyConsumption = calculateEnergyConsumption(planet)

  // 检查能量平衡是否充足
  // 如果能量产出 >= 能量消耗，矿场正常生产
  // 这样即使浏览器关闭后再打开，只要能量平衡是正的，就能正常生产
  const hasPositiveEnergyBalance = energyProduction >= energyConsumption
  const productionEfficiency = hasPositiveEnergyBalance ? 1 : 0

  // 计算矿脉储量效率（当储量接近耗尽时产量下降）
  const metalDepositEfficiency = oreDepositLogic.calculateDepositEfficiency(planet.oreDeposits, 'metal')
  const crystalDepositEfficiency = oreDepositLogic.calculateDepositEfficiency(planet.oreDeposits, 'crystal')
  const deuteriumDepositEfficiency = oreDepositLogic.calculateDepositEfficiency(planet.oreDeposits, 'deuterium')

  // 重氢温度加成：温度越低，产量越高
  const deuteriumTempBonus = planetLogic.calculateDeuteriumTemperatureBonus(planet.temperature?.max ?? 0)

  return {
    metal: metalMineLevel * 1500 * Math.pow(1.5, metalMineLevel) * resourceBonus * productionEfficiency * metalDepositEfficiency,
    crystal: crystalMineLevel * 1000 * Math.pow(1.5, crystalMineLevel) * resourceBonus * productionEfficiency * crystalDepositEfficiency,
    deuterium:
      deuteriumSynthesizerLevel *
      500 *
      Math.pow(1.5, deuteriumSynthesizerLevel) *
      resourceBonus *
      productionEfficiency *
      deuteriumDepositEfficiency *
      deuteriumTempBonus,
    darkMatter: darkMatterCollectorLevel * 100 * Math.pow(1.5, darkMatterCollectorLevel) * darkMatterBonus,
    energy: energyProduction
  }
}

/**
 * 计算资源容量
 */
export const calculateResourceCapacity = (planet: Planet, storageCapacityBonus: number): Resources => {
  const metalStorageLevel = planet.buildings[BuildingType.MetalStorage] || 0
  const crystalStorageLevel = planet.buildings[BuildingType.CrystalStorage] || 0
  const deuteriumTankLevel = planet.buildings[BuildingType.DeuteriumTank] || 0
  const darkMatterTankLevel = planet.buildings[BuildingType.DarkMatterTank] || 0
  const solarPlantLevel = planet.buildings[BuildingType.SolarPlant] || 0

  const bonus = 1 + (storageCapacityBonus || 0) / 100

  // OGame规则：基础容量10000，资源可以超过容量（只影响生产，不会丢失）
  // 月球没有矿场，所以超过容量没有影响，玩家可以从行星运输资源到月球
  const baseCapacity = 10000
  const darkMatterBaseCapacity = 1000 // 暗物质基础容量较小
  return {
    metal: baseCapacity * Math.pow(2, metalStorageLevel) * bonus,
    crystal: baseCapacity * Math.pow(2, crystalStorageLevel) * bonus,
    deuterium: baseCapacity * Math.pow(2, deuteriumTankLevel) * bonus,
    darkMatter: darkMatterBaseCapacity * Math.pow(2, darkMatterTankLevel) * bonus,
    energy: 1000 + solarPlantLevel * 500 // 能量容量基于太阳能电站等级
  }
}

/**
 * 更新星球资源
 */
export const updatePlanetResources = (
  planet: Planet,
  now: number,
  bonuses: {
    resourceProductionBonus: number
    darkMatterProductionBonus: number
    energyProductionBonus: number
    storageCapacityBonus: number
  },
  gameSpeed: number = 1
): void => {
  const timeDiff = (now - planet.lastUpdate) / 1000 // 转换为秒

  // 时间回拨保护：如果时间差为负或为零，跳过资源更新但重置时间戳
  if (timeDiff <= 0) {
    planet.lastUpdate = now
    return
  }

  // 应用游戏速度到时间差（游戏速度影响资源产出速率）
  const effectiveTimeDiff = timeDiff * gameSpeed

  // 计算能量消耗（每小时）
  const energyConsumption = calculateEnergyConsumption(planet)

  // 先增加能量产出
  const energyProduction = calculateEnergyProduction(planet, { energyProductionBonus: bonuses.energyProductionBonus })
  planet.resources.energy += (energyProduction * effectiveTimeDiff) / 3600

  // 限制能量上限
  const capacity = calculateResourceCapacity(planet, bonuses.storageCapacityBonus)
  planet.resources.energy = Math.min(planet.resources.energy, capacity.energy)

  // 扣除能量消耗
  planet.resources.energy -= (energyConsumption * effectiveTimeDiff) / 3600

  // 能量不能为负数，最低为0
  planet.resources.energy = Math.max(0, planet.resources.energy)

  // 计算资源产量（会检查能量是否充足，以及矿脉储量效率）
  const production = calculateResourceProduction(planet, {
    resourceProductionBonus: bonuses.resourceProductionBonus,
    darkMatterProductionBonus: bonuses.darkMatterProductionBonus,
    energyProductionBonus: bonuses.energyProductionBonus
  })

  // 计算实际产出量（用于消耗矿脉储量）
  const metalProduced = (production.metal * effectiveTimeDiff) / 3600
  const crystalProduced = (production.crystal * effectiveTimeDiff) / 3600
  const deuteriumProduced = (production.deuterium * effectiveTimeDiff) / 3600

  // 消耗矿脉储量（如果有）
  if (planet.oreDeposits && !planet.isMoon) {
    oreDepositLogic.consumeDeposit(planet.oreDeposits, 'metal', metalProduced)
    oreDepositLogic.consumeDeposit(planet.oreDeposits, 'crystal', crystalProduced)
    oreDepositLogic.consumeDeposit(planet.oreDeposits, 'deuterium', deuteriumProduced)

    // 矿脉缓慢恢复（每次更新时恢复一小部分）
    // 地质研究站等级影响恢复速度
    const hoursElapsed = effectiveTimeDiff / 3600
    const geoStationLevel = planet.buildings[BuildingType.GeoResearchStation] || 0
    oreDepositLogic.regenerateDeposits(planet.oreDeposits, hoursElapsed, geoStationLevel)
  }

  // 更新资源（转换为每秒产量，应用游戏速度）
  planet.resources.metal += metalProduced
  planet.resources.crystal += crystalProduced
  planet.resources.deuterium += deuteriumProduced
  planet.resources.darkMatter += (production.darkMatter * effectiveTimeDiff) / 3600

  // 限制资源上限
  planet.resources.metal = Math.min(planet.resources.metal, capacity.metal)
  planet.resources.crystal = Math.min(planet.resources.crystal, capacity.crystal)
  planet.resources.deuterium = Math.min(planet.resources.deuterium, capacity.deuterium)
  planet.resources.darkMatter = Math.min(planet.resources.darkMatter, capacity.darkMatter)

  planet.lastUpdate = now
}

/**
 * 检查资源是否足够
 */
export const checkResourcesAvailable = (currentResources: Resources, cost: Resources): boolean => {
  return (
    currentResources.metal >= cost.metal &&
    currentResources.crystal >= cost.crystal &&
    currentResources.deuterium >= cost.deuterium &&
    currentResources.darkMatter >= cost.darkMatter
  )
}

/**
 * 扣除资源
 */
export const deductResources = (currentResources: Resources, cost: Partial<Resources>): void => {
  currentResources.metal -= cost.metal || 0
  currentResources.crystal -= cost.crystal || 0
  currentResources.deuterium -= cost.deuterium || 0
  currentResources.darkMatter -= cost.darkMatter || 0
}

/**
 * 添加资源
 */
export const addResources = (currentResources: Resources, amount: Partial<Resources>): void => {
  currentResources.metal += amount.metal || 0
  currentResources.crystal += amount.crystal || 0
  currentResources.deuterium += amount.deuterium || 0
  currentResources.darkMatter += amount.darkMatter || 0
}

/**
 * 安全地添加资源（会检查仓储容量上限）
 * @param planet 星球对象
 * @param amount 要添加的资源
 * @param storageCapacityBonus 仓储容量加成
 * @returns 实际添加的资源数量和溢出的资源数量
 */
export const addResourcesSafely = (
  planet: Planet,
  amount: Resources,
  storageCapacityBonus: number
): { added: Resources; overflow: Resources } => {
  const capacity = calculateResourceCapacity(planet, storageCapacityBonus)

  const added: Resources = { metal: 0, crystal: 0, deuterium: 0, darkMatter: 0, energy: 0 }
  const overflow: Resources = { metal: 0, crystal: 0, deuterium: 0, darkMatter: 0, energy: 0 }

  // 处理每种资源
  const resources: Array<keyof Resources> = ['metal', 'crystal', 'deuterium', 'darkMatter']

  for (const resourceType of resources) {
    const currentAmount = planet.resources[resourceType]
    const amountToAdd = amount[resourceType]
    const maxCapacity = capacity[resourceType]

    // 计算可以添加的量（不超过容量上限）
    const spaceAvailable = Math.max(0, maxCapacity - currentAmount)
    const actuallyAdded = Math.min(amountToAdd, spaceAvailable)
    const overflowed = amountToAdd - actuallyAdded

    planet.resources[resourceType] += actuallyAdded
    added[resourceType] = actuallyAdded
    overflow[resourceType] = overflowed
  }

  return { added, overflow }
}

/**
 * 资源产量详细信息（用于UI展示）
 */
export interface ProductionBreakdown {
  metal: ProductionDetail
  crystal: ProductionDetail
  deuterium: ProductionDetail
  darkMatter: ProductionDetail
  energy: ProductionDetail
}

export interface ProductionDetail {
  baseProduction: number // 建筑基础产量
  buildingLevel: number // 建筑等级
  buildingName: string // 建筑名称（用于显示）
  bonuses: ProductionBonus[] // 加成列表
  finalProduction: number // 最终产量
  sources?: ProductionSource[] // 多个产量来源（用于能量）
}

export interface ProductionSource {
  name: string // 来源名称
  level: number // 等级或数量
  production: number // 产量
}

export interface ProductionBonus {
  name: string // 加成名称
  percentage: number // 加成百分比
  value: number // 实际增加的产量
  source: 'technology' | 'officer' | 'other' // 加成来源类型
}

/**
 * 能量消耗详细信息
 */
export interface ConsumptionBreakdown {
  // 资源建筑
  metalMine: ConsumptionDetail
  crystalMine: ConsumptionDetail
  deuteriumSynthesizer: ConsumptionDetail
  // 设施建筑
  roboticsFactory: ConsumptionDetail
  naniteFactory: ConsumptionDetail
  shipyard: ConsumptionDetail
  researchLab: ConsumptionDetail
  missileSilo: ConsumptionDetail
  terraformer: ConsumptionDetail
  darkMatterCollector: ConsumptionDetail
  // 月球建筑
  sensorPhalanx: ConsumptionDetail
  jumpGate: ConsumptionDetail
  total: number
}

export interface ConsumptionDetail {
  buildingLevel: number
  buildingName: string
  consumption: number
}

/**
 * 计算资源产量详细breakdown
 */
export const calculateProductionBreakdown = (
  planet: Planet,
  officers: Record<OfficerType, Officer>,
  currentTime: number,
  resourceSpeed: number = 1
): ProductionBreakdown => {
  const metalMineLevel = planet.buildings[BuildingType.MetalMine] || 0
  const crystalMineLevel = planet.buildings[BuildingType.CrystalMine] || 0
  const deuteriumSynthesizerLevel = planet.buildings[BuildingType.DeuteriumSynthesizer] || 0
  const darkMatterCollectorLevel = planet.buildings[BuildingType.DarkMatterCollector] || 0
  const solarPlantLevel = planet.buildings[BuildingType.SolarPlant] || 0

  // 计算能量平衡（基于产出vs消耗，而不是当前能量值）
  const energyProduction = calculateEnergyProduction(planet, { energyProductionBonus: 0 })
  const energyConsumption = calculateEnergyConsumption(planet)
  const hasPositiveEnergyBalance = energyProduction >= energyConsumption
  const productionEfficiency = hasPositiveEnergyBalance ? 1 : 0

  // 收集每个军官的加成信息
  const activeOfficerBonuses: Array<{
    type: OfficerType
    name: string
    resourceBonus: number
    darkMatterBonus: number
    energyBonus: number
  }> = []

  Object.values(officers).forEach(officer => {
    if (officerLogic.isOfficerActive(officer, currentTime)) {
      const config = OFFICERS[officer.type]
      activeOfficerBonuses.push({
        type: officer.type,
        name: config.name,
        resourceBonus: config.benefits.resourceProductionBonus || 0,
        darkMatterBonus: config.benefits.darkMatterProductionBonus || 0,
        energyBonus: config.benefits.energyProductionBonus || 0
      })
    }
  })

  // 计算总加成
  const totalResourceBonus = activeOfficerBonuses.reduce((sum, officer) => sum + officer.resourceBonus, 0)
  const totalDarkMatterBonus = activeOfficerBonuses.reduce((sum, officer) => sum + officer.darkMatterBonus, 0)
  const totalEnergyBonus = activeOfficerBonuses.reduce((sum, officer) => sum + officer.energyBonus, 0)

  // 金属矿产量
  const metalBase = metalMineLevel * 1500 * Math.pow(1.5, metalMineLevel)
  const metalBonuses: ProductionBonus[] = []

  // 为每个激活的军官添加加成项
  activeOfficerBonuses.forEach(officer => {
    if (officer.resourceBonus > 0) {
      const bonusValue = metalBase * (officer.resourceBonus / 100)
      metalBonuses.push({
        name: `officers.${officer.type}`,
        percentage: officer.resourceBonus,
        value: bonusValue,
        source: 'officer'
      })
    }
  })

  if (!hasPositiveEnergyBalance) {
    metalBonuses.push({
      name: 'resources.noEnergy',
      percentage: -100,
      value: -metalBase * (1 + totalResourceBonus / 100),
      source: 'other'
    })
  }

  const metalFinal = metalBase * (1 + totalResourceBonus / 100) * productionEfficiency

  // 晶体矿产量
  const crystalBase = crystalMineLevel * 1000 * Math.pow(1.5, crystalMineLevel)
  const crystalBonuses: ProductionBonus[] = []

  activeOfficerBonuses.forEach(officer => {
    if (officer.resourceBonus > 0) {
      const bonusValue = crystalBase * (officer.resourceBonus / 100)
      crystalBonuses.push({
        name: `officers.${officer.type}`,
        percentage: officer.resourceBonus,
        value: bonusValue,
        source: 'officer'
      })
    }
  })

  if (!hasPositiveEnergyBalance) {
    crystalBonuses.push({
      name: 'resources.noEnergy',
      percentage: -100,
      value: -crystalBase * (1 + totalResourceBonus / 100),
      source: 'other'
    })
  }

  const crystalFinal = crystalBase * (1 + totalResourceBonus / 100) * productionEfficiency

  // 重氢合成器产量（受温度影响）
  // OGame 原版规则：温度越低，重氢产量越高
  const deuteriumTempBonus = planetLogic.calculateDeuteriumTemperatureBonus(planet.temperature?.max ?? 0)
  const deuteriumBase = deuteriumSynthesizerLevel * 500 * Math.pow(1.5, deuteriumSynthesizerLevel) * deuteriumTempBonus
  const deuteriumBonuses: ProductionBonus[] = []

  // 温度加成显示
  if (planet.temperature) {
    const tempBonusPercent = Math.round((deuteriumTempBonus - 1) * 100)
    if (tempBonusPercent !== 0) {
      deuteriumBonuses.push({
        name: 'resources.temperatureBonus',
        percentage: tempBonusPercent,
        value: 0, // 已计入基础产量
        source: 'other'
      })
    }
  }

  activeOfficerBonuses.forEach(officer => {
    if (officer.resourceBonus > 0) {
      const bonusValue = deuteriumBase * (officer.resourceBonus / 100)
      deuteriumBonuses.push({
        name: `officers.${officer.type}`,
        percentage: officer.resourceBonus,
        value: bonusValue,
        source: 'officer'
      })
    }
  })

  if (!hasPositiveEnergyBalance) {
    deuteriumBonuses.push({
      name: 'resources.noEnergy',
      percentage: -100,
      value: -deuteriumBase * (1 + totalResourceBonus / 100),
      source: 'other'
    })
  }

  const deuteriumFinal = deuteriumBase * (1 + totalResourceBonus / 100) * productionEfficiency

  // 暗物质收集器产量
  const darkMatterBase = darkMatterCollectorLevel * 25 * Math.pow(1.5, darkMatterCollectorLevel)
  const darkMatterBonuses: ProductionBonus[] = []

  activeOfficerBonuses.forEach(officer => {
    if (officer.darkMatterBonus > 0) {
      const bonusValue = darkMatterBase * (officer.darkMatterBonus / 100)
      darkMatterBonuses.push({
        name: `officers.${officer.type}`,
        percentage: officer.darkMatterBonus,
        value: bonusValue,
        source: 'officer'
      })
    }
  })

  const darkMatterFinal = darkMatterBase * (1 + totalDarkMatterBonus / 100)

  // 能量产量（包含多个来源）
  const fusionReactorLevel = planet.buildings[BuildingType.FusionReactor] || 0
  const solarSatelliteCount = planet.fleet.solarSatellite || 0

  const solarPlantProduction = solarPlantLevel * 50 * Math.pow(1.1, solarPlantLevel)
  const fusionReactorProduction = fusionReactorLevel * 150 * Math.pow(1.15, fusionReactorLevel)

  // 太阳能卫星产出：基于星球温度计算
  const maxTemp = planet.temperature?.max ?? 0
  const solarSatelliteOutputPerUnit = planetLogic.calculateSolarSatelliteOutput(maxTemp)
  const solarSatelliteProduction = solarSatelliteCount * solarSatelliteOutputPerUnit

  const energyBase = solarPlantProduction + fusionReactorProduction + solarSatelliteProduction

  const energySources: ProductionSource[] = []
  if (solarPlantLevel > 0) {
    energySources.push({
      name: 'buildings.solarPlant',
      level: solarPlantLevel,
      production: solarPlantProduction
    })
  }
  if (fusionReactorLevel > 0) {
    energySources.push({
      name: 'buildings.fusionReactor',
      level: fusionReactorLevel,
      production: fusionReactorProduction
    })
  }
  if (solarSatelliteCount > 0) {
    energySources.push({
      name: 'ships.solarSatellite',
      level: solarSatelliteCount,
      production: solarSatelliteProduction
    })
  }

  const energyBonuses: ProductionBonus[] = []
  activeOfficerBonuses.forEach(officer => {
    if (officer.energyBonus > 0) {
      const bonusValue = energyBase * (officer.energyBonus / 100)
      energyBonuses.push({
        name: `officers.${officer.type}`,
        percentage: officer.energyBonus,
        value: bonusValue,
        source: 'officer'
      })
    }
  })

  const energyFinal = energyBase * (1 + totalEnergyBonus / 100)

  const speed = resourceSpeed

  const scaleBonuses = (bonuses: ProductionBonus[]) =>
    bonuses.map(bonus => ({
      ...bonus,
      value: bonus.value * speed
    }))

  const scaleSources = (sources?: ProductionSource[]) =>
    sources?.map(source => ({
      ...source,
      production: source.production * speed
    }))

  return {
    metal: {
      baseProduction: metalBase * speed,
      buildingLevel: metalMineLevel,
      buildingName: 'buildings.metalMine',
      bonuses: scaleBonuses(metalBonuses),
      finalProduction: metalFinal * speed
    },
    crystal: {
      baseProduction: crystalBase * speed,
      buildingLevel: crystalMineLevel,
      buildingName: 'buildings.crystalMine',
      bonuses: scaleBonuses(crystalBonuses),
      finalProduction: crystalFinal * speed
    },
    deuterium: {
      baseProduction: deuteriumBase * speed,
      buildingLevel: deuteriumSynthesizerLevel,
      buildingName: 'buildings.deuteriumSynthesizer',
      bonuses: scaleBonuses(deuteriumBonuses),
      finalProduction: deuteriumFinal * speed
    },
    darkMatter: {
      baseProduction: darkMatterBase * speed,
      buildingLevel: darkMatterCollectorLevel,
      buildingName: 'buildings.darkMatterCollector',
      bonuses: scaleBonuses(darkMatterBonuses),
      finalProduction: darkMatterFinal * speed
    },
    energy: {
      baseProduction: energyBase * speed,
      buildingLevel: solarPlantLevel,
      buildingName: 'buildings.solarPlant',
      bonuses: scaleBonuses(energyBonuses),
      finalProduction: energyFinal * speed,
      sources: scaleSources(energySources)
    }
  }
}

/**
 * 计算能量消耗详细breakdown
 */
export const calculateConsumptionBreakdown = (planet: Planet, resourceSpeed: number = 1): ConsumptionBreakdown => {
  // 资源建筑
  const metalMineLevel = planet.buildings[BuildingType.MetalMine] || 0
  const crystalMineLevel = planet.buildings[BuildingType.CrystalMine] || 0
  const deuteriumSynthesizerLevel = planet.buildings[BuildingType.DeuteriumSynthesizer] || 0

  // 设施建筑
  const roboticsFactoryLevel = planet.buildings[BuildingType.RoboticsFactory] || 0
  const naniteFactoryLevel = planet.buildings[BuildingType.NaniteFactory] || 0
  const shipyardLevel = planet.buildings[BuildingType.Shipyard] || 0
  const researchLabLevel = planet.buildings[BuildingType.ResearchLab] || 0
  const missileSiloLevel = planet.buildings[BuildingType.MissileSilo] || 0
  const terraformerLevel = planet.buildings[BuildingType.Terraformer] || 0
  const darkMatterCollectorLevel = planet.buildings[BuildingType.DarkMatterCollector] || 0

  // 月球建筑
  const sensorPhalanxLevel = planet.buildings[BuildingType.SensorPhalanx] || 0
  const jumpGateLevel = planet.buildings[BuildingType.JumpGate] || 0

  // 资源建筑消耗
  const metalConsumption = metalMineLevel * 10 * Math.pow(1.1, metalMineLevel)
  const crystalConsumption = crystalMineLevel * 10 * Math.pow(1.1, crystalMineLevel)
  const deuteriumConsumption = deuteriumSynthesizerLevel * 15 * Math.pow(1.1, deuteriumSynthesizerLevel)

  // 设施建筑消耗
  const roboticsConsumption = roboticsFactoryLevel * 5 * Math.pow(1.1, roboticsFactoryLevel)
  const naniteConsumption = naniteFactoryLevel * 20 * Math.pow(1.15, naniteFactoryLevel)
  const shipyardConsumption = shipyardLevel * 8 * Math.pow(1.1, shipyardLevel)
  const researchLabConsumption = researchLabLevel * 12 * Math.pow(1.1, researchLabLevel)
  const missileSiloConsumption = missileSiloLevel * 8 * Math.pow(1.1, missileSiloLevel)
  const terraformerConsumption = terraformerLevel * 25 * Math.pow(1.15, terraformerLevel)
  const darkMatterCollectorConsumption = darkMatterCollectorLevel * 10 * Math.pow(1.1, darkMatterCollectorLevel)

  // 月球建筑消耗
  const sensorPhalanxConsumption = sensorPhalanxLevel * 15 * Math.pow(1.12, sensorPhalanxLevel)
  const jumpGateConsumption = jumpGateLevel * 50 * Math.pow(1.2, jumpGateLevel)

  const speed = resourceSpeed

  const total =
    metalConsumption +
    crystalConsumption +
    deuteriumConsumption +
    roboticsConsumption +
    naniteConsumption +
    shipyardConsumption +
    researchLabConsumption +
    missileSiloConsumption +
    terraformerConsumption +
    darkMatterCollectorConsumption +
    sensorPhalanxConsumption +
    jumpGateConsumption

  return {
    // 资源建筑
    metalMine: {
      buildingLevel: metalMineLevel,
      buildingName: 'buildings.metalMine',
      consumption: metalConsumption * speed
    },
    crystalMine: {
      buildingLevel: crystalMineLevel,
      buildingName: 'buildings.crystalMine',
      consumption: crystalConsumption * speed
    },
    deuteriumSynthesizer: {
      buildingLevel: deuteriumSynthesizerLevel,
      buildingName: 'buildings.deuteriumSynthesizer',
      consumption: deuteriumConsumption * speed
    },
    // 设施建筑
    roboticsFactory: {
      buildingLevel: roboticsFactoryLevel,
      buildingName: 'buildings.roboticsFactory',
      consumption: roboticsConsumption * speed
    },
    naniteFactory: {
      buildingLevel: naniteFactoryLevel,
      buildingName: 'buildings.naniteFactory',
      consumption: naniteConsumption * speed
    },
    shipyard: {
      buildingLevel: shipyardLevel,
      buildingName: 'buildings.shipyard',
      consumption: shipyardConsumption * speed
    },
    researchLab: {
      buildingLevel: researchLabLevel,
      buildingName: 'buildings.researchLab',
      consumption: researchLabConsumption * speed
    },
    missileSilo: {
      buildingLevel: missileSiloLevel,
      buildingName: 'buildings.missileSilo',
      consumption: missileSiloConsumption * speed
    },
    terraformer: {
      buildingLevel: terraformerLevel,
      buildingName: 'buildings.terraformer',
      consumption: terraformerConsumption * speed
    },
    darkMatterCollector: {
      buildingLevel: darkMatterCollectorLevel,
      buildingName: 'buildings.darkMatterCollector',
      consumption: darkMatterCollectorConsumption * speed
    },
    // 月球建筑
    sensorPhalanx: {
      buildingLevel: sensorPhalanxLevel,
      buildingName: 'buildings.sensorPhalanx',
      consumption: sensorPhalanxConsumption * speed
    },
    jumpGate: {
      buildingLevel: jumpGateLevel,
      buildingName: 'buildings.jumpGate',
      consumption: jumpGateConsumption * speed
    },
    total: total * speed
  }
}
