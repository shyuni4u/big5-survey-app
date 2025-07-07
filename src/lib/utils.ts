import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import pako from 'pako'
import type { TestData } from '@/lib/types'

export const SEPERATE_TOKEN = ' '

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 바이너리(Uint8Array)를 URL-safe Base64 문자열로 변환
function uint8ArrayToUrlSafeBase64(uint8Array: Uint8Array): string {
  const base64 = btoa(String.fromCharCode.apply(null, Array.from(uint8Array)))
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

// URL-safe Base64 문자열을 바이너리(Uint8Array)로 변환
function urlSafeBase64ToUint8Array(base64: string): Uint8Array {
  base64 = base64.replace(/-/g, '+').replace(/_/g, '/')
  while (base64.length % 4) {
    base64 += '='
  }
  const binaryString = atob(base64)
  const len = binaryString.length
  const bytes = new Uint8Array(len)
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  return bytes
}

// 압축 및 인코딩 함수
export function zipData(data: TestData): string {
  try {
    const jsonString = JSON.stringify(data)
    const compressed = pako.deflate(jsonString)
    return uint8ArrayToUrlSafeBase64(compressed)
  } catch (error) {
    console.error('Failed to compress and encode data:', error)
    throw new Error('Failed to process data')
  }
}

// 디코딩 및 압축 해제 함수
export function unzipData(encodedData: string): TestData {
  try {
    const uint8Array = urlSafeBase64ToUint8Array(encodedData)
    const decompressed = pako.inflate(uint8Array, { to: 'string' })
    return JSON.parse(decompressed)
  } catch (error) {
    console.error('Failed to decode and decompress data:', error)
    throw new Error('Invalid data format')
  }
}
