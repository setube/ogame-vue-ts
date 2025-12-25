<template>
  <Popover>
    <PopoverTrigger as-child>
      <span class="cursor-pointer touch-manipulation" :class="value >= 1000 ? 'underline decoration-dotted underline-offset-4 ' : ''">
        {{ formatNumber(value, 1) }}
      </span>
    </PopoverTrigger>
    <PopoverContent class="w-auto p-2 z-100" side="top" align="center">
      <p class="font-mono text-sm">{{ props.value.toLocaleString() }}</p>
    </PopoverContent>
  </Popover>
</template>

<script setup lang="ts">
  import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
  import { formatNumber } from '@/utils/format'

  const props = defineProps<{
    value: number
  }>()
</script>
