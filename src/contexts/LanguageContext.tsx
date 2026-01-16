import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { translations, Language, TranslationKeys } from '@/i18n/translations'

interface LanguageContextType {
    language: Language
    setLanguage: (lang: Language) => void
    t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguageState] = useState<Language>(() => {
        const saved = localStorage.getItem('urasi-language')
        return (saved as Language) || 'id'
    })

    const setLanguage = (lang: Language) => {
        setLanguageState(lang)
        localStorage.setItem('urasi-language', lang)
    }

    useEffect(() => {
        document.documentElement.lang = language
    }, [language])

    const t = (key: string): string => {
        const keys = key.split('.')
        let value: any = translations[language]
        
        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k]
            } else {
                // Fallback to English if key not found
                let fallback: any = translations['en']
                for (const fk of keys) {
                    if (fallback && typeof fallback === 'object' && fk in fallback) {
                        fallback = fallback[fk]
                    } else {
                        return key // Return key if not found in fallback either
                    }
                }
                return typeof fallback === 'string' ? fallback : key
            }
        }
        
        return typeof value === 'string' ? value : key
    }

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    )
}

export function useLanguage() {
    const context = useContext(LanguageContext)
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider')
    }
    return context
}