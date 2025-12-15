// 位置类型
export interface Position {
  galaxy: number
  system: number
  position: number
}

// 资源类型
export interface Resources {
  metal: number
  crystal: number
  deuterium: number
  darkMatter: number // 暗物质
  energy: number // 电量（实时计算，不存储）
}

// 建筑类型
export const BuildingType = {
  MetalMine: 'metalMine',
  CrystalMine: 'crystalMine',
  DeuteriumSynthesizer: 'deuteriumSynthesizer',
  SolarPlant: 'solarPlant',
  FusionReactor: 'fusionReactor', // 核聚变反应堆
  RoboticsFactory: 'roboticsFactory',
  NaniteFactory: 'naniteFactory', // 纳米工厂
  Shipyard: 'shipyard',
  ResearchLab: 'researchLab',
  MetalStorage: 'metalStorage',
  CrystalStorage: 'crystalStorage',
  DeuteriumTank: 'deuteriumTank',
  DarkMatterCollector: 'darkMatterCollector', // 暗物质收集器
  DarkMatterTank: 'darkMatterTank', // 暗物质储罐
  MissileSilo: 'missileSilo', // 导弹发射井
  Terraformer: 'terraformer', // 地形改造器
  // 月球专属建筑
  LunarBase: 'lunarBase', // 月球基地
  SensorPhalanx: 'sensorPhalanx', // 传感器阵列
  JumpGate: 'jumpGate', // 跳跃门
  // 特殊建筑
  PlanetDestroyerFactory: 'planetDestroyerFactory' // 行星毁灭者工厂
} as const

export type BuildingType = (typeof BuildingType)[keyof typeof BuildingType]

// 建筑配置
export interface BuildingConfig {
  id: BuildingType
  name: string
  description: string
  image: string
  baseCost: Resources
  baseTime: number // 基础建造时间(秒)
  costMultiplier: number // 升级成本倍数
  spaceUsage: number // 占用空间
  fleetStorageBonus?: number // 每级增加的舰队仓储（可选）
  planetOnly?: boolean // 仅行星可建造
  moonOnly?: boolean // 仅月球可建造
  maxLevel?: number // 最大等级（可选，不设置则无上限）
  requirements?: Partial<Record<BuildingType | TechnologyType, number>> // 前置条件（初始解锁）
  levelRequirements?: Record<number, Partial<Record<BuildingType | TechnologyType, number>>> // 等级升级条件
}

// 建筑实例
export interface Building {
  type: BuildingType
  level: number
}

// 研究科技类型
export const TechnologyType = {
  EnergyTechnology: 'energyTechnology',
  LaserTechnology: 'laserTechnology',
  IonTechnology: 'ionTechnology',
  HyperspaceTechnology: 'hyperspaceTechnology',
  PlasmaTechnology: 'plasmaTechnology',
  ComputerTechnology: 'computerTechnology', // 计算机技术
  EspionageTechnology: 'espionageTechnology', // 间谍技术
  CombustionDrive: 'combustionDrive',
  ImpulseDrive: 'impulseDrive',
  HyperspaceDrive: 'hyperspaceDrive',
  WeaponsTechnology: 'weaponsTechnology', // 武器技术
  ShieldingTechnology: 'shieldingTechnology', // 护盾技术
  ArmourTechnology: 'armourTechnology', // 装甲技术
  Astrophysics: 'astrophysics', // 天体物理学
  GravitonTechnology: 'gravitonTechnology', // 引力技术
  DarkMatterTechnology: 'darkMatterTechnology', // 暗物质技术
  TerraformingTechnology: 'terraformingTechnology', // 地形改造技术
  PlanetDestructionTech: 'planetDestructionTech' // 行星毁灭技术
} as const

export type TechnologyType = (typeof TechnologyType)[keyof typeof TechnologyType]

// 科技配置
export interface TechnologyConfig {
  id: TechnologyType
  name: string
  description: string
  image: string
  baseCost: Resources
  baseTime: number
  costMultiplier: number
  fleetStorageBonus?: number // 每级增加的舰队仓储（全局，可选）
  maxLevel?: number // 最大等级（可选，不设置则无上限）
  requirements?: Partial<Record<BuildingType | TechnologyType, number>> // 前置条件（初始解锁）
  levelRequirements?: Record<number, Partial<Record<BuildingType | TechnologyType, number>>> // 等级升级条件
}

// 科技实例
export interface Technology {
  type: TechnologyType
  level: number
}

// 防御设施类型
export const DefenseType = {
  RocketLauncher: 'rocketLauncher',
  LightLaser: 'lightLaser',
  HeavyLaser: 'heavyLaser',
  GaussCannon: 'gaussCannon',
  IonCannon: 'ionCannon',
  PlasmaTurret: 'plasmaTurret',
  SmallShieldDome: 'smallShieldDome',
  LargeShieldDome: 'largeShieldDome',
  AntiBallisticMissile: 'antiBallisticMissile', // 反弹道导弹
  InterplanetaryMissile: 'interplanetaryMissile', // 星际导弹
  PlanetaryShield: 'planetaryShield' // 行星护盾
} as const

export type DefenseType = (typeof DefenseType)[keyof typeof DefenseType]

// 防御设施配置
export interface DefenseConfig {
  id: DefenseType
  name: string
  description: string
  image: string
  cost: Resources
  buildTime: number
  attack: number
  shield: number
  armor: number
  requirements?: Partial<Record<BuildingType | TechnologyType, number>>
}

// 舰船类型
export const ShipType = {
  LightFighter: 'lightFighter',
  HeavyFighter: 'heavyFighter',
  Cruiser: 'cruiser',
  Battleship: 'battleship',
  Battlecruiser: 'battlecruiser', // 战列巡洋舰
  Bomber: 'bomber', // 轰炸机
  Destroyer: 'destroyer', // 驱逐舰
  SmallCargo: 'smallCargo',
  LargeCargo: 'largeCargo',
  ColonyShip: 'colonyShip',
  Recycler: 'recycler',
  EspionageProbe: 'espionageProbe',
  SolarSatellite: 'solarSatellite', // 太阳能卫星
  DarkMatterHarvester: 'darkMatterHarvester', // 暗物质采集船
  Deathstar: 'deathstar' // 死星
} as const

export type ShipType = (typeof ShipType)[keyof typeof ShipType]

// 舰船配置
export interface ShipConfig {
  id: ShipType
  name: string
  description: string
  image: string
  cost: Resources
  buildTime: number
  cargoCapacity: number
  attack: number
  shield: number
  armor: number
  speed: number
  fuelConsumption: number
  storageUsage: number // 占用舰队仓储
  requirements?: Partial<Record<BuildingType | TechnologyType, number>>
}

// 舰船实例
export interface Fleet {
  [ShipType.LightFighter]: number
  [ShipType.HeavyFighter]: number
  [ShipType.Cruiser]: number
  [ShipType.Battleship]: number
  [ShipType.Battlecruiser]: number
  [ShipType.Bomber]: number
  [ShipType.Destroyer]: number
  [ShipType.SmallCargo]: number
  [ShipType.LargeCargo]: number
  [ShipType.ColonyShip]: number
  [ShipType.Recycler]: number
  [ShipType.EspionageProbe]: number
  [ShipType.SolarSatellite]: number
  [ShipType.DarkMatterHarvester]: number
  [ShipType.Deathstar]: number
}

// 舰队任务类型
export const MissionType = {
  Attack: 'attack',
  Transport: 'transport',
  Colonize: 'colonize',
  Spy: 'spy',
  Deploy: 'deploy',
  Expedition: 'expedition',
  HarvestDarkMatter: 'harvestDarkMatter', // 暗物质采集
  Recycle: 'recycle', // 回收残骸
  Destroy: 'destroy', // 行星毁灭
  MissileAttack: 'missileAttack' // 导弹攻击
} as const

export type MissionType = (typeof MissionType)[keyof typeof MissionType]

// 外交关系状态
export const RelationStatus = {
  Hostile: 'hostile', // 敌对
  Neutral: 'neutral', // 中立
  Friendly: 'friendly' // 友好
} as const

export type RelationStatus = (typeof RelationStatus)[keyof typeof RelationStatus]

// 外交事件类型
export const DiplomaticEventType = {
  GiftResources: 'giftResources', // 赠送资源
  Attack: 'attack', // 攻击
  Spy: 'spy', // 侦查
  StealDebris: 'stealDebris', // 抢夺残骸
  AllyAttacked: 'allyAttacked' // 盟友被攻击
} as const

export type DiplomaticEventType = (typeof DiplomaticEventType)[keyof typeof DiplomaticEventType]

// 外交关系
export interface DiplomaticRelation {
  fromId: string // 关系发起方（玩家或NPC ID）
  toId: string // 关系接收方（玩家或NPC ID）
  reputation: number // 好感度值 (-100 到 +100)
  status: RelationStatus // 关系状态
  lastUpdated: number // 最后更新时间戳
  history?: Array<{
    // 关系变化历史
    timestamp: number
    change: number
    reason: DiplomaticEventType
    details?: string
  }>
}

// 外交报告（显示好感度变化通知）
export interface DiplomaticReport {
  id: string
  timestamp: number
  npcId: string // NPC ID
  npcName: string // NPC名称
  eventType: DiplomaticEventType // 事件类型
  reputationChange: number // 好感度变化值
  newReputation: number // 新的好感度值
  oldStatus: RelationStatus // 旧的关系状态
  newStatus: RelationStatus // 新的关系状态
  message: string // 消息内容
  read?: boolean // 已读状态
}

// 舰队任务
export interface FleetMission {
  id: string
  playerId: string // 玩家ID，如果是NPC任务则为NPC ID
  npcId?: string // NPC ID（如果是NPC发起的任务）
  isHostile?: boolean // 是否是敌对任务（用于警告显示）
  originPlanetId: string
  targetPosition: { galaxy: number; system: number; position: number }
  targetPlanetId?: string
  debrisFieldId?: string // 残骸场ID（用于回收任务）
  missionType: MissionType
  fleet: Partial<Fleet>
  cargo: Resources
  departureTime: number
  arrivalTime: number
  returnTime?: number
  status: 'outbound' | 'returning' | 'arrived'
  // 外交系统字段
  isGift?: boolean // 是否为赠送资源任务
  giftTargetNpcId?: string // 赠送目标NPC ID
}

// 导弹攻击任务（不使用舰队系统）
export interface MissileAttack {
  id: string
  playerId: string
  originPlanetId: string
  targetPosition: { galaxy: number; system: number; position: number }
  targetPlanetId?: string
  missileCount: number // 发射的星际导弹数量
  launchTime: number
  arrivalTime: number
  status: 'flying' | 'arrived' | 'intercepted'
}

// 战斗结果
export interface BattleResult {
  id: string
  timestamp: number
  attackerId: string
  defenderId: string
  attackerPlanetId: string
  defenderPlanetId: string
  attackerFleet: Partial<Fleet>
  defenderFleet: Partial<Fleet>
  defenderDefense: Partial<Record<DefenseType, number>>
  attackerLosses: Partial<Fleet>
  defenderLosses: {
    fleet: Partial<Fleet>
    defense: Partial<Record<DefenseType, number>>
  }
  winner: 'attacker' | 'defender' | 'draw'
  read?: boolean // 已读状态
  plunder: Resources
  debrisField: Resources
  // 新增详细信息
  rounds?: number
  attackerRemaining?: Partial<Fleet>
  defenderRemaining?: {
    fleet: Partial<Fleet>
    defense: Partial<Record<DefenseType, number>>
  }
  roundDetails?: Array<{
    round: number
    attackerLosses: Partial<Fleet>
    defenderLosses: {
      fleet: Partial<Fleet>
      defense: Partial<Record<DefenseType, number>>
    }
    attackerRemainingPower: number
    defenderRemainingPower: number
  }>
  moonChance?: number // 月球生成概率
}

// 间谍报告
export interface SpyReport {
  id: string
  timestamp: number
  spyId: string
  targetPlanetId: string
  targetPlanetName: string // 目标星球名称
  targetPosition: Position // 目标星球坐标
  targetPlayerId: string
  resources: Resources
  fleet?: Partial<Fleet>
  defense?: Partial<Record<DefenseType, number>>
  buildings?: Partial<Record<BuildingType, number>>
  technologies?: Partial<Record<TechnologyType, number>>
  detectionChance: number
  read?: boolean // 已读状态
}

// 被侦查通知（玩家被NPC侦查时收到）
export interface SpiedNotification {
  id: string
  timestamp: number
  npcId: string // 侦查者NPC ID
  npcName: string // 侦查者NPC名称
  targetPlanetId: string // 被侦查的星球ID
  targetPlanetName: string // 被侦查的星球名称
  detectionSuccess: boolean // 是否被发现
  read?: boolean
}

// NPC活动通知（回收残骸等）
export interface NPCActivityNotification {
  id: string
  timestamp: number
  npcId: string // NPC ID
  npcName: string // NPC名称
  activityType: 'recycle' // 活动类型
  targetPosition: Position // 目标位置
  targetPlanetId?: string // 目标星球ID（如果在玩家星球位置）
  targetPlanetName?: string // 目标星球名称
  arrivalTime: number // 到达时间
  read?: boolean
}

// 即将到来的敌对舰队警告
export interface IncomingFleetAlert {
  id: string // 对应的FleetMission ID
  npcId: string // NPC ID
  npcName: string // NPC名称
  missionType: MissionType // 任务类型（spy/attack）
  targetPlanetId: string // 目标星球ID
  targetPlanetName: string // 目标星球名称
  arrivalTime: number // 到达时间
  fleetSize: number // 舰队总数（用于显示规模）
  read?: boolean
}

// 任务报告（运输、殖民、回收、部署、毁灭等任务的结果通知）
export interface MissionReport {
  id: string
  timestamp: number
  missionType: MissionType
  originPlanetId: string
  originPlanetName: string
  targetPosition: { galaxy: number; system: number; position: number }
  targetPlanetId?: string
  targetPlanetName?: string
  success: boolean // 任务是否成功
  message: string // 任务结果描述
  // 任务特定的详细信息
  details?: {
    // 运输任务：运输的资源
    transportedResources?: Resources
    // 殖民任务：新星球信息
    newPlanetId?: string
    newPlanetName?: string
    // 回收任务：回收的资源
    recycledResources?: Pick<Resources, 'metal' | 'crystal'>
    remainingDebris?: Pick<Resources, 'metal' | 'crystal'>
    // 毁灭任务：摧毁的星球
    destroyedPlanetName?: string
    // 部署任务：部署的舰队
    deployedFleet?: Partial<Fleet>
    // 导弹攻击任务：导弹信息
    missileCount?: number
    missileHits?: number
    missileIntercepted?: number
    defenseLosses?: Partial<Record<DefenseType, number>>
  }
  read?: boolean
}

// 礼物通知（NPC赠送礼物，等待玩家接受或拒绝）
export interface GiftNotification {
  id: string
  timestamp: number
  fromNpcId: string // 赠送方NPC ID
  fromNpcName: string // 赠送方NPC名称
  resources: Resources // 赠送的资源
  currentReputation: number // 当前好感度
  expectedReputationGain: number // 预期好感度增加
  expiresAt: number // 过期时间（7天后自动拒绝）
  read?: boolean
}

// 礼物被拒绝通知（玩家赠送礼物被NPC拒绝）
export interface GiftRejectedNotification {
  id: string
  timestamp: number
  npcId: string // NPC ID
  npcName: string // NPC名称
  rejectedResources: Resources // 被拒绝的资源
  currentReputation: number // 当前好感度
  reason: string // 拒绝原因
  read?: boolean
}

// 残骸场
export interface DebrisField {
  id: string
  position: { galaxy: number; system: number; position: number }
  resources: Pick<Resources, 'metal' | 'crystal'> // 残骸场只包含金属和晶体
  createdAt: number
  expiresAt?: number // 可选的过期时间
}

// 建造队列项
export interface BuildQueueItem {
  id: string
  type: 'building' | 'technology' | 'ship' | 'defense' | 'demolish'
  itemType: BuildingType | TechnologyType | ShipType | DefenseType
  targetLevel?: number // 用于建筑和科技
  quantity?: number // 用于舰船和防御
  startTime: number
  endTime: number
}

// 星球
export interface Planet {
  id: string
  name: string
  ownerId?: string
  position: { galaxy: number; system: number; position: number }
  resources: Resources
  buildings: Record<BuildingType, number>
  fleet: Fleet
  defense: Record<DefenseType, number>
  buildQueue: BuildQueueItem[]
  lastUpdate: number
  maxSpace: number // 最大空间
  maxFleetStorage: number // 舰队仓储上限
  isMoon: boolean // 是否为月球
  parentPlanetId?: string // 如果是月球,指向母星的ID
}

// 月球特殊配置
export interface MoonConfig {
  minDebrisField: number // 生成月球所需的最小残骸场
  baseChance: number // 基础生成概率
  maxChance: number // 最大生成概率
  chancePerDebris: number // 每单位残骸增加的概率
}

// 军官类型
export const OfficerType = {
  Commander: 'commander', // 指挥官 - 增加建筑队列
  Admiral: 'admiral', // 上将 - 增加舰队槽位
  Engineer: 'engineer', // 工程师 - 增加防御和能量
  Geologist: 'geologist', // 地质学家 - 增加资源产量
  Technocrat: 'technocrat', // 技术专家 - 减少研究时间
  DarkMatterSpecialist: 'darkMatterSpecialist' // 暗物质专家 - 增加暗物质产量
} as const

export type OfficerType = (typeof OfficerType)[keyof typeof OfficerType]

// 军官配置
export interface OfficerConfig {
  id: OfficerType
  name: string
  description: string
  cost: Resources // 招募成本
  weeklyMaintenance: Resources // 每周维护费用
  benefits: {
    buildingSpeedBonus?: number // 建筑速度加成 (百分比)
    researchSpeedBonus?: number // 研究速度加成 (百分比)
    resourceProductionBonus?: number // 资源产量加成 (百分比)
    darkMatterProductionBonus?: number // 暗物质产量加成 (百分比)
    energyProductionBonus?: number // 电量产出加成 (百分比)
    fleetSpeedBonus?: number // 舰队速度加成 (百分比)
    fuelConsumptionReduction?: number // 燃料消耗减少 (百分比)
    defenseBonus?: number // 防御加成 (百分比)
    additionalBuildQueue?: number // 额外建筑队列
    additionalFleetSlots?: number // 额外舰队槽位
    storageCapacityBonus?: number // 仓储容量加成 (百分比)
  }
}

// 军官实例
export interface Officer {
  type: OfficerType
  active: boolean
  hiredAt?: number // 招募时间
  expiresAt?: number // 到期时间
}

// 玩家
export interface Player {
  id: string
  name: string
  planets: Planet[]
  technologies: Record<TechnologyType, number>
  officers: Record<OfficerType, Officer>
  researchQueue: BuildQueueItem[]
  fleetMissions: FleetMission[]
  missileAttacks: MissileAttack[] // 导弹攻击任务
  battleReports: BattleResult[]
  spyReports: SpyReport[]
  spiedNotifications: SpiedNotification[] // 被侦查通知
  npcActivityNotifications: NPCActivityNotification[] // NPC活动通知（回收残骸等）
  missionReports: MissionReport[] // 任务报告（运输、殖民、回收等）
  incomingFleetAlerts: IncomingFleetAlert[] // 即将到来的敌对舰队警告
  giftNotifications: GiftNotification[] // 礼物通知（等待接受/拒绝）
  giftRejectedNotifications: GiftRejectedNotification[] // 礼物被拒绝通知
  points: number // 总积分（每1000资源=1分）
  isGMEnabled?: boolean // GM模式开关（默认false，通过秘籍激活）
  lastVersionCheckTime?: number // 最后一次自动检查版本的时间戳（被动检测）
  lastManualUpdateCheck?: number // 最后一次手动检查更新的时间戳（主动检测）
  // 外交系统字段
  diplomaticRelations?: Record<string, DiplomaticRelation> // 玩家对NPC的关系（key: npcId）
  diplomaticReports?: DiplomaticReport[] // 外交变化报告
}

// 游戏状态
export interface GameState {
  player: Player
  currentPlanetId: string
  gameTime: number
  isPaused: boolean
  universe: Universe
}

// 宇宙
export interface Universe {
  galaxies: number
  systems: number
  positions: number
  planets: Map<string, Planet> // key: "galaxy:system:position"
  npcs: NPC[]
}

// NPC玩家
export interface NPC {
  id: string
  name: string
  planets: Planet[]
  technologies: Record<TechnologyType, number>
  difficulty: 'easy' | 'medium' | 'hard'
  // 行为跟踪字段
  lastSpyTime?: number // 上次侦查玩家的时间
  lastAttackTime?: number // 上次攻击玩家的时间
  playerSpyReports?: Record<string, SpyReport> // 对玩家星球的侦查报告（key: planetId）
  fleetMissions?: FleetMission[] // NPC的舰队任务
  // 被攻击追踪
  attackedBy?: Record<
    string,
    {
      count: number // 被攻击次数
      lastAttackTime: number // 最后被攻击时间
      planetId?: string // 攻击者星球ID
    }
  >
  alertUntil?: number // 警戒状态持续到的时间戳
  revengeTarget?: string // 复仇目标玩家ID
  // 外交系统字段
  relations?: Record<string, DiplomaticRelation> // NPC对其他实体的关系（key: targetId）
  allies?: string[] // 盟友列表（NPC ID）
  enemies?: string[] // 敌人列表（NPC ID）
}
