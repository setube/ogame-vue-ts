<template>
  <AlertDialogPortal>
    <AlertDialogOverlay
      data-slot="alert-dialog-overlay"
      class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/80"
    />
    <AlertDialogContent
      data-slot="alert-dialog-content"
      v-bind="{ ...$attrs, ...forwarded }"
      :class="
        cn(
          'bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-1/2 left-1/2 z-50 grid w-[calc(100vw-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 rounded-lg border p-6 shadow-lg duration-200',
          props.class
        )
      "
    >
      <slot />
    </AlertDialogContent>
  </AlertDialogPortal>
</template>

<script setup lang="ts">
  import type { AlertDialogContentEmits, AlertDialogContentProps } from 'reka-ui'
  import type { HTMLAttributes } from 'vue'
  import { reactiveOmit } from '@vueuse/core'
  import { AlertDialogContent, AlertDialogOverlay, AlertDialogPortal, useForwardPropsEmits } from 'reka-ui'
  import { cn } from '@/lib/utils'

  defineOptions({
    inheritAttrs: false
  })

  const props = defineProps<AlertDialogContentProps & { class?: HTMLAttributes['class'] }>()
  const emits = defineEmits<AlertDialogContentEmits>()

  const delegatedProps = reactiveOmit(props, 'class')

  const forwarded = useForwardPropsEmits(delegatedProps, emits)
</script>
