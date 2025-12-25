<template>
  <div v-if="planet" class="container mx-auto p-4 sm:p-6">
    <h1 class="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">{{ t('buildingsView.title') }}</h1>

    <!-- 占地显示 -->
    <div class="mb-4 sm:mb-6 p-3 sm:p-4 bg-muted/50 rounded-lg border">
      <div class="flex items-center justify-between">
        <div class="text-sm sm:text-base font-medium flex items-center gap-2">
          <Grid3x3 :size="16" />
          {{ t('buildingsView.spaceUsage') }}:
        </div>
        <div class="text-sm sm:text-base font-bold">
          <span :class="getUsedSpace(planet) > planet.maxSpace ? 'text-destructive' : 'text-primary'">
            {{ formatNumber(getUsedSpace(planet)) }}
          </span>
          <span class="text-muted-foreground mx-1">/</span>
          <span>{{ formatNumber(planet.maxSpace) }}</span>
        </div>
      </div>
      <div class="mt-2">
        <div class="w-full bg-background rounded-full h-2.5 sm:h-3 overflow-hidden">
          <div
            class="h-full transition-all duration-300"
            :class="getUsedSpace(planet) > planet.maxSpace ? 'bg-destructive' : 'bg-primary'"
            :style="{ width: `${Math.min((getUsedSpace(planet) / planet.maxSpace) * 100, 100)}%` }"
          />
        </div>
      </div>
    </div>

    <div class="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
      <Card v-for="buildingType in availableBuildings" :key="buildingType" :data-building="buildingType" class="relative">
        <!-- 前置条件遮罩 -->
        <CardUnlockOverlay :requirements="BUILDINGS[buildingType].requirements" :currentLevel="getBuildingLevel(buildingType)" />

        <CardHeader>
          <div class="mb-2">
            <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
              <CardTitle
                class="text-sm sm:text-base lg:text-lg cursor-pointer hover:text-primary transition-colors underline decoration-dotted underline-offset-4 order-2 sm:order-1"
                @click="detailDialog.openBuilding(buildingType, getBuildingLevel(buildingType))"
              >
                {{ BUILDINGS[buildingType].name }}
              </CardTitle>
              <Badge variant="secondary" class="text-xs whitespace-nowrap self-start order-1 sm:order-2">
                Lv {{ getBuildingLevel(buildingType) }}
              </Badge>
            </div>
          </div>
          <CardDescription class="text-xs sm:text-sm">{{ BUILDINGS[buildingType].description }}</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="space-y-3">
            <div class="text-xs sm:text-sm space-y-1.5 sm:space-y-2">
              <p class="text-muted-foreground mb-1 sm:mb-2">{{ t('buildingsView.upgradeCost') }}</p>
              <div class="space-y-1 sm:space-y-1.5">
                <div
                  v-for="resourceType in costResourceTypes"
                  :key="resourceType.key"
                  v-show="
                    resourceType.key !== 'darkMatter' || getBuildingCost(buildingType, getBuildingLevel(buildingType) + 1).darkMatter > 0
                  "
                  class="flex items-center gap-1.5 sm:gap-2"
                >
                  <ResourceIcon :type="resourceType.key" size="sm" />
                  <span class="text-xs">{{ t(`resources.${resourceType.key}`) }}:</span>
                  <span
                    class="font-medium text-xs sm:text-sm"
                    :class="
                      getResourceCostColor(
                        planet.resources[resourceType.key],
                        getBuildingCost(buildingType, getBuildingLevel(buildingType) + 1)[resourceType.key]
                      )
                    "
                  >
                    {{ formatNumber(getBuildingCost(buildingType, getBuildingLevel(buildingType) + 1)[resourceType.key]) }}
                  </span>
                </div>
              </div>
            </div>

            <div class="text-xs sm:text-sm space-y-0.5 sm:space-y-1">
              <div class="flex items-center gap-1.5 text-muted-foreground">
                <Clock :size="14" class="shrink-0" />
                <span>{{ formatTime(getBuildingTime(buildingType, getBuildingLevel(buildingType) + 1)) }}</span>
              </div>
              <div class="flex items-center gap-1.5 text-muted-foreground">
                <Grid3x3 :size="14" class="shrink-0" />
                <span>{{ BUILDINGS[buildingType].spaceUsage }}</span>
              </div>
            </div>

            <!-- 升级按钮 -->
            <Button @click="handleUpgrade(buildingType, $event)" :disabled="!canUpgrade(buildingType)" class="w-full">
              {{ getUpgradeButtonText(buildingType) }}
            </Button>

            <!-- 添加到等待队列按钮 -->
            <Button
              v-if="canAddToWaitingQueue(buildingType)"
              @click="handleAddToWaiting(buildingType, $event)"
              variant="outline"
              class="w-full"
            >
              {{ t('queue.addToWaiting') }}
            </Button>

            <!-- 拆除按钮 -->
            <Button
              v-if="getBuildingLevel(buildingType) > 0"
              @click="handleDemolish(buildingType)"
              :disabled="!canDemolish(buildingType)"
              variant="destructive"
              class="w-full"
            >
              {{ t('buildingsView.demolish') }}
            </Button>

            <!-- 拆除信息提示 -->
            <div v-if="getBuildingLevel(buildingType) > 0" class="text-xs text-muted-foreground">
              <p>{{ t('buildingsView.demolishRefund') }}</p>
              <div class="flex gap-2 flex-wrap">
                <span class="flex items-center gap-1.5" v-if="getDemolishRefund(buildingType).metal">
                  <ResourceIcon type="metal" size="sm" />
                  {{ formatNumber(getDemolishRefund(buildingType).metal) }}
                </span>
                <span class="flex items-center gap-1.5" v-if="getDemolishRefund(buildingType).crystal">
                  <ResourceIcon type="crystal" size="sm" />
                  {{ formatNumber(getDemolishRefund(buildingType).crystal) }}
                </span>
                <span class="flex items-center gap-1.5" v-if="getDemolishRefund(buildingType).deuterium">
                  <ResourceIcon type="deuterium" size="sm" />
                  {{ formatNumber(getDemolishRefund(buildingType).deuterium) }}
                </span>
                <span class="flex items-center gap-1.5" v-if="getDemolishRefund(buildingType).darkMatter">
                  <ResourceIcon type="darkMatter" size="sm" />
                  {{ formatNumber(getDemolishRefund(buildingType).darkMatter) }}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- 提示对话框 -->
    <AlertDialog :open="alertDialogOpen" @update:open="alertDialogOpen = $event">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{{ alertDialogTitle }}</AlertDialogTitle>
          <AlertDialogDescription v-if="!alertDialogShowRequirements" class="whitespace-pre-line">
            {{ alertDialogMessage }}
          </AlertDialogDescription>
          <AlertDialogDescription v-else>
            <div class="space-y-2">
              <div v-for="(req, index) in alertDialogRequirements" :key="index" class="flex items-center gap-2 text-sm">
                <Check v-if="req.met" :size="16" class="text-green-500 shrink-0" />
                <X v-else :size="16" class="text-red-500 shrink-0" />
                <span>{{ req.name }}: Lv {{ req.requiredLevel }} ({{ t('common.current') }}: Lv {{ req.currentLevel }})</span>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction>{{ t('common.confirm') }}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    <!-- 拆除确认对话框 -->
    <AlertDialog :open="demolishConfirmOpen" @update:open="demolishConfirmOpen = $event">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{{ t('buildingsView.confirmDemolish') }}</AlertDialogTitle>
          <AlertDialogDescription class="whitespace-pre-line">
            {{ demolishConfirmMessage }}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{{ t('common.cancel') }}</AlertDialogCancel>
          <AlertDialogAction @click="confirmDemolish">{{ t('common.confirm') }}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>

<script setup lang="ts">
  import { useGameStore } from '@/stores/gameStore'
  import { useDetailDialogStore } from '@/stores/detailDialogStore'
  import { useI18n } from '@/composables/useI18n'
  import { useGameConfig } from '@/composables/useGameConfig'
  import { computed, ref } from 'vue'
  import { BuildingType, TechnologyType } from '@/types/game'
  import type { Resources, Planet } from '@/types/game'
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
  import { Button } from '@/components/ui/button'
  import { Badge } from '@/components/ui/badge'
  import ResourceIcon from '@/components/common/ResourceIcon.vue'
  import CardUnlockOverlay from '@/components/common/CardUnlockOverlay.vue'
  import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
  } from '@/components/ui/alert-dialog'
  import { Clock, Grid3x3, Check, X } from 'lucide-vue-next'
  import { formatNumber, formatTime, getResourceCostColor } from '@/utils/format'
  import * as buildingLogic from '@/logic/buildingLogic'
  import * as buildingValidation from '@/logic/buildingValidation'
  import * as publicLogic from '@/logic/publicLogic'
  import * as officerLogic from '@/logic/officerLogic'
  import * as gameLogic from '@/logic/gameLogic'
  import * as waitingQueueLogic from '@/logic/waitingQueueLogic'
  import { triggerQueueAnimation } from '@/composables/useQueueAnimation'

  const gameStore = useGameStore()
  const detailDialog = useDetailDialogStore()
  const { t } = useI18n()
  const { BUILDINGS, TECHNOLOGIES } = useGameConfig()
  const planet = computed(() => gameStore.currentPlanet)

  // AlertDialog 状态
  const alertDialogOpen = ref(false)
  const alertDialogTitle = ref('')
  const alertDialogMessage = ref('')
  const alertDialogRequirements = ref<Array<{ name: string; requiredLevel: number; currentLevel: number; met: boolean }>>([])
  const alertDialogShowRequirements = ref(false)

  // 防抖状态：防止快速点击
  const isProcessing = ref(false)
  const DEBOUNCE_DELAY = 300 // 防抖延迟（毫秒）

  // 拆除确认对话框状态
  const demolishConfirmOpen = ref(false)
  const demolishConfirmMessage = ref('')
  const pendingDemolishBuilding = ref<BuildingType | null>(null)

  // 资源类型配置（用于成本显示）
  const costResourceTypes = [
    { key: 'metal' as const },
    { key: 'crystal' as const },
    { key: 'deuterium' as const },
    { key: 'darkMatter' as const }
  ]

  // 根据星球类型过滤可用建筑
  const availableBuildings = computed<BuildingType[]>(() => {
    if (!planet.value) return []
    return (Object.values(BuildingType) as BuildingType[]).filter(buildingType => {
      const config = BUILDINGS.value[buildingType]
      if (planet.value!.isMoon) {
        // 月球可以建造：月球专属建筑 + 非行星专属建筑（如机器人工厂、船坞、机库等）
        // OGame规则：月球不能建造 planetOnly 的建筑（矿场、研究实验室、纳米工厂等）
        return config.planetOnly !== true
      } else {
        // 行星不能建造月球专属建筑
        return config.moonOnly !== true
      }
    })
  })

  const upgradeBuilding = (buildingType: BuildingType): { success: boolean; reason?: string } => {
    if (!gameStore.currentPlanet) return { success: false }
    const validation = buildingValidation.validateBuildingUpgrade(
      gameStore.currentPlanet,
      buildingType,
      gameStore.player.technologies,
      gameStore.player.officers
    )
    if (!validation.valid) return { success: false, reason: validation.reason }

    // 追踪资源消耗（在扣除前计算成本）
    const currentLevel = gameStore.currentPlanet.buildings[buildingType] || 0
    const cost = buildingLogic.calculateBuildingCost(buildingType, currentLevel + 1)
    gameLogic.trackResourceConsumption(gameStore.player, cost)

    const queueItem = buildingValidation.executeBuildingUpgrade(gameStore.currentPlanet, buildingType, gameStore.player.officers)
    gameStore.currentPlanet.buildQueue.push(queueItem)
    return { success: true }
  }

  const getUsedSpace = (planet: Planet): number => {
    return buildingLogic.calculateUsedSpace(planet)
  }

  // 升级建筑
  const handleUpgrade = (buildingType: BuildingType, event: MouseEvent) => {
    // 防抖：防止快速点击
    if (isProcessing.value) return
    isProcessing.value = true
    setTimeout(() => {
      isProcessing.value = false
    }, DEBOUNCE_DELAY)

    // 检查前置条件
    if (!checkUpgradeRequirements(buildingType)) {
      alertDialogTitle.value = t('common.requirementsNotMet')
      alertDialogRequirements.value = getRequirementsList(buildingType)
      alertDialogShowRequirements.value = true
      alertDialogMessage.value = ''
      alertDialogOpen.value = true
      return
    }

    const result = upgradeBuilding(buildingType)
    if (!result.success) {
      alertDialogTitle.value = t('buildingsView.upgradeFailed')
      alertDialogMessage.value = result.reason ? t(result.reason) : t('buildingsView.upgradeFailedMessage')
      alertDialogShowRequirements.value = false
      alertDialogOpen.value = true
    } else {
      // 触发抛物线动画
      triggerQueueAnimation(event, 'building')
    }
  }

  // 获取建筑等级
  const getBuildingLevel = (buildingType: BuildingType): number => {
    return planet.value?.buildings[buildingType] || 0
  }

  // 检查升级前置条件是否满足
  const checkUpgradeRequirements = (buildingType: BuildingType): boolean => {
    if (!planet.value) return false
    const config = BUILDINGS.value[buildingType]
    const currentLevel = getBuildingLevel(buildingType)
    const targetLevel = currentLevel + 1

    // 获取目标等级的所有前置条件（包括等级门槛）
    const requirements = publicLogic.getLevelRequirements(config, targetLevel)

    if (!requirements || Object.keys(requirements).length === 0) return true
    return publicLogic.checkRequirements(planet.value, gameStore.player.technologies, requirements)
  }

  // 获取升级按钮文本
  const getUpgradeButtonText = (buildingType: BuildingType): string => {
    if (!planet.value) return t('buildingsView.upgrade')

    const config = BUILDINGS.value[buildingType]
    const currentLevel = getBuildingLevel(buildingType)

    // 检查是否达到等级上限
    if (config.maxLevel !== undefined && currentLevel >= config.maxLevel) {
      return t('buildingsView.maxLevelReached') // "等级已满"
    }

    // 0级为建造，1级及以上为升级
    const buttonTextKey = currentLevel === 0 ? 'buildingsView.build' : 'buildingsView.upgrade'

    if (planet.value.buildQueue.length > 0) return t(buttonTextKey)

    // 检查前置条件
    if (!checkUpgradeRequirements(buildingType)) {
      return t('buildingsView.requirementsNotMet')
    }

    return t(buttonTextKey)
  }

  // 获取前置条件列表
  const getRequirementsList = (
    buildingType: BuildingType
  ): Array<{ name: string; requiredLevel: number; currentLevel: number; met: boolean }> => {
    const config = BUILDINGS.value[buildingType]
    const currentLevel = getBuildingLevel(buildingType)
    const targetLevel = currentLevel + 1

    // 获取目标等级的所有前置条件（包括等级门槛）
    const requirements = publicLogic.getLevelRequirements(config, targetLevel)

    if (!requirements || !planet.value) return []

    const items: Array<{ name: string; requiredLevel: number; currentLevel: number; met: boolean }> = []
    for (const [key, requiredLevel] of Object.entries(requirements)) {
      // 检查是否为建筑类型
      if (Object.values(BuildingType).includes(key as BuildingType)) {
        const bt = key as BuildingType
        const currentLevel = planet.value.buildings[bt] || 0
        const name = BUILDINGS.value[bt]?.name || bt
        items.push({ name, requiredLevel, currentLevel, met: currentLevel >= requiredLevel })
      }
      // 检查是否为科技类型
      else if (Object.values(TechnologyType).includes(key as TechnologyType)) {
        const tt = key as TechnologyType
        const currentLevel = gameStore.player.technologies[tt] || 0
        const name = TECHNOLOGIES.value[tt]?.name || tt
        items.push({ name, requiredLevel, currentLevel, met: currentLevel >= requiredLevel })
      }
    }
    return items
  }

  // 检查是否可以升级
  const canUpgrade = (buildingType: BuildingType): boolean => {
    if (!planet.value) return false

    const config = BUILDINGS.value[buildingType]
    const currentLevel = getBuildingLevel(buildingType)

    // 检查是否达到等级上限
    if (config.maxLevel !== undefined && currentLevel >= config.maxLevel) {
      return false
    }

    // 检查建造队列是否已满（只计算建筑类型的队列项）
    const bonuses = officerLogic.calculateActiveBonuses(gameStore.player.officers, Date.now())
    const maxQueue = publicLogic.getMaxBuildQueue(planet.value, bonuses.additionalBuildQueue)
    const buildingQueueCount = planet.value.buildQueue.filter(item => item.type === 'building' || item.type === 'demolish').length
    if (buildingQueueCount >= maxQueue) {
      return false
    }

    // 检查前置条件
    const validation = buildingValidation.validateBuildingUpgrade(
      planet.value,
      buildingType,
      gameStore.player.technologies,
      gameStore.player.officers
    )
    if (!validation.valid) return false

    const cost = getBuildingCost(buildingType, currentLevel + 1)

    return (
      planet.value.resources.metal >= cost.metal &&
      planet.value.resources.crystal >= cost.crystal &&
      planet.value.resources.deuterium >= cost.deuterium &&
      planet.value.resources.darkMatter >= cost.darkMatter
    )
  }

  const getBuildingCost = (buildingType: BuildingType, targetLevel: number): Resources => {
    return buildingLogic.calculateBuildingCost(buildingType, targetLevel)
  }

  const getBuildingTime = (buildingType: BuildingType, targetLevel: number): number => {
    if (!planet.value) return 0

    const bonuses = officerLogic.calculateActiveBonuses(gameStore.player.officers, Date.now())

    // 获取机器人工厂和纳米工厂等级
    const roboticsFactoryLevel = planet.value.buildings[BuildingType.RoboticsFactory] || 0
    const naniteFactoryLevel = planet.value.buildings[BuildingType.NaniteFactory] || 0

    return buildingLogic.calculateBuildingTime(
      buildingType,
      targetLevel,
      bonuses.buildingSpeedBonus,
      roboticsFactoryLevel,
      naniteFactoryLevel
    )
  }

  // 拆除建筑
  const demolishBuilding = (buildingType: BuildingType): boolean => {
    if (!gameStore.currentPlanet) return false
    const validation = buildingValidation.validateBuildingDemolish(gameStore.currentPlanet, buildingType, gameStore.player.officers)
    if (!validation.valid) return false
    const queueItem = buildingValidation.executeBuildingDemolish(gameStore.currentPlanet, buildingType, gameStore.player.officers)
    gameStore.currentPlanet.buildQueue.push(queueItem)
    return true
  }

  const handleDemolish = (buildingType: BuildingType) => {
    const refund = getDemolishRefund(buildingType)
    demolishConfirmMessage.value = `${t('buildingsView.demolishRefund')}
${refund.metal ? `${t('resources.metal')}: ${formatNumber(refund.metal)}` : ''}
${refund.crystal ? `${t('resources.crystal')}: ${formatNumber(refund.crystal)}` : ''}
${refund.deuterium ? `${t('resources.deuterium')}: ${formatNumber(refund.deuterium)}` : ''}
${refund.darkMatter ? `${t('resources.darkMatter')}: ${formatNumber(refund.darkMatter)}` : ''}`

    pendingDemolishBuilding.value = buildingType
    demolishConfirmOpen.value = true
  }

  const confirmDemolish = () => {
    if (pendingDemolishBuilding.value) {
      const success = demolishBuilding(pendingDemolishBuilding.value)
      if (!success) {
        alertDialogTitle.value = t('buildingsView.demolishFailed')
        alertDialogMessage.value = t('buildingsView.demolishFailedMessage')
        alertDialogOpen.value = true
      }
    }
    demolishConfirmOpen.value = false
    pendingDemolishBuilding.value = null
  }

  // 检查是否可以拆除
  const canDemolish = (buildingType: BuildingType): boolean => {
    if (!planet.value) return false
    if (getBuildingLevel(buildingType) <= 0) return false

    // 检查建造队列是否已满（只计算建筑类型的队列项）
    const bonuses = officerLogic.calculateActiveBonuses(gameStore.player.officers, Date.now())
    const maxQueue = publicLogic.getMaxBuildQueue(planet.value, bonuses.additionalBuildQueue)
    const buildingQueueCount = planet.value.buildQueue.filter(item => item.type === 'building' || item.type === 'demolish').length
    if (buildingQueueCount >= maxQueue) {
      return false
    }

    return true
  }

  // 获取拆除返还资源
  const getDemolishRefund = (buildingType: BuildingType): Resources => {
    const currentLevel = getBuildingLevel(buildingType)
    return buildingLogic.calculateDemolishRefund(buildingType, currentLevel)
  }

  // 检查是否可以添加到等待队列
  const canAddToWaitingQueue = (buildingType: BuildingType): boolean => {
    if (!planet.value) return false

    const config = BUILDINGS.value[buildingType]
    const currentLevel = getBuildingLevel(buildingType)

    // 计算目标等级：当前等级 + 正式队列中的升级数 + 等待队列中的升级数 + 1
    const upgradesInBuildQueue = planet.value.buildQueue.filter(q => q.type === 'building' && q.itemType === buildingType).length
    const waitingQueue = planet.value.waitingBuildQueue || []
    const upgradesInWaitingQueue = waitingQueue.filter(q => q.type === 'building' && q.itemType === buildingType).length
    const targetLevel = currentLevel + upgradesInBuildQueue + upgradesInWaitingQueue + 1

    // 检查是否达到等级上限（使用计算后的目标等级）
    if (config.maxLevel !== undefined && targetLevel > config.maxLevel) {
      return false
    }

    // 检查目标等级的前置条件是否满足
    // 如果该建筑已经在队列中（正式或等待），说明基本条件已满足，跳过检查
    const alreadyInQueue = upgradesInBuildQueue > 0 || upgradesInWaitingQueue > 0
    if (!alreadyInQueue) {
      // 第一次添加时，检查当前等级+1的前置条件
      if (!checkUpgradeRequirements(buildingType)) {
        return false
      }
    } else {
      // 后续添加时，检查目标等级的前置条件
      const requirements = publicLogic.getLevelRequirements(config, targetLevel)
      if (requirements && Object.keys(requirements).length > 0) {
        if (!publicLogic.checkRequirements(planet.value, gameStore.player.technologies, requirements)) {
          return false
        }
      }
    }

    // 建筑可以多次排队（比如金属矿升级到2、3、4、5级）
    // 只需要检查等待队列是否已满
    const bonuses = officerLogic.calculateActiveBonuses(gameStore.player.officers, Date.now())
    const maxWaitingQueue = waitingQueueLogic.getMaxBuildWaitingQueue(planet.value, bonuses.additionalBuildQueue)
    if (waitingQueue.length >= maxWaitingQueue) {
      return false
    }

    return true
  }

  // 添加到等待队列
  const handleAddToWaiting = (buildingType: BuildingType, event: MouseEvent) => {
    if (!planet.value) return

    const currentLevel = getBuildingLevel(buildingType)

    // 计算目标等级：当前等级 + 正式队列中的升级数 + 等待队列中的升级数 + 1
    const upgradesInBuildQueue = planet.value.buildQueue.filter(q => q.type === 'building' && q.itemType === buildingType).length
    const waitingQueue = planet.value.waitingBuildQueue || []
    const upgradesInWaitingQueue = waitingQueue.filter(q => q.type === 'building' && q.itemType === buildingType).length
    const targetLevel = currentLevel + upgradesInBuildQueue + upgradesInWaitingQueue + 1

    const item = waitingQueueLogic.createBuildingWaitingItem(buildingType, targetLevel, planet.value.id)

    const result = waitingQueueLogic.canAddToBuildWaitingQueue(planet.value, item, gameStore.player.officers)
    if (!result.canAdd) {
      alertDialogTitle.value = t('queue.waitingQueueFull')
      alertDialogMessage.value = result.reason ? t(result.reason) : ''
      alertDialogShowRequirements.value = false
      alertDialogOpen.value = true
      return
    }

    // 触发抛物线动画
    triggerQueueAnimation(event, 'building')

    waitingQueueLogic.addToBuildWaitingQueue(planet.value, item)
  }
</script>
