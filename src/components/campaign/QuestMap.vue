<template>
  <div class="quest-map-container relative">
    <!-- 可缩放的地图区域 -->
    <div
      ref="mapContainer"
      class="quest-map relative overflow-auto rounded-lg border bg-card/50 backdrop-blur-sm"
      :style="{ maxHeight: '450px' }"
    >
      <!-- 可缩放内容包装器 -->
      <div
        class="map-content origin-top-left transition-transform duration-200"
        :style="{ transform: `scale(${zoomLevel})`, minWidth: calculatedMapWidth + 'px', minHeight: calculatedMapHeight + 'px' }"
      >
        <!-- SVG连接线 - 位置与节点容器对齐 -->
        <svg
          class="absolute pointer-events-none"
          :style="{ left: 0, top: 0, width: calculatedMapWidth + 'px', height: calculatedMapHeight + 'px' }"
          :viewBox="`0 0 ${calculatedMapWidth} ${calculatedMapHeight}`"
        >
          <defs>
            <!-- 渐变定义 - 垂直方向 -->
            <linearGradient id="line-gradient-active" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style="stop-color: hsl(var(--primary)); stop-opacity: 0.5" />
              <stop offset="100%" style="stop-color: hsl(var(--primary)); stop-opacity: 1" />
            </linearGradient>
            <linearGradient id="line-gradient-locked" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style="stop-color: hsl(var(--muted-foreground)); stop-opacity: 0.2" />
              <stop offset="100%" style="stop-color: hsl(var(--muted-foreground)); stop-opacity: 0.3" />
            </linearGradient>
            <linearGradient id="line-gradient-completed" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style="stop-color: rgb(34, 197, 94); stop-opacity: 0.5" />
              <stop offset="100%" style="stop-color: rgb(34, 197, 94); stop-opacity: 1" />
            </linearGradient>

            <!-- 发光滤镜 -->
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <!-- 连接线 -->
          <g>
            <template v-for="connection in questConnections" :key="connection.id">
              <path
                :d="connection.path"
                fill="none"
                :stroke="getConnectionStroke(connection)"
                stroke-width="2"
                :stroke-dasharray="connection.isLocked ? '5,5' : 'none'"
                :filter="connection.isActive ? 'url(#glow)' : 'none'"
                class="transition-all duration-300"
              />
              <!-- 流动动画点（激活状态） -->
              <circle v-if="connection.isActive" r="3" fill="#CDD1D7" class="animate-flow">
                <animateMotion dur="2s" repeatCount="indefinite" :path="connection.path" />
              </circle>
            </template>
          </g>
        </svg>

        <!-- 任务节点 -->
        <div class="relative" :style="{ width: calculatedMapWidth + 'px', height: calculatedMapHeight + 'px' }">
          <div v-for="quest in quests" :key="quest.id" class="absolute transition-all duration-300" :style="getNodeStyle(quest.id)">
            <QuestNode :quest="quest" :progress="progress" @select="handleQuestSelect" />
          </div>
        </div>
      </div>
    </div>

    <!-- 地图控制 -->
    <div class="absolute bottom-4 right-4 flex gap-2">
      <Button variant="outline" size="icon-sm" @click="zoomIn">
        <ZoomIn class="h-4 w-4" />
      </Button>
      <Button variant="outline" size="icon-sm" @click="zoomOut">
        <ZoomOut class="h-4 w-4" />
      </Button>
      <Button variant="outline" size="icon-sm" @click="resetView">
        <Maximize2 class="h-4 w-4" />
      </Button>
    </div>

    <!-- 图例 -->
    <div class="absolute top-4 left-4 flex flex-wrap gap-3 text-xs">
      <div class="flex items-center gap-1">
        <div class="w-3 h-3 rounded-full bg-green-500 dark:bg-green-400" />
        <span class="text-muted-foreground">{{ t('campaign.completed') }}</span>
      </div>
      <div class="flex items-center gap-1">
        <div class="w-3 h-3 rounded-full bg-primary" />
        <span class="text-muted-foreground">{{ t('campaign.inProgress') }}</span>
      </div>
      <div class="flex items-center gap-1">
        <div class="w-3 h-3 rounded-full bg-blue-400 dark:bg-blue-300 animate-pulse" />
        <span class="text-muted-foreground">{{ t('campaign.available') }}</span>
      </div>
      <div class="flex items-center gap-1">
        <div class="w-3 h-3 rounded-full bg-muted-foreground/30" />
        <span class="text-muted-foreground">{{ t('campaign.locked') }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, nextTick } from 'vue'
  import { useI18n } from '@/composables/useI18n'
  import { QuestStatus, type CampaignQuestConfig, type PlayerCampaignProgress } from '@/types/game'
  import { getQuestStatus } from '@/logic/campaignLogic'
  import { Button } from '@/components/ui/button'
  import QuestNode from './QuestNode.vue'
  import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-vue-next'

  const props = defineProps<{
    quests: CampaignQuestConfig[]
    progress: PlayerCampaignProgress | undefined
  }>()

  const emit = defineEmits<{
    selectQuest: [questId: string]
  }>()

  const { t } = useI18n()

  // 地图容器引用
  const mapContainer = ref<HTMLElement | null>(null)

  // 布局参数 - 从左到右的工作流布局
  const nodeSize = 56 // 节点实际尺寸 (w-14 = 56px)
  const nodeRadius = 28 // 节点半径
  const horizontalGap = 120 // 水平间距（层级之间，包含连线空间）
  const verticalGap = 40 // 垂直间距（同一层级内）
  const paddingX = 80
  const paddingY = 60

  // 缩放级别
  const zoomLevel = ref(1)

  // 计算工作流布局的节点位置（从左到右）
  const nodePositions = computed(() => {
    const positions: Record<string, { x: number; y: number; level: number; index: number }> = {}
    const levels: Record<number, CampaignQuestConfig[]> = {}

    // 根据任务的依赖关系计算层级
    const calculateLevel = (quest: CampaignQuestConfig, visited: Set<string> = new Set()): number => {
      if (visited.has(quest.id)) return 0
      visited.add(quest.id)

      if (!quest.requiredQuestIds || quest.requiredQuestIds.length === 0) {
        return 0
      }

      let maxParentLevel = -1
      quest.requiredQuestIds.forEach(reqId => {
        const parentQuest = props.quests.find(q => q.id === reqId)
        if (parentQuest) {
          const parentLevel = calculateLevel(parentQuest, visited)
          maxParentLevel = Math.max(maxParentLevel, parentLevel)
        }
      })

      return maxParentLevel + 1
    }

    // 为每个任务计算层级
    props.quests.forEach(quest => {
      const level = calculateLevel(quest)
      if (!levels[level]) {
        levels[level] = []
      }
      levels[level].push(quest)
    })

    // 按 order 排序每个层级的任务
    Object.keys(levels).forEach(levelKey => {
      const level = parseInt(levelKey)
      const questsAtLevel = levels[level]
      if (questsAtLevel) {
        questsAtLevel.sort((a, b) => a.order - b.order)
      }
    })

    // 计算每个任务的位置（从左到右布局）
    const levelKeys = Object.keys(levels)
      .map(Number)
      .sort((a, b) => a - b)

    levelKeys.forEach(level => {
      const questsInLevel = levels[level]
      if (!questsInLevel) return

      questsInLevel.forEach((quest, index) => {
        // 水平位置（层级决定X坐标）
        const x = paddingX + level * (nodeSize + horizontalGap) + nodeRadius

        // 垂直位置（同层级内的索引决定Y坐标）
        const startY = paddingY + index * (nodeSize + verticalGap)
        const y = startY + nodeRadius

        positions[quest.id] = { x, y, level, index }
      })
    })

    return positions
  })

  // 计算地图尺寸
  const calculatedMapWidth = computed(() => {
    const positions = Object.values(nodePositions.value)
    if (positions.length === 0) return 400
    const maxX = Math.max(...positions.map(p => p.x))
    return Math.max(maxX + paddingX + nodeRadius, 400)
  })

  const calculatedMapHeight = computed(() => {
    const positions = Object.values(nodePositions.value)
    if (positions.length === 0) return 300
    const maxY = Math.max(...positions.map(p => p.y))
    return Math.max(maxY + paddingY + nodeRadius, 300)
  })

  // 计算连接线
  interface Connection {
    id: string
    from: string
    to: string
    path: string
    isLocked: boolean
    isActive: boolean
    isCompleted: boolean
  }

  const questConnections = computed<Connection[]>(() => {
    const connections: Connection[] = []

    props.quests.forEach(quest => {
      if (quest.requiredQuestIds) {
        quest.requiredQuestIds.forEach(requiredId => {
          const fromPos = nodePositions.value[requiredId]
          const toPos = nodePositions.value[quest.id]

          if (fromPos && toPos) {
            // 从节点右边缘出发，到下一个节点左边缘
            const startX = fromPos.x + nodeRadius
            const startY = fromPos.y
            const endX = toPos.x - nodeRadius
            const endY = toPos.y

            // 使用水平控制点创建平滑的S型曲线
            const controlOffset = (endX - startX) / 2
            const path = `M ${startX} ${startY} C ${startX + controlOffset} ${startY}, ${endX - controlOffset} ${endY}, ${endX} ${endY}`

            // 获取状态
            const fromQuest = props.quests.find(q => q.id === requiredId)
            const fromStatus = props.progress && fromQuest ? getQuestStatus(props.progress, fromQuest.id) : QuestStatus.Locked
            const toStatus = props.progress ? getQuestStatus(props.progress, quest.id) : QuestStatus.Locked

            connections.push({
              id: `${requiredId}-${quest.id}`,
              from: requiredId,
              to: quest.id,
              path,
              isLocked: toStatus === QuestStatus.Locked,
              isActive: toStatus === QuestStatus.Active || toStatus === QuestStatus.Available,
              isCompleted: fromStatus === QuestStatus.Completed && toStatus === QuestStatus.Completed
            })
          }
        })
      }
    })

    return connections
  })

  // 获取连接线颜色
  const getConnectionStroke = (connection: Connection): string => {
    if (connection.isCompleted) {
      return 'rgb(34, 197, 94)'
    }
    if (connection.isActive) {
      return 'hsl(var(--primary))'
    }
    // 锁定状态使用更明显的灰色
    return 'rgba(156, 163, 175, 0.5)'
  }

  // 获取节点样式（处理 undefined 情况）
  const getNodeStyle = (questId: string) => {
    const pos = nodePositions.value[questId]
    if (!pos) {
      return { left: '0px', top: '0px' }
    }
    return {
      left: pos.x - nodeRadius + 'px',
      top: pos.y - nodeRadius + 'px'
    }
  }

  // 缩放控制
  const zoomIn = () => {
    zoomLevel.value = Math.min(zoomLevel.value * 1.2, 2)
  }

  const zoomOut = () => {
    zoomLevel.value = Math.max(zoomLevel.value / 1.2, 0.5)
  }

  const resetView = () => {
    zoomLevel.value = 1
    if (mapContainer.value) {
      mapContainer.value.scrollTo({ left: 0, top: 0, behavior: 'smooth' })
    }
  }

  // 处理任务选择
  const handleQuestSelect = (questId: string) => {
    emit('selectQuest', questId)
  }

  // 找到当前活动或可用的任务
  const findActiveQuest = (): string | null => {
    // 优先找 Active 状态的任务
    const activeQuest = props.quests.find(quest => {
      if (!props.progress) return false
      return getQuestStatus(props.progress, quest.id) === QuestStatus.Active
    })
    if (activeQuest) return activeQuest.id

    // 其次找第一个 Available 状态的任务
    const availableQuest = props.quests.find(quest => {
      if (!props.progress) return false
      return getQuestStatus(props.progress, quest.id) === QuestStatus.Available
    })
    if (availableQuest) return availableQuest.id

    return null
  }

  // 滚动到指定任务位置（居中显示）
  const scrollToQuest = (questId: string) => {
    const container = mapContainer.value
    if (!container) return

    const pos = nodePositions.value[questId]
    if (!pos) return

    // 计算需要滚动的位置，使任务节点居中
    const containerWidth = container.clientWidth
    const containerHeight = container.clientHeight

    // 考虑缩放比例
    const scaledX = pos.x * zoomLevel.value
    const scaledY = pos.y * zoomLevel.value

    // 滚动到节点居中的位置
    const scrollLeft = Math.max(0, scaledX - containerWidth / 2)
    const scrollTop = Math.max(0, scaledY - containerHeight / 2)

    container.scrollTo({
      left: scrollLeft,
      top: scrollTop,
      behavior: 'smooth'
    })
  }

  // 组件挂载时滚动到活动任务
  onMounted(async () => {
    await nextTick()
    const activeQuestId = findActiveQuest()
    if (activeQuestId) {
      scrollToQuest(activeQuestId)
    }
  })
</script>

<style scoped>
  .quest-map-container {
    position: relative;
  }

  .quest-map {
    min-height: 300px;
  }

  .animate-flow {
    filter: drop-shadow(0 0 3px hsl(var(--primary)));
  }

  /* 星空背景效果 */
  .quest-map::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
      radial-gradient(circle at 80% 70%, rgba(255, 255, 255, 0.02) 1px, transparent 1px),
      radial-gradient(circle at 40% 80%, rgba(255, 255, 255, 0.02) 1px, transparent 1px),
      radial-gradient(circle at 60% 20%, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
    background-size: 100px 100px, 150px 150px, 200px 200px, 120px 120px;
    pointer-events: none;
  }
</style>
