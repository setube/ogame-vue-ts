<template>
  <!-- 遮罩从标题下方开始，不遮挡名称 -->
  <div
    v-if="!isUnlocked"
    class="absolute inset-x-0 top-20 sm:top-13 bottom-0 z-10 bg-background/70 backdrop-blur-[2px] rounded-b-lg flex items-center justify-center"
  >
    <div class="text-center p-4 space-y-2">
      <div class="flex justify-center">
        <div class="rounded-full bg-muted p-2">
          <Lock :size="20" class="text-muted-foreground" />
        </div>
      </div>
      <p class="text-xs font-medium text-muted-foreground">{{ t('common.locked') }}</p>
      <Button variant="outline" size="sm" @click="showRequirements" class="text-xs">
        {{ t('common.viewRequirements') }}
      </Button>
    </div>

    <!-- 前置条件详情对话框 -->
    <AlertDialog :open="requirementsDialogOpen" @update:open="requirementsDialogOpen = $event">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{{ requirementsDialogTitle }}</AlertDialogTitle>
          <AlertDialogDescription>
            <div class="space-y-2">
              <div v-for="(req, index) in requirementsDialogItems" :key="index" class="flex items-center gap-2 text-sm">
                <Check v-if="req.met" :size="16" class="text-green-500 shrink-0" />
                <X v-else :size="16" class="text-red-500 shrink-0" />
                <span>{{ req.name }}: Lv {{ req.requiredLevel }} ({{ t('common.current') }}: Lv {{ req.currentLevel }})</span>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction>{{ t('common.confirm') }}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { useGameStore } from '@/stores/gameStore'
  import { useI18n } from '@/composables/useI18n'
  import { useGameConfig } from '@/composables/useGameConfig'
  import { BuildingType, TechnologyType } from '@/types/game'
  import { Lock, Check, X } from 'lucide-vue-next'
  import { Button } from '@/components/ui/button'
  import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
  } from '@/components/ui/alert-dialog'
  import * as publicLogic from '@/logic/publicLogic'

  interface Props {
    requirements?: Partial<Record<BuildingType | TechnologyType, number>>
    currentLevel?: number // 当前建筑/科技等级，用于判断是否已解锁
  }

  const props = defineProps<Props>()
  const gameStore = useGameStore()
  const { t } = useI18n()
  const { BUILDINGS, TECHNOLOGIES } = useGameConfig()

  // AlertDialog 状态
  const requirementsDialogOpen = ref(false)
  const requirementsDialogTitle = ref('')
  const requirementsDialogItems = ref<Array<{ name: string; requiredLevel: number; currentLevel: number; met: boolean }>>([])

  const isUnlocked = computed(() => {
    // 如果已经建造过（level > 0），则认为已解锁，不显示遮罩
    if (props.currentLevel !== undefined && props.currentLevel > 0) return true
    if (!props.requirements || !gameStore.currentPlanet) return true
    return publicLogic.checkRequirements(gameStore.currentPlanet, gameStore.player.technologies, props.requirements)
  })

  const getRequirementsList = (): Array<{ name: string; requiredLevel: number; currentLevel: number; met: boolean }> => {
    if (!props.requirements || !gameStore.currentPlanet) return []

    const items: Array<{ name: string; requiredLevel: number; currentLevel: number; met: boolean }> = []
    for (const [key, requiredLevel] of Object.entries(props.requirements)) {
      // 检查是否为建筑类型
      if (Object.values(BuildingType).includes(key as BuildingType)) {
        const buildingType = key as BuildingType
        const currentLevel = gameStore.currentPlanet.buildings[buildingType] || 0
        const name = BUILDINGS.value[buildingType]?.name || buildingType
        items.push({ name, requiredLevel, currentLevel, met: currentLevel >= requiredLevel })
      }
      // 检查是否为科技类型
      else if (Object.values(TechnologyType).includes(key as TechnologyType)) {
        const techType = key as TechnologyType
        const currentLevel = gameStore.player.technologies[techType] || 0
        const name = TECHNOLOGIES.value[techType]?.name || techType
        items.push({ name, requiredLevel, currentLevel, met: currentLevel >= requiredLevel })
      }
    }
    return items
  }

  const showRequirements = () => {
    requirementsDialogTitle.value = t('common.requirementsNotMet')
    requirementsDialogItems.value = getRequirementsList()
    requirementsDialogOpen.value = true
  }
</script>
