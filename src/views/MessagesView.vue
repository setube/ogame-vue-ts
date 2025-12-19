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
      <TabsContent value="npc" class="mt-4 space-y-2 pb-20">
        <Empty
          v-if="
            sortedNPCActivityNotifications.length === 0 &&
            sortedGiftNotifications.length === 0 &&
            sortedGiftRejectedNotifications.length === 0
          "
          class="border rounded-lg"
        >
          <EmptyContent>
            <Users class="h-10 w-10 text-muted-foreground" />
            <EmptyDescription>{{ t('messagesView.noNPCActivity') }}</EmptyDescription>
          </EmptyContent>
        </Empty>

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

    <!-- 被侦查通知详情对话框 -->
    <Dialog :open="showSpiedDialog" @update:open="showSpiedDialog = $event">
      <DialogContent class="max-w-2xl">
        <DialogHeader>
          <DialogTitle class="flex items-center gap-2">
            <Eye class="h-5 w-5 text-purple-500" />
            {{ t('messagesView.spiedNotificationDetails') }}
          </DialogTitle>
          <DialogDescription>
            {{ t('messagesView.spyDetected') }}
          </DialogDescription>
        </DialogHeader>

        <div v-if="selectedSpiedNotification" class="space-y-4">
          <!-- 侦查者信息 -->
          <div class="p-4 bg-muted/50 rounded-lg">
            <div class="flex items-center gap-2 mb-2">
              <h3 class="font-semibold text-lg">{{ selectedSpiedNotification.npcName }}</h3>
              <Badge variant="destructive">{{ t('messagesView.spyDetected') }}</Badge>
            </div>
            <p class="text-sm text-muted-foreground">
              {{ formatDate(selectedSpiedNotification.timestamp) }}
            </p>
          </div>

          <!-- 被侦查星球 -->
          <div class="space-y-2">
            <h4 class="font-semibold text-sm">{{ t('messagesView.targetPlanet') }}</h4>
            <div class="p-3 bg-muted/30 rounded-md flex items-center gap-2">
              <Globe class="h-4 w-4 text-blue-500" />
              <span class="font-medium">{{ selectedSpiedNotification.targetPlanetName }}</span>
            </div>
          </div>

          <!-- 检测结果 -->
          <div class="space-y-2">
            <h4 class="font-semibold text-sm">{{ t('messagesView.detectionResult') }}</h4>
            <div class="p-3 bg-muted/30 rounded-md">
              <div v-if="selectedSpiedNotification.detectionSuccess" class="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
                <AlertTriangle class="h-5 w-5" />
                <span class="font-medium">{{ t('messagesView.detectionSuccess') }}</span>
              </div>
              <p class="text-sm mt-2">
                {{
                  t('messagesView.spiedNotificationMessage', {
                    npc: selectedSpiedNotification.npcName,
                    planet: selectedSpiedNotification.targetPlanetName
                  })
                }}
              </p>
            </div>
          </div>

          <!-- 建议 -->
          <div class="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-md border border-blue-200 dark:border-blue-800">
            <p class="text-sm text-blue-800 dark:text-blue-200">
              {{ t('messagesView.spiedNotificationTip') }}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" @click="showSpiedDialog = false">{{ t('common.close') }}</Button>
          <Button @click="viewNPCInGalaxy(selectedSpiedNotification?.npcId)">{{ t('messagesView.viewInGalaxy') }}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- 任务报告详情对话框 -->
    <Dialog :open="showMissionDialog" @update:open="showMissionDialog = $event">
      <DialogContent class="max-w-2xl">
        <DialogHeader>
          <DialogTitle class="flex items-center gap-2">
            <component :is="getMissionIcon(selectedMissionReport?.missionType)" class="h-5 w-5" />
            {{ t('messagesView.missionReportDetails') }}
          </DialogTitle>
          <DialogDescription>
            {{ t('messagesView.missionDetails') }}
          </DialogDescription>
        </DialogHeader>

        <div v-if="selectedMissionReport" class="space-y-4">
          <!-- 任务状态 -->
          <div class="p-4 bg-muted/50 rounded-lg">
            <div class="flex items-center gap-2 mb-2">
              <h3 class="font-semibold text-lg">{{ getMissionTypeName(selectedMissionReport.missionType) }}</h3>
              <Badge :variant="selectedMissionReport.success ? 'default' : 'destructive'">
                {{ selectedMissionReport.success ? t('messagesView.missionSuccess') : t('messagesView.missionFailed') }}
              </Badge>
            </div>
            <p class="text-sm text-muted-foreground">
              {{ formatDate(selectedMissionReport.timestamp) }}
            </p>
          </div>

          <!-- 起点和终点 -->
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <h4 class="font-semibold text-sm">{{ t('messagesView.origin') }}</h4>
              <div class="p-3 bg-muted/30 rounded-md">
                <p class="font-medium">{{ selectedMissionReport.originPlanetName }}</p>
              </div>
            </div>
            <div class="space-y-2">
              <h4 class="font-semibold text-sm">{{ t('messagesView.destination') }}</h4>
              <div class="p-3 bg-muted/30 rounded-md">
                <p class="font-medium" v-if="selectedMissionReport.targetPlanetName">{{ selectedMissionReport.targetPlanetName }}</p>
                <p class="text-sm text-muted-foreground" v-else>
                  [{{ selectedMissionReport.targetPosition.galaxy }}:{{ selectedMissionReport.targetPosition.system }}:{{
                    selectedMissionReport.targetPosition.position
                  }}]
                </p>
              </div>
            </div>
          </div>

          <!-- 任务详情 -->
          <div class="space-y-2">
            <h4 class="font-semibold text-sm">{{ t('messagesView.missionDetails') }}</h4>
            <div class="p-3 bg-muted/30 rounded-md">
              <p class="text-sm mb-2">{{ selectedMissionReport.message }}</p>

              <!-- 运输任务详情 -->
              <div v-if="selectedMissionReport.details?.transportedResources" class="mt-3 space-y-1">
                <p class="text-xs font-semibold text-muted-foreground">{{ t('messagesView.transportedResources') }}:</p>
                <div class="grid grid-cols-3 gap-2 text-sm">
                  <div v-for="res in basicResourceFields" :key="res.key">
                    {{ t(`resources.${res.key}`) }}: {{ selectedMissionReport.details.transportedResources[res.key].toLocaleString() }}
                  </div>
                </div>
              </div>

              <!-- 回收任务详情 -->
              <div v-if="selectedMissionReport.details?.recycledResources" class="mt-3 space-y-1">
                <p class="text-xs font-semibold text-muted-foreground">{{ t('messagesView.recycledResources') }}:</p>
                <div class="grid grid-cols-2 gap-2 text-sm">
                  <div v-for="res in debrisResourceFields" :key="res.key">
                    {{ t(`resources.${res.key}`) }}: {{ selectedMissionReport.details.recycledResources[res.key].toLocaleString() }}
                  </div>
                </div>
                <div v-if="selectedMissionReport.details.remainingDebris" class="mt-2">
                  <p class="text-xs font-semibold text-muted-foreground">{{ t('messagesView.remainingDebris') }}:</p>
                  <div class="grid grid-cols-2 gap-2 text-sm text-yellow-600 dark:text-yellow-400">
                    <div v-for="res in debrisResourceFields" :key="res.key">
                      {{ t(`resources.${res.key}`) }}: {{ selectedMissionReport.details.remainingDebris[res.key].toLocaleString() }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- 殖民任务详情 -->
              <div v-if="selectedMissionReport.details?.newPlanetName" class="mt-3">
                <p class="text-xs font-semibold text-muted-foreground">{{ t('messagesView.newPlanet') }}:</p>
                <div class="flex items-center gap-2 mt-1">
                  <Globe class="h-4 w-4 text-green-500" />
                  <span class="font-medium">{{ selectedMissionReport.details.newPlanetName }}</span>
                </div>
              </div>

              <!-- 导弹攻击详情 -->
              <div v-if="selectedMissionReport.details?.missileCount !== undefined" class="mt-3 space-y-2">
                <p class="text-xs font-semibold text-muted-foreground">{{ t('galaxyView.missileAttack') }}:</p>
                <div class="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <span class="text-muted-foreground">{{ t('galaxyView.missileCount') }}:</span>
                    <span class="ml-1 font-medium">{{ selectedMissionReport.details.missileCount }}</span>
                  </div>
                  <div>
                    <span class="text-muted-foreground">{{ t('missionReports.hits') }}:</span>
                    <span class="ml-1 font-medium text-green-600">{{ selectedMissionReport.details.missileHits }}</span>
                  </div>
                  <div>
                    <span class="text-muted-foreground">{{ t('galaxyView.intercepted') }}:</span>
                    <span class="ml-1 font-medium text-yellow-600">{{ selectedMissionReport.details.missileIntercepted }}</span>
                  </div>
                </div>
                <div v-if="Object.keys(selectedMissionReport.details.defenseLosses || {}).length > 0" class="mt-2">
                  <p class="text-xs font-semibold text-muted-foreground">{{ t('galaxyView.defenseLosses') }}:</p>
                  <div class="grid grid-cols-2 gap-1 text-xs mt-1 p-2 bg-red-50 dark:bg-red-950/30 rounded">
                    <div v-for="(count, defenseType) in selectedMissionReport.details.defenseLosses" :key="defenseType">
                      <span class="text-muted-foreground">{{ t('defenses.' + defenseType) }}:</span>
                      <span class="ml-1 font-medium text-red-600 dark:text-red-400">-{{ count }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 探险任务详情 - 发现资源 -->
              <div v-if="selectedMissionReport.details?.foundResources" class="mt-3 space-y-1">
                <p class="text-xs font-semibold text-muted-foreground">{{ t('messagesView.resources') }}:</p>
                <div class="grid grid-cols-2 gap-2 text-sm p-2 bg-green-50 dark:bg-green-950/30 rounded">
                  <div v-for="res in allResourceFields" :key="res.key">
                    <template v-if="(selectedMissionReport.details?.foundResources?.[res.key] ?? 0) > 0">
                      <span class="text-muted-foreground">{{ t(`resources.${res.key}`) }}:</span>
                      <span class="ml-1 font-medium text-green-600 dark:text-green-400">
                        +{{ (selectedMissionReport.details?.foundResources?.[res.key] ?? 0).toLocaleString() }}
                      </span>
                    </template>
                  </div>
                </div>
              </div>

              <!-- 探险任务详情 - 发现舰船 -->
              <div v-if="selectedMissionReport.details?.foundFleet" class="mt-3 space-y-1">
                <p class="text-xs font-semibold text-muted-foreground">{{ t('messagesView.fleet') }}:</p>
                <div class="grid grid-cols-2 gap-2 text-sm p-2 bg-blue-50 dark:bg-blue-950/30 rounded">
                  <div v-for="(count, shipType) in selectedMissionReport.details.foundFleet" :key="shipType">
                    <span class="text-muted-foreground">{{ t('ships.' + shipType) }}:</span>
                    <span class="ml-1 font-medium text-blue-600 dark:text-blue-400">+{{ count }}</span>
                  </div>
                </div>
              </div>

              <!-- 探险任务详情 - 损失舰船 -->
              <div v-if="selectedMissionReport.details?.fleetLost" class="mt-3 space-y-1">
                <p class="text-xs font-semibold text-muted-foreground">{{ t('messagesView.attackerLosses') }}:</p>
                <div class="grid grid-cols-2 gap-2 text-sm p-2 bg-red-50 dark:bg-red-950/30 rounded">
                  <div v-for="(count, shipType) in selectedMissionReport.details.fleetLost" :key="shipType">
                    <span class="text-muted-foreground">{{ t('ships.' + shipType) }}:</span>
                    <span class="ml-1 font-medium text-red-600 dark:text-red-400">-{{ count }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" @click="showMissionDialog = false">{{ t('common.close') }}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- NPC活动通知详情对话框 -->
    <Dialog :open="showNPCActivityDialog" @update:open="showNPCActivityDialog = $event">
      <DialogContent class="max-w-2xl">
        <DialogHeader>
          <DialogTitle class="flex items-center gap-2">
            <Recycle class="h-5 w-5 text-yellow-500" />
            {{ t('messagesView.npcActivityDetails') }}
          </DialogTitle>
          <DialogDescription>
            {{ t('messagesView.activityDescription') }}
          </DialogDescription>
        </DialogHeader>

        <div v-if="selectedNPCActivityNotification" class="space-y-4">
          <!-- NPC信息 -->
          <div class="p-4 bg-muted/50 rounded-lg">
            <div class="flex items-center gap-2 mb-2">
              <h3 class="font-semibold text-lg">{{ selectedNPCActivityNotification.npcName }}</h3>
              <Badge variant="secondary">{{ t('messagesView.activityType.' + selectedNPCActivityNotification.activityType) }}</Badge>
            </div>
            <p class="text-sm text-muted-foreground">
              {{ formatDate(selectedNPCActivityNotification.timestamp) }}
            </p>
          </div>

          <!-- 活动位置 -->
          <div class="space-y-2">
            <h4 class="font-semibold text-sm">{{ t('messagesView.activityLocation') }}</h4>
            <div class="p-3 bg-muted/30 rounded-md">
              <div class="flex items-center gap-2 mb-2">
                <Globe class="h-4 w-4 text-blue-500" />
                <span class="font-medium">
                  {{ t('messagesView.position') }}: [{{ selectedNPCActivityNotification.targetPosition.galaxy }}:{{
                    selectedNPCActivityNotification.targetPosition.system
                  }}:{{ selectedNPCActivityNotification.targetPosition.position }}]
                </span>
              </div>
              <p v-if="selectedNPCActivityNotification.targetPlanetName" class="text-sm text-muted-foreground">
                {{ t('messagesView.nearPlanet') }}: {{ selectedNPCActivityNotification.targetPlanetName }}
              </p>
            </div>
          </div>

          <!-- 活动描述 -->
          <div class="space-y-2">
            <h4 class="font-semibold text-sm">{{ t('messagesView.activityDescription') }}</h4>
            <div class="p-3 bg-muted/30 rounded-md">
              <p class="text-sm">
                {{
                  t('messagesView.npcActivityMessage', {
                    npc: selectedNPCActivityNotification.npcName,
                    activity: t('messagesView.activityType.' + selectedNPCActivityNotification.activityType),
                    position: `[${selectedNPCActivityNotification.targetPosition.galaxy}:${selectedNPCActivityNotification.targetPosition.system}:${selectedNPCActivityNotification.targetPosition.position}]`
                  })
                }}
              </p>
            </div>
          </div>

          <!-- 到达时间 -->
          <div class="space-y-2">
            <h4 class="font-semibold text-sm">{{ t('messagesView.arrivalTime') }}</h4>
            <div class="p-3 bg-muted/30 rounded-md">
              <p class="font-medium">{{ formatDate(selectedNPCActivityNotification.arrivalTime) }}</p>
            </div>
          </div>

          <!-- 提示信息 -->
          <div class="p-3 bg-yellow-50 dark:bg-yellow-950/30 rounded-md border border-yellow-200 dark:border-yellow-800">
            <p class="text-sm text-yellow-800 dark:text-yellow-200">
              {{ t('messagesView.npcActivityTip') }}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" @click="showNPCActivityDialog = false">{{ t('common.close') }}</Button>
          <Button @click="viewLocationInGalaxy(selectedNPCActivityNotification?.targetPosition)">
            {{ t('messagesView.viewInGalaxy') }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
  import { useGameStore } from '@/stores/gameStore'
  import { useI18n } from '@/composables/useI18n'
  import { computed, ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
  import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
  import { Button } from '@/components/ui/button'
  import { Badge } from '@/components/ui/badge'
  import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
  import { FixedPagination } from '@/components/ui/pagination'
  import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
  import { Checkbox } from '@/components/ui/checkbox'
  import BattleReportDialog from '@/components/BattleReportDialog.vue'
  import SpyReportDialog from '@/components/SpyReportDialog.vue'
  import { formatDate } from '@/utils/format'
  import { X, Sword, Eye, AlertTriangle, Package, Recycle, Gift, Ban, Check, Users, Skull, Globe, Compass, Trash2 } from 'lucide-vue-next'
  import { Empty, EmptyContent, EmptyDescription } from '@/components/ui/empty'
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
  import { toast } from 'vue-sonner'

  const router = useRouter()
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
  const clearOptions = ref<Record<ClearOptionKey, boolean>>({
    battles: false,
    spyReports: false,
    spiedNotifications: false,
    missionReports: false,
    npcActivity: false,
    giftNotifications: false,
    giftRejected: false
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
    { key: 'giftRejected' as ClearOptionKey, labelKey: 'clearGiftRejected', count: gameStore.player.giftRejectedNotifications?.length || 0 }
  ])

  // 基础资源字段配置（用于显示资源列表）
  type BasicResourceKey = 'metal' | 'crystal' | 'deuterium'
  const basicResourceFields: { key: BasicResourceKey }[] = [{ key: 'metal' }, { key: 'crystal' }, { key: 'deuterium' }]

  // 残骸资源字段配置（只有金属和晶体）
  type DebrisResourceKey = 'metal' | 'crystal'
  const debrisResourceFields: { key: DebrisResourceKey }[] = [{ key: 'metal' }, { key: 'crystal' }]

  // 全部资源字段配置（包含暗物质，用于探险任务）
  type AllResourceKey = 'metal' | 'crystal' | 'deuterium' | 'darkMatter'
  const allResourceFields: { key: AllResourceKey }[] = [{ key: 'metal' }, { key: 'crystal' }, { key: 'deuterium' }, { key: 'darkMatter' }]

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

    // 重置选项
    clearOptions.value = {
      battles: false,
      spyReports: false,
      spiedNotifications: false,
      missionReports: false,
      npcActivity: false,
      giftNotifications: false,
      giftRejected: false
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

  // NPC标签页合并数据（活动通知 + 礼物通知 + 礼物被拒绝通知）
  const allNPCTabItems = computed(() => {
    const activities = allNPCActivityNotifications.value.map(item => ({ ...item, type: 'activity' as const }))
    const gifts = allGiftNotifications.value.map(item => ({ ...item, type: 'gift' as const }))
    const rejections = allGiftRejectedNotifications.value.map(item => ({ ...item, type: 'rejection' as const }))
    return [...activities, ...gifts, ...rejections].sort((a, b) => b.timestamp - a.timestamp)
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

  // 查看NPC在星系中的位置
  const viewNPCInGalaxy = (npcId?: string) => {
    if (!npcId) return
    const npc = npcStore.npcs.find(n => n.id === npcId)
    if (!npc || npc.planets.length === 0) return

    const targetPlanet = npc.planets[0]
    if (!targetPlanet) return

    showSpiedDialog.value = false
    router.push({
      path: '/galaxy',
      query: {
        galaxy: targetPlanet.position.galaxy,
        system: targetPlanet.position.system,
        highlightNpc: npcId
      }
    })
  }

  // 查看位置在星系中
  const viewLocationInGalaxy = (position?: { galaxy: number; system: number; position: number }) => {
    if (!position) return

    showNPCActivityDialog.value = false
    router.push({
      path: '/galaxy',
      query: {
        galaxy: position.galaxy,
        system: position.system
      }
    })
  }

  // 获取任务类型图标
  const getMissionIcon = (missionType?: MissionType) => {
    if (!missionType) return Package

    switch (missionType) {
      case MissionType.Transport:
        return Package
      case MissionType.Recycle:
        return Recycle
      case MissionType.Colonize:
        return Globe
      case MissionType.Expedition:
        return Compass
      case MissionType.Destroy:
        return Skull
      default:
        return Package
    }
  }
</script>
