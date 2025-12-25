<template>
  <Popover v-model:open="isOpen">
    <PopoverTrigger as-child>
      <Button variant="outline" size="icon" class="relative">
        <ScrollText class="h-4 w-4" />
        <Badge
          v-if="unreadCount > 0"
          variant="destructive"
          class="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
        >
          {{ unreadCount }}
        </Badge>
      </Button>
    </PopoverTrigger>
    <PopoverContent class="w-96 p-0" align="end">
      <div class="flex items-center justify-between p-4 border-b">
        <h3 class="font-semibold">{{ t('diplomacy.notifications') }}</h3>
        <Button v-if="unreadCount > 0" variant="ghost" size="sm" @click="markAllAsRead">
          {{ t('diplomacy.markAllRead') }}
        </Button>
      </div>
      <ScrollArea class="h-96">
        <Empty v-if="allNotifications.length === 0" class="border-0">
          <EmptyContent>
            <ScrollText class="h-10 w-10 text-muted-foreground" />
            <EmptyDescription>{{ t('diplomacy.noReports') }}</EmptyDescription>
          </EmptyContent>
        </Empty>
        <div v-else class="divide-y">
          <div
            v-for="notification in allNotifications"
            :key="notification.id"
            class="p-3 hover:bg-muted/50 cursor-pointer transition-colors"
            :class="{ 'bg-primary/5': !notification.read }"
            @click="handleNotificationClick(notification)"
          >
            <div class="flex items-center gap-3">
              <!-- 左侧：事件图标 -->
              <div class="shrink-0">
                <component :is="getNotificationIcon(notification)" class="h-5 w-5" :class="getNotificationIconColor(notification)" />
              </div>
              <!-- 中间：主要信息 -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <span class="font-medium text-sm truncate">{{ getNotificationNpcName(notification) }}</span>
                  <Badge :variant="getNotificationBadgeVariant(notification)" class="text-xs shrink-0">
                    {{ getNotificationBadgeText(notification) }}
                  </Badge>
                </div>
                <p class="text-xs text-muted-foreground mt-0.5">
                  {{ getNotificationTitle(notification) }}
                </p>
              </div>
              <!-- 右侧：额外信息和时间 -->
              <div class="shrink-0 text-right">
                <span
                  v-if="getNotificationExtra(notification)"
                  class="text-sm font-bold block"
                  :class="getNotificationExtra(notification)?.colorClass"
                >
                  {{ getNotificationExtra(notification)?.text }}
                </span>
                <span class="text-[10px] text-muted-foreground">
                  {{ formatRelativeTime((Date.now() - notification.timestamp) / 1000, t) }}{{ t('diplomacy.ago') }}
                </span>
              </div>
              <!-- 未读标记 -->
              <span v-if="!notification.read" class="h-2 w-2 rounded-full bg-destructive shrink-0" />
            </div>
          </div>
        </div>
      </ScrollArea>
      <div v-if="allNotifications.length > 0" class="p-2 border-t">
        <Button variant="ghost" size="sm" class="w-full" @click="goToDiplomacy">
          {{ t('diplomacy.viewAll') }}
        </Button>
      </div>
    </PopoverContent>
  </Popover>

  <!-- 外交报告详情对话框 -->
  <Dialog :open="detailDialogOpen && selectedNotification?.type === 'diplomatic'" @update:open="detailDialogOpen = $event">
    <DialogContent class="max-w-2xl">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2">
          <component
            v-if="selectedReport"
            :is="getEventIcon(selectedReport.eventType)"
            class="h-5 w-5"
            :class="getEventIconColor(selectedReport.eventType)"
          />
          {{ t('diplomacy.reportDetails') }}
        </DialogTitle>
        <DialogDescription class="sr-only">
          {{ t('diplomacy.reportDetails') }}
        </DialogDescription>
      </DialogHeader>

      <div v-if="selectedReport" class="space-y-4">
        <!-- NPC信息 -->
        <div class="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-1">
              <h3 class="font-semibold text-lg">{{ getNpcName(selectedReport) }}</h3>
              <Badge v-if="selectedReport.newStatus" :variant="getStatusBadgeVariant(selectedReport.newStatus)">
                {{ getStatusText(selectedReport.newStatus) }}
              </Badge>
            </div>
            <p class="text-sm text-muted-foreground">
              {{ formatRelativeTime((Date.now() - selectedReport.timestamp) / 1000, t) }}{{ t('diplomacy.ago') }}
            </p>
          </div>
        </div>

        <!-- 事件描述 -->
        <div class="space-y-2">
          <h4 class="font-semibold text-sm">{{ t('diplomacy.eventDescription') }}</h4>
          <p class="text-sm p-3 bg-muted/30 rounded-md">
            {{
              selectedReport.messageKey && selectedReport.messageParams
                ? t(selectedReport.messageKey, getMessageParams(selectedReport))
                : selectedReport.message
            }}
          </p>
        </div>

        <!-- 关系变化 (仅当有 reputationChange 时显示) -->
        <div v-if="selectedReport.reputationChange !== undefined" class="grid grid-cols-2 gap-4">
          <!-- 好感度变化 -->
          <div class="space-y-2">
            <h4 class="font-semibold text-sm">{{ t('diplomacy.reputationChange') }}</h4>
            <div class="p-3 bg-muted/30 rounded-md">
              <div class="flex items-center justify-between text-sm mb-2">
                <span class="text-muted-foreground">{{ t('diplomacy.before') }}</span>
                <span
                  class="font-semibold"
                  :class="getReputationColor((selectedReport.newReputation || 0) - (selectedReport.reputationChange || 0))"
                >
                  {{ (selectedReport.newReputation || 0) - (selectedReport.reputationChange || 0) > 0 ? '+' : ''
                  }}{{ (selectedReport.newReputation || 0) - (selectedReport.reputationChange || 0) }}
                </span>
              </div>
              <div
                class="flex items-center justify-center text-lg font-bold my-1"
                :class="
                  (selectedReport.reputationChange || 0) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                "
              >
                {{ (selectedReport.reputationChange || 0) >= 0 ? '+' : '' }}{{ selectedReport.reputationChange || 0 }}
              </div>
              <div class="flex items-center justify-between text-sm mt-2">
                <span class="text-muted-foreground">{{ t('diplomacy.after') }}</span>
                <span class="font-semibold" :class="getReputationColor(selectedReport.newReputation ?? null)">
                  {{ (selectedReport.newReputation || 0) > 0 ? '+' : '' }}{{ selectedReport.newReputation || 0 }}
                </span>
              </div>
            </div>
          </div>

          <!-- 关系状态变化 -->
          <div v-if="selectedReport.oldStatus && selectedReport.newStatus" class="space-y-2">
            <h4 class="font-semibold text-sm">{{ t('diplomacy.statusChange') }}</h4>
            <div class="p-3 bg-muted/30 rounded-md">
              <div class="flex items-center justify-between text-sm mb-2">
                <span class="text-muted-foreground">{{ t('diplomacy.before') }}</span>
                <Badge :variant="getStatusBadgeVariant(selectedReport.oldStatus)" class="text-xs">
                  {{ getStatusText(selectedReport.oldStatus) }}
                </Badge>
              </div>
              <div class="flex items-center justify-center my-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-6 w-6 text-muted-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
              <div class="flex items-center justify-between text-sm mt-2">
                <span class="text-muted-foreground">{{ t('diplomacy.after') }}</span>
                <Badge :variant="getStatusBadgeVariant(selectedReport.newStatus)" class="text-xs">
                  {{ getStatusText(selectedReport.newStatus) }}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="detailDialogOpen = false">{{ t('common.close') }}</Button>
        <Button @click="goToDiplomacyFromDialog">{{ t('diplomacy.viewDiplomacy') }}</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <!-- 贸易提议详情对话框 -->
  <Dialog :open="detailDialogOpen && selectedNotification?.type === 'trade'" @update:open="detailDialogOpen = $event">
    <DialogContent class="max-w-lg">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2">
          <ArrowLeftRight class="h-5 w-5 text-blue-500" />
          {{ t('npcBehavior.trade.title') }}
        </DialogTitle>
        <DialogDescription class="sr-only">
          {{ t('npcBehavior.trade.title') }}
        </DialogDescription>
      </DialogHeader>

      <div v-if="selectedTradeOffer" class="space-y-4">
        <!-- NPC信息卡片 -->
        <div class="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-1">
              <h3 class="font-semibold text-lg">{{ getTradeNpcName(selectedTradeOffer) }}</h3>
              <Badge variant="outline" class="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30">
                {{ t('diplomacy.notificationBadge.trade') }}
              </Badge>
            </div>
            <p class="text-sm text-muted-foreground">
              {{ formatRelativeTime((Date.now() - selectedTradeOffer.timestamp) / 1000, t) }}{{ t('diplomacy.ago') }}
            </p>
          </div>
        </div>

        <!-- 交易内容 -->
        <div class="grid grid-cols-2 gap-4">
          <!-- 对方提供 -->
          <div class="space-y-2">
            <h4 class="font-semibold text-sm flex items-center gap-1.5">
              <span class="h-2 w-2 rounded-full bg-green-500 dark:bg-green-400"></span>
              {{ t('npcBehavior.trade.offers') }}
            </h4>
            <div class="p-3 bg-green-500/10 rounded-md">
              <div class="flex items-center gap-2">
                <ResourceIcon :type="selectedTradeOffer.offeredResources.type" size="md" />
                <div>
                  <div class="text-lg font-bold text-green-600 dark:text-green-400">
                    <NumberWithTooltip :value="selectedTradeOffer.offeredResources.amount" />
                  </div>
                  <div class="text-xs text-muted-foreground">{{ t(`resources.${selectedTradeOffer.offeredResources.type}`) }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 对方要求 -->
          <div class="space-y-2">
            <h4 class="font-semibold text-sm flex items-center gap-1.5">
              <span class="h-2 w-2 rounded-full bg-orange-500 dark:bg-orange-400"></span>
              {{ t('npcBehavior.trade.requests') }}
            </h4>
            <div class="p-3 bg-orange-500/10 rounded-md">
              <div class="flex items-center gap-2">
                <ResourceIcon :type="selectedTradeOffer.requestedResources.type" size="md" />
                <div>
                  <div class="text-lg font-bold text-orange-600 dark:text-orange-400">
                    <NumberWithTooltip :value="selectedTradeOffer.requestedResources.amount" />
                  </div>
                  <div class="text-xs text-muted-foreground">{{ t(`resources.${selectedTradeOffer.requestedResources.type}`) }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 交易比率和过期时间 -->
        <div class="p-3 bg-muted/30 rounded-md space-y-2">
          <div class="flex justify-between items-center text-sm">
            <span class="text-muted-foreground">{{ t('npcBehavior.trade.ratio') }}</span>
            <span class="font-medium">{{ getTradeRatioText(selectedTradeOffer) }}</span>
          </div>
          <div class="flex justify-between items-center text-sm">
            <span class="text-muted-foreground">{{ t('npcBehavior.trade.expiresIn') }}</span>
            <span :class="getTradeExpiresClass(selectedTradeOffer)">{{ getTradeExpiresText(selectedTradeOffer) }}</span>
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="detailDialogOpen = false">{{ t('common.close') }}</Button>
        <Button @click="goToMessagesFromDialog">{{ t('diplomacy.viewAll') }}</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <!-- 情报报告详情对话框 -->
  <Dialog :open="detailDialogOpen && selectedNotification?.type === 'intel'" @update:open="detailDialogOpen = $event">
    <DialogContent class="max-w-lg">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2">
          <FileSearch class="h-5 w-5 text-cyan-500" />
          {{ t('npcBehavior.intel.title') }}
        </DialogTitle>
        <DialogDescription class="sr-only">
          {{ t('npcBehavior.intel.title') }}
        </DialogDescription>
      </DialogHeader>

      <div v-if="selectedIntelReport" class="space-y-4">
        <!-- 来源NPC信息 -->
        <div class="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-1">
              <h3 class="font-semibold text-lg">{{ getIntelFromNpcName(selectedIntelReport) }}</h3>
              <Badge variant="secondary" class="bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30">
                {{ t('diplomacy.notificationBadge.intel') }}
              </Badge>
            </div>
            <p class="text-sm text-muted-foreground">
              {{ formatRelativeTime((Date.now() - selectedIntelReport.timestamp) / 1000, t) }}{{ t('diplomacy.ago') }}
            </p>
          </div>
        </div>

        <!-- 情报详情 -->
        <div class="grid grid-cols-2 gap-4">
          <!-- 目标 -->
          <div class="space-y-2">
            <h4 class="font-semibold text-sm">{{ t('npcBehavior.intel.target') }}</h4>
            <div class="p-3 bg-muted/30 rounded-md">
              <div class="font-medium">{{ getIntelTargetNpcName(selectedIntelReport) }}</div>
            </div>
          </div>

          <!-- 情报类型 -->
          <div class="space-y-2">
            <h4 class="font-semibold text-sm">{{ t('npcBehavior.intel.type') }}</h4>
            <div class="p-3 bg-muted/30 rounded-md">
              <div class="flex items-center gap-2">
                <component
                  :is="getIntelTypeIcon(selectedIntelReport)"
                  class="h-4 w-4"
                  :class="getIntelTypeIconColor(selectedIntelReport)"
                />
                <span class="font-medium">{{ getIntelTypeText(selectedIntelReport) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 情报内容 -->
        <div class="space-y-2">
          <h4 class="font-semibold text-sm">{{ t('npcBehavior.intel.content') }}</h4>
          <div class="p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-md">
            <!-- 舰队情报 -->
            <div v-if="selectedIntelReport.intelType === 'enemyFleet' && selectedIntelReport.data.fleet" class="space-y-2">
              <div v-for="(count, ship) in selectedIntelReport.data.fleet" :key="ship" class="flex justify-between items-center text-sm">
                <span class="text-muted-foreground">{{ t(`ships.${ship}`) }}</span>
                <span class="font-medium">{{ (count as number).toLocaleString() }}</span>
              </div>
              <div v-if="Object.keys(selectedIntelReport.data.fleet).length === 0" class="text-sm text-muted-foreground text-center">
                {{ t('npcBehavior.intel.noFleet') }}
              </div>
            </div>
            <!-- 资源情报 -->
            <div v-else-if="selectedIntelReport.intelType === 'enemyResources' && selectedIntelReport.data.resources" class="space-y-2">
              <div v-if="selectedIntelReport.data.resources.metal" class="flex justify-between items-center text-sm">
                <span class="text-muted-foreground">{{ t('resources.metal') }}</span>
                <span class="font-medium text-gray-500">{{ selectedIntelReport.data.resources.metal.toLocaleString() }}</span>
              </div>
              <div v-if="selectedIntelReport.data.resources.crystal" class="flex justify-between items-center text-sm">
                <span class="text-muted-foreground">{{ t('resources.crystal') }}</span>
                <span class="font-medium text-cyan-500">{{ selectedIntelReport.data.resources.crystal.toLocaleString() }}</span>
              </div>
              <div v-if="selectedIntelReport.data.resources.deuterium" class="flex justify-between items-center text-sm">
                <span class="text-muted-foreground">{{ t('resources.deuterium') }}</span>
                <span class="font-medium text-green-500">{{ selectedIntelReport.data.resources.deuterium.toLocaleString() }}</span>
              </div>
            </div>
            <!-- 移动情报 -->
            <div v-else-if="selectedIntelReport.intelType === 'enemyMovement' && selectedIntelReport.data.movement" class="space-y-2">
              <div class="flex justify-between items-center text-sm">
                <span class="text-muted-foreground">{{ t('npcBehavior.intel.targetPosition') }}</span>
                <span class="font-mono font-medium">
                  [{{ selectedIntelReport.data.movement.targetPosition.galaxy }}:{{
                    selectedIntelReport.data.movement.targetPosition.system
                  }}:{{ selectedIntelReport.data.movement.targetPosition.position }}]
                </span>
              </div>
              <div class="flex justify-between items-center text-sm">
                <span class="text-muted-foreground">{{ t('npcBehavior.intel.missionType') }}</span>
                <span class="font-medium">{{ selectedIntelReport.data.movement.missionType }}</span>
              </div>
            </div>
            <!-- 默认 -->
            <div v-else class="text-sm text-muted-foreground text-center">
              {{ t('npcBehavior.intel.noData') }}
            </div>
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="detailDialogOpen = false">{{ t('common.close') }}</Button>
        <Button @click="goToMessagesFromDialog">{{ t('diplomacy.viewAll') }}</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <!-- 联合攻击邀请详情对话框 -->
  <Dialog :open="detailDialogOpen && selectedNotification?.type === 'jointAttack'" @update:open="detailDialogOpen = $event">
    <DialogContent class="max-w-lg">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2">
          <Users class="h-5 w-5 text-orange-500" />
          {{ t('npcBehavior.jointAttack.title') }}
        </DialogTitle>
        <DialogDescription class="sr-only">
          {{ t('npcBehavior.jointAttack.title') }}
        </DialogDescription>
      </DialogHeader>

      <div v-if="selectedJointAttack" class="space-y-4">
        <!-- 邀请方NPC信息 -->
        <div class="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-1">
              <h3 class="font-semibold text-lg">{{ getJointAttackFromNpcName(selectedJointAttack) }}</h3>
              <Badge variant="destructive" class="bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30">
                {{ t('diplomacy.notificationBadge.jointAttack') }}
              </Badge>
            </div>
            <p class="text-sm text-muted-foreground">
              {{ formatRelativeTime((Date.now() - selectedJointAttack.timestamp) / 1000, t) }}{{ t('diplomacy.ago') }}
            </p>
          </div>
        </div>

        <!-- 攻击目标信息 -->
        <div class="space-y-2">
          <h4 class="font-semibold text-sm flex items-center gap-1.5">
            <Sword class="h-4 w-4 text-red-500" />
            {{ t('npcBehavior.jointAttack.targetInfo') }}
          </h4>
          <div class="p-4 bg-red-500/5 border border-red-500/20 rounded-md space-y-3">
            <div class="flex justify-between items-center">
              <span class="text-sm text-muted-foreground">{{ t('npcBehavior.jointAttack.target') }}</span>
              <span class="font-medium">{{ getJointAttackTargetNpcName(selectedJointAttack) }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-muted-foreground">{{ t('npcBehavior.jointAttack.targetPlanet') }}</span>
              <span class="font-mono font-medium">{{ getJointAttackTargetPlanet(selectedJointAttack) }}</span>
            </div>
          </div>
        </div>

        <!-- 收益和时限 -->
        <div class="grid grid-cols-2 gap-4">
          <!-- 战利品分成 -->
          <div class="space-y-2">
            <h4 class="font-semibold text-sm">{{ t('npcBehavior.jointAttack.lootShare') }}</h4>
            <div class="p-3 bg-orange-500/10 border border-orange-500/20 rounded-md text-center">
              <div class="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {{ Math.round(selectedJointAttack.expectedLootRatio * 100) }}%
              </div>
              <div class="text-xs text-muted-foreground mt-1">{{ t('npcBehavior.jointAttack.expectedShare') }}</div>
            </div>
          </div>

          <!-- 过期时间 -->
          <div class="space-y-2">
            <h4 class="font-semibold text-sm">{{ t('npcBehavior.jointAttack.expiresIn') }}</h4>
            <div class="p-3 bg-muted/30 rounded-md text-center">
              <div class="text-2xl font-bold" :class="getJointAttackExpiresClass(selectedJointAttack)">
                {{ getJointAttackExpiresText(selectedJointAttack) }}
              </div>
              <div class="text-xs text-muted-foreground mt-1">{{ t('npcBehavior.jointAttack.remaining') }}</div>
            </div>
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="detailDialogOpen = false">{{ t('common.close') }}</Button>
        <Button @click="goToMessagesFromDialog">{{ t('diplomacy.viewAll') }}</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
  import { ref, computed, onUnmounted, watch } from 'vue'
  import { useRouter } from 'vue-router'
  import { useGameStore } from '@/stores/gameStore'
  import { useNPCStore } from '@/stores/npcStore'
  import { useI18n } from '@/composables/useI18n'
  import { Button } from '@/components/ui/button'
  import { Badge } from '@/components/ui/badge'
  import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
  import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
  import { ScrollArea } from '@/components/ui/scroll-area'
  import { ScrollText, Gift, Sword, Eye, Trash2, Skull, ArrowLeftRight, FileSearch, Users, Ship, Coins, Navigation } from 'lucide-vue-next'
  import { Empty, EmptyContent, EmptyDescription } from '@/components/ui/empty'
  import { RelationStatus, DiplomaticEventType } from '@/types/game'
  import type { DiplomaticReport, TradeOffer, IntelReport, JointAttackInvite } from '@/types/game'
  import { formatRelativeTime } from '@/utils/format'
  import NumberWithTooltip from '@/components/common/NumberWithTooltip.vue'
  import ResourceIcon from '@/components/common/ResourceIcon.vue'

  // 统一通知类型
  type NotificationType = 'diplomatic' | 'trade' | 'intel' | 'jointAttack'

  interface UnifiedNotification {
    id: string
    type: NotificationType
    timestamp: number
    read: boolean
    data: DiplomaticReport | TradeOffer | IntelReport | JointAttackInvite
  }

  const router = useRouter()
  const gameStore = useGameStore()
  const npcStore = useNPCStore()
  const { t } = useI18n()
  const isOpen = ref(false)
  const detailDialogOpen = ref(false)
  const selectedNotification = ref<UnifiedNotification | null>(null)

  // 倒计时相关
  const currentTime = ref(Date.now())
  let countdownTimer: ReturnType<typeof setInterval> | null = null

  // 启动倒计时定时器
  const startCountdownTimer = () => {
    if (countdownTimer) return
    countdownTimer = setInterval(() => {
      currentTime.value = Date.now()
    }, 1000)
  }

  // 停止倒计时定时器
  const stopCountdownTimer = () => {
    if (countdownTimer) {
      clearInterval(countdownTimer)
      countdownTimer = null
    }
  }

  // 监听对话框打开状态
  watch(detailDialogOpen, open => {
    if (open) {
      startCountdownTimer()
    } else {
      stopCountdownTimer()
    }
  })

  // 组件卸载时清理
  onUnmounted(() => {
    stopCountdownTimer()
  })

  // 格式化倒计时（毫秒 -> HH:MM:SS 或 MM:SS）
  const formatCountdown = (ms: number): string => {
    if (ms <= 0) return '00:00'
    const totalSeconds = Math.floor(ms / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  // 选中的各类型数据（计算属性）
  const selectedReport = computed(() => {
    if (selectedNotification.value?.type === 'diplomatic') {
      return selectedNotification.value.data as DiplomaticReport
    }
    return null
  })

  const selectedTradeOffer = computed(() => {
    if (selectedNotification.value?.type === 'trade') {
      return selectedNotification.value.data as TradeOffer
    }
    return null
  })

  const selectedIntelReport = computed(() => {
    if (selectedNotification.value?.type === 'intel') {
      return selectedNotification.value.data as IntelReport
    }
    return null
  })

  const selectedJointAttack = computed(() => {
    if (selectedNotification.value?.type === 'jointAttack') {
      return selectedNotification.value.data as JointAttackInvite
    }
    return null
  })

  // 统一所有通知到一个列表
  const allNotifications = computed((): UnifiedNotification[] => {
    const notifications: UnifiedNotification[] = []

    // 外交报告
    ;(gameStore.player.diplomaticReports || []).forEach(report => {
      notifications.push({
        id: report.id,
        type: 'diplomatic',
        timestamp: report.timestamp,
        read: report.read ?? false,
        data: report
      })
    })

    // 贸易提议（只显示pending状态的）
    ;(gameStore.player.tradeOffers || [])
      .filter(offer => offer.status === 'pending')
      .forEach(offer => {
        notifications.push({
          id: offer.id,
          type: 'trade',
          timestamp: offer.timestamp,
          read: offer.read || false,
          data: offer
        })
      })

    // 情报报告
    ;(gameStore.player.intelReports || []).forEach(report => {
      notifications.push({
        id: report.id,
        type: 'intel',
        timestamp: report.timestamp,
        read: report.read,
        data: report
      })
    })

    // 联合攻击邀请（只显示pending状态的）
    ;(gameStore.player.jointAttackInvites || [])
      .filter(invite => invite.status === 'pending')
      .forEach(invite => {
        notifications.push({
          id: invite.id,
          type: 'jointAttack',
          timestamp: invite.timestamp,
          read: invite.read || false,
          data: invite
        })
      })

    // 按时间倒序排序，取最近30条
    return notifications.sort((a, b) => b.timestamp - a.timestamp).slice(0, 30)
  })

  const unreadCount = computed(() => {
    return allNotifications.value.filter(n => !n.read).length
  })

  /**
   * 获取NPC当前名称（通用）
   */
  const getNpcNameById = (npcId: string, fallbackName: string): string => {
    if (!npcStore.npcs?.length) return fallbackName

    const npc = npcStore.npcs.find(n => n.id === npcId)
    if (npc) return npc.name

    // 尝试从旧名称中提取ID并查找
    const idMatch = fallbackName.match(/npc_\d+/)
    if (idMatch) {
      const extractedId = idMatch[0]
      const foundNpc = npcStore.npcs.find(n => n.id === extractedId)
      if (foundNpc) return foundNpc.name
    }

    return fallbackName
  }

  /**
   * 获取NPC当前名称（外交报告专用）
   */
  const getNpcName = (report: DiplomaticReport): string => {
    return getNpcNameById(report.npcId || '', report.npcName)
  }

  /**
   * 获取通知的NPC名称
   */
  const getNotificationNpcName = (notification: UnifiedNotification): string => {
    switch (notification.type) {
      case 'diplomatic': {
        const report = notification.data as DiplomaticReport
        return getNpcNameById(report.npcId || '', report.npcName)
      }
      case 'trade': {
        const offer = notification.data as TradeOffer
        return getNpcNameById(offer.npcId, offer.npcName)
      }
      case 'intel': {
        const report = notification.data as IntelReport
        return getNpcNameById(report.fromNpcId, report.fromNpcName)
      }
      case 'jointAttack': {
        const invite = notification.data as JointAttackInvite
        return getNpcNameById(invite.fromNpcId, invite.fromNpcName)
      }
      default:
        return ''
    }
  }

  /**
   * 获取报告的消息参数，将 npcName 替换为当前名称
   */
  const getMessageParams = (report: DiplomaticReport): Record<string, string | number> => {
    if (!report.messageParams) return {}
    return {
      ...report.messageParams,
      npcName: getNpcName(report)
    }
  }

  /**
   * 获取通知图标
   */
  const getNotificationIcon = (notification: UnifiedNotification) => {
    switch (notification.type) {
      case 'trade':
        return ArrowLeftRight
      case 'intel':
        return FileSearch
      case 'jointAttack':
        return Users
      case 'diplomatic': {
        const report = notification.data as DiplomaticReport
        return getEventIcon(report.eventType)
      }
      default:
        return ScrollText
    }
  }

  /**
   * 获取通知图标颜色
   */
  const getNotificationIconColor = (notification: UnifiedNotification) => {
    switch (notification.type) {
      case 'trade':
        return 'text-blue-500'
      case 'intel':
        return 'text-cyan-500'
      case 'jointAttack':
        return 'text-orange-500'
      case 'diplomatic': {
        const report = notification.data as DiplomaticReport
        return getEventIconColor(report.eventType)
      }
      default:
        return 'text-muted-foreground'
    }
  }

  /**
   * 获取通知标题
   */
  const getNotificationTitle = (notification: UnifiedNotification): string => {
    switch (notification.type) {
      case 'trade':
        return t('diplomacy.notificationType.tradeOffer')
      case 'intel':
        return t('diplomacy.notificationType.intelReport')
      case 'jointAttack':
        return t('diplomacy.notificationType.jointAttack')
      case 'diplomatic': {
        const report = notification.data as DiplomaticReport
        return getEventTypeText(report.eventType)
      }
      default:
        return ''
    }
  }

  /**
   * 获取通知徽章变体
   */
  const getNotificationBadgeVariant = (notification: UnifiedNotification) => {
    switch (notification.type) {
      case 'trade':
        return 'outline' as const
      case 'intel':
        return 'secondary' as const
      case 'jointAttack':
        return 'destructive' as const
      case 'diplomatic': {
        const report = notification.data as DiplomaticReport
        return report.newStatus ? getStatusBadgeVariant(report.newStatus) : ('secondary' as const)
      }
      default:
        return 'secondary' as const
    }
  }

  /**
   * 获取通知徽章文字
   */
  const getNotificationBadgeText = (notification: UnifiedNotification): string => {
    switch (notification.type) {
      case 'trade':
        return t('diplomacy.notificationBadge.trade')
      case 'intel':
        return t('diplomacy.notificationBadge.intel')
      case 'jointAttack':
        return t('diplomacy.notificationBadge.jointAttack')
      case 'diplomatic': {
        const report = notification.data as DiplomaticReport
        return report.newStatus ? getStatusText(report.newStatus) : t('diplomacy.notificationBadge.diplomatic')
      }
      default:
        return ''
    }
  }

  /**
   * 获取通知的额外信息（右侧显示）
   */
  const getNotificationExtra = (notification: UnifiedNotification): { text: string; colorClass: string } | null => {
    switch (notification.type) {
      case 'diplomatic': {
        const report = notification.data as DiplomaticReport
        if (report.reputationChange === undefined) return null
        return {
          text: `${(report.reputationChange || 0) >= 0 ? '+' : ''}${report.reputationChange || 0}`,
          colorClass: (report.reputationChange || 0) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
        }
      }
      case 'trade': {
        const offer = notification.data as TradeOffer
        const isExpired = offer.expiresAt <= Date.now()
        return {
          text: isExpired ? t('npcBehavior.trade.expired') : t('diplomacy.notificationExtra.pending'),
          colorClass: isExpired ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'
        }
      }
      case 'jointAttack': {
        const invite = notification.data as JointAttackInvite
        const isExpired = invite.expiresAt <= Date.now()
        if (isExpired) {
          return {
            text: t('npcBehavior.jointAttack.expired'),
            colorClass: 'text-red-600 dark:text-red-400'
          }
        }
        return {
          text: `${Math.round(invite.expectedLootRatio * 100)}%`,
          colorClass: 'text-orange-600 dark:text-orange-400'
        }
      }
      default:
        return null
    }
  }

  const getEventIcon = (eventType: DiplomaticReport['eventType']) => {
    switch (eventType) {
      case DiplomaticEventType.GiftResources:
        return Gift
      case DiplomaticEventType.Attack:
      case DiplomaticEventType.AllyAttacked:
        return Sword
      case DiplomaticEventType.Spy:
        return Eye
      case DiplomaticEventType.StealDebris:
        return Trash2
      case DiplomaticEventType.DestroyPlanet:
        return Skull
      default:
        return ScrollText
    }
  }

  const getEventIconColor = (eventType: DiplomaticReport['eventType']) => {
    switch (eventType) {
      case DiplomaticEventType.GiftResources:
        return 'text-green-500'
      case DiplomaticEventType.Attack:
      case DiplomaticEventType.DestroyPlanet:
        return 'text-red-500'
      case DiplomaticEventType.AllyAttacked:
        return 'text-orange-500'
      case DiplomaticEventType.Spy:
        return 'text-purple-500'
      case DiplomaticEventType.StealDebris:
        return 'text-yellow-500'
      default:
        return 'text-muted-foreground'
    }
  }

  const getEventTypeText = (eventType: DiplomaticReport['eventType']) => {
    switch (eventType) {
      case DiplomaticEventType.GiftResources:
        return t('diplomacy.eventType.gift')
      case DiplomaticEventType.Attack:
        return t('diplomacy.eventType.attack')
      case DiplomaticEventType.AllyAttacked:
        return t('diplomacy.eventType.allyAttacked')
      case DiplomaticEventType.Spy:
        return t('diplomacy.eventType.spy')
      case DiplomaticEventType.StealDebris:
        return t('diplomacy.eventType.stealDebris')
      case DiplomaticEventType.DestroyPlanet:
        return t('diplomacy.eventType.destroyPlanet')
      default:
        return t('diplomacy.eventType.unknown')
    }
  }

  const getStatusBadgeVariant = (status: RelationStatus) => {
    switch (status) {
      case RelationStatus.Hostile:
        return 'destructive'
      case RelationStatus.Friendly:
        return 'default'
      case RelationStatus.Neutral:
      default:
        return 'secondary'
    }
  }

  const getStatusText = (status: RelationStatus) => {
    switch (status) {
      case RelationStatus.Hostile:
        return t('diplomacy.status.hostile')
      case RelationStatus.Friendly:
        return t('diplomacy.status.friendly')
      case RelationStatus.Neutral:
      default:
        return t('diplomacy.status.neutral')
    }
  }

  const getReputationColor = (reputation: number | null) => {
    if (reputation === null) return 'text-muted-foreground'
    if (reputation >= 20) return 'text-green-600 dark:text-green-400'
    if (reputation <= -20) return 'text-red-600 dark:text-red-400'
    return 'text-muted-foreground'
  }

  /**
   * 处理通知点击 - 标记为已读并打开详情弹窗
   */
  const handleNotificationClick = (notification: UnifiedNotification) => {
    // 标记为已读
    markNotificationAsRead(notification)
    // 设置选中的通知
    selectedNotification.value = notification
    // 打开对话框
    detailDialogOpen.value = true
  }

  /**
   * 标记单个通知为已读
   */
  const markNotificationAsRead = (notification: UnifiedNotification) => {
    switch (notification.type) {
      case 'diplomatic': {
        const report = notification.data as DiplomaticReport
        report.read = true
        break
      }
      case 'trade': {
        const offer = notification.data as TradeOffer
        offer.read = true
        break
      }
      case 'intel': {
        const report = notification.data as IntelReport
        report.read = true
        break
      }
      case 'jointAttack': {
        const invite = notification.data as JointAttackInvite
        invite.read = true
        break
      }
    }
  }

  const markAllAsRead = () => {
    // 标记所有外交报告
    gameStore.player.diplomaticReports?.forEach(report => {
      report.read = true
    })
    // 标记所有贸易提议
    gameStore.player.tradeOffers?.forEach(offer => {
      offer.read = true
    })
    // 标记所有情报报告
    gameStore.player.intelReports?.forEach(report => {
      report.read = true
    })
    // 标记所有联合攻击邀请
    gameStore.player.jointAttackInvites?.forEach(invite => {
      invite.read = true
    })
  }

  const goToDiplomacy = () => {
    isOpen.value = false
    router.push('/diplomacy')
  }

  const goToDiplomacyFromDialog = () => {
    const npcId = selectedReport.value?.npcId
    detailDialogOpen.value = false
    router.push(npcId ? `/diplomacy?npcId=${npcId}` : '/diplomacy')
  }

  const goToMessagesFromDialog = () => {
    detailDialogOpen.value = false
    isOpen.value = false
    router.push('/messages')
  }

  // ========== 贸易提议详情方法 ==========
  const getTradeNpcName = (offer: TradeOffer): string => {
    return getNpcNameById(offer.npcId, offer.npcName)
  }

  const getTradeExpiresText = (offer: TradeOffer): string => {
    const remaining = offer.expiresAt - currentTime.value
    if (remaining <= 0) return t('npcBehavior.trade.expired')
    return formatCountdown(remaining)
  }

  const getTradeExpiresClass = (offer: TradeOffer): string => {
    const remaining = offer.expiresAt - currentTime.value
    if (remaining <= 0) return 'text-red-600 dark:text-red-400'
    if (remaining < 3600000) return 'text-orange-600 dark:text-orange-400' // < 1小时
    return 'text-muted-foreground'
  }

  const getTradeRatioText = (offer: TradeOffer): string => {
    const ratio = offer.offeredResources.amount / offer.requestedResources.amount
    return `1:${ratio.toFixed(2)}`
  }

  // ========== 情报报告详情方法 ==========
  const getIntelFromNpcName = (report: IntelReport): string => {
    return getNpcNameById(report.fromNpcId, report.fromNpcName)
  }

  const getIntelTargetNpcName = (report: IntelReport): string => {
    return getNpcNameById(report.targetNpcId, report.targetNpcName)
  }

  const getIntelTypeText = (report: IntelReport): string => {
    switch (report.intelType) {
      case 'enemyFleet':
        return t('npcBehavior.intel.types.enemyFleet')
      case 'enemyResources':
        return t('npcBehavior.intel.types.enemyResources')
      case 'enemyMovement':
        return t('npcBehavior.intel.types.enemyMovement')
      default:
        return report.intelType
    }
  }

  const getIntelTypeIcon = (report: IntelReport) => {
    switch (report.intelType) {
      case 'enemyFleet':
        return Ship
      case 'enemyResources':
        return Coins
      case 'enemyMovement':
        return Navigation
      default:
        return FileSearch
    }
  }

  const getIntelTypeIconColor = (report: IntelReport): string => {
    switch (report.intelType) {
      case 'enemyFleet':
        return 'text-red-500'
      case 'enemyResources':
        return 'text-yellow-500'
      case 'enemyMovement':
        return 'text-blue-500'
      default:
        return 'text-cyan-500'
    }
  }

  // ========== 联合攻击邀请详情方法 ==========
  const getJointAttackFromNpcName = (invite: JointAttackInvite): string => {
    return getNpcNameById(invite.fromNpcId, invite.fromNpcName)
  }

  const getJointAttackTargetNpcName = (invite: JointAttackInvite): string => {
    return getNpcNameById(invite.targetNpcId, invite.targetNpcName)
  }

  const getJointAttackTargetPlanet = (invite: JointAttackInvite): string => {
    const pos = invite.targetPosition
    return `[${pos.galaxy}:${pos.system}:${pos.position}]`
  }

  const getJointAttackExpiresText = (invite: JointAttackInvite): string => {
    const remaining = invite.expiresAt - currentTime.value
    if (remaining <= 0) return t('npcBehavior.jointAttack.expired')
    return formatCountdown(remaining)
  }

  const getJointAttackExpiresClass = (invite: JointAttackInvite): string => {
    const remaining = invite.expiresAt - currentTime.value
    if (remaining <= 0) return 'text-red-600 dark:text-red-400'
    if (remaining < 3600000) return 'text-orange-600 dark:text-orange-400' // < 1小时
    return 'text-muted-foreground'
  }
</script>
