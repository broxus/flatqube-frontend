import { paramsSerializer } from '@broxus/js-utils'

export interface UniversalLinkParams {
    apn: string
    ibi: string
    isi: string
    link?: string
}

export function useUniversalLink(basePath: string, params: UniversalLinkParams): any {
    return [
        basePath,
        paramsSerializer({
            apn: params.apn,
            ibi: params.ibi,
            isi: params.isi,
            link: params.link || encodeURIComponent(window.location.href),
        }),
    ].join('?')
}
