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
                      <h3 class="font-semibold text-sm truncate">{{ slot.planet.name }}</h3>
                      <span class="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                        [{{ slot.planet.position.galaxy }}:{{ slot.planet.position.system }}:{{ slot.planet.position.position }}]
                      </span>
                      <Badge v-if="isMyPlanet(slot.planet)" variant="default" class="text-xs shrink-0">
                        {{ t('galaxyView.mine') }}
                      </Badge>
                      <Badge v-else :variant="getRelationBadgeVariant(slot.planet)" class="text-xs shrink-0">
                        {{ getRelationStatusText(slot.planet) }}
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
                    <!-- 第二行：好感度 -->
                    <div v-if="!isMyPlanet(slot.planet) && getReputationValue(slot.planet) !== null" class="text-xs">
                      <span class="text-muted-foreground">{{ t('diplomacy.reputation') }}:</span>
                      <span class="ml-1 font-semibold" :class="getReputationColor(getReputationValue(slot.planet))">
                        {{ getReputationValue(slot.planet)! > 0 ? '+' : '' }}{{ getReputationValue(slot.planet) }}
                      </span>
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
                    <h3 class="font-semibold text-base">{{ slot.planet.name }}</h3>
                    <Badge v-if="isMyPlanet(slot.planet)" variant="default" class="text-xs">{{ t('galaxyView.mine') }}</Badge>
                    <Badge v-else :variant="getRelationBadgeVariant(slot.planet)" class="text-xs">
                      {{ getRelationStatusText(slot.planet) }}
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
                  </div>
                  <!-- PC端：坐标 -->
                  <p class="text-xs text-muted-foreground">
                    [{{ slot.planet.position.galaxy }}:{{ slot.planet.position.system }}:{{ slot.planet.position.position }}]
                  </p>
                  <!-- PC端：好感度显示（仅NPC星球） -->
                  <div v-if="!isMyPlanet(slot.planet) && getReputationValue(slot.planet) !== null" class="text-xs">
                    <span class="text-muted-foreground">{{ t('diplomacy.reputation') }}:</span>
                    <span class="ml-1 font-semibold" :class="getReputationColor(getReputationValue(slot.planet))">
                      {{ getReputationValue(slot.planet)! > 0 ? '+' : '' }}{{ getReputationValue(slot.planet) }}
                    </span>
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{{ t('galaxyView.missileAttackTitle') }}</DialogTitle>
          <DialogDescription v-if="missileTargetPlanet">
            {{
              t('galaxyView.missileAttackMessage').replace(
                '{coordinates}',
                `${missileTargetPlanet.position.galaxy}:${missileTargetPlanet.position.system}:${missileTargetPlanet.position.position}`
              )
            }}
          </DialogDescription>
        </DialogHeader>

        <div v-if="gameStore.currentPlanet && missileTargetPlanet" class="space-y-4">
          <!-- 导弹数量输入 -->
          <div class="space-y-2">
            <Label>{{ t('galaxyView.missileCount') }}</Label>
            <Input
              v-model.number="missileCount"
              type="number"
              min="1"
              :max="gameStore.currentPlanet.defense['interplanetaryMissile'] || 0"
            />
            <p class="text-sm text-muted-foreground">
              {{ t('galaxyView.availableMissiles') }}: {{ gameStore.currentPlanet.defense['interplanetaryMissile'] || 0 }}
            </p>
          </div>

          <!-- 射程和距离信息 -->
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-muted-foreground">{{ t('galaxyView.missileRange') }}:</span>
              <span>{{ calculateMissileRange() }} {{ t('galaxyView.systems') }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted-foreground">{{ t('galaxyView.distance') }}:</span>
              <span>{{ calculateDistance(missileTargetPlanet) }} {{ t('galaxyView.systems') }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted-foreground">{{ t('galaxyView.flightTime') }}:</span>
              <span>{{ formatFlightTime(calculateDistance(missileTargetPlanet)) }}</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" @click="missileDialogOpen = false">{{ t('galaxyView.cancel') }}</Button>
          <Button @click="launchMissileAttack">{{ t('galaxyView.launchMissile') }}</Button>
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
  import ResourceIcon from '@/components/ResourceIcon.vue'
  import { Home, Eye, Sword, Rocket, Recycle, Gift, Globe, Bomb } from 'lucide-vue-next'
  import { useRouter, useRoute } from 'vue-router'
  import * as gameLogic from '@/logic/gameLogic'
  import { formatNumber } from '@/utils/format'

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

  const systemSlots = ref<Array<{ position: number; planet: Planet | null }>>([])

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

      // 立即清除URL参数，但保持本地变量中的highlightNpcId
      clearUrlParams()
    } else if (gameStore.currentPlanet) {
      // 否则默认显示当前星球所在的星系
      currentGalaxy.value = gameStore.currentPlanet.position.galaxy
      currentSystem.value = gameStore.currentPlanet.position.system
      selectedGalaxy.value = currentGalaxy.value
      selectedSystem.value = currentSystem.value
      loadSystem()
    }
  })

  const getSystemPlanets = (galaxy: number, system: number): Array<{ position: number; planet: Planet | null }> => {
    const positions = gameLogic.generateSystemPositions(galaxy, system)
    return positions.map(pos => {
      const key = gameLogic.generatePositionKey(galaxy, system, pos.position)
      // 先从玩家星球中查找，再从宇宙地图中查找
      const planet =
        gameStore.player.planets.find(
          p => p.position.galaxy === galaxy && p.position.system === system && p.position.position === pos.position
        ) ||
        universeStore.planets[key] ||
        null
      return { position: pos.position, planet }
    })
  }

  // 获取指定位置的残骸场
  const getDebrisFieldAt = (galaxy: number, system: number, position: number): DebrisField | null => {
    const debrisId = `debris_${galaxy}_${system}_${position}`
    return universeStore.debrisFields[debrisId] || null
  }

  // 清除URL参数
  const clearUrlParams = () => {
    if (route.query.highlightNpc || route.query.galaxy || route.query.system) {
      router.replace({ query: {} })
    }
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
    return gameStore.player.diplomaticRelations?.[npc.id]
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
  const calculateDistance = (target: Planet) => {
    if (!gameStore.currentPlanet) return 0
    const from = gameStore.currentPlanet.position
    const to = target.position
    if (from.galaxy !== to.galaxy) return Infinity
    return Math.abs(from.system - to.system)
  }

  // 格式化飞行时间
  const formatFlightTime = (distance: number) => {
    const seconds = 30 + distance * 60
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }
</script>
