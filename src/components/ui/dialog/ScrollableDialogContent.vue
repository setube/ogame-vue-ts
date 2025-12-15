<template>
  <DialogPortal>
    <DialogOverlay />
    <DialogContent
      data-slot="scrollable-dialog-content"
      v-bind="{ ...$attrs, ...forwarded }"
      :class="
        cn(
          'bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 w-[calc(100vw-3rem)] translate-x-[-50%] translate-y-[-50%] rounded-lg border shadow-lg duration-200 sm:w-auto sm:min-w-191 flex flex-col p-0',
          containerClass
        )
      "
    >
      <!-- 固定的头部 -->
      <div class="shrink-0 px-4 pt-4 pb-3 sm:px-6 sm:pt-6 sm:pb-4 border-b">
        <slot name="header" />
      </div>

      <!-- 可滚动的内容区域 -->
      <div class="overflow-y-auto px-4 py-3 sm:px-6 sm:py-4">
        <slot />
      </div>

      <!-- 可选的固定底部 -->
      <div v-if="$slots.footer" class="shrink-0 px-4 pb-4 pt-3 sm:px-6 sm:pb-6 sm:pt-4 border-t">
        <slot name="footer" />
      </div>

      <!-- 关闭按钮 -->
      <DialogClose
        v-if="showCloseButton"
        data-slot="dialog-close"
        class="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 z-10"
      >
        <X />
        <span class="sr-only">Close</span>
      </DialogClose>
    </DialogContent>
  </DialogPortal>
</template>

<script setup lang="ts">
  import type { DialogContentEmits, DialogContentProps } from 'reka-ui'
  import type { HTMLAttributes } from 'vue'
  import { reactiveOmit } from '@vueuse/core'
  import { X } from 'lucide-vue-next'
  import { DialogClose, DialogContent, DialogPortal, useForwardPropsEmits } from 'reka-ui'
  import { cn } from '@/lib/utils'
  import DialogOverlay from './DialogOverlay.vue'

  defineOptions({
    inheritAttrs: false
  })

  const props = withDefaults(
    defineProps<
      DialogContentProps & {
        containerClass?: HTMLAttributes['class']
        showCloseButton?: boolean
      }
    >(),
    {
      showCloseButton: true
    }
  )
  const emits = defineEmits<DialogContentEmits>()

  const delegatedProps = reactiveOmit(props, 'containerClass')

  const forwarded = useForwardPropsEmits(delegatedProps, emits)
</script>
