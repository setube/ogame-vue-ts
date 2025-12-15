<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogScrollContent class="max-w-2xl max-h-[80vh] flex flex-col">
      <DialogHeader class="shrink-0">
        <DialogTitle>{{ t('settings.newVersionAvailable', { version: versionInfo?.version || '' }) }}</DialogTitle>
        <DialogDescription>{{ t('settings.updateAvailable') }}</DialogDescription>
      </DialogHeader>

      <div class="flex-1 overflow-y-auto min-h-0 mt-4 pr-2">
        <div class="prose prose-sm dark:prose-invert max-w-none" v-html="renderedMarkdown"></div>
      </div>

      <DialogFooter class="flex gap-2 shrink-0 mt-4">
        <Button variant="outline" @click="$emit('update:open', false)">
          {{ t('common.cancel') }}
        </Button>
        <Button @click="handleDownload">
          <Download class="mr-2 h-4 w-4" />
          {{ t('settings.download') }}
        </Button>
      </DialogFooter>
    </DialogScrollContent>
  </Dialog>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { marked } from 'marked'
  import { useI18n } from '@/composables/useI18n'
  import { Dialog, DialogScrollContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
  import { Button } from '@/components/ui/button'
  import { Download } from 'lucide-vue-next'
  import type { VersionInfo } from '@/utils/versionCheck'

  const props = defineProps<{
    open: boolean
    versionInfo: VersionInfo | null
  }>()

  defineEmits<{
    'update:open': [value: boolean]
  }>()

  const { t } = useI18n()

  const renderedMarkdown = computed(() => {
    if (!props.versionInfo?.releaseNotes) return ''
    return marked(props.versionInfo.releaseNotes)
  })

  const handleDownload = () => {
    if (props.versionInfo?.downloadUrl) {
      window.open(props.versionInfo.downloadUrl, '_blank')
    }
  }
</script>

<style scoped>
  :deep(.prose) {
    color: hsl(var(--foreground));
  }

  :deep(.prose h1) {
    font-size: 1.5em;
    font-weight: 700;
    margin-top: 1em;
    margin-bottom: 0.5em;
  }

  :deep(.prose h2) {
    font-size: 1.25em;
    font-weight: 600;
    margin-top: 0.8em;
    margin-bottom: 0.4em;
  }

  :deep(.prose h3) {
    font-size: 1.1em;
    font-weight: 600;
    margin-top: 0.6em;
    margin-bottom: 0.3em;
  }

  :deep(.prose p) {
    margin-top: 0.5em;
    margin-bottom: 0.5em;
  }

  :deep(.prose ul) {
    margin-top: 0.5em;
    margin-bottom: 0.5em;
    padding-left: 1.5em;
  }

  :deep(.prose li) {
    margin-top: 0.25em;
    margin-bottom: 0.25em;
  }

  :deep(.prose code) {
    background: hsl(var(--muted));
    padding: 0.2em 0.4em;
    border-radius: 0.25rem;
    font-size: 0.875em;
  }

  :deep(.prose pre) {
    background: hsl(var(--muted));
    padding: 1em;
    border-radius: 0.5rem;
    overflow-x: auto;
    margin-top: 0.5em;
    margin-bottom: 0.5em;
  }

  :deep(.prose a) {
    color: hsl(var(--primary));
    text-decoration: underline;
  }
</style>
