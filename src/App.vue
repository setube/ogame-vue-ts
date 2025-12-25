<template>
  <!-- 首页：无侧边栏/头部 -->
  <template v-if="isHomePage">
    <RouterView />
  </template>

  <!-- 其他页面：完整布局（含侧边栏） -->
  <SidebarProvider v-else :open="sidebarOpen" @update:open="handleSidebarOpenChange">
    <Sidebar collapsible="icon">
      <!-- 标志 -->
      <SidebarHeader class="border-b">
        <div class="flex items-center justify-center p-4 group-data-[collapsible=icon]:p-2">
          <img src="@/assets/logo.svg" class="w-10 group-data-[collapsible=icon]:w-8" />
          <h1 class="text-xl font-bold ml-2 group-data-[collapsible=icon]:hidden">{{ pkg.title }}</h1>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <!-- 星球信息 -->
        <SidebarGroup v-if="planet" class="border-b group-data-[collapsible=icon]:hidden">
          <div class="px-4 py-3 space-y-2 text-sm">
            <!-- 星球切换器 -->
            <Popover>
              <PopoverTrigger as-child>
                <Button
                  data-tutorial="planet-selector"
                  variant="outline"
                  class="w-full justify-between h-auto px-3 py-2.5 border-2 hover:bg-accent hover:border-primary transition-colors"
                >
                  <div class="flex items-start gap-2.5 flex-1 min-w-0">
                    <Globe class="h-5 w-5 shrink-0 mt-0.5 text-primary" />
                    <div class="flex-1 min-w-0 text-left">
                      <div class="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">
                        {{ t('planet.currentPlanet') }}
                      </div>
                      <div class="flex items-center gap-1.5 mb-0.5">
                        <span class="truncate font-semibold text-sm">
                          {{ planet.name }}
                          [{{ planet.position.galaxy }}:{{ planet.position.system }}:{{ planet.position.position }}]
                        </span>
                        <Badge v-if="planet.isMoon" variant="secondary" class="text-[10px] px-1 py-0 h-4">
                          {{ t('planet.moon') }}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <ChevronsUpDown class="h-4 w-4 shrink-0 text-muted-foreground ml-2" />
                </Button>
              </PopoverTrigger>
              <PopoverContent class="w-72 p-0" side="bottom" align="start">
                <div class="p-2">
                  <div class="px-2 py-1.5 mb-1 text-xs font-semibold text-muted-foreground">
                    {{ t('planet.switchPlanet') }}
                  </div>
                  <div class="space-y-0.5 max-h-80 overflow-y-auto">
                    <div v-for="p in gameStore.player.planets" :key="p.id" class="flex items-center gap-1">
                      <Button
                        @click="switchToPlanet(p.id)"
                        :variant="p.id === planet.id ? 'secondary' : 'ghost'"
                        class="flex-1 justify-start h-auto py-2 px-2"
                        size="sm"
                      >
                        <div class="flex items-start gap-2 w-full min-w-0">
                          <Globe class="h-4 w-4 shrink-0 mt-0.5" :class="p.id === planet.id ? 'text-primary' : ''" />
                          <div class="flex-1 min-w-0 text-left">
                            <div class="flex items-center gap-1.5 mb-0.5">
                              <span class="truncate font-medium text-sm">
                                {{ p.name }}
                                [{{ p.position.galaxy }}:{{ p.position.system }}:{{ p.position.position }}]
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                class="h-2 w-2 p-0 shrink-0"
                                @click.stop="openRenameDialog(p.id, p.name)"
                                :title="t('planet.renamePlanet')"
                              >
                                <Pencil class="h-2 w-2" />
                              </Button>
                              <Badge v-if="p.isMoon" variant="outline" class="text-[10px] px-1 py-0 h-4">
                                {{ t('planet.moon') }}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </Button>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <!-- 玩家积分显示 -->
            <div class="bg-muted/50 rounded-lg p-2">
              <div class="flex items-center justify-between">
                <span class="text-xs text-muted-foreground">{{ t('player.points') }}</span>
                <span class="text-sm font-bold text-primary">{{ formatNumber(gameStore.player.points) }}</span>
              </div>
            </div>
            <!-- 月球切换按钮 -->
            <div v-if="hasMoon || planet.isMoon" class="flex gap-1">
              <Button v-if="planet.isMoon" @click="switchToParentPlanet" variant="outline" size="sm" class="w-full text-xs h-7">
                {{ t('planet.backToPlanet') }}
              </Button>
              <Button v-else-if="moon" @click="switchToMoon" variant="outline" size="sm" class="w-full text-xs h-7">
                {{ t('planet.switchToMoon') }}
              </Button>
            </div>
          </div>
        </SidebarGroup>

        <!-- 导航菜单 -->
        <SidebarGroup data-tutorial="navigation">
          <SidebarMenu>
            <SidebarMenuItem v-for="item in navItems" :key="item.path">
              <SidebarMenuButton
                :data-nav-path="item.path"
                :is-active="$route.path === item.path"
                :tooltip="item.name.value"
                :disabled="!isFeatureUnlocked(item.path)"
                @click="router.push(item.path)"
              >
                <component :is="item.icon" />
                <span>{{ item.name.value }}</span>
                <!-- 未读消息数量 -->
                <SidebarMenuBadge
                  v-if="item.path === '/messages' && unreadMessagesCount > 0"
                  class="bg-destructive text-destructive-foreground"
                >
                  {{ unreadMessagesCount }}
                </SidebarMenuBadge>
                <!-- 正在执行的舰队任务数量 -->
                <SidebarMenuBadge v-if="item.path === '/fleet' && activeFleetMissionsCount > 0" class="bg-primary text-primary-foreground">
                  {{ activeFleetMissionsCount }}
                </SidebarMenuBadge>
                <!-- 未读外交报告数量 -->
                <SidebarMenuBadge
                  v-if="item.path === '/diplomacy' && unreadDiplomaticReportsCount > 0"
                  class="bg-destructive text-destructive-foreground"
                >
                  {{ unreadDiplomaticReportsCount }}
                </SidebarMenuBadge>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <!-- 底部设置 -->
      <SidebarFooter class="border-t">
        <SidebarMenu>
          <!-- 语言切换 -->
          <SidebarMenuItem>
            <Popover>
              <PopoverTrigger as-child>
                <SidebarMenuButton :tooltip="localeNames[gameStore.locale]">
                  <Languages />
                  <span>{{ localeNames[gameStore.locale] }}</span>
                </SidebarMenuButton>
              </PopoverTrigger>
              <PopoverContent
                class="w-48 p-2"
                :side="sidebarOpen || innerWidth < 768 ? 'top' : 'right'"
                :align="sidebarOpen || innerWidth < 768 ? 'center' : 'end'"
              >
                <div class="space-y-1">
                  <Button
                    v-for="locale in locales"
                    :key="locale"
                    @click="gameStore.locale = locale"
                    :variant="gameStore.locale === locale ? 'secondary' : 'ghost'"
                    class="w-full justify-start"
                    size="sm"
                  >
                    {{ localeNames[locale] }}
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </SidebarMenuItem>

          <!-- 夜间模式切换 -->
          <SidebarMenuItem>
            <SidebarMenuButton @click="isDark = !isDark" :tooltip="isDark ? t('sidebar.lightMode') : t('sidebar.darkMode')">
              <Sun v-if="isDark" />
              <Moon v-else />
              <span>{{ isDark ? t('sidebar.lightMode') : t('sidebar.darkMode') }}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <!-- 折叠按钮 -->
          <SidebarMenuItem class="hidden sm:inline">
            <SidebarMenuButton @click="toggleSidebar" :tooltip="sidebarOpen ? t('sidebar.collapse') : t('sidebar.expand')">
              <ChevronsLeft class="group-data-[state=collapsed]:rotate-180 transition-transform" />
              <span>{{ t('sidebar.collapse') }}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>

    <!-- 主内容区 -->
    <SidebarInset>
      <div class="flex flex-col h-full" :class="Capacitor.isNativePlatform() ? 'pt-[80px]' : 'pt-[60px]'">
        <!-- 顶部资源栏 - 固定定位 -->
        <header
          v-if="planet"
          ref="header"
          class="fixed top-0 right-0 left-0 z-40 bg-card border-b px-4 sm:px-6 shadow-md"
          :class="[
            sidebarOpen ? 'lg:left-[var(--sidebar-width)]' : 'lg:left-[var(--sidebar-width-icon)]',
            Capacitor.isNativePlatform() ? 'py-6' : 'py-3'
          ]"
        >
          <div class="flex flex-col gap-3">
            <!-- 第一行：菜单、资源预览、状态 -->
            <div
              class="grid items-center gap-3 sm:gap-6"
              style="grid-template-columns: auto 1fr auto"
              :class="{
                'relative top-3': Capacitor.isNativePlatform()
              }"
            >
              <!-- 左侧：汉堡菜单（移动端）/ 占位（PC端） -->
              <div>
                <SidebarTrigger class="lg:hidden" data-tutorial="mobile-menu" />
              </div>

              <!-- 资源显示 - PC端居中，移动端可折叠 -->
              <!-- 关键：min-w-0 + overflow-hidden，避免横向滚动内容溢出覆盖左侧菜单按钮 -->
              <div class="min-w-0 overflow-hidden">
                <div
                  class="resource-bar flex items-center gap-3 sm:gap-6 justify-start sm:justify-center"
                  :class="[resourceBarExpanded ? 'hidden' : 'overflow-x-auto']"
                >
                  <div v-for="resourceType in resourceTypes" :key="resourceType.key" class="flex items-center gap-1.5 sm:gap-2 shrink-0">
                    <ResourceIcon :type="resourceType.key" size="md" />
                    <div class="min-w-0">
                      <!-- 电力显示：当前储量/最大容量，净产量/小时 -->
                      <template v-if="resourceType.key === 'energy'">
                        <p
                          class="text-xs sm:text-sm font-medium truncate"
                          :class="getResourceColor(planet.resources.energy, capacity?.energy || Infinity)"
                        >
                          {{ formatNumber(planet.resources.energy) }} /
                          {{ formatNumber(capacity?.energy || 0) }}
                        </p>
                        <p
                          class="text-[10px] sm:text-xs truncate"
                          :class="netEnergy >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'"
                        >
                          {{ netEnergy >= 0 ? '+' : '' }}{{ formatNumber(Math.round(netEnergy / 60)) }}/{{ t('resources.perMinute') }}
                        </p>
                      </template>
                      <!-- 其他资源统一显示：当前值/容量 -->
                      <template v-else>
                        <p
                          class="text-xs sm:text-sm font-medium truncate"
                          :class="getResourceColor(planet.resources[resourceType.key], capacity?.[resourceType.key] || Infinity)"
                        >
                          {{ formatNumber(planet.resources[resourceType.key]) }} /
                          {{ formatNumber(capacity?.[resourceType.key] || 0) }}
                        </p>
                        <p class="text-[10px] sm:text-xs text-muted-foreground truncate">
                          +{{ formatNumber(Math.round((production?.[resourceType.key] || 0) / 60)) }}/{{ t('resources.perMinute') }}
                        </p>
                      </template>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 右侧：队列通知 + 展开按钮 -->
              <div class="flex items-center gap-2 sm:gap-3 shrink-0 justify-end">
                <!-- 移动端展开按钮 -->
                <Button @click="resourceBarExpanded = !resourceBarExpanded" variant="ghost" size="sm" class="lg:hidden h-8 w-8 p-0">
                  <ChevronDown v-if="!resourceBarExpanded" class="h-4 w-4" />
                  <ChevronUp v-else class="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        <!-- 展开的资源详情（仅移动端且展开时显示） - absolute定位覆盖在内容上，带过渡动画 -->
        <Transition
          enter-active-class="transition-all duration-300 ease-out"
          enter-from-class="opacity-0 -translate-y-2"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition-all duration-200 ease-in"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 -translate-y-2"
        >
          <div
            v-if="planet && resourceBarExpanded"
            class="fixed right-0 left-0 z-30 bg-card border-b px-4 py-3 shadow-md lg:hidden"
            :class="[
              sidebarOpen ? 'lg:left-[var(--sidebar-width)]' : 'lg:left-[var(--sidebar-width-icon)]',
              Capacitor.isNativePlatform() ? 'top-[80px]' : 'top-[60px]'
            ]"
          >
            <div class="grid grid-cols-2 gap-3">
              <div v-for="resourceType in resourceTypes" :key="resourceType.key" class="bg-muted/50 rounded-lg p-2.5">
                <div class="flex items-center justify-center gap-2 mb-1.5">
                  <ResourceIcon :type="resourceType.key" size="md" />
                  <span class="text-xs font-medium text-muted-foreground">{{ t(`resources.${resourceType.key}`) }}</span>
                </div>
                <div class="space-y-0.5 text-center">
                  <!-- 电力显示：当前储量，容量，净产量/分钟 -->
                  <template v-if="resourceType.key === 'energy'">
                    <p class="text-sm font-semibold" :class="getResourceColor(planet.resources.energy, capacity?.energy || Infinity)">
                      {{ formatNumber(planet.resources.energy) }}
                    </p>
                    <p class="text-[10px] text-muted-foreground">
                      {{ t('resources.capacity') }}: {{ formatNumber(capacity?.energy || 0) }}
                    </p>
                    <p
                      class="text-[10px]"
                      :class="netEnergy >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'"
                    >
                      {{ t('resources.production') }}: {{ netEnergy >= 0 ? '+' : '' }}{{ formatNumber(Math.round(netEnergy / 60)) }}/{{
                        t('resources.perMinute')
                      }}
                    </p>
                  </template>
                  <!-- 其他资源统一显示：当前值/容量 -->
                  <template v-else>
                    <p
                      class="text-sm font-semibold"
                      :class="getResourceColor(planet.resources[resourceType.key], capacity?.[resourceType.key] || Infinity)"
                    >
                      {{ formatNumber(planet.resources[resourceType.key]) }}
                    </p>
                    <p class="text-[10px] text-muted-foreground">
                      {{ t('resources.capacity') }}: {{ formatNumber(capacity?.[resourceType.key] || 0) }}
                    </p>
                    <p class="text-[10px] text-muted-foreground">
                      {{ t('resources.production') }}: +{{ formatNumber(Math.round((production?.[resourceType.key] || 0) / 60)) }}/{{
                        t('resources.perMinute')
                      }}
                    </p>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </Transition>

        <!-- 即将到来的敌对舰队警告 -->
        <IncomingFleetAlerts @open-panel="openEnemyAlertPanel" />

        <!-- 低电量警告 -->
        <LowEnergyWarning />

        <!-- 矿脉储量警告 -->
        <OreDepositWarning />

        <!-- 内容区域 -->
        <main class="flex-1">
          <Transition name="page" mode="out-in">
            <div :key="$route.fullPath" class="h-full">
              <!-- 背景动画开启时 -->
              <template v-if="gameStore.player.backgroundEnabled">
                <StarsBackground v-if="isDark" :factor="0.05" :speed="50" star-color="#fff" class="h-full">
                  <div class="relative z-10 h-full">
                    <RouterView />
                  </div>
                </StarsBackground>

                <div v-else class="relative h-full w-full overflow-hidden">
                  <div class="relative z-10 h-full">
                    <RouterView />
                  </div>

                  <ParticlesBg class="absolute inset-0 z-0" :quantity="100" :ease="100" color="#000" :staticity="10" refresh />
                </div>
              </template>

              <!-- 背景动画关闭时 -->
              <div v-else class="h-full">
                <RouterView />
              </div>
            </div>
          </Transition>
        </main>
      </div>
    </SidebarInset>

    <!-- 右下角固定通知按钮 -->
    <div class="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      <!-- 返回顶部 -->
      <BackToTop />
      <!-- 队列通知 -->
      <QueueNotifications />

      <!-- 外交通知 -->
      <DiplomaticNotifications />

      <!-- 敌方警报 -->
      <EnemyAlertNotifications ref="enemyAlertNotificationsRef" />
    </div>

    <!-- 确认对话框 -->
    <AlertDialog :open="confirmDialogOpen" @update:open="confirmDialogOpen = $event">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{{ confirmDialogTitle }}</AlertDialogTitle>
          <AlertDialogDescription class="whitespace-pre-line">
            {{ confirmDialogMessage }}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{{ t('common.cancel') }}</AlertDialogCancel>
          <AlertDialogAction @click="handleConfirmDialogConfirm">{{ t('common.confirm') }}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    <!-- 详情弹窗 -->
    <DetailDialog />
    <!-- 更新弹窗 -->
    <UpdateDialog v-model:open="showUpdateDialog" :version-info="updateInfo" />
    <!-- 弱引导提示系统 -->
    <HintToast />
    <!-- Toast 通知 -->
    <Sonner position="top-center" />
    <!-- 重命名星球对话框 -->
    <Dialog v-model:open="renameDialogOpen">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{{ t('planet.renamePlanetTitle') }}</DialogTitle>
          <DialogDescription class="sr-only">{{ t('planet.renamePlanetTitle') }}</DialogDescription>
        </DialogHeader>
        <div class="py-4">
          <Input v-model="newPlanetName" :placeholder="t('planet.planetNamePlaceholder')" @keyup.enter="confirmRenamePlanet" />
        </div>
        <DialogFooter>
          <Button variant="outline" @click="renameDialogOpen = false">
            {{ t('common.cancel') }}
          </Button>
          <Button @click="confirmRenamePlanet" :disabled="!newPlanetName.trim()">
            {{ t('planet.rename') }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </SidebarProvider>

  <!-- Android 退出确认对话框 -->
  <AlertDialog v-model:open="exitDialogOpen">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>{{ t('common.exitConfirmTitle') }}</AlertDialogTitle>
        <AlertDialogDescription>{{ t('common.exitConfirmMessage') }}</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>{{ t('common.cancel') }}</AlertDialogCancel>
        <AlertDialogAction @click="exitApp">{{ t('common.confirm') }}</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>

  <!-- NPC 名称更新确认对话框 -->
  <AlertDialog v-model:open="npcNameUpdateDialogOpen">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>{{ t('settings.npcNameUpdateTitle') }}</AlertDialogTitle>
        <AlertDialogDescription>
          {{ t('settings.npcNameUpdateMessage', { count: oldFormatNPCCount }) }}
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel @click="handleSkipNPCNameUpdate">{{ t('settings.npcNameUpdateCancel') }}</AlertDialogCancel>
        <AlertDialogAction @click="handleUpdateNPCNames">{{ t('settings.npcNameUpdateConfirm') }}</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>

<script setup lang="ts">
  import { onMounted, onUnmounted, computed, ref, watch } from 'vue'
  import { RouterView, useRouter } from 'vue-router'
  import { useGameStore } from '@/stores/gameStore'
  import { useUniverseStore } from '@/stores/universeStore'
  import { useNPCStore } from '@/stores/npcStore'
  import { useTheme } from '@/composables/useTheme'
  import { useI18n } from '@/composables/useI18n'
  import { useGameConfig } from '@/composables/useGameConfig'
  import { localeNames, detectBrowserLocale, type Locale } from '@/locales'
  import { Button } from '@/components/ui/button'
  import { Badge } from '@/components/ui/badge'
  import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
  import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
  import { Input } from '@/components/ui/input'
  import IncomingFleetAlerts from '@/components/notifications/IncomingFleetAlerts.vue'
  import LowEnergyWarning from '@/components/notifications/LowEnergyWarning.vue'
  import OreDepositWarning from '@/components/notifications/OreDepositWarning.vue'
  import DiplomaticNotifications from '@/components/notifications/DiplomaticNotifications.vue'
  import EnemyAlertNotifications from '@/components/notifications/EnemyAlertNotifications.vue'
  import QueueNotifications from '@/components/notifications/QueueNotifications.vue'
  import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
    SidebarInset,
    SidebarMenu,
    SidebarMenuBadge,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarTrigger
  } from '@/components/ui/sidebar'
  import ResourceIcon from '@/components/common/ResourceIcon.vue'
  import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
  } from '@/components/ui/alert-dialog'
  import DetailDialog from '@/components/dialogs/DetailDialog.vue'
  import UpdateDialog from '@/components/dialogs/UpdateDialog.vue'
  import HintToast from '@/components/notifications/HintToast.vue'
  import BackToTop from '@/components/common/BackToTop.vue'
  import Sonner from '@/components/ui/sonner/Sonner.vue'
  import { MissionType, BuildingType, TechnologyType, DiplomaticEventType } from '@/types/game'
  import type { FleetMission, NPC, MissileAttack } from '@/types/game'
  import { DIPLOMATIC_CONFIG } from '@/config/gameConfig'
  import type { VersionInfo } from '@/utils/versionCheck'
  import { formatNumber, getResourceColor } from '@/utils/format'
  import { scaleNumber, scaleResources } from '@/utils/speed'
  import {
    Moon,
    Sun,
    Home,
    Building2,
    FlaskConical,
    Ship,
    Rocket,
    Shield,
    Mail,
    Globe,
    Users,
    Swords,
    Languages,
    Settings,
    Wrench,
    ChevronsLeft,
    ChevronsUpDown,
    ChevronDown,
    ChevronUp,
    Handshake,
    Pencil,
    Trophy,
    Crown,
    Scroll
  } from 'lucide-vue-next'
  import * as gameLogic from '@/logic/gameLogic'
  import * as planetLogic from '@/logic/planetLogic'
  import * as officerLogic from '@/logic/officerLogic'
  import * as buildingValidation from '@/logic/buildingValidation'
  import * as resourceLogic from '@/logic/resourceLogic'
  import * as researchValidation from '@/logic/researchValidation'
  import * as fleetLogic from '@/logic/fleetLogic'
  import * as shipLogic from '@/logic/shipLogic'
  import * as npcGrowthLogic from '@/logic/npcGrowthLogic'
  import * as npcBehaviorLogic from '@/logic/npcBehaviorLogic'
  import * as diplomaticLogic from '@/logic/diplomaticLogic'
  import * as publicLogic from '@/logic/publicLogic'
  import * as oreDepositLogic from '@/logic/oreDepositLogic'
  import * as campaignLogic from '@/logic/campaignLogic'
  import { generateNPCName, countOldFormatNPCs, updateNPCName } from '@/logic/npcNameGenerator'
  import pkg from '../package.json'
  import { toast } from 'vue-sonner'
  import { migrateGameData } from '@/utils/migration'
  import { checkLatestVersion } from '@/utils/versionCheck'
  import { StarsBackground } from '@/components/ui/bg-stars'
  import { ParticlesBg } from '@/components/ui/particles-bg'
  import { App as CapacitorApp } from '@capacitor/app'
  import { Capacitor } from '@capacitor/core'

  // 执行数据迁移（在 store 初始化之前）
  migrateGameData()

  const router = useRouter()
  const gameStore = useGameStore()
  const universeStore = useUniverseStore()
  const npcStore = useNPCStore()
  const { isDark } = useTheme()
  const { t } = useI18n()
  const { BUILDINGS, TECHNOLOGIES } = useGameConfig()
  const enemyAlertNotificationsRef = ref<InstanceType<typeof EnemyAlertNotifications> | null>(null)
  // ConfirmDialog 状态
  const confirmDialogOpen = ref(false)
  const confirmDialogTitle = ref('')
  const confirmDialogMessage = ref('')
  const innerWidth = computed(() => window.innerWidth)
  const confirmDialogAction = ref<(() => void) | null>(null)
  // 更新弹窗状态
  const showUpdateDialog = ref(false)
  const updateInfo = ref<VersionInfo | null>(null)
  // 所有可用的语言选项
  const locales: Locale[] = ['zh-CN', 'zh-TW', 'en', 'de', 'ru', 'es-LA', 'ko', 'ja']
  // 侧边栏状态（不持久化，根据屏幕尺寸初始化）
  // PC端（≥1024px）默认打开，移动端默认关闭
  const sidebarOpen = ref(window.innerWidth >= 1024)
  // 移动端资源栏展开状态
  const resourceBarExpanded = ref(false)
  const npcUpdateCounter = ref(0) // 累计秒数
  const NPC_UPDATE_INTERVAL = 5 // 每1秒更新一次NPC，确保发育速度与玩家相当
  // NPC行为系统更新函数（侦查和攻击决策）
  const npcBehaviorCounter = ref(0)
  const NPC_BEHAVIOR_INTERVAL = 5 // 每5秒检查一次NPC行为

  // 游戏循环定时器
  const gameLoop = ref<ReturnType<typeof setInterval> | null>(null)
  const pointsUpdateInterval = ref<ReturnType<typeof setInterval> | null>(null)
  const konamiCleanup = ref<(() => void) | null>(null)
  const versionCheckInterval = ref<ReturnType<typeof setInterval> | null>(null) // 重命名星球相关状态
  const renameDialogOpen = ref(false)
  const renamingPlanetId = ref<string | null>(null)
  const newPlanetName = ref('')
  // Android 退出确认对话框状态
  const exitDialogOpen = ref(false)
  // NPC 名称更新对话框状态
  const npcNameUpdateDialogOpen = ref(false)
  const oldFormatNPCCount = ref(0)
  // 功能解锁要求配置
  const featureRequirements: Record<string, { building: BuildingType; level: number }> = {
    '/research': { building: BuildingType.ResearchLab, level: 1 },
    '/shipyard': { building: BuildingType.Shipyard, level: 1 },
    '/defense': { building: BuildingType.Shipyard, level: 1 },
    '/fleet': { building: BuildingType.Shipyard, level: 1 },
    '/officers': { building: BuildingType.Shipyard, level: 1 }
  }

  // 判断是否为首页
  const isHomePage = computed(() => router.currentRoute.value.path === '/')

  // 定义 planet computed（需要在 watch 之前定义）
  const planet = computed(() => gameStore.currentPlanet)

  // 资源类型配置
  const resourceTypes = [
    { key: 'metal' as const },
    { key: 'crystal' as const },
    { key: 'deuterium' as const },
    { key: 'energy' as const },
    { key: 'darkMatter' as const }
  ]

  const navItems = computed(() => [
    { name: computed(() => t('nav.overview')), path: '/overview', icon: Home },
    { name: computed(() => t('nav.buildings')), path: '/buildings', icon: Building2 },
    { name: computed(() => t('nav.research')), path: '/research', icon: FlaskConical },
    { name: computed(() => t('nav.shipyard')), path: '/shipyard', icon: Ship },
    { name: computed(() => t('nav.defense')), path: '/defense', icon: Shield },
    { name: computed(() => t('nav.fleet')), path: '/fleet', icon: Rocket },
    { name: computed(() => t('nav.officers')), path: '/officers', icon: Users },
    { name: computed(() => t('nav.simulator')), path: '/battle-simulator', icon: Swords },
    { name: computed(() => t('nav.galaxy')), path: '/galaxy', icon: Globe },
    { name: computed(() => t('nav.diplomacy')), path: '/diplomacy', icon: Handshake },
    { name: computed(() => t('nav.achievements')), path: '/achievements', icon: Trophy },
    { name: computed(() => t('nav.campaign')), path: '/campaign', icon: Scroll },
    { name: computed(() => t('nav.ranking')), path: '/ranking', icon: Crown },
    { name: computed(() => t('nav.messages')), path: '/messages', icon: Mail },
    { name: computed(() => t('nav.settings')), path: '/settings', icon: Settings },
    // GM菜单在启用GM模式时显示
    ...(gameStore.player.isGMEnabled ? [{ name: computed(() => t('nav.gm')), path: '/gm', icon: Wrench }] : [])
  ])

  // 使用直接计算，不再缓存
  const production = computed(() => {
    if (!planet.value) return null
    const now = Date.now()
    const bonuses = officerLogic.calculateActiveBonuses(gameStore.player.officers, now)
    const base = resourceLogic.calculateResourceProduction(planet.value, {
      resourceProductionBonus: bonuses.resourceProductionBonus,
      darkMatterProductionBonus: bonuses.darkMatterProductionBonus,
      energyProductionBonus: bonuses.energyProductionBonus
    })
    return scaleResources(base, gameStore.gameSpeed)
  })

  const capacity = computed(() => {
    if (!planet.value) return null
    const now = Date.now()
    const bonuses = officerLogic.calculateActiveBonuses(gameStore.player.officers, now)
    return resourceLogic.calculateResourceCapacity(planet.value, bonuses.storageCapacityBonus)
  })

  // 电力消耗
  const energyConsumption = computed(() => {
    if (!planet.value) return 0
    return scaleNumber(resourceLogic.calculateEnergyConsumption(planet.value), gameStore.gameSpeed)
  })

  // 净电力（产量 - 消耗）
  const netEnergy = computed(() => {
    if (!planet.value || !production.value) return 0
    return production.value.energy - energyConsumption.value
  })

  // 未读消息数量
  const unreadMessagesCount = computed(() => {
    const unreadBattles = gameStore.player.battleReports.filter(r => !r.read).length
    const unreadSpies = gameStore.player.spyReports.filter(r => !r.read).length
    const unreadSpied = gameStore.player.spiedNotifications?.filter(n => !n.read).length || 0
    const unreadMissions = gameStore.player.missionReports?.filter(r => !r.read).length || 0
    const unreadNPCActivity = gameStore.player.npcActivityNotifications?.filter(n => !n.read).length || 0
    const unreadGifts = gameStore.player.giftNotifications?.filter(n => !n.read).length || 0
    const unreadGiftRejected = gameStore.player.giftRejectedNotifications?.filter(n => !n.read).length || 0
    const unreadTradeOffers = gameStore.player.tradeOffers?.filter(o => !o.read).length || 0
    const unreadIntelReports = gameStore.player.intelReports?.filter(r => !r.read).length || 0
    const unreadJointAttacks = gameStore.player.jointAttackInvites?.filter(i => !i.read).length || 0
    return (
      unreadBattles +
      unreadSpies +
      unreadSpied +
      unreadMissions +
      unreadNPCActivity +
      unreadGifts +
      unreadGiftRejected +
      unreadTradeOffers +
      unreadIntelReports +
      unreadJointAttacks
    )
  })

  // 正在执行的舰队任务数量（包括飞行中的导弹）
  const activeFleetMissionsCount = computed(() => {
    const fleetMissions = gameStore.player.fleetMissions.filter(m => m.status === 'outbound' || m.status === 'returning').length
    const flyingMissiles = gameStore.player.missileAttacks?.filter(m => m.status === 'flying').length || 0
    return fleetMissions + flyingMissiles
  })

  // 未读外交报告数量
  const unreadDiplomaticReportsCount = computed(() => {
    return (gameStore.player.diplomaticReports || []).filter(r => !r.read).length
  })

  // 月球相关
  const moon = computed(() => {
    if (!planet.value || planet.value.isMoon) return null
    return gameStore.getMoonForPlanet(planet.value.id)
  })

  const hasMoon = computed(() => !!moon.value)

  const handleNotification = (type: string, itemType: string, level?: number) => {
    const settings = gameStore.notificationSettings
    if (!settings) return

    // 检查主开关
    if (!settings.browser && !settings.inApp) return

    // 检查具体类型开关
    let typeKey: 'construction' | 'research'
    let title = ''
    let body = ''

    if (type === 'building') {
      typeKey = 'construction'
      const buildingType = itemType as BuildingType
      const name = BUILDINGS.value[buildingType]?.name || itemType
      title = t('notifications.constructionComplete')
      body = `${name} Lv ${level}`
    } else if (type === 'technology') {
      typeKey = 'research'
      const technologyType = itemType as TechnologyType
      const name = TECHNOLOGIES.value[technologyType]?.name || itemType
      title = t('notifications.researchComplete')
      body = `${name} Lv ${level}`
    } else {
      return
    }

    if (!settings.types[typeKey]) return

    // 浏览器通知
    if (settings.browser && 'Notification' in window && Notification.permission === 'granted') {
      const shouldSuppress = settings.suppressInFocus && document.hasFocus()
      if (!shouldSuppress) {
        new Notification(title, { body, icon: '/favicon.ico' })
      }
    }

    // 页面内 toast 通知
    if (settings.inApp) {
      toast.success(title, { description: body })
    }
  }

  // 处理解锁通知
  const handleUnlockNotification = (unlockedItems: Array<{ type: 'building' | 'technology'; id: string; name: string }>) => {
    const settings = gameStore.notificationSettings
    if (!settings) return

    // 检查主开关和解锁类型开关
    if (!settings.browser && !settings.inApp) return
    if (!settings.types.unlock) return

    unlockedItems.forEach(item => {
      const title = t('notifications.newUnlock')
      const typeLabel = item.type === 'building' ? t('notifications.building') : t('notifications.technology')
      const body = `${typeLabel}: ${item.name}`

      // 浏览器通知
      if (settings.browser && 'Notification' in window && Notification.permission === 'granted') {
        const shouldSuppress = settings.suppressInFocus && document.hasFocus()
        if (!shouldSuppress) {
          new Notification(title, { body, icon: '/favicon.ico' })
        }
      }

      // 页面内 toast 通知
      if (settings.inApp) {
        toast.info(title, { description: body })
      }
    })
  }

  const handleConfirmDialogConfirm = () => {
    if (confirmDialogAction.value) {
      confirmDialogAction.value()
    }
    confirmDialogOpen.value = false
  }

  const initGame = async () => {
    const shouldInit = gameLogic.shouldInitializeGame(gameStore.player.planets)
    if (!shouldInit) {
      const now = Date.now()
      // 迁移矿脉储量数据（为没有矿脉数据的星球初始化）
      gameStore.player.planets.forEach(planet => {
        oreDepositLogic.migrateOreDeposits(planet)
      })
      // 迁移NPC星球的矿脉储量
      npcStore.npcs.forEach(npc => {
        npc.planets.forEach(planet => {
          oreDepositLogic.migrateOreDeposits(planet)
        })
      })
      // 迁移宇宙地图中的星球（NPC星球的副本）
      Object.values(universeStore.planets).forEach(planet => {
        oreDepositLogic.migrateOreDeposits(planet)
      })

      // 计算离线收益（直接同步计算，应用游戏速度）
      const bonuses = officerLogic.calculateActiveBonuses(gameStore.player.officers, now)
      gameStore.player.planets.forEach(planet => {
        resourceLogic.updatePlanetResources(planet, now, bonuses, gameStore.gameSpeed)
      })

      // 只在没有NPC星球时才生成（首次加载已有玩家数据时）
      if (Object.keys(universeStore.planets).length === 0) {
        generateNPCPlanets()
      }

      // 初始化或更新玩家积分
      gameStore.player.points = publicLogic.calculatePlayerPoints(gameStore.player)

      return
    }
    gameStore.player = gameLogic.initializePlayer(gameStore.player.id, t('common.playerName'))
    const initialPlanet = planetLogic.createInitialPlanet(gameStore.player.id, t('planet.homePlanet'))
    gameStore.player.planets = [initialPlanet]
    gameStore.currentPlanetId = initialPlanet.id
    // 新玩家初始化时生成NPC星球
    generateNPCPlanets()
    // 初始化玩家积分
    gameStore.player.points = publicLogic.calculatePlayerPoints(gameStore.player)
  }

  const generateNPCPlanets = () => {
    const npcCount = 200
    for (let i = 0; i < npcCount; i++) {
      const position = gameLogic.generateRandomPosition()
      const key = gameLogic.generatePositionKey(position.galaxy, position.system, position.position)
      if (universeStore.planets[key]) continue
      const npcPlanet = planetLogic.createNPCPlanet(i, position, t('planet.planetPrefix'))
      universeStore.planets[key] = npcPlanet
    }
  }

  const updateGame = async () => {
    const now = Date.now()
    if (gameStore.isPaused) return
    gameStore.gameTime = now
    // 检查军官过期
    gameLogic.checkOfficersExpiration(gameStore.player.officers, now)
    // 处理游戏更新（建造队列、研究队列等）
    const result = gameLogic.processGameUpdate(gameStore.player, now, gameStore.gameSpeed, handleNotification, handleUnlockNotification)
    gameStore.player.researchQueue = result.updatedResearchQueue
    // 处理舰队任务
    gameStore.player.fleetMissions.forEach(mission => {
      if (mission.status === 'outbound' && now >= mission.arrivalTime) {
        processMissionArrival(mission)
      } else if (mission.status === 'returning' && mission.returnTime && now >= mission.returnTime) {
        processMissionReturn(mission)
      }
    })

    // 处理导弹攻击任务（使用反向循环以便安全删除）
    for (let i = gameStore.player.missileAttacks.length - 1; i >= 0; i--) {
      const missileAttack = gameStore.player.missileAttacks[i]
      if (missileAttack && missileAttack.status === 'flying' && now >= missileAttack.arrivalTime) {
        await processMissileAttackArrival(missileAttack)
        // 导弹攻击是单程的，到达后直接从数组中移除
        gameStore.player.missileAttacks.splice(i, 1)
      }
    }

    // 处理NPC舰队任务
    npcStore.npcs.forEach(npc => {
      if (npc.fleetMissions) {
        npc.fleetMissions.forEach(mission => {
          if (mission.status === 'outbound' && now >= mission.arrivalTime) {
            processNPCMissionArrival(npc, mission)
          } else if (mission.status === 'returning' && mission.returnTime && now >= mission.returnTime) {
            processNPCMissionReturn(npc, mission)
          }
        })
      }
    })

    // NPC成长系统更新
    updateNPCGrowth(1)

    // NPC行为系统更新（侦查和攻击决策）
    updateNPCBehavior(1)

    // 检查成就解锁
    checkAchievementUnlocks()

    // 检查战役任务进度
    if (gameStore.player.campaignProgress) {
      campaignLogic.checkAllActiveQuestsProgress(gameStore.player, npcStore.npcs)
    }

    // 检查并处理被消灭的NPC（所有星球都被摧毁的NPC）
    const eliminatedNpcIds = diplomaticLogic.checkAndHandleEliminatedNPCs(npcStore.npcs, gameStore.player, gameStore.locale)
    if (eliminatedNpcIds.length > 0) {
      // 从universeStore中移除被消灭NPC的星球数据，并收集需要清理的任务ID
      const missionIdsToRemove: string[] = []
      eliminatedNpcIds.forEach(npcId => {
        const npc = npcStore.npcs.find(n => n.id === npcId)
        if (npc) {
          // 遍历NPC的所有星球，从universeStore中删除
          if (npc.planets) {
            npc.planets.forEach(planet => {
              const planetKey = gameLogic.generatePositionKey(planet.position.galaxy, planet.position.system, planet.position.position)
              if (universeStore.planets[planetKey]) {
                delete universeStore.planets[planetKey]
              }
            })
          }
          // 收集该NPC所有任务的ID（用于清理玩家的警报）
          if (npc.fleetMissions) {
            npc.fleetMissions.forEach(m => missionIdsToRemove.push(m.id))
          }
        }
      })

      // 清理玩家的即将到来舰队警报（移除已消灭NPC的任务警报）
      if (gameStore.player.incomingFleetAlerts && missionIdsToRemove.length > 0) {
        gameStore.player.incomingFleetAlerts = gameStore.player.incomingFleetAlerts.filter(alert => !missionIdsToRemove.includes(alert.id))
      }

      // 从NPC列表中移除被消灭的NPC
      npcStore.npcs = npcStore.npcs.filter(npc => !eliminatedNpcIds.includes(npc.id))
    }
  }

  const processMissionArrival = async (mission: FleetMission) => {
    // 从宇宙星球地图中查找目标星球
    const targetKey = gameLogic.generatePositionKey(
      mission.targetPosition.galaxy,
      mission.targetPosition.system,
      mission.targetPosition.position
    )
    // 先从玩家星球中查找，再从宇宙地图中查找
    // 如果任务指定了targetIsMoon，需要精确匹配行星或月球
    const targetPlanet =
      gameStore.player.planets.find(p => {
        const positionMatch =
          p.position.galaxy === mission.targetPosition.galaxy &&
          p.position.system === mission.targetPosition.system &&
          p.position.position === mission.targetPosition.position
        // 如果任务明确指定目标类型，按类型匹配
        if (mission.targetIsMoon !== undefined) {
          return positionMatch && p.isMoon === mission.targetIsMoon
        }
        // 兼容旧任务：默认优先匹配行星（非月球）
        return positionMatch && !p.isMoon
      }) ||
      // 如果没有匹配到指定类型，尝试匹配同位置的任何星球
      gameStore.player.planets.find(
        p =>
          p.position.galaxy === mission.targetPosition.galaxy &&
          p.position.system === mission.targetPosition.system &&
          p.position.position === mission.targetPosition.position
      ) ||
      universeStore.planets[targetKey]

    // 获取起始星球名称（用于报告）
    const originPlanet = gameStore.player.planets.find(p => p.id === mission.originPlanetId)
    const originPlanetName = originPlanet?.name || t('fleetView.unknownPlanet')

    if (mission.missionType === MissionType.Transport) {
      // 在处理任务之前保存货物信息（因为processTransportArrival会清空cargo）
      const transportedResources = { ...mission.cargo }
      const isGiftMission = mission.isGift && mission.giftTargetNpcId
      const result = fleetLogic.processTransportArrival(mission, targetPlanet, gameStore.player, npcStore.npcs)

      // 更新成就统计（仅在成功时追踪）
      if (result.success) {
        const totalTransported =
          transportedResources.metal + transportedResources.crystal + transportedResources.deuterium + transportedResources.darkMatter
        if (isGiftMission) {
          // 送礼成功
          gameLogic.trackDiplomacyStats(gameStore.player, 'gift', { resourcesAmount: totalTransported })
        } else {
          // 普通运输任务成功
          gameLogic.trackMissionStats(gameStore.player, 'transport', { resourcesAmount: totalTransported })
        }
      }

      // 生成失败原因消息
      let transportFailMessage = t('missionReports.transportFailed')
      if (!result.success && result.failReason) {
        if (result.failReason === 'targetNotFound') {
          transportFailMessage = t('missionReports.transportFailedTargetNotFound')
        } else if (result.failReason === 'giftRejected') {
          transportFailMessage = t('missionReports.transportFailedGiftRejected')
        }
      }

      // 生成运输任务报告
      if (!gameStore.player.missionReports) {
        gameStore.player.missionReports = []
      }
      gameStore.player.missionReports.push({
        id: `mission-report-${mission.id}`,
        timestamp: Date.now(),
        missionType: MissionType.Transport,
        originPlanetId: mission.originPlanetId,
        originPlanetName,
        targetPosition: mission.targetPosition,
        targetPlanetId: targetPlanet?.id,
        targetPlanetName:
          targetPlanet?.name || `[${mission.targetPosition.galaxy}:${mission.targetPosition.system}:${mission.targetPosition.position}]`,
        success: result.success,
        message: result.success ? t('missionReports.transportSuccess') : transportFailMessage,
        details: {
          transportedResources,
          failReason: result.failReason
        },
        read: false
      })
    } else if (mission.missionType === MissionType.Attack) {
      const attackResult = await fleetLogic.processAttackArrival(mission, targetPlanet, gameStore.player, null, gameStore.player.planets)
      if (attackResult) {
        gameStore.player.battleReports.push(attackResult.battleResult)

        // 更新成就统计 - 攻击
        const debrisValue = attackResult.debrisField
          ? attackResult.debrisField.resources.metal + attackResult.debrisField.resources.crystal
          : 0
        const won = attackResult.battleResult.winner === 'attacker'
        gameLogic.trackAttackStats(gameStore.player, attackResult.battleResult, won, debrisValue)

        // 检查是否攻击了NPC星球，更新外交关系
        if (targetPlanet) {
          const targetNpc = npcStore.npcs.find(npc => npc.planets.some(p => p.id === targetPlanet.id))
          if (targetNpc) {
            diplomaticLogic.handleAttackReputation(gameStore.player, targetNpc, attackResult.battleResult, npcStore.npcs, gameStore.locale)
          }
        }

        if (attackResult.moon) {
          gameStore.player.planets.push(attackResult.moon)
        }
        if (attackResult.debrisField) {
          // 将残骸场添加到游戏状态
          universeStore.debrisFields[attackResult.debrisField.id] = attackResult.debrisField
        }
      }
    } else if (mission.missionType === MissionType.Colonize) {
      const colonizeResult = fleetLogic.processColonizeArrival(mission, targetPlanet, gameStore.player, t('planet.colonyPrefix'))
      const newPlanet = colonizeResult.planet

      // 更新成就统计 - 殖民
      if (colonizeResult.success && newPlanet) {
        gameLogic.trackMissionStats(gameStore.player, 'colonize')
      }

      // 生成失败原因消息
      let failMessage = t('missionReports.colonizeFailed')
      if (!colonizeResult.success && colonizeResult.failReason) {
        if (colonizeResult.failReason === 'positionOccupied') {
          failMessage = t('missionReports.colonizeFailedOccupied')
        } else if (colonizeResult.failReason === 'maxColoniesReached') {
          failMessage = t('missionReports.colonizeFailedMaxColonies')
        }
      }

      // 生成殖民任务报告
      if (!gameStore.player.missionReports) {
        gameStore.player.missionReports = []
      }
      gameStore.player.missionReports.push({
        id: `mission-report-${mission.id}`,
        timestamp: Date.now(),
        missionType: MissionType.Colonize,
        originPlanetId: mission.originPlanetId,
        originPlanetName,
        targetPosition: mission.targetPosition,
        targetPlanetId: newPlanet?.id,
        targetPlanetName: newPlanet?.name,
        success: colonizeResult.success,
        message: colonizeResult.success ? t('missionReports.colonizeSuccess') : failMessage,
        details: newPlanet
          ? {
              newPlanetId: newPlanet.id,
              newPlanetName: newPlanet.name
            }
          : { failReason: colonizeResult.failReason },
        read: false
      })
      if (newPlanet) {
        gameStore.player.planets.push(newPlanet)
      }
    } else if (mission.missionType === MissionType.Spy) {
      const spyResult = fleetLogic.processSpyArrival(mission, targetPlanet, gameStore.player, null, npcStore.npcs)
      if (spyResult.success && spyResult.report) {
        gameStore.player.spyReports.push(spyResult.report)
        // 更新成就统计 - 侦查
        gameLogic.trackMissionStats(gameStore.player, 'spy')
      }

      // 生成侦查任务报告（即使失败也生成）
      if (!gameStore.player.missionReports) {
        gameStore.player.missionReports = []
      }

      let spyFailMessage = t('missionReports.spyFailed')
      if (!spyResult.success && spyResult.failReason) {
        if (spyResult.failReason === 'targetNotFound') {
          spyFailMessage = t('missionReports.spyFailedTargetNotFound')
        }
      }

      gameStore.player.missionReports.push({
        id: `mission-report-${mission.id}`,
        timestamp: Date.now(),
        missionType: MissionType.Spy,
        originPlanetId: mission.originPlanetId,
        originPlanetName,
        targetPosition: mission.targetPosition,
        targetPlanetId: targetPlanet?.id,
        targetPlanetName:
          targetPlanet?.name || `[${mission.targetPosition.galaxy}:${mission.targetPosition.system}:${mission.targetPosition.position}]`,
        success: spyResult.success,
        message: spyResult.success ? t('missionReports.spySuccess') : spyFailMessage,
        details: spyResult.success ? { spyReportId: spyResult.report?.id } : { failReason: spyResult.failReason },
        read: false
      })
    } else if (mission.missionType === MissionType.Deploy) {
      const deployed = fleetLogic.processDeployArrival(mission, targetPlanet, gameStore.player.id, gameStore.player.technologies)

      // 更新成就统计 - 部署
      if (deployed.success) {
        gameLogic.trackMissionStats(gameStore.player, 'deploy')
      }

      // 生成失败原因消息
      let deployFailMessage = t('missionReports.deployFailed')
      if (!deployed.success && deployed.failReason) {
        if (deployed.failReason === 'targetNotFound') {
          deployFailMessage = t('missionReports.deployFailedTargetNotFound')
        } else if (deployed.failReason === 'notOwnPlanet') {
          deployFailMessage = t('missionReports.deployFailedNotOwnPlanet')
        }
      }

      // 生成部署任务报告
      if (!gameStore.player.missionReports) {
        gameStore.player.missionReports = []
      }
      gameStore.player.missionReports.push({
        id: `mission-report-${mission.id}`,
        timestamp: Date.now(),
        missionType: MissionType.Deploy,
        originPlanetId: mission.originPlanetId,
        originPlanetName,
        targetPosition: mission.targetPosition,
        targetPlanetId: targetPlanet?.id,
        targetPlanetName:
          targetPlanet?.name || `[${mission.targetPosition.galaxy}:${mission.targetPosition.system}:${mission.targetPosition.position}]`,
        success: deployed.success,
        message: deployed.success ? t('missionReports.deploySuccess') : deployFailMessage,
        details: {
          deployedFleet: mission.fleet,
          failReason: deployed.failReason
        },
        read: false
      })
      if (deployed.success && !deployed.overflow) {
        const missionIndex = gameStore.player.fleetMissions.indexOf(mission)
        if (missionIndex > -1) gameStore.player.fleetMissions.splice(missionIndex, 1)
        return
      }
    } else if (mission.missionType === MissionType.Recycle) {
      // 处理回收任务
      const debrisId = `debris_${mission.targetPosition.galaxy}_${mission.targetPosition.system}_${mission.targetPosition.position}`
      const debrisField = universeStore.debrisFields[debrisId]
      const recycleResult = fleetLogic.processRecycleArrival(mission, debrisField)

      // 更新成就统计 - 回收（无论是否有残骸都算飞行任务，但只有成功回收才计入回收资源量）
      const totalRecycled =
        recycleResult.success && recycleResult.collectedResources
          ? recycleResult.collectedResources.metal + recycleResult.collectedResources.crystal
          : 0
      gameLogic.trackMissionStats(gameStore.player, 'recycle', { resourcesAmount: totalRecycled })

      // 生成失败原因消息
      let recycleFailMessage = t('missionReports.recycleFailed')
      if (!recycleResult.success && recycleResult.failReason) {
        if (recycleResult.failReason === 'noDebrisField') {
          recycleFailMessage = t('missionReports.recycleFailedNoDebris')
        } else if (recycleResult.failReason === 'debrisEmpty') {
          recycleFailMessage = t('missionReports.recycleFailedDebrisEmpty')
        }
      }

      // 生成回收任务报告
      if (!gameStore.player.missionReports) {
        gameStore.player.missionReports = []
      }
      gameStore.player.missionReports.push({
        id: `mission-report-${mission.id}`,
        timestamp: Date.now(),
        missionType: MissionType.Recycle,
        originPlanetId: mission.originPlanetId,
        originPlanetName,
        targetPosition: mission.targetPosition,
        success: recycleResult.success,
        message: recycleResult.success ? t('missionReports.recycleSuccess') : recycleFailMessage,
        details: recycleResult.success
          ? {
              recycledResources: recycleResult.collectedResources,
              remainingDebris: recycleResult.remainingDebris || undefined
            }
          : { failReason: recycleResult.failReason },
        read: false
      })

      if (recycleResult.success && recycleResult.collectedResources && debrisField) {
        if (recycleResult.remainingDebris && (recycleResult.remainingDebris.metal > 0 || recycleResult.remainingDebris.crystal > 0)) {
          // 更新残骸场
          universeStore.debrisFields[debrisId] = {
            id: debrisField.id,
            position: debrisField.position,
            resources: recycleResult.remainingDebris,
            createdAt: debrisField.createdAt,
            expiresAt: debrisField.expiresAt
          }
        } else {
          // 残骸场已被完全收集，删除
          delete universeStore.debrisFields[debrisId]
        }
      }
    } else if (mission.missionType === MissionType.Destroy) {
      // 处理行星毁灭任务
      const destroyResult = fleetLogic.processDestroyArrival(mission, targetPlanet, gameStore.player)

      // 更新成就统计 - 行星毁灭
      if (destroyResult.success) {
        gameLogic.trackMissionStats(gameStore.player, 'destroy')
      }

      // 生成失败原因消息
      let destroyFailMessage = t('missionReports.destroyFailed')
      if (!destroyResult.success && destroyResult.failReason) {
        if (destroyResult.failReason === 'targetNotFound') {
          destroyFailMessage = t('missionReports.destroyFailedTargetNotFound')
        } else if (destroyResult.failReason === 'ownPlanet') {
          destroyFailMessage = t('missionReports.destroyFailedOwnPlanet')
        } else if (destroyResult.failReason === 'noDeathstar') {
          destroyFailMessage = t('missionReports.destroyFailedNoDeathstar')
        } else if (destroyResult.failReason === 'chanceFailed') {
          destroyFailMessage = t('missionReports.destroyFailedChance', { chance: destroyResult.destructionChance.toFixed(1) })
        }
      }

      // 生成毁灭任务报告
      if (!gameStore.player.missionReports) {
        gameStore.player.missionReports = []
      }
      gameStore.player.missionReports.push({
        id: `mission-report-${mission.id}`,
        timestamp: Date.now(),
        missionType: MissionType.Destroy,
        originPlanetId: mission.originPlanetId,
        originPlanetName,
        targetPosition: mission.targetPosition,
        targetPlanetId: targetPlanet?.id,
        targetPlanetName: targetPlanet?.name,
        success: destroyResult.success,
        message: destroyResult.success ? t('missionReports.destroySuccess') : destroyFailMessage,
        details: destroyResult.success
          ? {
              destroyedPlanetName:
                targetPlanet?.name ||
                `[${mission.targetPosition.galaxy}:${mission.targetPosition.system}:${mission.targetPosition.position}]`
            }
          : {
              failReason: destroyResult.failReason,
              destructionChance: destroyResult.destructionChance,
              deathstarsLost: destroyResult.deathstarsLost
            },
        read: false
      })

      if (destroyResult.success && destroyResult.planetId) {
        // 星球被摧毁

        // 处理外交关系（如果目标是NPC星球）
        if (targetPlanet && targetPlanet.ownerId) {
          const planetOwner = npcStore.npcs.find(npc => npc.id === targetPlanet.ownerId)
          if (planetOwner) {
            diplomaticLogic.handlePlanetDestructionReputation(gameStore.player, targetPlanet, planetOwner, npcStore.npcs, gameStore.locale)

            // 从NPC的星球列表中移除被摧毁的星球
            const npcPlanetIndex = planetOwner.planets.findIndex(p => p.id === destroyResult.planetId)
            if (npcPlanetIndex > -1) {
              planetOwner.planets.splice(npcPlanetIndex, 1)
            }

            // 检查并处理被消灭的NPC（所有星球都被摧毁的NPC）
            const eliminatedNpcIds = diplomaticLogic.checkAndHandleEliminatedNPCs(npcStore.npcs, gameStore.player, gameStore.locale)

            // 从npcStore中移除被消灭的NPC
            if (eliminatedNpcIds.length > 0) {
              npcStore.npcs = npcStore.npcs.filter(npc => !eliminatedNpcIds.includes(npc.id))
            }
          }
        }

        // 从玩家星球列表中移除（如果是玩家的星球）
        const planetIndex = gameStore.player.planets.findIndex(p => p.id === destroyResult.planetId)
        if (planetIndex > -1) {
          gameStore.player.planets.splice(planetIndex, 1)
        } else {
          // 不是玩家星球，从宇宙地图中移除
          delete universeStore.planets[targetKey]
        }

        // 取消所有前往该位置的NPC任务（回收、攻击、侦查等）
        const destroyedDebrisId = `debris_${mission.targetPosition.galaxy}_${mission.targetPosition.system}_${mission.targetPosition.position}`
        npcStore.npcs.forEach(npc => {
          if (npc.fleetMissions) {
            // 找到需要取消的任务（前往已摧毁星球位置的outbound任务）
            const missionsToCancel = npc.fleetMissions.filter(m => {
              if (m.status !== 'outbound') return false
              // 检查回收任务的残骸场ID
              if (m.missionType === MissionType.Recycle && m.debrisFieldId === destroyedDebrisId) {
                return true
              }
              // 检查其他任务的目标星球ID
              if (m.targetPlanetId === destroyResult.planetId) {
                return true
              }
              return false
            })

            // 将这些任务的舰队返回给NPC
            missionsToCancel.forEach(m => {
              const npcOriginPlanet = npc.planets.find(p => p.id === m.originPlanetId)
              if (npcOriginPlanet) {
                shipLogic.addFleet(npcOriginPlanet.fleet, m.fleet)
              }
            })

            // 从任务列表中移除这些任务
            npc.fleetMissions = npc.fleetMissions.filter(m => !missionsToCancel.includes(m))
          }

          // 清理关于被摧毁星球的侦查报告
          if (npc.playerSpyReports && destroyResult.planetId && destroyResult.planetId in npc.playerSpyReports) {
            delete npc.playerSpyReports[destroyResult.planetId]
          }
        })

        // 同时删除该位置的残骸场（星球被摧毁后残骸场也消失）
        delete universeStore.debrisFields[destroyedDebrisId]
      }
    } else if (mission.missionType === MissionType.Expedition) {
      // 处理远征任务
      const expeditionResult = fleetLogic.processExpeditionArrival(mission)

      // 确保返回时间正确设置（兼容旧版本任务数据）
      // 如果 returnTime 不存在或已过期，重新计算
      const now = Date.now()
      if (!mission.returnTime || mission.returnTime <= now) {
        // 返回时间应该等于当前时间加上单程飞行时间
        const flightDuration = mission.arrivalTime - mission.departureTime
        mission.returnTime = now + flightDuration
      }

      // 更新成就统计 - 远征
      const isSuccessful =
        expeditionResult.eventType === 'resources' || expeditionResult.eventType === 'darkMatter' || expeditionResult.eventType === 'fleet'
      gameLogic.trackMissionStats(gameStore.player, 'expedition', { successful: isSuccessful })

      // 生成远征任务报告
      if (!gameStore.player.missionReports) {
        gameStore.player.missionReports = []
      }

      // 根据事件类型生成不同的报告消息
      let reportMessage = ''
      let reportDetails: Record<string, unknown> = {
        // 保存探险区域信息
        expeditionZone: mission.expeditionZone
      }

      switch (expeditionResult.eventType) {
        case 'resources':
          reportMessage = t('missionReports.expeditionResources')
          reportDetails.foundResources = expeditionResult.resources
          break
        case 'darkMatter':
          reportMessage = t('missionReports.expeditionDarkMatter')
          reportDetails.foundResources = expeditionResult.resources
          break
        case 'fleet':
          reportMessage = t('missionReports.expeditionFleet')
          reportDetails.foundFleet = expeditionResult.fleet
          break
        case 'pirates':
          reportMessage = expeditionResult.fleetLost
            ? t('missionReports.expeditionPiratesAttack')
            : t('missionReports.expeditionPiratesEscaped')
          if (expeditionResult.fleetLost) reportDetails.fleetLost = expeditionResult.fleetLost
          break
        case 'aliens':
          reportMessage = expeditionResult.fleetLost
            ? t('missionReports.expeditionAliensAttack')
            : t('missionReports.expeditionAliensEscaped')
          if (expeditionResult.fleetLost) reportDetails.fleetLost = expeditionResult.fleetLost
          break
        default:
          reportMessage = t('missionReports.expeditionNothing')
      }

      gameStore.player.missionReports.push({
        id: `mission-report-${mission.id}`,
        timestamp: Date.now(),
        missionType: MissionType.Expedition,
        originPlanetId: mission.originPlanetId,
        originPlanetName,
        targetPosition: mission.targetPosition,
        success: expeditionResult.eventType !== 'nothing',
        message: reportMessage,
        details: reportDetails,
        read: false
      })
    }
  }

  const processMissionReturn = (mission: FleetMission) => {
    const originPlanet = gameStore.player.planets.find(p => p.id === mission.originPlanetId)
    if (!originPlanet) return
    shipLogic.addFleet(originPlanet.fleet, mission.fleet)
    resourceLogic.addResources(originPlanet.resources, mission.cargo)
    const missionIndex = gameStore.player.fleetMissions.indexOf(mission)
    if (missionIndex > -1) gameStore.player.fleetMissions.splice(missionIndex, 1)
  }

  // NPC任务处理
  const processNPCMissionArrival = (npc: NPC, mission: FleetMission) => {
    if (mission.missionType === MissionType.Recycle) {
      // NPC回收任务到达
      const debrisId = mission.debrisFieldId
      if (!debrisId) {
        console.warn('[NPC Mission] Recycle mission missing debrisFieldId')
        mission.status = 'returning'
        mission.returnTime = Date.now() + (mission.arrivalTime - mission.departureTime)
        return
      }

      const debrisField = universeStore.debrisFields[debrisId]
      const recycleResult = fleetLogic.processRecycleArrival(mission, debrisField)

      if (recycleResult && debrisField && recycleResult.collectedResources) {
        // 更新成就统计 - 被NPC回收残骸（如果残骸是玩家战斗产生的）
        const totalRecycled = recycleResult.collectedResources.metal + recycleResult.collectedResources.crystal
        if (totalRecycled > 0) {
          gameLogic.trackDiplomacyStats(gameStore.player, 'debrisRecycledByNPC', { resourcesAmount: totalRecycled })
        }

        if (recycleResult.remainingDebris && (recycleResult.remainingDebris.metal > 0 || recycleResult.remainingDebris.crystal > 0)) {
          // 更新残骸场
          universeStore.debrisFields[debrisId] = {
            id: debrisField.id,
            position: debrisField.position,
            resources: recycleResult.remainingDebris,
            createdAt: debrisField.createdAt
          }
        } else {
          // 残骸已被完全回收，从宇宙中删除
          delete universeStore.debrisFields[debrisId]
        }
      }

      // 移除即将到来的警告（回收任务已到达）
      removeIncomingFleetAlertById(mission.id)

      // 设置返回时间
      mission.returnTime = Date.now() + (mission.arrivalTime - mission.departureTime)
      return
    }

    // 找到目标星球
    const targetKey = gameLogic.generatePositionKey(
      mission.targetPosition.galaxy,
      mission.targetPosition.system,
      mission.targetPosition.position
    )
    const targetPlanet =
      gameStore.player.planets.find(
        p =>
          p.position.galaxy === mission.targetPosition.galaxy &&
          p.position.system === mission.targetPosition.system &&
          p.position.position === mission.targetPosition.position
      ) || universeStore.planets[targetKey]

    if (!targetPlanet) {
      console.warn('[NPC Mission] Target planet not found')
      return
    }

    if (mission.missionType === MissionType.Spy) {
      // NPC侦查到达
      const { spiedNotification, spyReport } = npcBehaviorLogic.processNPCSpyArrival(npc, mission, targetPlanet, gameStore.player)

      // 更新成就统计 - 被NPC侦查
      gameLogic.trackDiplomacyStats(gameStore.player, 'spiedByNPC')

      // 保存侦查报告到NPC（用于后续攻击决策）
      if (!npc.playerSpyReports) {
        npc.playerSpyReports = {}
      }
      npc.playerSpyReports[targetPlanet.id] = spyReport

      // 添加被侦查通知给玩家
      if (!gameStore.player.spiedNotifications) {
        gameStore.player.spiedNotifications = []
      }
      gameStore.player.spiedNotifications.push(spiedNotification)

      // 移除即将到来的警告（侦查已到达）
      removeIncomingFleetAlertById(mission.id)
    } else if (mission.missionType === MissionType.Attack) {
      // NPC攻击到达 - 使用专门的NPC攻击处理逻辑
      fleetLogic.processNPCAttackArrival(npc, mission, targetPlanet, gameStore.player, gameStore.player.planets).then(attackResult => {
        if (attackResult) {
          // 更新成就统计 - 被NPC攻击 + 防御统计
          gameLogic.trackDiplomacyStats(gameStore.player, 'attackedByNPC')
          const debrisValue = attackResult.debrisField
            ? attackResult.debrisField.resources.metal + attackResult.debrisField.resources.crystal
            : 0
          const won = attackResult.battleResult.winner === 'defender'
          gameLogic.trackDefenseStats(gameStore.player, attackResult.battleResult, won, debrisValue)

          // 添加战斗报告给玩家
          gameStore.player.battleReports.push(attackResult.battleResult)

          // 如果生成月球，添加到玩家星球列表
          if (attackResult.moon) {
            gameStore.player.planets.push(attackResult.moon)
          }

          // 如果生成残骸场，添加到宇宙残骸场列表
          if (attackResult.debrisField) {
            const existingDebris = universeStore.debrisFields[attackResult.debrisField.id]
            if (existingDebris) {
              // 累加残骸资源
              universeStore.debrisFields[attackResult.debrisField.id] = {
                ...existingDebris,
                resources: {
                  metal: existingDebris.resources.metal + attackResult.debrisField.resources.metal,
                  crystal: existingDebris.resources.crystal + attackResult.debrisField.resources.crystal
                }
              }
            } else {
              // 新残骸场
              universeStore.debrisFields[attackResult.debrisField.id] = attackResult.debrisField
            }
          }
        }

        // 移除即将到来的警告（攻击已到达）
        removeIncomingFleetAlertById(mission.id)
      })
    }
  }

  const processNPCMissionReturn = (npc: NPC, mission: FleetMission) => {
    // 找到NPC的起始星球
    const originPlanet = npc.planets.find(p => p.id === mission.originPlanetId)
    if (!originPlanet) return

    // 返还舰队
    shipLogic.addFleet(originPlanet.fleet, mission.fleet)

    // 如果携带掠夺资源，给NPC添加资源
    if (mission.cargo) {
      originPlanet.resources.metal += mission.cargo.metal
      originPlanet.resources.crystal += mission.cargo.crystal
      originPlanet.resources.deuterium += mission.cargo.deuterium
    }

    // 从NPC任务列表中移除
    if (npc.fleetMissions) {
      const missionIndex = npc.fleetMissions.indexOf(mission)
      if (missionIndex > -1) {
        npc.fleetMissions.splice(missionIndex, 1)
      }
    }
  }

  // 处理导弹攻击到达
  const processMissileAttackArrival = async (missileAttack: MissileAttack) => {
    // 动态导入导弹逻辑
    const missileLogic = await import('@/logic/missileLogic')

    // 找到目标星球
    const targetKey = gameLogic.generatePositionKey(
      missileAttack.targetPosition.galaxy,
      missileAttack.targetPosition.system,
      missileAttack.targetPosition.position
    )
    const targetPlanet =
      gameStore.player.planets.find(
        p =>
          p.position.galaxy === missileAttack.targetPosition.galaxy &&
          p.position.system === missileAttack.targetPosition.system &&
          p.position.position === missileAttack.targetPosition.position
      ) || universeStore.planets[targetKey]

    // 如果目标星球不存在，导弹失败
    if (!targetPlanet) {
      missileAttack.status = 'arrived'
      // 生成失败报告
      if (!gameStore.player.missionReports) {
        gameStore.player.missionReports = []
      }
      gameStore.player.missionReports.push({
        id: `missile-report-${missileAttack.id}`,
        timestamp: Date.now(),
        missionType: MissionType.MissileAttack,
        originPlanetId: missileAttack.originPlanetId,
        originPlanetName: gameStore.player.planets.find(p => p.id === missileAttack.originPlanetId)?.name || t('fleetView.unknownPlanet'),
        targetPosition: missileAttack.targetPosition,
        targetPlanetId: undefined,
        targetPlanetName: `[${missileAttack.targetPosition.galaxy}:${missileAttack.targetPosition.system}:${missileAttack.targetPosition.position}]`,
        success: false,
        message: t('missionReports.missileAttackFailed'),
        details: {
          missileCount: missileAttack.missileCount,
          missileHits: 0,
          missileIntercepted: 0,
          defenseLosses: {}
        },
        read: false
      })
      return
    }

    // 计算导弹攻击结果
    const impactResult = missileLogic.calculateMissileImpact(missileAttack.missileCount, targetPlanet)

    // 应用损失到目标星球
    missileLogic.applyMissileAttackResult(targetPlanet, impactResult.defenseLosses)

    // 如果目标是NPC的星球，扣除外交好感度
    if (targetPlanet.ownerId && targetPlanet.ownerId !== gameStore.player.id) {
      const targetNpc = npcStore.npcs.find(npc => npc.id === targetPlanet.ownerId)
      if (targetNpc) {
        // 导弹攻击扣除好感度
        const { REPUTATION_CHANGES } = DIPLOMATIC_CONFIG
        const reputationLoss = REPUTATION_CHANGES.ATTACK / 2 // 导弹攻击的好感度惩罚是普通攻击的一半

        // 更新NPC对玩家的关系（统一使用 npc.relations 作为唯一数据源）
        if (!targetNpc.relations) {
          targetNpc.relations = {}
        }
        const npcRelation = diplomaticLogic.getOrCreateRelation(targetNpc.relations, targetNpc.id, gameStore.player.id)
        targetNpc.relations[gameStore.player.id] = diplomaticLogic.updateReputation(
          npcRelation,
          reputationLoss,
          DiplomaticEventType.Attack,
          t('diplomacy.reports.wasAttackedByMissile')
        )
      }
    }

    // 标记导弹攻击为已到达
    missileAttack.status = 'arrived'

    // 生成导弹攻击报告
    if (!gameStore.player.missionReports) {
      gameStore.player.missionReports = []
    }
    const reportMessage =
      impactResult.missileHits > 0
        ? `${t('missionReports.missileAttackSuccess')}: ${impactResult.missileHits} ${t('missionReports.hits')}`
        : t('missionReports.missileAttackIntercepted')

    gameStore.player.missionReports.push({
      id: `missile-report-${missileAttack.id}`,
      timestamp: Date.now(),
      missionType: MissionType.MissileAttack,
      originPlanetId: missileAttack.originPlanetId,
      originPlanetName: gameStore.player.planets.find(p => p.id === missileAttack.originPlanetId)?.name || t('fleetView.unknownPlanet'),
      targetPosition: missileAttack.targetPosition,
      targetPlanetId: targetPlanet.id,
      targetPlanetName: targetPlanet.name,
      success: true,
      message: reportMessage,
      details: {
        missileCount: missileAttack.missileCount,
        missileHits: impactResult.missileHits,
        missileIntercepted: impactResult.missileIntercepted,
        defenseLosses: impactResult.defenseLosses
      },
      read: false
    })
  }

  // 打开敌方警报面板
  const openEnemyAlertPanel = () => {
    enemyAlertNotificationsRef.value?.open()
  }

  const removeIncomingFleetAlertById = (missionId: string) => {
    if (!gameStore.player.incomingFleetAlerts) return
    const index = gameStore.player.incomingFleetAlerts.findIndex(a => a.id === missionId)
    if (index > -1) {
      gameStore.player.incomingFleetAlerts.splice(index, 1)
    }
  }

  /**
   * 同步NPC星球数据到universeStore
   * 解决npcStore和universeStore数据不同步的问题
   */
  const syncNPCPlanetToUniverse = (npc: any) => {
    npc.planets.forEach((npcPlanet: any) => {
      const planetKey = gameLogic.generatePositionKey(npcPlanet.position.galaxy, npcPlanet.position.system, npcPlanet.position.position)
      const universePlanet = universeStore.planets[planetKey]
      if (universePlanet) {
        // 同步所有关键数据
        universePlanet.resources = { ...npcPlanet.resources }
        universePlanet.buildings = { ...npcPlanet.buildings }
        universePlanet.fleet = { ...npcPlanet.fleet }
        universePlanet.defense = { ...npcPlanet.defense }
      }
    })
  }

  const updateNPCGrowth = (deltaSeconds: number) => {
    // 累积时间
    npcUpdateCounter.value += deltaSeconds

    // 只在达到更新间隔时才执行
    if (npcUpdateCounter.value < NPC_UPDATE_INTERVAL) {
      return
    }

    // 获取所有星球
    const allPlanets = Object.values(universeStore.planets)

    // 如果NPC store为空，从星球数据中初始化NPC
    if (npcStore.npcs.length === 0) {
      const npcMap = new Map<string, any>()

      allPlanets.forEach(planet => {
        // 跳过玩家的星球
        if (planet.ownerId === gameStore.player.id || !planet.ownerId) return

        // 这是NPC的星球
        if (!npcMap.has(planet.ownerId)) {
          // 为每个NPC设置随机的初始冷却时间，避免所有NPC同时行动
          const now = Date.now()
          const randomSpyOffset = Math.random() * 240 * 1000 // 0-4分钟的随机延迟
          const randomAttackOffset = Math.random() * 480 * 1000 // 0-8分钟的随机延迟

          // 初始化NPC与玩家的中立关系
          const initialRelations: Record<string, any> = {}
          initialRelations[gameStore.player.id] = {
            fromId: planet.ownerId,
            toId: gameStore.player.id,
            reputation: 0,
            status: 'neutral' as const,
            lastUpdated: now,
            history: []
          }

          npcMap.set(planet.ownerId, {
            id: planet.ownerId,
            name: generateNPCName(planet.ownerId, gameStore.locale),
            planets: [],
            technologies: {}, // 初始化空科技树
            difficulty: 'medium' as const, // 默认中等难度
            relations: initialRelations, // 外交关系（默认与玩家中立）
            allies: [], // 盟友列表
            enemies: [], // 敌人列表
            lastSpyTime: now - randomSpyOffset, // 设置随机的上次侦查时间
            lastAttackTime: now - randomAttackOffset, // 设置随机的上次攻击时间
            fleetMissions: [], // 舰队任务
            playerSpyReports: {} // 对玩家的侦查报告
          })
        }

        npcMap.get(planet.ownerId)!.planets.push(planet)
      })

      // 保存到store
      npcStore.npcs = Array.from(npcMap.values())

      // 如果有NPC，基于距离初始化NPC实力
      if (npcStore.npcs.length > 0) {
        // 获取玩家母星（第一个非月球星球）
        const homeworld = gameStore.player.planets.find(p => !p.isMoon)

        if (homeworld) {
          npcStore.npcs.forEach(npc => {
            // 基于距离初始化NPC实力
            npcGrowthLogic.initializeNPCByDistance(npc, homeworld.position)
            // 同步NPC星球数据到universeStore
            syncNPCPlanetToUniverse(npc)
          })
        }

        // 初始化NPC之间的外交关系（盟友/敌人）
        npcGrowthLogic.initializeNPCDiplomacy(npcStore.npcs)
      }
    }

    // 确保所有NPC都有间谍探测器（修复旧版本保存的数据）
    if (npcStore.npcs.length > 0) {
      npcGrowthLogic.ensureNPCSpyProbes(npcStore.npcs)
    }

    // 确保所有NPC都有AI类型（修复旧版本保存的数据）
    if (npcStore.npcs.length > 0) {
      npcGrowthLogic.ensureAllNPCsAIType(npcStore.npcs)
    }

    // 确保所有NPC都与玩家建立了关系（修复旧版本保存的数据）
    if (npcStore.npcs.length > 0) {
      const now = Date.now()
      // 获取玩家母星（用于计算距离）
      const homeworld = gameStore.player.planets.find(p => !p.isMoon)

      npcStore.npcs.forEach(npc => {
        if (!npc.relations) {
          npc.relations = {}
        }
        // 如果NPC没有与玩家的关系，建立中立关系
        if (!npc.relations[gameStore.player.id]) {
          npc.relations[gameStore.player.id] = {
            fromId: npc.id,
            toId: gameStore.player.id,
            reputation: 0,
            status: 'neutral' as const,
            lastUpdated: now,
            history: []
          }
        }

        // 迁移旧存档：如果NPC没有距离数据，计算并设置
        if (homeworld && npc.distanceToHomeworld === undefined) {
          const npcPlanet = npc.planets[0]
          if (npcPlanet) {
            npc.distanceToHomeworld = npcGrowthLogic.calculateDistanceToHomeworld(npcPlanet.position, homeworld.position)
            npc.difficultyLevel = npcGrowthLogic.calculateDifficultyLevel(npc.distanceToHomeworld)
            // 重新初始化NPC实力以匹配新的距离难度系统
            npcGrowthLogic.initializeNPCByDistance(npc, homeworld.position)
            // 同步NPC星球数据到universeStore
            syncNPCPlanetToUniverse(npc)
          }
        }
      })
    }

    // 如果没有NPC，直接返回
    if (npcStore.npcs.length === 0) {
      npcUpdateCounter.value = 0
      return
    }

    // 获取玩家母星用于距离计算
    const homeworldForGrowth = gameStore.player.planets.find(p => !p.isMoon)

    // 使用累积的时间更新每个NPC（基于距离的成长系统）
    npcStore.npcs.forEach(npc => {
      if (homeworldForGrowth) {
        npcGrowthLogic.updateNPCGrowthByDistance(npc, homeworldForGrowth.position, npcUpdateCounter.value, gameStore.gameSpeed)
        // 同步NPC星球数据到universeStore（确保侦查报告显示正确数据）
        syncNPCPlanetToUniverse(npc)
      }
    })

    // 重置计数器
    npcUpdateCounter.value = 0
  }

  const updateNPCBehavior = (deltaSeconds: number) => {
    // 累积时间
    npcBehaviorCounter.value += deltaSeconds

    // 只在达到更新间隔时才执行
    if (npcBehaviorCounter.value < NPC_BEHAVIOR_INTERVAL) {
      return
    }

    // 如果没有NPC，直接返回
    if (npcStore.npcs.length === 0) {
      npcBehaviorCounter.value = 0
      return
    }

    const now = Date.now()
    // 合并玩家星球和NPC星球到allPlanets（NPC需要能够侦查和攻击玩家星球）
    const allPlanets = [...gameStore.player.planets, ...Object.values(universeStore.planets)]

    // 计算当前所有正在进行的侦查和攻击任务数量
    let activeSpyMissions = 0
    let activeAttackMissions = 0
    npcStore.npcs.forEach(npc => {
      if (npc.fleetMissions) {
        npc.fleetMissions.forEach(mission => {
          if (mission.status === 'outbound') {
            if (mission.missionType === 'spy') {
              activeSpyMissions++
            } else if (mission.missionType === 'attack') {
              activeAttackMissions++
            }
          }
        })
      }
    })

    // 获取并发限制配置
    const config = npcBehaviorLogic.calculateDynamicBehavior(gameStore.player.points)

    // 更新每个NPC的行为（随机顺序，避免总是优先处理同一批NPC）
    const shuffledNpcs = [...npcStore.npcs].sort(() => Math.random() - 0.5)
    shuffledNpcs.forEach(npc => {
      // 在更新前检查当前并发数，如果已达上限则跳过该NPC
      npcBehaviorLogic.updateNPCBehaviorWithLimit(npc, gameStore.player, allPlanets, universeStore.debrisFields, now, {
        activeSpyMissions,
        activeAttackMissions,
        config
      })

      // 重新计算当前并发数（因为可能新增了任务）
      activeSpyMissions = 0
      activeAttackMissions = 0
      npcStore.npcs.forEach(n => {
        if (n.fleetMissions) {
          n.fleetMissions.forEach(mission => {
            if (mission.status === 'outbound') {
              if (mission.missionType === 'spy') activeSpyMissions++
              else if (mission.missionType === 'attack') activeAttackMissions++
            }
          })
        }
      })

      // 处理增强NPC行为（中立和友好NPC的特殊行为）
      const relation = npc.relations?.[gameStore.player.id]
      if (relation?.status === 'neutral') {
        const neutralResult = npcBehaviorLogic.updateNeutralNPCBehavior(npc, npcStore.npcs, gameStore.player, now)

        // 处理贸易提议
        if (neutralResult.tradeOffer) {
          if (!gameStore.player.tradeOffers) {
            gameStore.player.tradeOffers = []
          }
          gameStore.player.tradeOffers.push(neutralResult.tradeOffer)
          toast.info(t('npcBehavior.tradeOfferReceived'), {
            description: t('npcBehavior.tradeOfferDesc', { npcName: neutralResult.tradeOffer.npcName })
          })
        }

        // 处理态度摇摆
        if (neutralResult.swingDirection) {
          if (!gameStore.player.attitudeChangeNotifications) {
            gameStore.player.attitudeChangeNotifications = []
          }
          gameStore.player.attitudeChangeNotifications.push({
            id: `attitude_${Date.now()}_${npc.id}`,
            timestamp: now,
            npcId: npc.id,
            npcName: npc.name,
            previousStatus: 'neutral',
            newStatus: neutralResult.swingDirection,
            reason: 'attitude_swing',
            read: false
          })
          const statusKey = neutralResult.swingDirection === 'friendly' ? 'npcBehavior.becameFriendly' : 'npcBehavior.becameHostile'
          toast.info(t('npcBehavior.attitudeChanged'), {
            description: t(statusKey, { npcName: npc.name })
          })
        }
      } else if (relation?.status === 'friendly') {
        const friendlyResult = npcBehaviorLogic.updateFriendlyNPCBehavior(npc, npcStore.npcs, gameStore.player, now)

        // 处理情报报告
        if (friendlyResult.intelReport) {
          if (!gameStore.player.intelReports) {
            gameStore.player.intelReports = []
          }
          gameStore.player.intelReports.push(friendlyResult.intelReport)
          toast.info(t('npcBehavior.intelReceived'), {
            description: t('npcBehavior.intelReceivedDesc', { npcName: friendlyResult.intelReport.fromNpcName })
          })
        }

        // 处理联合攻击邀请
        if (friendlyResult.jointAttackInvite) {
          if (!gameStore.player.jointAttackInvites) {
            gameStore.player.jointAttackInvites = []
          }
          gameStore.player.jointAttackInvites.push(friendlyResult.jointAttackInvite)
          toast.info(t('npcBehavior.jointAttackInvite'), {
            description: t('npcBehavior.jointAttackInviteDesc', { npcName: friendlyResult.jointAttackInvite.fromNpcName })
          })
        }

        // 处理资源援助
        if (friendlyResult.aidProvided) {
          if (!gameStore.player.aidNotifications) {
            gameStore.player.aidNotifications = []
          }
          gameStore.player.aidNotifications.push({
            id: `aid_${Date.now()}_${npc.id}`,
            timestamp: now,
            npcId: npc.id,
            npcName: npc.name,
            aidResources: friendlyResult.aidProvided,
            read: false
          })
          const totalAid = friendlyResult.aidProvided.metal + friendlyResult.aidProvided.crystal + friendlyResult.aidProvided.deuterium
          toast.success(t('npcBehavior.aidReceived'), {
            description: t('npcBehavior.aidReceivedDesc', { npcName: npc.name, amount: totalAid.toLocaleString() })
          })
        }
      }
    })

    npcBehaviorCounter.value = 0
  }

  // 更新NPC关系统计（友好/敌对数量）
  const updateNPCRelationStats = () => {
    let friendlyCount = 0
    let hostileCount = 0
    const playerId = gameStore.player.id
    npcStore.npcs.forEach(npc => {
      const relation = npc.relations?.[playerId]
      if (relation) {
        const status = diplomaticLogic.calculateRelationStatus(relation.reputation)
        if (status === 'friendly') {
          friendlyCount++
        } else if (status === 'hostile') {
          hostileCount++
        }
      }
    })
    gameLogic.trackDiplomacyStats(gameStore.player, 'updateRelations', { friendlyCount, hostileCount })
  }

  // 检查成就解锁
  const achievementCheckCounter = ref(0)
  const ACHIEVEMENT_CHECK_INTERVAL = 5 // 每5秒检查一次成就

  const checkAchievementUnlocks = () => {
    achievementCheckCounter.value += 1

    // 只在达到更新间隔时才执行
    if (achievementCheckCounter.value < ACHIEVEMENT_CHECK_INTERVAL) {
      return
    }

    // 更新NPC关系统计
    updateNPCRelationStats()

    // 检查并解锁成就
    const unlocks = gameLogic.checkAndUnlockAchievements(gameStore.player)

    // 显示成就解锁通知（奖励已在 checkAndUnlockAchievements 中应用）
    unlocks.forEach(unlock => {
      // 显示 toast 通知
      const tierName = t(`achievements.tiers.${unlock.tier}`)
      const achievementName = t(`achievements.names.${unlock.id}`)
      toast.success(t('achievements.unlocked'), {
        description: `${achievementName} (${tierName})`
      })
    })

    achievementCheckCounter.value = 0
  }

  // 启动游戏循环
  const startGameLoop = () => {
    if (gameStore.isPaused) return
    // 清理旧的定时器
    if (gameLoop.value) {
      clearInterval(gameLoop.value)
    }
    // 游戏循环固定为1秒，避免高倍速时的卡顿
    // gameSpeed 只作用于资源产出和时间消耗的倍率
    const interval = 1000
    // 启动新的游戏循环
    gameLoop.value = setInterval(() => {
      updateGame()
    }, interval)
  }

  // 停止游戏循环
  const stopGameLoop = () => {
    if (gameLoop.value) {
      clearInterval(gameLoop.value)
      gameLoop.value = null
    }
  }

  // 启动积分更新定时器（每10秒更新一次）
  const startPointsUpdate = () => {
    if (pointsUpdateInterval.value) {
      clearInterval(pointsUpdateInterval.value)
    }
    pointsUpdateInterval.value = setInterval(() => {
      if (!gameStore.isPaused) {
        gameStore.player.points = publicLogic.calculatePlayerPoints(gameStore.player)
      }
    }, 10000) // 10秒更新一次
  }

  // 处理取消建造事件
  const handleCancelBuildEvent = (event: CustomEvent) => {
    handleCancelBuild(event.detail)
  }

  // 处理取消研究事件
  const handleCancelResearchEvent = (event: CustomEvent) => {
    handleCancelResearch(event.detail)
  }

  // 科乐美秘籍：上上下下左左右右BA
  const setupKonamiCode = () => {
    const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowLeft', 'ArrowRight', 'ArrowRight', 'b', 'a']
    let konamiIndex = 0
    const handleKeyDown = (event: KeyboardEvent) => {
      // 如果已经激活GM模式，直接返回
      if (gameStore.player.isGMEnabled) return

      const key = event.key.toLowerCase()
      // 检查是否匹配当前秘籍序列
      if (key === konamiCode[konamiIndex] || event.key === konamiCode[konamiIndex]) {
        konamiIndex++
        // 如果完成整个秘籍序列
        if (konamiIndex === konamiCode.length) {
          gameStore.player.isGMEnabled = true
          // 显示成功消息
          toast.success(t('common.gmModeActivated'))
          konamiIndex = 0
        }
      } else {
        // 如果按错了键，重置序列
        konamiIndex = 0
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    // 返回清理函数
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }

  // 打开重命名对话框
  const openRenameDialog = (planetId: string, currentName: string) => {
    renamingPlanetId.value = planetId
    newPlanetName.value = currentName
    renameDialogOpen.value = true
  }

  // 确认重命名
  const confirmRenamePlanet = () => {
    if (!renamingPlanetId.value || !newPlanetName.value.trim()) return

    const targetPlanet = gameStore.player.planets.find(p => p.id === renamingPlanetId.value)
    if (targetPlanet) {
      targetPlanet.name = newPlanetName.value.trim()
    }

    renameDialogOpen.value = false
    renamingPlanetId.value = null
    newPlanetName.value = ''
  }

  // 检查功能是否解锁
  const isFeatureUnlocked = (path: string): boolean => {
    const requirement = featureRequirements[path]
    if (!requirement) {
      return true
    }
    const currentLevel = planet.value?.buildings[requirement.building] || 0
    return currentLevel >= requirement.level
  }

  // 切换到月球
  const switchToMoon = () => {
    if (moon.value) {
      gameStore.currentPlanetId = moon.value.id
    }
  }

  // 切换回母星
  const switchToParentPlanet = () => {
    if (planet.value?.parentPlanetId) {
      gameStore.currentPlanetId = planet.value.parentPlanetId
    }
  }

  // 切换到指定星球
  const switchToPlanet = (planetId: string) => {
    gameStore.currentPlanetId = planetId
  }

  // 切换侧边栏
  const toggleSidebar = () => {
    sidebarOpen.value = !sidebarOpen.value
  }

  // 处理侧边栏打开/关闭状态变化
  const handleSidebarOpenChange = (open: boolean) => {
    sidebarOpen.value = open
  }

  // 取消建造
  const handleCancelBuild = (queueId: string) => {
    confirmDialogTitle.value = t('queue.cancelBuild')
    confirmDialogMessage.value = t('queue.confirmCancel')
    confirmDialogAction.value = () => {
      if (!gameStore.currentPlanet) return false
      const { item, index } = buildingValidation.findQueueItem(gameStore.currentPlanet.buildQueue, queueId)
      if (!item) return false
      if (item.type === 'building') {
        const refund = buildingValidation.cancelBuildingUpgrade(gameStore.currentPlanet, item)
        resourceLogic.addResources(gameStore.currentPlanet.resources, refund)
      }
      gameStore.currentPlanet.buildQueue.splice(index, 1)
      return true
    }
    confirmDialogOpen.value = true
  }

  // 取消研究
  const handleCancelResearch = (queueId: string) => {
    confirmDialogTitle.value = t('queue.cancelResearch')
    confirmDialogMessage.value = t('queue.confirmCancel')
    confirmDialogAction.value = () => {
      if (!gameStore.currentPlanet) return false
      const { item, index } = buildingValidation.findQueueItem(gameStore.player.researchQueue, queueId)
      if (!item) return false
      if (item.type === 'technology') {
        const refund = researchValidation.cancelTechnologyResearch(item)
        resourceLogic.addResources(gameStore.currentPlanet.resources, refund)
      }
      gameStore.player.researchQueue.splice(index, 1)
      return true
    }
    confirmDialogOpen.value = true
  }

  // 监听暂停状态变化
  watch(
    () => gameStore.isPaused,
    isPaused => {
      if (isPaused) {
        stopGameLoop()
      } else {
        startGameLoop()
      }
    }
  )

  // 初始化游戏
  onMounted(async () => {
    try {
      // 如果是首次访问（没有星球数据），使用浏览器语言自动检测
      const isFirstVisit = gameStore.player.planets.length === 0
      if (isFirstVisit) {
        gameStore.locale = detectBrowserLocale()
      }
      await initGame()
      // 启动游戏循环
      startGameLoop()
      // 启动积分更新定时器
      startPointsUpdate()
      // 启动科乐美秘籍监听
      konamiCleanup.value = setupKonamiCode()

      // 添加队列取消事件监听
      window.addEventListener('cancel-build', handleCancelBuildEvent as EventListener)
      window.addEventListener('cancel-research', handleCancelResearchEvent as EventListener)

      // 首次检查版本（被动检测）
      const versionInfo = await checkLatestVersion(gameStore.player.lastVersionCheckTime || 0, (time: number) => {
        gameStore.player.lastVersionCheckTime = time
      })
      if (versionInfo) {
        updateInfo.value = versionInfo
        toast.info(t('settings.newVersionAvailable', { version: versionInfo.version }), {
          duration: Infinity,
          dismissible: true,
          action: {
            label: t('settings.viewUpdate'),
            onClick: () => {
              showUpdateDialog.value = true
            }
          }
        })
      }

      // 检测旧格式 NPC 名称
      if (npcStore.npcs.length > 0) {
        const oldCount = countOldFormatNPCs(npcStore.npcs, gameStore.locale)
        if (oldCount > 0) {
          oldFormatNPCCount.value = oldCount
          npcNameUpdateDialogOpen.value = true
        }
      }

      // Android 返回键退出确认
      if (Capacitor.isNativePlatform()) {
        CapacitorApp.addListener('backButton', ({ canGoBack }) => {
          if (canGoBack) {
            router.back()
          } else {
            exitDialogOpen.value = true
          }
        })
      }

      // 启动版本检查定时器（每5分钟被动检查一次）
      versionCheckInterval.value = setInterval(async () => {
        const versionInfo = await checkLatestVersion(gameStore.player.lastVersionCheckTime || 0, (time: number) => {
          gameStore.player.lastVersionCheckTime = time
        })
        if (versionInfo) {
          updateInfo.value = versionInfo
          toast.info(t('settings.newVersionAvailable', { version: versionInfo.version }), {
            duration: Infinity,
            dismissible: true,
            action: {
              label: t('settings.viewUpdate'),
              onClick: () => {
                showUpdateDialog.value = true
              }
            }
          })
        }
      }, 5 * 60 * 1000)
    } catch (error) {
      console.error('Error during game initialization:', error)
      // 即使初始化失败，也尝试启动基本的游戏循环
      startGameLoop()
    }
  })

  // 清理定时器
  onUnmounted(() => {
    if (gameLoop.value) clearInterval(gameLoop.value)
    if (pointsUpdateInterval.value) clearInterval(pointsUpdateInterval.value)
    if (konamiCleanup.value) konamiCleanup.value()
    if (versionCheckInterval.value) clearInterval(versionCheckInterval.value)
    // 移除队列取消事件监听
    window.removeEventListener('cancel-build', handleCancelBuildEvent as EventListener)
    window.removeEventListener('cancel-research', handleCancelResearchEvent as EventListener)
    // 移除 Android 返回键监听
    if (Capacitor.isNativePlatform()) {
      CapacitorApp.removeAllListeners()
    }
  })

  // Android 退出应用
  const exitApp = () => {
    CapacitorApp.exitApp()
  }

  // NPC 名称更新处理
  const handleUpdateNPCNames = () => {
    let updatedCount = 0
    npcStore.npcs.forEach(npc => {
      const newName = updateNPCName(npc.id, gameStore.locale)
      if (newName !== npc.name) {
        npc.name = newName
        updatedCount++
      }
    })
    npcNameUpdateDialogOpen.value = false
    toast.success(t('settings.npcNameUpdateSuccess', { count: updatedCount }))
  }

  const handleSkipNPCNameUpdate = () => {
    npcNameUpdateDialogOpen.value = false
    toast.info(t('settings.npcNameUpdateSkipped'))
  }
</script>

<style scoped>
  /* 平滑滚动 */
  main {
    scroll-behavior: smooth;
  }
</style>
