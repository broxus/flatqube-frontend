import * as React from 'react'
import type { Address } from 'everscale-inpage-provider'

import { QubeDaoTokenAddress, VoteEscrowAddress } from '@/config'
import { TokensCacheService, useTokensCache } from '@/stores/TokensCacheService'
import { useWallet, WalletService } from '@/stores/WalletService'
import veIcon from '@/modules/QubeDao/assets/veQUBE.svg'
import { QubeDaoStore } from '@/modules/QubeDao/stores/QubeDaoStore'
import { error } from '@/utils'


export type QubeDaoProviderProps = React.PropsWithChildren<{
    tokenAddress?: Address;
    tokenDecimals?: number;
    tokensCache?: TokensCacheService,
    tokenSymbol?: string;
    veAddress?: Address;
    veDecimals?: number;
    veSymbol?: string;
    wallet?: WalletService;
}>

// @ts-ignore
export const QubeDaoContext = React.createContext<QubeDaoStore>()

export function useQubeDaoContext(): QubeDaoStore {
    return React.useContext(QubeDaoContext)
}

export function QubeDaoProvider(props: QubeDaoProviderProps): JSX.Element {
    const { children, tokensCache, wallet, ...restProps } = props

    const { current: context } = React.useRef(new QubeDaoStore(
        wallet ?? useWallet(),
        tokensCache ?? useTokensCache(),
        {
            tokenAddress: QubeDaoTokenAddress,
            tokenDecimals: 9,
            tokenSymbol: 'QUBE',
            veAddress: VoteEscrowAddress,
            veDecimals: 9,
            veIcon,
            veSymbol: 'veQUBE',
            ...restProps,
        },
    ))

    React.useEffect(() => {
        context.init().catch(reason => error(reason))
        return () => {
            context.dispose().catch(reason => error(reason))
        }
    }, [])

    return (
        <QubeDaoContext.Provider value={context}>
            {children}
        </QubeDaoContext.Provider>
    )
}
