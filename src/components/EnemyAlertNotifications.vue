<template>
  <Popover v-model:open="isOpen">
    <PopoverTrigger as-child>
      <Button variant="outline" size="icon" class="relative">
        <Siren class="h-4 w-4" />
        <Badge
          v-if="activeAlerts.length > 0"
          variant="destructive"
          class="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs animate-pulse"
        >
          {{ activeAlerts.length }}
        </Badge>
      </Button>
    </PopoverTrigger>
    <PopoverContent class="w-96 p-0" align="end">
      <div class="flex items-center justify-between p-4 border-b">
        <h3 class="font-semibold">{{ t('enemyAlert.title') }}</h3>
        <Button v-if="activeAlerts.length > 0" variant="ghost" size="sm" @click="markAllAsRead">
          {{ t('enemyAlert.markAllRead') }}
        </Button>
      </div>
      <ScrollArea class="h-96">
        <Empty v-if="activeAlerts.length === 0" class="border-0">
          <EmptyContent>
            <Shield class="h-10 w-10 text-muted-foreground" />
            <EmptyDescription>{{ t('enemyAlert.noAlerts') }}</EmptyDescription>
          </EmptyContent>
        </Empty>
        <div v-else class="divide-y">
          <div
            v-for="alert in activeAlerts"
            :key="alert.id"
            class="p-3 hover:bg-muted/50 cursor-pointer transition-colors"
            :class="{ 'bg-destructive/10': !alert.read }"
            @click="handleAlertClick(alert)"
          >
            <div class="flex items-center gap-3">
              <!-- 左侧：任务图标 -->
              <div class="shrink-0">
                <component :is="getMissionIcon(alert.missionType)" class="h-5 w-5" :class="getMissionIconColor(alert.missionType)" />
              </div>
              <!-- 中间：主要信息 -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <span class="font-medium text-sm truncate">{{ alert.npcName }}</span>
                  <Badge :variant="getMissionBadgeVariant(alert.missionType)" class="text-xs shrink-0">
                    {{ getMissionTypeText(alert.missionType) }}
                  </Badge>
                </div>
                <p class="text-xs text-muted-foreground mt-0.5">
                  {{ alert.targetPlanetName }} · {{ t('enemyAlert.fleetSize') }}: {{ alert.fleetSize }}
                </p>
              </div>
              <!-- 右侧：倒计时 -->
              <div class="shrink-0 text-right">
                <span class="text-sm font-bold block" :class="getRemainingTimeColor(alert)">
                  {{ formatRemainingTime(alert) }}
                </span>
              </div>
              <!-- 未读标记 -->
              <span v-if="!alert.read" class="h-2 w-2 rounded-full bg-destructive shrink-0 animate-pulse" />
            </div>
          </div>
        </div>
      </ScrollArea>
      <div v-if="activeAlerts.length > 0" class="p-2 border-t">
        <Button variant="ghost" size="sm" class="w-full" @click="goToFleet">
          {{ t('enemyAlert.viewFleet') }}
        </Button>
      </div>
    </PopoverContent>
  </Popover>

  <!-- 警报详情对话框 -->
  <Dialog :open="detailDialogOpen" @update:open="detailDialogOpen = $event">
    <DialogContent class="max-w-md">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2">
          <component
            v-if="selectedAlert"
            :is="getMissionIcon(selectedAlert.missionType)"
            class="h-5 w-5"
            :class="getMissionIconColor(selectedAlert.missionType)"
          />
          {{ t('enemyAlert.alertDetails') }}
        </DialogTitle>
        <DialogDescription class="sr-only">
          {{ t('enemyAlert.alertDetails') }}
        </DialogDescription>
      </DialogHeader>

      <div v-if="selectedAlert" class="space-y-4">
        <!-- 敌方信息 -->
        <div class="flex items-center gap-3 p-4 bg-destructive/10 rounded-lg">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-1">
              <h3 class="font-semibold text-lg">{{ selectedAlert.npcName }}</h3>
              <Badge :variant="getMissionBadgeVariant(selectedAlert.missionType)">
                {{ getMissionTypeText(selectedAlert.missionType) }}
              </Badge>
            </div>
            <p class="text-sm text-muted-foreground">
              {{ t('enemyAlert.fleetSize') }}: {{ selectedAlert.fleetSize }} {{ t('enemyAlert.ships') }}
            </p>
          </div>
        </div>

        <!-- 目标信息 -->
        <div class="space-y-2">
          <h4 class="font-semibold text-sm">{{ t('enemyAlert.targetInfo') }}</h4>
          <div class="p-3 bg-muted/30 rounded-md flex items-center gap-2">
            <Globe class="h-4 w-4 text-blue-500" />
            <span class="font-medium">{{ selectedAlert.targetPlanetName }}</span>
          </div>
        </div>

        <!-- 到达时间 -->
        <div class="space-y-2">
          <h4 class="font-semibold text-sm">{{ t('enemyAlert.arrivalTime') }}</h4>
          <div class="p-3 bg-muted/30 rounded-md">
            <div class="flex items-center justify-between">
              <span class="text-muted-foreground">{{ t('enemyAlert.countdown') }}</span>
              <span class="font-bold text-lg" :class="getRemainingTimeColor(selectedAlert)">
                {{ formatRemainingTime(selectedAlert) }}
              </span>
            </div>
            <p class="text-xs text-muted-foreground mt-1">
              {{ formatDate(selectedAlert.arrivalTime) }}
            </p>
          </div>
        </div>

        <!-- 警告提示 -->
        <div class="p-3 bg-destructive/10 rounded-md border border-destructive/20">
          <p class="text-sm text-destructive dark:text-red-400">
            {{ getMissionWarningText(selectedAlert.missionType) }}
          </p>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="detailDialogOpen = false">{{ t('common.close') }}</Button>
        <Button @click="goToMessagesFromDialog">{{ t('enemyAlert.viewMessages') }}</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { useGameStore } from '@/stores/gameStore'
  import { useI18n } from '@/composables/useI18n'
  import { Button } from '@/components/ui/button'
  import { Badge } from '@/components/ui/badge'
  import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
  import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
  import { ScrollArea } from '@/components/ui/scroll-area'
  import { Empty, EmptyContent, EmptyDescription } from '@/components/ui/empty'
  import { Siren, Eye, Sword, Shield, Globe } from 'lucide-vue-next'
  import { MissionType } from '@/types/game'
  import type { IncomingFleetAlert } from '@/types/game'
  import { formatDate, formatTime } from '@/utils/format'

  const router = useRouter()
  const gameStore = useGameStore()
  const { t } = useI18n()
  const isOpen = ref(false)
  const detailDialogOpen = ref(false)
  const selectedAlert = ref<IncomingFleetAlert | null>(null)
  const currentTime = ref(Date.now())
  let timeInterval: ReturnType<typeof setInterval> | null = null

  // 启动计时器，用于实时更新倒计时
  onMounted(() => {
    timeInterval = setInterval(() => {
      currentTime.value = Date.now()
    }, 1000)
  })

  onUnmounted(() => {
    if (timeInterval) {
      clearInterval(timeInterval)
      timeInterval = null
    }
  })

  // 获取活跃的警报（未到达的）
  const activeAlerts = computed(() => {
    const now = currentTime.value
    return (gameStore.player.incomingFleetAlerts || [])
      .filter(alert => alert.arrivalTime > now)
      .sort((a, b) => a.arrivalTime - b.arrivalTime) // 按到达时间排序
  })

  // 获取任务类型图标
  const getMissionIcon = (missionType: MissionType) => {
    switch (missionType) {
      case MissionType.Spy:
        return Eye
      case MissionType.Attack:
        return Sword
      default:
        return Siren
    }
  }

  // 获取任务类型图标颜色
  const getMissionIconColor = (missionType: MissionType) => {
    switch (missionType) {
      case MissionType.Spy:
        return 'text-purple-500'
      case MissionType.Attack:
        return 'text-red-500'
      default:
        return 'text-yellow-500'
    }
  }

  // 获取任务类型Badge样式
  const getMissionBadgeVariant = (missionType: MissionType): 'destructive' | 'secondary' => {
    return missionType === MissionType.Attack ? 'destructive' : 'secondary'
  }

  // 获取任务类型文本
  const getMissionTypeText = (missionType: MissionType) => {
    switch (missionType) {
      case MissionType.Spy:
        return t('enemyAlert.missionType.spy')
      case MissionType.Attack:
        return t('enemyAlert.missionType.attack')
      default:
        return t('enemyAlert.missionType.unknown')
    }
  }

  // 获取任务警告文本
  const getMissionWarningText = (missionType: MissionType) => {
    switch (missionType) {
      case MissionType.Spy:
        return t('enemyAlert.warning.spy')
      case MissionType.Attack:
        return t('enemyAlert.warning.attack')
      default:
        return t('enemyAlert.warning.unknown')
    }
  }

  // 格式化剩余时间
  const formatRemainingTime = (alert: IncomingFleetAlert) => {
    const remaining = Math.max(0, Math.floor((alert.arrivalTime - currentTime.value) / 1000))
    if (remaining <= 0) {
      return t('enemyAlert.arrived')
    }
    return formatTime(remaining)
  }

  // 获取剩余时间颜色
  const getRemainingTimeColor = (alert: IncomingFleetAlert) => {
    const remaining = alert.arrivalTime - currentTime.value
    if (remaining <= 0) return 'text-red-600 dark:text-red-400 font-bold' // 已到达
    if (remaining < 60000) return 'text-red-600 dark:text-red-400' // < 1分钟
    if (remaining < 300000) return 'text-orange-600 dark:text-orange-400' // < 5分钟
    return 'text-muted-foreground'
  }

  // 处理警报点击
  const handleAlertClick = (alert: IncomingFleetAlert) => {
    alert.read = true
    selectedAlert.value = alert
    isOpen.value = true
    // 打开对话框
    detailDialogOpen.value = true
  }

  // 标记所有为已读
  const markAllAsRead = () => {
    gameStore.player.incomingFleetAlerts?.forEach(alert => {
      alert.read = true
    })
  }

  // 跳转到舰队页面
  const goToFleet = () => {
    isOpen.value = false
    router.push('/fleet')
  }

  // 从对话框跳转到消息页面
  const goToMessagesFromDialog = () => {
    detailDialogOpen.value = false
    router.push('/messages')
  }

  // 打开弹窗（供外部调用）
  const open = () => {
    isOpen.value = true
  }

  // 暴露方法给父组件
  defineExpose({
    open
  })
</script>
