<template>
  <Dialog v-model:open="isOpen">
    <DialogContent class="max-w-lg">
      <DialogHeader>
        <DialogTitle>{{ t('settings.webdav.selectFile') }}</DialogTitle>
        <DialogDescription>
          {{ t('settings.webdav.selectFileDesc') }}
        </DialogDescription>
      </DialogHeader>

      <div class="py-4">
        <!-- 加载状态 -->
        <div v-if="isLoading" class="flex items-center justify-center py-8">
          <Loader2 class="h-8 w-8 animate-spin text-muted-foreground" />
        </div>

        <!-- 错误状态 -->
        <div v-else-if="error" class="text-center py-8">
          <p class="text-red-500 mb-4">{{ error }}</p>
          <Button variant="outline" @click="loadFiles">
            {{ t('common.retry') }}
          </Button>
        </div>

        <!-- 空列表 -->
        <div v-else-if="files.length === 0" class="text-center py-8 text-muted-foreground">
          {{ t('settings.webdav.noFiles') }}
        </div>

        <!-- 文件列表 -->
        <ScrollArea v-else class="h-[300px]">
          <div class="space-y-2">
            <div
              v-for="file in files"
              :key="file.name"
              :class="[
                'flex items-center justify-between p-3 rounded-md cursor-pointer transition-colors',
                selectedFile === file.name ? 'bg-primary/10 border border-primary' : 'hover:bg-muted'
              ]"
              @click="selectedFile = file.name"
            >
              <div class="flex-1 min-w-0">
                <p class="font-medium truncate">{{ file.name }}</p>
                <p class="text-xs text-muted-foreground">
                  {{ formatFileSize(file.size) }} · {{ formatDate(file.lastModified) }}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                class="shrink-0 ml-2"
                @click.stop="handleDelete(file.name)"
              >
                <Trash2 class="h-4 w-4 text-red-500" />
              </Button>
            </div>
          </div>
        </ScrollArea>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="isOpen = false">
          {{ t('common.cancel') }}
        </Button>
        <Button @click="handleSelect" :disabled="!selectedFile">
          {{ t('settings.webdav.download') }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from '@/composables/useI18n'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Loader2, Trash2 } from 'lucide-vue-next'
import {
  type WebDAVConfig,
  type WebDAVFile,
  listWebDAVFiles,
  deleteFromWebDAV
} from '@/services/webdavService'
import { toast } from 'vue-sonner'

const { t } = useI18n()

const props = defineProps<{
  config: WebDAVConfig | null
}>()

const isOpen = defineModel<boolean>('open', { default: false })

const emit = defineEmits<{
  select: [fileName: string]
}>()

const files = ref<WebDAVFile[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)
const selectedFile = ref<string | null>(null)

const loadFiles = async () => {
  if (!props.config) return

  isLoading.value = true
  error.value = null
  selectedFile.value = null

  try {
    const result = await listWebDAVFiles(props.config)
    if (result.success && result.files) {
      files.value = result.files
    } else {
      error.value = result.message || t('settings.webdav.loadFailed')
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    isLoading.value = false
  }
}

watch(isOpen, (open) => {
  if (open && props.config) {
    loadFiles()
  }
})

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

const handleSelect = () => {
  if (selectedFile.value) {
    emit('select', selectedFile.value)
    isOpen.value = false
  }
}

const handleDelete = async (fileName: string) => {
  if (!props.config) return

  if (!confirm(t('settings.webdav.confirmDelete', { name: fileName }))) {
    return
  }

  const result = await deleteFromWebDAV(props.config, fileName)
  if (result.success) {
    toast.success(t('settings.webdav.deleteSuccess'))
    files.value = files.value.filter(f => f.name !== fileName)
    if (selectedFile.value === fileName) {
      selectedFile.value = null
    }
  } else {
    toast.error(result.message || t('settings.webdav.deleteFailed'))
  }
}
</script>
