<template>
  <div v-if="planet" class="container mx-auto p-4 sm:p-6">
    <!-- 未解锁遮罩 -->
    <UnlockRequirement :required-building="BuildingType.Shipyard" :required-level="1" />

    <h1 class="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">{{ t('defenseView.title') }}</h1>

    <!-- 导弹容量显示 -->
    <div v-if="missileSiloCapacity > 0" class="mb-4 sm:mb-6 p-3 sm:p-4 bg-muted/50 rounded-lg border">
      <div class="flex items-center justify-between">
        <div class="text-sm sm:text-base font-medium">{{ t('defenseView.missileCapacity') }}:</div>
        <div class="text-sm sm:text-base font-bold">
          <span :class="currentMissileCount > missileSiloCapacity ? 'text-destructive' : 'text-primary'">
            {{ formatNumber(currentMissileCount) }}
          </span>
          <span class="text-muted-foreground mx-1">/</span>
          <span>{{ formatNumber(missileSiloCapacity) }}</span>
        </div>
      </div>
      <div class="mt-2">
        <div class="w-full bg-background rounded-full h-2.5 sm:h-3 overflow-hidden">
          <div
            class="h-full transition-all duration-300"
            :class="currentMissileCount > missileSiloCapacity ? 'bg-destructive' : 'bg-primary'"
            :style="{ width: `${Math.min((currentMissileCount / missileSiloCapacity) * 100, 100)}%` }"
          />
        </div>
      </div>
    </div>

    <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
      <Card v-for="defenseType in Object.values(DefenseType)" :key="defenseType" class="relative">
        <CardUnlockOverlay :requirements="DEFENSES[defenseType].requirements" />
        <CardHeader>
          <div class="mb-2">
            <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
              <CardTitle
                class="text-sm sm:text-base lg:text-lg cursor-pointer hover:text-primary transition-colors underline decoration-dotted underline-offset-4 order-2 sm:order-1"
                @click="detailDialog.openDefense(defenseType)"
              >
                {{ DEFENSES[defenseType].name }}
              </CardTitle>
              <Badge variant="secondary" class="text-xs whitespace-nowrap self-start order-1 sm:order-2">
                {{ planet.defense[defenseType] }}
              </Badge>
            </div>
          </div>
          <CardDescription class="text-xs sm:text-sm">
            <GameIcon 
                type="defense"
                :id="defenseType"
                class="hover:scale-105 transition-transform duration-200 w-30 h-30"
              />
            {{ DEFENSES[defenseType].description }}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div class="space-y-3 sm:space-y-4">
            <div class="grid grid-cols-2 gap-2 text-xs sm:text-sm">
              <div>
                <p class="text-muted-foreground">{{ t('defenseView.attack') }}</p>
                <p class="font-medium">{{ DEFENSES[defenseType].attack }}</p>
              </div>
              <div>
                <p class="text-muted-foreground">{{ t('defenseView.shield') }}</p>
                <p class="font-medium">{{ DEFENSES[defenseType].shield }}</p>
              </div>
              <div>
                <p class="text-muted-foreground">{{ t('defenseView.armor') }}</p>
                <p class="font-medium">{{ DEFENSES[defenseType].armor }}</p>
              </div>
              <div>
                <p class="text-muted-foreground">{{ t('defenseView.buildTime') }}</p>
                <p class="font-medium">{{ DEFENSES[defenseType].buildTime }}{{ t('defenseView.seconds') }}</p>
              </div>
            </div>

            <div class="text-xs sm:text-sm space-y-1.5 sm:space-y-2">
              <p class="text-muted-foreground mb-1 sm:mb-2">{{ t('defenseView.unitCost') }}:</p>
              <div class="space-y-1 sm:space-y-1.5">
                <div
                  v-for="resourceType in costResourceTypes"
                  :key="resourceType.key"
                  v-show="resourceType.key !== 'darkMatter' || DEFENSES[defenseType].cost.darkMatter > 0"
                  class="flex items-center gap-1.5 sm:gap-2"
                >
                  <ResourceIcon :type="resourceType.key" size="sm" />
                  <span class="text-xs">{{ t(`resources.${resourceType.key}`) }}:</span>
                  <span
                    class="font-medium text-xs sm:text-sm"
                    :class="getResourceCostColor(planet.resources[resourceType.key], DEFENSES[defenseType].cost[resourceType.key])"
                  >
                    {{ formatNumber(DEFENSES[defenseType].cost[resourceType.key]) }}
                  </span>
                </div>
              </div>
            </div>

            <div class="space-y-2">
              <Label :for="`quantity-${defenseType}`" class="text-xs sm:text-sm">{{ t('defenseView.buildQuantity') }}</Label>
              <Input
                :id="`quantity-${defenseType}`"
                v-model.number="quantities[defenseType]"
                type="number"
                min="0"
                :max="isShieldDome(defenseType) && planet.defense[defenseType] > 0 ? 0 : undefined"
                :disabled="isShieldDome(defenseType) && planet.defense[defenseType] > 0"
                placeholder="0"
                class="text-sm"
              />
              <p v-if="isShieldDome(defenseType) && planet.defense[defenseType] > 0" class="text-xs text-muted-foreground">
                {{ t('defenseView.shieldDomeBuilt') }}
              </p>
            </div>

            <div v-if="quantities[defenseType] > 0" class="text-xs sm:text-sm space-y-1.5 sm:space-y-2 p-2.5 sm:p-3 bg-muted rounded-lg">
              <p class="font-medium text-muted-foreground">{{ t('defenseView.totalCost') }}:</p>
              <div class="space-y-1 sm:space-y-1.5">
                <div
                  v-for="resourceType in costResourceTypes"
                  :key="resourceType.key"
                  v-show="resourceType.key !== 'darkMatter' || getTotalCost(defenseType).darkMatter > 0"
                  class="flex items-center gap-1.5 sm:gap-2"
                >
                  <ResourceIcon :type="resourceType.key" size="sm" />
                  <span class="text-xs">{{ t(`resources.${resourceType.key}`) }}:</span>
                  <span
                    class="font-medium text-xs sm:text-sm"
                    :class="getResourceCostColor(planet.resources[resourceType.key], getTotalCost(defenseType)[resourceType.key])"
                  >
                    {{ formatNumber(getTotalCost(defenseType)[resourceType.key]) }}
                  </span>
                </div>
              </div>
            </div>

            <Button @click="handleBuild(defenseType)" :disabled="!canBuild(defenseType)" class="w-full">
              {{ t('defenseView.build') }}
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
  import { DefenseType, BuildingType } from '@/types/game'
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
  import { Button } from '@/components/ui/button'
  import { Input } from '@/components/ui/input'
  import { Label } from '@/components/ui/label'
  import { Badge } from '@/components/ui/badge'
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
  import * as publicLogic from '@/logic/publicLogic'
  import * as shipValidation from '@/logic/shipValidation'
  import * as shipLogic from '@/logic/shipLogic'
  import GameIcon from '@/components/ui/GameIcon.vue'

  const gameStore = useGameStore()
  const detailDialog = useDetailDialogStore()
  const { t } = useI18n()
  const { DEFENSES } = useGameConfig()
  const planet = computed(() => gameStore.currentPlanet)

  // 导弹容量相关计算
  const missileSiloCapacity = computed(() => {
    if (!planet.value) return 0
    return shipLogic.calculateMissileSiloCapacity(planet.value.buildings)
  })

  const currentMissileCount = computed(() => {
    if (!planet.value) return 0
    return shipLogic.calculateCurrentMissileCount(planet.value.defense)
  })

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

  // 每种防御设施的建造数量
  const quantities = ref<Record<DefenseType, number>>({
    [DefenseType.RocketLauncher]: 0,
    [DefenseType.LightLaser]: 0,
    [DefenseType.HeavyLaser]: 0,
    [DefenseType.GaussCannon]: 0,
    [DefenseType.IonCannon]: 0,
    [DefenseType.PlasmaTurret]: 0,
    [DefenseType.SmallShieldDome]: 0,
    [DefenseType.LargeShieldDome]: 0,
    [DefenseType.AntiBallisticMissile]: 0,
    [DefenseType.InterplanetaryMissile]: 0,
    [DefenseType.PlanetaryShield]: 0
  })

  // 判断是否为护盾罩
  const isShieldDome = (defenseType: DefenseType): boolean => {
    return defenseType === DefenseType.SmallShieldDome || defenseType === DefenseType.LargeShieldDome
  }

  const buildDefense = (defenseType: DefenseType, quantity: number): boolean => {
    const currentPlanet = gameStore.currentPlanet
    if (!currentPlanet) return false
    const validation = shipValidation.validateDefenseBuild(currentPlanet, defenseType, quantity, gameStore.player.technologies)
    if (!validation.valid) return false
    const queueItem = shipValidation.executeDefenseBuild(currentPlanet, defenseType, quantity, gameStore.player.officers)
    currentPlanet.buildQueue.push(queueItem)
    return true
  }

  // 建造防御设施
  const handleBuild = (defenseType: DefenseType) => {
    const quantity = quantities.value[defenseType]
    if (quantity <= 0) {
      alertDialogTitle.value = t('defenseView.inputError')
      alertDialogMessage.value = t('defenseView.inputErrorMessage')
      alertDialogOpen.value = true
      return
    }

    const success = buildDefense(defenseType, quantity)
    if (!success) {
      alertDialogTitle.value = t('defenseView.buildFailed')
      alertDialogMessage.value = t('defenseView.buildFailedMessage')
      alertDialogOpen.value = true
    } else {
      quantities.value[defenseType] = 0
    }
  }

  // 检查是否可以建造
  const canBuild = (defenseType: DefenseType): boolean => {
    if (!planet.value) return false

    const quantity = quantities.value[defenseType]
    if (quantity <= 0) return false

    // 护盾罩只能建造一个
    if (isShieldDome(defenseType)) {
      if (planet.value.defense[defenseType] > 0) return false
      if (quantity > 1) return false
    }

    const config = DEFENSES.value[defenseType]
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
  const getTotalCost = (defenseType: DefenseType) => {
    const quantity = quantities.value[defenseType]
    const config = DEFENSES.value[defenseType]
    return {
      metal: config.cost.metal * quantity,
      crystal: config.cost.crystal * quantity,
      deuterium: config.cost.deuterium * quantity,
      darkMatter: config.cost.darkMatter * quantity
    }
  }
</script>
