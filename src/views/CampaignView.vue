<template>
  <div class="container mx-auto px-4 py-6 max-w-6xl">
    <!-- 战役标题和总进度 -->
    <Card class="mb-6">
      <CardHeader>
        <div class="flex items-center justify-between">
          <div>
            <CardTitle class="flex items-center gap-2 text-xl">
              <Scroll class="h-6 w-6 text-primary" />
              {{ t('campaign.name') }}
            </CardTitle>
            <CardDescription class="mt-1">{{ t('campaign.description') }}</CardDescription>
          </div>
          <div class="text-right">
            <div class="text-2xl font-bold text-primary">{{ totalProgress }}%</div>
            <div class="text-xs text-muted-foreground">{{ t('campaign.totalProgress') }}</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Progress :model-value="totalProgress" class="h-3" />
        <div class="flex justify-between mt-2 text-xs text-muted-foreground">
          <span>{{ completedQuestCount }} / {{ totalQuestCount }} {{ t('campaign.questsCompleted') }}</span>
          <span>{{ t('campaign.chapter') }} {{ currentChapter }}</span>
        </div>
      </CardContent>
    </Card>

    <!-- 章节选择标签 -->
    <Tabs v-model="activeChapter" class="mb-6">
      <TabsList class="grid w-full" :style="{ gridTemplateColumns: `repeat(${chapters.length}, 1fr)` }">
        <TabsTrigger
          v-for="chapter in chapters"
          :key="chapter.id"
          :value="chapter.number.toString()"
          :disabled="chapter.number > currentChapter"
          class="relative"
        >
          <span class="hidden sm:inline">{{ t(chapter.titleKey) }}</span>
          <span class="sm:hidden">{{ chapter.number }}</span>
          <Badge
            v-if="getChapterProgress(chapter.number) === 100"
            variant="default"
            class="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]"
          >
            <Check class="h-3 w-3" />
          </Badge>
        </TabsTrigger>
      </TabsList>

      <!-- 章节内容 -->
      <TabsContent v-for="chapter in chapters" :key="chapter.id" :value="chapter.number.toString()" class="mt-4">
        <!-- 章节背景故事 -->
        <Card class="mb-4 bg-gradient-to-r from-primary/5 to-transparent">
          <CardContent class="py-4">
            <p class="text-sm text-muted-foreground italic">{{ t(chapter.backgroundStoryKey) }}</p>
          </CardContent>
        </Card>

        <!-- 任务地图 -->
        <QuestMap :quests="getChapterQuests(chapter.number)" :progress="campaignProgress" @select-quest="handleQuestSelect" />
      </TabsContent>
    </Tabs>

    <!-- 任务详情面板 -->
    <Card v-if="selectedQuest" class="mt-6">
      <CardHeader>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div :class="['h-10 w-10 rounded-full flex items-center justify-center', getQuestStatusClass(selectedQuest.id)]">
              <component :is="getQuestStatusIcon(selectedQuest.id)" class="h-5 w-5" />
            </div>
            <div>
              <CardTitle class="flex items-center gap-2">
                {{ t(selectedQuest.titleKey) }}
                <Badge v-if="selectedQuest.isBoss" variant="destructive">BOSS</Badge>
                <Badge v-if="selectedQuest.isBranch" variant="secondary">{{ t('campaign.branch') }}</Badge>
              </CardTitle>
              <CardDescription>{{ t(selectedQuest.descriptionKey) }}</CardDescription>
            </div>
          </div>
          <Button v-if="canStartQuest(selectedQuest.id)" @click="handleStartQuest(selectedQuest.id)">
            <Play class="h-4 w-4 mr-2" />
            {{ t('campaign.startQuest') }}
          </Button>
          <Button v-else-if="canClaimRewards(selectedQuest.id)" @click="handleClaimRewards(selectedQuest.id)" variant="default">
            <Gift class="h-4 w-4 mr-2" />
            {{ t('campaign.claimRewards') }}
          </Button>
        </div>
      </CardHeader>
      <CardContent class="space-y-6">
        <!-- 任务目标 -->
        <div>
          <h4 class="font-semibold mb-3 flex items-center gap-2">
            <Target class="h-4 w-4" />
            {{ t('campaign.objectives') }}
          </h4>
          <div class="space-y-3">
            <div v-for="objective in selectedQuest.objectives" :key="objective.id" class="flex items-center gap-3">
              <div
                :class="[
                  'h-6 w-6 rounded-full flex items-center justify-center text-xs',
                  isObjectiveCompleted(selectedQuest.id, objective.id)
                    ? 'bg-green-500 dark:bg-green-400 text-white'
                    : 'bg-muted text-muted-foreground'
                ]"
              >
                <Check v-if="isObjectiveCompleted(selectedQuest.id, objective.id)" class="h-4 w-4" />
                <span v-else>{{ getObjectiveProgress(selectedQuest.id, objective.id) }}</span>
              </div>
              <div class="flex-1">
                <div class="text-sm">{{ t(objective.descriptionKey) }}</div>
                <Progress
                  :model-value="(getObjectiveProgress(selectedQuest.id, objective.id) / objective.required) * 100"
                  class="h-1.5 mt-1"
                />
              </div>
              <span class="text-xs text-muted-foreground">
                {{ getObjectiveProgress(selectedQuest.id, objective.id) }} / {{ objective.required }}
              </span>
            </div>
          </div>
        </div>

        <!-- 任务奖励 -->
        <div>
          <h4 class="font-semibold mb-3 flex items-center gap-2">
            <Gift class="h-4 w-4" />
            {{ t('campaign.rewards') }}
          </h4>
          <div class="flex flex-wrap gap-3">
            <Badge v-if="selectedQuest.rewards.resources?.metal" variant="outline" class="gap-1">
              <ResourceIcon type="metal" size="sm" />
              {{ formatNumber(selectedQuest.rewards.resources.metal) }}
            </Badge>
            <Badge v-if="selectedQuest.rewards.resources?.crystal" variant="outline" class="gap-1">
              <ResourceIcon type="crystal" size="sm" />
              {{ formatNumber(selectedQuest.rewards.resources.crystal) }}
            </Badge>
            <Badge v-if="selectedQuest.rewards.resources?.deuterium" variant="outline" class="gap-1">
              <ResourceIcon type="deuterium" size="sm" />
              {{ formatNumber(selectedQuest.rewards.resources.deuterium) }}
            </Badge>
            <Badge v-if="selectedQuest.rewards.darkMatter" variant="outline" class="gap-1">
              <ResourceIcon type="darkMatter" size="sm" />
              {{ formatNumber(selectedQuest.rewards.darkMatter) }}
            </Badge>
            <Badge v-if="selectedQuest.rewards.points" variant="secondary" class="gap-1">
              <Star class="h-3 w-3" />
              +{{ formatNumber(selectedQuest.rewards.points) }} {{ t('common.points') }}
            </Badge>
            <Badge v-for="(count, shipType) in selectedQuest.rewards.ships" :key="shipType" variant="outline" class="gap-1">
              <Rocket class="h-3 w-3" />
              {{ count }}x {{ getShipName(shipType) }}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 剧情对话框 -->
    <StoryDialog v-if="showStoryDialog" :dialogues="currentDialogues" @close="handleDialogueClose" @choice="handleDialogueChoice" />
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, watch } from 'vue'
  import { useI18n } from '@/composables/useI18n'
  import { useGameStore } from '@/stores/gameStore'
  import { useNPCStore } from '@/stores/npcStore'
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
  import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
  import { Button } from '@/components/ui/button'
  import { Badge } from '@/components/ui/badge'
  import { Progress } from '@/components/ui/progress'
  import ResourceIcon from '@/components/common/ResourceIcon.vue'
  import QuestMap from '@/components/campaign/QuestMap.vue'
  import StoryDialog from '@/components/campaign/StoryDialog.vue'
  import { Scroll, Check, Play, Gift, Target, Star, Rocket, Lock, Circle, CheckCircle2 } from 'lucide-vue-next'
  import { formatNumber } from '@/utils/format'
  import { MAIN_CAMPAIGN, getQuestsByChapter, getQuestById, getTotalQuestCount } from '@/config/campaignConfig'
  import * as campaignLogic from '@/logic/campaignLogic'
  import { QuestStatus, DiplomaticEventType, type CampaignQuestConfig, type StoryDialogue, type DialogueChoice } from '@/types/game'
  import { SHIPS } from '@/config/gameConfig'
  import { updateReputation, getOrCreateRelation } from '@/logic/diplomaticLogic'
  import { toast } from 'vue-sonner'

  const { t } = useI18n()
  const gameStore = useGameStore()
  const npcStore = useNPCStore()

  // 初始化战役进度
  onMounted(() => {
    if (!gameStore.player.campaignProgress) {
      gameStore.player.campaignProgress = campaignLogic.initializeCampaignProgress(gameStore.player)
    }
  })

  // 响应式状态
  const activeChapter = ref('1')
  const selectedQuestId = ref<string | null>(null)
  const showStoryDialog = ref(false)
  const currentDialogues = ref<StoryDialogue[]>([])
  const pendingAction = ref<'start' | 'claim' | null>(null)

  // 计算属性
  const chapters = computed(() => MAIN_CAMPAIGN.chapters)

  const campaignProgress = computed(() => gameStore.player.campaignProgress)

  const currentChapter = computed(() => campaignProgress.value?.currentChapter || 1)

  const totalProgress = computed(() => {
    if (!campaignProgress.value) return 0
    return campaignLogic.calculateCampaignProgress(campaignProgress.value)
  })

  const totalQuestCount = computed(() => getTotalQuestCount())

  const completedQuestCount = computed(() => campaignProgress.value?.completedQuests.length || 0)

  const selectedQuest = computed(() => {
    if (!selectedQuestId.value) return null
    return getQuestById(selectedQuestId.value)
  })

  // 获取章节任务
  const getChapterQuests = (chapterNumber: number): CampaignQuestConfig[] => {
    return getQuestsByChapter(chapterNumber)
  }

  // 获取章节进度
  const getChapterProgress = (chapterNumber: number): number => {
    if (!campaignProgress.value) return 0
    return campaignLogic.calculateChapterProgress(campaignProgress.value, chapterNumber)
  }

  // 获取任务状态
  const getQuestStatus = (questId: string): QuestStatus => {
    if (!campaignProgress.value) return QuestStatus.Locked
    return campaignLogic.getQuestStatus(campaignProgress.value, questId)
  }

  // 获取任务状态样式
  const getQuestStatusClass = (questId: string): string => {
    const status = getQuestStatus(questId)
    switch (status) {
      case QuestStatus.Completed:
        return 'bg-green-500 dark:bg-green-400 text-white'
      case QuestStatus.Active:
        return 'bg-primary text-primary-foreground'
      case QuestStatus.Available:
        return 'bg-blue-500 dark:bg-blue-400 text-white'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  // 获取任务状态图标
  const getQuestStatusIcon = (questId: string) => {
    const status = getQuestStatus(questId)
    switch (status) {
      case QuestStatus.Completed:
        return CheckCircle2
      case QuestStatus.Active:
        return Circle
      case QuestStatus.Available:
        return Circle
      default:
        return Lock
    }
  }

  // 检查是否可以开始任务
  const canStartQuest = (questId: string): boolean => {
    const status = getQuestStatus(questId)
    return status === QuestStatus.Available
  }

  // 检查是否可以领取奖励
  const canClaimRewards = (questId: string): boolean => {
    const status = getQuestStatus(questId)
    const progress = campaignProgress.value?.questProgress[questId]
    return status === QuestStatus.Completed && !progress?.rewardsClaimed
  }

  // 检查目标是否完成
  const isObjectiveCompleted = (questId: string, objectiveId: string): boolean => {
    const progress = campaignProgress.value?.questProgress[questId]
    return progress?.objectives[objectiveId]?.completed || false
  }

  // 获取目标进度
  const getObjectiveProgress = (questId: string, objectiveId: string): number => {
    const progress = campaignProgress.value?.questProgress[questId]
    return progress?.objectives[objectiveId]?.current || 0
  }

  // 获取舰船名称
  const getShipName = (shipType: string): string => {
    const ship = SHIPS[shipType as keyof typeof SHIPS]
    return ship?.name || shipType
  }

  // 处理任务选择
  const handleQuestSelect = (questId: string) => {
    selectedQuestId.value = questId
  }

  // 处理开始任务
  const handleStartQuest = (questId: string) => {
    const quest = getQuestById(questId)

    // 如果有开场对话，先显示对话
    if (quest?.prologueDialogues && quest.prologueDialogues.length > 0) {
      currentDialogues.value = quest.prologueDialogues
      pendingAction.value = 'start'
      showStoryDialog.value = true
      return
    }

    // 直接开始任务
    executeStartQuest(questId)
  }

  // 执行开始任务
  const executeStartQuest = (questId: string) => {
    const result = campaignLogic.startQuest(gameStore.player, questId)
    if (result.success) {
      toast.success(t('campaign.notifications.questStarted'))
      // 立即检查进度
      campaignLogic.checkAllActiveQuestsProgress(gameStore.player, npcStore.npcs)
    } else if (result.error) {
      toast.error(t(result.error))
    }
  }

  // 处理领取奖励
  const handleClaimRewards = (questId: string) => {
    const quest = getQuestById(questId)

    // 如果有结束对话，先显示对话
    if (quest?.epilogueDialogues && quest.epilogueDialogues.length > 0) {
      currentDialogues.value = quest.epilogueDialogues
      pendingAction.value = 'claim'
      showStoryDialog.value = true
      return
    }

    // 直接领取奖励
    executeClaimRewards(questId)
  }

  // 执行领取奖励
  const executeClaimRewards = (questId: string) => {
    const result = campaignLogic.claimQuestRewards(gameStore.player, questId)
    if (result.success) {
      toast.success(t('campaign.notifications.rewardsClaimed'))
    } else if (result.error) {
      toast.error(t(result.error))
    }
  }

  // 处理对话关闭
  const handleDialogueClose = () => {
    showStoryDialog.value = false

    if (pendingAction.value && selectedQuestId.value) {
      if (pendingAction.value === 'start') {
        executeStartQuest(selectedQuestId.value)
      } else if (pendingAction.value === 'claim') {
        executeClaimRewards(selectedQuestId.value)
      }
    }

    pendingAction.value = null
    currentDialogues.value = []
  }

  // 处理对话选项选择
  const handleDialogueChoice = (choice: DialogueChoice) => {
    if (!choice.effect) return

    const DEFAULT_REPUTATION_CHANGE = 10

    switch (choice.effect) {
      case 'reputation_up':
      case 'reputation_down': {
        // 需要指定NPC ID才能修改声望
        if (!choice.npcId) {
          return
        }

        const npc = npcStore.npcs.find(n => n.id === choice.npcId)
        if (!npc) {
          return
        }

        // 确保 relations 对象存在
        if (!npc.relations) {
          npc.relations = {}
        }

        const change =
          choice.effect === 'reputation_up' ? choice.value ?? DEFAULT_REPUTATION_CHANGE : -(choice.value ?? DEFAULT_REPUTATION_CHANGE)

        const relation = getOrCreateRelation(npc.relations, npc.id, gameStore.player.id)
        npc.relations[gameStore.player.id] = updateReputation(
          relation,
          change,
          DiplomaticEventType.CampaignChoice,
          t('campaign.dialogue.choiceEffect')
        )

        // 显示提示
        if (change > 0) {
          toast.success(t('campaign.notifications.reputationUp', { npcName: npc.name, value: change }))
        } else {
          toast.warning(t('campaign.notifications.reputationDown', { npcName: npc.name, value: Math.abs(change) }))
        }
        break
      }

      case 'unlock_branch': {
        // 解锁分支任务
        if (!choice.branchId) {
          return
        }

        // 将分支任务ID添加到已解锁分支列表
        if (!gameStore.player.campaignProgress) return

        if (!gameStore.player.campaignProgress.unlockedBranches) {
          gameStore.player.campaignProgress.unlockedBranches = []
        }

        if (!gameStore.player.campaignProgress.unlockedBranches.includes(choice.branchId)) {
          gameStore.player.campaignProgress.unlockedBranches.push(choice.branchId)
          toast.success(t('campaign.notifications.branchUnlocked'))
        }
        break
      }
    }
  }

  // 监听章节变化，自动选择第一个可用任务
  watch(activeChapter, newChapter => {
    const chapterQuests = getChapterQuests(parseInt(newChapter))
    const availableQuest = chapterQuests.find(quest => {
      const status = getQuestStatus(quest.id)
      return status === QuestStatus.Active || status === QuestStatus.Available
    })
    if (availableQuest) {
      selectedQuestId.value = availableQuest.id
    } else {
      const firstQuest = chapterQuests[0]
      if (firstQuest) {
        selectedQuestId.value = firstQuest.id
      }
    }
  })

  // 初始选择当前任务
  onMounted(() => {
    if (campaignProgress.value?.currentQuestId) {
      selectedQuestId.value = campaignProgress.value.currentQuestId
      const quest = getQuestById(campaignProgress.value.currentQuestId)
      if (quest) {
        activeChapter.value = quest.chapter.toString()
      }
    }
  })
</script>
