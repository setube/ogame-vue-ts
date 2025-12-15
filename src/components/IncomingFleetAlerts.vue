<template>
  <div v-if="alerts.length > 0" class="bg-destructive/10 border-b border-destructive/20">
    <div class="px-4 sm:px-6 py-2 space-y-2">
      <div
        v-for="alert in alerts"
        :key="alert.id"
        class="flex items-center justify-between gap-3 bg-destructive/5 rounded-lg px-3 py-2 border border-destructive/20"
      >
        <!-- 警告图标和信息 -->
        <div class="flex items-center gap-2 flex-1 min-w-0">
          <AlertTriangle class="h-5 w-5 text-destructive shrink-0 animate-pulse" />
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-destructive truncate">
              <template v-if="alert.missionType === 'spy'">
                {{ t('alerts.npcSpyIncoming') }}
              </template>
              <template v-else-if="alert.missionType === 'attack'">
                {{ t('alerts.npcAttackIncoming') }}
              </template>
              <template v-else>
                {{ t('alerts.npcFleetIncoming') }}
              </template>
            </p>
            <p class="text-xs text-muted-foreground truncate">
              {{ alert.npcName }} → {{ alert.targetPlanetName }}
              <template v-if="alert.missionType === 'attack'">({{ alert.fleetSize }} {{ t('alerts.ships') }})</template>
            </p>
          </div>
        </div>

        <!-- 倒计时 -->
        <div class="flex items-center gap-2 shrink-0">
          <div class="text-right">
            <p class="text-xs font-mono text-destructive">
              {{ formatTimeRemaining(alert.arrivalTime) }}
            </p>
            <p class="text-[10px] text-muted-foreground">
              {{ formatTime(alert.arrivalTime) }}
            </p>
          </div>
          <Button @click="markAsRead(alert)" variant="ghost" size="sm" class="h-6 w-6 p-0">
            <X class="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted } from 'vue'
  import type { IncomingFleetAlert } from '@/types/game'
  import { Button } from '@/components/ui/button'
  import { AlertTriangle, X } from 'lucide-vue-next'
  import { useI18n } from '@/composables/useI18n'

  const props = defineProps<{
    alerts: IncomingFleetAlert[]
  }>()

  const emit = defineEmits<{
    (e: 'markAsRead', alert: IncomingFleetAlert): void
  }>()

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

  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const markAsRead = (alert: IncomingFleetAlert) => {
    emit('markAsRead', alert)
  }
</script>
