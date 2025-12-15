<template>
  <div class="container mx-auto p-4 sm:p-6 space-y-6">
    <h1 class="text-2xl sm:text-3xl font-bold">{{ t('messagesView.title') }}</h1>

    <!-- 标签切换 -->
    <Tabs v-model="activeTab" class="w-full">
      <TabsList class="grid w-full grid-cols-2 sm:grid-cols-4" :tab-count="4">
        <TabsTrigger v-for="tab in tabs" :key="tab.value" :value="tab.value" class="flex items-center justify-center gap-1 px-2">
          <component :is="tab.icon" class="h-3 w-3 sm:h-4 sm:w-4" />
          <span class="text-xs sm:text-sm truncate">{{ tab.label }}</span>
          <Badge v-if="tab.unreadCount > 0" variant="destructive" class="hidden sm:flex ml-1">
            {{ tab.unreadCount }}
          </Badge>
        </TabsTrigger>
      </TabsList>

      <!-- 战斗报告列表 -->
      <TabsContent value="battles" class="mt-4 space-y-2">
        <Card v-if="gameStore.player.battleReports.length === 0">
          <CardContent class="py-8 text-center text-muted-foreground">{{ t('messagesView.noBattleReports') }}</CardContent>
        </Card>

        <Card
          v-for="report in sortedBattleReports"
          :key="report.id"
          @click="openBattleReport(report)"
          class="cursor-pointer hover:shadow-md transition-shadow"
        >
          <CardHeader class="pb-3">
            <div class="flex justify-between items-center gap-2">
              <div class="flex items-center gap-2 min-w-0 flex-1">
                <Sword class="h-4 w-4 shrink-0" />
                <CardTitle class="text-base sm:text-lg">{{ t('messagesView.battleReport') }}</CardTitle>
                <Badge v-if="!report.read" variant="default" class="text-xs">{{ t('messagesView.unread') }}</Badge>
                <Badge :variant="getBattleResultVariant(report)" class="text-xs">
                  {{ getBattleResultText(report) }}
                </Badge>
              </div>
              <Button @click.stop="deleteBattleReport(report.id)" variant="ghost" size="icon" class="h-8 w-8 shrink-0">
                <X class="h-4 w-4" />
              </Button>
            </div>
            <CardDescription class="text-xs sm:text-sm">
              {{ formatDate(report.timestamp) }}
            </CardDescription>
          </CardHeader>
        </Card>
      </TabsContent>

      <!-- 间谍报告列表（合并：侦查报告 + 被侦查通知） -->
      <TabsContent value="spy" class="mt-4 space-y-2">
        <Card v-if="gameStore.player.spyReports.length === 0 && sortedSpiedNotifications.length === 0">
          <CardContent class="py-8 text-center text-muted-foreground">{{ t('messagesView.noSpyReports') }}</CardContent>
        </Card>

        <!-- 侦查报告 -->
        <Card
          v-for="report in sortedSpyReports"
          :key="report.id"
          @click="openSpyReport(report)"
          class="cursor-pointer hover:shadow-md transition-shadow"
        >
          <CardHeader class="pb-3">
            <div class="flex justify-between items-center gap-2">
              <div class="flex items-center gap-2 min-w-0 flex-1">
                <Eye class="h-4 w-4 shrink-0" />
                <CardTitle class="text-base sm:text-lg">{{ t('messagesView.spyReport') }}</CardTitle>
                <Badge v-if="!report.read" variant="default" class="text-xs">{{ t('messagesView.unread') }}</Badge>
                <Badge variant="outline" class="text-xs">{{ report.targetPlanetId }}</Badge>
              </div>
              <Button @click.stop="deleteSpyReport(report.id)" variant="ghost" size="icon" class="h-8 w-8 shrink-0">
                <X class="h-4 w-4" />
              </Button>
            </div>
            <CardDescription class="text-xs sm:text-sm">
              {{ formatDate(report.timestamp) }}
            </CardDescription>
          </CardHeader>
        </Card>

        <!-- 被侦查通知 -->
        <Card
          v-for="notification in sortedSpiedNotifications"
          :key="notification.id"
          @click="openSpiedNotification(notification)"
          class="cursor-pointer hover:shadow-md transition-shadow"
        >
          <CardHeader class="pb-3">
            <div class="flex justify-between items-center gap-2">
              <div class="flex items-center gap-2 min-w-0 flex-1">
                <AlertTriangle class="h-4 w-4 shrink-0 text-destructive" />
                <CardTitle class="text-base sm:text-lg">{{ t('messagesView.spiedNotification') }}</CardTitle>
                <Badge v-if="!notification.read" variant="default" class="text-xs">{{ t('messagesView.unread') }}</Badge>
                <Badge :variant="notification.detectionSuccess ? 'destructive' : 'secondary'" class="text-xs">
                  {{ notification.detectionSuccess ? t('messagesView.detected') : t('messagesView.undetected') }}
                </Badge>
              </div>
              <Button @click.stop="deleteSpiedNotification(notification.id)" variant="ghost" size="icon" class="h-8 w-8 shrink-0">
                <X class="h-4 w-4" />
              </Button>
            </div>
            <CardDescription class="text-xs sm:text-sm">
              {{ notification.npcName }} → {{ notification.targetPlanetName }} · {{ formatDate(notification.timestamp) }}
            </CardDescription>
          </CardHeader>
        </Card>
      </TabsContent>

      <!-- NPC相关消息（活动、礼物、被拒绝） -->
      <TabsContent value="npc" class="mt-4 space-y-2">
        <Card
          v-if="
            sortedNPCActivityNotifications.length === 0 &&
            sortedGiftNotifications.length === 0 &&
            sortedGiftRejectedNotifications.length === 0
          "
        >
          <CardContent class="py-8 text-center text-muted-foreground">{{ t('messagesView.noNPCActivity') }}</CardContent>
        </Card>

        <!-- NPC活动通知 -->
        <Card
          v-for="notification in sortedNPCActivityNotifications"
          :key="notification.id"
          @click="openNPCActivityNotification(notification)"
          class="cursor-pointer hover:shadow-md transition-shadow"
        >
          <CardHeader class="pb-3">
            <div class="flex justify-between items-center gap-2">
              <div class="flex items-center gap-2 min-w-0 flex-1">
                <Recycle class="h-4 w-4 shrink-0 text-blue-500" />
                <CardTitle class="text-base sm:text-lg">{{ t('messagesView.npcRecycleActivity') }}</CardTitle>
                <Badge v-if="!notification.read" variant="default" class="text-xs">{{ t('messagesView.unread') }}</Badge>
              </div>
              <Button
                @click.stop="deleteNPCActivityNotification(notification.id)"
                variant="ghost"
                size="icon"
                class="h-8 w-8 shrink-0"
              >
                <X class="h-4 w-4" />
              </Button>
            </div>
            <CardDescription class="text-xs sm:text-sm">
              {{ notification.npcName }} →
              {{
                notification.targetPlanetName ||
                `[${notification.targetPosition.galaxy}:${notification.targetPosition.system}:${notification.targetPosition.position}]`
              }}
              · {{ formatDate(notification.timestamp) }}
            </CardDescription>
          </CardHeader>
        </Card>

        <!-- 礼物通知 -->
        <Card
          v-for="gift in sortedGiftNotifications"
          :key="gift.id"
          @click="markGiftAsRead(gift)"
          class="hover:shadow-md transition-shadow"
        >
          <CardHeader class="pb-3">
            <div class="flex justify-between items-center gap-2">
              <div class="flex items-center gap-2 min-w-0 flex-1">
                <Gift class="h-4 w-4 shrink-0 text-green-600" />
                <CardTitle class="text-base sm:text-lg">{{ t('messagesView.giftFrom').replace('{npcName}', gift.fromNpcName) }}</CardTitle>
                <Badge v-if="!gift.read" variant="default" class="text-xs">{{ t('messagesView.unread') }}</Badge>
              </div>
              <Button @click.stop="deleteGiftNotification(gift.id)" variant="ghost" size="icon" class="h-8 w-8 shrink-0">
                <X class="h-4 w-4" />
              </Button>
            </div>
            <CardDescription class="text-xs sm:text-sm">{{ formatDate(gift.timestamp) }}</CardDescription>
          </CardHeader>
          <CardContent>
            <div class="space-y-3">
              <div class="text-sm">
                <div class="font-semibold mb-1">{{ t('messagesView.giftResources') }}:</div>
                <div class="grid grid-cols-3 gap-2">
                  <div v-if="gift.resources.metal > 0">{{ t('resources.metal') }}: {{ gift.resources.metal.toLocaleString() }}</div>
                  <div v-if="gift.resources.crystal > 0">{{ t('resources.crystal') }}: {{ gift.resources.crystal.toLocaleString() }}</div>
                  <div v-if="gift.resources.deuterium > 0">
                    {{ t('resources.deuterium') }}: {{ gift.resources.deuterium.toLocaleString() }}
                  </div>
                </div>
              </div>
              <div class="text-xs text-muted-foreground">
                {{ t('messagesView.expectedReputation') }}:
                <span class="text-green-600">+{{ gift.expectedReputationGain }}</span>
              </div>
              <div class="flex gap-2">
                <Button @click.stop="acceptGift(gift)" variant="default" size="sm" class="flex-1">
                  <Check class="h-4 w-4 mr-1" />
                  {{ t('messagesView.acceptGift') }}
                </Button>
                <Button @click.stop="rejectGift(gift)" variant="outline" size="sm" class="flex-1">
                  <Ban class="h-4 w-4 mr-1" />
                  {{ t('messagesView.rejectGift') }}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- 礼物被拒绝通知 -->
        <Card
          v-for="rejection in sortedGiftRejectedNotifications"
          :key="rejection.id"
          @click="markGiftRejectedAsRead(rejection)"
          class="hover:shadow-md transition-shadow"
        >
          <CardHeader class="pb-3">
            <div class="flex justify-between items-center gap-2">
              <div class="flex items-center gap-2 min-w-0 flex-1">
                <Ban class="h-4 w-4 shrink-0 text-red-600" />
                <CardTitle class="text-base sm:text-lg">
                  {{ t('messagesView.giftRejectedBy').replace('{npcName}', rejection.npcName) }}
                </CardTitle>
                <Badge v-if="!rejection.read" variant="default" class="text-xs">{{ t('messagesView.unread') }}</Badge>
              </div>
              <Button @click.stop="deleteGiftRejectedNotification(rejection.id)" variant="ghost" size="icon" class="h-8 w-8 shrink-0">
                <X class="h-4 w-4" />
              </Button>
            </div>
            <CardDescription class="text-xs sm:text-sm">{{ formatDate(rejection.timestamp) }}</CardDescription>
          </CardHeader>
          <CardContent>
            <div class="space-y-2">
              <div class="text-sm">
                <div class="font-semibold mb-1">{{ t('messagesView.rejectedResources') }}:</div>
                <div class="grid grid-cols-3 gap-2">
                  <div v-if="rejection.rejectedResources.metal > 0">
                    {{ t('resources.metal') }}: {{ rejection.rejectedResources.metal.toLocaleString() }}
                  </div>
                  <div v-if="rejection.rejectedResources.crystal > 0">
                    {{ t('resources.crystal') }}: {{ rejection.rejectedResources.crystal.toLocaleString() }}
                  </div>
                  <div v-if="rejection.rejectedResources.deuterium > 0">
                    {{ t('resources.deuterium') }}: {{ rejection.rejectedResources.deuterium.toLocaleString() }}
                  </div>
                </div>
              </div>
              <div class="text-xs text-muted-foreground">
                {{ t('messagesView.currentReputation') }}:
                <span :class="rejection.currentReputation >= 0 ? 'text-green-600' : 'text-red-600'">{{ rejection.currentReputation }}</span>
              </div>
              <div class="text-xs text-muted-foreground">
                {{ t('messagesView.rejectionReason.' + rejection.reason) }}
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <!-- 任务报告列表 -->
      <TabsContent value="missions" class="mt-4 space-y-2">
        <Card v-if="sortedMissionReports.length === 0">
          <CardContent class="py-8 text-center text-muted-foreground">{{ t('messagesView.noMissionReports') }}</CardContent>
        </Card>

        <Card
          v-for="report in sortedMissionReports"
          :key="report.id"
          @click="openMissionReport(report)"
          class="cursor-pointer hover:shadow-md transition-shadow"
        >
          <CardHeader class="pb-3">
            <div class="flex justify-between items-center gap-2">
              <div class="flex items-center gap-2 min-w-0 flex-1">
                <Package class="h-4 w-4 shrink-0" />
                <CardTitle class="text-base sm:text-lg">{{ getMissionTypeName(report.missionType) }}</CardTitle>
                <Badge v-if="!report.read" variant="default" class="text-xs">{{ t('messagesView.unread') }}</Badge>
                <Badge :variant="report.success ? 'default' : 'destructive'" class="text-xs">
                  {{ report.success ? t('messagesView.success') : t('messagesView.failed') }}
                </Badge>
              </div>
              <Button @click.stop="deleteMissionReport(report.id)" variant="ghost" size="icon" class="h-8 w-8 shrink-0">
                <X class="h-4 w-4" />
              </Button>
            </div>
            <CardDescription class="text-xs sm:text-sm">
              {{ report.originPlanetName }} →
              {{
                report.targetPlanetName ||
                `[${report.targetPosition.galaxy}:${report.targetPosition.system}:${report.targetPosition.position}]`
              }}
              · {{ formatDate(report.timestamp) }}
            </CardDescription>
          </CardHeader>
        </Card>
      </TabsContent>
    </Tabs>

    <!-- 战斗报告对话框 -->
    <BattleReportDialog v-model:open="showBattleDialog" :report="selectedBattleReport" />

    <!-- 间谍报告对话框 -->
    <SpyReportDialog v-model:open="showSpyDialog" :report="selectedSpyReport" />
  </div>
</template>

<script setup lang="ts">
  import { useGameStore } from '@/stores/gameStore'
  import { useI18n } from '@/composables/useI18n'
  import { computed, ref } from 'vue'
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
  import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
  import { Button } from '@/components/ui/button'
  import { Badge } from '@/components/ui/badge'
  import BattleReportDialog from '@/components/BattleReportDialog.vue'
  import SpyReportDialog from '@/components/SpyReportDialog.vue'
  import { formatDate } from '@/utils/format'
  import { X, Sword, Eye, AlertTriangle, Package, Recycle, Gift, Ban, Check, Users } from 'lucide-vue-next'
  import type {
    BattleResult,
    SpyReport,
    SpiedNotification,
    NPCActivityNotification,
    MissionReport,
    GiftNotification,
    GiftRejectedNotification
  } from '@/types/game'
  import { MissionType } from '@/types/game'
  import { useNPCStore } from '@/stores/npcStore'
  import * as diplomaticLogic from '@/logic/diplomaticLogic'

  const gameStore = useGameStore()
  const npcStore = useNPCStore()
  const { t } = useI18n()
  const activeTab = ref<'battles' | 'spy' | 'missions' | 'npc'>('battles')

  // 对话框状态
  const showBattleDialog = ref(false)
  const showSpyDialog = ref(false)
  const selectedBattleReport = ref<BattleResult | null>(null)
  const selectedSpyReport = ref<SpyReport | null>(null)

  // 排序后的战斗报告（最新的在前）
  const sortedBattleReports = computed(() => {
    return [...gameStore.player.battleReports].sort((a, b) => b.timestamp - a.timestamp)
  })

  // 排序后的间谍报告（最新的在前）
  const sortedSpyReports = computed(() => {
    return [...gameStore.player.spyReports].sort((a, b) => b.timestamp - a.timestamp)
  })

  // 排序后的被侦查通知（最新的在前）
  const sortedSpiedNotifications = computed(() => {
    if (!gameStore.player.spiedNotifications) {
      return []
    }
    return [...gameStore.player.spiedNotifications].sort((a, b) => b.timestamp - a.timestamp)
  })

  // 排序后的任务报告（最新的在前）
  const sortedMissionReports = computed(() => {
    if (!gameStore.player.missionReports) {
      return []
    }
    return [...gameStore.player.missionReports].sort((a, b) => b.timestamp - a.timestamp)
  })

  // 排序后的NPC活动通知（最新的在前）
  const sortedNPCActivityNotifications = computed(() => {
    if (!gameStore.player.npcActivityNotifications) {
      return []
    }
    return [...gameStore.player.npcActivityNotifications].sort((a, b) => b.timestamp - a.timestamp)
  })

  // 未读战斗报告数量
  const unreadBattles = computed(() => {
    return gameStore.player.battleReports.filter(r => !r.read).length
  })

  // 未读间谍报告数量
  const unreadSpyReports = computed(() => {
    return gameStore.player.spyReports.filter(r => !r.read).length
  })

  // 未读被侦查通知数量
  const unreadSpiedNotifications = computed(() => {
    if (!gameStore.player.spiedNotifications) {
      return 0
    }
    return gameStore.player.spiedNotifications.filter(n => !n.read).length
  })

  // 未读NPC活动通知数量
  const unreadNPCActivity = computed(() => {
    if (!gameStore.player.npcActivityNotifications) {
      return 0
    }
    return gameStore.player.npcActivityNotifications.filter(n => !n.read).length
  })

  // 未读任务报告数量
  const unreadMissionReports = computed(() => {
    if (!gameStore.player.missionReports) {
      return 0
    }
    return gameStore.player.missionReports.filter(r => !r.read).length
  })

  // 未读礼物通知数量
  const unreadGiftNotifications = computed(() => {
    if (!gameStore.player.giftNotifications) {
      return 0
    }
    return gameStore.player.giftNotifications.filter(n => !n.read).length
  })

  // 未读礼物被拒绝通知数量
  const unreadGiftRejected = computed(() => {
    if (!gameStore.player.giftRejectedNotifications) {
      return 0
    }
    return gameStore.player.giftRejectedNotifications.filter(n => !n.read).length
  })

  // 合并：侦查相关未读总数（侦查报告 + 被侦查通知）
  const unreadSpyTotal = computed(() => {
    return unreadSpyReports.value + unreadSpiedNotifications.value
  })

  // 合并：NPC相关未读总数（NPC活动 + 礼物通知 + 礼物被拒绝）
  const unreadNPCTotal = computed(() => {
    return unreadNPCActivity.value + unreadGiftNotifications.value + unreadGiftRejected.value
  })

  // 标签页配置
  const tabs = computed(() => [
    {
      value: 'battles',
      icon: Sword,
      label: t('messagesView.battles'),
      unreadCount: unreadBattles.value
    },
    {
      value: 'spy',
      icon: Eye,
      label: t('messagesView.spy'),
      unreadCount: unreadSpyTotal.value
    },
    {
      value: 'missions',
      icon: Package,
      label: t('messagesView.missions'),
      unreadCount: unreadMissionReports.value
    },
    {
      value: 'npc',
      icon: Users,
      label: t('messagesView.npc'),
      unreadCount: unreadNPCTotal.value
    }
  ])

  // 排序后的礼物通知（最新的在前）
  const sortedGiftNotifications = computed(() => {
    if (!gameStore.player.giftNotifications) {
      return []
    }
    return [...gameStore.player.giftNotifications].sort((a, b) => b.timestamp - a.timestamp)
  })

  // 排序后的礼物被拒绝通知（最新的在前）
  const sortedGiftRejectedNotifications = computed(() => {
    if (!gameStore.player.giftRejectedNotifications) {
      return []
    }
    return [...gameStore.player.giftRejectedNotifications].sort((a, b) => b.timestamp - a.timestamp)
  })

  // 判断战斗结果Badge颜色
  const getBattleResultVariant = (report: BattleResult): 'default' | 'destructive' | 'secondary' => {
    if (report.winner === 'draw') {
      return 'secondary'
    }

    // 判断玩家是攻击方还是防守方
    const isPlayerAttacker = report.attackerId === gameStore.player.id
    const playerWon = isPlayerAttacker ? report.winner === 'attacker' : report.winner === 'defender'

    return playerWon ? 'default' : 'destructive'
  }

  // 获取战斗结果文本
  const getBattleResultText = (report: BattleResult): string => {
    if (report.winner === 'draw') {
      return t('messagesView.draw')
    }

    // 判断玩家是攻击方还是防守方
    const isPlayerAttacker = report.attackerId === gameStore.player.id
    const playerWon = isPlayerAttacker ? report.winner === 'attacker' : report.winner === 'defender'

    return playerWon ? t('messagesView.victory') : t('messagesView.defeat')
  }

  // 打开战斗报告
  const openBattleReport = (report: BattleResult) => {
    selectedBattleReport.value = report
    showBattleDialog.value = true
    // 标记为已读
    if (!report.read) {
      report.read = true
    }
  }

  // 打开间谍报告
  const openSpyReport = (report: SpyReport) => {
    selectedSpyReport.value = report
    showSpyDialog.value = true
    // 标记为已读
    if (!report.read) {
      report.read = true
    }
  }

  // 打开被侦查通知
  const openSpiedNotification = (notification: SpiedNotification) => {
    // 标记为已读
    if (!notification.read) {
      notification.read = true
    }
  }

  // 删除战斗报告
  const deleteBattleReport = (reportId: string) => {
    const index = gameStore.player.battleReports.findIndex(r => r.id === reportId)
    if (index > -1) {
      gameStore.player.battleReports.splice(index, 1)
    }
  }

  // 删除间谍报告
  const deleteSpyReport = (reportId: string) => {
    const index = gameStore.player.spyReports.findIndex(r => r.id === reportId)
    if (index > -1) {
      gameStore.player.spyReports.splice(index, 1)
    }
  }

  // 删除被侦查通知
  const deleteSpiedNotification = (notificationId: string) => {
    if (!gameStore.player.spiedNotifications) {
      return
    }
    const index = gameStore.player.spiedNotifications.findIndex(n => n.id === notificationId)
    if (index > -1) {
      gameStore.player.spiedNotifications.splice(index, 1)
    }
  }

  // 打开NPC活动通知
  const openNPCActivityNotification = (notification: NPCActivityNotification) => {
    // 标记为已读
    if (!notification.read) {
      notification.read = true
    }
  }

  // 删除NPC活动通知
  const deleteNPCActivityNotification = (notificationId: string) => {
    if (!gameStore.player.npcActivityNotifications) {
      return
    }
    const index = gameStore.player.npcActivityNotifications.findIndex(n => n.id === notificationId)
    if (index > -1) {
      gameStore.player.npcActivityNotifications.splice(index, 1)
    }
  }

  // 获取任务类型名称
  const getMissionTypeName = (missionType: string): string => {
    const typeMap: Record<string, string> = {
      [MissionType.Transport]: t('fleetView.transport'),
      [MissionType.Colonize]: t('fleetView.colonize'),
      [MissionType.Deploy]: t('fleetView.deploy'),
      [MissionType.Recycle]: t('fleetView.recycle'),
      [MissionType.Destroy]: t('fleetView.destroy'),
      [MissionType.MissileAttack]: t('galaxyView.missileAttack')
    }
    return typeMap[missionType] || missionType
  }

  // 打开任务报告
  const openMissionReport = (report: MissionReport) => {
    // 标记为已读
    if (!report.read) {
      report.read = true
    }
  }

  // 删除任务报告
  const deleteMissionReport = (reportId: string) => {
    if (!gameStore.player.missionReports) {
      return
    }
    const index = gameStore.player.missionReports.findIndex(r => r.id === reportId)
    if (index > -1) {
      gameStore.player.missionReports.splice(index, 1)
    }
  }

  // 标记礼物通知为已读
  const markGiftAsRead = (gift: GiftNotification) => {
    if (!gift.read) {
      gift.read = true
    }
  }

  // 接受礼物
  const acceptGift = (gift: GiftNotification) => {
    const npc = npcStore.npcs.find(n => n.id === gift.fromNpcId)
    if (npc) {
      diplomaticLogic.acceptNPCGift(gameStore.player, npc, gift, gameStore.locale)
    }
  }

  // 拒绝礼物
  const rejectGift = (gift: GiftNotification) => {
    const npc = npcStore.npcs.find(n => n.id === gift.fromNpcId)
    if (npc) {
      diplomaticLogic.rejectNPCGift(gameStore.player, npc, gift, gameStore.locale)
    }
  }

  // 删除礼物通知
  const deleteGiftNotification = (giftId: string) => {
    if (!gameStore.player.giftNotifications) {
      return
    }
    const index = gameStore.player.giftNotifications.findIndex(g => g.id === giftId)
    if (index > -1) {
      gameStore.player.giftNotifications.splice(index, 1)
    }
  }

  // 标记礼物被拒绝通知为已读
  const markGiftRejectedAsRead = (rejection: GiftRejectedNotification) => {
    if (!rejection.read) {
      rejection.read = true
    }
  }

  // 删除礼物被拒绝通知
  const deleteGiftRejectedNotification = (rejectionId: string) => {
    if (!gameStore.player.giftRejectedNotifications) {
      return
    }
    const index = gameStore.player.giftRejectedNotifications.findIndex(r => r.id === rejectionId)
    if (index > -1) {
      gameStore.player.giftRejectedNotifications.splice(index, 1)
    }
  }
</script>
