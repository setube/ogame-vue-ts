<template>
  <div v-if="activeAlerts.length > 0" class="bg-destructive/10 border-b border-destructive/20">
    <div class="px-4 sm:px-6 py-2 flex items-center justify-between gap-3">
      <!-- 警告图标和汇总信息 -->
      <div class="flex items-center gap-2 flex-1 min-w-0">
        <AlertTriangle class="h-5 w-5 text-destructive shrink-0 animate-pulse" />
        <div class="flex-1 min-w-0">
          <p class="text-sm font-semibold text-destructive">
            {{ getAlertSummary() }}
          </p>
          <p class="text-xs text-muted-foreground">
            {{ t('enemyAlert.countdown') }}: {{ formatTimeRemaining(nearestAlert?.arrivalTime || 0) }}
          </p>
        </div>
      </div>

      <!-- 查看按钮 -->
      <Button @click="openAlertPanel" variant="outline" size="sm" class="shrink-0">
        {{ t('common.view') }}
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted } from 'vue'
  import { useGameStore } from '@/stores/gameStore'
  import { Button } from '@/components/ui/button'
  import { AlertTriangle } from 'lucide-vue-next'
  import { useI18n } from '@/composables/useI18n'
  import { MissionType } from '@/types/game'

  const emit = defineEmits<{
    (e: 'openPanel'): void
  }>()

  const gameStore = useGameStore()
  const { t } = useI18n()

  // 强制更新倒计时
  const now = ref(Date.now())
  let updateInterval: ReturnType<typeof setInterval> | null = null

  onMounted(() => {
    updateInterval = setInterval(() => {
      now.value = Date.now()
    }, 1000)
  })

  onUnmounted(() => {
    if (updateInterval) clearInterval(updateInterval)
  })

  // 获取活跃的警报（未到达的）
  const activeAlerts = computed(() => {
    return (gameStore.player.incomingFleetAlerts || [])
      .filter(alert => alert.arrivalTime > now.value)
      .sort((a, b) => a.arrivalTime - b.arrivalTime)
  })

  // 最近的警报
  const nearestAlert = computed(() => activeAlerts.value[0] || null)

  // 统计各类型警报数量
  const alertCounts = computed(() => {
    const counts = { spy: 0, attack: 0, other: 0 }
    activeAlerts.value.forEach(alert => {
      if (alert.missionType === MissionType.Spy) {
        counts.spy++
      } else if (alert.missionType === MissionType.Attack) {
        counts.attack++
      } else {
        counts.other++
      }
    })
    return counts
  })

  // 生成警报汇总文本
  const getAlertSummary = (): string => {
    const parts: string[] = []
    if (alertCounts.value.attack > 0) {
      parts.push(`${alertCounts.value.attack} ${t('enemyAlert.missionType.attack')}`)
    }
    if (alertCounts.value.spy > 0) {
      parts.push(`${alertCounts.value.spy} ${t('enemyAlert.missionType.spy')}`)
    }
    if (alertCounts.value.other > 0) {
      parts.push(`${alertCounts.value.other} ${t('enemyAlert.missionType.unknown')}`)
    }
    return t('alerts.incomingFleets', { count: activeAlerts.value.length }) + ': ' + parts.join(', ')
  }

  const formatTimeRemaining = (arrivalTime: number): string => {
    const remaining = Math.max(0, arrivalTime - now.value)
    const seconds = Math.floor((remaining / 1000) % 60)
    const minutes = Math.floor((remaining / (1000 * 60)) % 60)
    const hours = Math.floor(remaining / (1000 * 60 * 60))

    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    }
    return `${minutes}:${String(seconds).padStart(2, '0')}`
  }

  const openAlertPanel = () => {
    emit('openPanel')
  }
</script>
