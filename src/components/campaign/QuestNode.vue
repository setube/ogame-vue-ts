<template>
  <div
    class="quest-node"
    :class="[statusClass, { 'cursor-pointer': isClickable, 'cursor-not-allowed': !isClickable }]"
    @click="handleClick"
  >
    <!-- 节点主体 -->
    <div
      :class="[
        'relative w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300',
        'border-2 shadow-lg',
        nodeBackgroundClass
      ]"
    >
      <!-- Boss标记 -->
      <div v-if="quest.isBoss" class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
        <Skull class="w-3 h-3 text-white" />
      </div>

      <!-- 分支标记 -->
      <div v-if="quest.isBranch" class="absolute -top-1 -left-1 w-5 h-5 bg-blue-500 dark:bg-blue-400 rounded-full flex items-center justify-center">
        <GitBranch class="w-3 h-3 text-white" />
      </div>

      <!-- 状态图标 -->
      <component :is="statusIcon" :class="['w-6 h-6', iconClass]" />

      <!-- 进度环 -->
      <svg v-if="status === QuestStatus.Active && progress > 0" class="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 56 56">
        <circle cx="28" cy="28" r="24" fill="none" stroke="currentColor" stroke-width="3" class="text-primary/30" />
        <circle
          cx="28"
          cy="28"
          r="24"
          fill="none"
          stroke="currentColor"
          stroke-width="3"
          class="text-primary"
          :stroke-dasharray="`${progress * 1.51} 151`"
        />
      </svg>
    </div>

    <!-- 节点标题 -->
    <div class="mt-2 text-center max-w-20">
      <p :class="['text-xs font-medium truncate', titleClass]">
        {{ t(quest.titleKey) }}
      </p>
      <p v-if="status === QuestStatus.Active" class="text-[10px] text-primary">{{ progress }}%</p>
    </div>

    <!-- 脉冲动画（可用状态） -->
    <div v-if="status === QuestStatus.Available" class="absolute inset-0 w-14 h-14 rounded-full animate-ping bg-blue-400/30 dark:bg-blue-300/30" />
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { useI18n } from '@/composables/useI18n'
  import { QuestStatus, type CampaignQuestConfig, type PlayerCampaignProgress } from '@/types/game'
  import { getQuestStatus, calculateQuestProgress } from '@/logic/campaignLogic'
  import { Lock, Circle, CheckCircle2, Play, Skull, GitBranch } from 'lucide-vue-next'

  const props = defineProps<{
    quest: CampaignQuestConfig
    progress: PlayerCampaignProgress | undefined
  }>()

  const emit = defineEmits<{
    select: [questId: string]
  }>()

  const { t } = useI18n()

  // 计算任务状态
  const status = computed(() => {
    if (!props.progress) return QuestStatus.Locked
    return getQuestStatus(props.progress, props.quest.id)
  })

  // 计算任务进度百分比
  const progress = computed(() => {
    if (!props.progress || status.value !== QuestStatus.Active) return 0
    return calculateQuestProgress(props.progress, props.quest.id)
  })

  // 是否可点击
  const isClickable = computed(() => {
    return status.value !== QuestStatus.Locked
  })

  // 状态样式类
  const statusClass = computed(() => {
    switch (status.value) {
      case QuestStatus.Completed:
        return 'quest-completed'
      case QuestStatus.Active:
        return 'quest-active'
      case QuestStatus.Available:
        return 'quest-available'
      default:
        return 'quest-locked'
    }
  })

  // 节点背景样式
  const nodeBackgroundClass = computed(() => {
    switch (status.value) {
      case QuestStatus.Completed:
        return 'bg-green-500/20 border-green-500'
      case QuestStatus.Active:
        return 'bg-primary/20 border-primary'
      case QuestStatus.Available:
        return 'bg-blue-500/10 border-blue-400 hover:border-blue-300 hover:bg-blue-500/20'
      default:
        return 'bg-muted/50 border-muted-foreground/30'
    }
  })

  // 状态图标
  const statusIcon = computed(() => {
    switch (status.value) {
      case QuestStatus.Completed:
        return CheckCircle2
      case QuestStatus.Active:
        return Play
      case QuestStatus.Available:
        return Circle
      default:
        return Lock
    }
  })

  // 图标样式
  const iconClass = computed(() => {
    switch (status.value) {
      case QuestStatus.Completed:
        return 'text-green-500'
      case QuestStatus.Active:
        return 'text-primary'
      case QuestStatus.Available:
        return 'text-blue-400'
      default:
        return 'text-muted-foreground/50'
    }
  })

  // 标题样式
  const titleClass = computed(() => {
    switch (status.value) {
      case QuestStatus.Completed:
        return 'text-green-500'
      case QuestStatus.Active:
        return 'text-primary'
      case QuestStatus.Available:
        return 'text-foreground'
      default:
        return 'text-muted-foreground/50'
    }
  })

  // 处理点击
  const handleClick = () => {
    if (isClickable.value) {
      emit('select', props.quest.id)
    }
  }
</script>

<style scoped>
  .quest-node {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .quest-available .quest-node:hover {
    transform: scale(1.05);
  }

  @keyframes pulse-glow {
    0%,
    100% {
      box-shadow: 0 0 5px 2px rgba(59, 130, 246, 0.3);
    }
    50% {
      box-shadow: 0 0 15px 5px rgba(59, 130, 246, 0.5);
    }
  }

  .quest-available > div:first-child {
    animation: pulse-glow 2s ease-in-out infinite;
  }
</style>
