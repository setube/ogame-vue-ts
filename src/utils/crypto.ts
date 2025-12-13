import CryptoJS from 'crypto-js'
import pkg from '../../package.json'

// 数据加密
export const encryptData = (data: any): string => {
  try {
    const jsonStr = JSON.stringify(data)
    return CryptoJS.AES.encrypt(jsonStr, pkg.name).toString()
  } catch (error) {
    console.error(error)
  }
  return ''
}

// 数据解密
export const decryptData = (data: string): any => {
  try {
    const bytes = CryptoJS.AES.decrypt(data, pkg.name)
    const decryptedStr = bytes.toString(CryptoJS.enc.Utf8)
    return JSON.parse(decryptedStr)
  } catch (error) {
    console.error(error)
    return {}
  }
}
