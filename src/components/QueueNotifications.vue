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
        <TabsList class="w-full grid grid-cols-5 h-9 rounded-none border-b bg-transparent">
          <TabsTrigger v-for="tab in tabConfig" :key="tab.value" :value="tab.value" class="text-xs px-1 data-[state=active]:bg-muted flex items-center justify-center whitespace-nowrap truncate">
            <span class="truncate">{{ t(`queue.tabs.${tab.value}`) }}</span>
            <Badge
              v-if="tab.items.length > 0"
              variant="secondary"
              class="ml-1 h-4 px-1 text-[10px] shrink-0"
            >
              {{ tab.items.length }}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <ScrollArea class="h-[420px]">
          <TabsContent v-for="tab in tabConfig" :key="tab.value" :value="tab.value" class="mt-0">
            <Empty v-if="tab.items.length === 0" class="border-0">
              <EmptyContent>
                <Inbox class="h-10 w-10 text-muted-foreground" />
                <EmptyDescription>{{ t('queue.empty') }}</EmptyDescription>
              </EmptyContent>
            </Empty>
            <div v-else class="divide-y p-4 space-y-3">
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
                      {{ formatTime(getRemainingTime(item)) }}
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
                <Progress :model-value="getQueueProgress(item)" class="h-1.5" />
              </div>
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
  import { formatTime } from '@/utils/format'
  import type { BuildQueueItem, BuildingType, ShipType, DefenseType, TechnologyType } from '@/types/game'

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

  // 总队列数量
  const totalQueueCount = computed(() => {
    return buildQueue.value.length + researchQueue.value.length
  })

  // 标签页配置（用于循环渲染）
  const tabConfig = computed(() => [
    { value: 'all', items: [...buildQueue.value, ...researchQueue.value] },
    { value: 'buildings', items: buildQueue.value.filter(item => item.type === 'building' || item.type === 'demolish') },
    { value: 'research', items: researchQueue.value },
    { value: 'ships', items: buildQueue.value.filter(item => item.type === 'ship') },
    { value: 'defense', items: buildQueue.value.filter(item => item.type === 'defense') }
  ])

  // 获取队列项名称
  const getItemName = (item: BuildQueueItem): string => {
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

  // 获取剩余时间（使用响应式 currentTime 确保动态更新）
  const getRemainingTime = (item: BuildQueueItem): number => {
    return Math.max(0, Math.floor((item.endTime - currentTime.value) / 1000))
  }

  // 获取队列进度（使用响应式 currentTime 确保动态更新）
  const getQueueProgress = (item: BuildQueueItem): number => {
    const elapsed = currentTime.value - item.startTime
    const total = item.endTime - item.startTime
    return Math.min(100, (elapsed / total) * 100)
  }

  // 统一的取消处理
  const handleCancel = (item: BuildQueueItem) => {
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

  // 获取状态指示点颜色
  const getStatusDotClass = (item: BuildQueueItem): string => {
    if (item.type === 'demolish') return 'bg-destructive'
    if (item.type === 'technology') return 'bg-blue-500'
    return 'bg-green-500'
  }
</script>
