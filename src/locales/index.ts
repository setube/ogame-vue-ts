// 默认语言（打包在主包中）
import zhCN from './zh-CN'

export type Locale = 'zh-CN' | 'zh-TW' | 'en' | 'de' | 'ru' | 'ko' | 'ja' | 'es-LA'

export type TranslationSchema = typeof zhCN

// 语言加载器 - 使用动态导入实现按需加载
// 注意: 各语言文件可能有细微差异，缺失的键会在运行时回退到 key 本身
type LocaleModule = { default: TranslationSchema }
const localeLoaders: Record<Locale, () => Promise<LocaleModule>> = {
  'zh-CN': () => Promise.resolve({ default: zhCN }),
  'zh-TW': () => import('./zh-TW') as unknown as Promise<LocaleModule>,
  en: () => import('./en') as unknown as Promise<LocaleModule>,
  de: () => import('./de') as unknown as Promise<LocaleModule>,
  ru: () => import('./ru') as unknown as Promise<LocaleModule>,
  ko: () => import('./ko') as unknown as Promise<LocaleModule>,
  ja: () => import('./ja') as unknown as Promise<LocaleModule>,
  'es-LA': () => import('./es-LA') as unknown as Promise<LocaleModule>
}

// 已加载的语言缓存
const loadedLocales: Partial<Record<Locale, TranslationSchema>> = {
  'zh-CN': zhCN // 默认语言预加载
}

/**
 * 异步加载指定语言
 * @param locale 语言代码
 * @returns 语言翻译对象
 */
export const loadLocale = async (locale: Locale): Promise<TranslationSchema> => {
  // 如果已经加载过，直接返回缓存
  if (loadedLocales[locale]) {
    return loadedLocales[locale]!
  }

  // 动态加载语言文件
  const loader = localeLoaders[locale]
  if (!loader) {
    console.warn(`Locale "${locale}" not found, falling back to zh-CN`)
    return zhCN
  }

  try {
    const module = await loader()
    loadedLocales[locale] = module.default
    return module.default
  } catch (error) {
    console.error(`Failed to load locale "${locale}":`, error)
    return zhCN
  }
}

/**
 * 同步获取已加载的语言（如果未加载则返回默认语言）
 * @param locale 语言代码
 * @returns 语言翻译对象
 */
export const getLocale = (locale: Locale): TranslationSchema => {
  return loadedLocales[locale] || zhCN
}

/**
 * 检查语言是否已加载
 * @param locale 语言代码
 */
export const isLocaleLoaded = (locale: Locale): boolean => {
  return locale in loadedLocales
}

export const localeNames: Record<Locale, string> = {
  'zh-CN': '简体中文',
  'zh-TW': '繁體中文',
  en: 'English',
  de: 'Deutsch',
  ru: 'Русский',
  ko: '한국어',
  ja: '日本語',
  'es-LA': 'Español (LA)'
}

/**
 * 根据浏览器语言检测并返回应用支持的语言
 * @returns 检测到的语言代码
 */
export const detectBrowserLocale = (): Locale => {
  // 获取浏览器语言
  const browserLang = navigator.language || (navigator.languages && navigator.languages[0]) || 'zh-CN'
  const lang = browserLang.toLowerCase()

  // 映射浏览器语言到应用支持的语言
  if (lang.startsWith('zh-tw') || lang.startsWith('zh-hant') || lang.startsWith('zh-hk') || lang.startsWith('zh-mo')) {
    return 'zh-TW'
  } else if (lang.startsWith('zh')) {
    return 'zh-CN'
  } else if (lang.startsWith('ja')) {
    return 'ja'
  } else if (lang.startsWith('ko')) {
    return 'ko'
  } else if (lang.startsWith('en')) {
    return 'en'
  } else if (lang.startsWith('de')) {
    return 'de'
  } else if (lang.startsWith('ru')) {
    return 'ru'
  } else if (lang.startsWith('es')) {
    return 'es-LA'
  }
  // 默认返回简体中文
  return 'zh-CN'
}
