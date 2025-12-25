<template>
  <div v-if="planet" class="container mx-auto p-4 sm:p-6">
    <!-- 未解锁遮罩 -->
    <UnlockRequirement :required-building="BuildingType.ResearchLab" :required-level="1" />

    <h1 class="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">{{ t('researchView.title') }}</h1>

    <div class="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
      <Card v-for="techType in Object.values(TechnologyType)" :key="techType" :data-tech="techType" class="relative">
        <CardUnlockOverlay :requirements="TECHNOLOGIES[techType].requirements" :currentLevel="getTechLevel(techType)" />
        <CardHeader>
          <div class="mb-2">
            <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
              <CardTitle
                class="text-sm sm:text-base lg:text-lg cursor-pointer hover:text-primary transition-colors underline decoration-dotted underline-offset-4 order-2 sm:order-1"
                @click="detailDialog.openTechnology(techType, getTechLevel(techType))"
              >
                {{ TECHNOLOGIES[techType].name }}
              </CardTitle>
              <Badge variant="secondary" class="text-xs whitespace-nowrap self-start order-1 sm:order-2">
                Lv {{ getTechLevel(techType) }}
              </Badge>
            </div>
          </div>
          <CardDescription class="text-xs sm:text-sm">{{ TECHNOLOGIES[techType].description }}</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="space-y-2.5 sm:space-y-3">
            <div class="text-xs sm:text-sm space-y-1.5 sm:space-y-2">
              <p class="text-muted-foreground mb-1 sm:mb-2">{{ t('researchView.researchCost') }}:</p>
              <div class="space-y-1 sm:space-y-1.5">
                <div
                  v-for="resourceType in costResourceTypes"
                  :key="resourceType.key"
                  v-show="resourceType.key !== 'darkMatter' || getTechnologyCost(techType, getTechLevel(techType) + 1).darkMatter > 0"
                  class="flex items-center gap-1.5 sm:gap-2"
                >
                  <ResourceIcon :type="resourceType.key" size="sm" />
                  <span class="text-xs">{{ t(`resources.${resourceType.key}`) }}:</span>
                  <span
                    class="font-medium text-xs sm:text-sm"
                    :class="
                      getResourceCostColor(
                        planet.resources[resourceType.key],
                        getTechnologyCost(techType, getTechLevel(techType) + 1)[resourceType.key]
                      )
                    "
                  >
                    {{ formatNumber(getTechnologyCost(techType, getTechLevel(techType) + 1)[resourceType.key]) }}
                  </span>
                </div>
              </div>
              <!-- 研究时间 -->
              <div class="flex items-center gap-1.5 sm:gap-2">
                <Clock class="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                <span class="font-medium text-xs sm:text-sm text-muted-foreground">{{ formatTime(getResearchTime(techType)) }}</span>
              </div>
            </div>

            <Button @click="handleResearch(techType, $event)" :disabled="!canResearch(techType)" class="w-full">
              {{ getResearchButtonText(techType) }}
            </Button>

            <!-- 添加到等待队列按钮 -->
            <Button v-if="canAddToWaitingQueue(techType)" @click="handleAddToWaiting(techType, $event)" variant="outline" class="w-full">
              {{ t('queue.addToWaiting') }}
            </Button>
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
  </div>
</template>

<script setup lang="ts">
  import { useGameStore } from '@/stores/gameStore'
  import { useDetailDialogStore } from '@/stores/detailDialogStore'
  import { useI18n } from '@/composables/useI18n'
  import { useGameConfig } from '@/composables/useGameConfig'
  import { computed, ref } from 'vue'
  import { TechnologyType, BuildingType } from '@/types/game'
  import type { Resources } from '@/types/game'
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
  import { Button } from '@/components/ui/button'
  import { Badge } from '@/components/ui/badge'
  import ResourceIcon from '@/components/common/ResourceIcon.vue'
  import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
  } from '@/components/ui/alert-dialog'
  import UnlockRequirement from '@/components/common/UnlockRequirement.vue'
  import CardUnlockOverlay from '@/components/common/CardUnlockOverlay.vue'
  import { Check, X, Clock } from 'lucide-vue-next'
  import { formatNumber, formatTime, getResourceCostColor } from '@/utils/format'
  import * as publicLogic from '@/logic/publicLogic'
  import * as researchLogic from '@/logic/researchLogic'
  import * as researchValidation from '@/logic/researchValidation'
  import * as gameLogic from '@/logic/gameLogic'
  import * as officerLogic from '@/logic/officerLogic'
  import * as waitingQueueLogic from '@/logic/waitingQueueLogic'
  import { triggerQueueAnimation } from '@/composables/useQueueAnimation'

  const gameStore = useGameStore()
  const detailDialog = useDetailDialogStore()
  const { t } = useI18n()
  const { TECHNOLOGIES, BUILDINGS } = useGameConfig()
  const planet = computed(() => gameStore.currentPlanet)
  const player = computed(() => gameStore.player)

  // AlertDialog 状态
  const alertDialogOpen = ref(false)
  const alertDialogTitle = ref('')
  const alertDialogMessage = ref('')
  const alertDialogRequirements = ref<Array<{ name: string; requiredLevel: number; currentLevel: number; met: boolean }>>([])
  const alertDialogShowRequirements = ref(false)

  // 防抖状态：防止快速点击
  const isProcessing = ref(false)
  const DEBOUNCE_DELAY = 300 // 防抖延迟（毫秒）

  // 资源类型配置（用于成本显示）
  const costResourceTypes = [
    { key: 'metal' as const },
    { key: 'crystal' as const },
    { key: 'deuterium' as const },
    { key: 'darkMatter' as const }
  ]

  const researchTechnology = (techType: TechnologyType): boolean => {
    if (!gameStore.currentPlanet) return false
    const validation = researchValidation.validateTechnologyResearch(
      gameStore.currentPlanet,
      techType,
      gameStore.player.technologies,
      gameStore.player.researchQueue
    )
    if (!validation.valid) return false
    const currentLevel = gameStore.player.technologies[techType] || 0

    // 追踪资源消耗（在扣除前计算成本）
    const cost = researchLogic.calculateTechnologyCost(techType, currentLevel + 1)
    gameLogic.trackResourceConsumption(gameStore.player, cost)

    const { queueItem } = researchValidation.executeTechnologyResearch(
      gameStore.currentPlanet,
      techType,
      currentLevel,
      gameStore.player.officers,
      gameStore.player.technologies
    )
    gameStore.player.researchQueue.push(queueItem)
    return true
  }

  // 检查升级前置条件是否满足
  const checkUpgradeRequirements = (techType: TechnologyType): boolean => {
    if (!planet.value) return false
    const config = TECHNOLOGIES.value[techType]
    const currentLevel = getTechLevel(techType)
    const targetLevel = currentLevel + 1

    // 获取目标等级的所有前置条件（包括等级门槛）
    const requirements = publicLogic.getLevelRequirements(config, targetLevel)

    if (!requirements || Object.keys(requirements).length === 0) return true
    return publicLogic.checkRequirements(planet.value, gameStore.player.technologies, requirements)
  }

  // 获取研究按钮文本
  const getResearchButtonText = (techType: TechnologyType): string => {
    if (!planet.value) return t('researchView.research')

    const config = TECHNOLOGIES.value[techType]
    const currentLevel = getTechLevel(techType)

    // 检查是否达到等级上限
    if (config.maxLevel !== undefined && currentLevel >= config.maxLevel) {
      return t('researchView.maxLevelReached') // "等级已满"
    }

    // 检查研究队列是否已满
    const maxQueue = publicLogic.getMaxResearchQueue(gameStore.player.technologies)
    if (player.value.researchQueue.length >= maxQueue) {
      return t('researchView.research')
    }

    // 检查前置条件
    if (!checkUpgradeRequirements(techType)) {
      return t('buildingsView.requirementsNotMet') // "条件不足"
    }

    return t('researchView.research') // "研究"
  }

  // 获取前置条件列表
  const getRequirementsList = (
    techType: TechnologyType
  ): Array<{ name: string; requiredLevel: number; currentLevel: number; met: boolean }> => {
    const config = TECHNOLOGIES.value[techType]
    const currentLevel = getTechLevel(techType)
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

  // 研究科技
  const handleResearch = (techType: TechnologyType, event: MouseEvent) => {
    // 防抖：防止快速点击
    if (isProcessing.value) return
    isProcessing.value = true
    setTimeout(() => {
      isProcessing.value = false
    }, DEBOUNCE_DELAY)

    // 检查前置条件
    if (!checkUpgradeRequirements(techType)) {
      alertDialogTitle.value = t('common.requirementsNotMet')
      alertDialogRequirements.value = getRequirementsList(techType)
      alertDialogShowRequirements.value = true
      alertDialogMessage.value = ''
      alertDialogOpen.value = true
      return
    }

    const success = researchTechnology(techType)
    if (!success) {
      alertDialogTitle.value = t('researchView.researchFailed')
      alertDialogMessage.value = t('researchView.researchFailedMessage')
      alertDialogShowRequirements.value = false
      alertDialogOpen.value = true
    } else {
      // 触发抛物线动画
      triggerQueueAnimation(event, 'technology')
    }
  }

  // 获取科技等级
  const getTechLevel = (techType: TechnologyType): number => {
    return player.value.technologies[techType] || 0
  }

  // 检查是否可以研究
  const canResearch = (techType: TechnologyType): boolean => {
    if (!planet.value) return false

    const config = TECHNOLOGIES.value[techType]
    const currentLevel = getTechLevel(techType)

    // 检查是否达到等级上限
    if (config.maxLevel !== undefined && currentLevel >= config.maxLevel) {
      return false
    }

    // 检查队列中是否已存在该科技的研究任务
    const existingQueueItem = player.value.researchQueue.find(item => item.type === 'technology' && item.itemType === techType)
    if (existingQueueItem) {
      return false
    }

    // 检查研究队列是否已满
    const maxQueue = publicLogic.getMaxResearchQueue(gameStore.player.technologies)
    if (player.value.researchQueue.length >= maxQueue) {
      return false
    }

    const cost = getTechnologyCost(techType, currentLevel + 1)

    return (
      publicLogic.checkRequirements(planet.value, gameStore.player.technologies, config.requirements) &&
      planet.value.resources.metal >= cost.metal &&
      planet.value.resources.crystal >= cost.crystal &&
      planet.value.resources.deuterium >= cost.deuterium &&
      planet.value.resources.darkMatter >= cost.darkMatter
    )
  }

  const getTechnologyCost = (techType: TechnologyType, targetLevel: number): Resources => {
    return researchLogic.calculateTechnologyCost(techType, targetLevel)
  }

  // 获取研究时间（秒）
  const getResearchTime = (techType: TechnologyType): number => {
    if (!planet.value) return 0
    const currentLevel = getTechLevel(techType)
    const researchLabLevel = planet.value.buildings['researchLab'] || 0
    const energyTechLevel = player.value.technologies['energyTechnology'] || 0
    const bonuses = officerLogic.calculateActiveBonuses(player.value.officers, gameStore.gameTime)

    return researchLogic.calculateTechnologyTime(techType, currentLevel, bonuses.researchSpeedBonus, researchLabLevel, energyTechLevel)
  }

  // 检查是否可以添加到等待队列
  const canAddToWaitingQueue = (techType: TechnologyType): boolean => {
    if (!planet.value) return false

    const config = TECHNOLOGIES.value[techType]
    const currentLevel = getTechLevel(techType)

    // 计算目标等级：当前等级 + 正式队列中的升级数 + 等待队列中的升级数 + 1
    const upgradesInResearchQueue = player.value.researchQueue.filter(q => q.type === 'technology' && q.itemType === techType).length
    const waitingQueue = player.value.waitingResearchQueue || []
    const upgradesInWaitingQueue = waitingQueue.filter(q => q.type === 'technology' && q.itemType === techType).length
    const targetLevel = currentLevel + upgradesInResearchQueue + upgradesInWaitingQueue + 1

    // 检查是否达到等级上限（使用计算后的目标等级）
    if (config.maxLevel !== undefined && targetLevel > config.maxLevel) {
      return false
    }

    // 检查目标等级的前置条件是否满足
    // 如果该科技已经在队列中（正式或等待），说明基本条件已满足，跳过检查
    const alreadyInQueue = upgradesInResearchQueue > 0 || upgradesInWaitingQueue > 0
    if (!alreadyInQueue) {
      // 第一次添加时，检查当前等级+1的前置条件
      if (!checkUpgradeRequirements(techType)) {
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

    // 科技可以多次排队（比如能源技术升级到2、3、4、5级）
    // 只需要检查等待队列是否已满
    const maxWaitingQueue = waitingQueueLogic.getMaxResearchWaitingQueue(player.value.technologies)
    if (waitingQueue.length >= maxWaitingQueue) {
      return false
    }

    return true
  }

  // 添加到等待队列
  const handleAddToWaiting = (techType: TechnologyType, event: MouseEvent) => {
    const currentLevel = getTechLevel(techType)

    // 计算目标等级：当前等级 + 正式队列中的升级数 + 等待队列中的升级数 + 1
    const upgradesInResearchQueue = player.value.researchQueue.filter(q => q.type === 'technology' && q.itemType === techType).length
    const waitingQueue = player.value.waitingResearchQueue || []
    const upgradesInWaitingQueue = waitingQueue.filter(q => q.type === 'technology' && q.itemType === techType).length
    const targetLevel = currentLevel + upgradesInResearchQueue + upgradesInWaitingQueue + 1

    const item = waitingQueueLogic.createResearchWaitingItem(techType, targetLevel)

    const result = waitingQueueLogic.canAddToResearchWaitingQueue(player.value, item)
    if (!result.canAdd) {
      alertDialogTitle.value = t('queue.waitingQueueFull')
      alertDialogMessage.value = result.reason ? t(result.reason) : ''
      alertDialogShowRequirements.value = false
      alertDialogOpen.value = true
      return
    }

    // 触发抛物线动画
    triggerQueueAnimation(event, 'technology')

    waitingQueueLogic.addToResearchWaitingQueue(player.value, item)
  }
</script>
