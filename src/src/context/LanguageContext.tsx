'use client'
import { createContext, useCallback, useContext, useState } from 'react'
import en from '@/locales/en.json'
import vi from '@/locales/vi.json'

export type Language = 'vi' | 'en'

const LOCALES: Record<Language, Record<string, unknown>> = { vi, en }

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string, params?: Record<string, string>) => string
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'vi',
  setLanguage: () => {},
  t: (key) => key,
})

function getInitialLang(): Language {
  if (typeof window === 'undefined') return 'vi'
  const saved = localStorage.getItem('lang')
  if (saved === 'vi' || saved === 'en') return saved
  return navigator.language.startsWith('vi') ? 'vi' : 'en'
}

function resolvePath(obj: Record<string, unknown>, path: string): string {
  const parts = path.split('.')
  let cur: unknown = obj
  for (const p of parts) {
    if (typeof cur !== 'object' || cur === null) return path
    cur = (cur as Record<string, unknown>)[p]
  }
  return typeof cur === 'string' ? cur : path
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLangState] = useState<Language>(getInitialLang)

  const setLanguage = useCallback((lang: Language) => {
    localStorage.setItem('lang', lang)
    setLangState(lang)
  }, [])

  const t = useCallback(
    (key: string, params?: Record<string, string>) => {
      let str = resolvePath(LOCALES[language] as Record<string, unknown>, key)
      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          str = str.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), v)
        })
      }
      return str
    },
    [language]
  )

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>
}

export const useLanguage = () => useContext(LanguageContext)
