import zhCN from './zh-CN'
import zhTW from './zh-TW'
import en from './en'
import de from './de'
import ru from './ru'
import ko from './ko'
import ja from './ja'
import es from './es'
import esLA from './es-LA'

export type Locale = 'zh-CN' | 'zh-TW' | 'en' | 'de' | 'ru' | 'ko' | 'ja' | 'es' | 'es-LA'

export const locales = {
  en,
  'zh-CN': zhCN,
  'zh-TW': zhTW,
  de,
  ru,
  ko,
  ja,
  es,
  'es-LA': esLA
}

export const localeNames: Record<Locale, string> = {
  'zh-CN': '简体中文',
  'zh-TW': '繁體中文',
  en: 'English',
  de: 'Deutsch',
  ru: 'Русский',
  ko: '한국어',
  ja: '日本語',
  es: 'Español',
  'es-LA': 'Español (Latino)'
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
    // Check for Latin American regions (Mexico, Argentina, Colombia, Chile, etc.)
    const latamRegions = [
      'ar', 'bo', 'cl', 'co', 'cr', 'do', 'ec', 'sv', 'gt',
      'hn', 'mx', 'ni', 'pa', 'py', 'pe', 'pr', 'uy', 've', '419'
    ]

    if (latamRegions.some(region => lang.includes(region))) {
      return 'es-LA'
    }
    return 'es'
  }

  // 默认返回简体中文
  return 'zh-CN'
}

export type TranslationSchema = typeof zhCN
