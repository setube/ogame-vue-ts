<template>
  <div class="rounded-lg transition-shadow duration-300">
    <div class="p-3 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer" @click="toggleExpand">
      <!-- 桌面端：单行布局 -->
      <div class="hidden sm:flex items-center gap-3">
        <!-- 状态指示器 -->
        <div
          class="w-2 h-2 rounded-full shrink-0"
          :class="{
            'bg-green-500 dark:bg-green-400': status === RelationStatus.Friendly,
            'bg-red-500 dark:bg-red-400': status === RelationStatus.Hostile,
            'bg-gray-400 dark:bg-gray-500': status === RelationStatus.Neutral
          }"
        />

        <!-- 名称和备注 -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <span class="font-medium truncate">{{ npc.name }}</span>
            <span v-if="npc.note" class="text-muted-foreground text-sm truncate">({{ npc.note }})</span>
            <!-- NPC难度等级徽章 -->
            <Badge
              v-if="npc.difficultyLevel"
              :variant="difficultyBadgeVariant"
              class="text-xs"
              :class="difficultyLevelColor"
            >
              Lv.{{ npc.difficultyLevel }}
            </Badge>
          </div>
          <div class="text-xs text-muted-foreground">
            {{ npc.planets.length }} {{ t('diplomacy.planets') }}
            <span v-if="npc.allies && npc.allies.length > 0">· {{ npc.allies.length }} {{ t('diplomacy.allies') }}</span>
          </div>
        </div>

        <!-- 好感度 -->
        <div class="flex items-center gap-2 shrink-0">
          <div class="w-16 h-1.5 bg-muted rounded-full overflow-hidden relative">
            <div v-if="reputation < 0" class="h-full bg-red-500 dark:bg-red-400 absolute right-1/2" :style="{ width: `${Math.abs(reputation) / 2}%` }" />
            <div v-if="reputation > 0" class="h-full bg-green-500 dark:bg-green-400 absolute left-1/2" :style="{ width: `${reputation / 2}%` }" />
            <div class="absolute left-1/2 top-0 bottom-0 w-px bg-border" />
          </div>
          <span class="text-sm font-medium w-10 text-right" :class="reputationColor">{{ reputation > 0 ? '+' : '' }}{{ reputation }}</span>
        </div>

        <!-- 操作按钮 -->
        <div class="flex items-center gap-1 shrink-0">
          <Button variant="ghost" size="icon" class="h-8 w-8" @click.stop="handleGiftResources" :title="t('diplomacy.actions.gift')">
            <Gift class="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" class="h-8 w-8" @click.stop="handleViewPlanets" :title="t('diplomacy.actions.viewPlanets')">
            <Globe class="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            class="h-8 w-8"
            @click.stop="openNoteDialog"
            :title="npc.note ? t('diplomacy.actions.editNote') : t('diplomacy.actions.addNote')"
          >
            <Pencil class="h-4 w-4" />
          </Button>
          <ChevronDown class="h-4 w-4 text-muted-foreground transition-transform" :class="{ 'rotate-180': isExpanded }" />
        </div>
      </div>

      <!-- 移动端：两行布局 -->
      <div class="sm:hidden space-y-2">
        <!-- 第一行：状态、名称、展开箭头 -->
        <div class="flex items-center gap-2">
          <div
            class="w-2 h-2 rounded-full shrink-0"
            :class="{
              'bg-green-500 dark:bg-green-400': status === RelationStatus.Friendly,
              'bg-red-500 dark:bg-red-400': status === RelationStatus.Hostile,
              'bg-gray-400 dark:bg-gray-500': status === RelationStatus.Neutral
            }"
          />
          <div class="flex-1 min-w-0 flex items-center gap-1 flex-wrap">
            <span class="font-medium truncate">{{ npc.name }}</span>
            <span v-if="npc.note" class="text-muted-foreground text-sm">({{ npc.note }})</span>
            <!-- NPC难度等级徽章 (移动端) -->
            <Badge
              v-if="npc.difficultyLevel"
              :variant="difficultyBadgeVariant"
              class="text-xs"
              :class="difficultyLevelColor"
            >
              Lv.{{ npc.difficultyLevel }}
            </Badge>
          </div>
          <ChevronDown class="h-4 w-4 text-muted-foreground transition-transform shrink-0" :class="{ 'rotate-180': isExpanded }" />
        </div>

        <!-- 第二行：星球数、好感度、操作按钮 -->
        <div class="flex items-center justify-between">
          <div class="text-xs text-muted-foreground">
            {{ npc.planets.length }} {{ t('diplomacy.planets') }}
            <span v-if="npc.allies && npc.allies.length > 0">· {{ npc.allies.length }} {{ t('diplomacy.allies') }}</span>
          </div>
          <div class="flex items-center gap-1">
            <!-- 好感度数值 -->
            <span class="text-xs font-medium mr-1" :class="reputationColor">{{ reputation > 0 ? '+' : '' }}{{ reputation }}</span>
            <!-- 操作按钮 -->
            <Button variant="ghost" size="icon" class="h-7 w-7" @click.stop="handleGiftResources" :title="t('diplomacy.actions.gift')">
              <Gift class="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" class="h-7 w-7" @click.stop="handleViewPlanets" :title="t('diplomacy.actions.viewPlanets')">
              <Globe class="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              class="h-7 w-7"
              @click.stop="openNoteDialog"
              :title="npc.note ? t('diplomacy.actions.editNote') : t('diplomacy.actions.addNote')"
            >
              <Pencil class="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>

    <!-- 展开详情 -->
    <div v-if="isExpanded" class="ml-5 pl-3 border-l-2 border-muted py-2 space-y-2">
      <!-- 盟友信息 -->
      <div v-if="npc.allies && npc.allies.length > 0" class="flex items-center gap-2 flex-wrap">
        <span class="text-xs text-muted-foreground">{{ t('diplomacy.alliedWith') }}:</span>
        <Badge
          v-for="allyId in npc.allies.slice(0, 5)"
          :key="allyId"
          variant="outline"
          class="text-xs cursor-pointer hover:bg-accent transition-colors"
          :class="getAllyBorderClass(allyId)"
          @click="scrollToAlly(allyId)"
        >
          {{ getAllyName(allyId) }}
        </Badge>
        <Badge v-if="npc.allies.length > 5" variant="outline" class="text-xs">+{{ npc.allies.length - 5 }} {{ t('diplomacy.more') }}</Badge>
      </div>

      <!-- 最近活动 -->
      <div v-if="recentEvent" class="flex items-center gap-2 text-xs">
        <span class="text-muted-foreground">{{ t('diplomacy.lastEvent') }}:</span>
        <component :is="getEventIcon(recentEvent.reason)" class="h-3 w-3" />
        <span>{{ getEventText(recentEvent.reason) }}</span>
        <span class="text-muted-foreground">
          {{ formatRelativeTime((Date.now() - recentEvent.timestamp) / 1000, t) }}{{ t('diplomacy.ago') }}
        </span>
      </div>
    </div>

    <!-- 备注编辑对话框 -->
    <Dialog v-model:open="noteDialogOpen">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{{ npc.note ? t('diplomacy.actions.editNote') : t('diplomacy.actions.addNote') }}</DialogTitle>
          <DialogDescription class="sr-only">{{ t('diplomacy.note') }}</DialogDescription>
        </DialogHeader>
        <div class="py-4">
          <Input v-model="noteInput" :placeholder="t('diplomacy.notePlaceholder')" @keyup.enter="saveNote" />
        </div>
        <DialogFooter>
          <Button variant="outline" @click="noteDialogOpen = false">{{ t('common.cancel') }}</Button>
          <Button @click="saveNote">{{ t('common.save') }}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { useNPCStore } from '@/stores/npcStore'
  import { useGameStore } from '@/stores/gameStore'
  import { useI18n } from '@/composables/useI18n'
  import { Badge } from '@/components/ui/badge'
  import { Button } from '@/components/ui/button'
  import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
  import { Input } from '@/components/ui/input'
  import { Gift, Globe, Pencil, ChevronDown, Sword, Eye, Trash2 } from 'lucide-vue-next'
  import { RelationStatus, DiplomaticEventType } from '@/types/game'
  import type { DiplomaticRelation, NPC } from '@/types/game'
  import { formatRelativeTime } from '@/utils/format'

  const props = defineProps<{
    npc: NPC
    relation?: DiplomaticRelation
  }>()

  const router = useRouter()
  const npcStore = useNPCStore()
  const gameStore = useGameStore()
  const { t } = useI18n()

  // 展开状态
  const isExpanded = ref(false)
  const toggleExpand = () => {
    isExpanded.value = !isExpanded.value
  }

  // 备注对话框状态
  const noteDialogOpen = ref(false)
  const noteInput = ref('')

  const openNoteDialog = () => {
    noteInput.value = props.npc.note || ''
    noteDialogOpen.value = true
  }

  const saveNote = () => {
    const npc = npcStore.npcs.find(n => n.id === props.npc.id)
    if (npc) {
      npc.note = noteInput.value.trim() || undefined
    }
    noteDialogOpen.value = false
  }

  // 好感度值
  const reputation = computed(() => props.relation?.reputation || 0)

  // 关系状态
  const status = computed(() => props.relation?.status || RelationStatus.Neutral)

  // 好感度颜色
  const reputationColor = computed(() => {
    if (reputation.value >= 20) return 'text-green-600 dark:text-green-400'
    if (reputation.value <= -20) return 'text-red-600 dark:text-red-400'
    return 'text-muted-foreground'
  })

  // NPC难度等级颜色
  const difficultyLevelColor = computed(() => {
    const level = props.npc.difficultyLevel
    if (!level) return 'text-muted-foreground'
    if (level <= 1) return 'text-green-600 dark:text-green-400' // 新手
    if (level <= 2) return 'text-lime-600 dark:text-lime-400' // 简单
    if (level <= 3) return 'text-yellow-600 dark:text-yellow-400' // 普通
    if (level <= 4) return 'text-orange-600 dark:text-orange-400' // 困难
    if (level <= 5) return 'text-red-600 dark:text-red-400' // 专家
    if (level <= 6) return 'text-purple-600 dark:text-purple-400' // 大师
    return 'text-pink-600 dark:text-pink-400' // 传奇及以上
  })

  // NPC难度等级Badge样式
  const difficultyBadgeVariant = computed((): 'default' | 'secondary' | 'destructive' | 'outline' => {
    const level = props.npc.difficultyLevel
    if (!level) return 'outline'
    if (level <= 2) return 'secondary'
    if (level <= 4) return 'default'
    return 'destructive'
  })

  // 最近的外交事件
  const recentEvent = computed(() => {
    if (!props.relation?.history || props.relation.history.length === 0) return null
    return props.relation.history[props.relation.history.length - 1]
  })

  // 获取盟友名称
  const getAllyName = (allyId: string) => {
    const ally = npcStore.npcs.find(n => n.id === allyId)
    if (!ally) return allyId.substring(0, 8)
    return ally.note ? `${ally.name}(${ally.note})` : ally.name
  }

  // 获取盟友边框样式
  const getAllyBorderClass = (allyId: string) => {
    const ally = npcStore.npcs.find(n => n.id === allyId)
    if (!ally) return ''

    const allyRelation = ally.relations?.[gameStore.player.id]
    if (!allyRelation) return ''

    switch (allyRelation.status) {
      case RelationStatus.Friendly:
        return 'border-green-500 dark:border-green-400'
      case RelationStatus.Hostile:
        return 'border-red-500 dark:border-red-400'
      default:
        return ''
    }
  }

  // 获取事件图标
  const getEventIcon = (eventType: string) => {
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
      default:
        return Gift
    }
  }

  // 获取事件文本
  const getEventText = (eventType: string) => {
    switch (eventType) {
      case DiplomaticEventType.GiftResources:
        return t('diplomacy.events.gift')
      case DiplomaticEventType.Attack:
        return t('diplomacy.events.attack')
      case DiplomaticEventType.AllyAttacked:
        return t('diplomacy.events.allyAttacked')
      case DiplomaticEventType.Spy:
        return t('diplomacy.events.spy')
      case DiplomaticEventType.StealDebris:
        return t('diplomacy.events.stealDebris')
      default:
        return eventType
    }
  }

  // 赠送资源
  const handleGiftResources = () => {
    if (props.npc.planets.length > 0) {
      const targetPlanet = props.npc.planets[0]
      if (!targetPlanet) return

      router.push({
        path: '/fleet',
        query: {
          galaxy: targetPlanet.position.galaxy,
          system: targetPlanet.position.system,
          position: targetPlanet.position.position,
          gift: '1'
        }
      })
    }
  }

  // 查看星球
  const handleViewPlanets = () => {
    if (props.npc.planets.length > 0) {
      const targetPlanet = props.npc.planets[0]
      if (!targetPlanet) return

      router.push({
        path: '/galaxy',
        query: {
          galaxy: targetPlanet.position.galaxy,
          system: targetPlanet.position.system,
          highlightNpc: props.npc.id
        }
      })
    }
  }

  // 滚动到盟友卡片
  const scrollToAlly = (allyId: string) => {
    const event = new CustomEvent('scrollToNpc', { detail: { npcId: allyId }, bubbles: true })
    document.dispatchEvent(event)
  }
</script>
