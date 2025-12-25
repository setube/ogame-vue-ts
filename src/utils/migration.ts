import type { Planet, DebrisField, NPC } from '@/types/game'
import { decryptData, encryptData } from './crypto'
import { generatePlanetTemperature } from '@/logic/planetLogic'
import pkg from '../../package.json'

/**
 * 数据迁移工具
 * 用于从旧版本数据结构迁移到新版本
 */

/**
 * 执行数据迁移
 * 将旧版本的 universePlanets 和 debrisFields 从 gameStore 迁移到 universeStore
 */
export const migrateGameData = (): void => {
  try {
    const storageKey = pkg.name
    const universeStorageKey = `${pkg.name}-universe`

    // 读取旧的加密存档
    const oldEncryptedData = localStorage.getItem(storageKey)
    if (!oldEncryptedData) return

    // 尝试解密（如果是加密格式）
    let oldData: any
    try {
      oldData = decryptData(oldEncryptedData)
    } catch {
      // 解密失败，可能是新格式（未加密），直接解析
      try {
        oldData = JSON.parse(oldEncryptedData)
      } catch {
        return // 无法解析，放弃迁移
      }
    }

    // 标记是否有数据需要保存
    let needsSave = false

    // 修复NPC数据（确保所有必需字段都存在）
    if (oldData.npcs && Array.isArray(oldData.npcs)) {
      const now = Date.now()
      const playerId = oldData.player?.id

      oldData.npcs.forEach((npc: NPC) => {
        // 确保NPC有必需的时间字段，并设置随机冷却避免同时行动
        if (npc.lastSpyTime === undefined || npc.lastSpyTime === 0) {
          // 0-4分钟的随机延迟
          const randomSpyOffset = Math.random() * 240 * 1000
          npc.lastSpyTime = now - randomSpyOffset
          needsSave = true
        }
        if (npc.lastAttackTime === undefined || npc.lastAttackTime === 0) {
          // 0-8分钟的随机延迟
          const randomAttackOffset = Math.random() * 480 * 1000
          npc.lastAttackTime = now - randomAttackOffset
          needsSave = true
        }
        // 确保NPC有必需的数组字段
        if (!npc.fleetMissions) {
          npc.fleetMissions = []
          needsSave = true
        }
        if (!npc.playerSpyReports) {
          npc.playerSpyReports = {}
          needsSave = true
        }
        if (!npc.relations) {
          npc.relations = {}
          needsSave = true
        }
        if (!npc.allies) {
          npc.allies = []
          needsSave = true
        }
        if (!npc.enemies) {
          npc.enemies = []
          needsSave = true
        }

        // 如果NPC与玩家没有建立关系，自动建立中立关系
        if (playerId && !npc.relations[playerId]) {
          npc.relations[playerId] = {
            fromId: npc.id,
            toId: playerId,
            reputation: 0,
            status: 'neutral' as const,
            lastUpdated: now,
            history: []
          }
          needsSave = true
        }
      })
    }

    // 初始化玩家积分（如果不存在）
    if (oldData.player && oldData.player.points === undefined) {
      // 积分会在游戏启动时通过 initGame 计算，这里设置为0
      oldData.player.points = 0
      needsSave = true
    }

    // 迁移温度数据：为没有温度的星球生成温度
    // 玩家星球
    if (oldData.player?.planets && Array.isArray(oldData.player.planets)) {
      oldData.player.planets.forEach((planet: Planet) => {
        // 月球不需要温度
        if (!planet.isMoon && !planet.temperature) {
          planet.temperature = generatePlanetTemperature(planet.position.position)
          needsSave = true
        }
        // 迁移矿脉数据：确保所有矿脉都有 position 字段
        if (planet.oreDeposits && !planet.isMoon) {
          const deposits = planet.oreDeposits as any
          // 情况1：旧格式有 initialMetal，需要删除并添加 position
          if (deposits.initialMetal !== undefined) {
            delete deposits.initialMetal
            delete deposits.initialCrystal
            delete deposits.initialDeuterium
            needsSave = true
          }
          // 情况2：没有 position 字段，需要添加
          if (!deposits.position) {
            deposits.position = { ...planet.position }
            needsSave = true
          }
        }
      })
    }

    // NPC星球
    if (oldData.npcs && Array.isArray(oldData.npcs)) {
      oldData.npcs.forEach((npc: NPC) => {
        if (npc.planets && Array.isArray(npc.planets)) {
          npc.planets.forEach((planet: Planet) => {
            // 月球不需要温度
            if (!planet.isMoon && !planet.temperature) {
              planet.temperature = generatePlanetTemperature(planet.position.position)
              needsSave = true
            }
            // 迁移矿脉数据：确保所有矿脉都有 position 字段
            if (planet.oreDeposits && !planet.isMoon) {
              const deposits = planet.oreDeposits as any
              // 情况1：旧格式有 initialMetal，需要删除
              if (deposits.initialMetal !== undefined) {
                delete deposits.initialMetal
                delete deposits.initialCrystal
                delete deposits.initialDeuterium
                needsSave = true
              }
              // 情况2：没有 position 字段，需要添加
              if (!deposits.position) {
                deposits.position = { ...planet.position }
                needsSave = true
              }
            }
          })
        }
      })
    }

    // 迁移 player.diplomaticRelations 到 npc.relations
    // 旧版本使用 player.diplomaticRelations[npcId] 存储玩家对NPC的关系
    // 新版本统一使用 npc.relations[playerId] 存储NPC对玩家的关系
    if (oldData.player?.diplomaticRelations && oldData.npcs && Array.isArray(oldData.npcs)) {
      const playerId = oldData.player.id
      const playerRelations = oldData.player.diplomaticRelations as Record<string, any>

      Object.entries(playerRelations).forEach(([npcId, relation]) => {
        const npc = oldData.npcs.find((n: NPC) => n.id === npcId)
        if (npc) {
          if (!npc.relations) {
            npc.relations = {}
          }
          // 如果NPC对玩家的关系不存在，使用玩家对NPC的关系数据
          if (!npc.relations[playerId]) {
            npc.relations[playerId] = {
              ...relation,
              fromId: npcId,
              toId: playerId
            }
            needsSave = true
          } else {
            // 如果两边都有数据，使用声望值更极端的那个（偏离0更远的）
            const existingReputation = npc.relations[playerId].reputation || 0
            const playerReputation = relation.reputation || 0
            if (Math.abs(playerReputation) > Math.abs(existingReputation)) {
              npc.relations[playerId].reputation = playerReputation
              npc.relations[playerId].status = relation.status
              needsSave = true
            }
          }
        }
      })

      // 删除旧的 diplomaticRelations 字段
      delete oldData.player.diplomaticRelations
      needsSave = true
    }

    // 检查是否需要迁移地图数据
    const hasOldMapData = oldData.universePlanets || oldData.debrisFields

    if (hasOldMapData) {
      // 准备 universeStore 数据
      const universeData: {
        planets: Record<string, Planet>
        debrisFields: Record<string, DebrisField>
      } = {
        planets: {},
        debrisFields: {}
      }

      // 迁移星球数据（排除玩家星球）
      if (oldData.universePlanets) {
        const oldPlanets = oldData.universePlanets as Record<string, Planet>
        const playerPlanets = oldData.player?.planets || []
        const playerPlanetIds = new Set(playerPlanets.map((p: Planet) => p.id))
        Object.entries(oldPlanets).forEach(([key, planet]) => {
          // 只迁移非玩家星球
          if (!playerPlanetIds.has(planet.id)) {
            // 为没有温度的星球生成温度
            if (!planet.isMoon && !planet.temperature) {
              planet.temperature = generatePlanetTemperature(planet.position.position)
            }
            universeData.planets[key] = planet
          }
        })
        delete oldData.universePlanets
        needsSave = true
      }

      // 迁移残骸场数据
      if (oldData.debrisFields) {
        universeData.debrisFields = oldData.debrisFields
        delete oldData.debrisFields
        needsSave = true
      }

      // 保存universeStore数据
      localStorage.setItem(universeStorageKey, encryptData(universeData))
    }

    // 检查并更新已存在的 universeStore 数据中的星球温度
    const existingUniverseData = localStorage.getItem(universeStorageKey)
    if (existingUniverseData) {
      try {
        let universeData: { planets: Record<string, Planet>; debrisFields: Record<string, DebrisField> }
        try {
          universeData = decryptData(existingUniverseData)
        } catch {
          universeData = JSON.parse(existingUniverseData)
        }

        let universePlanetMigrated = false
        if (universeData.planets) {
          Object.values(universeData.planets).forEach((planet: Planet) => {
            if (!planet.isMoon && !planet.temperature) {
              planet.temperature = generatePlanetTemperature(planet.position.position)
              universePlanetMigrated = true
            }
          })
        }

        if (universePlanetMigrated) {
          localStorage.setItem(universeStorageKey, encryptData(universeData))
        }
      } catch (error) {
        console.error('[Migration] Failed to migrate universe planets temperature:', error)
      }
    }

    // 如果有任何数据被修改，保存gameStore数据
    if (needsSave) {
      localStorage.setItem(storageKey, encryptData(oldData))
    }
  } catch (error) {
    console.error('[Migration] Failed to migrate game data:', error)
  }
}
