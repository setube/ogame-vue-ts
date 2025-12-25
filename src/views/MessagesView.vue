<template>
  <div class="container mx-auto p-4 sm:p-6 space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl sm:text-3xl font-bold">{{ t('messagesView.title') }}</h1>

      <!-- 清空消息按钮 -->
      <Popover v-model:open="showClearPopover">
        <PopoverTrigger as-child>
          <Button variant="outline" size="sm" class="gap-2">
            <Trash2 class="h-4 w-4" />
            {{ t('messagesView.clearMessages') }}
          </Button>
        </PopoverTrigger>
        <PopoverContent class="w-80">
          <div class="space-y-4">
            <div class="space-y-2">
              <h4 class="font-medium leading-none">{{ t('messagesView.clearMessageTypes') }}</h4>
            </div>
            <div class="space-y-3">
              <div v-for="option in clearOptionFields" :key="option.key" class="flex items-center space-x-2">
                <Checkbox :id="`clear-${option.key}`" v-model="clearOptions[option.key]" />
                <label :for="`clear-${option.key}`" class="text-sm cursor-pointer">
                  {{ t(`messagesView.${option.labelKey}`) }} ({{ option.count }})
                </label>
              </div>
            </div>
            <Button @click="clearSelectedMessages" class="w-full" :disabled="!hasSelectedAny">
              {{ t('messagesView.clearNow') }}
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>

    <!-- 标签切换 -->
    <Tabs v-model="activeTab" class="w-full">
      <TabsList class="grid w-full grid-cols-2 sm:grid-cols-4" :tab-count="4">
        <TabsTrigger v-for="tab in tabs" :key="tab.value" :value="tab.value" class="flex items-center justify-center gap-1 px-2">
          <component :is="tab.icon" class="h-3 w-3 sm:h-4 sm:w-4" />
          <span class="text-xs sm:text-sm truncate">{{ tab.label }}</span>
          <Badge v-if="tab.unreadCount > 0" variant="destructive" class="ml-1 text-xs">
            {{ tab.unreadCount }}
          </Badge>
        </TabsTrigger>
      </TabsList>

      <!-- 战斗报告列表 -->
      <TabsContent value="battles" class="mt-4 space-y-2 pb-20">
        <Empty v-if="gameStore.player.battleReports.length === 0" class="border rounded-lg">
          <EmptyContent>
            <Sword class="h-10 w-10 text-muted-foreground" />
            <EmptyDescription>{{ t('messagesView.noBattleReports') }}</EmptyDescription>
          </EmptyContent>
        </Empty>

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
      <TabsContent value="spy" class="mt-4 space-y-2 pb-20">
        <Empty v-if="gameStore.player.spyReports.length === 0 && sortedSpiedNotifications.length === 0" class="border rounded-lg">
          <EmptyContent>
            <Eye class="h-10 w-10 text-muted-foreground" />
            <EmptyDescription>{{ t('messagesView.noSpyReports') }}</EmptyDescription>
          </EmptyContent>
        </Empty>

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
                <Badge variant="outline" class="text-xs">{{ getSpyReportTargetName(report) }}</Badge>
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
              {{ getNpcName(notification.npcId, notification.npcName) }} → {{ notification.targetPlanetName }} ·
              {{ formatDate(notification.timestamp) }}
            </CardDescription>
          </CardHeader>
        </Card>
      </TabsContent>

      <!-- NPC相关消息（活动、礼物、被拒绝、贸易提议、情报、联合攻击邀请） -->
      <TabsContent value="npc" class="mt-4 space-y-2 pb-20">
        <Empty
          v-if="
            sortedNPCActivityNotifications.length === 0 &&
            sortedGiftNotifications.length === 0 &&
            sortedGiftRejectedNotifications.length === 0 &&
            sortedTradeOffers.length === 0 &&
            sortedIntelReports.length === 0 &&
            sortedJointAttackInvites.length === 0
          "
          class="border rounded-lg"
        >
          <EmptyContent>
            <Users class="h-10 w-10 text-muted-foreground" />
            <EmptyDescription>{{ t('messagesView.noNPCActivity') }}</EmptyDescription>
          </EmptyContent>
        </Empty>

        <!-- 贸易提议 -->
        <Card
          v-for="offer in sortedTradeOffers"
          :key="offer.id"
          @click="openTradeOfferDialog(offer)"
          class="cursor-pointer hover:shadow-md transition-shadow"
        >
          <CardHeader class="pb-3">
            <div class="flex justify-between items-center gap-2">
              <div class="flex items-center gap-2 min-w-0 flex-1">
                <ArrowLeftRight class="h-4 w-4 shrink-0 text-amber-500" />
                <CardTitle class="text-base sm:text-lg">{{ t('npcBehavior.trade.title') }}</CardTitle>
                <Badge variant="default" class="text-xs">{{ t('messagesView.pending') }}</Badge>
                <Badge v-if="isOfferExpired(offer)" variant="destructive" class="text-xs">
                  {{ t('npcBehavior.trade.expired') }}
                </Badge>
              </div>
              <Button @click.stop="deleteTradeOffer(offer.id)" variant="ghost" size="icon" class="h-8 w-8 shrink-0">
                <X class="h-4 w-4" />
              </Button>
            </div>
            <CardDescription class="text-xs sm:text-sm">
              {{ getNpcNameById(offer.npcId) }} · {{ formatDate(offer.timestamp) }}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div class="space-y-2 text-sm">
              <div class="flex gap-4">
                <div class="flex-1 flex items-center gap-1">
                  <span class="text-green-600 dark:text-green-400">{{ t('npcBehavior.trade.offers') }}:</span>
                  <template v-if="getResourceInfo(offer.offeredResources)">
                    <ResourceIcon :type="getResourceInfo(offer.offeredResources)!.type" size="sm" />
                    <NumberWithTooltip :value="getResourceInfo(offer.offeredResources)!.amount" />
                  </template>
                  <span v-else>-</span>
                </div>
                <div class="flex-1 flex items-center gap-1">
                  <span class="text-red-600 dark:text-red-400">{{ t('npcBehavior.trade.requests') }}:</span>
                  <template v-if="getResourceInfo(offer.requestedResources)">
                    <ResourceIcon :type="getResourceInfo(offer.requestedResources)!.type" size="sm" />
                    <NumberWithTooltip :value="getResourceInfo(offer.requestedResources)!.amount" />
                  </template>
                  <span v-else>-</span>
                </div>
              </div>
              <div class="flex gap-2 mt-2">
                <Button
                  @click.stop="acceptTradeOffer(offer)"
                  variant="default"
                  size="sm"
                  class="flex-1"
                  :disabled="isOfferExpired(offer) || !canAcceptTrade(offer)"
                >
                  {{ t('npcBehavior.trade.accept') }}
                </Button>
                <Button @click.stop="declineTradeOffer(offer)" variant="outline" size="sm" class="flex-1">
                  {{ t('npcBehavior.trade.decline') }}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- 情报报告 -->
        <Card
          v-for="intel in sortedIntelReports"
          :key="intel.id"
          @click="openIntelReportDialog(intel)"
          class="cursor-pointer hover:shadow-md transition-shadow"
        >
          <CardHeader class="pb-3">
            <div class="flex justify-between items-center gap-2">
              <div class="flex items-center gap-2 min-w-0 flex-1">
                <FileText class="h-4 w-4 shrink-0 text-blue-500" />
                <CardTitle class="text-base sm:text-lg">{{ t('npcBehavior.intel.title') }}</CardTitle>
                <Badge v-if="!intel.read" variant="default" class="text-xs">{{ t('messagesView.unread') }}</Badge>
                <Badge variant="outline" class="text-xs">{{ t(`npcBehavior.intel.types.${intel.intelType}`) }}</Badge>
              </div>
              <Button @click.stop="deleteIntelReport(intel.id)" variant="ghost" size="icon" class="h-8 w-8 shrink-0">
                <X class="h-4 w-4" />
              </Button>
            </div>
            <CardDescription class="text-xs sm:text-sm">
              {{ t('npcBehavior.intel.from') }}: {{ getNpcNameById(intel.fromNpcId) }} → {{ t('npcBehavior.intel.target') }}:
              {{ getNpcNameById(intel.targetNpcId) }} ·
              {{ formatDate(intel.timestamp) }}
            </CardDescription>
          </CardHeader>
        </Card>

        <!-- 联合攻击邀请 -->
        <Card
          v-for="invite in sortedJointAttackInvites"
          :key="invite.id"
          @click="openJointAttackDialog(invite)"
          class="cursor-pointer hover:shadow-md transition-shadow"
        >
          <CardHeader class="pb-3">
            <div class="flex justify-between items-center gap-2">
              <div class="flex items-center gap-2 min-w-0 flex-1">
                <Swords class="h-4 w-4 shrink-0 text-red-500" />
                <CardTitle class="text-base sm:text-lg">{{ t('npcBehavior.jointAttack.title') }}</CardTitle>
                <Badge variant="default" class="text-xs">{{ t('messagesView.pending') }}</Badge>
                <Badge v-if="isInviteExpired(invite)" variant="destructive" class="text-xs">
                  {{ t('npcBehavior.jointAttack.expired') }}
                </Badge>
              </div>
              <Button @click.stop="deleteJointAttackInvite(invite.id)" variant="ghost" size="icon" class="h-8 w-8 shrink-0">
                <X class="h-4 w-4" />
              </Button>
            </div>
            <CardDescription class="text-xs sm:text-sm">
              {{ getNpcNameById(invite.fromNpcId) }} → {{ getNpcNameById(invite.targetNpcId) }} ({{ invite.targetNpcName }}) ·
              {{ formatDate(invite.timestamp) }}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div class="space-y-2 text-sm">
              <div>{{ t('npcBehavior.jointAttack.lootShare') }}: {{ (invite.expectedLootRatio * 100).toFixed(0) }}%</div>
              <div class="flex gap-2 mt-2">
                <Button
                  @click.stop="acceptJointAttack(invite)"
                  variant="default"
                  size="sm"
                  class="flex-1"
                  :disabled="isInviteExpired(invite)"
                >
                  {{ t('npcBehavior.jointAttack.accept') }}
                </Button>
                <Button @click.stop="declineJointAttack(invite)" variant="outline" size="sm" class="flex-1">
                  {{ t('npcBehavior.jointAttack.decline') }}
                </Button>
              </div>
            </div>
          </CardContent>
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
              <Button @click.stop="deleteNPCActivityNotification(notification.id)" variant="ghost" size="icon" class="h-8 w-8 shrink-0">
                <X class="h-4 w-4" />
              </Button>
            </div>
            <CardDescription class="text-xs sm:text-sm">
              {{ getNpcName(notification.npcId, notification.npcName) }} →
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
                <CardTitle class="text-base sm:text-lg">
                  {{ t('messagesView.giftFrom').replace('{npcName}', getNpcName(gift.fromNpcId, gift.fromNpcName)) }}
                </CardTitle>
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
                  <template v-for="res in basicResourceFields" :key="res.key">
                    <div v-if="gift.resources[res.key] > 0">
                      {{ t(`resources.${res.key}`) }}: {{ gift.resources[res.key].toLocaleString() }}
                    </div>
                  </template>
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
                  {{ t('messagesView.giftRejectedBy').replace('{npcName}', getNpcName(rejection.npcId, rejection.npcName)) }}
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
                  <template v-for="res in basicResourceFields" :key="res.key">
                    <div v-if="rejection.rejectedResources[res.key] > 0">
                      {{ t(`resources.${res.key}`) }}: {{ rejection.rejectedResources[res.key].toLocaleString() }}
                    </div>
                  </template>
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
      <TabsContent value="missions" class="mt-4 space-y-2 pb-20">
        <Empty v-if="sortedMissionReports.length === 0" class="border rounded-lg">
          <EmptyContent>
            <Package class="h-10 w-10 text-muted-foreground" />
            <EmptyDescription>{{ t('messagesView.noMissionReports') }}</EmptyDescription>
          </EmptyContent>
        </Empty>

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

    <!-- 固定底部分页 -->
    <FixedPagination v-model:page="currentPage[activeTab]" :total-pages="getPaginationConfig(activeTab).totalPages" />

    <!-- 战斗报告对话框 -->
    <BattleReportDialog v-model:open="showBattleDialog" :report="selectedBattleReport" />

    <!-- 间谍报告对话框 -->
    <SpyReportDialog v-model:open="showSpyDialog" :report="selectedSpyReport" />

    <!-- 被侦查通知对话框 -->
    <SpiedNotificationDialog v-model:open="showSpiedDialog" :notification="selectedSpiedNotification" />

    <!-- 任务报告对话框 -->
    <MissionReportDialog v-model:open="showMissionDialog" :report="selectedMissionReport" />

    <!-- NPC活动通知对话框 -->
    <NPCActivityDialog v-model:open="showNPCActivityDialog" :notification="selectedNPCActivityNotification" />
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
  import { FixedPagination } from '@/components/ui/pagination'
  import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
  import { Checkbox } from '@/components/ui/checkbox'
  import BattleReportDialog from '@/components/dialogs/BattleReportDialog.vue'
  import SpyReportDialog from '@/components/dialogs/SpyReportDialog.vue'
  import SpiedNotificationDialog from '@/components/dialogs/SpiedNotificationDialog.vue'
  import MissionReportDialog from '@/components/dialogs/MissionReportDialog.vue'
  import NPCActivityDialog from '@/components/dialogs/NPCActivityDialog.vue'
  import ResourceIcon from '@/components/common/ResourceIcon.vue'
  import NumberWithTooltip from '@/components/common/NumberWithTooltip.vue'
  import { formatDate } from '@/utils/format'
  import {
    X,
    Sword,
    Eye,
    AlertTriangle,
    Package,
    Recycle,
    Gift,
    Ban,
    Check,
    Users,
    Trash2,
    ArrowLeftRight,
    FileText,
    Swords
  } from 'lucide-vue-next'
  import { Empty, EmptyContent, EmptyDescription } from '@/components/ui/empty'
  import type {
    BattleResult,
    SpyReport,
    SpiedNotification,
    NPCActivityNotification,
    MissionReport,
    GiftNotification,
    GiftRejectedNotification,
    TradeOffer,
    IntelReport,
    JointAttackInvite
  } from '@/types/game'
  import { MissionType } from '@/types/game'
  import { useNPCStore } from '@/stores/npcStore'
  import * as diplomaticLogic from '@/logic/diplomaticLogic'
  import { toast } from 'vue-sonner'

  const gameStore = useGameStore()
  const npcStore = useNPCStore()
  const { t } = useI18n()
  const activeTab = ref<'battles' | 'spy' | 'missions' | 'npc'>('battles')

  // 清空消息功能
  const showClearPopover = ref(false)
  type ClearOptionKey =
    | 'battles'
    | 'spyReports'
    | 'spiedNotifications'
    | 'missionReports'
    | 'npcActivity'
    | 'giftNotifications'
    | 'giftRejected'
    | 'tradeOffers'
    | 'intelReports'
    | 'jointAttackInvites'
  const clearOptions = ref<Record<ClearOptionKey, boolean>>({
    battles: false,
    spyReports: false,
    spiedNotifications: false,
    missionReports: false,
    npcActivity: false,
    giftNotifications: false,
    giftRejected: false,
    tradeOffers: false,
    intelReports: false,
    jointAttackInvites: false
  })

  // 清空消息选项配置
  const clearOptionFields = computed(() => [
    { key: 'battles' as ClearOptionKey, labelKey: 'clearBattleReports', count: gameStore.player.battleReports.length },
    { key: 'spyReports' as ClearOptionKey, labelKey: 'clearSpyReports', count: gameStore.player.spyReports.length },
    {
      key: 'spiedNotifications' as ClearOptionKey,
      labelKey: 'clearSpiedNotifications',
      count: gameStore.player.spiedNotifications?.length || 0
    },
    { key: 'missionReports' as ClearOptionKey, labelKey: 'clearMissionReports', count: gameStore.player.missionReports?.length || 0 },
    { key: 'npcActivity' as ClearOptionKey, labelKey: 'clearNPCActivity', count: gameStore.player.npcActivityNotifications?.length || 0 },
    {
      key: 'giftNotifications' as ClearOptionKey,
      labelKey: 'clearGiftNotifications',
      count: gameStore.player.giftNotifications?.length || 0
    },
    {
      key: 'giftRejected' as ClearOptionKey,
      labelKey: 'clearGiftRejected',
      count: gameStore.player.giftRejectedNotifications?.length || 0
    },
    { key: 'tradeOffers' as ClearOptionKey, labelKey: 'clearTradeOffers', count: gameStore.player.tradeOffers?.length || 0 },
    { key: 'intelReports' as ClearOptionKey, labelKey: 'clearIntelReports', count: gameStore.player.intelReports?.length || 0 },
    {
      key: 'jointAttackInvites' as ClearOptionKey,
      labelKey: 'clearJointAttackInvites',
      count: gameStore.player.jointAttackInvites?.length || 0
    }
  ])

  // 基础资源字段配置（用于显示资源列表）
  type BasicResourceKey = 'metal' | 'crystal' | 'deuterium'
  const basicResourceFields: { key: BasicResourceKey }[] = [{ key: 'metal' }, { key: 'crystal' }, { key: 'deuterium' }]

  /**
   * 获取NPC当前名称
   * 优先使用当前NPC的实际名称，如果NPC不存在则使用通知中保存的旧名称
   * 支持通过ID查找，也支持通过旧名称中的ID模式匹配
   */
  const getNpcName = (npcId: string | undefined, fallbackName: string): string => {
    if (!npcStore.npcs?.length) return fallbackName

    // 1. 先通过 npcId 查找
    if (npcId) {
      const npc = npcStore.npcs.find(n => n.id === npcId)
      if (npc) return npc.name
    }

    // 2. 尝试从旧名称中提取ID并查找
    // 旧格式如 "NPC-npc_182"，新ID格式为 "npc_182"
    const idMatch = fallbackName.match(/npc_\d+/)
    if (idMatch) {
      const extractedId = idMatch[0]
      const npc = npcStore.npcs.find(n => n.id === extractedId)
      if (npc) return npc.name
    }

    return fallbackName
  }

  /**
   * 获取侦查报告的目标名称
   * 显示 NPC 名称（如果是 NPC 星球）或星球名称
   */
  const getSpyReportTargetName = (report: SpyReport): string => {
    // 尝试通过 targetPlayerId 获取 NPC 名称
    if (report.targetPlayerId && report.targetPlayerId !== 'unknown') {
      const npc = npcStore.npcs.find(n => n.id === report.targetPlayerId)
      if (npc) return npc.name
    }
    // 回退到星球名称
    return report.targetPlanetName || report.targetPlanetId
  }

  const hasSelectedAny = computed(() => {
    return Object.values(clearOptions.value).some(v => v)
  })

  const clearSelectedMessages = () => {
    if (clearOptions.value.battles) {
      gameStore.player.battleReports = []
    }
    if (clearOptions.value.spyReports) {
      gameStore.player.spyReports = []
    }
    if (clearOptions.value.spiedNotifications) {
      gameStore.player.spiedNotifications = []
    }
    if (clearOptions.value.missionReports) {
      gameStore.player.missionReports = []
    }
    if (clearOptions.value.npcActivity) {
      gameStore.player.npcActivityNotifications = []
    }
    if (clearOptions.value.giftNotifications) {
      gameStore.player.giftNotifications = []
    }
    if (clearOptions.value.giftRejected) {
      gameStore.player.giftRejectedNotifications = []
    }
    if (clearOptions.value.tradeOffers) {
      gameStore.player.tradeOffers = []
    }
    if (clearOptions.value.intelReports) {
      gameStore.player.intelReports = []
    }
    if (clearOptions.value.jointAttackInvites) {
      gameStore.player.jointAttackInvites = []
    }

    // 重置选项
    clearOptions.value = {
      battles: false,
      spyReports: false,
      spiedNotifications: false,
      missionReports: false,
      npcActivity: false,
      giftNotifications: false,
      giftRejected: false,
      tradeOffers: false,
      intelReports: false,
      jointAttackInvites: false
    }

    // 关闭popover
    showClearPopover.value = false

    // 显示成功提示
    toast.success(t('messagesView.clearSuccess'))
  }

  // 分页状态
  const ITEMS_PER_PAGE = 10
  const currentPage = ref({
    battles: 1,
    spy: 1,
    missions: 1,
    npc: 1
  })

  // 对话框状态
  const showBattleDialog = ref(false)
  const showSpyDialog = ref(false)
  const showSpiedDialog = ref(false)
  const showMissionDialog = ref(false)
  const showNPCActivityDialog = ref(false)
  const selectedBattleReport = ref<BattleResult | null>(null)
  const selectedSpyReport = ref<SpyReport | null>(null)
  const selectedSpiedNotification = ref<SpiedNotification | null>(null)
  const selectedMissionReport = ref<MissionReport | null>(null)
  const selectedNPCActivityNotification = ref<NPCActivityNotification | null>(null)

  // 排序后的战斗报告（最新的在前）- 全部数据
  const allBattleReports = computed(() => {
    return [...gameStore.player.battleReports].sort((a, b) => b.timestamp - a.timestamp)
  })

  // 排序后的间谍报告（最新的在前）- 全部数据
  const allSpyReports = computed(() => {
    return [...gameStore.player.spyReports].sort((a, b) => b.timestamp - a.timestamp)
  })

  // 排序后的被侦查通知（最新的在前）- 全部数据
  const allSpiedNotifications = computed(() => {
    if (!gameStore.player.spiedNotifications) {
      return []
    }
    return [...gameStore.player.spiedNotifications].sort((a, b) => b.timestamp - a.timestamp)
  })

  // 排序后的任务报告（最新的在前）- 全部数据
  const allMissionReports = computed(() => {
    if (!gameStore.player.missionReports) {
      return []
    }
    return [...gameStore.player.missionReports].sort((a, b) => b.timestamp - a.timestamp)
  })

  // 排序后的NPC活动通知（最新的在前）- 全部数据
  const allNPCActivityNotifications = computed(() => {
    if (!gameStore.player.npcActivityNotifications) {
      return []
    }
    return [...gameStore.player.npcActivityNotifications].sort((a, b) => b.timestamp - a.timestamp)
  })

  // 战斗报告分页
  const battleReportsTotalPages = computed(() => Math.ceil(allBattleReports.value.length / ITEMS_PER_PAGE))
  const sortedBattleReports = computed(() => {
    const start = (currentPage.value.battles - 1) * ITEMS_PER_PAGE
    const end = start + ITEMS_PER_PAGE
    return allBattleReports.value.slice(start, end)
  })

  // 侦查标签页合并数据（侦查报告 + 被侦查通知）
  const allSpyTabItems = computed(() => {
    const spyReports = allSpyReports.value.map(item => ({ ...item, type: 'spy' as const }))
    const spiedNotifications = allSpiedNotifications.value.map(item => ({ ...item, type: 'spied' as const }))
    return [...spyReports, ...spiedNotifications].sort((a, b) => b.timestamp - a.timestamp)
  })

  const spyTabTotalPages = computed(() => Math.ceil(allSpyTabItems.value.length / ITEMS_PER_PAGE))
  const paginatedSpyTabItems = computed(() => {
    const start = (currentPage.value.spy - 1) * ITEMS_PER_PAGE
    const end = start + ITEMS_PER_PAGE
    return allSpyTabItems.value.slice(start, end)
  })

  // 从分页后的混合数据中分离出侦查报告和被侦查通知
  const sortedSpyReports = computed(() => {
    return paginatedSpyTabItems.value.filter(item => item.type === 'spy')
  })

  const sortedSpiedNotifications = computed(() => {
    return paginatedSpyTabItems.value.filter(item => item.type === 'spied')
  })

  // 任务报告分页
  const missionReportsTotalPages = computed(() => Math.ceil(allMissionReports.value.length / ITEMS_PER_PAGE))
  const sortedMissionReports = computed(() => {
    const start = (currentPage.value.missions - 1) * ITEMS_PER_PAGE
    const end = start + ITEMS_PER_PAGE
    return allMissionReports.value.slice(start, end)
  })

  // 贸易提议数据
  const allTradeOffers = computed(() => {
    if (!gameStore.player.tradeOffers) return []
    return [...gameStore.player.tradeOffers].sort((a, b) => b.timestamp - a.timestamp)
  })

  // 情报报告数据
  const allIntelReports = computed(() => {
    if (!gameStore.player.intelReports) return []
    return [...gameStore.player.intelReports].sort((a, b) => b.timestamp - a.timestamp)
  })

  // 联合攻击邀请数据
  const allJointAttackInvites = computed(() => {
    if (!gameStore.player.jointAttackInvites) return []
    return [...gameStore.player.jointAttackInvites].sort((a, b) => b.timestamp - a.timestamp)
  })

  // NPC标签页合并数据（活动通知 + 礼物通知 + 礼物被拒绝通知 + 贸易提议 + 情报报告 + 联合攻击邀请）
  const allNPCTabItems = computed(() => {
    const activities = allNPCActivityNotifications.value.map(item => ({ ...item, type: 'activity' as const }))
    const gifts = allGiftNotifications.value.map(item => ({ ...item, type: 'gift' as const }))
    const rejections = allGiftRejectedNotifications.value.map(item => ({ ...item, type: 'rejection' as const }))
    const trades = allTradeOffers.value.map(item => ({ ...item, type: 'trade' as const }))
    const intels = allIntelReports.value.map(item => ({ ...item, type: 'intel' as const }))
    const jointAttacks = allJointAttackInvites.value.map(item => ({ ...item, type: 'jointAttack' as const }))
    return [...activities, ...gifts, ...rejections, ...trades, ...intels, ...jointAttacks].sort((a, b) => b.timestamp - a.timestamp)
  })

  const npcTabTotalPages = computed(() => Math.ceil(allNPCTabItems.value.length / ITEMS_PER_PAGE))
  const paginatedNPCTabItems = computed(() => {
    const start = (currentPage.value.npc - 1) * ITEMS_PER_PAGE
    const end = start + ITEMS_PER_PAGE
    return allNPCTabItems.value.slice(start, end)
  })

  // 从分页后的混合数据中分离出各种NPC消息
  const sortedNPCActivityNotifications = computed(() => {
    return paginatedNPCTabItems.value.filter(item => item.type === 'activity')
  })

  const sortedGiftNotifications = computed(() => {
    return paginatedNPCTabItems.value.filter(item => item.type === 'gift')
  })

  const sortedGiftRejectedNotifications = computed(() => {
    return paginatedNPCTabItems.value.filter(item => item.type === 'rejection')
  })

  const sortedTradeOffers = computed(() => {
    return paginatedNPCTabItems.value.filter(item => item.type === 'trade')
  })

  const sortedIntelReports = computed(() => {
    return paginatedNPCTabItems.value.filter(item => item.type === 'intel')
  })

  const sortedJointAttackInvites = computed(() => {
    return paginatedNPCTabItems.value.filter(item => item.type === 'jointAttack')
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

  // 待处理贸易提议数量（未过期）
  const pendingTradeOffers = computed(() => {
    const now = Date.now()
    return (gameStore.player.tradeOffers || []).filter(o => o.expiresAt > now).length
  })

  // 未读情报报告数量
  const unreadIntelReports = computed(() => {
    return (gameStore.player.intelReports || []).filter(r => !r.read).length
  })

  // 待处理联合攻击邀请数量（未过期）
  const pendingJointAttackInvites = computed(() => {
    const now = Date.now()
    return (gameStore.player.jointAttackInvites || []).filter(i => i.expiresAt > now).length
  })

  // 合并：侦查相关未读总数（侦查报告 + 被侦查通知）
  const unreadSpyTotal = computed(() => {
    return unreadSpyReports.value + unreadSpiedNotifications.value
  })

  // 合并：NPC相关未读总数（NPC活动 + 礼物通知 + 礼物被拒绝 + 贸易提议 + 情报 + 联合攻击邀请）
  const unreadNPCTotal = computed(() => {
    return (
      unreadNPCActivity.value +
      unreadGiftNotifications.value +
      unreadGiftRejected.value +
      pendingTradeOffers.value +
      unreadIntelReports.value +
      pendingJointAttackInvites.value
    )
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

  // 礼物通知和被拒绝通知的全部数据（用于NPC标签页合并）
  const allGiftNotifications = computed(() => {
    if (!gameStore.player.giftNotifications) {
      return []
    }
    return [...gameStore.player.giftNotifications].sort((a, b) => b.timestamp - a.timestamp)
  })

  const allGiftRejectedNotifications = computed(() => {
    if (!gameStore.player.giftRejectedNotifications) {
      return []
    }
    return [...gameStore.player.giftRejectedNotifications].sort((a, b) => b.timestamp - a.timestamp)
  })

  // 分页配置
  type PageKey = 'battles' | 'spy' | 'missions' | 'npc'
  const paginationConfigs = computed(() => ({
    battles: {
      totalPages: battleReportsTotalPages.value
    },
    spy: {
      totalPages: spyTabTotalPages.value
    },
    missions: {
      totalPages: missionReportsTotalPages.value
    },
    npc: {
      totalPages: npcTabTotalPages.value
    }
  }))

  // 获取指定标签页的分页配置
  const getPaginationConfig = (key: PageKey) => paginationConfigs.value[key]

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
    // 找到原始间谍报告对象并标记为已读（因为sortedSpyReports是副本）
    const originalReport = gameStore.player.spyReports.find(r => r.id === report.id)
    if (originalReport && !originalReport.read) {
      originalReport.read = true
    }
  }

  // 打开被侦查通知
  const openSpiedNotification = (notification: SpiedNotification) => {
    // 找到原始通知对象并标记为已读（因为sortedSpiedNotifications是副本）
    const originalNotification = gameStore.player.spiedNotifications?.find(n => n.id === notification.id)
    if (originalNotification && !originalNotification.read) {
      originalNotification.read = true
    }
    // 设置选中的通知并打开详情对话框
    selectedSpiedNotification.value = notification
    showSpiedDialog.value = true
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
    // 找到原始通知对象并标记为已读（因为sortedNPCActivityNotifications是副本）
    const originalNotification = gameStore.player.npcActivityNotifications?.find(n => n.id === notification.id)
    if (originalNotification && !originalNotification.read) {
      originalNotification.read = true
    }
    // 设置选中的通知并打开详情对话框
    selectedNPCActivityNotification.value = notification
    showNPCActivityDialog.value = true
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
      [MissionType.Expedition]: t('fleetView.expedition'),
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
    // 设置选中的报告并打开详情对话框
    selectedMissionReport.value = report
    showMissionDialog.value = true
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
    // 找到原始礼物通知对象并标记为已读（因为gifts是副本）
    const originalGift = gameStore.player.giftNotifications?.find(g => g.id === gift.id)
    if (originalGift && !originalGift.read) {
      originalGift.read = true
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
    // 找到原始拒绝通知对象并标记为已读（因为rejections是副本）
    const originalRejection = gameStore.player.giftRejectedNotifications?.find(r => r.id === rejection.id)
    if (originalRejection && !originalRejection.read) {
      originalRejection.read = true
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

  // ========== 贸易提议相关 ==========

  // 通过 NPC ID 获取名称
  const getNpcNameById = (npcId: string): string => {
    const npc = npcStore.npcs.find(n => n.id === npcId)
    return npc?.name || npcId
  }

  // 检查贸易提议是否过期
  const isOfferExpired = (offer: TradeOffer): boolean => {
    const now = Date.now()
    return offer.expiresAt <= now
  }

  // 检查联合攻击邀请是否过期
  const isInviteExpired = (invite: JointAttackInvite): boolean => {
    const now = Date.now()
    return invite.expiresAt <= now
  }

  // 辅助函数：从资源对象中提取资源信息（兼容新旧格式）
  // 用于模板显示和逻辑处理
  const getResourceInfo = (resource: any): { type: 'metal' | 'crystal' | 'deuterium'; amount: number } | null => {
    if (!resource) return null

    // 新格式：{ type: 'metal', amount: 1000 }
    if (resource.type && typeof resource.amount === 'number' && !isNaN(resource.amount)) {
      return { type: resource.type, amount: resource.amount }
    }

    // 旧格式：{ metal: 1000, crystal: 0, deuterium: 0 }
    if (typeof resource.metal === 'number' && resource.metal > 0) {
      return { type: 'metal', amount: resource.metal }
    }
    if (typeof resource.crystal === 'number' && resource.crystal > 0) {
      return { type: 'crystal', amount: resource.crystal }
    }
    if (typeof resource.deuterium === 'number' && resource.deuterium > 0) {
      return { type: 'deuterium', amount: resource.deuterium }
    }

    return null
  }

  // 别名，供内部逻辑使用
  const extractResourceInfo = getResourceInfo

  // 检查是否可以接受贸易
  const canAcceptTrade = (offer: TradeOffer): boolean => {
    const planet = gameStore.player.planets[0]
    if (!planet) return false

    const requested = extractResourceInfo(offer.requestedResources)
    if (!requested) return false

    return planet.resources[requested.type] >= requested.amount
  }

  // 打开贸易提议详情对话框（目前直接操作，后续可添加对话框）
  const openTradeOfferDialog = (_offer: TradeOffer) => {
    // 目前贸易提议直接在卡片上操作，不需要单独的对话框
  }

  // 接受贸易提议
  const acceptTradeOffer = (offer: TradeOffer) => {
    if (isOfferExpired(offer)) {
      toast.error(t('npcBehavior.trade.expired'))
      return
    }
    if (!canAcceptTrade(offer)) {
      toast.error(t('npcBehavior.trade.acceptFailed'))
      return
    }

    const planet = gameStore.player.planets[0]
    if (!planet) return

    const requested = extractResourceInfo(offer.requestedResources)
    const offered = extractResourceInfo(offer.offeredResources)

    if (!requested || !offered) {
      toast.error(t('npcBehavior.trade.acceptFailed'))
      return
    }

    // 扣除请求的资源
    planet.resources[requested.type] -= requested.amount

    // 添加获得的资源
    planet.resources[offered.type] += offered.amount

    // 移除贸易提议
    deleteTradeOffer(offer.id)

    // 提高与该NPC的好感度（使用 npcStore）
    const npcRelation = npcStore.npcs.find(n => n.id === offer.npcId)?.relations?.[gameStore.player.id]
    if (npcRelation) {
      npcRelation.reputation += 10
    }

    toast.success(t('npcBehavior.trade.acceptSuccess'))
  }

  // 拒绝贸易提议
  const declineTradeOffer = (offer: TradeOffer) => {
    deleteTradeOffer(offer.id)
    toast.info(t('npcBehavior.trade.declined'))
  }

  // 删除贸易提议
  const deleteTradeOffer = (offerId: string) => {
    if (!gameStore.player.tradeOffers) return
    const index = gameStore.player.tradeOffers.findIndex(o => o.id === offerId)
    if (index > -1) {
      gameStore.player.tradeOffers.splice(index, 1)
    }
  }

  // ========== 情报报告相关 ==========

  // 打开情报报告详情对话框
  const openIntelReportDialog = (intel: IntelReport) => {
    // 标记为已读
    const originalIntel = gameStore.player.intelReports?.find(i => i.id === intel.id)
    if (originalIntel && !originalIntel.read) {
      originalIntel.read = true
    }
    // 目前情报报告直接显示在卡片上，后续可添加详情对话框
  }

  // 删除情报报告
  const deleteIntelReport = (intelId: string) => {
    if (!gameStore.player.intelReports) return
    const index = gameStore.player.intelReports.findIndex(i => i.id === intelId)
    if (index > -1) {
      gameStore.player.intelReports.splice(index, 1)
    }
  }

  // ========== 联合攻击邀请相关 ==========

  // 打开联合攻击邀请详情对话框
  const openJointAttackDialog = (_invite: JointAttackInvite) => {
    // 目前联合攻击邀请直接在卡片上操作，后续可添加详情对话框
  }

  // 接受联合攻击邀请
  const acceptJointAttack = (invite: JointAttackInvite) => {
    if (isInviteExpired(invite)) {
      toast.error(t('npcBehavior.jointAttack.expired'))
      return
    }

    // 移除邀请
    deleteJointAttackInvite(invite.id)

    // 提高与该NPC的好感度（使用 npcStore）
    const npcRelation = npcStore.npcs.find(n => n.id === invite.fromNpcId)?.relations?.[gameStore.player.id]
    if (npcRelation) {
      npcRelation.reputation += 15
    }

    toast.success(t('npcBehavior.jointAttack.acceptSuccess'))
    // 后续可以添加实际的联合攻击逻辑
  }

  // 拒绝联合攻击邀请
  const declineJointAttack = (invite: JointAttackInvite) => {
    deleteJointAttackInvite(invite.id)
    toast.info(t('npcBehavior.jointAttack.declined'))
  }

  // 删除联合攻击邀请
  const deleteJointAttackInvite = (inviteId: string) => {
    if (!gameStore.player.jointAttackInvites) return
    const index = gameStore.player.jointAttackInvites.findIndex(i => i.id === inviteId)
    if (index > -1) {
      gameStore.player.jointAttackInvites.splice(index, 1)
    }
  }
</script>
