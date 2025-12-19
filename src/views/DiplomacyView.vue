<template>
  <div class="container mx-auto p-4 sm:p-6 space-y-6">
    <div class="flex items-start justify-between gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold">{{ t('diplomacy.title') }}</h1>
        <p class="text-sm text-muted-foreground mt-1">{{ t('diplomacy.description') }}</p>
      </div>
      <!-- 视图切换和诊断按钮 -->
      <div class="flex items-center gap-2 shrink-0">
        <!-- 视图模式切换 -->
        <div class="flex items-center border rounded-md">
          <Button
            variant="ghost"
            size="sm"
            class="h-8 px-2 rounded-r-none"
            :class="{ 'bg-accent': viewMode === 'list' }"
            @click="viewMode = 'list'"
            :title="t('diplomacy.viewMode.list')"
          >
            <List class="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            class="h-8 px-2 rounded-l-none border-l"
            :class="{ 'bg-accent': viewMode === 'card' }"
            @click="viewMode = 'card'"
            :title="t('diplomacy.viewMode.card')"
          >
            <LayoutGrid class="h-4 w-4" />
          </Button>
        </div>
        <!-- NPC诊断按钮 -->
        <Button @click="showNPCDiagnostic" variant="outline" size="sm">
          <Activity class="h-4 w-4 sm:mr-2" />
          <span class="hidden sm:inline">{{ t('diplomacy.diagnostic.button') }}</span>
        </Button>
      </div>
    </div>

    <!-- NPC诊断对话框 -->
    <Dialog v-model:open="npcDiagnosticOpen">
      <ScrollableDialogContent container-class="max-w-4xl">
        <template #header>
          <DialogTitle>{{ t('diplomacy.diagnostic.title') }}</DialogTitle>
          <DialogDescription>
            <div class="text-sm mt-2">
              {{
                t('diplomacy.diagnostic.description', {
                  points: gameStore.player.points || 0,
                  spyInterval: Math.floor(behaviorConfig.spyInterval / 60),
                  attackInterval: Math.floor(behaviorConfig.attackInterval / 60),
                  attackProb: (behaviorConfig.attackProbability * 100).toFixed(0)
                })
              }}
            </div>
          </DialogDescription>
        </template>

        <!-- 诊断对话框搜索框 -->
        <div class="relative mb-4">
          <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input v-model="diagnosticSearchQuery" type="text" :placeholder="t('diplomacy.searchPlaceholder')" class="pl-10" />
        </div>

        <div v-if="filteredDiagnostics.length === 0" class="text-center py-8 text-muted-foreground">
          {{ t('diplomacy.diagnostic.noData') }}
        </div>
        <div v-else class="space-y-4">
          <div v-for="diagnostic in paginatedDiagnostics" :key="diagnostic.npcId" class="border rounded-lg p-4">
            <div class="flex items-center justify-between mb-3">
              <h3 class="font-bold text-lg">{{ diagnostic.npcName }}</h3>
              <Badge :variant="getRelationBadgeVariant(diagnostic.relationStatusKey)">
                {{ getLocalizedRelationStatus(diagnostic.relationStatusKey) }}
              </Badge>
            </div>
            <div class="grid grid-cols-2 gap-2 text-sm mb-3">
              <div class="flex items-center gap-2">
                <span class="text-muted-foreground">{{ t('diplomacy.diagnostic.difficulty') }}:</span>
                <span class="font-medium">{{ t(`diplomacy.diagnostic.difficultyLevels.${diagnostic.difficulty}`) }}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-muted-foreground">{{ t('diplomacy.diagnostic.reputation') }}:</span>
                <span class="font-medium">{{ diagnostic.reputation }}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-muted-foreground">{{ t('diplomacy.diagnostic.spyProbes') }}:</span>
                <span class="font-medium">{{ diagnostic.spyProbes }}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-muted-foreground">{{ t('diplomacy.diagnostic.fleetPower') }}:</span>
                <span class="font-medium">{{ diagnostic.totalFleetPower }}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-muted-foreground">{{ t('diplomacy.diagnostic.canSpy') }}:</span>
                <span :class="diagnostic.canSpy ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'">
                  {{ diagnostic.canSpy ? t('diplomacy.diagnostic.yes') : t('diplomacy.diagnostic.no') }}
                </span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-muted-foreground">{{ t('diplomacy.diagnostic.canAttack') }}:</span>
                <span :class="diagnostic.canAttack ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'">
                  {{ diagnostic.canAttack ? t('diplomacy.diagnostic.yes') : t('diplomacy.diagnostic.no') }}
                </span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-muted-foreground">{{ t('diplomacy.diagnostic.attackProbability') }}:</span>
                <span class="font-medium">{{ (diagnostic.attackProbability * 100).toFixed(0) }}%</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-muted-foreground">{{ t('diplomacy.diagnostic.nextSpy') }}:</span>
                <span class="font-medium">
                  <template v-if="diagnostic.nextSpyIn > 0">
                    {{
                      t('diplomacy.diagnostic.timeFormat', { min: Math.floor(diagnostic.nextSpyIn / 60), sec: diagnostic.nextSpyIn % 60 })
                    }}
                  </template>
                  <template v-else>
                    <span class="text-green-600">{{ t('diplomacy.diagnostic.anytime') }}</span>
                  </template>
                </span>
              </div>
              <div class="col-span-2 flex items-center gap-2">
                <span class="text-muted-foreground">{{ t('diplomacy.diagnostic.nextAttack') }}:</span>
                <span class="font-medium">
                  <template v-if="diagnostic.nextAttackIn > 0">
                    {{
                      t('diplomacy.diagnostic.timeFormat', {
                        min: Math.floor(diagnostic.nextAttackIn / 60),
                        sec: diagnostic.nextAttackIn % 60
                      })
                    }}
                  </template>
                  <template v-else>
                    <span class="text-green-600">{{ t('diplomacy.diagnostic.anytime') }}</span>
                  </template>
                </span>
              </div>
            </div>
            <div v-if="diagnostic.reasons.length > 0" class="mt-3 p-3 bg-muted rounded text-xs">
              <div class="font-semibold mb-2">{{ t('diplomacy.diagnostic.statusExplanation') }}:</div>
              <ul class="list-disc list-inside space-y-1">
                <li v-for="(reason, idx) in diagnostic.reasons" :key="idx">{{ translateReason(reason) }}</li>
              </ul>
            </div>
          </div>

          <!-- 分页控制 -->
          <Pagination
            v-if="diagnosticTotalPages > 1"
            v-model:page="diagnosticPage"
            :total="filteredDiagnostics.length"
            :items-per-page="DIAGNOSTIC_ITEMS_PER_PAGE"
            :sibling-count="1"
            show-edges
            class="mt-6"
          >
            <PaginationContent>
              <PaginationPrevious>{{ t('pagination.previous') }}</PaginationPrevious>

              <template v-for="(pageNum, index) in diagnosticPageNumbers" :key="index">
                <PaginationItem v-if="typeof pageNum === 'number'" :value="pageNum" :is-active="pageNum === diagnosticPage">
                  {{ pageNum }}
                </PaginationItem>
                <span v-else class="px-2 text-muted-foreground">{{ pageNum }}</span>
              </template>

              <PaginationNext>{{ t('pagination.next') }}</PaginationNext>
            </PaginationContent>
          </Pagination>
        </div>
      </ScrollableDialogContent>
    </Dialog>

    <!-- 搜索框 -->
    <div class="relative">
      <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input v-model="searchQuery" type="text" :placeholder="t('diplomacy.searchPlaceholder')" class="pl-10" />
    </div>

    <!-- 关系状态过滤标签 -->
    <Tabs v-model="activeTab" class="w-full">
      <TabsList class="grid w-full grid-cols-4">
        <TabsTrigger value="all">
          {{ t('diplomacy.tabs.all') }}
          <Badge
            variant="outline"
            class="ml-2 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700"
          >
            {{ allNpcs.length }}
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="friendly">
          {{ t('diplomacy.tabs.friendly') }}
          <Badge
            variant="outline"
            class="ml-2 bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700"
          >
            {{ friendlyNpcs.length }}
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="neutral">
          {{ t('diplomacy.tabs.neutral') }}
          <Badge
            variant="outline"
            class="ml-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600"
          >
            {{ neutralNpcs.length }}
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="hostile">
          {{ t('diplomacy.tabs.hostile') }}
          <Badge
            variant="outline"
            class="ml-2 bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700"
          >
            {{ hostileNpcs.length }}
          </Badge>
        </TabsTrigger>
      </TabsList>

      <!-- 全部NPC -->
      <TabsContent value="all" class="space-y-4 mt-6">
        <Empty v-if="allNpcs.length === 0" class="border rounded-lg">
          <EmptyContent>
            <Users class="h-10 w-10 text-muted-foreground" />
            <EmptyDescription>{{ t('diplomacy.noNpcs') }}</EmptyDescription>
          </EmptyContent>
        </Empty>
        <template v-else>
          <!-- 卡片视图 -->
          <div v-if="viewMode === 'card'" class="grid grid-cols-1 md:grid-cols-2 gap-4 pb-20">
            <NpcRelationCard
              v-for="npc in paginatedAllNpcs"
              :key="npc.id"
              :ref="setCardRef(npc.id)"
              :npc="npc"
              :relation="getRelation(npc.id)"
              :class="{ 'npc-highlight': highlightedNpcId === npc.id }"
            />
          </div>
          <!-- 列表视图 -->
          <div v-else class="space-y-2 pb-20">
            <NpcRelationRow
              v-for="npc in paginatedAllNpcs"
              :key="npc.id"
              :ref="setCardRef(npc.id)"
              :npc="npc"
              :relation="getRelation(npc.id)"
              :class="{ 'npc-highlight': highlightedNpcId === npc.id }"
            />
          </div>
        </template>
      </TabsContent>

      <!-- 友好NPC -->
      <TabsContent value="friendly" class="space-y-4 mt-6">
        <Empty v-if="friendlyNpcs.length === 0" class="border rounded-lg">
          <EmptyContent>
            <Heart class="h-10 w-10 text-muted-foreground" />
            <EmptyDescription>{{ t('diplomacy.noFriendlyNpcs') }}</EmptyDescription>
          </EmptyContent>
        </Empty>
        <template v-else>
          <!-- 卡片视图 -->
          <div v-if="viewMode === 'card'" class="grid grid-cols-1 md:grid-cols-2 gap-4 pb-20">
            <NpcRelationCard
              v-for="npc in paginatedFriendlyNpcs"
              :key="npc.id"
              :ref="setCardRef(npc.id)"
              :npc="npc"
              :relation="getRelation(npc.id)"
              :class="{ 'npc-highlight': highlightedNpcId === npc.id }"
            />
          </div>
          <!-- 列表视图 -->
          <div v-else class="space-y-2 pb-20">
            <NpcRelationRow
              v-for="npc in paginatedFriendlyNpcs"
              :key="npc.id"
              :ref="setCardRef(npc.id)"
              :npc="npc"
              :relation="getRelation(npc.id)"
              :class="{ 'npc-highlight': highlightedNpcId === npc.id }"
            />
          </div>
        </template>
      </TabsContent>

      <!-- 中立NPC -->
      <TabsContent value="neutral" class="space-y-4 mt-6">
        <Empty v-if="neutralNpcs.length === 0" class="border rounded-lg">
          <EmptyContent>
            <Minus class="h-10 w-10 text-muted-foreground" />
            <EmptyDescription>{{ t('diplomacy.noNeutralNpcs') }}</EmptyDescription>
          </EmptyContent>
        </Empty>
        <template v-else>
          <!-- 卡片视图 -->
          <div v-if="viewMode === 'card'" class="grid grid-cols-1 md:grid-cols-2 gap-4 pb-20">
            <NpcRelationCard
              v-for="npc in paginatedNeutralNpcs"
              :key="npc.id"
              :ref="setCardRef(npc.id)"
              :npc="npc"
              :relation="getRelation(npc.id)"
              :class="{ 'npc-highlight': highlightedNpcId === npc.id }"
            />
          </div>
          <!-- 列表视图 -->
          <div v-else class="space-y-2 pb-20">
            <NpcRelationRow
              v-for="npc in paginatedNeutralNpcs"
              :key="npc.id"
              :ref="setCardRef(npc.id)"
              :npc="npc"
              :relation="getRelation(npc.id)"
              :class="{ 'npc-highlight': highlightedNpcId === npc.id }"
            />
          </div>
        </template>
      </TabsContent>

      <!-- 敌对NPC -->
      <TabsContent value="hostile" class="space-y-4 mt-6">
        <Empty v-if="hostileNpcs.length === 0" class="border rounded-lg">
          <EmptyContent>
            <Swords class="h-10 w-10 text-muted-foreground" />
            <EmptyDescription>{{ t('diplomacy.noHostileNpcs') }}</EmptyDescription>
          </EmptyContent>
        </Empty>
        <template v-else>
          <!-- 卡片视图 -->
          <div v-if="viewMode === 'card'" class="grid grid-cols-1 md:grid-cols-2 gap-4 pb-20">
            <NpcRelationCard
              v-for="npc in paginatedHostileNpcs"
              :key="npc.id"
              :ref="setCardRef(npc.id)"
              :npc="npc"
              :relation="getRelation(npc.id)"
              :class="{ 'npc-highlight': highlightedNpcId === npc.id }"
            />
          </div>
          <!-- 列表视图 -->
          <div v-else class="space-y-2 pb-20">
            <NpcRelationRow
              v-for="npc in paginatedHostileNpcs"
              :key="npc.id"
              :ref="setCardRef(npc.id)"
              :npc="npc"
              :relation="getRelation(npc.id)"
              :class="{ 'npc-highlight': highlightedNpcId === npc.id }"
            />
          </div>
        </template>
      </TabsContent>
    </Tabs>

    <!-- 固定底部分页 -->
    <FixedPagination v-model:page="currentPageValue" :total-pages="currentTotalPages" />
  </div>
</template>

<script setup lang="ts">
  import { computed, ref, onMounted, onUnmounted, nextTick } from 'vue'
  import { useRoute } from 'vue-router'
  import { useGameStore } from '@/stores/gameStore'
  import { useNPCStore } from '@/stores/npcStore'
  import { useI18n } from '@/composables/useI18n'
  import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
  import { Badge } from '@/components/ui/badge'
  import { Button } from '@/components/ui/button'
  import { Dialog, DialogDescription, DialogTitle } from '@/components/ui/dialog'
  import ScrollableDialogContent from '@/components/ui/dialog/ScrollableDialogContent.vue'
  import {
    FixedPagination,
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationNext,
    PaginationPrevious
  } from '@/components/ui/pagination'
  import { Input } from '@/components/ui/input'
  import NpcRelationCard from '@/components/NpcRelationCard.vue'
  import NpcRelationRow from '@/components/NpcRelationRow.vue'
  import { RelationStatus } from '@/types/game'
  import type { DiplomaticRelation } from '@/types/game'
  import * as npcBehaviorLogic from '@/logic/npcBehaviorLogic'
  import { Search, Users, Heart, Minus, Swords, Activity, LayoutGrid, List } from 'lucide-vue-next'
  import { Empty, EmptyContent, EmptyDescription } from '@/components/ui/empty'

  const route = useRoute()
  const gameStore = useGameStore()
  const npcStore = useNPCStore()
  const { t } = useI18n()

  const activeTab = ref('all')

  // 视图模式: 'card' | 'list'
  const viewMode = ref<'card' | 'list'>('list')

  // NPC卡片引用 Map（存储组件实例）
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cardRefs = ref<Map<string, any>>(new Map())
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const setCardRef = (npcId: string) => (el: any) => {
    if (el) {
      cardRefs.value.set(npcId, el)
    } else {
      cardRefs.value.delete(npcId)
    }
  }

  // 高亮状态
  const highlightedNpcId = ref<string | null>(null)

  // 搜索功能
  const searchQuery = ref('')

  // NPC诊断功能
  const npcDiagnosticOpen = ref(false)
  const npcDiagnostics = ref<npcBehaviorLogic.NPCDiagnosticInfo[]>([])
  const diagnosticPage = ref(1)
  const diagnosticSearchQuery = ref('')
  const DIAGNOSTIC_ITEMS_PER_PAGE = 10
  const behaviorConfig = computed(() => {
    return npcBehaviorLogic.calculateDynamicBehavior(gameStore.player.points || 0)
  })

  const showNPCDiagnostic = () => {
    const currentTime = Date.now()
    npcDiagnostics.value = npcBehaviorLogic.diagnoseNPCBehavior(npcStore.npcs, gameStore.player, currentTime)
    diagnosticPage.value = 1 // 重置分页
    diagnosticSearchQuery.value = '' // 重置搜索
    npcDiagnosticOpen.value = true
  }

  // 诊断搜索过滤
  const filteredDiagnostics = computed(() => {
    if (!diagnosticSearchQuery.value.trim()) return npcDiagnostics.value
    const query = diagnosticSearchQuery.value.toLowerCase().trim()
    return npcDiagnostics.value.filter(d => d.npcName.toLowerCase().includes(query) || d.npcId.toLowerCase().includes(query))
  })

  // 诊断弹窗分页
  const diagnosticTotalPages = computed(() => Math.ceil(filteredDiagnostics.value.length / DIAGNOSTIC_ITEMS_PER_PAGE))
  const paginatedDiagnostics = computed(() => {
    const start = (diagnosticPage.value - 1) * DIAGNOSTIC_ITEMS_PER_PAGE
    const end = start + DIAGNOSTIC_ITEMS_PER_PAGE
    return filteredDiagnostics.value.slice(start, end)
  })

  const diagnosticPageNumbers = computed(() => getPageNumbers(diagnosticPage.value, diagnosticTotalPages.value))

  // 诊断面板关系状态本地化
  const getLocalizedRelationStatus = (statusKey: string) => {
    switch (statusKey) {
      case 'friendly':
        return t('diplomacy.status.friendly')
      case 'hostile':
        return t('diplomacy.status.hostile')
      case 'neutral':
        return t('diplomacy.status.neutral')
      case 'noRelation':
        return t('diplomacy.diagnostic.noRelation')
      case 'noRelationNeutral':
        return t('diplomacy.diagnostic.noRelationNeutral')
      default:
        return t('diplomacy.status.neutral')
    }
  }

  // 诊断面板关系Badge样式
  const getRelationBadgeVariant = (statusKey: string) => {
    switch (statusKey) {
      case 'friendly':
        return 'default'
      case 'hostile':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  // 翻译诊断原因
  const translateReason = (reason: { key: string; params?: Record<string, string | number> }) => {
    const translationKey = `diplomacy.diagnostic.reasons.${reason.key}`
    return reason.params ? t(translationKey, reason.params) : t(translationKey)
  }

  // 检测并生成NPC盟友
  const initializeNPCAllies = () => {
    const npcs = npcStore.npcs
    if (npcs.length < 2) return // 至少需要2个NPC才能生成盟友关系

    npcs.forEach(npc => {
      // 如果NPC没有盟友列表,初始化为空数组
      if (!npc.allies) {
        npc.allies = []
      }

      // 如果NPC没有盟友,随机生成1-2个盟友
      if (npc.allies.length === 0) {
        const otherNpcs = npcs.filter(n => n.id !== npc.id)
        if (otherNpcs.length === 0) return

        // 随机选择1-2个盟友
        const allyCount = Math.min(Math.floor(Math.random() * 2) + 1, otherNpcs.length)
        const shuffled = [...otherNpcs].sort(() => Math.random() - 0.5)
        const selectedAllies = shuffled.slice(0, allyCount)

        selectedAllies.forEach(ally => {
          // 添加双向盟友关系
          if (!npc.allies!.includes(ally.id)) {
            npc.allies!.push(ally.id)
          }

          // 确保盟友也有盟友列表
          if (!ally.allies) {
            ally.allies = []
          }

          // 确保双向关系
          if (!ally.allies.includes(npc.id)) {
            ally.allies.push(npc.id)
          }
        })
      }
    })
  }

  // 滚动到指定NPC卡片
  const scrollToNpcCard = (npcId: string) => {
    // 切换到"全部"标签
    activeTab.value = 'all'

    // 等待DOM更新后再滚动
    nextTick(() => {
      // 找到目标NPC在列表中的索引
      const npcIndex = allNpcs.value.findIndex(npc => npc.id === npcId)
      if (npcIndex === -1) return

      // 计算目标NPC所在的页面
      const targetPage = Math.floor(npcIndex / ITEMS_PER_PAGE) + 1
      currentPage.value.all = targetPage

      // 再次等待分页更新后滚动到卡片
      nextTick(() => {
        // 从 cardRefs 获取组件实例
        const cardComponent = cardRefs.value.get(npcId)
        const targetEl = cardComponent?.$el as HTMLElement | undefined

        if (targetEl) {
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
          // 添加高亮效果
          highlightedNpcId.value = npcId
          setTimeout(() => {
            highlightedNpcId.value = null
          }, 3000)
        }
      })
    })
  }

  // 组件挂载时初始化NPC盟友
  onMounted(() => {
    initializeNPCAllies()

    // 检查URL query参数，如果有npcId则滚动到该NPC
    const npcIdFromQuery = route.query.npcId as string | undefined
    if (npcIdFromQuery) {
      scrollToNpcCard(npcIdFromQuery)
    }

    // 监听滚动到NPC卡片的事件
    const handleScrollToNpc = (event: Event) => {
      const customEvent = event as CustomEvent<{ npcId: string }>
      scrollToNpcCard(customEvent.detail.npcId)
    }

    document.addEventListener('scrollToNpc', handleScrollToNpc)

    // 清理事件监听器
    onUnmounted(() => {
      document.removeEventListener('scrollToNpc', handleScrollToNpc)
    })
  })

  // 分页状态
  const ITEMS_PER_PAGE = 20
  const currentPage = ref<Record<string, number>>({
    all: 1,
    friendly: 1,
    neutral: 1,
    hostile: 1
  })

  // 获取NPC对玩家的关系（统一使用 npc.relations）
  const getRelation = (npcId: string): DiplomaticRelation | undefined => {
    const npc = npcStore.npcs.find(n => n.id === npcId)
    return npc?.relations?.[gameStore.player.id]
  }

  // 搜索过滤函数
  const matchesSearch = (npc: (typeof npcStore.npcs)[0]) => {
    if (!searchQuery.value.trim()) return true
    const query = searchQuery.value.toLowerCase().trim()
    return npc.name.toLowerCase().includes(query) || npc.id.toLowerCase().includes(query)
  }

  // 按关系状态分类NPC（同时应用搜索过滤）
  const allNpcs = computed(() => npcStore.npcs.filter(matchesSearch))

  const friendlyNpcs = computed(() => {
    return npcStore.npcs.filter(npc => {
      if (!matchesSearch(npc)) return false
      const relation = getRelation(npc.id)
      return relation?.status === RelationStatus.Friendly
    })
  })

  const neutralNpcs = computed(() => {
    return npcStore.npcs.filter(npc => {
      if (!matchesSearch(npc)) return false
      const relation = getRelation(npc.id)
      return !relation || relation.status === RelationStatus.Neutral
    })
  })

  const hostileNpcs = computed(() => {
    return npcStore.npcs.filter(npc => {
      if (!matchesSearch(npc)) return false
      const relation = getRelation(npc.id)
      return relation?.status === RelationStatus.Hostile
    })
  })

  // 分页辅助函数
  const getPaginatedNpcs = (npcs: typeof allNpcs.value, tabKey: string) => {
    const page = currentPage.value[tabKey] || 1
    const start = (page - 1) * ITEMS_PER_PAGE
    const end = start + ITEMS_PER_PAGE
    return npcs.slice(start, end)
  }

  const getTotalPages = (npcs: typeof allNpcs.value) => {
    return Math.ceil(npcs.length / ITEMS_PER_PAGE)
  }

  // 分页后的NPC列表
  const paginatedAllNpcs = computed(() => getPaginatedNpcs(allNpcs.value, 'all'))
  const paginatedFriendlyNpcs = computed(() => getPaginatedNpcs(friendlyNpcs.value, 'friendly'))
  const paginatedNeutralNpcs = computed(() => getPaginatedNpcs(neutralNpcs.value, 'neutral'))
  const paginatedHostileNpcs = computed(() => getPaginatedNpcs(hostileNpcs.value, 'hostile'))

  // 总页数
  const totalPagesAll = computed(() => getTotalPages(allNpcs.value))
  const totalPagesFriendly = computed(() => getTotalPages(friendlyNpcs.value))
  const totalPagesNeutral = computed(() => getTotalPages(neutralNpcs.value))
  const totalPagesHostile = computed(() => getTotalPages(hostileNpcs.value))

  // 生成页码列表（用于诊断弹窗分页UI）
  const getPageNumbers = (currentPageNum: number, totalPages: number) => {
    const pages: number[] = []
    const maxVisible = 3

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      let start = currentPageNum - 1
      let end = currentPageNum + 1

      if (start < 1) {
        start = 1
        end = maxVisible
      }
      if (end > totalPages) {
        end = totalPages
        start = totalPages - maxVisible + 1
      }

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
    }

    return pages
  }

  // 当前标签页的分页数据（用于固定底部分页）
  const currentTotalPages = computed(() => {
    switch (activeTab.value) {
      case 'friendly':
        return totalPagesFriendly.value
      case 'neutral':
        return totalPagesNeutral.value
      case 'hostile':
        return totalPagesHostile.value
      default:
        return totalPagesAll.value
    }
  })

  const currentPageValue = computed({
    get: () => currentPage.value[activeTab.value] || 1,
    set: (val: number) => {
      currentPage.value[activeTab.value] = val
    }
  })
</script>

<style>
  /* NPC卡片高亮动画 - 不使用scoped以便动态添加类生效 */
  .npc-highlight {
    animation: highlight-pulse 1.5s ease-in-out 2 !important;
    box-shadow: 0 0 0 3px var(--primary) !important;
    border-radius: 0.5rem !important;
  }

  @keyframes highlight-pulse {
    0%,
    100% {
      box-shadow: 0 0 0 3px var(--primary);
    }
    50% {
      box-shadow: 0 0 0 6px var(--primary), 0 0 25px var(--primary);
    }
  }
</style>
