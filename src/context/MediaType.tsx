import * as React from 'react'

export enum MediaType {
    s, m, l, xl,
}

const getMediaType = () => {
    if (window.matchMedia('(max-width: 639px)').matches) {
        return MediaType.s
    }

    if (window.matchMedia('(max-width: 959px)').matches) {
        return MediaType.m
    }

    if (window.matchMedia('(max-width: 1199px)').matches) {
        return MediaType.l
    }

    return MediaType.xl
}

export const MediaTypeContext = React.createContext<MediaType | undefined>(undefined)
MediaTypeContext.displayName = 'MediaType'

type Props = {
    children: React.ReactNode;
}

export function MediaTypeProvider({
    children,
}: Props): JSX.Element {
    const [mediaType, setMediaType] = React.useState(getMediaType())

    React.useEffect(() => {
        const calc = () => {
            setMediaType(getMediaType())
        }

        window.addEventListener('resize', calc)

        return () => {
            window.removeEventListener('resize', calc)
        }
    }, [])

    return (
        <MediaTypeContext.Provider value={mediaType}>
            {children}
        </MediaTypeContext.Provider>
    )
}
