import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { translations, Language, TranslationKeys } from '@/i18n/translations'
import { supabase } from '@/lib/supabase'

interface LanguageContextType {
    language: Language
    setLanguage: (lang: Language) => void
    t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguageState] = useState<Language>(() => {
        try {
            const saved = localStorage.getItem('urasi-language')
            // Validate that the saved value is a valid Language type
            if (saved === 'id' || saved === 'en') {
                return saved
            }
        } catch (error) {
            console.error('Error reading language preference:', error)
        }
        // Default to Indonesian if no valid saved preference
        return 'id'
    })

    const setLanguage = (lang: Language) => {
        try {
            setLanguageState(lang)
            localStorage.setItem('urasi-language', lang)

            // Sync to database settings in background
            syncLanguageToDatabase(lang)
        } catch (error) {
            console.error('Error saving language preference:', error)
        }
    }

    // Sync language to database
    const syncLanguageToDatabase = async (lang: Language) => {
        try {
            // Update the language setting in the options table
            const { data: existing } = await supabase
                .from('options')
                .select('*')
                .eq('key', 'language')
                .single()

            if (existing) {
                await supabase
                    .from('options')
                    .update({ value: lang })
                    .eq('key', 'language')
            } else {
                await supabase
                    .from('options')
                    .insert([{ key: 'language', value: lang }])
            }
        } catch (error) {
            // Silently fail - localStorage is the primary source
            console.error('Error syncing language to database:', error)
        }
    }

    // Ensure language is synced with localStorage on mount and changes
    useEffect(() => {
        document.documentElement.lang = language
        // Verify localStorage is in sync
        const saved = localStorage.getItem('urasi-language')
        if (saved !== language) {
            localStorage.setItem('urasi-language', language)
        }
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