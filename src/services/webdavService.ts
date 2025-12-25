/**
 * WebDAV 同步服务
 * 支持将存档上传到 WebDAV 服务器（如坚果云、Nextcloud、NAS等）
 */

export interface WebDAVConfig {
  serverUrl: string // WebDAV 服务器地址，如 https://dav.jianguoyun.com/dav/
  username: string // 用户名
  password: string // 密码或应用专用密码
  basePath: string // 存档存放路径，如 /ogame-saves/
}

export interface WebDAVFile {
  name: string
  path: string
  size: number
  lastModified: Date
  isDirectory: boolean
}

const STORAGE_KEY = 'ogame-webdav-config'

// 获取保存的 WebDAV 配置
export const getWebDAVConfig = (): WebDAVConfig | null => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      return JSON.parse(saved)
    }
  } catch (e) {
    console.error('Failed to load WebDAV config:', e)
  }
  return null
}

// 保存 WebDAV 配置
export const saveWebDAVConfig = (config: WebDAVConfig): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
}

// 清除 WebDAV 配置
export const clearWebDAVConfig = (): void => {
  localStorage.removeItem(STORAGE_KEY)
}

// 构建 Authorization header
const buildAuthHeader = (config: WebDAVConfig): string => {
  const credentials = btoa(`${config.username}:${config.password}`)
  return `Basic ${credentials}`
}

// 规范化 URL 路径
const normalizePath = (serverUrl: string, basePath: string, fileName?: string): string => {
  let url = serverUrl.replace(/\/+$/, '')
  let path = basePath.replace(/^\/+/, '').replace(/\/+$/, '')

  if (path) {
    url = `${url}/${path}`
  }

  if (fileName) {
    url = `${url}/${fileName}`
  }

  return url
}

// 测试 WebDAV 连接
export const testWebDAVConnection = async (config: WebDAVConfig): Promise<{ success: boolean; message: string }> => {
  try {
    const url = normalizePath(config.serverUrl, config.basePath)

    const response = await fetch(url, {
      method: 'PROPFIND',
      headers: {
        Authorization: buildAuthHeader(config),
        Depth: '0',
        'Content-Type': 'application/xml'
      }
    })

    if (response.ok || response.status === 207) {
      return { success: true, message: 'WebDAV 连接成功' }
    }

    if (response.status === 401) {
      return { success: false, message: '认证失败，请检查用户名和密码' }
    }

    if (response.status === 404) {
      // 尝试创建目录
      const createResult = await createDirectory(config, config.basePath)
      if (createResult) {
        return { success: true, message: 'WebDAV 连接成功，已创建存档目录' }
      }
      return { success: false, message: '目录不存在且无法创建' }
    }

    return { success: false, message: `连接失败: HTTP ${response.status}` }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    // CORS 错误的处理
    if (message.includes('Failed to fetch') || message.includes('NetworkError')) {
      return {
        success: false,
        message: '网络错误，可能是 CORS 限制。建议使用支持 CORS 的 WebDAV 服务或通过代理访问。'
      }
    }
    return { success: false, message: `连接错误: ${message}` }
  }
}

// 创建目录
const createDirectory = async (config: WebDAVConfig, path: string): Promise<boolean> => {
  try {
    const url = normalizePath(config.serverUrl, path)

    const response = await fetch(url, {
      method: 'MKCOL',
      headers: {
        Authorization: buildAuthHeader(config)
      }
    })

    return response.ok || response.status === 201
  } catch (error) {
    console.error('Failed to create directory:', error)
    return false
  }
}

// 上传存档到 WebDAV
export const uploadToWebDAV = async (
  config: WebDAVConfig,
  data: string,
  fileName?: string
): Promise<{ success: boolean; message: string; fileName?: string }> => {
  try {
    // 生成带时间戳的文件名
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
    const actualFileName = fileName || `ogame-save-${timestamp}.json`
    const url = normalizePath(config.serverUrl, config.basePath, actualFileName)

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: buildAuthHeader(config),
        'Content-Type': 'application/json'
      },
      body: data
    })

    if (response.ok || response.status === 201 || response.status === 204) {
      return { success: true, message: '上传成功', fileName: actualFileName }
    }

    if (response.status === 401) {
      return { success: false, message: '认证失败' }
    }

    if (response.status === 403) {
      return { success: false, message: '没有写入权限' }
    }

    if (response.status === 507) {
      return { success: false, message: '存储空间不足' }
    }

    return { success: false, message: `上传失败: HTTP ${response.status}` }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return { success: false, message: `上传错误: ${message}` }
  }
}

// 解析 PROPFIND XML 响应
const parsePropfindResponse = (xml: string, _basePath: string): WebDAVFile[] => {
  const parser = new DOMParser()
  const doc = parser.parseFromString(xml, 'application/xml')
  const responses = doc.getElementsByTagNameNS('DAV:', 'response')
  const files: WebDAVFile[] = []

  for (let i = 0; i < responses.length; i++) {
    const response = responses[i]
    if (!response) continue
    const href = response.getElementsByTagNameNS('DAV:', 'href')[0]?.textContent || ''
    const displayName = response.getElementsByTagNameNS('DAV:', 'displayname')[0]?.textContent
    const contentLength = response.getElementsByTagNameNS('DAV:', 'getcontentlength')[0]?.textContent
    const lastModified = response.getElementsByTagNameNS('DAV:', 'getlastmodified')[0]?.textContent
    const resourceType = response.getElementsByTagNameNS('DAV:', 'resourcetype')[0]
    const isCollection = resourceType ? resourceType.getElementsByTagNameNS('DAV:', 'collection').length > 0 : false

    // 解码 URL 编码的路径
    const decodedHref = decodeURIComponent(href)
    const fileName = displayName || decodedHref.split('/').filter(Boolean).pop() || ''

    // 跳过目录本身和非 JSON 文件
    if (isCollection) continue
    if (!fileName.endsWith('.json')) continue

    files.push({
      name: fileName,
      path: decodedHref,
      size: parseInt(contentLength || '0', 10),
      lastModified: lastModified ? new Date(lastModified) : new Date(),
      isDirectory: false
    })
  }

  // 按修改时间降序排序（最新的在前）
  return files.sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime())
}

// 列出 WebDAV 目录中的存档文件
export const listWebDAVFiles = async (config: WebDAVConfig): Promise<{ success: boolean; files?: WebDAVFile[]; message?: string }> => {
  try {
    const url = normalizePath(config.serverUrl, config.basePath)

    const response = await fetch(url, {
      method: 'PROPFIND',
      headers: {
        Authorization: buildAuthHeader(config),
        Depth: '1',
        'Content-Type': 'application/xml'
      }
    })

    if (!response.ok && response.status !== 207) {
      if (response.status === 401) {
        return { success: false, message: '认证失败' }
      }
      if (response.status === 404) {
        return { success: false, message: '目录不存在' }
      }
      return { success: false, message: `获取文件列表失败: HTTP ${response.status}` }
    }

    const xml = await response.text()
    const files = parsePropfindResponse(xml, config.basePath)

    return { success: true, files }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return { success: false, message: `获取文件列表错误: ${message}` }
  }
}

// 从 WebDAV 下载存档
export const downloadFromWebDAV = async (
  config: WebDAVConfig,
  fileName: string
): Promise<{ success: boolean; data?: string; message?: string }> => {
  try {
    const url = normalizePath(config.serverUrl, config.basePath, fileName)

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: buildAuthHeader(config)
      }
    })

    if (!response.ok) {
      if (response.status === 401) {
        return { success: false, message: '认证失败' }
      }
      if (response.status === 404) {
        return { success: false, message: '文件不存在' }
      }
      return { success: false, message: `下载失败: HTTP ${response.status}` }
    }

    const data = await response.text()
    return { success: true, data }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return { success: false, message: `下载错误: ${message}` }
  }
}

// 删除 WebDAV 文件
export const deleteFromWebDAV = async (
  config: WebDAVConfig,
  fileName: string
): Promise<{ success: boolean; message?: string }> => {
  try {
    const url = normalizePath(config.serverUrl, config.basePath, fileName)

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        Authorization: buildAuthHeader(config)
      }
    })

    if (response.ok || response.status === 204) {
      return { success: true }
    }

    if (response.status === 401) {
      return { success: false, message: '认证失败' }
    }

    if (response.status === 404) {
      return { success: true } // 文件不存在也视为删除成功
    }

    return { success: false, message: `删除失败: HTTP ${response.status}` }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return { success: false, message: `删除错误: ${message}` }
  }
}
