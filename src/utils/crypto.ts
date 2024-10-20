import CryptoJS from 'crypto-js'

// Constants and Types
const ORIGINAL_KEY = import.meta.env.VITE_SECRET_KEY

interface EncryptionResult {
  iv: CryptoJS.lib.WordArray
  ciphertext: CryptoJS.lib.WordArray
}

// Utility functions
function wordArrayToUint8Array(wordArray: CryptoJS.lib.WordArray): Uint8Array {
  const words = wordArray.words
  const sigBytes = wordArray.sigBytes
  const u8 = new Uint8Array(sigBytes)
  for (let i = 0; i < sigBytes; i++) {
    u8[i] = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff
  }
  return u8
}

function uint8ArrayToWordArray(u8arr: Uint8Array): CryptoJS.lib.WordArray {
  const len = u8arr.length
  const words = []
  for (let i = 0; i < len; i += 4) {
    words.push((u8arr[i] << 24) | (u8arr[i + 1] << 16) | (u8arr[i + 2] << 8) | u8arr[i + 3])
  }
  return CryptoJS.lib.WordArray.create(words, len)
}

// Key Derivation
function deriveKey(originalKey: string): CryptoJS.lib.WordArray {
  return CryptoJS.SHA256(originalKey)
}

const SECRET_KEY = deriveKey(ORIGINAL_KEY)

// Environment Check
const isWebCryptoSupported = (): boolean =>
  typeof window !== 'undefined' && 'crypto' in window && 'subtle' in window.crypto

// Web Crypto API Handler
class WebCryptoHandler {
  private static async getKey(): Promise<CryptoKey> {
    const keyData = wordArrayToUint8Array(SECRET_KEY)
    return await window.crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'AES-CBC', length: 256 },
      false,
      ['encrypt', 'decrypt']
    )
  }

  static async encrypt(data: string): Promise<EncryptionResult> {
    const key = await this.getKey()
    const iv = window.crypto.getRandomValues(new Uint8Array(16))
    const encryptedBuffer = await window.crypto.subtle.encrypt(
      { name: 'AES-CBC', iv },
      key,
      new TextEncoder().encode(data)
    )

    return {
      iv: uint8ArrayToWordArray(iv),
      ciphertext: uint8ArrayToWordArray(new Uint8Array(encryptedBuffer)),
    }
  }

  static async decrypt(
    iv: CryptoJS.lib.WordArray,
    ciphertext: CryptoJS.lib.WordArray
  ): Promise<string> {
    const key = await this.getKey()
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      { name: 'AES-CBC', iv: wordArrayToUint8Array(iv) },
      key,
      wordArrayToUint8Array(ciphertext)
    )

    return new TextDecoder().decode(decryptedBuffer)
  }
}

// CryptoJS Handler
class CryptoJSHandler {
  static encrypt(data: string): EncryptionResult {
    const iv = CryptoJS.lib.WordArray.random(16)
    const encrypted = CryptoJS.AES.encrypt(data, SECRET_KEY, {
      iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    })
    return { iv, ciphertext: encrypted.ciphertext }
  }

  static decrypt(iv: CryptoJS.lib.WordArray, ciphertext: CryptoJS.lib.WordArray): string {
    const decrypted = CryptoJS.AES.decrypt(
      { ciphertext } as CryptoJS.lib.CipherParams,
      SECRET_KEY,
      { iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }
    )
    return decrypted.toString(CryptoJS.enc.Utf8)
  }
}

// Unified Crypto Handler
class CryptoHandler {
  static async encrypt(data: string): Promise<string> {
    const result = isWebCryptoSupported()
      ? await WebCryptoHandler.encrypt(data)
      : CryptoJSHandler.encrypt(data)
    return CryptoJS.enc.Base64.stringify(result.iv.concat(result.ciphertext))
  }

  static async decrypt(encryptedData: string): Promise<string> {
    const concatenated = CryptoJS.enc.Base64.parse(encryptedData)
    const iv = concatenated.clone()
    iv.sigBytes = 16
    iv.clamp()
    const ciphertext = concatenated.clone()
    ciphertext.words.splice(0, 4)
    ciphertext.sigBytes -= 16

    return isWebCryptoSupported()
      ? await WebCryptoHandler.decrypt(iv, ciphertext)
      : CryptoJSHandler.decrypt(iv, ciphertext)
  }
}

// Public API
export async function encryptData(data: string): Promise<string> {
  try {
    return await CryptoHandler.encrypt(data)
  } catch (error) {
    console.error('Encryption failed:', error)
    throw new Error('Encryption failed')
  }
}

export async function decryptData(encryptedData: string): Promise<string> {
  try {
    return await CryptoHandler.decrypt(encryptedData)
  } catch (error) {
    console.error('Decryption failed:', error)
    throw new Error('Decryption failed')
  }
}
