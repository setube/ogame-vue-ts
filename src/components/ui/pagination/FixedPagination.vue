<template>
  <div v-if="totalPages > 1" class="fixed bottom-4 left-1/2 -translate-x-1/2 z-40">
    <div class="flex items-center gap-2">
      <!-- 上一页按钮 - 圆形胶囊 -->
      <button
        v-if="currentPage > 1"
        @click="emit('update:page', currentPage - 1)"
        class="h-10 w-10 rounded-full bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 border shadow-lg flex items-center justify-center hover:bg-accent transition-colors"
      >
        <ChevronLeft class="h-5 w-5" />
      </button>

      <!-- 页码 - 椭圆形胶囊 -->
      <div
        class="bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 border rounded-full py-2 px-3 shadow-lg flex items-center gap-1"
      >
        <button
          v-for="pageNum in pageNumbers"
          :key="pageNum"
          @click="emit('update:page', pageNum)"
          class="h-8 min-w-8 px-2 rounded-full text-sm font-medium transition-colors"
          :class="pageNum === currentPage ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'"
        >
          {{ pageNum }}
        </button>
      </div>

      <!-- 下一页按钮 - 圆形胶囊 -->
      <button
        v-if="currentPage < totalPages"
        @click="emit('update:page', currentPage + 1)"
        class="h-10 w-10 rounded-full bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 border shadow-lg flex items-center justify-center hover:bg-accent transition-colors"
      >
        <ChevronRight class="h-5 w-5" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

  interface Props {
    page: number
    totalPages: number
    maxVisible?: number
  }

  const props = withDefaults(defineProps<Props>(), {
    maxVisible: 3
  })

  const emit = defineEmits<{
    'update:page': [page: number]
  }>()

  const currentPage = computed(() => props.page)

  // 生成页码列表 - 最多显示指定数量页码，不含省略号
  const pageNumbers = computed(() => {
    const pages: number[] = []
    const { totalPages, maxVisible } = props
    const current = currentPage.value

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      let start = current - Math.floor(maxVisible / 2)
      let end = current + Math.floor(maxVisible / 2)

      // 边界调整
      if (start < 1) {
        start = 1
        end = maxVisible
      }
      if (end > totalPages) {
        end = totalPages
        start = totalPages - maxVisible + 1
      }

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
    }

    return pages
  })
</script>
