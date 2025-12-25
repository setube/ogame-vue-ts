import { BuildingType, TechnologyType, ShipType, DefenseType, OfficerType, ExpeditionZone } from '@/types/game'
import type { BuildingConfig, TechnologyConfig, ShipConfig, DefenseConfig, OfficerConfig, ExpeditionZoneConfig } from '@/types/game'

// 建筑配置数据
export const BUILDINGS: Record<BuildingType, BuildingConfig> = {
  [BuildingType.MetalMine]: {
    id: BuildingType.MetalMine,
    name: '金属矿',
    description: '开采金属资源',
    baseCost: { metal: 60, crystal: 15, deuterium: 0, darkMatter: 0, energy: 0 },
    baseTime: 15, // 减少建造时间：30→15秒
    costMultiplier: 1.5,
    spaceUsage: 1,
    planetOnly: true,
    requirements: { [BuildingType.SolarPlant]: 1 },
    levelRequirements: {
      10: { [BuildingType.RoboticsFactory]: 2 },
      20: { [BuildingType.RoboticsFactory]: 5, [BuildingType.ResearchLab]: 3 },
      30: { [BuildingType.NaniteFactory]: 1, [BuildingType.ResearchLab]: 8 }
    }
  },
  [BuildingType.CrystalMine]: {
    id: BuildingType.CrystalMine,
    name: '晶体矿',
    description: '开采晶体资源',
    baseCost: { metal: 48, crystal: 24, deuterium: 0, darkMatter: 0, energy: 0 },
    baseTime: 15, // 减少建造时间：30→15秒
    costMultiplier: 1.6,
    spaceUsage: 1,
    planetOnly: true,
    requirements: { [BuildingType.SolarPlant]: 1 },
    levelRequirements: {
      10: { [BuildingType.RoboticsFactory]: 2 },
      20: { [BuildingType.RoboticsFactory]: 5, [BuildingType.ResearchLab]: 3 },
      30: { [BuildingType.NaniteFactory]: 1, [BuildingType.ResearchLab]: 8 }
    }
  },
  [BuildingType.DeuteriumSynthesizer]: {
    id: BuildingType.DeuteriumSynthesizer,
    name: '重氢合成器',
    description: '合成重氢资源',
    baseCost: { metal: 225, crystal: 75, deuterium: 0, darkMatter: 0, energy: 0 },
    baseTime: 20, // 减少建造时间：30→20秒
    costMultiplier: 1.5,
    spaceUsage: 2,
    planetOnly: true,
    requirements: { [BuildingType.SolarPlant]: 1 },
    levelRequirements: {
      10: { [BuildingType.RoboticsFactory]: 2 },
      20: { [BuildingType.RoboticsFactory]: 5, [BuildingType.ResearchLab]: 3 },
      30: { [BuildingType.NaniteFactory]: 1, [BuildingType.ResearchLab]: 8 }
    }
  },
  [BuildingType.SolarPlant]: {
    id: BuildingType.SolarPlant,
    name: '太阳能电站',
    description: '提供能源',
    baseCost: { metal: 75, crystal: 30, deuterium: 0, darkMatter: 0, energy: 0 },
    baseTime: 15, // 减少建造时间：30→15秒
    costMultiplier: 1.5,
    spaceUsage: 2,
    planetOnly: true, // OGame规则：月球不能建造太阳能电站
    levelRequirements: {
      15: { [BuildingType.RoboticsFactory]: 3 },
      25: { [BuildingType.RoboticsFactory]: 6, [BuildingType.ResearchLab]: 5 },
      35: { [BuildingType.NaniteFactory]: 1, [BuildingType.ResearchLab]: 10 }
    }
  },
  [BuildingType.FusionReactor]: {
    id: BuildingType.FusionReactor,
    name: '核聚变反应堆',
    description: '使用重氢产生大量能源',
    baseCost: { metal: 900, crystal: 360, deuterium: 180, darkMatter: 0, energy: 0 },
    baseTime: 30,
    costMultiplier: 1.8,
    spaceUsage: 4,
    planetOnly: true, // OGame规则：月球不能建造核聚变反应堆
    requirements: {
      [TechnologyType.EnergyTechnology]: 3,
      [BuildingType.DeuteriumSynthesizer]: 5
    },
    levelRequirements: {
      10: { [BuildingType.RoboticsFactory]: 5, [TechnologyType.EnergyTechnology]: 6 },
      20: { [BuildingType.RoboticsFactory]: 8, [TechnologyType.EnergyTechnology]: 10, [BuildingType.NaniteFactory]: 2 }
    }
  },
  [BuildingType.RoboticsFactory]: {
    id: BuildingType.RoboticsFactory,
    name: '机器人工厂',
    description: '加快建造速度',
    baseCost: { metal: 400, crystal: 120, deuterium: 200, darkMatter: 0, energy: 0 },
    baseTime: 40, // 减少建造时间：60→40秒
    costMultiplier: 2,
    spaceUsage: 4,
    requirements: {
      [BuildingType.MetalMine]: 2,
      [BuildingType.CrystalMine]: 2,
      [BuildingType.DeuteriumSynthesizer]: 2
    },
    levelRequirements: {
      5: { [BuildingType.ResearchLab]: 3, [BuildingType.SolarPlant]: 8 },
      8: { [BuildingType.ResearchLab]: 6, [BuildingType.SolarPlant]: 12, [BuildingType.MetalMine]: 12, [BuildingType.CrystalMine]: 12 }
    }
  },
  [BuildingType.NaniteFactory]: {
    id: BuildingType.NaniteFactory,
    name: '纳米工厂',
    description: '增加建造队列数量，每级+1队列',
    baseCost: { metal: 1000000, crystal: 500000, deuterium: 100000, darkMatter: 0, energy: 0 },
    baseTime: 240, // 减少建造时间：300→240秒
    costMultiplier: 2,
    spaceUsage: 8,
    maxLevel: 10, // 最多10级（最多11个建造队列）
    planetOnly: true, // OGame规则：月球不能建造纳米工厂
    requirements: { [BuildingType.RoboticsFactory]: 10 },
    levelRequirements: {
      3: { [BuildingType.ResearchLab]: 10, [BuildingType.Shipyard]: 8, [TechnologyType.ComputerTechnology]: 8 },
      5: { [BuildingType.ResearchLab]: 12, [BuildingType.Shipyard]: 10, [TechnologyType.ComputerTechnology]: 10 }
    }
  },
  [BuildingType.Shipyard]: {
    id: BuildingType.Shipyard,
    name: '船坞',
    description: '建造舰船',
    baseCost: { metal: 400, crystal: 200, deuterium: 100, darkMatter: 0, energy: 0 },
    baseTime: 30, // 减少建造时间：60→30秒
    costMultiplier: 2,
    spaceUsage: 5,
    fleetStorageBonus: 1000, // 每级增加1000舰队仓储
    requirements: { [BuildingType.RoboticsFactory]: 2 },
    levelRequirements: {
      8: { [BuildingType.RoboticsFactory]: 5, [BuildingType.ResearchLab]: 5 },
      12: { [BuildingType.RoboticsFactory]: 8, [BuildingType.ResearchLab]: 8, [BuildingType.NaniteFactory]: 2 }
    }
  },
  [BuildingType.Hangar]: {
    id: BuildingType.Hangar,
    name: '机库',
    description: '专门用于扩展舰队存储容量，支持星球专业化发展',
    baseCost: { metal: 200, crystal: 100, deuterium: 50, darkMatter: 0, energy: 0 },
    baseTime: 20,
    costMultiplier: 1.8,
    spaceUsage: 3,
    fleetStorageBonus: 1500, // 每级增加1500舰队仓储，比船坞更高
    planetOnly: true, // OGame规则：月球不能建造机库
    requirements: { [BuildingType.RoboticsFactory]: 1 }, // 只需要1级机器人工厂
    levelRequirements: {
      10: { [BuildingType.RoboticsFactory]: 3 },
      20: { [BuildingType.RoboticsFactory]: 5 }
    }
  },
  [BuildingType.ResearchLab]: {
    id: BuildingType.ResearchLab,
    name: '研究实验室',
    description: '研究科技',
    baseCost: { metal: 200, crystal: 400, deuterium: 200, darkMatter: 0, energy: 0 },
    baseTime: 30, // 减少建造时间：60→30秒
    costMultiplier: 2,
    spaceUsage: 3,
    planetOnly: true, // OGame规则：月球不能建造研究实验室
    requirements: {
      [BuildingType.MetalMine]: 3,
      [BuildingType.CrystalMine]: 3,
      [BuildingType.DeuteriumSynthesizer]: 3
    },
    levelRequirements: {
      8: {
        [BuildingType.RoboticsFactory]: 5,
        [BuildingType.MetalMine]: 10,
        [BuildingType.CrystalMine]: 10,
        [BuildingType.DeuteriumSynthesizer]: 10
      },
      12: { [BuildingType.RoboticsFactory]: 8, [BuildingType.NaniteFactory]: 1, [TechnologyType.EnergyTechnology]: 5 }
    }
  },
  [BuildingType.MetalStorage]: {
    id: BuildingType.MetalStorage,
    name: '金属仓库',
    description: '增加金属存储上限',
    baseCost: { metal: 1000, crystal: 0, deuterium: 0, darkMatter: 0, energy: 0 },
    baseTime: 15, // 减少建造时间：30→15秒
    costMultiplier: 2,
    spaceUsage: 1,
    planetOnly: true, // OGame规则：月球不能建造仓储（月球没有矿场）
    requirements: { [BuildingType.MetalMine]: 1 }
  },
  [BuildingType.CrystalStorage]: {
    id: BuildingType.CrystalStorage,
    name: '晶体仓库',
    description: '增加晶体存储上限',
    baseCost: { metal: 1000, crystal: 500, deuterium: 0, darkMatter: 0, energy: 0 },
    baseTime: 15, // 减少建造时间：30→15秒
    costMultiplier: 2,
    spaceUsage: 1,
    planetOnly: true, // OGame规则：月球不能建造仓储（月球没有矿场）
    requirements: { [BuildingType.CrystalMine]: 1 }
  },
  [BuildingType.DeuteriumTank]: {
    id: BuildingType.DeuteriumTank,
    name: '重氢罐',
    description: '增加重氢存储上限',
    baseCost: { metal: 1000, crystal: 1000, deuterium: 0, darkMatter: 0, energy: 0 },
    baseTime: 15, // 减少建造时间：30→15秒
    costMultiplier: 2,
    spaceUsage: 1,
    planetOnly: true, // OGame规则：月球不能建造仓储（月球没有矿场）
    requirements: { [BuildingType.DeuteriumSynthesizer]: 1 }
  },
  [BuildingType.DarkMatterCollector]: {
    id: BuildingType.DarkMatterCollector,
    name: '暗物质收集器',
    description: '收集稀有的暗物质资源',
    baseCost: { metal: 50000, crystal: 100000, deuterium: 50000, darkMatter: 0, energy: 0 },
    baseTime: 90, // 减少建造时间：120→90秒
    costMultiplier: 2,
    spaceUsage: 6,
    planetOnly: true,
    requirements: {
      [BuildingType.ResearchLab]: 5,
      [TechnologyType.DarkMatterTechnology]: 1
    },
    levelRequirements: {
      5: { [BuildingType.ResearchLab]: 8, [TechnologyType.DarkMatterTechnology]: 3, [BuildingType.RoboticsFactory]: 8 },
      8: { [BuildingType.ResearchLab]: 10, [TechnologyType.DarkMatterTechnology]: 5, [BuildingType.NaniteFactory]: 2 }
    }
  },
  [BuildingType.DarkMatterTank]: {
    id: BuildingType.DarkMatterTank,
    name: '暗物质储罐',
    description: '增加暗物质存储上限',
    baseCost: { metal: 10000, crystal: 10000, deuterium: 5000, darkMatter: 0, energy: 0 },
    baseTime: 20,
    costMultiplier: 2,
    spaceUsage: 2,
    planetOnly: true,
    requirements: {
      [BuildingType.DarkMatterCollector]: 2,
      [TechnologyType.DarkMatterTechnology]: 1
    },
    levelRequirements: {
      8: { [BuildingType.DarkMatterCollector]: 8, [BuildingType.RoboticsFactory]: 3 },
      12: { [BuildingType.DarkMatterCollector]: 15, [BuildingType.RoboticsFactory]: 6, [TechnologyType.DarkMatterTechnology]: 3 }
    }
  },
  [BuildingType.MissileSilo]: {
    id: BuildingType.MissileSilo,
    name: '导弹发射井',
    description: '存储和发射导弹，每级可存储10枚导弹',
    baseCost: { metal: 20000, crystal: 20000, deuterium: 1000, darkMatter: 0, energy: 0 },
    baseTime: 45,
    costMultiplier: 2,
    spaceUsage: 5,
    maxLevel: 10,
    planetOnly: true, // OGame规则：月球不能建造导弹发射井
    requirements: {
      [BuildingType.Shipyard]: 1
    },
    levelRequirements: {
      5: { [BuildingType.Shipyard]: 5, [TechnologyType.ComputerTechnology]: 3 },
      8: { [BuildingType.Shipyard]: 8, [TechnologyType.ComputerTechnology]: 6, [BuildingType.NaniteFactory]: 2 }
    }
  },
  [BuildingType.Terraformer]: {
    id: BuildingType.Terraformer,
    name: '地形改造器',
    description: '改造行星地形，每级增加30个可用空间',
    baseCost: { metal: 0, crystal: 50000, deuterium: 100000, darkMatter: 0, energy: 0 },
    baseTime: 60,
    costMultiplier: 2,
    spaceUsage: 5,
    planetOnly: true,
    requirements: {
      [BuildingType.ResearchLab]: 10,
      [BuildingType.RoboticsFactory]: 8,
      [TechnologyType.TerraformingTechnology]: 1
    },
    levelRequirements: {
      5: { [BuildingType.ResearchLab]: 12, [TechnologyType.TerraformingTechnology]: 3, [BuildingType.NaniteFactory]: 1 },
      8: { [BuildingType.ResearchLab]: 14, [TechnologyType.TerraformingTechnology]: 5, [BuildingType.NaniteFactory]: 3 }
    }
  },
  // 月球专属建筑
  [BuildingType.LunarBase]: {
    id: BuildingType.LunarBase,
    name: '月球基地',
    description: '增加月球可用空间',
    baseCost: { metal: 20000, crystal: 40000, deuterium: 20000, darkMatter: 0, energy: 0 },
    baseTime: 45, // 减少建造时间：60→45秒
    costMultiplier: 2,
    spaceUsage: 0, // 月球基地本身不占用空间,反而增加空间
    moonOnly: true,
    levelRequirements: {
      5: { [BuildingType.RoboticsFactory]: 5 },
      8: { [BuildingType.RoboticsFactory]: 8, [BuildingType.NaniteFactory]: 1 }
    }
  },
  [BuildingType.SensorPhalanx]: {
    id: BuildingType.SensorPhalanx,
    name: '传感器阵列',
    description: '侦测周围星系的舰队活动',
    baseCost: { metal: 20000, crystal: 40000, deuterium: 20000, darkMatter: 0, energy: 0 },
    baseTime: 60, // 减少建造时间：90→60秒
    costMultiplier: 2,
    spaceUsage: 6,
    moonOnly: true,
    requirements: { [BuildingType.LunarBase]: 1 },
    levelRequirements: {
      5: { [BuildingType.LunarBase]: 5, [TechnologyType.ComputerTechnology]: 5 },
      8: { [BuildingType.LunarBase]: 8, [TechnologyType.ComputerTechnology]: 8, [BuildingType.NaniteFactory]: 2 }
    }
  },
  [BuildingType.JumpGate]: {
    id: BuildingType.JumpGate,
    name: '跳跃门',
    description: '瞬间传送舰队到其他月球',
    baseCost: { metal: 2000000, crystal: 4000000, deuterium: 2000000, darkMatter: 50000, energy: 0 },
    baseTime: 240, // 减少建造时间：300→240秒
    costMultiplier: 2,
    spaceUsage: 10,
    moonOnly: true,
    maxLevel: 5, // 最多5级
    requirements: {
      [BuildingType.LunarBase]: 1,
      [TechnologyType.HyperspaceTechnology]: 7
    },
    levelRequirements: {
      3: { [BuildingType.LunarBase]: 5, [TechnologyType.HyperspaceTechnology]: 10, [BuildingType.NaniteFactory]: 3 }
    }
  },
  // 特殊建筑
  [BuildingType.PlanetDestroyerFactory]: {
    id: BuildingType.PlanetDestroyerFactory,
    name: '行星毁灭者工厂',
    description: '建造能够摧毁行星的终极武器',
    baseCost: { metal: 5000000, crystal: 4000000, deuterium: 1000000, darkMatter: 100000, energy: 0 },
    baseTime: 300,
    costMultiplier: 2,
    spaceUsage: 15,
    planetOnly: true,
    maxLevel: 3, // 最多3级
    requirements: {
      [BuildingType.Shipyard]: 12,
      [BuildingType.RoboticsFactory]: 10,
      [BuildingType.NaniteFactory]: 5,
      [TechnologyType.PlanetDestructionTech]: 1
    },
    levelRequirements: {
      3: {
        [BuildingType.Shipyard]: 14,
        [BuildingType.NaniteFactory]: 8,
        [TechnologyType.PlanetDestructionTech]: 3,
        [TechnologyType.HyperspaceTechnology]: 10
      }
    }
  },
  // 资源管理建筑
  [BuildingType.GeoResearchStation]: {
    id: BuildingType.GeoResearchStation,
    name: '地质研究站',
    description: '研究地质结构，提高矿脉自然恢复速度。每级增加50%恢复速率',
    baseCost: { metal: 50000, crystal: 30000, deuterium: 20000, darkMatter: 0, energy: 0 },
    baseTime: 60,
    costMultiplier: 1.8,
    spaceUsage: 4,
    planetOnly: true, // 只能在行星上建造
    maxLevel: 10, // 最多10级（最高6倍恢复速度）
    requirements: {
      [BuildingType.ResearchLab]: 5,
      [BuildingType.MetalMine]: 10,
      [BuildingType.CrystalMine]: 10,
      [BuildingType.DeuteriumSynthesizer]: 8
    },
    levelRequirements: {
      5: {
        [BuildingType.ResearchLab]: 8,
        [BuildingType.RoboticsFactory]: 5,
        [TechnologyType.EnergyTechnology]: 5
      },
      8: {
        [BuildingType.ResearchLab]: 10,
        [BuildingType.RoboticsFactory]: 8,
        [TechnologyType.EnergyTechnology]: 8,
        [BuildingType.NaniteFactory]: 1
      }
    }
  },
  // 深层钻探设施 - 提升矿脉上限
  [BuildingType.DeepDrillingFacility]: {
    id: BuildingType.DeepDrillingFacility,
    name: '深层钻探设施',
    description: '深入地壳钻探，解锁更深层的矿脉储量。每级增加20%矿脉上限',
    baseCost: { metal: 100000, crystal: 80000, deuterium: 50000, darkMatter: 0, energy: 0 },
    baseTime: 120,
    costMultiplier: 2.0,
    spaceUsage: 6,
    planetOnly: true, // 只能在行星上建造
    maxLevel: 10, // 最多10级（最高3倍矿脉上限）
    requirements: {
      [BuildingType.ResearchLab]: 8,
      [BuildingType.MetalMine]: 15,
      [BuildingType.CrystalMine]: 15,
      [BuildingType.DeuteriumSynthesizer]: 12,
      [BuildingType.GeoResearchStation]: 3
    },
    levelRequirements: {
      5: {
        [BuildingType.ResearchLab]: 10,
        [BuildingType.RoboticsFactory]: 8,
        [BuildingType.NaniteFactory]: 2,
        [TechnologyType.EnergyTechnology]: 10
      },
      8: {
        [BuildingType.ResearchLab]: 12,
        [BuildingType.NaniteFactory]: 5,
        [TechnologyType.EnergyTechnology]: 12,
        [TechnologyType.PlasmaTechnology]: 5
      }
    }
  }
}

// 科技配置数据
export const TECHNOLOGIES: Record<TechnologyType, TechnologyConfig> = {
  [TechnologyType.EnergyTechnology]: {
    id: TechnologyType.EnergyTechnology,
    name: '能源技术',
    description: '加快研究速度',
    baseCost: { metal: 0, crystal: 800, deuterium: 400, darkMatter: 0, energy: 0 },
    baseTime: 30, // 减少研究时间：60→30秒
    costMultiplier: 2,
    requirements: { [BuildingType.ResearchLab]: 1 },
    levelRequirements: {
      5: { [BuildingType.ResearchLab]: 3, [BuildingType.SolarPlant]: 10 },
      8: { [BuildingType.ResearchLab]: 5, [BuildingType.SolarPlant]: 15, [BuildingType.RoboticsFactory]: 3 },
      12: { [BuildingType.ResearchLab]: 8, [BuildingType.RoboticsFactory]: 6, [BuildingType.NaniteFactory]: 1 }
    }
  },
  [TechnologyType.LaserTechnology]: {
    id: TechnologyType.LaserTechnology,
    name: '激光技术',
    description: '开发激光武器',
    baseCost: { metal: 200, crystal: 100, deuterium: 0, darkMatter: 0, energy: 0 },
    baseTime: 60,
    costMultiplier: 2,
    requirements: { [BuildingType.ResearchLab]: 1, [TechnologyType.EnergyTechnology]: 2 },
    levelRequirements: {
      6: { [BuildingType.ResearchLab]: 5, [TechnologyType.EnergyTechnology]: 5, [BuildingType.Shipyard]: 3 },
      10: { [BuildingType.ResearchLab]: 8, [TechnologyType.EnergyTechnology]: 8, [BuildingType.Shipyard]: 6 }
    }
  },
  [TechnologyType.IonTechnology]: {
    id: TechnologyType.IonTechnology,
    name: '离子技术',
    description: '开发离子武器',
    baseCost: { metal: 1000, crystal: 300, deuterium: 100, darkMatter: 0, energy: 0 },
    baseTime: 60,
    costMultiplier: 2,
    requirements: { [BuildingType.ResearchLab]: 4, [TechnologyType.LaserTechnology]: 5, [TechnologyType.EnergyTechnology]: 4 },
    levelRequirements: {
      5: { [BuildingType.ResearchLab]: 8, [TechnologyType.LaserTechnology]: 10, [TechnologyType.EnergyTechnology]: 8 },
      8: { [BuildingType.ResearchLab]: 10, [TechnologyType.LaserTechnology]: 12, [BuildingType.NaniteFactory]: 2 }
    }
  },
  [TechnologyType.HyperspaceTechnology]: {
    id: TechnologyType.HyperspaceTechnology,
    name: '超空间技术',
    description: '研究超空间跳跃',
    baseCost: { metal: 0, crystal: 4000, deuterium: 2000, darkMatter: 0, energy: 0 },
    baseTime: 60,
    costMultiplier: 2,
    requirements: { [BuildingType.ResearchLab]: 7, [TechnologyType.EnergyTechnology]: 5 },
    levelRequirements: {
      5: { [BuildingType.ResearchLab]: 10, [TechnologyType.EnergyTechnology]: 8, [BuildingType.Shipyard]: 5 },
      8: { [BuildingType.ResearchLab]: 12, [TechnologyType.EnergyTechnology]: 10, [BuildingType.NaniteFactory]: 2 }
    }
  },
  [TechnologyType.PlasmaTechnology]: {
    id: TechnologyType.PlasmaTechnology,
    name: '等离子技术',
    description: '开发等离子武器',
    baseCost: { metal: 2000, crystal: 4000, deuterium: 1000, darkMatter: 0, energy: 0 },
    baseTime: 60,
    costMultiplier: 2,
    requirements: {
      [BuildingType.ResearchLab]: 4,
      [TechnologyType.EnergyTechnology]: 8,
      [TechnologyType.LaserTechnology]: 10,
      [TechnologyType.IonTechnology]: 5
    },
    levelRequirements: {
      5: {
        [BuildingType.ResearchLab]: 10,
        [TechnologyType.EnergyTechnology]: 12,
        [TechnologyType.IonTechnology]: 8,
        [BuildingType.NaniteFactory]: 1
      },
      8: {
        [BuildingType.ResearchLab]: 12,
        [TechnologyType.EnergyTechnology]: 15,
        [TechnologyType.IonTechnology]: 10,
        [BuildingType.NaniteFactory]: 3
      }
    }
  },
  [TechnologyType.ComputerTechnology]: {
    id: TechnologyType.ComputerTechnology,
    name: '计算机技术',
    description: '增加研究队列和舰队任务槽位，每级+1队列+1槽位',
    baseCost: { metal: 0, crystal: 400, deuterium: 600, darkMatter: 0, energy: 0 },
    baseTime: 60,
    costMultiplier: 2,
    fleetStorageBonus: 500, // 每级全局增加500舰队仓储
    maxLevel: 10, // 最多10级（最多11个研究队列和11个舰队槽位）
    requirements: { [BuildingType.ResearchLab]: 1 },
    levelRequirements: {
      3: { [BuildingType.ResearchLab]: 5 },
      5: { [BuildingType.ResearchLab]: 8, [BuildingType.RoboticsFactory]: 5 },
      8: { [BuildingType.ResearchLab]: 10, [BuildingType.NaniteFactory]: 2 }
    }
  },
  [TechnologyType.EspionageTechnology]: {
    id: TechnologyType.EspionageTechnology,
    name: '间谍技术',
    description:
      '提高间谍探测效果，每级提高1级侦查深度。侦察等级=己方等级-对方等级+侦察船数/5。≥-1显示舰队，≥1显示防御，≥3显示建筑，≥5显示科技',
    baseCost: { metal: 200, crystal: 1000, deuterium: 200, darkMatter: 0, energy: 0 },
    baseTime: 60,
    costMultiplier: 2,
    requirements: { [BuildingType.ResearchLab]: 3 },
    levelRequirements: {
      5: { [BuildingType.ResearchLab]: 6, [TechnologyType.ComputerTechnology]: 3 },
      8: { [BuildingType.ResearchLab]: 8, [TechnologyType.ComputerTechnology]: 5 }
    }
  },
  [TechnologyType.WeaponsTechnology]: {
    id: TechnologyType.WeaponsTechnology,
    name: '武器技术',
    description: '提高舰船和防御的攻击力，每级+10%',
    baseCost: { metal: 800, crystal: 200, deuterium: 0, darkMatter: 0, energy: 0 },
    baseTime: 60,
    costMultiplier: 2,
    requirements: { [BuildingType.ResearchLab]: 4 },
    levelRequirements: {
      5: { [BuildingType.ResearchLab]: 7, [BuildingType.Shipyard]: 4 },
      10: { [BuildingType.ResearchLab]: 10, [BuildingType.Shipyard]: 8, [BuildingType.NaniteFactory]: 2 }
    }
  },
  [TechnologyType.ShieldingTechnology]: {
    id: TechnologyType.ShieldingTechnology,
    name: '护盾技术',
    description: '提高舰船和防御的护盾值，每级+10%',
    baseCost: { metal: 200, crystal: 600, deuterium: 0, darkMatter: 0, energy: 0 },
    baseTime: 60,
    costMultiplier: 2,
    requirements: { [BuildingType.ResearchLab]: 6, [TechnologyType.EnergyTechnology]: 3 },
    levelRequirements: {
      5: { [BuildingType.ResearchLab]: 8, [TechnologyType.EnergyTechnology]: 6 },
      10: { [BuildingType.ResearchLab]: 10, [TechnologyType.EnergyTechnology]: 10, [BuildingType.NaniteFactory]: 2 }
    }
  },
  [TechnologyType.ArmourTechnology]: {
    id: TechnologyType.ArmourTechnology,
    name: '装甲技术',
    description: '提高舰船和防御的装甲值，每级+10%',
    baseCost: { metal: 1000, crystal: 0, deuterium: 0, darkMatter: 0, energy: 0 },
    baseTime: 60,
    costMultiplier: 2,
    requirements: { [BuildingType.ResearchLab]: 2 },
    levelRequirements: {
      5: { [BuildingType.ResearchLab]: 6, [BuildingType.Shipyard]: 3 },
      10: { [BuildingType.ResearchLab]: 10, [BuildingType.Shipyard]: 7, [BuildingType.NaniteFactory]: 1 }
    }
  },
  [TechnologyType.Astrophysics]: {
    id: TechnologyType.Astrophysics,
    name: '天体物理学',
    description: '每级增加1个殖民地槽位，增加探险成功率',
    baseCost: { metal: 4000, crystal: 8000, deuterium: 4000, darkMatter: 0, energy: 0 },
    baseTime: 60,
    costMultiplier: 1.75,
    requirements: {
      [BuildingType.ResearchLab]: 3,
      [TechnologyType.EspionageTechnology]: 4,
      [TechnologyType.ImpulseDrive]: 3
    },
    levelRequirements: {
      5: { [BuildingType.ResearchLab]: 8, [TechnologyType.EspionageTechnology]: 8 },
      10: { [BuildingType.ResearchLab]: 12, [TechnologyType.HyperspaceTechnology]: 5, [BuildingType.NaniteFactory]: 3 }
    }
  },
  [TechnologyType.GravitonTechnology]: {
    id: TechnologyType.GravitonTechnology,
    name: '引力技术',
    description: '研究引力操纵，死星的必要技术',
    baseCost: { metal: 0, crystal: 0, deuterium: 0, darkMatter: 100000, energy: 0 },
    baseTime: 0,
    costMultiplier: 3,
    maxLevel: 1, // 只有1级
    requirements: {
      [BuildingType.ResearchLab]: 12
    }
  },
  [TechnologyType.CombustionDrive]: {
    id: TechnologyType.CombustionDrive,
    name: '燃烧引擎',
    description: '基础推进系统',
    baseCost: { metal: 400, crystal: 0, deuterium: 600, darkMatter: 0, energy: 0 },
    baseTime: 60,
    costMultiplier: 2,
    requirements: { [BuildingType.ResearchLab]: 1, [TechnologyType.EnergyTechnology]: 1 },
    levelRequirements: {
      5: { [BuildingType.ResearchLab]: 5, [TechnologyType.EnergyTechnology]: 3, [BuildingType.Shipyard]: 2 },
      8: { [BuildingType.ResearchLab]: 8, [TechnologyType.EnergyTechnology]: 5, [BuildingType.Shipyard]: 5 }
    }
  },
  [TechnologyType.ImpulseDrive]: {
    id: TechnologyType.ImpulseDrive,
    name: '脉冲引擎',
    description: '高级推进系统',
    baseCost: { metal: 2000, crystal: 4000, deuterium: 600, darkMatter: 0, energy: 0 },
    baseTime: 60,
    costMultiplier: 2,
    requirements: { [BuildingType.ResearchLab]: 2, [TechnologyType.EnergyTechnology]: 1 },
    levelRequirements: {
      5: { [BuildingType.ResearchLab]: 6, [TechnologyType.EnergyTechnology]: 4, [BuildingType.Shipyard]: 3 },
      8: { [BuildingType.ResearchLab]: 8, [TechnologyType.EnergyTechnology]: 6, [BuildingType.Shipyard]: 6 }
    }
  },
  [TechnologyType.HyperspaceDrive]: {
    id: TechnologyType.HyperspaceDrive,
    name: '超空间引擎',
    description: '超空间推进系统',
    baseCost: { metal: 10000, crystal: 20000, deuterium: 6000, darkMatter: 0, energy: 0 },
    baseTime: 60,
    costMultiplier: 2,
    requirements: { [BuildingType.ResearchLab]: 7, [TechnologyType.HyperspaceTechnology]: 3 },
    levelRequirements: {
      5: { [BuildingType.ResearchLab]: 10, [TechnologyType.HyperspaceTechnology]: 6, [BuildingType.Shipyard]: 8 },
      8: { [BuildingType.ResearchLab]: 12, [TechnologyType.HyperspaceTechnology]: 8, [BuildingType.NaniteFactory]: 3 }
    }
  },
  [TechnologyType.DarkMatterTechnology]: {
    id: TechnologyType.DarkMatterTechnology,
    name: '暗物质技术',
    description: '研究暗物质的性质和应用',
    baseCost: { metal: 100000, crystal: 200000, deuterium: 100000, darkMatter: 0, energy: 0 },
    baseTime: 180,
    costMultiplier: 2,
    requirements: { [BuildingType.ResearchLab]: 10, [TechnologyType.HyperspaceTechnology]: 5 },
    levelRequirements: {
      3: {
        [BuildingType.ResearchLab]: 10,
        [TechnologyType.HyperspaceTechnology]: 8,
        [BuildingType.RoboticsFactory]: 10,
        [TechnologyType.EnergyTechnology]: 10
      },
      5: {
        [BuildingType.ResearchLab]: 12,
        [TechnologyType.HyperspaceTechnology]: 10,
        [BuildingType.NaniteFactory]: 2,
        [TechnologyType.EnergyTechnology]: 12
      }
    }
  },
  [TechnologyType.TerraformingTechnology]: {
    id: TechnologyType.TerraformingTechnology,
    name: '地形改造技术',
    description: '研究行星地形改造技术，每级为所有行星增加30个可用空间',
    baseCost: { metal: 0, crystal: 20000, deuterium: 40000, darkMatter: 0, energy: 0 },
    baseTime: 90,
    costMultiplier: 2,
    requirements: { [BuildingType.ResearchLab]: 8, [TechnologyType.EnergyTechnology]: 6 },
    levelRequirements: {
      5: { [BuildingType.ResearchLab]: 12, [TechnologyType.EnergyTechnology]: 10, [BuildingType.RoboticsFactory]: 10 },
      8: { [BuildingType.ResearchLab]: 14, [TechnologyType.EnergyTechnology]: 12, [BuildingType.NaniteFactory]: 3 }
    }
  },
  [TechnologyType.PlanetDestructionTech]: {
    id: TechnologyType.PlanetDestructionTech,
    name: '行星毁灭技术',
    description: '研究如何摧毁整个行星的恐怖技术',
    baseCost: { metal: 4000000, crystal: 8000000, deuterium: 4000000, darkMatter: 200000, energy: 0 },
    baseTime: 300,
    costMultiplier: 2,
    maxLevel: 10,
    requirements: {
      [BuildingType.ResearchLab]: 12,
      [TechnologyType.HyperspaceTechnology]: 8,
      [TechnologyType.HyperspaceDrive]: 6,
      [TechnologyType.PlasmaTechnology]: 7
    },
    levelRequirements: {
      3: {
        [BuildingType.ResearchLab]: 14,
        [TechnologyType.HyperspaceTechnology]: 12,
        [TechnologyType.HyperspaceDrive]: 10,
        [TechnologyType.PlasmaTechnology]: 10,
        [BuildingType.NaniteFactory]: 5
      }
    }
  },
  [TechnologyType.MiningTechnology]: {
    id: TechnologyType.MiningTechnology,
    name: '采矿技术',
    description: '改进采矿方法和设备，提升所有星球矿脉储量上限。每级增加15%矿脉上限',
    baseCost: { metal: 50000, crystal: 30000, deuterium: 20000, darkMatter: 0, energy: 0 },
    baseTime: 90,
    costMultiplier: 1.8,
    maxLevel: 15, // 最多15级（最高约2.25倍上限加成）
    requirements: {
      [BuildingType.ResearchLab]: 5,
      [TechnologyType.EnergyTechnology]: 4,
      [BuildingType.MetalMine]: 12,
      [BuildingType.CrystalMine]: 12
    },
    levelRequirements: {
      5: {
        [BuildingType.ResearchLab]: 8,
        [TechnologyType.EnergyTechnology]: 8,
        [BuildingType.RoboticsFactory]: 5
      },
      10: {
        [BuildingType.ResearchLab]: 12,
        [TechnologyType.EnergyTechnology]: 12,
        [BuildingType.NaniteFactory]: 3,
        [TechnologyType.PlasmaTechnology]: 3
      }
    }
  }
}

// 舰船配置数据
export const SHIPS: Record<ShipType, ShipConfig> = {
  [ShipType.LightFighter]: {
    id: ShipType.LightFighter,
    name: '轻型战斗机',
    description: '基础战斗单位',
    cost: { metal: 3000, crystal: 1000, deuterium: 0, darkMatter: 0, energy: 0 },
    buildTime: 20,
    cargoCapacity: 50,
    attack: 50,
    shield: 10,
    armor: 400,
    speed: 12500,
    fuelConsumption: 20,
    storageUsage: 5,
    requirements: { [BuildingType.Shipyard]: 1, [TechnologyType.CombustionDrive]: 1 },
    rapidFire: {
      [ShipType.EspionageProbe]: 5,
      [ShipType.SolarSatellite]: 5
    }
  },
  [ShipType.HeavyFighter]: {
    id: ShipType.HeavyFighter,
    name: '重型战斗机',
    description: '强力战斗单位',
    cost: { metal: 6000, crystal: 4000, deuterium: 0, darkMatter: 0, energy: 0 },
    buildTime: 30,
    cargoCapacity: 100,
    attack: 150,
    shield: 25,
    armor: 1000,
    speed: 10000,
    fuelConsumption: 75,
    storageUsage: 10,
    requirements: { [BuildingType.Shipyard]: 3, [TechnologyType.ImpulseDrive]: 2 },
    rapidFire: {
      [ShipType.SmallCargo]: 3,
      [ShipType.EspionageProbe]: 5,
      [ShipType.SolarSatellite]: 5
    }
  },
  [ShipType.Cruiser]: {
    id: ShipType.Cruiser,
    name: '巡洋舰',
    description: '中型战舰，克制轻型战斗机',
    cost: { metal: 20000, crystal: 7000, deuterium: 2000, darkMatter: 0, energy: 0 },
    buildTime: 60,
    cargoCapacity: 800,
    attack: 400,
    shield: 50,
    armor: 2700,
    speed: 15000,
    fuelConsumption: 300,
    storageUsage: 15,
    requirements: { [BuildingType.Shipyard]: 5, [TechnologyType.ImpulseDrive]: 4, [TechnologyType.IonTechnology]: 2 },
    rapidFire: {
      [ShipType.LightFighter]: 6,
      [ShipType.EspionageProbe]: 5,
      [ShipType.SolarSatellite]: 5,
      [DefenseType.RocketLauncher]: 10
    }
  },
  [ShipType.Battleship]: {
    id: ShipType.Battleship,
    name: '战列舰',
    description: '重型战舰，主力作战单位',
    cost: { metal: 45000, crystal: 15000, deuterium: 0, darkMatter: 0, energy: 0 },
    buildTime: 90,
    cargoCapacity: 1500,
    attack: 1200,
    shield: 300,
    armor: 10000,
    speed: 10000,
    fuelConsumption: 500,
    storageUsage: 25,
    requirements: { [BuildingType.Shipyard]: 7, [TechnologyType.HyperspaceDrive]: 4 },
    rapidFire: {
      [ShipType.EspionageProbe]: 5,
      [ShipType.SolarSatellite]: 5
    }
  },
  [ShipType.Battlecruiser]: {
    id: ShipType.Battlecruiser,
    name: '战列巡洋舰',
    description: '快速强大的战斗舰船，克制战列舰和巡洋舰',
    cost: { metal: 30000, crystal: 40000, deuterium: 15000, darkMatter: 0, energy: 0 },
    buildTime: 70,
    cargoCapacity: 750,
    attack: 700,
    shield: 400,
    armor: 7000,
    speed: 10000,
    fuelConsumption: 250,
    storageUsage: 20,
    requirements: {
      [BuildingType.Shipyard]: 8,
      [TechnologyType.HyperspaceDrive]: 5,
      [TechnologyType.HyperspaceTechnology]: 5,
      [TechnologyType.LaserTechnology]: 12
    },
    rapidFire: {
      [ShipType.SmallCargo]: 3,
      [ShipType.LargeCargo]: 3,
      [ShipType.HeavyFighter]: 4,
      [ShipType.Cruiser]: 4,
      [ShipType.Battleship]: 7,
      [ShipType.EspionageProbe]: 5,
      [ShipType.SolarSatellite]: 5
    }
  },
  [ShipType.Bomber]: {
    id: ShipType.Bomber,
    name: '轰炸机',
    description: '专门对付防御设施的轰炸舰，高效摧毁炮台',
    cost: { metal: 50000, crystal: 25000, deuterium: 15000, darkMatter: 0, energy: 0 },
    buildTime: 100,
    cargoCapacity: 500,
    attack: 1000,
    shield: 500,
    armor: 7500,
    speed: 4000,
    fuelConsumption: 700,
    storageUsage: 35,
    requirements: {
      [BuildingType.Shipyard]: 8,
      [TechnologyType.ImpulseDrive]: 6,
      [TechnologyType.PlasmaTechnology]: 5
    },
    rapidFire: {
      [ShipType.EspionageProbe]: 5,
      [ShipType.SolarSatellite]: 5,
      [DefenseType.RocketLauncher]: 20,
      [DefenseType.LightLaser]: 20,
      [DefenseType.HeavyLaser]: 10,
      [DefenseType.IonCannon]: 10,
      [DefenseType.GaussCannon]: 5,
      [DefenseType.PlasmaTurret]: 5
    }
  },
  [ShipType.Destroyer]: {
    id: ShipType.Destroyer,
    name: '驱逐舰',
    description: '轻型快速战舰，擅长护航和反侦察，克制轻型单位和探测器',
    cost: { metal: 15000, crystal: 5000, deuterium: 1500, darkMatter: 0, energy: 0 },
    buildTime: 45,
    cargoCapacity: 500,
    attack: 250,
    shield: 40,
    armor: 2000,
    speed: 18000,
    fuelConsumption: 200,
    storageUsage: 12,
    requirements: {
      [BuildingType.Shipyard]: 4,
      [TechnologyType.ImpulseDrive]: 3,
      [TechnologyType.ComputerTechnology]: 3
    },
    rapidFire: {
      [ShipType.LightFighter]: 4,
      [ShipType.EspionageProbe]: 10,
      [ShipType.SolarSatellite]: 10,
      [ShipType.SmallCargo]: 2,
      [DefenseType.RocketLauncher]: 5
    }
  },
  [ShipType.SmallCargo]: {
    id: ShipType.SmallCargo,
    name: '小型运输船',
    description: '运输资源',
    cost: { metal: 2000, crystal: 2000, deuterium: 0, darkMatter: 0, energy: 0 },
    buildTime: 15,
    cargoCapacity: 5000,
    attack: 5,
    shield: 10,
    armor: 400,
    speed: 5000,
    fuelConsumption: 10,
    storageUsage: 10,
    requirements: { [BuildingType.Shipyard]: 2, [TechnologyType.CombustionDrive]: 2 }
  },
  [ShipType.LargeCargo]: {
    id: ShipType.LargeCargo,
    name: '大型运输船',
    description: '大量运输资源',
    cost: { metal: 6000, crystal: 6000, deuterium: 0, darkMatter: 0, energy: 0 },
    buildTime: 30,
    cargoCapacity: 25000,
    attack: 5,
    shield: 25,
    armor: 1200,
    speed: 7500,
    fuelConsumption: 50,
    storageUsage: 20,
    requirements: { [BuildingType.Shipyard]: 4, [TechnologyType.CombustionDrive]: 6 }
  },
  [ShipType.ColonyShip]: {
    id: ShipType.ColonyShip,
    name: '殖民船',
    description: '建立新殖民地',
    cost: { metal: 10000, crystal: 20000, deuterium: 10000, darkMatter: 0, energy: 0 },
    buildTime: 120,
    cargoCapacity: 7500,
    attack: 50,
    shield: 100,
    armor: 3000,
    speed: 2500,
    fuelConsumption: 1000,
    storageUsage: 40,
    requirements: { [BuildingType.Shipyard]: 4, [TechnologyType.ImpulseDrive]: 3 }
  },
  [ShipType.Recycler]: {
    id: ShipType.Recycler,
    name: '回收船',
    description: '回收废墟资源',
    cost: { metal: 10000, crystal: 6000, deuterium: 2000, darkMatter: 0, energy: 0 },
    buildTime: 60,
    cargoCapacity: 20000,
    attack: 1,
    shield: 10,
    armor: 1600,
    speed: 2000,
    fuelConsumption: 300,
    storageUsage: 30,
    requirements: { [BuildingType.Shipyard]: 4, [TechnologyType.CombustionDrive]: 6 }
  },
  [ShipType.EspionageProbe]: {
    id: ShipType.EspionageProbe,
    name: '间谍探测器',
    description: '侦察敌方星球',
    cost: { metal: 0, crystal: 1000, deuterium: 0, darkMatter: 0, energy: 0 },
    buildTime: 5,
    cargoCapacity: 5,
    attack: 0,
    shield: 0,
    armor: 100,
    speed: 100000000,
    fuelConsumption: 1,
    storageUsage: 2,
    requirements: { [BuildingType.Shipyard]: 3, [TechnologyType.CombustionDrive]: 3 }
  },
  [ShipType.SolarSatellite]: {
    id: ShipType.SolarSatellite,
    name: '太阳能卫星',
    description: '提供额外能源，产能受星球温度影响',
    cost: { metal: 0, crystal: 2000, deuterium: 500, darkMatter: 0, energy: 0 },
    buildTime: 10,
    cargoCapacity: 0,
    attack: 1,
    shield: 1,
    armor: 200,
    speed: 1, // 极低速度，可被舰队携带但非常慢
    fuelConsumption: 0,
    storageUsage: 1,
    requirements: { [BuildingType.Shipyard]: 1 }
  },
  [ShipType.DarkMatterHarvester]: {
    id: ShipType.DarkMatterHarvester,
    name: '暗物质采集船',
    description: '专门用于采集暗物质的特殊飞船',
    cost: { metal: 100000, crystal: 150000, deuterium: 50000, darkMatter: 0, energy: 0 },
    buildTime: 120,
    cargoCapacity: 1000, // 暗物质专用储存
    attack: 10,
    shield: 50,
    armor: 2000,
    speed: 5000,
    fuelConsumption: 500,
    storageUsage: 50,
    requirements: {
      [BuildingType.Shipyard]: 8,
      [TechnologyType.HyperspaceDrive]: 5,
      [TechnologyType.DarkMatterTechnology]: 1
    }
  },
  [ShipType.Deathstar]: {
    id: ShipType.Deathstar,
    name: '死星',
    description: '终极武器，能够摧毁整个行星',
    cost: { metal: 5000000, crystal: 4000000, deuterium: 1000000, darkMatter: 20000, energy: 0 },
    buildTime: 600,
    cargoCapacity: 1000000,
    attack: 200000,
    shield: 50000,
    armor: 900000,
    speed: 100,
    fuelConsumption: 1,
    storageUsage: 100,
    requirements: {
      [BuildingType.PlanetDestroyerFactory]: 3,
      [TechnologyType.PlanetDestructionTech]: 7,
      [TechnologyType.HyperspaceDrive]: 7
    },
    rapidFire: {
      // 对所有舰船的快速射击
      [ShipType.SmallCargo]: 250,
      [ShipType.LargeCargo]: 250,
      [ShipType.LightFighter]: 200,
      [ShipType.HeavyFighter]: 100,
      [ShipType.Cruiser]: 33,
      [ShipType.Battleship]: 30,
      [ShipType.Battlecruiser]: 15,
      [ShipType.Bomber]: 25,
      [ShipType.Destroyer]: 5,
      [ShipType.ColonyShip]: 250,
      [ShipType.Recycler]: 250,
      [ShipType.EspionageProbe]: 1250,
      [ShipType.SolarSatellite]: 1250,
      [ShipType.DarkMatterHarvester]: 50,
      // 对所有防御设施的快速射击
      [DefenseType.RocketLauncher]: 200,
      [DefenseType.LightLaser]: 200,
      [DefenseType.HeavyLaser]: 100,
      [DefenseType.GaussCannon]: 50,
      [DefenseType.IonCannon]: 100,
      [DefenseType.PlasmaTurret]: 10,
      [DefenseType.SmallShieldDome]: 1250,
      [DefenseType.LargeShieldDome]: 1250
    }
  }
}

// 防御设施配置数据
export const DEFENSES: Record<DefenseType, DefenseConfig> = {
  [DefenseType.RocketLauncher]: {
    id: DefenseType.RocketLauncher,
    name: '火箭发射器',
    description: '基础防御设施',
    cost: { metal: 2000, crystal: 0, deuterium: 0, darkMatter: 0, energy: 0 },
    buildTime: 10,
    attack: 80,
    shield: 20,
    armor: 200,
    requirements: { [BuildingType.Shipyard]: 1 }
  },
  [DefenseType.LightLaser]: {
    id: DefenseType.LightLaser,
    name: '轻型激光炮',
    description: '激光防御武器',
    cost: { metal: 1500, crystal: 500, deuterium: 0, darkMatter: 0, energy: 0 },
    buildTime: 12,
    attack: 100,
    shield: 25,
    armor: 200,
    requirements: { [BuildingType.Shipyard]: 2, [TechnologyType.LaserTechnology]: 3 }
  },
  [DefenseType.HeavyLaser]: {
    id: DefenseType.HeavyLaser,
    name: '重型激光炮',
    description: '强力激光武器',
    cost: { metal: 6000, crystal: 2000, deuterium: 0, darkMatter: 0, energy: 0 },
    buildTime: 20,
    attack: 250,
    shield: 100,
    armor: 800,
    requirements: { [BuildingType.Shipyard]: 4, [TechnologyType.LaserTechnology]: 6 }
  },
  [DefenseType.GaussCannon]: {
    id: DefenseType.GaussCannon,
    name: '高斯炮',
    description: '电磁加速武器',
    cost: { metal: 20000, crystal: 15000, deuterium: 2000, darkMatter: 0, energy: 0 },
    buildTime: 35,
    attack: 1100,
    shield: 200,
    armor: 3500,
    requirements: { [BuildingType.Shipyard]: 6, [TechnologyType.EnergyTechnology]: 6 }
  },
  [DefenseType.IonCannon]: {
    id: DefenseType.IonCannon,
    name: '离子炮',
    description: '离子武器系统',
    cost: { metal: 2000, crystal: 6000, deuterium: 0, darkMatter: 0, energy: 0 },
    buildTime: 30,
    attack: 150,
    shield: 500,
    armor: 800,
    requirements: { [BuildingType.Shipyard]: 4, [TechnologyType.IonTechnology]: 4 }
  },
  [DefenseType.PlasmaTurret]: {
    id: DefenseType.PlasmaTurret,
    name: '等离子炮台',
    description: '最强防御武器',
    cost: { metal: 50000, crystal: 50000, deuterium: 30000, darkMatter: 0, energy: 0 },
    buildTime: 60,
    attack: 3000,
    shield: 300,
    armor: 10000,
    requirements: { [BuildingType.Shipyard]: 8, [TechnologyType.PlasmaTechnology]: 7 }
  },
  [DefenseType.SmallShieldDome]: {
    id: DefenseType.SmallShieldDome,
    name: '小型护盾罩',
    description: '保护星球的能量护盾',
    cost: { metal: 10000, crystal: 10000, deuterium: 0, darkMatter: 0, energy: 0 },
    buildTime: 30,
    attack: 1,
    shield: 2000,
    armor: 2000,
    requirements: { [BuildingType.Shipyard]: 6, [TechnologyType.EnergyTechnology]: 3 }
  },
  [DefenseType.LargeShieldDome]: {
    id: DefenseType.LargeShieldDome,
    name: '大型护盾罩',
    description: '强大的星球护盾',
    cost: { metal: 50000, crystal: 50000, deuterium: 0, darkMatter: 0, energy: 0 },
    buildTime: 60,
    attack: 1,
    shield: 10000,
    armor: 10000,
    requirements: { [BuildingType.Shipyard]: 6, [TechnologyType.EnergyTechnology]: 6 }
  },
  [DefenseType.PlanetaryShield]: {
    id: DefenseType.PlanetaryShield,
    name: '行星护盾',
    description: '保护行星免受毁灭攻击的超级护盾',
    cost: { metal: 2000000, crystal: 2000000, deuterium: 1000000, darkMatter: 50000, energy: 0 },
    buildTime: 180,
    attack: 1,
    shield: 100000,
    armor: 100000,
    requirements: {
      [BuildingType.Shipyard]: 10,
      [TechnologyType.EnergyTechnology]: 10,
      [TechnologyType.HyperspaceTechnology]: 8
    }
  },
  [DefenseType.AntiBallisticMissile]: {
    id: DefenseType.AntiBallisticMissile,
    name: '反弹道导弹',
    description: '拦截敌方导弹，每个可拦截1枚星际导弹',
    cost: { metal: 8000, crystal: 0, deuterium: 2000, darkMatter: 0, energy: 0 },
    buildTime: 20,
    attack: 1,
    shield: 1,
    armor: 800,
    requirements: {
      [BuildingType.MissileSilo]: 2
    }
  },
  [DefenseType.InterplanetaryMissile]: {
    id: DefenseType.InterplanetaryMissile,
    name: '星际导弹',
    description: '可以攻击其他星球的防御设施，射程取决于脉冲引擎等级',
    cost: { metal: 12500, crystal: 2500, deuterium: 10000, darkMatter: 0, energy: 0 },
    buildTime: 30,
    attack: 12000,
    shield: 1,
    armor: 1500,
    requirements: {
      [BuildingType.MissileSilo]: 4,
      [TechnologyType.ImpulseDrive]: 1
    }
  }
}

// 军官配置数据
export const OFFICERS: Record<OfficerType, OfficerConfig> = {
  [OfficerType.Commander]: {
    id: OfficerType.Commander,
    name: '指挥官',
    description: '提升建筑速度和管理能力',
    cost: { metal: 0, crystal: 50000, deuterium: 25000, darkMatter: 7000, energy: 0 },
    weeklyMaintenance: { metal: 0, crystal: 5000, deuterium: 2500, darkMatter: 900, energy: 0 },
    benefits: {
      buildingSpeedBonus: 10, // 建筑速度 +10%
      additionalBuildQueue: 1, // 额外1个建筑队列
      storageCapacityBonus: 10 // 仓储容量 +10%
    }
  },
  [OfficerType.Admiral]: {
    id: OfficerType.Admiral,
    name: '上将',
    description: '提升舰队作战能力',
    cost: { metal: 50000, crystal: 25000, deuterium: 0, darkMatter: 7000, energy: 0 },
    weeklyMaintenance: { metal: 5000, crystal: 2500, deuterium: 0, darkMatter: 900, energy: 0 },
    benefits: {
      additionalFleetSlots: 2, // 额外2个舰队槽位
      fleetSpeedBonus: 10, // 舰队速度 +10%
      fuelConsumptionReduction: 10 // 燃料消耗 -10%
    }
  },
  [OfficerType.Engineer]: {
    id: OfficerType.Engineer,
    name: '工程师',
    description: '增强防御和能量系统',
    cost: { metal: 40000, crystal: 20000, deuterium: 10000, darkMatter: 7000, energy: 0 },
    weeklyMaintenance: { metal: 4000, crystal: 2000, deuterium: 1000, darkMatter: 900, energy: 0 },
    benefits: {
      defenseBonus: 15, // 防御力 +15%
      energyProductionBonus: 10, // 电量产出 +10%
      buildingSpeedBonus: 5 // 建筑速度 +5%
    }
  },
  [OfficerType.Geologist]: {
    id: OfficerType.Geologist,
    name: '地质学家',
    description: '提高资源开采效率',
    cost: { metal: 30000, crystal: 30000, deuterium: 20000, darkMatter: 7000, energy: 0 },
    weeklyMaintenance: { metal: 3000, crystal: 3000, deuterium: 2000, darkMatter: 900, energy: 0 },
    benefits: {
      resourceProductionBonus: 15, // 资源产量 +15%
      storageCapacityBonus: 10 // 仓储容量 +10%
    }
  },
  [OfficerType.Technocrat]: {
    id: OfficerType.Technocrat,
    name: '技术专家',
    description: '加快科技研究速度',
    cost: { metal: 20000, crystal: 40000, deuterium: 20000, darkMatter: 7000, energy: 0 },
    weeklyMaintenance: { metal: 2000, crystal: 4000, deuterium: 2000, darkMatter: 900, energy: 0 },
    benefits: {
      researchSpeedBonus: 15 // 研究速度 +15%
    }
  },
  [OfficerType.DarkMatterSpecialist]: {
    id: OfficerType.DarkMatterSpecialist,
    name: '暗物质专家',
    description: '提升暗物质采集效率',
    cost: { metal: 50000, crystal: 100000, deuterium: 50000, darkMatter: 100, energy: 0 },
    weeklyMaintenance: { metal: 5000, crystal: 10000, deuterium: 5000, darkMatter: 10, energy: 0 },
    benefits: {
      darkMatterProductionBonus: 25 // 暗物质产量 +25%
    }
  }
}

// 月球配置
export const MOON_CONFIG = {
  minDebrisField: 100000, // 最小残骸场 (金属+晶体) 100k = 1%概率
  baseChance: 0, // 基础0%概率（每100k残骸增加1%）
  maxChance: 20, // 最大20%概率（需要2M残骸）
  chancePerDebris: 100000, // 每10万资源增加1%概率
  baseFields: 1, // 月球初始空间（OGame规则：初始只有1格）
  lunarBaseFieldsBonus: 3, // 每级月球基地增加的空间（每级+3格，占用1格，净增2格）
  minDiameter: 3476, // 最小月球直径(km)，1%概率时
  maxDiameter: 8944, // 最大月球直径(km)，20%概率时保证>8000km
  baseDiameter: 3000, // 基础直径(km)
  diameterPerChance: 273, // 每1%概率增加的直径(km)，(8944-3476)/20≈273
  jumpGateCooldown: 3600000 // 跳跃门冷却时间(ms) = 1小时 (OGame规则)
  // 注：月球资源容量与行星相同（基础10000），OGame规则允许资源超过容量存储
}

// 行星配置
export const PLANET_CONFIG = {
  baseSize: 300, // 行星基础空间
  terraformerSpaceBonus: 30, // 每级地形改造器增加的空间
  terraformingTechSpaceBonus: 30 // 每级地形改造技术增加的空间
}

// 舰队仓储配置
export const FLEET_STORAGE_CONFIG = {
  baseStorage: 1000, // 基础舰队仓储
  shipyardBonus: 1000, // 每级造船厂增加的仓储
  computerTechBonus: 500 // 每级计算机技术全局增加的仓储
}

// 外交系统配置
export const DIPLOMATIC_CONFIG = {
  // 好感度范围
  MIN_REPUTATION: -100,
  MAX_REPUTATION: 100,

  // 关系状态阈值
  HOSTILE_THRESHOLD: -20, // 低于此值为敌对
  FRIENDLY_THRESHOLD: 20, // 高于此值为友好

  // 各种行为的好感度变化值
  REPUTATION_CHANGES: {
    // 赠送资源（基于资源价值计算）
    GIFT_BASE: 0, // 基础好感度（移除固定奖励，完全基于资源量）
    GIFT_PER_1K_RESOURCES: 2, // 每1000资源价值增加2点（提高权重）
    GIFT_MIN_VALUE: 500, // 最小资源价值门槛（低于此值不增加好感度）
    GIFT_MAX_SINGLE: 20, // 单次赠送最大好感度增加

    // 负面行为
    ATTACK: -15, // 攻击一次
    ATTACK_WIN: -25, // 攻击并获胜
    ATTACK_DESTROY_PLANET: -50, // 摧毁星球
    SPY_DETECTED: -5, // 侦查被发现
    SPY_UNDETECTED: -2, // 侦查未被发现
    STEAL_DEBRIS: -10, // 抢夺残骸（在NPC星球位置）
    DESTROY_FLEET: -3, // 每摧毁1单位战力扣除好感度

    // 正面行为
    HELP_ATTACK_ENEMY: 15, // 帮助攻击NPC的敌人
    LONG_PEACE_DECAY: 1, // 长期不攻击的友好衰减（每周+1）
    TRADE: 5, // 贸易（未来功能预留）

    // 关系网络影响
    ALLY_ATTACKED: -10, // 攻击盟友导致的好感度降低
    ALLY_HELPED: 5 // 帮助盟友导致的好感度增加
  },

  // 好感度自然变化
  NATURAL_DECAY: {
    ENABLED: true,
    INTERVAL: 7 * 24 * 3600, // 7天（秒）
    TOWARDS_NEUTRAL_RATE: 2 // 每周向中立值回归2点
  },

  // 基于关系的行为调整
  BEHAVIOR_MODIFIERS: {
    HOSTILE_ATTACK_MULTIPLIER: 2.0, // 敌对状态攻击频率翻倍
    HOSTILE_SPY_MULTIPLIER: 1.5, // 敌对状态侦查频率提高50%
    FRIENDLY_ATTACK_PROBABILITY: 0, // 友好状态不攻击
    FRIENDLY_SPY_PROBABILITY: 0.5, // 友好状态侦查概率降低到50%
    NEUTRAL_ATTACK_PROBABILITY: 1.0, // 中立状态正常攻击概率
    NEUTRAL_SPY_PROBABILITY: 1.0 // 中立状态正常侦查概率
  },

  // NPC主动赠送资源配置
  NPC_GIFT_CONFIG: {
    ENABLED: true,
    MIN_REPUTATION: 60, // NPC对玩家好感度≥60才会赠送
    CHECK_INTERVAL: 4 * 3600, // 每4小时检查一次（秒）
    GIFT_PROBABILITY: 0.3, // 30%概率赠送（提高频率）
    // 基础赠送量（会根据玩家经济规模动态调整）
    BASE_GIFT_AMOUNT: {
      METAL: { min: 100000, max: 500000 },
      CRYSTAL: { min: 50000, max: 250000 },
      DEUTERIUM: { min: 20000, max: 100000 }
    },
    // 动态赠送配置：根据玩家总产量比例赠送
    DYNAMIC_GIFT: {
      ENABLED: true,
      // 赠送玩家每小时产量的倍数（4-8小时产量）
      PRODUCTION_MULTIPLIER: { min: 4, max: 8 },
      // 最小赠送量（保底）
      MIN_AMOUNT: {
        METAL: 100000,
        CRYSTAL: 50000,
        DEUTERIUM: 20000
      },
      // 最大赠送量（封顶，防止过于夸张）
      MAX_AMOUNT: {
        METAL: 100000000, // 1亿
        CRYSTAL: 50000000, // 5千万
        DEUTERIUM: 20000000 // 2千万
      }
    }
  },

  // 礼物接受/拒绝配置
  GIFT_ACCEPTANCE_CONFIG: {
    NPC_REJECTION_BASE_PROBABILITY: 0.3, // NPC拒绝礼物的基础概率（30%）
    NPC_REJECTION_REPUTATION_MODIFIER: 0.01, // 好感度每降低1点，拒绝概率增加1%
    MIN_REJECTION_PROBABILITY: 0.05, // 最小拒绝概率（5%，即使关系很好）
    MAX_REJECTION_PROBABILITY: 0.8, // 最大拒绝概率（80%，即使关系很差）
    GIFT_EXPIRATION_DAYS: 7, // 礼物通知过期天数
    REJECTION_REPUTATION_PENALTY: -5 // 拒绝礼物导致的好感度降低
  },

  // 盟友协防配置
  ALLY_DEFENSE_CONFIG: {
    ENABLED: true,
    // 触发协防的最低好感度
    MIN_REPUTATION: 70,
    // 检查间隔（秒）
    CHECK_INTERVAL: 30,
    // 派遣舰队比例（派出多少比例的可用舰队）
    FLEET_RATIO: { min: 0.3, max: 0.6 },
    // 协防持续时间（毫秒）- 舰队在玩家星球驻守多久
    STATION_DURATION: 2 * 60 * 60 * 1000, // 2小时
    // 每个NPC最多同时协防几个星球
    MAX_CONCURRENT_DEFENSES: 2,
    // 协防触发条件：来袭舰队规模最小值
    MIN_INCOMING_FLEET_SIZE: 50,
    // 协防触发概率（根据好感度调整）
    BASE_DEFENSE_PROBABILITY: 0.7
  },

  // 敌对NPC增强行为配置
  HOSTILE_BEHAVIOR_CONFIG: {
    // 围攻机制：多个敌对NPC协同攻击
    SIEGE: {
      ENABLED: true,
      // 触发围攻的条件
      MIN_HOSTILE_NPCS: 2, // 至少2个敌对NPC才能触发围攻
      TRIGGER_REPUTATION: -50, // 好感度低于此值的NPC可能参与围攻
      // 围攻窗口时间（毫秒）- NPC在此时间内协调攻击
      COORDINATION_WINDOW: 60 * 1000, // 1分钟内到达
      // 围攻概率（基础概率，会根据玩家实力调整）
      BASE_PROBABILITY: 0.3,
      // 围攻冷却时间（毫秒）
      COOLDOWN: 30 * 60 * 1000, // 30分钟
      // 围攻舰队比例（每个参与NPC派出的舰队比例）
      FLEET_RATIO: { min: 0.5, max: 0.8 }
    },

    // 骚扰战术：小规模持续袭击
    HARASSMENT: {
      ENABLED: true,
      // 触发条件：好感度低于此值
      TRIGGER_REPUTATION: -30,
      // 骚扰间隔（秒）- 比正常攻击更频繁
      INTERVAL: 120, // 2分钟
      // 骚扰舰队规模（小规模）
      FLEET_SIZE_RATIO: { min: 0.1, max: 0.2 },
      // 骚扰概率
      PROBABILITY: 0.4,
      // 骚扰类型权重
      TYPES: {
        spy: 0.4, // 40%概率侦查骚扰
        raid: 0.4, // 40%概率小规模袭击
        intimidate: 0.2 // 20%概率威慑（派舰队但不攻击，消耗玩家注意力）
      }
    },

    // 报复升级：被攻击次数越多，反击越猛烈
    REVENGE_ESCALATION: {
      ENABLED: true,
      // 报复等级配置（基于被攻击次数）
      LEVELS: [
        { attackCount: 1, fleetMultiplier: 1.0, attackInterval: 600, name: 'mild' }, // 轻微：正常反击
        { attackCount: 3, fleetMultiplier: 1.5, attackInterval: 300, name: 'moderate' }, // 中等：1.5倍舰队，5分钟间隔
        { attackCount: 5, fleetMultiplier: 2.0, attackInterval: 180, name: 'severe' }, // 严重：2倍舰队，3分钟间隔
        { attackCount: 10, fleetMultiplier: 3.0, attackInterval: 60, name: 'extreme' } // 极端：3倍舰队，1分钟间隔
      ],
      // 报复记忆时间（毫秒）- 超过此时间后报复等级重置
      MEMORY_DURATION: 7 * 24 * 60 * 60 * 1000, // 7天
      // 报复期间是否呼叫盟友NPC助战
      CALL_ALLIES: true,
      // 呼叫盟友的概率（报复等级越高概率越大）
      ALLY_CALL_BASE_PROBABILITY: 0.2
    }
  },

  // 中立NPC行为配置
  NEUTRAL_BEHAVIOR_CONFIG: {
    // 有条件贸易：中立NPC可以与玩家进行资源交换
    TRADE: {
      ENABLED: true,
      // 贸易前提：好感度在此区间内的中立NPC才会贸易
      MIN_REPUTATION: -10, // 好感度不能太低
      MAX_REPUTATION: 19, // 好感度不能太高（太高就是友好了）
      // 贸易检查间隔（秒）
      CHECK_INTERVAL: 1800, // 30分钟
      // 贸易概率
      PROBABILITY: 0.1,
      // 玩家最多同时保留的贸易提议数量
      MAX_PENDING_OFFERS: 30,
      // 汇率配置：NPC出售资源的汇率
      EXCHANGE_RATES: {
        // 金属:晶体:重氢 基准比例 3:2:1
        metalToCrystal: 1.5, // 1.5金属换1晶体
        metalToDeuterium: 3.0, // 3金属换1重氢
        crystalToDeuterium: 2.0 // 2晶体换1重氢
      },
      // 贸易量配置（基于玩家每小时产量的倍数）
      TRADE_AMOUNT: {
        min: 2, // 最少2小时产量
        max: 6 // 最多6小时产量
      },
      // 贸易手续费（NPC抽取的百分比）
      FEE_PERCENTAGE: 10,
      // 成功贸易增加好感度
      REPUTATION_GAIN: 3
    },

    // 外交摇摆：中立NPC会根据玩家行为倾向友好或敌对
    SWING: {
      ENABLED: true,
      // 摇摆检查间隔（秒）
      CHECK_INTERVAL: 1800, // 30分钟
      // 摇摆触发阈值
      SWING_THRESHOLD: {
        toFriendly: 15, // 好感度达到15时有概率变友好
        toHostile: -15 // 好感度达到-15时有概率变敌对
      },
      // 摇摆概率（基础概率，根据好感度调整）
      BASE_PROBABILITY: 0.2,
      // 摇摆时的通知（给玩家提示NPC态度变化）
      NOTIFY_PLAYER: true
    },

    // 观望行为：中立NPC会观察玩家与其他NPC的互动
    OBSERVE: {
      ENABLED: true,
      // 观察范围（同一星系内的NPC）
      SAME_GALAXY_ONLY: true,
      // 玩家攻击附近NPC时，中立NPC好感度变化
      ATTACK_NEARBY_PENALTY: -3,
      // 玩家帮助附近NPC时，中立NPC好感度变化
      HELP_NEARBY_BONUS: 2
    }
  },

  // 友好NPC增强行为配置
  FRIENDLY_BEHAVIOR_CONFIG: {
    // 情报共享：友好NPC会分享其他NPC的情报
    INTEL_SHARING: {
      ENABLED: true,
      // 触发条件：好感度达到此值
      MIN_REPUTATION: 50,
      // 分享间隔（秒）
      INTERVAL: 3600, // 1小时
      // 分享概率
      PROBABILITY: 0.4,
      // 情报类型
      INTEL_TYPES: {
        enemyFleet: 0.4, // 40%概率分享敌对NPC舰队信息
        enemyResources: 0.3, // 30%概率分享敌对NPC资源信息
        enemyMovement: 0.3 // 30%概率分享敌对NPC舰队动向
      }
    },

    // 联合攻击邀请：友好NPC可能邀请玩家一起攻击敌对NPC
    JOINT_ATTACK: {
      ENABLED: true,
      // 触发条件：好感度达到此值
      MIN_REPUTATION: 70,
      // 邀请间隔（秒）
      INTERVAL: 7200, // 2小时
      // 邀请概率
      PROBABILITY: 0.25,
      // 目标选择：共同敌人优先
      PREFER_COMMON_ENEMY: true,
      // NPC提供的舰队比例
      NPC_FLEET_RATIO: { min: 0.3, max: 0.5 },
      // 战利品分配：玩家获得的比例
      PLAYER_LOOT_RATIO: 0.7,
      // 联合攻击成功增加好感度
      SUCCESS_REPUTATION_GAIN: 10,
      // 拒绝邀请减少好感度
      DECLINE_REPUTATION_PENALTY: -5
    },

    // 资源援助：友好NPC在玩家困难时提供援助
    RESOURCE_AID: {
      ENABLED: true,
      // 触发条件：好感度达到此值
      MIN_REPUTATION: 60,
      // 检查间隔（秒）
      CHECK_INTERVAL: 1800, // 30分钟
      // 触发条件：玩家资源低于产量的N小时
      TRIGGER_LOW_RESOURCES_HOURS: 2,
      // 援助量（玩家N小时产量）
      AID_AMOUNT_HOURS: 4,
      // 援助概率
      PROBABILITY: 0.5
    }
  },

  // NPC联盟系统配置
  NPC_ALLIANCE_CONFIG: {
    ENABLED: true,

    // NPC之间关系初始化
    INTER_NPC_RELATIONS: {
      // 初始化方式：random（随机）、distance（基于距离）、type（基于AI类型）
      INIT_MODE: 'mixed',
      // 同一星系内NPC更容易成为盟友
      SAME_GALAXY_ALLY_BONUS: 0.3,
      // AI类型兼容性（决定NPC之间关系）
      TYPE_COMPATIBILITY: {
        // 侵略型与防守型互为敌人
        aggressive_defensive: -0.8,
        // 商人型与任何类型都友好
        trader_any: 0.5,
        // 扩张型互相竞争
        expansionist_expansionist: -0.3,
        // 平衡型保持中立
        balanced_any: 0
      }
    },

    // 连坐效应配置
    GUILT_BY_ASSOCIATION: {
      ENABLED: true,
      // 攻击NPC时，其盟友好感度降低
      ALLY_REPUTATION_PENALTY: -10,
      // 帮助NPC时，其盟友好感度增加
      ALLY_REPUTATION_BONUS: 5,
      // 盟友关系强度影响（越紧密影响越大）
      STRENGTH_MULTIPLIER: true,
      // 最大传播深度（防止无限传播）
      MAX_PROPAGATION_DEPTH: 2
    },

    // NPC盟友互助
    MUTUAL_DEFENSE: {
      ENABLED: true,
      // 盟友被攻击时的响应概率
      RESPONSE_PROBABILITY: 0.5,
      // 响应舰队比例
      FLEET_RATIO: { min: 0.2, max: 0.4 },
      // 响应冷却时间（秒）
      COOLDOWN: 1800 // 30分钟
    },

    // NPC之间的资源共享
    RESOURCE_SHARING: {
      ENABLED: true,
      // 共享间隔（秒）
      INTERVAL: 7200, // 2小时
      // 共享比例
      SHARE_RATIO: 0.1 // 共享10%资源
    }
  }
}

// 矿脉储量配置
export const ORE_DEPOSIT_CONFIG = {
  // 基础储量（单位：资源量）- 大幅提升以支持后期发展
  BASE_DEPOSITS: {
    metal: 500_000_000_0, // 50亿金属
    crystal: 300_000_000_0, // 30亿晶体
    deuterium: 150_000_000_0 // 15亿重氢
  },
  // 位置系数（位置1-15），影响资源分布
  // 内圈(1-4)晶体多，中圈(5-10)均衡，外圈(11-15)重氢多
  POSITION_MULTIPLIERS: {
    metal: [0.8, 0.85, 0.9, 0.95, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.95, 0.9, 0.85, 0.8, 0.75],
    crystal: [1.3, 1.25, 1.2, 1.1, 1.0, 1.0, 1.0, 1.0, 1.0, 0.95, 0.9, 0.85, 0.8, 0.75, 0.7],
    deuterium: [0.5, 0.55, 0.6, 0.7, 0.8, 0.9, 1.0, 1.0, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7]
  },
  // 银河系系数（每个银河系增加5%储量）
  GALAXY_MULTIPLIER: 0.05,
  // 随机浮动范围（±20%）
  RANDOM_VARIANCE: 0.2,
  // 警告阈值（低于10%时显示警告）
  WARNING_THRESHOLD: 0.1,
  // 产量衰减开始阈值（低于5%时产量开始衰减）
  DECAY_START_THRESHOLD: 0.05,
  // 矿脉耗尽后的基础产量保底（20%产量，确保游戏可继续）
  MIN_PRODUCTION_EFFICIENCY: 0.2,
  // 矿脉恢复配置
  REGENERATION: {
    ENABLED: true,
    // 每小时恢复初始储量的百分比（0.1% = 每小时恢复0.1%，约42天完全恢复）
    RATE_PER_HOUR: 0.001,
    // 最大恢复到初始储量的百分比（100%表示可以完全恢复）
    MAX_PERCENTAGE: 1.0
  }
}

// 探险区域配置 - 大幅提升奖励，降低空手而归概率
export const EXPEDITION_ZONES: Record<ExpeditionZone, ExpeditionZoneConfig> = {
  [ExpeditionZone.NearSpace]: {
    id: ExpeditionZone.NearSpace,
    requiredTechLevel: 0, // 无需求
    flightTimeMultiplier: 1.0,
    resourceMultiplier: 1.5, // 1.0 -> 1.5
    darkMatterMultiplier: 1.5, // 1.0 -> 1.5
    fleetFindMultiplier: 1.5, // 1.0 -> 1.5
    dangerMultiplier: 0.5, // 低危险
    probabilities: {
      resources: 40, // 35 -> 40 高概率发现资源
      darkMatter: 12, // 8 -> 12
      fleet: 15, // 10 -> 15
      pirates: 5, // 7 -> 5 低海盗
      aliens: 3, // 5 -> 3 低外星人
      nothing: 25 // 35 -> 25 降低空手而归
    }
  },
  [ExpeditionZone.DeepSpace]: {
    id: ExpeditionZone.DeepSpace,
    requiredTechLevel: 4, // 需要天体物理学4级
    flightTimeMultiplier: 1.5,
    resourceMultiplier: 2.5, // 1.5 -> 2.5
    darkMatterMultiplier: 2.5, // 1.5 -> 2.5
    fleetFindMultiplier: 2.0, // 1.5 -> 2.0
    dangerMultiplier: 1.0, // 标准危险
    probabilities: {
      resources: 35, // 30 -> 35
      darkMatter: 15, // 10 -> 15
      fleet: 18, // 15 -> 18
      pirates: 12, // 15 -> 12
      aliens: 8, // 10 -> 8
      nothing: 12 // 20 -> 12
    }
  },
  [ExpeditionZone.UnchartedSpace]: {
    id: ExpeditionZone.UnchartedSpace,
    requiredTechLevel: 8, // 需要天体物理学8级
    flightTimeMultiplier: 2.0,
    resourceMultiplier: 4.0, // 2.5 -> 4.0
    darkMatterMultiplier: 3.5, // 2.0 -> 3.5
    fleetFindMultiplier: 3.0, // 2.0 -> 3.0
    dangerMultiplier: 1.5, // 高危险
    probabilities: {
      resources: 32, // 25 -> 32
      darkMatter: 18, // 12 -> 18
      fleet: 22, // 18 -> 22
      pirates: 12, // 18 -> 12
      aliens: 10, // 15 -> 10
      nothing: 6 // 12 -> 6
    }
  },
  [ExpeditionZone.DangerousNebula]: {
    id: ExpeditionZone.DangerousNebula,
    requiredTechLevel: 12, // 需要天体物理学12级
    flightTimeMultiplier: 3.0,
    resourceMultiplier: 6.0, // 4.0 -> 6.0
    darkMatterMultiplier: 5.0, // 3.0 -> 5.0
    fleetFindMultiplier: 5.0, // 3.0 -> 5.0
    dangerMultiplier: 2.5, // 极高危险
    probabilities: {
      resources: 30, // 20 -> 30
      darkMatter: 20, // 15 -> 20
      fleet: 25, // 20 -> 25
      pirates: 12, // 20 -> 12
      aliens: 10, // 20 -> 10
      nothing: 3 // 5 -> 3 极少空手而归
    }
  }
}
