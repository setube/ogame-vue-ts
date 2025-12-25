import { computed } from 'vue'
import { useI18n } from './useI18n'
import {
  BUILDINGS as ORIGINAL_BUILDINGS,
  SHIPS as ORIGINAL_SHIPS,
  DEFENSES as ORIGINAL_DEFENSES,
  TECHNOLOGIES as ORIGINAL_TECHNOLOGIES,
  OFFICERS as ORIGINAL_OFFICERS
} from '@/config/gameConfig'

import { BuildingType, ShipType, DefenseType, TechnologyType, OfficerType } from '@/types/game'

import type { BuildingConfig, ShipConfig, DefenseConfig, TechnologyConfig, OfficerConfig } from '@/types/game'

/**
 * 提供翻译后的游戏配置对象的 Composable
 * 将 i18n 系统的翻译覆盖到原始 gameConfig 上
 */
export const useGameConfig = () => {
  const { t } = useI18n()

  // 建筑类型枚举值到翻译键的映射
  const buildingKeyMap: Record<BuildingType, string> = {
    [BuildingType.MetalMine]: 'metalMine',
    [BuildingType.CrystalMine]: 'crystalMine',
    [BuildingType.DeuteriumSynthesizer]: 'deuteriumSynthesizer',
    [BuildingType.SolarPlant]: 'solarPlant',
    [BuildingType.FusionReactor]: 'fusionReactor',
    [BuildingType.RoboticsFactory]: 'roboticsFactory',
    [BuildingType.NaniteFactory]: 'naniteFactory',
    [BuildingType.Shipyard]: 'shipyard',
    [BuildingType.Hangar]: 'hangar',
    [BuildingType.ResearchLab]: 'researchLab',
    [BuildingType.MetalStorage]: 'metalStorage',
    [BuildingType.CrystalStorage]: 'crystalStorage',
    [BuildingType.DeuteriumTank]: 'deuteriumTank',
    [BuildingType.DarkMatterCollector]: 'darkMatterCollector',
    [BuildingType.DarkMatterTank]: 'darkMatterTank',
    [BuildingType.MissileSilo]: 'missileSilo',
    [BuildingType.Terraformer]: 'terraformer',
    [BuildingType.LunarBase]: 'lunarBase',
    [BuildingType.SensorPhalanx]: 'sensorPhalanx',
    [BuildingType.JumpGate]: 'jumpGate',
    [BuildingType.PlanetDestroyerFactory]: 'planetDestroyerFactory',
    [BuildingType.GeoResearchStation]: 'geoResearchStation',
    [BuildingType.DeepDrillingFacility]: 'deepDrillingFacility'
  }

  // 舰船类型枚举值到翻译键的映射
  const shipKeyMap: Record<ShipType, string> = {
    [ShipType.LightFighter]: 'lightFighter',
    [ShipType.HeavyFighter]: 'heavyFighter',
    [ShipType.Cruiser]: 'cruiser',
    [ShipType.Battleship]: 'battleship',
    [ShipType.Battlecruiser]: 'battlecruiser',
    [ShipType.Bomber]: 'bomber',
    [ShipType.Destroyer]: 'destroyer',
    [ShipType.SmallCargo]: 'smallCargo',
    [ShipType.LargeCargo]: 'largeCargo',
    [ShipType.ColonyShip]: 'colonyShip',
    [ShipType.Recycler]: 'recycler',
    [ShipType.EspionageProbe]: 'espionageProbe',
    [ShipType.SolarSatellite]: 'solarSatellite',
    [ShipType.DarkMatterHarvester]: 'darkMatterHarvester',
    [ShipType.Deathstar]: 'deathstar'
  }

  // 防御设施类型枚举值到翻译键的映射
  const defenseKeyMap: Record<DefenseType, string> = {
    [DefenseType.RocketLauncher]: 'rocketLauncher',
    [DefenseType.LightLaser]: 'lightLaser',
    [DefenseType.HeavyLaser]: 'heavyLaser',
    [DefenseType.GaussCannon]: 'gaussCannon',
    [DefenseType.IonCannon]: 'ionCannon',
    [DefenseType.PlasmaTurret]: 'plasmaTurret',
    [DefenseType.SmallShieldDome]: 'smallShieldDome',
    [DefenseType.LargeShieldDome]: 'largeShieldDome',
    [DefenseType.AntiBallisticMissile]: 'antiBallisticMissile',
    [DefenseType.InterplanetaryMissile]: 'interplanetaryMissile',
    [DefenseType.PlanetaryShield]: 'planetaryShield'
  }

  // 科技类型枚举值到翻译键的映射
  const technologyKeyMap: Record<TechnologyType, string> = {
    [TechnologyType.EnergyTechnology]: 'energyTechnology',
    [TechnologyType.LaserTechnology]: 'laserTechnology',
    [TechnologyType.IonTechnology]: 'ionTechnology',
    [TechnologyType.HyperspaceTechnology]: 'hyperspaceTechnology',
    [TechnologyType.PlasmaTechnology]: 'plasmaTechnology',
    [TechnologyType.ComputerTechnology]: 'computerTechnology',
    [TechnologyType.EspionageTechnology]: 'espionageTechnology',
    [TechnologyType.WeaponsTechnology]: 'weaponsTechnology',
    [TechnologyType.ShieldingTechnology]: 'shieldingTechnology',
    [TechnologyType.ArmourTechnology]: 'armourTechnology',
    [TechnologyType.Astrophysics]: 'astrophysics',
    [TechnologyType.GravitonTechnology]: 'gravitonTechnology',
    [TechnologyType.CombustionDrive]: 'combustionDrive',
    [TechnologyType.ImpulseDrive]: 'impulseDrive',
    [TechnologyType.HyperspaceDrive]: 'hyperspaceDrive',
    [TechnologyType.DarkMatterTechnology]: 'darkMatterTechnology',
    [TechnologyType.TerraformingTechnology]: 'terraformingTechnology',
    [TechnologyType.PlanetDestructionTech]: 'planetDestructionTech',
    [TechnologyType.MiningTechnology]: 'miningTechnology'
  }

  // 军官类型枚举值到翻译键的映射
  const officerKeyMap: Record<OfficerType, string> = {
    [OfficerType.Commander]: 'commander',
    [OfficerType.Admiral]: 'admiral',
    [OfficerType.Engineer]: 'engineer',
    [OfficerType.Geologist]: 'geologist',
    [OfficerType.Technocrat]: 'technocrat',
    [OfficerType.DarkMatterSpecialist]: 'darkMatterSpecialist'
  }

  // 翻译后的建筑配置
  const BUILDINGS = computed(() => {
    const translated: Record<BuildingType, BuildingConfig> = {} as Record<BuildingType, BuildingConfig>
    for (const [key, config] of Object.entries(ORIGINAL_BUILDINGS)) {
      const buildingType = key as BuildingType
      const translationKey = buildingKeyMap[buildingType]
      translated[buildingType] = {
        ...config,
        name: t(`buildings.${translationKey}`),
        description: t(`buildingDescriptions.${translationKey}`)
      }
    }
    return translated
  })

  // 翻译后的舰船配置
  const SHIPS = computed(() => {
    const translated: Record<ShipType, ShipConfig> = {} as Record<ShipType, ShipConfig>
    for (const [key, config] of Object.entries(ORIGINAL_SHIPS)) {
      const shipType = key as ShipType
      const translationKey = shipKeyMap[shipType]
      translated[shipType] = {
        ...config,
        name: t(`ships.${translationKey}`),
        description: t(`shipDescriptions.${translationKey}`)
      }
    }
    return translated
  })

  // 翻译后的防御设施配置
  const DEFENSES = computed(() => {
    const translated: Record<DefenseType, DefenseConfig> = {} as Record<DefenseType, DefenseConfig>
    for (const [key, config] of Object.entries(ORIGINAL_DEFENSES)) {
      const defenseType = key as DefenseType
      const translationKey = defenseKeyMap[defenseType]
      translated[defenseType] = {
        ...config,
        name: t(`defenses.${translationKey}`),
        description: t(`defenseDescriptions.${translationKey}`)
      }
    }
    return translated
  })

  // 翻译后的科技配置
  const TECHNOLOGIES = computed(() => {
    const translated: Record<TechnologyType, TechnologyConfig> = {} as Record<TechnologyType, TechnologyConfig>
    for (const [key, config] of Object.entries(ORIGINAL_TECHNOLOGIES)) {
      const technologyType = key as TechnologyType
      const translationKey = technologyKeyMap[technologyType]
      translated[technologyType] = {
        ...config,
        name: t(`technologies.${translationKey}`),
        description: t(`technologyDescriptions.${translationKey}`)
      }
    }
    return translated
  })

  // 翻译后的军官配置
  const OFFICERS = computed(() => {
    const translated: Record<OfficerType, OfficerConfig> = {} as Record<OfficerType, OfficerConfig>
    for (const [key, config] of Object.entries(ORIGINAL_OFFICERS)) {
      const officerType = key as OfficerType
      const translationKey = officerKeyMap[officerType]
      translated[officerType] = {
        ...config,
        name: t(`officers.${translationKey}`),
        description: t(`officerDescriptions.${translationKey}`)
      }
    }
    return translated
  })

  return {
    BUILDINGS,
    SHIPS,
    DEFENSES,
    TECHNOLOGIES,
    OFFICERS
  }
}
