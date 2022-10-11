import React from 'react'

import en from '@/lang/en'
import ja from '@/lang/ja'
import ko from '@/lang/ko'
import { storage } from '@/utils'

const messagesList = { en, ja, ko } as const

export type Locale = keyof typeof messagesList

type LocalizationKeys = { [T in keyof typeof en]: string }

type LocalizationContextProps = {
    locale: Locale;
    messages: LocalizationKeys;
    setLocale: React.Dispatch<React.SetStateAction<Locale>>;
}

export type Language = {
    code: Locale;
    dir?: 'ltr' | 'rtl';
    nativeLabel?: string;
}

export const LANGUAGES: Language[] = [
    { code: 'en', nativeLabel: 'English' },
    { code: 'ko', nativeLabel: '한국어' },
    { code: 'ja', nativeLabel: '日本語' },
]

export const LocalizationContext = React.createContext<LocalizationContextProps>({
    locale: 'en',
    messages: messagesList.en,
    setLocale() {},
})

export function useLocalizationContext(): LocalizationContextProps {
    return React.useContext(LocalizationContext)
}

type Props = {
    children: React.ReactNode | React.ReactNode[]
}

export function LocalizationProvider({ children }: Props): JSX.Element {
    const [locale, setLocale] = React.useState<Locale>(() => {
        const storedLocale = storage.get('lang') as Locale
        const supports = Object.keys(messagesList).includes(storedLocale)
        return supports ? storedLocale : 'en'
    })

    const messages = React.useMemo<LocalizationKeys>(
        () => messagesList[locale],
        [locale],
    )

    const context = React.useMemo(() => ({
        locale,
        messages,
        setLocale,
    }), [locale, messages])

    const onChangeStorageValue = (event: StorageEvent) => {
        if (event.key === 'lang' && event.newValue != null) {
            setLocale(event.newValue as Locale)
        }
    }

    React.useEffect(() => {
        try {
            document.documentElement.setAttribute('lang', locale)
        }
        catch (e) {}

        window.addEventListener('storage', onChangeStorageValue)

        return () => {
            window.removeEventListener('storage', onChangeStorageValue)
        }
    }, [locale])

    return (
        <LocalizationContext.Provider value={context}>
            {children}
        </LocalizationContext.Provider>
    )
}
