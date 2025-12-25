<template>
  <Popover v-model:open="isOpen">
    <PopoverTrigger as-child>
      <Button data-tutorial="queue-button" variant="outline" size="icon" class="relative">
        <ListOrdered class="h-4 w-4" />
        <Badge
          v-if="totalQueueCount > 0"
          variant="default"
          class="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
        >
          {{ totalQueueCount }}
        </Badge>
      </Button>
    </PopoverTrigger>
    <PopoverContent class="w-96 p-0" align="end">
      <div class="flex items-center justify-between p-4 border-b">
        <h3 class="font-semibold">{{ t('queue.title') }} ({{ totalQueueCount }})</h3>
      </div>

      <Tabs v-model="activeTab" class="w-full">
        <TabsList class="w-full grid grid-cols-6 h-auto min-h-9 rounded-none border-b bg-transparent">
          <TabsTrigger
            v-for="tab in tabConfig"
            :key="tab.value"
            :value="tab.value"
            class="text-xs px-1 py-1.5 flex items-center justify-center gap-0.5 whitespace-nowrap data-[state=active]:bg-muted"
          >
            <span class="truncate">{{ t(`queue.tabs.${tab.value}`) }}</span>
            <Badge v-if="tab.items.length > 0" variant="secondary" class="shrink-0 h-4 px-1 text-[10px]">
              {{ tab.items.length }}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <ScrollArea class="h-[420px]">
          <TabsContent v-for="tab in tabConfig" :key="tab.value" :value="tab.value" class="mt-0">
            <Empty v-if="tab.items.length === 0" class="border-0">
              <EmptyContent>
                <Inbox class="h-10 w-10 text-muted-foreground" />
                <EmptyDescription>{{ tab.isWaiting ? t('queue.waitingEmpty') : t('queue.empty') }}</EmptyDescription>
              </EmptyContent>
            </Empty>
            <div v-else class="divide-y p-4 space-y-3">
              <!-- 等待队列项 -->
              <template v-if="tab.isWaiting">
                <div v-for="item in tab.items" :key="item.id" class="space-y-1.5">
                  <div class="flex items-center justify-between text-xs sm:text-sm gap-2">
                    <div class="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
                      <div class="h-2 w-2 rounded-full shrink-0" :class="getStatusDotClass(item)" />
                      <span class="font-medium truncate">{{ getItemName(item) }}</span>
                      <span class="text-muted-foreground text-[10px] sm:text-xs">
                        {{
                          item.type === 'ship' || item.type === 'defense'
                            ? `→ ${t('queue.quantity')} ${item.quantity}`
                            : item.type === 'demolish'
                            ? `→ ${t('queue.demolishing')}`
                            : `→ ${t('queue.level')} ${item.targetLevel}`
                        }}
                      </span>
                    </div>
                    <div class="flex items-center gap-2 sm:gap-3 shrink-0">
                      <span
                        class="text-[10px] sm:text-xs whitespace-nowrap"
                        :class="isWaitingItemResourcesReady(item as WaitingQueueItem) ? 'text-green-500' : 'text-yellow-500'"
                      >
                        {{ isWaitingItemResourcesReady(item as WaitingQueueItem) ? t('queue.resourcesReady') : t('queue.waitingResources') }}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        class="h-5 sm:h-6 px-1.5 sm:px-2 text-[10px] sm:text-xs"
                        @click.stop="handleCancel(item)"
                      >
                        {{ t('queue.remove') }}
                      </Button>
                    </div>
                  </div>
                  <!-- 预估成本显示 -->
                  <div class="flex gap-2 text-[10px] text-muted-foreground ml-4">
                    <span v-if="getWaitingItemCost(item as WaitingQueueItem).metal > 0">
                      {{ t('resources.metal') }}: {{ formatNumber(getWaitingItemCost(item as WaitingQueueItem).metal) }}
                    </span>
                    <span v-if="getWaitingItemCost(item as WaitingQueueItem).crystal > 0">
                      {{ t('resources.crystal') }}: {{ formatNumber(getWaitingItemCost(item as WaitingQueueItem).crystal) }}
                    </span>
                    <span v-if="getWaitingItemCost(item as WaitingQueueItem).deuterium > 0">
                      {{ t('resources.deuterium') }}: {{ formatNumber(getWaitingItemCost(item as WaitingQueueItem).deuterium) }}
                    </span>
                  </div>
                </div>
              </template>
              <!-- 正式队列项 -->
              <template v-else>
                <div v-for="item in tab.items" :key="item.id" class="space-y-1.5">
                  <div class="flex items-center justify-between text-xs sm:text-sm gap-2">
                    <div class="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
                      <div class="h-2 w-2 rounded-full animate-pulse shrink-0" :class="getStatusDotClass(item)" />
                      <span class="font-medium truncate">{{ getItemName(item) }}</span>
                      <span class="text-muted-foreground text-[10px] sm:text-xs">
                        {{
                          item.type === 'ship' || item.type === 'defense'
                            ? `→ ${t('queue.quantity')} ${item.quantity}`
                            : item.type === 'demolish'
                            ? `→ ${t('queue.demolishing')}`
                            : `→ ${t('queue.level')} ${item.targetLevel}`
                        }}
                      </span>
                    </div>
                    <div class="flex items-center gap-2 sm:gap-3 shrink-0">
                      <span class="text-muted-foreground text-[10px] sm:text-xs whitespace-nowrap">
                        {{ formatTime(getRemainingTime(item as BuildQueueItem)) }}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        class="h-5 sm:h-6 px-1.5 sm:px-2 text-[10px] sm:text-xs"
                        @click.stop="handleCancel(item)"
                      >
                        {{ t('queue.cancel') }}
                      </Button>
                    </div>
                  </div>
                  <Progress :model-value="getQueueProgress(item as BuildQueueItem)" class="h-1.5" />
                </div>
              </template>
            </div>
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </PopoverContent>
  </Popover>
</template>

<script setup lang="ts">
  import { computed, ref, onUnmounted, watch } from 'vue'
  import { ListOrdered, Inbox } from 'lucide-vue-next'
  import { Button } from '@/components/ui/button'
  import { Badge } from '@/components/ui/badge'
  import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
  import { ScrollArea } from '@/components/ui/scroll-area'
  import { Progress } from '@/components/ui/progress'
  import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
  import { Empty, EmptyContent, EmptyDescription } from '@/components/ui/empty'
  import { useGameStore } from '@/stores/gameStore'
  import { useGameConfig } from '@/composables/useGameConfig'
  import { useI18n } from '@/composables/useI18n'
  import { formatTime, formatNumber } from '@/utils/format'
  import type { BuildQueueItem, WaitingQueueItem, BuildingType, ShipType, DefenseType, TechnologyType, Resources } from '@/types/game'
import * as waitingQueueLogic from '@/logic/waitingQueueLogic'
import * as resourceLogic from '@/logic/resourceLogic'

  const { t } = useI18n()
  const gameStore = useGameStore()
  const { BUILDINGS, SHIPS, DEFENSES, TECHNOLOGIES } = useGameConfig()

  const isOpen = ref(false)
  const activeTab = ref('all')

  // 响应式时间戳，用于驱动时间和进度的动态更新
  const currentTime = ref(Date.now())
  let timerInterval: ReturnType<typeof setInterval> | null = null

  // 当弹窗打开时启动计时器，关闭时停止
  watch(isOpen, open => {
    if (open) {
      // 启动每秒更新的计时器
      timerInterval = setInterval(() => {
        currentTime.value = Date.now()
      }, 1000)
    } else {
      // 停止计时器
      if (timerInterval) {
        clearInterval(timerInterval)
        timerInterval = null
      }
    }
  })

  // 组件卸载时清理计时器
  onUnmounted(() => {
    if (timerInterval) {
      clearInterval(timerInterval)
      timerInterval = null
    }
  })

  // 获取当前星球的建造队列
  const buildQueue = computed(() => {
    return gameStore.currentPlanet?.buildQueue || []
  })

  // 获取研究队列
  const researchQueue = computed(() => {
    return gameStore.player.researchQueue || []
  })

  // 获取当前星球的建造等待队列
  const buildWaitingQueue = computed(() => {
    return gameStore.currentPlanet?.waitingBuildQueue || []
  })

  // 获取研究等待队列
  const researchWaitingQueue = computed(() => {
    return gameStore.player.waitingResearchQueue || []
  })

  // 合并所有等待队列
  const allWaitingQueue = computed(() => {
    return [...buildWaitingQueue.value, ...researchWaitingQueue.value]
  })

  // 总队列数量（包括等待队列）
  const totalQueueCount = computed(() => {
    return buildQueue.value.length + researchQueue.value.length + allWaitingQueue.value.length
  })

  // 标签页配置（用于循环渲染）
  const tabConfig = computed(() => [
    { value: 'all', items: [...buildQueue.value, ...researchQueue.value], isWaiting: false },
    { value: 'buildings', items: buildQueue.value.filter(item => item.type === 'building' || item.type === 'demolish'), isWaiting: false },
    { value: 'research', items: researchQueue.value, isWaiting: false },
    { value: 'ships', items: buildQueue.value.filter(item => item.type === 'ship'), isWaiting: false },
    { value: 'defense', items: buildQueue.value.filter(item => item.type === 'defense'), isWaiting: false },
    { value: 'waiting', items: allWaitingQueue.value, isWaiting: true }
  ])

  // 获取队列项名称
  const getItemName = (item: BuildQueueItem | WaitingQueueItem): string => {
    if (item.type === 'building' || item.type === 'demolish') {
      return BUILDINGS.value[item.itemType as BuildingType].name
    } else if (item.type === 'ship') {
      return SHIPS.value[item.itemType as ShipType].name
    } else if (item.type === 'defense') {
      return DEFENSES.value[item.itemType as DefenseType].name
    } else if (item.type === 'technology') {
      return TECHNOLOGIES.value[item.itemType as TechnologyType].name
    }
    return ''
  }

  // 检查是否是等待队列项
  const isWaitingItem = (item: BuildQueueItem | WaitingQueueItem): item is WaitingQueueItem => {
    return 'addedTime' in item && 'priority' in item
  }

  // 获取等待队列项的预估成本
  const getWaitingItemCost = (item: WaitingQueueItem): Resources => {
    return waitingQueueLogic.calculateWaitingItemCost(item)
  }

  // 检查等待队列项资源是否足够
  const isWaitingItemResourcesReady = (item: WaitingQueueItem): boolean => {
    const cost = getWaitingItemCost(item)
    const resources = gameStore.currentPlanet?.resources
    if (!resources) return false
    return resourceLogic.checkResourcesAvailable(resources, cost)
  }

  // 获取剩余时间（使用响应式 currentTime 确保动态更新）
  const getRemainingTime = (item: BuildQueueItem): number => {
    return Math.max(0, Math.floor((item.endTime - currentTime.value) / 1000))
  }

  // 获取队列进度（使用响应式 currentTime 确保动态更新）
  const getQueueProgress = (item: BuildQueueItem): number => {
    const elapsed = currentTime.value - item.startTime
    const total = item.endTime - item.startTime
    if (total <= 0) return 100
    return Math.max(0, Math.min(100, (elapsed / total) * 100))
  }

  // 统一的取消处理
  const handleCancel = (item: BuildQueueItem | WaitingQueueItem) => {
    // 检查是否是等待队列项
    if (isWaitingItem(item)) {
      handleRemoveFromWaiting(item)
      return
    }

    let eventName: string
    if (item.type === 'building' || item.type === 'ship' || item.type === 'defense' || item.type === 'demolish') {
      eventName = 'cancel-build'
    } else if (item.type === 'technology') {
      eventName = 'cancel-research'
    } else {
      return
    }

    const event = new CustomEvent(eventName, { detail: item.id })
    window.dispatchEvent(event)
  }

  // 从等待队列移除
  const handleRemoveFromWaiting = (item: WaitingQueueItem) => {
    const planet = gameStore.currentPlanet
    if (!planet) return

    if (item.type === 'technology') {
      // 从研究等待队列移除
      waitingQueueLogic.removeFromResearchWaitingQueue(gameStore.player, item.id)
    } else {
      // 从建筑等待队列移除
      waitingQueueLogic.removeFromBuildWaitingQueue(planet, item.id)
    }
  }

  // 获取状态指示点颜色
  const getStatusDotClass = (item: BuildQueueItem | WaitingQueueItem): string => {
    // 等待队列项根据资源是否足够显示不同颜色
    if (isWaitingItem(item)) {
      return isWaitingItemResourcesReady(item) ? 'bg-green-500 dark:bg-green-400' : 'bg-yellow-500 dark:bg-yellow-400'
    }
    if (item.type === 'demolish') return 'bg-destructive'
    if (item.type === 'technology') return 'bg-blue-500 dark:bg-blue-400'
    return 'bg-green-500 dark:bg-green-400'
  }
</script>
