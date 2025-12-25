import { AchievementCategory, AchievementTier, type AchievementConfig } from '@/types/game'

// 成就配置
// 每个成就有5个等级：青铜、白银、黄金、铂金、钻石
// 每个等级有对应的目标值和奖励（暗物质 + 积分）

export const ACHIEVEMENTS: AchievementConfig[] = [
  // ==================== 资源类成就 ====================
  {
    id: 'metalCollector',
    category: AchievementCategory.Resource,
    icon: 'Gem',
    statKey: 'totalMetalProduced',
    checkType: 'gte',
    tiers: [
      { tier: AchievementTier.Bronze, target: 10000, reward: { darkMatter: 10, points: 100 } },
      { tier: AchievementTier.Silver, target: 100000, reward: { darkMatter: 50, points: 500 } },
      { tier: AchievementTier.Gold, target: 1000000, reward: { darkMatter: 200, points: 2000 } },
      { tier: AchievementTier.Platinum, target: 10000000, reward: { darkMatter: 1000, points: 10000 } },
      { tier: AchievementTier.Diamond, target: 100000000, reward: { darkMatter: 5000, points: 50000 } }
    ]
  },
  {
    id: 'crystalCollector',
    category: AchievementCategory.Resource,
    icon: 'Diamond',
    statKey: 'totalCrystalProduced',
    checkType: 'gte',
    tiers: [
      { tier: AchievementTier.Bronze, target: 5000, reward: { darkMatter: 10, points: 100 } },
      { tier: AchievementTier.Silver, target: 50000, reward: { darkMatter: 50, points: 500 } },
      { tier: AchievementTier.Gold, target: 500000, reward: { darkMatter: 200, points: 2000 } },
      { tier: AchievementTier.Platinum, target: 5000000, reward: { darkMatter: 1000, points: 10000 } },
      { tier: AchievementTier.Diamond, target: 50000000, reward: { darkMatter: 5000, points: 50000 } }
    ]
  },
  {
    id: 'deuteriumCollector',
    category: AchievementCategory.Resource,
    icon: 'Droplet',
    statKey: 'totalDeuteriumProduced',
    checkType: 'gte',
    tiers: [
      { tier: AchievementTier.Bronze, target: 2500, reward: { darkMatter: 15, points: 150 } },
      { tier: AchievementTier.Silver, target: 25000, reward: { darkMatter: 75, points: 750 } },
      { tier: AchievementTier.Gold, target: 250000, reward: { darkMatter: 300, points: 3000 } },
      { tier: AchievementTier.Platinum, target: 2500000, reward: { darkMatter: 1500, points: 15000 } },
      { tier: AchievementTier.Diamond, target: 25000000, reward: { darkMatter: 7500, points: 75000 } }
    ]
  },
  {
    id: 'darkMatterCollector',
    category: AchievementCategory.Resource,
    icon: 'Sparkles',
    statKey: 'totalDarkMatterProduced',
    checkType: 'gte',
    tiers: [
      { tier: AchievementTier.Bronze, target: 100, reward: { darkMatter: 20, points: 200 } },
      { tier: AchievementTier.Silver, target: 1000, reward: { darkMatter: 100, points: 1000 } },
      { tier: AchievementTier.Gold, target: 10000, reward: { darkMatter: 500, points: 5000 } },
      { tier: AchievementTier.Platinum, target: 100000, reward: { darkMatter: 2500, points: 25000 } },
      { tier: AchievementTier.Diamond, target: 1000000, reward: { darkMatter: 10000, points: 100000 } }
    ]
  },
  {
    id: 'resourceConsumer',
    category: AchievementCategory.Resource,
    icon: 'Flame',
    statKey: 'totalResourcesConsumed',
    checkType: 'sum',
    tiers: [
      { tier: AchievementTier.Bronze, target: 50000, reward: { darkMatter: 15, points: 150 } },
      { tier: AchievementTier.Silver, target: 500000, reward: { darkMatter: 75, points: 750 } },
      { tier: AchievementTier.Gold, target: 5000000, reward: { darkMatter: 350, points: 3500 } },
      { tier: AchievementTier.Platinum, target: 50000000, reward: { darkMatter: 1750, points: 17500 } },
      { tier: AchievementTier.Diamond, target: 500000000, reward: { darkMatter: 8500, points: 85000 } }
    ]
  },

  // ==================== 建造类成就 ====================
  {
    id: 'masterBuilder',
    category: AchievementCategory.Building,
    icon: 'Building2',
    statKey: 'buildingsUpgraded',
    checkType: 'gte',
    tiers: [
      { tier: AchievementTier.Bronze, target: 10, reward: { darkMatter: 10, points: 100 } },
      { tier: AchievementTier.Silver, target: 50, reward: { darkMatter: 50, points: 500 } },
      { tier: AchievementTier.Gold, target: 200, reward: { darkMatter: 200, points: 2000 } },
      { tier: AchievementTier.Platinum, target: 500, reward: { darkMatter: 1000, points: 10000 } },
      { tier: AchievementTier.Diamond, target: 1000, reward: { darkMatter: 5000, points: 50000 } }
    ]
  },
  {
    id: 'researcher',
    category: AchievementCategory.Building,
    icon: 'FlaskConical',
    statKey: 'researchCompleted',
    checkType: 'gte',
    tiers: [
      { tier: AchievementTier.Bronze, target: 5, reward: { darkMatter: 15, points: 150 } },
      { tier: AchievementTier.Silver, target: 25, reward: { darkMatter: 75, points: 750 } },
      { tier: AchievementTier.Gold, target: 100, reward: { darkMatter: 300, points: 3000 } },
      { tier: AchievementTier.Platinum, target: 250, reward: { darkMatter: 1500, points: 15000 } },
      { tier: AchievementTier.Diamond, target: 500, reward: { darkMatter: 7500, points: 75000 } }
    ]
  },
  {
    id: 'shipwright',
    category: AchievementCategory.Building,
    icon: 'Rocket',
    statKey: 'totalShipsProduced',
    checkType: 'gte',
    tiers: [
      { tier: AchievementTier.Bronze, target: 10, reward: { darkMatter: 10, points: 100 } },
      { tier: AchievementTier.Silver, target: 100, reward: { darkMatter: 50, points: 500 } },
      { tier: AchievementTier.Gold, target: 500, reward: { darkMatter: 200, points: 2000 } },
      { tier: AchievementTier.Platinum, target: 2000, reward: { darkMatter: 1000, points: 10000 } },
      { tier: AchievementTier.Diamond, target: 10000, reward: { darkMatter: 5000, points: 50000 } }
    ]
  },
  {
    id: 'fortifier',
    category: AchievementCategory.Building,
    icon: 'Shield',
    statKey: 'totalDefensesBuilt',
    checkType: 'gte',
    tiers: [
      { tier: AchievementTier.Bronze, target: 10, reward: { darkMatter: 10, points: 100 } },
      { tier: AchievementTier.Silver, target: 100, reward: { darkMatter: 50, points: 500 } },
      { tier: AchievementTier.Gold, target: 500, reward: { darkMatter: 200, points: 2000 } },
      { tier: AchievementTier.Platinum, target: 2000, reward: { darkMatter: 1000, points: 10000 } },
      { tier: AchievementTier.Diamond, target: 10000, reward: { darkMatter: 5000, points: 50000 } }
    ]
  },

  // ==================== 战斗类成就 ====================
  {
    id: 'warmonger',
    category: AchievementCategory.Combat,
    icon: 'Swords',
    statKey: 'attacksLaunched',
    checkType: 'gte',
    tiers: [
      { tier: AchievementTier.Bronze, target: 5, reward: { darkMatter: 20, points: 200 } },
      { tier: AchievementTier.Silver, target: 25, reward: { darkMatter: 100, points: 1000 } },
      { tier: AchievementTier.Gold, target: 100, reward: { darkMatter: 400, points: 4000 } },
      { tier: AchievementTier.Platinum, target: 500, reward: { darkMatter: 2000, points: 20000 } },
      { tier: AchievementTier.Diamond, target: 2000, reward: { darkMatter: 10000, points: 100000 } }
    ]
  },
  {
    id: 'conqueror',
    category: AchievementCategory.Combat,
    icon: 'Crown',
    statKey: 'attacksWon',
    checkType: 'gte',
    tiers: [
      { tier: AchievementTier.Bronze, target: 3, reward: { darkMatter: 25, points: 250 } },
      { tier: AchievementTier.Silver, target: 15, reward: { darkMatter: 125, points: 1250 } },
      { tier: AchievementTier.Gold, target: 50, reward: { darkMatter: 500, points: 5000 } },
      { tier: AchievementTier.Platinum, target: 200, reward: { darkMatter: 2500, points: 25000 } },
      { tier: AchievementTier.Diamond, target: 1000, reward: { darkMatter: 12500, points: 125000 } }
    ]
  },
  {
    id: 'defender',
    category: AchievementCategory.Combat,
    icon: 'ShieldCheck',
    statKey: 'defensesSuccessful',
    checkType: 'gte',
    tiers: [
      { tier: AchievementTier.Bronze, target: 3, reward: { darkMatter: 25, points: 250 } },
      { tier: AchievementTier.Silver, target: 15, reward: { darkMatter: 125, points: 1250 } },
      { tier: AchievementTier.Gold, target: 50, reward: { darkMatter: 500, points: 5000 } },
      { tier: AchievementTier.Platinum, target: 200, reward: { darkMatter: 2500, points: 25000 } },
      { tier: AchievementTier.Diamond, target: 1000, reward: { darkMatter: 12500, points: 125000 } }
    ]
  },
  {
    id: 'fleetDestroyer',
    category: AchievementCategory.Combat,
    icon: 'Bomb',
    statKey: 'totalEnemyFleetDestroyedInDefense',
    checkType: 'gte',
    tiers: [
      { tier: AchievementTier.Bronze, target: 10, reward: { darkMatter: 15, points: 150 } },
      { tier: AchievementTier.Silver, target: 100, reward: { darkMatter: 75, points: 750 } },
      { tier: AchievementTier.Gold, target: 500, reward: { darkMatter: 300, points: 3000 } },
      { tier: AchievementTier.Platinum, target: 2000, reward: { darkMatter: 1500, points: 15000 } },
      { tier: AchievementTier.Diamond, target: 10000, reward: { darkMatter: 7500, points: 75000 } }
    ]
  },
  {
    id: 'debrisCreator',
    category: AchievementCategory.Combat,
    icon: 'Trash2',
    statKey: 'totalDebrisCreated',
    checkType: 'sum',
    tiers: [
      { tier: AchievementTier.Bronze, target: 10000, reward: { darkMatter: 10, points: 100 } },
      { tier: AchievementTier.Silver, target: 100000, reward: { darkMatter: 50, points: 500 } },
      { tier: AchievementTier.Gold, target: 1000000, reward: { darkMatter: 200, points: 2000 } },
      { tier: AchievementTier.Platinum, target: 10000000, reward: { darkMatter: 1000, points: 10000 } },
      { tier: AchievementTier.Diamond, target: 100000000, reward: { darkMatter: 5000, points: 50000 } }
    ]
  },
  {
    id: 'fleetSacrifice',
    category: AchievementCategory.Combat,
    icon: 'Skull',
    statKey: 'totalFleetLost',
    checkType: 'sum',
    tiers: [
      { tier: AchievementTier.Bronze, target: 10, reward: { darkMatter: 10, points: 100 } },
      { tier: AchievementTier.Silver, target: 100, reward: { darkMatter: 50, points: 500 } },
      { tier: AchievementTier.Gold, target: 500, reward: { darkMatter: 200, points: 2000 } },
      { tier: AchievementTier.Platinum, target: 2000, reward: { darkMatter: 1000, points: 10000 } },
      { tier: AchievementTier.Diamond, target: 10000, reward: { darkMatter: 5000, points: 50000 } }
    ]
  },
  {
    id: 'defenseSacrifice',
    category: AchievementCategory.Combat,
    icon: 'ShieldOff',
    statKey: 'totalDefenseLostInDefense',
    checkType: 'gte',
    tiers: [
      { tier: AchievementTier.Bronze, target: 10, reward: { darkMatter: 10, points: 100 } },
      { tier: AchievementTier.Silver, target: 100, reward: { darkMatter: 50, points: 500 } },
      { tier: AchievementTier.Gold, target: 500, reward: { darkMatter: 200, points: 2000 } },
      { tier: AchievementTier.Platinum, target: 2000, reward: { darkMatter: 1000, points: 10000 } },
      { tier: AchievementTier.Diamond, target: 10000, reward: { darkMatter: 5000, points: 50000 } }
    ]
  },

  // ==================== 任务类成就 ====================
  {
    id: 'pilot',
    category: AchievementCategory.Mission,
    icon: 'Plane',
    statKey: 'totalFlightMissions',
    checkType: 'gte',
    tiers: [
      { tier: AchievementTier.Bronze, target: 10, reward: { darkMatter: 10, points: 100 } },
      { tier: AchievementTier.Silver, target: 50, reward: { darkMatter: 50, points: 500 } },
      { tier: AchievementTier.Gold, target: 200, reward: { darkMatter: 200, points: 2000 } },
      { tier: AchievementTier.Platinum, target: 1000, reward: { darkMatter: 1000, points: 10000 } },
      { tier: AchievementTier.Diamond, target: 5000, reward: { darkMatter: 5000, points: 50000 } }
    ]
  },
  {
    id: 'transporter',
    category: AchievementCategory.Mission,
    icon: 'Truck',
    statKey: 'transportMissions',
    checkType: 'gte',
    tiers: [
      { tier: AchievementTier.Bronze, target: 5, reward: { darkMatter: 10, points: 100 } },
      { tier: AchievementTier.Silver, target: 25, reward: { darkMatter: 50, points: 500 } },
      { tier: AchievementTier.Gold, target: 100, reward: { darkMatter: 200, points: 2000 } },
      { tier: AchievementTier.Platinum, target: 500, reward: { darkMatter: 1000, points: 10000 } },
      { tier: AchievementTier.Diamond, target: 2000, reward: { darkMatter: 5000, points: 50000 } }
    ]
  },
  {
    id: 'cargoMaster',
    category: AchievementCategory.Mission,
    icon: 'Package',
    statKey: 'transportedResources',
    checkType: 'gte',
    tiers: [
      { tier: AchievementTier.Bronze, target: 10000, reward: { darkMatter: 10, points: 100 } },
      { tier: AchievementTier.Silver, target: 100000, reward: { darkMatter: 50, points: 500 } },
      { tier: AchievementTier.Gold, target: 1000000, reward: { darkMatter: 200, points: 2000 } },
      { tier: AchievementTier.Platinum, target: 10000000, reward: { darkMatter: 1000, points: 10000 } },
      { tier: AchievementTier.Diamond, target: 100000000, reward: { darkMatter: 5000, points: 50000 } }
    ]
  },
  {
    id: 'colonizer',
    category: AchievementCategory.Mission,
    icon: 'Flag',
    statKey: 'colonizations',
    checkType: 'gte',
    tiers: [
      { tier: AchievementTier.Bronze, target: 1, reward: { darkMatter: 50, points: 500 } },
      { tier: AchievementTier.Silver, target: 3, reward: { darkMatter: 150, points: 1500 } },
      { tier: AchievementTier.Gold, target: 5, reward: { darkMatter: 500, points: 5000 } },
      { tier: AchievementTier.Platinum, target: 8, reward: { darkMatter: 1500, points: 15000 } },
      { tier: AchievementTier.Diamond, target: 12, reward: { darkMatter: 5000, points: 50000 } }
    ]
  },
  {
    id: 'spy',
    category: AchievementCategory.Mission,
    icon: 'Eye',
    statKey: 'spyMissions',
    checkType: 'gte',
    tiers: [
      { tier: AchievementTier.Bronze, target: 5, reward: { darkMatter: 10, points: 100 } },
      { tier: AchievementTier.Silver, target: 25, reward: { darkMatter: 50, points: 500 } },
      { tier: AchievementTier.Gold, target: 100, reward: { darkMatter: 200, points: 2000 } },
      { tier: AchievementTier.Platinum, target: 500, reward: { darkMatter: 1000, points: 10000 } },
      { tier: AchievementTier.Diamond, target: 2000, reward: { darkMatter: 5000, points: 50000 } }
    ]
  },
  {
    id: 'deployer',
    category: AchievementCategory.Mission,
    icon: 'ArrowDownToLine',
    statKey: 'deployments',
    checkType: 'gte',
    tiers: [
      { tier: AchievementTier.Bronze, target: 5, reward: { darkMatter: 10, points: 100 } },
      { tier: AchievementTier.Silver, target: 25, reward: { darkMatter: 50, points: 500 } },
      { tier: AchievementTier.Gold, target: 100, reward: { darkMatter: 200, points: 2000 } },
      { tier: AchievementTier.Platinum, target: 500, reward: { darkMatter: 1000, points: 10000 } },
      { tier: AchievementTier.Diamond, target: 2000, reward: { darkMatter: 5000, points: 50000 } }
    ]
  },
  {
    id: 'explorer',
    category: AchievementCategory.Mission,
    icon: 'Compass',
    statKey: 'expeditionsTotal',
    checkType: 'gte',
    tiers: [
      { tier: AchievementTier.Bronze, target: 5, reward: { darkMatter: 15, points: 150 } },
      { tier: AchievementTier.Silver, target: 25, reward: { darkMatter: 75, points: 750 } },
      { tier: AchievementTier.Gold, target: 100, reward: { darkMatter: 300, points: 3000 } },
      { tier: AchievementTier.Platinum, target: 500, reward: { darkMatter: 1500, points: 15000 } },
      { tier: AchievementTier.Diamond, target: 2000, reward: { darkMatter: 7500, points: 75000 } }
    ]
  },
  {
    id: 'luckyExplorer',
    category: AchievementCategory.Mission,
    icon: 'Sparkle',
    statKey: 'expeditionsSuccessful',
    checkType: 'gte',
    tiers: [
      { tier: AchievementTier.Bronze, target: 3, reward: { darkMatter: 20, points: 200 } },
      { tier: AchievementTier.Silver, target: 15, reward: { darkMatter: 100, points: 1000 } },
      { tier: AchievementTier.Gold, target: 50, reward: { darkMatter: 400, points: 4000 } },
      { tier: AchievementTier.Platinum, target: 200, reward: { darkMatter: 2000, points: 20000 } },
      { tier: AchievementTier.Diamond, target: 1000, reward: { darkMatter: 10000, points: 100000 } }
    ]
  },
  {
    id: 'recycler',
    category: AchievementCategory.Mission,
    icon: 'Recycle',
    statKey: 'recyclingMissions',
    checkType: 'gte',
    tiers: [
      { tier: AchievementTier.Bronze, target: 5, reward: { darkMatter: 10, points: 100 } },
      { tier: AchievementTier.Silver, target: 25, reward: { darkMatter: 50, points: 500 } },
      { tier: AchievementTier.Gold, target: 100, reward: { darkMatter: 200, points: 2000 } },
      { tier: AchievementTier.Platinum, target: 500, reward: { darkMatter: 1000, points: 10000 } },
      { tier: AchievementTier.Diamond, target: 2000, reward: { darkMatter: 5000, points: 50000 } }
    ]
  },
  {
    id: 'scavenger',
    category: AchievementCategory.Mission,
    icon: 'Pickaxe',
    statKey: 'recycledResources',
    checkType: 'gte',
    tiers: [
      { tier: AchievementTier.Bronze, target: 10000, reward: { darkMatter: 10, points: 100 } },
      { tier: AchievementTier.Silver, target: 100000, reward: { darkMatter: 50, points: 500 } },
      { tier: AchievementTier.Gold, target: 1000000, reward: { darkMatter: 200, points: 2000 } },
      { tier: AchievementTier.Platinum, target: 10000000, reward: { darkMatter: 1000, points: 10000 } },
      { tier: AchievementTier.Diamond, target: 100000000, reward: { darkMatter: 5000, points: 50000 } }
    ]
  },
  {
    id: 'destroyer',
    category: AchievementCategory.Mission,
    icon: 'Zap',
    statKey: 'planetDestructions',
    checkType: 'gte',
    tiers: [
      { tier: AchievementTier.Bronze, target: 1, reward: { darkMatter: 100, points: 1000 } },
      { tier: AchievementTier.Silver, target: 3, reward: { darkMatter: 500, points: 5000 } },
      { tier: AchievementTier.Gold, target: 10, reward: { darkMatter: 2000, points: 20000 } },
      { tier: AchievementTier.Platinum, target: 25, reward: { darkMatter: 10000, points: 100000 } },
      { tier: AchievementTier.Diamond, target: 50, reward: { darkMatter: 50000, points: 500000 } }
    ]
  },
  {
    id: 'fuelBurner',
    category: AchievementCategory.Mission,
    icon: 'Fuel',
    statKey: 'fuelConsumed',
    checkType: 'gte',
    tiers: [
      { tier: AchievementTier.Bronze, target: 1000, reward: { darkMatter: 10, points: 100 } },
      { tier: AchievementTier.Silver, target: 10000, reward: { darkMatter: 50, points: 500 } },
      { tier: AchievementTier.Gold, target: 100000, reward: { darkMatter: 200, points: 2000 } },
      { tier: AchievementTier.Platinum, target: 1000000, reward: { darkMatter: 1000, points: 10000 } },
      { tier: AchievementTier.Diamond, target: 10000000, reward: { darkMatter: 5000, points: 50000 } }
    ]
  },

  // ==================== 外交类成就 ====================
  {
    id: 'diplomat',
    category: AchievementCategory.Diplomacy,
    icon: 'HandshakeIcon',
    statKey: 'friendlyNPCCount',
    checkType: 'gte',
    tiers: [
      { tier: AchievementTier.Bronze, target: 1, reward: { darkMatter: 20, points: 200 } },
      { tier: AchievementTier.Silver, target: 3, reward: { darkMatter: 100, points: 1000 } },
      { tier: AchievementTier.Gold, target: 5, reward: { darkMatter: 400, points: 4000 } },
      { tier: AchievementTier.Platinum, target: 10, reward: { darkMatter: 2000, points: 20000 } },
      { tier: AchievementTier.Diamond, target: 20, reward: { darkMatter: 10000, points: 100000 } }
    ]
  },
  {
    id: 'nemesis',
    category: AchievementCategory.Diplomacy,
    icon: 'Angry',
    statKey: 'hostileNPCCount',
    checkType: 'gte',
    tiers: [
      { tier: AchievementTier.Bronze, target: 1, reward: { darkMatter: 15, points: 150 } },
      { tier: AchievementTier.Silver, target: 3, reward: { darkMatter: 75, points: 750 } },
      { tier: AchievementTier.Gold, target: 5, reward: { darkMatter: 300, points: 3000 } },
      { tier: AchievementTier.Platinum, target: 10, reward: { darkMatter: 1500, points: 15000 } },
      { tier: AchievementTier.Diamond, target: 20, reward: { darkMatter: 7500, points: 75000 } }
    ]
  },
  {
    id: 'generous',
    category: AchievementCategory.Diplomacy,
    icon: 'Gift',
    statKey: 'giftsSent',
    checkType: 'gte',
    tiers: [
      { tier: AchievementTier.Bronze, target: 3, reward: { darkMatter: 15, points: 150 } },
      { tier: AchievementTier.Silver, target: 10, reward: { darkMatter: 75, points: 750 } },
      { tier: AchievementTier.Gold, target: 30, reward: { darkMatter: 300, points: 3000 } },
      { tier: AchievementTier.Platinum, target: 100, reward: { darkMatter: 1500, points: 15000 } },
      { tier: AchievementTier.Diamond, target: 300, reward: { darkMatter: 7500, points: 75000 } }
    ]
  },
  {
    id: 'philanthropist',
    category: AchievementCategory.Diplomacy,
    icon: 'HeartHandshake',
    statKey: 'giftResourcesTotal',
    checkType: 'gte',
    tiers: [
      { tier: AchievementTier.Bronze, target: 10000, reward: { darkMatter: 15, points: 150 } },
      { tier: AchievementTier.Silver, target: 100000, reward: { darkMatter: 75, points: 750 } },
      { tier: AchievementTier.Gold, target: 1000000, reward: { darkMatter: 300, points: 3000 } },
      { tier: AchievementTier.Platinum, target: 10000000, reward: { darkMatter: 1500, points: 15000 } },
      { tier: AchievementTier.Diamond, target: 100000000, reward: { darkMatter: 7500, points: 75000 } }
    ]
  },
  {
    id: 'target',
    category: AchievementCategory.Diplomacy,
    icon: 'Target',
    statKey: 'attackedByNPC',
    checkType: 'gte',
    tiers: [
      { tier: AchievementTier.Bronze, target: 3, reward: { darkMatter: 10, points: 100 } },
      { tier: AchievementTier.Silver, target: 10, reward: { darkMatter: 50, points: 500 } },
      { tier: AchievementTier.Gold, target: 30, reward: { darkMatter: 200, points: 2000 } },
      { tier: AchievementTier.Platinum, target: 100, reward: { darkMatter: 1000, points: 10000 } },
      { tier: AchievementTier.Diamond, target: 300, reward: { darkMatter: 5000, points: 50000 } }
    ]
  },
  {
    id: 'watched',
    category: AchievementCategory.Diplomacy,
    icon: 'ScanEye',
    statKey: 'spiedByNPC',
    checkType: 'gte',
    tiers: [
      { tier: AchievementTier.Bronze, target: 5, reward: { darkMatter: 10, points: 100 } },
      { tier: AchievementTier.Silver, target: 20, reward: { darkMatter: 50, points: 500 } },
      { tier: AchievementTier.Gold, target: 50, reward: { darkMatter: 200, points: 2000 } },
      { tier: AchievementTier.Platinum, target: 150, reward: { darkMatter: 1000, points: 10000 } },
      { tier: AchievementTier.Diamond, target: 500, reward: { darkMatter: 5000, points: 50000 } }
    ]
  },
  {
    id: 'robbed',
    category: AchievementCategory.Diplomacy,
    icon: 'Banknote',
    statKey: 'debrisRecycledByNPC',
    checkType: 'gte',
    tiers: [
      { tier: AchievementTier.Bronze, target: 3, reward: { darkMatter: 10, points: 100 } },
      { tier: AchievementTier.Silver, target: 10, reward: { darkMatter: 50, points: 500 } },
      { tier: AchievementTier.Gold, target: 30, reward: { darkMatter: 200, points: 2000 } },
      { tier: AchievementTier.Platinum, target: 100, reward: { darkMatter: 1000, points: 10000 } },
      { tier: AchievementTier.Diamond, target: 300, reward: { darkMatter: 5000, points: 50000 } }
    ]
  },
  {
    id: 'lostToNPC',
    category: AchievementCategory.Diplomacy,
    icon: 'BadgeDollarSign',
    statKey: 'debrisResourcesLostToNPC',
    checkType: 'gte',
    tiers: [
      { tier: AchievementTier.Bronze, target: 10000, reward: { darkMatter: 10, points: 100 } },
      { tier: AchievementTier.Silver, target: 100000, reward: { darkMatter: 50, points: 500 } },
      { tier: AchievementTier.Gold, target: 1000000, reward: { darkMatter: 200, points: 2000 } },
      { tier: AchievementTier.Platinum, target: 10000000, reward: { darkMatter: 1000, points: 10000 } },
      { tier: AchievementTier.Diamond, target: 100000000, reward: { darkMatter: 5000, points: 50000 } }
    ]
  }
]

// 成就ID映射，方便快速查找
export const ACHIEVEMENT_MAP: Record<string, AchievementConfig> = Object.fromEntries(ACHIEVEMENTS.map(a => [a.id, a]))

// 按类别分组的成就
export const ACHIEVEMENTS_BY_CATEGORY: Record<AchievementCategory, AchievementConfig[]> = {
  [AchievementCategory.Resource]: ACHIEVEMENTS.filter(a => a.category === AchievementCategory.Resource),
  [AchievementCategory.Building]: ACHIEVEMENTS.filter(a => a.category === AchievementCategory.Building),
  [AchievementCategory.Combat]: ACHIEVEMENTS.filter(a => a.category === AchievementCategory.Combat),
  [AchievementCategory.Mission]: ACHIEVEMENTS.filter(a => a.category === AchievementCategory.Mission),
  [AchievementCategory.Diplomacy]: ACHIEVEMENTS.filter(a => a.category === AchievementCategory.Diplomacy)
}

// 等级顺序（用于比较）
export const TIER_ORDER: AchievementTier[] = [
  AchievementTier.Bronze,
  AchievementTier.Silver,
  AchievementTier.Gold,
  AchievementTier.Platinum,
  AchievementTier.Diamond
]

// 获取等级索引
export const getTierIndex = (tier: AchievementTier): number => {
  return TIER_ORDER.indexOf(tier)
}

// 获取下一个等级
export const getNextTier = (tier: AchievementTier | null): AchievementTier | null => {
  if (tier === null) return AchievementTier.Bronze
  const index = getTierIndex(tier)
  if (index >= TIER_ORDER.length - 1) return null
  return TIER_ORDER[index + 1] ?? null
}
