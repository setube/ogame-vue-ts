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

// 星球矿脉储量
export interface OreDeposits {
  metal: number // 金属矿脉剩余储量
  crystal: number // 晶体矿脉剩余储量
  deuterium: number // 重氢储量
  // 存储星球位置，用于动态计算初始储量上限
  // 这样修改配置后，所有星球的上限都会自动更新
  position: { galaxy: number; system: number; position: number }
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
  Hangar: 'hangar', // 机库
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
  PlanetDestroyerFactory: 'planetDestroyerFactory', // 行星毁灭者工厂
  GeoResearchStation: 'geoResearchStation', // 地质研究站（影响矿脉恢复速度）
  DeepDrillingFacility: 'deepDrillingFacility' // 深层钻探设施（提升矿脉上限）
} as const

export type BuildingType = (typeof BuildingType)[keyof typeof BuildingType]

// 建筑配置
export interface BuildingConfig {
  id: BuildingType
  name: string
  description: string
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
  PlanetDestructionTech: 'planetDestructionTech', // 行星毁灭技术
  MiningTechnology: 'miningTechnology' // 采矿技术（提升矿脉上限）
} as const

export type TechnologyType = (typeof TechnologyType)[keyof typeof TechnologyType]

// 科技配置
export interface TechnologyConfig {
  id: TechnologyType
  name: string
  description: string
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
  // 快速射击：对特定目标有额外攻击次数
  // 例如 { lightFighter: 6 } 表示对轻型战斗机有6倍快速射击
  rapidFire?: Partial<Record<ShipType | DefenseType, number>>
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
  MissileAttack: 'missileAttack', // 导弹攻击
  Station: 'station' // 驻守协防
} as const

export type MissionType = (typeof MissionType)[keyof typeof MissionType]

// 探险区域类型
export const ExpeditionZone = {
  NearSpace: 'nearSpace', // 近空区域 - 低风险低收益
  DeepSpace: 'deepSpace', // 深空区域 - 中等风险收益
  UnchartedSpace: 'unchartedSpace', // 未知空间 - 高风险高收益
  DangerousNebula: 'dangerousNebula' // 危险星云 - 极高风险极高收益
} as const

export type ExpeditionZone = (typeof ExpeditionZone)[keyof typeof ExpeditionZone]

// 探险区域配置
export interface ExpeditionZoneConfig {
  id: ExpeditionZone
  requiredTechLevel: number // 所需天体物理学等级
  flightTimeMultiplier: number // 飞行时间倍率
  resourceMultiplier: number // 资源奖励倍率
  darkMatterMultiplier: number // 暗物质奖励倍率
  fleetFindMultiplier: number // 舰船发现倍率
  dangerMultiplier: number // 危险程度倍率
  probabilities: {
    resources: number // 发现资源概率
    darkMatter: number // 发现暗物质概率
    fleet: number // 发现舰船概率
    pirates: number // 遭遇海盗概率
    aliens: number // 遭遇外星人概率
    nothing: number // 什么都没发现概率
  }
}

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
  AllyAttacked: 'allyAttacked', // 盟友被攻击
  DestroyPlanet: 'destroyPlanet', // 摧毁星球
  CampaignChoice: 'campaignChoice' // 战役对话选择
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
  reputationChange?: number // 好感度变化值（可选，ally_defend 事件没有）
  newReputation?: number // 新的好感度值（可选）
  oldStatus?: RelationStatus // 旧的关系状态（可选）
  newStatus?: RelationStatus // 新的关系状态（可选）
  message?: string // 消息内容（已弃用，保留用于兼容性）
  messageKey?: string // 翻译键（如 'diplomacy.reports.youDestroyedNpcPlanet'）
  messageParams?: Record<string, string | number> // 翻译参数（如 { npcName: 'NPC-1', planetName: '星球 1:1:8', reputation: -80 }）
  read?: boolean // 已读状态
  details?: {
    // 协防任务详情
    targetPlanetName?: string
    targetPosition?: Position
    fleetSize?: number
    arrivalTime?: number
    stationDuration?: number
  }
}

// 舰队预设
export interface FleetPreset {
  id: string
  name: string // 自定义预设名称
  fleet: Partial<Fleet> // 预设舰队数量
  targetPosition?: { galaxy: number; system: number; position: number } // 预设目标坐标
  missionType?: MissionType // 预设任务类型
  cargo?: Partial<Resources> // 预设运输资源
}

// 舰队任务
export interface FleetMission {
  id: string
  playerId: string // 玩家ID，如果是NPC任务则为NPC ID
  npcId?: string // NPC ID（如果是NPC发起的任务）
  isHostile?: boolean // 是否是敌对任务（用于警告显示）
  originPlanetId: string
  targetPosition: { galaxy: number; system: number; position: number }
  targetIsMoon?: boolean // 目标是否为月球（用于区分同坐标的行星和月球）
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
  // 探险系统字段
  expeditionZone?: ExpeditionZone // 探险区域类型
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
    // 通用：失败原因
    failReason?: string
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
    // 毁灭任务：概率和死星损失
    destructionChance?: number
    deathstarsLost?: boolean
    // 部署任务：部署的舰队
    deployedFleet?: Partial<Fleet>
    // 导弹攻击任务：导弹信息
    missileCount?: number
    missileHits?: number
    missileIntercepted?: number
    defenseLosses?: Partial<Record<DefenseType, number>>
    // 探险任务：发现的资源
    foundResources?: Partial<Resources>
    // 探险任务：发现的舰船
    foundFleet?: Partial<Fleet>
    // 探险任务：损失的舰船
    fleetLost?: Partial<Fleet>
    // 探险任务：探险区域
    expeditionZone?: ExpeditionZone
    // 侦查任务：报告ID
    spyReportId?: string
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

// NPC贸易提议
export interface TradeOffer {
  id: string
  npcId: string
  npcName: string
  timestamp: number
  offeredResources: {
    type: 'metal' | 'crystal' | 'deuterium'
    amount: number
  }
  requestedResources: {
    type: 'metal' | 'crystal' | 'deuterium'
    amount: number
  }
  expiresAt: number
  status: 'pending' | 'accepted' | 'declined' | 'expired'
  read?: boolean
}

// NPC情报类型
export type IntelType = 'enemyFleet' | 'enemyResources' | 'enemyMovement'

// NPC情报报告
export interface IntelReport {
  id: string
  fromNpcId: string
  fromNpcName: string
  timestamp: number
  targetNpcId: string
  targetNpcName: string
  intelType: IntelType
  data: {
    fleet?: Partial<Fleet>
    resources?: Partial<Resources>
    movement?: {
      targetPosition: { galaxy: number; system: number; position: number }
      arrivalTime: number
      missionType: string
    }
  }
  read: boolean
}

// NPC联合攻击邀请
export interface JointAttackInvite {
  id: string
  fromNpcId: string
  fromNpcName: string
  timestamp: number
  targetNpcId: string
  targetNpcName: string
  targetPlanetId: string
  targetPosition: { galaxy: number; system: number; position: number }
  npcFleetCommitment: Partial<Fleet>
  expectedLootRatio: number // 玩家预期分成比例 (0-1)
  expiresAt: number
  status: 'pending' | 'accepted' | 'declined' | 'expired'
  read?: boolean
}

// NPC资源援助通知
export interface AidNotification {
  id: string
  timestamp: number
  npcId: string
  npcName: string
  aidResources: Resources
  read?: boolean
}

// NPC报复等级
export interface RevengeLevel {
  attackCount: number
  fleetMultiplier: number
  attackInterval: number
  name: string
}

// NPC协防通知
export interface AllyDefenseNotification {
  id: string
  timestamp: number
  npcId: string
  npcName: string
  targetPlanetId: string
  targetPlanetName: string
  fleetSent: Partial<Fleet>
  read?: boolean
}

// NPC态度变化通知
export interface AttitudeChangeNotification {
  id: string
  timestamp: number
  npcId: string
  npcName: string
  previousStatus: 'hostile' | 'neutral' | 'friendly'
  newStatus: 'hostile' | 'neutral' | 'friendly'
  reason: string // 变化原因
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

// 等待队列项（尚未开始执行，不需要 startTime/endTime）
export interface WaitingQueueItem {
  id: string
  type: 'building' | 'technology' | 'ship' | 'defense' | 'demolish'
  itemType: BuildingType | TechnologyType | ShipType | DefenseType
  targetLevel?: number // 用于建筑和科技
  quantity?: number // 用于舰船和防御
  priority: number // 排序优先级（数字越小优先级越高）
  addedTime: number // 添加到等待队列的时间戳
  planetId?: string // 建造队列需要标识目标星球
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
  waitingBuildQueue: WaitingQueueItem[] // 等待队列（建筑、舰船、防御）
  lastUpdate: number
  maxSpace: number // 最大空间
  maxFleetStorage: number // 舰队仓储上限
  isMoon: boolean // 是否为月球
  parentPlanetId?: string // 如果是月球,指向母星的ID
  diameter?: number // 月球直径(km)，用于销毁概率计算
  jumpGateLastUsed?: number // 跳跃门上次使用时间戳(ms)，用于冷却计算
  oreDeposits?: OreDeposits // 矿脉储量（可选，用于向后兼容）
  temperature?: { min: number; max: number } // 星球温度范围（摄氏度），影响太阳能卫星和重氢产量
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
  // 动态加成（与 OfficerConfig.benefits 结构相同）
  bonuses?: {
    buildingSpeedBonus?: number
    researchSpeedBonus?: number
    resourceProductionBonus?: number
    darkMatterProductionBonus?: number
    energyProductionBonus?: number
    fleetSpeedBonus?: number
    fuelConsumptionReduction?: number
    defenseBonus?: number
    additionalBuildQueue?: number
    additionalFleetSlots?: number
    storageCapacityBonus?: number
  }
}

// 玩家
export interface Player {
  id: string
  name: string
  planets: Planet[]
  technologies: Record<TechnologyType, number>
  officers: Record<OfficerType, Officer>
  researchQueue: BuildQueueItem[]
  waitingResearchQueue: WaitingQueueItem[] // 研究等待队列
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
  // NPC增强行为通知
  tradeOffers?: TradeOffer[] // 中立NPC贸易提议
  intelReports?: IntelReport[] // 友好NPC情报报告
  jointAttackInvites?: JointAttackInvite[] // 友好NPC联合攻击邀请
  aidNotifications?: AidNotification[] // 友好NPC资源援助通知
  allyDefenseNotifications?: AllyDefenseNotification[] // 友好NPC协防通知
  attitudeChangeNotifications?: AttitudeChangeNotification[] // NPC态度变化通知
  points: number // 总积分（每1000资源=1分）
  isGMEnabled?: boolean // GM模式开关（默认false，通过秘籍激活）
  lastVersionCheckTime?: number // 最后一次自动检查版本的时间戳（被动检测）
  lastManualUpdateCheck?: number // 最后一次手动检查更新的时间戳（主动检测）
  // 外交系统字段（外交关系存储在 NPC.relations 中）
  diplomaticReports?: DiplomaticReport[] // 外交变化报告
  // 新手引导字段
  tutorialProgress?: TutorialProgress // 新手引导进度
  // 隐私协议同意状态
  privacyAgreed?: boolean // 是否已同意隐私协议
  // 弱引导系统
  dismissedHints?: string[] // 已关闭的提示ID列表
  hintsEnabled?: boolean // 是否启用弱引导提示（默认true）
  // 显示设置
  backgroundEnabled?: boolean // 是否启用背景动画（默认false）
  // 舰队预设
  fleetPresets?: FleetPreset[] // 舰队预设列表（最多3个）
  // 成就系统
  achievementStats?: AchievementStats // 成就统计数据
  achievements?: Record<string, AchievementProgress> // 成就进度
  // 战役系统
  campaignProgress?: PlayerCampaignProgress // 战役进度
  questNotifications?: QuestNotification[] // 任务通知
}

export interface NotificationSettings {
  browser: boolean
  inApp: boolean
  suppressInFocus: boolean // 当页面聚焦时是否浏览器通知
  types: {
    construction: boolean
    research: boolean
    [key: string]: boolean
  }
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

// NPC AI 类型
export const NPCAIType = {
  Aggressive: 'aggressive', // 侵略型 - 积极侦查和攻击玩家
  Defensive: 'defensive', // 防守型 - 只在被攻击时反击，优先发展防御
  Trader: 'trader', // 商人型 - 主动交易，几乎不攻击，高好感度时赠送资源
  Expansionist: 'expansionist', // 扩张型 - 优先发展和殖民，较少攻击
  Balanced: 'balanced' // 平衡型 - 根据情况动态调整策略
} as const

export type NPCAIType = (typeof NPCAIType)[keyof typeof NPCAIType]

// NPC玩家
export interface NPC {
  id: string
  name: string
  note?: string // 玩家添加的备注
  planets: Planet[]
  technologies: Record<TechnologyType, number>
  difficulty: 'easy' | 'medium' | 'hard' // 保留兼容，不再使用
  aiType?: NPCAIType // AI 行为类型
  // 距离难度系统
  difficultyLevel?: number // 基于距离的难度等级（1-无限）
  distanceToHomeworld?: number // 到玩家母星的距离
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

// 新手引导系统
export interface TutorialStep {
  id: string
  title: string // 标题
  content: string // 内容描述
  target?: string // 目标元素的选择器或ID
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'center' // 提示框位置
  route?: string // 需要跳转的路由
  action?: 'click' | 'build' | 'research' | 'none' // 需要完成的操作类型
  actionTarget?: string // 操作目标（建筑ID、科技ID等）
  completionCheck?: () => boolean // 完成条件检查函数（运行时注入）
  canSkip?: boolean // 是否可跳过此步骤
  highlightPadding?: number // 高亮区域的padding
}

export interface TutorialState {
  isActive: boolean // 引导是否激活
  currentStepIndex: number // 当前步骤索引
  completedSteps: string[] // 已完成的步骤ID列表
  skipped: boolean // 是否已跳过整个引导
  lastActiveTime?: number // 最后活跃时间
}

export interface TutorialProgress {
  tutorialCompleted: boolean // 是否完成了整个引导
  completedStepIds: string[] // 已完成的步骤ID
  currentStep: string | null // 当前步骤ID
  skippedAt?: number // 跳过的时间戳
}

// ==================== 成就系统类型 ====================

// 成就类别枚举
export const AchievementCategory = {
  Resource: 'resource',
  Building: 'building',
  Combat: 'combat',
  Mission: 'mission',
  Diplomacy: 'diplomacy'
} as const
export type AchievementCategory = (typeof AchievementCategory)[keyof typeof AchievementCategory]

// 成就等级枚举
export const AchievementTier = {
  Bronze: 'bronze',
  Silver: 'silver',
  Gold: 'gold',
  Platinum: 'platinum',
  Diamond: 'diamond'
} as const
export type AchievementTier = (typeof AchievementTier)[keyof typeof AchievementTier]

// 成就统计数据接口
export interface AchievementStats {
  // 资源统计
  totalMetalProduced: number
  totalCrystalProduced: number
  totalDeuteriumProduced: number
  totalDarkMatterProduced: number
  totalMetalConsumed: number
  totalCrystalConsumed: number
  totalDeuteriumConsumed: number
  totalDarkMatterConsumed: number

  // 建造统计
  buildingsUpgraded: number
  maxBuildingLevel: Record<BuildingType, number>
  researchCompleted: number
  maxTechnologyLevel: Record<TechnologyType, number>
  shipsProduced: Record<ShipType, number>
  totalShipsProduced: number
  defensesBuilt: Record<DefenseType, number>
  totalDefensesBuilt: number

  // 战斗统计
  attacksLaunched: number
  attacksWon: number
  attacksLost: number
  fleetLostInAttack: Record<ShipType, number>
  totalFleetLostInAttack: number
  debrisCreatedFromAttacks: number
  defensesSuccessful: number
  defensesFailed: number
  fleetLostInDefense: Record<ShipType, number>
  totalFleetLostInDefense: number
  defenseLostInDefense: Record<DefenseType, number>
  totalDefenseLostInDefense: number
  enemyFleetDestroyedInDefense: Record<ShipType, number>
  totalEnemyFleetDestroyedInDefense: number
  debrisCreatedFromDefenses: number

  // 任务统计
  totalFlightMissions: number
  transportMissions: number
  transportedResources: number
  colonizations: number
  spyMissions: number
  deployments: number
  expeditionsTotal: number
  expeditionsSuccessful: number
  recyclingMissions: number
  recycledResources: number
  planetDestructions: number
  fuelConsumed: number

  // 外交统计
  friendlyNPCCount: number
  hostileNPCCount: number
  giftsSent: number
  giftResourcesTotal: number
  attackedByNPC: number
  spiedByNPC: number
  debrisRecycledByNPC: number
  debrisResourcesLostToNPC: number
}

// 成就等级配置
export interface AchievementTierConfig {
  tier: AchievementTier
  target: number
  reward: AchievementReward
}

// 成就奖励
export interface AchievementReward {
  darkMatter?: number
  points?: number
}

// 成就配置接口
export interface AchievementConfig {
  id: string
  category: AchievementCategory
  icon: string
  tiers: AchievementTierConfig[]
  statKey: keyof AchievementStats | string
  checkType: 'gte' | 'eq' | 'sum' | 'max'
}

// 玩家成就进度
export interface AchievementProgress {
  id: string
  currentTier: AchievementTier | null
  currentValue: number
  unlockedAt?: number
  tierUnlocks: Record<AchievementTier, number | null>
}

// ==================== 排行榜系统类型 ====================

// 排行榜类别枚举
export const RankingCategory = {
  Total: 'total', // 总积分
  Building: 'building', // 建筑积分
  Research: 'research', // 研究积分
  Fleet: 'fleet', // 舰队积分
  Defense: 'defense' // 防御积分
} as const
export type RankingCategory = (typeof RankingCategory)[keyof typeof RankingCategory]

// 排行榜条目接口
export interface RankingEntry {
  id: string // 玩家或NPC ID
  name: string // 名称
  isPlayer: boolean // 是否为玩家（否则为NPC）
  scores: {
    total: number // 总积分
    building: number // 建筑积分
    research: number // 研究积分
    fleet: number // 舰队积分
    defense: number // 防御积分
  }
  planetCount: number // 星球数量
}

// ==================== 战役系统 ====================

// 任务状态
export const QuestStatus = {
  Locked: 'locked', // 未解锁
  Available: 'available', // 可接取
  Active: 'active', // 进行中
  Completed: 'completed', // 已完成
  Failed: 'failed' // 失败
} as const
export type QuestStatus = (typeof QuestStatus)[keyof typeof QuestStatus]

// 任务目标类型
export const ObjectiveType = {
  // 基础目标
  BuildBuilding: 'buildBuilding', // 建造建筑到某等级
  ResearchTech: 'researchTech', // 研究科技
  ProduceShips: 'produceShips', // 生产舰船
  AccumulateResources: 'accumulateResources', // 积累资源

  // 战斗目标
  DefeatNPC: 'defeatNPC', // 击败特定NPC
  WinBattles: 'winBattles', // 赢得N场战斗
  RecycleDebris: 'recycleDebris', // 回收残骸
  DestroyPlanet: 'destroyPlanet', // 摧毁星球

  // 外交目标
  ReachRelation: 'reachRelation', // 达到某关系等级
  SendGift: 'sendGift', // 送礼
  FormAlliance: 'formAlliance', // 结盟

  // 探索目标
  Colonize: 'colonize', // 殖民新星球
  Expedition: 'expedition', // 完成探险任务
  DiscoverLocation: 'discoverLocation', // 发现特定位置
  SpyTarget: 'spyTarget' // 侦查特定目标
} as const
export type ObjectiveType = (typeof ObjectiveType)[keyof typeof ObjectiveType]

// 任务目标
export interface QuestObjective {
  id: string
  type: ObjectiveType
  descriptionKey: string // 翻译键
  target: string | number // 目标值或ID (建筑类型/科技类型/舰船类型/NPC ID等)
  targetSecondary?: string | number // 次要目标 (如等级要求)
  required: number // 需要数量
}

// 任务奖励
export interface QuestReward {
  resources?: Partial<Resources>
  darkMatter?: number
  points?: number
  ships?: Partial<Fleet>
  unlockBuilding?: BuildingType
  unlockTech?: TechnologyType
  specialItem?: string // 特殊物品ID
}

// 剧情对话
export interface StoryDialogue {
  id: string
  speaker: 'narrator' | 'player' | 'npc' | 'mysterious'
  speakerNameKey?: string // 翻译键
  portrait?: string // 头像标识
  textKey: string // 翻译键
  choices?: DialogueChoice[]
}

// 对话选项
export interface DialogueChoice {
  textKey: string // 翻译键
  nextDialogueId?: string
  effect?: 'reputation_up' | 'reputation_down' | 'unlock_branch'
  npcId?: string // 影响的NPC ID（用于声望变化）
  value?: number // 效果数值（如声望变化量，默认为10）
  branchId?: string // 解锁的分支ID（用于unlock_branch效果）
}

// 战役任务配置
export interface CampaignQuestConfig {
  id: string
  chapter: number // 章节号
  order: number // 章节内顺序
  titleKey: string // 翻译键
  descriptionKey: string // 翻译键

  // 剧情
  prologueDialogues?: StoryDialogue[] // 任务开始对话
  epilogueDialogues?: StoryDialogue[] // 任务完成对话

  // 目标
  objectives: QuestObjective[]

  // 奖励
  rewards: QuestReward

  // 解锁条件
  requiredQuestIds?: string[] // 需要先完成的任务

  // 任务位置（用于地图显示）
  mapPosition: { x: number; y: number }

  // 特殊标记
  isBoss?: boolean // Boss战
  isBranch?: boolean // 分支任务
  branchGroup?: string // 分支组ID（同组只能完成一个）
}

// 战役章节配置
export interface CampaignChapterConfig {
  id: string
  number: number
  titleKey: string // 翻译键
  descriptionKey: string // 翻译键
  backgroundStoryKey: string // 翻译键
  quests: CampaignQuestConfig[]
}

// 战役配置
export interface CampaignConfig {
  id: string
  nameKey: string // 翻译键
  descriptionKey: string // 翻译键
  chapters: CampaignChapterConfig[]
}

// 玩家任务进度
export interface QuestProgress {
  questId: string
  status: QuestStatus
  objectives: Record<string, { current: number; completed: boolean }>
  startedAt?: number
  completedAt?: number
  rewardsClaimed?: boolean
  dialoguesRead?: string[] // 已读对话ID
}

// 玩家战役进度
export interface PlayerCampaignProgress {
  campaignId: string
  currentChapter: number
  currentQuestId?: string
  questProgress: Record<string, QuestProgress>
  completedQuests: string[]
  unlockedQuests: string[]
  branchChoices?: Record<string, string> // 分支选择记录
  unlockedBranches?: string[] // 已解锁的分支任务ID列表
}

// 任务通知
export interface QuestNotification {
  id: string
  timestamp: number
  questId: string
  questTitleKey: string // 翻译键
  eventType: 'unlocked' | 'objective_completed' | 'quest_completed' | 'chapter_completed' | 'reward_claimed'
  messageKey: string // 翻译键
  messageParams?: Record<string, string | number> // 翻译参数
  rewards?: QuestReward
  read?: boolean
}
