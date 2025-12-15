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
            :style="{ width: `${Math.min((fleetStorageUsage / maxFleetStorage) * 100, 100)}%` }"
          />
        </div>
      </div>
    </div>

    <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
      <Card v-for="shipType in Object.values(ShipType)" :key="shipType" class="relative">
        <CardUnlockOverlay :requirements="SHIPS[shipType].requirements" />
        <CardHeader class="pb-3">
          <CardTitle
            class="text-sm sm:text-base lg:text-lg cursor-pointer hover:text-primary transition-colors underline decoration-dotted underline-offset-4 mb-2"
            @click="detailDialog.openShip(shipType)"
          >
            {{ SHIPS[shipType].name }}
          </CardTitle>
          <CardDescription class="text-xs sm:text-sm">
            <GameIcon 
                type="ship"
                :id="shipType"
                class="hover:scale-105 transition-transform duration-200 w-30 h-30"
              />
            {{ SHIPS[shipType].description }}
          </CardDescription>
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

            <Button @click="handleBuild(shipType)" :disabled="!canBuild(shipType)" class="w-full">{{ t('shipyardView.build') }}</Button>
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
  import { Button } from '@/components/ui/button'
  import { Input } from '@/components/ui/input'
  import { Label } from '@/components/ui/label'
  import ResourceIcon from '@/components/ResourceIcon.vue'
  import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
  } from '@/components/ui/alert-dialog'
  import UnlockRequirement from '@/components/UnlockRequirement.vue'
  import CardUnlockOverlay from '@/components/CardUnlockOverlay.vue'
  import { formatNumber, getResourceCostColor } from '@/utils/format'
  import * as shipValidation from '@/logic/shipValidation'
  import * as publicLogic from '@/logic/publicLogic'
  import * as fleetStorageLogic from '@/logic/fleetStorageLogic'
  import GameIcon from '@/components/ui/GameIcon.vue'

  const gameStore = useGameStore()
  const detailDialog = useDetailDialogStore()
  const { t } = useI18n()
  const { SHIPS } = useGameConfig()
  const planet = computed(() => gameStore.currentPlanet)

  // AlertDialog 状态
  const alertDialogOpen = ref(false)
  const alertDialogTitle = ref('')
  const alertDialogMessage = ref('')

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

  const buildShip = (shipType: ShipType, quantity: number): boolean => {
    if (!gameStore.currentPlanet) return false
    const validation = shipValidation.validateShipBuild(gameStore.currentPlanet, shipType, quantity, gameStore.player.technologies)
    if (!validation.valid) return false
    const queueItem = shipValidation.executeShipBuild(gameStore.currentPlanet, shipType, quantity, gameStore.player.officers)
    gameStore.currentPlanet.buildQueue.push(queueItem)
    return true
  }

  // 建造舰船
  const handleBuild = (shipType: ShipType) => {
    const quantity = quantities.value[shipType]
    if (quantity <= 0) {
      alertDialogTitle.value = t('shipyardView.inputError')
      alertDialogMessage.value = t('shipyardView.inputErrorMessage')
      alertDialogOpen.value = true
      return
    }

    const success = buildShip(shipType, quantity)
    if (!success) {
      alertDialogTitle.value = t('shipyardView.buildFailed')
      alertDialogMessage.value = t('shipyardView.buildFailedMessage')
      alertDialogOpen.value = true
    } else {
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
</script>
