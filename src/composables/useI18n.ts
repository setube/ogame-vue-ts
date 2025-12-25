import { ref, computed, watch } from 'vue'
import { useGameStore } from '@/stores/gameStore'
import { loadLocale, getLocale, isLocaleLoaded, type Locale, type TranslationSchema } from '@/locales'

// 全局加载状态
const isLoading = ref(false)
const currentMessages = ref<TranslationSchema | null>(null)

export const useI18n = () => {
  const gameStore = useGameStore()

  const currentLocale = computed(() => gameStore.locale)

  // 初始化或切换语言时加载
  const ensureLocaleLoaded = async (locale: Locale) => {
    if (isLocaleLoaded(locale)) {
      currentMessages.value = getLocale(locale)
      return
    }

    isLoading.value = true
    try {
      currentMessages.value = await loadLocale(locale)
    } finally {
      isLoading.value = false
    }
  }

  // 监听语言变化
  watch(
    currentLocale,
    async newLocale => {
      await ensureLocaleLoaded(newLocale)
    },
    { immediate: true }
  )

  // 获取当前消息（同步，使用缓存或默认语言）
  const messages = computed(() => currentMessages.value || getLocale(currentLocale.value))

  // 获取翻译文本的辅助函数
  const t = (key: string, params?: Record<string, string | number>): string => {
    const keys = key.split('.')
    let value: unknown = messages.value

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = (value as Record<string, unknown>)[k]
      } else {
        return key // 如果找不到翻译，返回原始 key
      }
    }

    let result = typeof value === 'string' ? value : key

    // 替换参数占位符
    if (params) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        result = result.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramValue))
      })
    }

    return result
  }

  const setLocale = async (locale: Locale) => {
    // 预加载语言文件
    await ensureLocaleLoaded(locale)
    // 然后切换
    gameStore.locale = locale
  }

  return {
    t,
    locale: currentLocale,
    setLocale,
    messages,
    isLoading: computed(() => isLoading.value)
  }
}
