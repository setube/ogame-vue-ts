<template>
  <div class="container mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
    <h1 class="text-2xl sm:text-3xl font-bold">{{ t('galaxyView.title') }}</h1>

    <!-- 坐标选择器 -->
    <Card>
      <CardHeader>
        <CardTitle>{{ t('galaxyView.selectCoordinates') }}</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          :class="[
            'grid gap-3 sm:gap-4',
            highlightedNpc ? 'grid-cols-2 sm:grid-cols-4' : isInHomePlanetSystem ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3'
          ]"
        >
          <div class="space-y-2">
            <Label for="select-galaxy" class="text-xs sm:text-sm">{{ t('galaxyView.galaxy') }}</Label>
            <Select
              :key="gameStore.locale"
              :model-value="String(selectedGalaxy)"
              :modal="false"
              @update:model-value="
                val => {
                  selectedGalaxy = Number(val)
                  loadSystem()
                }
              "
            >
              <SelectTrigger id="select-galaxy" class="w-full">
                <SelectValue :placeholder="t('galaxyView.selectGalaxy')" />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem v-for="g in 9" :key="g" :value="String(g)">{{ t('galaxyView.galaxy') }} {{ g }}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="space-y-2">
            <Label for="select-system" class="text-xs sm:text-sm">{{ t('galaxyView.system') }}</Label>
            <Select
              :key="`${gameStore.locale}-system`"
              :model-value="String(selectedSystem)"
              :modal="false"
              @update:model-value="
                val => {
                  selectedSystem = Number(val)
                  loadSystem()
                }
              "
            >
              <SelectTrigger id="select-system" class="w-full">
                <SelectValue :placeholder="t('galaxyView.selectSystem')" />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem v-for="s in 10" :key="s" :value="String(s)">{{ t('galaxyView.system') }} {{ s }}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div v-if="!isInHomePlanetSystem" :class="highlightedNpc ? '' : 'col-span-2 sm:col-span-1'" class="space-y-2">
            <Label class="text-xs sm:text-sm opacity-0">{{ t('galaxyView.myPlanets') }}</Label>
            <!-- 不在母星星系时显示Popover选择 -->
            <Popover>
              <PopoverTrigger as-child>
                <Button variant="outline" class="w-full">
                  <Home class="h-4 w-4 mr-2" />
                  {{ t('galaxyView.myPlanets') }}
                </Button>
              </PopoverTrigger>
              <PopoverContent class="w-72 p-2" align="start">
                <div class="space-y-1">
                  <div class="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                    {{ t('galaxyView.selectPlanetToView') }}
                  </div>
                  <Button
                    v-for="p in myPlanets"
                    :key="p.id"
                    @click="goToPlanet(p)"
                    :disabled="p.position.galaxy === currentGalaxy && p.position.system === currentSystem"
                    variant="ghost"
                    :class="[
                      'w-full justify-start h-auto py-2 px-2 text-left',
                      p.position.galaxy === currentGalaxy &&
                        p.position.system === currentSystem &&
                        'bg-blue-100 dark:bg-blue-950/50 border border-blue-400 dark:border-blue-600'
                    ]"
                    size="sm"
                  >
                    <div class="flex items-start gap-2 w-full min-w-0">
                      <Globe class="h-4 w-4 shrink-0 mt-0.5" />
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-1.5 mb-0.5">
                          <span class="truncate font-medium text-sm">{{ p.name }}</span>
                          <Badge v-if="p.isMoon" variant="outline" class="text-[10px] px-1 py-0 h-4">
                            {{ t('planet.moon') }}
                          </Badge>
                        </div>
                        <div class="text-[11px] text-muted-foreground">
                          [{{ p.position.galaxy }}:{{ p.position.system }}:{{ p.position.position }}]
                        </div>
                      </div>
                    </div>
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <!-- NPC星球列表 -->
          <div v-if="highlightedNpc" :class="isInHomePlanetSystem ? 'col-span-2 sm:col-span-2' : ''" class="space-y-2">
            <Label class="text-xs sm:text-sm opacity-0">{{ t('galaxyView.npcPlanets') }}</Label>
            <Popover>
              <PopoverTrigger as-child>
                <Button variant="outline" class="w-full border-yellow-400 dark:border-yellow-600">
                  <Globe class="h-4 w-4 mr-2" />
                  {{ highlightedNpc.name }} ({{ highlightedNpc.planets.length }})
                </Button>
              </PopoverTrigger>
              <PopoverContent class="w-72 p-2" align="start">
                <div class="space-y-1">
                  <div class="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                    {{ t('galaxyView.selectPlanetToView') }}
                  </div>
                  <Button
                    v-for="p in highlightedNpc.planets"
                    :key="p.id"
                    @click="goToPlanet(p)"
                    :disabled="p.position.galaxy === currentGalaxy && p.position.system === currentSystem"
                    variant="ghost"
                    :class="[
                      'w-full justify-start h-auto py-2 px-2 text-left',
                      p.position.galaxy === currentGalaxy &&
                        p.position.system === currentSystem &&
                        'bg-yellow-100 dark:bg-yellow-950/50 border border-yellow-400 dark:border-yellow-600'
                    ]"
                    size="sm"
                  >
                    <div class="flex items-start gap-2 w-full min-w-0">
                      <Globe class="h-4 w-4 shrink-0 mt-0.5" />
                      <div class="flex-1 min-w-0">
                        <div class="truncate font-medium text-sm mb-0.5">{{ p.name }}</div>
                        <div class="text-[11px] text-muted-foreground">
                          [{{ p.position.galaxy }}:{{ p.position.system }}:{{ p.position.position }}]
                        </div>
                      </div>
                    </div>
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 星系视图 -->
    <Card>
      <CardHeader>
        <CardTitle>{{ t('galaxyView.galaxy') }} {{ currentGalaxy }}:{{ currentSystem }}</CardTitle>
        <CardDescription>{{ t('galaxyView.totalPositions') }}</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="space-y-2">
          <div
            v-for="slot in systemSlots"
            :key="slot.position"
            class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-2 sm:p-3 border rounded-lg hover:bg-muted/50 transition-colors"
            :class="{
              // 空位置
              'bg-muted/30': !slot.planet,
              // 我的星球 - 蓝色
              'bg-blue-50 dark:bg-blue-950 border-blue-300 dark:border-blue-700': slot.planet && isMyPlanet(slot.planet),
              // 高亮NPC - 黄色
              'bg-yellow-50 dark:bg-yellow-950/30 border-yellow-400 dark:border-yellow-600 ring-2 ring-yellow-400 dark:ring-yellow-500':
                slot.planet && isHighlightedNpcPlanet(slot.planet) && !isMyPlanet(slot.planet),
              // 友好NPC - 绿色
              'bg-green-50 dark:bg-green-950/30 border-green-300 dark:border-green-700':
                slot.planet &&
                !isMyPlanet(slot.planet) &&
                !isHighlightedNpcPlanet(slot.planet) &&
                getRelation(slot.planet)?.status === RelationStatus.Friendly,
              // 敌对NPC - 红色
              'bg-red-50 dark:bg-red-950/30 border-red-300 dark:border-red-700':
                slot.planet &&
                !isMyPlanet(slot.planet) &&
                !isHighlightedNpcPlanet(slot.planet) &&
                getRelation(slot.planet)?.status === RelationStatus.Hostile,
              // 中立NPC - 灰色
              'bg-gray-50 dark:bg-gray-950/30 border-gray-300 dark:border-gray-700':
                slot.planet &&
                !isMyPlanet(slot.planet) &&
                !isHighlightedNpcPlanet(slot.planet) &&
                getPlanetNPC(slot.planet) &&
                (!getRelation(slot.planet) || getRelation(slot.planet)?.status === RelationStatus.Neutral)
            }"
          >
            <!-- 移动端布局 -->
            <div class="sm:hidden w-full space-y-2">
              <!-- 第一行：位置编号 + 星球信息（名称、坐标、状态、残骸） -->
              <div class="flex items-start gap-2 w-full">
                <!-- 位置编号 -->
                <div class="w-8 text-center shrink-0">
                  <Badge variant="outline" class="text-xs">{{ slot.position }}</Badge>
                </div>
                <!-- 星球信息 -->
                <div class="flex-1 min-w-0">
                  <div v-if="slot.planet" class="space-y-1">
                    <!-- 第一行：名称、坐标、状态、残骸 -->
                    <div class="flex items-center gap-1.5 min-w-0 flex-wrap">
                      <h3 class="font-semibold text-sm truncate">
                        {{ isMyPlanet(slot.planet) ? slot.planet.name : getNpcPlanetDisplayName(slot.planet) }}
                      </h3>
                      <span class="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                        [{{ slot.planet.position.galaxy }}:{{ slot.planet.position.system }}:{{ slot.planet.position.position }}]
                      </span>
                      <Badge v-if="isMyPlanet(slot.planet)" variant="default" class="text-xs shrink-0">
                        {{ t('galaxyView.mine') }}
                      </Badge>
                      <Popover v-else>
                        <PopoverTrigger as-child>
                          <Badge :variant="getRelationBadgeVariant(slot.planet)" class="text-xs shrink-0 cursor-pointer">
                            {{ getRelationStatusText(slot.planet) }}
                          </Badge>
                        </PopoverTrigger>
                        <PopoverContent v-if="getReputationValue(slot.planet) !== null" class="w-auto p-3" side="top" align="center">
                          <p class="text-sm">
                            {{ t('diplomacy.reputation') }}:
                            <span :class="getReputationColor(getReputationValue(slot.planet))" class="font-medium">
                              {{ getReputationValue(slot.planet)! > 0 ? '+' : '' }}{{ getReputationValue(slot.planet) }}
                            </span>
                          </p>
                        </PopoverContent>
                      </Popover>
                      <!-- NPC难度等级徽章 -->
                      <Badge
                        v-if="getNpcDifficultyLevel(slot.planet) !== null"
                        :variant="getDifficultyBadgeVariant(getNpcDifficultyLevel(slot.planet))"
                        class="text-xs shrink-0"
                        :class="getDifficultyLevelColor(getNpcDifficultyLevel(slot.planet))"
                      >
                        Lv.{{ getNpcDifficultyLevel(slot.planet) }}
                      </Badge>
                      <Popover v-if="getDebrisFieldAt(currentGalaxy, currentSystem, slot.position)">
                        <PopoverTrigger as-child>
                          <Badge
                            variant="outline"
                            class="text-xs cursor-pointer hover:bg-amber-50 dark:hover:bg-amber-950/30 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400 gap-1"
                          >
                            <Recycle class="h-3 w-3" />
                          </Badge>
                        </PopoverTrigger>
                        <PopoverContent class="w-auto p-3" side="top" align="center">
                          <div class="space-y-2">
                            <p class="text-xs font-semibold text-amber-700 dark:text-amber-400">{{ t('galaxyView.debrisField') }}</p>
                            <div class="space-y-1 text-xs">
                              <div class="flex items-center gap-2">
                                <ResourceIcon type="metal" size="sm" />
                                <span class="text-muted-foreground">{{ t('resources.metal') }}:</span>
                                <span class="font-medium">
                                  {{ formatNumber(getDebrisFieldAt(currentGalaxy, currentSystem, slot.position)!.resources.metal) }}
                                </span>
                              </div>
                              <div class="flex items-center gap-2">
                                <ResourceIcon type="crystal" size="sm" />
                                <span class="text-muted-foreground">{{ t('resources.crystal') }}:</span>
                                <span class="font-medium">
                                  {{ formatNumber(getDebrisFieldAt(currentGalaxy, currentSystem, slot.position)!.resources.crystal) }}
                                </span>
                              </div>
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                      <!-- 矿脉储量徽章 -->
                      <Popover v-if="getOreDeposits(slot.planet)">
                        <PopoverTrigger as-child>
                          <Badge
                            variant="outline"
                            class="text-xs cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-950/30 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400 gap-1"
                          >
                            <Mountain class="h-3 w-3" />
                          </Badge>
                        </PopoverTrigger>
                        <PopoverContent class="w-auto p-3" side="top" align="center">
                          <div class="space-y-2">
                            <p class="text-xs font-semibold text-emerald-700 dark:text-emerald-400">{{ t('galaxyView.oreDeposits') }}</p>
                            <div class="space-y-1 text-xs">
                              <div class="flex items-center gap-2">
                                <ResourceIcon type="metal" size="sm" />
                                <span class="text-muted-foreground">{{ t('resources.metal') }}:</span>
                                <span
                                  class="font-medium"
                                  :class="getDepositStatus(getOreDeposits(slot.planet)!, 'metal') === 'depleted' ? 'text-destructive' : getDepositStatus(getOreDeposits(slot.planet)!, 'metal') === 'warning' ? 'text-yellow-600' : ''"
                                >
                                  {{ formatDepositShort(getOreDeposits(slot.planet)!.metal) }}
                                </span>
                              </div>
                              <div class="flex items-center gap-2">
                                <ResourceIcon type="crystal" size="sm" />
                                <span class="text-muted-foreground">{{ t('resources.crystal') }}:</span>
                                <span
                                  class="font-medium"
                                  :class="getDepositStatus(getOreDeposits(slot.planet)!, 'crystal') === 'depleted' ? 'text-destructive' : getDepositStatus(getOreDeposits(slot.planet)!, 'crystal') === 'warning' ? 'text-yellow-600' : ''"
                                >
                                  {{ formatDepositShort(getOreDeposits(slot.planet)!.crystal) }}
                                </span>
                              </div>
                              <div class="flex items-center gap-2">
                                <ResourceIcon type="deuterium" size="sm" />
                                <span class="text-muted-foreground">{{ t('resources.deuterium') }}:</span>
                                <span
                                  class="font-medium"
                                  :class="getDepositStatus(getOreDeposits(slot.planet)!, 'deuterium') === 'depleted' ? 'text-destructive' : getDepositStatus(getOreDeposits(slot.planet)!, 'deuterium') === 'warning' ? 'text-yellow-600' : ''"
                                >
                                  {{ formatDepositShort(getOreDeposits(slot.planet)!.deuterium) }}
                                </span>
                              </div>
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                      <!-- 月球徽章 -->
                      <Badge
                        v-if="slot.moon"
                        variant="outline"
                        class="text-xs cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-400 dark:border-slate-600 text-slate-600 dark:text-slate-400 gap-1"
                        @click.stop="switchToPlanet(slot.moon.id)"
                      >
                        <Moon class="h-3 w-3" />
                        <span>{{ slot.moon.name }}</span>
                      </Badge>
                    </div>
                  </div>
                  <!-- 空位置 -->
                  <div v-else class="space-y-1">
                    <div class="text-sm text-muted-foreground">{{ t('galaxyView.emptySlot') }}</div>
                    <!-- 残骸场徽章 - 空位置时也显示 -->
                    <Popover v-if="getDebrisFieldAt(currentGalaxy, currentSystem, slot.position)">
                      <PopoverTrigger as-child>
                        <Badge
                          variant="outline"
                          class="text-xs cursor-pointer hover:bg-amber-50 dark:hover:bg-amber-950/30 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400 gap-1 inline-flex"
                        >
                          <Recycle class="h-3 w-3" />
                          <span>{{ t('galaxyView.debris') }}</span>
                        </Badge>
                      </PopoverTrigger>
                      <PopoverContent class="w-auto p-3" side="top" align="start">
                        <div class="space-y-2">
                          <p class="text-xs font-semibold text-amber-700 dark:text-amber-400">{{ t('galaxyView.debrisField') }}</p>
                          <div class="space-y-1 text-xs">
                            <div class="flex items-center gap-2">
                              <ResourceIcon type="metal" size="sm" />
                              <span class="text-muted-foreground">{{ t('resources.metal') }}:</span>
                              <span class="font-medium">
                                {{ formatNumber(getDebrisFieldAt(currentGalaxy, currentSystem, slot.position)!.resources.metal) }}
                              </span>
                            </div>
                            <div class="flex items-center gap-2">
                              <ResourceIcon type="crystal" size="sm" />
                              <span class="text-muted-foreground">{{ t('resources.crystal') }}:</span>
                              <span class="font-medium">
                                {{ formatNumber(getDebrisFieldAt(currentGalaxy, currentSystem, slot.position)!.resources.crystal) }}
                              </span>
                            </div>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>

              <!-- 第三行：操作按钮 -->
              <div class="flex gap-1 pl-10">
                <TooltipProvider :delay-duration="300">
                  <Tooltip v-if="slot.planet && !isMyPlanet(slot.planet)">
                    <TooltipTrigger as-child>
                      <Button @click="showPlanetActions(slot.planet, 'spy')" variant="outline" size="sm" class="h-8 w-8 p-0">
                        <Eye class="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{{ t('galaxyView.scout') }}</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip v-if="slot.planet && !isMyPlanet(slot.planet)">
                    <TooltipTrigger as-child>
                      <Button @click="showPlanetActions(slot.planet, 'attack')" variant="outline" size="sm" class="h-8 w-8 p-0">
                        <Sword class="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{{ t('galaxyView.attack') }}</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip v-if="slot.planet && !isMyPlanet(slot.planet) && hasInterplanetaryMissiles">
                    <TooltipTrigger as-child>
                      <Button @click="showMissileAttackDialog(slot.planet)" variant="outline" size="sm" class="h-8 w-8 p-0">
                        <Bomb class="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{{ t('galaxyView.missileAttack') }}</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip v-if="slot.planet && !isMyPlanet(slot.planet) && getPlanetNPC(slot.planet)">
                    <TooltipTrigger as-child>
                      <Button @click="showPlanetActions(slot.planet, 'gift')" variant="outline" size="sm" class="h-8 w-8 p-0">
                        <Gift class="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{{ t('galaxyView.sendGift') }}</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip v-if="slot.planet && !isMyPlanet(slot.planet) && canScanPlanet(slot.planet)">
                    <TooltipTrigger as-child>
                      <Button @click="showPhalanxScanDialog(slot.planet)" variant="outline" size="sm" class="h-8 w-8 p-0">
                        <Radar class="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{{ t('galaxyView.phalanxScan') }}</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip v-if="!slot.planet">
                    <TooltipTrigger as-child>
                      <Button @click="showPlanetActions(null, 'colonize', slot.position)" variant="outline" size="sm" class="h-8 w-8 p-0">
                        <Rocket class="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{{ t('galaxyView.colonize') }}</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip v-if="slot.planet && isMyPlanet(slot.planet)">
                    <TooltipTrigger as-child>
                      <Button @click="switchToPlanet(slot.planet.id)" variant="outline" size="sm" class="h-8 w-8 p-0">
                        <Home class="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{{ t('galaxyView.switch') }}</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip v-if="getDebrisFieldAt(currentGalaxy, currentSystem, slot.position)">
                    <TooltipTrigger as-child>
                      <Button
                        @click="showPlanetActions(slot.planet, 'recycle', slot.position)"
                        variant="outline"
                        size="sm"
                        class="h-8 w-8 p-0"
                      >
                        <Recycle class="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{{ t('galaxyView.recycle') }}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            <!-- PC端布局：位置编号 + 星球信息（水平） -->
            <div class="hidden sm:flex items-center gap-4 flex-1 min-w-0">
              <!-- 位置编号 -->
              <div class="w-12 text-center shrink-0">
                <Badge variant="outline" class="text-sm">{{ slot.position }}</Badge>
              </div>

              <!-- 星球信息 -->
              <div class="flex-1 min-w-0">
                <div v-if="slot.planet" class="space-y-1">
                  <!-- PC端：标题和徽章 -->
                  <div class="flex items-center gap-2 flex-wrap">
                    <h3 class="font-semibold text-base">
                      {{ isMyPlanet(slot.planet) ? slot.planet.name : getNpcPlanetDisplayName(slot.planet) }}
                    </h3>
                    <Badge v-if="isMyPlanet(slot.planet)" variant="default" class="text-xs">{{ t('galaxyView.mine') }}</Badge>
                    <TooltipProvider v-else :delay-duration="300">
                      <Tooltip>
                        <TooltipTrigger as-child>
                          <Badge :variant="getRelationBadgeVariant(slot.planet)" class="text-xs cursor-default">
                            {{ getRelationStatusText(slot.planet) }}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent v-if="getReputationValue(slot.planet) !== null">
                          <p>
                            {{ t('diplomacy.reputation') }}:
                            <span :class="getReputationColor(getReputationValue(slot.planet))">
                              {{ getReputationValue(slot.planet)! > 0 ? '+' : '' }}{{ getReputationValue(slot.planet) }}
                            </span>
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <!-- NPC难度等级徽章 -->
                    <Badge
                      v-if="getNpcDifficultyLevel(slot.planet) !== null"
                      :variant="getDifficultyBadgeVariant(getNpcDifficultyLevel(slot.planet))"
                      class="text-xs"
                      :class="getDifficultyLevelColor(getNpcDifficultyLevel(slot.planet))"
                    >
                      Lv.{{ getNpcDifficultyLevel(slot.planet) }}
                    </Badge>
                    <!-- 残骸场徽章 -->
                    <Popover v-if="getDebrisFieldAt(currentGalaxy, currentSystem, slot.position)">
                      <PopoverTrigger as-child>
                        <Badge
                          variant="outline"
                          class="text-xs cursor-pointer hover:bg-amber-50 dark:hover:bg-amber-950/30 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400 gap-1"
                        >
                          <Recycle class="h-3 w-3" />
                          <span>{{ t('galaxyView.debris') }}</span>
                        </Badge>
                      </PopoverTrigger>
                      <PopoverContent class="w-auto p-3" side="top" align="start">
                        <div class="space-y-2">
                          <p class="text-xs font-semibold text-amber-700 dark:text-amber-400">{{ t('galaxyView.debrisField') }}</p>
                          <div class="space-y-1 text-xs">
                            <div class="flex items-center gap-2">
                              <ResourceIcon type="metal" size="sm" />
                              <span class="text-muted-foreground">{{ t('resources.metal') }}:</span>
                              <span class="font-medium">
                                {{ formatNumber(getDebrisFieldAt(currentGalaxy, currentSystem, slot.position)!.resources.metal) }}
                              </span>
                            </div>
                            <div class="flex items-center gap-2">
                              <ResourceIcon type="crystal" size="sm" />
                              <span class="text-muted-foreground">{{ t('resources.crystal') }}:</span>
                              <span class="font-medium">
                                {{ formatNumber(getDebrisFieldAt(currentGalaxy, currentSystem, slot.position)!.resources.crystal) }}
                              </span>
                            </div>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                    <!-- 矿脉储量徽章 -->
                    <Popover v-if="getOreDeposits(slot.planet)">
                      <PopoverTrigger as-child>
                        <Badge
                          variant="outline"
                          class="text-xs cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-950/30 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400 gap-1"
                        >
                          <Mountain class="h-3 w-3" />
                          <span>{{ t('galaxyView.deposits') }}</span>
                        </Badge>
                      </PopoverTrigger>
                      <PopoverContent class="w-auto p-3" side="top" align="start">
                        <div class="space-y-2">
                          <p class="text-xs font-semibold text-emerald-700 dark:text-emerald-400">{{ t('galaxyView.oreDeposits') }}</p>
                          <div class="space-y-1 text-xs">
                            <div class="flex items-center gap-2">
                              <ResourceIcon type="metal" size="sm" />
                              <span class="text-muted-foreground">{{ t('resources.metal') }}:</span>
                              <span
                                class="font-medium"
                                :class="getDepositStatus(getOreDeposits(slot.planet)!, 'metal') === 'depleted' ? 'text-destructive' : getDepositStatus(getOreDeposits(slot.planet)!, 'metal') === 'warning' ? 'text-yellow-600' : ''"
                              >
                                {{ formatDepositShort(getOreDeposits(slot.planet)!.metal) }}
                              </span>
                            </div>
                            <div class="flex items-center gap-2">
                              <ResourceIcon type="crystal" size="sm" />
                              <span class="text-muted-foreground">{{ t('resources.crystal') }}:</span>
                              <span
                                class="font-medium"
                                :class="getDepositStatus(getOreDeposits(slot.planet)!, 'crystal') === 'depleted' ? 'text-destructive' : getDepositStatus(getOreDeposits(slot.planet)!, 'crystal') === 'warning' ? 'text-yellow-600' : ''"
                              >
                                {{ formatDepositShort(getOreDeposits(slot.planet)!.crystal) }}
                              </span>
                            </div>
                            <div class="flex items-center gap-2">
                              <ResourceIcon type="deuterium" size="sm" />
                              <span class="text-muted-foreground">{{ t('resources.deuterium') }}:</span>
                              <span
                                class="font-medium"
                                :class="getDepositStatus(getOreDeposits(slot.planet)!, 'deuterium') === 'depleted' ? 'text-destructive' : getDepositStatus(getOreDeposits(slot.planet)!, 'deuterium') === 'warning' ? 'text-yellow-600' : ''"
                              >
                                {{ formatDepositShort(getOreDeposits(slot.planet)!.deuterium) }}
                              </span>
                            </div>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                    <!-- 月球徽章 -->
                    <Badge
                      v-if="slot.moon"
                      variant="outline"
                      class="text-xs cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-400 dark:border-slate-600 text-slate-600 dark:text-slate-400 gap-1"
                      @click.stop="switchToPlanet(slot.moon.id)"
                    >
                      <Moon class="h-3 w-3" />
                      <span>{{ slot.moon.name }}</span>
                    </Badge>
                  </div>
                  <!-- PC端：坐标 -->
                  <p class="text-xs text-muted-foreground">
                    [{{ slot.planet.position.galaxy }}:{{ slot.planet.position.system }}:{{ slot.planet.position.position }}]
                  </p>
                </div>
                <!-- 空位置 -->
                <div v-else class="space-y-1">
                  <div class="text-sm text-muted-foreground">{{ t('galaxyView.emptySlot') }}</div>
                  <!-- 残骸场徽章 - 空位置时也显示 -->
                  <Popover v-if="getDebrisFieldAt(currentGalaxy, currentSystem, slot.position)">
                    <PopoverTrigger as-child>
                      <Badge
                        variant="outline"
                        class="text-xs cursor-pointer hover:bg-amber-50 dark:hover:bg-amber-950/30 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400 gap-1 inline-flex"
                      >
                        <Recycle class="h-3 w-3" />
                        <span>{{ t('galaxyView.debris') }}</span>
                      </Badge>
                    </PopoverTrigger>
                    <PopoverContent class="w-auto p-3" side="top" align="start">
                      <div class="space-y-2">
                        <p class="text-xs font-semibold text-amber-700 dark:text-amber-400">{{ t('galaxyView.debrisField') }}</p>
                        <div class="space-y-1 text-xs">
                          <div class="flex items-center gap-2">
                            <ResourceIcon type="metal" size="sm" />
                            <span class="text-muted-foreground">{{ t('resources.metal') }}:</span>
                            <span class="font-medium">
                              {{ formatNumber(getDebrisFieldAt(currentGalaxy, currentSystem, slot.position)!.resources.metal) }}
                            </span>
                          </div>
                          <div class="flex items-center gap-2">
                            <ResourceIcon type="crystal" size="sm" />
                            <span class="text-muted-foreground">{{ t('resources.crystal') }}:</span>
                            <span class="font-medium">
                              {{ formatNumber(getDebrisFieldAt(currentGalaxy, currentSystem, slot.position)!.resources.crystal) }}
                            </span>
                          </div>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            <!-- 操作按钮 (PC端) -->
            <div class="hidden sm:flex gap-1 sm:gap-2 shrink-0">
              <TooltipProvider :delay-duration="300">
                <Tooltip v-if="slot.planet && !isMyPlanet(slot.planet)">
                  <TooltipTrigger as-child>
                    <Button @click="showPlanetActions(slot.planet, 'spy')" variant="outline" size="sm" class="h-8 w-8 p-0">
                      <Eye class="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{{ t('galaxyView.scout') }}</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip v-if="slot.planet && !isMyPlanet(slot.planet)">
                  <TooltipTrigger as-child>
                    <Button @click="showPlanetActions(slot.planet, 'attack')" variant="outline" size="sm" class="h-8 w-8 p-0">
                      <Sword class="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{{ t('galaxyView.attack') }}</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip v-if="slot.planet && !isMyPlanet(slot.planet) && hasInterplanetaryMissiles">
                  <TooltipTrigger as-child>
                    <Button @click="showMissileAttackDialog(slot.planet)" variant="outline" size="sm" class="h-8 w-8 p-0">
                      <Bomb class="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{{ t('galaxyView.missileAttack') }}</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip v-if="slot.planet && !isMyPlanet(slot.planet) && getPlanetNPC(slot.planet)">
                  <TooltipTrigger as-child>
                    <Button @click="showPlanetActions(slot.planet, 'gift')" variant="outline" size="sm" class="h-8 w-8 p-0">
                      <Gift class="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{{ t('galaxyView.sendGift') }}</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip v-if="slot.planet && !isMyPlanet(slot.planet) && canScanPlanet(slot.planet)">
                  <TooltipTrigger as-child>
                    <Button @click="showPhalanxScanDialog(slot.planet)" variant="outline" size="sm" class="h-8 w-8 p-0">
                      <Radar class="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{{ t('galaxyView.phalanxScan') }}</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip v-if="!slot.planet">
                  <TooltipTrigger as-child>
                    <Button @click="showPlanetActions(null, 'colonize', slot.position)" variant="outline" size="sm" class="h-8 w-8 p-0">
                      <Rocket class="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{{ t('galaxyView.colonize') }}</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip v-if="slot.planet && isMyPlanet(slot.planet)">
                  <TooltipTrigger as-child>
                    <Button @click="switchToPlanet(slot.planet.id)" variant="outline" size="sm" class="h-8 w-8 p-0">
                      <Home class="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{{ t('galaxyView.switch') }}</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip v-if="getDebrisFieldAt(currentGalaxy, currentSystem, slot.position)">
                  <TooltipTrigger as-child>
                    <Button
                      @click="showPlanetActions(slot.planet, 'recycle', slot.position)"
                      variant="outline"
                      size="sm"
                      class="h-8 w-8 p-0"
                    >
                      <Recycle class="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{{ t('galaxyView.recycle') }}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 导弹攻击对话框 -->
    <Dialog :open="missileDialogOpen" @update:open="missileDialogOpen = $event">
      <DialogContent class="max-w-md">
        <DialogHeader>
          <DialogTitle class="flex items-center gap-2">
            <div class="p-2 rounded-lg bg-destructive/10">
              <Rocket class="h-5 w-5 text-destructive" />
            </div>
            {{ t('galaxyView.missileAttackTitle') }}
          </DialogTitle>
          <DialogDescription v-if="missileTargetPlanet" class="flex items-center gap-2 pt-1">
            <MapPin class="h-4 w-4 text-muted-foreground" />
            {{
              t('galaxyView.missileAttackMessage').replace(
                '{coordinates}',
                `${missileTargetPlanet.position.galaxy}:${missileTargetPlanet.position.system}:${missileTargetPlanet.position.position}`
              )
            }}
          </DialogDescription>
        </DialogHeader>

        <div v-if="gameStore.currentPlanet && missileTargetPlanet" class="space-y-5 py-2">
          <!-- 导弹数量输入 -->
          <div class="space-y-3">
            <Label class="text-sm font-medium">{{ t('galaxyView.missileCount') }}</Label>
            <div class="flex items-center gap-3">
              <Input
                v-model.number="missileCount"
                type="number"
                min="1"
                :max="gameStore.currentPlanet.defense['interplanetaryMissile'] || 0"
                class="flex-1"
              />
              <Button variant="outline" size="sm" @click="missileCount = gameStore.currentPlanet?.defense['interplanetaryMissile'] || 0">
                {{ t('fleetView.all') }}
              </Button>
            </div>
            <div class="flex items-center gap-2 text-sm text-muted-foreground">
              <Crosshair class="h-4 w-4" />
              <span>{{ t('galaxyView.availableMissiles') }}:</span>
              <span class="font-medium text-foreground">{{ gameStore.currentPlanet.defense['interplanetaryMissile'] || 0 }}</span>
            </div>
          </div>

          <!-- 任务信息卡片 -->
          <div class="rounded-lg border bg-muted/30 p-4 space-y-3">
            <div class="flex items-center justify-between text-sm">
              <div class="flex items-center gap-2 text-muted-foreground">
                <Target class="h-4 w-4" />
                <span>{{ t('galaxyView.missileRange') }}</span>
              </div>
              <span class="font-medium">{{ calculateMissileRange() }} {{ t('galaxyView.systems') }}</span>
            </div>
            <Separator />
            <div class="flex items-center justify-between text-sm">
              <div class="flex items-center gap-2 text-muted-foreground">
                <Navigation class="h-4 w-4" />
                <span>{{ t('galaxyView.distance') }}</span>
              </div>
              <span class="font-medium">{{ formatDistance(calculateDistance(missileTargetPlanet)) }}</span>
            </div>
            <Separator />
            <div class="flex items-center justify-between text-sm">
              <div class="flex items-center gap-2 text-muted-foreground">
                <Clock class="h-4 w-4" />
                <span>{{ t('galaxyView.flightTime') }}</span>
              </div>
              <span class="font-medium">{{ formatFlightTime(calculateDistance(missileTargetPlanet)) }}</span>
            </div>
          </div>

          <!-- 超出射程警告 -->
          <div
            v-if="calculateDistance(missileTargetPlanet) > calculateMissileRange()"
            class="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm"
          >
            <AlertTriangle class="h-4 w-4 shrink-0" />
            <span>{{ t('galaxyView.outOfRange') }}</span>
          </div>
        </div>

        <DialogFooter class="gap-3">
          <Button variant="outline" @click="missileDialogOpen = false">
            {{ t('galaxyView.cancel') }}
          </Button>
          <Button
            variant="destructive"
            @click="launchMissileAttack"
            :disabled="!missileCount || missileCount < 1 || calculateDistance(missileTargetPlanet!) > calculateMissileRange()"
          >
            <Rocket class="h-4 w-4 mr-2" />
            {{ t('galaxyView.launchMissile') }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- 快速派遣对话框 -->
    <AlertDialog :open="alertDialogOpen" @update:open="alertDialogOpen = $event">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{{ alertDialogTitle }}</AlertDialogTitle>
          <AlertDialogDescription class="whitespace-pre-line">
            {{ alertDialogMessage }}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{{ t('common.cancel') }}</AlertDialogCancel>
          <AlertDialogAction @click="handleAlertDialogConfirm">{{ t('common.confirm') }}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    <!-- 传感器阵列扫描对话框 -->
    <Dialog :open="phalanxDialogOpen" @update:open="phalanxDialogOpen = $event">
      <DialogContent class="max-w-lg">
        <DialogHeader>
          <DialogTitle class="flex items-center gap-2">
            <Radar class="h-5 w-5" />
            {{ t('galaxyView.phalanxScanTitle') }}
          </DialogTitle>
          <DialogDescription v-if="phalanxTargetPlanet">
            {{
              t('galaxyView.phalanxScanDescription').replace(
                '{coordinates}',
                `${phalanxTargetPlanet.position.galaxy}:${phalanxTargetPlanet.position.system}:${phalanxTargetPlanet.position.position}`
              )
            }}
          </DialogDescription>
        </DialogHeader>

        <div class="space-y-4">
          <!-- 扫描信息 -->
          <div class="flex items-center justify-between text-sm">
            <span class="text-muted-foreground">{{ t('galaxyView.phalanxCost') }}:</span>
            <div class="flex items-center gap-1">
              <ResourceIcon type="deuterium" size="sm" />
              <span>{{ formatNumber(PHALANX_SCAN_COST) }}</span>
            </div>
          </div>

          <!-- 扫描按钮 -->
          <Button v-if="phalanxScanResults.length === 0 && !phalanxScanning" @click="executePhalanxScan" class="w-full">
            <Radar class="h-4 w-4 mr-2" />
            {{ t('galaxyView.phalanxScan') }}
          </Button>

          <!-- 扫描中 -->
          <div v-if="phalanxScanning" class="flex items-center justify-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>

          <!-- 扫描结果 -->
          <div v-if="!phalanxScanning && phalanxScanResults.length > 0" class="space-y-3">
            <div class="text-sm font-medium">
              {{ t('galaxyView.phalanxFleetDetected').replace('{count}', String(phalanxScanResults.length)) }}
            </div>
            <div class="space-y-2 max-h-64 overflow-y-auto">
              <div v-for="fleet in phalanxScanResults" :key="fleet.id" class="p-3 border rounded-lg space-y-2 text-sm">
                <div class="flex items-center justify-between">
                  <Badge>{{ getMissionTypeText(fleet.missionType) }}</Badge>
                  <Badge :variant="fleet.status === 'outbound' ? 'default' : 'secondary'">
                    {{ fleet.status === 'outbound' ? t('galaxyView.phalanxStatusOutbound') : t('galaxyView.phalanxStatusReturning') }}
                  </Badge>
                </div>
                <div class="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span class="text-muted-foreground">{{ t('galaxyView.phalanxOrigin') }}:</span>
                    <span class="ml-1">
                      {{ formatCoords(getPlanetPositionById(fleet.originPlanetId) || { galaxy: 0, system: 0, position: 0 }) }}
                    </span>
                  </div>
                  <div>
                    <span class="text-muted-foreground">{{ t('galaxyView.phalanxDestination') }}:</span>
                    <span class="ml-1">{{ formatCoords(fleet.targetPosition) }}</span>
                  </div>
                  <div>
                    <span class="text-muted-foreground">{{ t('galaxyView.phalanxArrival') }}:</span>
                    <span class="ml-1">{{ formatTime(Math.max(0, Math.floor((fleet.arrivalTime - Date.now()) / 1000))) }}</span>
                  </div>
                  <div v-if="fleet.returnTime">
                    <span class="text-muted-foreground">{{ t('galaxyView.phalanxReturn') }}:</span>
                    <span class="ml-1">{{ formatTime(Math.max(0, Math.floor((fleet.returnTime - Date.now()) / 1000))) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 无舰队 -->
          <div
            v-if="!phalanxScanning && phalanxScanResults.length === 0 && phalanxDialogOpen"
            class="text-center py-4 text-muted-foreground"
          >
            {{ t('galaxyView.phalanxNoFleets') }}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" @click="phalanxDialogOpen = false">{{ t('common.close') }}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
  import { useGameStore } from '@/stores/gameStore'
  import { useUniverseStore } from '@/stores/universeStore'
  import { useNPCStore } from '@/stores/npcStore'
  import { useI18n } from '@/composables/useI18n'
  import { ref, onMounted, computed } from 'vue'
  import type { Planet, DebrisField } from '@/types/game'
  import { RelationStatus } from '@/types/game'
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
  import { Button } from '@/components/ui/button'
  import { Label } from '@/components/ui/label'
  import { Input } from '@/components/ui/input'
  import { Badge } from '@/components/ui/badge'
  import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
  import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
  import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
  import { Separator } from '@/components/ui/separator'
  import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
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
  import ResourceIcon from '@/components/common/ResourceIcon.vue'
  import {
    Home,
    Eye,
    Sword,
    Rocket,
    Recycle,
    Gift,
    Globe,
    Bomb,
    Moon,
    Radar,
    Mountain,
    MapPin,
    Crosshair,
    Target,
    Navigation,
    Clock,
    AlertTriangle
  } from 'lucide-vue-next'
  import { useRouter, useRoute } from 'vue-router'
  import * as gameLogic from '@/logic/gameLogic'
  import * as moonLogic from '@/logic/moonLogic'
  import * as oreDepositLogic from '@/logic/oreDepositLogic'
  import { formatNumber, formatTime } from '@/utils/format'
  import { BuildingType, MissionType } from '@/types/game'
  import type { FleetMission, OreDeposits } from '@/types/game'

  const gameStore = useGameStore()
  const universeStore = useUniverseStore()
  const npcStore = useNPCStore()
  const router = useRouter()
  const route = useRoute()
  const { t } = useI18n()

  // AlertDialog 状态
  const alertDialogOpen = ref(false)
  const alertDialogTitle = ref('')
  const alertDialogMessage = ref('')
  const alertDialogConfirmAction = ref<(() => void) | null>(null)

  // 导弹攻击对话框状态
  const missileDialogOpen = ref(false)
  const missileTargetPlanet = ref<Planet | null>(null)
  const missileCount = ref(1)

  // 传感器阵列扫描对话框状态
  const phalanxDialogOpen = ref(false)
  const phalanxTargetPlanet = ref<Planet | null>(null)
  const phalanxScanResults = ref<FleetMission[]>([])
  const phalanxScanning = ref(false)

  const selectedGalaxy = ref(1)
  const selectedSystem = ref(1)
  const currentGalaxy = ref(1)
  const currentSystem = ref(1)

  // 保存要高亮的NPC ID（从URL参数初始化，之后即使URL清除也保持）
  const highlightNpcId = ref<string | undefined>(undefined)

  // 获取要高亮的NPC对象
  const highlightedNpc = computed(() => {
    if (!highlightNpcId.value) return null
    return npcStore.npcs.find(n => n.id === highlightNpcId.value) || null
  })

  const systemSlots = ref<Array<{ position: number; planet: Planet | null; moon: Planet | null }>>([])

  // 获取玩家的母星
  const homePlanet = computed(() => {
    // 第一个非月球星球就是母星
    return gameStore.player.planets.find(p => !p.isMoon)
  })

  // 获取玩家所有非月球星球
  const myPlanets = computed(() => {
    return gameStore.player.planets.filter(p => !p.isMoon)
  })

  // 检查当前星球是否有星际导弹
  const hasInterplanetaryMissiles = computed(() => {
    if (!gameStore.currentPlanet) return false
    return (gameStore.currentPlanet.defense['interplanetaryMissile'] || 0) > 0
  })

  // 判断当前是否在母星所在星系
  const isInHomePlanetSystem = computed(() => {
    if (!homePlanet.value) return false
    return currentGalaxy.value === homePlanet.value.position.galaxy && currentSystem.value === homePlanet.value.position.system
  })

  onMounted(() => {
    // 从URL参数中读取并保存高亮NPC ID
    if (route.query.highlightNpc) {
      highlightNpcId.value = route.query.highlightNpc as string
    }

    // 优先检查URL参数中的星系坐标
    const queryGalaxy = route.query.galaxy ? Number(route.query.galaxy) : null
    const querySystem = route.query.system ? Number(route.query.system) : null

    if (queryGalaxy && querySystem) {
      // 如果URL中有坐标参数，跳转到指定星系
      currentGalaxy.value = queryGalaxy
      currentSystem.value = querySystem
      selectedGalaxy.value = queryGalaxy
      selectedSystem.value = querySystem
      loadSystem()
    } else if (gameStore.currentPlanet) {
      // 否则默认显示当前星球所在的星系
      currentGalaxy.value = gameStore.currentPlanet.position.galaxy
      currentSystem.value = gameStore.currentPlanet.position.system
      selectedGalaxy.value = currentGalaxy.value
      selectedSystem.value = currentSystem.value
      loadSystem()
    }
  })

  const getSystemPlanets = (galaxy: number, system: number): Array<{ position: number; planet: Planet | null; moon: Planet | null }> => {
    const positions = gameLogic.generateSystemPositions(galaxy, system)
    return positions.map(pos => {
      const key = gameLogic.generatePositionKey(galaxy, system, pos.position)
      // 先从玩家星球中查找（非月球），再从宇宙地图中查找
      const planet =
        gameStore.player.planets.find(
          p => !p.isMoon && p.position.galaxy === galaxy && p.position.system === system && p.position.position === pos.position
        ) ||
        universeStore.planets[key] ||
        null

      // 查找该位置的月球（如果有星球的话）
      let moon: Planet | null = null
      if (planet) {
        // 从玩家星球中查找月球
        moon = gameStore.player.planets.find(p => p.isMoon && p.parentPlanetId === planet.id) || null
      }

      return { position: pos.position, planet, moon }
    })
  }

  // 获取指定位置的残骸场
  const getDebrisFieldAt = (galaxy: number, system: number, position: number): DebrisField | null => {
    const debrisId = `debris_${galaxy}_${system}_${position}`
    return universeStore.debrisFields[debrisId] || null
  }

  // 获取星球的矿脉储量信息
  const getOreDeposits = (planet: Planet | null): OreDeposits | null => {
    if (!planet || planet.isMoon) return null
    return planet.oreDeposits || null
  }

  // 格式化矿脉储量（短格式）
  const formatDepositShort = (value: number): string => {
    if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
    if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`
    return String(Math.floor(value))
  }

  // 获取矿脉储量百分比对应的颜色状态
  const getDepositStatus = (deposits: OreDeposits, resourceType: 'metal' | 'crystal' | 'deuterium'): 'normal' | 'warning' | 'depleted' => {
    if (oreDepositLogic.isDepositDepleted(deposits, resourceType)) return 'depleted'
    if (oreDepositLogic.isDepositWarning(deposits, resourceType)) return 'warning'
    return 'normal'
  }

  // 加载星系
  const loadSystem = () => {
    currentGalaxy.value = selectedGalaxy.value
    currentSystem.value = selectedSystem.value
    systemSlots.value = getSystemPlanets(currentGalaxy.value, currentSystem.value)
  }

  // 跳转到指定星球的星系
  const goToPlanet = (planet: Planet) => {
    currentGalaxy.value = planet.position.galaxy
    currentSystem.value = planet.position.system
    selectedGalaxy.value = currentGalaxy.value
    selectedSystem.value = currentSystem.value
    systemSlots.value = getSystemPlanets(currentGalaxy.value, currentSystem.value)
  }

  // 判断是否为我的星球
  const isMyPlanet = (planet: Planet | null): boolean => {
    if (!planet) return false
    return planet.ownerId === gameStore.player.id
  }

  // 判断星球是否属于高亮显示的NPC
  const isHighlightedNpcPlanet = (planet: Planet | null): boolean => {
    if (!planet || !highlightNpcId.value) return false
    const npc = npcStore.npcs.find(n => n.id === highlightNpcId.value)
    if (!npc) return false
    return npc.planets.some(p => p.id === planet.id)
  }

  // 获取星球所属的NPC
  const getPlanetNPC = (planet: Planet | null) => {
    if (!planet || isMyPlanet(planet)) return null
    // 通过坐标匹配，而不是ID，因为universeStore中的星球和npcStore中的星球可能是不同的对象
    return npcStore.npcs.find(npc =>
      npc.planets.some(
        p =>
          p.position.galaxy === planet.position.galaxy &&
          p.position.system === planet.position.system &&
          p.position.position === planet.position.position
      )
    )
  }

  // 获取外交关系
  const getRelation = (planet: Planet | null) => {
    const npc = getPlanetNPC(planet)
    if (!npc) return null
    // 从NPC的relations中获取对玩家的关系
    return npc.relations?.[gameStore.player.id]
  }

  // 获取关系状态Badge样式
  const getRelationBadgeVariant = (planet: Planet | null) => {
    const relation = getRelation(planet)
    if (!relation) return 'secondary'

    switch (relation.status) {
      case RelationStatus.Friendly:
        return 'default'
      case RelationStatus.Hostile:
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  // 获取关系状态文本
  const getRelationStatusText = (planet: Planet | null) => {
    const relation = getRelation(planet)
    if (!relation) return t('diplomacy.status.neutral')

    switch (relation.status) {
      case RelationStatus.Friendly:
        return t('diplomacy.status.friendly')
      case RelationStatus.Hostile:
        return t('diplomacy.status.hostile')
      default:
        return t('diplomacy.status.neutral')
    }
  }

  // 获取好感度值
  const getReputationValue = (planet: Planet | null): number | null => {
    const relation = getRelation(planet)
    return relation?.reputation ?? null
  }

  // 获取好感度颜色
  const getReputationColor = (reputation: number | null) => {
    if (reputation === null) return 'text-muted-foreground'
    if (reputation >= 20) return 'text-green-600 dark:text-green-400'
    if (reputation <= -20) return 'text-red-600 dark:text-red-400'
    return 'text-muted-foreground'
  }

  // 获取NPC星球的显示名称 - 使用"XXX的星球"格式，如果有备注则显示"NPC名称(备注)的星球"
  const getNpcPlanetDisplayName = (planet: Planet | null): string => {
    if (!planet) return ''
    const npc = getPlanetNPC(planet)
    if (npc) {
      const displayName = npc.note ? `${npc.name}(${npc.note})` : npc.name
      return t('galaxyView.npcPlanetName').replace('{name}', displayName)
    }
    return planet.name
  }

  // 获取NPC难度等级
  const getNpcDifficultyLevel = (planet: Planet | null): number | null => {
    const npc = getPlanetNPC(planet)
    return npc?.difficultyLevel ?? null
  }

  // 获取NPC难度等级颜色
  const getDifficultyLevelColor = (level: number | null): string => {
    if (level === null) return 'text-muted-foreground'
    if (level <= 1) return 'text-green-600 dark:text-green-400' // 新手
    if (level <= 2) return 'text-lime-600 dark:text-lime-400' // 简单
    if (level <= 3) return 'text-yellow-600 dark:text-yellow-400' // 普通
    if (level <= 4) return 'text-orange-600 dark:text-orange-400' // 困难
    if (level <= 5) return 'text-red-600 dark:text-red-400' // 专家
    if (level <= 6) return 'text-purple-600 dark:text-purple-400' // 大师
    return 'text-pink-600 dark:text-pink-400' // 传奇及以上
  }

  // 获取NPC难度等级Badge样式
  const getDifficultyBadgeVariant = (level: number | null): 'default' | 'secondary' | 'destructive' | 'outline' => {
    if (level === null) return 'outline'
    if (level <= 2) return 'secondary'
    if (level <= 4) return 'default'
    return 'destructive'
  }

  // 切换到指定星球
  const switchToPlanet = (planetId: string) => {
    gameStore.currentPlanetId = planetId
    router.push('/')
  }

  // AlertDialog 确认处理
  const handleAlertDialogConfirm = () => {
    if (alertDialogConfirmAction.value) {
      alertDialogConfirmAction.value()
    }
    alertDialogOpen.value = false
  }

  // 显示星球操作
  const showPlanetActions = (planet: Planet | null, action: 'spy' | 'attack' | 'colonize' | 'recycle' | 'gift', position?: number) => {
    const targetPos = planet ? planet.position : { galaxy: currentGalaxy.value, system: currentSystem.value, position: position! }
    const coordinates = `${targetPos.galaxy}:${targetPos.system}:${targetPos.position}`

    let message = ''
    let title = ''
    if (action === 'spy') {
      title = t('galaxyView.scoutPlanetTitle')
      message = t('galaxyView.scoutPlanetMessage').replace('{coordinates}', coordinates)
    } else if (action === 'attack') {
      title = t('galaxyView.attackPlanetTitle')
      message = t('galaxyView.attackPlanetMessage').replace('{coordinates}', coordinates)
    } else if (action === 'colonize') {
      title = t('galaxyView.colonizePlanetTitle')
      message = t('galaxyView.colonizePlanetMessage').replace('{coordinates}', coordinates)
    } else if (action === 'recycle') {
      title = t('galaxyView.recyclePlanetTitle')
      message = t('galaxyView.recyclePlanetMessage').replace('{coordinates}', coordinates)
    } else if (action === 'gift') {
      title = t('galaxyView.giftPlanetTitle')
      message = t('galaxyView.giftPlanetMessage').replace('{coordinates}', coordinates)
    }

    // 设置对话框状态
    alertDialogTitle.value = title
    alertDialogMessage.value = message
    alertDialogConfirmAction.value = () => {
      // 跳转到舰队页面并填充目标坐标
      router.push({
        path: '/fleet',
        query: {
          galaxy: targetPos.galaxy,
          system: targetPos.system,
          position: targetPos.position,
          mission: action === 'gift' ? undefined : action,
          gift: action === 'gift' ? '1' : undefined
        }
      })
    }
    alertDialogOpen.value = true
  }

  // 显示导弹攻击对话框
  const showMissileAttackDialog = (planet: Planet) => {
    missileTargetPlanet.value = planet
    missileCount.value = 1
    missileDialogOpen.value = true
  }

  // 执行导弹攻击
  const launchMissileAttack = () => {
    if (!missileTargetPlanet.value || !gameStore.currentPlanet) return

    // 导入missileLogic进行验证和执行
    import('@/logic/missileLogic').then(missileLogic => {
      const validation = missileLogic.validateMissileLaunch(
        gameStore.currentPlanet!,
        missileTargetPlanet.value!.position,
        missileCount.value,
        gameStore.player.technologies
      )

      if (!validation.valid) {
        alertDialogTitle.value = t('errors.launchFailed')
        alertDialogMessage.value = t(validation.reason || 'errors.unknown')
        alertDialogOpen.value = true
        return
      }

      // 创建导弹攻击任务
      const missileAttack = missileLogic.createMissileAttack(
        gameStore.player.id,
        gameStore.currentPlanet!,
        missileTargetPlanet.value!.position,
        missileTargetPlanet.value!.id,
        missileCount.value
      )

      // 扣除导弹
      missileLogic.executeMissileLaunch(gameStore.currentPlanet!, missileCount.value)

      // 添加到玩家的导弹攻击列表
      gameStore.player.missileAttacks.push(missileAttack)

      // 关闭对话框
      missileDialogOpen.value = false

      // 显示成功提示
      alertDialogTitle.value = t('common.success')
      alertDialogMessage.value = t('galaxyView.missileLaunched')
      alertDialogOpen.value = true
    })
  }

  // 计算导弹射程
  const calculateMissileRange = () => {
    const impulseDriveLevel = gameStore.player.technologies['impulseDrive'] || 0
    if (impulseDriveLevel === 0) return 0
    return 5 * impulseDriveLevel - 1
  }

  // 计算到目标的距离
  const calculateDistance = (target: Planet | null): number => {
    if (!gameStore.currentPlanet || !target) return 0
    const from = gameStore.currentPlanet.position
    const to = target.position
    if (from.galaxy !== to.galaxy) return Infinity
    return Math.abs(from.system - to.system)
  }

  // 格式化距离显示
  const formatDistance = (distance: number): string => {
    if (!isFinite(distance)) return t('galaxyView.outOfRange')
    return `${distance} ${t('galaxyView.systems')}`
  }

  // 格式化飞行时间
  const formatFlightTime = (distance: number): string => {
    if (!isFinite(distance)) return t('galaxyView.outOfRange')
    const seconds = 30 + distance * 60
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  // ========== 传感器阵列扫描功能 ==========

  // 获取拥有传感器阵列的月球列表
  const moonsWithPhalanx = computed(() => {
    return gameStore.player.planets.filter(p => {
      if (!p.isMoon) return false
      const phalanxLevel = p.buildings[BuildingType.SensorPhalanx] || 0
      return phalanxLevel > 0
    })
  })

  // 检查是否可以扫描目标（需要有传感器阵列的月球在范围内）
  const canScanPlanet = (targetPlanet: Planet | null): boolean => {
    if (!targetPlanet) return false
    if (isMyPlanet(targetPlanet)) return false

    // 检查是否有月球的传感器阵列可以扫描目标
    return moonsWithPhalanx.value.some(moon => {
      const phalanxLevel = moon.buildings[BuildingType.SensorPhalanx] || 0
      return moonLogic.isInSensorPhalanxRange(moon.position, targetPlanet.position, phalanxLevel)
    })
  }

  // 获取可以扫描目标的月球
  const getMoonForScan = (targetPlanet: Planet): Planet | null => {
    return (
      moonsWithPhalanx.value.find(moon => {
        const phalanxLevel = moon.buildings[BuildingType.SensorPhalanx] || 0
        return moonLogic.isInSensorPhalanxRange(moon.position, targetPlanet.position, phalanxLevel)
      }) || null
    )
  }

  // 计算扫描消耗的氘（每次扫描消耗5000氘）
  const PHALANX_SCAN_COST = 5000

  // 显示传感器阵列扫描对话框
  const showPhalanxScanDialog = (planet: Planet) => {
    phalanxTargetPlanet.value = planet
    phalanxScanResults.value = []
    phalanxScanning.value = false
    phalanxDialogOpen.value = true
  }

  // 根据星球ID获取星球坐标
  const getPlanetPositionById = (planetId: string): { galaxy: number; system: number; position: number } | null => {
    // 先从玩家星球中查找
    const playerPlanet = gameStore.player.planets.find(p => p.id === planetId)
    if (playerPlanet) return playerPlanet.position

    // 再从NPC星球中查找
    for (const npc of npcStore.npcs) {
      const npcPlanet = npc.planets.find(p => p.id === planetId)
      if (npcPlanet) return npcPlanet.position
    }

    // 从宇宙地图中查找
    for (const key in universeStore.planets) {
      const planet = universeStore.planets[key]
      if (planet && planet.id === planetId) return planet.position
    }

    return null
  }

  // 执行传感器阵列扫描
  const executePhalanxScan = () => {
    if (!phalanxTargetPlanet.value) return

    const scanMoon = getMoonForScan(phalanxTargetPlanet.value)
    if (!scanMoon) {
      alertDialogTitle.value = t('errors.scanFailed')
      alertDialogMessage.value = t('galaxyView.phalanxNoMoon')
      alertDialogOpen.value = true
      return
    }

    // 检查氘是否足够
    if (scanMoon.resources.deuterium < PHALANX_SCAN_COST) {
      alertDialogTitle.value = t('errors.scanFailed')
      alertDialogMessage.value = t('galaxyView.phalanxInsufficientDeuterium')
      alertDialogOpen.value = true
      return
    }

    // 扣除氘
    scanMoon.resources.deuterium -= PHALANX_SCAN_COST

    phalanxScanning.value = true

    // 模拟扫描延迟
    setTimeout(() => {
      // 扫描NPC的舰队任务
      const targetPos = phalanxTargetPlanet.value!.position
      const npc = getPlanetNPC(phalanxTargetPlanet.value)

      // 收集相关的舰队任务
      const detectedFleets: FleetMission[] = []

      // 检查NPC的舰队任务
      if (npc) {
        npc.fleetMissions?.forEach(mission => {
          // 获取出发地坐标
          const originPos = getPlanetPositionById(mission.originPlanetId)

          // 检查任务是否与目标星球相关（出发地或目的地）
          const isFromTarget =
            originPos &&
            originPos.galaxy === targetPos.galaxy &&
            originPos.system === targetPos.system &&
            originPos.position === targetPos.position
          const isToTarget =
            mission.targetPosition.galaxy === targetPos.galaxy &&
            mission.targetPosition.system === targetPos.system &&
            mission.targetPosition.position === targetPos.position

          if (isFromTarget || isToTarget) {
            detectedFleets.push(mission)
          }
        })
      }

      // 也检查玩家自己发往该星球的任务（自己的任务自己当然知道，但扫描也能看到）
      gameStore.player.fleetMissions?.forEach(mission => {
        const isToTarget =
          mission.targetPosition.galaxy === targetPos.galaxy &&
          mission.targetPosition.system === targetPos.system &&
          mission.targetPosition.position === targetPos.position

        if (isToTarget) {
          detectedFleets.push(mission)
        }
      })

      phalanxScanResults.value = detectedFleets
      phalanxScanning.value = false
    }, 1000)
  }

  // 获取任务类型文本
  const getMissionTypeText = (missionType: MissionType): string => {
    switch (missionType) {
      case MissionType.Attack:
        return t('fleetView.attack')
      case MissionType.Transport:
        return t('fleetView.transport')
      case MissionType.Deploy:
        return t('fleetView.deploy')
      case MissionType.Spy:
        return t('fleetView.spy')
      case MissionType.Colonize:
        return t('fleetView.colonize')
      case MissionType.Recycle:
        return t('fleetView.recycle')
      case MissionType.Destroy:
        return t('fleetView.destroy')
      case MissionType.Expedition:
        return t('fleetView.expedition')
      default:
        return missionType
    }
  }

  // 格式化坐标
  const formatCoords = (pos: { galaxy: number; system: number; position: number }): string => {
    return `[${pos.galaxy}:${pos.system}:${pos.position}]`
  }
</script>
