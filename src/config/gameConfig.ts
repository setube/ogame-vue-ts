import { BuildingType, TechnologyType, ShipType, DefenseType, OfficerType } from '@/types/game'
import type { BuildingConfig, TechnologyConfig, ShipConfig, DefenseConfig, OfficerConfig } from '@/types/game'

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
    fleetStorageBonus: 1000, // 每级增加100舰队仓储
    requirements: { [BuildingType.RoboticsFactory]: 2 },
    levelRequirements: {
      8: { [BuildingType.RoboticsFactory]: 5, [BuildingType.ResearchLab]: 5 },
      12: { [BuildingType.RoboticsFactory]: 8, [BuildingType.ResearchLab]: 8, [BuildingType.NaniteFactory]: 2 }
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
    requirements: { [BuildingType.MetalMine]: 2 },
    levelRequirements: {
      8: { [BuildingType.MetalMine]: 15, [BuildingType.RoboticsFactory]: 3 },
      12: { [BuildingType.MetalMine]: 25, [BuildingType.RoboticsFactory]: 6 }
    }
  },
  [BuildingType.CrystalStorage]: {
    id: BuildingType.CrystalStorage,
    name: '晶体仓库',
    description: '增加晶体存储上限',
    baseCost: { metal: 1000, crystal: 500, deuterium: 0, darkMatter: 0, energy: 0 },
    baseTime: 15, // 减少建造时间：30→15秒
    costMultiplier: 2,
    spaceUsage: 1,
    requirements: { [BuildingType.CrystalMine]: 2 },
    levelRequirements: {
      8: { [BuildingType.CrystalMine]: 15, [BuildingType.RoboticsFactory]: 3 },
      12: { [BuildingType.CrystalMine]: 25, [BuildingType.RoboticsFactory]: 6 }
    }
  },
  [BuildingType.DeuteriumTank]: {
    id: BuildingType.DeuteriumTank,
    name: '重氢罐',
    description: '增加重氢存储上限',
    baseCost: { metal: 1000, crystal: 1000, deuterium: 0, darkMatter: 0, energy: 0 },
    baseTime: 15, // 减少建造时间：30→15秒
    costMultiplier: 2,
    spaceUsage: 1,
    requirements: { [BuildingType.DeuteriumSynthesizer]: 2 },
    levelRequirements: {
      8: { [BuildingType.DeuteriumSynthesizer]: 15, [BuildingType.RoboticsFactory]: 3 },
      12: { [BuildingType.DeuteriumSynthesizer]: 25, [BuildingType.RoboticsFactory]: 6 }
    }
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
    description: '改造行星地形，每级增加5个可用空间',
    baseCost: { metal: 0, crystal: 50000, deuterium: 100000, darkMatter: 0, energy: 0 },
    baseTime: 60,
    costMultiplier: 2,
    spaceUsage: 0,
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
    description: '增加研究队列数量，每级+1队列',
    baseCost: { metal: 0, crystal: 400, deuterium: 600, darkMatter: 0, energy: 0 },
    baseTime: 60,
    costMultiplier: 2,
    fleetStorageBonus: 500, // 每级全局增加50舰队仓储
    maxLevel: 10, // 最多10级（最多11个研究队列）
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
    description: '提高间谍探测效果，每级提高1级侦查深度',
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
    baseCost: { metal: 0, crystal: 0, deuterium: 0, darkMatter: 300000, energy: 0 },
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
    requirements: { [BuildingType.ResearchLab]: 8, [TechnologyType.HyperspaceTechnology]: 5 },
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
    description: '研究行星地形改造技术，每级为所有行星增加5个可用空间',
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
    maxLevel: 5, // 最多5级
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
    requirements: { [BuildingType.Shipyard]: 1, [TechnologyType.CombustionDrive]: 1 }
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
    requirements: { [BuildingType.Shipyard]: 3, [TechnologyType.ImpulseDrive]: 2 }
  },
  [ShipType.Cruiser]: {
    id: ShipType.Cruiser,
    name: '巡洋舰',
    description: '中型战舰',
    cost: { metal: 20000, crystal: 7000, deuterium: 2000, darkMatter: 0, energy: 0 },
    buildTime: 60,
    cargoCapacity: 800,
    attack: 400,
    shield: 50,
    armor: 2700,
    speed: 15000,
    fuelConsumption: 300,
    storageUsage: 15,
    requirements: { [BuildingType.Shipyard]: 5, [TechnologyType.ImpulseDrive]: 4, [TechnologyType.IonTechnology]: 2 }
  },
  [ShipType.Battleship]: {
    id: ShipType.Battleship,
    name: '战列舰',
    description: '重型战舰',
    cost: { metal: 45000, crystal: 15000, deuterium: 0, darkMatter: 0, energy: 0 },
    buildTime: 90,
    cargoCapacity: 1500,
    attack: 1000,
    shield: 200,
    armor: 6000,
    speed: 10000,
    fuelConsumption: 500,
    storageUsage: 25,
    requirements: { [BuildingType.Shipyard]: 7, [TechnologyType.HyperspaceDrive]: 4 }
  },
  [ShipType.Battlecruiser]: {
    id: ShipType.Battlecruiser,
    name: '战列巡洋舰',
    description: '快速强大的战斗舰船，擅长攻击战列舰',
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
    }
  },
  [ShipType.Bomber]: {
    id: ShipType.Bomber,
    name: '轰炸机',
    description: '专门对付防御设施的轰炸舰',
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
    }
  },
  [ShipType.Destroyer]: {
    id: ShipType.Destroyer,
    name: '驱逐舰',
    description: '擅长摧毁大型舰船的猎杀者',
    cost: { metal: 60000, crystal: 50000, deuterium: 15000, darkMatter: 0, energy: 0 },
    buildTime: 120,
    cargoCapacity: 2000,
    attack: 2000,
    shield: 500,
    armor: 11000,
    speed: 5000,
    fuelConsumption: 1000,
    storageUsage: 40,
    requirements: {
      [BuildingType.Shipyard]: 9,
      [TechnologyType.HyperspaceDrive]: 6,
      [TechnologyType.HyperspaceTechnology]: 5
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
    description: '提供额外能源，每个产生50点能量',
    cost: { metal: 0, crystal: 2000, deuterium: 500, darkMatter: 0, energy: 0 },
    buildTime: 10,
    cargoCapacity: 0,
    attack: 1,
    shield: 1,
    armor: 200,
    speed: 0,
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
    cost: { metal: 5000000, crystal: 4000000, deuterium: 1000000, darkMatter: 50000, energy: 0 },
    buildTime: 600,
    cargoCapacity: 1000000,
    attack: 200000,
    shield: 50000,
    armor: 900000,
    speed: 100,
    fuelConsumption: 1,
    storageUsage: 100,
    requirements: {
      [BuildingType.PlanetDestroyerFactory]: 10,
      [TechnologyType.PlanetDestructionTech]: 7,
      [TechnologyType.HyperspaceDrive]: 7
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
  minDebrisField: 100000, // 最小残骸场 (金属+晶体)
  baseChance: 1, // 基础1%概率
  maxChance: 20, // 最大20%概率
  chancePerDebris: 100000, // 每10万资源增加1%概率
  baseSize: 60, // 月球基础空间
  lunarBaseSpaceBonus: 5 // 每级月球基地增加的空间
}

// 行星配置
export const PLANET_CONFIG = {
  baseSize: 200, // 行星基础空间
  terraformerSpaceBonus: 5, // 每级地形改造器增加的空间
  terraformingTechSpaceBonus: 3 // 每级地形改造技术增加的空间
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
    CHECK_INTERVAL: 24 * 3600, // 每天检查一次（秒）
    GIFT_PROBABILITY: 0.05, // 5%概率赠送
    GIFT_AMOUNT: {
      METAL: { min: 1000, max: 5000 },
      CRYSTAL: { min: 500, max: 2500 },
      DEUTERIUM: { min: 200, max: 1000 }
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
  }
}
