<template>
  <div class="container mx-auto space-y-4 p-4 sm:p-6">
    <h1 class="text-2xl font-bold sm:text-3xl">{{ t('simulatorView.title') }}</h1>

    <div class="flex flex-wrap gap-2" role="group" :aria-label="t('simulatorView.mySide')">
      <Button v-for="side in sides" :key="side" type="button" size="sm" :variant="mySide === side ? 'default' : 'outline'"
        :aria-pressed="mySide === side" :disabled="isSimulating" @click="handleRoleChange(side)">
        {{ t(side === 'attacker' ? 'simulatorView.iAttack' : 'simulatorView.iDefend') }}
      </Button>
    </div>

    <Tabs v-model="activeTab" class="w-full">
      <TabsList class="grid w-full grid-cols-2">
        <TabsTrigger v-for="side in sides" :key="side" :value="side">
          <component :is="side === 'attacker' ? Sword : Shield" class="mr-2 h-4 w-4" />
          {{ t('simulatorView.' + side) }}
          <Badge v-if="mySide === side" variant="secondary" class="ml-2">{{ t('simulatorView.you') }}</Badge>
        </TabsTrigger>
      </TabsList>

      <TabsContent v-for="side in sides" :key="side" :value="side" class="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>{{ t('simulatorView.' + side + 'Config') }}</CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <section class="space-y-2 rounded-md border bg-muted/50 p-3" :aria-label="t('simulatorView.reference')">
              <p class="break-words text-sm" :data-reference-side="side">
                <span class="text-muted-foreground">{{ t('simulatorView.reference') }} · </span>
                <template v-if="referenceData[side]">
                  {{ referenceData[side].name }}
                  <span v-if="referenceData[side].timestamp" class="text-xs text-muted-foreground">
                    · {{ t('simulatorView.spyReportSource') }} · {{ formatDate(referenceData[side].timestamp) }}
                  </span>
                </template>
                <template v-else>{{ t('simulatorView.manualEntry') }}</template>
              </p>
              <div class="flex flex-wrap gap-2">
                <Button type="button" variant="outline" size="sm" @click="referenceSide = side">
                  {{ t('simulatorView.chooseReference') }}
                </Button>
                <Button v-if="referenceData[side]" type="button" variant="outline" size="sm" @click="handleFillReference(side)">
                  {{ t('simulatorView.fillReference') }}
                </Button>
              </div>
              <p v-if="referenceData[side]" class="text-xs text-muted-foreground">{{ t('simulatorView.referenceHint') }}</p>
            </section>

            <div>
              <h3 class="mb-3 text-sm font-medium">{{ t('simulatorView.fleet') }}</h3>
              <div class="grid grid-cols-2 gap-3 md:grid-cols-3">
                <div v-for="shipType in Object.values(ShipType)" :key="shipType" class="space-y-1">
                  <Label :for="side + '-' + shipType" class="text-xs">{{ SHIPS[shipType].name }}</Label>
                  <Input
                    :id="side + '-' + shipType"
                    :model-value="drafts[side].fleet[shipType] ?? ''"
                    :placeholder="getCountPlaceholder(side, referenceData[side]?.fleet, shipType)"
                    @update:model-value="value => handleNumberChange(drafts[side].fleet, shipType, value)"
                    type="number" min="0" class="h-8"
                  />
                </div>
              </div>
            </div>

            <div v-if="side === 'defender'">
              <h3 class="mb-3 text-sm font-medium">{{ t('simulatorView.defenseStructures') }}</h3>
              <div class="grid grid-cols-2 gap-3 md:grid-cols-3">
                <div v-for="defenseType in Object.values(DefenseType)" :key="defenseType" class="space-y-1">
                  <Label :for="'defense-' + defenseType" class="text-xs">{{ DEFENSES[defenseType].name }}</Label>
                  <Input
                    :id="'defense-' + defenseType"
                    :model-value="defenderDefense[defenseType] ?? ''"
                    :placeholder="getCountPlaceholder(side, referenceData[side]?.defense, defenseType)"
                    @update:model-value="value => handleNumberChange(defenderDefense, defenseType, value)"
                    type="number" min="0" class="h-8"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 class="mb-3 text-sm font-medium">{{ t('simulatorView.techLevels') }}</h3>
              <div class="grid grid-cols-3 gap-3">
                <div v-for="tech in techTypes" :key="tech.key" class="space-y-1">
                  <Label :for="side + '-' + tech.key" class="text-xs">{{ TECHNOLOGIES[tech.type].name }}</Label>
                  <Input
                    :id="side + '-' + tech.key"
                    :model-value="drafts[side].tech[tech.key] ?? ''"
                    :placeholder="getTechPlaceholder(side, tech.type)"
                    @update:model-value="value => handleNumberChange(drafts[side].tech, tech.key, value)"
                    type="number" min="0" class="h-8"
                  />
                </div>
              </div>
            </div>

            <div v-if="side === 'defender'">
              <h3 class="mb-3 text-sm font-medium">{{ t('simulatorView.defenderResources') }}</h3>
              <div class="grid grid-cols-3 gap-3">
                <div v-for="resource in resourceTypes" :key="resource" class="space-y-1">
                  <Label :for="'defender-' + resource" class="flex items-center gap-1 text-xs">
                    <ResourceIcon :type="resource" size="sm" />
                    {{ t('resources.' + resource) }}
                  </Label>
                  <Input :id="'defender-' + resource" v-model.number="defenderResources[resource]" type="number" min="0" class="h-8" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>

    <div class="space-y-2">
      <div class="flex gap-2">
        <Button :disabled="isSimulating || !!simulationBlocker" @click="runSimulation(false)" class="flex-1" size="lg">
          <Zap class="mr-2 h-4 w-4" />
          {{ t('simulatorView.startSimulation') }}
        </Button>
        <Button :disabled="isSimulating" @click="resetSimulation" variant="outline" size="lg">
          <RotateCcw class="mr-2 h-4 w-4" />
          {{ t('simulatorView.reset') }}
        </Button>
      </div>
      <p v-if="simulationBlocker" class="text-sm text-muted-foreground">{{ t(simulationBlocker) }}</p>
      <Button
        v-if="simulationBlocker === 'simulatorView.defenderRequired'"
        :disabled="isSimulating" @click="runSimulation(true)" variant="link" size="sm"
        class="h-auto px-0 text-xs text-muted-foreground"
      >
        {{ t('simulatorView.simulateUndefended') }}
      </Button>
    </div>

    <BattleReportDialog v-model:open="showResultDialog" :report="simulationResult" :player-side="simulationSide" />

    <Dialog :open="referenceSide !== null" @update:open="open => { if (!open) referenceSide = null }">
      <DialogContent class="max-h-[80vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{{ t('simulatorView.chooseReference') }}</DialogTitle>
          <DialogDescription>{{ t('simulatorView.referenceSelectionHint') }}</DialogDescription>
        </DialogHeader>
        <div class="space-y-2">
          <Button type="button" variant="outline" class="w-full justify-start" @click="selectReference(null)">
            {{ t('simulatorView.manualEntry') }}
          </Button>
          <Button
            v-if="gameStore.currentPlanet" type="button" variant="outline"
            class="h-auto w-full justify-start whitespace-normal text-left" @click="selectReference({ kind: 'current' })"
          >
            {{ t('planet.currentPlanet') }} · {{ gameStore.currentPlanet.name }}
          </Button>
          <Button
            v-for="planet in otherPlanets" :key="planet.id" type="button" variant="outline"
            class="h-auto w-full justify-start whitespace-normal text-left"
            @click="selectReference({ kind: 'planet', planetId: planet.id })"
          >
            {{ planet.name }} [{{ planet.position.galaxy }}:{{ planet.position.system }}:{{ planet.position.position }}]
          </Button>
        </div>
        <div class="space-y-2">
          <h3 class="text-sm font-medium">{{ t('simulatorView.spyReportSource') }}</h3>
          <p v-if="!sortedSpyReports.length" class="text-sm text-muted-foreground">{{ t('simulatorView.noSpyReports') }}</p>
          <Button
            v-for="report in sortedSpyReports" :key="report.id" type="button" variant="outline"
            class="h-auto w-full flex-wrap justify-between whitespace-normal text-left"
            @click="selectReference({ kind: 'report', report })"
          >
            <span>{{ report.targetPlanetName }} [{{ report.targetPosition.galaxy }}:{{ report.targetPosition.system }}:{{ report.targetPosition.position }}]</span>
            <span class="text-xs text-muted-foreground">{{ formatDate(report.timestamp) }}</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>

    <AlertDialog :open="pendingChange !== null">
      <AlertDialogContent @escape-key-down="pendingChange = null">
        <AlertDialogHeader>
          <AlertDialogTitle>{{ t(pendingChange?.kind === 'role' ? 'simulatorView.mySide' : 'simulatorView.fillReference') }}</AlertDialogTitle>
          <AlertDialogDescription>
            {{ t(pendingChange?.kind === 'role' ? 'simulatorView.changeRoleConfirm' : 'simulatorView.fillReferenceConfirm') }}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel @click="pendingChange = null">{{ t('common.cancel') }}</AlertDialogCancel>
          <AlertDialogAction @click="confirmChange">{{ t('common.confirm') }}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { useI18n } from '@/composables/useI18n'
  import { useGameConfig } from '@/composables/useGameConfig'
  import { useGameStore } from '@/stores/gameStore'
  import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
  import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
  import { Button } from '@/components/ui/button'
  import { Badge } from '@/components/ui/badge'
  import { Input } from '@/components/ui/input'
  import { Label } from '@/components/ui/label'
  import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
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
  import { ShipType, DefenseType, TechnologyType } from '@/types/game'
  import type { Fleet, BattleResult, Resources, SpyReport } from '@/types/game'
  import { workerManager } from '@/workers/workerManager'
  import ResourceIcon from '@/components/common/ResourceIcon.vue'
  import BattleReportDialog from '@/components/dialogs/BattleReportDialog.vue'
  import { Sword, Shield, Zap, RotateCcw } from 'lucide-vue-next'
  import { calculateMoonChance } from '@/logic/planetLogic'
  import { formatDate } from '@/utils/format'
  import { toast } from 'vue-sonner'

  const { t } = useI18n()
  const { SHIPS, DEFENSES, TECHNOLOGIES } = useGameConfig()
  const gameStore = useGameStore()
  const sides = ['attacker', 'defender'] as const
  type Side = (typeof sides)[number]
  type Reference = { kind: 'current' } | { kind: 'planet'; planetId: string } | { kind: 'report'; report: SpyReport }
  type ReferenceData = {
    kind: 'planet' | 'report'
    name: string
    timestamp?: number
    fleet?: Partial<Fleet>
    defense?: Partial<Record<DefenseType, number>>
    technologies?: Partial<Record<TechnologyType, number>>
    resources: Resources
  }

  const techTypes = [
    { key: 'weapon', type: TechnologyType.WeaponsTechnology },
    { key: 'shield', type: TechnologyType.ShieldingTechnology },
    { key: 'armor', type: TechnologyType.ArmourTechnology }
  ] as const
  type TechKey = (typeof techTypes)[number]['key']
  const resourceTypes = ['metal', 'crystal', 'deuterium'] as const
  const defaultResources: Resources = { metal: 100000, crystal: 50000, deuterium: 25000, darkMatter: 100, energy: 0 }

  const emptyDraft = () => ({ fleet: {} as Partial<Fleet>, tech: {} as Partial<Record<TechKey, number>> })
  const drafts = ref({ attacker: emptyDraft(), defender: emptyDraft() })
  const defenderDefense = ref<Partial<Record<DefenseType, number>>>({})
  const defenderResources = ref({ ...defaultResources })
  const mySide = ref<Side>('attacker')
  const activeTab = ref<Side>('attacker')
  const references = ref<Record<Side, Reference | null>>({ attacker: { kind: 'current' }, defender: null })
  const referenceSide = ref<Side | null>(null)
  const pendingChange = ref<{ kind: 'role' | 'fill'; side: Side } | null>(null)
  const otherPlanets = computed(() => gameStore.player.planets.filter(planet => planet.id !== gameStore.currentPlanetId))
  const sortedSpyReports = computed(() => [...(gameStore.player.spyReports || [])].sort((a, b) => b.timestamp - a.timestamp))

  const getReferenceData = (reference: Reference | null): ReferenceData | null => {
    if (!reference) return null
    if (reference.kind === 'report') {
      const { targetPlanetName, timestamp, fleet, defense, technologies, resources } = reference.report
      return { kind: 'report', name: targetPlanetName, timestamp, fleet, defense, technologies, resources }
    }

    const planet = reference.kind === 'current' ? gameStore.currentPlanet : gameStore.player.planets.find(item => item.id === reference.planetId)
    if (!planet) return null
    return {
      kind: 'planet',
      name: planet.name,
      fleet: planet.fleet,
      defense: planet.defense,
      technologies: gameStore.player.technologies,
      resources: planet.resources
    }
  }

  const referenceData = computed(() => ({
    attacker: getReferenceData(references.value.attacker),
    defender: getReferenceData(references.value.defender)
  }))

  const selectReference = (reference: Reference | null) => {
    if (referenceSide.value === null) return
    references.value[referenceSide.value] = reference
    referenceSide.value = null
  }

  const handleNumberChange = <K extends string>(values: Partial<Record<K, number>>, key: K, value: number | string) => {
    if (typeof value === 'number') values[key] = value
    else delete values[key]
  }

  const getCountPlaceholder = <K extends string>(side: Side, values: Partial<Record<K, number>> | undefined, key: K) => {
    const reference = referenceData.value[side]
    if (!reference) return undefined
    if (!values) return t('simulatorView.unknownReference')
    const count = values[key] ?? 0
    return reference.kind === 'report' ? t('simulatorView.reportCount', { count }) : t('fleetView.available') + ' ' + count
  }

  const getReferenceLevel = (side: Side, technology: TechnologyType) => {
    const reference = referenceData.value[side]
    const level = reference?.technologies?.[technology]
    return reference?.kind === 'report' ? level : level ?? 0
  }

  const getTechPlaceholder = (side: Side, technology: TechnologyType) => {
    const level = getReferenceLevel(side, technology)
    if (level === undefined) return t('simulatorView.unknownReference')
    const reference = referenceData.value[side]
    if (!reference) return '0'
    return t(reference.kind === 'report' ? 'simulatorView.referenceLevel' : 'simulatorView.currentLevel', { level })
  }

  const getEffectiveTech = (side: Side) => {
    const tech = drafts.value[side].tech
    return {
      weaponTech: tech.weapon ?? getReferenceLevel(side, TechnologyType.WeaponsTechnology),
      shieldTech: tech.shield ?? getReferenceLevel(side, TechnologyType.ShieldingTechnology),
      armorTech: tech.armor ?? getReferenceLevel(side, TechnologyType.ArmourTechnology)
    }
  }

  const hasDraft = (side: Side) => {
    const { fleet, tech } = drafts.value[side]
    if (Object.keys(fleet).length || Object.keys(tech).length) return true
    return side === 'defender' && (
      Object.keys(defenderDefense.value).length > 0 || resourceTypes.some(resource => defenderResources.value[resource] !== defaultResources[resource])
    )
  }

  const fillReference = (side: Side) => {
    const reference = referenceData.value[side]
    if (!reference) return

    const draft = emptyDraft()
    for (const shipType of Object.values(ShipType)) {
      const count = reference.fleet?.[shipType]
      if (count) draft.fleet[shipType] = count
    }
    for (const { key, type } of techTypes) {
      const level = getReferenceLevel(side, type)
      if (level !== undefined) draft.tech[key] = level
    }
    drafts.value[side] = draft

    if (side === 'defender') {
      const defense: Partial<Record<DefenseType, number>> = {}
      for (const defenseType of Object.values(DefenseType)) {
        const count = reference.defense?.[defenseType]
        if (count) defense[defenseType] = count
      }
      defenderDefense.value = defense
      defenderResources.value = { ...reference.resources }
    }
  }

  const handleFillReference = (side: Side) => {
    if (hasDraft(side)) pendingChange.value = { kind: 'fill', side }
    else fillReference(side)
  }

  const simulationResult = ref<BattleResult | null>(null)
  const simulationSide = ref<Side>('attacker')
  const showResultDialog = ref(false)
  const isSimulating = ref(false)

  const resetSimulation = () => {
    drafts.value = { attacker: emptyDraft(), defender: emptyDraft() }
    defenderDefense.value = {}
    simulationResult.value = null
    showResultDialog.value = false
  }

  const changeRole = (side: Side) => {
    resetSimulation()
    defenderResources.value = { ...defaultResources }
    references.value = { attacker: null, defender: null }
    references.value[side] = { kind: 'current' }
    mySide.value = side
    activeTab.value = side
  }

  const handleRoleChange = (side: Side) => {
    if (side === mySide.value) return
    const customReference = sides.some(item => item === mySide.value ? references.value[item]?.kind !== 'current' : references.value[item] !== null)
    if (sides.some(hasDraft) || customReference) pendingChange.value = { kind: 'role', side }
    else changeRole(side)
  }

  const confirmChange = () => {
    const change = pendingChange.value
    if (!change) return
    if (change.kind === 'role') changeRole(change.side)
    else fillReference(change.side)
    pendingChange.value = null
  }

  const getSimulationBlocker = (allowUndefended: boolean) => {
    const attackerUnits = Object.values(drafts.value.attacker.fleet)
    const defenderUnits = [...Object.values(drafts.value.defender.fleet), ...Object.values(defenderDefense.value)]
    if ([...attackerUnits, ...defenderUnits].some(count => !Number.isSafeInteger(count) || count < 0)) return 'simulatorView.invalidCount'
    if (!attackerUnits.some(count => count > 0)) return 'simulatorView.attackerRequired'

    const hasDefenders = defenderUnits.some(count => count > 0)
    const tech = Object.values(getEffectiveTech('attacker'))
    if (hasDefenders) tech.push(...Object.values(getEffectiveTech('defender')))
    if (tech.some(level => level === undefined)) return 'simulatorView.techUnknown'
    if (tech.some(level => !Number.isSafeInteger(level) || (level ?? 0) < 0)) return 'simulatorView.invalidCount'
    if (!allowUndefended && !hasDefenders) return 'simulatorView.defenderRequired'
    return ''
  }
  const simulationBlocker = computed(() => getSimulationBlocker(false))

  const runSimulation = async (allowUndefended: boolean) => {
    if (isSimulating.value || getSimulationBlocker(allowUndefended)) return
    isSimulating.value = true
    const side = mySide.value
    const attacker = { ships: { ...drafts.value.attacker.fleet }, ...getEffectiveTech('attacker') }
    const defender = { ships: { ...drafts.value.defender.fleet }, defense: { ...defenderDefense.value }, ...getEffectiveTech('defender') }
    const resources = { ...defenderResources.value }
    try {
      const result = await workerManager.simulateBattle({ attacker, defender, maxRounds: gameStore.battleToFinish ? 100 : 6 })
      const plunder = result.winner === 'attacker'
        ? await workerManager.calculatePlunder({ defenderResources: resources, attackerFleet: result.attackerRemaining })
        : { metal: 0, crystal: 0, deuterium: 0, darkMatter: 0, energy: 0 }
      const debrisField = await workerManager.calculateDebris({ attackerLosses: result.attackerLosses, defenderLosses: result.defenderLosses })

      simulationResult.value = {
        id: 'sim_' + Date.now(),
        timestamp: Date.now(),
        attackerId: 'simulator_attacker',
        defenderId: 'simulator_defender',
        attackerPlanetId: 'sim_attacker',
        defenderPlanetId: 'sim_defender',
        attackerFleet: attacker.ships,
        defenderFleet: defender.ships,
        defenderDefense: defender.defense,
        attackerLosses: result.attackerLosses,
        defenderLosses: result.defenderLosses,
        winner: result.winner,
        plunder,
        debrisField,
        rounds: result.rounds,
        attackerRemaining: result.attackerRemaining,
        defenderRemaining: result.defenderRemaining,
        roundDetails: result.roundDetails,
        moonChance: calculateMoonChance(debrisField) / 100
      }
      simulationSide.value = side
      showResultDialog.value = true
    } catch (error) {
      console.error('模拟战斗失败', error)
      toast.error(t('simulatorView.simulationFailed'))
    } finally {
      isSimulating.value = false
    }
  }
</script>
