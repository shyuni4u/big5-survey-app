import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export const SEPERATE_TOKEN = ' '

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
