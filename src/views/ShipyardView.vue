<template>
  <div v-if="planet" class="container mx-auto p-4 sm:p-6">
    <!-- 未解锁遮罩 -->
    <UnlockRequirement :required-building="BuildingType.Shipyard" :required-level="1" />

    <h1 class="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">{{ t('shipyardView.title') }}</h1>

    <!-- 舰队仓储显示 -->
    <div class="mb-4 sm:mb-6 p-3 sm:p-4 bg-muted/50 rounded-lg border">
      <div class="flex items-center justify-between">
        <div class="text-sm sm:text-base font-medium">{{ t('shipyardView.fleetStorage') }}:</div>
        <div class="text-sm sm:text-base font-bold">
          <span :class="fleetStorageUsage > maxFleetStorage ? 'text-destructive' : 'text-primary'">
            {{ formatNumber(fleetStorageUsage) }}
          </span>
          <span class="text-muted-foreground mx-1">/</span>
          <span>{{ formatNumber(maxFleetStorage) }}</span>
        </div>
      </div>
      <div class="mt-2">
        <div class="w-full bg-background rounded-full h-2.5 sm:h-3 overflow-hidden">
          <div
            class="h-full transition-all duration-300"
            :class="fleetStorageUsage > maxFleetStorage ? 'bg-destructive' : 'bg-primary'"
            :style="{ width: `${maxFleetStorage > 0 ? Math.min((fleetStorageUsage / maxFleetStorage) * 100, 100) : 0}%` }"
          />
        </div>
      </div>
    </div>

    <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
      <Card v-for="shipType in Object.values(ShipType)" :key="shipType" class="relative">
        <CardUnlockOverlay :requirements="SHIPS[shipType].requirements" />
        <CardHeader>
          <div class="mb-2">
            <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
              <CardTitle
                class="text-sm sm:text-base lg:text-lg cursor-pointer hover:text-primary transition-colors underline decoration-dotted underline-offset-4 order-2 sm:order-1"
                @click="detailDialog.openShip(shipType)"
              >
                {{ SHIPS[shipType].name }}
              </CardTitle>
              <Badge variant="secondary" class="text-xs whitespace-nowrap self-start order-1 sm:order-2">
                {{ formatNumber(planet.fleet[shipType] || 0) }}
              </Badge>
            </div>
          </div>
          <CardDescription class="text-xs sm:text-sm">{{ SHIPS[shipType].description }}</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="space-y-3 sm:space-y-4">
            <div class="grid grid-cols-2 gap-2 text-xs sm:text-sm">
              <div>
                <p class="text-muted-foreground">{{ t('shipyardView.attack') }}</p>
                <p class="font-medium">{{ SHIPS[shipType].attack }}</p>
              </div>
              <div>
                <p class="text-muted-foreground">{{ t('shipyardView.shield') }}</p>
                <p class="font-medium">{{ SHIPS[shipType].shield }}</p>
              </div>
              <div>
                <p class="text-muted-foreground">{{ t('shipyardView.speed') }}</p>
                <p class="font-medium">{{ SHIPS[shipType].speed }}</p>
              </div>
              <div>
                <p class="text-muted-foreground">{{ t('shipyardView.cargoCapacity') }}</p>
                <p class="font-medium">{{ formatNumber(SHIPS[shipType].cargoCapacity) }}</p>
              </div>
            </div>

            <div class="text-xs sm:text-sm space-y-1.5 sm:space-y-2">
              <p class="text-muted-foreground mb-1 sm:mb-2">{{ t('shipyardView.unitCost') }}:</p>
              <div class="space-y-1 sm:space-y-1.5">
                <div
                  v-for="resourceType in costResourceTypes"
                  :key="resourceType.key"
                  v-show="resourceType.key !== 'darkMatter' || SHIPS[shipType].cost.darkMatter > 0"
                  class="flex items-center gap-1.5 sm:gap-2"
                >
                  <ResourceIcon :type="resourceType.key" size="sm" />
                  <span class="text-xs">{{ t(`resources.${resourceType.key}`) }}:</span>
                  <span
                    class="font-medium text-xs sm:text-sm"
                    :class="getResourceCostColor(planet.resources[resourceType.key], SHIPS[shipType].cost[resourceType.key])"
                  >
                    {{ formatNumber(SHIPS[shipType].cost[resourceType.key]) }}
                  </span>
                </div>
              </div>
            </div>

            <div class="space-y-2">
              <Label :for="`quantity-${shipType}`" class="text-xs sm:text-sm">{{ t('shipyardView.buildQuantity') }}</Label>
              <Input
                :id="`quantity-${shipType}`"
                v-model.number="quantities[shipType]"
                type="number"
                min="0"
                placeholder="0"
                class="text-sm"
              />
            </div>

            <div v-if="quantities[shipType] > 0" class="text-xs sm:text-sm space-y-1.5 sm:space-y-2 p-2.5 sm:p-3 bg-muted rounded-lg">
              <p class="font-medium text-muted-foreground">{{ t('shipyardView.totalCost') }}:</p>
              <div class="space-y-1 sm:space-y-1.5">
                <div
                  v-for="resourceType in costResourceTypes"
                  :key="resourceType.key"
                  v-show="resourceType.key !== 'darkMatter' || getTotalCost(shipType).darkMatter > 0"
                  class="flex items-center gap-1.5 sm:gap-2"
                >
                  <ResourceIcon :type="resourceType.key" size="sm" />
                  <span class="text-xs">{{ t(`resources.${resourceType.key}`) }}:</span>
                  <span
                    class="font-medium text-xs sm:text-sm"
                    :class="getResourceCostColor(planet.resources[resourceType.key], getTotalCost(shipType)[resourceType.key])"
                  >
                    {{ formatNumber(getTotalCost(shipType)[resourceType.key]) }}
                  </span>
                </div>
              </div>
            </div>

            <Button @click="handleBuild(shipType, $event)" :disabled="!canBuild(shipType)" class="w-full">{{ t('shipyardView.build') }}</Button>

            <!-- 添加到等待队列按钮 -->
            <Button
              v-if="canAddToWaitingQueue(shipType)"
              @click="handleAddToWaiting(shipType, $event)"
              variant="outline"
              class="w-full"
            >
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
          <AlertDialogDescription class="whitespace-pre-line">
            {{ alertDialogMessage }}
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
  import { ShipType, BuildingType } from '@/types/game'
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
  import { Badge } from '@/components/ui/badge'
  import { Button } from '@/components/ui/button'
  import { Input } from '@/components/ui/input'
  import { Label } from '@/components/ui/label'
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
  import { formatNumber, getResourceCostColor } from '@/utils/format'
  import * as shipValidation from '@/logic/shipValidation'
  import * as publicLogic from '@/logic/publicLogic'
  import * as fleetStorageLogic from '@/logic/fleetStorageLogic'
  import * as shipLogic from '@/logic/shipLogic'
  import * as gameLogic from '@/logic/gameLogic'
  import * as waitingQueueLogic from '@/logic/waitingQueueLogic'
  import * as officerLogic from '@/logic/officerLogic'
  import { triggerQueueAnimation } from '@/composables/useQueueAnimation'

  const gameStore = useGameStore()
  const detailDialog = useDetailDialogStore()
  const { t } = useI18n()
  const { SHIPS } = useGameConfig()
  const planet = computed(() => gameStore.currentPlanet)

  // AlertDialog 状态
  const alertDialogOpen = ref(false)
  const alertDialogTitle = ref('')
  const alertDialogMessage = ref('')

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

  // 舰队仓储使用量
  const fleetStorageUsage = computed(() => {
    if (!planet.value) return 0
    return fleetStorageLogic.calculateFleetStorageUsage(planet.value.fleet)
  })

  // 舰队仓储上限
  const maxFleetStorage = computed(() => {
    if (!planet.value) return 0
    return fleetStorageLogic.calculateMaxFleetStorage(planet.value, gameStore.player.technologies)
  })

  // 每种舰船的建造数量
  const quantities = ref<Record<ShipType, number>>({
    [ShipType.LightFighter]: 0,
    [ShipType.HeavyFighter]: 0,
    [ShipType.Cruiser]: 0,
    [ShipType.Battleship]: 0,
    [ShipType.Battlecruiser]: 0,
    [ShipType.Bomber]: 0,
    [ShipType.Destroyer]: 0,
    [ShipType.SmallCargo]: 0,
    [ShipType.LargeCargo]: 0,
    [ShipType.ColonyShip]: 0,
    [ShipType.Recycler]: 0,
    [ShipType.EspionageProbe]: 0,
    [ShipType.SolarSatellite]: 0,
    [ShipType.DarkMatterHarvester]: 0,
    [ShipType.Deathstar]: 0
  })

  const buildShip = (shipType: ShipType, quantity: number): { success: boolean; reason?: string } => {
    if (!gameStore.currentPlanet) return { success: false }
    const validation = shipValidation.validateShipBuild(gameStore.currentPlanet, shipType, quantity, gameStore.player.technologies)
    if (!validation.valid) return { success: false, reason: validation.reason }

    // 追踪资源消耗（在扣除前计算成本）
    const totalCost = shipLogic.calculateShipCost(shipType, quantity)
    gameLogic.trackResourceConsumption(gameStore.player, totalCost)

    const queueItem = shipValidation.executeShipBuild(gameStore.currentPlanet, shipType, quantity, gameStore.player.officers)
    gameStore.currentPlanet.buildQueue.push(queueItem)
    return { success: true }
  }

  // 建造舰船
  const handleBuild = (shipType: ShipType, event: MouseEvent) => {
    // 防抖：防止快速点击
    if (isProcessing.value) return
    isProcessing.value = true
    setTimeout(() => {
      isProcessing.value = false
    }, DEBOUNCE_DELAY)

    const quantity = quantities.value[shipType]
    if (quantity <= 0) {
      alertDialogTitle.value = t('shipyardView.inputError')
      alertDialogMessage.value = t('shipyardView.inputErrorMessage')
      alertDialogOpen.value = true
      return
    }

    const result = buildShip(shipType, quantity)
    if (!result.success) {
      alertDialogTitle.value = t('shipyardView.buildFailed')
      alertDialogMessage.value = result.reason ? t(result.reason) : t('shipyardView.buildFailedMessage')
      alertDialogOpen.value = true
    } else {
      // 触发抛物线动画
      triggerQueueAnimation(event, 'ship')
      quantities.value[shipType] = 0
    }
  }

  // 检查是否可以建造
  const canBuild = (shipType: ShipType): boolean => {
    if (!planet.value) return false

    const quantity = quantities.value[shipType]
    if (quantity <= 0) return false

    const config = SHIPS.value[shipType]
    const totalCost = {
      metal: config.cost.metal * quantity,
      crystal: config.cost.crystal * quantity,
      deuterium: config.cost.deuterium * quantity,
      darkMatter: config.cost.darkMatter * quantity
    }

    // 检查舰队仓储空间是否足够
    if (!fleetStorageLogic.hasEnoughFleetStorage(planet.value, shipType, quantity, gameStore.player.technologies)) {
      return false
    }

    return (
      publicLogic.checkRequirements(planet.value, gameStore.player.technologies, config.requirements) &&
      planet.value.resources.metal >= totalCost.metal &&
      planet.value.resources.crystal >= totalCost.crystal &&
      planet.value.resources.deuterium >= totalCost.deuterium &&
      planet.value.resources.darkMatter >= totalCost.darkMatter
    )
  }

  // 计算总成本
  const getTotalCost = (shipType: ShipType) => {
    const quantity = quantities.value[shipType]
    const config = SHIPS.value[shipType]
    return {
      metal: config.cost.metal * quantity,
      crystal: config.cost.crystal * quantity,
      deuterium: config.cost.deuterium * quantity,
      darkMatter: config.cost.darkMatter * quantity
    }
  }

  // 检查是否可以添加到等待队列
  const canAddToWaitingQueue = (shipType: ShipType): boolean => {
    if (!planet.value) return false

    const quantity = quantities.value[shipType]
    if (quantity <= 0) return false

    // 检查前置条件是否满足
    const config = SHIPS.value[shipType]
    if (!publicLogic.checkRequirements(planet.value, gameStore.player.technologies, config.requirements)) {
      return false
    }

    // 检查舰队仓储空间是否足够
    if (!fleetStorageLogic.hasEnoughFleetStorage(planet.value, shipType, quantity, gameStore.player.technologies)) {
      return false
    }

    // 检查等待队列是否已满
    const bonuses = officerLogic.calculateActiveBonuses(gameStore.player.officers, Date.now())
    const maxWaitingQueue = waitingQueueLogic.getMaxBuildWaitingQueue(planet.value, bonuses.additionalBuildQueue)
    const waitingQueue = planet.value.waitingBuildQueue || []
    if (waitingQueue.length >= maxWaitingQueue) {
      return false
    }

    // 只有当建造按钮被禁用时（资源不足）才显示等待队列按钮
    return !canBuild(shipType)
  }

  // 添加到等待队列
  const handleAddToWaiting = (shipType: ShipType, event: MouseEvent) => {
    if (!planet.value) return

    const quantity = quantities.value[shipType]
    if (quantity <= 0) return

    const item = waitingQueueLogic.createShipWaitingItem(shipType, quantity, planet.value.id)

    const result = waitingQueueLogic.canAddToBuildWaitingQueue(planet.value, item, gameStore.player.officers)
    if (!result.canAdd) {
      alertDialogTitle.value = t('queue.waitingQueueFull')
      alertDialogMessage.value = result.reason ? t(result.reason) : ''
      alertDialogOpen.value = true
      return
    }

    // 触发抛物线动画
    triggerQueueAnimation(event, 'ship')

    waitingQueueLogic.addToBuildWaitingQueue(planet.value, item)
    quantities.value[shipType] = 0
  }
</script>
