import { type ClassValue, clsx } from 'clsx'
import { createSignal } from 'solid-js'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function createLocalSignal<T>(key: string, initialValue: T) {
  const stored = localStorage.getItem(key)
  const data = stored ? (JSON.parse(stored) as T) : initialValue
  const [value, setValue] = createSignal<T>(data)
  const setAndStoreValue = (v: T) => {
    localStorage.setItem(key, JSON.stringify(v))
    setValue(v as any)
  }
  return [value, setAndStoreValue] as const
}
