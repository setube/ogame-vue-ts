<template>
  <Dialog v-model:open="isOpen">
    <ScrollableDialogContent container-class="sm:max-w-4xl max-h-[90vh]">
      <template #header>
        <DialogHeader>
          <DialogTitle class="flex items-center gap-2">
            <Sword class="h-5 w-5" />
            {{ t('messagesView.battleReport') }}
          </DialogTitle>
          <DialogDescription v-if="report">
            {{ formatDate(report.timestamp) }}
          </DialogDescription>
        </DialogHeader>
      </template>

      <div v-if="report" class="space-y-4">
        <!-- 战斗动画切换 -->
        <div v-if="report.roundDetails && report.roundDetails.length > 0" class="flex items-center justify-between gap-2">
          <!-- 左侧: 回合进度 (仅在动画模式下显示) -->
          <div v-if="showAnimation && animationPlayerRef" class="flex items-center gap-1.5 text-sm text-muted-foreground">
            <span class="font-medium text-foreground">{{ animationPlayerRef.currentRoundIndex }}</span>
            <span>/</span>
            <span>{{ animationPlayerRef.totalRounds }}</span>
            <span class="text-xs">{{ t('messagesView.roundsPlayed') }}</span>
          </div>
          <div v-else />
          <!-- 右侧: 切换按钮 -->
          <Button variant="outline" size="sm" @click="showAnimation = !showAnimation" class="gap-2">
            <component :is="showAnimation ? FileText : Clapperboard" class="h-4 w-4" />
            {{ showAnimation ? t('messagesView.showDetails') : t('messagesView.playAnimation') }}
          </Button>
        </div>

        <!-- 战斗动画播放器 -->
        <BattleAnimationPlayer
          v-if="showAnimation && report.roundDetails && report.roundDetails.length > 0"
          ref="animationPlayerRef"
          :report="report"
          @complete="onAnimationComplete"
        />

        <!-- 详细信息（动画播放时隐藏） -->
        <template v-if="!showAnimation">
          <!-- 战斗双方信息 -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- 攻击方星球 -->
            <div class="p-4 rounded-lg border" :class="getSideResultStyle('attacker')">
              <div class="flex items-center gap-3">
                <div class="p-2 bg-background rounded-full border">
                  <Sword class="h-5 w-5" />
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex flex-wrap items-center gap-2">
                    <p class="font-semibold">{{ t('simulatorView.attacker') }}</p>
                    <Badge v-if="playerSide === 'attacker'" variant="secondary">{{ t('simulatorView.you') }}</Badge>
                    <span class="text-xs font-medium">{{ getSideResultLabel('attacker') }}</span>
                  </div>
                  <p v-if="attackerPlanet" class="text-sm text-muted-foreground truncate">
                    {{ attackerPlanet.name }} [{{ attackerPlanet.position.galaxy }}:{{ attackerPlanet.position.system }}:{{
                      attackerPlanet.position.position
                    }}]
                  </p>
                  <p v-else-if="!playerSide" class="text-sm text-muted-foreground">{{ report.attackerPlanetId }}</p>
                </div>
              </div>
            </div>

            <!-- 防守方星球 -->
            <div class="p-4 rounded-lg border" :class="getSideResultStyle('defender')">
              <div class="flex items-center gap-3">
                <div class="p-2 bg-background rounded-full border">
                  <ShieldIcon class="h-5 w-5" />
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex flex-wrap items-center gap-2">
                    <p class="font-semibold">{{ t('simulatorView.defender') }}</p>
                    <Badge v-if="playerSide === 'defender'" variant="secondary">{{ t('simulatorView.you') }}</Badge>
                    <span class="text-xs font-medium">{{ getSideResultLabel('defender') }}</span>
                  </div>
                  <p v-if="defenderPlanet" class="text-sm text-muted-foreground truncate">
                    {{ defenderPlanet.name }} [{{ defenderPlanet.position.galaxy }}:{{ defenderPlanet.position.system }}:{{
                      defenderPlanet.position.position
                    }}]
                  </p>
                  <p v-else-if="!playerSide" class="text-sm text-muted-foreground">{{ report.defenderPlanetId }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- 胜利者 -->
          <div class="text-center p-5 rounded-lg border" :class="getPlayerResultStyle()">
            <p class="text-xl font-bold">
              {{
                report.winner === 'draw' ? t('messagesView.draw') : isPlayerVictory ? t('messagesView.victory') : t('messagesView.defeat')
              }}
            </p>
            <p v-if="report.rounds" class="text-sm text-muted-foreground mt-1">
              {{ t('simulatorView.afterRounds').replace('{rounds}', String(report.rounds)) }}
            </p>
          </div>

          <!-- 损失对比 -->
          <div class="space-y-3">
            <h4 class="font-semibold text-sm">{{ t('messagesView.losses') }}</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- 攻击方损失 -->
              <div class="p-3 bg-muted/50 rounded-lg border">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm font-medium">{{ t('simulatorView.attacker') }}</span>
                  <Badge variant="secondary" class="text-xs">{{ getTotalLossCount(report.attackerLosses) }}</Badge>
                </div>
                <div class="space-y-1.5">
                  <div v-for="(count, shipType) in report.attackerLosses" :key="shipType" class="flex items-center justify-between text-xs">
                    <span class="text-muted-foreground truncate">{{ SHIPS[shipType].name }}</span>
                    <span class="font-medium text-destructive">-{{ count }}</span>
                  </div>
                  <p v-if="Object.keys(report.attackerLosses).length === 0" class="text-xs text-muted-foreground text-center py-2">
                    {{ t('messagesView.noLosses') }}
                  </p>
                </div>
              </div>

              <!-- 防守方损失 -->
              <div class="p-3 bg-muted/50 rounded-lg border">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm font-medium">{{ t('simulatorView.defender') }}</span>
                  <Badge variant="secondary" class="text-xs">{{ getTotalDefenderLossCount(report.defenderLosses) }}</Badge>
                </div>
                <div class="space-y-1.5">
                  <div
                    v-for="(count, shipType) in report.defenderLosses.fleet"
                    :key="shipType"
                    class="flex items-center justify-between text-xs"
                  >
                    <span class="text-muted-foreground truncate">{{ SHIPS[shipType].name }}</span>
                    <span class="font-medium text-destructive">-{{ count }}</span>
                  </div>
                  <div
                    v-for="(count, defenseType) in report.defenderLosses.defense"
                    :key="defenseType"
                    class="flex items-center justify-between text-xs"
                  >
                    <span class="text-muted-foreground truncate">{{ DEFENSES[defenseType].name }}</span>
                    <span class="font-medium text-destructive">-{{ count }}</span>
                  </div>
                  <p
                    v-if="Object.keys(report.defenderLosses.fleet).length === 0 && Object.keys(report.defenderLosses.defense).length === 0"
                    class="text-xs text-muted-foreground text-center py-2"
                  >
                    {{ t('messagesView.noLosses') }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- 剩余单位 -->
          <div v-if="hasAnyRemaining" class="space-y-3">
            <h4 class="font-semibold text-sm">{{ t('messagesView.remainingUnits') }}</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- 攻击方剩余 -->
              <div class="p-3 bg-muted/50 rounded-lg border">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm font-medium">{{ t('simulatorView.attacker') }}</span>
                  <Badge v-if="report.attackerRemaining" variant="outline" class="text-xs">
                    {{ getTotalLossCount(report.attackerRemaining) }}
                  </Badge>
                </div>
                <div class="space-y-1.5">
                  <template v-if="report.attackerRemaining && Object.keys(report.attackerRemaining).length > 0">
                    <div
                      v-for="(count, shipType) in report.attackerRemaining"
                      :key="shipType"
                      class="flex items-center justify-between p-1.5 bg-white/50 dark:bg-black/20 rounded text-xs"
                    >
                      <span class="text-muted-foreground truncate">{{ SHIPS[shipType].name }}</span>
                      <span class="font-bold">{{ count }}</span>
                    </div>
                  </template>
                  <p v-else class="text-xs text-muted-foreground text-center py-2">{{ t('messagesView.allDestroyed') }}</p>
                </div>
              </div>

              <!-- 防守方剩余 -->
              <div class="p-3 bg-muted/50 rounded-lg border">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm font-medium">{{ t('simulatorView.defender') }}</span>
                  <Badge v-if="report.defenderRemaining" variant="outline" class="text-xs">
                    {{ getTotalDefenderRemainingCount(report.defenderRemaining) }}
                  </Badge>
                </div>
                <div class="space-y-1.5">
                  <template
                    v-if="
                      report.defenderRemaining &&
                      (Object.keys(report.defenderRemaining.fleet || {}).length > 0 ||
                        Object.keys(report.defenderRemaining.defense || {}).length > 0)
                    "
                  >
                    <div
                      v-for="(count, shipType) in report.defenderRemaining.fleet"
                      :key="shipType"
                      class="flex items-center justify-between p-1.5 bg-white/50 dark:bg-black/20 rounded text-xs"
                    >
                      <span class="text-muted-foreground truncate">{{ SHIPS[shipType].name }}</span>
                      <span class="font-bold">{{ count }}</span>
                    </div>
                    <div
                      v-for="(count, defenseType) in report.defenderRemaining.defense"
                      :key="defenseType"
                      class="flex items-center justify-between p-1.5 bg-white/50 dark:bg-black/20 rounded text-xs"
                    >
                      <span class="text-muted-foreground truncate">{{ DEFENSES[defenseType].name }}</span>
                      <span class="font-bold">{{ count }}</span>
                    </div>
                  </template>
                  <p v-else class="text-xs text-muted-foreground text-center py-2">{{ t('messagesView.allDestroyed') }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- 掠夺资源 -->
          <div
            v-if="report.plunder && (report.plunder.metal > 0 || report.plunder.crystal > 0 || report.plunder.deuterium > 0)"
            class="space-y-3"
          >
            <div class="flex items-center gap-2">
              <Package class="h-4 w-4" />
              <h4 class="font-semibold text-sm">{{ t('messagesView.plunder') }}</h4>
            </div>
            <div class="grid grid-cols-3 gap-3">
              <div v-if="report.plunder.metal > 0" class="p-3 bg-muted/50 rounded-lg border">
                <div class="flex items-center gap-2 mb-1">
                  <ResourceIcon type="metal" size="sm" />
                  <span class="text-xs text-muted-foreground">{{ t('resources.metal') }}</span>
                </div>
                <p class="text-lg font-bold">+{{ formatNumber(report.plunder.metal) }}</p>
              </div>
              <div v-if="report.plunder.crystal > 0" class="p-3 bg-muted/50 rounded-lg border">
                <div class="flex items-center gap-2 mb-1">
                  <ResourceIcon type="crystal" size="sm" />
                  <span class="text-xs text-muted-foreground">{{ t('resources.crystal') }}</span>
                </div>
                <p class="text-lg font-bold">+{{ formatNumber(report.plunder.crystal) }}</p>
              </div>
              <div v-if="report.plunder.deuterium > 0" class="p-3 bg-muted/50 rounded-lg border">
                <div class="flex items-center gap-2 mb-1">
                  <ResourceIcon type="deuterium" size="sm" />
                  <span class="text-xs text-muted-foreground">{{ t('resources.deuterium') }}</span>
                </div>
                <p class="text-lg font-bold">+{{ formatNumber(report.plunder.deuterium) }}</p>
              </div>
            </div>
          </div>

          <!-- 残骸场 -->
          <div v-if="report.debrisField && (report.debrisField.metal > 0 || report.debrisField.crystal > 0)" class="space-y-3">
            <div class="flex items-center gap-2">
              <Recycle class="h-4 w-4" />
              <h4 class="font-semibold text-sm">{{ t('messagesView.debrisField') }}</h4>
            </div>
            <div class="p-4 bg-muted/50 rounded-lg border">
              <div class="grid grid-cols-2 gap-4">
                <div v-if="report.debrisField.metal > 0" class="flex items-center gap-3">
                  <div class="p-2 bg-background rounded-full border">
                    <ResourceIcon type="metal" size="sm" />
                  </div>
                  <div>
                    <p class="text-xs text-muted-foreground">{{ t('resources.metal') }}</p>
                    <p class="font-bold">{{ formatNumber(report.debrisField.metal) }}</p>
                  </div>
                </div>
                <div v-if="report.debrisField.crystal > 0" class="flex items-center gap-3">
                  <div class="p-2 bg-background rounded-full border">
                    <ResourceIcon type="crystal" size="sm" />
                  </div>
                  <div>
                    <p class="text-xs text-muted-foreground">{{ t('resources.crystal') }}</p>
                    <p class="font-bold">{{ formatNumber(report.debrisField.crystal) }}</p>
                  </div>
                </div>
              </div>
              <!-- 月球生成概率 -->
              <div v-if="report.moonChance && report.moonChance > 0" class="mt-3 pt-3 border-t">
                <div class="flex items-center justify-center gap-2">
                  <Moon class="h-4 w-4" />
                  <span class="text-sm">{{ t('messagesView.moonChance') }}:</span>
                  <span class="font-bold">{{ (report.moonChance * 100).toFixed(1) }}%</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 回合详情 -->
          <div v-if="report.roundDetails && report.roundDetails.length > 0" class="space-y-3">
            <Button @click="showRoundDetails = !showRoundDetails" variant="outline" size="sm" class="w-full gap-2">
              <ListOrdered class="h-4 w-4" />
              {{ showRoundDetails ? t('messagesView.hideRoundDetails') : t('messagesView.showRoundDetails') }}
              <ChevronDown class="h-4 w-4 transition-transform" :class="{ 'rotate-180': showRoundDetails }" />
            </Button>

            <div v-if="showRoundDetails" class="relative pl-6 space-y-4">
              <!-- 时间线 -->
              <div class="absolute left-2 top-0 bottom-0 w-0.5 bg-border" />

              <div v-for="detail in report.roundDetails" :key="detail.round" class="relative">
                <!-- 时间线节点 -->
                <div class="absolute -left-6 top-3 w-4 h-4 rounded-full bg-primary border-2 border-background shadow-md" />

                <!-- 回合内容卡片 -->
                <div class="border rounded-lg p-4 bg-card hover:shadow-md transition-shadow">
                  <div class="flex items-center justify-between mb-3">
                    <div class="flex items-center gap-2">
                      <Badge variant="outline">{{ t('messagesView.round').replace('{round}', String(detail.round)) }}</Badge>
                    </div>
                    <TooltipProvider :delay-duration="300">
                      <div class="flex gap-4 text-xs">
                        <Tooltip>
                          <TooltipTrigger as-child>
                            <span class="flex items-center gap-1.5">
                              <Sword class="h-3.5 w-3.5" />
                              <span class="font-medium">{{ formatNumber(detail.attackerRemainingPower) }}</span>
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{{ t('messagesView.attackerRemainingPower') }}</p>
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger as-child>
                            <span class="flex items-center gap-1.5">
                              <ShieldIcon class="h-3.5 w-3.5" />
                              <span class="font-medium">{{ formatNumber(detail.defenderRemainingPower) }}</span>
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{{ t('messagesView.defenderRemainingPower') }}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </TooltipProvider>
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <!-- 攻击方本回合损失 -->
                    <div class="bg-muted/50 rounded-lg p-3 border">
                      <p class="text-xs font-medium mb-2">{{ t('messagesView.attackerLosses') }}</p>
                      <div class="space-y-1">
                        <div
                          v-for="(count, shipType) in detail.attackerLosses"
                          :key="shipType"
                          class="flex justify-between text-xs p-1 bg-white/50 dark:bg-black/20 rounded"
                        >
                          <span class="text-muted-foreground">{{ SHIPS[shipType].name }}</span>
                          <span class="font-bold text-red-600 dark:text-red-400">-{{ count }}</span>
                        </div>
                        <p v-if="Object.keys(detail.attackerLosses).length === 0" class="text-xs text-muted-foreground text-center py-1">
                          {{ t('messagesView.noLosses') }}
                        </p>
                      </div>
                    </div>

                    <!-- 防守方本回合损失 -->
                    <div class="bg-muted/50 rounded-lg p-3 border">
                      <p class="text-xs font-medium mb-2">{{ t('messagesView.defenderLosses') }}</p>
                      <div class="space-y-1">
                        <div
                          v-for="(count, shipType) in detail.defenderLosses.fleet"
                          :key="shipType"
                          class="flex justify-between text-xs p-1 bg-white/50 dark:bg-black/20 rounded"
                        >
                          <span class="text-muted-foreground">{{ SHIPS[shipType].name }}</span>
                          <span class="font-bold text-red-600 dark:text-red-400">-{{ count }}</span>
                        </div>
                        <div
                          v-for="(count, defenseType) in detail.defenderLosses.defense"
                          :key="defenseType"
                          class="flex justify-between text-xs p-1 bg-white/50 dark:bg-black/20 rounded"
                        >
                          <span class="text-muted-foreground">{{ DEFENSES[defenseType].name }}</span>
                          <span class="font-bold text-red-600 dark:text-red-400">-{{ count }}</span>
                        </div>
                        <p
                          v-if="
                            Object.keys(detail.defenderLosses.fleet).length === 0 && Object.keys(detail.defenderLosses.defense).length === 0
                          "
                          class="text-xs text-muted-foreground text-center py-1"
                        >
                          {{ t('messagesView.noLosses') }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </ScrollableDialogContent>
  </Dialog>
</template>

<script setup lang="ts">
  import { ref, watch, computed } from 'vue'
  import { useGameStore } from '@/stores/gameStore'
  import { useUniverseStore } from '@/stores/universeStore'
  import { useI18n } from '@/composables/useI18n'
  import { useGameConfig } from '@/composables/useGameConfig'
  import { Dialog, ScrollableDialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
  import { Button } from '@/components/ui/button'
  import { Badge } from '@/components/ui/badge'
  import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
  import ResourceIcon from '@/components/common/ResourceIcon.vue'
  import { formatNumber, formatDate } from '@/utils/format'
  import { Sword, Shield as ShieldIcon, Package, Recycle, Moon, ListOrdered, ChevronDown, Clapperboard, FileText } from 'lucide-vue-next'
  import BattleAnimationPlayer from './BattleAnimationPlayer.vue'
  import type { BattleResult } from '@/types/game'

  const props = defineProps<{
    report: BattleResult | null
    open: boolean
    playerSide?: 'attacker' | 'defender'
  }>()

  const emit = defineEmits<{
    (e: 'update:open', value: boolean): void
  }>()

  const gameStore = useGameStore()
  const universeStore = useUniverseStore()
  const { t } = useI18n()
  const { SHIPS, DEFENSES } = useGameConfig()

  const isOpen = ref(props.open)
  const showRoundDetails = ref(false)
  const showAnimation = ref(false)
  const animationPlayerRef = ref<InstanceType<typeof BattleAnimationPlayer> | null>(null)

  const onAnimationComplete = () => {
    // 动画完成后可以选择自动切换到详情视图
    // showAnimation.value = false
  }

  // 获取攻击方星球信息
  const attackerPlanet = computed(() => {
    if (!props.report) return null
    // 先从玩家星球中查找
    const playerPlanet = gameStore.player.planets.find(p => p.id === props.report!.attackerPlanetId)
    if (playerPlanet) return playerPlanet
    // 再从宇宙星球地图中查找（包括 NPC 星球）
    return Object.values(universeStore.planets).find(p => p.id === props.report!.attackerPlanetId)
  })

  // 获取防守方星球信息
  const defenderPlanet = computed(() => {
    if (!props.report) return null
    // 先从玩家星球中查找
    const playerPlanet = gameStore.player.planets.find(p => p.id === props.report!.defenderPlanetId)
    if (playerPlanet) return playerPlanet
    // 再从宇宙星球地图中查找（包括 NPC 星球）
    return Object.values(universeStore.planets).find(p => p.id === props.report!.defenderPlanetId)
  })

  // 判断玩家是攻击方还是防守方
  const isPlayerAttacker = computed(() => {
    if (props.playerSide) return props.playerSide === 'attacker'
    if (!props.report) return false
    return gameStore.player.planets.some(p => p.id === props.report!.attackerPlanetId)
  })

  // 判断玩家是否胜利
  const isPlayerVictory = computed(() => {
    if (!props.report) return false
    if (props.report.winner === 'draw') return false
    // 玩家是攻击方且攻击方胜利，或者玩家是防守方且防守方胜利
    return (isPlayerAttacker.value && props.report.winner === 'attacker') || (!isPlayerAttacker.value && props.report.winner === 'defender')
  })

  // 判断是否有任何剩余单位需要显示
  const hasAnyRemaining = computed(() => {
    if (!props.report) return false
    const hasAttackerRemaining = props.report.attackerRemaining && Object.keys(props.report.attackerRemaining).length > 0
    const hasDefenderRemaining =
      props.report.defenderRemaining &&
      (Object.keys(props.report.defenderRemaining.fleet || {}).length > 0 ||
        Object.keys(props.report.defenderRemaining.defense || {}).length > 0)
    return hasAttackerRemaining || hasDefenderRemaining
  })

  watch(
    () => props.open,
    newValue => {
      isOpen.value = newValue
      if (newValue) {
        showRoundDetails.value = false
        showAnimation.value = false
      }
    }
  )

  watch(isOpen, newValue => {
    emit('update:open', newValue)
  })

  const getSideResultLabel = (side: 'attacker' | 'defender') => {
    const winner = props.report?.winner
    if (winner === 'draw') return t('messagesView.draw')
    return t(winner === side ? 'messagesView.victory' : 'messagesView.defeat')
  }

  const getSideResultStyle = (side: 'attacker' | 'defender') => {
    const winner = props.report?.winner
    if (!winner || winner === 'draw')
      return 'bg-gray-50 dark:bg-gray-950/30 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300'
    if (winner === side)
      return 'bg-green-50 dark:bg-green-950/30 border-green-300 dark:border-green-800 text-green-700 dark:text-green-300'
    return 'bg-red-50 dark:bg-red-950/30 border-red-300 dark:border-red-800 text-red-700 dark:text-red-300'
  }

  const getPlayerResultStyle = () => getSideResultStyle(isPlayerAttacker.value ? 'attacker' : 'defender')

  // 获取攻击方损失总数
  const getTotalLossCount = (losses: Record<string, number>): number => {
    return Object.values(losses).reduce((sum, count) => sum + count, 0)
  }

  // 获取防守方损失总数
  const getTotalDefenderLossCount = (losses: { fleet: Record<string, number>; defense: Record<string, number> }): number => {
    const fleetLoss = Object.values(losses.fleet || {}).reduce((sum, count) => sum + count, 0)
    const defenseLoss = Object.values(losses.defense || {}).reduce((sum, count) => sum + count, 0)
    return fleetLoss + defenseLoss
  }

  // 获取防守方剩余总数
  const getTotalDefenderRemainingCount = (remaining: { fleet?: Record<string, number>; defense?: Record<string, number> }): number => {
    const fleetCount = Object.values(remaining.fleet || {}).reduce((sum, count) => sum + count, 0)
    const defenseCount = Object.values(remaining.defense || {}).reduce((sum, count) => sum + count, 0)
    return fleetCount + defenseCount
  }
</script>
