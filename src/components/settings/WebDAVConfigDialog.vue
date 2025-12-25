<template>
  <Dialog v-model:open="isOpen">
    <DialogContent class="max-w-md">
      <DialogHeader>
        <DialogTitle>{{ t('settings.webdav.configTitle') }}</DialogTitle>
        <DialogDescription>
          {{ t('settings.webdav.configDesc') }}
        </DialogDescription>
      </DialogHeader>

      <div class="space-y-4 py-4">
        <!-- 服务器地址 -->
        <div class="space-y-2">
          <Label for="serverUrl">{{ t('settings.webdav.serverUrl') }}</Label>
          <Input
            id="serverUrl"
            v-model="config.serverUrl"
            :placeholder="t('settings.webdav.serverUrlPlaceholder')"
          />
          <p class="text-xs text-muted-foreground">
            {{ t('settings.webdav.serverUrlHint') }}
          </p>
        </div>

        <!-- 用户名 -->
        <div class="space-y-2">
          <Label for="username">{{ t('settings.webdav.username') }}</Label>
          <Input
            id="username"
            v-model="config.username"
            :placeholder="t('settings.webdav.usernamePlaceholder')"
          />
        </div>

        <!-- 密码 -->
        <div class="space-y-2">
          <Label for="password">{{ t('settings.webdav.password') }}</Label>
          <Input
            id="password"
            v-model="config.password"
            type="password"
            :placeholder="t('settings.webdav.passwordPlaceholder')"
          />
          <p class="text-xs text-muted-foreground">
            {{ t('settings.webdav.passwordHint') }}
          </p>
        </div>

        <!-- 存档路径 -->
        <div class="space-y-2">
          <Label for="basePath">{{ t('settings.webdav.basePath') }}</Label>
          <Input
            id="basePath"
            v-model="config.basePath"
            :placeholder="t('settings.webdav.basePathPlaceholder')"
          />
        </div>

        <!-- 测试结果 -->
        <div v-if="testResult" :class="['p-3 rounded-md text-sm', testResult.success ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500']">
          {{ testResult.message }}
        </div>
      </div>

      <DialogFooter class="flex gap-2">
        <Button variant="outline" @click="handleTest" :disabled="isTesting || !isConfigValid">
          <Loader2 v-if="isTesting" class="mr-2 h-4 w-4 animate-spin" />
          {{ t('settings.webdav.testConnection') }}
        </Button>
        <Button variant="destructive" v-if="hasExistingConfig" @click="handleClear">
          {{ t('settings.webdav.clearConfig') }}
        </Button>
        <Button @click="handleSave" :disabled="!isConfigValid">
          {{ t('common.save') }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-vue-next'
import {
  type WebDAVConfig,
  getWebDAVConfig,
  saveWebDAVConfig,
  clearWebDAVConfig,
  testWebDAVConnection
} from '@/services/webdavService'

const { t } = useI18n()

const isOpen = defineModel<boolean>('open', { default: false })

const emit = defineEmits<{
  saved: [config: WebDAVConfig]
  cleared: []
}>()

const config = ref<WebDAVConfig>({
  serverUrl: '',
  username: '',
  password: '',
  basePath: '/ogame-saves/'
})

const isTesting = ref(false)
const testResult = ref<{ success: boolean; message: string } | null>(null)
const hasExistingConfig = ref(false)

const isConfigValid = computed(() => {
  return config.value.serverUrl.trim() !== '' &&
         config.value.username.trim() !== '' &&
         config.value.password.trim() !== ''
})

// 加载已保存的配置
watch(isOpen, (open) => {
  if (open) {
    const saved = getWebDAVConfig()
    if (saved) {
      config.value = { ...saved }
      hasExistingConfig.value = true
    } else {
      config.value = {
        serverUrl: '',
        username: '',
        password: '',
        basePath: '/ogame-saves/'
      }
      hasExistingConfig.value = false
    }
    testResult.value = null
  }
})

const handleTest = async () => {
  isTesting.value = true
  testResult.value = null

  try {
    testResult.value = await testWebDAVConnection(config.value)
  } finally {
    isTesting.value = false
  }
}

const handleSave = () => {
  saveWebDAVConfig(config.value)
  hasExistingConfig.value = true
  emit('saved', config.value)
  isOpen.value = false
}

const handleClear = () => {
  clearWebDAVConfig()
  hasExistingConfig.value = false
  config.value = {
    serverUrl: '',
    username: '',
    password: '',
    basePath: '/ogame-saves/'
  }
  testResult.value = null
  emit('cleared')
}
</script>
