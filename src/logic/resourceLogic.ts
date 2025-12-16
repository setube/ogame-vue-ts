import type { Planet, Resources, Officer } from '@/types/game'
import { BuildingType, OfficerType } from '@/types/game'
import * as officerLogic from './officerLogic'
import { OFFICERS } from '@/config/gameConfig'

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

  // 太阳能卫星每个产出：50点能量
  const solarSatelliteProduction = solarSatelliteCount * 50

  return (solarPlantProduction + fusionReactorProduction + solarSatelliteProduction) * energyBonus
}

/**
 * 计算电量消耗
 */
export const calculateEnergyConsumption = (planet: Planet): number => {
  const metalMineLevel = planet.buildings[BuildingType.MetalMine] || 0
  const crystalMineLevel = planet.buildings[BuildingType.CrystalMine] || 0
  const deuteriumSynthesizerLevel = planet.buildings[BuildingType.DeuteriumSynthesizer] || 0

  // 矿场每级消耗：10 * 1.1^等级
  const metalConsumption = metalMineLevel * 10 * Math.pow(1.1, metalMineLevel)
  const crystalConsumption = crystalMineLevel * 10 * Math.pow(1.1, crystalMineLevel)
  const deuteriumConsumption = deuteriumSynthesizerLevel * 15 * Math.pow(1.1, deuteriumSynthesizerLevel)

  return metalConsumption + crystalConsumption + deuteriumConsumption
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

  // 检查当前能量是否充足
  // 如果当前能量 <= 0，矿场停止生产
  const hasEnergy = planet.resources.energy > 0
  const productionEfficiency = hasEnergy ? 1 : 0

  return {
    metal: metalMineLevel * 1500 * Math.pow(1.5, metalMineLevel) * resourceBonus * productionEfficiency,
    crystal: crystalMineLevel * 1000 * Math.pow(1.5, crystalMineLevel) * resourceBonus * productionEfficiency,
    deuterium: deuteriumSynthesizerLevel * 500 * Math.pow(1.5, deuteriumSynthesizerLevel) * resourceBonus * productionEfficiency,
    darkMatter: darkMatterCollectorLevel * 25 * Math.pow(1.5, darkMatterCollectorLevel) * darkMatterBonus,
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
  resourceSpeed: number = 1
): void => {
  const timeDiff = ((now - planet.lastUpdate) / 1000) * (resourceSpeed || 1) // 转换为秒并应用资源速度倍率

  // 计算能量消耗（每小时）
  const energyConsumption = calculateEnergyConsumption(planet)

  // 先增加能量产出
  const energyProduction = calculateEnergyProduction(planet, { energyProductionBonus: bonuses.energyProductionBonus })
  planet.resources.energy += (energyProduction * timeDiff) / 3600

  // 限制能量上限
  const capacity = calculateResourceCapacity(planet, bonuses.storageCapacityBonus)
  planet.resources.energy = Math.min(planet.resources.energy, capacity.energy)

  // 扣除能量消耗
  planet.resources.energy -= (energyConsumption * timeDiff) / 3600

  // 能量不能为负数，最低为0
  planet.resources.energy = Math.max(0, planet.resources.energy)

  // 计算资源产量（会检查能量是否充足）
  const production = calculateResourceProduction(planet, {
    resourceProductionBonus: bonuses.resourceProductionBonus,
    darkMatterProductionBonus: bonuses.darkMatterProductionBonus,
    energyProductionBonus: bonuses.energyProductionBonus
  })

  // 更新资源（转换为每秒产量）
  planet.resources.metal += (production.metal * timeDiff) / 3600
  planet.resources.crystal += (production.crystal * timeDiff) / 3600
  planet.resources.deuterium += (production.deuterium * timeDiff) / 3600
  planet.resources.darkMatter += (production.darkMatter * timeDiff) / 3600

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
export const deductResources = (currentResources: Resources, cost: Resources): void => {
  currentResources.metal -= cost.metal
  currentResources.crystal -= cost.crystal
  currentResources.deuterium -= cost.deuterium
  currentResources.darkMatter -= cost.darkMatter
}

/**
 * 添加资源
 */
export const addResources = (currentResources: Resources, amount: Resources): void => {
  currentResources.metal += amount.metal
  currentResources.crystal += amount.crystal
  currentResources.deuterium += amount.deuterium
  currentResources.darkMatter += amount.darkMatter
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
  metalMine: ConsumptionDetail
  crystalMine: ConsumptionDetail
  deuteriumSynthesizer: ConsumptionDetail
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

  const hasEnergy = planet.resources.energy > 0
  const productionEfficiency = hasEnergy ? 1 : 0

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

  if (!hasEnergy) {
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

  if (!hasEnergy) {
    crystalBonuses.push({
      name: 'resources.noEnergy',
      percentage: -100,
      value: -crystalBase * (1 + totalResourceBonus / 100),
      source: 'other'
    })
  }

  const crystalFinal = crystalBase * (1 + totalResourceBonus / 100) * productionEfficiency

  // 重氢合成器产量
  const deuteriumBase = deuteriumSynthesizerLevel * 500 * Math.pow(1.5, deuteriumSynthesizerLevel)
  const deuteriumBonuses: ProductionBonus[] = []

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

  if (!hasEnergy) {
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
  const solarSatelliteProduction = solarSatelliteCount * 50

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

  const speed = resourceSpeed || 1

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
  const metalMineLevel = planet.buildings[BuildingType.MetalMine] || 0
  const crystalMineLevel = planet.buildings[BuildingType.CrystalMine] || 0
  const deuteriumSynthesizerLevel = planet.buildings[BuildingType.DeuteriumSynthesizer] || 0

  const metalConsumption = metalMineLevel * 10 * Math.pow(1.1, metalMineLevel)
  const crystalConsumption = crystalMineLevel * 10 * Math.pow(1.1, crystalMineLevel)
  const deuteriumConsumption = deuteriumSynthesizerLevel * 15 * Math.pow(1.1, deuteriumSynthesizerLevel)

  const speed = resourceSpeed || 1

  return {
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
    total: (metalConsumption + crystalConsumption + deuteriumConsumption) * speed
  }
}
