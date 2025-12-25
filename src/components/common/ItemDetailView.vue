<template>
  <div class="space-y-4">
    <!-- 建筑/科技：等级范围表格 -->
    <div v-if="type === 'building' || type === 'technology'" class="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead class="w-20 text-center">{{ t(`${typeKey}.levelRange`) }}</TableHead>
            <TableHead class="text-center">{{ t('resources.metal') }}</TableHead>
            <TableHead class="text-center">{{ t('resources.crystal') }}</TableHead>
            <TableHead class="text-center">{{ t('resources.deuterium') }}</TableHead>
            <TableHead v-if="showDarkMatterColumn" class="text-center">{{ t('resources.darkMatter') }}</TableHead>
            <TableHead class="text-center">{{ type === 'building' ? t('buildings.buildTime') : t('research.researchTime') }}</TableHead>
            <!-- 建筑相关列 -->
            <TableHead v-if="type === 'building' && showProductionColumn" class="text-center">{{ t('buildings.production') }}</TableHead>
            <TableHead v-if="type === 'building' && showConsumptionColumn" class="text-center">{{ t('buildings.consumption') }}</TableHead>
            <TableHead v-if="type === 'building' && showCapacityColumn" class="text-center">{{ t('buildings.storageCapacity') }}</TableHead>
            <TableHead v-if="type === 'building' && showFleetStorageColumn" class="text-center">
              {{ t('buildings.fleetStorage') }}
            </TableHead>
            <TableHead v-if="type === 'building' && showBuildQueueColumn" class="text-center">
              {{ t('buildings.buildQueueBonus') }}
            </TableHead>
            <TableHead v-if="type === 'building' && showSpaceColumn" class="text-center">{{ t('buildings.spaceBonus') }}</TableHead>
            <TableHead v-if="type === 'building' && showMissileColumn" class="text-center">{{ t('buildings.missileCapacity') }}</TableHead>
            <TableHead v-if="type === 'building' && showBuildSpeedColumn" class="text-center">
              {{ t('buildings.buildSpeedBonus') }}
            </TableHead>
            <TableHead v-if="type === 'building' && showResearchSpeedColumn" class="text-center">
              {{ t('buildings.researchSpeedBonus') }}
            </TableHead>
            <!-- 科技相关列 -->
            <TableHead v-if="type === 'technology' && showAttackBonusColumn" class="text-center">{{ t('research.attackBonus') }}</TableHead>
            <TableHead v-if="type === 'technology' && showShieldBonusColumn" class="text-center">{{ t('research.shieldBonus') }}</TableHead>
            <TableHead v-if="type === 'technology' && showArmorBonusColumn" class="text-center">{{ t('research.armorBonus') }}</TableHead>
            <TableHead v-if="type === 'technology' && showSpyLevelColumn" class="text-center">{{ t('research.spyLevel') }}</TableHead>
            <TableHead v-if="type === 'technology' && showFleetStorageColumn" class="text-center">
              {{ t('buildings.fleetStorage') }}
            </TableHead>
            <TableHead v-if="type === 'technology' && showResearchQueueColumn" class="text-center">
              {{ t('research.researchQueueBonus') }}
            </TableHead>
            <TableHead v-if="type === 'technology' && showColonySlotsColumn" class="text-center">{{ t('research.colonySlots') }}</TableHead>
            <TableHead v-if="type === 'technology' && showSpaceColumn" class="text-center">{{ t('buildings.spaceBonus') }}</TableHead>
            <TableHead v-if="type === 'technology' && showSpeedBonusColumn" class="text-center">{{ t('research.speedBonus') }}</TableHead>
            <TableHead v-if="type === 'technology' && showResearchSpeedColumn" class="text-center">
              {{ t('buildings.researchSpeedBonus') }}
            </TableHead>
            <TableHead class="text-center">{{ t('player.points') }}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="level in levelRange" :key="level" :class="{ 'bg-muted/50': level === safeCurrentLevel }">
            <TableCell class="text-center font-medium">
              <Badge v-if="level === safeCurrentLevel" variant="default">{{ level }}</Badge>
              <span v-else>{{ level }}</span>
            </TableCell>
            <TableCell class="text-center text-sm">
              <NumberWithTooltip :value="getLevelData(level).cost.metal" />
            </TableCell>
            <TableCell class="text-center text-sm">
              <NumberWithTooltip :value="getLevelData(level).cost.crystal" />
            </TableCell>
            <TableCell class="text-center text-sm">
              <NumberWithTooltip :value="getLevelData(level).cost.deuterium" />
            </TableCell>
            <TableCell v-if="showDarkMatterColumn" class="text-center text-sm">
              <NumberWithTooltip :value="getLevelData(level).cost.darkMatter" />
            </TableCell>
            <TableCell class="text-center text-sm">{{ formatTime(getLevelData(level).time) }}</TableCell>
            <!-- 建筑相关数据 -->
            <TableCell v-if="type === 'building' && showProductionColumn" class="text-center text-sm">
              <span v-if="getLevelData(level).production > 0" class="text-green-600 dark:text-green-400">
                +
                <NumberWithTooltip :value="getLevelData(level).production" />
                /{{ t('resources.perHour') }}
              </span>
              <span v-else>-</span>
            </TableCell>
            <TableCell v-if="type === 'building' && showConsumptionColumn" class="text-center text-sm">
              <span v-if="getLevelData(level).consumption > 0" class="text-red-600 dark:text-red-400">
                -
                <NumberWithTooltip :value="getLevelData(level).consumption" />
              </span>
              <span v-else>-</span>
            </TableCell>
            <TableCell v-if="type === 'building' && showCapacityColumn" class="text-center text-sm">
              <span v-if="getLevelData(level).capacity > 0" class="text-blue-600 dark:text-blue-400">
                <NumberWithTooltip :value="getLevelData(level).capacity" />
              </span>
              <span v-else>-</span>
            </TableCell>
            <TableCell v-if="type === 'building' && showFleetStorageColumn" class="text-center text-sm">
              <span v-if="getLevelData(level).fleetStorage > 0" class="text-blue-600 dark:text-blue-400">
                +
                <NumberWithTooltip :value="getLevelData(level).fleetStorage" />
              </span>
              <span v-else>-</span>
            </TableCell>
            <TableCell v-if="type === 'building' && showBuildQueueColumn" class="text-center text-sm">
              <span class="text-purple-600 dark:text-purple-400">+1</span>
            </TableCell>
            <TableCell v-if="type === 'building' && showSpaceColumn" class="text-center text-sm">
              <span v-if="getLevelData(level).spaceBonus > 0" class="text-green-600 dark:text-green-400">
                +
                <NumberWithTooltip :value="getLevelData(level).spaceBonus" />
              </span>
              <span v-else>-</span>
            </TableCell>
            <TableCell v-if="type === 'building' && showMissileColumn" class="text-center text-sm">
              <span class="text-orange-600 dark:text-orange-400">+10</span>
            </TableCell>
            <TableCell v-if="type === 'building' && showBuildSpeedColumn" class="text-center text-sm">
              <span v-if="itemType === 'roboticsFactory'" class="text-cyan-600 dark:text-cyan-400">
                +{{ getLevelData(level).buildSpeedBonus * 100 }}%
              </span>
              <span v-else-if="itemType === 'naniteFactory'" class="text-cyan-600 dark:text-cyan-400">
                +{{ getLevelData(level).buildSpeedBonus * 100 }}%
              </span>
            </TableCell>
            <TableCell v-if="type === 'building' && showResearchSpeedColumn" class="text-center text-sm">
              <span class="text-indigo-600 dark:text-indigo-400">+{{ (getLevelData(level).researchSpeedBonus - 1) * 100 }}%</span>
            </TableCell>
            <!-- 科技相关数据 -->
            <TableCell v-if="type === 'technology' && showAttackBonusColumn" class="text-center text-sm">
              <span class="text-red-600 dark:text-red-400">+{{ level * 10 }}%</span>
            </TableCell>
            <TableCell v-if="type === 'technology' && showShieldBonusColumn" class="text-center text-sm">
              <span class="text-blue-600 dark:text-blue-400">+{{ level * 10 }}%</span>
            </TableCell>
            <TableCell v-if="type === 'technology' && showArmorBonusColumn" class="text-center text-sm">
              <span class="text-gray-600 dark:text-gray-400">+{{ level * 10 }}%</span>
            </TableCell>
            <TableCell v-if="type === 'technology' && showSpyLevelColumn" class="text-center text-sm">
              <span class="text-purple-600 dark:text-purple-400">+{{ level }}</span>
            </TableCell>
            <TableCell v-if="type === 'technology' && showFleetStorageColumn" class="text-center text-sm">
              <span class="text-blue-600 dark:text-blue-400">
                +
                <NumberWithTooltip :value="level * 500" />
              </span>
            </TableCell>
            <TableCell v-if="type === 'technology' && showResearchQueueColumn" class="text-center text-sm">
              <span class="text-purple-600 dark:text-purple-400">+1</span>
            </TableCell>
            <TableCell v-if="type === 'technology' && showColonySlotsColumn" class="text-center text-sm">
              <span class="text-green-600 dark:text-green-400">+1</span>
            </TableCell>
            <TableCell v-if="type === 'technology' && showSpaceColumn" class="text-center text-sm">
              <span class="text-green-600 dark:text-green-400">+30 {{ t('research.forAllPlanets') }}</span>
            </TableCell>
            <TableCell v-if="type === 'technology' && showSpeedBonusColumn" class="text-center text-sm">
              <span class="text-yellow-600 dark:text-yellow-400">+{{ level * 10 }}%</span>
            </TableCell>
            <TableCell v-if="type === 'technology' && showResearchSpeedColumn" class="text-center text-sm">
              <span class="text-indigo-600 dark:text-indigo-400">+{{ getLevelData(level).researchSpeedBonus * 100 }}%</span>
            </TableCell>
            <TableCell class="text-center text-sm">
              <span class="text-primary font-medium">
                +
                <NumberWithTooltip :value="getLevelData(level).points" />
              </span>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <!-- 矿脉储量信息（仅采矿建筑显示） -->
    <Card
      v-if="isMiningBuilding && oreDepositInfo && miningResourceType"
      class="border-2"
      :class="oreDepositInfo.isDepleted ? 'border-destructive' : oreDepositInfo.isWarning ? 'border-yellow-500' : 'border-primary/30'"
    >
      <CardHeader class="pb-3">
        <CardTitle class="text-sm flex items-center gap-2">
          <ResourceIcon :type="miningResourceType" size="md" />
          {{ t('buildings.oreDeposit') }}
          <AlertTriangle
            v-if="oreDepositInfo.isWarning || oreDepositInfo.isDepleted"
            class="h-4 w-4"
            :class="oreDepositInfo.isDepleted ? 'text-destructive' : 'text-yellow-500'"
          />
        </CardTitle>
      </CardHeader>
      <CardContent class="space-y-3">
        <div class="space-y-2">
          <div class="flex items-center justify-between text-sm">
            <span class="text-muted-foreground">{{ t('buildings.remainingDeposit') }}:</span>
            <span class="font-medium">
              <NumberWithTooltip :value="oreDepositInfo.remaining" />
              /
              <NumberWithTooltip :value="oreDepositInfo.initial" />
            </span>
          </div>
          <Progress
            :model-value="oreDepositInfo.percentage"
            class="h-2"
            :class="oreDepositInfo.isDepleted ? 'bg-destructive/20' : oreDepositInfo.isWarning ? 'bg-yellow-500/20' : ''"
          />
          <div class="flex items-center justify-between text-xs text-muted-foreground">
            <span>{{ oreDepositInfo.percentage.toFixed(1) }}%</span>
            <span v-if="!oreDepositInfo.isDepleted">{{ t('buildings.depletionTime') }}: {{ oreDepositInfo.depletionTimeFormatted }}</span>
            <span v-else class="text-destructive font-medium">{{ t('buildings.depositDepleted') }}</span>
          </div>
        </div>
        <div
          v-if="oreDepositInfo.isWarning && !oreDepositInfo.isDepleted"
          class="text-xs text-yellow-600 dark:text-yellow-400 bg-yellow-500/10 p-2 rounded"
        >
          {{ t('buildings.depositWarning') }}
        </div>
        <div v-if="oreDepositInfo.isDepleted" class="text-xs text-destructive bg-destructive/10 p-2 rounded">
          {{ t('buildings.depositDepletedMessage') }}
        </div>
      </CardContent>
    </Card>

    <!-- 建筑/科技：累积统计 -->
    <div v-if="type === 'building' || type === 'technology'" class="grid grid-cols-2 gap-4">
      <Card>
        <CardHeader class="pb-3">
          <CardTitle class="text-sm">{{ t(`${typeKey}.totalCost`) }}</CardTitle>
        </CardHeader>
        <CardContent class="space-y-2">
          <div class="flex items-center justify-between text-sm">
            <span class="text-muted-foreground">{{ t('resources.metal') }}:</span>
            <span class="font-medium">
              <NumberWithTooltip :value="totalStats.metal" />
            </span>
          </div>
          <div class="flex items-center justify-between text-sm">
            <span class="text-muted-foreground">{{ t('resources.crystal') }}:</span>
            <span class="font-medium">
              <NumberWithTooltip :value="totalStats.crystal" />
            </span>
          </div>
          <div class="flex items-center justify-between text-sm">
            <span class="text-muted-foreground">{{ t('resources.deuterium') }}:</span>
            <span class="font-medium">
              <NumberWithTooltip :value="totalStats.deuterium" />
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="pb-3">
          <CardTitle class="text-sm">{{ t(`${typeKey}.totalPoints`) }}</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="text-3xl font-bold text-primary">
            <NumberWithTooltip :value="totalStats.points" />
          </div>
          <p class="text-xs text-muted-foreground mt-1">
            {{ t(`${typeKey}.levelRange`) }}: {{ Math.max(0, safeCurrentLevel - 10) }} - {{ safeCurrentLevel + 10 }}
          </p>
        </CardContent>
      </Card>
    </div>

    <!-- 舰船/防御：基础属性 -->
    <div v-if="type === 'ship' || type === 'defense'" class="grid grid-cols-2 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader class="pb-3">
          <CardTitle class="text-sm flex items-center gap-2">
            <Sword class="h-4 w-4" />
            {{ t(`${typeKey}.attack`) }}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">
            <NumberWithTooltip :value="combatUnitConfig?.attack || 0" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="pb-3">
          <CardTitle class="text-sm flex items-center gap-2">
            <Shield class="h-4 w-4" />
            {{ t(`${typeKey}.shield`) }}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">
            <NumberWithTooltip :value="combatUnitConfig?.shield || 0" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="pb-3">
          <CardTitle class="text-sm flex items-center gap-2">
            <ShieldCheck class="h-4 w-4" />
            {{ t(`${typeKey}.armor`) }}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">
            <NumberWithTooltip :value="combatUnitConfig?.armor || 0" />
          </div>
        </CardContent>
      </Card>

      <!-- 仅舰船显示 -->
      <Card v-if="type === 'ship'">
        <CardHeader class="pb-3">
          <CardTitle class="text-sm flex items-center gap-2">
            <Zap class="h-4 w-4" />
            {{ t('shipyard.speed') }}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">
            <NumberWithTooltip :value="shipConfig?.speed || 0" />
          </div>
        </CardContent>
      </Card>

      <Card v-if="type === 'ship'">
        <CardHeader class="pb-3">
          <CardTitle class="text-sm flex items-center gap-2">
            <Package class="h-4 w-4" />
            {{ t('shipyard.cargoCapacity') }}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">
            <NumberWithTooltip :value="shipConfig?.cargoCapacity || 0" />
          </div>
        </CardContent>
      </Card>

      <Card v-if="type === 'ship'">
        <CardHeader class="pb-3">
          <CardTitle class="text-sm flex items-center gap-2">
            <Fuel class="h-4 w-4" />
            {{ t('shipyard.fuelConsumption') }}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">
            <NumberWithTooltip :value="shipConfig?.fuelConsumption || 0" />
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- 舰船/防御：建造成本和时间 -->
    <div v-if="type === 'ship' || type === 'defense'" class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle class="text-sm">{{ t(`${typeKey}.buildCost`) }}</CardTitle>
        </CardHeader>
        <CardContent class="space-y-2">
          <div
            v-for="resourceType in costResourceTypes"
            :key="resourceType.key"
            v-show="unitCost[resourceType.key] > 0"
            class="flex items-center justify-between text-sm"
          >
            <span class="text-muted-foreground">{{ t(`resources.${resourceType.key}`) }}:</span>
            <span class="font-medium">
              <NumberWithTooltip :value="unitCost[resourceType.key]" />
            </span>
          </div>
          <div class="flex items-center justify-between text-sm pt-2 border-t">
            <span class="text-muted-foreground">{{ t('player.points') }}:</span>
            <span class="font-bold text-primary">
              <NumberWithTooltip :value="pointsPerUnit" />
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle class="text-sm">{{ t(`${typeKey}.buildTime`) }}</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="text-3xl font-bold">{{ formatTime(unitBuildTime) }}</div>
          <p class="text-xs text-muted-foreground mt-2">{{ t(`${typeKey}.perUnit`) }}</p>
        </CardContent>
      </Card>
    </div>

    <!-- 舰船/防御：批量建造计算器 -->
    <Card v-if="type === 'ship' || type === 'defense'">
      <CardHeader>
        <CardTitle class="text-sm">{{ t(`${typeKey}.batchCalculator`) }}</CardTitle>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="flex items-center gap-4">
          <Label class="w-20">{{ t(`${typeKey}.quantity`) }}:</Label>
          <Input v-model.number="quantity" type="number" min="1" class="flex-1" />
        </div>
        <div class="grid grid-cols-2 gap-4 pt-4 border-t">
          <div class="space-y-2">
            <p class="text-sm text-muted-foreground">{{ t(`${typeKey}.totalCost`) }}:</p>
            <div class="space-y-1 text-sm">
              <div class="flex justify-between">
                <span>{{ t('resources.metal') }}:</span>
                <span class="font-medium">
                  <NumberWithTooltip :value="batchCost.metal" />
                </span>
              </div>
              <div class="flex justify-between">
                <span>{{ t('resources.crystal') }}:</span>
                <span class="font-medium">
                  <NumberWithTooltip :value="batchCost.crystal" />
                </span>
              </div>
              <div class="flex justify-between">
                <span>{{ t('resources.deuterium') }}:</span>
                <span class="font-medium">
                  <NumberWithTooltip :value="batchCost.deuterium" />
                </span>
              </div>
            </div>
          </div>
          <div class="space-y-2">
            <p class="text-sm text-muted-foreground">{{ t(`${typeKey}.totalTime`) }}:</p>
            <div class="text-xl font-bold">{{ formatTime(unitBuildTime * quantity) }}</div>
            <p class="text-xs text-muted-foreground">
              {{ t('player.points') }}: +
              <NumberWithTooltip :value="batchPoints" />
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'
  import { useI18n } from '@/composables/useI18n'
  import { useGameStore } from '@/stores/gameStore'
  import { BuildingType, TechnologyType, type ShipType, type DefenseType } from '@/types/game'
  import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
  import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
  import { Badge } from '@/components/ui/badge'
  import { Input } from '@/components/ui/input'
  import { Label } from '@/components/ui/label'
  import NumberWithTooltip from '@/components/common/NumberWithTooltip.vue'
  import { Sword, Shield, ShieldCheck, Zap, Package, Fuel } from 'lucide-vue-next'
  import * as buildingLogic from '@/logic/buildingLogic'
  import * as researchLogic from '@/logic/researchLogic'
  import * as pointsLogic from '@/logic/pointsLogic'
  import * as officerLogic from '@/logic/officerLogic'
  import * as shipLogic from '@/logic/shipLogic'
  import * as oreDepositLogic from '@/logic/oreDepositLogic'
  import * as resourceLogic from '@/logic/resourceLogic'
  import { SHIPS, DEFENSES, ORE_DEPOSIT_CONFIG } from '@/config/gameConfig'
  import { formatTime } from '@/utils/format'
  import { Progress } from '@/components/ui/progress'
  import ResourceIcon from '@/components/common/ResourceIcon.vue'
  import { AlertTriangle } from 'lucide-vue-next'

  const { t } = useI18n()
  const gameStore = useGameStore()

  const props = defineProps<{
    type: 'building' | 'technology' | 'ship' | 'defense'
    itemType: BuildingType | TechnologyType | ShipType | DefenseType
    currentLevel?: number
  }>()

  const quantity = ref(1)

  // 资源类型配置（用于成本显示）
  const costResourceTypes = [{ key: 'metal' as const }, { key: 'crystal' as const }, { key: 'deuterium' as const }]

  // 获取当前星球
  const currentPlanet = computed(() => gameStore.currentPlanet)

  // 计算当前加成
  const activeBonuses = computed(() => {
    return officerLogic.calculateActiveBonuses(gameStore.player.officers, gameStore.gameTime)
  })

  // 获取工厂等级（用于建造时间计算）
  const roboticsFactoryLevel = computed(() => {
    if (!currentPlanet.value) return 0
    return currentPlanet.value.buildings['roboticsFactory'] || 0
  })

  const naniteFactoryLevel = computed(() => {
    if (!currentPlanet.value) return 0
    return currentPlanet.value.buildings['naniteFactory'] || 0
  })

  // 获取研究所等级（用于研究时间计算）
  const researchLabLevel = computed(() => {
    if (!currentPlanet.value) return 0
    return currentPlanet.value.buildings['researchLab'] || 0
  })

  // 获取能量科技等级（用于研究时间计算）
  const energyTechLevel = computed(() => {
    return gameStore.player.technologies['energyTechnology'] || 0
  })

  // 翻译键（转换为复数形式）
  const typeKey = computed(() => {
    const typeMap = {
      building: 'buildings',
      technology: 'research',
      ship: 'shipyard',
      defense: 'defense'
    } as const
    return typeMap[props.type]
  })

  // 控制建筑列显示
  const showDarkMatterColumn = computed(() => {
    if (props.type === 'building') {
      const buildingType = props.itemType as BuildingType
      return buildingType === 'darkMatterCollector'
    } else if (props.type === 'technology') {
      const techType = props.itemType as TechnologyType
      return techType === 'gravitonTechnology'
    }
    return false
  })

  const showProductionColumn = computed(() => {
    if (props.type !== 'building') return false
    const buildingType = props.itemType as BuildingType
    return ['metalMine', 'crystalMine', 'deuteriumSynthesizer', 'solarPlant', 'fusionReactor', 'darkMatterCollector'].includes(buildingType)
  })

  const showConsumptionColumn = computed(() => {
    if (props.type !== 'building') return false
    const buildingType = props.itemType as BuildingType
    // 所有消耗电力的建筑
    return [
      'metalMine',
      'crystalMine',
      'deuteriumSynthesizer',
      'roboticsFactory',
      'naniteFactory',
      'shipyard',
      'researchLab',
      'missileSilo',
      'terraformer',
      'darkMatterCollector',
      'sensorPhalanx',
      'jumpGate'
    ].includes(buildingType)
  })

  // 是否显示矿脉储量信息（仅对采矿建筑）
  const isMiningBuilding = computed(() => {
    if (props.type !== 'building') return false
    const buildingType = props.itemType as BuildingType
    return ['metalMine', 'crystalMine', 'deuteriumSynthesizer'].includes(buildingType)
  })

  // 获取当前建筑对应的资源类型
  const miningResourceType = computed((): 'metal' | 'crystal' | 'deuterium' | null => {
    if (!isMiningBuilding.value) return null
    const buildingType = props.itemType as BuildingType
    if (buildingType === 'metalMine') return 'metal'
    if (buildingType === 'crystalMine') return 'crystal'
    if (buildingType === 'deuteriumSynthesizer') return 'deuterium'
    return null
  })

  // 矿脉储量信息
  const oreDepositInfo = computed(() => {
    if (!currentPlanet.value || !miningResourceType.value || !currentPlanet.value.oreDeposits) {
      return null
    }
    const deposits = currentPlanet.value.oreDeposits
    const resourceType = miningResourceType.value
    const remaining = deposits[resourceType]

    // 获取深层钻探设施等级（星球级）和采矿技术等级（全局）
    const deepDrillingLevel = currentPlanet.value.buildings[BuildingType.DeepDrillingFacility] || 0
    const miningTechLevel = gameStore.player?.technologies?.[TechnologyType.MiningTechnology] || 0

    // 使用增强版计算函数获取带加成的储量上限
    const enhancedDeposits = oreDepositLogic.calculateEnhancedDeposits(
      deposits.position,
      deepDrillingLevel,
      miningTechLevel
    )
    const initial = enhancedDeposits[resourceType]

    // 百分比基于增强后的上限计算
    const percentage = initial > 0 ? (remaining / initial) * 100 : 0
    const isWarning = percentage < ORE_DEPOSIT_CONFIG.WARNING_THRESHOLD * 100 && percentage > 0
    const isDepleted = remaining <= 0

    // 计算当前产量（每小时）
    const production = resourceLogic.calculateResourceProduction(currentPlanet.value, {
      resourceProductionBonus: activeBonuses.value.resourceProductionBonus,
      darkMatterProductionBonus: activeBonuses.value.darkMatterProductionBonus,
      energyProductionBonus: activeBonuses.value.energyProductionBonus
    })
    const productionPerHour = production[resourceType]

    // 计算耗尽时间
    const depletionTimeHours = productionPerHour > 0 ? remaining / productionPerHour : Infinity
    const depletionTimeFormatted = oreDepositLogic.formatDepletionTime(depletionTimeHours)

    return {
      remaining,
      initial,
      percentage,
      isWarning,
      isDepleted,
      productionPerHour,
      depletionTimeFormatted,
      bonusMultiplier: enhancedDeposits.bonusMultiplier,
      deepDrillingLevel,
      miningTechLevel
    }
  })

  const showCapacityColumn = computed(() => {
    if (props.type !== 'building') return false
    const buildingType = props.itemType as BuildingType
    return ['metalStorage', 'crystalStorage', 'deuteriumTank', 'darkMatterCollector', 'darkMatterTank'].includes(buildingType)
  })

  const showFleetStorageColumn = computed(() => {
    if (props.type === 'building') {
      const buildingType = props.itemType as BuildingType
      return buildingType === 'shipyard' || buildingType === 'hangar'
    } else if (props.type === 'technology') {
      const techType = props.itemType as TechnologyType
      return techType === 'computerTechnology'
    }
    return false
  })

  const showBuildQueueColumn = computed(() => {
    if (props.type !== 'building') return false
    const buildingType = props.itemType as BuildingType
    return buildingType === 'naniteFactory'
  })

  const showSpaceColumn = computed(() => {
    if (props.type === 'building') {
      const buildingType = props.itemType as BuildingType
      return ['terraformer', 'lunarBase'].includes(buildingType)
    } else if (props.type === 'technology') {
      const techType = props.itemType as TechnologyType
      return techType === 'terraformingTechnology'
    }
    return false
  })

  const showMissileColumn = computed(() => {
    if (props.type !== 'building') return false
    const buildingType = props.itemType as BuildingType
    return buildingType === 'missileSilo'
  })

  const showBuildSpeedColumn = computed(() => {
    if (props.type !== 'building') return false
    const buildingType = props.itemType as BuildingType
    return ['roboticsFactory', 'naniteFactory'].includes(buildingType)
  })

  const showResearchSpeedColumn = computed(() => {
    if (props.type === 'building') {
      const buildingType = props.itemType as BuildingType
      return buildingType === 'researchLab'
    } else if (props.type === 'technology') {
      const techType = props.itemType as TechnologyType
      return techType === 'energyTechnology'
    }
    return false
  })

  // 控制科技列显示
  const showAttackBonusColumn = computed(() => {
    if (props.type !== 'technology') return false
    const techType = props.itemType as TechnologyType
    return techType === 'weaponsTechnology'
  })

  const showShieldBonusColumn = computed(() => {
    if (props.type !== 'technology') return false
    const techType = props.itemType as TechnologyType
    return techType === 'shieldingTechnology'
  })

  const showArmorBonusColumn = computed(() => {
    if (props.type !== 'technology') return false
    const techType = props.itemType as TechnologyType
    return techType === 'armourTechnology'
  })

  const showSpyLevelColumn = computed(() => {
    if (props.type !== 'technology') return false
    const techType = props.itemType as TechnologyType
    return techType === 'espionageTechnology'
  })

  const showResearchQueueColumn = computed(() => {
    if (props.type !== 'technology') return false
    const techType = props.itemType as TechnologyType
    return techType === 'computerTechnology'
  })

  const showColonySlotsColumn = computed(() => {
    if (props.type !== 'technology') return false
    const techType = props.itemType as TechnologyType
    return techType === 'astrophysics'
  })

  const showSpeedBonusColumn = computed(() => {
    if (props.type !== 'technology') return false
    const techType = props.itemType as TechnologyType
    return ['combustionDrive', 'impulseDrive', 'hyperspaceDrive'].includes(techType)
  })

  // 安全的当前等级（防止undefined）
  const safeCurrentLevel = computed(() => props.currentLevel ?? 0)

  // 类型安全：战斗单位配置（舰船/防御）
  const combatUnitConfig = computed(() => {
    if (props.type === 'ship') return SHIPS[props.itemType as ShipType]
    if (props.type === 'defense') return DEFENSES[props.itemType as DefenseType]
    return null
  })

  // 类型安全：舰船配置
  const shipConfig = computed(() => {
    if (props.type === 'ship') return SHIPS[props.itemType as ShipType]
    return null
  })

  // 类型安全：单位成本（处理cost vs baseCost差异）
  const unitCost = computed(() => {
    if (props.type === 'ship') return SHIPS[props.itemType as ShipType].cost
    if (props.type === 'defense') return DEFENSES[props.itemType as DefenseType].cost
    return { metal: 0, crystal: 0, deuterium: 0 }
  })

  // 类型安全：单位建造时间（处理buildTime vs baseTime差异，应用加成）
  const unitBuildTime = computed(() => {
    if (props.type === 'ship') {
      return shipLogic.calculateShipBuildTime(
        props.itemType as ShipType,
        1, // 单个单位
        activeBonuses.value.buildingSpeedBonus,
        roboticsFactoryLevel.value,
        naniteFactoryLevel.value
      )
    }
    if (props.type === 'defense') {
      return shipLogic.calculateDefenseBuildTime(
        props.itemType as DefenseType,
        1, // 单个单位
        activeBonuses.value.buildingSpeedBonus,
        roboticsFactoryLevel.value,
        naniteFactoryLevel.value
      )
    }
    return 0
  })

  // 建筑/科技：等级范围
  const levelRange = computed(() => {
    if (props.type !== 'building' && props.type !== 'technology') return []
    const current = props.currentLevel || 0
    const levels = []
    for (let i = current; i <= current + 10; i++) {
      levels.push(i)
    }
    return levels
  })

  // 建筑/科技：获取某个等级的数据
  const getLevelData = (level: number) => {
    if (level === 0) {
      return {
        cost: { metal: 0, crystal: 0, deuterium: 0, darkMatter: 0 },
        time: 0,
        production: 0,
        consumption: 0,
        points: 0,
        capacity: 0,
        fleetStorage: 0,
        spaceBonus: 0,
        buildSpeedBonus: 0,
        researchSpeedBonus: 0
      }
    }

    if (props.type === 'building') {
      const buildingType = props.itemType as BuildingType
      const cost = buildingLogic.calculateBuildingCost(buildingType, level)

      // 使用实际的工厂等级和加成计算建造时间
      const time = buildingLogic.calculateBuildingTime(
        buildingType,
        level,
        activeBonuses.value.buildingSpeedBonus,
        roboticsFactoryLevel.value,
        naniteFactoryLevel.value
      )

      let production = 0
      let consumption = 0
      let capacity = 0
      let fleetStorage = 0
      let spaceBonus = 0
      let buildSpeedBonus = 0
      let researchSpeedBonus = 0

      // 应用资源产量加成
      const resourceBonus = 1 + (activeBonuses.value.resourceProductionBonus || 0) / 100
      const energyBonus = 1 + (activeBonuses.value.energyProductionBonus || 0) / 100
      const storageBonus = 1 + (activeBonuses.value.storageCapacityBonus || 0) / 100
      const baseCapacity = 10000

      // Building calculation configuration
      const buildingCalculations: Record<
        string,
        (level: number) => Partial<{
          production: number
          consumption: number
          capacity: number
          fleetStorage: number
          spaceBonus: number
          buildSpeedBonus: number
          researchSpeedBonus: number
        }>
      > = {
        metalMine: lvl => ({
          production: Math.floor(1500 * lvl * Math.pow(1.5, lvl) * resourceBonus),
          consumption: Math.floor(10 * lvl * Math.pow(1.1, lvl))
        }),
        crystalMine: lvl => ({
          production: Math.floor(1000 * lvl * Math.pow(1.5, lvl) * resourceBonus),
          consumption: Math.floor(10 * lvl * Math.pow(1.1, lvl))
        }),
        deuteriumSynthesizer: lvl => ({
          production: Math.floor(500 * lvl * Math.pow(1.5, lvl) * resourceBonus),
          consumption: Math.floor(10 * lvl * Math.pow(1.1, lvl))
        }),
        solarPlant: lvl => ({
          production: Math.floor(50 * lvl * Math.pow(1.1, lvl) * energyBonus)
        }),
        metalStorage: lvl => ({
          capacity: Math.floor(baseCapacity * Math.pow(2, lvl) * storageBonus)
        }),
        crystalStorage: lvl => ({
          capacity: Math.floor(baseCapacity * Math.pow(2, lvl) * storageBonus)
        }),
        deuteriumTank: lvl => ({
          capacity: Math.floor(baseCapacity * Math.pow(2, lvl) * storageBonus)
        }),
        darkMatterCollector: lvl => ({
          capacity: 1000 + lvl * 100,
          production: Math.floor(25 * lvl * Math.pow(1.5, lvl)),
          consumption: Math.floor(10 * lvl * Math.pow(1.1, lvl))
        }),
        darkMatterTank: lvl => ({
          capacity: Math.floor(1000 * Math.pow(2, lvl) * storageBonus)
        }),
        fusionReactor: lvl => ({
          production: Math.floor(150 * lvl * Math.pow(1.15, lvl))
        }),
        shipyard: lvl => ({
          fleetStorage: 1000 * lvl,
          consumption: Math.floor(8 * lvl * Math.pow(1.1, lvl))
        }),
        hangar: lvl => ({
          fleetStorage: 500 * lvl
        }),
        lunarBase: () => ({
          spaceBonus: 30
        }),
        roboticsFactory: lvl => ({
          buildSpeedBonus: lvl,
          consumption: Math.floor(5 * lvl * Math.pow(1.1, lvl))
        }),
        naniteFactory: lvl => ({
          buildSpeedBonus: lvl * 2,
          consumption: Math.floor(20 * lvl * Math.pow(1.15, lvl))
        }),
        researchLab: lvl => ({
          researchSpeedBonus: lvl,
          consumption: Math.floor(12 * lvl * Math.pow(1.1, lvl))
        }),
        missileSilo: lvl => ({
          consumption: Math.floor(8 * lvl * Math.pow(1.1, lvl))
        }),
        terraformer: lvl => ({
          spaceBonus: 30,
          consumption: Math.floor(25 * lvl * Math.pow(1.15, lvl))
        }),
        sensorPhalanx: lvl => ({
          consumption: Math.floor(15 * lvl * Math.pow(1.12, lvl))
        }),
        jumpGate: lvl => ({
          consumption: Math.floor(50 * lvl * Math.pow(1.2, lvl))
        })
      }

      // Apply calculations if configuration exists
      const calc = buildingCalculations[buildingType]
      if (calc) {
        const result = calc(level)
        production = result.production ?? production
        consumption = result.consumption ?? consumption
        capacity = result.capacity ?? capacity
        fleetStorage = result.fleetStorage ?? fleetStorage
        spaceBonus = result.spaceBonus ?? spaceBonus
        buildSpeedBonus = result.buildSpeedBonus ?? buildSpeedBonus
        researchSpeedBonus = result.researchSpeedBonus ?? researchSpeedBonus
      }

      const points = pointsLogic.calculateBuildingPoints(buildingType, level - 1, level)
      return { cost, time, production, consumption, points, capacity, fleetStorage, spaceBonus, buildSpeedBonus, researchSpeedBonus }
    } else {
      const techType = props.itemType as TechnologyType
      const cost = researchLogic.calculateTechnologyCost(techType, level)

      // 使用实际的研究所等级和加成计算研究时间
      const time = researchLogic.calculateTechnologyTime(
        techType,
        level - 1,
        activeBonuses.value.researchSpeedBonus,
        researchLabLevel.value,
        energyTechLevel.value
      )

      let researchSpeedBonus = 0
      if (techType === 'energyTechnology') {
        researchSpeedBonus = level
      }

      const points = pointsLogic.calculateTechnologyPoints(techType, level - 1, level)
      return {
        cost,
        time,
        production: 0,
        consumption: 0,
        points,
        capacity: 0,
        fleetStorage: 0,
        spaceBonus: 0,
        buildSpeedBonus: 0,
        researchSpeedBonus
      }
    }
  }

  // 建筑/科技：累积统计
  const totalStats = computed(() => {
    if (props.type !== 'building' && props.type !== 'technology') {
      return { metal: 0, crystal: 0, deuterium: 0, points: 0 }
    }

    let metal = 0,
      crystal = 0,
      deuterium = 0,
      points = 0
    for (const level of levelRange.value) {
      if (level === 0) continue
      const data = getLevelData(level)
      metal += data.cost.metal
      crystal += data.cost.crystal
      deuterium += data.cost.deuterium
      points += data.points
    }
    return { metal, crystal, deuterium, points }
  })

  // 舰船/防御：单位积分
  const pointsPerUnit = computed(() => {
    if (props.type === 'ship') return pointsLogic.calculateShipPoints(props.itemType as ShipType, 1)
    if (props.type === 'defense') return pointsLogic.calculateDefensePoints(props.itemType as DefenseType, 1)
    return 0
  })

  // 舰船/防御：批量成本
  const batchCost = computed(() => ({
    metal: unitCost.value.metal * quantity.value,
    crystal: unitCost.value.crystal * quantity.value,
    deuterium: unitCost.value.deuterium * quantity.value
  }))

  // 舰船/防御：批量积分
  const batchPoints = computed(() => {
    if (props.type === 'ship') return pointsLogic.calculateShipPoints(props.itemType as ShipType, quantity.value)
    if (props.type === 'defense') return pointsLogic.calculateDefensePoints(props.itemType as DefenseType, quantity.value)
    return 0
  })
</script>
